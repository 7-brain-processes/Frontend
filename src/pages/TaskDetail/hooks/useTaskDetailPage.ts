import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postsService, solutionsService } from "../../../api/services";
import { listSolutionFiles, downloadSolutionFile, deleteSolution } from "../../../api/solutions";
import { PostDto, SolutionDto, CourseRole, FileDto, CommentDto } from "../../../types/api";

export const useTaskDetailPage = (userRole: CourseRole, loadingRole: boolean = false) => {
    const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
    const navigate = useNavigate();
    
    const [task, setTask] = useState<PostDto | null>(null);
    const [solutions, setSolutions] = useState<SolutionDto[]>([]);
    const [solutionFiles, setSolutionFiles] = useState<Record<string, FileDto[]>>({});
    const [mySolution, setMySolution] = useState<SolutionDto | null>(null);
    const [mySolutionFiles, setMySolutionFiles] = useState<FileDto[]>([]);
    const [mySolutionComments, setMySolutionComments] = useState<CommentDto[]>([]);
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

    const loadTask = async () => {
        if (!courseId || !taskId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await postsService.getPost(courseId, taskId);
            setTask(data);
            
            if (userRole === 'STUDENT') {
                await loadMySolution();
            } else {
                await loadSolutions();
            }
        } catch (err: any) {
            console.error('Failed to load task:', err);
            setError(err.message || 'Ошибка загрузки задания');
        } finally {
            setLoading(false);
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
            // 404 is normal when student hasn't submitted yet
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
            
            // Load files for each solution
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
        setCommentInputs(prev => ({ ...prev, [solutionId]: text }));
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
            setSolutionComments(prev => ({
                ...prev,
                [solutionId]: [...(prev[solutionId] || []), comment],
            }));
            setCommentInputs(prev => ({ ...prev, [solutionId]: '' }));
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
            solutions,
            solutionFiles,
            mySolution,
            mySolutionFiles,
            mySolutionComments,
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
