import { RealMetricsCollector } from '../core/real-metrics-collector.js';
import { Context7Cache } from '../core/context7-cache.js';

export interface PerformanceIssue {
  id: string;
  type: PerformanceIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    file: string;
    line: number;
    column?: number;
    function?: string;
    class?: string;
  };
  code: string;
  impact: {
    executionTime: number; // Estimated milliseconds
    memoryUsage: number; // Estimated MB
    cpuUsage: number; // Estimated percentage
    scalability: number; // 0-1 scale
    overall: number; // 0-1 scale
  };
  confidence: number; // 0-1
  tags: string[];
  metadata: {
    language: string;
    framework?: string;
    detectedAt: string;
    category: string;
  };
}

export interface PerformanceRecommendation {
  id: string;
  issueId: string;
  title: string;
  description: string;
  solution: string;
  explanation: string;
  codeFix: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: {
    executionTimeImprovement: number; // Percentage improvement
    memoryImprovement: number; // Percentage improvement
    cpuImprovement: number; // Percentage improvement
    scalabilityImprovement: number; // Percentage improvement
    overallImprovement: number; // Percentage improvement
  };
  prerequisites: string[];
  alternatives: string[];
  examples: PerformanceExample[];
  testing: {
    benchmarks: string[];
    verification: string[];
  };
}

export interface PerformanceExample {
  before: string;
  after: string;
  explanation: string;
  context: string;
  benchmark?: {
    before: number;
    after: number;
    improvement: number;
  };
}

export type PerformanceIssueType =
  | 'nested_loops'
  | 'inefficient_algorithms'
  | 'memory_leaks'
  | 'excessive_allocations'
  | 'synchronous_operations'
  | 'blocking_operations'
  | 'redundant_calculations'
  | 'inefficient_data_structures'
  | 'unnecessary_renders'
  | 'large_bundle_size'
  | 'slow_database_queries'
  | 'inefficient_caching'
  | 'excessive_api_calls'
  | 'poor_error_handling'
  | 'inefficient_serialization'
  | 'memory_fragmentation'
  | 'garbage_collection_pressure'
  | 'inefficient_regex'
  | 'string_concatenation'
  | 'dom_manipulation'
  | 'event_listener_leaks'
  | 'timer_leaks'
  | 'closure_leaks'
  | 'circular_references'
  | 'deep_object_traversal'
  | 'inefficient_sorting'
  | 'redundant_network_requests'
  | 'unoptimized_images'
  | 'large_object_graphs'
  | 'inefficient_parsing'
  | 'blocking_ui_operations'
  | 'excessive_reflows'
  | 'unnecessary_repaints'
  | 'inefficient_animations'
  | 'memory_intensive_operations'
  | 'cpu_intensive_operations'
  | 'io_intensive_operations'
  | 'network_intensive_operations'
  | 'custom';

export interface PerformanceContext {
  code: string;
  language: string;
  filePath?: string;
  framework?: string;
  dependencies?: string[];
  environment?: string;
  performanceRequirements?: {
    maxExecutionTime?: number; // ms
    maxMemoryUsage?: number; // MB
    maxCpuUsage?: number; // percentage
    targetThroughput?: number; // requests per second
  };
  userPreferences?: {
    prioritizeSpeed?: boolean;
    prioritizeMemory?: boolean;
    prioritizeScalability?: boolean;
    acceptableTradeoffs?: string[];
  };
}

export interface PerformanceAnalysis {
  issues: PerformanceIssue[];
  recommendations: PerformanceRecommendation[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    estimatedImprovement: {
      executionTime: number;
      memoryUsage: number;
      cpuUsage: number;
      scalability: number;
      overall: number;
    };
  };
  metrics: {
    current: any;
    projected: any;
    improvement: number;
  };
  executionTime: number;
}

export class SmartPerformanceOptimizer {
  private metricsCollector: RealMetricsCollector;
  private context7Cache: Context7Cache;
  private performancePatterns: Map<PerformanceIssueType, PerformancePattern>;
  private recommendationLibrary: Map<string, PerformanceRecommendation[]>;

