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
      width: 10000,
      height: 10000,
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

    var toolsView = new dia.ToolsView({
      tools: [
        plusButton,
        plusButtonBottom // Adding a second button for the bottom position
      ]
    });

    var rect1 = CreateElement("Hello", graph, {x:100, y:100})
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
    backgroundColor: '#fff',
    width: 100
  };

  return (
    <>
      <div id="paper" ref={paperRef}></div>
      {editingNode && (
          <input
            type="text"
            style={{ ...inputStyle, top: editingNode.position().y + 10, left: editingNode.position().x + 10}}
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


function CreateElement(innertext, graph, position)
{
  const rect1 = new shapes.standard.Rectangle();
  rect1.position(position.x, position.y);
  rect1.resize(180, 50);
  rect1.addTo(graph);

  rect1.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
  rect1.attr('label', { text: innertext, fill: '#353535' });

  return rect1;
}

export default Map;
