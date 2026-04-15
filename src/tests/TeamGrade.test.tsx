import { teamGradesService } from "../api/teamGrades";
import { handleCaptainGradeDistributionFunc, handleTeamGradeSolutionFunc, loadCaptainDistributionFunc, loadDistributionFunc, loadTeamGradeFunc } from "../components/course/TeamGrade/hooks/useTeamGrade";
import { TeamGradeDistributionDto, TeamGradeDto } from "../types/TeamGrade";

jest.mock('../api/teamGrades', () => ({
    teamGradesService: {
        getGrade: jest.fn(),
        upsertGrade: jest.fn(),
        setDistributionMode: jest.fn(),
        getDistribution: jest.fn(),
        getDistributionForm: jest.fn(),
        saveDistribution: jest.fn(),
    }
}));

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => jest.fn(),
        useParams: () => ({}),
    }),
    { virtual: true }
);

describe('Тестирование командных оценок', () => {
    const mockedTeamGradesService = teamGradesService as jest.Mocked<typeof teamGradesService>;

    beforeEach(() => {
        jest.clearAllMocks();
        (window.alert as jest.Mock).mockReset();
        (window.confirm as jest.Mock).mockReset();
    });

    test('Успешная загрузка оценки команды', async () => {
        const setGradeMock = jest.fn();
        const mockResponse: TeamGradeDto =
        {
            id: 'id',
            postId: 'postId',
            teamId: 'teamId',
            grade: 10,
            comment: 'string',
            distributionMode: 'MANUAL',
            updatedAt: new Date
        };

        mockedTeamGradesService.getGrade.mockResolvedValue(mockResponse);

        await loadTeamGradeFunc('courseId', 'postId', 'teamId', setGradeMock)

        expect(mockedTeamGradesService.getGrade).toHaveBeenCalledWith('courseId', 'postId', 'teamId');
        expect(setGradeMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при загрузке оценки команды', async () => {
        const setGradeMock = jest.fn();
        mockedTeamGradesService.getGrade.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await loadTeamGradeFunc('courseId', 'postId', 'teamId', setGradeMock)

        expect(mockedTeamGradesService.getGrade).toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при загрузке оценки команды', async () => {
        const setGradeMock = jest.fn();
        const result = await loadTeamGradeFunc(undefined, 'postId', 'teamId', setGradeMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при загрузке оценки команды', async () => {
        const setGradeMock = jest.fn();
        const result = await loadTeamGradeFunc('courseId', undefined, 'teamId', setGradeMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
    });

    test('Не найден id команды при загрузке оценки команды', async () => {
        const setGradeMock = jest.fn();
        const result = await loadTeamGradeFunc('courseId', 'postId', undefined, setGradeMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
    });

    test('Успешная загрузка режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        const mockResponse: TeamGradeDistributionDto =
        {
            teamId: 'teamId',
            teamGrade: 10,
            distributionMode: 'MANUAL',
            students: []
        };

        mockedTeamGradesService.getDistribution.mockResolvedValue(mockResponse);

        await loadDistributionFunc('courseId', 'postId', 'teamId', setDistributionMock);

        expect(mockedTeamGradesService.getDistribution).toHaveBeenCalledWith('courseId', 'postId', 'teamId');
        expect(setDistributionMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при загрузке режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        mockedTeamGradesService.getDistribution.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await loadDistributionFunc('courseId', 'postId', 'teamId', setDistributionMock);

        expect(mockedTeamGradesService.getDistribution).toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при загрузке режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        const result = await loadDistributionFunc(undefined, 'postId', 'teamId', setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getDistribution).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при загрузке режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        const result = await loadDistributionFunc('courseId', undefined, 'teamId', setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getDistribution).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Не найден id команды при загрузке режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        const result = await loadDistributionFunc('courseId', 'postId', undefined, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getDistribution).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Успешное выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();

        const mockResponse: TeamGradeDto =
        {
            id: 'courseId',
            postId: 'postId',
            teamId: 'teamId',
            grade: 10,
            comment: 'string',
            distributionMode: 'MANUAL',
            updatedAt: new Date()
        };
        const distributionResponse: TeamGradeDistributionDto = {
            teamId: 'teamId',
            teamGrade: 10,
            distributionMode: 'MANUAL',
            students: [],
        };

        mockedTeamGradesService.upsertGrade.mockResolvedValue(mockResponse);
        mockedTeamGradesService.getDistribution.mockResolvedValue(distributionResponse);

        await handleTeamGradeSolutionFunc(
            'courseId',
            'postId',
            'teamId',
            { distributionMode: 'MANUAL' },
            setShowTeamGradeModalMock,
            10,
            setSelectedTeamMock,
            setGradeMock,
            setDistributionMock
        );

        expect(mockedTeamGradesService.upsertGrade).toHaveBeenCalled();
        expect(mockedTeamGradesService.setDistributionMode).not.toHaveBeenCalled();
        expect(mockedTeamGradesService.getDistribution).toHaveBeenCalledWith('courseId', 'postId', 'teamId');
        expect(setGradeMock).toHaveBeenCalledWith(mockResponse);
        expect(setDistributionMock).toHaveBeenCalledWith(distributionResponse);
        expect(setSelectedTeamMock).toHaveBeenCalledWith(null);
        expect(setShowTeamGradeModalMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();

        mockedTeamGradesService.upsertGrade.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await handleTeamGradeSolutionFunc(
            'courseId',
            'postId',
            'teamId',
            { distributionMode: 'MANUAL' },
            setShowTeamGradeModalMock,
            10,
            setSelectedTeamMock,
            setGradeMock,
            setDistributionMock
        );

        expect(mockedTeamGradesService.upsertGrade).toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc(undefined, 'postId', 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock, setGradeMock, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc('courseId', undefined, 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock, setGradeMock, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
    });

    test('Не найден id команды при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc('courseId', 'postId', undefined, { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock, setGradeMock, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(setGradeMock).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
    });

    test('После выставления оценки переключает режим на AUTO_EQUAL и обновляет распределение', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const setGradeMock = jest.fn();
        const setDistributionMock = jest.fn();

        const mockGradeResponse: TeamGradeDto = {
            id: 'gradeId',
            postId: 'postId',
            teamId: 'teamId',
            grade: 85,
            comment: 'Хорошая работа',
            distributionMode: 'MANUAL',
            updatedAt: new Date(),
        };
        const mockDistributionResponse: TeamGradeDistributionDto = {
            teamId: 'teamId',
            teamGrade: 85,
            distributionMode: 'AUTO_EQUAL',
            students: [],
        };

        mockedTeamGradesService.upsertGrade.mockResolvedValue(mockGradeResponse);
        mockedTeamGradesService.setDistributionMode.mockResolvedValue(mockDistributionResponse);
        mockedTeamGradesService.getDistribution.mockResolvedValue(mockDistributionResponse);

        await handleTeamGradeSolutionFunc(
            'courseId',
            'postId',
            'teamId',
            { distributionMode: 'AUTO_EQUAL' },
            setShowTeamGradeModalMock,
            85,
            setSelectedTeamMock,
            setGradeMock,
            setDistributionMock,
            'Отлично'
        );

        expect(mockedTeamGradesService.upsertGrade).toHaveBeenCalledWith('courseId', 'postId', 'teamId', {
            grade: 85,
            comment: 'Отлично',
        });
        expect(mockedTeamGradesService.setDistributionMode).toHaveBeenCalledWith('courseId', 'postId', 'teamId', {
            distributionMode: 'AUTO_EQUAL',
        });
        expect(mockedTeamGradesService.getDistribution).toHaveBeenCalledWith('courseId', 'postId', 'teamId');
        expect(setDistributionMock).toHaveBeenCalledWith(mockDistributionResponse);
    });

    test('Успешная загрузка распределения оценки капитаном', async () => {
        const setDistributionMock = jest.fn();
        const mockResponse: TeamGradeDistributionDto =
        {
            teamId: 'teamId',
            teamGrade: 10,
            distributionMode: 'MANUAL',
            students: []
        };

        mockedTeamGradesService.getDistributionForm.mockResolvedValue(mockResponse);

        await loadCaptainDistributionFunc('courseId', 'postId', setDistributionMock);

        expect(mockedTeamGradesService.getDistributionForm).toHaveBeenCalledWith('courseId', 'postId');
        expect(setDistributionMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при загрузке распределения оценки капитаном', async () => {
        const setDistributionMock = jest.fn();
        mockedTeamGradesService.getDistributionForm.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await loadCaptainDistributionFunc('courseId', 'postId', setDistributionMock);

        expect(mockedTeamGradesService.getDistributionForm).toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при загрузке распределения оценки капитаном', async () => {
        const setDistributionMock = jest.fn();
        const result = await loadCaptainDistributionFunc(undefined, 'postId', setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getDistributionForm).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при загрузке распределения оценки капитаном', async () => {
        const setDistributionMock = jest.fn();
        const result = await loadCaptainDistributionFunc('courseId', undefined, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.getDistributionForm).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Успешное распределение оценки капитаном', async () => {
        const setDistributionMock = jest.fn();

        const mockResponse: TeamGradeDistributionDto =
        {
            teamId: 'teamId',
            teamGrade: 100,
            distributionMode: 'MANUAL',
            students: []
        };

        mockedTeamGradesService.saveDistribution.mockResolvedValue(mockResponse);

        const result = await handleCaptainGradeDistributionFunc('courseId', 'postId', { grades: [] }, setDistributionMock);

        expect(mockedTeamGradesService.saveDistribution).toHaveBeenCalled();
        expect(setDistributionMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при распределении оценки капитаном', async () => {
        const setDistributionMock = jest.fn();

        mockedTeamGradesService.saveDistribution.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await handleCaptainGradeDistributionFunc('courseId', 'postId', { grades: [] }, setDistributionMock);

        expect(mockedTeamGradesService.saveDistribution).toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при распределении оценки капитаном', async () => {
        const setDistributionMock = jest.fn();

        const result = await handleCaptainGradeDistributionFunc(undefined, 'postId', { grades: [] }, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.saveDistribution).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при распределении оценки капитаном', async () => {
        const setDistributionMock = jest.fn();

        const result = await handleCaptainGradeDistributionFunc('courseId', undefined, { grades: [] }, setDistributionMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.saveDistribution).not.toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
    });
})
