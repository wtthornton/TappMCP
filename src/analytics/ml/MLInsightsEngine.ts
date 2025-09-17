/**
 * Machine Learning Insights Engine
 *
 * Advanced analytics with pattern detection, predictive analytics,
 * anomaly detection, and trend analysis for smart_vibe execution.
 */

import {
  CallTreeAnalytics,
  StoredTrace,
  UsagePattern,
  OptimizationOpportunity,
  PerformanceTrends,
  ExecutionMetrics
} from '../types/AnalyticsTypes.js';

export interface MLInsightsConfig {
  /** Enable pattern detection */
  enablePatternDetection: boolean;

  /** Enable predictive analytics */
  enablePredictiveAnalytics: boolean;

  /** Enable anomaly detection */
  enableAnomalyDetection: boolean;

  /** Enable trend analysis */
  enableTrendAnalysis: boolean;

  /** Pattern detection sensitivity (0.0 to 1.0) */
  patternSensitivity: number;

  /** Anomaly detection threshold (0.0 to 1.0) */
  anomalyThreshold: number;

  /** Trend analysis window (hours) */
  trendWindow: number;

  /** Minimum data points for analysis */
  minDataPoints: number;
}

export interface PatternDetectionResult {
  patterns: UsagePattern[];
  confidence: number;
  insights: string[];
}

export interface PredictiveAnalyticsResult {
  predictions: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    successRate: number;
  };
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface AnomalyDetectionResult {
  anomalies: {
    timestamp: number;
    type: 'performance' | 'error' | 'usage' | 'resource';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    metrics: Record<string, number>;
    expected: Record<string, number>;
    deviation: number;
  }[];
  overallAnomalyScore: number;
}

export interface TrendAnalysisResult {
  trends: {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    confidence: number;
    timeframe: string;
    prediction: number;
  }[];
  seasonalPatterns: {
    pattern: string;
    frequency: string;
    strength: number;
    description: string;
  }[];
}

export class MLInsightsEngine {
  private config: MLInsightsConfig;
  private historicalData: StoredTrace[] = [];
  private patterns: Map<string, UsagePattern> = new Map();
  private baselineMetrics: Map<string, number> = new Map();

  constructor(config: Partial<MLInsightsConfig> = {}) {
    this.config = {
      enablePatternDetection: true,
      enablePredictiveAnalytics: true,
      enableAnomalyDetection: true,
      enableTrendAnalysis: true,
      patternSensitivity: 0.7,
      anomalyThreshold: 0.8,
      trendWindow: 24,
      minDataPoints: 10,
      ...config
    };
  }

  /**
   * Process traces and generate ML insights
   */
  async processTraces(traces: StoredTrace[]): Promise<{
    patterns: PatternDetectionResult;
    predictions: PredictiveAnalyticsResult;
    anomalies: AnomalyDetectionResult;
    trends: TrendAnalysisResult;
  }> {
    this.historicalData = traces;

    const results = {
      patterns: await this.detectPatterns(traces),
      predictions: await this.generatePredictions(traces),
      anomalies: await this.detectAnomalies(traces),
      trends: await this.analyzeTrends(traces)
    };

    return results;
  }

  /**
   * Detect usage patterns in execution data
   */
  private async detectPatterns(traces: StoredTrace[]): Promise<PatternDetectionResult> {
    if (!this.config.enablePatternDetection || traces.length < this.config.minDataPoints) {
      return { patterns: [], confidence: 0, insights: [] };
    }

    const patterns: UsagePattern[] = [];
    const insights: string[] = [];

    // Tool usage patterns
    const toolPatterns = this.detectToolUsagePatterns(traces);
    patterns.push(...toolPatterns);

    // Command patterns
    const commandPatterns = this.detectCommandPatterns(traces);
    patterns.push(...commandPatterns);

    // Time-based patterns
    const timePatterns = this.detectTimeBasedPatterns(traces);
    patterns.push(...timePatterns);

    // Performance patterns
    const performancePatterns = this.detectPerformancePatterns(traces);
    patterns.push(...performancePatterns);

    // Generate insights
    if (patterns.length > 0) {
      insights.push(`Detected ${patterns.length} usage patterns`);
      insights.push(`Most common pattern: ${patterns[0]?.type || 'unknown'}`);
      insights.push(`Pattern confidence: ${(patterns[0]?.confidence || 0) * 100}%`);
    }

    return {
      patterns,
      confidence: patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0,
      insights
    };
  }

