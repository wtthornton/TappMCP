import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface PerformanceMetric {
  timestamp: number;
  memory: number;
  cpu: number;
  responseTime: number;
  errorRate: number;
}

interface PerformanceOverlayProps {
  metrics: PerformanceMetric[];
  width?: number;
  height?: number;
  onMetricClick?: (metric: PerformanceMetric) => void;
  showAlerts?: boolean;
}

const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  metrics,
  width = 800,
  height = 300,
  onMetricClick,
  showAlerts = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [alerts, setAlerts] = useState<Array<{ timestamp: number; type: string; message: string }>>([]);

  useEffect(() => {
    if (!svgRef.current || metrics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Sort metrics by timestamp
    const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate time range
    const minTime = d3.min(sortedMetrics, d => d.timestamp) || 0;
    const maxTime = d3.max(sortedMetrics, d => d.timestamp) || minTime + 1;
    const timeExtent = maxTime - minTime;

    // Set up scales
    const xScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([60, width - 60]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - 40, 40]);

    // Create main group
    const g = svg.append("g");

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d3.timeFormat("%H:%M:%S")(new Date(d)))
      .ticks(8);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d}%`)
      .ticks(5);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - 40})`)
      .call(xAxis as any);

    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(60, 0)")
      .call(yAxis);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - 40})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-(height - 80))
        .tickFormat(() => "")
      );

    g.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(60, 0)")
      .call(d3.axisLeft(yScale)
        .tickSize(-(width - 120))
        .tickFormat(() => "")
      );

    // Create line generators
    const memoryLine = d3.line<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.memory))
      .curve(d3.curveMonotoneX);

    const cpuLine = d3.line<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    const responseTimeLine = d3.line<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(Math.min(d.responseTime * 10, 100))) // Scale response time
      .curve(d3.curveMonotoneX);

    const errorRateLine = d3.line<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.errorRate * 100))
      .curve(d3.curveMonotoneX);

    // Add area fills
    const memoryArea = d3.area<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y0(height - 40)
      .y1(d => yScale(d.memory))
      .curve(d3.curveMonotoneX);

    const cpuArea = d3.area<PerformanceMetric>()
      .x(d => xScale(d.timestamp))
      .y0(height - 40)
      .y1(d => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    // Add areas
    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "memory-area")
      .attr("d", memoryArea)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "cpu-area")
      .attr("d", cpuArea)
      .attr("fill", "#f59e0b")
      .attr("fill-opacity", 0.2);

    // Add lines
    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "memory-line")
      .attr("d", memoryLine)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "cpu-line")
      .attr("d", cpuLine)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "response-time-line")
      .attr("d", responseTimeLine)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "error-rate-line")
      .attr("d", errorRateLine)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");

    // Add data points
    const points = g.append("g")
      .attr("class", "data-points")
      .selectAll("circle")
      .data(sortedMetrics)
      .enter().append("circle")
      .attr("cx", d => xScale(d.timestamp))
      .attr("cy", d => yScale(d.memory))
      .attr("r", 3)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("click", (_event, d) => {
        setSelectedMetric(d);
        onMetricClick?.(d);
      })
      .on("mouseover", function(_event, d) {
        d3.select(this).attr("r", 5);
        // Show tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.timestamp)}, ${yScale(d.memory)})`);

        tooltip.append("rect")
          .attr("x", -50)
          .attr("y", -30)
          .attr("width", 100)
          .attr("height", 20)
          .attr("fill", "rgba(0, 0, 0, 0.8)")
          .attr("rx", 4);

        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "-15")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .text(`${d.memory.toFixed(1)}%`);
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 3);
        g.selectAll(".tooltip").remove();
      });

    // Add threshold lines
    const thresholds = [
      { value: 80, label: "Memory Warning", color: "#f59e0b" },
      { value: 90, label: "Memory Critical", color: "#ef4444" },
      { value: 70, label: "CPU Warning", color: "#f59e0b" },
      { value: 85, label: "CPU Critical", color: "#ef4444" }
    ];

    thresholds.forEach(threshold => {
      g.append("line")
        .attr("class", "threshold")
        .attr("x1", 60)
        .attr("y1", yScale(threshold.value))
        .attr("x2", width - 60)
        .attr("y2", yScale(threshold.value))
        .attr("stroke", threshold.color)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");

      g.append("text")
        .attr("class", "threshold-label")
        .attr("x", width - 60)
        .attr("y", yScale(threshold.value) - 5)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("fill", threshold.color)
        .text(threshold.label);
    });

    // Detect performance alerts
    if (showAlerts) {
      const newAlerts: Array<{ timestamp: number; type: string; message: string }> = [];

      sortedMetrics.forEach(metric => {
        if (metric.memory > 90) {
          newAlerts.push({
            timestamp: metric.timestamp,
            type: 'critical',
            message: `High memory usage: ${metric.memory.toFixed(1)}%`
          });
        }
        if (metric.cpu > 85) {
          newAlerts.push({
            timestamp: metric.timestamp,
            type: 'critical',
            message: `High CPU usage: ${metric.cpu.toFixed(1)}%`
          });
        }
        if (metric.responseTime > 1000) {
          newAlerts.push({
            timestamp: metric.timestamp,
            type: 'warning',
            message: `Slow response time: ${metric.responseTime}ms`
          });
        }
        if (metric.errorRate > 0.05) {
          newAlerts.push({
            timestamp: metric.timestamp,
            type: 'error',
            message: `High error rate: ${(metric.errorRate * 100).toFixed(1)}%`
          });
        }
      });

      setAlerts(newAlerts);

      // Add alert markers
      newAlerts.forEach(alert => {
        g.append("circle")
          .attr("cx", xScale(alert.timestamp))
          .attr("cy", yScale(80))
          .attr("r", 6)
          .attr("fill", alert.type === 'critical' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#6b7280')
          .attr("stroke", "white")
          .attr("stroke-width", 2);
      });
    }

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 200}, 20)`);

    const legendItems = [
      { color: "#3b82f6", label: "Memory Usage" },
      { color: "#f59e0b", label: "CPU Usage" },
      { color: "#10b981", label: "Response Time" },
      { color: "#ef4444", label: "Error Rate" }
    ];

    legendItems.forEach((item, i) => {
      const itemGroup = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      itemGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 15)
        .attr("y2", 0)
        .attr("stroke", item.color)
        .attr("stroke-width", 2);

      itemGroup.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .attr("font-size", "12px")
        .text(item.label);
    });

  }, [metrics, width, height, onMetricClick, showAlerts]);

  return (
    <div className="performance-overlay-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />
      {selectedMetric && (
        <div className="metric-details" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          minWidth: '200px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Performance Metrics</h3>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Memory:</strong> {selectedMetric.memory.toFixed(1)}%
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>CPU:</strong> {selectedMetric.cpu.toFixed(1)}%
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Response Time:</strong> {selectedMetric.responseTime}ms
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Error Rate:</strong> {(selectedMetric.errorRate * 100).toFixed(2)}%
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Time:</strong> {new Date(selectedMetric.timestamp).toLocaleString()}
          </p>
        </div>
      )}
      {alerts.length > 0 && (
        <div className="alerts" style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          maxWidth: '300px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Performance Alerts</h4>
          {alerts.slice(-5).map((alert, i) => (
            <div key={i} style={{
              padding: '4px 0',
              borderBottom: i < alerts.length - 1 ? '1px solid #e5e7eb' : 'none',
              fontSize: '12px'
            }}>
              <span style={{
                color: alert.type === 'critical' ? '#ef4444' :
                       alert.type === 'warning' ? '#f59e0b' : '#6b7280',
                fontWeight: 'bold'
              }}>
                {alert.type.toUpperCase()}:
              </span> {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceOverlay;
