import { useState, useEffect } from 'react';
import '../styles/AcceptInvitePage.css';
import { AcceptInvite } from '../services/urls.js';
import { useNavigate, useParams } from 'react-router-dom';

function AcceptInvitePage() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processInvitation = async () => {
            try {
                setStatus('processing');
                let _mapId = await AcceptInvite(token);
                if(_mapId.data == ''){
                    setStatus('error');
                    setErrorMessage('Не удалось принять приглашение');
                }
                else{
                    setStatus('success');
                    setTimeout(() => navigate('/map', { state: { mapId: _mapId.data } }), 2000);
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage('Не удалось принять приглашение');
                console.error('Ошибка приглашения:', error);
            }
        };

        processInvitation();
    }, [token, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="status-message processing">
                        <div className="loader"></div>
                        <p>Обработка вашего приглашения...</p>
                    </div>
                );
            
            case 'success':
                return (
                    <div className="status-message success">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                        <p>Приглашение успешно принято!</p>
                        <p>Перенаправляем на карту...</p>
                    </div>
                );
            
            case 'error':
                return (
                    <div className="status-message error">
                        <svg className="crossmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="crossmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="crossmark__cross" fill="none" d="M16 16 36 36 M36 16 16 36"/>
                        </svg>
                        <p>{errorMessage}</p>
                        <button 
                            className="retry-button"
                            onClick={() => window.location.reload()}
                        >
                            Попробовать снова
                        </button>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="invite-container">
            {renderContent()}
        </div>
    );
}

export default AcceptInvitePage;