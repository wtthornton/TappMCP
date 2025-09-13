/**
 * Workflow Data Service
 *
 * Manages workflow data persistence, retrieval, and synchronization
 * with the orchestration engine for visualization purposes.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';
import { Workflow, WorkflowPhase, WorkflowTask } from '../core/orchestration-engine.js';
import { WorkflowGraphBuilder } from './WorkflowGraphBuilder.js';
import { WorkflowGraphAPI } from './WorkflowGraphAPI.js';
import {
  WorkflowGraph,
  WorkflowTimeline,
  WorkflowStatistics,
  WorkflowFilterOptions,
  WorkflowVisualizationOptions
} from './types.js';

/**
 * Workflow Data Service
 *
 * Central service for managing workflow data and providing
 * visualization-ready data to the frontend.
 *
 * @example
 * ```typescript
 * const service = new WorkflowDataService();
 * await service.initialize();
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowDataService extends EventEmitter {
  private workflows: Map<string, Workflow> = new Map();
  private executionData: Map<string, any> = new Map();
  private graphBuilder: WorkflowGraphBuilder;
  private graphAPI: WorkflowGraphAPI;
  private isInitialized = false;

  // Caches
  private graphCache: LRUCache<string, WorkflowGraph>;
  private timelineCache: LRUCache<string, WorkflowTimeline>;
  private statisticsCache: LRUCache<string, WorkflowStatistics>;

  constructor() {
    super();

    this.graphBuilder = new WorkflowGraphBuilder();
    this.graphAPI = new WorkflowGraphAPI();

    this.initializeCaches();
  }

  /**
   * Initializes the workflow data service
   *
   * @returns Promise resolving when initialized
   *
   * @example
   * ```typescript
   * await service.initialize();
   * ```
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Register with graph API
      for (const [workflowId, workflow] of this.workflows) {
        const executionData = this.executionData.get(workflowId);
        this.graphAPI.registerWorkflow(workflow, executionData);
      }

      this.isInitialized = true;
      this.emit('service:initialized');
    } catch (error) {
      this.emit('service:error', error);
      throw error;
    }
  }

  /**
   * Registers a workflow for data management
   *
   * @param workflow - Workflow to register
   * @param executionData - Optional execution data
   * @returns Promise resolving when registered
   *
   * @example
   * ```typescript
   * await service.registerWorkflow(workflow, executionData);
   * ```
   */
  async registerWorkflow(workflow: Workflow, executionData?: any): Promise<void> {
    this.workflows.set(workflow.id, workflow);

    if (executionData) {
      this.executionData.set(workflow.id, executionData);
    }

    // Register with graph API
    this.graphAPI.registerWorkflow(workflow, executionData);

    // Clear related caches
    this.clearWorkflowCaches(workflow.id);

    this.emit('workflow:registered', { workflowId: workflow.id, workflow });
  }

  /**
   * Unregisters a workflow
   *
   * @param workflowId - Workflow ID to unregister
   * @returns Promise resolving when unregistered
   *
   * @example
   * ```typescript
   * await service.unregisterWorkflow('workflow-123');
   * ```
   */
  async unregisterWorkflow(workflowId: string): Promise<void> {
    this.workflows.delete(workflowId);
    this.executionData.delete(workflowId);

    // Unregister from graph API
    this.graphAPI.unregisterWorkflow(workflowId);

    // Clear related caches
    this.clearWorkflowCaches(workflowId);

    this.emit('workflow:unregistered', { workflowId });
  }

  /**
   * Updates workflow data
   *
   * @param workflowId - Workflow ID to update
   * @param updates - Partial workflow updates
   * @returns Promise resolving when updated
   *
   * @example
   * ```typescript
   * await service.updateWorkflow('workflow-123', { status: 'running' });
   * ```
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const updatedWorkflow = { ...workflow, ...updates };
    this.workflows.set(workflowId, updatedWorkflow);

    // Update graph API
    const executionData = this.executionData.get(workflowId);
    this.graphAPI.registerWorkflow(updatedWorkflow, executionData);

    // Clear related caches
    this.clearWorkflowCaches(workflowId);

    this.emit('workflow:updated', { workflowId, workflow: updatedWorkflow, updates });
  }

  /**
   * Updates workflow execution data
   *
   * @param workflowId - Workflow ID
   * @param executionData - Execution data to update
   * @returns Promise resolving when updated
   *
   * @example
   * ```typescript
   * await service.updateExecutionData('workflow-123', { metrics: {...} });
   * ```
   */
  async updateExecutionData(workflowId: string, executionData: any): Promise<void> {
    const currentData = this.executionData.get(workflowId) || {};
    const updatedData = { ...currentData, ...executionData };

    this.executionData.set(workflowId, updatedData);

    // Update graph API
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      this.graphAPI.registerWorkflow(workflow, updatedData);
    }

    // Clear related caches
    this.clearWorkflowCaches(workflowId);

    this.emit('execution:updated', { workflowId, executionData: updatedData });
  }

  /**
   * Gets a workflow graph
   *
   * @param workflowId - Workflow ID
   * @param options - Visualization options
   * @returns Promise resolving to workflow graph
   *
   * @example
   * ```typescript
   * const graph = await service.getWorkflowGraph('workflow-123');
   * ```
   */
  async getWorkflowGraph(workflowId: string, options?: Partial<WorkflowVisualizationOptions>): Promise<WorkflowGraph> {
    const cacheKey = `${workflowId}-${JSON.stringify(options)}`;
    let graph = this.graphCache.get(cacheKey);

    if (!graph) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      graph = this.graphBuilder.buildGraph(workflow, options);
      this.graphCache.set(cacheKey, graph);
    }

    return graph;
  }

  /**
   * Gets a workflow timeline
   *
   * @param workflowId - Workflow ID
   * @returns Promise resolving to workflow timeline
   *
   * @example
   * ```typescript
   * const timeline = await service.getWorkflowTimeline('workflow-123');
   * ```
   */
  async getWorkflowTimeline(workflowId: string): Promise<WorkflowTimeline> {
    let timeline = this.timelineCache.get(workflowId);

    if (!timeline) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const executionData = this.executionData.get(workflowId) || {};
      timeline = this.graphBuilder.buildTimeline(workflow, executionData);
      this.timelineCache.set(workflowId, timeline);
    }

    return timeline;
  }

  /**
   * Gets workflow statistics
   *
   * @param workflowId - Workflow ID
   * @returns Promise resolving to workflow statistics
   *
   * @example
   * ```typescript
   * const stats = await service.getWorkflowStatistics('workflow-123');
   * ```
   */
  async getWorkflowStatistics(workflowId: string): Promise<WorkflowStatistics> {
    let statistics = this.statisticsCache.get(workflowId);

    if (!statistics) {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const executionData = this.executionData.get(workflowId) || {};
      statistics = this.graphBuilder.buildStatistics(workflow, executionData);
      this.statisticsCache.set(workflowId, statistics);
    }

    return statistics;
  }

  /**
   * Gets all workflow graphs
   *
   * @param options - Filter and visualization options
   * @returns Promise resolving to workflow graphs
   *
   * @example
   * ```typescript
   * const graphs = await service.getAllWorkflowGraphs({ limit: 10 });
   * ```
   */
  async getAllWorkflowGraphs(options?: {
    filter?: WorkflowFilterOptions;
    visualization?: Partial<WorkflowVisualizationOptions>;
    limit?: number;
    offset?: number;
  }): Promise<WorkflowGraph[]> {
    let workflows = Array.from(this.workflows.values());

    // Apply filters
    if (options?.filter) {
      workflows = this.applyFilters(workflows, options.filter);
    }

    // Apply pagination
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    workflows = workflows.slice(offset, offset + limit);

    // Build graphs
    const graphs: WorkflowGraph[] = [];
    for (const workflow of workflows) {
      const graph = await this.getWorkflowGraph(workflow.id, options?.visualization);
      graphs.push(graph);
    }

    return graphs;
  }

  /**
   * Searches workflows
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Promise resolving to matching workflows
   *
   * @example
   * ```typescript
   * const results = await service.searchWorkflows('user management');
   * ```
   */
  async searchWorkflows(query: string, options?: {
    limit?: number;
    offset?: number;
    visualization?: Partial<WorkflowVisualizationOptions>;
  }): Promise<WorkflowGraph[]> {
    const searchTerm = query.toLowerCase();
    const workflows = Array.from(this.workflows.values())
      .filter(workflow =>
        workflow.name.toLowerCase().includes(searchTerm) ||
        workflow.type.toLowerCase().includes(searchTerm) ||
        workflow.phases.some(phase =>
          phase.name.toLowerCase().includes(searchTerm) ||
          phase.description.toLowerCase().includes(searchTerm)
        )
      );

    // Apply pagination
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;
    const paginatedWorkflows = workflows.slice(offset, offset + limit);

    // Build graphs
    const graphs: WorkflowGraph[] = [];
    for (const workflow of paginatedWorkflows) {
      const graph = await this.getWorkflowGraph(workflow.id, options?.visualization);
      graphs.push(graph);
    }

    return graphs;
  }

  /**
   * Gets the graph API instance
   *
   * @returns Graph API instance
   *
   * @example
   * ```typescript
   * const api = service.getGraphAPI();
   * app.use('/api/workflows', api.getRouter());
   * ```
   */
  getGraphAPI(): WorkflowGraphAPI {
    return this.graphAPI;
  }

  /**
   * Gets service statistics
   *
   * @returns Service statistics
   *
   * @example
   * ```typescript
   * const stats = service.getServiceStatistics();
   * ```
   */
  getServiceStatistics(): {
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    cacheHitRate: number;
    memoryUsage: number;
  } {
    const workflows = Array.from(this.workflows.values());
    const activeWorkflows = workflows.filter(w => w.status === 'running').length;
    const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
    const failedWorkflows = workflows.filter(w => w.status === 'failed').length;

    return {
      totalWorkflows: workflows.length,
      activeWorkflows,
      completedWorkflows,
      failedWorkflows,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }

  /**
   * Clears all caches
   *
   * @example
   * ```typescript
   * service.clearAllCaches();
   * ```
   */
  clearAllCaches(): void {
    this.graphCache.clear();
    this.timelineCache.clear();
    this.statisticsCache.clear();

    this.emit('caches:cleared');
  }

  /**
   * Stops the service
   *
   * @returns Promise resolving when stopped
   *
   * @example
   * ```typescript
   * await service.stop();
   * ```
   */
  async stop(): Promise<void> {
    this.clearAllCaches();
    this.workflows.clear();
    this.executionData.clear();
    this.isInitialized = false;

    this.emit('service:stopped');
  }

  // Private methods

  private initializeCaches(): void {
    this.graphCache = new LRUCache<string, WorkflowGraph>({
      max: 100,
      ttl: 5 * 60 * 1000 // 5 minutes
    });

    this.timelineCache = new LRUCache<string, WorkflowTimeline>({
      max: 100,
      ttl: 2 * 60 * 1000 // 2 minutes
    });

    this.statisticsCache = new LRUCache<string, WorkflowStatistics>({
      max: 100,
      ttl: 10 * 60 * 1000 // 10 minutes
    });
  }

  private clearWorkflowCaches(workflowId: string): void {
    // Clear graph cache entries for this workflow
    for (const key of this.graphCache.keys()) {
      if (key.startsWith(workflowId)) {
        this.graphCache.delete(key);
      }
    }

    // Clear timeline and statistics caches
    this.timelineCache.delete(workflowId);
    this.statisticsCache.delete(workflowId);
  }

  private applyFilters(workflows: Workflow[], filters: WorkflowFilterOptions): Workflow[] {
    let filtered = workflows;

    if (filters.status) {
      filtered = filtered.filter(w => filters.status!.includes(w.status));
    }

    if (filters.roles) {
      filtered = filtered.filter(w =>
        w.phases.some(p => filters.roles!.includes(p.role))
      );
    }

    if (filters.phases) {
      filtered = filtered.filter(w =>
        w.phases.some(p => filters.phases!.includes(p.name))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchTerm) ||
        w.type.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(w => {
        const createdAt = w.businessContext?.createdAt;
        if (!createdAt) return false;

        const date = new Date(createdAt);
        return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
      });
    }

    return filtered;
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation
    const totalRequests = this.graphCache.size + this.timelineCache.size + this.statisticsCache.size;
    const cacheHits = totalRequests; // Simplified - in real implementation, track hits/misses

    return totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
  }
}
