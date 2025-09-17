/**
 * Enhanced Call Tree Tracer with Analytics Integration
 *
 * Extends the existing CallTreeTracer with comprehensive analytics capabilities,
 * performance monitoring, and usage pattern tracking for smart_vibe execution.
 */

import { CallTreeTracer } from '../tracing/CallTreeTracer.js';
import { TraceConfig, CallTreeEntry, TracePhase } from '../tracing/types.js';
import {
  CallTreeAnalytics,
  ExecutionMetrics,
  PerformanceInsights,
  OptimizationOpportunity,
  UsagePattern,
  QualityMetrics,
  DetailedExecutionFlow,
  ToolCallDetail,
  Context7CallDetail,
  CacheOperationDetail,
  PerformanceMetricDetail,
  ErrorDetail,
  ResourceUsageDetail,
  UserPatternDetail
} from './types/AnalyticsTypes.js';
import { StorageBackend } from './storage/StorageBackend.js';

export interface EnhancedTraceConfig extends TraceConfig {
  /** Enable analytics collection */
  enableAnalytics: boolean;

  /** Enable real-time processing */
  enableRealTime: boolean;

  /** Storage backend for persistence */
  storageBackend?: StorageBackend;

  /** Analytics sampling rate (0.0 to 1.0) */
  samplingRate: number;

  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;

  /** Enable usage pattern detection */
  enableUsagePatterns: boolean;
}

export class EnhancedCallTreeTracer extends CallTreeTracer {
  private analyticsEnabled: boolean = false;
  private realTimeEnabled: boolean = false;
  private storageBackend?: StorageBackend;
  private samplingRate: number = 1.0;
  private performanceMonitoring: boolean = false;
  private usagePatterns: boolean = false;

  // Analytics data collection
  private executionFlow: DetailedExecutionFlow | null = null;
  private toolCalls: ToolCallDetail[] = [];
  private context7Calls: Context7CallDetail[] = [];
  private cacheOperations: CacheOperationDetail[] = [];
  private performanceMetrics: PerformanceMetricDetail[] = [];
  private errors: ErrorDetail[] = [];
  private resourceUsage: ResourceUsageDetail[] = [];
  private userPatterns: UserPatternDetail[] = [];

  // Performance monitoring
  private startMemoryUsage: NodeJS.MemoryUsage | null = null;
  private startCpuUsage: NodeJS.CpuUsage | null = null;
  private performanceStartTime: number = 0;

  constructor(config?: Partial<EnhancedTraceConfig>) {
    super(config);

    if (config) {
      this.analyticsEnabled = config.enableAnalytics ?? false;
      this.realTimeEnabled = config.enableRealTime ?? false;
      this.storageBackend = config.storageBackend;
      this.samplingRate = config.samplingRate ?? 1.0;
      this.performanceMonitoring = config.enablePerformanceMonitoring ?? false;
      this.usagePatterns = config.enableUsagePatterns ?? false;
    }
  }

  /**
   * Start enhanced trace with analytics
   */
  async startEnhancedTrace(
    command: string,
    options: any,
    context: any
  ): Promise<void> {
    // Start base trace
    this.startTrace(command, options);

    if (this.analyticsEnabled) {
      // Initialize execution flow
      this.executionFlow = {
        rootNode: this.rootNode!,
        toolCalls: [],
        context7Calls: [],
        cacheOperations: [],
        performanceMetrics: [],
        errors: [],
        resourceUsage: [],
        userPatterns: []
      };

      // Clear previous data
      this.clearAnalyticsData();

      // Start performance monitoring
      if (this.performanceMonitoring) {
        this.startPerformanceMonitoring();
      }

      // Record initial context
      this.recordUserPattern('command_start', {
        command,
        options,
        context,
        timestamp: Date.now()
      });
    }
  }

  /**
   * End enhanced trace and generate analytics
   */
  async endEnhancedTrace(): Promise<CallTreeAnalytics | null> {
    if (!this.analyticsEnabled) {
      return null;
    }

    try {
      // End base trace
      const baseTrace = this.endTrace();
      if (!baseTrace) {
        return null;
      }

      // Stop performance monitoring
      if (this.performanceMonitoring) {
        this.stopPerformanceMonitoring();
      }

      // Generate analytics
      const analytics = await this.generateAnalytics(baseTrace);

      // Store analytics if storage backend is available
      if (this.storageBackend && this.executionFlow) {
        try {
          await this.storageBackend.storeTrace(this.executionFlow, analytics);
        } catch (error) {
          console.warn('Failed to store analytics:', error);
        }
      }

      return analytics;
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      return null;
    }
  }

