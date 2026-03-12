jest.mock('../api/services', () => ({
  coursesService: {
    createCourse: jest.fn(),
    listMyCourses: jest.fn(),
    deleteCourse: jest.fn(),
    updateCourse: jest.fn(),
    getCourse: jest.fn(),
    leaveCourse: jest.fn(),
  },
  joinCourse: jest.fn(),
  membersService: {
    listMembers: jest.fn(),
  },
}));

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
  }),
  { virtual: true }
);

import {
  handleLeaveCourseFunc,
  loadMembersFunc,
} from '../components/course/PeopleTab';
import {
  confirmDeleteCourseFunc,
  handleSaveEditFunc,
  loadCourseFunc,
} from '../pages/CourseDetail/hooks/useCourseDetailPage';
import {
  createNewCourseFunc,
  joinToCourseFunc,
  loadCoursesFunc,
} from '../pages/Main/hooks/useMainPage';
import { coursesService, joinCourse, membersService } from '../api/services';

describe('Тестирование курсов', () => {
  const mockedCoursesService = coursesService as jest.Mocked<typeof coursesService>;
  const joinCourseMock = joinCourse as jest.MockedFunction<typeof joinCourse>;
  const mockedMembersService = membersService as jest.Mocked<typeof membersService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (window.alert as jest.Mock).mockReset();
    (window.confirm as jest.Mock).mockReset();
  });

  test('Не прошла валидация создания курса', async () => {
    const validateMock = jest.fn(() => false);
    const setIsOpenNewCourseMock = jest.fn();

    const result = await createNewCourseFunc(
      validateMock,
      { name: '', description: '' },
      setIsOpenNewCourseMock,
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedCoursesService.createCourse).not.toHaveBeenCalled();
    expect(setIsOpenNewCourseMock).not.toHaveBeenCalled();
  });

  test('Успешное создание курса', async () => {
    const validateMock = jest.fn(() => true);
    const setIsOpenNewCourseMock = jest.fn();
    const setLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    const setCoursesMock = jest.fn();

    mockedCoursesService.createCourse.mockResolvedValue({
      id: '1',
      name: 'name',
      description: 'description',
      createdAt: '2026-01-01T00:00:00Z',
      currentUserRole: 'TEACHER',
      teacherCount: 1,
      studentCount: 0,
    });
    mockedCoursesService.listMyCourses.mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    const result = await createNewCourseFunc(
      validateMock,
      { name: 'name', description: 'description' },
      setIsOpenNewCourseMock,
      setLoadingMock,
      setErrorMock,
      setCoursesMock
    );

    expect(validateMock).toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(mockedCoursesService.createCourse).toHaveBeenCalledWith({
      name: 'name',
      description: 'description',
    });
    expect(setIsOpenNewCourseMock).toHaveBeenCalledWith(false);
    expect(mockedCoursesService.listMyCourses).toHaveBeenCalled();
  });

  test('Ошибка при создании курса', async () => {
    const validateMock = jest.fn(() => true);
    mockedCoursesService.createCourse.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await createNewCourseFunc(
      validateMock,
      { name: 'name', description: 'description' },
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(validateMock).toHaveBeenCalled();
    expect(mockedCoursesService.createCourse).toHaveBeenCalled();
    expect(mockedCoursesService.listMyCourses).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  test('Не прошла валидация присоединения к курсу', async () => {
    const validateMock = jest.fn(() => false);

    const result = await joinToCourseFunc(
      validateMock,
      { code: '' },
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(joinCourseMock).not.toHaveBeenCalled();
  });

  test('Успешное присоединение к курсу', async () => {
    const validateMock = jest.fn(() => true);
    const setIsOpenJoinCourseMock = jest.fn();
    mockedCoursesService.listMyCourses.mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    const result = await joinToCourseFunc(
      validateMock,
      { code: 'code' },
      setIsOpenJoinCourseMock,
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(validateMock).toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(joinCourseMock).toHaveBeenCalledWith('code');
    expect(setIsOpenJoinCourseMock).toHaveBeenCalledWith(false);
    expect(mockedCoursesService.listMyCourses).toHaveBeenCalled();
  });

  test('Ошибка при присоединении к курсу', async () => {
    const validateMock = jest.fn(() => true);
    joinCourseMock.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await joinToCourseFunc(
      validateMock,
      { code: 'code' },
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn()
    );

    expect(validateMock).toHaveBeenCalled();
    expect(joinCourseMock).toHaveBeenCalledWith('code');
    expect(mockedCoursesService.listMyCourses).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  test('Успешная загрузка курсов', async () => {
    const setLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    const setCoursesMock = jest.fn();
    const mockResponse = {
      content: [
        {
          id: '1',
          name: 'name',
          description: 'description',
          createdAt: '2026-01-01T00:00:00Z',
          currentUserRole: 'TEACHER' as const,
          teacherCount: 1,
          studentCount: 0,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    };
    mockedCoursesService.listMyCourses.mockResolvedValue(mockResponse);

    await loadCoursesFunc(setLoadingMock, setErrorMock, setCoursesMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setErrorMock).toHaveBeenCalledWith(null);
    expect(mockedCoursesService.listMyCourses).toHaveBeenCalled();
    expect(setCoursesMock).toHaveBeenCalledWith(mockResponse.content);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Ошибка при загрузке курсов', async () => {
    const setLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    const setCoursesMock = jest.fn();
    mockedCoursesService.listMyCourses.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loadCoursesFunc(setLoadingMock, setErrorMock, setCoursesMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setErrorMock).toHaveBeenCalledWith(null);
    expect(mockedCoursesService.listMyCourses).toHaveBeenCalled();
    expect(setCoursesMock).toHaveBeenCalledWith([]);
    expect(setErrorMock).toHaveBeenCalledWith('Ошибка сервера');
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Не найден id курса для удаления', async () => {
    const navigateMock = jest.fn();

    const result = await confirmDeleteCourseFunc(undefined, navigateMock);

    expect(result).toBe(false);
    expect(mockedCoursesService.deleteCourse).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('Успешное удаление курса', async () => {
    const navigateMock = jest.fn();

    await confirmDeleteCourseFunc('1', navigateMock);

    expect(mockedCoursesService.deleteCourse).toHaveBeenCalledWith('1');
    expect(navigateMock).toHaveBeenCalledWith('/main');
  });

  test('Ошибка при удалении курса', async () => {
    const navigateMock = jest.fn();
    mockedCoursesService.deleteCourse.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await confirmDeleteCourseFunc('1', navigateMock);

    expect(mockedCoursesService.deleteCourse).toHaveBeenCalledWith('1');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  test('Не найден id курса для редактирования', async () => {
    const setCourseMock = jest.fn();
    const setShowEditCourseMock = jest.fn();

    const result = await handleSaveEditFunc(
      undefined,
      'newName',
      'newDescription',
      setCourseMock,
      setShowEditCourseMock
    );

    expect(result).toBe(false);
    expect(mockedCoursesService.updateCourse).not.toHaveBeenCalled();
    expect(setCourseMock).not.toHaveBeenCalled();
    expect(setShowEditCourseMock).not.toHaveBeenCalled();
  });

  test('Успешное редактирование курса', async () => {
    const updatedCourseMock = {
      id: '1',
      name: 'newName',
      description: 'newDescription',
      createdAt: '2026-01-01T00:00:00Z',
      currentUserRole: 'TEACHER' as const,
      teacherCount: 1,
      studentCount: 0,
    };
    const setCourseMock = jest.fn();
    const setShowEditCourseMock = jest.fn();
    mockedCoursesService.updateCourse.mockResolvedValue(updatedCourseMock);

    await handleSaveEditFunc(
      '1',
      'newName',
      'newDescription',
      setCourseMock,
      setShowEditCourseMock
    );

    expect(mockedCoursesService.updateCourse).toHaveBeenCalledWith('1', {
      name: 'newName',
      description: 'newDescription',
    });
    expect(setCourseMock).toHaveBeenCalledWith(updatedCourseMock);
    expect(setShowEditCourseMock).toHaveBeenCalledWith(false);
  });

  test('Ошибка при редактировании курса', async () => {
    mockedCoursesService.updateCourse.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await handleSaveEditFunc('1', 'newName', 'newDescription', jest.fn(), jest.fn());

    expect(mockedCoursesService.updateCourse).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  test('Не найден id курса для загрузки', async () => {
    const result = await loadCourseFunc(undefined, jest.fn(), jest.fn(), jest.fn());

    expect(result).toBe(false);
    expect(mockedCoursesService.getCourse).not.toHaveBeenCalled();
  });

  test('Успешная загрузка курса', async () => {
    const setLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    const setCourseMock = jest.fn();
    const mockCourse = {
      id: '1',
      name: 'name',
      description: 'description',
      createdAt: '2026-01-01T00:00:00Z',
      currentUserRole: 'TEACHER' as const,
      teacherCount: 1,
      studentCount: 0,
    };
    mockedCoursesService.getCourse.mockResolvedValue(mockCourse);

    await loadCourseFunc('1', setLoadingMock, setErrorMock, setCourseMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setErrorMock).toHaveBeenCalledWith(null);
    expect(mockedCoursesService.getCourse).toHaveBeenCalledWith('1');
    expect(setCourseMock).toHaveBeenCalledWith(mockCourse);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Ошибка при загрузке курса', async () => {
    const setLoadingMock = jest.fn();
    const setErrorMock = jest.fn();
    const setCourseMock = jest.fn();
    mockedCoursesService.getCourse.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loadCourseFunc('1', setLoadingMock, setErrorMock, setCourseMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(setErrorMock).toHaveBeenCalledWith(null);
    expect(mockedCoursesService.getCourse).toHaveBeenCalledWith('1');
    expect(setCourseMock).toHaveBeenCalledWith(null);
    expect(setErrorMock).toHaveBeenCalledWith('Ошибка сервера');
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Успешная загрузка пользователей курса', async () => {
    const setLoadingMock = jest.fn();
    const setMembersMock = jest.fn();
    const mockMembers = {
      content: [
        {
          user: {
            id: '1',
            username: 'username',
            displayName: 'displayName',
            createdAt: '2026-01-01T00:00:00Z',
          },
          role: 'TEACHER' as const,
          joinedAt: '2026-01-01T00:00:00Z',
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    };
    mockedMembersService.listMembers.mockResolvedValue(mockMembers);

    await loadMembersFunc(setLoadingMock, '1', setMembersMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(mockedMembersService.listMembers).toHaveBeenCalledWith('1');
    expect(setMembersMock).toHaveBeenCalledWith(mockMembers.content);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Ошибка при загрузке пользователей курса', async () => {
    const setLoadingMock = jest.fn();
    const setMembersMock = jest.fn();
    mockedMembersService.listMembers.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loadMembersFunc(setLoadingMock, '1', setMembersMock);

    expect(setLoadingMock).toHaveBeenCalledWith(true);
    expect(mockedMembersService.listMembers).toHaveBeenCalledWith('1');
    expect(setMembersMock).toHaveBeenCalledWith([]);
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  test('Успешное покидание курса', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    });
    (window.confirm as jest.Mock).mockReturnValue(true);

    await handleLeaveCourseFunc('1');

    expect(mockedCoursesService.leaveCourse).toHaveBeenCalledWith('1');
    expect(window.location.href).toBe('/main');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  test('Отмена покидания курса', async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    await handleLeaveCourseFunc('1');

    expect(mockedCoursesService.leaveCourse).not.toHaveBeenCalled();
  });

  test('Ошибка при покидании курса', async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    mockedCoursesService.leaveCourse.mockRejectedValue(new Error('Что-то пошло не так'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await handleLeaveCourseFunc('1');

    expect(mockedCoursesService.leaveCourse).toHaveBeenCalledWith('1');
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
