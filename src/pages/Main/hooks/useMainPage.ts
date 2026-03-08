import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateCourse } from "../../../types/CreateCourse";
import { JoinToCourse } from "../../../types/JoinToCourse";
import { coursesService, joinCourse } from "../../../api/services";
import { CourseDto } from "../../../types/api";
import { getAuthToken } from "../../../api/client";
import { mockCourses } from "../../../data/mockData";

export const useMainPage = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [createCourseForm, setCreateCourseForm] = useState<CreateCourse>({
        name: '',
        description: ''
    });
    const [joinToCourseForm, setJoinToCourseForm] = useState<JoinToCourse>({
        code: ''
    });
    const [errorsCreateCourseForm, setErrorsCreateCourseForm] = useState<Partial<Record<keyof CreateCourse, string>>>({});
    const [errorsJoinToCourseForm, setErrorsJoinToCourseForm] = useState<Partial<Record<keyof JoinToCourse, string>>>({});

    const [isOpenNewCourse, setIsOpenNewCourse] = useState<boolean>(false);
    const [isOpenJoinCourse, setIsOpenJoinCourse] = useState<boolean>(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await coursesService.listMyCourses();
            setCourses(response.content);
        } catch (err: any) {
            console.error('Failed to load courses, using mock data:', err);
            setCourses(mockCourses);
            setError('Работа в режиме без подключения к серверу');
        } finally {
            setLoading(false);
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

    const handleCourseClick = (courseId: string) => {
        navigate(`/course/${courseId}`);
    };

    const handleIsOpenNewCourse = (isOpen: boolean) => {
        setIsOpenNewCourse(isOpen);

        setCreateCourseForm({
            name: '',
            description: ''
        });
        setErrorsCreateCourseForm({});
    };

    const handleIsOpenJoinCourse = (isOpen: boolean) => {
        setIsOpenJoinCourse(isOpen);

        setJoinToCourseForm({
            code: ''
        });
        setErrorsJoinToCourseForm({});
    };

    const validateCreateCourseForm = (): boolean => {
        const e: typeof errorsCreateCourseForm = {};

        if (!createCourseForm?.name) {
            e.name = 'Поле обязательно.';
        }
        else if (createCourseForm?.name.length > 200) {
            e.name = 'Неправильная валидация.';
        }

        if (createCourseForm?.description && createCourseForm.description.length > 2000) {
            e.description = 'Неправильная валидация.';
        }

        setErrorsCreateCourseForm(e);
        return Object.keys(e).length === 0;
    };

    const validateJoinToCourseForm = (): boolean => {
        const e: typeof errorsJoinToCourseForm = {};

        if (!joinToCourseForm?.code) {
            e.code = 'Поле обязательно.';
        }

        setErrorsJoinToCourseForm(e);
        return Object.keys(e).length === 0;
    };

    const handleChangeCreateCourse = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateCourseForm(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeJoinCourse = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setJoinToCourseForm(prev => ({ ...prev, [name]: value }));
    };

    const createNewCourse = async () => {
        if (!validateCreateCourseForm()) return false;
        try {
            await coursesService.createCourse(createCourseForm);
            setIsOpenNewCourse(false);
            loadCourses();
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const joinToCourseFunc = async () => {
        if (!validateJoinToCourseForm()) return false;
        try {
            await joinCourse(joinToCourseForm.code);
            setIsOpenJoinCourse(false);
            loadCourses();
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }
    };

    return {
        state: {
            sidebarOpen,
            sidebarCollapsed,
            courses,
            loading,
            error,
            createCourseForm,
            joinToCourseForm,
            errorsCreateCourseForm,
            errorsJoinToCourseForm,
            isOpenNewCourse,
            isOpenJoinCourse
        },
        functions: {
            handleMenuClick,
            handleSidebarClose,
            handleCourseClick,
            handleIsOpenNewCourse,
            handleIsOpenJoinCourse,
            handleChangeCreateCourse,
            handleChangeJoinCourse,
            createNewCourse,
            joinToCourseFunc
        }
    };
};