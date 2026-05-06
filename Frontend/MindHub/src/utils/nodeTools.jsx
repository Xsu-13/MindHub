import { elementTools, dia, shapes } from '@joint/core';

export const createDeleteButton = (removeNode, deleteNode, nodesList, nodesMap, setNodes) => {
  return elementTools.Button.extend({
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
            const targetId = currentElement.backId;
            const allNodes = nodesList.current || [];
            const idsToDelete = new Set([targetId]);
            const stack = [targetId];

            while (stack.length > 0) {
              const currentId = stack.pop();
              allNodes
                .filter((node) => node.parentNodeId === currentId)
                .forEach((child) => {
                  if (!idsToDelete.has(child.id)) {
                    idsToDelete.add(child.id);
                    stack.push(child.id);
                  }
                });
            }

            // Удаляем элементы с визуально БЕЗ изменения состояния сразу
            for (const idToDelete of idsToDelete) {
              const nodeView = nodesMap.current[idToDelete];
              if (nodeView) {
                nodeView.remove();
                delete nodesMap.current[idToDelete];
              }
            }

            // Затем удаляем с бэкенда и обновляем состояние с задержкой
            await deleteNode(targetId);
            
            for (const idToDelete of idsToDelete) {
              await removeNode(idToDelete);
            }

            // Обновляем состояние после визуального удаления
            // Используем requestAnimationFrame для плавного обновления
            requestAnimationFrame(() => {
              const filteredNodes = allNodes.filter((node) => !idsToDelete.has(node.id));
              setNodes(filteredNodes);
              nodesList.current = filteredNodes;
            });
          } catch (error) {
            console.error('Ошибка удаления узла:', error);
          }
        }
      }
    }
  );
}

export const createAddButton = (
  createNode, 
  createElement, 
  addNode, 
  nodesMap, 
  mapId, 
  graph, 
  updateTreeVisibility,
  paper,
  nodesList,
  updateNodeColor,
  updateNodeStyleInState,
  updateNodeSizeByFont,
  handleCodeBlockVisibilityChange,
  updateNodeStyleRealtime,
  handleNodeCollapseChange
) => {
  return elementTools.Button.extend({
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
        y: '50%',
        offset: {
          x: 10,
          y: 0
        },
        graph: graph,
        rotate: true,
        action: async function (evt) {
          const currentElement = this.model;
          const position = currentElement.position();
          const newX = position.x + 250;
          const newY = position.y + 50;

          var node = await createNode({
            mapId: mapId,
            parentNodeId: currentElement.backId,
            title: "New Node",
            x: newX,
            y: newY,
            width: 180,
            height: 70,
            isCodeBlockOpen: false,
            content: "",
            style: {
              backgroundColor: "#FFFFFF",
              textColor: "#353535",
              borderColor: "#C94A46",
              fontFamily: "py",
              fontSize: 14
            }
          });

          await addNode(node.data.id, newX, newY, currentElement.backId);

          const newRect = createElement(
            nodesMap,
            mapId,
            "New Node",
            paper,
            graph,
            { x: newX, y: newY },
            "#FFFFFF",
            node.data.id,
            "",
            false,
            "py",
            14,
            "#FFFFFF",
            node.data?.style?.id ?? null,
            node.data?.width ?? 180,
            node.data?.height ?? 70,
            node.data?.isCodeBlockOpen ?? false,
            node.data?.isCollapsed ?? false,
            updateNodeColor,
            updateNodeStyleInState,
            updateNodeSizeByFont,
            handleCodeBlockVisibilityChange,
            updateNodeStyleRealtime,
            handleNodeCollapseChange
          );

          nodesList.current.push(node.data);


          const newLink = new shapes.standard.Link();
          newLink.set('z', -1);

          newLink.source({ id: currentElement.id });
          newLink.target({ id: newRect.id });

          newLink.addTo(graph);

          updateTreeVisibility();
        }
      }
    }
  );
}