/**
 * Workflow Timeline Visualizer
 *
 * D3.js-based timeline visualization for workflow events and phases.
 * Provides interactive timeline with zoom, pan, and event details.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import * as d3 from 'd3';
import { WorkflowTimeline, WorkflowTimelineEvent, WorkflowTimelineOptions } from '../workflow/types.js';

/**
 * Workflow Timeline Visualizer
 *
 * D3.js-based interactive timeline for workflow events with
 * real-time updates, zoom, pan, and event filtering.
 *
 * @example
 * ```typescript
 * const visualizer = new WorkflowTimelineVisualizer(container, options);
 * await visualizer.render(timeline);
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowTimelineVisualizer {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private options: WorkflowTimelineOptions;
  private currentTimeline: WorkflowTimeline | null = null;
  private selectedEvents: Set<string> = new Set();
  private zoomBehavior: d3.ZoomBehavior<SVGGElement, unknown>;

  // Dimensions and scales
  private width: number = 800;
  private height: number = 400;
  private margin = { top: 20, right: 30, bottom: 40, left: 60 };
  private innerWidth: number;
  private innerHeight: number;

  // D3 selections
  private xScale: d3.ScaleTime<number, number> | null = null;
  private yScale: d3.ScaleBand<string> | null = null;
  private eventGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(container: HTMLElement, options?: Partial<WorkflowTimelineOptions>) {
    this.container = container;
    this.options = this.mergeOptions(options);
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;
    this.initializeSVG();
    this.setupZoom();
    this.setupEventHandlers();
  }

  /**
   * Renders a workflow timeline
   *
   * @param timeline - Workflow timeline to render
   * @returns Promise resolving when rendering is complete
   *
   * @example
   * ```typescript
   * await visualizer.render(timeline);
   * ```
   */
  async render(timeline: WorkflowTimeline): Promise<void> {
    this.currentTimeline = timeline;
    this.updateDimensions();
    this.setupScales();
    this.renderGrid();
    this.renderAxis();
    this.renderEvents();
    this.setupInteractions();
  }

  /**
   * Updates the visualization with new data
   *
   * @param timeline - Updated workflow timeline
   * @returns Promise resolving when update is complete
   *
   * @example
   * ```typescript
   * await visualizer.update(timeline);
   * ```
   */
  async update(timeline: WorkflowTimeline): Promise<void> {
    if (!this.currentTimeline) {
      return this.render(timeline);
    }

    this.currentTimeline = timeline;
    this.updateScales();
    this.updateEvents();
    this.updateAxis();
  }

  /**
   * Updates visualization options
   *
   * @param options - New visualization options
   * @returns Promise resolving when update is complete
   *
   * @example
   * ```typescript
   * await visualizer.updateOptions({ showLabels: true });
   * ```
   */
  async updateOptions(options: Partial<WorkflowTimelineOptions>): Promise<void> {
    this.options = this.mergeOptions(options);

    if (this.currentTimeline) {
      await this.render(this.currentTimeline);
    }
  }

  /**
   * Gets currently selected events
   *
   * @returns Array of selected event IDs
   *
   * @example
   * ```typescript
   * const selected = visualizer.getSelectedEvents();
   * ```
   */
  getSelectedEvents(): string[] {
    return Array.from(this.selectedEvents);
  }

  /**
   * Selects events by IDs
   *
   * @param eventIds - Event IDs to select
   * @returns Promise resolving when selection is complete
   *
   * @example
   * ```typescript
   * await visualizer.selectEvents(['event-1', 'event-2']);
   * ```
   */
  async selectEvents(eventIds: string[]): Promise<void> {
    this.selectedEvents.clear();
    eventIds.forEach(id => this.selectedEvents.add(id));
    this.updateEventSelection();
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
    this.selectedEvents.clear();
    this.updateEventSelection();
  }

  /**
   * Zooms to fit all events
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
    if (!this.currentTimeline || this.currentTimeline.events.length === 0) {
      return;
    }

    const timeExtent = d3.extent(this.currentTimeline.events, d => d.timestamp) as [number, number];
    const scale = this.innerWidth / (timeExtent[1] - timeExtent[0]);
    const translate = [
      -timeExtent[0] * scale + this.margin.left,
      this.margin.top
    ];

    this.g.transition()
      .duration(duration)
      .call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  /**
   * Filters events by type
   *
   * @param eventTypes - Event types to show
   * @returns Promise resolving when filter is applied
   *
   * @example
   * ```typescript
   * await visualizer.filterByType(['start', 'end']);
   * ```
   */
  async filterByType(eventTypes: string[]): Promise<void> {
    this.options.filter = { ...this.options.filter, eventTypes };

    if (this.currentTimeline) {
      await this.render(this.currentTimeline);
    }
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
    this.clear();
  }

  // Private methods

  private initializeSVG(): void {
    // Clear container
    d3.select(this.container).selectAll('*').remove();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background-color', '#ffffff');

    // Create main group for zoom/pan
    this.g = this.svg.append('g');

    // Create groups for different elements
    this.gridGroup = this.g.append('g').attr('class', 'grid');
    this.axisGroup = this.g.append('g').attr('class', 'axis');
    this.eventGroup = this.g.append('g').attr('class', 'events');
  }

  private setupZoom(): void {
    this.zoomBehavior = d3.zoom<SVGGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);
  }

  private setupEventHandlers(): void {
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.currentTimeline) {
        this.updateDimensions();
        this.updateScales();
        this.updateEvents();
        this.updateAxis();
      }
    });
  }

  private mergeOptions(options?: Partial<WorkflowTimelineOptions>): WorkflowTimelineOptions {
    const defaultOptions: WorkflowTimelineOptions = {
      showLabels: true,
      showGrid: true,
      showAxis: true,
      showTooltips: true,
      filter: {
        eventTypes: [],
        severity: [],
        timeRange: null
      },
      colors: {
        start: '#28a745',
        end: '#dc3545',
        status_change: '#ffc107',
        alert: '#fd7e14',
        milestone: '#6f42c1'
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
        tooltips: true
      }
    };

    return { ...defaultOptions, ...options };
  }

  private updateDimensions(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 400;
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private setupScales(): void {
    if (!this.currentTimeline) return;

    const events = this.getFilteredEvents();
    const timeExtent = d3.extent(events, d => d.timestamp) as [number, number];

    // X scale (time)
    this.xScale = d3.scaleTime()
      .domain(timeExtent)
      .range([0, this.innerWidth]);

    // Y scale (event types or phases)
    const eventTypes = [...new Set(events.map(d => d.type))];
    this.yScale = d3.scaleBand()
      .domain(eventTypes)
      .range([0, this.innerHeight])
      .padding(0.1);
  }

  private updateScales(): void {
    if (!this.currentTimeline || !this.xScale || !this.yScale) return;

    const events = this.getFilteredEvents();
    const timeExtent = d3.extent(events, d => d.timestamp) as [number, number];

    this.xScale.domain(timeExtent);
    this.yScale.domain([...new Set(events.map(d => d.type))]);
  }

  private renderGrid(): void {
    if (!this.options.showGrid || !this.xScale) return;

    this.gridGroup.selectAll('.grid-line').remove();

    // Vertical grid lines
    const xTicks = this.xScale.ticks(10);
    this.gridGroup.selectAll('.grid-line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => this.xScale!(d))
      .attr('x2', d => this.xScale!(d))
      .attr('y1', 0)
      .attr('y2', this.innerHeight)
      .attr('stroke', '#e9ecef')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);
  }

  private renderAxis(): void {
    if (!this.options.showAxis || !this.xScale || !this.yScale) return;

    this.axisGroup.selectAll('*').remove();

    // X axis
    const xAxis = d3.axisBottom(this.xScale)
      .tickFormat(d3.timeFormat('%H:%M:%S'))
      .ticks(8);

    this.axisGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.innerHeight})`)
      .call(xAxis);

    // Y axis
    const yAxis = d3.axisLeft(this.yScale);

    this.axisGroup.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(yAxis);

    // Axis labels
    this.axisGroup.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left)
      .attr('x', 0 - (this.margin.top + this.innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Event Type');

    this.axisGroup.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `translate(${this.margin.left + this.innerWidth / 2}, ${this.margin.top + this.innerHeight + 35})`)
      .style('text-anchor', 'middle')
      .text('Time');
  }

  private updateAxis(): void {
    if (!this.options.showAxis || !this.xScale || !this.yScale) return;

    // Update X axis
    const xAxis = d3.axisBottom(this.xScale)
      .tickFormat(d3.timeFormat('%H:%M:%S'))
      .ticks(8);

    this.axisGroup.select('.x-axis')
      .transition()
      .duration(this.options.animation.duration)
      .call(xAxis);

    // Update Y axis
    const yAxis = d3.axisLeft(this.yScale);

    this.axisGroup.select('.y-axis')
      .transition()
      .duration(this.options.animation.duration)
      .call(yAxis);
  }

  private renderEvents(): void {
    if (!this.currentTimeline || !this.xScale || !this.yScale) return;

    const events = this.getFilteredEvents();
    const eventSelection = this.eventGroup.selectAll('.event')
      .data(events, (d: any) => d.id);

    eventSelection.exit().remove();

    const eventEnter = eventSelection.enter()
      .append('g')
      .attr('class', 'event')
      .style('cursor', 'pointer');

    // Event circles
    eventEnter.append('circle')
      .attr('r', d => this.getEventRadius(d))
      .attr('fill', d => this.getEventColor(d.type))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', d => this.getEventOpacity(d));

    // Event labels
    if (this.options.showLabels) {
      eventEnter.append('text')
        .attr('class', 'event-label')
        .attr('text-anchor', 'middle')
        .attr('dy', -8)
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .text(d => d.description);

      eventEnter.append('text')
        .attr('class', 'event-time')
        .attr('text-anchor', 'middle')
        .attr('dy', 8)
        .attr('font-size', '8px')
        .attr('fill', '#666')
        .text(d => d3.timeFormat('%H:%M:%S')(new Date(d.timestamp)));
    }

    // Position events
    this.updateEventPositions();
  }

  private updateEvents(): void {
    if (!this.currentTimeline || !this.xScale || !this.yScale) return;

    const events = this.getFilteredEvents();
    const eventSelection = this.eventGroup.selectAll('.event')
      .data(events, (d: any) => d.id);

    // Update visual properties
    eventSelection.select('circle')
      .transition()
      .duration(this.options.animation.duration)
      .attr('r', d => this.getEventRadius(d))
      .attr('fill', d => this.getEventColor(d.type))
      .attr('opacity', d => this.getEventOpacity(d));

    // Update positions
    this.updateEventPositions();
  }

  private updateEventPositions(): void {
    if (!this.xScale || !this.yScale) return;

    this.eventGroup.selectAll('.event')
      .attr('transform', d => {
        const x = this.xScale!(d.timestamp) + this.margin.left;
        const y = this.yScale!(d.type)! + this.margin.top;
        return `translate(${x}, ${y})`;
      });
  }

  private updateEventSelection(): void {
    this.eventGroup.selectAll('.event')
      .classed('selected', d => this.selectedEvents.has(d.id))
      .style('filter', d => this.selectedEvents.has(d.id) ? 'drop-shadow(0 0 6px rgba(0,123,255,0.6))' : null);
  }

  private setupInteractions(): void {
    if (!this.options.interaction.selection) return;

    // Event selection
    this.eventGroup.selectAll('.event')
      .on('click', (event, d) => {
        event.stopPropagation();
        this.toggleEventSelection(d.id);
      });

    // Background click to clear selection
    this.svg.on('click', () => {
      this.clearSelection();
    });
  }

  private toggleEventSelection(eventId: string): void {
    if (this.selectedEvents.has(eventId)) {
      this.selectedEvents.delete(eventId);
    } else {
      this.selectedEvents.add(eventId);
    }
    this.updateEventSelection();
  }

  private getFilteredEvents(): WorkflowTimelineEvent[] {
    if (!this.currentTimeline) return [];

    let events = this.currentTimeline.events;

    // Filter by event type
    if (this.options.filter.eventTypes.length > 0) {
      events = events.filter(event => this.options.filter.eventTypes.includes(event.type));
    }

    // Filter by severity
    if (this.options.filter.severity.length > 0) {
      events = events.filter(event =>
        event.severity && this.options.filter.severity.includes(event.severity)
      );
    }

    // Filter by time range
    if (this.options.filter.timeRange) {
      const [start, end] = this.options.filter.timeRange;
      events = events.filter(event =>
        event.timestamp >= start && event.timestamp <= end
      );
    }

    return events;
  }

  private getEventColor(eventType: string): string {
    return this.options.colors[eventType as keyof typeof this.options.colors] || '#6c757d';
  }

  private getEventRadius(event: WorkflowTimelineEvent): number {
    const baseRadius = 6;
    const severityMultiplier = event.severity === 'critical' ? 1.5 :
                              event.severity === 'error' ? 1.3 :
                              event.severity === 'warning' ? 1.1 : 1;
    return baseRadius * severityMultiplier;
  }

  private getEventOpacity(event: WorkflowTimelineEvent): number {
    return event.severity === 'critical' ? 1 :
           event.severity === 'error' ? 0.9 :
           event.severity === 'warning' ? 0.8 : 0.7;
  }

  private clear(): void {
    this.eventGroup.selectAll('*').remove();
    this.axisGroup.selectAll('*').remove();
    this.gridGroup.selectAll('*').remove();
  }
}
