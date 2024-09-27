import React, { useEffect, useRef } from 'react';
import { dia, shapes } from '@joint/core';
import "../styles/MapStyle.css";
import { createRoot } from 'react-dom/client';
import EditableCodeBlock from './EditableCodeBlock'; // Ваш компонент



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

const node = new Card(); // Правильное использование типа узла
    node.position(100, 30);
    node.resize(300, 200);
    node.addTo(graph);

    // Находим элемент foreignObject для рендеринга
    const nodeElement = paper.findViewByModel(node).el;
    const foreignObject = nodeElement.querySelector('foreignObject');

    // Создание контейнера для React компонента
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    // Рендеринг вашего компонента внутри созданного контейнера
    const root = createRoot(container);
    root.render(<EditableCodeBlock />);

    // Добавляем контейнер в foreignObject
    foreignObject.appendChild(container);
  }, []);

  return <div id="my-paper" />;
};

export default MyJointJSComponent;