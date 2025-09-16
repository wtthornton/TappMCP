/**
 * RequestFlowDiagram - Visual request processing flow
 * Uses D3.js to create animated Sankey diagram
 */

export class RequestFlowDiagram {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.svg = null;
    this.data = null;
    this.isAnimating = false;
  }

  async initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container with id '${this.containerId}' not found`);
    }

    this.setupEventListeners();
    this.renderLoading();
  }

  setupEventListeners() {
    // Animation button
    const animateBtn = this.container.querySelector('#flowAnimation');
    if (animateBtn) {
      animateBtn.addEventListener('click', () => {
        this.toggleAnimation();
      });
    }
  }

  update(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.data) {
      this.renderLoading();
      return;
    }

    this.createDiagram();
  }

  renderLoading() {
    const diagramContainer = this.container.querySelector('#requestFlowDiagram');
    if (diagramContainer) {
      diagramContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading request flow...</div>
        </div>
      `;
    }
  }

  createDiagram() {
    const diagramContainer = this.container.querySelector('#requestFlowDiagram');
    if (!diagramContainer) return;

    // Clear existing content
    diagramContainer.innerHTML = '<svg id="flowSvg"></svg>';
    this.svg = document.getElementById('flowSvg');

    if (!this.svg) return;

    // Set SVG dimensions
    const rect = diagramContainer.getBoundingClientRect();
    this.svg.setAttribute('width', rect.width);
    this.svg.setAttribute('height', rect.height);

    // Create flow diagram
    this.drawFlowDiagram();
  }

  drawFlowDiagram() {
    if (!this.svg || !this.data) return;

    const width = this.svg.getAttribute('width');
    const height = this.svg.getAttribute('height');

    // Clear existing content
    this.svg.innerHTML = '';

    // Create flow nodes
    const nodes = this.createFlowNodes(width, height);

    // Create flow connections
    const connections = this.createFlowConnections(nodes);

    // Draw the diagram
    this.drawNodes(nodes);
    this.drawConnections(connections);
  }

  createFlowNodes(width, height) {
    const nodes = [
      {
        id: 'incoming',
        label: 'Incoming Requests',
        x: 50,
        y: height / 2,
        width: 120,
        height: 60,
        color: '#4facfe',
        count: this.data.totalRequests || 0
      },
      {
        id: 'processing',
        label: 'Processing',
        x: width / 2 - 60,
        y: height / 2,
        width: 120,
        height: 60,
        color: '#00ff88',
        count: Math.floor((this.data.totalRequests || 0) * 0.9)
      },
      {
        id: 'success',
        label: 'Success',
        x: width - 170,
        y: height / 2 - 40,
        width: 120,
        height: 60,
        color: '#00ff88',
        count: Math.floor((this.data.totalRequests || 0) * (this.data.successRate || 0.85))
      },
      {
        id: 'error',
        label: 'Error',
        x: width - 170,
        y: height / 2 + 40,
        width: 120,
        height: 60,
        color: '#ff4444',
        count: Math.floor((this.data.totalRequests || 0) * (this.data.errorRate || 0.15))
      }
    ];

    return nodes;
  }

  createFlowConnections(nodes) {
    return [
      {
        from: nodes[0],
        to: nodes[1],
        width: 5,
        color: '#4facfe'
      },
      {
        from: nodes[1],
        to: nodes[2],
        width: 4,
        color: '#00ff88'
      },
      {
        from: nodes[1],
        to: nodes[3],
        width: 1,
        color: '#ff4444'
      }
    ];
  }

  drawNodes(nodes) {
    nodes.forEach(node => {
      // Create group for node
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'flow-node');

      // Create rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x);
      rect.setAttribute('y', node.y - node.height / 2);
      rect.setAttribute('width', node.width);
      rect.setAttribute('height', node.height);
      rect.setAttribute('fill', node.color);
      rect.setAttribute('rx', '8');
      rect.setAttribute('stroke', '#2a2a2a');
      rect.setAttribute('stroke-width', '2');

      // Create text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + node.width / 2);
      text.setAttribute('y', node.y - 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      text.textContent = node.label;

      // Create count text
      const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      countText.setAttribute('x', node.x + node.width / 2);
      countText.setAttribute('y', node.y + 15);
      countText.setAttribute('text-anchor', 'middle');
      countText.setAttribute('fill', '#b0b0b0');
      countText.setAttribute('font-size', '10');
      countText.textContent = `${node.count} req/s`;

      group.appendChild(rect);
      group.appendChild(text);
      group.appendChild(countText);
      this.svg.appendChild(group);
    });
  }

  drawConnections(connections) {
    connections.forEach(conn => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      const fromX = conn.from.x + conn.from.width;
      const fromY = conn.from.y;
      const toX = conn.to.x;
      const toY = conn.to.y;

      const controlX1 = fromX + (toX - fromX) * 0.5;
      const controlY1 = fromY;
      const controlX2 = fromX + (toX - fromX) * 0.5;
      const controlY2 = toY;

      const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

      path.setAttribute('d', pathData);
      path.setAttribute('stroke', conn.color);
      path.setAttribute('stroke-width', conn.width);
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.7');

      this.svg.appendChild(path);
    });
  }

  toggleAnimation() {
    this.isAnimating = !this.isAnimating;

    const animateBtn = this.container.querySelector('#flowAnimation');
    if (animateBtn) {
      animateBtn.textContent = this.isAnimating ? '⏸️ Pause' : '▶️ Animate';
    }

    if (this.isAnimating) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  startAnimation() {
    // Add pulsing animation to nodes
    const nodes = this.svg.querySelectorAll('.flow-node rect');
    nodes.forEach((node, index) => {
      node.style.animation = `pulse 2s infinite ${index * 0.5}s`;
    });
  }

  stopAnimation() {
    // Remove animation
    const nodes = this.svg.querySelectorAll('.flow-node rect');
    nodes.forEach(node => {
      node.style.animation = 'none';
    });
  }

  cleanup() {
    this.stopAnimation();
  }
}
