/**
 * Analytics Types for Call Tree Capture System
 *
 * Core type definitions for smart_vibe call tree analytics,
 * performance monitoring, and usage pattern analysis.
 */

import { CallTreeEntry, TracePhase } from '../../tracing/types.js';

// Re-export CallTreeEntry for analytics use
export { CallTreeEntry, TracePhase };

// ============================================================================
// Core Analytics Interfaces
// ============================================================================

export interface CallTreeAnalytics {
  /** Unique identifier for this analytics session */
  id: string;

  /** Timestamp when analytics were generated */
  timestamp: number;

  /** Core execution metrics */
  executionMetrics: ExecutionMetrics;

  /** Performance insights and bottlenecks */
  performanceInsights: PerformanceInsights;

  /** Optimization opportunities identified */
  optimizationOpportunities: OptimizationOpportunity[];

  /** Usage patterns detected */
  usagePatterns: UsagePattern[];

  /** Quality metrics for the execution */
  qualityMetrics: QualityMetrics;

  /** Time-series data for trend analysis */
  trends: TrendAnalysis;

  /** Benchmark data for comparison */
  benchmarks: BenchmarkData;
}

// ============================================================================
// Live Metrics and Real-time Types
// ============================================================================

export interface LiveMetrics {
  /** Average response time in milliseconds */
  averageResponseTime: number;

  /** Current error rate (0.0 to 1.0) */
  errorRate: number;

  /** Current memory usage ratio (0.0 to 1.0) */
  memoryUsage: number;

  /** Current CPU usage ratio (0.0 to 1.0) */
  cpuUsage: number;

  /** Current request rate (requests per second) */
  requestRate: number;

  /** System health score (0-100) */
  healthScore: number;

  /** Number of active alerts */
  activeAlerts: number;

  /** Cache hit rate (0.0 to 1.0) */
  cacheHitRate: number;

  /** Context7 API hit rate (0.0 to 1.0) */
  context7HitRate: number;

  /** Last updated timestamp */
  lastUpdated: number;
}

export interface RealTimeAlert {
  /** Unique alert identifier */
  id: string;

  /** Alert type */
  type: 'performance' | 'error' | 'resource' | 'quality' | 'security';

  /** Alert severity */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Alert title */
  title: string;

  /** Alert description */
  description: string;

  /** Alert message */
  message: string;

  /** Alert data */
  data: Record<string, any>;

  /** Timestamp when alert was created */
  timestamp: number;

  /** Whether alert is active */
  isActive: boolean;

  /** Alert metadata */
  metadata: Record<string, any>;
}

export interface PerformanceTrends {
  /** Response time trends */
  responseTime: number[];

  /** Error rate trends */
  errorRate: number[];

  /** Memory usage trends */
  memoryUsage: number[];

  /** CPU usage trends */
  cpuUsage: number[];

  /** Timestamps for trend data */
  timestamps: number[];
}

export interface ExportFormat {
  /** Export format type */
  format: 'json' | 'csv' | 'excel';

  /** Export data */
  data: any;

  /** Export metadata */
  metadata: {
    timestamp: number;
    recordCount: number;
    format: string;
  };
}

// ============================================================================
// Visualization Types
// ============================================================================

export interface VisualNode {
  /** Node identifier */
  id: string;

  /** Node name */
  name: string;

  /** Node level in hierarchy */
  level: number;

  /** Start time */
  startTime: number;

  /** Duration in milliseconds */
  duration: number;

  /** Whether operation was successful */
  success?: boolean;

  /** Tool name */
  tool?: string;

  /** Phase name */
  phase?: string;

  /** Parameters */
  parameters?: Record<string, any>;

  /** Child nodes */
  children: VisualNode[];
}

export interface ExecutionMetrics {
  /** Total number of smart_vibe calls */
  totalCalls: number;

  /** Average execution time in milliseconds */
  averageExecutionTime: number;

  /** Success rate (0.0 to 1.0) */
  successRate: number;

  /** Error rate (0.0 to 1.0) */
  errorRate: number;

  /** Distribution of tool usage */
  toolUsageDistribution: Record<string, number>;

  /** Context7 API hit rate */
  context7HitRate: number;

  /** Cache efficiency (0.0 to 1.0) */
  cacheEfficiency: number;

  /** Memory usage metrics */
  memoryUsage: MemoryMetrics;

  /** CPU usage metrics */
  cpuUsage: CPUMetrics;

  /** Response size metrics */
  responseSize: ResponseSizeMetrics;
}

export interface PerformanceInsights {
  /** Identified performance bottlenecks */
  bottlenecks: BottleneckAnalysis[];

