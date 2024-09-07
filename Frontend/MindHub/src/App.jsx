// import { useEffect } from 'react';
// import './App.css'
// import { dia, shapes, layout } from '@joint/core';

// function App() {
//   useEffect(() => {
//     const namespace = shapes;

//   const graph = new dia.Graph({}, { cellNamespace: namespace });

//   const paper = new dia.Paper({
//       el: document.getElementById('paper'),
//       model: graph,
//       width: 10000,
//       height: 10000,
//       cellViewNamespace: namespace
//   });

  

//   const rect1 = new shapes.standard.Rectangle();
//   rect1.position(25, 25);
//   rect1.resize(180, 50);
//   rect1.addTo(graph);

//   const rect2 = new shapes.standard.Rectangle();
//   rect2.position(95, 225);
//   rect2.resize(180, 50);
//   rect2.addTo(graph);

//   const rect3 = new shapes.standard.Rectangle();
//   rect3.resize(180, 50);
//   rect3.addTo(graph);

//   const rect4 = new shapes.standard.Rectangle();
//   rect4.resize(180, 50);
//   rect4.addTo(graph);

//   const link = new shapes.standard.Link();
//   link.source(rect4);
//   link.target(rect2);
//   link.addTo(graph);

//   link.router('orthogonal');
//   link.connector('rounded');

//   const link2 = new shapes.standard.Link();
//   link2.source(rect1);
//   link2.target(rect4);
//   link2.addTo(graph);

//   link2.router('orthogonal');
//   link2.connector('rounded');

//   const link3 = new shapes.standard.Link();
//   link3.source(rect1);
//   link3.target(rect3);
//   link3.addTo(graph);

//   link2.router('orthogonal');
//   link2.connector('rounded');

//   rect1.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
//   rect2.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });

//   rect1.attr('label', { text: 'Hello', fill: '#353535' });
//   rect2.attr('label', { text: 'World!', fill: '#353535' });

//   rect3.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
//   rect4.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });

//   rect3.attr('label', { text: 'Hi', fill: '#353535' });
//   rect4.attr('label', { text: 'greate', fill: '#353535' });

//   layout.ForceDirectedLayout.layout(graph, {
//     graph: graph,
//     width: 800, // ширина области раскладки
//     height: 600, // высота области раскладки
//     charge: 80, // "отталкивание" узлов друг от друга
//     linkDistance: 100, // минимальное расстояние между связанными узлами
//     gravityCenter: { x: 400, y: 300 } // центр тяжести, к которому будут притягиваться узлы
// });
//   }, []);

//   return (
//     <>
//       <div id="paper"></div>
//     </>
//   )
// }

// export default App


import { useEffect } from 'react';
import './App.css';
import { dia, shapes } from '@joint/core';

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
    rect2.position(0, 0);
    rect2.resize(180, 50);
    rect2.addTo(graph);

    const rect3 = new shapes.standard.Rectangle();
    rect3.position(0, 0);
    rect3.resize(180, 50);
    rect3.addTo(graph);

    const rect4 = new shapes.standard.Rectangle();
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

    // Определение класса ForceDirectedLayout
    class ForceDirectedLayout {
      constructor(graph, options) {
        this.graph = graph;
        this.width = options.width;
        this.height = options.height;
        this.charge = options.charge || -400;
        this.linkDistance = options.linkDistance || 100;
        this.gravityCenter = options.gravityCenter || { x: this.width / 2, y: this.height / 2 };
        this.iterations = options.iterations || 300;
        this.nodePositions = new Map(); // To store original positions
      }
    
      run() {
        const nodes = this.graph.getElements();
        const links = this.graph.getLinks();
    
        // Store initial positions
        nodes.forEach(node => {
          this.nodePositions.set(node, { x: node.position().x, y: node.position().y });
        });
    
        for (let i = 0; i < this.iterations; i++) {
          this.applyForces(nodes, links);
          this.updatePositions(nodes);
        }
      }
    
      applyForces(nodes, links) {
        nodes.forEach(node => {
          const { x, y } = node.position();
          node.fx = 0;
          node.fy = 0;
      
          // Apply repulsive forces
          nodes.forEach(other => {
            if (node !== other) {
              const otherPos = other.position();
              const dx = x - otherPos.x;
              const dy = y - otherPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = this.charge / (distance * distance);
              node.fx += (force * dx) / distance;
              node.fy += (force * dy) / distance;
            }
          });
      
          // Apply attractive forces
          links.forEach(link => {
            if (link.source() === node || link.target() === node) {
              const target = (link.source() === node) ? link.target() : link.source();
              const targetPos = target.position();
              const dx = x - targetPos.x;
              const dy = y - targetPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = (distance - this.linkDistance);
              node.fx -= (force * dx) / distance;
              node.fy -= (force * dy) / distance;
            }
          });
      
          // Apply gravity
          const dx = this.gravityCenter.x - x;
          const dy = this.gravityCenter.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          node.fx += (dx * 0.1) / distance;
          node.fy += (dy * 0.1) / distance;
        });
      }
      
    
      updatePositions(nodes) {
        nodes.forEach(node => {
          const pos = this.nodePositions.get(node);
          const newPos = {
            x: pos.x + node.fx,
            y: pos.y + node.fy
          };
      
          // Убедитесь, что узлы не выходят за пределы области
          newPos.x = Math.max(0, Math.min(this.width - node.size().width, newPos.x));
          newPos.y = Math.max(0, Math.min(this.height - node.size().height, newPos.y));
      
          node.position(newPos.x, newPos.y);
      
          // Обновите сохраненные позиции
          this.nodePositions.set(node, newPos);
        });
      }
      
    }
    

    // Применение Force-Directed Layout
    const layout = new ForceDirectedLayout(graph, {
      width: paper.options.width,
      height: paper.options.height,
      charge: -400, // Сила отталкивания узлов
      linkDistance: 150, // Расстояние между связанными узлами
      gravityCenter: { x: paper.options.width / 2, y: paper.options.height / 2 }, // Центр тяжести
      iterations: 300 // Количество итераций
    });

    layout.run();
  }, []);

  return (
    <>
      <div id="paper"></div>
    </>
  );
}

export default App;
