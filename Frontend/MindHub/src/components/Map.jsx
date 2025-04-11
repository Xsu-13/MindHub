import { useEffect, useState, useRef } from 'react';
import { elementTools, dia, shapes } from '@joint/core';
import { useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import "../styles/MapStyle.css";
import CardContent from './CardContent';
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
      height: window.innerHeight - 10,
      background: { color: '#F5F5F5' },
      cellViewNamespace: namespace,
      preventDefaultViewAction: false
    });

    paperInstance.current = paper;
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
            await DeleteNode(currentElement.backId);
            await removeNode(currentElement.backId);
            currentElement.remove();
            delete nodesMap.current[currentElement.backId];
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
              fontFamily: "Sans"
            }
          });

          await addNode(node.data.id, newX, newY, currentElement.backId);

          const newRect = CreateElement(nodesMap, mapId, "New Node", paper, graph, { x: newX, y: newY }, "#FFFFFF", node.data.id);

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
      var newNode = CreateElement(nodesMap, mapId, node.title, paper, graph, { x: node.x, y: node.y }, node.style == null ? "#FFFFFF" : node.style.backgroundColor, node.id, node.content);
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
      <div id="paper" ref={paperRef}></div>
      <MouseTracker></MouseTracker>
      {editingNode && (
        <textarea
          type="text"
          className='node_input'
          style={{ ...inputStyle, width: 150, top: editingNode.position().y + 20, left: editingNode.position().x + 20 }}
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

export function CreateElement(nodesMap, mapId, innertext, paper, graph, position, backgroundColor = "#FFFFFF", nodeId, initialCode = '', isLocked = false) {
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
  root.render(<CardContent mapId={mapId} initialName={innertext} initialCode={initialCode} initCardId={nodeId} />);
  foreignObject.appendChild(nameContainer);

  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = nameContainer.getBoundingClientRect();
    node.resize(width + 12, height + 40);
  });

  resizeObserver.observe(nameContainer);

  if (nodeId) {
    node.backId = nodeId;
    nodesMap.current[nodeId] = node;
  }
  return node;
}

export default Map;
