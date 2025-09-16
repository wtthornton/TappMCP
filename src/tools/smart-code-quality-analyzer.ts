import { RealMetricsCollector } from '../core/real-metrics-collector.js';
import { Context7Cache } from '../core/context7-cache.js';

export interface QualityIssue {
  id: string;
  type: QualityIssueType;
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
    maintainability: number; // 0-1 scale
    readability: number; // 0-1 scale
    testability: number; // 0-1 scale
    reusability: number; // 0-1 scale
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

export interface QualityRecommendation {
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
    maintainabilityImprovement: number; // Percentage improvement
    readabilityImprovement: number; // Percentage improvement
    testabilityImprovement: number; // Percentage improvement
    reusabilityImprovement: number; // Percentage improvement
    overallImprovement: number; // Percentage improvement
  };
  prerequisites: string[];
  alternatives: string[];
  examples: QualityExample[];
  testing: {
    verification: string[];
    refactoring: string[];
  };
}

export interface QualityExample {
  before: string;
  after: string;
  explanation: string;
  context: string;
  improvement?: {
    maintainability: number;
    readability: number;
    testability: number;
    reusability: number;
  };
}

export type QualityIssueType =
  | 'long_functions'
  | 'deep_nesting'
  | 'duplicate_code'
  | 'magic_numbers'
  | 'complex_conditionals'
  | 'poor_naming'
  | 'missing_documentation'
  | 'inconsistent_formatting'
  | 'unused_variables'
  | 'dead_code'
  | 'circular_dependencies'
  | 'tight_coupling'
  | 'god_objects'
  | 'feature_envy'
  | 'data_clumps'
  | 'primitive_obsession'
  | 'long_parameter_lists'
  | 'switch_statements'
  | 'temporary_fields'
  | 'refused_bequest'
  | 'inappropriate_intimacy'
  | 'message_chains'
  | 'middle_man'
  | 'speculative_generality'
  | 'shotgun_surgery'
  | 'divergent_change'
  | 'parallel_inheritance'
  | 'lazy_class'
  | 'data_class'
  | 'custom';

export interface QualityContext {
  code: string;
  language: string;
  filePath?: string;
  framework?: string;
  dependencies?: string[];
  environment?: string;
  qualityRequirements?: {
    maxFunctionLength?: number;
    maxNestingDepth?: number;
    minDocumentationCoverage?: number;
    maxCyclomaticComplexity?: number;
    minTestCoverage?: number;
  };
  userPreferences?: {
    prioritizeMaintainability?: boolean;
    prioritizeReadability?: boolean;
    prioritizeTestability?: boolean;
    prioritizePerformance?: boolean;
    codingStandards?: string[];
  };
}

