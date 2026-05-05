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
import { Card } from '../components/CardComponent';
import { useNodesData } from '../hooks/useNodesData';
import { useMindMapLock } from './useMindMapLock.jsx';
import {createDeleteButton, createAddButton} from '../utils/nodeTools.jsx'
import {updateTreeVisibility} from '../utils/updateTreeVisibility.jsx'

function Map() {
  const paperRef = useRef(null);
  const location = useLocation();
  const [editingNode, setEditingNode] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const paperInstance = useRef(null);
  const graphInstance = useRef(null);
  const editingNodeRef = useRef(null);
  
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [previewNodes, setPreviewNodes] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const zoomScaleRef = useRef(1);
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0, width: 150 });
  const titleInputRef = useRef(null);

  const mapId = location.state?.mapId;
  const { nodes, setNodes, nodesList, nodesMap, updateNodeInState } = useNodesData(mapId);

  const {
    requestLock,
    releaseLock,
    updateNodeName,
    canEditNode,
    moveNode,
    updateNodeSize,
    updateNodeCodeBlockState,
    updateNodeStyleRealtime,
    removeNode,
    addNode,
  } = useMindMapLock(nodesMap, mapId, paperInstance, graphInstance, () => nodesList.current);

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
  const defaultStyle = {
    backgroundColor: "#FFFFFF",
    textColor: "#353535",
    borderColor: "#C94A46",
    fontFamily: "py",
    fontSize: 14
  };

  const normalizedNodes = (newNodes || []).map((node, index) => ({
    ...node,
    tempId: node.tempId || `temp-${index}`,
    style: node.style ?? defaultStyle,
    width: node.width ?? 180,
    height: node.height ?? 70,
    isCodeBlockOpen: node.isCodeBlockOpen ?? false,
    isCollapsed: node.isCollapsed ?? false
  }));

  const existingTitles = new Set(nodesList.current.map(n => n.title));

  setPreviewNodes({
    added: normalizedNodes.filter(n => !existingTitles.has(n.title)),
    modified: normalizedNodes.filter(n => existingTitles.has(n.title)),
    deleted: []
  });

  setShowPreviewModal(true);
};

  const handleConfirmChanges = async () => {
  setIsSaving(true);

  try {
    const tempToRealId = new globalThis.Map();
    const createdNodes = [];

    for (const node of previewNodes.added || []) {
      const created = await CreateNode({
        mapId: mapId,
        parentNodeId: null,
        title: node.title,
        content: node.content,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        isCodeBlockOpen: node.isCodeBlockOpen,
        isCollapsed: node.isCollapsed,
        style: node.style
      });

      const realId = created.data.id;
      tempToRealId.set(node.tempId, realId);
      createdNodes.push({ ...created.data, tempId: node.tempId });
    }

    for (const node of createdNodes) {
      const original = previewNodes.added.find(n => n.tempId === node.tempId);
      if (!original?.parentTempId) continue;
      const realParentId = tempToRealId.get(original.parentTempId);
      if (realParentId) {
        await PatchNode(node.id, { parentNodeId: realParentId });
        node.parentNodeId = realParentId;
      }
    }

    const updatedNodes = [];
    for (const node of previewNodes.modified || []) {
      const existing = nodes.find(n => n.title === node.title);
      if (!existing) continue;
      await PatchNode(existing.id, { title: node.title, content: node.content });
      updatedNodes.push({ ...existing, ...node });
    }

    const finalNodes = [
      ...nodes.filter(n => !updatedNodes.some(u => u.id === n.id)),
      ...updatedNodes,
      ...createdNodes
    ];

    setNodes(finalNodes);
    nodesList.current = finalNodes;
    setShowPreviewModal(false);
    setPreviewNodes({});
  } catch (error) {
    console.error(error);
    setAiError(error.message);
  } finally {
    setIsSaving(false);
  }
};

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewNodes([]);
  };

  const handleNodeCollapseChange = async (nodeId, isCollapsed) => {
    const updatedNodes = nodesList.current.map(node => 
      node.id === nodeId ? { ...node, isCollapsed } : node
    );
    nodesList.current = updatedNodes;

    try {
      await PatchNode(nodeId, { isCollapsed });
    } catch (e) {
      console.error('Ошибка обновления collapse:', e);
    }

    updateTreeVisibility(graphInstance, nodesList, nodesMap);
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

  const handleCodeBlockVisibilityChange = (nodeId, isVisible) => {
    const nodeModel = nodesMap.current[nodeId];
    if (!nodeModel || !paperInstance.current) return;

    const nodeView = paperInstance.current.findViewByModel(nodeModel);
    const currentSize = nodeModel.size();

    if (isVisible) {
      PatchNode(nodeId, { isCodeBlockOpen: true }).catch((error) => {
        console.error('Ошибка сохранения состояния code block:', error);
      });
      updateNodeCodeBlockState(nodeId, true);
      requestAnimationFrame(() => {
        const refreshedView = paperInstance.current?.findViewByModel(nodeModel);
        const rootContent = refreshedView?.el?.querySelector('.card-content-root');
        if (!rootContent) return;

        const requiredHeight = Math.max(70, rootContent.scrollHeight + 26);
        if (requiredHeight > nodeModel.size().height) {
          nodeModel.resize(nodeModel.size().width, requiredHeight);
        }
      });
      return;
    }

    const titleElement = nodeView?.el?.querySelector('.card_title');
    const titleHeight = titleElement ? titleElement.scrollHeight : 36;
    const nextHeight = Math.max(50, titleHeight + 30);
    nodeModel.resize(currentSize.width, nextHeight);
    PatchNode(nodeId, { isCodeBlockOpen: false }).catch((error) => {
      console.error('Ошибка сохранения состояния code block:', error);
    });
    updateNodeCodeBlockState(nodeId, false);
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
      height: window.innerHeight - 70,
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

    nodesMap.current = {};

    const DeleteButton = createDeleteButton(removeNode, DeleteNode, nodesList, nodesMap, setNodes);
    const AddButton = createAddButton(
      CreateNode, 
      CreateElement, 
      addNode, 
      nodesMap, 
      mapId, 
      graphInstance.current, 
      () => updateTreeVisibility(),
      paper,
      nodesList,
      updateNodeColor,
      updateNodeStyleInState,
      updateNodeSizeByFont,
      handleCodeBlockVisibilityChange,
      updateNodeStyleRealtime,
      handleNodeCollapseChange
    );

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
        node.width ?? 180,
        node.height ?? 70,
        node.isCodeBlockOpen ?? false,
        node.isCollapsed ?? false,
        updateNodeColor,
        updateNodeStyleInState,
        updateNodeSizeByFont,
        handleCodeBlockVisibilityChange,
        updateNodeStyleRealtime,
        handleNodeCollapseChange
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

    nodes.forEach((node) => {
      if (node.isCollapsed) {
        const nodeElement = nodesMap[node.id];
        if (nodeElement) {
          nodeElement.attr('body/visibility', 'hidden');
          nodeElement.attr('body/pointer-events', 'none');
          nodeElement.attr('body/stroke-dasharray', '5,5');
        }

        // Скрываем все связанные ссылки
        const links = graph.getLinks();
        links.forEach(link => {
          const sourceId = link.getSourceElement()?.backId;
          const targetId = link.getTargetElement()?.backId;

          if (sourceId === node.id || targetId === node.id) {
            link.attr('line/visibility', 'hidden');
          }
        });
      }
    });

    paper.on('element:pointerup', async function (elementView) {
      const element = elementView.model;
      const position = element.position();

      try {
        await PatchNode(element.backId, {
          x: position.x,
          y: position.y,
          width: element.size().width,
          height: element.size().height
        });
        await moveNode(mapId, element.backId, position.x, position.y);
        await updateNodeSize(element.backId, element.size().width, element.size().height);
      } catch (error) {
        console.error('Ошибка сохранения позиции:', error);
      }
    });

    let currentElementView = null;
    const deleteButtonTool = new DeleteButton();
    const addButtonTool = new AddButton();

    paper.on('element:pointerdown', async function (elementView) {
      editingNodeRef.current = null;
      await requestLock(elementView.model.backId);
    })
    
    paper.on('element:pointerclick', async function (elementView) {
      window.dispatchEvent(
        new CustomEvent('mindhub:active-node-changed', {
          detail: { nodeId: String(elementView.model.backId) }
        })
      );

      if (currentElementView && currentElementView !== elementView) {
        currentElementView.removeTools();
        setEditingNode(null);
        await releaseLock(currentElementView.model.backId);
      }
      const links = graph.getLinks();
      elementView.addTools(new dia.ToolsView({
        tools: [
          addButtonTool
        ]
      }));
      if (links.some(link => link.getTargetElement() === elementView.model))
        elementView.addTools(new dia.ToolsView({
          tools: [
            deleteButtonTool,
            addButtonTool
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
      window.dispatchEvent(
        new CustomEvent('mindhub:active-node-changed', {
          detail: { nodeId: null }
        })
      );
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
    requestAnimationFrame(() => {
      if (titleInputRef.current) {
        titleInputRef.current.style.height = 'auto';
        titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
      }
    });
  };

  const handleInputBlur = async () => {
    if (editingNode) {
      editingNode.attr('label', { text: inputValue });
      await PatchNode(editingNode.backId, { title: inputValue });
      await updateNodeName(editingNode.backId, inputValue);
      await releaseLock(editingNode.backId);
      setEditingNode(null);
      editingNodeRef.current = null;
      setInputValue('');
    }
  };

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        event.preventDefault();
        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;
        const nextValue = `${inputValue.substring(0, start)}\n${inputValue.substring(end)}`;
        setInputValue(nextValue);
        setTimeout(() => {
          event.target.selectionStart = event.target.selectionEnd = start + 1;
          if (titleInputRef.current) {
            titleInputRef.current.style.height = 'auto';
            titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
          }
        }, 0);
        return;
      }

      event.preventDefault();
      if (editingNode) {
        const elementView = paperInstance.current.findViewByModel(editingNode);
        editingNode.attr('label', { text: inputValue });

        if (elementView) {
          const cardNameElement = elementView.el.querySelector('.card_name');
          cardNameElement.textContent = inputValue;
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

  useEffect(() => {
    if (!editingNode || !paperInstance.current || !paperRef.current) return;

    const updateEditorPosition = () => {
      const paper = paperInstance.current;
      const paperRect = paperRef.current.getBoundingClientRect();

      const pos = editingNode.position();
      const size = editingNode.size();

      const translation = paper.translate();
      const scaleState = paper.scale();

      const scaleX = scaleState?.sx ?? 1;
      const scaleY = scaleState?.sy ?? 1;

      const screenLeft =
        paperRect.left + translation.tx + pos.x * scaleX;

      const screenTop =
        paperRect.top + translation.ty + pos.y * scaleY;

      const screenWidth = size.width * scaleX;

      setEditorPosition({
        left: screenLeft + 8,
        top: screenTop + 8,
        width: Math.max(80, screenWidth - 32),
        height: 20
      });
    };

    updateEditorPosition();
    const intervalId = window.setInterval(updateEditorPosition, 80);
    window.addEventListener('resize', updateEditorPosition);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('resize', updateEditorPosition);
    };
  }, [editingNode]);

  useEffect(() => {
    if (!editingNode) return;
    requestAnimationFrame(() => {
      if (titleInputRef.current) {
        titleInputRef.current.style.height = 'auto';
        titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
      }
    });
  }, [editingNode, inputValue]);

  const inputStyle = {
    position: 'absolute',
    zIndex: 1000,
    padding: '5px'
  };

  const lightenColor = (hex, percent = 20) => {
    const num = parseInt(hex.replace('#', ''), 16);

    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const nodeColor =
  editingNode?.attr('body/fill') || '#ffffff';
  const inputBg = lightenColor(nodeColor, 35);
  

  return (
    <>
      <NavigationBar 
        nodes={nodes}
        onNodesUpdate={handleNodesUpdate}
        onLoading={handleAILoading}
        onError={handleAIError}
      />
      
      
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
          ref={titleInputRef}
          className='node_input'
          style={{ 
            ...inputStyle, 
            width: editorPosition.width, 
            top: editorPosition.top, 
            left: editorPosition.left,
            backgroundColor: inputBg }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          wrap="off"
          rows={1}
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
  initialWidth = 180,
  initialHeight = 70,
  initialIsCodeBlockOpen = false,
  initialIsCollapsed = false,
  onNodeColorChange = null,
  onNodeStyleChange = null,
  onNodeFontSizeChange = null,
  onCodeBlockVisibilityChange = null,
  onNodeStyleRealtime = null,
  onNodeCollapseChange = null
) {
  const node = new Card();
  node.position(position.x, position.y);
  node.resize(initialWidth || 180, initialHeight || 70);
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
  nameContainer.style.position = 'relative';
  nameContainer.style.width = '100%';
  nameContainer.style.height = '100%';
  nameContainer.style.boxSizing = 'border-box';
  nameContainer.style.paddingRight = '18px';
  nameContainer.style.paddingBottom = '18px';

  const contentContainer = document.createElement('div');
  contentContainer.style.width = '100%';
  contentContainer.style.boxSizing = 'border-box';
  contentContainer.style.minWidth = '120px';
  contentContainer.style.minHeight = '40px';
  contentContainer.style.maxHeight = 'none';
  contentContainer.style.overflow = 'visible';

  const resizeHandle = document.createElement('div');
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.right = '0px';
  resizeHandle.style.bottom = '0px';
  resizeHandle.style.width = '14px';
  resizeHandle.style.height = '14px';
  resizeHandle.style.cursor = 'se-resize';
  resizeHandle.style.borderRight = '2px solid #9ca3af';
  resizeHandle.style.borderBottom = '2px solid #9ca3af';
  resizeHandle.style.borderRadius = '1px';
  resizeHandle.style.background = 'transparent';
  resizeHandle.style.zIndex = '5';

  let isResizing = false;
  let manualResizeEnabled = false;
  let autoResizePaused = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const onResizeMove = (event) => {
    if (!isResizing) return;

    const scaleState = paper.scale();
    const scaleX = scaleState?.sx || 1;
    const scaleY = scaleState?.sy || 1;
    const dx = (event.clientX - startX) / scaleX;
    const dy = (event.clientY - startY) / scaleY;
    const nextWidth = Math.max(170, startWidth + dx);
    const nextHeight = Math.max(70, startHeight + dy);
    node.resize(nextWidth, nextHeight);
  };

  const stopResize = () => {
    isResizing = false;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', stopResize);
  };

  resizeHandle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    manualResizeEnabled = true;
    isResizing = true;
    startX = event.clientX;
    startY = event.clientY;
    const currentSize = node.size();
    startWidth = currentSize.width;
    startHeight = currentSize.height;
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', stopResize);
  });

  const root = createRoot(contentContainer);
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
      initialIsCodeBlockOpen={initialIsCodeBlockOpen}
      initialIsCollapsed={initialIsCollapsed}
      onNodeColorChange={onNodeColorChange}
      onNodeStyleChange={onNodeStyleChange}
      onNodeFontSizeChange={onNodeFontSizeChange}
      onNodeStyleRealtime={onNodeStyleRealtime}
      onCodeBlockVisibilityChange={(currentNodeId, isVisible) => {
        autoResizePaused = isVisible;
        if (onCodeBlockVisibilityChange) {
          onCodeBlockVisibilityChange(currentNodeId, isVisible);
        }
      }}
      onNodeCollapseChange={onNodeCollapseChange}
    />
  );
  nameContainer.appendChild(contentContainer);
  nameContainer.appendChild(resizeHandle);
  foreignObject.appendChild(nameContainer);

  const resizeObserver = new ResizeObserver(() => {
    if (manualResizeEnabled || autoResizePaused) return;

    const contentHeight = Math.max(contentContainer.scrollHeight, 40);
    const currentSize = node.size();
    const heightWithPadding = contentHeight + 42;
    const nextWidth = Math.max(170, currentSize.width);
    const nextHeight = Math.max(70, heightWithPadding);

    if (
      Math.abs(currentSize.width - nextWidth) > 1 ||
      Math.abs(currentSize.height - nextHeight) > 1
    ) {
      node.resize(nextWidth, nextHeight);
    }
  });

  resizeObserver.observe(contentContainer);

  if (nodeId) {
    node.backId = nodeId;
    nodesMap.current[nodeId] = node;
  }
  return node;
}

export default Map;