  constructor() {
    this.metricsCollector = new RealMetricsCollector();
    this.context7Cache = new Context7Cache();
    this.performancePatterns = new Map();
    this.recommendationLibrary = new Map();
    this.initializePatterns();
    this.initializeRecommendationLibrary();
  }

  /**
   * Analyze code and identify performance issues
   */
  async analyzeCode(context: PerformanceContext): Promise<PerformanceAnalysis> {
    const startTime = Date.now();

    try {
      // Detect performance issues using pattern matching
      const issues = await this.detectPerformanceIssues(context);

      // Generate recommendations for each issue
      const recommendations = await this.generateRecommendations(issues, context);

      // Calculate current and projected metrics
      const currentMetrics = await this.calculateCurrentMetrics(context);
      const projectedMetrics = await this.calculateProjectedMetrics(context, recommendations);

      // Generate summary
      const summary = this.generateSummary(issues, recommendations);

      const executionTime = Math.max(1, Date.now() - startTime);

      return {
        issues,
        recommendations,
        summary,
        metrics: {
          current: currentMetrics,
          projected: projectedMetrics,
          improvement: this.calculateImprovement(currentMetrics, projectedMetrics)
        },
        executionTime
      };
    } catch (error) {
      console.error('Error in performance analysis:', error);
      throw new Error(`Performance analysis failed: ${error}`);
    }
  }

  /**
   * Get recommendations for specific issue types
   */
  async getRecommendationsByType(
    issueType: PerformanceIssueType,
    context: PerformanceContext
  ): Promise<PerformanceRecommendation[]> {
    const analysis = await this.analyzeCode(context);
    return analysis.recommendations.filter(r => {
      const issue = analysis.issues.find(i => i.id === r.issueId);
      return issue && issue.type === issueType;
    });
  }

  /**
   * Get recommendations by severity
   */
  async getRecommendationsBySeverity(
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: PerformanceContext
  ): Promise<PerformanceRecommendation[]> {
    const analysis = await this.analyzeCode(context);
    return analysis.recommendations.filter(r => {
      const issue = analysis.issues.find(i => i.id === r.issueId);
      return issue && issue.severity === severity;
    });
  }

  /**
   * Apply a performance optimization recommendation
   */
  async applyOptimization(
    issueId: string,
    recommendationId: string,
    context: PerformanceContext
  ): Promise<{
    success: boolean;
    optimizedCode: string;
    changes: string[];
    warnings: string[];
    verification: string[];
  }> {
    try {
      const analysis = await this.analyzeCode(context);
      const issue = analysis.issues.find(i => i.id === issueId);
      const recommendation = analysis.recommendations.find(r => r.id === recommendationId);

      if (!issue || !recommendation) {
        throw new Error('Issue or recommendation not found');
      }

      const optimizedCode = this.applyCodeFix(context.code, recommendation);
      const changes = this.calculateChanges(context.code, optimizedCode);
      const warnings = this.validateOptimization(issue, recommendation, optimizedCode);
      const verification = recommendation.testing.verification;

      return {
        success: warnings.length === 0,
        optimizedCode,
        changes,
        warnings,
        verification
      };
    } catch (error) {
      console.error('Error applying optimization:', error);
      throw new Error(`Optimization application failed: ${error}`);
    }
  }