  /** Slowest operations by execution time */
  slowestOperations: OperationTiming[];

  /** Resource utilization patterns */
  resourceUtilization: ResourceUtilization;

  /** Scalability metrics */
  scalabilityMetrics: ScalabilityMetrics;

  /** Overall optimization score (0-100) */
  optimizationScore: number;

  /** Performance recommendations */
  recommendations: PerformanceRecommendation[];
}

export interface OptimizationOpportunity {
  /** Unique identifier for the opportunity */
  id: string;

  /** Type of optimization */
  type: 'cache' | 'context7' | 'tool_chain' | 'resource' | 'algorithm';

  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /** Description of the opportunity */
  description: string;

  /** Expected performance improvement */
  expectedImprovement: number; // percentage

  /** Implementation effort required */
  effort: 'low' | 'medium' | 'high';

  /** Related metrics that would improve */
  affectedMetrics: string[];

  /** Implementation suggestions */
  suggestions: string[];
}

export interface UsagePattern {
  /** Pattern identifier */
  id: string;

  /** Pattern type */
  type: 'command_frequency' | 'tool_combination' | 'user_behavior' | 'time_based' | 'performance';

  /** Pattern confidence (0.0 to 1.0) */
  confidence: number;

  /** Pattern description */
  description: string;

  /** Frequency of occurrence */
  frequency: number;

  /** Associated data */
  data: Record<string, any>;

  /** Pattern insights */
  insights: string[];
}

export interface QualityMetrics {
  /** Response quality score (0-100) */
  responseQuality: number;

  /** Code quality impact (0-100) */
  codeQualityImpact: number;

  /** User satisfaction indicators */
  userSatisfaction: UserSatisfactionMetrics;

  /** Error categorization */
  errorAnalysis: ErrorAnalysis;

  /** Completeness score (0-100) */
  completeness: number;

  /** Accuracy score (0-100) */
  accuracy: number;
}

// ============================================================================
// Detailed Metrics Interfaces
// ============================================================================

export interface MemoryMetrics {
  /** Peak memory usage in bytes */
  peakUsage: number;

  /** Average memory usage in bytes */
  averageUsage: number;

  /** Memory usage trend */
  trend: 'increasing' | 'decreasing' | 'stable';

  /** Memory leaks detected */
  leaksDetected: boolean;

  /** Garbage collection frequency */
  gcFrequency: number;
}

export interface CPUMetrics {
  /** Peak CPU usage percentage */
  peakUsage: number;

  /** Average CPU usage percentage */
  averageUsage: number;

  /** CPU usage trend */
  trend: 'increasing' | 'decreasing' | 'stable';

  /** CPU-intensive operations */
  intensiveOperations: string[];
}

export interface ResponseSizeMetrics {
  /** Average response size in bytes */
  averageSize: number;

  /** Peak response size in bytes */
  peakSize: number;

  /** Response size distribution */
  sizeDistribution: Record<string, number>;

  /** Compression ratio if applicable */
  compressionRatio: number;
}

export interface BottleneckAnalysis {
  /** Bottleneck identifier */
  id: string;

  /** Bottleneck type */
  type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm';

  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Description of the bottleneck */
  description: string;

  /** Impact on performance */
  impact: number; // percentage

  /** Suggested solutions */
  solutions: string[];

  /** Related operations */
  relatedOperations: string[];
}

export interface OperationTiming {
  /** Operation name */
  operation: string;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Percentage of total execution time */
  percentage: number;

  /** Frequency of execution */
  frequency: number;

  /** Performance trend */
  trend: 'improving' | 'degrading' | 'stable';
}

export interface ResourceUtilization {
  /** CPU utilization percentage */
  cpu: number;

  /** Memory utilization percentage */
  memory: number;

  /** I/O utilization percentage */
  io: number;

  /** Network utilization percentage */
  network: number;

  /** Resource efficiency score */
  efficiency: number;
}

export interface ScalabilityMetrics {
  /** Requests per second capacity */
  rpsCapacity: number;

  /** Concurrent user capacity */
  concurrentUsers: number;

  /** Response time under load */
  responseTimeUnderLoad: number;

  /** Resource scaling efficiency */
  scalingEfficiency: number;
}

export interface PerformanceRecommendation {
  /** Recommendation identifier */
  id: string;

  /** Recommendation type */
  type: 'optimization' | 'scaling' | 'monitoring' | 'architecture';

  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /** Recommendation title */
  title: string;

  /** Detailed description */
  description: string;

  /** Expected impact */
  expectedImpact: string;

