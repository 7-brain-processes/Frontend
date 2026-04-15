import { teamRequirementTemplateService } from "../api/teamRequirementTemplate";
import { deleteTeamRequirementTemplateFunc, loadTeamRequirementTemplatesFunc } from "../components/course/TeamRequirementTemplateTab/hooks/useTeamRequirementTemplateTab";

jest.mock('../api/teamRequirementTemplate', () => ({
    teamRequirementTemplateService: {
        listTemplates: jest.fn(),
        archiveTemplate: jest.fn()
    }
}));

describe('Тестирование шаблонов', () => {
    const mockedTeamRequirementTemplateService = teamRequirementTemplateService as jest.Mocked<typeof teamRequirementTemplateService>;

    beforeEach(() => {
        jest.clearAllMocks();
        (window.alert as jest.Mock).mockReset();
        (window.confirm as jest.Mock).mockReset();
    });

    test('Успешная загрузка шаблонов', async () => {
        const setTemplatesMock = jest.fn();
        const mockResponse =
            [
                {
                    id: 'string',
                    name: 'string',
                    description: 'string',
                    minTeamSize: 0,
                    maxTeamSize: 5,
                    requiredCategory: {
                        id: 'string',
                        title: 'string',
                        description: 'string',
                        active: false,
                        createdAt: new Date()
                    },
                    requireAudio: false,
                    requireVideo: false,
                    active: true,
                    createdAt: new Date(),
                    archivedAt: new Date()
                },
            ];

        mockedTeamRequirementTemplateService.listTemplates.mockResolvedValue(mockResponse);

        await loadTeamRequirementTemplatesFunc('courseId', setTemplatesMock);

        expect(mockedTeamRequirementTemplateService.listTemplates).toHaveBeenCalledWith('courseId');
        expect(setTemplatesMock).toHaveBeenCalledWith(mockResponse);
    });

    test('Ошибка при загрузке шаблонов', async () => {
        const setTemplatesMock = jest.fn();
        mockedTeamRequirementTemplateService.listTemplates.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await loadTeamRequirementTemplatesFunc('courseId', setTemplatesMock);

        expect(mockedTeamRequirementTemplateService.listTemplates).toHaveBeenCalled();
        expect(setTemplatesMock).toHaveBeenCalledWith([]);
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при загрузке шаблонов', async () => {
        const setTemplatesMock = jest.fn();
        const result = await loadTeamRequirementTemplatesFunc(undefined, setTemplatesMock);

        expect(result).toBe(false);
        expect(mockedTeamRequirementTemplateService.listTemplates).not.toHaveBeenCalled();
        expect(setTemplatesMock).not.toHaveBeenCalled();
    });

    test('Успешное архивирование шаблона', async () => {
        mockedTeamRequirementTemplateService.archiveTemplate.mockResolvedValue(undefined);

        await deleteTeamRequirementTemplateFunc('courseId', 'templateId');

        expect(mockedTeamRequirementTemplateService.archiveTemplate).toHaveBeenCalledWith('courseId', 'templateId');
    });

    test('Ошибка при архивировании шаблона', async () => {
        mockedTeamRequirementTemplateService.archiveTemplate.mockRejectedValue(new Error('Ошибка сервера'));
        jest.spyOn(console, 'error').mockImplementation(() => { });

        await deleteTeamRequirementTemplateFunc('courseId', 'templateId');

        expect(mockedTeamRequirementTemplateService.archiveTemplate).toHaveBeenCalledWith('courseId', 'templateId');
        expect(window.alert).toHaveBeenCalled();
    });

    test('Не найден id курса при архивировании шаблона', async () => {
        const result = await deleteTeamRequirementTemplateFunc(undefined, 'templateId');

        expect(result).toBe(false);
        expect(mockedTeamRequirementTemplateService.archiveTemplate).not.toHaveBeenCalled();
    });

    test('Не найден id шаблона при архивировании шаблона', async () => {
        const result = await deleteTeamRequirementTemplateFunc('courseId', undefined);

        expect(result).toBe(false);
        expect(mockedTeamRequirementTemplateService.archiveTemplate).not.toHaveBeenCalled();
    });
})
