import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavigationBar.css';
import { SendOpenRouterQuery } from '../services/urls';

const NavigationBar = ({ nodes = [], onNodesUpdate, onLoading, onError }) => {
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const navigate = useNavigate();
  const modelOptions = [
    { value: 'deepseek/deepseek-v3.2', label: 'DeepSeek v3.2' },
    { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' }
  ];
  const quickPrompts = [
    'Создай карту на тему "REST API на ASP.NET Core" с основными узлами.',
    'Добавь узлы по теме "React hooks" и свяжи их с текущими.',
    'Распиши текущую карту подробнее, добавь практические примеры.',
    'Добавь пошаговый алгоритм реализации в виде кода в описаниях.'
  ];

  const handleMenuClick = () => {
    navigate('/');
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (assistantQuery.trim() && !isLoading) {
      const queryText = assistantQuery.trim();
      setIsLoading(true);
      if (onLoading) onLoading(true);
      setChatMessages((prev) => [...prev, { role: 'user', text: queryText }]);
      
      try {
        console.log('Запрос ассистенту:', queryText);
        console.log('Контекст узлов:', nodes);
        
        const response = await SendOpenRouterQuery(queryText, nodes, selectedModel);
        console.log('Ответ от AI:', response);
        
        if (response && response.data && response.data.success) {
          if (response.data.requiresClarification) {
            const clarificationText = response.data.clarificationQuestion || 'УТОЧНЕНИЕ: Уточните запрос.';
            setChatMessages((prev) => [...prev, { role: 'assistant', text: clarificationText, isClarification: true }]);
          } else if (response.data.response) {
            setChatMessages((prev) => [...prev, { role: 'assistant', text: 'Подготовил изменения узлов. Проверьте предварительный просмотр.' }]);
          }

          // Передаем новые узлы родительскому компоненту для предварительного просмотра
          if (onNodesUpdate && Array.isArray(response.data.response) && response.data.response.length > 0) {
            onNodesUpdate(response.data.response);
          }
        } else {
          const errorMessage = response?.data?.errorMessage || 'Неизвестная ошибка при обработке запроса';
          setChatMessages((prev) => [...prev, { role: 'assistant', text: `Ошибка: ${errorMessage}` }]);
          if (onError) onError(errorMessage);
        }
        
        setAssistantQuery('');
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        const errorMessage = error.response?.data?.errorMessage || error.message || 'Ошибка соединения с сервером';
        setChatMessages((prev) => [...prev, { role: 'assistant', text: `Ошибка: ${errorMessage}` }]);
        if (onError) onError(errorMessage);
      } finally {
        setIsLoading(false);
        if (onLoading) onLoading(false);
      }
    }
  };

  const handleInputChange = (e) => setAssistantQuery(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAssistantSubmit(e);
    }
  };

  return (
    <>
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
          <button
            className="assistant-open-button"
            onClick={() => setIsDialogOpen(true)}
            title="Открыть диалог с ассистентом"
          >
            AI-ассистент
          </button>
        </div>
      </nav>

      {isDialogOpen && (
        <div className="assistant-dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="assistant-dialog" onClick={(evt) => evt.stopPropagation()}>
            <div className="assistant-dialog-header">
              <h3>AI-ассистент карты</h3>
              <button className="assistant-dialog-close" onClick={() => setIsDialogOpen(false)}>×</button>
            </div>

            <div className="assistant-quick-prompts">
              <select
                className="assistant-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                title="Выберите нейронку"
              >
                {modelOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="quick-prompt-chip"
                  onClick={() => setAssistantQuery(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="assistant-chat">
              {chatMessages.length === 0 && (
                <div className="assistant-empty-state">
                  Выберите подсказку выше или напишите свой запрос.
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`assistant-message ${message.role === 'user' ? 'user' : 'assistant'} ${message.isClarification ? 'clarification' : ''}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            
            <form className="assistant-form" onSubmit={handleAssistantSubmit}>
              <div className="assistant-input-container">
                <input
                  type="text"
                  className="assistant-input"
                  placeholder='Например: "Создай карту на тему..."'
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
        </div>
      )}
    </>
  );
};

export default NavigationBar;

