import { useEffect } from 'react';
import './App.css';
import { dia, shapes } from '@joint/core';
import * as d3 from 'd3';

function App() {
  useEffect(() => {
    const namespace = shapes;

    // Создание графа
    const graph = new dia.Graph({}, { cellNamespace: namespace });

    // Настройка paper
    const paper = new dia.Paper({
      el: document.getElementById('paper'),
      model: graph,
      width: 10000,
      height: 10000,
      cellViewNamespace: namespace
    });

    // Создание узлов
    const rect1 = new shapes.standard.Rectangle();
    rect1.position(0, 0);
    rect1.resize(180, 50);
    rect1.addTo(graph);

    const rect2 = new shapes.standard.Rectangle();
    rect2.position(200, 0);
    rect2.resize(180, 50);
    rect2.addTo(graph);

    const rect3 = new shapes.standard.Rectangle();
    rect3.position(400, 0);
    rect3.resize(180, 50);
    rect3.addTo(graph);

    const rect4 = new shapes.standard.Rectangle();
    rect4.position(600, 0);
    rect4.resize(180, 50);
    rect4.addTo(graph);

    // Создание связей
    const link = new shapes.standard.Link();
    link.source(rect4);
    link.target(rect2);
    link.addTo(graph);
    link.router('orthogonal');
    link.connector('rounded');

    const link2 = new shapes.standard.Link();
    link2.source(rect1);
    link2.target(rect4);
    link2.addTo(graph);
    link2.router('orthogonal');
    link2.connector('rounded');

    const link3 = new shapes.standard.Link();
    link3.source(rect1);
    link3.target(rect3);
    link3.addTo(graph);
    link3.router('orthogonal');
    link3.connector('rounded');

    rect1.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
    rect2.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
    rect1.attr('label', { text: 'Hello', fill: '#353535' });
    rect2.attr('label', { text: 'World!', fill: '#353535' });
    rect3.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
    rect4.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
    rect3.attr('label', { text: 'Hi', fill: '#353535' });
    rect4.attr('label', { text: 'great', fill: '#353535' });

    // Преобразование узлов и связей для d3
    const nodes = graph.getCells().filter(cell => cell.isElement()).map(cell => ({
      id: cell.id,
      x: cell.position().x,
      y: cell.position().y
    }));

    const links = graph.getLinks().map(link => ({
      source: link.get('source').id,
      target: link.get('target').id
    }));

    // Создание Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(300)) // Увеличение расстояния между связанными узлами
      .force('charge', d3.forceManyBody().strength(-1000)) // Увеличение силы отталкивания узлов
      .force('collide', d3.forceCollide().radius(100)) // Увеличение радиуса для предотвращения пересечений
      .force('center', d3.forceCenter(500, 300));

    simulation.on('tick', () => {
      nodes.forEach(node => {
        const view = paper.findViewByModel(graph.getCell(node.id));
        if (view) {
          view.model.position(node.x, node.y);
        }
      });
    });

  }, []);

  return (
    <>
      <div id="paper"></div>
    </>
  );
}

export default App;
