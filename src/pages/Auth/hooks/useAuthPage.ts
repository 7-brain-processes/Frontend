import { useState } from "react"
import { Auth } from "../../../types/Auth"
import { login as loginApi } from "../../../api/auth/login";
import { useNavigate } from "react-router-dom";

export const useAuthPage = () => {
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

    return {
        state: { authForm, errors },
        functions: {
            handleChange,
            login,
            navigateToRegistration
        }
    }
}