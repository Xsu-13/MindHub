import { useEffect, useState, useRef } from 'react';
import { elementTools, dia, shapes } from '@joint/core';
import { useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import "../styles/MapStyle.css";
import CardContent from './CardContent';
import { CreateNode, PatchNode, DeleteNode, GetNodesByMapId } from '../services/urls.js';

const Card = dia.Element.define('example.ForeignObject', {
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

  const mapId = location.state?.mapId;

  useEffect(() => {
    const GetNodes = async (mapId) => {
      const nodesData = await GetNodesByMapId(mapId);
      if (Array.isArray(nodesData.data)) {
        setNodes(nodesData.data);
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
            currentElement.remove();
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

          const newRect = CreateElement("New Node", paper, graph, {x:newX, y:newY}, "#FFFFFF", node.data.id);

          const newLink = new shapes.standard.Link();
          newLink.source(currentElement);
          newLink.target(newRect);
          newLink.addTo(graph);
          
        }
      }
    });

    var plusButton = new elementTools.PlusButton({
      x: '100%',
      y: '50%',
      offset: { x: 10, y: 0 },
      graph: graph
    });

    const deleteButtonTool = new deleteButton();

    var toolsView = new dia.ToolsView({
      tools: [
        plusButton,
        deleteButtonTool
        //resizeButton
      ]
    });

    const nodeMap = {};
    nodes.forEach((node) => {
      var newNode = CreateElement(node.title, paper, graph, {x: node.x, y: node.y}, node.style == null ? "#FFFFFF" : node.style.backgroundColor, node.id);
      nodeMap[node.id] = newNode; 
  });

  nodes.forEach((node) => {
    if (node.parentNodeId) {
      const parentNode = nodeMap[node.parentNodeId];
      const currentNode = nodeMap[node.id];
      if (parentNode && currentNode) {
        const newLink = new shapes.standard.Link();
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
    } catch (error) {
      console.error('Ошибка сохранения позиции:', error);
    }
  });

    paper.on('element:pointerclick', function (elementView) {
      elementView.addTools(toolsView);
      //elementView.addTools(new elementTools.Control());
    });

    paper.on('element:pointerdblclick', function (elementView) {
      console.log(elementView)

      setEditingNode(elementView.model);
      setInputValue(elementView.model.attr('label/text'));
  });
  }, [nodes]);

   const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    if (editingNode) {
      editingNode.attr('label', { text: inputValue });
      setEditingNode(null);
      setInputValue('');
    }
  };

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter') {
      if (editingNode) {
        const elementView = paperInstance.current.findViewByModel(editingNode);

        if (elementView) {
          const cardNameElement = elementView.el.querySelector('.card_name');
          cardNameElement.innerHTML = inputValue;
        }
        setEditingNode(null);
        setInputValue('');

        await PatchNode(editingNode.backId, {title: inputValue});
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
      {editingNode && (
          <input
            type="text"
            style={{ ...inputStyle, width: 150, top: editingNode.position().y + 10, left: editingNode.position().x + 10}}
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


function CreateElement(innertext, paper, graph, position, backgroundColor = "#FFFFFF", nodeId)
{
  const rect1 = new Card();
  rect1.position(position.x, position.y);
  rect1.resize(180, 50);
  rect1.addTo(graph);

  rect1.attr('body', { stroke: '#C94A46', fill: backgroundColor, rx: 2, ry: 2 });
  rect1.attr('label', { text: innertext, fill: '#353535' });

  let nodeElement = paper.findViewByModel(rect1).el;
   let foreignObject = nodeElement.querySelector('foreignObject');

    let nameContainer = document.createElement('div');
    let root1 = createRoot(nameContainer);
    root1.render(<CardContent initialName={innertext} />);

    foreignObject.appendChild(nameContainer);

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = nameContainer.getBoundingClientRect();
      // Изменяем размер узла в зависимости от содержимого
      rect1.resize(width + 12, height + 40);
    });

    resizeObserver.observe(nameContainer);

  if(nodeId)
  {
    rect1.backId = nodeId;
  }
  return rect1;
}

export default Map;
