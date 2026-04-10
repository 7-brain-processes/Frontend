import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService, postsService, solutionsService, teamFormationService, teamInvitationsService, teamsService } from "../../../api/services";
import { listSolutionFiles, downloadSolutionFile, deleteSolution } from "../../../api/solutions";
import {
    AutoTeamFormationRequest,
    AutoTeamFormationResultDto,
    CaptainTeamDto,
    CaptainDto,
    PostDto,
    SolutionDto,
    CourseRole,
    FileDto,
    CommentDto,
    CourseTeamAvailabilityDto,
    StudentTeamDto,
    TeamFormationStudentDto,
    TeamInvitationDto,
    UserDto,
} from "../../../types/api";

type TeamsErrorCode = '403' | '404' | 'generic' | null;

const getHttpStatus = (err: any): number | null => {
    const message = String(err?.message || '');
    const match = message.match(/\b(400|403|404|409)\b/);
    return match ? Number(match[1]) : null;
};

const isNoCurrentTeamError = (err: any): boolean => {
    const message = String(err?.message || '').toLowerCase();
    return message.includes('not in any team');
};

const isCaptainSelectionMode = (mode: PostDto['teamFormationMode'] | undefined | null): boolean => {
    return mode === 'CAPTAIN_SELECTION' || mode === 'DRAFT';
};