  /**
   * Private helper methods
   */
  private async detectPerformanceIssues(context: PerformanceContext): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    for (const [type, pattern] of this.performancePatterns) {
      if (pattern.detect(context)) {
        const issue = await pattern.generate(context);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private async generateRecommendations(
    issues: PerformanceIssue[],
    context: PerformanceContext
  ): Promise<PerformanceRecommendation[]> {
    const recommendations: PerformanceRecommendation[] = [];

    for (const issue of issues) {
      const issueRecommendations = this.recommendationLibrary.get(issue.type) || [];
      for (const template of issueRecommendations) {
        const recommendation = this.adaptRecommendation(template, issue, context);
        recommendations.push(recommendation);
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private async calculateCurrentMetrics(context: PerformanceContext): Promise<any> {
    return await this.metricsCollector.calculateRealQualityMetrics(
      context.code,
      context.filePath || 'unknown.ts'
    );
  }

  private async calculateProjectedMetrics(
    context: PerformanceContext,
    recommendations: PerformanceRecommendation[]
  ): Promise<any> {
    // Simulate applying high-confidence recommendations
    const highConfidenceRecommendations = recommendations.filter(r => r.confidence >= 0.8);
    let simulatedCode = context.code;

    for (const recommendation of highConfidenceRecommendations.slice(0, 3)) {
      simulatedCode = this.applyCodeFix(simulatedCode, recommendation);
    }

    return await this.metricsCollector.calculateRealQualityMetrics(
      simulatedCode,
      context.filePath || 'unknown.ts'
    );
  }

  private generateSummary(issues: PerformanceIssue[], recommendations: PerformanceRecommendation[]) {
    const estimatedImprovement = this.calculateEstimatedImprovement(recommendations);

    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
      estimatedImprovement
    };
  }

  private calculateEstimatedImprovement(recommendations: PerformanceRecommendation[]) {
    const improvements = recommendations.reduce((acc, rec) => {
      acc.executionTime += rec.impact.executionTimeImprovement;
      acc.memoryUsage += rec.impact.memoryImprovement;
      acc.cpuUsage += rec.impact.cpuImprovement;
      acc.scalability += rec.impact.scalabilityImprovement;
      acc.overall += rec.impact.overallImprovement;
      return acc;
    }, {
      executionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      scalability: 0,
      overall: 0
    });

    const count = Math.max(1, recommendations.length);
    return {
      executionTime: improvements.executionTime / count,
      memoryUsage: improvements.memoryUsage / count,
      cpuUsage: improvements.cpuUsage / count,
      scalability: improvements.scalability / count,
      overall: improvements.overall / count
    };
  }

  private calculateImprovement(current: any, projected: any): number {
    const currentScore = current.overall || 0;
    const projectedScore = projected.overall || 0;
    return ((projectedScore - currentScore) / currentScore) * 100;
  }

  private initializePatterns(): void {
    // Nested Loops Pattern
    this.performancePatterns.set('nested_loops', {
      detect: (context) => this.detectNestedLoops(context),
      generate: (context) => this.generateNestedLoopsIssue(context)
    });

    // Inefficient Algorithms Pattern
    this.performancePatterns.set('inefficient_algorithms', {
      detect: (context) => this.detectInefficientAlgorithms(context),
      generate: (context) => this.generateInefficientAlgorithmsIssue(context)
    });

    // Memory Leaks Pattern
    this.performancePatterns.set('memory_leaks', {
      detect: (context) => this.detectMemoryLeaks(context),
      generate: (context) => this.generateMemoryLeaksIssue(context)
    });

    // Excessive Allocations Pattern
    this.performancePatterns.set('excessive_allocations', {
      detect: (context) => this.detectExcessiveAllocations(context),
      generate: (context) => this.generateExcessiveAllocationsIssue(context)
    });

    // Synchronous Operations Pattern
    this.performancePatterns.set('synchronous_operations', {
      detect: (context) => this.detectSynchronousOperations(context),
      generate: (context) => this.generateSynchronousOperationsIssue(context)
    });

    // Redundant Calculations Pattern
    this.performancePatterns.set('redundant_calculations', {
      detect: (context) => this.detectRedundantCalculations(context),
      generate: (context) => this.generateRedundantCalculationsIssue(context)
    });

    // Inefficient Data Structures Pattern
    this.performancePatterns.set('inefficient_data_structures', {
      detect: (context) => this.detectInefficientDataStructures(context),
      generate: (context) => this.generateInefficientDataStructuresIssue(context)
    });

    // Large Bundle Size Pattern
    this.performancePatterns.set('large_bundle_size', {
      detect: (context) => this.detectLargeBundleSize(context),
      generate: (context) => this.generateLargeBundleSizeIssue(context)
    });

    // Excessive API Calls Pattern
    this.performancePatterns.set('excessive_api_calls', {
      detect: (context) => this.detectExcessiveApiCalls(context),
      generate: (context) => this.generateExcessiveApiCallsIssue(context)
    });
  }

  private initializeRecommendationLibrary(): void {
    // Nested Loops Solutions
    this.recommendationLibrary.set('nested_loops', [
      {
        id: 'nested_loops_fix_1',
        issueId: '',
        title: 'Replace Nested Loops with Map/Set',
        description: 'Use Map or Set for O(1) lookups instead of nested loops for O(n²) complexity',
        solution: 'Replace nested loops with Map-based lookups',
        explanation: 'Nested loops create O(n²) complexity. Using Map or Set for lookups reduces this to O(n).',
        codeFix: 'const itemMap = new Map(items.map(item => [item.id, item]));\nfor (const item of items) {\n  if (itemMap.has(item.id)) { /* process */ }\n}',
        confidence: 0.9,
        effort: 'medium',
        impact: {
          executionTimeImprovement: 80,
          memoryImprovement: 20,
          cpuImprovement: 70,
          scalabilityImprovement: 90,
          overallImprovement: 75
        },
        prerequisites: ['Identify the nested loop pattern', 'Understand the data structure'],
        alternatives: ['Use database indexing', 'Implement caching'],
        examples: [{
          before: 'for (let i = 0; i < items.length; i++) {\n  for (let j = 0; j < items.length; j++) {\n    if (items[i].id === items[j].id) { /* process */ }\n  }\n}',
          after: 'const itemMap = new Map(items.map(item => [item.id, item]));\nfor (const item of items) {\n  if (itemMap.has(item.id)) { /* process */ }\n}',
          explanation: 'Replace O(n²) nested loops with O(n) Map-based lookup',
          context: 'Finding duplicate items',
          benchmark: { before: 1000, after: 100, improvement: 90 }
        }],
        testing: {
          benchmarks: ['Measure execution time with large datasets', 'Compare memory usage'],
          verification: ['Verify correct results', 'Check performance improvement']
        }
      }
    ]);

    // Memory Leaks Solutions
    this.recommendationLibrary.set('memory_leaks', [
      {
        id: 'memory_leaks_fix_1',
        issueId: '',
        title: 'Add Event Listener Cleanup',
        description: 'Remove event listeners to prevent memory leaks',
        solution: 'Add cleanup code for event listeners',
        explanation: 'Event listeners that are not removed can cause memory leaks over time.',
        codeFix: '// Add cleanup\nelement.removeEventListener("click", handleClick);\nclearInterval(intervalId);\nclearTimeout(timeoutId);',
        confidence: 0.8,
        effort: 'low',
        impact: {
          executionTimeImprovement: 10,
          memoryImprovement: 60,
          cpuImprovement: 20,
          scalabilityImprovement: 40,
          overallImprovement: 35
        },
        prerequisites: ['Identify event listeners and timers', 'Understand component lifecycle'],
        alternatives: ['Use WeakMap for automatic cleanup', 'Implement automatic cleanup patterns'],
        examples: [{
          before: 'element.addEventListener("click", handleClick);\nsetInterval(updateData, 1000);',
          after: 'element.addEventListener("click", handleClick);\nsetInterval(updateData, 1000);\n\n// Cleanup\nfunction cleanup() {\n  element.removeEventListener("click", handleClick);\n  clearInterval(intervalId);\n}',
          explanation: 'Add cleanup to prevent memory leaks',
          context: 'Component cleanup'
        }],
        testing: {
          benchmarks: ['Monitor memory usage over time', 'Test cleanup effectiveness'],
          verification: ['Verify listeners are removed', 'Check for memory leaks']
        }
      }
    ]);

    // Redundant Calculations Solutions
    this.recommendationLibrary.set('redundant_calculations', [
      {
        id: 'redundant_calculations_fix_1',
        issueId: '',
        title: 'Cache Expensive Calculations',
        description: 'Store results of expensive calculations to avoid recomputation',
        solution: 'Implement memoization or caching for expensive calculations',
        explanation: 'Repeated calculations waste CPU cycles. Caching results improves performance.',
        codeFix: 'const cache = new Map();\nfunction expensiveCalculation(input) {\n  if (cache.has(input)) {\n    return cache.get(input);\n  }\n  const result = /* expensive calculation */;\n  cache.set(input, result);\n  return result;\n}',
        confidence: 0.9,
        effort: 'medium',
        impact: {
          executionTimeImprovement: 70,
          memoryImprovement: -10,
          cpuImprovement: 80,
          scalabilityImprovement: 60,
          overallImprovement: 70
        },
        prerequisites: ['Identify repeated calculations', 'Understand input patterns'],
        alternatives: ['Use React.useMemo', 'Implement lazy evaluation'],
        examples: [{
          before: 'function processData(data) {\n  const expensive = data.map(item => complexCalculation(item));\n  return expensive.filter(result => result > threshold);\n}',
          after: 'const cache = new Map();\nfunction processData(data) {\n  const expensive = data.map(item => {\n    if (cache.has(item.id)) return cache.get(item.id);\n    const result = complexCalculation(item);\n    cache.set(item.id, result);\n    return result;\n  });\n  return expensive.filter(result => result > threshold);\n}',
          explanation: 'Cache expensive calculations to avoid recomputation',
          context: 'Data processing with repeated calculations'
        }],
        testing: {
          benchmarks: ['Measure calculation time', 'Compare with and without cache'],
          verification: ['Verify cache hits', 'Check memory usage']
        }
      }
    ]);
  }

  // Pattern Detection Methods
  private detectNestedLoops(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const nestedLoopPatterns = [
      /for\s*\([^)]*\)\s*{[\s\S]*?for\s*\([^)]*\)\s*{/, // Nested for loops
      /\.forEach\s*\([^)]*\)\s*{[\s\S]*?\.forEach\s*\([^)]*\)\s*{/, // Nested forEach
      /for\s*\([^)]*\)\s*{[\s\S]*?for\s*\([^)]*\)\s*{[\s\S]*?for\s*\([^)]*\)\s*{/, // Triple nested
      /while\s*\([^)]*\)\s*{[\s\S]*?while\s*\([^)]*\)\s*{/, // Nested while loops
      /for\s*\([^)]*\)\s*{[\s\S]*?while\s*\([^)]*\)\s*{/, // Mixed nested loops
      /while\s*\([^)]*\)\s*{[\s\S]*?for\s*\([^)]*\)\s*{/ // Mixed nested loops
    ];

    return nestedLoopPatterns.some(pattern => pattern.test(context.code));
  }

  private detectInefficientAlgorithms(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const inefficientPatterns = [
      /\.sort\s*\([^)]*\)\s*\.sort\s*\([^)]*\)/, // Multiple sorts
      /\.filter\s*\([^)]*\)\s*\.filter\s*\([^)]*\)\s*\.filter\s*\([^)]*\)/, // Multiple filters
      /\.map\s*\([^)]*\)\s*\.map\s*\([^)]*\)\s*\.map\s*\([^)]*\)/, // Multiple maps
      /\.find\s*\([^)]*\)\s*\.find\s*\([^)]*\)/, // Multiple finds
      /\.includes\s*\([^)]*\)\s*\.includes\s*\([^)]*\)/, // Multiple includes
      /\.indexOf\s*\([^)]*\)\s*\.indexOf\s*\([^)]*\)/ // Multiple indexOf
    ];

    return inefficientPatterns.some(pattern => pattern.test(context.code));
  }

  private detectMemoryLeaks(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const memoryLeakPatterns = [
      /addEventListener\s*\([^,)]*,\s*[^,)]*\)(?![\s\S]*removeEventListener)/, // Event listener without cleanup
      /setInterval\s*\([^,)]*,\s*[^,)]*\)(?![\s\S]*clearInterval)/, // setInterval without cleanup
      /setTimeout\s*\([^,)]*,\s*[^,)]*\)(?![\s\S]*clearTimeout)/, // setTimeout without cleanup
      /new\s+Image\s*\(\)(?![\s\S]*\.onload)/, // Image without load handler
      /new\s+XMLHttpRequest\s*\(\)(?![\s\S]*\.onload)/, // XHR without load handler
      /document\.createElement\s*\([^)]*\)(?![\s\S]*removeChild)/ // DOM element without cleanup
    ];

    return memoryLeakPatterns.some(pattern => pattern.test(context.code));
  }

  private detectExcessiveAllocations(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const allocationPatterns = [
      /new\s+Array\s*\([^)]*\)/, // Array constructor
      /new\s+Object\s*\([^)]*\)/, // Object constructor
      /\[\s*\]\s*\.push\s*\([^)]*\)/, // Array push in loop
      /\{\s*\}\s*\.\w+\s*=\s*[^;]+;/, // Object property assignment in loop
      /new\s+Date\s*\([^)]*\)/, // Date constructor
      /new\s+RegExp\s*\([^)]*\)/ // RegExp constructor
    ];

    return allocationPatterns.some(pattern => pattern.test(context.code));
  }

  private detectSynchronousOperations(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const syncPatterns = [
      /fs\.readFileSync\s*\(/, // Synchronous file read
      /fs\.writeFileSync\s*\(/, // Synchronous file write
      /JSON\.parse\s*\([^)]*\)\s*\./, // JSON.parse without try-catch
      /eval\s*\(/, // eval usage
      /Function\s*\([^)]*\)\s*\(/, // Function constructor
      /setTimeout\s*\([^,)]*,\s*0\)/, // setTimeout with 0 delay
      /setInterval\s*\([^,)]*,\s*0\)/ // setInterval with 0 delay
    ];

    return syncPatterns.some(pattern => pattern.test(context.code));
  }

  private detectRedundantCalculations(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const redundantPatterns = [
      /Math\.pow\s*\([^,)]*,\s*2\s*\)/, // Math.pow(x, 2) instead of x * x
      /Math\.sqrt\s*\([^,)]*\)\s*\*\s*Math\.sqrt\s*\([^,)]*\)/, // sqrt(a) * sqrt(b) instead of sqrt(a * b)
      /\.length\s*>\s*0/, // array.length > 0 instead of array.length
      /\.length\s*===\s*0/, // array.length === 0 instead of !array.length
      /\.toLowerCase\s*\(\)\s*\.toLowerCase\s*\(\)/, // Multiple toLowerCase
      /\.toUpperCase\s*\(\)\s*\.toUpperCase\s*\(\)/, // Multiple toUpperCase
      /JSON\.stringify\s*\([^)]*\)\s*\.length/, // JSON.stringify for length check
      /Object\.keys\s*\([^)]*\)\s*\.length\s*>\s*0/, // Object.keys for empty check
      /Math\.sqrt\s*\([^,)]*\)\s*\+\s*Math\.sqrt\s*\([^,)]*\)/, // sqrt(a) + sqrt(b) instead of sqrt(a + b)
      /Math\.pow\s*\([^,)]*,\s*0\.5\s*\)/, // Math.pow(x, 0.5) instead of Math.sqrt(x)
      /Math\.pow\s*\([^,)]*,\s*1\s*\)/ // Math.pow(x, 1) instead of x
    ];

    return redundantPatterns.some(pattern => pattern.test(context.code));
  }

  private detectInefficientDataStructures(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const inefficientPatterns = [
      /\.indexOf\s*\([^)]*\)\s*!==\s*-1/, // indexOf for includes
      /\.indexOf\s*\([^)]*\)\s*>\s*-1/, // indexOf for includes
      /\.filter\s*\([^)]*\)\s*\.length\s*>\s*0/, // filter for some
      /\.find\s*\([^)]*\)\s*!==\s*undefined/, // find for some
      /\.every\s*\([^)]*\)\s*&&\s*\.some\s*\([^)]*\)/, // every && some
      /\.slice\s*\([^)]*\)\s*\.slice\s*\([^)]*\)/, // Multiple slices
      /\.split\s*\([^)]*\)\s*\.split\s*\([^)]*\)/, // Multiple splits
      /for\s*\([^)]*\)\s*{[\s\S]*?if\s*\([^)]*\.id\s*===\s*[^)]*\)[\s\S]*?return[\s\S]*?}/, // Linear search instead of Map
      /\.includes\s*\([^)]*\)\s*\.includes\s*\([^)]*\)/, // Multiple includes
      /\.some\s*\([^)]*\)\s*\.some\s*\([^)]*\)/ // Multiple some
    ];

    return inefficientPatterns.some(pattern => pattern.test(context.code));
  }

  private detectLargeBundleSize(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const bundlePatterns = [
      /import\s+\*\s+as\s+\w+\s+from/, // Wildcard imports
      /import\s+[^}]*\s+from\s+['"]lodash['"]/, // Lodash imports
      /import\s+[^}]*\s+from\s+['"]moment['"]/, // Moment.js imports
      /import\s+[^}]*\s+from\s+['"]jquery['"]/, // jQuery imports
      /require\s*\(\s*['"]lodash['"]\s*\)/, // Lodash require
      /require\s*\(\s*['"]moment['"]\s*\)/, // Moment require
      /require\s*\(\s*['"]jquery['"]\s*\)/ // jQuery require
    ];

    return bundlePatterns.some(pattern => pattern.test(context.code));
  }

  private detectExcessiveApiCalls(context: PerformanceContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const apiPatterns = [
      /fetch\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*\.then/, // Multiple fetch chains
      /axios\s*\.\w+\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*\.then/, // Multiple axios chains
      /\.map\s*\([^)]*fetch\s*\([^)]*\)[^}]*\)/, // Map with fetch
      /\.forEach\s*\([^)]*fetch\s*\([^)]*\)[^}]*\)/, // forEach with fetch
      /for\s*\([^)]*\)\s*{[\s\S]*?fetch\s*\([^)]*\)/, // Loop with fetch
      /while\s*\([^)]*\)\s*{[\s\S]*?fetch\s*\([^)]*\)/ // While with fetch
    ];

    return apiPatterns.some(pattern => pattern.test(context.code));
  }

  // Issue Generation Methods
  private async generateNestedLoopsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `nested_loops_${Date.now()}`,
      type: 'nested_loops',
      severity: 'high',
      title: 'Nested Loops Detected',
      description: 'The code contains nested loops which create O(n²) complexity and can cause performance issues with large datasets.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 1000, // Estimated ms
        memoryUsage: 50, // Estimated MB
        cpuUsage: 80, // Estimated percentage
        scalability: 0.2, // 0-1 scale
        overall: 0.8 // 0-1 scale
      },
      confidence: 0.9,
      tags: ['performance', 'complexity', 'loops'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Algorithm'
      }
    };
  }

  private async generateInefficientAlgorithmsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `inefficient_algorithms_${Date.now()}`,
      type: 'inefficient_algorithms',
      severity: 'medium',
      title: 'Inefficient Algorithm Detected',
      description: 'The code contains inefficient algorithm patterns that can be optimized for better performance.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 500,
        memoryUsage: 20,
        cpuUsage: 60,
        scalability: 0.4,
        overall: 0.6
      },
      confidence: 0.8,
      tags: ['performance', 'algorithm', 'optimization'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Algorithm'
      }
    };
  }

  private async generateMemoryLeaksIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `memory_leaks_${Date.now()}`,
      type: 'memory_leaks',
      severity: 'high',
      title: 'Memory Leak Detected',
      description: 'The code contains patterns that can cause memory leaks over time.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 100,
        memoryUsage: 200,
        cpuUsage: 30,
        scalability: 0.1,
        overall: 0.7
      },
      confidence: 0.9,
      tags: ['memory', 'leak', 'performance'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Memory'
      }
    };
  }

  private async generateExcessiveAllocationsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `excessive_allocations_${Date.now()}`,
      type: 'excessive_allocations',
      severity: 'medium',
      title: 'Excessive Memory Allocations',
      description: 'The code creates many temporary objects which can cause garbage collection pressure.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 200,
        memoryUsage: 100,
        cpuUsage: 40,
        scalability: 0.3,
        overall: 0.5
      },
      confidence: 0.7,
      tags: ['memory', 'allocation', 'gc'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Memory'
      }
    };
  }

  private async generateSynchronousOperationsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `synchronous_operations_${Date.now()}`,
      type: 'synchronous_operations',
      severity: 'high',
      title: 'Synchronous Operations Detected',
      description: 'The code contains synchronous operations that can block the event loop and degrade performance.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 2000,
        memoryUsage: 10,
        cpuUsage: 90,
        scalability: 0.1,
        overall: 0.9
      },
      confidence: 0.8,
      tags: ['performance', 'blocking', 'synchronous'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Blocking'
      }
    };
  }

  private async generateRedundantCalculationsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `redundant_calculations_${Date.now()}`,
      type: 'redundant_calculations',
      severity: 'medium',
      title: 'Redundant Calculations Detected',
      description: 'The code performs redundant calculations that can be optimized through caching or better algorithms.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 300,
        memoryUsage: 5,
        cpuUsage: 50,
        scalability: 0.4,
        overall: 0.6
      },
      confidence: 0.8,
      tags: ['performance', 'redundant', 'calculation'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Calculation'
      }
    };
  }

  private async generateInefficientDataStructuresIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `inefficient_data_structures_${Date.now()}`,
      type: 'inefficient_data_structures',
      severity: 'medium',
      title: 'Inefficient Data Structure Usage',
      description: 'The code uses inefficient data structures or methods that can be optimized for better performance.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 400,
        memoryUsage: 15,
        cpuUsage: 45,
        scalability: 0.5,
        overall: 0.5
      },
      confidence: 0.7,
      tags: ['performance', 'data-structure', 'optimization'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Data Structure'
      }
    };
  }

  private async generateLargeBundleSizeIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `large_bundle_size_${Date.now()}`,
      type: 'large_bundle_size',
      severity: 'medium',
      title: 'Large Bundle Size Detected',
      description: 'The code imports large libraries that can increase bundle size and slow down loading.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 100,
        memoryUsage: 50,
        cpuUsage: 20,
        scalability: 0.6,
        overall: 0.4
      },
      confidence: 0.8,
      tags: ['bundle', 'size', 'loading'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Bundle'
      }
    };
  }

  private async generateExcessiveApiCallsIssue(context: PerformanceContext): Promise<PerformanceIssue> {
    return {
      id: `excessive_api_calls_${Date.now()}`,
      type: 'excessive_api_calls',
      severity: 'high',
      title: 'Excessive API Calls Detected',
      description: 'The code makes multiple API calls that can be optimized through batching or caching.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        executionTime: 1500,
        memoryUsage: 25,
        cpuUsage: 30,
        scalability: 0.2,
        overall: 0.7
      },
      confidence: 0.9,
      tags: ['api', 'network', 'performance'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Network'
      }
    };
  }

  private adaptRecommendation(
    template: PerformanceRecommendation,
    issue: PerformanceIssue,
    context: PerformanceContext
  ): PerformanceRecommendation {
    return {
      ...template,
      id: `${template.id}_${Date.now()}`,
      issueId: issue.id,
      confidence: Math.min(template.confidence, issue.confidence),
      codeFix: this.adaptCodeFix(template.codeFix, issue, context)
    };
  }

  private adaptCodeFix(template: string, issue: PerformanceIssue, context: PerformanceContext): string {
    // Simple adaptation - in a real implementation, this would be more sophisticated
    return template.replace('items', 'yourData')
                  .replace('item', 'yourItem')
                  .replace('handleClick', 'yourHandler')
                  .replace('updateData', 'yourUpdateFunction');
  }

  private applyCodeFix(originalCode: string, recommendation: PerformanceRecommendation): string {
    // Simple code fix application - in a real implementation, this would be more sophisticated
    return originalCode + '\n// Applied optimization: ' + recommendation.title + '\n' + recommendation.codeFix;
  }

  private calculateChanges(originalCode: string, optimizedCode: string): string[] {
    const changes: string[] = [];

    if (originalCode !== optimizedCode) {
      changes.push('Code structure optimized for performance');
    }

    return changes;
  }

  private validateOptimization(
    issue: PerformanceIssue,
    recommendation: PerformanceRecommendation,
    optimizedCode: string
  ): string[] {
    const warnings: string[] = [];

    if (recommendation.effort === 'high') {
      warnings.push('High-effort optimization - test thoroughly before deployment');
    }

    if (recommendation.impact.memoryImprovement < 0) {
      warnings.push('Optimization may increase memory usage');
    }

    return warnings;
  }
}

interface PerformancePattern {
  detect: (context: PerformanceContext) => boolean;
  generate: (context: PerformanceContext) => Promise<PerformanceIssue>;
}
