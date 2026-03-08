import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesService } from "../../../api/services";
import { CourseDto, UpdateCourseRequest } from "../../../types/api";
import { mockCourses } from "../../../data/mockData";

export const useCourseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'stream' | 'assignments' | 'people'>('stream');
    const [showCourseMenu, setShowCourseMenu] = useState(false);
    const [showEditCourse, setShowEditCourse] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCourse();
    }, [id]);

    const loadCourse = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await coursesService.getCourse(id);
            setCourse(data);
        } catch (err: any) {
            console.error('Failed to load course, using mock data:', err);
            const mockCourse = mockCourses.find(c => c.id === id);
            if (mockCourse) {
                setCourse(mockCourse);
                setError('Работа в режиме без подключения к серверу');
            } else {
                setError(err.message || 'Ошибка загрузки курса');
            }
        } finally {
            setLoading(false);
        }
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
            activeTab,
            showCourseMenu,
            showEditCourse,
            showDeleteConfirm,
            editName,
            editDescription,
            course,
            loading,
            error,
        },
        functions: {
            setActiveTab,
            setShowCourseMenu,
            setShowEditCourse,
            setShowDeleteConfirm,
            setEditName,
            setEditDescription,
            handleEditCourse,
            handleSaveEdit,
            handleDeleteCourse,
            confirmDeleteCourse,
        }
    };
};