import { dia } from '@joint/core';

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