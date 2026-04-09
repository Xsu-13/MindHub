import { useMemo, useState } from 'react';
import '../styles/LoginFormStyle.css';
import { LoginUser, SignUpUser } from '../services/urls.js';

function LoginForm({ showLogin, showSignUp, closeForm, onAuthSuccess }) {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [signupError, setSignupError] = useState('');

    const activeMode = useMemo(() => {
        if (showLogin) return 'login';
        if (showSignUp) return 'signup';
        return null;
    }, [showLogin, showSignUp]);

    const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

    const handleLoginSubmit = async (event) => {
        event.preventDefault();

        if (!validateEmail(loginEmail)) {
            setLoginError('Введите корректный email.');
            return;
        }

        if (loginPassword.trim().length < 6) {
            setLoginError('Пароль должен быть не короче 6 символов.');
            return;
        }

        const result = await LoginUser(loginEmail.trim(), loginPassword);

        if (result?.user && result?.accessToken) {
            setLoginError('');
            onAuthSuccess?.(result.user);
            closeForm?.();
        } else {
            setLoginError(result?.error ?? 'Неверный email или пароль.');
        }
    };

    const handleSignUpSubmit = async (event) => {
        event.preventDefault();

        if (signupUsername.trim().length < 3) {
            setSignupError('Имя пользователя должно быть не короче 3 символов.');
            return;
        }

        if (!validateEmail(signupEmail)) {
            setSignupError('Введите корректный email.');
            return;
        }

        if (signupPassword.trim().length < 6) {
            setSignupError('Пароль должен быть не короче 6 символов.');
            return;
        }

        const status = await SignUpUser(
            signupUsername.trim(),
            signupEmail.trim(),
            signupPassword
        );

        if (status) {
            closeForm?.();
            setSignupError('');
            setLoginError('');
        } else {
            setSignupError('Не удалось завершить регистрацию. Проверьте введенные данные.');
        }
    };

    if (!activeMode) return null;

    return (
        <div className="auth-form-wrapper">
            {activeMode === 'login' && (
                <div className="login-container show">
                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <h2>Вход</h2>
                    <div className="input-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            name="login-email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-password">Пароль</label>
                        <input
                            type="password"
                            id="login-password"
                            name="login-password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Войти</button>
                    <p id="login-errorMessage">{loginError}</p>
                </form>
            </div>
            )}
            {activeMode === 'signup' && (
                <div className="login-container show">
                <form id="signupForm" onSubmit={handleSignUpSubmit}>
                    <h2>Регистрация</h2>
                    <div className="input-group">
                        <label htmlFor="signup-username">Имя пользователя</label>
                        <input
                            type="text"
                            id="signup-username"
                            name="signup-username"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            type="text"
                            id="signup-email"
                            name="signup-email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="signup-password">Пароль</label>
                        <input
                            type="password"
                            id="signup-password"
                            name="signup-password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Зарегистрироваться</button>
                    <p id="signup-errorMessage">{signupError}</p>
                </form>
            </div>
            )}
        </div>
    );
}

export default LoginForm;
