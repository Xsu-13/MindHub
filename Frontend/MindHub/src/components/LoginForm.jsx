import { useState } from 'react';
import '../styles/LoginFormStyle.css';
import { LoginUser, SignUpUser } from '../services/urls.js';

function LoginForm({ showLogin, showSignUp }) {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [signupError, setSignupError] = useState('');

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const status = await LoginUser(loginEmail, loginPassword);
        console.log(status);
        if (status) {
            location.reload();

        } else {
            setLoginError('Invalid email or password');
        }
    };

    const handleSignUpSubmit = async (event) => {
        event.preventDefault();
        const status = await SignUpUser(signupUsername, signupEmail, signupPassword);
        if (status) {
            setSignupError('');
        } else {
            setSignupError('Invalid email or password');
        }
    };

    return (
        <>
            <div className={`login-container ${showLogin ? 'show' : ''}`}>
                <form id="loginForm" onSubmit={handleLoginSubmit}>
                    <h2>Login</h2>
                    <div className="input-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            type="text"
                            id="login-email"
                            name="login-email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            name="login-password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                    <p id="login-errorMessage">{loginError}</p>
                </form>
            </div>
            <div className={`login-container ${showSignUp ? 'show' : ''}`}>
                <form id="signupForm" onSubmit={handleSignUpSubmit}>
                    <h2>Sign up</h2>
                    <div className="input-group">
                        <label htmlFor="signup-username">Username</label>
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
                        <label htmlFor="signup-password">Password</label>
                        <input
                            type="password"
                            id="signup-password"
                            name="signup-password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Sign Up</button>
                    <p id="signup-errorMessage">{signupError}</p>
                </form>
            </div>
        </>
    );
}

export default LoginForm;
