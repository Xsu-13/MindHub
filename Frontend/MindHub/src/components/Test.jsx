import React, { useEffect, useRef } from 'react';
import { dia, shapes } from '@joint/core';
import "../styles/MapStyle.css";
import { createRoot } from 'react-dom/client';
import EditableCodeBlock from './EditableCodeBlock';
import CardContent from './CardContent';



const MyJointJSComponent = () => {
  

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

  useEffect(() => {

    const graph = new dia.Graph();
  const paper = new dia.Paper({
    el: document.getElementById('my-paper'),
    model: graph,
    width: 800,
    height: 600,
    gridSize: 10,
  });

const node = new Card();
    node.position(100, 30);
    node.resize(300, 200);
    node.addTo(graph);

    const rect1 = new Card();
    rect1.position(300, 300);
    rect1.resize(200, 200);
    rect1.addTo(graph);

    rect1.attr('body', { stroke: '#C94A46', fill: "#353535", rx: 2, ry: 2 });
    rect1.attr('label', { text: "Hey", fill: '#FFFFFF' });

   let nodeElement = paper.findViewByModel(rect1).el;
   let foreignObject = nodeElement.querySelector('foreignObject');

    let nameContainer = document.createElement('div');
    let root1 = createRoot(nameContainer);
    root1.render(<CardContent />);

    foreignObject.appendChild(nameContainer);

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = nameContainer.getBoundingClientRect();
      // Изменяем размер узла в зависимости от содержимого
      rect1.resize(width + 12, height + 40); // +12 для отступов
    });

    resizeObserver.observe(nameContainer);
  }, []);

  return <div id="my-paper" />;
};

export default MyJointJSComponent;