jest.mock('../api/auth/login', () => ({
  login: jest.fn(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

import { login } from '../api/auth/login';
import { loginFunc } from '../pages/Auth/hooks/useAuthPage';

describe('Тестирование авторизации', () => {
  const loginMock = login as jest.MockedFunction<typeof login>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    (window.alert as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Не прошла валидация', async () => {
    const navigateMock = jest.fn();
    const validateMock = jest.fn(() => false);

    const result = await loginFunc(
      validateMock,
      {
        username: '',
        password: '',
      },
      navigateMock
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(loginMock).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('Успешная авторизация', async () => {
    const navigateMock = jest.fn();
    const validateMock = jest.fn(() => true);
    loginMock.mockResolvedValue({
      token: 'tokenTest',
      user: {
        id: '1',
        username: 'user',
        displayName: 'User',
        createdAt: '2026-01-01T00:00:00Z',
      },
    });

    const result = await loginFunc(
      validateMock,
      {
        username: 'user',
        password: 'password',
      },
      navigateMock
    );

    expect(validateMock).toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalledWith({ username: 'user', password: 'password' });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tokenTest');
    expect(navigateMock).toHaveBeenCalledWith('/main');
    expect(result).toBeUndefined();
  });

  test('Ошибка при авторизации', async () => {
    const navigateMock = jest.fn();
    const validateMock = jest.fn(() => true);
    loginMock.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await loginFunc(
      validateMock,
      {
        username: 'user',
        password: 'password',
      },
      navigateMock
    );

    expect(validateMock).toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalledWith({ username: 'user', password: 'password' });
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
