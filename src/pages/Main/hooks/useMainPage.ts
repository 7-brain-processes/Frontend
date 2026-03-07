import { useState } from "react"
import { CreateCourse } from "../../../types/CreateCourse"
import { createCourse } from "../../../api/courses/createCourse";
import { joinCourse } from "../../../api/courses/joinCourse";
import { JoinToCourse } from "../../../types/JoinToCourse";

export const useMainPage = () => {
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

    const validateJoiToCourseForm = (): boolean => {
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
            const result = await createCourse(createCourseForm);
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }

    };

    const joinToCourse = async () => {
        if (!validateJoiToCourseForm()) return false;
        try {
            const result = await joinCourse(joinToCourseForm);
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }

    };

    return {
        state: { createCourseForm, joinToCourseForm, errorsCreateCourseForm, errorsJoinToCourseForm, isOpenNewCourse, isOpenJoinCourse },
        functions: {
            handleIsOpenNewCourse,
            handleIsOpenJoinCourse,
            handleChangeCreateCourse,
            handleChangeJoinCourse,
            createNewCourse,
            joinToCourse
        }
    }
}