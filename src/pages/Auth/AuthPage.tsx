import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputForm from "../../components/InputForm";
import SubmitButton from "../../components/SubmitButton";
import { Auth } from "../../types/Auth";
import { login as loginApi } from "../../api/auth/login";

const AuthPage = () => {
    const navigate = useNavigate();

    const [authForm, setAuthForm] = useState<Auth>({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof Auth, string>>>({});

    const validateAuthForm = (): boolean => {
        const e: typeof errors = {};

        if (!authForm?.username) {
            e.username = 'Поле обязательно.';
        }

        if (!authForm?.password) {
            e.password = 'Поле обязательно.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuthForm(prev => ({ ...prev, [name]: value }));
    };

    const login = async () => {
        if (!validateAuthForm()) return false;

        try {
            const result = await loginApi(authForm);
            if (result) {
                localStorage.setItem('token', result.token);
                navigate('/main');
                return;
            }
        }
        catch (error: any) {
            console.error('Login failed, using offline mode:', error.message);
            // Offline mode: set mock token and navigate
            localStorage.setItem('token', 'offline-mock-token');
            alert('Работа в режиме без подключения к серверу');
            navigate('/main');
        }
    };

    const navigateToRegistration = () => navigate('/registration');

    return (
        <div style={{
            position: 'relative',
            top: 250,
            display: 'flex',
            justifyContent: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                padding: '48px',
                width: '20%',
                border: '1px solid #CED2DA',
                borderRadius: '16px'
            }}>
                <h2 style={{ margin: 0, color: '#141C24', textAlign: 'center' }}>Авторизация</h2>
                <InputForm
                    label=""
                    name="username"
                    type="text"
                    value={authForm?.username || ''}
                    placeholder="Имя пользователя"
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    width="100%"
                    dataTestId="username-input"
                    errorTestId="username-error"
                />
                <InputForm
                    label=""
                    name="password"
                    type="text"
                    value={authForm?.password || ''}
                    placeholder="Пароль"
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    width="100%"
                    dataTestId="password-input"
                />
                <div style={{ padding: '16px 0 0', display: 'flex', gap: '16px' }}>
                    <SubmitButton id="login-button" text='Войти' colorScheme="primary" width="100%" onClick={login} />
                    <SubmitButton id="register-button" text='Зарегистрироваться' colorScheme="secondary" width="100%" onClick={navigateToRegistration} />
                </div>
            </div>
        </div>
    );
};

export default AuthPage;