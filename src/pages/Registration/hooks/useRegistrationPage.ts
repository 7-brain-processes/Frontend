import { useState } from "react";
import { Registration } from "../../../types/Registration";
import { useNavigate } from "react-router-dom";
import { register } from "../../../api/auth/register";

export const registrationFunc = async (
    validateRegistrationForm: () => boolean,
    registrationForm: Registration,
    navigate: (path: string) => void
) => {
    if (!validateRegistrationForm()) return false;

    try {
        const { username, password, displayName } = registrationForm;
        const result = await register({ username, password, displayName });
        if (result) {
            localStorage.setItem('token', result.token);
            navigate('/main');
            return;
        }
    }
    catch (error: any) {
        console.error('Registration failed:', error.message);
        alert(error.message || 'Ошибка регистрации. Проверьте введённые данные.');
    }
};

export const useRegistrationPage = () => {
    const navigate = useNavigate();

    const [registrationForm, setRegistrationForm] = useState<Registration>({
        username: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof Registration, string>>>({});

    const validateRegistrationForm = (): boolean => {
        const e: typeof errors = {};

        if (!registrationForm.username.trim()) {
            e.username = 'Введите имя пользователя.';
        } else if (registrationForm.username.length < 3 || registrationForm.username.length > 50) {
            e.username = 'Имя пользователя должно содержать от 3 до 50 символов.';
        }

        if (!registrationForm.password.trim()) {
            e.password = 'Введите пароль.';
        } else if (registrationForm.password.length < 6 || registrationForm.password.length > 128) {
            e.password = 'Пароль должен содержать от 6 до 128 символов.';
        }

        if (!registrationForm.confirmPassword.trim()) {
            e.confirmPassword = 'Подтвердите пароль.';
        } else if (registrationForm.confirmPassword !== registrationForm.password) {
            e.confirmPassword = 'Пароли не совпадают.';
        }

        if (registrationForm.displayName.length > 100) {
            e.displayName = 'Отображаемое имя не должно превышать 100 символов.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationForm(prev => ({ ...prev, [name]: value }));
    };

    const registration = () => {
        registrationFunc(validateRegistrationForm, registrationForm, navigate);
    };

    return {
        state: { registrationForm, errors },
        functions: {
            registration,
            handleChange
        }
    };
};
