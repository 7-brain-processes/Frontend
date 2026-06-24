import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignmentsTab.css';
import { PostDto, CourseRole, SolutionDto, PostType, SolutionStatus, CourseCategoryDto } from '../../types/api';
import { categoryService, multiCriteriaGradingService, postsService, solutionsService, teamRequirementTemplateService } from '../../api/services';
import { FormControl, FormControlLabel, MenuItem, Select, Switch } from "@mui/material";
import { TeamRequirementTemplateDto } from '../../types/TeamRequirementTemplate';
import { CriteriaGradeResultDto, CriterionConfigDto, CriterionType, UpsertGradingConfigRequest } from '../../types/Criterion';
import { PeerReviewConfigRequest } from '../../types/Peer2peer';

const generateTemplateName = () => {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `Шаблон ${id}`;
};

interface AssignmentsTabProps {
  courseId: string;
  userRole: CourseRole;
}

const translateTeamFormationMode = {
  'FREE': 'самостоятельное',
  'DRAFT': 'драфт',
  'CAPTAIN_SELECTION': 'драфт',
  'RANDOM_SHUFFLE': 'рандомное'
}

const isGradingConfigUnsupportedError = (err: unknown): boolean => {
  const message = err instanceof Error ? err.message : String(err || '');
  return message.includes('404') || message.includes('Not found') || message.includes('not found') || message.includes('Не найдено');
};

const createInitialGradingConfig = (): UpsertGradingConfigRequest => ({
  maxGrade: 0,
  criteria: [],
  modifiers: {
    deadlines: {
      enabled: false,
      softDeadline: new Date(),
      hardDeadline: new Date(),
      softDeadlineBonus: 0,
      earlySubmissionBonusPerDay: 0,
      latePenaltyPerDay: 0,
      maxLatePenaltyDays: 0,
    },
    teamSize: {
      enabled: false,
      formula: '',
    },
    progressRegularity: {
      enabled: false,
      checkpointCount: 0,
      pointsPerCheckpoint: 0,
    },
    contributionVoting: {
      enabled: false,
      description: '',
    },
  },
  resultsVisible: true,
});

const createInitialPeerReviewConfig = (): PeerReviewConfigRequest => ({
  reviewersCount: 0,
  scoringStrategy: 'AVERAGE',
  firstDeadline: new Date(),
  secondDeadline: new Date(),
  redistributionFactor: 0,
  missedReviewPenalty: 0,
  reviewMode: 'ONE_TO_ONE',
  usageType: 'CRITERION',
});

const formatPeerReviewDateInput = (value: Date | string | undefined): string => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

const normalizeGradingConfig = (
  gradingConfig?: Partial<UpsertGradingConfigRequest> | null
): UpsertGradingConfigRequest => {
  const initialConfig = createInitialGradingConfig();
  const criteria = Array.isArray(gradingConfig?.criteria)
    ? (gradingConfig?.criteria ?? []).map((criterion) => ({
      ...criterion,
      peerReviewConfigRequest: criterion.type === 'PEER_REVIEW'
        ? {
          ...createInitialPeerReviewConfig(),
          ...(criterion.peerReviewConfig ?? {}),
          ...(criterion.peerReviewConfigRequest ?? {}),
        }
        : criterion.peerReviewConfigRequest,
    }))
    : initialConfig.criteria;

  return {
    maxGrade: gradingConfig?.maxGrade ?? initialConfig.maxGrade,
    criteria,
    modifiers: {
      deadlines: {
        ...initialConfig.modifiers.deadlines,
        ...(gradingConfig?.modifiers?.deadlines ?? {}),
      },
      teamSize: {
        ...initialConfig.modifiers.teamSize,
        ...(gradingConfig?.modifiers?.teamSize ?? {}),
      },
      progressRegularity: {
        ...initialConfig.modifiers.progressRegularity,
        ...(gradingConfig?.modifiers?.progressRegularity ?? {}),
      },
      contributionVoting: {
        ...initialConfig.modifiers.contributionVoting,
        ...(gradingConfig?.modifiers?.contributionVoting ?? {}),
      },
    },
    resultsVisible: gradingConfig?.resultsVisible ?? initialConfig.resultsVisible,
  };
};

const buildGradingConfigPayload = (gradingConfig: UpsertGradingConfigRequest): UpsertGradingConfigRequest => ({
  ...gradingConfig,
  modifiers: {
    ...gradingConfig.modifiers,
    contributionVoting: {
      enabled: false,
      description: '',
    },
  },
});

