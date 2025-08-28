import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import { SendOpenRouterQuery } from '../services/urls';

const NavigationBar = ({ nodes = [], onNodesUpdate, onLoading, onError }) => {
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate('/');
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (assistantQuery.trim() && !isLoading) {
      setIsLoading(true);
      if (onLoading) onLoading(true);
      
      try {
        console.log('Запрос ассистенту:', assistantQuery);
        console.log('Контекст узлов:', nodes);
        
        const response = await SendOpenRouterQuery(assistantQuery, nodes);
        console.log('Ответ от AI:', response);
        
        if (response && response.data && response.data.success && response.data.response) {
          // Передаем новые узлы родительскому компоненту для предварительного просмотра
          if (onNodesUpdate) {
            onNodesUpdate(response.data.response);
          }
        } else {
          const errorMessage = response?.data?.errorMessage || 'Неизвестная ошибка при обработке запроса';
          if (onError) onError(errorMessage);
        }
        
        setAssistantQuery('');
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        const errorMessage = error.response?.data?.errorMessage || error.message || 'Ошибка соединения с сервером';
        if (onError) onError(errorMessage);
      } finally {
        setIsLoading(false);
        if (onLoading) onLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setAssistantQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAssistantSubmit(e);
    }
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        <button 
          className="menu-button" 
          onClick={handleMenuClick}
          title="Главное меню"
        >
          <span className="menu-icon">☰</span>
          Главное меню
        </button>
      </div>
      
      <div className="nav-right">
        <form className="assistant-form" onSubmit={handleAssistantSubmit}>
          <div className="assistant-input-container">
            <input
              type="text"
              className="assistant-input"
              placeholder="Задайте вопрос ассистенту..."
              value={assistantQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button 
              type="submit" 
              className="assistant-submit-button"
              title={isLoading ? "Обработка..." : "Отправить"}
              disabled={!assistantQuery.trim() || isLoading}
            >
              {isLoading ? (
                <span className="loading-icon">⌛</span>
              ) : (
                <span className="send-icon">➤</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
};

export default NavigationBar;