export interface QualityAnalysis {
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    estimatedImprovement: {
      maintainability: number;
      readability: number;
      testability: number;
      reusability: number;
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

export class SmartCodeQualityAnalyzer {
  private metricsCollector: RealMetricsCollector;
  private context7Cache: Context7Cache;
  private qualityPatterns: Map<QualityIssueType, QualityPattern>;
  private recommendationLibrary: Map<string, QualityRecommendation[]>;

  constructor() {
    this.metricsCollector = new RealMetricsCollector();
    this.context7Cache = new Context7Cache();
    this.qualityPatterns = new Map();
    this.recommendationLibrary = new Map();
    this.initializePatterns();
    this.initializeRecommendationLibrary();
  }

  /**
   * Analyze code and identify quality issues
   */
  async analyzeCode(context: QualityContext): Promise<QualityAnalysis> {
    const startTime = Date.now();

    try {
      // Detect quality issues using pattern matching
      const issues = await this.detectQualityIssues(context);

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
      console.error('Error in quality analysis:', error);
      throw new Error(`Quality analysis failed: ${error}`);
    }
  }

  /**
   * Get recommendations for specific issue types
   */
  async getRecommendationsByType(
    issueType: QualityIssueType,
    context: QualityContext
  ): Promise<QualityRecommendation[]> {
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
    context: QualityContext
  ): Promise<QualityRecommendation[]> {
    const analysis = await this.analyzeCode(context);
    return analysis.recommendations.filter(r => {
      const issue = analysis.issues.find(i => i.id === r.issueId);
      return issue && issue.severity === severity;
    });
  }

  /**
   * Apply a quality improvement recommendation
   */
  async applyImprovement(
    issueId: string,
    recommendationId: string,
    context: QualityContext
  ): Promise<{
    success: boolean;
    improvedCode: string;
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

      const improvedCode = this.applyCodeFix(context.code, recommendation);
      const changes = this.calculateChanges(context.code, improvedCode);
      const warnings = this.validateImprovement(issue, recommendation, improvedCode);
      const verification = recommendation.testing.verification;

      return {
        success: warnings.length === 0,
        improvedCode,
        changes,
        warnings,
        verification
      };
    } catch (error) {
      console.error('Error applying improvement:', error);
      throw new Error(`Improvement application failed: ${error}`);
    }
  }

  /**
   * Private helper methods
   */
  private async detectQualityIssues(context: QualityContext): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    for (const [type, pattern] of this.qualityPatterns) {
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
    issues: QualityIssue[],
    context: QualityContext
  ): Promise<QualityRecommendation[]> {
    const recommendations: QualityRecommendation[] = [];

    for (const issue of issues) {
      const issueRecommendations = this.recommendationLibrary.get(issue.type) || [];
      for (const template of issueRecommendations) {
        const recommendation = this.adaptRecommendation(template, issue, context);
        recommendations.push(recommendation);
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private async calculateCurrentMetrics(context: QualityContext): Promise<any> {
    return await this.metricsCollector.calculateRealQualityMetrics(
      context.code,
      context.filePath || 'unknown.ts'
    );
  }

  private async calculateProjectedMetrics(
    context: QualityContext,
    recommendations: QualityRecommendation[]
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

  private generateSummary(issues: QualityIssue[], recommendations: QualityRecommendation[]) {
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

  private calculateEstimatedImprovement(recommendations: QualityRecommendation[]) {
    const improvements = recommendations.reduce((acc, rec) => {
      acc.maintainability += rec.impact.maintainabilityImprovement;
      acc.readability += rec.impact.readabilityImprovement;
      acc.testability += rec.impact.testabilityImprovement;
      acc.reusability += rec.impact.reusabilityImprovement;
      acc.overall += rec.impact.overallImprovement;
      return acc;
    }, {
      maintainability: 0,
      readability: 0,
      testability: 0,
      reusability: 0,
      overall: 0
    });

    const count = Math.max(1, recommendations.length);
    return {
      maintainability: improvements.maintainability / count,
      readability: improvements.readability / count,
      testability: improvements.testability / count,
      reusability: improvements.reusability / count,
      overall: improvements.overall / count
    };
  }

  private calculateImprovement(current: any, projected: any): number {
    const currentScore = current.overall || 0;
    const projectedScore = projected.overall || 0;
    return ((projectedScore - currentScore) / currentScore) * 100;
  }

  private initializePatterns(): void {
    // Long Functions Pattern
    this.qualityPatterns.set('long_functions', {
      detect: (context) => this.detectLongFunctions(context),
      generate: (context) => this.generateLongFunctionsIssue(context)
    });

    // Deep Nesting Pattern
    this.qualityPatterns.set('deep_nesting', {
      detect: (context) => this.detectDeepNesting(context),
      generate: (context) => this.generateDeepNestingIssue(context)
    });

    // Duplicate Code Pattern
    this.qualityPatterns.set('duplicate_code', {
      detect: (context) => this.detectDuplicateCode(context),
      generate: (context) => this.generateDuplicateCodeIssue(context)
    });

    // Magic Numbers Pattern
    this.qualityPatterns.set('magic_numbers', {
      detect: (context) => this.detectMagicNumbers(context),
      generate: (context) => this.generateMagicNumbersIssue(context)
    });

    // Complex Conditionals Pattern
    this.qualityPatterns.set('complex_conditionals', {
      detect: (context) => this.detectComplexConditionals(context),
      generate: (context) => this.generateComplexConditionalsIssue(context)
    });

    // Poor Naming Pattern
    this.qualityPatterns.set('poor_naming', {
      detect: (context) => this.detectPoorNaming(context),
      generate: (context) => this.generatePoorNamingIssue(context)
    });

    // Missing Documentation Pattern
    this.qualityPatterns.set('missing_documentation', {
      detect: (context) => this.detectMissingDocumentation(context),
      generate: (context) => this.generateMissingDocumentationIssue(context)
    });

    // Unused Variables Pattern
    this.qualityPatterns.set('unused_variables', {
      detect: (context) => this.detectUnusedVariables(context),
      generate: (context) => this.generateUnusedVariablesIssue(context)
    });

    // Dead Code Pattern
    this.qualityPatterns.set('dead_code', {
      detect: (context) => this.detectDeadCode(context),
      generate: (context) => this.generateDeadCodeIssue(context)
    });
  }

  private initializeRecommendationLibrary(): void {
    // Long Functions Solutions
    this.recommendationLibrary.set('long_functions', [
      {
        id: 'long_functions_fix_1',
        issueId: '',
        title: 'Extract Method',
        description: 'Break down long functions into smaller, focused methods',
        solution: 'Extract logical blocks into separate methods with descriptive names',
        explanation: 'Long functions are hard to understand, test, and maintain. Breaking them into smaller methods improves readability and reusability.',
        codeFix: '// Extract method\nexport function processUserData(userData: UserData) {\n  const validatedData = validateUserData(userData);\n  const processedData = transformUserData(validatedData);\n  return saveUserData(processedData);\n}\n\nfunction validateUserData(data: UserData): UserData {\n  // validation logic\n}\n\nfunction transformUserData(data: UserData): UserData {\n  // transformation logic\n}\n\nfunction saveUserData(data: UserData): void {\n  // save logic\n}',
        confidence: 0.9,
        effort: 'medium',
        impact: {
          maintainabilityImprovement: 80,
          readabilityImprovement: 85,
          testabilityImprovement: 90,
          reusabilityImprovement: 70,
          overallImprovement: 80
        },
        prerequisites: ['Identify logical blocks', 'Understand function responsibilities'],
        alternatives: ['Use composition', 'Apply strategy pattern'],
        examples: [{
          before: 'function processUserData(userData) {\n  // 50+ lines of mixed validation, transformation, and saving logic\n}',
          after: 'function processUserData(userData) {\n  const validatedData = validateUserData(userData);\n  const processedData = transformUserData(validatedData);\n  return saveUserData(processedData);\n}',
          explanation: 'Extract logical blocks into focused methods',
          context: 'Long function with mixed responsibilities',
          improvement: {
            maintainability: 80,
            readability: 85,
            testability: 90,
            reusability: 70
          }
        }],
        testing: {
          verification: ['Verify extracted methods work correctly', 'Test each method independently'],
          refactoring: ['Ensure no side effects', 'Maintain original functionality']
        }
      }
    ]);

    // Deep Nesting Solutions
    this.recommendationLibrary.set('deep_nesting', [
      {
        id: 'deep_nesting_fix_1',
        issueId: '',
        title: 'Extract Method and Early Returns',
        description: 'Reduce nesting by extracting methods and using early returns',
        solution: 'Use guard clauses and extract nested logic into separate methods',
        explanation: 'Deep nesting makes code hard to read and understand. Early returns and method extraction reduce complexity.',
        codeFix: '// Before: Deep nesting\nif (user) {\n  if (user.isActive) {\n    if (user.hasPermission) {\n      // do something\n    }\n  }\n}\n\n// After: Early returns and extracted methods\nif (!user) return;\nif (!user.isActive) return;\nif (!user.hasPermission) return;\n\n// do something',
        confidence: 0.8,
        effort: 'low',
        impact: {
          maintainabilityImprovement: 70,
          readabilityImprovement: 90,
          testabilityImprovement: 60,
          reusabilityImprovement: 40,
          overallImprovement: 70
        },
        prerequisites: ['Identify guard conditions', 'Understand control flow'],
        alternatives: ['Use strategy pattern', 'Apply command pattern'],
        examples: [{
          before: 'if (condition1) {\n  if (condition2) {\n    if (condition3) {\n      // nested logic\n    }\n  }\n}',
          after: 'if (!condition1) return;\nif (!condition2) return;\nif (!condition3) return;\n\n// logic',
          explanation: 'Use early returns to reduce nesting',
          context: 'Deep conditional nesting'
        }],
        testing: {
          verification: ['Test all code paths', 'Verify early returns work correctly'],
          refactoring: ['Ensure no logic changes', 'Maintain same behavior']
        }
      }
    ]);

    // Duplicate Code Solutions
    this.recommendationLibrary.set('duplicate_code', [
      {
        id: 'duplicate_code_fix_1',
        issueId: '',
        title: 'Extract Common Function',
        description: 'Extract duplicated code into a reusable function',
        solution: 'Identify common patterns and extract them into shared functions',
        explanation: 'Duplicate code violates DRY principle and makes maintenance difficult. Extract common functionality into reusable functions.',
        codeFix: '// Extract common function\nfunction calculateTotal(items: Item[]): number {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n\n// Use the extracted function\nconst orderTotal = calculateTotal(orderItems);\nconst cartTotal = calculateTotal(cartItems);',
        confidence: 0.9,
        effort: 'medium',
        impact: {
          maintainabilityImprovement: 85,
          readabilityImprovement: 70,
          testabilityImprovement: 80,
          reusabilityImprovement: 90,
          overallImprovement: 80
        },
        prerequisites: ['Identify duplicate patterns', 'Understand common functionality'],
        alternatives: ['Use inheritance', 'Apply mixins'],
        examples: [{
          before: 'const orderTotal = orderItems.reduce((sum, item) => sum + item.price, 0);\nconst cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);',
          after: 'function calculateTotal(items: Item[]): number {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n\nconst orderTotal = calculateTotal(orderItems);\nconst cartTotal = calculateTotal(cartItems);',
          explanation: 'Extract common calculation logic',
          context: 'Duplicate calculation logic'
        }],
        testing: {
          verification: ['Test extracted function', 'Verify all usages work correctly'],
          refactoring: ['Ensure no functionality changes', 'Test edge cases']
        }
      }
    ]);
  }

  // Pattern Detection Methods
  private detectLongFunctions(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const lines = context.code.split('\n');
    const functionLines = this.countFunctionLines(context.code);

    return functionLines > 20; // More than 20 lines per function
  }

  private detectDeepNesting(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const maxNesting = this.calculateMaxNesting(context.code);
    return maxNesting > 3; // More than 3 levels of nesting
  }

  private detectDuplicateCode(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const lines = context.code.split('\n');
    const duplicateLines = this.findDuplicateLines(lines);

    return duplicateLines.length > 1; // More than 1 duplicate line
  }

  private detectMagicNumbers(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const magicNumberPattern = /\b(?:[0-9]+(?:\.[0-9]+)?)\b/g;
    const matches = context.code.match(magicNumberPattern);

    return !!(matches && matches.length > 2); // More than 2 magic numbers
  }

  private detectComplexConditionals(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const complexConditionalPattern = /if\s*\([^)]*(?:&&|\|\|)[^)]*(?:&&|\|\|)[^)]*\)/g;
    const matches = context.code.match(complexConditionalPattern);

    return !!(matches && matches.length > 0);
  }

  private detectPoorNaming(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const poorNamingPatterns = [
      /\b(?:a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)\b/g, // Single letter variables
      /\b(?:temp|tmp|data|info|stuff|thing)\b/g, // Generic names
      /\b(?:var1|var2|var3|item1|item2|item3)\b/g // Numbered variables
    ];

    return poorNamingPatterns.some(pattern => {
      const matches = context.code.match(pattern);
      return matches && matches.length > 3;
    });
  }

  private detectMissingDocumentation(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const functionPattern = /function\s+\w+\s*\(/g;
    const classPattern = /class\s+\w+\s*{/g;
    const commentPattern = /\/\*\*[\s\S]*?\*\//g;

    const functions = context.code.match(functionPattern) || [];
    const classes = context.code.match(classPattern) || [];
    const comments = context.code.match(commentPattern) || [];

    const totalItems = functions.length + classes.length;
    const documentedItems = comments.length;

    return totalItems > 0 && documentedItems / totalItems < 0.5; // Less than 50% documented
  }

  private detectUnusedVariables(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const variablePattern = /(?:let|const|var)\s+(\w+)/g;
    const variables = [];
    let match;

    while ((match = variablePattern.exec(context.code)) !== null) {
      variables.push(match[1]);
    }

    const unusedVariables = variables.filter(variable => {
      const usagePattern = new RegExp(`\\b${variable}\\b`, 'g');
      const matches = context.code.match(usagePattern);
      return matches && matches.length === 1; // Only declared, never used
    });

    return unusedVariables.length > 0;
  }

  private detectDeadCode(context: QualityContext): boolean {
    if (!context.code || typeof context.code !== 'string') return false;

    const deadCodePatterns = [
      /console\.log\s*\([^)]*\)/g, // Console.log statements
      /debugger\s*;/g, // Debugger statements
      /\/\/\s*TODO/g, // TODO comments
      /\/\/\s*FIXME/g, // FIXME comments
      /\/\/\s*HACK/g // HACK comments
    ];

    return deadCodePatterns.some(pattern => {
      const matches = context.code.match(pattern);
      return matches && matches.length > 0;
    });
  }

  // Helper methods for pattern detection
  private countFunctionLines(code: string): number {
    const functionPattern = /function\s+\w+\s*\([^)]*\)\s*{([\s\S]*?)}/g;
    let maxLines = 0;
    let match;

    while ((match = functionPattern.exec(code)) !== null) {
      const functionBody = match[1];
      const lines = functionBody.split('\n').length;
      maxLines = Math.max(maxLines, lines);
    }

    return maxLines;
  }

  private calculateMaxNesting(code: string): number {
    let maxNesting = 0;
    let currentNesting = 0;

    for (const char of code) {
      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting--;
      }
    }

    return maxNesting;
  }

  private findDuplicateLines(lines: string[]): string[] {
    const lineCount = new Map<string, number>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5) { // Only consider lines longer than 5 characters
        lineCount.set(trimmed, (lineCount.get(trimmed) || 0) + 1);
      }
    }

    return Array.from(lineCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([line, _]) => line);
  }

