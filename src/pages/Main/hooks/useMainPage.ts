import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateCourse } from "../../../types/CreateCourse";
import { JoinToCourse } from "../../../types/JoinToCourse";
import { coursesService, joinCourse } from "../../../api/services";
import { CourseDto } from "../../../types/api";
import { getAuthToken } from "../../../api/client";

export const createNewCourseFunc = async (validateCreateCourseForm: () => boolean, createCourseForm: CreateCourse, setIsOpenNewCourse: React.Dispatch<React.SetStateAction<boolean>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, setCourses: React.Dispatch<React.SetStateAction<CourseDto[]>>) => {
    if (!validateCreateCourseForm()) return false;
    try {
        await coursesService.createCourse(createCourseForm);
        setIsOpenNewCourse(false);
        loadCoursesFunc(setLoading, setError, setCourses);
    }
    catch (error: any) {
        console.error(error.message);
        alert(`Ошибка: ${error.message}`);
    }
};

export const joinToCourseFunc = async (validateJoinToCourseForm: () => boolean, joinToCourseForm: JoinToCourse, setIsOpenJoinCourse: React.Dispatch<React.SetStateAction<boolean>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, setCourses: React.Dispatch<React.SetStateAction<CourseDto[]>>) => {
    if (!validateJoinToCourseForm()) return false;
    try {
        await joinCourse(joinToCourseForm.code);
        setIsOpenJoinCourse(false);
        loadCoursesFunc(setLoading, setError, setCourses);
    }
    catch (error: any) {
        console.error(error.message);
        alert(`Ошибка: ${error.message}`);
    }
};

export const loadCoursesFunc = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>, setCourses: React.Dispatch<React.SetStateAction<CourseDto[]>>) => {
    try {
        setLoading(true);
        setError(null);
        const response = await coursesService.listMyCourses();
        setCourses(response.content);
    } catch (err: any) {
        console.error('Failed to load courses:', err);
        setCourses([]);
        setError(err.message || 'Ошибка загрузки курсов');
    } finally {
        setLoading(false);
    }
};

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

    const loadCourses = () => {
        loadCoursesFunc(setLoading, setError, setCourses);
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

    const createNewCourse = () => {
        createNewCourseFunc(validateCreateCourseForm, createCourseForm, setIsOpenNewCourse, setLoading, setError, setCourses);
    };

    const joinToCourse = () => {
        joinToCourseFunc(validateJoinToCourseForm, joinToCourseForm, setIsOpenJoinCourse, setLoading, setError, setCourses);
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
            joinToCourse
        }
    };
};