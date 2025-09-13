/**
 * Workflow Graph Visualizer
 *
 * D3.js-based interactive visualization component for workflow graphs.
 * Provides zoom, pan, selection, and real-time updates.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import * as d3 from 'd3';
import { WorkflowGraph, WorkflowNode, WorkflowEdge, WorkflowVisualizationOptions } from '../workflow/types.js';

/**
 * Workflow Graph Visualizer
 *
 * D3.js-based interactive visualization for workflow graphs with
 * real-time updates, zoom, pan, and selection capabilities.
 *
 * @example
 * ```typescript
 * const visualizer = new WorkflowGraphVisualizer(container, options);
 * await visualizer.render(graph);
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowGraphVisualizer {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<WorkflowNode, WorkflowEdge> | null = null;
  private options: WorkflowVisualizationOptions;
  private currentGraph: WorkflowGraph | null = null;
  private selectedNodes: Set<string> = new Set();
  private selectedEdges: Set<string> = new Set();

  // D3 selections for different elements
  private nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private edgeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private labelGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(container: HTMLElement, options?: Partial<WorkflowVisualizationOptions>) {
    this.container = container;
    this.options = this.mergeOptions(options);
    this.initializeSVG();
    this.setupEventHandlers();
  }

  /**
   * Renders a workflow graph
   *
   * @param graph - Workflow graph to render
   * @returns Promise resolving when rendering is complete
   *
   * @example
   * ```typescript
   * await visualizer.render(graph);
   * ```
   */
  async render(graph: WorkflowGraph): Promise<void> {
    this.currentGraph = graph;
    this.clear();
    this.setupLayout();
    this.renderEdges();
    this.renderNodes();
    this.renderLabels();
    this.startSimulation();
    this.setupInteractions();
  }

  /**
   * Updates the visualization with new data
   *
   * @param graph - Updated workflow graph
   * @returns Promise resolving when update is complete
   *
   * @example
   * ```typescript
   * await visualizer.update(graph);
   * ```
   */
  async update(graph: WorkflowGraph): Promise<void> {
    if (!this.currentGraph) {
      return this.render(graph);
    }

    this.currentGraph = graph;
    this.updateNodes();
    this.updateEdges();
    this.updateLabels();
    this.restartSimulation();
  }

  /**
   * Updates visualization options
   *
   * @param options - New visualization options
   * @returns Promise resolving when update is complete
   *
   * @example
   * ```typescript
   * await visualizer.updateOptions({ layout: 'force' });
   * ```
   */
  async updateOptions(options: Partial<WorkflowVisualizationOptions>): Promise<void> {
    this.options = this.mergeOptions(options);

    if (this.currentGraph) {
      await this.render(this.currentGraph);
    }
  }

  /**
   * Gets currently selected nodes
   *
   * @returns Array of selected node IDs
   *
   * @example
   * ```typescript
   * const selected = visualizer.getSelectedNodes();
   * ```
   */
  getSelectedNodes(): string[] {
    return Array.from(this.selectedNodes);
  }

  /**
   * Gets currently selected edges
   *
   * @returns Array of selected edge IDs
   *
   * @example
   * ```typescript
   * const selected = visualizer.getSelectedEdges();
   * ```
   */
  getSelectedEdges(): string[] {
    return Array.from(this.selectedEdges);
  }

  /**
   * Selects nodes by IDs
   *
   * @param nodeIds - Node IDs to select
   * @returns Promise resolving when selection is complete
   *
   * @example
   * ```typescript
   * await visualizer.selectNodes(['node-1', 'node-2']);
   * ```
   */
  async selectNodes(nodeIds: string[]): Promise<void> {
    this.selectedNodes.clear();
    nodeIds.forEach(id => this.selectedNodes.add(id));
    this.updateNodeSelection();
  }

  /**
   * Clears all selections
   *
   * @example
   * ```typescript
   * visualizer.clearSelection();
   * ```
   */
  clearSelection(): void {
    this.selectedNodes.clear();
    this.selectedEdges.clear();
    this.updateNodeSelection();
    this.updateEdgeSelection();
  }

  /**
   * Zooms to fit all nodes
   *
   * @param duration - Animation duration in milliseconds
   * @returns Promise resolving when zoom is complete
   *
   * @example
   * ```typescript
   * await visualizer.zoomToFit(500);
   * ```
   */
  async zoomToFit(duration: number = 500): Promise<void> {
    if (!this.currentGraph || this.currentGraph.nodes.length === 0) {
      return;
    }

    const bounds = this.getGraphBounds();
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9;
    const translate = [
      width / 2 - scale * (bounds.x + bounds.width / 2),
      height / 2 - scale * (bounds.y + bounds.height / 2)
    ];

    this.g.transition()
      .duration(duration)
      .call(
        d3.zoom<SVGGElement, unknown>().transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  /**
   * Destroys the visualizer and cleans up resources
   *
   * @example
   * ```typescript
   * visualizer.destroy();
   * ```
   */
  destroy(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
    this.clear();
  }

  // Private methods

  private initializeSVG(): void {
    // Clear container
    d3.select(this.container).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 800 600')
      .style('background-color', '#f8f9fa');

    // Create main group for zoom/pan
    this.g = this.svg.append('g');

    // Create groups for different elements
    this.edgeGroup = this.g.append('g').attr('class', 'edges');
    this.nodeGroup = this.g.append('g').attr('class', 'nodes');
    this.labelGroup = this.g.append('g').attr('class', 'labels');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);
  }

  private setupEventHandlers(): void {
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.currentGraph) {
        this.updateDimensions();
      }
    });
  }

  private mergeOptions(options?: Partial<WorkflowVisualizationOptions>): WorkflowVisualizationOptions {
    const defaultOptions: WorkflowVisualizationOptions = {
      layout: 'force',
      visibility: {
        showLabels: true,
        showEdgeLabels: true,
        showProgress: true,
        showStatus: true,
        showTimeEstimates: true,
        showCriticalPath: true
      },
      colors: {
        status: {
          pending: '#6c757d',
          running: '#007bff',
          completed: '#28a745',
          failed: '#dc3545',
          paused: '#ffc107',
          cancelled: '#6c757d'
        },
        priority: {
          low: '#6c757d',
          medium: '#17a2b8',
          high: '#fd7e14',
          critical: '#dc3545'
        },
        roles: {
          'developer': '#007bff',
          'designer': '#e83e8c',
          'qa-engineer': '#20c997',
          'operations-engineer': '#6f42c1',
          'product-strategist': '#fd7e14'
        }
      },
      animation: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      },
      interaction: {
        zoom: true,
        pan: true,
        selection: true,
        dragDrop: false
      }
    };

    return { ...defaultOptions, ...options };
  }

  private setupLayout(): void {
    if (!this.currentGraph) return;

    const { layout } = this.options;

    switch (layout) {
      case 'force':
        this.setupForceLayout();
        break;
      case 'hierarchical':
        this.setupHierarchicalLayout();
        break;
      case 'circular':
        this.setupCircularLayout();
        break;
      case 'grid':
        this.setupGridLayout();
        break;
      case 'timeline':
        this.setupTimelineLayout();
        break;
      default:
        this.setupForceLayout();
    }
  }

  private setupForceLayout(): void {
    if (!this.currentGraph) return;

    this.simulation = d3.forceSimulation<WorkflowNode>(this.currentGraph.nodes)
      .force('link', d3.forceLink<WorkflowNode, WorkflowEdge>(this.currentGraph.edges)
        .id(d => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.container.clientWidth / 2, this.container.clientHeight / 2))
      .force('collision', d3.forceCollide().radius(50))
      .on('tick', () => {
        this.updatePositions();
      });
  }

  private setupHierarchicalLayout(): void {
    if (!this.currentGraph) return;

    // Simple hierarchical layout - in production, use proper D3 hierarchy
    const nodes = this.currentGraph.nodes;
    const levels = this.groupNodesByLevel(nodes);

    nodes.forEach((node, index) => {
      const level = this.getNodeLevel(node);
      const levelNodes = levels[level] || [];
      const nodeIndex = levelNodes.indexOf(node);

      node.x = level * 200 + 100;
      node.y = (nodeIndex - levelNodes.length / 2) * 100 + this.container.clientHeight / 2;
    });

    this.updatePositions();
  }

  private setupCircularLayout(): void {
    if (!this.currentGraph) return;

    const nodes = this.currentGraph.nodes;
    const radius = Math.min(this.container.clientWidth, this.container.clientHeight) / 3;
    const centerX = this.container.clientWidth / 2;
    const centerY = this.container.clientHeight / 2;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    this.updatePositions();
  }

  private setupGridLayout(): void {
    if (!this.currentGraph) return;

    const nodes = this.currentGraph.nodes;
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = this.container.clientWidth / cols;
    const cellHeight = this.container.clientHeight / Math.ceil(nodes.length / cols);

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      node.x = col * cellWidth + cellWidth / 2;
      node.y = row * cellHeight + cellHeight / 2;
    });

    this.updatePositions();
  }

  private setupTimelineLayout(): void {
    if (!this.currentGraph) return;

    const nodes = this.currentGraph.nodes;
    const timelineWidth = this.container.clientWidth - 100;
    const timelineHeight = this.container.clientHeight - 100;
    const startX = 50;
    const startY = 50;

    // Group nodes by time or phase
    const timeGroups = this.groupNodesByTime(nodes);
    const groupKeys = Object.keys(timeGroups).sort();

    groupKeys.forEach((timeKey, groupIndex) => {
      const groupNodes = timeGroups[timeKey];
      const groupX = startX + (groupIndex / (groupKeys.length - 1)) * timelineWidth;

      groupNodes.forEach((node, nodeIndex) => {
        node.x = groupX;
        node.y = startY + (nodeIndex / (groupNodes.length - 1)) * timelineHeight;
      });
    });

    this.updatePositions();
  }

  private renderEdges(): void {
    if (!this.currentGraph) return;

    const edges = this.edgeGroup.selectAll('.edge')
      .data(this.currentGraph.edges, (d: any) => d.id);

    edges.exit().remove();

    const edgeEnter = edges.enter()
      .append('g')
      .attr('class', 'edge');

    // Edge line
    edgeEnter.append('line')
      .attr('stroke', d => this.getEdgeColor(d))
      .attr('stroke-width', d => d.visual.width)
      .attr('stroke-dasharray', d => this.getEdgeStyle(d))
      .attr('opacity', d => d.visual.opacity);

    // Edge arrow
    edgeEnter.append('path')
      .attr('d', 'M 0,0 L 8,4 L 0,8 z')
      .attr('fill', d => this.getEdgeColor(d))
      .attr('opacity', d => d.visual.opacity);

    // Edge label
    if (this.options.visibility.showEdgeLabels) {
      edgeEnter.append('text')
        .attr('class', 'edge-label')
        .attr('text-anchor', 'middle')
        .attr('dy', -5)
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(d => d.label || '');
    }
  }

  private renderNodes(): void {
    if (!this.currentGraph) return;

    const nodes = this.nodeGroup.selectAll('.node')
      .data(this.currentGraph.nodes, (d: any) => d.id);

    nodes.exit().remove();

    const nodeEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Node shape
    nodeEnter.each(function(d) {
      const g = d3.select(this);

      switch (d.visual.shape) {
        case 'circle':
          g.append('circle')
            .attr('r', d.visual.size / 2)
            .attr('fill', d.visual.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', d.visual.opacity);
          break;
        case 'rectangle':
          g.append('rect')
            .attr('width', d.visual.size)
            .attr('height', d.visual.size * 0.6)
            .attr('x', -d.visual.size / 2)
            .attr('y', -d.visual.size * 0.3)
            .attr('fill', d.visual.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('rx', 4)
            .attr('opacity', d.visual.opacity);
          break;
        case 'diamond':
          g.append('path')
            .attr('d', `M 0,${-d.visual.size/2} L ${d.visual.size/2},0 L 0,${d.visual.size/2} L ${-d.visual.size/2},0 Z`)
            .attr('fill', d.visual.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', d.visual.opacity);
          break;
        case 'hexagon':
          g.append('path')
            .attr('d', this.getHexagonPath(d.visual.size))
            .attr('fill', d.visual.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', d.visual.opacity);
          break;
      }
    });

    // Progress bar
    if (this.options.visibility.showProgress) {
      nodeEnter.append('circle')
        .attr('class', 'progress-ring')
        .attr('r', d => d.visual.size / 2 + 5)
        .attr('fill', 'none')
        .attr('stroke', '#e9ecef')
        .attr('stroke-width', 3)
        .attr('opacity', 0.3);

      nodeEnter.append('circle')
        .attr('class', 'progress-fill')
        .attr('r', d => d.visual.size / 2 + 5)
        .attr('fill', 'none')
        .attr('stroke', '#28a745')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', d => `${2 * Math.PI * (d.visual.size / 2 + 5)}`)
        .attr('stroke-dashoffset', d => `${2 * Math.PI * (d.visual.size / 2 + 5) * (1 - d.progress / 100)}`)
        .attr('opacity', 0.8);
    }

    // Status indicator
    if (this.options.visibility.showStatus) {
      nodeEnter.append('circle')
        .attr('class', 'status-indicator')
        .attr('r', 6)
        .attr('cx', d => d.visual.size / 2 - 8)
        .attr('cy', d => -d.visual.size / 2 + 8)
        .attr('fill', d => this.getStatusColor(d.status))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }

    // Icon
    if (this.options.visibility.showLabels) {
      nodeEnter.append('text')
        .attr('class', 'node-icon')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', '16px')
        .attr('fill', '#fff')
        .text(d => this.getNodeIcon(d));
    }
  }

  private renderLabels(): void {
    if (!this.currentGraph || !this.options.visibility.showLabels) return;

    const labels = this.labelGroup.selectAll('.node-label')
      .data(this.currentGraph.nodes, (d: any) => d.id);

    labels.exit().remove();

    const labelEnter = labels.enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.visual.size / 2 + 20)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .attr('font-weight', '500')
      .text(d => d.label);

    // Time estimates
    if (this.options.visibility.showTimeEstimates) {
      labelEnter.append('tspan')
        .attr('class', 'time-estimate')
        .attr('x', 0)
        .attr('dy', 15)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(d => d.estimatedDuration ? `${d.estimatedDuration}m` : '');
    }
  }

  private updateNodes(): void {
    if (!this.currentGraph) return;

    const nodes = this.nodeGroup.selectAll('.node')
      .data(this.currentGraph.nodes, (d: any) => d.id);

    // Update visual properties
    nodes.select('circle, rect, path')
      .transition()
      .duration(this.options.animation.duration)
      .attr('fill', d => d.visual.color)
      .attr('opacity', d => d.visual.opacity);

    // Update progress
    if (this.options.visibility.showProgress) {
      nodes.select('.progress-fill')
        .transition()
        .duration(this.options.animation.duration)
        .attr('stroke-dashoffset', d => `${2 * Math.PI * (d.visual.size / 2 + 5) * (1 - d.progress / 100)}`);
    }

    // Update status
    if (this.options.visibility.showStatus) {
      nodes.select('.status-indicator')
        .transition()
        .duration(this.options.animation.duration)
        .attr('fill', d => this.getStatusColor(d.status));
    }
  }

  private updateEdges(): void {
    if (!this.currentGraph) return;

    const edges = this.edgeGroup.selectAll('.edge')
      .data(this.currentGraph.edges, (d: any) => d.id);

    edges.select('line')
      .transition()
      .duration(this.options.animation.duration)
      .attr('stroke', d => this.getEdgeColor(d))
      .attr('opacity', d => d.visual.opacity);

    edges.select('path')
      .transition()
      .duration(this.options.animation.duration)
      .attr('fill', d => this.getEdgeColor(d))
      .attr('opacity', d => d.visual.opacity);
  }

  private updateLabels(): void {
    if (!this.currentGraph || !this.options.visibility.showLabels) return;

    const labels = this.labelGroup.selectAll('.node-label')
      .data(this.currentGraph.nodes, (d: any) => d.id);

    labels.transition()
      .duration(this.options.animation.duration)
      .text(d => d.label);
  }

  private updatePositions(): void {
    // Update node positions
    this.nodeGroup.selectAll('.node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Update edge positions
    this.edgeGroup.selectAll('.edge line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.edgeGroup.selectAll('.edge path')
      .attr('transform', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const angle = Math.atan2(dy, dx);
        return `translate(${d.target.x},${d.target.y}) rotate(${angle * 180 / Math.PI})`;
      });

    // Update label positions
    this.labelGroup.selectAll('.node-label')
      .attr('x', d => d.x)
      .attr('y', d => d.y + d.visual.size / 2 + 20);
  }

  private setupInteractions(): void {
    if (!this.options.interaction.selection) return;

    // Node selection
    this.nodeGroup.selectAll('.node')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.toggleNodeSelection(d.id);
      });

    // Edge selection
    this.edgeGroup.selectAll('.edge')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.toggleEdgeSelection(d.id);
      });

    // Background click to clear selection
    this.svg.on('click', () => {
      this.clearSelection();
    });
  }

  private toggleNodeSelection(nodeId: string): void {
    if (this.selectedNodes.has(nodeId)) {
      this.selectedNodes.delete(nodeId);
    } else {
      this.selectedNodes.add(nodeId);
    }
    this.updateNodeSelection();
  }

  private toggleEdgeSelection(edgeId: string): void {
    if (this.selectedEdges.has(edgeId)) {
      this.selectedEdges.delete(edgeId);
    } else {
      this.selectedEdges.add(edgeId);
    }
    this.updateEdgeSelection();
  }

  private updateNodeSelection(): void {
    this.nodeGroup.selectAll('.node')
      .classed('selected', d => this.selectedNodes.has(d.id))
      .style('filter', d => this.selectedNodes.has(d.id) ? 'drop-shadow(0 0 8px rgba(0,123,255,0.5))' : null);
  }

  private updateEdgeSelection(): void {
    this.edgeGroup.selectAll('.edge')
      .classed('selected', d => this.selectedEdges.has(d.id))
      .style('filter', d => this.selectedEdges.has(d.id) ? 'drop-shadow(0 0 4px rgba(0,123,255,0.5))' : null);
  }

  private startSimulation(): void {
    if (this.simulation) {
      this.simulation.restart();
    }
  }

  private restartSimulation(): void {
    if (this.simulation && this.currentGraph) {
      this.simulation.nodes(this.currentGraph.nodes);
      this.simulation.force('link')?.links(this.currentGraph.edges);
      this.simulation.restart();
    }
  }

  private clear(): void {
    this.nodeGroup.selectAll('*').remove();
    this.edgeGroup.selectAll('*').remove();
    this.labelGroup.selectAll('*').remove();
  }

  private updateDimensions(): void {
    if (this.simulation) {
      this.simulation.force('center')?.x(this.container.clientWidth / 2).y(this.container.clientHeight / 2);
      this.simulation.restart();
    }
  }

  private getGraphBounds(): { x: number; y: number; width: number; height: number } {
    if (!this.currentGraph || this.currentGraph.nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const nodes = this.currentGraph.nodes;
    const xs = nodes.map(n => n.x || 0);
    const ys = nodes.map(n => n.y || 0);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private getEdgeColor(edge: WorkflowEdge): string {
    return edge.visual.color;
  }

  private getEdgeStyle(edge: WorkflowEdge): string {
    switch (edge.visual.style) {
      case 'dashed': return '5,5';
      case 'dotted': return '2,2';
      case 'curved': return 'none';
      default: return 'none';
    }
  }

  private getStatusColor(status: string): string {
    return this.options.colors.status[status as keyof typeof this.options.colors.status] || '#6c757d';
  }

  private getNodeIcon(node: WorkflowNode): string {
    const iconMap: Record<string, string> = {
      'workflow': '⚙️',
      'phase': '📋',
      'task': '✅',
      'deliverable': '📄',
      'role': '👤',
      'tool': '🔧'
    };
    return iconMap[node.type] || '●';
  }

  private getHexagonPath(size: number): string {
    const r = size / 2;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
    }
    return `M ${points.join(' L ')} Z`;
  }

  private groupNodesByLevel(nodes: WorkflowNode[]): Record<number, WorkflowNode[]> {
    const levels: Record<number, WorkflowNode[]> = {};

    nodes.forEach(node => {
      const level = this.getNodeLevel(node);
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(node);
    });

    return levels;
  }

  private getNodeLevel(node: WorkflowNode): number {
    // Simple level calculation based on node type
    switch (node.type) {
      case 'workflow': return 0;
      case 'phase': return 1;
      case 'task': return 2;
      case 'deliverable': return 3;
      default: return 4;
    }
  }

  private groupNodesByTime(nodes: WorkflowNode[]): Record<string, WorkflowNode[]> {
    const groups: Record<string, WorkflowNode[]> = {};

    nodes.forEach(node => {
      const timeKey = node.startTime ?
        new Date(node.startTime).toISOString().split('T')[0] :
        'unknown';

      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      groups[timeKey].push(node);
    });

    return groups;
  }
}
