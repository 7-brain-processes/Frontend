import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (mode === 'register' && !displayName.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'register') {
        await authService.register({
          username,
          password,
          displayName,
        });
      } else {
        await authService.login({
          username,
          password,
        });
      }

      navigate('/courses');
    } catch (err: any) {
      setError(err.message || 'Ошибка аутентификации');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Google Classroom</h1>
          <p>{mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="displayName">Отображаемое имя *</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Иванов Иван"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Имя пользователя *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <div className="auth-toggle">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button type="button" onClick={toggleMode} disabled={loading}>
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button type="button" onClick={toggleMode} disabled={loading}>
                  Войти
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
