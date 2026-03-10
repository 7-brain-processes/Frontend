import { useState } from "react";
import { Registration } from "../../../types/Registration";
import { useNavigate } from "react-router-dom";
import { register } from "../../../api/auth/register";

export const useRegistrationPage = () => {
    const navigate = useNavigate();

    const [registrationForm, setRegistrationForm] = useState<Registration>({
        username: '',
        password: '',
        displayName: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof Registration | string, string>>>({});
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');

    const validateRegistrationForm = (): boolean => {
        const e: typeof errors = {};

        if (!registrationForm?.username) {
            e.username = 'Поле обязательно.';
        }
        else if (registrationForm?.username.length < 3 || registrationForm?.username.length > 50) {
            e.username = 'Имя пользователя должно содержать от 3 до 50 символов.';
        }

        if (!registrationForm?.password) {
            e.password = 'Поле обязательно.';
        }
        else if (registrationForm?.password.length < 6 || registrationForm?.password.length > 128) {
            e.password = 'Пароль должен содержать от 6 до 128 символов.';
        }

        if (!passwordConfirmation) {
            e.passwordConfirmation = 'Поле обязательно.';
        }
        else if (passwordConfirmation.length < 6 || passwordConfirmation.length > 128) {
            e.passwordConfirmation = 'Пароль должен содержать от 6 до 128 символов.';
        }

        if (!registrationForm?.displayName) {
            e.displayName = 'Поле обязательно.';
        }
        else if (registrationForm.displayName.length > 100) {
            e.displayName = 'Отображаемое имя должно содержать от 1 до 100 символов.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationForm(prev => ({ ...prev, [name]: value }));
    };

    const registration = async () => {
        if (!validateRegistrationForm()) return false;

        try {
            const result = await register(registrationForm);
            if (result) {
                localStorage.setItem('token', result.token);
                navigate('/main');
                return;
            }
        }
        catch (error: any) {
            console.error('Registration failed:', error.message);
            alert(error.message || 'Ошибка регистрации. Проверьте данные.');
        }
    };

    return {
        state: { registrationForm, errors, passwordConfirmation },
        functions: {
            registration,
            handleChange,
            setPasswordConfirmation
        }
    }
}