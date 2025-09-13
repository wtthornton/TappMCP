import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DrillDownData {
  id: string;
  name: string;
  type: 'workflow' | 'event' | 'metric' | 'node';
  details: {
    status?: string;
    phase?: string;
    progress?: number;
    startTime?: number;
    endTime?: number;
    duration?: number;
    tokensUsed?: number;
    tokensSaved?: number;
    bugsFound?: number;
    qualityScore?: number;
    efficiency?: number;
    costSavings?: number;
    timeSaved?: number;
    context7Hits?: number;
    cacheHitRate?: number;
    memory?: number;
    cpu?: number;
    responseTime?: number;
    errorRate?: number;
  };
  subItems?: DrillDownData[];
  connections?: Array<{ target: string; type: string; strength: number }>;
}

interface DrillDownModalProps {
  isOpen: boolean;
  data: DrillDownData | null;
  onClose: () => void;
  onSubItemClick?: (item: DrillDownData) => void;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  data,
  onClose,
  onSubItemClick
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isOpen || !data || !chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    // Create mini visualization based on data type
    if (data.type === 'workflow' && data.subItems) {
      createWorkflowMiniChart(svg, data);
    } else if (data.type === 'metric') {
      createMetricChart(svg, data);
    } else if (data.type === 'event') {
      createEventTimeline(svg, data);
    }
  }, [isOpen, data]);

  const createWorkflowMiniChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: DrillDownData) => {
    const width = 400;
    const height = 200;
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    // Create nodes for sub-items
    const nodes = data.subItems?.map((item, i) => ({
      id: item.id,
      name: item.name,
      status: item.details.status || 'pending',
      x: 50 + (i * 100),
      y: 100,
      progress: item.details.progress || 0
    })) || [];

    // Add node circles
    const nodeGroups = g.selectAll(".mini-node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "mini-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodeGroups.append("circle")
      .attr("r", 20)
      .attr("fill", d => getStatusColor(d.status))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add progress rings
    nodeGroups.append("circle")
      .attr("r", 25)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 3);

    nodeGroups.append("circle")
      .attr("r", 25)
      .attr("fill", "none")
      .attr("stroke", d => getStatusColor(d.status))
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", _d => `${2 * Math.PI * 25}`)
      .attr("stroke-dashoffset", d => `${2 * Math.PI * 25 * (1 - d.progress / 100)}`)
      .attr("transform", "rotate(-90)");

    // Add labels
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(d => d.name.substring(0, 6));

    // Add connections
    if (data.connections) {
      const links = g.append("g").attr("class", "links");

      data.connections.forEach((conn, _i) => {
        const sourceNode = nodes.find(n => n.id === data.id);
        const targetNode = nodes.find(n => n.id === conn.target);

        if (sourceNode && targetNode) {
          links.append("line")
            .attr("x1", sourceNode.x)
            .attr("y1", sourceNode.y)
            .attr("x2", targetNode.x)
            .attr("y2", targetNode.y)
            .attr("stroke", "#999")
            .attr("stroke-width", conn.strength * 3)
            .attr("stroke-opacity", 0.6);
        }
      });
    }
  };

  const createMetricChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: DrillDownData) => {
    const width = 400;
    const height = 200;
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    // Create a simple bar chart for key metrics
    const metrics = [
      { name: 'Tokens Used', value: data.details.tokensUsed || 0, color: '#ef4444' },
      { name: 'Tokens Saved', value: data.details.tokensSaved || 0, color: '#10b981' },
      { name: 'Bugs Found', value: data.details.bugsFound || 0, color: '#f59e0b' },
      { name: 'Quality Score', value: data.details.qualityScore || 0, color: '#3b82f6' }
    ];

    const xScale = d3.scaleBand()
      .domain(metrics.map(d => d.name))
      .range([40, width - 40])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(metrics, d => d.value) || 100])
      .range([height - 40, 40]);

    // Add bars
    g.selectAll(".metric-bar")
      .data(metrics)
      .enter().append("rect")
      .attr("class", "metric-bar")
      .attr("x", d => xScale(d.name)!)
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - 40 - yScale(d.value))
      .attr("fill", d => d.color)
      .attr("rx", 4);

    // Add labels
    g.selectAll(".metric-label")
      .data(metrics)
      .enter().append("text")
      .attr("class", "metric-label")
      .attr("x", d => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(d => d.value.toLocaleString());
  };

  const createEventTimeline = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: DrillDownData) => {
    const width = 400;
    const height = 100;
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    // Create timeline bar
    const startTime = data.details.startTime || 0;
    const endTime = data.details.endTime || startTime + (data.details.duration || 60000);
    const duration = endTime - startTime;

    const xScale = d3.scaleTime()
      .domain([startTime, endTime])
      .range([40, width - 40]);

    // Add timeline bar
    g.append("rect")
      .attr("x", 40)
      .attr("y", 30)
      .attr("width", width - 80)
      .attr("height", 40)
      .attr("fill", getStatusColor(data.details.status || 'pending'))
      .attr("rx", 20);

    // Add start/end markers
    g.append("circle")
      .attr("cx", 40)
      .attr("cy", 50)
      .attr("r", 5)
      .attr("fill", "white");

    g.append("circle")
      .attr("cx", width - 40)
      .attr("cy", 50)
      .attr("r", 5)
      .attr("fill", "white");

    // Add duration text
    g.append("text")
      .attr("x", width / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(`${Math.round(duration / 1000)}s`);
  };

  const getStatusColor = (status: string): string => {
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

  const formatValue = (value: number | undefined, type: string): string => {
    if (value === undefined) return 'N/A';

    switch (type) {
      case 'tokens':
        return value.toLocaleString();
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'time':
        return `${Math.round(value / 1000)}s`;
      case 'memory':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="drill-down-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div
        ref={modalRef}
        className="drill-down-modal"
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
              {data.name}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Details
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Mini Visualization */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
              Visualization
            </h3>
            <svg ref={chartRef} style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }} />
          </div>

          {/* Details Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
              Metrics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(data.details).map(([key, value]) => {
                if (value === undefined || value === null) return null;

                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const valueType = key.includes('Score') || key.includes('Rate') ? 'percentage' :
                                key.includes('Token') ? 'tokens' :
                                key.includes('Cost') || key.includes('Savings') ? 'currency' :
                                key.includes('Time') ? 'time' :
                                key.includes('Memory') || key.includes('CPU') ? 'memory' : 'default';

                return (
                  <div key={key} style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      {displayKey}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                      {formatValue(typeof value === 'number' ? value : parseFloat(String(value)) || 0, valueType)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-items */}
          {data.subItems && data.subItems.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                Sub-items
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.subItems.map((item, _index) => (
                  <div
                    key={item.id}
                    onClick={() => onSubItemClick?.(item)}
                    style={{
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {item.type} • {item.details.status || 'unknown'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;
