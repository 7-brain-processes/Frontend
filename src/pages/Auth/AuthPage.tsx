import InputForm from "../../components/InputForm";
import SubmitButton from "../../components/SubmitButton";
import { useAuthPage } from "./hooks/useAuthPage";

const AuthPage = () => {
    const { state, functions } = useAuthPage();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                padding: '48px',
                width: '30%',
                border: '1px solid #CED2DA',
                borderRadius: '16px'
            }}>
                <h2 style={{ margin: 0, color: '#141C24', textAlign: 'center' }}>Авторизация</h2>
                <InputForm
                    label=""
                    name="username"
                    type="text"
                    value={state.authForm?.username || ''}
                    placeholder="Имя пользователя"
                    onChange={functions.handleChange}
                    error={!!state.errors.username}
                    helperText={state.errors.username}
                    width="100%"
                    dataTestId="username-input"
                    errorTestId="username-error"
                />
                <InputForm
                    label=""
                    name="password"
                    type="password"
                    value={state.authForm?.password || ''}
                    placeholder="Пароль"
                    onChange={functions.handleChange}
                    error={!!state.errors.password}
                    helperText={state.errors.password}
                    width="100%"
                    dataTestId="password-input"
                />
                <div style={{ padding: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <SubmitButton id="login-button" text='Войти' colorScheme="primary" width="100%" onClick={functions.login} />
                    <SubmitButton id="register-button" text='Зарегистрироваться' colorScheme="secondary" width="100%" onClick={functions.navigateToRegistration} />
                </div>
            </div>
        </div>
    );
};

export default AuthPage;