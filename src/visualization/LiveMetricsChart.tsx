import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface LiveMetricsData {
  timestamp: number;
  value: number;
  label: string;
  color?: string;
}

interface LiveMetricsChartProps {
  data: LiveMetricsData[];
  width?: number;
  height?: number;
  title?: string;
  unit?: string;
  maxDataPoints?: number;
  showTrend?: boolean;
  onDataPointClick?: (dataPoint: LiveMetricsData) => void;
}

const LiveMetricsChart: React.FC<LiveMetricsChartProps> = ({
  data,
  width = 400,
  height = 200,
  title = 'Live Metrics',
  unit = '',
  maxDataPoints = 50,
  showTrend = true,
  onDataPointClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Limit data points
    const limitedData = data.slice(-maxDataPoints);
    const currentDataPoint = limitedData[limitedData.length - 1];
    setCurrentValue(currentDataPoint?.value || 0);

    // Calculate trend
    if (limitedData.length >= 2) {
      const recent = limitedData.slice(-5);
      const trendValue = recent[recent.length - 1].value - recent[0].value;
      if (trendValue > 0.1) setTrend('up');
      else if (trendValue < -0.1) setTrend('down');
      else setTrend('stable');
    }

    // Set up scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(limitedData, d => d.timestamp) as [number, number])
      .range([40, width - 20]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(limitedData, d => d.value) as [number, number])
      .nice()
      .range([height - 40, 20]);

    // Create main group
    const g = svg.append("g");

    // Add title
    g.append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#1f2937")
      .text(title);

    // Add current value display
    g.append("text")
      .attr("class", "current-value")
      .attr("x", width - 20)
      .attr("y", 15)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", currentDataPoint?.color || "#3b82f6")
      .text(`${currentValue.toFixed(1)}${unit}`);

    // Add trend indicator
    if (showTrend) {
      const trendSymbol = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
      const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';

      g.append("text")
        .attr("class", "trend-indicator")
        .attr("x", width - 50)
        .attr("y", 15)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", trendColor)
        .text(trendSymbol);
    }

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => d3.timeFormat("%H:%M:%S")(new Date(d)))
      .ticks(5);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d}${unit}`)
      .ticks(4);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - 40})`)
      .call(xAxis as any)
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("fill", "#6b7280");

    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(40, 0)")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("fill", "#6b7280");

    // Create line generator
    const line = d3.line<LiveMetricsData>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add area under the curve
    const area = d3.area<LiveMetricsData>()
      .x(d => xScale(d.timestamp))
      .y0(height - 40)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add area
    g.append("path")
      .datum(limitedData)
      .attr("class", "area")
      .attr("d", area)
      .attr("fill", currentDataPoint?.color || "#3b82f6")
      .attr("fill-opacity", 0.1);

    // Add line
    g.append("path")
      .datum(limitedData)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", currentDataPoint?.color || "#3b82f6")
      .attr("stroke-width", 2);

    // Add data points
    g.selectAll(".data-point")
      .data(limitedData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(d.timestamp))
      .attr("cy", d => yScale(d.value))
      .attr("r", 3)
      .attr("fill", d => d.color || "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onDataPointClick) {
          onDataPointClick(d);
        }
      })
      .on("mouseover", function(event, d) {
        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip.html(`
          <div><strong>${d.label}</strong></div>
          <div>Value: ${d.value.toFixed(2)}${unit}</div>
          <div>Time: ${new Date(d.timestamp).toLocaleTimeString()}</div>
        `);

        d3.select(this)
          .attr("r", 5)
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        d3.selectAll(".tooltip").remove();
        d3.select(this)
          .attr("r", 3)
          .attr("stroke-width", 1);
      });

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - 40})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + 60)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.5);

    g.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(40, 0)")
      .call(d3.axisLeft(yScale)
        .tickSize(-width + 60)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.5);

  }, [data, width, height, title, unit, maxDataPoints, showTrend, onDataPointClick]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default LiveMetricsChart;
