/**
 * CallTreeTracer - Call Tree Tracing System
 *
 * Manages call tree structure, timing, and unique ID generation for tracing
 * smart_vibe tool execution and internal workflow.
 */

import { CallTreeEntry, TracePhase, TraceConfig, TraceMetrics } from './types.js';

export class CallTreeTracer {
  private rootNode: CallTreeEntry | null = null;
  private currentNode: CallTreeEntry | null = null;
  private enabled: boolean = false;
  private config: TraceConfig;
  private nodeCounter: number = 0;
  private startTime: number = 0;

  constructor(config?: Partial<TraceConfig>) {
    this.config = {
      enabled: false,
      level: 'basic',
      includeParameters: true,
      includeResults: true,
      includeTiming: true,
      includeContext7: true,
      includeCache: true,
      maxDepth: 10,
      outputFormat: 'console',
      maxMemoryUsage: 100, // MB
      maxTraceSize: 1000, // entries
      ...config,
    };
  }

  /**
   * Start a new trace session
   */
  startTrace(command: string, options?: any): void {
    if (!this.config.enabled) {return;}

    this.startTime = Date.now();
    this.nodeCounter = 0;

    this.rootNode = {
      id: this.generateUniqueId(),
      tool: 'smart_vibe',
      phase: 'planning',
      startTime: this.startTime,
      children: [],
      dependencies: [],
      level: 0,
      parameters: { command, options },
    };

    this.currentNode = this.rootNode;
    this.enabled = true;
  }

  /**
   * End the current trace session and generate report
   */
  endTrace(): any {
    if (!this.enabled || !this.rootNode) {
      return null;
    }

    const endTime = Date.now();
    if (this.rootNode) {
      this.rootNode.endTime = endTime;
      this.rootNode.duration = endTime - this.rootNode.startTime;
    }

    this.enabled = false;
    this.currentNode = null;

    return this.generateReport();
  }