  /**
   * Add tool call with enhanced tracking
   */
  addToolCall(
    tool: string,
    parameters: any,
    executionTime: number,
    success: boolean,
    result?: any,
    error?: string
  ): void {
    // Add to base trace
    const node = this.addNode(tool, 'execution', parameters);
    this.updateNode(node.id, result, error);

    if (this.analyticsEnabled) {
      // Record detailed tool call
      const toolCall: ToolCallDetail = {
        tool,
        parameters,
        executionTime,
        success,
        result,
        error,
        memoryUsage: this.getCurrentMemoryUsage(),
        cpuUsage: this.getCurrentCpuUsage()
      };

      this.toolCalls.push(toolCall);

      // Update execution flow
      if (this.executionFlow) {
        this.executionFlow.toolCalls.push(toolCall);
      }

      // Record performance metric
      this.recordPerformanceMetric('tool_execution_time', executionTime, 'ms', {
        tool,
        success: success.toString()
      });

      // Record usage pattern
      this.recordUserPattern('tool_usage', {
        tool,
        executionTime,
        success,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Add Context7 call with enhanced tracking
   */
  addContext7Call(
    operation: string,
    endpoint: string,
    parameters: any,
    responseTime: number,
    success: boolean,
    responseSize: number,
    cacheHit: boolean,
    tokenUsage: number,
    cost: number
  ): void {
    // Add to base trace
    this.addContext7Call(operation, { endpoint, ...parameters });

    if (this.analyticsEnabled) {
      // Record detailed Context7 call
      const context7Call: Context7CallDetail = {
        endpoint,
        parameters,
        responseTime,
        success,
        responseSize,
        cacheHit,
        tokenUsage,
        cost
      };

      this.context7Calls.push(context7Call);

      // Update execution flow
      if (this.executionFlow) {
        this.executionFlow.context7Calls.push(context7Call);
      }

      // Record performance metrics
      this.recordPerformanceMetric('context7_response_time', responseTime, 'ms', {
        endpoint,
        cacheHit: cacheHit.toString()
      });

      this.recordPerformanceMetric('context7_token_usage', tokenUsage, 'tokens', {
        endpoint
      });

      this.recordPerformanceMetric('context7_cost', cost, 'dollars', {
        endpoint
      });
    }
  }

  /**
   * Add cache operation with enhanced tracking
   */
  addCacheOperation(
    operation: 'get' | 'set' | 'delete' | 'clear',
    key: string,
    operationTime: number,
    success: boolean,
    dataSize: number,
    hit: boolean
  ): void {
    // Add to base trace
    this.addCacheOperation(hit ? 'hit' : 'miss', key, dataSize);

    if (this.analyticsEnabled) {
      // Record detailed cache operation
      const cacheOp: CacheOperationDetail = {
        operation,
        key,
        operationTime,
        success,
        dataSize,
        hit
      };

      this.cacheOperations.push(cacheOp);

      // Update execution flow
      if (this.executionFlow) {
        this.executionFlow.cacheOperations.push(cacheOp);
      }

      // Record performance metric
      this.recordPerformanceMetric('cache_operation_time', operationTime, 'ms', {
        operation,
        hit: hit.toString()
      });
    }
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {}
  ): void {
    if (!this.analyticsEnabled) return;

    const metric: PerformanceMetricDetail = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    this.performanceMetrics.push(metric);

    // Update execution flow
    if (this.executionFlow) {
      this.executionFlow.performanceMetrics.push(metric);
    }
  }

  /**
   * Record error with enhanced tracking
   */
  recordError(
    message: string,
    type: string,
    stack?: string,
    context?: Record<string, any>
  ): void {
    if (!this.analyticsEnabled) return;

    const error: ErrorDetail = {
      message,
      type,
      stack,
      timestamp: Date.now(),
      context: context || {}
    };

    this.errors.push(error);

    // Update execution flow
    if (this.executionFlow) {
      this.executionFlow.errors.push(error);
    }

    // Record performance metric
    this.recordPerformanceMetric('error_count', 1, 'count', {
      errorType: type
    });
  }

  /**
   * Record user pattern
   */
  recordUserPattern(
    type: string,
    data: Record<string, any>,
    confidence: number = 1.0
  ): void {
    if (!this.analyticsEnabled || !this.usagePatterns) return;

    const pattern: UserPatternDetail = {
      type,
      data,
      confidence,
      timestamp: Date.now()
    };

    this.userPatterns.push(pattern);

    // Update execution flow
    if (this.executionFlow) {
      this.executionFlow.userPatterns.push(pattern);
    }
  }

  /**
   * Generate comprehensive analytics
   */
  private async generateAnalytics(baseTrace: any): Promise<CallTreeAnalytics> {
    const executionMetrics = this.calculateExecutionMetrics();
    const performanceInsights = this.calculatePerformanceInsights();
    const optimizationOpportunities = this.identifyOptimizationOpportunities();
    const usagePatterns = this.detectUsagePatterns();
    const qualityMetrics = this.calculateQualityMetrics();

    return {
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      executionMetrics,
      performanceInsights,
      optimizationOpportunities,
      usagePatterns,
      qualityMetrics,
      trends: {
        performanceTrends: [],
        usageTrends: [],
        qualityTrends: [],
        seasonalPatterns: []
      },
      benchmarks: {
        name: 'smart_vibe_execution',
        type: 'performance',
        currentValue: executionMetrics.averageExecutionTime,
        baselineValue: 1000, // 1 second baseline
        improvement: ((1000 - executionMetrics.averageExecutionTime) / 1000) * 100,
        status: executionMetrics.averageExecutionTime < 1000 ? 'pass' : 'fail',
        description: 'Smart vibe execution performance benchmark'
      }
    };
  }

  /**
   * Calculate execution metrics
   */
  private calculateExecutionMetrics(): ExecutionMetrics {
    const totalCalls = this.toolCalls.length;
    const successfulCalls = this.toolCalls.filter(tc => tc.success).length;
    const averageExecutionTime = totalCalls > 0
      ? this.toolCalls.reduce((sum, tc) => sum + tc.executionTime, 0) / totalCalls
      : 0;
    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 0;
    const errorRate = 1 - successRate;

    // Calculate tool usage distribution
    const toolUsageDistribution: Record<string, number> = {};
    this.toolCalls.forEach(tc => {
      toolUsageDistribution[tc.tool] = (toolUsageDistribution[tc.tool] || 0) + 1;
    });

    // Calculate Context7 hit rate
    const context7HitRate = this.context7Calls.length > 0
      ? this.context7Calls.filter(c => c.cacheHit).length / this.context7Calls.length
      : 0;

    // Calculate cache efficiency
    const cacheEfficiency = this.cacheOperations.length > 0
      ? this.cacheOperations.filter(c => c.hit).length / this.cacheOperations.length
      : 0;

    // Calculate memory usage
    const memoryUsage = this.calculateMemoryUsage();
    const cpuUsage = this.calculateCpuUsage();

    return {
      totalCalls,
      averageExecutionTime,
      successRate,
      errorRate,
      toolUsageDistribution,
      context7HitRate,
      cacheEfficiency,
      memoryUsage,
      cpuUsage,
      responseSize: {
        averageSize: this.calculateAverageResponseSize(),
        peakSize: this.calculatePeakResponseSize(),
        sizeDistribution: {},
        compressionRatio: 0
      }
    };
  }

  /**
   * Calculate performance insights
   */
  private calculatePerformanceInsights(): PerformanceInsights {
    const bottlenecks = this.identifyBottlenecks();
    const slowestOperations = this.identifySlowestOperations();
    const resourceUtilization = this.calculateResourceUtilization();
    const recommendations = this.generatePerformanceRecommendations();

    return {
      bottlenecks,
      slowestOperations,
      resourceUtilization,
      scalabilityMetrics: {
        rpsCapacity: 0,
        concurrentUsers: 0,
        responseTimeUnderLoad: 0,
        scalingEfficiency: 0
      },
      optimizationScore: this.calculateOptimizationScore(),
      recommendations
    };
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Cache optimization opportunities
    if (this.cacheOperations.length > 0) {
      const cacheHitRate = this.cacheOperations.filter(c => c.hit).length / this.cacheOperations.length;
      if (cacheHitRate < 0.8) {
        opportunities.push({
          id: `cache_optimization_${Date.now()}`,
          type: 'cache',
          priority: cacheHitRate < 0.5 ? 'high' : 'medium',
          description: `Cache hit rate is ${(cacheHitRate * 100).toFixed(1)}%, below optimal threshold`,
          expectedImprovement: (0.8 - cacheHitRate) * 100,
          effort: 'low',
          affectedMetrics: ['cache_efficiency', 'response_time'],
          suggestions: [
            'Implement cache warming strategies',
            'Optimize cache key generation',
            'Increase cache TTL for frequently accessed data'
          ]
        });
      }
    }

    // Context7 optimization opportunities
    if (this.context7Calls.length > 0) {
      const avgResponseTime = this.context7Calls.reduce((sum, c) => sum + c.responseTime, 0) / this.context7Calls.length;
      if (avgResponseTime > 1000) {
        opportunities.push({
          id: `context7_optimization_${Date.now()}`,
          type: 'context7',
          priority: 'medium',
          description: `Context7 average response time is ${avgResponseTime.toFixed(0)}ms, above optimal threshold`,
          expectedImprovement: Math.min(50, (avgResponseTime - 1000) / 10),
          effort: 'medium',
          affectedMetrics: ['response_time', 'user_satisfaction'],
          suggestions: [
            'Implement request batching',
            'Add response caching',
            'Optimize API query parameters'
          ]
        });
      }
    }

    return opportunities;
  }

  /**
   * Detect usage patterns
   */
  private detectUsagePatterns(): UsagePattern[] {
    const patterns: UsagePattern[] = [];

    // Tool usage patterns
    if (this.toolCalls.length > 0) {
      const toolFrequency: Record<string, number> = {};
      this.toolCalls.forEach(tc => {
        toolFrequency[tc.tool] = (toolFrequency[tc.tool] || 0) + 1;
      });

      const mostUsedTool = Object.entries(toolFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostUsedTool) {
        patterns.push({
          id: `tool_usage_${mostUsedTool[0]}`,
          type: 'tool_combination',
          confidence: 0.8,
          description: `Most frequently used tool: ${mostUsedTool[0]}`,
          frequency: mostUsedTool[1],
          data: { tool: mostUsedTool[0], count: mostUsedTool[1] },
          insights: [
            `Consider optimizing ${mostUsedTool[0]} for better performance`,
            'This tool may be a bottleneck in the execution flow'
          ]
        });
      }
    }

    return patterns;
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(): QualityMetrics {
    const successRate = this.toolCalls.length > 0
      ? this.toolCalls.filter(tc => tc.success).length / this.toolCalls.length
      : 0;

    return {
      responseQuality: Math.round(successRate * 100),
      codeQualityImpact: Math.round(successRate * 100),
      userSatisfaction: {
        overallScore: Math.round(successRate * 100),
        responseTimeSatisfaction: 0,
        qualitySatisfaction: 0,
        usabilitySatisfaction: 0,
        feedbackPatterns: []
      },
      errorAnalysis: {
        totalErrors: this.errors.length,
        errorRate: this.toolCalls.length > 0 ? this.errors.length / this.toolCalls.length : 0,
        categories: [],
        commonErrors: [],
        trends: []
      },
      completeness: Math.round(successRate * 100),
      accuracy: Math.round(successRate * 100)
    };
  }

  /**
   * Helper methods for calculations
   */
  private calculateMemoryUsage() {
    const currentUsage = process.memoryUsage();
    return {
      peakUsage: currentUsage.heapUsed,
      averageUsage: currentUsage.heapUsed,
      trend: 'stable' as const,
      leaksDetected: false,
      gcFrequency: 0
    };
  }

  private calculateCpuUsage() {
    return {
      peakUsage: 0,
      averageUsage: 0,
      trend: 'stable' as const,
      intensiveOperations: []
    };
  }

  private calculateAverageResponseSize(): number {
    return this.context7Calls.reduce((sum, c) => sum + c.responseSize, 0) / Math.max(1, this.context7Calls.length);
  }

  private calculatePeakResponseSize(): number {
    return Math.max(...this.context7Calls.map(c => c.responseSize), 0);
  }

  private identifyBottlenecks() {
    return [];
  }

  private identifySlowestOperations() {
    return this.toolCalls
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 3)
      .map(tc => ({
        operation: tc.tool,
        executionTime: tc.executionTime,
        percentage: 0,
        frequency: 1,
        trend: 'stable' as const
      }));
  }

  private calculateResourceUtilization() {
    return {
      cpu: 0,
      memory: 0,
      io: 0,
      network: 0,
      efficiency: 0
    };
  }

  private generatePerformanceRecommendations() {
    return [];
  }

  private calculateOptimizationScore(): number {
    const successRate = this.toolCalls.length > 0
      ? this.toolCalls.filter(tc => tc.success).length / this.toolCalls.length
      : 0;
    return Math.round(successRate * 100);
  }

  private getCurrentMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private getCurrentCpuUsage(): number {
    return 0; // Simplified for now
  }

  private startPerformanceMonitoring(): void {
    this.startMemoryUsage = process.memoryUsage();
    this.startCpuUsage = process.cpuUsage();
    this.performanceStartTime = Date.now();
  }

  private stopPerformanceMonitoring(): void {
    // Record final performance metrics
    if (this.startMemoryUsage) {
      const currentUsage = process.memoryUsage();
      this.recordPerformanceMetric('memory_peak_usage', currentUsage.heapUsed, 'bytes');
      this.recordPerformanceMetric('memory_delta', currentUsage.heapUsed - this.startMemoryUsage.heapUsed, 'bytes');
    }
  }

  private clearAnalyticsData(): void {
    this.toolCalls = [];
    this.context7Calls = [];
    this.cacheOperations = [];
    this.performanceMetrics = [];
    this.errors = [];
    this.resourceUsage = [];
    this.userPatterns = [];
  }
}
