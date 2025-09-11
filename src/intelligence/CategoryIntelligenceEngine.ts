/**
 * Category Intelligence Engine Interface
 *
 * Defines the contract for all category-specific intelligence engines.
 * Each category engine must implement these methods to provide specialized
 * code generation and analysis capabilities.
 */

import { z } from 'zod';
import { CodeGenerationRequest } from './UnifiedCodeIntelligenceEngine.js';

// Context7 data structure
export interface Context7Data {
  insights: {
    patterns: string[];
    recommendations: string[];
    qualityMetrics: {
      overall: number;
      [key: string]: any;
    };
  };
  projectContext?: any;
  technologyInsights?: any;
}

// Code analysis result structure
export interface CodeAnalysis {
  quality: QualityAnalysis;
  maintainability: MaintainabilityAnalysis;
  performance: PerformanceAnalysis;
  security: SecurityAnalysis;
  accessibility?: AccessibilityAnalysis;
  seo?: SEOAnalysis;
  scalability?: ScalabilityAnalysis;
  reliability?: ReliabilityAnalysis;
  devops?: DevOpsAnalysis;
  mobile?: MobileAnalysis;
}

// Quality analysis structure
export interface QualityAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
}

// Maintainability analysis structure
export interface MaintainabilityAnalysis {
  score: number;
  complexity: number;
  readability: number;
  testability: number;
  suggestions: string[];
}

// Performance analysis structure
export interface PerformanceAnalysis {
  score: number;
  bottlenecks: string[];
  optimizations: string[];
  coreWebVitals?: {
    lcp: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
  };
  metrics?: {
    [key: string]: any;
  };
}

// Security analysis structure
export interface SecurityAnalysis {
  score: number;
  vulnerabilities: string[];
  recommendations: string[];
  compliance?: string[];
}

// Accessibility analysis structure
export interface AccessibilityAnalysis {
  score: number;
  wcagLevel: string;
  issues: string[];
  improvements: string[];
}

// SEO analysis structure
export interface SEOAnalysis {
  score: number;
  metaTags: boolean;
  structuredData: boolean;
  semanticHTML: boolean;
  improvements: string[];
}

// Scalability analysis structure
export interface ScalabilityAnalysis {
  score: number;
  patterns: string[];
  bottlenecks: string[];
  recommendations: string[];
}

// Reliability analysis structure
export interface ReliabilityAnalysis {
  score: number;
  errorHandling: number;
  logging: number;
  monitoring: number;
  improvements: string[];
}

// DevOps analysis structure
export interface DevOpsAnalysis {
  containerization?: any;
  orchestration?: any;
  cicd?: any;
  infrastructure?: any;
  reliability?: any;
  overall: number;
}

// Mobile analysis structure
export interface MobileAnalysis {
  performance?: any;
  userExperience?: any;
  platformIntegration?: any;
  security?: any;
  overall: number;
}

// Validation result structure
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Technology insights structure
export interface TechnologyInsights {
  bestPractices: string[];
  antiPatterns: string[];
  frameworks: string[];
  libraries: string[];
  tools: string[];
  trends: string[];
  securityConsiderations: string[];
  performanceConsiderations: string[];
}

/**
 * Base interface for all category-specific intelligence engines
 */
export interface CategoryIntelligenceEngine {
  // Engine identification
  category: string;
  technologies: string[];

  /**
   * Core analysis methods
   */

  // Analyze existing code
  analyzeCode(code: string, technology: string, context: Context7Data): Promise<CodeAnalysis>;

  // Generate new code based on request
  generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string>;

  // Get best practices for the technology
  getBestPractices(technology: string, context: Context7Data): Promise<string[]>;

  // Get anti-patterns to avoid
  getAntiPatterns(technology: string, context: Context7Data): Promise<string[]>;

  /**
   * Quality assurance methods
   */

  // Validate code for correctness and quality
  validateCode(code: string, technology: string): Promise<ValidationResult>;

  // Optimize code for performance and quality
  optimizeCode(code: string, technology: string, context: Context7Data): Promise<string>;

  /**
   * Context7 integration methods
   */

  // Get technology-specific insights from Context7
  getTechnologyInsights(technology: string, context: Context7Data): Promise<TechnologyInsights>;

  // Apply Context7 insights to improve code
  applyContext7Insights(code: string, insights: TechnologyInsights): Promise<string>;
}

/**
 * Base implementation class that provides common functionality
 */
export abstract class BaseCategoryIntelligenceEngine implements CategoryIntelligenceEngine {
  abstract category: string;
  abstract technologies: string[];

  /**
   * Default implementation for getting technology insights
   */
  async getTechnologyInsights(
    technology: string,
    context: Context7Data
  ): Promise<TechnologyInsights> {
    // Extract insights from Context7 data
    const patterns = context.insights?.patterns || [];
    const recommendations = context.insights?.recommendations || [];

    return {
      bestPractices: this.extractBestPractices(patterns, recommendations, technology),
      antiPatterns: this.extractAntiPatterns(patterns, technology),
      frameworks: this.extractFrameworks(context, technology),
      libraries: this.extractLibraries(context, technology),
      tools: this.extractTools(context, technology),
      trends: this.extractTrends(context, technology),
      securityConsiderations: this.extractSecurityConsiderations(recommendations, technology),
      performanceConsiderations: this.extractPerformanceConsiderations(recommendations, technology),
    };
  }

