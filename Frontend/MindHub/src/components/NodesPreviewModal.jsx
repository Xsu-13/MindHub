import React from 'react';
import '../styles/NodesPreviewModal.css';

const NodesPreviewModal = ({ 
  isOpen, 
  onClose, 
  newNodes = [], 
  originalNodes = [], 
  onConfirm, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const formatNodeContent = (content) => {
    if (!content) return 'Без описания';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const getChangedNodes = () => {
    const originalMap = {};
    originalNodes.forEach(node => {
      originalMap[node.id] = node;
    });

    return newNodes.map(newNode => {
      const original = originalMap[newNode.id];
      const isModified = original && (
        original.title !== newNode.title || 
        original.content !== newNode.content
      );
      const isNew = !original;
      
      return {
        ...newNode,
        isModified,
        isNew,
        originalContent: original?.content || ''
      };
    });
  };

  const changedNodes = getChangedNodes();
  const modifiedCount = changedNodes.filter(n => n.isModified).length;
  const newCount = changedNodes.filter(n => n.isNew).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Предварительный просмотр изменений</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="changes-summary">
            <p>
              <strong>Изменений:</strong> {modifiedCount} узлов обновлено, {newCount} узлов добавлено
            </p>
          </div>
          
          <div className="nodes-preview">
            {changedNodes.map((node) => (
              <div 
                key={node.id} 
                className={`node-item ${node.isNew ? 'new-node' : ''} ${node.isModified ? 'modified-node' : ''}`}
              >
                <div className="node-header">
                  <span className="node-title">{node.title}</span>
                  {node.isNew && <span className="node-badge new">НОВЫЙ</span>}
                  {node.isModified && <span className="node-badge modified">ИЗМЕНЕН</span>}
                </div>
                
                <div className="node-content">
                  {node.isModified && (
                    <>
                      <div className="content-section">
                        <span className="content-label">Было:</span>
                        <div className="content-text original">
                          {formatNodeContent(node.originalContent)}
                        </div>
                      </div>
                      <div className="content-section">
                        <span className="content-label">Стало:</span>
                        <div className="content-text updated">
                          {formatNodeContent(node.content)}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {node.isNew && (
                    <div className="content-section">
                      <span className="content-label">Описание:</span>
                      <div className="content-text new">
                        {formatNodeContent(node.content)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Применить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodesPreviewModal;
