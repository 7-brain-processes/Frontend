import { registrationFunc } from "../pages/Registration/hooks/useRegistrationPage";

describe('Тестирование регистрации', () => {
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
        const registerMock = jest.fn()

        //Act
        const result = await registrationFunc(
            validateMock,
            {
                username: '',
                password: 'test',
                displayName: ''
            },
            navigateMock
        );

        //Assert
        expect(result).toBe(false);
        expect(validateMock).toHaveBeenCalled();
        expect(registerMock).not.toHaveBeenCalled();
        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    test('Успешная регистрация', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const validateMock = jest.fn(() => true);
        const registerMock = jest.fn()
        registerMock.mockResolvedValue({ token: 'tokenTest' });

        //Act
        const result = await registrationFunc(
            validateMock,
            {
                username: 'username',
                password: 'password',
                displayName: 'displayName'
            },
            navigateMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(registerMock).toHaveBeenCalledWith({ username: 'username', password: 'password', displayName: 'displayName' });
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tokenTest');
        expect(navigateMock).toHaveBeenCalledWith('/main');
        expect(result).toBeUndefined();
    });

    test('Ошибка при регистрации', async () => {
        //Arrange
        const navigateMock = jest.fn();
        const validateMock = jest.fn(() => true);
        const registerMock = jest.fn();
        const errorMessage = 'Ошибка сервера';
        registerMock.mockRejectedValue(new Error(errorMessage));

        //Act
        await registrationFunc(
            validateMock,
            {
                username: 'username',
                password: 'password',
                displayName: 'displayName'
            },
            navigateMock
        );

        //Assert
        expect(validateMock).toHaveBeenCalled();
        expect(registerMock).toHaveBeenCalledWith({ username: 'username', password: 'password', displayName: 'displayName' });
        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
    });
});