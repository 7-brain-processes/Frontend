import {
  createPublicCommentFunc,
  deleteCommentsFunc,
  editPublicCommentFunc,
  getPublicCommentsFunc,
} from '../pages/PublicComments/hooks/usePublicCommentsDialog';
import { postsService } from '../api/posts';
import { PageCommentDto } from '../types';

jest.mock('../api/posts', () => ({
  postsService: {
    createPostComment: jest.fn(),
    listPostComments: jest.fn(),
    deletePostComment: jest.fn(),
    updatePostComment: jest.fn(),
  },
}));

describe('Тестирование комментариев', () => {
  const mockedPostsService = postsService as jest.Mocked<typeof postsService>;
  const buildCommentsResponse = (text: string): PageCommentDto => ({
    content: [
      {
        id: '1',
        text,
        author: {
          id: '1',
          username: 'username',
          displayName: 'displayName',
          createdAt: '2026-01-01T00:00:00Z',
        },
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (window.alert as jest.Mock).mockReset();
  });

  test('Не прошла валидация создания комментария', async () => {
    const validateMock = jest.fn(() => false);

    const result = await createPublicCommentFunc(
      'courseId',
      'postId',
      jest.fn(),
      validateMock,
      { text: '' },
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.createPostComment).not.toHaveBeenCalled();
  });

  test('Успешное создание комментария', async () => {
    const validateMock = jest.fn(() => true);
    const setPublicCommentsMock = jest.fn();
    const setCreateCommentFormMock = jest.fn();
    const commentsResponse = buildCommentsResponse('комментарий');

    mockedPostsService.createPostComment.mockResolvedValue({
      id: '1',
      text: 'test',
      author: {
        id: '1',
        username: 'username',
        displayName: 'displayName',
        createdAt: '2026-01-01T00:00:00Z',
      },
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
    mockedPostsService.listPostComments.mockResolvedValue(commentsResponse);

    const result = await createPublicCommentFunc(
      'courseId',
      'postId',
      setPublicCommentsMock,
      validateMock,
      { text: 'test' },
      setCreateCommentFormMock
    );

    expect(result).toBe(true);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.createPostComment).toHaveBeenCalledWith('courseId', 'postId', {
      text: 'test',
    });
    expect(mockedPostsService.listPostComments).toHaveBeenCalledWith('courseId', 'postId', undefined);
    expect(setPublicCommentsMock).toHaveBeenCalledWith(commentsResponse.content);
    expect(setCreateCommentFormMock).toHaveBeenCalledWith({ text: '' });
  });

  test('Ошибка при создании комментария', async () => {
    const validateMock = jest.fn(() => true);
    mockedPostsService.createPostComment.mockRejectedValue(new Error('Ошибка сервиса'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createPublicCommentFunc(
      'courseId',
      'postId',
      jest.fn(),
      validateMock,
      { text: 'test' },
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.createPostComment).toHaveBeenCalledWith('courseId', 'postId', {
      text: 'test',
    });
    expect(window.alert).toHaveBeenCalledWith('Ошибка: Ошибка сервиса');
  });

  test('Успешное получение всех комментариев', async () => {
    const setPublicCommentsMock = jest.fn();
    const result = buildCommentsResponse('комментарий');
    mockedPostsService.listPostComments.mockResolvedValue(result);

    await getPublicCommentsFunc('courseId', 'postId', setPublicCommentsMock);

    expect(mockedPostsService.listPostComments).toHaveBeenCalledWith('courseId', 'postId', undefined);
    expect(setPublicCommentsMock).toHaveBeenCalledWith(result.content);
  });

  test('Ошибка при получении всех комментариев', async () => {
    const setPublicCommentsMock = jest.fn();
    mockedPostsService.listPostComments.mockRejectedValue(new Error('Ошибка сервиса'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await getPublicCommentsFunc('courseId', 'postId', setPublicCommentsMock);

    expect(mockedPostsService.listPostComments).toHaveBeenCalledWith('courseId', 'postId', undefined);
    expect(window.alert).toHaveBeenCalledWith('Ошибка: Ошибка сервиса');
    expect(setPublicCommentsMock).not.toHaveBeenCalled();
  });

  test('Успешное удаление комментария', async () => {
    const setPublicCommentsMock = jest.fn();
    const commentsResponse = buildCommentsResponse('комментарий');
    mockedPostsService.listPostComments.mockResolvedValue(commentsResponse);

    await deleteCommentsFunc('courseId', 'postId', 'commentId', setPublicCommentsMock);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedPostsService.deletePostComment).toHaveBeenCalledWith('courseId', 'postId', 'commentId');
    expect(mockedPostsService.listPostComments).toHaveBeenCalledWith('courseId', 'postId', undefined);
    expect(setPublicCommentsMock).toHaveBeenCalledWith(commentsResponse.content);
  });

  test('Ошибка при удалении комментария', async () => {
    mockedPostsService.deletePostComment.mockRejectedValue(new Error('Ошибка сервиса'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await deleteCommentsFunc('courseId', 'postId', 'commentId', jest.fn());

    expect(mockedPostsService.deletePostComment).toHaveBeenCalledWith('courseId', 'postId', 'commentId');
    expect(window.alert).toHaveBeenCalledWith('Ошибка: Ошибка сервиса');
    expect(mockedPostsService.listPostComments).not.toHaveBeenCalled();
  });

  test('Не прошла валидация редактирования комментария', async () => {
    const validateMock = jest.fn(() => false);

    const result = await editPublicCommentFunc(
      'courseId',
      'postId',
      'commentId',
      jest.fn(),
      validateMock,
      { text: '' },
      jest.fn(),
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.updatePostComment).not.toHaveBeenCalled();
  });

  test('Успешное редактирование комментария', async () => {
    const validateMock = jest.fn(() => true);
    const setPublicCommentsMock = jest.fn();
    const setEditCommentFormMock = jest.fn();
    const setIsEditCommentMock = jest.fn();
    const commentsResponse = buildCommentsResponse('обновленный комментарий');

    mockedPostsService.updatePostComment.mockResolvedValue({
      id: '1',
      text: 'обновленный комментарий',
      author: {
        id: '1',
        username: 'username',
        displayName: 'displayName',
        createdAt: '2026-01-01T00:00:00Z',
      },
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
    mockedPostsService.listPostComments.mockResolvedValue(commentsResponse);

    const result = await editPublicCommentFunc(
      'courseId',
      'postId',
      'commentId',
      setPublicCommentsMock,
      validateMock,
      { text: 'test' },
      setEditCommentFormMock,
      setIsEditCommentMock
    );

    expect(result).toBe(true);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.updatePostComment).toHaveBeenCalledWith(
      'courseId',
      'postId',
      'commentId',
      { text: 'test' }
    );
    expect(mockedPostsService.listPostComments).toHaveBeenCalledWith('courseId', 'postId', undefined);
    expect(setPublicCommentsMock).toHaveBeenCalledWith(commentsResponse.content);
    expect(setEditCommentFormMock).toHaveBeenCalledWith({ text: '' });
    expect(setIsEditCommentMock).toHaveBeenCalledWith(false);
  });

  test('Ошибка при редактировании комментария', async () => {
    const validateMock = jest.fn(() => true);
    mockedPostsService.updatePostComment.mockRejectedValue(new Error('Ошибка сервиса'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await editPublicCommentFunc(
      'courseId',
      'postId',
      'commentId',
      jest.fn(),
      validateMock,
      { text: 'test' },
      jest.fn(),
      jest.fn()
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(mockedPostsService.updatePostComment).toHaveBeenCalledWith(
      'courseId',
      'postId',
      'commentId',
      { text: 'test' }
    );
    expect(window.alert).toHaveBeenCalledWith('Ошибка: Ошибка сервиса');
    expect(mockedPostsService.listPostComments).not.toHaveBeenCalled();
  });
});
