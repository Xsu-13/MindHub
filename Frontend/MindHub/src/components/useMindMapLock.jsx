import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export const useMindMapLock = (nodeMapRef, mapId) => {
  const [connection, setConnection] = useState(null);
  const [lockedNodes, setLockedNodes] = useState({});
  const lockedNodesRef = useRef(lockedNodes);
  const [currentUser] = useState(generateUserId());

  const updateNodeStyle = useCallback((nodeId, isLocked) => {
    if (!nodeMapRef.current) return;
    
    const node = nodeMapRef.current[nodeId];
    if (node) {
      node.attr({
        body: {
          fill: isLocked ? '#f5f5f5' : '#FFFFFF',
          stroke: isLocked ? '#999' : '#C94A46'
        },
        label: {
          fill: isLocked ? '#999' : '#353535'
        }
      });
    }
  }, []);

  const updateNodePosition = useCallback((nodeId, x, y) => {
    
    if (!nodeMapRef.current) return;
    
    const node = nodeMapRef.current[nodeId];
    if (node) {
      node.position(x, y);
    }
  }, []);

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
      .then(() => {console.log('Connected to lock hub');
      return newConnection.invoke("SubscribeToMap", mapId.toString())})
      .catch(err => console.error('Connection failed: ', err));

    //await newConnection.invoke("SubscribeToMap", mapId.toString());
    //await newConnection.invoke("SubscribeToMap", 2);

    return () => {
      newConnection.stop();
    };
  }, []);

  // Подписка на обновления статуса блокировок
  useEffect(() => {
    if (!connection) return;

    const handler = (nodeId, isLocked, lockedBy) => {
      updateNodeStyle(nodeId, isLocked);
      setLockedNodes(prev => {
        const newState = isLocked
          ? { ...prev, [nodeId]: lockedBy || '' }
          : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== nodeId));
        return newState;
      });
    };

  const positionHandler = (nodeId, x, y) => {
    updateNodePosition(nodeId, x, y);
  };

    connection.on('ReceiveLockStatus', handler);
    connection.on('ReceiveNodePosition', positionHandler);

    return () => {
      connection.off('ReceiveLockStatus', handler);
      connection.off('ReceiveNodePosition', positionHandler);
    };
  }, [connection]);

  // Функция для перемещения узла
const moveNode = useCallback(async (mapId, nodeId, x, y) => {
  if (!connection) return false;
  
  try {
    // Проверяем, заблокирован ли узел текущим пользователем
    //if (lockedNodes[nodeId] && lockedNodes[nodeId] === currentUser) {
      await connection.invoke('UpdateNodePosition', mapId.toString(), nodeId.toString(), x, y);
      return true;
    //}
    //return false;
  } catch (error) {
    console.error('Move node failed:', error);
    return false;
  }
}, [connection, lockedNodes, currentUser]);

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
      await connection.invoke('ReleaseNodeLock', nodeId.toString());
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
    moveNode,
    getLockedNodes,
    lockedNodes,
    currentUser
  };
};

function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}