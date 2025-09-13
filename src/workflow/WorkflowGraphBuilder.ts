/**
 * Workflow Graph Builder
 *
 * Converts core workflow data into enhanced graph representation
 * for visualization and analysis.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { Workflow, WorkflowPhase, WorkflowTask } from '../core/orchestration-engine.js';
import {
  WorkflowGraph,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  WorkflowEdgeType,
  WorkflowTimeline,
  WorkflowTimelineEvent,
  WorkflowStatistics,
  WorkflowVisualizationOptions
} from './types.js';

/**
 * Workflow Graph Builder
 *
 * Builds enhanced workflow graphs from core workflow data.
 *
 * @example
 * ```typescript
 * const builder = new WorkflowGraphBuilder();
 * const graph = builder.buildGraph(workflow);
 * ```
 *
 * @since 2.0.0
 */
export class WorkflowGraphBuilder {
  private defaultOptions: WorkflowVisualizationOptions;

  constructor(options?: Partial<WorkflowVisualizationOptions>) {
    this.defaultOptions = {
      layout: 'hierarchical',
      visibility: {
        showLabels: true,
        showEdgeLabels: true,
        showProgress: true,
        showStatus: true,
        showTimeEstimates: true,
        showCriticalPath: true
      },
      colors: {
        status: {
          pending: '#6c757d',
          running: '#007bff',
          completed: '#28a745',
          failed: '#dc3545',
          paused: '#ffc107',
          cancelled: '#6c757d'
        },
        priority: {
          low: '#6c757d',
          medium: '#17a2b8',
          high: '#fd7e14',
          critical: '#dc3545'
        },
        roles: {
          'developer': '#007bff',
          'designer': '#e83e8c',
          'qa-engineer': '#20c997',
          'operations-engineer': '#6f42c1',
          'product-strategist': '#fd7e14'
        }
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
        dragDrop: false
      },
      ...options
    };
  }

  /**
   * Builds a workflow graph from core workflow data
   *
   * @param workflow - Core workflow data
   * @param options - Visualization options
   * @returns Enhanced workflow graph
   *
   * @example
   * ```typescript
   * const graph = builder.buildGraph(workflow, { layout: 'force' });
   * ```
   */
  buildGraph(workflow: Workflow, options?: Partial<WorkflowVisualizationOptions>): WorkflowGraph {
    const opts = { ...this.defaultOptions, ...options };

    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];

    // Build workflow root node
    const workflowNode = this.buildWorkflowNode(workflow, opts);
    nodes.push(workflowNode);

    // Build phase nodes and edges
    for (const phase of workflow.phases) {
      const phaseNode = this.buildPhaseNode(phase, workflow.id, opts);
      nodes.push(phaseNode);

      // Add workflow to phase edge
      edges.push(this.buildEdge(
        `workflow-${workflow.id}`,
        `phase-${phase.name}`,
        'execution',
        'Phase Execution',
        opts
      ));

      // Build task nodes and edges
      for (const task of phase.tasks) {
        const taskNode = this.buildTaskNode(task, phase.name, workflow.id, opts);
        nodes.push(taskNode);

        // Add phase to task edge
        edges.push(this.buildEdge(
          `phase-${phase.name}`,
          `task-${task.id}`,
          'execution',
          'Task Execution',
          opts
        ));

        // Add task dependencies
        if (task.dependencies) {
          for (const depId of task.dependencies) {
            edges.push(this.buildEdge(
              `task-${depId}`,
              `task-${task.id}`,
              'dependency',
              'Dependency',
              opts
            ));
          }
        }
      }

      // Add phase dependencies
      if (phase.dependencies) {
        for (const depPhase of phase.dependencies) {
          edges.push(this.buildEdge(
            `phase-${depPhase}`,
            `phase-${phase.name}`,
            'dependency',
            'Phase Dependency',
            opts
          ));
        }
      }
    }

    // Calculate graph metadata
    const metadata = this.calculateGraphMetadata(workflow, nodes, edges);

