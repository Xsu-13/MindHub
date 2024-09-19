import { createElement, useEffect, useState, useRef } from 'react';
import { elementTools, dia, shapes } from '@joint/core';
import "../styles/MapStyle.css";

function Map() {
  const paperRef = useRef(null);
  const [editingNode, setEditingNode] = useState(null);
  const [inputValue, setInputValue] = useState('');

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

    elementTools.PlusButton = elementTools.Button.extend({
      name: 'plus-button',
      options: {
        markup: [{
          tagName: 'circle',
          selector: 'button',
          attributes: {
            'r': 7,
            'fill': '#FF0000', // Red fill for the button
            'cursor': 'pointer'
          }
        }, {
          tagName: 'text',
          selector: 'icon',
          attributes: {
            'text-anchor': 'middle',
            'y': '0.3em',
            'fill': '#FFFFFF', // White plus icon color
            'font-size': 14,
            'pointer-events': 'none'
          },
          textContent: '+' // Plus sign
        }],
        x: '100%',
        y: '100%',
        offset: {
          x: 0,
          y: 10
        },
        rotate: true,
        action: function (evt) {
          //alert('Clicked on: ' + this.model.id);
          const currentElement = this.model;
          const position = currentElement.position();
          const newX = position.x + 250; // Position the new element to the right
          const newY = position.y + 50;  // Adjust Y if necessary

          // Create a new rectangle element
          const newRect = CreateElement("New Node", graph, {x:newX, y:newY});

          // Create a link between the current element and the new one
          const newLink = new shapes.standard.Link();
          newLink.source(currentElement);
          newLink.target(newRect);
          newLink.addTo(graph);
        }
      }
    });

    elementTools.Resize = elementTools.Button.extend({
      name: 'resize',
      options: {
        // Define the markup for the resize tool
        markup: [{
          tagName: 'rect',
          selector: 'background',
          attributes: {
            'fill': 'white',
            'stroke': '#333333',
            'stroke-width': 1,
            'pointer-events': 'all',
            'cursor': 'nwse-resize'
          }
        }, {
          tagName: 'path',
          selector: 'handle',
          attributes: {
            'd': 'M0,0 L8,0 L8,8 L0,8 Z',
            'fill': '#333333',
            'cursor': 'nwse-resize'
          }
        }],
        // Define the size and position of the resize tool
        size: { width: 10, height: 10 },
        position: { x: '100%', y: '100%', offset: { x: -5, y: -5 } },
        // Define the resize behavior
        action: function(evt, x, y) {
          const element = this.model;
          const boundingBox = element.getBBox();
          const newWidth = x - boundingBox.x;
          const newHeight = y - boundingBox.y;
          if (newWidth > 0 && newHeight > 0) {
            element.resize(newWidth, newHeight);
          }
        }
      }
    });

    var plusButton = new elementTools.PlusButton({
      x: '100%',
      y: '50%',
      offset: { x: 10, y: 0 },
      graph: graph // Adjust positioning for the button on the right
    });

    var plusButtonBottom = new elementTools.PlusButton({
      x: '50%',
      y: '100%',
      offset: { x: 0, y: 10 },
      graph: graph // Adjust positioning for the button at the bottom
    });

    var resizeButton = new elementTools.Resize();

    var toolsView = new dia.ToolsView({
      tools: [
        plusButton,
        plusButtonBottom, // Adding a second button for the bottom position
        //resizeButton
      ]
    });

    var rect1 = CreateElement("Hello", graph, {x:window.innerWidth/2 - 50, y:window.innerHeight/2 - 50}, "#ff5252")
    var rect2 = CreateElement("World", graph, {x:300, y:300})

    const link = new shapes.standard.Link();
    link.source(rect1);
    link.target(rect2);
    link.addTo(graph);

    paper.on('element:pointerclick', function (elementView) {
      elementView.addTools(toolsView);
      //elementView.addTools(new elementTools.Control());
    });

    paper.on('element:pointerdblclick', function (elementView) {
      console.log(elementView)
      // Показать ввод для редактирования
      setEditingNode(elementView.model);
      setInputValue(elementView.model.attr('label/text'));
  });
  }, []);

   // Handle input change
   const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (editingNode) {
      editingNode.attr('label', { text: inputValue });
      setEditingNode(null);
      setInputValue('');
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (editingNode) {
        editingNode.attr('label', { text: inputValue });
        setEditingNode(null);
        setInputValue('');
      }
    }
  };
  // Create an input element for editing
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


function CreateElement(innertext, graph, position, backgroundColor = "#FFFFFF")
{
  const rect1 = new shapes.standard.Rectangle();
  rect1.position(position.x, position.y);
  rect1.resize(180, 50);
  rect1.addTo(graph);

  rect1.attr('body', { stroke: '#C94A46', fill: backgroundColor, rx: 2, ry: 2 });
  rect1.attr('label', { text: innertext, fill: '#353535' });

  return rect1;
}

export default Map;