  /**
   * Generate predictive analytics
   */
  private async generatePredictions(traces: StoredTrace[]): Promise<PredictiveAnalyticsResult> {
    if (!this.config.enablePredictiveAnalytics || traces.length < this.config.minDataPoints) {
      return {
        predictions: { responseTime: 0, errorRate: 0, memoryUsage: 0, successRate: 0 },
        confidence: 0,
        timeframe: '1 hour',
        factors: []
      };
    }

    // Calculate baseline metrics
    const baseline = this.calculateBaselineMetrics(traces);

    // Simple linear regression for predictions
    const responseTimePrediction = this.predictResponseTime(traces, baseline);
    const errorRatePrediction = this.predictErrorRate(traces, baseline);
    const memoryUsagePrediction = this.predictMemoryUsage(traces, baseline);
    const successRatePrediction = this.predictSuccessRate(traces, baseline);

    const factors = this.identifyPredictionFactors(traces);

    return {
      predictions: {
        responseTime: responseTimePrediction.value,
        errorRate: errorRatePrediction.value,
        memoryUsage: memoryUsagePrediction.value,
        successRate: successRatePrediction.value
      },
      confidence: (responseTimePrediction.confidence + errorRatePrediction.confidence +
                  memoryUsagePrediction.confidence + successRatePrediction.confidence) / 4,
      timeframe: '1 hour',
      factors
    };
  }

  /**
   * Detect anomalies in execution data
   */
  private async detectAnomalies(traces: StoredTrace[]): Promise<AnomalyDetectionResult> {
    if (!this.config.enableAnomalyDetection || traces.length < this.config.minDataPoints) {
      return { anomalies: [], overallAnomalyScore: 0 };
    }

    const anomalies: AnomalyDetectionResult['anomalies'] = [];
    const baseline = this.calculateBaselineMetrics(traces);

    // Performance anomalies
    const performanceAnomalies = this.detectPerformanceAnomalies(traces, baseline);
    anomalies.push(...performanceAnomalies);

    // Error anomalies
    const errorAnomalies = this.detectErrorAnomalies(traces, baseline);
    anomalies.push(...errorAnomalies);

    // Usage anomalies
    const usageAnomalies = this.detectUsageAnomalies(traces, baseline);
    anomalies.push(...usageAnomalies);

    // Resource anomalies
    const resourceAnomalies = this.detectResourceAnomalies(traces, baseline);
    anomalies.push(...resourceAnomalies);

    const overallAnomalyScore = anomalies.length > 0
      ? anomalies.reduce((sum, a) => sum + a.deviation, 0) / anomalies.length
      : 0;

    return { anomalies, overallAnomalyScore };
  }

  /**
   * Analyze trends in execution data
   */
  private async analyzeTrends(traces: StoredTrace[]): Promise<TrendAnalysisResult> {
    if (!this.config.enableTrendAnalysis || traces.length < this.config.minDataPoints) {
      return { trends: [], seasonalPatterns: [] };
    }

    const trends = this.calculateTrends(traces);
    const seasonalPatterns = this.detectSeasonalPatterns(traces);

    return { trends, seasonalPatterns };
  }

  /**
   * Detect tool usage patterns
   */
  private detectToolUsagePatterns(traces: StoredTrace[]): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const toolUsage: Record<string, number> = {};

