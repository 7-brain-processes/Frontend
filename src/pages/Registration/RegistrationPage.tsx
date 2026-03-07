import InputForm from "../../components/InputForm";
import SubmitButton from "../../components/SubmitButton";
import { useRegistrationPage } from "./hooks/useRegistrationPage";

const RegistrationPage = () => {
    const { state, functions } = useRegistrationPage();

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
                <h2 style={{ margin: 0, color: '#141C24', textAlign: 'center' }}>Регистрация</h2>
                <InputForm
                    label=""
                    name="username"
                    type="text"
                    value={state.registrationForm?.username || ''}
                    placeholder="Имя пользователя"
                    onChange={functions.handleChange}
                    error={!!state.errors.username}
                    helperText={state.errors.username}
                    width="100%"
                    dataTestId="username-input"
                />
                <InputForm
                    label=""
                    name="password"
                    type="text"
                    value={state.registrationForm?.password || ''}
                    placeholder="Пароль"
                    onChange={functions.handleChange}
                    error={!!state.errors.password}
                    helperText={state.errors.password}
                    width="100%"
                    dataTestId="password-input"
                />
                <InputForm
                    label=""
                    name="displayName"
                    type="text"
                    value={state.registrationForm?.displayName || ''}
                    placeholder="Отображаемое имя"
                    onChange={functions.handleChange}
                    error={!!state.errors.displayName}
                    helperText={state.errors.displayName}
                    width="100%"
                    dataTestId="displayName-input"
                />
                <div style={{ padding: '16px 0 0', display: 'flex' }}>
                    <SubmitButton id="register-button" text='Зарегистрироваться' colorScheme="primary" width="100%" onClick={functions.registration} />
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;