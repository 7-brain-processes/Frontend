import { handleLeaveCourseFunc, loadMembersFunc } from "../components/course/PeopleTab";
import { confirmDeleteCourseFunc, handleSaveEditFunc, loadCourseFunc } from "../pages/CourseDetail/hooks/useCourseDetailPage";
import { createNewCourseFunc, joinToCourseFunc, loadCoursesFunc } from "../pages/Main/hooks/useMainPage";

describe('Тестирование курсов', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Не прошла валидация', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setIsOpenNewCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const createCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();

        //Act 
        const result = await createNewCourseFunc(
            validateMock,
            {
                name: '',
                description: ''
            },
            setIsOpenNewCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(createCourseMock).not.toHaveBeenCalled();
        expect(loadCoursesFuncMock).not.toHaveBeenCalled();
        expect(setIsOpenNewCourseMock).not.toHaveBeenCalled();
    });

    test('Успешное создание курса', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setIsOpenNewCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const createCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();

        //Act 
        const result = await createNewCourseFunc(
            validateMock,
            {
                name: 'name',
                description: 'description'
            },
            setIsOpenNewCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(result).toBeUndefined();
        expect(createCourseMock).toHaveBeenCalledWith({ name: 'name', description: 'description' });
        expect(loadCoursesFuncMock).toHaveBeenCalledWith(setLoadingMock, setErrorMock, setCoursesMock);
        expect(setIsOpenNewCourseMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при создании курса', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setIsOpenNewCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const createCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        createCourseMock.mockRejectedValue(new Error(errorMessage));

        //Act 
        const result = await createNewCourseFunc(
            validateMock,
            {
                name: 'name',
                description: 'description'
            },
            setIsOpenNewCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(createCourseMock).toHaveBeenCalled();
        expect(loadCoursesFuncMock).not.toHaveBeenCalled();
        expect(setIsOpenNewCourseMock).not.toHaveBeenCalled();
    });

    test('Не прошла валидация', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setIsOpenJoinCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const joinCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();

        //Act 
        const result = await joinToCourseFunc(
            validateMock,
            {
                code: ''
            },
            setIsOpenJoinCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(joinCourseMock).not.toHaveBeenCalled();
        expect(loadCoursesFuncMock).not.toHaveBeenCalled();
        expect(setIsOpenJoinCourseMock).not.toHaveBeenCalled();
    });

    test('Успешное присоединение к курсу', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setIsOpenJoinCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const joinCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();

        //Act
        const result = await joinToCourseFunc(
            validateMock,
            {
                code: 'code'
            },
            setIsOpenJoinCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );
        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(result).toBeUndefined();
        expect(joinCourseMock).toHaveBeenCalledWith({ code: 'code' });
        expect(loadCoursesFuncMock).toHaveBeenCalledWith(setLoadingMock, setErrorMock, setCoursesMock);
        expect(setIsOpenJoinCourseMock).toHaveBeenCalledWith(false);

    });

    test('Ошибка при присоединении к курсу', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setIsOpenJoinCourseMock = jest.fn();
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const joinCourseMock = jest.fn();
        const loadCoursesFuncMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        joinCourseMock.mockRejectedValue(new Error(errorMessage));

        //Act
        const result = await joinToCourseFunc(
            validateMock,
            {
                code: 'code'
            },
            setIsOpenJoinCourseMock,
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );
        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(joinCourseMock).toHaveBeenCalled();
        expect(loadCoursesFuncMock).not.toHaveBeenCalled();
        expect(setIsOpenJoinCourseMock).not.toHaveBeenCalled();
    });

    test('Успешная загрузка курсов', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const listMyCoursesMock = jest.fn();
        const mockResponse = { content: [{ id: '1', name: 'name', description: 'description' }] };
        listMyCoursesMock.mockResolvedValue(mockResponse);

        //Act 
        await loadCoursesFunc(
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(setErrorMock).toHaveBeenCalledWith(null);
        expect(listMyCoursesMock).toHaveBeenCalled();
        expect(setCoursesMock).toHaveBeenCalledWith(mockResponse.content);
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при загрузке курсов', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCoursesMock = jest.fn();
        const listMyCoursesMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        listMyCoursesMock.mockRejectedValue(new Error(errorMessage));

        //Act 
        await loadCoursesFunc(
            setLoadingMock,
            setErrorMock,
            setCoursesMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(setErrorMock).toHaveBeenCalledWith(null);
        expect(listMyCoursesMock).toHaveBeenCalled();
        expect(setCoursesMock).toHaveBeenCalledWith([]);
        expect(setErrorMock).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Не найден id курса', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const deleteCourseMock = jest.fn();

        //Act 
        const result = await confirmDeleteCourseFunc(
            undefined,
            navigateMock
        );

        //Assert
        expect(result).toBe(false);
        expect(navigateMock).not.toHaveBeenCalled();
        expect(deleteCourseMock).not.toHaveBeenCalled();
    });

    test('Успешное удалениие курса', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const deleteCourseMock = jest.fn();

        //Act 
        await confirmDeleteCourseFunc(
            '1',
            navigateMock
        );

        //Assert
        expect(deleteCourseMock).toHaveBeenCalledWith({ id: '1' });
        expect(navigateMock).toHaveBeenCalledWith('/main');
    });

    test('Ошибка при удалении курса', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const deleteCourseMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        deleteCourseMock.mockRejectedValue(new Error(errorMessage));

        //Act 
        await confirmDeleteCourseFunc(
            '1',
            navigateMock
        );

        //Assert
        expect(deleteCourseMock).toHaveBeenCalledWith({ id: '1' });
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test('Не найден id курса', async () => {
        //Arrange
        const updateCourseMock = jest.fn();
        const setCourseMock = jest.fn();
        const setShowEditCourseMock = jest.fn();

        //Act 
        const result = await handleSaveEditFunc(
            undefined,
            'newName',
            'newDescription',
            setCourseMock,
            setShowEditCourseMock
        );

        //Assert
        expect(result).toBe(false);
        expect(updateCourseMock).not.toHaveBeenCalled();
        expect(setCourseMock).not.toHaveBeenCalled();
        expect(setShowEditCourseMock).not.toHaveBeenCalled();
    });

    test('Успешное редактирование курса', async () => {
        //Arrange
        const updateCourseMock = jest.fn();
        const setCourseMock = jest.fn();
        const setShowEditCourseMock = jest.fn();
        const updatedCourseMock = { id: '1', name: 'newName', description: 'newDescription' };
        updateCourseMock.mockResolvedValue(updatedCourseMock);

        //Act 
        await handleSaveEditFunc(
            '1',
            'newName',
            'newDescription',
            setCourseMock,
            setShowEditCourseMock
        );

        //Assert
        expect(updateCourseMock).toHaveBeenCalledWith('1', { name: 'newName', description: 'newDescription' });
        expect(setCourseMock).toHaveBeenCalledWith(updatedCourseMock);
        expect(setShowEditCourseMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при редактировании курса', async () => {
        //Arrange
        const updateCourseMock = jest.fn();
        const setCourseMock = jest.fn();
        const setShowEditCourseMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        updateCourseMock.mockRejectedValue(new Error(errorMessage));

        //Act 
        await handleSaveEditFunc(
            '1',
            'newName',
            'newDescription',
            setCourseMock,
            setShowEditCourseMock
        );

        //Assert
        expect(updateCourseMock).toHaveBeenCalled();
        expect(setCourseMock).not.toHaveBeenCalled();
        expect(setShowEditCourseMock).not.toHaveBeenCalled();
    });

    test('Не найден id курса', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCourseMock = jest.fn();
        const getCourseMock = jest.fn();

        //Act 
        const result = await loadCourseFunc(
            undefined,
            setLoadingMock,
            setErrorMock,
            setCourseMock
        );

        //Assert
        expect(result).toBe(false);
        expect(setLoadingMock).not.toHaveBeenCalled();
        expect(setErrorMock).not.toHaveBeenCalled();
        expect(getCourseMock).not.toHaveBeenCalled();
        expect(setCourseMock).not.toHaveBeenCalled();
    });

    test('Успешная загрузка курса', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCourseMock = jest.fn();
        const getCourseMock = jest.fn();
        const mockResponse = { content: { id: '1', name: 'name', description: 'description' } };
        getCourseMock.mockResolvedValue(mockResponse);

        //Act 
        await loadCourseFunc(
            '1',
            setLoadingMock,
            setErrorMock,
            setCourseMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(setErrorMock).toHaveBeenCalledWith(null);
        expect(getCourseMock).toHaveBeenCalledWith('1');
        expect(setCourseMock).toHaveBeenCalledWith(mockResponse.content);
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при загрузке курса', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setErrorMock = jest.fn();
        const setCourseMock = jest.fn();
        const getCourseMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        getCourseMock.mockRejectedValue(new Error(errorMessage));

        //Act 
        await loadCourseFunc(
            '1',
            setLoadingMock,
            setErrorMock,
            setCourseMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(setErrorMock).toHaveBeenCalledWith(null);
        expect(getCourseMock).toHaveBeenCalledWith('1');
        expect(setCourseMock).toHaveBeenCalledWith(null);
        expect(setErrorMock).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Успешная загрузка пользователей курса', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setMembersMock = jest.fn();
        const listMembersMock = jest.fn();
        const mockResponse = { content: { user: { id: '1', username: 'username', displayName: 'displayName', createdAt: 'createdAt' }, role: 'TEACHER', joinedAt: 'joinedAt' } };
        listMembersMock.mockResolvedValue(mockResponse);

        //Act 
        await loadMembersFunc(
            setLoadingMock,
            '1',
            setMembersMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(listMembersMock).toHaveBeenCalledWith('1');
        expect(setMembersMock).toHaveBeenCalledWith(mockResponse.content);
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при загрузке пользователей курса', async () => {
        //Arrange
        const setLoadingMock = jest.fn();
        const setMembersMock = jest.fn();
        const listMembersMock = jest.fn();

        //Act 
        await loadMembersFunc(
            setLoadingMock,
            '1',
            setMembersMock
        );

        //Assert
        expect(setLoadingMock).toHaveBeenCalledWith(true);
        expect(listMembersMock).toHaveBeenCalledWith('1');
        expect(setMembersMock).toHaveBeenCalledWith([]);
        expect(setLoadingMock).toHaveBeenCalledWith(false);
    });

    test('Успешное покидание курса', async () => {
        //Arrange
        const mockConfirm = jest.spyOn(window, 'confirm');
        const mockLocationHref = jest.spyOn(window.location, 'assign').mockImplementation();
        const leaveCourse = jest.fn();

        mockConfirm.mockReturnValue(true);
        leaveCourse.mockResolvedValue('1');

        //Act 
        await handleLeaveCourseFunc('1');

        //Assert
        expect(leaveCourse).toHaveBeenCalledWith('1');
        expect(mockLocationHref).toBe('/courses');
    });

    test('Ошибка при покидании курса', async () => {
        //Arrange
        const mockConfirm = jest.spyOn(window, 'confirm');
        const leaveCourse = jest.fn();
        const error = new Error('Что-то пошло не так');
        leaveCourse.mockRejectedValue(error);
        jest.spyOn(window, 'alert').mockImplementation(() => { });
        mockConfirm.mockReturnValue(true);

        //Act 
        await handleLeaveCourseFunc('1');

        //Assert
        expect(leaveCourse).toHaveBeenCalledWith('1');
        expect(console.error).toHaveBeenCalledWith('Failed to leave course:', error);
        expect(window.alert).toHaveBeenCalledWith(error.message || 'Ошибка выхода из курса');
    });
});
