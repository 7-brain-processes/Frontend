jest.mock('../api/auth/register', () => ({
  register: jest.fn(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

import { register } from '../api/auth/register';
import { registrationFunc } from '../pages/Registration/hooks/useRegistrationPage';

describe('Тестирование регистрации', () => {
  const registerMock = register as jest.MockedFunction<typeof register>;

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

    const result = await registrationFunc(
      validateMock,
      {
        username: '',
        password: 'test',
        confirmPassword: 'test',
        displayName: '',
      },
      navigateMock
    );

    expect(result).toBe(false);
    expect(validateMock).toHaveBeenCalled();
    expect(registerMock).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('Успешная регистрация', async () => {
    const navigateMock = jest.fn();
    const validateMock = jest.fn(() => true);
    registerMock.mockResolvedValue({
      token: 'tokenTest',
      user: {
        id: '1',
        username: 'username',
        displayName: 'displayName',
        createdAt: '2026-01-01T00:00:00Z',
      },
    });

    const result = await registrationFunc(
      validateMock,
      {
        username: 'username',
        password: 'password',
        confirmPassword: 'password',
        displayName: 'displayName',
      },
      navigateMock
    );

    expect(validateMock).toHaveBeenCalled();
    expect(registerMock).toHaveBeenCalledWith({
      username: 'username',
      password: 'password',
      displayName: 'displayName',
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tokenTest');
    expect(navigateMock).toHaveBeenCalledWith('/main');
    expect(result).toBeUndefined();
  });

  test('Ошибка при регистрации', async () => {
    const navigateMock = jest.fn();
    const validateMock = jest.fn(() => true);
    registerMock.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await registrationFunc(
      validateMock,
      {
        username: 'username',
        password: 'password',
        confirmPassword: 'password',
        displayName: 'displayName',
      },
      navigateMock
    );

    expect(validateMock).toHaveBeenCalled();
    expect(registerMock).toHaveBeenCalledWith({
      username: 'username',
      password: 'password',
      displayName: 'displayName',
    });
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
