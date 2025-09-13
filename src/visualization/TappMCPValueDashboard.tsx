import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TappMCPValueMetrics {
  timestamp: number;
  totalTokensUsed: number;
  totalTokensSaved: number;
  totalBugsFound: number;
  totalCostSavings: number;
  totalTimeSaved: number;
  averageQualityScore: number;
  context7CacheHitRate: number;
  workflowEfficiency: number;
}

interface TappMCPValueDashboardProps {
  metrics: TappMCPValueMetrics[];
  width?: number;
  height?: number;
  onMetricClick?: (metric: TappMCPValueMetrics) => void;
}

const TappMCPValueDashboard: React.FC<TappMCPValueDashboardProps> = ({
  metrics,
  width = 1200,
  height = 600,
  onMetricClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<TappMCPValueMetrics | null>(null);
  const [totalSavings, setTotalSavings] = useState({ tokens: 0, cost: 0, time: 0, bugs: 0 });

  useEffect(() => {
    if (!svgRef.current || metrics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Calculate total savings
    const totals = metrics.reduce((acc, metric) => ({
      tokens: acc.tokens + metric.totalTokensSaved,
      cost: acc.cost + metric.totalCostSavings,
      time: acc.time + metric.totalTimeSaved,
      bugs: acc.bugs + metric.totalBugsFound
    }), { tokens: 0, cost: 0, time: 0, bugs: 0 });
    setTotalSavings(totals);

    // Sort metrics by timestamp
    const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate time range
    const minTime = d3.min(sortedMetrics, d => d.timestamp) || 0;
    const maxTime = d3.max(sortedMetrics, d => d.timestamp) || minTime + 1;

    // Set up scales
    const xScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([80, width - 80]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - 60, 40]);

    // Create main group
    const g = svg.append("g");

    // Add title
    g.append("text")
      .attr("class", "dashboard-title")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#1f2937")
      .text("TappMCP Value Dashboard - AI Assistant Enhancement Metrics");

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d3.timeFormat("%H:%M:%S")(new Date(d)))
      .ticks(8);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d}%`)
      .ticks(5);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - 60})`)
      .call(xAxis as any);

    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(80, 0)")
      .call(yAxis);

    // Create line generators for different metrics
    const tokensUsedLine = d3.line<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(Math.min(d.totalTokensUsed / 1000, 100))) // Scale to percentage
      .curve(d3.curveMonotoneX);

    const tokensSavedLine = d3.line<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(Math.min(d.totalTokensSaved / 1000, 100)))
      .curve(d3.curveMonotoneX);

    const qualityScoreLine = d3.line<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.averageQualityScore))
      .curve(d3.curveMonotoneX);

    const efficiencyLine = d3.line<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.workflowEfficiency))
      .curve(d3.curveMonotoneX);

    // Add area fills
    const tokensUsedArea = d3.area<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y0(height - 60)
      .y1(d => yScale(Math.min(d.totalTokensUsed / 1000, 100)))
      .curve(d3.curveMonotoneX);

    const tokensSavedArea = d3.area<TappMCPValueMetrics>()
      .x(d => xScale(d.timestamp))
      .y0(height - 60)
      .y1(d => yScale(Math.min(d.totalTokensSaved / 1000, 100)))
      .curve(d3.curveMonotoneX);

    // Add areas
    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "tokens-used-area")
      .attr("d", tokensUsedArea)
      .attr("fill", "#ef4444")
      .attr("fill-opacity", 0.2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "tokens-saved-area")
      .attr("d", tokensSavedArea)
      .attr("fill", "#10b981")
      .attr("fill-opacity", 0.2);

    // Add lines
    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "tokens-used-line")
      .attr("d", tokensUsedLine)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "tokens-saved-line")
      .attr("d", tokensSavedLine)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2);

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "quality-score-line")
      .attr("d", qualityScoreLine)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    g.append("path")
      .datum(sortedMetrics)
      .attr("class", "efficiency-line")
      .attr("d", efficiencyLine)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");

    // Add data points for bugs found
    const bugPoints = g.append("g")
      .attr("class", "bug-points")
      .selectAll("circle")
      .data(sortedMetrics.filter(d => d.totalBugsFound > 0))
      .enter().append("circle")
      .attr("cx", d => xScale(d.timestamp))
      .attr("cy", _d => yScale(90)) // Position at top
      .attr("r", d => Math.max(3, Math.min(10, d.totalBugsFound * 2))) // Size based on bugs found
      .attr("fill", "#f59e0b")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("click", (_event, d) => {
        setSelectedMetric(d);
        onMetricClick?.(d);
      })
      .on("mouseover", function(_event, d) {
        d3.select(this).attr("r", (d.totalBugsFound * 2 + 5));
        // Show tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.timestamp)}, ${yScale(90)})`);

        tooltip.append("rect")
          .attr("x", -40)
          .attr("y", -25)
          .attr("width", 80)
          .attr("height", 20)
          .attr("fill", "rgba(0, 0, 0, 0.8)")
          .attr("rx", 4);

        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "-10")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .text(`${d.totalBugsFound} bugs`);
      })
      .on("mouseout", function() {
        const currentData = d3.select(this).datum() as TappMCPValueMetrics;
        d3.select(this).attr("r", Math.max(3, Math.min(10, currentData.totalBugsFound * 2)));
        g.selectAll(".tooltip").remove();
      });

    // Add value summary boxes
    const summaryBox = g.append("g")
      .attr("class", "value-summary")
      .attr("transform", `translate(${width - 250}, 50)`);

    // Total tokens saved
    summaryBox.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 200)
      .attr("height", 40)
      .attr("fill", "#10b981")
      .attr("rx", 4);

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 15)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Tokens Saved");

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 30)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(totals.tokens.toLocaleString());

    // Total cost savings
    summaryBox.append("rect")
      .attr("x", 0)
      .attr("y", 50)
      .attr("width", 200)
      .attr("height", 40)
      .attr("fill", "#3b82f6")
      .attr("rx", 4);

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 65)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Cost Savings");

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 80)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(`$${totals.cost.toFixed(2)}`);

    // Total bugs found
    summaryBox.append("rect")
      .attr("x", 0)
      .attr("y", 100)
      .attr("width", 200)
      .attr("height", 40)
      .attr("fill", "#f59e0b")
      .attr("rx", 4);

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 115)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Bugs Found");

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 130)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(totals.bugs.toString());

    // Time saved
    summaryBox.append("rect")
      .attr("x", 0)
      .attr("y", 150)
      .attr("width", 200)
      .attr("height", 40)
      .attr("fill", "#8b5cf6")
      .attr("rx", 4);

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 165)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Time Saved");

    summaryBox.append("text")
      .attr("x", 10)
      .attr("y", 180)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(`${Math.round(totals.time / 3600)}h`);

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(80, 50)`);

    const legendItems = [
      { color: "#ef4444", label: "Tokens Used", dash: "none" },
      { color: "#10b981", label: "Tokens Saved", dash: "none" },
      { color: "#3b82f6", label: "Code Quality Score", dash: "5,5" },
      { color: "#8b5cf6", label: "Workflow Efficiency", dash: "3,3" },
      { color: "#f59e0b", label: "Bugs Found", dash: "none", shape: "circle" }
    ];

    legendItems.forEach((item, i) => {
      const itemGroup = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      if (item.shape === "circle") {
        itemGroup.append("circle")
          .attr("cx", 7)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", item.color);
      } else {
        itemGroup.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 15)
          .attr("y2", 0)
          .attr("stroke", item.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", item.dash);
      }

      itemGroup.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .attr("font-size", "12px")
        .text(item.label);
    });

    // Add Context7 cache hit rate indicator
    const avgCacheHitRate = d3.mean(sortedMetrics, d => d.context7CacheHitRate) || 0;
    const cacheIndicator = g.append("g")
      .attr("class", "cache-indicator")
      .attr("transform", `translate(${width - 250}, 220)`);

    cacheIndicator.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 200)
      .attr("height", 30)
      .attr("fill", avgCacheHitRate > 80 ? "#10b981" : avgCacheHitRate > 60 ? "#f59e0b" : "#ef4444")
      .attr("rx", 4);

    cacheIndicator.append("text")
      .attr("x", 10)
      .attr("y", 15)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(`Context7 Cache Hit Rate: ${avgCacheHitRate.toFixed(1)}%`);

  }, [metrics, width, height, onMetricClick]);

  return (
    <div className="tappmcp-value-dashboard-container">
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
          minWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>TappMCP Value Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Tokens Used:</strong> {selectedMetric.totalTokensUsed.toLocaleString()}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Tokens Saved:</strong> {selectedMetric.totalTokensSaved.toLocaleString()}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Cost Savings:</strong> ${selectedMetric.totalCostSavings.toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Bugs Found:</strong> {selectedMetric.totalBugsFound}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Quality Score:</strong> {selectedMetric.averageQualityScore}%
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Efficiency:</strong> {selectedMetric.workflowEfficiency}%
              </p>
            </div>
          </div>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Context7 Cache Hit Rate:</strong> {selectedMetric.context7CacheHitRate.toFixed(1)}%
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Time Saved:</strong> {Math.round(selectedMetric.totalTimeSaved / 60)} minutes
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Time:</strong> {new Date(selectedMetric.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TappMCPValueDashboard;
