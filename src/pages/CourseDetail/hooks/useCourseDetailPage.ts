import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesService } from "../../../api/services";
import { CourseDto, UpdateCourseRequest } from "../../../types/api";
import { getAuthToken } from "../../../api/client";

export const useCourseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'stream' | 'assignments' | 'people'>('stream');
    const [showCourseMenu, setShowCourseMenu] = useState(false);
    const [showEditCourse, setShowEditCourse] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [allCourses, setAllCourses] = useState<CourseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }
        loadCourse();
        loadAllCourses();
    }, [id]);

    const loadCourse = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await coursesService.getCourse(id);
            setCourse(data);
        } catch (err: any) {
            setError(err.message || 'Ошибка загрузки курса');
            console.error('Failed to load course:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllCourses = async () => {
        try {
            const response = await coursesService.listMyCourses();
            setAllCourses(response.content);
        } catch (err: any) {
            console.error('Failed to load courses:', err);
        }
    };

    const handleMenuClick = () => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    const handleCourseClick = (clickedCourseId: string) => {
        navigate(`/course/${clickedCourseId}`);
    };

    const handleEditCourse = () => {
        if (!course) return;
        setEditName(course.name);
        setEditDescription(course.description || '');
        setShowEditCourse(true);
        setShowCourseMenu(false);
    };

    const handleSaveEdit = async () => {
        if (!id) return;

        try {
            const updateData: UpdateCourseRequest = {
                name: editName,
                description: editDescription,
            };
            const updatedCourse = await coursesService.updateCourse(id, updateData);
            setCourse(updatedCourse);
            setShowEditCourse(false);
        } catch (err: any) {
            alert(err.message || 'Ошибка обновления курса');
            console.error('Failed to update course:', err);
        }
    };

    const handleDeleteCourse = () => {
        setShowCourseMenu(false);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteCourse = async () => {
        if (!id) return;

        try {
            await coursesService.deleteCourse(id);
            navigate('/main');
        } catch (err: any) {
            alert(err.message || 'Ошибка удаления курса');
            console.error('Failed to delete course:', err);
        }
    };

    return {
        state: {
            id,
            sidebarOpen,
            sidebarCollapsed,
            activeTab,
            showCourseMenu,
            showEditCourse,
            showDeleteConfirm,
            editName,
            editDescription,
            course,
            allCourses,
            loading,
            error,
        },
        functions: {
            setSidebarOpen,
            setSidebarCollapsed,
            setActiveTab,
            setShowCourseMenu,
            setShowEditCourse,
            setShowDeleteConfirm,
            setEditName,
            setEditDescription,
            handleMenuClick,
            handleSidebarClose,
            handleCourseClick,
            handleEditCourse,
            handleSaveEdit,
            handleDeleteCourse,
            confirmDeleteCourse,
        }
    };
};