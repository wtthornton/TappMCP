/**
 * Type definitions for Call Tree Tracing System
 */

export type TracePhase = 'planning' | 'execution' | 'formatting' | 'context7' | 'cache' | 'error';

export interface CallTreeEntry {
  id: string;
  tool: string;
  phase: TracePhase;
  startTime: number;
  endTime?: number;
  duration?: number;
  parameters?: any;
  result?: any;
  error?: string;
  children: CallTreeEntry[];
  dependencies: string[];
  parentId?: string;
  level: number;
  metadata?: {
    memoryUsage?: number;
    tokenUsage?: number;
    cost?: number;
    cacheHit?: boolean;
    apiCall?: boolean;
  };
}

export interface CallTreeReport {
  summary: {
    totalDuration: number;
    toolsUsed: string[];
    context7Calls: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    phases: TracePhase[];
  };
  timeline: CallTreeEntry[];
  context7Details: {
    libraryResolutions: Array<{
      topic: string;
      libraryId: string;
      duration: number;
      cached: boolean;
    }>;
    apiCalls: Array<{
      endpoint: string;
      duration: number;
      success: boolean;
      tokens: number;
      cost: number;
    }>;
    cacheOperations: Array<{
      operation: 'hit' | 'miss' | 'set';
      key: string;
      size: number;
    }>;
  };
  toolExecution: Array<{
    tool: string;
    phase: string;
    duration: number;
    parameters: any;
    result: any;
    dependencies: string[];
  }>;
  performance: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationOpportunities: string[];
  };
}

export interface TraceConfig {
  enabled: boolean;
  level: 'basic' | 'detailed' | 'comprehensive';
  includeParameters: boolean;
  includeResults: boolean;
  includeTiming: boolean;
  includeContext7: boolean;
  includeCache: boolean;
  maxDepth: number;
  outputFormat: 'console' | 'json' | 'html';
  maxMemoryUsage: number; // MB
  maxTraceSize: number; // entries
}

export interface TraceMetrics {
  totalTraces: number;
  averageDuration: number;
  successRate: number;
  context7HitRate: number;
  memoryUsage: number;
  errorRate: number;
}
