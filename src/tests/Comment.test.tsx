import { createPublicCommentFunc, getPublicCommentsFunc } from "../pages/PublicComments/hooks/usePublicCommentsDialog";

describe('Тестирование комментариев', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Не прошла валидация', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setPublicCommentsMock = jest.fn();
        const setCreateCommentFormMock = jest.fn();
        const createPostCommentMock = jest.fn();

        //Act
        const result = await createPublicCommentFunc(
            'courseId',
            'postId',
            setPublicCommentsMock,
            validateMock,
            {
                text: ''
            },
            setCreateCommentFormMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(createPostCommentMock).not.toHaveBeenCalled();
        expect(getPublicCommentsFunc).not.toHaveBeenCalled();
        expect(setCreateCommentFormMock).not.toHaveBeenCalled();
    });

    test('Успешное содзание комментария', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setPublicCommentsMock = jest.fn();
        const setCreateCommentFormMock = jest.fn();
        const createPostCommentMock = jest.fn();

        //Act
        const result = await createPublicCommentFunc(
            'courseId',
            'postId',
            setPublicCommentsMock,
            validateMock,
            {
                text: 'test'
            },
            setCreateCommentFormMock
        );

        //Assert
        expect(result).toBe(true);
        expect(validateMock).toHaveBeenCalled();
        expect(createPostCommentMock).toHaveBeenCalledWith('courseId', 'postId', { text: 'test' });
        expect(getPublicCommentsFunc).toHaveBeenCalledWith('courseId', 'postId', expect.any(Function));
        expect(setCreateCommentFormMock).toHaveBeenCalledWith({ text: '' });
    });

    test('Ошибка при создании комментария', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setPublicCommentsMock = jest.fn();
        const setCreateCommentFormMock = jest.fn();
        const createPostCommentMock = jest.fn();
        const errorMessage = 'Ошибка сервиса';
        createPostCommentMock.mockRejectedValue(new Error(errorMessage));
        global.alert = jest.fn();

        //Act
        const result = await createPublicCommentFunc(
            'courseId',
            'postId',
            setPublicCommentsMock,
            validateMock,
            {
                text: 'test'
            },
            setCreateCommentFormMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(createPostCommentMock).toHaveBeenCalledWith('courseId', 'postId', { text: 'test' });
        expect(global.alert).toHaveBeenCalledWith(`Ошибка: ${errorMessage}`);
        expect(getPublicCommentsFunc).not.toHaveBeenCalled();
        expect(setCreateCommentFormMock).not.toHaveBeenCalled();
    });

    test('Успешное получение всех комментариев', async () => {
        //Arrange
        const setPublicCommentsMock = jest.fn();
        const listPostCommentsMock = jest.fn();
        const result = { content: [{ id: 1, text: 'комментарий' }] };
        listPostCommentsMock.mockResolvedValue(result);

        //Act
        await getPublicCommentsFunc(
            'courseId',
            'postId',
            setPublicCommentsMock
        );

        //Assert
        expect(listPostCommentsMock).toHaveBeenCalled();
        expect(setPublicCommentsMock).toHaveBeenCalledWith(result.content);
    });

    test('Ошибка при получении всех комментариев', async () => {
        //Arrange
        const setPublicCommentsMock = jest.fn();
        const listPostCommentsMock = jest.fn();
        const errorMessage = 'Ошибка сервиса';
        listPostCommentsMock.mockRejectedValue(new Error(errorMessage));;
        global.alert = jest.fn();

        //Act
        const result = await getPublicCommentsFunc(
            'courseId',
            'postId',
            setPublicCommentsMock
        );

        //Assert
        expect(listPostCommentsMock).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith(`Ошибка: ${errorMessage}`);
        expect(setPublicCommentsMock).not.toHaveBeenCalled();
        expect(result).toBeUndefined;
    });
});