  /**
   * Add a new node to the call tree
   */
  addNode(tool: string, phase: TracePhase, parameters?: any, parentId?: string): CallTreeEntry {
    if (!this.enabled) {
      throw new Error('Tracer is not enabled. Call startTrace() first.');
    }

    const node: CallTreeEntry = {
      id: this.generateUniqueId(),
      tool,
      phase,
      startTime: Date.now(),
      children: [],
      dependencies: [],
      level: parentId ? this.findNodeLevel(parentId) + 1 : 1,
      parentId,
      parameters: this.config.includeParameters ? parameters : undefined,
    };

    if (parentId && this.rootNode) {
      const parent = this.findNodeById(parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else if (this.currentNode) {
      this.currentNode.children.push(node);
    }

    this.currentNode = node;
    return node;
  }

  /**
   * Update a node with results or errors
   */
  updateNode(nodeId: string, result?: any, error?: string): void {
    if (!this.enabled) {return;}

    const node = this.findNodeById(nodeId);
    if (node) {
      node.endTime = Date.now();
      node.duration = node.endTime - node.startTime;

      if (this.config.includeResults && result) {
        node.result = result;
      }

      if (error) {
        node.error = error;
      }
    }
  }

  /**
   * Add Context7 call tracking
   */
  addContext7Call(operation: string, details: any): void {
    if (!this.enabled || !this.config.includeContext7) {return;}

    const node = this.addNode('context7', 'context7', { operation, ...details });
    this.updateNode(node.id, details);
  }

  /**
   * Add cache operation tracking
   */
  addCacheOperation(operation: 'hit' | 'miss' | 'set', key: string, size?: number): void {
    if (!this.enabled || !this.config.includeCache) {return;}

    const node = this.addNode('cache', 'cache', { operation, key, size });
    this.updateNode(node.id, { operation, key, size });
  }

  /**
   * Add internal step tracking
   */
  addInternalStep(step: string, details: any): void {
    if (!this.enabled) {return;}

    const node = this.addNode('internal', 'execution', { step, ...details });
    this.updateNode(node.id, details);
  }

  /**
   * Get current node
   */
  getCurrentNode(): CallTreeEntry | null {
    return this.currentNode;
  }

  /**
   * Navigate to a specific node
   */
  navigateToNode(nodeId: string): boolean {
    const node = this.findNodeById(nodeId);
    if (node) {
      this.currentNode = node;
      return true;
    }
    return false;
  }

  /**
   * Generate unique ID for nodes
   */
  private generateUniqueId(): string {
    return `node_${Date.now()}_${++this.nodeCounter}`;
  }

  /**
   * Find node by ID
   */
  private findNodeById(nodeId: string): CallTreeEntry | null {
    if (!this.rootNode) {return null;}
    return this.findNodeByIdRecursive(this.rootNode, nodeId);
  }

  /**
   * Recursive helper to find node by ID
   */
  private findNodeByIdRecursive(node: CallTreeEntry, nodeId: string): CallTreeEntry | null {
    if (node.id === nodeId) {return node;}

    for (const child of node.children) {
      const found = this.findNodeByIdRecursive(child, nodeId);
      if (found) {return found;}
    }

    return null;
  }

  /**
   * Find node level by ID
   */
  private findNodeLevel(nodeId: string): number {
    const node = this.findNodeById(nodeId);
    return node ? node.level : 0;
  }

  /**
   * Generate comprehensive trace report
   */
  private generateReport(): any {
    if (!this.rootNode) {return null;}

    const timeline = this.flattenTree(this.rootNode);
    const summary = this.calculateSummary(timeline);
    const context7Details = this.extractContext7Details(timeline);
    const toolExecution = this.extractToolExecution(timeline);
    const performance = this.analyzePerformance(timeline);

    return {
      summary,
      timeline,
      context7Details,
      toolExecution,
      performance,
      config: this.config,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Flatten tree into timeline array
   */
  private flattenTree(node: CallTreeEntry): CallTreeEntry[] {
    const result: CallTreeEntry[] = [node];

    for (const child of node.children) {
      result.push(...this.flattenTree(child));
    }

    return result;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(timeline: CallTreeEntry[]): any {
    const toolsUsed = [...new Set(timeline.map(node => node.tool))];
    const context7Calls = timeline.filter(node => node.tool === 'context7').length;
    const cacheHits = timeline.filter(
      node => node.tool === 'cache' && node.parameters?.operation === 'hit'
    ).length;
    const cacheMisses = timeline.filter(
      node => node.tool === 'cache' && node.parameters?.operation === 'miss'
    ).length;
    const errors = timeline.filter(node => node.error).length;
    const phases = [...new Set(timeline.map(node => node.phase))];

    return {
      totalDuration: this.rootNode?.duration || 0,
      toolsUsed,
      context7Calls,
      cacheHits,
      cacheMisses,
      errors,
      phases,
    };
  }

  /**
   * Extract Context7 specific details
   */
  private extractContext7Details(timeline: CallTreeEntry[]): any {
    const context7Nodes = timeline.filter(node => node.tool === 'context7');

    return {
      libraryResolutions: context7Nodes
        .filter(node => node.parameters?.operation === 'library-resolution')
        .map(node => ({
          topic: node.parameters?.topic || 'unknown',
          libraryId: node.parameters?.libraryId || 'unknown',
          duration: node.duration || 0,
          cached: node.parameters?.cached || false,
        })),
      apiCalls: context7Nodes
        .filter(node => node.parameters?.operation === 'api-call')
        .map(node => ({
          endpoint: node.parameters?.endpoint || 'unknown',
          duration: node.duration || 0,
          success: !node.error,
          tokens: node.parameters?.tokens || 0,
          cost: node.parameters?.cost || 0,
        })),
      cacheOperations: timeline
        .filter(node => node.tool === 'cache')
        .map(node => ({
          operation: node.parameters?.operation || 'unknown',
          key: node.parameters?.key || 'unknown',
          size: node.parameters?.size || 0,
        })),
    };
  }

  /**
   * Extract tool execution details
   */
  private extractToolExecution(timeline: CallTreeEntry[]): any[] {
    return timeline
      .filter(node => node.tool !== 'context7' && node.tool !== 'cache' && node.tool !== 'internal')
      .map(node => ({
        tool: node.tool,
        phase: node.phase,
        duration: node.duration || 0,
        parameters: node.parameters,
        result: node.result,
        dependencies: node.dependencies,
      }));
  }

  /**
   * Analyze performance and identify bottlenecks
   */
  private analyzePerformance(timeline: CallTreeEntry[]): any {
    const durations = timeline
      .filter(node => node.duration)
      .map(node => ({ tool: node.tool, duration: node.duration! }))
      .sort((a, b) => b.duration - a.duration);

    const bottlenecks = durations.slice(0, 3).map(item => `${item.tool}: ${item.duration}ms`);

    const recommendations = [];
    if (durations.some(d => d.duration > 1000)) {
      recommendations.push('Consider optimizing slow operations (>1s)');
    }
    if (timeline.filter(n => n.tool === 'context7').length > 5) {
      recommendations.push('Consider caching Context7 responses');
    }

    return {
      bottlenecks,
      recommendations,
      optimizationOpportunities: [
        'Implement request deduplication',
        'Add response caching',
        'Optimize Context7 API calls',
      ],
    };
  }

  /**
   * Enable or disable tracing
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TraceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TraceConfig {
    return { ...this.config };
  }

  /**
   * Clear all trace data
   */
  clear(): void {
    this.rootNode = null;
    this.currentNode = null;
    this.enabled = false;
    this.nodeCounter = 0;
  }
}
