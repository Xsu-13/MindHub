import { useEffect, useState, useRef } from 'react';
import { elementTools, dia, shapes } from '@joint/core';
import { useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import "../styles/MapStyle.css";
import CardContent from './CardContent';
import NavigationBar from './NavigationBar';
import NodesPreviewModal from './NodesPreviewModal';
import { CreateNode, PatchNode, DeleteNode, GetNodesByMapId } from '../services/urls.js';
import MouseTracker from './MouseTracker.jsx';
import { useMindMapLock } from './useMindMapLock.jsx';

export const Card = dia.Element.define('example.ForeignObject', {
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: {
        type: 'linearGradient',
        stops: [
          { offset: 0, color: '#ff5c69' },
          { offset: 0.5, color: '#ff4252' },
          { offset: 1, color: '#ed2637' }
        ]
      }
    },
    foreignObject: {
      width: 'calc(w-12)',
      height: 'calc(h-12)',
      x: 6,
      y: 6
    }
  },
}, {
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'foreignObject',
      selector: 'foreignObject'
    }
  ]
});

function Map() {
  const paperRef = useRef(null);
  const location = useLocation();
  const [editingNode, setEditingNode] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [nodes, setNodes] = useState([]);
  const paperInstance = useRef(null);
  const graphInstance = useRef(null);
  const nodesMap = useRef({});
  const editingNodeRef = useRef(null);
  const nodesList = useRef([]);
  
  // Состояния для AI помощника
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [previewNodes, setPreviewNodes] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const zoomScaleRef = useRef(1);

  const mapId = location.state?.mapId;

  const {
    requestLock,
    releaseLock,
    updateNodeName,
    canEditNode,
    moveNode,
    removeNode,
    addNode,
  } = useMindMapLock(nodesMap, mapId, paperInstance, graphInstance, () => nodesList.current);

  // Обработчики для AI помощника
  const handleAILoading = (loading) => {
    setIsAILoading(loading);
    if (!loading) {
      setAiError(null);
    }
  };

  const handleAIError = (error) => {
    setAiError(error);
    setIsAILoading(false);
  };

  const handleNodesUpdate = (newNodes) => {
    setPreviewNodes(newNodes);
    setShowPreviewModal(true);
  };

  const handleConfirmChanges = async () => {
    setIsSaving(true);
    try {
      // Обновляем существующие узлы и создаем новые
      const updatedNodes = [];
      
      for (const newNode of previewNodes) {
        const existingNode = nodes.find(n => n.id === newNode.id);
        
        if (existingNode) {
          // Обновляем существующий узел
          await PatchNode(newNode.id, {
            title: newNode.title,
            content: newNode.content
          });
          updatedNodes.push({ ...existingNode, ...newNode });
        } else {
          // Создаем новый узел
          const createdNode = await CreateNode({
            mapId: mapId,
            parentNodeId: newNode.parentNodeId,
            title: newNode.title,
            content: newNode.content,
            x: newNode.x,
            y: newNode.y,
            style: newNode.style
          });
          updatedNodes.push(createdNode.data);
        }
      }
      
      // Обновляем состояние узлов
      const finalNodes = [...nodes];
      updatedNodes.forEach(updatedNode => {
        const index = finalNodes.findIndex(n => n.id === updatedNode.id);
        if (index >= 0) {
          finalNodes[index] = updatedNode;
        } else {
          finalNodes.push(updatedNode);
        }
      });
      
      setNodes(finalNodes);
      nodesList.current = finalNodes;
      setShowPreviewModal(false);
      setPreviewNodes([]);

    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
      setAiError('Ошибка при сохранении изменений: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewNodes([]);
  };

  const updateNodeColor = (nodeId, color) => {
    const nodeModel = nodesMap.current[nodeId];
    if (!nodeModel) return;
    nodeModel.attr('body/fill', color);
  };

  const updateNodeStyleInState = (nodeId, stylePatch) => {
    const updatedNodes = (nodesList.current || []).map((node) => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        style: {
          ...(node.style || {}),
          ...stylePatch
        }
      };
    });
    nodesList.current = updatedNodes;
  };

  const updateNodeSizeByFont = (nodeId, nextFontSize, prevFontSize = 14) => {
    const nodeModel = nodesMap.current[nodeId];
    if (!nodeModel) return;
    const currentSize = nodeModel.size();
    const baseFontSize = 14;
    const fontDelta = Math.max(0, nextFontSize - baseFontSize);
    const diff = nextFontSize - prevFontSize;
    const minWidth = 180 + fontDelta * 4;
    const minHeight = 50 + fontDelta * 2;
    const nextWidth = diff > 0 ? currentSize.width + diff * 3 : currentSize.width;
    nodeModel.resize(
      Math.max(nextWidth, minWidth),
      Math.max(currentSize.height, minHeight)
    );
  };

  useEffect(() => {
    const GetNodes = async (mapId) => {
      const nodesData = await GetNodesByMapId(mapId);
      if (Array.isArray(nodesData.data)) {
        setNodes(nodesData.data);
        nodesList.current = nodesData.data;
      } else {
        console.error('Полученные данные не являются массивом:', nodesData.data);
        setNodes([]);
      }
    };

    if (mapId) {
      GetNodes(mapId);
    }
  }, [mapId]);

  useEffect(() => {

    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });
    graphInstance.current = graph;

    const paper = new dia.Paper({
      el: paperRef.current,
      model: graph,
      width: '100%',
      height: window.innerHeight - 70, // Учитываем высоту навигационной панели (60px + отступы)
      background: { color: '#F5F5F5' },
      cellViewNamespace: namespace,
      preventDefaultViewAction: false
    });
    paper.scale(1, 1);
    paper.translate(0, 0);
    zoomScaleRef.current = 1;

    paperInstance.current = paper;
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    const deleteButton = elementTools.Button.extend({
      name: 'delete-button',
      options: {
        markup: [{
          tagName: 'circle',
          selector: 'button',
          attributes: {
            'r': 7,
            'fill': '#FF0000',
            'cursor': 'pointer'
          }
        }, {
          tagName: 'text',
          selector: 'icon',
          attributes: {
            'text-anchor': 'middle',
            'y': '0.3em',
            'fill': '#FFFFFF',
            'font-size': 14,
            'pointer-events': 'none'
          },
          textContent: 'x'
        }],
        x: '100%',
        y: '0%',
        offset: { x: 10, y: -10 },
        action: async function (evt) {
          const currentElement = this.model;

          try {
            const targetId = currentElement.backId;
            const allNodes = nodesList.current || [];
            const idsToDelete = new Set([targetId]);
            const stack = [targetId];

            while (stack.length > 0) {
              const currentId = stack.pop();
              allNodes
                .filter((node) => node.parentNodeId === currentId)
                .forEach((child) => {
                  if (!idsToDelete.has(child.id)) {
                    idsToDelete.add(child.id);
                    stack.push(child.id);
                  }
                });
            }

            await DeleteNode(targetId);

            for (const idToDelete of idsToDelete) {
              await removeNode(idToDelete);
              const nodeView = nodesMap.current[idToDelete];
              if (nodeView) {
                nodeView.remove();
                delete nodesMap.current[idToDelete];
              }
            }

            const filteredNodes = allNodes.filter((node) => !idsToDelete.has(node.id));
            setNodes(filteredNodes);
            nodesList.current = filteredNodes;
          } catch (error) {
            console.error('Ошибка удаления узла:', error);
          }
        }
      }
    });

    elementTools.PlusButton = elementTools.Button.extend({
      name: 'plus-button',
      options: {
        markup: [{
          tagName: 'circle',
          selector: 'button',
          attributes: {
            'r': 7,
            'fill': '#FF0000',
            'cursor': 'pointer'
          }
        }, {
          tagName: 'text',
          selector: 'icon',
          attributes: {
            'text-anchor': 'middle',
            'y': '0.3em',
            'fill': '#FFFFFF',
            'font-size': 14,
            'pointer-events': 'none'
          },
          textContent: '+'
        }],
        x: '100%',
        y: '100%',
        offset: {
          x: 0,
          y: 10
        },
        rotate: true,
        action: async function (evt) {
          const currentElement = this.model;
          const position = currentElement.position();
          const newX = position.x + 250;
          const newY = position.y + 50;

          var node = await CreateNode({
            mapId: mapId,
            parentNodeId: currentElement.backId,
            title: "New Node",
            x: newX,
            y: newY,
            content: "",
            style: {
              backgroundColor: "#FFFFFF",
              textColor: "#353535",
              borderColor: "#C94A46",
              fontFamily: "py",
              fontSize: 14
            }
          });

          await addNode(node.data.id, newX, newY, currentElement.backId);

          const newRect = CreateElement(
            nodesMap,
            mapId,
            "New Node",
            paper,
            graph,
            { x: newX, y: newY },
            "#FFFFFF",
            node.data.id,
            "",
            false,
            "py",
            14,
            "#FFFFFF",
            node.data?.style?.id ?? null,
            updateNodeColor,
            updateNodeStyleInState,
            updateNodeSizeByFont
          );

          const newLink = new shapes.standard.Link();
          newLink.set('z', 0);
          newLink.source(currentElement);
          newLink.target(newRect);
          newLink.addTo(graph);

        }
      }
    });

    const nodeMap = {};
    nodes.forEach((node) => {
      var newNode = CreateElement(
        nodesMap,
        mapId,
        node.title,
        paper,
        graph,
        { x: node.x, y: node.y },
        node.style == null ? "#FFFFFF" : node.style.backgroundColor,
        node.id,
        node.content,
        false,
        node.style?.fontFamily,
        node.style?.fontSize || 14,
        node.style?.backgroundColor || "#FFFFFF",
        node.style?.id ?? null,
        updateNodeColor,
        updateNodeStyleInState,
        updateNodeSizeByFont
      );
      nodeMap[node.id] = newNode;
    });

    nodes.forEach((node) => {
      if (node.parentNodeId) {
        const parentNode = nodeMap[node.parentNodeId];
        const currentNode = nodeMap[node.id];
        if (parentNode && currentNode) {
          const newLink = new shapes.standard.Link();
          newLink.set('z', 0);
          newLink.source(parentNode);
          newLink.target(currentNode);
          newLink.addTo(graph);
        }
      }
    });

    paper.on('element:pointerup', async function (elementView) {
      const element = elementView.model;
      const position = element.position();

      try {
        await PatchNode(element.backId, {
          x: position.x,
          y: position.y
        });
        await moveNode(mapId, element.backId, position.x, position.y);
      } catch (error) {
        console.error('Ошибка сохранения позиции:', error);
      }
    });

    let currentElementView = null;

    var plusButton = new elementTools.PlusButton({
      x: '100%',
      y: '50%',
      offset: { x: 10, y: 0 },
      graph: graph
    });
    const deleteButtonTool = new deleteButton();

    paper.on('element:pointerdown', async function (elementView) {
      editingNodeRef.current = null;
      await requestLock(elementView.model.backId);
    })
    
    paper.on('element:pointerclick', async function (elementView) {
      if (currentElementView && currentElementView !== elementView) {
        currentElementView.removeTools();
        setEditingNode(null);
        await releaseLock(currentElementView.model.backId);
      }
      const links = graph.getLinks();
      elementView.addTools(new dia.ToolsView({
        tools: [
          plusButton
        ]
      }));
      if (links.some(link => link.getTargetElement() === elementView.model))
        elementView.addTools(new dia.ToolsView({
          tools: [
            deleteButtonTool,
            plusButton
          ]
        }));

      currentElementView = elementView;
    });

    paper.on('element:pointerdblclick', async function (elementView) {
      let canEdit = await canEditNode(elementView.model.backId);
      if (canEdit) {
        setEditingNode(elementView.model);
        editingNodeRef.current = elementView.model;
        setInputValue(elementView.model.attr('label/text'));
        setTimeout(async () => {
          await requestLock(elementView.model.backId);
        }, 100);
      }
    });
    paper.on('element:pointerup', async function (elementView) {
      if (editingNodeRef.current === null){
        setTimeout(async () => {
          await releaseLock(elementView.model.backId);
        }, 100);
      }
    });
    paper.on('blank:pointerdown', function (evt) {
      isPanning = true;
      panStart = { x: evt.clientX, y: evt.clientY };
      paper.el.style.cursor = 'grabbing';
    });

    paper.on('blank:pointermove', function (evt) {
      if (!isPanning) return;
      const dx = evt.clientX - panStart.x;
      const dy = evt.clientY - panStart.y;
      const translation = paper.translate();
      paper.translate(translation.tx + dx, translation.ty + dy);
      panStart = { x: evt.clientX, y: evt.clientY };
    });

    const stopPanning = () => {
      isPanning = false;
      paper.el.style.cursor = 'default';
    };

    paper.on('blank:pointerup', stopPanning);
    window.addEventListener('mouseup', stopPanning);

    const handleWheel = (event) => {
      event.preventDefault();

      const currentScale = zoomScaleRef.current;
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(2.5, Math.max(0.4, currentScale + delta));
      if (newScale === currentScale) return;

      const rect = paper.el.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const translation = paper.translate();
      const worldX = (offsetX - translation.tx) / currentScale;
      const worldY = (offsetY - translation.ty) / currentScale;
      const nextTx = offsetX - worldX * newScale;
      const nextTy = offsetY - worldY * newScale;

      paper.scale(newScale, newScale);
      paper.translate(nextTx, nextTy);
      zoomScaleRef.current = newScale;
    };

    paper.el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      paper.el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mouseup', stopPanning);
    };
  }, [nodes]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = async () => {
    if (editingNode) {
      editingNode.attr('label', { text: inputValue });
      setEditingNode(null);
      editingNodeRef.current = null;
      setInputValue('');
    }
  };

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter') {
      if (editingNode) {
        const elementView = paperInstance.current.findViewByModel(editingNode);
        editingNode.attr('label', { text: inputValue });

        if (elementView) {
          const cardNameElement = elementView.el.querySelector('.card_name');
          cardNameElement.innerHTML = inputValue;
        }

        await releaseLock(editingNode.backId);
        await PatchNode(editingNode.backId, { title: inputValue });
        await updateNodeName(editingNode.backId, inputValue);

        setEditingNode(null);
        editingNodeRef.current = null;
        setInputValue('');
      }
    }
  };

  const inputStyle = {
    position: 'absolute',
    zIndex: 1000,
    padding: '5px',
    backgroundColor: '#fff'
  };
  

  return (
    <>
      <NavigationBar 
        nodes={nodes}
        onNodesUpdate={handleNodesUpdate}
        onLoading={handleAILoading}
        onError={handleAIError}
      />
      
      {/* Показываем уведомления о состоянии AI */}
      {isAILoading && (
        <div className="ai-loading-notification">
          <span className="loading-icon">⌛</span>
          Обработка запроса...
        </div>
      )}
      
      {aiError && (
        <div className="ai-error-notification">
          <span className="error-icon">⚠️</span>
          {aiError}
          <button onClick={() => setAiError(null)} className="close-notification">×</button>
        </div>
      )}
      
      <div id="paper" ref={paperRef}></div>
      <MouseTracker></MouseTracker>
      
      {/* Модальное окно предварительного просмотра */}
      <NodesPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        newNodes={previewNodes}
        originalNodes={nodes}
        onConfirm={handleConfirmChanges}
        isLoading={isSaving}
      />
      
      {editingNode && (
        <textarea
          type="text"
          className='node_input'
          style={{ ...inputStyle, width: 150, top: editingNode.position().y + 80, left: editingNode.position().x + 20 }} // Учитываем высоту навигационной панели
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      )}
    </>
  )
}

