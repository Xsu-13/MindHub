import { useState, useEffect, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

interface LockStatus {
  nodeId: string;
  isLocked: boolean;
  lockedBy: string | null;
}

export const useMindMapLock = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lockedNodes, setLockedNodes] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<string>(generateUserId());

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

    connection.on('ReceiveLockStatus', (nodeId: string, isLocked: boolean, lockedBy: string | null) => {
      setLockedNodes(prev => {
        if (!isLocked) {
          const { [nodeId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [nodeId]: lockedBy || '' };
      });
    });
  }, [connection]);

  // Запрос блокировки узла
  const requestLock = useCallback(async (nodeId: string) => {
    if (!connection) return false;
    
    try {
      await connection.invoke('RequestNodeLock', nodeId);
      return true;
    } catch (error) {
      console.error('Lock request failed:', error);
      return false;
    }
  }, [connection]);

  // Освобождение блокировки узла
  const releaseLock = useCallback(async (nodeId: string) => {
    if (!connection) return;
    
    try {
      await connection.invoke('ReleaseNodeLock', nodeId);
    } catch (error) {
      console.error('Lock release failed:', error);
    }
  }, [connection]);

  // Проверка, может ли текущий пользователь редактировать узел
  const canEditNode = useCallback((nodeId: string) => {
    return !lockedNodes[nodeId] || lockedNodes[nodeId] === currentUser;
  }, [lockedNodes, currentUser]);

  return {
    requestLock,
    releaseLock,
    canEditNode,
    lockedNodes,
    currentUser
  };
};

function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}