/**
 * Analytics Engine for Call Tree Analysis
 *
 * Core engine for processing call tree data and generating insights,
 * performance analysis, and optimization recommendations.
 */

import {
  CallTreeAnalytics,
  ExecutionMetrics,
  PerformanceInsights,
  OptimizationOpportunity,
  UsagePattern,
  QualityMetrics,
  StoredTrace,
  TraceFilters,
  AggregatedAnalytics
} from './types/AnalyticsTypes.js';
import { StorageBackend } from './storage/StorageBackend.js';

export interface AnalyticsEngineConfig {
  /** Enable real-time processing */
  enableRealTime: boolean;

  /** Enable machine learning insights */
  enableMLInsights: boolean;

  /** Performance threshold for alerts */
  performanceThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };

  /** Pattern detection sensitivity */
  patternSensitivity: number;

  /** Optimization recommendation thresholds */
  optimizationThresholds: {
    cacheHitRate: number;
    context7ResponseTime: number;
    toolExecutionTime: number;
  };
}

export class AnalyticsEngine {
  private config: AnalyticsEngineConfig;
  private storageBackend?: StorageBackend;
  private isProcessing: boolean = false;

  constructor(config: Partial<AnalyticsEngineConfig> = {}, storageBackend?: StorageBackend) {
    this.config = {
      enableRealTime: true,
      enableMLInsights: false,
      performanceThresholds: {
        responseTime: 1000,
        errorRate: 0.05,
        memoryUsage: 0.8
      },
      patternSensitivity: 0.7,
      optimizationThresholds: {
        cacheHitRate: 0.8,
        context7ResponseTime: 1000,
        toolExecutionTime: 500
      },
      ...config
    };
    this.storageBackend = storageBackend;
  }

