import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { postsService, solutionsService } from "../../../api/services";
import { listSolutionFiles, downloadSolutionFile } from "../../../api/solutions";
import { PostDto, SolutionDto, CourseRole, FileDto } from "../../../types/api";
import { mockPosts, mockSolutions, getMySolution } from "../../../data/mockData";

export const useTaskDetailPage = (userRole: CourseRole) => {
    const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
    const navigate = useNavigate();
    
    const [task, setTask] = useState<PostDto | null>(null);
    const [solutions, setSolutions] = useState<SolutionDto[]>([]);
    const [mySolution, setMySolution] = useState<SolutionDto | null>(null);
    const [mySolutionFiles, setMySolutionFiles] = useState<FileDto[]>([]);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [solutionText, setSolutionText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState<SolutionDto | null>(null);
    const [gradeValue, setGradeValue] = useState<number>(0);

    useEffect(() => {
        loadTask();
    }, [courseId, taskId]);

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
            console.error('Failed to load task, using mock data:', err);
            const allMockPosts = Object.values(mockPosts).flat();
            const mockTask = allMockPosts.find(p => p.id === taskId);
            if (mockTask) {
                setTask(mockTask);
                if (userRole === 'STUDENT') {
                    const mockSol = getMySolution(taskId);
                    setMySolution(mockSol);
                    setSolutionText(mockSol?.text || '');
                } else {
                    const mockSols = mockSolutions[taskId] || [];
                    setSolutions(mockSols);
                }
                setError('Работа в режиме без подключения к серверу');
            } else {
                setError(err.message || 'Ошибка загрузки задания');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMySolution = async () => {
        if (!courseId || !taskId) return;
        
        try {
            const solution = await solutionsService.getMySolution(courseId, taskId);
            setMySolution(solution);
            setSolutionText(solution.text || '');
            
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
            console.error('Failed to load my solution, using mock data:', err);
            const mockSol = getMySolution(taskId);
            setMySolution(mockSol);
            setSolutionText(mockSol?.text || '');
            setMySolutionFiles([]);
        }
    };

    const loadSolutions = async () => {
        if (!courseId || !taskId || userRole !== 'TEACHER') return;
        
        try {
            const response = await solutionsService.listSolutions(courseId, taskId);
            setSolutions(response.content);
        } catch (err: any) {
            console.error('Failed to load solutions, using mock data:', err);
            const mockSols = mockSolutions[taskId] || [];
            setSolutions(mockSols);
        }
    };

    const handleSubmitSolution = async () => {
        if (!courseId || !taskId) return;
        
        if (!solutionText.trim() && selectedFiles.length === 0) {
            alert('Добавьте текст решения или прикрепите файлы');
            return;
        }

        try {
            const newSolution = await solutionsService.createSolution(courseId, taskId, {
                text: solutionText,
            });

            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    try {
                        await solutionsService.uploadSolutionFile(courseId, taskId, newSolution.id, file);
                    } catch (err) {
                        console.error('Failed to upload file:', err);
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
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
            mySolution,
            mySolutionFiles,
            showSubmitForm,
            solutionText,
            selectedFiles,
            loading,
            error,
            showGradeModal,
            selectedSolution,
            gradeValue,
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
            handleFileSelect,
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
        }
    };
};