    // Aggregate tool usage
    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics?.toolUsageDistribution) {
        Object.entries(trace.analytics.executionMetrics.toolUsageDistribution).forEach(([tool, count]) => {
          toolUsage[tool] = (toolUsage[tool] || 0) + count;
        });
      }
    });

    // Find frequent tool combinations
    const totalCalls = Object.values(toolUsage).reduce((sum, count) => sum + count, 0);
    Object.entries(toolUsage).forEach(([tool, count]) => {
      const frequency = count / totalCalls;
      if (frequency > this.config.patternSensitivity) {
        patterns.push({
          id: `tool_usage_${tool}`,
          type: 'tool_combination',
          confidence: Math.min(1.0, frequency * 2),
          description: `Frequent use of ${tool} tool`,
          frequency: count,
          data: { tool, count, frequency },
          insights: [
            `${tool} is used in ${(frequency * 100).toFixed(1)}% of executions`,
            'Consider optimizing this tool for better performance'
          ]
        });
      }
    });

    return patterns;
  }

  /**
   * Detect command patterns
   */
  private detectCommandPatterns(traces: StoredTrace[]): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const commandFrequency: Record<string, number> = {};

    // Count command frequency
    traces.forEach(trace => {
      const command = trace.command.toLowerCase();
      commandFrequency[command] = (commandFrequency[command] || 0) + 1;
    });

    // Find common command patterns
    const totalCommands = traces.length;
    Object.entries(commandFrequency).forEach(([command, count]) => {
      const frequency = count / totalCommands;
      if (frequency > this.config.patternSensitivity) {
        patterns.push({
          id: `command_${command.replace(/\s+/g, '_')}`,
          type: 'command_frequency',
          confidence: Math.min(1.0, frequency * 1.5),
          description: `Frequent command: ${command}`,
          frequency: count,
          data: { command, count, frequency },
          insights: [
            `"${command}" is used in ${(frequency * 100).toFixed(1)}% of executions`,
            'Consider creating shortcuts or templates for this command'
          ]
        });
      }
    });

    return patterns;
  }

  /**
   * Detect time-based patterns
   */
  private detectTimeBasedPatterns(traces: StoredTrace[]): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const hourlyUsage: Record<number, number> = {};

    // Count usage by hour
    traces.forEach(trace => {
      const hour = new Date(trace.storedAt).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    // Find peak usage hours
    const totalUsage = Object.values(hourlyUsage).reduce((sum, count) => sum + count, 0);
    const peakHours = Object.entries(hourlyUsage)
      .filter(([, count]) => count / totalUsage > 0.1)
      .sort(([, a], [, b]) => b - a);

    if (peakHours.length > 0) {
      patterns.push({
        id: 'peak_usage_hours',
        type: 'time_based',
        confidence: 0.8,
        description: `Peak usage hours: ${peakHours.map(([hour]) => `${hour}:00`).join(', ')}`,
        frequency: peakHours.length,
        data: { peakHours: peakHours.map(([hour, count]) => ({ hour: parseInt(hour), count })) },
        insights: [
          `Peak usage occurs at ${peakHours[0][0]}:00 with ${peakHours[0][1]} executions`,
          'Consider load balancing during peak hours'
        ]
      });
    }

    return patterns;
  }

  /**
   * Detect performance patterns
   */
  private detectPerformancePatterns(traces: StoredTrace[]): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    const performanceData: { responseTime: number; errorRate: number; timestamp: number }[] = [];

    // Collect performance data
    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics) {
        performanceData.push({
          responseTime: trace.analytics.executionMetrics.averageExecutionTime,
          errorRate: trace.analytics.executionMetrics.errorRate,
          timestamp: trace.storedAt
        });
      }
    });

    if (performanceData.length < 2) return patterns;

    // Detect performance degradation patterns
    const recentPerformance = performanceData.slice(-10);
    const avgResponseTime = recentPerformance.reduce((sum, d) => sum + d.responseTime, 0) / recentPerformance.length;
    const avgErrorRate = recentPerformance.reduce((sum, d) => sum + d.errorRate, 0) / recentPerformance.length;

    if (avgResponseTime > 1000) {
      patterns.push({
        id: 'slow_performance',
        type: 'performance',
        confidence: 0.9,
        description: `Slow performance detected: ${avgResponseTime.toFixed(0)}ms average`,
        frequency: recentPerformance.length,
        data: { avgResponseTime, avgErrorRate },
        insights: [
          `Average response time is ${avgResponseTime.toFixed(0)}ms, above optimal threshold`,
          'Consider performance optimization or resource scaling'
        ]
      });
    }

    if (avgErrorRate > 0.05) {
      patterns.push({
        id: 'high_error_rate',
        type: 'performance',
        confidence: 0.9,
        description: `High error rate detected: ${(avgErrorRate * 100).toFixed(1)}%`,
        frequency: recentPerformance.length,
        data: { avgResponseTime, avgErrorRate },
        insights: [
          `Error rate is ${(avgErrorRate * 100).toFixed(1)}%, above acceptable threshold`,
          'Investigate error causes and improve error handling'
        ]
      });
    }

    return patterns;
  }

  /**
   * Calculate baseline metrics
   */
  private calculateBaselineMetrics(traces: StoredTrace[]): Record<string, number> {
    const metrics = {
      responseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      successRate: 0
    };

    if (traces.length === 0) return metrics;

    let totalResponseTime = 0;
    let totalErrors = 0;
    let totalSuccesses = 0;

    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics) {
        totalResponseTime += trace.analytics.executionMetrics.averageExecutionTime;
        totalErrors += trace.analytics.executionMetrics.errorRate * trace.analytics.executionMetrics.totalCalls;
        totalSuccesses += trace.analytics.executionMetrics.successRate * trace.analytics.executionMetrics.totalCalls;
      }
    });

    metrics.responseTime = totalResponseTime / traces.length;
    metrics.errorRate = totalErrors / traces.length;
    metrics.successRate = totalSuccesses / traces.length;
    metrics.memoryUsage = 0.5; // Default memory usage

    return metrics;
  }

  /**
   * Predict response time
   */
  private predictResponseTime(traces: StoredTrace[], baseline: Record<string, number>): { value: number; confidence: number } {
    const recentTraces = traces.slice(-10);
    if (recentTraces.length < 2) {
      return { value: baseline.responseTime, confidence: 0.5 };
    }

    // Simple trend analysis
    const responseTimes = recentTraces.map(t => t.analytics?.executionMetrics?.averageExecutionTime || 0);
    const trend = this.calculateTrend(responseTimes);

    const prediction = baseline.responseTime + (trend * 0.1); // Predict 10% change
    const confidence = Math.min(0.9, recentTraces.length / 10);

    return { value: Math.max(0, prediction), confidence };
  }

  /**
   * Predict error rate
   */
  private predictErrorRate(traces: StoredTrace[], baseline: Record<string, number>): { value: number; confidence: number } {
    const recentTraces = traces.slice(-10);
    if (recentTraces.length < 2) {
      return { value: baseline.errorRate, confidence: 0.5 };
    }

    const errorRates = recentTraces.map(t => t.analytics?.executionMetrics?.errorRate || 0);
    const trend = this.calculateTrend(errorRates);

    const prediction = baseline.errorRate + (trend * 0.1);
    const confidence = Math.min(0.9, recentTraces.length / 10);

    return { value: Math.max(0, Math.min(1, prediction)), confidence };
  }

  /**
   * Predict memory usage
   */
  private predictMemoryUsage(traces: StoredTrace[], baseline: Record<string, number>): { value: number; confidence: number } {
    return { value: baseline.memoryUsage, confidence: 0.7 };
  }

  /**
   * Predict success rate
   */
  private predictSuccessRate(traces: StoredTrace[], baseline: Record<string, number>): { value: number; confidence: number } {
    const recentTraces = traces.slice(-10);
    if (recentTraces.length < 2) {
      return { value: baseline.successRate, confidence: 0.5 };
    }

    const successRates = recentTraces.map(t => t.analytics?.executionMetrics?.successRate || 0);
    const trend = this.calculateTrend(successRates);

    const prediction = baseline.successRate + (trend * 0.1);
    const confidence = Math.min(0.9, recentTraces.length / 10);

    return { value: Math.max(0, Math.min(1, prediction)), confidence };
  }

  /**
   * Identify prediction factors
   */
  private identifyPredictionFactors(traces: StoredTrace[]): string[] {
    const factors: string[] = [];

    // Analyze recent performance
    const recentTraces = traces.slice(-5);
    const avgResponseTime = recentTraces.reduce((sum, t) =>
      sum + (t.analytics?.executionMetrics?.averageExecutionTime || 0), 0) / recentTraces.length;

    if (avgResponseTime > 1000) {
      factors.push('High response time trend');
    }

    // Analyze error patterns
    const errorRate = recentTraces.reduce((sum, t) =>
      sum + (t.analytics?.executionMetrics?.errorRate || 0), 0) / recentTraces.length;

    if (errorRate > 0.05) {
      factors.push('Elevated error rate');
    }

    // Analyze tool usage
    const toolUsage = new Map<string, number>();
    recentTraces.forEach(trace => {
      if (trace.analytics?.executionMetrics?.toolUsageDistribution) {
        Object.entries(trace.analytics.executionMetrics.toolUsageDistribution).forEach(([tool, count]) => {
          toolUsage.set(tool, (toolUsage.get(tool) || 0) + count);
        });
      }
    });

    if (toolUsage.size > 5) {
      factors.push('High tool diversity');
    }

    return factors;
  }

  /**
   * Detect performance anomalies
   */
  private detectPerformanceAnomalies(traces: StoredTrace[], baseline: Record<string, number>): AnomalyDetectionResult['anomalies'] {
    const anomalies: AnomalyDetectionResult['anomalies'] = [];

    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics) {
        const responseTime = trace.analytics.executionMetrics.averageExecutionTime;
        const expectedResponseTime = baseline.responseTime;
        const deviation = Math.abs(responseTime - expectedResponseTime) / expectedResponseTime;

        if (deviation > this.config.anomalyThreshold) {
          anomalies.push({
            timestamp: trace.storedAt,
            type: 'performance',
            severity: deviation > 2 ? 'critical' : deviation > 1.5 ? 'high' : 'medium',
            description: `Response time anomaly: ${responseTime.toFixed(0)}ms (expected: ${expectedResponseTime.toFixed(0)}ms)`,
            metrics: { responseTime },
            expected: { responseTime: expectedResponseTime },
            deviation
          });
        }
      }
    });

    return anomalies;
  }

  /**
   * Detect error anomalies
   */
  private detectErrorAnomalies(traces: StoredTrace[], baseline: Record<string, number>): AnomalyDetectionResult['anomalies'] {
    const anomalies: AnomalyDetectionResult['anomalies'] = [];

    traces.forEach(trace => {
      if (trace.analytics?.executionMetrics) {
        const errorRate = trace.analytics.executionMetrics.errorRate;
        const expectedErrorRate = baseline.errorRate;
        const deviation = Math.abs(errorRate - expectedErrorRate) / Math.max(expectedErrorRate, 0.01);

        if (deviation > this.config.anomalyThreshold) {
          anomalies.push({
            timestamp: trace.storedAt,
            type: 'error',
            severity: deviation > 2 ? 'critical' : deviation > 1.5 ? 'high' : 'medium',
            description: `Error rate anomaly: ${(errorRate * 100).toFixed(1)}% (expected: ${(expectedErrorRate * 100).toFixed(1)}%)`,
            metrics: { errorRate },
            expected: { errorRate: expectedErrorRate },
            deviation
          });
        }
      }
    });

    return anomalies;
  }

  /**
   * Detect usage anomalies
   */
  private detectUsageAnomalies(traces: StoredTrace[], baseline: Record<string, number>): AnomalyDetectionResult['anomalies'] {
    const anomalies: AnomalyDetectionResult['anomalies'] = [];

    // Detect unusual command patterns
    const commandCounts = new Map<string, number>();
    traces.forEach(trace => {
      const command = trace.command.toLowerCase();
      commandCounts.set(command, (commandCounts.get(command) || 0) + 1);
    });

    const totalCommands = traces.length;
    commandCounts.forEach((count, command) => {
      const frequency = count / totalCommands;
      if (frequency > 0.8) { // 80% of commands are the same
        anomalies.push({
          timestamp: Date.now(),
          type: 'usage',
          severity: 'medium',
          description: `Unusual command pattern: "${command}" used in ${(frequency * 100).toFixed(1)}% of executions`,
          metrics: { commandFrequency: frequency },
          expected: { commandFrequency: 0.2 },
          deviation: frequency - 0.2
        });
      }
    });

    return anomalies;
  }

  /**
   * Detect resource anomalies
   */
  private detectResourceAnomalies(traces: StoredTrace[], baseline: Record<string, number>): AnomalyDetectionResult['anomalies'] {
    // Placeholder for resource anomaly detection
    return [];
  }

  /**
   * Calculate trends
   */
  private calculateTrends(traces: StoredTrace[]): TrendAnalysisResult['trends'] {
    const trends: TrendAnalysisResult['trends'] = [];

    if (traces.length < 2) return trends;

    // Response time trend
    const responseTimes = traces.map(t => t.analytics?.executionMetrics?.averageExecutionTime || 0);
    const responseTimeTrend = this.calculateTrend(responseTimes);

    trends.push({
      metric: 'responseTime',
      direction: responseTimeTrend > 0.1 ? 'increasing' : responseTimeTrend < -0.1 ? 'decreasing' : 'stable',
      strength: Math.abs(responseTimeTrend),
      confidence: Math.min(0.9, traces.length / 20),
      timeframe: '24 hours',
      prediction: responseTimes[responseTimes.length - 1] + (responseTimeTrend * 100)
    });

    // Error rate trend
    const errorRates = traces.map(t => t.analytics?.executionMetrics?.errorRate || 0);
    const errorRateTrend = this.calculateTrend(errorRates);

    trends.push({
      metric: 'errorRate',
      direction: errorRateTrend > 0.01 ? 'increasing' : errorRateTrend < -0.01 ? 'decreasing' : 'stable',
      strength: Math.abs(errorRateTrend * 100),
      confidence: Math.min(0.9, traces.length / 20),
      timeframe: '24 hours',
      prediction: Math.max(0, Math.min(1, errorRates[errorRates.length - 1] + (errorRateTrend * 0.1)))
    });

    return trends;
  }

  /**
   * Detect seasonal patterns
   */
  private detectSeasonalPatterns(traces: StoredTrace[]): TrendAnalysisResult['seasonalPatterns'] {
    const patterns: TrendAnalysisResult['seasonalPatterns'] = [];

    if (traces.length < 24) return patterns; // Need at least 24 data points

    // Detect hourly patterns
    const hourlyUsage = new Array(24).fill(0);
    traces.forEach(trace => {
      const hour = new Date(trace.storedAt).getHours();
      hourlyUsage[hour]++;
    });

    const maxUsage = Math.max(...hourlyUsage);
    const peakHours = hourlyUsage.map((usage, hour) => ({ hour, usage }))
      .filter(h => h.usage > maxUsage * 0.8)
      .map(h => h.hour);

    if (peakHours.length > 0) {
      patterns.push({
        pattern: 'hourly_peak',
        frequency: 'daily',
        strength: peakHours.length / 24,
        description: `Peak usage hours: ${peakHours.map(h => `${h}:00`).join(', ')}`
      });
    }

    return patterns;
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }
}

export default MLInsightsEngine;
