import { useRef, useEffect } from 'react';
import { dia, shapes } from '@joint/core';

export const usePaper = (onElementClick, onElementDoubleClick, onElementMove) => {
  const paperRef = useRef(null);
  const paperInstance = useRef(null);
  const graphInstance = useRef(null);
  const zoomScaleRef = useRef(1);

  useEffect(() => {
    const graph = new dia.Graph({}, { cellNamespace: shapes });
    graphInstance.current = graph;

    const paper = new dia.Paper({
      el: paperRef.current,
      model: graph,
      width: '100%',
      height: window.innerHeight - 70,
      background: { color: '#F5F5F5' },
      cellViewNamespace: shapes,
      preventDefaultViewAction: false
    });

    paperInstance.current = paper;
    const panZoomCleanup = setupPanAndZoom(paper);
    setupEventHandlers(paper, onElementClick, onElementDoubleClick, onElementMove);

    return () => {
      panZoomCleanup?.();
      cleanup(paper);
    };
  }, [onElementClick, onElementDoubleClick, onElementMove]);

  const setupPanAndZoom = (paper) => {
    let isPanning = false;
    let panStart = { x: 0, y: 0 };

    paper.on('blank:pointerdown', (evt) => {
      isPanning = true;
      panStart = { x: evt.clientX, y: evt.clientY };
      paper.el.style.cursor = 'grabbing';
    });

    paper.on('blank:pointermove', (evt) => {
      if (!isPanning) return;
      const dx = evt.clientX - panStart.x;
      const dy = evt.clientY - panStart.y;
      const translation = paper.translate();
      paper.translate(translation.tx + dx, translation.ty + dy);
      panStart = { x: evt.clientX, y: evt.clientY };
    });

    const stopPanning = () => {
      isPanning = false;
      paper.el.style.cursor = 'default';
    };

    paper.on('blank:pointerup', stopPanning);
    window.addEventListener('mouseup', stopPanning);

    // Zoom logic
    const handleWheel = (event) => {
      event.preventDefault();
      const currentScale = zoomScaleRef.current;
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(2.5, Math.max(0.4, currentScale + delta));
      if (newScale === currentScale) return;

      const rect = paper.el.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const translation = paper.translate();
      const worldX = (offsetX - translation.tx) / currentScale;
      const worldY = (offsetY - translation.ty) / currentScale;
      const nextTx = offsetX - worldX * newScale;
      const nextTy = offsetY - worldY * newScale;

      paper.scale(newScale, newScale);
      paper.translate(nextTx, nextTy);
      zoomScaleRef.current = newScale;
    };

    paper.el.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('mouseup', stopPanning);
      paper.el.removeEventListener('wheel', handleWheel);
    };
  };

  const setupEventHandlers = (paper, onClick, onDoubleClick, onMove) => {
    paper.on('element:pointerclick', onClick);
    paper.on('element:pointerdblclick', onDoubleClick);
    paper.on('element:pointerup', onMove);
  };

  const cleanup = (paper) => {
    paper.remove();
  };

  return { paperRef, paperInstance, graphInstance, zoomScaleRef };
};