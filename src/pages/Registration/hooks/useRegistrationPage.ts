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
    const [errors, setErrors] = useState<Partial<Record<keyof Registration, string>>>({});

    const validateRegistrationForm = (): boolean => {
        const e: typeof errors = {};

        if (!registrationForm?.username) {
            e.username = 'Поле обязательно.';
        }
        else if (registrationForm?.username.length < 3 || registrationForm?.username.length > 50) {
            e.username = 'Неправильная валидация.';
        }

        if (!registrationForm?.password) {
            e.password = 'Поле обязательно.';
        }
        else if (registrationForm?.password.length < 6 || registrationForm?.password.length > 128) {
            e.password = 'Неправильная валидация.';
        }

        if (!registrationForm?.displayName) {
            e.displayName = 'Поле обязательно.';
        }
        else if (registrationForm.displayName.length > 100) {
            e.displayName = 'Неправильная валидация.';
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
            console.error('Registration failed, using offline mode:', error.message);
            localStorage.setItem('token', 'offline-mock-token');
            alert('Работа в режиме без подключения к серверу');
            navigate('/main');
        }
    };

    return {
        state: { registrationForm, errors },
        functions: {
            registration,
            handleChange
        }
    }
}