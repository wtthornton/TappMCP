/**
 * Workflow Graph API
 *
 * REST API service for accessing workflow graph data and visualizations.
 * Provides endpoints for workflow graphs, timelines, and statistics.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Request, Response } from 'express';
import { WorkflowGraphBuilder } from './WorkflowGraphBuilder.js';
import {
  WorkflowGraph,
  WorkflowTimeline,
  WorkflowStatistics,
  WorkflowFilterOptions,
  WorkflowVisualizationOptions,
  WorkflowGraphResponse,
  WorkflowTimelineResponse,
  WorkflowStatisticsResponse
} from './types.js';
import { Workflow } from '../core/orchestration-engine.js';

/**
 * Workflow Graph API Service
 *
 * Provides REST API endpoints for workflow visualization data.
 *
 * @example
 * ```typescript
 * const api = new WorkflowGraphAPI();
 * app.use('/api/workflows', api.getRouter());
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowGraphAPI {
  private graphBuilder: WorkflowGraphBuilder;
  private workflows: Map<string, Workflow> = new Map();
  private executionData: Map<string, any> = new Map();

  constructor() {
    this.graphBuilder = new WorkflowGraphBuilder();
  }

  /**
   * Registers a workflow for API access
   *
   * @param workflow - Workflow to register
   * @param executionData - Optional execution data
   *
   * @example
   * ```typescript
   * api.registerWorkflow(workflow, executionData);
   * ```
   */
  registerWorkflow(workflow: Workflow, executionData?: any): void {
    this.workflows.set(workflow.id, workflow);
    if (executionData) {
      this.executionData.set(workflow.id, executionData);
    }
  }

  /**
   * Unregisters a workflow
   *
   * @param workflowId - Workflow ID to unregister
   *
   * @example
   * ```typescript
   * api.unregisterWorkflow('workflow-123');
   * ```
   */
  unregisterWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
    this.executionData.delete(workflowId);
  }

  /**
   * Gets Express router with all API endpoints
   *
   * @returns Express router
   *
   * @example
   * ```typescript
   * app.use('/api/workflows', api.getRouter());
   * ```
   */
  getRouter() {
    const express = require('express');
    const router = express.Router();

    // Workflow graphs
    router.get('/graphs', this.getWorkflowGraphs.bind(this));
    router.get('/graphs/:workflowId', this.getWorkflowGraph.bind(this));
    router.post('/graphs/:workflowId/layout', this.updateWorkflowLayout.bind(this));

    // Workflow timelines
    router.get('/timelines/:workflowId', this.getWorkflowTimeline.bind(this));

    // Workflow statistics
    router.get('/statistics/:workflowId', this.getWorkflowStatistics.bind(this));
    router.get('/statistics', this.getAllWorkflowStatistics.bind(this));

    // Workflow search and filtering
    router.get('/search', this.searchWorkflows.bind(this));
    router.get('/filter', this.filterWorkflows.bind(this));

    // Workflow visualization options
    router.get('/visualization-options', this.getVisualizationOptions.bind(this));
    router.post('/visualization-options', this.updateVisualizationOptions.bind(this));

    return router;
  }

  /**
   * GET /api/workflows/graphs
   * Gets all workflow graphs
   */
  private async getWorkflowGraphs(req: Request, res: Response): Promise<void> {
    try {
      const { layout, limit = 10, offset = 0 } = req.query;

      const workflows = Array.from(this.workflows.values())
        .slice(Number(offset), Number(offset) + Number(limit));

      const graphs: WorkflowGraph[] = [];

      for (const workflow of workflows) {
        const options: Partial<WorkflowVisualizationOptions> = {};
        if (layout) {
          options.layout = layout as any;
        }

        const graph = this.graphBuilder.buildGraph(workflow, options);
        graphs.push(graph);
      }

      const response: WorkflowGraphResponse = {
        success: true,
        data: graphs,
        metadata: {
          total: this.workflows.size,
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          timestamp: new Date()
        }
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get workflow graphs');
    }
  }

  /**
   * GET /api/workflows/graphs/:workflowId
   * Gets a specific workflow graph
   */
  private async getWorkflowGraph(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      const { layout } = req.query;

      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: `Workflow ${workflowId} not found`
          }
        });
        return;
      }

      const options: Partial<WorkflowVisualizationOptions> = {};
      if (layout) {
        options.layout = layout as any;
      }

      const graph = this.graphBuilder.buildGraph(workflow, options);

      const response: WorkflowGraphResponse = {
        success: true,
        data: graph,
        metadata: {
          timestamp: new Date()
        }
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get workflow graph');
    }
  }

  /**
   * POST /api/workflows/graphs/:workflowId/layout
   * Updates workflow graph layout
   */
  private async updateWorkflowLayout(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      const { algorithm, parameters } = req.body;

      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: `Workflow ${workflowId} not found`
          }
        });
        return;
      }

      const options: Partial<WorkflowVisualizationOptions> = {
        layout: algorithm,
        ...parameters
      };

      const graph = this.graphBuilder.buildGraph(workflow, options);

      const response: WorkflowGraphResponse = {
        success: true,
        data: graph,
        metadata: {
          timestamp: new Date()
        }
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to update workflow layout');
    }
  }

  /**
   * GET /api/workflows/timelines/:workflowId
   * Gets workflow timeline
   */
  private async getWorkflowTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;

      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: `Workflow ${workflowId} not found`
          }
        });
        return;
      }

      const executionData = this.executionData.get(workflowId) || {};
      const timeline = this.graphBuilder.buildTimeline(workflow, executionData);

      const response: WorkflowTimelineResponse = {
        success: true,
        data: timeline,
        metadata: {
          timestamp: new Date()
        }
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get workflow timeline');
    }
  }

  /**
   * GET /api/workflows/statistics/:workflowId
   * Gets workflow statistics
   */
  private async getWorkflowStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;

      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: `Workflow ${workflowId} not found`
          }
        });
        return;
      }

      const executionData = this.executionData.get(workflowId) || {};
      const statistics = this.graphBuilder.buildStatistics(workflow, executionData);

      const response: WorkflowStatisticsResponse = {
        success: true,
        data: statistics,
        metadata: {
          timestamp: new Date()
        }
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get workflow statistics');
    }
  }

  /**
   * GET /api/workflows/statistics
   * Gets statistics for all workflows
   */
  private async getAllWorkflowStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const workflows = Array.from(this.workflows.values())
        .slice(Number(offset), Number(offset) + Number(limit));

      const statistics = workflows.map(workflow => {
        const executionData = this.executionData.get(workflow.id) || {};
        return this.graphBuilder.buildStatistics(workflow, executionData);
      });

      res.json({
        success: true,
        data: statistics,
        metadata: {
          total: this.workflows.size,
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get all workflow statistics');
    }
  }

  /**
   * GET /api/workflows/search
   * Searches workflows
   */
  private async searchWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 10, offset = 0 } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query is required'
          }
        });
        return;
      }

      const searchTerm = q.toString().toLowerCase();
      const workflows = Array.from(this.workflows.values())
        .filter(workflow =>
          workflow.name.toLowerCase().includes(searchTerm) ||
          workflow.type.toLowerCase().includes(searchTerm) ||
          workflow.phases.some(phase =>
            phase.name.toLowerCase().includes(searchTerm) ||
            phase.description.toLowerCase().includes(searchTerm)
          )
        )
        .slice(Number(offset), Number(offset) + Number(limit));

      const graphs = workflows.map(workflow =>
        this.graphBuilder.buildGraph(workflow)
      );

      res.json({
        success: true,
        data: graphs,
        metadata: {
          total: workflows.length,
          page: Math.floor(Number(offset) / Number(limit)) + 1,
          limit: Number(limit),
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to search workflows');
    }
  }

  /**
   * GET /api/workflows/filter
   * Filters workflows
   */
  private async filterWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const filterOptions: WorkflowFilterOptions = req.query;

      let workflows = Array.from(this.workflows.values());

      // Apply filters
      if (filterOptions.status) {
        workflows = workflows.filter(w => filterOptions.status!.includes(w.status));
      }

      if (filterOptions.roles) {
        workflows = workflows.filter(w =>
          w.phases.some(p => filterOptions.roles!.includes(p.role))
        );
      }

      if (filterOptions.phases) {
        workflows = workflows.filter(w =>
          w.phases.some(p => filterOptions.phases!.includes(p.name))
        );
      }

      if (filterOptions.search) {
        const searchTerm = filterOptions.search.toLowerCase();
        workflows = workflows.filter(w =>
          w.name.toLowerCase().includes(searchTerm) ||
          w.type.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (filterOptions.sort) {
        const { field, direction } = filterOptions.sort;
        workflows.sort((a, b) => {
          const aValue = this.getFieldValue(a, field);
          const bValue = this.getFieldValue(b, field);

          if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Apply pagination
      const limit = filterOptions.pagination?.limit || 10;
      const offset = filterOptions.pagination?.offset || 0;
      const paginatedWorkflows = workflows.slice(offset, offset + limit);

      const graphs = paginatedWorkflows.map(workflow =>
        this.graphBuilder.buildGraph(workflow)
      );

      res.json({
        success: true,
        data: graphs,
        metadata: {
          total: workflows.length,
          page: Math.floor(offset / limit) + 1,
          limit,
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to filter workflows');
    }
  }

  /**
   * GET /api/workflows/visualization-options
   * Gets default visualization options
   */
  private async getVisualizationOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = this.graphBuilder['defaultOptions'];
      res.json({
        success: true,
        data: options,
        metadata: {
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get visualization options');
    }
  }

  /**
   * POST /api/workflows/visualization-options
   * Updates visualization options
   */
  private async updateVisualizationOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = req.body;
      this.graphBuilder = new WorkflowGraphBuilder(options);

      res.json({
        success: true,
        data: options,
        metadata: {
          timestamp: new Date()
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to update visualization options');
    }
  }

  // Private helper methods

  private handleError(res: Response, error: any, message: string): void {
    console.error(message, error);

    const statusCode = error.statusCode || 500;
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };

    res.status(statusCode).json(errorResponse);
  }

  private getFieldValue(workflow: Workflow, field: string): any {
    const fieldMap: Record<string, any> = {
      'name': workflow.name,
      'type': workflow.type,
      'status': workflow.status,
      'createdAt': workflow.businessContext?.createdAt,
      'duration': this.calculateWorkflowDuration(workflow)
    };

    return fieldMap[field] || '';
  }

  private calculateWorkflowDuration(workflow: Workflow): number {
    const phases = workflow.phases;
    if (phases.length === 0) return 0;

    const startTime = phases.find(p => p.startTime)?.startTime;
    const endTime = phases.find(p => p.endTime)?.endTime;

    if (startTime && endTime) {
      return new Date(endTime).getTime() - new Date(startTime).getTime();
    }

    return phases.reduce((total, phase) => {
      return total + phase.tasks.reduce((phaseTotal, task) => {
        return phaseTotal + (task.estimatedTime || 0);
      }, 0);
    }, 0);
  }
}
