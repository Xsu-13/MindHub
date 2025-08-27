import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';

const NavigationBar = () => {
  const [assistantQuery, setAssistantQuery] = useState('');
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate('/');
  };

  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    if (assistantQuery.trim()) {
      console.log('Запрос ассистенту:', assistantQuery);
      setAssistantQuery('');
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
              title="Отправить"
              disabled={!assistantQuery.trim()}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
};

export default NavigationBar;