    return {
      workflowId: workflow.id,
      name: workflow.name,
      nodes,
      edges,
      metadata,
      layout: {
        algorithm: opts.layout,
        parameters: this.getLayoutParameters(opts.layout),
        autoLayout: true
      }
    };
  }

  /**
   * Builds a workflow timeline from execution data
   *
   * @param workflow - Core workflow data
   * @param executionData - Workflow execution data
   * @returns Workflow timeline
   *
   * @example
   * ```typescript
   * const timeline = builder.buildTimeline(workflow, executionData);
   * ```
   */
  buildTimeline(workflow: Workflow, executionData: any): WorkflowTimeline {
    const events: WorkflowTimelineEvent[] = [];

    // Add workflow start event
    events.push(this.buildTimelineEvent(
      'workflow-start',
      new Date(),
      'start',
      'Workflow Started',
      `Workflow "${workflow.name}" has been started`,
      `workflow-${workflow.id}`,
      'info'
    ));

    // Add phase events
    for (const phase of workflow.phases) {
      if (phase.startTime) {
        events.push(this.buildTimelineEvent(
          `phase-start-${phase.name}`,
          new Date(phase.startTime),
          'phase_start',
          `Phase Started: ${phase.name}`,
          `Phase "${phase.name}" has been started`,
          `phase-${phase.name}`,
          'info'
        ));
      }

      if (phase.endTime) {
        events.push(this.buildTimelineEvent(
          `phase-complete-${phase.name}`,
          new Date(phase.endTime),
          'phase_complete',
          `Phase Completed: ${phase.name}`,
          `Phase "${phase.name}" has been completed`,
          `phase-${phase.name}`,
          phase.status === 'completed' ? 'success' : 'error'
        ));
      }

      // Add task events
      for (const task of phase.tasks) {
        if (task.status === 'running' || task.status === 'completed') {
          events.push(this.buildTimelineEvent(
            `task-${task.id}`,
            new Date(),
            task.status === 'running' ? 'task_start' : 'task_complete',
            `${task.status === 'running' ? 'Task Started' : 'Task Completed'}: ${task.name}`,
            task.description,
            `task-${task.id}`,
            task.status === 'completed' ? 'success' : 'info'
          ));
        }
      }
    }

    // Add workflow end event
    events.push(this.buildTimelineEvent(
      'workflow-end',
      new Date(),
      'end',
      'Workflow Completed',
      `Workflow "${workflow.name}" has been completed`,
      `workflow-${workflow.id}`,
      workflow.status === 'completed' ? 'success' : 'error'
    ));

    // Sort events by timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const startTime = events[0]?.timestamp || new Date();
    const endTime = events[events.length - 1]?.timestamp || new Date();

    return {
      workflowId: workflow.id,
      events,
      metadata: {
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        eventCount: events.length,
        errorCount: events.filter(e => e.severity === 'error').length,
        milestoneCount: events.filter(e => e.type === 'milestone').length
      }
    };
  }

  /**
   * Builds workflow statistics from execution data
   *
   * @param workflow - Core workflow data
   * @param executionData - Workflow execution data
   * @returns Workflow statistics
   *
   * @example
   * ```typescript
   * const stats = builder.buildStatistics(workflow, executionData);
   * ```
   */
  buildStatistics(workflow: Workflow, executionData: any): WorkflowStatistics {
    const phases = workflow.phases;
    const totalTime = this.calculateTotalTime(phases);
    const phaseTimes = phases.map(p => this.calculatePhaseTime(p));
    const roleStats = this.calculateRoleStatistics(phases);

    return {
      workflowId: workflow.id,
      execution: {
        totalTime,
        averagePhaseTime: phaseTimes.reduce((a, b) => a + b, 0) / phaseTimes.length,
        fastestPhaseTime: Math.min(...phaseTimes),
        slowestPhaseTime: Math.max(...phaseTimes),
        successRate: this.calculateSuccessRate(phases),
        errorRate: this.calculateErrorRate(phases)
      },
      performance: {
        score: this.calculatePerformanceScore(workflow, executionData),
        efficiency: this.calculateEfficiency(workflow, executionData),
        quality: this.calculateQuality(workflow, executionData),
        resourceUtilization: this.calculateResourceUtilization(workflow, executionData)
      },
      roles: roleStats,
      phases: phases.map(phase => ({
        phase: phase.name,
        duration: this.calculatePhaseTime(phase),
        taskCount: phase.tasks.length,
        successRate: this.calculatePhaseSuccessRate(phase),
        qualityScore: this.calculatePhaseQualityScore(phase)
      }))
    };
  }

  // Private methods

  private buildWorkflowNode(workflow: Workflow, options: WorkflowVisualizationOptions): WorkflowNode {
    return {
      id: `workflow-${workflow.id}`,
      type: 'workflow',
      label: workflow.name,
      description: `Workflow: ${workflow.name}`,
      status: workflow.status,
      progress: this.calculateWorkflowProgress(workflow),
      priority: 'medium',
      estimatedDuration: this.calculateEstimatedDuration(workflow),
      actualDuration: this.calculateActualDuration(workflow),
      visual: {
        color: options.colors.status[workflow.status],
        size: 100,
        shape: 'hexagon',
        icon: 'workflow',
        opacity: 1.0,
        borderStyle: 'solid',
        borderWidth: 2
      },
      metadata: {
        workflowId: workflow.id,
        type: workflow.type,
        businessContext: workflow.businessContext
      }
    };
  }

  private buildPhaseNode(phase: WorkflowPhase, workflowId: string, options: WorkflowVisualizationOptions): WorkflowNode {
    return {
      id: `phase-${phase.name}`,
      type: 'phase',
      label: phase.name,
      description: phase.description,
      status: phase.status,
      progress: this.calculatePhaseProgress(phase),
      priority: this.determinePhasePriority(phase),
      estimatedDuration: this.calculatePhaseEstimatedDuration(phase),
      actualDuration: this.calculatePhaseActualDuration(phase),
      startTime: phase.startTime ? new Date(phase.startTime) : undefined,
      endTime: phase.endTime ? new Date(phase.endTime) : undefined,
      visual: {
        color: options.colors.status[phase.status],
        size: 80,
        shape: 'rectangle',
        icon: 'phase',
        opacity: 0.9,
        borderStyle: 'solid',
        borderWidth: 1
      },
      metadata: {
        workflowId,
        phaseName: phase.name,
        role: phase.role,
        intelligenceLevel: phase.intelligenceLevel,
        domainType: phase.domainType
      }
    };
  }

  private buildTaskNode(task: WorkflowTask, phaseName: string, workflowId: string, options: WorkflowVisualizationOptions): WorkflowNode {
    return {
      id: `task-${task.id}`,
      type: 'task',
      label: task.name,
      description: task.description,
      status: task.status,
      progress: this.calculateTaskProgress(task),
      priority: this.determineTaskPriority(task),
      estimatedDuration: task.estimatedTime || task.estimatedDuration,
      visual: {
        color: options.colors.status[task.status],
        size: 60,
        shape: 'circle',
        icon: 'task',
        opacity: 0.8,
        borderStyle: 'solid',
        borderWidth: 1
      },
      metadata: {
        workflowId,
        phaseName,
        taskId: task.id,
        role: task.role,
        type: task.type,
        deliverables: task.deliverables
      }
    };
  }

  private buildEdge(source: string, target: string, type: WorkflowEdgeType, label: string, options: WorkflowVisualizationOptions): WorkflowEdge {
    return {
      id: `edge-${source}-${target}`,
      source,
      target,
      type,
      label,
      weight: 1,
      isCritical: false, // This would be calculated by critical path analysis
      visual: {
        color: this.getEdgeColor(type, options),
        width: 2,
        style: 'solid',
        arrowType: 'arrow',
        opacity: 0.7
      },
      metadata: {
        dependencyType: 'hard'
      }
    };
  }

  private buildTimelineEvent(
    id: string,
    timestamp: Date,
    type: WorkflowTimelineEvent['type'],
    title: string,
    description: string,
    nodeId: string,
    severity: WorkflowTimelineEvent['severity']
  ): WorkflowTimelineEvent {
    return {
      id,
      timestamp,
      type,
      title,
      description,
      nodeId,
      severity,
      data: {},
      visual: {
        color: this.getEventColor(severity),
        icon: this.getEventIcon(type),
        size: 20
      }
    };
  }

  private calculateGraphMetadata(workflow: Workflow, nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    const criticalPathLength = this.calculateCriticalPathLength(edges);
    const estimatedDuration = this.calculateEstimatedDuration(workflow);

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      complexity: this.calculateComplexity(nodes, edges),
      criticalPathLength,
      estimatedDuration,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private calculateWorkflowProgress(workflow: Workflow): number {
    const completedPhases = workflow.phases.filter(p => p.status === 'completed').length;
    return (completedPhases / workflow.phases.length) * 100;
  }

  private calculatePhaseProgress(phase: WorkflowPhase): number {
    const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
    return (completedTasks / phase.tasks.length) * 100;
  }

  private calculateTaskProgress(task: WorkflowTask): number {
    switch (task.status) {
      case 'pending': return 0;
      case 'running': return 50;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  }

  private determinePhasePriority(phase: WorkflowPhase): 'low' | 'medium' | 'high' | 'critical' {
    // Simple priority determination based on phase characteristics
    if (phase.intelligenceLevel === 'advanced') return 'high';
    if (phase.tasks.length > 5) return 'high';
    if (phase.tasks.some(t => t.type === 'critical')) return 'critical';
    return 'medium';
  }

  private determineTaskPriority(task: WorkflowTask): 'low' | 'medium' | 'high' | 'critical' {
    if (task.type === 'critical') return 'critical';
    if (task.estimatedTime && task.estimatedTime > 120) return 'high';
    if (task.dependencies && task.dependencies.length > 2) return 'high';
    return 'medium';
  }

  private calculateEstimatedDuration(workflow: Workflow): number {
    return workflow.phases.reduce((total, phase) => {
      return total + this.calculatePhaseEstimatedDuration(phase);
    }, 0);
  }

  private calculateActualDuration(workflow: Workflow): number | undefined {
    const startTime = workflow.phases.find(p => p.startTime)?.startTime;
    const endTime = workflow.phases.find(p => p.endTime)?.endTime;

    if (startTime && endTime) {
      return new Date(endTime).getTime() - new Date(startTime).getTime();
    }

    return undefined;
  }

  private calculatePhaseEstimatedDuration(phase: WorkflowPhase): number {
    return phase.tasks.reduce((total, task) => {
      return total + (task.estimatedTime || task.estimatedDuration || 0);
    }, 0);
  }

  private calculatePhaseActualDuration(phase: WorkflowPhase): number | undefined {
    if (phase.startTime && phase.endTime) {
      return new Date(phase.endTime).getTime() - new Date(phase.startTime).getTime();
    }
    return undefined;
  }

  private calculateTotalTime(phases: WorkflowPhase[]): number {
    return phases.reduce((total, phase) => {
      return total + this.calculatePhaseTime(phase);
    }, 0);
  }

  private calculatePhaseTime(phase: WorkflowPhase): number {
    if (phase.startTime && phase.endTime) {
      return new Date(phase.endTime).getTime() - new Date(phase.startTime).getTime();
    }
    return phase.tasks.reduce((total, task) => {
      return total + (task.estimatedTime || 0);
    }, 0);
  }

  private calculateSuccessRate(phases: WorkflowPhase[]): number {
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    return (completedPhases / phases.length) * 100;
  }

  private calculateErrorRate(phases: WorkflowPhase[]): number {
    const failedPhases = phases.filter(p => p.status === 'failed').length;
    return (failedPhases / phases.length) * 100;
  }

  private calculateRoleStatistics(phases: WorkflowPhase[]) {
    const roleMap = new Map<string, { timeSpent: number; taskCount: number; successCount: number }>();

    for (const phase of phases) {
      const role = phase.role;
      const timeSpent = this.calculatePhaseTime(phase);
      const taskCount = phase.tasks.length;
      const successCount = phase.tasks.filter(t => t.status === 'completed').length;

      if (!roleMap.has(role)) {
        roleMap.set(role, { timeSpent: 0, taskCount: 0, successCount: 0 });
      }

      const stats = roleMap.get(role)!;
      stats.timeSpent += timeSpent;
      stats.taskCount += taskCount;
      stats.successCount += successCount;
    }

    return Array.from(roleMap.entries()).map(([role, stats]) => ({
      role,
      timeSpent: stats.timeSpent,
      taskCount: stats.taskCount,
      successRate: (stats.successCount / stats.taskCount) * 100
    }));
  }

  private calculatePhaseSuccessRate(phase: WorkflowPhase): number {
    const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
    return (completedTasks / phase.tasks.length) * 100;
  }

  private calculatePhaseQualityScore(phase: WorkflowPhase): number {
    // Simple quality score based on completion rate and intelligence level
    const completionRate = this.calculatePhaseSuccessRate(phase);
    const intelligenceBonus = phase.intelligenceLevel === 'advanced' ? 20 :
                             phase.intelligenceLevel === 'intermediate' ? 10 : 0;
    return Math.min(100, completionRate + intelligenceBonus);
  }

  private calculatePerformanceScore(workflow: Workflow, executionData: any): number {
    // Simple performance score calculation
    const successRate = this.calculateSuccessRate(workflow.phases);
    const efficiency = this.calculateEfficiency(workflow, executionData);
    return (successRate + efficiency) / 2;
  }

  private calculateEfficiency(workflow: Workflow, executionData: any): number {
    // Simple efficiency calculation
    const estimatedTime = this.calculateEstimatedDuration(workflow);
    const actualTime = this.calculateActualDuration(workflow);

    if (actualTime && estimatedTime) {
      return Math.min(100, (estimatedTime / actualTime) * 100);
    }

    return 50; // Default efficiency score
  }

  private calculateQuality(workflow: Workflow, executionData: any): number {
    // Simple quality calculation
    const phases = workflow.phases;
    const qualityScores = phases.map(p => this.calculatePhaseQualityScore(p));
    return qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
  }

  private calculateResourceUtilization(workflow: Workflow, executionData: any): number {
    // Simple resource utilization calculation
    const phases = workflow.phases;
    const totalTasks = phases.reduce((total, phase) => total + phase.tasks.length, 0);
    const completedTasks = phases.reduce((total, phase) => {
      return total + phase.tasks.filter(t => t.status === 'completed').length;
    }, 0);

    return (completedTasks / totalTasks) * 100;
  }

  private calculateCriticalPathLength(edges: WorkflowEdge[]): number {
    // Simple critical path calculation
    // In a real implementation, this would use proper critical path analysis
    return edges.filter(e => e.isCritical).length;
  }

  private calculateComplexity(nodes: WorkflowNode[], edges: WorkflowEdge[]): number {
    // Simple complexity calculation based on nodes and edges
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    return (nodeCount * edgeCount) / 100; // Normalized complexity score
  }

  private getEdgeColor(type: WorkflowEdgeType, options: WorkflowVisualizationOptions): string {
    const colorMap = {
      'dependency': '#6c757d',
      'transition': '#007bff',
      'delivery': '#28a745',
      'assignment': '#ffc107',
      'execution': '#17a2b8'
    };
    return colorMap[type] || '#6c757d';
  }

  private getEventColor(severity: WorkflowTimelineEvent['severity']): string {
    const colorMap = {
      'info': '#17a2b8',
      'warning': '#ffc107',
      'error': '#dc3545',
      'success': '#28a745'
    };
    return colorMap[severity] || '#17a2b8';
  }

  private getEventIcon(type: WorkflowTimelineEvent['type']): string {
    const iconMap = {
      'start': 'play',
      'phase_start': 'play-circle',
      'phase_complete': 'check-circle',
      'task_start': 'play',
      'task_complete': 'check',
      'error': 'exclamation-triangle',
      'milestone': 'flag',
      'end': 'stop'
    };
    return iconMap[type] || 'circle';
  }

  private getLayoutParameters(algorithm: string): Record<string, any> {
    const parameters = {
      'force': {
        strength: -300,
        distanceMax: 200,
        iterations: 300
      },
      'hierarchical': {
        direction: 'TB',
        nodeSpacing: 100,
        levelSeparation: 150
      },
      'circular': {
        radius: 200,
        center: { x: 0, y: 0 }
      },
      'grid': {
        rows: 4,
        cols: 4,
        spacing: 100
      },
      'timeline': {
        direction: 'horizontal',
        spacing: 50
      }
    };

    return parameters[algorithm] || parameters['hierarchical'];
  }
}