export function CreateElement(
  nodesMap,
  mapId,
  innertext,
  paper,
  graph,
  position,
  backgroundColor = "#FFFFFF",
  nodeId,
  initialCode = '',
  isLocked = false,
  initialLanguage = 'py',
  initialFontSize = 14,
  initialBackgroundColor = '#FFFFFF',
  initialStyleId = null,
  onNodeColorChange = null,
  onNodeStyleChange = null,
  onNodeFontSizeChange = null
) {
  const node = new Card();
  node.position(position.x, position.y);
  node.resize(180, 50);
  node.addTo(graph);

  node.attr('body', {
    stroke: isLocked ? '#999' : '#C94A46',
    fill: isLocked ? '#f5f5f5' : backgroundColor
  });
  node.attr('label', { text: innertext, fill: '#353535' });
  node.set('z', 1);

  let nodeElement = paper.findViewByModel(node).el;
  let foreignObject = nodeElement.querySelector('foreignObject');

  let nameContainer = document.createElement('div');
  let root = createRoot(nameContainer);
  //root.render(<CardContent mapId={mapId} initialName={innertext} initialCode={initialCode} initCardId={nodeId} lockNode={() => requestLock(nodeId)} unlockNode={() => releaseLock(nodeId)} />);
  root.render(
    <CardContent
      mapId={mapId}
      initialName={innertext}
      initialCode={initialCode}
      initCardId={nodeId}
      initialLanguage={initialLanguage}
      initialFontSize={initialFontSize}
      initialBackgroundColor={initialBackgroundColor}
      initialStyleId={initialStyleId}
      onNodeColorChange={onNodeColorChange}
      onNodeStyleChange={onNodeStyleChange}
      onNodeFontSizeChange={onNodeFontSizeChange}
    />
  );
  foreignObject.appendChild(nameContainer);

  const resizeObserver = new ResizeObserver(() => {
    // Используем внутренние размеры контента, а не boundingClientRect,
    // чтобы zoom/scale бумаги не влиял на итоговый размер узла.
    const contentWidth = Math.max(nameContainer.scrollWidth, nameContainer.offsetWidth, 120);
    const contentHeight = Math.max(nameContainer.scrollHeight, nameContainer.offsetHeight, 40);
    node.resize(contentWidth + 12, contentHeight + 24);
  });

  resizeObserver.observe(nameContainer);

  if (nodeId) {
    node.backId = nodeId;
    nodesMap.current[nodeId] = node;
  }
  return node;
}

export default Map;