  // Issue Generation Methods
  private async generateLongFunctionsIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `long_functions_${Date.now()}`,
      type: 'long_functions',
      severity: 'medium',
      title: 'Long Functions Detected',
      description: 'Functions are too long, making them hard to understand, test, and maintain.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.3,
        readability: 0.2,
        testability: 0.4,
        reusability: 0.3,
        overall: 0.3
      },
      confidence: 0.8,
      tags: ['maintainability', 'readability', 'functions'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Function Design'
      }
    };
  }

  private async generateDeepNestingIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `deep_nesting_${Date.now()}`,
      type: 'deep_nesting',
      severity: 'medium',
      title: 'Deep Nesting Detected',
      description: 'Code has too many nested levels, making it hard to read and understand.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.4,
        readability: 0.1,
        testability: 0.3,
        reusability: 0.2,
        overall: 0.3
      },
      confidence: 0.9,
      tags: ['readability', 'complexity', 'nesting'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Structure'
      }
    };
  }

  private async generateDuplicateCodeIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `duplicate_code_${Date.now()}`,
      type: 'duplicate_code',
      severity: 'high',
      title: 'Duplicate Code Detected',
      description: 'Code contains duplicated logic that should be extracted into reusable functions.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.2,
        readability: 0.3,
        testability: 0.2,
        reusability: 0.1,
        overall: 0.2
      },
      confidence: 0.9,
      tags: ['maintainability', 'duplication', 'refactoring'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Duplication'
      }
    };
  }

  private async generateMagicNumbersIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `magic_numbers_${Date.now()}`,
      type: 'magic_numbers',
      severity: 'low',
      title: 'Magic Numbers Detected',
      description: 'Code contains magic numbers that should be replaced with named constants.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.6,
        readability: 0.5,
        testability: 0.4,
        reusability: 0.3,
        overall: 0.5
      },
      confidence: 0.7,
      tags: ['readability', 'constants', 'maintainability'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Clarity'
      }
    };
  }

  private async generateComplexConditionalsIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `complex_conditionals_${Date.now()}`,
      type: 'complex_conditionals',
      severity: 'medium',
      title: 'Complex Conditionals Detected',
      description: 'Conditional statements are too complex and should be simplified.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.4,
        readability: 0.2,
        testability: 0.3,
        reusability: 0.2,
        overall: 0.3
      },
      confidence: 0.8,
      tags: ['readability', 'complexity', 'conditionals'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Clarity'
      }
    };
  }

  private async generatePoorNamingIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `poor_naming_${Date.now()}`,
      type: 'poor_naming',
      severity: 'medium',
      title: 'Poor Naming Detected',
      description: 'Variable and function names are not descriptive and should be improved.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.5,
        readability: 0.1,
        testability: 0.4,
        reusability: 0.3,
        overall: 0.4
      },
      confidence: 0.8,
      tags: ['readability', 'naming', 'maintainability'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Clarity'
      }
    };
  }

  private async generateMissingDocumentationIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `missing_documentation_${Date.now()}`,
      type: 'missing_documentation',
      severity: 'low',
      title: 'Missing Documentation',
      description: 'Code lacks proper documentation and comments.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.6,
        readability: 0.4,
        testability: 0.5,
        reusability: 0.7,
        overall: 0.6
      },
      confidence: 0.7,
      tags: ['documentation', 'maintainability', 'readability'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Documentation'
      }
    };
  }

  private async generateUnusedVariablesIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `unused_variables_${Date.now()}`,
      type: 'unused_variables',
      severity: 'low',
      title: 'Unused Variables Detected',
      description: 'Code contains unused variables that should be removed.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.7,
        readability: 0.6,
        testability: 0.5,
        reusability: 0.4,
        overall: 0.6
      },
      confidence: 0.9,
      tags: ['cleanup', 'maintainability', 'readability'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Cleanup'
      }
    };
  }

  private async generateDeadCodeIssue(context: QualityContext): Promise<QualityIssue> {
    return {
      id: `dead_code_${Date.now()}`,
      type: 'dead_code',
      severity: 'low',
      title: 'Dead Code Detected',
      description: 'Code contains dead code, debug statements, or TODO comments that should be cleaned up.',
      location: {
        file: context.filePath || 'unknown',
        line: 1,
        column: 1
      },
      code: context.code,
      impact: {
        maintainability: 0.8,
        readability: 0.7,
        testability: 0.6,
        reusability: 0.5,
        overall: 0.7
      },
      confidence: 0.9,
      tags: ['cleanup', 'maintainability', 'readability'],
      metadata: {
        language: context.language,
        framework: context.framework,
        detectedAt: new Date().toISOString(),
        category: 'Code Cleanup'
      }
    };
  }

  private adaptRecommendation(
    template: QualityRecommendation,
    issue: QualityIssue,
    context: QualityContext
  ): QualityRecommendation {
    return {
      ...template,
      id: `${template.id}_${Date.now()}`,
      issueId: issue.id,
      confidence: Math.min(template.confidence, issue.confidence),
      codeFix: this.adaptCodeFix(template.codeFix, issue, context)
    };
  }

  private adaptCodeFix(template: string, issue: QualityIssue, context: QualityContext): string {
    // Simple adaptation - in a real implementation, this would be more sophisticated
    return template.replace('UserData', 'YourDataType')
                  .replace('Item', 'YourItemType')
                  .replace('orderItems', 'yourItems')
                  .replace('cartItems', 'yourOtherItems');
  }

  private applyCodeFix(originalCode: string, recommendation: QualityRecommendation): string {
    // Simple code fix application - in a real implementation, this would be more sophisticated
    return originalCode + '\n// Applied quality improvement: ' + recommendation.title + '\n' + recommendation.codeFix;
  }

  private calculateChanges(originalCode: string, improvedCode: string): string[] {
    const changes: string[] = [];

    if (originalCode !== improvedCode) {
      changes.push('Code structure improved for better quality');
    }

    return changes;
  }

  private validateImprovement(
    issue: QualityIssue,
    recommendation: QualityRecommendation,
    improvedCode: string
  ): string[] {
    const warnings: string[] = [];

    if (recommendation.effort === 'high') {
      warnings.push('High-effort improvement - test thoroughly before deployment');
    }

    if (recommendation.impact.maintainabilityImprovement < 0) {
      warnings.push('Improvement may reduce maintainability');
    }

    return warnings;
  }
}

interface QualityPattern {
  detect: (context: QualityContext) => boolean;
  generate: (context: QualityContext) => Promise<QualityIssue>;
}