  /** Implementation steps */
  implementationSteps: string[];

  /** Related metrics */
  relatedMetrics: string[];
}

export interface UserSatisfactionMetrics {
  /** Overall satisfaction score (0-100) */
  overallScore: number;

  /** Response time satisfaction */
  responseTimeSatisfaction: number;

  /** Quality satisfaction */
  qualitySatisfaction: number;

  /** Usability satisfaction */
  usabilitySatisfaction: number;

  /** User feedback patterns */
  feedbackPatterns: string[];
}

export interface ErrorAnalysis {
  /** Total error count */
  totalErrors: number;

  /** Error rate (0.0 to 1.0) */
  errorRate: number;

  /** Error categories */
  categories: ErrorCategory[];

  /** Most common errors */
  commonErrors: CommonError[];

  /** Error trends */
  trends: ErrorTrend[];
}

export interface ErrorCategory {
  /** Category name */
  name: string;

  /** Error count in this category */
  count: number;

  /** Percentage of total errors */
  percentage: number;

  /** Category description */
  description: string;
}

export interface CommonError {
  /** Error message */
  message: string;

  /** Error count */
  count: number;

  /** Error frequency */
  frequency: number;

  /** Suggested fixes */
  suggestedFixes: string[];
}

export interface ErrorTrend {
  /** Trend period */
  period: string;

  /** Error count trend */
  countTrend: 'increasing' | 'decreasing' | 'stable';

  /** Error rate trend */
  rateTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface TrendAnalysis {
  /** Performance trends over time */
  performanceTrends: PerformanceTrend[];

  /** Usage trends over time */
  usageTrends: UsageTrend[];

  /** Quality trends over time */
  qualityTrends: QualityTrend[];

  /** Seasonal patterns */
  seasonalPatterns: SeasonalPattern[];
}

export interface PerformanceTrend {
  /** Metric name */
  metric: string;

  /** Trend direction */
  direction: 'improving' | 'degrading' | 'stable';

  /** Trend strength (0.0 to 1.0) */
  strength: number;

  /** Data points */
  dataPoints: TrendDataPoint[];
}

export interface UsageTrend {
  /** Usage pattern name */
  pattern: string;

  /** Trend direction */
  direction: 'increasing' | 'decreasing' | 'stable';

  /** Trend strength (0.0 to 1.0) */
  strength: number;

  /** Data points */
  dataPoints: TrendDataPoint[];
}

export interface QualityTrend {
  /** Quality metric name */
  metric: string;

  /** Trend direction */
  direction: 'improving' | 'degrading' | 'stable';

  /** Trend strength (0.0 to 1.0) */
  strength: number;

  /** Data points */
  dataPoints: TrendDataPoint[];
}

export interface SeasonalPattern {
  /** Pattern name */
  name: string;

  /** Pattern type */
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';

  /** Pattern description */
  description: string;

  /** Pattern strength (0.0 to 1.0) */
  strength: number;

  /** Peak times */
  peakTimes: string[];
}

export interface TrendDataPoint {
  /** Timestamp */
  timestamp: number;

  /** Value */
  value: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface BenchmarkData {
  /** Benchmark name */
  name: string;

  /** Benchmark type */
  type: 'performance' | 'quality' | 'usage' | 'resource';

  /** Current value */
  currentValue: number;

  /** Baseline value */
  baselineValue: number;

  /** Improvement percentage */
  improvement: number;

  /** Benchmark status */
  status: 'pass' | 'fail' | 'warning';

  /** Benchmark description */
  description: string;
}

// ============================================================================
// Storage and Configuration Interfaces
// ============================================================================

export interface AnalyticsConfig {
  /** Storage configuration */
  storage: {
    backend: 'sqlite' | 'postgresql' | 'json';
    connectionString?: string;
    retentionDays: number;
    compression: boolean;
  };

  /** Analytics configuration */
  analytics: {
    enableRealTime: boolean;
    enableHistorical: boolean;
    enableMLInsights: boolean;
    samplingRate: number; // 0.0 to 1.0
    batchSize: number;
  };

  /** Dashboard configuration */
  dashboard: {
    enableRealTime: boolean;
    refreshInterval: number;
    maxDataPoints: number;
    enableExport: boolean;
  };

  /** Export configuration */
  export: {
    formats: ('json' | 'csv' | 'excel')[];
    compression: boolean;
    encryption: boolean;
  };
}

export interface StoredTrace {
  /** Trace identifier */
  id: string;

  /** Original command */
  command: string;

  /** Execution options */
  options: Record<string, any>;

  /** Execution context */
  context: Record<string, any>;