export default function AssignmentsTab({ courseId, userRole }: AssignmentsTabProps) {
  const navigate = useNavigate();
  const getDisplayedCriteriaScore = (score: number) => Math.max(0, score - 2);
  type TeamFormationModeValue = PostDto['teamFormationMode'] | '';
  const [assignments, setAssignments] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<PostDto | null>(null);
  const [solutions, setSolutions] = useState<SolutionDto[]>([]);
  const [mySolution, setMySolution] = useState<SolutionDto | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PostDto | null>(null);
  const [deadlineError, setDeadlineError] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    content: '',
    deadline: '',
    teamFormationMode: '' as TeamFormationModeValue
  });
  const [templateForm, setTemplateForm] = useState({
    name: generateTemplateName(),
    minTeamSize: 0,
    maxTeamSize: 0,
    requiredCategoryId: ''
  });
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [gradingConfigForm, setGradingConfigForm] = useState<UpsertGradingConfigRequest>(createInitialGradingConfig());
  const [editGradingConfigForm, setEditGradingConfigForm] = useState<UpsertGradingConfigRequest | null>(null);
  const [enabledParameters, setEnabledParameters] = useState<boolean>(true);
  const [enabledDeadlines, setEnabledDeadlines] = useState<boolean>(true);
  const [enabledTeamSize, setEnabledTeamSize] = useState<boolean>(true);
  const [enabledProgressRegularity, setEnabledProgressRegularity] = useState<boolean>(true);

  const [myGrade, setMyGrade] = useState<CriteriaGradeResultDto | null>(null);
  const [selectedAssignmentHasCriteria, setSelectedAssignmentHasCriteria] = useState(false);
  const gradingModifierCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '18px',
    border: '1px solid #e0e3e7',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
  };
  const gradingModifierCardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  };
  const gradingSectionTitleStyle: React.CSSProperties = {
    margin: '20px 0 10px',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.3,
    color: '#202124',
  };
  const gradingModifierTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.3,
    color: '#202124',
  };
  const gradingModifierFieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d2d7de',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: '#202124',
    background: '#fff',
    boxSizing: 'border-box',
  };
  const criteriaGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  };
  const criterionCardStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #e0e3e7',
    borderRadius: '14px',
    background: '#fcfdff',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '12px',
  };
  const criterionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };
  const criterionActionButtonStyle: React.CSSProperties = {
    border: 'none',
    background: '#eef3fd',
    color: '#174ea6',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  };

  const updateCriterion = (index: number, field: keyof CriterionConfigDto, value: string | number | CriterionType) => {
    setGradingConfigForm(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? {
          ...criterion,
          [field]: value,
          ...(field === 'type' && value === 'PEER_REVIEW' && !criterion.peerReviewConfigRequest
            ? { peerReviewConfigRequest: createInitialPeerReviewConfig() }
            : {}),
        } : criterion
      ),
    }));
  };

  const updatePeerReviewConfig = (index: number, field: keyof PeerReviewConfigRequest, value: PeerReviewConfigRequest[keyof PeerReviewConfigRequest] | string) => {
    setGradingConfigForm(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index
          ? ({
            ...criterion,
            peerReviewConfigRequest: {
              ...createInitialPeerReviewConfig(),
              ...(criterion.peerReviewConfigRequest || {}),
              [field]: (field === 'firstDeadline' || field === 'secondDeadline') && typeof value === 'string'
                ? new Date(value)
                : value
            }
          } as CriterionConfigDto)
          : criterion
      ),
    }));
  };


  const addCriterion = () => {
    setGradingConfigForm(prev => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          id: '',
          type: 'PERCENTAGE',
          title: '',
          maxPoints: 0,
          weight: 0,
          sortOrder: prev.criteria.length,
        },
      ],
    }));
  };

  const removeCriterion = (index: number) => {
    setGradingConfigForm(prev => {
      const nextCriteria = prev.criteria.filter((_, criterionIndex) => criterionIndex !== index);

      return {
        ...prev,
        criteria: nextCriteria.map((criterion, criterionIndex) => ({ ...criterion, sortOrder: criterionIndex })),
      };
    });
  };

  useEffect(() => {
    loadAssignments();
    loadCategoriesFunc();
  }, [courseId]);

  useEffect(() => {
    if (!selectedAssignment) {
      setSelectedAssignmentHasCriteria(false);
      return;
    }

    let cancelled = false;

    const loadSelectedAssignmentGradingConfig = async () => {
      try {
        const gradingConfig = await multiCriteriaGradingService.getGradingConfig(courseId, selectedAssignment.id);
        if (!cancelled) {
          setSelectedAssignmentHasCriteria(Array.isArray(gradingConfig?.criteria) && gradingConfig.criteria.length > 0);
        }
      } catch {
        if (!cancelled) {
          setSelectedAssignmentHasCriteria(false);
        }
      }
    };

    loadSelectedAssignmentGradingConfig();

    return () => {
      cancelled = true;
    };
  }, [courseId, selectedAssignment]);

  const toDateTimeLocal = (isoString: string | undefined | null): string => {
    if (!isoString) return '';

    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTimeLocal = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadCategoriesFunc = async () => {
    if (!courseId) return false;

    try {
      const categories = await categoryService.listCategories(courseId);
      setCategories(categories);
    } catch (err: any) {
      console.error('Failed to load course:', err);
      setCategories([]);
      alert(err.message || 'Ошибка загрузки категорий');
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await postsService.listPosts(courseId, { type: 'TASK' });
      setAssignments(response.content);
    } catch (err: any) {
      console.error('Failed to load assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMySolution = async (postId: string) => {
    try {
      const solution = await solutionsService.getMySolution(courseId, postId);
      setMySolution(solution);
      setSolutionText(solution.text || '');
      const grade = await multiCriteriaGradingService.getCriteriaGrades(courseId, postId, solution.id);
      setMyGrade(grade);
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('Не найдено')) {
        setMySolution(null);
        setSolutionText('');
      } else {
        console.error('Failed to load my solution:', err);
        setMySolution(null);
        setSolutionText('');
      }
    }
  };

  const loadSolutions = async (postId: string) => {
    if (userRole !== 'TEACHER') {
      return;
    }
    try {
      const response = await solutionsService.listSolutions(courseId, postId);
      setSolutions(response.content);
    } catch (err: any) {
      console.error('Failed to load solutions:', err);
      setSolutions([]);
    }
  };

  const handleSubmitSolution = async () => {
    if (!selectedAssignment) return;

    if (!solutionText.trim()) {
      alert('Введите текст решения');
      return;
    }



    try {
      const newSolution = await solutionsService.createSolution(courseId, selectedAssignment.id, {
        text: solutionText,
      });

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await solutionsService.uploadSolutionFile(courseId, selectedAssignment.id, newSolution.id, file);
          } catch (err) {
            console.error('Failed to upload file:', err);
          }
        }
      }

      await loadMySolution(selectedAssignment.id);

      setShowSubmitForm(false);
      setSolutionText('');
      setSelectedFiles([]);
    } catch (err: any) {
      console.error('Failed to submit solution:', err);
      alert(err.message || 'Ошибка отправки решения');
    }
  };

  const handleGradeSolution = async (solutionId: string, grade: number | null) => {
    if (!selectedAssignment || userRole !== 'TEACHER') return;
    console.log('[AssignmentsTab] handleGradeSolution called', {
      courseId,
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      solutionId,
      grade,
      userRole,
      selectedAssignmentHasCriteria,
      gradingConfigMaxGrade: gradingConfigForm.maxGrade,
      gradingConfigCriteriaCount: gradingConfigForm.criteria.length,
      gradingConfigCriteria: gradingConfigForm.criteria,
    });
    if (selectedAssignmentHasCriteria) {
      console.log('[AssignmentsTab] legacy grade blocked because criteria grading is enabled', {
        courseId,
        assignmentId: selectedAssignment.id,
        solutionId,
        grade,
      });
      alert('Для этого задания включено оценивание по критериям. Старая оценка решения недоступна.');
      return;
    }

    try {
      console.log('[AssignmentsTab] sending legacy grade request', {
        endpoint: `/courses/${courseId}/posts/${selectedAssignment.id}/solutions/${solutionId}/grade`,
        payload: { grade },
      });
      await solutionsService.gradeSolution(courseId, selectedAssignment.id, solutionId, {
        grade,
      });

      console.log('[AssignmentsTab] legacy grade request succeeded', {
        courseId,
        assignmentId: selectedAssignment.id,
        solutionId,
        grade,
      });

      await loadSolutions(selectedAssignment.id);
    } catch (err: any) {
      console.error('Failed to grade solution:', err);
      console.log('[AssignmentsTab] legacy grade request failed', {
        courseId,
        assignmentId: selectedAssignment.id,
        solutionId,
        grade,
        errorMessage: err?.message ?? null,
        error: err,
      });
      alert(err.message || 'Ошибка выставления оценки');
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({ title: '', content: '', deadline: '', teamFormationMode: '' });
    setGradingConfigForm(createInitialGradingConfig());
    setEnabledParameters(true);
    setEnabledTeamSize(false);
    setEnabledProgressRegularity(false);
    setEnabledDeadlines(false);
    setDeadlineError('');
    setShowCreateAssignment(true);
  };

  const handleEditAssignment = async (assignment: PostDto) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      content: assignment.content || '',
      deadline: toDateTimeLocal(assignment.deadline),
      teamFormationMode: assignment.teamFormationMode || ''
    });

    try {
      const gradingConfig = await multiCriteriaGradingService.getGradingConfig(courseId, assignment.id);
      const normalizedConfig = normalizeGradingConfig(gradingConfig);
      setGradingConfigForm(normalizedConfig);
      setEnabledParameters(true);
      setEnabledTeamSize(normalizedConfig.modifiers.teamSize.enabled);
      setEnabledProgressRegularity(normalizedConfig.modifiers.progressRegularity.enabled);
      setEnabledDeadlines(normalizedConfig.modifiers.deadlines.enabled);
    } catch (err) {
      if (isGradingConfigUnsupportedError(err)) {
        setGradingConfigForm(createInitialGradingConfig());
        setEnabledParameters(false);
      } else {
        console.error('Failed to load grading config:', err);
        setGradingConfigForm(createInitialGradingConfig());
        setEnabledParameters(true);
      }
    }

    setDeadlineError('');
    setShowCreateAssignment(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это задание?')) {
      try {
        await postsService.deletePost(courseId, assignmentId);
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        if (selectedAssignment?.id === assignmentId) {
          closeAssignment();
        }
      } catch (err: any) {
        console.error('Failed to delete assignment:', err);
        alert(err.message || 'Ошибка удаления задания');
      }
    }
  };

  const createTeamRequirementTemplate = async () => {
    try {
      const template = await teamRequirementTemplateService.createTemplate(courseId, templateForm);
      return template.id;
    } catch (err: any) {
      console.error('Failed to save assignment:', err);
      alert(err.message || 'Ошибка сохранения требований к командам');
    }
  };

  const applayTeamRequirementTemplate = async (templateId: string, newPostId: string) => {
    try {
      await teamRequirementTemplateService.applayTemplate(courseId, templateId, { postId: newPostId })
    } catch (err: any) {
      console.error('Failed to save assignment:', err);
      alert(err.message || 'Ошибка применения требований к командам');
    }
  };

  const saveGradingConfigIfSupported = async (postId: string) => {
    try {
      await multiCriteriaGradingService.upsertGradingConfig(courseId, postId, {
        ...buildGradingConfigPayload(gradingConfigForm),
      });
    } catch (err) {
      if (isGradingConfigUnsupportedError(err)) {
        console.warn('Grading config endpoint is not available on this backend, skipping save.', err);
        return;
      }

      throw err;
    }
  };

  const saveGradingConfigWithoutBreakingAssignment = async (postId: string) => {
    try {
      if (gradingConfigForm.criteria.length > 0) {
        await saveGradingConfigIfSupported(postId);
      } else {
        await deleteGradingConfigIfSupported(postId);
      }
    } catch (err) {
      console.error('Failed to save grading config:', err);
      alert('Задание сохранено, но параметры и критерии сохранить не удалось');
    }
  };

  const deleteGradingConfigIfSupported = async (postId: string) => {
    try {
      await multiCriteriaGradingService.deleteGradingConfig(courseId, postId);
    } catch (err) {
      if (isGradingConfigUnsupportedError(err)) {
        console.warn('Grading config endpoint is not available on this backend, skipping delete.', err);
        return;
      }

      throw err;
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.title.trim()) {
      alert('Введите название задания');
      return;
    }
    if (assignmentForm.deadline && new Date(assignmentForm.deadline).getTime() < Date.now()) {
      setDeadlineError('Срок сдачи задания не может быть в прошлом');
      return;
    }

    setDeadlineError('');

    try {
      if (editingAssignment) {
        const updatedPost = await postsService.updatePost(courseId, editingAssignment.id, {
          title: assignmentForm.title,
          content: assignmentForm.content || undefined,
          deadline: assignmentForm.deadline ? new Date(assignmentForm.deadline).toISOString() : undefined,
          teamFormationMode: assignmentForm.teamFormationMode || undefined,
        });
        if (updatedPost) {
          if (enabledParameters) {
            await saveGradingConfigWithoutBreakingAssignment(updatedPost.id);
          }
          else {
            await deleteGradingConfigIfSupported(updatedPost.id);
          }
        }
        setAssignments(assignments.map(a => (a.id === editingAssignment.id ? updatedPost : a)));
      } else {
        const selectedMode = assignmentForm.teamFormationMode || undefined;
        const requiresTemplate = selectedMode === 'DRAFT' || selectedMode === 'CAPTAIN_SELECTION';

        const newPost = await postsService.createPost(courseId, {
          title: assignmentForm.title,
          content: assignmentForm.content || undefined,
          type: 'TASK',
          deadline: assignmentForm.deadline ? new Date(assignmentForm.deadline).toISOString() : undefined,
          teamFormationMode: selectedMode,
        });

        if (requiresTemplate) {
          const templateId = await createTeamRequirementTemplate();
          if (!templateId) {
            return false;
          }
          await applayTeamRequirementTemplate(templateId, newPost.id);
        }

        if (newPost) {
          await saveGradingConfigWithoutBreakingAssignment(newPost.id);
        }

        setAssignments([...assignments, newPost]);
      }

      setShowCreateAssignment(false);
    } catch (err: any) {
      console.error('Failed to save assignment:', err);
      alert(err.message || 'Ошибка сохранения задания');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const isPast = date < now;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    };

    return {
      text: date.toLocaleDateString('ru-RU', options),
      isPast
    };
  };

  const isLateSolution = (submittedAt: string, deadline: string | null) => {
    if (!deadline) {
      return false;
    }

    return new Date(submittedAt).getTime() > new Date(deadline).getTime();
  };

  const openAssignment = (assignment: PostDto) => {
    navigate(`/course/${courseId}/task/${assignment.id}`);
  };

  const closeAssignment = () => {
    setSelectedAssignment(null);
    setSelectedAssignmentHasCriteria(false);
    setMySolution(null);
    setSolutions([]);
    setShowSubmitForm(false);
    setSolutionText('');
    setSelectedFiles([]);
  };

  if (selectedAssignment) {
    return (
      <div className="assignment-detail">
        <button className="back-button" onClick={closeAssignment}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Назад к заданиям
        </button>

        <div className="assignment-content">
          <div className="assignment-header">
            <div className="assignment-header-left">
              <h2>{selectedAssignment.title}</h2>
              {selectedAssignment.deadline && (
                <div className={`deadline ${formatDeadline(selectedAssignment.deadline).isPast ? 'past' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  Срок: {formatDeadline(selectedAssignment.deadline).text}
                </div>
              )}
            </div>
            {userRole === 'TEACHER' && (
              <div className="assignment-actions">
                <button
                  className="icon-button"
                  onClick={() => handleEditAssignment(selectedAssignment)}
                  title="Редактировать"
                  data-testid="edit-assignment-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
                <button
                  className="icon-button"
                  onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                  title="Удалить"
                  data-testid="delete-assignment-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="assignment-description">
            {selectedAssignment.content}
          </div>

          {selectedAssignment.materialsCount > 0 && (
            <div className="assignment-materials">
              <h3>Материалы</h3>
              {/* TODO: Load and display materials */}
              <p className="placeholder">Материалы загружаются...</p>
            </div>
          )}
        </div>

        {userRole === 'STUDENT' ? (
          <div className="student-section">
            {mySolution ? (
              <div className="my-solution">
                <div className="solution-header">
                  <h3>Ваше решение</h3>
                  <span className={`status-badge ${mySolution.status.toLowerCase()}`}>
                    {mySolution.status === 'SUBMITTED' ? 'Сдано' : 'Оценено'}
                  </span>
                </div>

                <div className="solution-text">{mySolution.text}</div>

                {mySolution.filesCount > 0 && (
                  <div className="solution-files">
                    <h4>Прикрепленные файлы</h4>
                    {/* TODO: Load and display files */}
                    <p className="placeholder">Файлы загружаются...</p>
                  </div>
                )}

                {mySolution.status === 'GRADED' && mySolution.grade !== undefined && (
                  <div className="solution-grade">
                    <strong>Оценка:</strong> {myGrade ? getDisplayedCriteriaScore(myGrade.finalScore) : null} / {myGrade?.maxGrade}
                    {mySolution.gradedAt && (
                      <span className="grade-date">
                        {new Date(mySolution.gradedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                )}

                {mySolution.grade === null && mySolution.status !== 'GRADED' && (
                  <button
                    className="edit-solution-button"
                    onClick={() => {
                      setSolutionText(mySolution.text);
                      setShowSubmitForm(true);
                    }}
                  >
                    Изменить решение
                  </button>
                )}
              </div>
            ) : showSubmitForm ? (
              <div className="submit-form">
                <h3>Сдать решение</h3>

                <textarea
                  className="solution-textarea"
                  placeholder="Введите ваше решение..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows={8}
                />

                <div className="file-upload">
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input" className="file-upload-button">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
                    </svg>
                    Прикрепить файлы
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name}</span>
                          <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="cancel-button" onClick={() => {
                    setShowSubmitForm(false);
                    setSolutionText('');
                    setSelectedFiles([]);
                  }}>
                    Отмена
                  </button>
                  <button
                    className="submit-button"
                    onClick={handleSubmitSolution}
                    disabled={!solutionText.trim()}
                  >
                    Сдать решение
                  </button>
                </div>
              </div>
            ) : (
              <button className="start-submit-button" onClick={() => setShowSubmitForm(true)}>
                Сдать решение
              </button>
            )}
          </div>
        ) : (
          <div className="teacher-section">
            <h3>Решения студентов ({solutions.length})</h3>

            {solutions.length === 0 ? (
              <div className="no-solutions">
                <p>Пока нет сданных решений</p>
              </div>
            ) : (
              <div className="solutions-list">
                {solutions.map(solution => {
                  const lateSubmission = isLateSolution(solution.submittedAt, selectedAssignment.deadline);

                  return (
                    <div key={solution.id} className={`solution-card ${lateSubmission ? 'late' : ''}`}>
                      <div className="solution-student">
                        <div className="student-avatar">
                          {solution.student.displayName.charAt(0)}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{solution.student.displayName}</div>
                          <div className="solution-date">
                            Сдано: {new Date(solution.submittedAt).toLocaleDateString('ru-RU')}
                            {lateSubmission && <span className="late-submission-text"> • После срока</span>}
                          </div>
                        </div>
                        <span className={`status-badge ${solution.status.toLowerCase()}`}>
                          {solution.status === 'SUBMITTED' ? 'Сдано' : 'Оценено'}
                        </span>
                        {lateSubmission && (
                          <span className="late-submission-badge">Сдано с опозданием</span>
                        )}
                      </div>

                      <div className="solution-content">
                        <p>{solution.text}</p>
                        {solution.filesCount > 0 && (
                          <div className="files-info">
                            📎 {solution.filesCount} файл(ов)
                          </div>
                        )}
                      </div>

                      {selectedAssignmentHasCriteria ? (
                        <div className="graded-info">
                          <strong>Для этого задания используется оценивание по критериям</strong>
                        </div>
                      ) : solution.status === 'GRADED' && solution.grade !== undefined ? (
                        <div className="graded-info">
                          <strong>Оценка: {solution.grade} / 100</strong>
                          {solution.gradedAt && (
                            <span className="grade-date">
                              {new Date(solution.gradedAt).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                          <button
                            type="button"
                            className="remove-grade-button"
                            onClick={() => handleGradeSolution(solution.id, null)}
                          >
                            Снять оценку
                          </button>
                        </div>
                      ) : (
                        <div className="grade-form">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Оценка (0-100)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const grade = parseInt((e.target as HTMLInputElement).value);
                                if (grade >= 0 && grade <= 100) {
                                  handleGradeSolution(solution.id, grade);
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              const grade = parseInt(input.value);
                              if (grade >= 0 && grade <= 100) {
                                handleGradeSolution(solution.id, grade);
                              }
                            }}
                          >
                            Выставить оценку
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="assignments-tab">
      <div className="assignments-header">
        <h2>Задания</h2>
        {userRole === 'TEACHER' && (
          <button
            className="create-assignment-button"
            onClick={handleCreateAssignment}
            data-testid="create-assignment-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Создать задание</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Загрузка заданий...</div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="#5f6368" width="80" height="80">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Заданий пока нет</h3>
          <p className="empty-state-description">
            Здесь будут появляться задания по курсу
          </p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => {
            const deadlineInfo = assignment.deadline ? formatDeadline(assignment.deadline) : null;
            const hasSubmitted = assignment.mySolutionId !== null;

            return (
              <div
                key={assignment.id}
                className="assignment-card"
                onClick={() => openAssignment(assignment)}
              >
                <div className="assignment-card-header">
                  <h3>{assignment.title}</h3>
                  {hasSubmitted && (
                    <span className="submitted-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Сдано
                    </span>
                  )}
                </div>

                <p className="assignment-preview">{assignment.content}</p>

                {assignment.teamFormationMode && (
                  <p className="assignment-preview">Распределение по командам: {translateTeamFormationMode[assignment.teamFormationMode]}</p>
                )}

                <div className="assignment-card-footer">
                  {deadlineInfo && (
                    <div className={`deadline ${deadlineInfo.isPast ? 'past' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      {deadlineInfo.text}
                    </div>
                  )}

                  <div className="assignment-stats">
                    {assignment.materialsCount > 0 && (
                      <span>📎 {assignment.materialsCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateAssignment && (
        <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssignment ? 'Редактировать задание' : 'Создать задание'}</h2>
              <button className="close-button" onClick={() => setShowCreateAssignment(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="assignment-title">Название задания *</label>
                <input
                  id="assignment-title"
                  type="text"
                  value={assignmentForm.title}
                  onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="Введите название задания"
                  data-testid="assignment-title-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignment-content">Описание задания</label>
                <textarea
                  id="assignment-content"
                  value={assignmentForm.content}
                  onChange={e => setAssignmentForm({ ...assignmentForm, content: e.target.value })}
                  placeholder="Введите описание задания"
                  rows={8}
                  data-testid="assignment-content-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignment-deadline">Срок сдачи</label>
                <input
                  id="assignment-deadline"
                  type="datetime-local"
                  value={assignmentForm.deadline}
                  onChange={e => {
                    setAssignmentForm({ ...assignmentForm, deadline: e.target.value });
                    setDeadlineError('');
                  }}
                  min={getMinDateTimeLocal()}
                  data-testid="assignment-deadline-input"
                />
                {deadlineError && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '8px' }} data-testid="assignment-deadline-error">
                    {deadlineError}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="assignment-deadline">Режим формирования команд</label>
                <FormControl fullWidth>
                  <Select
                    id="demo-simple-select"
                    value={assignmentForm.teamFormationMode}
                    onChange={e => setAssignmentForm({ ...assignmentForm, teamFormationMode: e.target.value })}
                  >
                    <MenuItem value={'FREE'}>Самостоятельное распределение</MenuItem>
                    <MenuItem value={'CAPTAIN_SELECTION'}>Драфт распределение</MenuItem>
                    <MenuItem value={'RANDOM_SHUFFLE'}>Рандомное распределение</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="form-group">
                <label htmlFor="assignment-content">Минимальный размер команды</label>
                <input
                  id="assignment-content"
                  type="number"
                  value={templateForm.minTeamSize}
                  onChange={e => setTemplateForm({ ...templateForm, minTeamSize: Number(e.target.value) })}
                  placeholder="Введите минимальный размер команды"
                  data-testid="assignment-content-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignment-content">Максимальный размер команды</label>
                <input
                  id="assignment-content"
                  value={templateForm.maxTeamSize}
                  type="number"
                  onChange={e => setTemplateForm({ ...templateForm, maxTeamSize: Number(e.target.value) })}
                  placeholder="Введите максимальный размер команды"
                  data-testid="assignment-content-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignment-deadline">Допустимые категории студентов</label>
                <FormControl fullWidth>
                  <Select
                    id="demo-simple-select"
                    value={templateForm.requiredCategoryId}
                    onChange={e => setTemplateForm({ ...templateForm, requiredCategoryId: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div>
                <h2>Параметры выставления оценок</h2>
                {editingAssignment &&
                  <div style={{ paddingLeft: '20px' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabledParameters}
                          onChange={(_, checked) => setEnabledParameters(checked)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </div>
                }
              </div>
              <div className="form-group">
                <label htmlFor="assignment-content">Максимальная оценка</label>
                <input
                  id="assignment-content"
                  value={gradingConfigForm.maxGrade}
                  type="number"
                  onChange={e => setGradingConfigForm({ ...gradingConfigForm, maxGrade: Number(e.target.value) })}
                  placeholder="Введите максимальную оценку"
                  data-testid="assignment-content-input"
                />
              </div>
              <div>
                <h2>Критерии оценивания</h2>
                
                {gradingConfigForm.criteria.length === 0 && (
                  <p className="grading-section-description">
                    Критерии пока не добавлены.
                  </p>
                )}
                {gradingConfigForm.criteria.map((criterion, index) => (
                  <div key={`criterion-${index}`} style={criterionCardStyle}>
                    <div style={criterionHeaderStyle}>
                      <span className="grading-field-label">{`Критерий ${index + 1}`}</span>
                      <button type="button" style={criterionActionButtonStyle} onClick={() => removeCriterion(index)}>
                        Удалить
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor={`criterion-title-${index}`}>Название критерия</label>
                      <input
                        id={`criterion-title-${index}`}
                        value={criterion.title}
                        onChange={e => updateCriterion(index, 'title', e.target.value)}
                        placeholder="Например, качество решения"
                      />
                    </div>
                    <div style={criteriaGridStyle}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`criterion-type-${index}`}>Тип</label>
                        <select
                          id={`criterion-type-${index}`}
                          value={criterion.type}
                          onChange={e => updateCriterion(index, 'type', e.target.value as CriterionType)}
                          style={gradingModifierFieldStyle}
                        >
                          <option value="PERCENTAGE">Проценты</option>
                          <option value="POINTS">Баллы</option>
                          <option value="YES_NO">Да / нет</option>
                          <option value="PEER_REVIEW">Проверка студентом (peer-to-peer)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`criterion-max-points-${index}`}>Максимум баллов</label>
                        <input
                          id={`criterion-max-points-${index}`}
                          type="number"
                          value={criterion.maxPoints}
                          onChange={e => updateCriterion(index, 'maxPoints', Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`criterion-weight-${index}`}>Вес</label>
                        <input
                          id={`criterion-weight-${index}`}
                          type="number"
                          value={criterion.weight}
                          onChange={e => updateCriterion(index, 'weight', Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`criterion-sort-order-${index}`}>Порядок</label>
                        <input
                          id={`criterion-sort-order-${index}`}
                          type="number"
                          value={criterion.sortOrder}
                          onChange={e => updateCriterion(index, 'sortOrder', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    {
                      criterion.type === 'PEER_REVIEW' &&
                      <div style={criteriaGridStyle}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-scoring-strategy-${index}`}>Стратегия подсчета очков</label>
                          <select
                            id={`criterion-scoring-strategy-${index}`}
                            value={criterion.peerReviewConfigRequest?.scoringStrategy}
                            onChange={e => updatePeerReviewConfig(index, 'scoringStrategy', e.target.value as PeerReviewConfigRequest['scoringStrategy'])}
                            style={gradingModifierFieldStyle}
                          >
                            <option value="AVERAGE">Среднее</option>
                            <option value="MIN">Минимальное</option>
                            <option value="MAX">Максимальное</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-first-deadline-${index}`}>Первый дедлайн</label>
                          <input
                            id={`criterion-first-deadline-${index}`}
                            type="date"
                            value={formatPeerReviewDateInput(criterion.peerReviewConfigRequest?.firstDeadline)}
                            onChange={e => updatePeerReviewConfig(index, 'firstDeadline', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-second-deadline-${index}`}>Второй дедлайн</label>
                          <input
                            id={`criterion-second-deadline-${index}`}
                            type="date"
                            value={formatPeerReviewDateInput(criterion.peerReviewConfigRequest?.secondDeadline)}
                            onChange={e => updatePeerReviewConfig(index, 'secondDeadline', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-redistribution-${index}`}>Фактор перераспределения</label>
                          <input
                            id={`criterion-redistribution-${index}`}
                            type="number"
                            value={criterion.peerReviewConfigRequest?.redistributionFactor}
                            onChange={e => updatePeerReviewConfig(index, 'redistributionFactor', Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-penalty-${index}`}>Штраф за пропущенный просмотр</label>
                          <input
                            id={`criterion-penalty-${index}`}
                            type="number"
                            value={criterion.peerReviewConfigRequest?.missedReviewPenalty}
                            onChange={e => updatePeerReviewConfig(index, 'missedReviewPenalty', Number(e.target.value))}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-review-mode-${index}`}>Режим проверки</label>
                          <select
                            id={`criterion-review-mode-${index}`}
                            value={criterion.peerReviewConfigRequest?.reviewMode}
                            onChange={e => updatePeerReviewConfig(index, 'reviewMode', e.target.value as PeerReviewConfigRequest['reviewMode'])}
                            style={gradingModifierFieldStyle}
                          >
                            <option value="ONE_TO_ONE">Один к одному</option>
                            <option value="MANY_TO_ONE">Многие к одному</option>
                          </select>
                        </div>
                        {criterion.peerReviewConfigRequest?.reviewMode === 'MANY_TO_ONE' &&
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor={`criterion-reviewers-count-${index}`}>Количество проверяющих</label>
                            <input
                              id={`criterion-reviewers-count-${index}`}
                              type="number"
                              value={criterion.peerReviewConfigRequest?.reviewersCount}
                              onChange={e => updatePeerReviewConfig(index, 'reviewersCount', Number(e.target.value))}
                            />
                          </div>
                        }
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`criterion-usage-type-${index}`}>Тип использования</label>
                          <select
                            id={`criterion-usage-type-${index}`}
                            value={criterion.peerReviewConfigRequest?.usageType}
                            onChange={e => updatePeerReviewConfig(index, 'usageType', e.target.value as PeerReviewConfigRequest['usageType'])}
                            style={gradingModifierFieldStyle}
                          >
                            <option value="CRITERION">Критерий</option>
                            <option value="SEPARATE_GRADE">Отдельная оценка</option>
                          </select>
                        </div>
                      </div>
                    }
                  </div>
                ))}
                <button type="button" className="button-secondary" onClick={addCriterion}>
                  Добавить критерий
                </button>
              </div>
              <div>
                <h2>Модификаторы</h2>
                
                <div className="grading-modifier-card" style={gradingModifierCardStyle}>
                  <div className="grading-modifier-card-header" style={gradingModifierCardHeaderStyle}>
                    <h2>Прогресс регулярности</h2>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabledProgressRegularity}
                          onChange={(_, checked) => setEnabledProgressRegularity(checked)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </div>
                  <span className="grading-field-label">Количество контрольных точек</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.progressRegularity.checkpointCount}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        progressRegularity: {
                          ...gradingConfigForm.modifiers.progressRegularity,
                          checkpointCount: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите количество контрольных точек"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Баллы за одну точку</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.progressRegularity.pointsPerCheckpoint}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        progressRegularity: {
                          ...gradingConfigForm.modifiers.progressRegularity,
                          pointsPerCheckpoint: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите количество очков за контрольную точку"
                    data-testid="assignment-content-input"
                  />
                </div>
                <div className="grading-modifier-card" style={gradingModifierCardStyle}>
                  <div className="grading-modifier-card-header" style={gradingModifierCardHeaderStyle}>
                    <h2>Дедлайны</h2>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabledDeadlines}
                          onChange={(_, checked) => setEnabledDeadlines(checked)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </div>
                  <span className="grading-field-label">Мягкий дедлайн</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={new Date(gradingConfigForm.modifiers.deadlines.softDeadline).toISOString().split('T')[0]}
                    type='date'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          softDeadline: new Date(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите мягкий дедлайн"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Жёсткий дедлайн</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={new Date(gradingConfigForm.modifiers.deadlines.hardDeadline).toISOString().split('T')[0]}
                    type='date'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          hardDeadline: new Date(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите жесткий дедлайн"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Бонус за мягкий дедлайн</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.deadlines.softDeadlineBonus}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          softDeadlineBonus: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите бонус за мягкий дедлайн"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Бонус за досрочный день</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.deadlines.earlySubmissionBonusPerDay}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          earlySubmissionBonusPerDay: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите бонус за досрочную сдачу задания"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Штраф за день просрочки</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.deadlines.latePenaltyPerDay}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          latePenaltyPerDay: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите штраф за просрочку дедлайна"
                    data-testid="assignment-content-input"
                  />
                  <span className="grading-field-label">Максимум дней штрафа</span>
                  <input
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.deadlines.maxLatePenaltyDays}
                    type='number'
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        deadlines: {
                          ...gradingConfigForm.modifiers.deadlines,
                          maxLatePenaltyDays: Number(e.target.value)
                        }
                      }
                    })}
                    placeholder="Введите максимальное количество дней штрафа за просрочку дедлайна"
                    data-testid="assignment-content-input"
                  />
                </div>
              </div>
              <div>
                <h2>Командная оценка</h2>
                
                <div className="grading-modifier-card" style={gradingModifierCardStyle}>
                  <div className="grading-modifier-card-header" style={gradingModifierCardHeaderStyle}>
                    <h2>Размер команды</h2>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabledTeamSize}
                          onChange={(_, checked) => setEnabledTeamSize(checked)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </div>
                  <textarea
                    id="assignment-content"
                    style={gradingModifierFieldStyle}
                    value={gradingConfigForm.modifiers.teamSize.formula}
                    onChange={e => setGradingConfigForm({
                      ...gradingConfigForm,
                      modifiers: {
                        ...gradingConfigForm.modifiers,
                        teamSize: {
                          ...gradingConfigForm.modifiers.teamSize,
                          formula: e.target.value
                        }
                      }
                    })}
                    placeholder="Введите формулы подсчета"
                    rows={5}
                    data-testid="assignment-content-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowCreateAssignment(false)}>
                Отмена
              </button>
              <button className="button-primary" onClick={handleSaveAssignment} data-testid="save-assignment-button">
                {editingAssignment ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
