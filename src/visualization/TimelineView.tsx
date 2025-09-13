import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TimelineEvent {
  id: string;
  name: string;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused' | 'queued';
  phase: string;
  details?: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
  width?: number;
  height?: number;
  onEventClick?: (event: TimelineEvent) => void;
  onEventHover?: (event: TimelineEvent | null) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  width = 1000,
  height = 400,
  onEventClick,
  onEventHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate time range
    const minTime = d3.min(sortedEvents, d => d.timestamp) || 0;
    const maxTime = d3.max(sortedEvents, d => d.timestamp + (d.duration || 0)) || minTime + 1;
    const timeExtent = maxTime - minTime;

    // Set up scales
    const xScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([60, width - 60]);

    const yScale = d3.scaleBand()
      .domain(sortedEvents.map((_, i) => i.toString()))
      .range([40, height - 40])
      .padding(0.1);

    // Create main group
    const g = svg.append("g");

    // Add time axis
    const timeAxis = d3.axisTop(xScale)
      .tickFormat((d: any) => d3.timeFormat("%H:%M:%S")(new Date(d)))
      .ticks(10);

    g.append("g")
      .attr("class", "time-axis")
      .attr("transform", "translate(0, 20)")
      .call(timeAxis as any);

    // Add phase labels
    g.append("g")
      .attr("class", "phase-labels")
      .selectAll("text")
      .data(sortedEvents)
      .enter().append("text")
      .attr("x", 10)
      .attr("y", d => yScale(sortedEvents.indexOf(d).toString())! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(d => d.phase);

    // Create timeline bars
    const bars = g.append("g")
      .attr("class", "timeline-bars")
      .selectAll("rect")
      .data(sortedEvents)
      .enter().append("rect")
      .attr("x", d => xScale(d.timestamp))
      .attr("y", d => yScale(sortedEvents.indexOf(d).toString())!)
      .attr("width", d => d.duration ? xScale(d.timestamp + d.duration) - xScale(d.timestamp) : 20)
      .attr("height", yScale.bandwidth())
      .attr("fill", d => getStatusColor(d.status))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4)
      .on("click", (_event, d) => {
        setSelectedEvent(d);
        onEventClick?.(d);
      })
      .on("mouseover", (_event, d) => {
        onEventHover?.(d);
        bars.style("opacity", bar => bar === d ? 1 : 0.7);
      })
      .on("mouseout", () => {
        onEventHover?.(null);
        bars.style("opacity", 1);
      });

    // Add progress indicators for running events
    const progressBars = g.append("g")
      .attr("class", "progress-bars")
      .selectAll("rect")
      .data(sortedEvents.filter(d => d.status === 'running'))
      .enter().append("rect")
      .attr("x", d => xScale(d.timestamp))
      .attr("y", d => yScale(sortedEvents.indexOf(d).toString())! + yScale.bandwidth() - 4)
      .attr("width", d => {
        const totalWidth = d.duration ? xScale(d.timestamp + d.duration) - xScale(d.timestamp) : 20;
        return totalWidth * 0.8; // 80% progress for running events
      })
      .attr("height", 4)
      .attr("fill", "#fff")
      .attr("rx", 2)
      .attr("ry", 2);

    // Add event labels
    g.append("g")
      .attr("class", "event-labels")
      .selectAll("text")
      .data(sortedEvents)
      .enter().append("text")
      .attr("x", d => xScale(d.timestamp) + 5)
      .attr("y", d => yScale(sortedEvents.indexOf(d).toString())! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => d.name);

    // Add current time indicator
    const currentTime = Date.now();
    if (currentTime >= minTime && currentTime <= maxTime) {
      g.append("line")
        .attr("class", "current-time")
        .attr("x1", xScale(currentTime))
        .attr("y1", 40)
        .attr("x2", xScale(currentTime))
        .attr("y2", height - 40)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      g.append("text")
        .attr("class", "current-time-label")
        .attr("x", xScale(currentTime) + 5)
        .attr("y", 35)
        .attr("font-size", "12px")
        .attr("fill", "#ef4444")
        .attr("font-weight", "bold")
        .text("NOW");
    }

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        bars.attr("x", d => newXScale(d.timestamp))
            .attr("width", d => d.duration ? newXScale(d.timestamp + d.duration) - newXScale(d.timestamp) : 20);

        g.select(".time-axis").call(d3.axisTop(newXScale).tickFormat((d: any) => d3.timeFormat("%H:%M:%S")(new Date(d))) as any);
      });

    svg.call(zoom);

  }, [events, width, height, onEventClick, onEventHover]);

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

  return (
    <div className="timeline-view-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />
      {selectedEvent && (
        <div className="event-details" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          minWidth: '250px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{selectedEvent.name}</h3>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Status:</strong> {selectedEvent.status}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Phase:</strong> {selectedEvent.phase}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Time:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}
          </p>
          {selectedEvent.duration && (
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Duration:</strong> {Math.round(selectedEvent.duration / 1000)}s
            </p>
          )}
          {selectedEvent.details && (
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Details:</strong> {selectedEvent.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