  /**
   * Apply Context7 insights to improve generated code
   */
  async applyContext7Insights(code: string, insights: TechnologyInsights): Promise<string> {
    let improvedCode = code;

    // Apply best practices
    for (const practice of insights.bestPractices) {
      improvedCode = await this.applyBestPractice(improvedCode, practice);
    }

    // Remove anti-patterns
    for (const antiPattern of insights.antiPatterns) {
      improvedCode = await this.removeAntiPattern(improvedCode, antiPattern);
    }

    // Apply security considerations
    for (const security of insights.securityConsiderations) {
      improvedCode = await this.applySecurityConsideration(improvedCode, security);
    }

    // Apply performance optimizations
    for (const performance of insights.performanceConsiderations) {
      improvedCode = await this.applyPerformanceOptimization(improvedCode, performance);
    }

    return improvedCode;
  }

  // Abstract methods to be implemented by specific engines
  abstract analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<CodeAnalysis>;
  abstract generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string>;
  abstract getBestPractices(technology: string, context: Context7Data): Promise<string[]>;
  abstract getAntiPatterns(technology: string, context: Context7Data): Promise<string[]>;
  abstract validateCode(code: string, technology: string): Promise<ValidationResult>;
  abstract optimizeCode(code: string, technology: string, context: Context7Data): Promise<string>;

  // Protected helper methods for derived classes
  protected extractBestPractices(
    patterns: string[],
    recommendations: string[],
    technology: string
  ): string[] {
    const practices: string[] = [];

    // Extract technology-specific best practices from patterns and recommendations
    for (const pattern of patterns) {
      if (pattern.toLowerCase().includes(technology.toLowerCase()) && pattern.includes('best')) {
        practices.push(pattern);
      }
    }

    for (const rec of recommendations) {
      if (rec.toLowerCase().includes(technology.toLowerCase())) {
        practices.push(rec);
      }
    }

    return practices;
  }

  protected extractAntiPatterns(patterns: string[], _technology: string): string[] {
    const antiPatterns: string[] = [];

    // Extract technology-specific anti-patterns
    for (const pattern of patterns) {
      if (
        pattern.toLowerCase().includes(_technology.toLowerCase()) &&
        (pattern.includes('avoid') || pattern.includes('anti') || pattern.includes('bad'))
      ) {
        antiPatterns.push(pattern);
      }
    }

    return antiPatterns;
  }

  protected extractFrameworks(context: Context7Data, _technology: string): string[] {
    // Extract framework information from context
    const frameworks: string[] = [];

    if (context.technologyInsights?.frameworks) {
      frameworks.push(...context.technologyInsights.frameworks);
    }

    return frameworks;
  }

  protected extractLibraries(context: Context7Data, _technology: string): string[] {
    // Extract library information from context
    const libraries: string[] = [];

    if (context.technologyInsights?.libraries) {
      libraries.push(...context.technologyInsights.libraries);
    }

    return libraries;
  }

  protected extractTools(context: Context7Data, _technology: string): string[] {
    // Extract tool information from context
    const tools: string[] = [];

    if (context.technologyInsights?.tools) {
      tools.push(...context.technologyInsights.tools);
    }

    return tools;
  }

  protected extractTrends(context: Context7Data, _technology: string): string[] {
    // Extract trend information from context
    const trends: string[] = [];

    if (context.technologyInsights?.trends) {
      trends.push(...context.technologyInsights.trends);
    }

    return trends;
  }

  protected extractSecurityConsiderations(recommendations: string[], _technology: string): string[] {
    const security: string[] = [];

    // Extract security-related recommendations
    for (const rec of recommendations) {
      if (
        rec.toLowerCase().includes('security') ||
        rec.toLowerCase().includes('vulnerability') ||
        rec.toLowerCase().includes('auth')
      ) {
        security.push(rec);
      }
    }

    return security;
  }

  protected extractPerformanceConsiderations(
    recommendations: string[],
    _technology: string
  ): string[] {
    const performance: string[] = [];

    // Extract performance-related recommendations
    for (const rec of recommendations) {
      if (
        rec.toLowerCase().includes('performance') ||
        rec.toLowerCase().includes('optimization') ||
        rec.toLowerCase().includes('speed') ||
        rec.toLowerCase().includes('efficiency')
      ) {
        performance.push(rec);
      }
    }

    return performance;
  }

  // Protected methods for applying improvements
  protected async applyBestPractice(code: string, _practice: string): Promise<string> {
    // Base implementation - override in specific engines
    return code;
  }

  protected async removeAntiPattern(code: string, _antiPattern: string): Promise<string> {
    // Base implementation - override in specific engines
    return code;
  }

  protected async applySecurityConsideration(code: string, _security: string): Promise<string> {
    // Base implementation - override in specific engines
    return code;
  }

  protected async applyPerformanceOptimization(code: string, _performance: string): Promise<string> {
    // Base implementation - override in specific engines
    return code;
  }
}
