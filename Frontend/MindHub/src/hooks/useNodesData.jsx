import { useState, useEffect, useRef } from 'react';
import { GetNodesByMapId, CreateNode, PatchNode, DeleteNode } from '../services/urls.js';

export const useNodesData = (mapId) => {
  const [nodes, setNodes] = useState([]);
  const nodesList = useRef([]);
  const nodesMap = useRef({});

  useEffect(() => {
    const fetchNodes = async () => {
      if (!mapId) return;
      const nodesData = await GetNodesByMapId(mapId);
      const nodesArray = Array.isArray(nodesData.data) ? nodesData.data : [];
      setNodes(nodesArray);
      nodesList.current = nodesArray;
    };
    fetchNodes();
  }, [mapId]);

  const updateNodeInState = (nodeId, updates) => {
    const updatedNodes = nodesList.current.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    nodesList.current = updatedNodes;
    setNodes(updatedNodes);
  };

  return {
    nodes,
    setNodes,
    nodesList,
    nodesMap,
    updateNodeInState
  };
};