import React from 'react';
import '../styles/NodesPreviewModal.css';

const NodesPreviewModal = ({ 
  isOpen, 
  onClose, 
  newNodes = {}, 
  originalNodes = [], 
  onConfirm, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const formatNodeContent = (content) => {
    if (!content) return 'Без описания';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  // Обработка как старого формата (массив), так и нового (объект с категориями)
  let added = [];
  let modified = [];
  let deleted = [];

  if (Array.isArray(newNodes)) {
    // Старый формат - поддерживаем для совместимости
    const originalMap = {};
    originalNodes.forEach(node => {
      originalMap[node.id] = node;
    });

    newNodes.forEach(newNode => {
      const original = originalMap[newNode.id];
      const isModified = original && (
        original.title !== newNode.title || 
        original.content !== newNode.content
      );
      const isNew = !original;
      
      if (isModified) {
        modified.push({
          ...newNode,
          isModified: true,
          originalContent: original?.content || ''
        });
      } else if (isNew) {
        added.push({
          ...newNode,
          isNew: true
        });
      }
    });
  } else {
    // Новый формат
    added = newNodes.added || [];
    modified = newNodes.modified || [];
    deleted = newNodes.deleted || [];
  }

  const totalAddedCount = added.length;
  const totalModifiedCount = modified.length;
  const totalDeletedCount = deleted.length;

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
              <strong>Итого изменений:</strong> {totalModifiedCount} обновлено
              {totalAddedCount > 0 && `, ${totalAddedCount} добавлено`}
              {totalDeletedCount > 0 && `, ${totalDeletedCount} удалено`}
            </p>
          </div>
          
          <div className="nodes-preview">
            {/* Обновленные ноды */}
            {modified.map((node) => (
              <div 
                key={node.id} 
                className="node-item modified-node"
              >
                <div className="node-header">
                  <span className="node-title">{node.title}</span>
                  <span className="node-badge modified">ИЗМЕНЕН</span>
                </div>
                
                <div className="node-content">
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
                </div>
              </div>
            ))}

            {/* Новые ноды */}
            {added.map((node) => (
              <div 
                key={node.id} 
                className="node-item new-node"
              >
                <div className="node-header">
                  <span className="node-title">{node.title}</span>
                  <span className="node-badge new">НОВЫЙ</span>
                </div>
                
                <div className="node-content">
                  <div className="content-section">
                    <span className="content-label">Описание:</span>
                    <div className="content-text new">
                      {formatNodeContent(node.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Удаленные ноды */}
            {deleted.map((node) => (
              <div 
                key={node.id} 
                className="node-item deleted-node"
              >
                <div className="node-header">
                  <span className="node-title">{node.title}</span>
                  <span className="node-badge deleted">УДАЛЕН</span>
                </div>
                
                <div className="node-content">
                  <div className="content-section">
                    <span className="content-label">Было:</span>
                    <div className="content-text deleted">
                      {formatNodeContent(node.content)}
                    </div>
                  </div>
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
