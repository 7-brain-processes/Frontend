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

    test('Успешное удаление своего комментарий', async () => {
        //Arrange
        const setPublicCommentsMock = jest.fn();
        const deletePostCommentMock = jest.fn();
        (getPublicCommentsFunc as jest.Mock).mockImplementation(() => { });

        //Act
        /*await deletePublicCommentsFunc(
            'courseId',
            'postId',
            'commentId',
            setPublicCommentsMock
        );*/

        //Assert
        expect(deletePostCommentMock).toHaveBeenCalledWith('courseId', 'postId', 'commentId',);
        expect(getPublicCommentsFunc).toHaveBeenCalledWith('courseId', 'postId', setPublicCommentsMock);
    });

    test('Ошибка при удалении своего комментария', async () => {
        //Arrange
        const setPublicCommentsMock = jest.fn();
        const errorMessage = 'Ошибка сервиса';
        const deletePostCommentMock = jest.fn();
        deletePostCommentMock.mockRejectedValue(new Error(errorMessage));;
        global.alert = jest.fn();
        (getPublicCommentsFunc as jest.Mock).mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        //Act
        /* await deletePublicCommentsFunc(
             'courseId',
             'postId',
             'commentId',
             setPublicCommentsMock
         );*/

        //Assert
        expect(deletePostCommentMock).toHaveBeenCalledWith('courseId', 'postId', 'commentId',);
        expect(global.alert).toHaveBeenCalledWith(`Ошибка: ${errorMessage}`);
        expect(console.error).toHaveBeenCalledWith(errorMessage);
        expect(getPublicCommentsFunc).not.toHaveBeenCalled();
    });

    test('Не прошла валидация', async () => {
        //Arrange
        const validateMock = jest.fn(() => false);
        const setPublicCommentsMock = jest.fn();
        const setEditCommentFormMock = jest.fn();
        const setIsEditCommentMock = jest.fn();
        const updatePostCommentMock = jest.fn();
        (getPublicCommentsFunc as jest.Mock).mockImplementation(() => { });

        //Act
        /*const result = await editPublicCommentFunc(
            'courseId',
            'postId',
            'commentId',
            setPublicCommentsMock,
            validateMock,
            {
                text: ''
            },
            setEditCommentFormMock,
            setIsEditCommentMock
        );*/

        //Assert
        //expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(updatePostCommentMock).not.toHaveBeenCalled();
        expect(getPublicCommentsFunc).not.toHaveBeenCalled();
        expect(setEditCommentFormMock).not.toHaveBeenCalled();
        expect(setIsEditCommentMock).not.toHaveBeenCalled();
    });

    test('Успешное редактирование своего комментария', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setPublicCommentsMock = jest.fn();
        const setEditCommentFormMock = jest.fn();
        const setIsEditCommentMock = jest.fn();
        const updatePostCommentMock = jest.fn();
        (getPublicCommentsFunc as jest.Mock).mockImplementation(() => { });

        //Act
        /*const result = await editPublicCommentFunc(
            'courseId',
            'postId',
            'commentId',
            setPublicCommentsMock,
            validateMock,
            {
                text: 'test'
            },
            setEditCommentFormMock,
            setIsEditCommentMock
        );*/

        //Assert
        // expect(result).toBe(true);
        expect(validateMock).toHaveBeenCalled();
        expect(updatePostCommentMock).toHaveBeenCalledWith('courseId', 'postId', 'commentId', { text: 'test' });
        expect(getPublicCommentsFunc).toHaveBeenCalledWith('courseId', 'postId', 'commentId', setPublicCommentsMock);
        expect(setEditCommentFormMock).toHaveBeenCalledWith({ text: '' });
        expect(setIsEditCommentMock).toHaveBeenCalledWith(false);
    });

    test('Ошибка при редактировании своего комментария', async () => {
        //Arrange
        const validateMock = jest.fn(() => true);
        const setPublicCommentsMock = jest.fn();
        const setEditCommentFormMock = jest.fn();
        const setIsEditCommentMock = jest.fn();
        const updatePostCommentMock = jest.fn();
        const errorMessage = 'Ошибка сервиса';
        updatePostCommentMock.mockRejectedValue(new Error(errorMessage));
        global.alert = jest.fn();
        (getPublicCommentsFunc as jest.Mock).mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        //Act
        /*const result = await editPublicCommentFunc(
            'courseId',
            'postId',
            'commentId',
            setPublicCommentsMock,
            validateMock,
            {
                text: 'test'
            },
            setEditCommentFormMock,
            setIsEditCommentMock
        );*/

        //Assert
        //expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(updatePostCommentMock).toHaveBeenCalledWith('courseId', 'postId', { text: 'test' });
        expect(setEditCommentFormMock).not.toHaveBeenCalled();
        expect(setIsEditCommentMock).not.toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith(`Ошибка: ${errorMessage}`);
        expect(console.error).toHaveBeenCalledWith(errorMessage);
        expect(getPublicCommentsFunc).not.toHaveBeenCalled();
    });
});