  /**
   * Process a single call tree trace and generate analytics
   */
  async processTrace(trace: StoredTrace): Promise<CallTreeAnalytics> {
    try {
      this.isProcessing = true;

      // Calculate execution metrics
      const executionMetrics = this.calculateExecutionMetrics(trace);

      // Generate performance insights
      const performanceInsights = this.generatePerformanceInsights(trace, executionMetrics);

      // Identify optimization opportunities
      const optimizationOpportunities = this.identifyOptimizationOpportunities(trace, executionMetrics);

      // Detect usage patterns
      const usagePatterns = this.detectUsagePatterns(trace);

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(trace, executionMetrics);

      const analytics: CallTreeAnalytics = {
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
          baselineValue: 1000,
          improvement: ((1000 - executionMetrics.averageExecutionTime) / 1000) * 100,
          status: executionMetrics.averageExecutionTime < 1000 ? 'pass' : 'fail',
          description: 'Smart vibe execution performance benchmark'
        }
      };

      // Store analytics if backend is available
      if (this.storageBackend) {
        try {
          await this.storageBackend.storeTrace(trace.executionFlow, analytics);
        } catch (error) {
          console.warn('Failed to store analytics:', error);
        }
      }

      return analytics;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process multiple traces and generate aggregated analytics
   */
  async processTraces(traces: StoredTrace[]): Promise<AggregatedAnalytics> {
    if (traces.length === 0) {
      return this.getEmptyAggregatedAnalytics();
    }

    // Calculate aggregated metrics
    const totalCalls = traces.length;
    const successfulCalls = traces.filter(t => t.success).length;
    const averageExecutionTime = traces.reduce((sum, t) => sum + t.duration, 0) / totalCalls;
    const successRate = successfulCalls / totalCalls;
    const errorRate = 1 - successRate;

    // Aggregate tool usage
    const toolUsageDistribution: Record<string, number> = {};
    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics?.toolUsageDistribution) {
        Object.entries(trace.analytics.executionMetrics.toolUsageDistribution).forEach(([tool, count]) => {
          toolUsageDistribution[tool] = (toolUsageDistribution[tool] || 0) + count;
        });
      }
    });

    // Calculate other aggregated metrics
    const context7HitRate = traces.reduce((sum, t) =>
      sum + (t.analytics?.executionMetrics?.context7HitRate || 0), 0) / totalCalls;

    const cacheEfficiency = traces.reduce((sum, t) =>
      sum + (t.analytics?.executionMetrics?.cacheEfficiency || 0), 0) / totalCalls;

    const timeRange = {
      start: Math.min(...traces.map(t => t.storedAt)),
      end: Math.max(...traces.map(t => t.storedAt))
    };

    return {
      timeRange,
      metrics: {
        totalCalls,
        averageExecutionTime,
        successRate,
        errorRate,
        toolUsageDistribution,
        context7HitRate,
        cacheEfficiency,
        memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
        cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
        responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
      },
      insights: {
        bottlenecks: [],
        slowestOperations: [],
        resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
        scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
        optimizationScore: Math.round(successRate * 100),
        recommendations: []
      },
      patterns: [],
      quality: {
        responseQuality: Math.round(successRate * 100),
        codeQualityImpact: 0,
        userSatisfaction: {
          overallScore: Math.round(successRate * 100),
          responseTimeSatisfaction: 0,
          qualitySatisfaction: 0,
          usabilitySatisfaction: 0,
          feedbackPatterns: []
        },
        errorAnalysis: {
          totalErrors: Math.round(errorRate * totalCalls),
          errorRate,
          categories: [],
          commonErrors: [],
          trends: []
        },
        completeness: 0,
        accuracy: 0
      },
      trends: {
        performanceTrends: [],
        usageTrends: [],
        qualityTrends: [],
        seasonalPatterns: []
      }
    };
  }

  /**
   * Get analytics for a specific time range
   */
  async getAnalyticsForTimeRange(
    startTime: number,
    endTime: number
  ): Promise<AggregatedAnalytics> {
    if (!this.storageBackend) {
      throw new Error('Storage backend not available');
    }

    const traces = await this.storageBackend.getTraces({
      timeRange: { start: startTime, end: endTime }
    });

    return this.processTraces(traces);
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<OptimizationOpportunity[]> {
    if (!this.storageBackend) {
      return [];
    }

    // Get recent traces
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours

    const traces = await this.storageBackend.getTraces({
      timeRange: { start: startTime, end: endTime }
    });

    const recommendations: OptimizationOpportunity[] = [];

    // Analyze cache performance
    const cacheAnalysis = this.analyzeCachePerformance(traces);
    if (cacheAnalysis.needsOptimization) {
      recommendations.push({
        id: `cache_optimization_${Date.now()}`,
        type: 'cache',
        priority: cacheAnalysis.priority,
        description: cacheAnalysis.description,
        expectedImprovement: cacheAnalysis.expectedImprovement,
        effort: cacheAnalysis.effort,
        affectedMetrics: ['cache_efficiency', 'response_time'],
        suggestions: cacheAnalysis.suggestions
      });
    }

    // Analyze Context7 performance
    const context7Analysis = this.analyzeContext7Performance(traces);
    if (context7Analysis.needsOptimization) {
      recommendations.push({
        id: `context7_optimization_${Date.now()}`,
        type: 'context7',
        priority: context7Analysis.priority,
        description: context7Analysis.description,
        expectedImprovement: context7Analysis.expectedImprovement,
        effort: context7Analysis.effort,
        affectedMetrics: ['response_time', 'context7_hit_rate'],
        suggestions: context7Analysis.suggestions
      });
    }

    // Analyze tool performance
    const toolAnalysis = this.analyzeToolPerformance(traces);
    if (toolAnalysis.needsOptimization) {
      recommendations.push({
        id: `tool_optimization_${Date.now()}`,
        type: 'tool_chain',
        priority: toolAnalysis.priority,
        description: toolAnalysis.description,
        expectedImprovement: toolAnalysis.expectedImprovement,
        effort: toolAnalysis.effort,
        affectedMetrics: ['execution_time', 'success_rate'],
        suggestions: toolAnalysis.suggestions
      });
    }

    return recommendations;
  }

  /**
   * Calculate execution metrics for a trace
   */
  private calculateExecutionMetrics(trace: StoredTrace): ExecutionMetrics {
    const executionFlow = trace.executionFlow;
    const toolCalls = executionFlow.toolCalls || [];
    const context7Calls = executionFlow.context7Calls || [];
    const cacheOperations = executionFlow.cacheOperations || [];

    const totalCalls = toolCalls.length;
    const successfulCalls = toolCalls.filter(tc => tc.success).length;
    const averageExecutionTime = totalCalls > 0
      ? toolCalls.reduce((sum, tc) => sum + tc.executionTime, 0) / totalCalls
      : trace.duration;
    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : (trace.success ? 1 : 0);
    const errorRate = 1 - successRate;

    // Calculate tool usage distribution
    const toolUsageDistribution: Record<string, number> = {};
    toolCalls.forEach(tc => {
      toolUsageDistribution[tc.tool] = (toolUsageDistribution[tc.tool] || 0) + 1;
    });

    // Calculate Context7 hit rate
    const context7HitRate = context7Calls.length > 0
      ? context7Calls.filter(c => c.cacheHit).length / context7Calls.length
      : 0;

    // Calculate cache efficiency
    const cacheEfficiency = cacheOperations.length > 0
      ? cacheOperations.filter(c => c.hit).length / cacheOperations.length
      : 0;

    return {
      totalCalls,
      averageExecutionTime,
      successRate,
      errorRate,
      toolUsageDistribution,
      context7HitRate,
      cacheEfficiency,
      memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
      cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
      responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
    };
  }

  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(
    trace: StoredTrace,
    metrics: ExecutionMetrics
  ): PerformanceInsights {
    const bottlenecks = this.identifyBottlenecks(trace);
    const slowestOperations = this.identifySlowestOperations(trace);
    const recommendations = this.generatePerformanceRecommendations(trace, metrics);

    return {
      bottlenecks,
      slowestOperations,
      resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
      scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
      optimizationScore: this.calculateOptimizationScore(metrics),
      recommendations
    };
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(
    trace: StoredTrace,
    metrics: ExecutionMetrics
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Cache optimization
    if (metrics.cacheEfficiency < this.config.optimizationThresholds.cacheHitRate) {
      opportunities.push({
        id: `cache_opt_${Date.now()}`,
        type: 'cache',
        priority: metrics.cacheEfficiency < 0.5 ? 'high' : 'medium',
        description: `Cache efficiency is ${(metrics.cacheEfficiency * 100).toFixed(1)}%, below threshold`,
        expectedImprovement: (this.config.optimizationThresholds.cacheHitRate - metrics.cacheEfficiency) * 100,
        effort: 'low',
        affectedMetrics: ['cache_efficiency', 'response_time'],
        suggestions: [
          'Implement cache warming strategies',
          'Optimize cache key generation',
          'Increase cache TTL for frequently accessed data'
        ]
      });
    }

    return opportunities;
  }

  /**
   * Detect usage patterns
   */
  private detectUsagePatterns(trace: StoredTrace): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const executionFlow = trace.executionFlow;

    // Tool usage patterns
    if (executionFlow.toolCalls && executionFlow.toolCalls.length > 0) {
      const toolFrequency: Record<string, number> = {};
      executionFlow.toolCalls.forEach(tc => {
        toolFrequency[tc.tool] = (toolFrequency[tc.tool] || 0) + 1;
      });

      const mostUsedTool = Object.entries(toolFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostUsedTool && mostUsedTool[1] > 1) {
        patterns.push({
          id: `tool_pattern_${mostUsedTool[0]}`,
          type: 'tool_combination',
          confidence: 0.8,
          description: `Frequent use of ${mostUsedTool[0]} tool`,
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
  private calculateQualityMetrics(
    trace: StoredTrace,
    metrics: ExecutionMetrics
  ): QualityMetrics {
    return {
      responseQuality: Math.round(metrics.successRate * 100),
      codeQualityImpact: Math.round(metrics.successRate * 100),
      userSatisfaction: {
        overallScore: Math.round(metrics.successRate * 100),
        responseTimeSatisfaction: 0,
        qualitySatisfaction: 0,
        usabilitySatisfaction: 0,
        feedbackPatterns: []
      },
      errorAnalysis: {
        totalErrors: Math.round(metrics.errorRate * metrics.totalCalls),
        errorRate: metrics.errorRate,
        categories: [],
        commonErrors: [],
        trends: []
      },
      completeness: Math.round(metrics.successRate * 100),
      accuracy: Math.round(metrics.successRate * 100)
    };
  }

  /**
   * Helper methods
   */
  private getEmptyAggregatedAnalytics(): AggregatedAnalytics {
    return {
      timeRange: { start: 0, end: 0 },
      metrics: {
        totalCalls: 0,
        averageExecutionTime: 0,
        successRate: 0,
        errorRate: 0,
        toolUsageDistribution: {},
        context7HitRate: 0,
        cacheEfficiency: 0,
        memoryUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', leaksDetected: false, gcFrequency: 0 },
        cpuUsage: { peakUsage: 0, averageUsage: 0, trend: 'stable', intensiveOperations: [] },
        responseSize: { averageSize: 0, peakSize: 0, sizeDistribution: {}, compressionRatio: 0 }
      },
      insights: {
        bottlenecks: [],
        slowestOperations: [],
        resourceUtilization: { cpu: 0, memory: 0, io: 0, network: 0, efficiency: 0 },
        scalabilityMetrics: { rpsCapacity: 0, concurrentUsers: 0, responseTimeUnderLoad: 0, scalingEfficiency: 0 },
        optimizationScore: 0,
        recommendations: []
      },
      patterns: [],
      quality: {
        responseQuality: 0,
        codeQualityImpact: 0,
        userSatisfaction: { overallScore: 0, responseTimeSatisfaction: 0, qualitySatisfaction: 0, usabilitySatisfaction: 0, feedbackPatterns: [] },
        errorAnalysis: { totalErrors: 0, errorRate: 0, categories: [], commonErrors: [], trends: [] },
        completeness: 0,
        accuracy: 0
      },
      trends: {
        performanceTrends: [],
        usageTrends: [],
        qualityTrends: [],
        seasonalPatterns: []
      }
    };
  }

  private identifyBottlenecks(trace: StoredTrace) {
    return [];
  }

  private identifySlowestOperations(trace: StoredTrace) {
    const toolCalls = trace.executionFlow.toolCalls || [];
    return toolCalls
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

  private generatePerformanceRecommendations(trace: StoredTrace, metrics: ExecutionMetrics) {
    return [];
  }

  private calculateOptimizationScore(metrics: ExecutionMetrics): number {
    return Math.round(metrics.successRate * 100);
  }

  private analyzeCachePerformance(traces: StoredTrace[]) {
    return { needsOptimization: false, priority: 'low' as const, description: '', expectedImprovement: 0, effort: 'low' as const, suggestions: [] };
  }

  private analyzeContext7Performance(traces: StoredTrace[]) {
    return { needsOptimization: false, priority: 'low' as const, description: '', expectedImprovement: 0, effort: 'low' as const, suggestions: [] };
  }

  private analyzeToolPerformance(traces: StoredTrace[]) {
    return { needsOptimization: false, priority: 'low' as const, description: '', expectedImprovement: 0, effort: 'low' as const, suggestions: [] };
  }
}