  /** Complete execution flow */
  executionFlow: DetailedExecutionFlow;

  /** Generated analytics */
  analytics: CallTreeAnalytics;

  /** Storage timestamp */
  storedAt: number;

  /** Trace duration */
  duration: number;

  /** Success status */
  success: boolean;

  /** Error message if failed */
  errorMessage?: string;
}

export interface DetailedExecutionFlow {
  /** Root call tree entry */
  rootNode: CallTreeEntry;

  /** All tool calls made */
  toolCalls: ToolCallDetail[];

  /** Context7 API calls */
  context7Calls: Context7CallDetail[];

  /** Cache operations */
  cacheOperations: CacheOperationDetail[];

  /** Performance metrics */
  performanceMetrics: PerformanceMetricDetail[];

  /** Errors encountered */
  errors: ErrorDetail[];

  /** Resource usage */
  resourceUsage: ResourceUsageDetail[];

  /** User interaction patterns */
  userPatterns: UserPatternDetail[];
}

export interface ToolCallDetail {
  /** Tool name */
  tool: string;

  /** Call parameters */
  parameters: Record<string, any>;

  /** Execution time */
  executionTime: number;

  /** Success status */
  success: boolean;

  /** Result data */
  result?: any;

  /** Error message if failed */
  error?: string;

  /** Memory usage */
  memoryUsage: number;

  /** CPU usage */
  cpuUsage: number;
}

export interface Context7CallDetail {
  /** API endpoint */
  endpoint: string;

  /** Request parameters */
  parameters: Record<string, any>;

  /** Response time */
  responseTime: number;

  /** Success status */
  success: boolean;

  /** Response size */
  responseSize: number;

  /** Cache hit status */
  cacheHit: boolean;

  /** Token usage */
  tokenUsage: number;

  /** Cost */
  cost: number;
}

export interface CacheOperationDetail {
  /** Operation type */
  operation: 'get' | 'set' | 'delete' | 'clear';

  /** Cache key */
  key: string;

  /** Operation time */
  operationTime: number;

  /** Success status */
  success: boolean;

  /** Data size */
  dataSize: number;

  /** Hit/miss status */
  hit: boolean;
}

export interface PerformanceMetricDetail {
  /** Metric name */
  name: string;

  /** Metric value */
  value: number;

  /** Metric unit */
  unit: string;

  /** Timestamp */
  timestamp: number;

  /** Tags */
  tags: Record<string, string>;
}

export interface ErrorDetail {
  /** Error message */
  message: string;

  /** Error type */
  type: string;

  /** Stack trace */
  stack?: string;

  /** Timestamp */
  timestamp: number;

  /** Context */
  context: Record<string, any>;
}

export interface ResourceUsageDetail {
  /** Resource type */
  type: 'memory' | 'cpu' | 'io' | 'network';

  /** Usage value */
  value: number;

  /** Unit */
  unit: string;

  /** Timestamp */
  timestamp: number;

  /** Peak usage */
  peak: number;
}

export interface UserPatternDetail {
  /** Pattern type */
  type: string;

  /** Pattern data */
  data: Record<string, any>;

  /** Confidence score */
  confidence: number;

  /** Timestamp */
  timestamp: number;
}

// ============================================================================
// Filter and Query Interfaces
// ============================================================================

export interface TraceFilters {
  /** Time range filter */
  timeRange?: {
    start: number;
    end: number;
  };

  /** Command filter */
  commands?: string[];

  /** Success status filter */
  success?: boolean;

  /** Tool filter */
  tools?: string[];

  /** User role filter */
  roles?: string[];

  /** Quality level filter */
  qualityLevels?: string[];

  /** Performance threshold filter */
  performanceThreshold?: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
}

export interface AggregatedAnalytics {
  /** Time range */
  timeRange: {
    start: number;
    end: number;
  };

  /** Aggregated metrics */
  metrics: ExecutionMetrics;

  /** Performance insights */
  insights: PerformanceInsights;

  /** Usage patterns */
  patterns: UsagePattern[];

  /** Quality metrics */
  quality: QualityMetrics;

  /** Trends */
  trends: TrendAnalysis;
}

export interface ExportedData {
  /** Export format */
  format: 'json' | 'csv' | 'excel';

  /** Export data */
  data: any;

  /** Export metadata */
  metadata: {
    exportedAt: number;
    recordCount: number;
    timeRange: {
      start: number;
      end: number;
    };
  };
}

// ============================================================================
// Export Types
// ============================================================================

// Export types are already declared above as interfaces
// Removed duplicate export declarations to fix TS2484 errors
