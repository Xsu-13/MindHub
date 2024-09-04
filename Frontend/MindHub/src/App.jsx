import { useEffect } from 'react';
import './App.css'
import { dia, shapes } from '@joint/core';

function App() {
  useEffect(() => {
    const namespace = shapes;

  const graph = new dia.Graph({}, { cellNamespace: namespace });

  const paper = new dia.Paper({
      el: document.getElementById('paper'),
      model: graph,
      width: 10000,
      height: 10000,
      background: { color: '#F5F5F5' },
      cellViewNamespace: namespace
  });

  

  const rect1 = new shapes.standard.Rectangle();
  rect1.position(25, 25);
  rect1.resize(180, 50);
  rect1.addTo(graph);

  const rect2 = new shapes.standard.Rectangle();
  rect2.position(95, 225);
  rect2.resize(180, 50);
  rect2.attr({
    body: {
        rx: 10, // add a corner radius
        ry: 10,
        fill: '#197575'
    },
    label: {
      textAnchor: 'left', // align text to left
      x: 10, // offset text from right edge of model bbox
      fill: '#fff',
      fontSize: 18
  }
});
  rect2.addTo(graph);

  const link = new shapes.standard.Link();
link.source(rect1);
link.target(rect2);
link.addTo(graph);

  rect1.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });
  rect2.attr('body', { stroke: '#C94A46', rx: 2, ry: 2 });

  rect1.attr('label', { text: 'Hello', fill: '#353535' });
  rect2.attr('label', { text: 'World!', fill: '#353535' });
  }, []);

  

  return (
    <>
      <div id="paper"></div>
    </>
  )
}

export default App
