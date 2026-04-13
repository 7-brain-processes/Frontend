import { teamGradesService } from "../api/teamGrades";
import { handleCaptainGradeDistributionFunc, handleTeamGradeSolutionFunc, loadCaptainDistributionFunc, loadDistributionFunc, loadTeamGradeFunc } from "../components/course/TeamGrade/hooks/useTeamGrade";
import { TeamGradeDistributionDto, TeamGradeDto } from "../types/TeamGrade";

jest.mock('../api/services', () => ({
    teamGradesService: {
        getGrade: jest.fn(),
        upsertGrade: jest.fn(),
        setDistributionMode: jest.fn(),
        getDistribution: jest.fn()
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
        expect(window.alert).toHaveBeenCalledWith('Ошибка загрузки оценки команды');
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
        expect(mockedTeamGradesService.getDistributionForm).toHaveBeenCalledWith('courseId', 'postId');
        expect(setDistributionMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при загрузке режима распределения оценки команды', async () => {
        const setDistributionMock = jest.fn();
        mockedTeamGradesService.getDistribution.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await loadDistributionFunc('courseId', 'postId', 'teamId', setDistributionMock);

        expect(mockedTeamGradesService.getDistribution).toHaveBeenCalled();
        expect(mockedTeamGradesService.getDistributionForm).toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Ошибка загрузки режима распределения оценки команды');
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
        const handleDistributionModeFuncMock = jest.fn();

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

        mockedTeamGradesService.upsertGrade.mockResolvedValue(mockResponse);

        const result = await handleTeamGradeSolutionFunc('courseId', 'postId', 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock);

        expect(mockedTeamGradesService.upsertGrade).toHaveBeenCalled();
        expect(handleDistributionModeFuncMock).toHaveBeenCalledWith('courseId', 'postId', 'teamId', { distributionMode: 'MANUAL' });
        expect(setSelectedTeamMock).toHaveBeenCalledWith(null);
        expect(setShowTeamGradeModalMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const handleDistributionModeFuncMock = jest.fn();

        mockedTeamGradesService.upsertGrade.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        const result = await handleTeamGradeSolutionFunc('courseId', 'postId', 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock);

        expect(mockedTeamGradesService.upsertGrade).toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
        expect(handleDistributionModeFuncMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Ошибка выставления оценки команде');
    });

    test('Не найден id курса при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const handleDistributionModeFuncMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc(undefined, 'postId', 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(handleDistributionModeFuncMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
    });

    test('Не найден id поста при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const handleDistributionModeFuncMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc('courseId', undefined, 'teamId', { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(handleDistributionModeFuncMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
    });

    test('Не найден id команды при выставлении оценки команде', async () => {
        const setShowTeamGradeModalMock = jest.fn();
        const setSelectedTeamMock = jest.fn();
        const handleDistributionModeFuncMock = jest.fn();
        const result = await handleTeamGradeSolutionFunc('courseId', 'postId', undefined, { distributionMode: 'MANUAL' }, setShowTeamGradeModalMock, 10, setSelectedTeamMock);

        expect(result).toBe(false);
        expect(mockedTeamGradesService.upsertGrade).not.toHaveBeenCalled();
        expect(handleDistributionModeFuncMock).not.toHaveBeenCalled();
        expect(setShowTeamGradeModalMock).not.toHaveBeenCalled();
        expect(setSelectedTeamMock).not.toHaveBeenCalled();
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
        expect(window.alert).toHaveBeenCalledWith('Ошибка загрузки распределения оценки капитаном');
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
        expect(setDistributionMock).toHaveBeenCalledWith(null);
    });

    test('Ошибка при распределении оценки капитаном', async () => {
        const setDistributionMock = jest.fn();

        mockedTeamGradesService.saveDistribution.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await handleCaptainGradeDistributionFunc('courseId', 'postId', { grades: [] }, setDistributionMock);

        expect(mockedTeamGradesService.saveDistribution).toHaveBeenCalled();
        expect(setDistributionMock).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Ошибка распределения оценки капитаном');
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
