import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface WorkflowNode {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'queued';
  phase: string;
  progress: number;
  startTime?: number;
  endTime?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface WorkflowConnection {
  source: string | WorkflowNode;
  target: string | WorkflowNode;
  type: 'dependency' | 'data-flow' | 'sequence';
}

interface WorkflowGraphProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  width?: number;
  height?: number;
  onNodeClick?: (node: WorkflowNode) => void;
  onNodeHover?: (node: WorkflowNode | null) => void;
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  nodes,
  connections,
  width = 800,
  height = 600,
  onNodeClick,
  onNodeHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Set up zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation<WorkflowNode>(nodes)
      .force("link", d3.forceLink<WorkflowNode, WorkflowConnection>(connections)
        .id(d => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(connections)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.type === 'dependency' ? 3 : 1)
      .attr("stroke-dasharray", d => d.type === 'data-flow' ? "5,5" : "none");

    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag<SVGGElement, WorkflowNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (_event, d) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on("mouseover", (_event, d) => {
        onNodeHover?.(d);
        // Highlight connected nodes
        const connectedNodes = new Set([
          ...connections.filter(c => (typeof c.source === 'string' ? c.source : c.source.id) === d.id).map(c => typeof c.target === 'string' ? c.target : c.target.id),
          ...connections.filter(c => (typeof c.target === 'string' ? c.target : c.target.id) === d.id).map(c => typeof c.source === 'string' ? c.source : c.source.id)
        ]);

        node.style("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style("opacity", l =>
          (typeof l.source === 'string' ? l.source : l.source.id) === d.id || (typeof l.target === 'string' ? l.target : l.target.id) === d.id ? 1 : 0.3
        );
      })
      .on("mouseout", () => {
        onNodeHover?.(null);
        node.style("opacity", 1);
        link.style("opacity", 1);
      });

    // Add circles for nodes
    node.append("circle")
      .attr("r", 25)
      .attr("fill", d => getNodeColor(d.status))
      .attr("stroke", d => selectedNode?.id === d.id ? "#333" : "none")
      .attr("stroke-width", d => selectedNode?.id === d.id ? 3 : 0);

    // Add progress rings
    node.append("circle")
      .attr("r", 30)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 3);

    node.append("circle")
      .attr("r", 30)
      .attr("fill", "none")
      .attr("stroke", d => getNodeColor(d.status))
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", _d => `${2 * Math.PI * 30}`)
      .attr("stroke-dashoffset", d => `${2 * Math.PI * 30 * (1 - d.progress / 100)}`)
      .attr("transform", "rotate(-90)");

    // Add labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(d => d.name.substring(0, 8));

    // Add status indicators
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .text(d => d.status.toUpperCase());

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: WorkflowNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: WorkflowNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: WorkflowNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, connections, width, height, onNodeClick, onNodeHover, selectedNode]);

  const getNodeColor = (status: string): string => {
    const colors = {
      pending: '#94a3b8',
      running: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
      paused: '#8b5cf6',
      queued: '#3b82f6'
    };
    return colors[status as keyof typeof colors] || '#94a3b8';
  };

  return (
    <div className="workflow-graph-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />
      {selectedNode && (
        <div className="node-details" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          minWidth: '200px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{selectedNode.name}</h3>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Status:</strong> {selectedNode.status}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Phase:</strong> {selectedNode.phase}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Progress:</strong> {selectedNode.progress}%
          </p>
          {selectedNode.startTime && (
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Started:</strong> {new Date(selectedNode.startTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowGraph;
