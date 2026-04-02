import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesService } from "../../../api/services";
import { CourseDto, UpdateCourseRequest } from "../../../types/api";

export const confirmDeleteCourseFunc = async (id: string | undefined, navigate: (path: string) => void) => {
    if (!id) return false;

    try {
        await coursesService.deleteCourse(id);
        navigate('/main');
    } catch (err: any) {
        alert(err.message || 'Ошибка удаления курса');
        console.error('Failed to delete course:', err);
    }
};

export const handleSaveEditFunc = async (id: string | undefined, editName: string, editDescription: string, setCourse: React.Dispatch<React.SetStateAction<CourseDto | null>>, setShowEditCourse: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!id) return false;

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

export const loadCourseFunc = async (id: string | undefined, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, setCourse: React.Dispatch<React.SetStateAction<CourseDto | null>>) => {
    if (!id) return false;

    try {
        setLoading(true);
        setError(null);
        const data = await coursesService.getCourse(id);
        setCourse(data);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        setCourse(null);
        setError(err.message || 'Ошибка загрузки курса');
    } finally {
        setLoading(false);
    }
};

export const useCourseDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'stream' | 'assignments' | 'people' | 'category'>('stream');
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

    const loadCourse = () => {
        loadCourseFunc(id, setLoading, setError, setCourse);
    };

    const handleEditCourse = () => {
        if (!course) return;
        setEditName(course.name);
        setEditDescription(course.description || '');
        setShowEditCourse(true);
        setShowCourseMenu(false);
    };

    const handleSaveEdit = () => {
        handleSaveEditFunc(id, editName, editDescription, setCourse, setShowEditCourse);
    };

    const handleDeleteCourse = () => {
        setShowCourseMenu(false);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteCourse = () => {
        confirmDeleteCourseFunc(id, navigate);
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