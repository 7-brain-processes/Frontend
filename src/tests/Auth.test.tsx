import { loginFunc } from "../pages/Auth/hooks/useAuthPage";

describe('Тестирование авторизации', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
            }
        });
    });

    test('Не прошла валидация', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const validateMock = jest.fn(() => false);
        const loginMock = jest.fn()

        //Act
        const result = await loginFunc(
            validateMock,
            {
                username: '',
                password: ''
            },
            navigateMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(loginMock).not.toHaveBeenCalled();
        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test('Успешная авторизация', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const validateMock = jest.fn(() => true);
        const loginMock = jest.fn()
        loginMock.mockResolvedValue({ token: 'tokenTest' });

        //Act
        const result = await loginFunc(
            validateMock,
            {
                username: 'user',
                password: 'password'
            },
            navigateMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(loginMock).toHaveBeenCalledWith({ username: 'user', password: 'password' });
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tokenTest');
        expect(navigateMock).toHaveBeenCalledWith('/main');
        expect(result).toBeUndefined();
    });

    test('Ошибка при авторизации', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const validateMock = jest.fn(() => true);
        const loginMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        loginMock.mockRejectedValue(new Error(errorMessage));

        //Act
        await loginFunc(
            validateMock,
            {
                username: 'user',
                password: 'password'
            },
            navigateMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(loginMock).toHaveBeenCalledWith({ username: 'user', password: 'password' });
        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });
});