export const updateTreeVisibility = (graphInstance, nodesList, nodesMap) => {
    const allNodes = nodesList.current || [];
    const links = graphInstance.current?.getLinks() || [];

    const visibilityMap = {};

    allNodes.forEach(node => {
      visibilityMap[node.id] = isNodeVisibleSafe(node.id, allNodes);
    });

    allNodes.forEach(node => {
      const nodeElement = nodesMap.current[node.id];
      if (!nodeElement) return;

      nodeElement.attr('root/display', visibilityMap[node.id] ? 'block' : 'none');
    });

    links.forEach(link => {
      const sourceId = link.getSourceElement()?.backId;
      const targetId = link.getTargetElement()?.backId;

      const visible =
        visibilityMap[sourceId] && visibilityMap[targetId];

      link.attr('line/display', visible ? 'block' : 'none');
    });
  };

  const isNodeVisibleSafe = (nodeId, allNodes) => {
    let current = allNodes.find(n => n.id === nodeId);

    while (current?.parentNodeId) {
      const parent = allNodes.find(n => n.id === current.parentNodeId);
      if (!parent) break;

      if (parent.isCollapsed) return false;

      current = parent;
    }

    return true;
  };