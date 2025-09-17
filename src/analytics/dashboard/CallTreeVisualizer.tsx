/**
 * Call Tree Visualizer Component
 *
 * Interactive call tree diagrams with performance heatmaps,
 * timeline visualizations, and bottleneck highlighting.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CallTreeEntry,
  DetailedExecutionFlow,
  ToolCallDetail,
  PerformanceMetricDetail,
  ErrorDetail
} from '../types/AnalyticsTypes.js';

export interface CallTreeVisualizerProps {
  /** Execution flow data */
  executionFlow: DetailedExecutionFlow;

  /** Performance metrics */
  performanceMetrics?: PerformanceMetricDetail[];

  /** Errors encountered */
  errors?: ErrorDetail[];

  /** Visualization configuration */
  config?: {
    showTiming?: boolean;
    showPerformance?: boolean;
    showErrors?: boolean;
    showToolCalls?: boolean;
    showContext7Calls?: boolean;
    showCacheOperations?: boolean;
    enableInteractions?: boolean;
    layout?: 'hierarchical' | 'timeline' | 'flow';
  };

  /** Custom styling */
  className?: string;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualNode extends CallTreeEntry {
  position: NodePosition;
  performance?: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  error?: string;
  children: VisualNode[];
}

export const CallTreeVisualizer: React.FC<CallTreeVisualizerProps> = ({
  executionFlow,
  performanceMetrics = [],
  errors = [],
  config = {
    showTiming: true,
    showPerformance: true,
    showErrors: true,
    showToolCalls: true,
    showContext7Calls: true,
    showCacheOperations: true,
    enableInteractions: true,
    layout: 'hierarchical'
  },
  className = ''
}) => {
  const [visualNodes, setVisualNodes] = useState<VisualNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert execution flow to visual nodes
  const convertToVisualNodes = useCallback((rootNode: CallTreeEntry): VisualNode[] => {
    const nodes: VisualNode[] = [];
    let nodeId = 0;

    const processNode = (node: CallTreeEntry, depth: number = 0): VisualNode => {
      const visualNode: VisualNode = {
        ...node,
        position: { x: 0, y: 0, width: 200, height: 60 },
        children: [],
        performance: {
          executionTime: node.duration || 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

      // Add performance data if available
      if (performanceMetrics.length > 0) {
        const nodeMetrics = performanceMetrics.filter(m =>
          m.tags?.nodeId === node.id || m.tags?.tool === node.tool
        );
        if (nodeMetrics.length > 0) {
          visualNode.performance = {
            executionTime: nodeMetrics.find(m => m.name === 'execution_time')?.value || 0,
            memoryUsage: nodeMetrics.find(m => m.name === 'memory_usage')?.value || 0,
            cpuUsage: nodeMetrics.find(m => m.name === 'cpu_usage')?.value || 0
          };
        }
      }

      // Add error data if available
      if (errors.length > 0) {
        const nodeError = errors.find(e => e.context?.nodeId === node.id);
        if (nodeError) {
          visualNode.error = nodeError.message;
        }
      }

      // Process children
      if (node.children && node.children.length > 0) {
        visualNode.children = node.children.map(child => processNode(child, depth + 1));
      }

      nodes.push(visualNode);
      return visualNode;
    };

    processNode(rootNode);
    return nodes;
  }, [performanceMetrics, errors]);

  // Calculate node positions
  const calculatePositions = useCallback((nodes: VisualNode[], layout: string) => {
    const positionedNodes = [...nodes];

    if (layout === 'hierarchical') {
      // Hierarchical layout
      positionedNodes.forEach((node, index) => {
        const level = node.level || 0;
        const siblingsAtLevel = positionedNodes.filter(n => (n.level || 0) === level);
        const siblingIndex = siblingsAtLevel.indexOf(node);

        node.position.x = siblingIndex * 250 + 50;
        node.position.y = level * 100 + 50;
      });
    } else if (layout === 'timeline') {
      // Timeline layout
      positionedNodes.forEach((node, index) => {
        const startTime = node.startTime;
        const duration = node.duration || 0;

        node.position.x = (startTime - (executionFlow.rootNode.startTime || 0)) * 0.1 + 50;
        node.position.y = (node.level || 0) * 80 + 50;
        node.position.width = Math.max(duration * 0.1, 50);
      });
    } else if (layout === 'flow') {
      // Flow layout
      positionedNodes.forEach((node, index) => {
        node.position.x = index * 220 + 50;
        node.position.y = 50;
      });
    }

    return positionedNodes;
  }, [executionFlow.rootNode.startTime]);

  // Initialize visual nodes
  useEffect(() => {
    const nodes = convertToVisualNodes(executionFlow.rootNode);
    const positionedNodes = calculatePositions(nodes, config.layout || 'hierarchical');
    setVisualNodes(positionedNodes);
  }, [executionFlow, convertToVisualNodes, calculatePositions, config.layout]);

  // Draw the visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw connections
    visualNodes.forEach(node => {
      node.children.forEach(child => {
        const startX = node.position.x + node.position.width / 2;
        const startY = node.position.y + node.position.height;
        const endX = child.position.x + child.position.width / 2;
        const endY = child.position.y;

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
    });

    // Draw nodes
    visualNodes.forEach(node => {
      const { x, y, width, height } = node.position;

      // Node background
      let backgroundColor = '#f0f0f0';
      if (node.error) {
        backgroundColor = '#ffebee';
      } else if (node.performance && node.performance.executionTime > 1000) {
        backgroundColor = '#fff3e0';
      } else if (node.success !== false) {
        backgroundColor = '#e8f5e8';
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, width, height);

      // Node border
      ctx.strokeStyle = selectedNode?.id === node.id ? '#2196f3' : '#ccc';
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
      ctx.strokeRect(x, y, width, height);

      // Node text
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.tool, x + width / 2, y + 20);

      if (config.showTiming && node.duration) {
        ctx.font = '10px Arial';
        ctx.fillText(`${node.duration}ms`, x + width / 2, y + 35);
      }

      if (node.error) {
        ctx.fillStyle = '#f44336';
        ctx.fillText('❌', x + width - 15, y + 15);
      }

      if (config.showPerformance && node.performance) {
        // Performance indicator
        const perfScore = Math.min(node.performance.executionTime / 1000, 1);
        const perfColor = perfScore > 0.8 ? '#f44336' : perfScore > 0.5 ? '#ff9800' : '#4caf50';

        ctx.fillStyle = perfColor;
        ctx.fillRect(x + 5, y + height - 8, (width - 10) * perfScore, 4);
      }
    });

    ctx.restore();
  }, [visualNodes, selectedNode, zoom, pan, config]);

  // Handle canvas interactions
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config.enableInteractions) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    // Find clicked node
    const clickedNode = visualNodes.find(node =>
      x >= node.position.x &&
      x <= node.position.x + node.position.width &&
      y >= node.position.y &&
      y <= node.position.y + node.position.height
    );

    setSelectedNode(clickedNode || null);
  }, [visualNodes, pan, zoom, config.enableInteractions]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!config.enableInteractions) return;

    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, [config.enableInteractions]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config.enableInteractions) return;

    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
  }, [pan, config.enableInteractions]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !config.enableInteractions) return;

    setPan({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  }, [isDragging, dragStart, config.enableInteractions]);

  // Handle mouse up for panning
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Redraw when data changes
  useEffect(() => {
    drawVisualization();
  }, [drawVisualization]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawVisualization();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawVisualization]);

  return (
    <div className={`call-tree-visualizer ${className}`}>
      <div className="visualizer-header">
        <h3>🌳 Call Tree Visualization</h3>
        <div className="visualizer-controls">
          <select
            value={config.layout}
            onChange={(e) => {
              const newLayout = e.target.value as any;
              const nodes = convertToVisualNodes(executionFlow.rootNode);
              const positionedNodes = calculatePositions(nodes, newLayout);
              setVisualNodes(positionedNodes);
            }}
          >
            <option value="hierarchical">Hierarchical</option>
            <option value="timeline">Timeline</option>
            <option value="flow">Flow</option>
          </select>

          <div className="zoom-controls">
            <button onClick={() => setZoom(prev => Math.max(0.1, prev * 0.9))}>-</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(3, prev * 1.1))}>+</button>
          </div>

          <button onClick={() => setPan({ x: 0, y: 0 })}>Reset View</button>
        </div>
      </div>

      <div className="visualizer-container" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="call-tree-canvas"
        />
      </div>

      {selectedNode && (
        <div className="node-details">
          <h4>Node Details: {selectedNode.tool}</h4>
          <div className="detail-item">
            <strong>Phase:</strong> {selectedNode.phase}
          </div>
          <div className="detail-item">
            <strong>Duration:</strong> {selectedNode.duration || 0}ms
          </div>
          <div className="detail-item">
            <strong>Success:</strong> {selectedNode.success !== false ? '✅' : '❌'}
          </div>

          {selectedNode.performance && (
            <div className="performance-details">
              <h5>Performance</h5>
              <div className="detail-item">
                <strong>Execution Time:</strong> {selectedNode.performance.executionTime}ms
              </div>
              <div className="detail-item">
                <strong>Memory Usage:</strong> {selectedNode.performance.memoryUsage}MB
              </div>
              <div className="detail-item">
                <strong>CPU Usage:</strong> {selectedNode.performance.cpuUsage}%
              </div>
            </div>
          )}

          {selectedNode.error && (
            <div className="error-details">
              <h5>Error</h5>
              <div className="error-message">{selectedNode.error}</div>
            </div>
          )}

          {selectedNode.parameters && Object.keys(selectedNode.parameters).length > 0 && (
            <div className="parameters-details">
              <h5>Parameters</h5>
              <pre>{JSON.stringify(selectedNode.parameters, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="visualizer-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e8f5e8' }}></div>
          <span>Successful</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#fff3e0' }}></div>
          <span>Slow (&gt;1s)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffebee' }}></div>
          <span>Error</span>
        </div>
      </div>
    </div>
  );
};

export default CallTreeVisualizer;
