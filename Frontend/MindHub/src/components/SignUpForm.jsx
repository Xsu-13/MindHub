import { useEffect } from 'react';
import { SignUpUser } from '../services/urls.js';
import '../styles/LoginFormStyle.css'

function SignUpForm() {

    useEffect(() => {
        document.getElementById('loginForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
        
            var status = await SignUpUser(username, email, password);
            if (status) {
                errorMessage.textContent = '';
                
            } else {
                errorMessage.textContent = 'Invalid email or password';
            }
        });
}, []);


  return (
    <>
    <div className="login-container">
        <form id="loginForm">
            <h2>Sign up</h2>
            <div className="input-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required/>
            </div>
            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="text" id="email" name="email" required/>
            </div>
            <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required/>
            </div>
            <button type="submit">Login</button>
            <p id="errorMessage"></p>
        </form>
    </div>
    </>
  )
}

export default SignUpForm