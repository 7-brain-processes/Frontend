import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostDto, CourseRole, PostType } from '../../types/api';
import { CourseCategoryDto, FileDto } from '../../types';
import { categoryService, multiCriteriaGradingService, postsService, teamRequirementTemplateService } from '../../api/services';
import './StreamTab.css';
import PublicCommentsDialog from '../../pages/PublicComments/PublicCommentsDialog';
import { usePublicCommentsDialog } from '../../pages/PublicComments/hooks/usePublicCommentsDialog';
import { FormControl, FormControlLabel, MenuItem, Select, Switch } from '@mui/material';
import { CriterionConfigDto, CriterionType, UpsertGradingConfigRequest } from '../../types/Criterion';
import { PeerReviewConfigRequest } from '../../types/Peer2peer';

const generateTemplateName = () => {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `Шаблон ${id}`;
};

interface StreamTabProps {
  courseId: string;
  userRole: CourseRole;
}

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

const normalizeGradingConfig = (
  gradingConfig?: Partial<UpsertGradingConfigRequest> | null
): UpsertGradingConfigRequest => {
  const initialConfig = createInitialGradingConfig();
  const criteria = Array.isArray(gradingConfig?.criteria) ? gradingConfig?.criteria ?? [] : initialConfig.criteria;

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

const isGradingConfigUnsupportedError = (err: unknown): boolean => {
  const message = err instanceof Error ? err.message : String(err || '');
  return message.includes('404') || message.includes('Not found') || message.includes('not found') || message.includes('Не найдено');
};

const StreamTab: React.FC<StreamTabProps> = ({ courseId, userRole }) => {
  const navigate = useNavigate();
  const { state, functions } = usePublicCommentsDialog();
  type TeamFormationModeValue = PostDto['teamFormationMode'] | '';
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'MATERIAL' as PostType,
    teamFormationMode: '' as TeamFormationModeValue,
    deadline: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postMaterials, setPostMaterials] = useState<Record<string, FileDto[]>>({});
  const [editingPostMaterials, setEditingPostMaterials] = useState<FileDto[]>([]);
  const [isLoadingEditingPostMaterials, setIsLoadingEditingPostMaterials] = useState(false);
  const [loadingMaterialsPostId, setLoadingMaterialsPostId] = useState<string | null>(null);
  const [titleError, setTitleError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
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
    margin: '18px 0 10px',
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
  const [templateForm, setTemplateForm] = useState({
    name: generateTemplateName(),
    minTeamSize: 0,
    maxTeamSize: 0,
    requiredCategoryId: ''
  });
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [gradingConfigForm, setGradingConfigForm] = useState<UpsertGradingConfigRequest>(createInitialGradingConfig());

  const updateCriterion = (index: number, field: keyof CriterionConfigDto, value: string | number | CriterionType) => {
    setGradingConfigForm(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, [field]: value } : criterion
      ),
    }));
  };

  const updatePeerReviewConfig = (index: number, field: keyof PeerReviewConfigRequest, value: string | number | PeerReviewReviewMode | PeerReviewUsageType | PeerReviewScoringStrategy) => {
    setGradingConfigForm(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index
          ? ({
            ...criterion,
            peerReviewConfigRequest: {
              ...(criterion.peerReviewConfigRequest || {}),
              [field]: value
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

  useEffect(() => {
    loadPosts();
    loadCategoriesFunc();
  }, [courseId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsService.listPosts(courseId);
      setPosts(
        [...response.content].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        )
      );
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostForm({ title: '', content: '', type: 'MATERIAL', teamFormationMode: '', deadline: '' });
    setGradingConfigForm(createInitialGradingConfig());
    setTitleError('');
    setDeadlineError('');
    setSelectedFiles([]);
    setEditingPostMaterials([]);
    setIsLoadingEditingPostMaterials(false);
    setShowCreatePost(true);
  };

  const handleEditPost = async (post: PostDto) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content || '',
      type: post.type,
      teamFormationMode: post.teamFormationMode,
      deadline: toDateTimeLocal(post.deadline)
    });
    setTitleError('');
    setDeadlineError('');
    setSelectedFiles([]);
    setIsLoadingEditingPostMaterials(true);

    if (post.type === 'TASK') {
      try {
        const gradingConfig = await multiCriteriaGradingService.getGradingConfig(courseId, post.id);
        setGradingConfigForm(normalizeGradingConfig(gradingConfig));
      } catch {
        setGradingConfigForm(createInitialGradingConfig());
      }
    } else {
      setGradingConfigForm(createInitialGradingConfig());
    }

    try {
      const files = await postsService.listPostMaterials(courseId, post.id);
      setEditingPostMaterials(files);
    } catch (err: any) {
      console.error('Failed to load post materials for edit:', err);
      setEditingPostMaterials([]);
      alert(err.message || 'Не удалось загрузить файлы поста');
    } finally {
      setIsLoadingEditingPostMaterials(false);
    }

    setShowCreatePost(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await postsService.deletePost(courseId, postId);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (err: any) {
        console.error('Failed to delete post:', err);
        alert(err.message || 'Ошибка удаления поста');
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
      await multiCriteriaGradingService.upsertGradingConfig(courseId, postId, buildGradingConfigPayload(gradingConfigForm));
    } catch (err) {
      if (isGradingConfigUnsupportedError(err)) {
        console.warn('Grading config endpoint is not available on this backend, skipping save.', err);
        return;
      }

      throw err;
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

  const saveGradingConfigWithoutBreakingPost = async (postId: string) => {
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

  const handleSavePost = async () => {
    if (!postForm.title.trim()) {
      setTitleError('Введите название поста');
      return;
    }

    setTitleError('');

    if (postForm.type === 'TASK' && postForm.deadline && new Date(postForm.deadline).getTime() < Date.now()) {
      setDeadlineError('Срок сдачи задания не может быть в прошлом');
      return;
    }

    setDeadlineError('');

    try {
      if (editingPost) {
        const updatedPost = await postsService.updatePost(courseId, editingPost.id, {
          title: postForm.title,
          content: postForm.content || undefined,
          deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : undefined,
          teamFormationMode: postForm.type === 'TASK' ? postForm.teamFormationMode || undefined : undefined,
        });

        if (postForm.type === 'TASK') {
          await saveGradingConfigWithoutBreakingPost(editingPost.id);
        }

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            try {
              await postsService.uploadPostMaterial(courseId, editingPost.id, file);
            } catch (err) {
              console.error('Failed to upload file:', err);
            }
          }
        }

        setPosts(posts.map((p) => (p.id === editingPost.id ? updatedPost : p)));
        await loadPosts();
      } else {
        if (postForm.type === 'TASK') {
          const selectedMode = postForm.teamFormationMode || undefined;
          const requiresTemplate = selectedMode === 'DRAFT' || selectedMode === 'CAPTAIN_SELECTION';

          const newPost = await postsService.createPost(courseId, {
            title: postForm.title,
            content: postForm.content || undefined,
            type: postForm.type,
            deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : undefined,
            teamFormationMode: selectedMode,
          });

          if (requiresTemplate) {
            const templateId = await createTeamRequirementTemplate();
            if (!templateId) {
              return false;
            }
            await applayTeamRequirementTemplate(templateId, newPost.id);
          }

          await saveGradingConfigWithoutBreakingPost(newPost.id);

          if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
              try {
                await postsService.uploadPostMaterial(courseId, newPost.id, file);
              } catch (err) {
                console.error('Failed to upload file:', err);
              }
            }
          }
        }
        else {
          const newPost = await postsService.createPost(courseId, {
            title: postForm.title,
            content: postForm.content || undefined,
            type: postForm.type,
            deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : undefined,
            teamFormationMode: undefined,
          });

          if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
              try {
                await postsService.uploadPostMaterial(courseId, newPost.id, file);
              } catch (err) {
                console.error('Failed to upload file:', err);
              }
            }
          }
        }
        await loadPosts();
      }

      setShowCreatePost(false);
      setEditingPostMaterials([]);
      setSelectedFiles([]);
      setIsLoadingEditingPostMaterials(false);
    } catch (err: any) {
      console.error('Failed to save post:', err);
      alert(err.message || 'Ошибка сохранения поста');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = async (fileId: string) => {
    if (!editingPost) return;

    try {
      await postsService.deletePostMaterial(courseId, editingPost.id, fileId);

      setEditingPostMaterials((prev) => prev.filter((file) => file.id !== fileId));
      setPostMaterials((prev) => ({
        ...prev,
        [editingPost.id]: (prev[editingPost.id] || []).filter((file) => file.id !== fileId),
      }));
      setPosts((prev) => prev.map((post) => {
        if (post.id !== editingPost.id) return post;
        return {
          ...post,
          materialsCount: Math.max(0, post.materialsCount - 1),
        };
      }));
    } catch (err: any) {
      console.error('Failed to delete post material:', err);
      alert(err.message || 'Не удалось удалить файл');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTypeLabel = (type: PostType) => {
    return type === 'MATERIAL' ? 'Материал' : 'Задание';
  };

  const handlePostClick = (post: PostDto) => {
    if (post.type === 'TASK') {
      navigate(`/course/${courseId}/task/${post.id}`);
    }
  };

  const handleToggleMaterials = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    try {
      setLoadingMaterialsPostId(postId);
      const files = await postsService.listPostMaterials(courseId, postId);
      setPostMaterials((prev) => ({ ...prev, [postId]: files }));
      setExpandedPost(postId);
    } catch (err: any) {
      console.error('Failed to load post materials:', err);
      alert(err.message || 'Не удалось загрузить материалы');
    } finally {
      setLoadingMaterialsPostId(null);
    }
  };

  const handleDownloadMaterial = async (
    postId: string,
    file: FileDto,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    try {
      const blob = await postsService.downloadPostMaterial(courseId, postId, file.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download material:', err);
      alert(err.message || 'Не удалось загрузить файл');
    }
  };

  return (
    <div className="stream-tab">
      {userRole === 'TEACHER' && (
        <div className="stream-actions">
          <button
            className="create-post-button"
            onClick={handleCreatePost}
            data-testid="create-post-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Создать пост</span>
          </button>
        </div>
      )}

      <div className="posts-list" data-testid="posts-list">
        {loading ? (
          <div className="loading-state">Загрузка постов...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" fill="#E8F0FE" />
                <path d="M45 50L55 60L45 70M65 70H75" stroke="#1967D2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="empty-state-title">Здесь будут появляться новые материалы курса</h2>
            <p className="empty-state-description">
              В ленте публикуются все новости и объявления курса.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className={`post-card ${post.type === 'TASK' ? 'clickable' : ''}`}
              onClick={() => handlePostClick(post)}
              data-testid="post-item"
            >
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.author.displayName}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="post-header-right">
                  <span className={`post-type-badge ${post.type.toLowerCase()}`}>
                    {getPostTypeLabel(post.type)}
                  </span>
                  {userRole === 'TEACHER' && (
                    <div className="post-actions">
                      <button
                        className="icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPost(post);
                        }}
                        title="Редактировать"
                        data-testid="edit-post-button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        className="icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        title="Удалить"
                        data-testid="delete-post-button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="post-content">
                <h3 className="post-title" data-testid="post-title">{post.title}</h3>
                {post.content && (
                  <div className="post-text" data-testid="post-content">
                    {post.content}
                  </div>
                )}
                {post.deadline && (
                  <div className="post-deadline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span>Срок: {formatDate(post.deadline)}</span>
                  </div>
                )}

                {expandedPost === post.id && (
                  <div className="post-materials">
                    {loadingMaterialsPostId === post.id && !postMaterials[post.id] && (
                      <div className="post-materials-status">Загрузка материалов...</div>
                    )}
                    {postMaterials[post.id] && postMaterials[post.id].length > 0 && (
                      postMaterials[post.id].map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          className="post-material-item"
                          onClick={(event) => handleDownloadMaterial(post.id, file, event)}
                        >
                          <span className="post-material-icon">📎</span>
                          <span className="post-material-name">{file.originalName}</span>
                        </button>
                      ))
                    )}
                    {postMaterials[post.id] && postMaterials[post.id].length === 0 && (
                      <div className="post-materials-status">Материалы не найдены</div>
                    )}
                  </div>
                )}
              </div>

              <div className="post-footer">
                <div className="post-stats">
                  {post.materialsCount > 0 && (
                    <span
                      className="stat-item stat-item-materials"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleMaterials(post.id);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                      {post.materialsCount}
                    </span>
                  )}
                  <span
                    className="stat-item stat-item-comments"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPostId(post.id);
                      functions.handleIsOpenPublicComments(true);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                    </svg>
                    {post.commentsCount || 0}
                  </span>
                  {post.type === 'TASK' && post.mySolutionId && (
                    <span className="stat-item submitted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Сдано
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPost ? 'Редактировать пост' : 'Создать пост'}</h2>
              <button className="close-button" onClick={() => setShowCreatePost(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="post-type">Тип поста</label>
                <select
                  id="post-type"
                  value={postForm.type}
                  onChange={(e) => setPostForm({ ...postForm, type: e.target.value as PostType })}
                  data-testid="post-type-select"
                >
                  <option value="MATERIAL">Материал</option>
                  <option value="TASK">Задание</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="post-title">Название *</label>
                <input
                  id="post-title"
                  type="text"
                  value={postForm.title}
                  onChange={(e) => {
                    setPostForm({ ...postForm, title: e.target.value });
                    setTitleError('');
                  }}
                  placeholder="Введите название поста"
                  data-testid="post-title-input"
                />
                {titleError && (
                  <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '8px' }} data-testid="post-title-error">
                    {titleError}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="post-content">Описание</label>
                <textarea
                  id="post-content"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Введите описание поста"
                  rows={6}
                  data-testid="post-content-input"
                />
              </div>

              {postForm.type === 'TASK' && (
                <div>
                  <div className="form-group">
                    <label htmlFor="post-deadline">Срок сдачи</label>
                    <input
                      id="post-deadline"
                      type="datetime-local"
                      value={postForm.deadline}
                      onChange={(e) => {
                        setPostForm({ ...postForm, deadline: e.target.value });
                        setDeadlineError('');
                      }}
                      min={getMinDateTimeLocal()}
                      data-testid="post-deadline-input"
                    />
                    {deadlineError && (
                      <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '8px' }} data-testid="post-deadline-error">
                        {deadlineError}
                      </div>
                    )}

                  </div>
                  <div className="form-group">
                    <label htmlFor="assignment-deadline">Режим формирования команд</label>
                    <FormControl fullWidth>
                      <Select
                        id="demo-simple-select"
                        value={postForm.teamFormationMode}
                        onChange={e => setPostForm({ ...postForm, teamFormationMode: e.target.value })}
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
                  </div>
                  <div className="form-group">
                    <label htmlFor="task-max-grade">Максимальная оценка</label>
                    <input
                      id="task-max-grade"
                      value={gradingConfigForm.maxGrade}
                      type="number"
                      onChange={(e) => setGradingConfigForm({ ...gradingConfigForm, maxGrade: Number(e.target.value) })}
                      placeholder="Введите максимальную оценку"
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
                            {'Удалить'}
                          </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label htmlFor={`stream-criterion-title-${index}`}>{'Название критерия'}</label>
                          <input
                            id={`stream-criterion-title-${index}`}
                            value={criterion.title}
                            onChange={(e) => updateCriterion(index, 'title', e.target.value)}
                            placeholder={'Например, качество решения'}
                          />
                        </div>
                        <div style={criteriaGridStyle}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor={`stream-criterion-type-${index}`}>{'Тип'}</label>
                            <select
                              id={`stream-criterion-type-${index}`}
                              value={criterion.type}
                              onChange={(e) => updateCriterion(index, 'type', e.target.value as CriterionType)}
                              style={gradingModifierFieldStyle}
                            >
                              <option value="PERCENTAGE">{'Проценты'}</option>
                              <option value="POINTS">{'Баллы'}</option>
                              <option value="YES_NO">{'Да / нет'}</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor={`stream-criterion-max-points-${index}`}>{'Максимум баллов'}</label>
                            <input
                              id={`stream-criterion-max-points-${index}`}
                              type="number"
                              value={criterion.maxPoints}
                              onChange={(e) => updateCriterion(index, 'maxPoints', Number(e.target.value))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor={`stream-criterion-weight-${index}`}>{'Вес'}</label>
                            <input
                              id={`stream-criterion-weight-${index}`}
                              type="number"
                              value={criterion.weight}
                              onChange={(e) => updateCriterion(index, 'weight', Number(e.target.value))}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor={`stream-criterion-sort-order-${index}`}>{'Порядок'}</label>
                            <input
                              id={`stream-criterion-sort-order-${index}`}
                              type="number"
                              value={criterion.sortOrder}
                              onChange={(e) => updateCriterion(index, 'sortOrder', Number(e.target.value))}
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
                                onChange={e => updatePeerReviewConfig(index, 'scoringStrategy', e.target.value as PeerReviewScoringStrategy)}
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
                                value={criterion.peerReviewConfigRequest?.firstDeadline.toISOString()}
                                onChange={e => updatePeerReviewConfig(index, 'firstDeadline', e.target.value)}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor={`criterion-second-deadline-${index}`}>Второй дедлайн</label>
                              <input
                                id={`criterion-second-deadline-${index}`}
                                type="date"
                                value={criterion.peerReviewConfigRequest?.secondDeadline.toISOString()}
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
                                onChange={e => updatePeerReviewConfig(index, 'reviewMode', e.target.value as PeerReviewReviewMode)}
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
                                onChange={e => updatePeerReviewConfig(index, 'usageType', e.target.value as PeerReviewUsageType)}
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
                      {'Добавить критерий'}
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
                              checked={gradingConfigForm.modifiers.progressRegularity.enabled}
                              onChange={(_, checked) => setGradingConfigForm({
                                ...gradingConfigForm,
                                modifiers: {
                                  ...gradingConfigForm.modifiers,
                                  progressRegularity: {
                                    ...gradingConfigForm.modifiers.progressRegularity,
                                    enabled: checked,
                                  },
                                },
                              })}
                              color="primary"
                            />
                          }
                          label=""
                        />
                      </div>
                      <span className="grading-field-label">Количество контрольных точек</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.progressRegularity.checkpointCount}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            progressRegularity: {
                              ...gradingConfigForm.modifiers.progressRegularity,
                              checkpointCount: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите количество контрольных точек"
                      />
                      <span className="grading-field-label">Баллы за одну точку</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.progressRegularity.pointsPerCheckpoint}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            progressRegularity: {
                              ...gradingConfigForm.modifiers.progressRegularity,
                              pointsPerCheckpoint: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите количество очков за контрольную точку"
                      />
                    </div>
                    <div className="grading-modifier-card" style={gradingModifierCardStyle}>
                      <div className="grading-modifier-card-header" style={gradingModifierCardHeaderStyle}>
                        <h2>Дедлайны</h2>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={gradingConfigForm.modifiers.deadlines.enabled}
                              onChange={(_, checked) => setGradingConfigForm({
                                ...gradingConfigForm,
                                modifiers: {
                                  ...gradingConfigForm.modifiers,
                                  deadlines: {
                                    ...gradingConfigForm.modifiers.deadlines,
                                    enabled: checked,
                                  },
                                },
                              })}
                              color="primary"
                            />
                          }
                          label=""
                        />
                      </div>
                      <span className="grading-field-label">Мягкий дедлайн</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={new Date(gradingConfigForm.modifiers.deadlines.softDeadline).toISOString().split('T')[0]}
                        type="date"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              softDeadline: new Date(e.target.value),
                            },
                          },
                        })}
                      />
                      <span className="grading-field-label">Жёсткий дедлайн</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={new Date(gradingConfigForm.modifiers.deadlines.hardDeadline).toISOString().split('T')[0]}
                        type="date"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              hardDeadline: new Date(e.target.value),
                            },
                          },
                        })}
                      />
                      <span className="grading-field-label">Бонус за мягкий дедлайн</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.deadlines.softDeadlineBonus}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              softDeadlineBonus: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите бонус за мягкий дедлайн"
                      />
                      <span className="grading-field-label">Бонус за досрочный день</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.deadlines.earlySubmissionBonusPerDay}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              earlySubmissionBonusPerDay: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите бонус за досрочную сдачу за день"
                      />
                      <span className="grading-field-label">Штраф за день просрочки</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.deadlines.latePenaltyPerDay}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              latePenaltyPerDay: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите штраф за просрочку за день"
                      />
                      <span className="grading-field-label">Максимум дней штрафа</span>
                      <input
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.deadlines.maxLatePenaltyDays}
                        type="number"
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            deadlines: {
                              ...gradingConfigForm.modifiers.deadlines,
                              maxLatePenaltyDays: Number(e.target.value),
                            },
                          },
                        })}
                        placeholder="Введите максимум дней штрафа"
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
                              checked={gradingConfigForm.modifiers.teamSize.enabled}
                              onChange={(_, checked) => setGradingConfigForm({
                                ...gradingConfigForm,
                                modifiers: {
                                  ...gradingConfigForm.modifiers,
                                  teamSize: {
                                    ...gradingConfigForm.modifiers.teamSize,
                                    enabled: checked,
                                  },
                                },
                              })}
                              color="primary"
                            />
                          }
                          label=""
                        />
                      </div>
                      <textarea
                        style={gradingModifierFieldStyle}
                        value={gradingConfigForm.modifiers.teamSize.formula}
                        onChange={(e) => setGradingConfigForm({
                          ...gradingConfigForm,
                          modifiers: {
                            ...gradingConfigForm.modifiers,
                            teamSize: {
                              ...gradingConfigForm.modifiers.teamSize,
                              formula: e.target.value,
                            },
                          },
                        })}
                        placeholder="Введите формулы подсчета"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                )}

                <div className="form-group">
                <label>Файлы</label>
                <div className="file-upload">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    id="file-input"
                    style={{ display: 'none' }}
                    data-testid="post-files-input"
                  />
                  <label htmlFor="file-input" className="file-upload-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                    </svg>
                    <span>Выбрать файлы</span>
                  </label>
                </div>

                {(editingPostMaterials.length > 0 || selectedFiles.length > 0) && (
                  <div className="selected-files">
                    {editingPostMaterials.map((file) => (
                      <div key={file.id} className="file-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        <span>{file.originalName}</span>
                        <button type="button" className="delete-existing-file-button" onClick={() => handleRemoveExistingFile(file.id)}>
                          х
                        </button>
                      </div>
                    ))}
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        <span>{file.name}</span>
                        <button type="button" onClick={() => handleRemoveFile(index)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isLoadingEditingPostMaterials && (
                  <div className="post-materials-status">Загрузка прикрепленных файлов...</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => {
                setShowCreatePost(false);
                setSelectedFiles([]);
                setEditingPostMaterials([]);
                setIsLoadingEditingPostMaterials(false);
              }}>
                Отмена
              </button>
              <button className="button-primary" onClick={handleSavePost} data-testid="save-post-button">
                {editingPost ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPostId && (
        <PublicCommentsDialog
          isOpenPublicComments={state.isOpenPublicComments}
          handleIsOpenPublicComments={(isOpen) => {
            functions.handleIsOpenPublicComments(isOpen);
            if (!isOpen) setSelectedPostId(null);
          }}
          getPublicComments={functions.getPublicComments}
          courseId={courseId}
          postId={selectedPostId}
          publicComments={state.publicComments}
          createCommentForm={state.createCommentForm}
          handleChangeCreateComment={functions.handleChangeCreateComment}
          errorsCreateCommentForm={state.errorsCreateCommentForm}
          createPublicComment={functions.createPublicComment}
          onCommentCreated={loadPosts}
          deleteComments={functions.deleteComments}
          editPublicComment={functions.editPublicComment}
          isEditComment={state.isEditComment}
          editingCommentId={state.editingCommentId}
          startEditComment={functions.startEditComment}
          errorsEditCommentForm={state.errorsEditCommentForm}
          editCommentForm={state.editCommentForm}
          handleChangeEditComment={functions.handleChangeEditComment}
        />
      )}
    </div>
  );
};

export default StreamTab;
