class ForceDirectedLayout {
    constructor(graph, options) {
      this.graph = graph;
      this.width = options.width;
      this.height = options.height;
      this.charge = options.charge || -400;
      this.linkDistance = options.linkDistance || 100;
      this.gravityCenter = options.gravityCenter || { x: this.width / 2, y: this.height / 2 };
      this.iterations = options.iterations || 300;
    }
  
    run() {
      const nodes = this.graph.getElements();
      const links = this.graph.getLinks();
  
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
            const force = this.charge / (distance * distance) || 0;
            node.fx += (force * dx) / distance;
            node.fy += (force * dy) / distance;
          }
        });
  
        // Apply attractive forces
        links.forEach(link => {
          if (link.getSource() === node || link.getTarget() === node) {
            const target = (link.getSource() === node) ? link.getTarget() : link.getSource();
            const targetPos = target.position();
            const dx = x - targetPos.x;
            const dy = y - targetPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (distance - this.linkDistance) || 0;
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
        const newPos = {
          x: node.position().x + node.fx * 0.1,
          y: node.position().y + node.fy * 0.1
        };
        node.position(newPos.x, newPos.y);
        // Optionally, you can add boundary constraints to prevent nodes from moving outside the view area
        node.position(Math.max(0, Math.min(this.width, newPos.x)), Math.max(0, Math.min(this.height, newPos.y)));
      });
    }
  }
  