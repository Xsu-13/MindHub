import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export const useMindMapLock = () => {
  const [connection, setConnection] = useState(null);
  const [lockedNodes, setLockedNodes] = useState({});
  const lockedNodesRef = useRef(lockedNodes);
  const [currentUser] = useState(generateUserId());

  // Синхронизируем ref с состоянием
  useEffect(() => {
    lockedNodesRef.current = lockedNodes;
  }, [lockedNodes]);

  // Инициализация подключения
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/liveHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => console.log('Connected to lock hub'))
      .catch(err => console.error('Connection failed: ', err));

    return () => {
      newConnection.stop();
    };
  }, []);

  // Подписка на обновления статуса блокировок
  useEffect(() => {
    if (!connection) return;

    const handler = (nodeId, isLocked, lockedBy) => {
      setLockedNodes(prev => {
        const newState = isLocked
          ? { ...prev, [nodeId]: lockedBy || '' }
          : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== nodeId));
        return newState;
      });
    };

    connection.on('ReceiveLockStatus', handler);

    return () => {
      connection.off('ReceiveLockStatus', handler);
    };
  }, [connection]);

  // Запрос блокировки узла
  const requestLock = useCallback(async (nodeId) => {
    if (!connection) return false;
    try {
      await connection.invoke('RequestNodeLock', nodeId.toString());
      return true;
    } catch (error) {
      console.error('Lock request failed:', error);
      return false;
    }
  }, [connection]);

  // Освобождение блокировки узла
  const releaseLock = useCallback(async (nodeId) => {
    if (!connection) return;
    try {
      await connection.invoke('ReleaseNodeLock', nodeId);
    } catch (error) {
      console.error('Lock release failed:', error);
    }
  }, [connection]);

  // Проверка прав доступа
  const canEditNode = useCallback((nodeId) => {
    const currentLocks = lockedNodesRef.current;
    return !currentLocks[nodeId] || currentLocks[nodeId] === currentUser;
  }, [currentUser]);

  const getLockedNodes = () => {
    return lockedNodesRef.current;
  }

  return {
    requestLock,
    releaseLock,
    canEditNode,
    getLockedNodes,
    lockedNodes,
    currentUser
  };
};

function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}