export const useTaskDetailPage = (userRole: CourseRole, loadingRole: boolean = false) => {
    const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<PostDto | null>(null);
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
    const [solutions, setSolutions] = useState<SolutionDto[]>([]);
    const [solutionFiles, setSolutionFiles] = useState<Record<string, FileDto[]>>({});
    const [taskMaterials, setTaskMaterials] = useState<FileDto[]>([]);
    const [mySolution, setMySolution] = useState<SolutionDto | null>(null);
    const [mySolutionFiles, setMySolutionFiles] = useState<FileDto[]>([]);
    const [mySolutionComments, setMySolutionComments] = useState<CommentDto[]>([]);
    const [availableTeams, setAvailableTeams] = useState<CourseTeamAvailabilityDto[]>([]);
    const [currentTeam, setCurrentTeam] = useState<StudentTeamDto | null>(null);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [currentTeamLoading, setCurrentTeamLoading] = useState(false);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [currentTeamError, setCurrentTeamError] = useState<string | null>(null);
    const [teamsErrorCode, setTeamsErrorCode] = useState<TeamsErrorCode>(null);
    const [teamActionError, setTeamActionError] = useState<string | null>(null);
    const [teamActionSuccess, setTeamActionSuccess] = useState<string | null>(null);
    const [actionTeamId, setActionTeamId] = useState<string | null>(null);
    const [autoFormationForm, setAutoFormationForm] = useState<AutoTeamFormationRequest>({
        minTeamSize: 2,
        maxTeamSize: 4,
        balanceByCategory: true,
        balanceByRole: false,
        reshuffle: false,
    });
    const [autoFormationResult, setAutoFormationResult] = useState<AutoTeamFormationResultDto | null>(null);
    const [autoFormationStudents, setAutoFormationStudents] = useState<TeamFormationStudentDto[]>([]);
    const [autoFormationLoading, setAutoFormationLoading] = useState(false);
    const [autoFormationSubmitting, setAutoFormationSubmitting] = useState(false);
    const [autoFormationError, setAutoFormationError] = useState<string | null>(null);
    const [autoFormationSuccess, setAutoFormationSuccess] = useState<string | null>(null);
    const [captains, setCaptains] = useState<CaptainDto[]>([]);
    const [captainsLoading, setCaptainsLoading] = useState(false);
    const [captainsSubmitting, setCaptainsSubmitting] = useState(false);
    const [captainsError, setCaptainsError] = useState<string | null>(null);
    const [captainsSuccess, setCaptainsSuccess] = useState<string | null>(null);
    const [captainTeam, setCaptainTeam] = useState<CaptainTeamDto | null>(null);
    const [captainTeamLoading, setCaptainTeamLoading] = useState(false);
    const [captainStudents, setCaptainStudents] = useState<TeamFormationStudentDto[]>([]);
    const [captainStudentsLoading, setCaptainStudentsLoading] = useState(false);
    const [captainInviteSubmittingId, setCaptainInviteSubmittingId] = useState<string | null>(null);
    const [captainInviteError, setCaptainInviteError] = useState<string | null>(null);
    const [captainInviteSuccess, setCaptainInviteSuccess] = useState<string | null>(null);
    const [captainSentInvitations, setCaptainSentInvitations] = useState<TeamInvitationDto[]>([]);
    const [studentInvitations, setStudentInvitations] = useState<TeamInvitationDto[]>([]);
    const [studentInvitationsLoading, setStudentInvitationsLoading] = useState(false);
    const [studentInvitationActionId, setStudentInvitationActionId] = useState<string | null>(null);
    const [studentInvitationsError, setStudentInvitationsError] = useState<string | null>(null);
    const [studentInvitationsSuccess, setStudentInvitationsSuccess] = useState<string | null>(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [solutionText, setSolutionText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState<SolutionDto | null>(null);
    const [gradeValue, setGradeValue] = useState<number>(0);
    const [solutionComments, setSolutionComments] = useState<Record<string, CommentDto[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

    useEffect(() => {
        if (!loadingRole) {
            loadTask();
        }
    }, [courseId, taskId, userRole, loadingRole]);

    const resetTeamsState = () => {
        setAvailableTeams([]);
        setCurrentTeam(null);
        setTeamsLoading(false);
        setCurrentTeamLoading(false);
        setTeamsError(null);
        setCurrentTeamError(null);
        setTeamsErrorCode(null);
        setTeamActionError(null);
        setTeamActionSuccess(null);
        setActionTeamId(null);
    };

    const resetAutoFormationState = () => {
        setAutoFormationResult(null);
        setAutoFormationStudents([]);
        setAutoFormationLoading(false);
        setAutoFormationSubmitting(false);
        setAutoFormationError(null);
        setAutoFormationSuccess(null);
        setAutoFormationForm({
            minTeamSize: 2,
            maxTeamSize: 4,
            balanceByCategory: true,
            balanceByRole: false,
            reshuffle: false,
        });
    };

    const resetCaptainsState = () => {
        setCaptains([]);
        setCaptainsLoading(false);
        setCaptainsSubmitting(false);
        setCaptainsError(null);
        setCaptainsSuccess(null);
        setCaptainTeam(null);
        setCaptainTeamLoading(false);
        setCaptainStudents([]);
        setCaptainStudentsLoading(false);
        setCaptainInviteSubmittingId(null);
        setCaptainInviteError(null);
        setCaptainInviteSuccess(null);
        setCaptainSentInvitations([]);
        setStudentInvitations([]);
        setStudentInvitationsLoading(false);
        setStudentInvitationActionId(null);
        setStudentInvitationsError(null);
        setStudentInvitationsSuccess(null);
    };

    const getTeamsErrorCode = (err: any): Exclude<TeamsErrorCode, null> => {
        const status = getHttpStatus(err);

        if (status === 403) {
            return '403';
        }

        if (status === 404) {
            return '404';
        }

        return 'generic';
    };

    const getTeamsErrorMessage = (code: Exclude<TeamsErrorCode, null>) => {
        if (code === '403') {
            return 'Просмотр доступных команд разрешен только студентам курса';
        }

        if (code === '404') {
            return 'Курс или задание не найдено';
        }

        return 'Не удалось загрузить список команд';
    };

    const getCurrentTeamErrorMessage = (status: number | null) => {
        if (status === 403) {
            return 'Просмотр текущей команды разрешен только студентам курса';
        }

        if (status === 404 || status === 400) {
            return null;
        }

        return 'Не удалось загрузить текущую команду';
    };

    const getTeamActionErrorMessage = (status: number | null, fallback: string) => {
        if (status === 400 || status === 409) {
            return fallback || 'Не удалось выполнить действие с командой';
        }

        if (status === 403) {
            return 'Это действие доступно только студентам курса';
        }

        if (status === 404) {
            return fallback || 'Курс, задание или команда не найдены';
        }

        return fallback || 'Не удалось выполнить действие с командой';
    };

    const loadAvailableTeams = async () => {
        if (!courseId || !taskId) return;

        try {
            setTeamsLoading(true);
            setTeamsError(null);
            setTeamsErrorCode(null);

            const teams = await postsService.listAvailableTeams(courseId, taskId);
            setAvailableTeams(teams);
        } catch (err: any) {
            console.error('Failed to load available teams:', err);
            const code = getTeamsErrorCode(err);
            setAvailableTeams([]);
            setTeamsErrorCode(code);
            setTeamsError(getTeamsErrorMessage(code));
        } finally {
            setTeamsLoading(false);
        }
    };

    const loadCurrentTeam = async () => {
        if (!courseId || !taskId) return;

        try {
            setCurrentTeamLoading(true);
            setCurrentTeamError(null);

            const team = await teamsService.getMyTeam(courseId, taskId);
            setCurrentTeam(team);
        } catch (err: any) {
            setCurrentTeam(null);
            if (isNoCurrentTeamError(err)) {
                setCurrentTeamError(null);
            } else {
                console.error('Failed to load current team:', err);
            const status = getHttpStatus(err);
            const message = getCurrentTeamErrorMessage(status);
            setCurrentTeamError(message);
            }
        } finally {
            setCurrentTeamLoading(false);
        }
    };

    const refreshTeamBlocks = async () => {
        await Promise.all([loadAvailableTeams(), loadCurrentTeam()]);
    };

    const loadTask = async () => {
        if (!courseId || !taskId) return;

        try {
            setLoading(true);
            setError(null);

            const [data, authUser] = await Promise.all([
                postsService.getPost(courseId, taskId),
                authService.getCurrentUser().catch(() => null),
            ]);
            setTask(data);
            setCurrentUser(authUser);
            console.log('[TaskDetail] teamFormationMode', {
                courseId,
                taskId,
                teamFormationMode: data.teamFormationMode,
            });

            if (data.materialsCount > 0) {
                try {
                    const materials = await postsService.listPostMaterials(courseId, taskId);
                    setTaskMaterials(materials);
                } catch (err) {
                    console.error('Failed to load task materials:', err);
                    setTaskMaterials([]);
                }
            } else {
                setTaskMaterials([]);
            }

            if (userRole === 'STUDENT') {
                if (data.teamFormationMode === 'FREE') {
                    await refreshTeamBlocks();
                } else {
                    resetTeamsState();
                }

                resetAutoFormationState();
                if (isCaptainSelectionMode(data.teamFormationMode)) {
                    const captainsData = await teamFormationService.listCaptains(courseId, taskId).catch(() => []);
                    setCaptains(captainsData);
                    if (authUser && captainsData.some((captain) => captain.userId === authUser.id)) {
                        await loadCaptainFlowData();
                    } else {
                        await loadStudentInvitations();
                    }
                } else {
                    resetCaptainsState();
                }

                await loadMySolution();
            } else {
                resetTeamsState();
                if (data.teamFormationMode === 'RANDOM_SHUFFLE') {
                    await loadAutoFormationData();
                } else {
                    resetAutoFormationState();
                }
                if (isCaptainSelectionMode(data.teamFormationMode)) {
                    const captainsData = await teamFormationService.listCaptains(courseId, taskId).catch(() => []);
                    setCaptains(captainsData);
                } else {
                    resetCaptainsState();
                }
                await loadSolutions();
            }
        } catch (err: any) {
            console.error('Failed to load task:', err);
            setError(err.message || 'Ошибка загрузки задания');
            resetTeamsState();
        } finally {
            setLoading(false);
        }
    };

    const loadAutoFormationData = async () => {
        if (!courseId || !taskId) return;

        try {
            setAutoFormationLoading(true);
            setAutoFormationError(null);

            const [result, students] = await Promise.all([
                teamFormationService.getAutoFormationResult(courseId, taskId).catch((err: any) => {
                    const status = getHttpStatus(err);
                    if (status === 404) {
                        return null;
                    }
                    throw err;
                }),
                teamFormationService.listAutoFormationStudents(courseId, taskId).catch((err: any) => {
                    const status = getHttpStatus(err);
                    if (status === 404) {
                        return [];
                    }
                    throw err;
                }),
            ]);

            setAutoFormationResult(result);
            setAutoFormationStudents(students);
        } catch (err: any) {
            console.error('Failed to load auto formation data:', err);
            setAutoFormationResult(null);
            setAutoFormationStudents([]);
            setAutoFormationError(err.message || 'Не удалось загрузить данные автоформирования');
        } finally {
            setAutoFormationLoading(false);
        }
    };

    const loadCaptains = async () => {
        if (!courseId || !taskId) return;

        try {
            setCaptainsLoading(true);
            setCaptainsError(null);

            const data = await teamFormationService.listCaptains(courseId, taskId).catch((err: any) => {
                const status = getHttpStatus(err);
                if (status === 404) {
                    return [];
                }
                throw err;
            });
            setCaptains(data);
        } catch (err: any) {
            console.error('Failed to load captains:', err);
            setCaptains([]);
            setCaptainsError(err.message || 'Не удалось загрузить список капитанов');
        } finally {
            setCaptainsLoading(false);
        }
    };

    const handleSelectCaptains = async (reshuffle: boolean = false) => {
        if (!courseId || !taskId) return;

        try {
            setCaptainsSubmitting(true);
            setCaptainsError(null);
            setCaptainsSuccess(null);

            const data = await teamFormationService.selectCaptains(courseId, taskId, { reshuffle });
            setCaptains(data);
            setCaptainsSuccess(
                reshuffle
                    ? 'Список капитанов обновлен повторным запуском'
                    : 'Капитаны успешно выбраны'
            );
        } catch (err: any) {
            console.error('Failed to select captains:', err);
            setCaptainsError(err.message || 'Не удалось выбрать капитанов');
        } finally {
            setCaptainsSubmitting(false);
        }
    };

    const loadCaptainFlowData = async () => {
        if (!courseId || !taskId) return;

        try {
            setCaptainTeamLoading(true);
            setCaptainStudentsLoading(true);
            setCaptainInviteError(null);

            const [team, students] = await Promise.all([
                teamInvitationsService.getCaptainTeam(courseId, taskId).catch((err: any) => {
                    const status = getHttpStatus(err);
                    if (status === 404) {
                        return null;
                    }
                    throw err;
                }),
                teamInvitationsService.listCaptainAvailableStudents(courseId, taskId).catch((err: any) => {
                    const status = getHttpStatus(err);
                    if (status === 404) {
                        return [];
                    }
                    throw err;
                }),
            ]);

            setCaptainTeam(team);
            setCaptainStudents(students);
        } catch (err: any) {
            console.error('Failed to load captain flow data:', err);
            setCaptainTeam(null);
            setCaptainStudents([]);
            setCaptainInviteError(err.message || 'Не удалось загрузить данные капитана');
        } finally {
            setCaptainTeamLoading(false);
            setCaptainStudentsLoading(false);
        }
    };

    const handleSendCaptainInvitation = async (studentId: string) => {
        if (!courseId || !taskId) return;

        try {
            setCaptainInviteSubmittingId(studentId);
            setCaptainInviteError(null);
            setCaptainInviteSuccess(null);

            const invitation = await teamInvitationsService.sendCaptainInvitation(courseId, taskId, { studentId });
            setCaptainSentInvitations((prev) => [invitation, ...prev.filter((item) => item.id !== invitation.id)]);
            setCaptainInviteSuccess('Приглашение отправлено');
            await loadCaptainFlowData();
        } catch (err: any) {
            console.error('Failed to send captain invitation:', err);
            setCaptainInviteError(err.message || 'Не удалось отправить приглашение');
        } finally {
            setCaptainInviteSubmittingId(null);
        }
    };

    const loadStudentInvitations = async () => {
        if (!courseId || !taskId) return;

        try {
            setStudentInvitationsLoading(true);
            setStudentInvitationsError(null);

            const invitations = await teamInvitationsService.listStudentInvitations(courseId, taskId).catch((err: any) => {
                const status = getHttpStatus(err);
                if (status === 404) {
                    return [];
                }
                throw err;
            });

            setStudentInvitations(invitations);
        } catch (err: any) {
            console.error('Failed to load student invitations:', err);
            setStudentInvitations([]);
            setStudentInvitationsError(err.message || 'Не удалось загрузить входящие приглашения');
        } finally {
            setStudentInvitationsLoading(false);
        }
    };

    const handleRespondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
        if (!courseId || !taskId) return;

        try {
            setStudentInvitationActionId(invitationId);
            setStudentInvitationsError(null);
            setStudentInvitationsSuccess(null);

            const updatedInvitation = await teamInvitationsService.respondToTeamInvitation(courseId, taskId, invitationId, { action });
            setStudentInvitations((prev) => prev.map((item) => item.id === invitationId ? updatedInvitation : item));
            setStudentInvitationsSuccess(action === 'accept' ? 'Приглашение принято' : 'Приглашение отклонено');
            await loadStudentInvitations();
        } catch (err: any) {
            console.error('Failed to respond to invitation:', err);
            setStudentInvitationsError(err.message || 'Не удалось обработать приглашение');
        } finally {
            setStudentInvitationActionId(null);
        }
    };

    const handleAutoFormationFieldChange = <K extends keyof AutoTeamFormationRequest>(
        key: K,
        value: AutoTeamFormationRequest[K]
    ) => {
        setAutoFormationForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleRunAutoFormation = async (reshuffle: boolean = false) => {
        if (!courseId || !taskId) return;

        if (autoFormationForm.minTeamSize < 1 || autoFormationForm.maxTeamSize < autoFormationForm.minTeamSize) {
            setAutoFormationError('Проверьте размеры команд: максимум не может быть меньше минимума');
            return;
        }

        try {
            setAutoFormationSubmitting(true);
            setAutoFormationError(null);
            setAutoFormationSuccess(null);

            const payload: AutoTeamFormationRequest = {
                ...autoFormationForm,
                reshuffle,
            };

            const result = await teamFormationService.runAutoTeamFormation(courseId, taskId, payload);
            setAutoFormationResult(result);
            setAutoFormationSuccess(
                reshuffle
                    ? 'Автоматическое формирование команд запущено повторно'
                    : 'Автоматическое формирование команд выполнено'
            );

            const students = await teamFormationService.listAutoFormationStudents(courseId, taskId).catch(() => []);
            setAutoFormationStudents(students);
        } catch (err: any) {
            console.error('Failed to run auto formation:', err);
            setAutoFormationError(err.message || 'Не удалось запустить автоматическое формирование');
        } finally {
            setAutoFormationSubmitting(false);
        }
    };

    const loadCommentsForSolution = async (solutionId: string): Promise<CommentDto[]> => {
        if (!courseId || !taskId) {
            return [];
        }

        try {
            const response = await solutionsService.listSolutionComments(courseId, taskId, solutionId, { size: 100 });
            return response.content;
        } catch (err) {
            console.error(`Failed to load comments for solution ${solutionId}:`, err);
            return [];
        }
    };

    const loadMySolution = async () => {
        if (!courseId || !taskId) return;

        try {
            const solution = await solutionsService.getMySolution(courseId, taskId);
            setMySolution(solution);
            setSolutionText(solution.text || '');
            setMySolutionComments(await loadCommentsForSolution(solution.id));

            if (solution.filesCount > 0) {
                try {
                    const files = await listSolutionFiles(courseId, taskId, solution.id);
                    setMySolutionFiles(files);
                } catch (err) {
                    console.error('Failed to load solution files:', err);
                    setMySolutionFiles([]);
                }
            } else {
                setMySolutionFiles([]);
            }
        } catch (err: any) {
            if (err.message?.includes('404') || err.message?.includes('not found')) {
                setMySolution(null);
                setSolutionText('');
                setMySolutionFiles([]);
                setMySolutionComments([]);
            } else {
                console.error('Failed to load my solution:', err);
                setMySolution(null);
                setSolutionText('');
                setMySolutionFiles([]);
                setMySolutionComments([]);
            }
        }
    };

    const loadSolutions = async () => {
        if (!courseId || !taskId || userRole !== 'TEACHER') return;

        try {
            const response = await solutionsService.listSolutions(courseId, taskId);
            setSolutions(response.content);

            const filesMap: Record<string, FileDto[]> = {};
            const commentsMap: Record<string, CommentDto[]> = {};

            for (const solution of response.content) {
                if (solution.filesCount > 0) {
                    try {
                        const files = await listSolutionFiles(courseId, taskId, solution.id);
                        filesMap[solution.id] = files;
                    } catch (err) {
                        console.error(`Failed to load files for solution ${solution.id}:`, err);
                        filesMap[solution.id] = [];
                    }
                } else {
                    filesMap[solution.id] = [];
                }

                commentsMap[solution.id] = await loadCommentsForSolution(solution.id);
            }

            setSolutionFiles(filesMap);
            setSolutionComments(commentsMap);
        } catch (err: any) {
            console.error('Failed to load solutions:', err);
            setSolutions([]);
            setSolutionFiles({});
            setSolutionComments({});
        }
    };

    const handleEnrollInTeam = async (teamId: string) => {
        if (!courseId || !taskId) return;

        try {
            setActionTeamId(teamId);
            setTeamActionError(null);
            setTeamActionSuccess(null);
            const response = await teamsService.enrollInTeam(courseId, taskId, teamId);
            setTeamActionSuccess(response.message);
            await refreshTeamBlocks();
        } catch (err: any) {
            console.error('Failed to enroll in team:', err);
            setTeamActionError(getTeamActionErrorMessage(getHttpStatus(err), err.message || ''));
        } finally {
            setActionTeamId(null);
        }
    };

    const handleLeaveTeam = async (teamId: string) => {
        if (!courseId || !taskId) return;

        try {
            setActionTeamId(teamId);
            setTeamActionError(null);
            setTeamActionSuccess(null);
            const response = await teamsService.leaveTeam(courseId, taskId, teamId);
            setTeamActionSuccess(response.message);
            await refreshTeamBlocks();
        } catch (err: any) {
            console.error('Failed to leave team:', err);
            setTeamActionError(getTeamActionErrorMessage(getHttpStatus(err), err.message || ''));
        } finally {
            setActionTeamId(null);
        }
    };

    const handleSubmitSolution = async () => {
        if (!courseId || !taskId) return;

        if (!solutionText.trim() && selectedFiles.length === 0) {
            alert('Добавьте текст решения или прикрепите файлы');
            return;
        }

        try {
            setLoading(true);

            const newSolution = await solutionsService.createSolution(courseId, taskId, {
                text: solutionText.trim() || ' ',
            });

            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    try {
                        await solutionsService.uploadSolutionFile(courseId, taskId, newSolution.id, file);
                    } catch (err) {
                        console.error('Failed to upload file:', err);
                        throw new Error(`Ошибка загрузки файла ${file.name}`);
                    }
                }
            }

            await loadMySolution();
            setShowSubmitForm(false);
            setSolutionText('');
            setSelectedFiles([]);
        } catch (err: any) {
            console.error('Failed to submit solution:', err);
            alert(err.message || 'Ошибка отправки решения');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGradeModal = (solution: SolutionDto) => {
        setSelectedSolution(solution);
        setGradeValue(solution.grade || 0);
        setShowGradeModal(true);
    };

    const handleGradeSolution = async () => {
        if (!courseId || !taskId || !selectedSolution) return;

        try {
            await solutionsService.gradeSolution(courseId, taskId, selectedSolution.id, {
                grade: gradeValue,
            });

            await loadSolutions();
            setShowGradeModal(false);
            setSelectedSolution(null);
        } catch (err: any) {
            console.error('Failed to grade solution:', err);
            alert(err.message || 'Ошибка выставления оценки');
        }
    };

    const handleRemoveGrade = async () => {
        if (!courseId || !taskId || !selectedSolution) return;

        try {
            await solutionsService.removeGrade(courseId, taskId, selectedSolution.id);

            await loadSolutions();
            setShowGradeModal(false);
            setSelectedSolution(null);
        } catch (err: any) {
            console.error('Failed to remove grade:', err);
            alert(err.message || 'Ошибка снятия оценки');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    const handleCancelSubmit = async () => {
        if (!courseId || !taskId || !mySolution) return;

        if (mySolution.status === 'GRADED' || mySolution.grade !== null) {
            alert('Оцененное решение нельзя удалить. Оценку можно только изменить.');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите отменить отправку решения?')) {
            return;
        }

        try {
            await deleteSolution(courseId, taskId, mySolution.id);
            setMySolution(null);
            setMySolutionFiles([]);
            setMySolutionComments([]);
            setSolutionText('');
            setSelectedFiles([]);
            setShowSubmitForm(false);
        } catch (err: any) {
            console.error('Failed to delete solution:', err);
            alert(err.message || 'Ошибка отмены отправки');
        }
    };

    const handleCommentInputChange = (solutionId: string, text: string) => {
        setCommentInputs((prev) => ({ ...prev, [solutionId]: text }));
    };

    const handleCreateSolutionComment = async (solutionId: string) => {
        if (!courseId || !taskId) return;

        const text = commentInputs[solutionId]?.trim();
        if (!text) {
            alert('Введите текст комментария');
            return;
        }

        try {
            setSubmittingCommentId(solutionId);
            const comment = await solutionsService.createSolutionComment(courseId, taskId, solutionId, { text });
            setSolutionComments((prev) => ({
                ...prev,
                [solutionId]: [...(prev[solutionId] || []), comment],
            }));
            setCommentInputs((prev) => ({ ...prev, [solutionId]: '' }));
        } catch (err: any) {
            console.error('Failed to create solution comment:', err);
            alert(err.message || 'Ошибка добавления комментария');
        } finally {
            setSubmittingCommentId(null);
        }
    };

    const handleBack = () => {
        navigate(`/course/${courseId}`);
    };

    const formatDeadline = (deadline: string) => {
        const date = new Date(deadline);
        const now = new Date();
        const isPast = date < now;

        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return {
            text: date.toLocaleDateString('ru-RU', options),
            isPast
        };
    };

    return {
        state: {
            task,
            currentUser,
            solutions,
            solutionFiles,
            taskMaterials,
            mySolution,
            mySolutionFiles,
            mySolutionComments,
            availableTeams,
            currentTeam,
            teamsLoading,
            currentTeamLoading,
            teamsError,
            currentTeamError,
            teamsErrorCode,
            teamActionError,
            teamActionSuccess,
            actionTeamId,
            autoFormationForm,
            autoFormationResult,
            autoFormationStudents,
            autoFormationLoading,
            autoFormationSubmitting,
            autoFormationError,
            autoFormationSuccess,
            captains,
            captainsLoading,
            captainsSubmitting,
            captainsError,
            captainsSuccess,
            captainTeam,
            captainTeamLoading,
            captainStudents,
            captainStudentsLoading,
            captainInviteSubmittingId,
            captainInviteError,
            captainInviteSuccess,
            captainSentInvitations,
            studentInvitations,
            studentInvitationsLoading,
            studentInvitationActionId,
            studentInvitationsError,
            studentInvitationsSuccess,
            isCurrentUserCaptain: !!currentUser && captains.some((captain) => captain.userId === currentUser.id),
            showSubmitForm,
            solutionText,
            selectedFiles,
            loading,
            error,
            showGradeModal,
            selectedSolution,
            gradeValue,
            solutionComments,
            commentInputs,
            submittingCommentId,
        },
        functions: {
            setShowSubmitForm,
            setSolutionText,
            setSelectedFiles,
            setGradeValue,
            setShowGradeModal,
            handleSubmitSolution,
            handleOpenGradeModal,
            handleGradeSolution,
            handleRemoveGrade,
            handleCommentInputChange,
            handleCreateSolutionComment,
            handleFileSelect,
            handleCancelSubmit,
            handleBack,
            formatDeadline,
            retryLoadTeams: refreshTeamBlocks,
            handleEnrollInTeam,
            handleLeaveTeam,
            setAutoFormationForm,
            handleAutoFormationFieldChange,
            handleRunAutoFormation,
            retryLoadAutoFormation: loadAutoFormationData,
            handleSelectCaptains,
            retryLoadCaptains: loadCaptains,
            retryLoadCaptainFlow: loadCaptainFlowData,
            handleSendCaptainInvitation,
            retryLoadStudentInvitations: loadStudentInvitations,
            handleRespondToInvitation,
            handleDownloadTaskMaterial: async (fileId: string, fileName: string) => {
                if (!courseId || !taskId) return;

                try {
                    const blob = await postsService.downloadPostMaterial(courseId, taskId, fileId);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (err) {
                    console.error('Failed to download task material:', err);
                    alert('Ошибка при скачивании файла');
                }
            },
            handleDownloadFile: async (fileId: string, fileName: string) => {
                if (!courseId || !taskId || !mySolution) return;

                try {
                    const blob = await downloadSolutionFile(courseId, taskId, mySolution.id, fileId);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (err) {
                    console.error('Failed to download file:', err);
                    alert('Ошибка при скачивании файла');
                }
            },
            handleDownloadSolutionFile: async (solutionId: string, fileId: string, fileName: string) => {
                if (!courseId || !taskId) return;

                try {
                    const blob = await downloadSolutionFile(courseId, taskId, solutionId, fileId);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (err) {
                    console.error('Failed to download file:', err);
                    alert('Ошибка при скачивании файла');
                }
            },
        }
    };
};
