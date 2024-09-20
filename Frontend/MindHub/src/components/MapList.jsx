import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MapListStyle.css';
import LoginForm from "./LoginForm.jsx"

function MapList() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("user");
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const modalRef = useRef();

    const navigate = useNavigate();

    const handleEmptyMapClick = () => {
        navigate('/map');
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setIsAuthenticated(true);
            setUsername(user.username);
        }

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowLogin(false); 
                setShowSignUp(false);
            }
        };

        const templateCards = document.querySelectorAll('.template-card');
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                templateCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            templateCards.forEach(card => card.removeEventListener('click', () => {}));
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="container">
                {isAuthenticated ? (
                    <div>
                        <header>
                        <h1>Добро пожаловать {username}!</h1>
                        </header>
                    
                    <section className="templates">
                    <h2>Шаблоны</h2>
                    <div className="template-buttons">
                        <div className="template-card selected" onClick={handleEmptyMapClick}>Пустая карта</div>
                        <div className="template-card">Интеллект-карта</div>
                    </div>
                </section>
    
                <section className="maps-list">
                    <h2>Все карты</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Участники</th>
                                <th>Изменено</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Моя новая интеллект-карта</td>
                                <td>Только Вы</td>
                                <td>30 авг. 2024 г.</td>
                            </tr>
                            <tr>
                                <td>Курсовая</td>
                                <td>Только Вы</td>
                                <td>6 сент. 2024 г.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                    </div>
                ) : (
                    <div className="background">
                        <header className="buttons">
                        <button className='button-login' onClick={() => setShowLogin(true)}>Войти</button>
                        <button className='button-signup' onClick={() => setShowSignUp(true)}>Регистрация</button>
                        </header>
                    </div>
                    
                )}

            {(showLogin || showSignUp) && (
                <div className={`modal ${showLogin || showSignUp ? 'show' : ''}`}>
                    <div className="modal-content" ref={modalRef}>
                        <span className="close" onClick={() => {setShowLogin(false); setShowSignUp(false)}}>&times;</span>
                        <LoginForm showLogin={showLogin} showSignUp={showSignUp}/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MapList;
