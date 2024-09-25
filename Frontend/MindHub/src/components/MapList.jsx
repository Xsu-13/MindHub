import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MapListStyle.css';
import LoginForm from "./LoginForm.jsx"
import { AddMap, GetMapsByUserId } from '../services/urls.js';



function MapList() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState();
    const [maps, setMaps] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedMap, setSelectedMap] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, yы: 0 });
    const modalRef = useRef();
    const menuRef = useRef(null);
    const navigate = useNavigate();

    var defaultMap = {
        UserId: user ? user.id : 0,
        Title: "untitled",
        Nodes: [
            {
                Title: "Start",
                Content: "",
                X: 0,
                Y: 0
            }
        ]
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleString('ru-RU', options);
    };

    const handleEmptyMapClick = async () => {
        await AddMap(defaultMap);
        navigate('/map');
    };

    const handleRowClick = (item) => {
        navigate('/map');
    };

    const handleRightClick = (e, item) => {
        e.preventDefault(); // Останавливаем стандартное поведение клика
        setSelectedMap(item);
        setMenuPosition({ x: e.pageX, y: e.pageY }); // Устанавливаем позицию меню
        setIsMenuOpen(true);
      };
    
      const handleOptionClick = (option) => {
        console.log(`Выбрана опция: ${option} для карты ${selectedMap.title}`);
        setIsMenuOpen(false); // Закрываем меню после выбора опции
      };

    useEffect(() => {

        const GetMaps = async (userId) => {
            const mapsData = await GetMapsByUserId(userId);
            if (Array.isArray(mapsData.data)) {
                setMaps(mapsData.data);
            } else {
                console.error('Полученные данные не являются массивом:', mapsData);
                setMaps([]);
            }
        }

        if(localStorage.getItem("user") !== null)
        {
            const user = JSON.parse(localStorage.getItem("user"));
            setIsAuthenticated(true);
            setUser(user);

            GetMaps(user.id);
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

        const handleClickOutsideMenu = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
              setIsMenuOpen(false); 
            }
          };
      
          document.addEventListener('mousedown', handleClickOutsideMenu);
          return () => {
            document.removeEventListener('mousedown', handleClickOutsideMenu);
            templateCards.forEach(card => card.removeEventListener('click', () => {}));
            document.removeEventListener('mousedown', handleClickOutside);
          };
    }, [menuRef]);

    return (
        <div className="container">
                {isAuthenticated ? (
                    <div>
                        <header>
                            <h1>Добро пожаловать, {user.username}!</h1>
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
                                <th>Изменено</th>
                            </tr>
                        </thead>
                        <tbody>
                        {maps.map((item, index) => (
                                    <tr key={index} onClick={() => handleRowClick(item)} onContextMenu={(e) => handleRightClick(e, item)}>
                                        <td>{item.title}</td>
                                        <td>{formatDate(item.recordCreateDate)}</td>
                                    </tr>
                                ))}
                        </tbody>
                        </table>
                        {isMenuOpen && (
                            <ul
                                className="context-menu"
                                ref={menuRef}
                                style={{ top: menuPosition.y, left: menuPosition.x }}>
                                <li onClick={() => handleOptionClick('Открыть')}>Открыть</li>
                                {/* <li onClick={() => handleOptionClick('Копировать')}>Копировать</li> */}
                                <li onClick={() => handleOptionClick('Переместить в корзину')}>
                                Переместить в корзину
                                </li>
                            </ul>
                            )}
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
