import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { CreateElement, Card } from './Map';
import { shapes } from '@joint/core';

export const useMindMapLock = (nodeMapRef, mapId, paperInstance, graphInstance, nodesList) => {
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
      console.log(nodesList)
      if (nodesList().find(item => item.id == nodeId).parentNodeId === null)
        {
          console.log(isLocked)
          node.attr({
            body: {
              fill: isLocked ? '#f5f5f5' : '#ff5252'
            }
          });
        }
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
      .then(() => {
        console.log('Connected to lock hub');
        return newConnection.invoke("SubscribeToMap", mapId.toString())
      })
      .catch(err => console.error('Connection failed: ', err));

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

    connection.on("ReceiveNodeNameUpdate", (nodeId, newNodeName) => {
      const node = nodeMapRef.current[nodeId];
      if (node) {
        node.attr('label', { text: newNodeName });
        const elementView = paperInstance.current.findViewByModel(node);

        const cardNameElement = elementView.el.querySelector('.card_name');
        cardNameElement.innerHTML = newNodeName;
      }
    });

    connection.on("ReceiveAddNode", (nodeId, newX, newY, parentNodeId) => {
      if (!nodeMapRef.current[nodeId]) {
        try{
          const newRect = CreateElement(nodeMapRef, mapId, "New Node", paperInstance.current, graphInstance.current,  { x: parseFloat(newX), y: parseFloat(newY) }, "#FFFFFF", nodeId)
          nodeMapRef.current[nodeId] = newRect;
          let parentNode = nodeMapRef.current[parentNodeId];
          const newLink = new shapes.standard.Link();
          newLink.set('z', 0);
          newLink.source(parentNode);
          newLink.target(newRect);
          newLink.addTo(graphInstance.current);
        }
        catch(error)
        {
          console.log(error);
        }
        
      }
    });

    connection.on("ReceiveRemoveNode", (nodeId) => {
      const node = nodeMapRef.current[nodeId];
      if (node) {
        node.remove();
        delete nodeMapRef.current[nodeId];
      }
    });

    return () => {
      connection.off('ReceiveLockStatus', handler);
      connection.off('ReceiveNodePosition', positionHandler);
      connection.off("ReceiveNodeNameUpdate");
      connection.off("ReceiveAddNode");
      connection.off("ReceiveRemoveNode");
    };
  }, [connection]);

  const addNode = useCallback(async (nodeId, x, y, parentNode) => {
    if (!connection) return;

    try {
      await connection.invoke("AddNode", mapId.toString(), nodeId.toString(), x.toString(), y.toString(), parentNode.toString());

    } catch (error) {
      console.error("Add node failed:", error);
      return null;
    }
  }, [connection, mapId]);

  const removeNode = useCallback(async (nodeId) => {
    if (!connection) return;
    try {
      const node = nodeMapRef.current[nodeId];

      if (node) {
        node.remove();
        delete nodeMapRef.current[nodeId];
      }

      await connection.invoke("RemoveNode", mapId.toString(), nodeId.toString());
    } catch (error) {
      console.error("Remove node failed:", error);
    }
  }, [connection, mapId]);

  const moveNode = useCallback(async (mapId, nodeId, x, y) => {
    if (!connection) return false;

    try {
      await connection.invoke('UpdateNodePosition', mapId.toString(), nodeId.toString(), x, y);
      // Проверяем, заблокирован ли узел текущим пользователем
      // if (lockedNodes[nodeId] && lockedNodes[nodeId] === currentUser) {
      //   await connection.invoke('UpdateNodePosition', mapId.toString(), nodeId.toString(), x, y);
      //   return true;
      // }
      // return false;
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

  const updateNodeName = useCallback(async (nodeId, newNodeName) => {
    if (!connection) return;
    try {
      await connection.invoke("UpdateNodeName", mapId.toString(), nodeId.toString(), newNodeName);
    } catch (err) {
      console.error("Failed to update node name:", err);
    }
  }, [connection]);

  const updateNodeDescription = useCallback(async (nodeId, newDescription) => {
    if (!connection) return;
    try {
      await connection.invoke("UpdateNodeDescription", mapId.toString(), nodeId.toString(), newDescription);
    } catch (err) {
      console.error("Failed to update node description:", err);
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
    updateNodeName,
    updateNodeDescription,
    canEditNode,
    moveNode,
    removeNode,
    addNode,
    getLockedNodes,
    lockedNodes,
    currentUser
  };
};

function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}