/**
 * Quality Assurance Engine
 *
 * Enhanced unified quality assurance system that analyzes and scores code across
 * all categories and technologies. Provides consistent quality metrics,
 * improvement recommendations, trend analysis, and quality benchmarking.
 *
 * Phase 2 Enhancement: Task 2.4.1 Implementation
 */

import { z } from 'zod';
import { globalPerformanceCache } from './PerformanceCache.js';
import { globalErrorHandler } from './ErrorHandling.js';

// Quality score structure (enhanced for Phase 2)
export interface QualityScore {
  overall: number;
  message?: string;
  breakdown?: QualityBreakdown;
  recommendations?: string[];
  timestamp: string;
  grade?: QualityGrade;
  trend?: QualityTrend;
  benchmark?: QualityBenchmark;
  compliance?: ComplianceStatus;
  metrics?: QualityMetrics;
}

// Quality grade classification
export interface QualityGrade {
  letter: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  description: string;
  color: string;
}

// Quality trend analysis
export interface QualityTrend {
  direction: 'improving' | 'stable' | 'declining';
  change: number; // percentage change
  confidence: number; // 0-100
  previousScore?: number;
  improvementAreas: string[];
  regressionAreas: string[];
}

// Quality benchmark comparison
export interface QualityBenchmark {
  industryAverage: number;
  categoryAverage: number;
  percentile: number;
  ranking: 'excellent' | 'above-average' | 'average' | 'below-average' | 'poor';
  comparison: {
    vsIndustry: number;
    vsCategory: number;
  };
}

// Compliance status
export interface ComplianceStatus {
  standards: ComplianceStandard[];
  overallCompliance: number;
  criticalIssues: number;
  warnings: number;
}

// Individual compliance standard
export interface ComplianceStandard {
  name: string;
  version: string;
  compliant: boolean;
  score: number;
  issues: string[];
  requirements: string[];
}

// Advanced quality metrics
export interface QualityMetrics {
  codeHealthScore: number;
  technicalDebtRatio: number;
  maintainabilityIndex: number;
  duplicationPercentage: number;
  testCoverage?: number;
  complexityScore: number;
  documentationCoverage: number;
  securityRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceRisk: 'low' | 'medium' | 'high' | 'critical';
}

// Quality breakdown structure
export interface QualityBreakdown {
  maintainability: number;
  performance: number;
  security: number;
  reliability: number;
  usability: number;
  accessibility?: number;
  seo?: number;
  scalability?: number;
  apiDesign?: number;
  queryOptimization?: number;
  dataIntegrity?: number;
}

// Quality thresholds (enhanced)
const QUALITY_THRESHOLDS = {
  excellent: 90,
  good: 80,
  acceptable: 70,
  needsImprovement: 60,
  poor: 50,
};

// Industry benchmarks by category
const INDUSTRY_BENCHMARKS = {
  frontend: {
    average: 78,
    good: 85,
    excellent: 92,
  },
  backend: {
    average: 82,
    good: 88,
    excellent: 94,
  },
  database: {
    average: 80,
    good: 87,
    excellent: 93,
  },
  devops: {
    average: 75,
    good: 83,
    excellent: 90,
  },
  mobile: {
    average: 77,
    good: 84,
    excellent: 91,
  },
  generic: {
    average: 79,
    good: 86,
    excellent: 92,
  },
};

// Compliance standards definitions
const COMPLIANCE_STANDARDS = {
  frontend: [
    { name: 'WCAG', version: '2.1 AA', requirements: ['aria-labels', 'semantic-html', 'keyboard-navigation'] },
    { name: 'W3C HTML5', version: '5.0', requirements: ['valid-markup', 'semantic-elements'] },
    { name: 'Performance', version: 'Core Web Vitals', requirements: ['lcp', 'fid', 'cls'] },
  ],
  backend: [
    { name: 'OWASP', version: 'Top 10 2021', requirements: ['input-validation', 'authentication', 'error-handling'] },
    { name: 'REST API', version: 'OpenAPI 3.0', requirements: ['http-methods', 'status-codes', 'documentation'] },
    { name: 'Security', version: 'NIST', requirements: ['encryption', 'access-control', 'audit-logging'] },
  ],
  database: [
    { name: 'ACID', version: '1.0', requirements: ['atomicity', 'consistency', 'isolation', 'durability'] },
    { name: 'SQL Standards', version: 'ISO/IEC 9075', requirements: ['normalized-schema', 'referential-integrity'] },
    { name: 'Security', version: 'GDPR/CCPA', requirements: ['data-protection', 'audit-trails', 'encryption'] },
  ],
  generic: [
    { name: 'Clean Code', version: 'Martin 2008', requirements: ['readable-naming', 'small-functions', 'comments'] },
    { name: 'SOLID', version: '1.0', requirements: ['single-responsibility', 'open-closed', 'dependency-inversion'] },
  ],
};

// Historical quality data storage interface
interface QualityHistoryEntry {
  timestamp: string;
  score: number;
  category: string;
  codeHash: string;
}

/**
 * Engine for unified quality assurance across all code types (Enhanced Phase 2)
 */
export class QualityAssuranceEngine {
  private qualityHistory: QualityHistoryEntry[] = [];
  private maxHistorySize = 1000;
  /**
   * Enhanced analyze method with comprehensive quality assessment (Phase 2)
   */
  async analyze(code: string, category: string): Promise<QualityScore> {
    const startTime = Date.now();

    try {
      return await globalErrorHandler.executeAnalysisOperation(
        'quality-analysis',
        async () => {
          return await globalPerformanceCache.cacheCodeAnalysis(
            code,
            category,
            async () => {
              // Perform comprehensive quality analysis
              const breakdown = await this.performQualityAnalysis(code, category);

              // Calculate overall score
              const overall = this.calculateOverallScore(breakdown);

              // Enhanced Phase 2 features
              const grade = this.calculateQualityGrade(overall);
              const trend = await this.analyzeQualityTrend(code, category, overall);
              const benchmark = this.calculateBenchmark(overall, category);
              const compliance = await this.assessCompliance(code, category);
              const metrics = await this.calculateAdvancedMetrics(code, breakdown);

              // Generate enhanced recommendations
              const recommendations = this.generateEnhancedRecommendations(breakdown, category, compliance, metrics);

              // Determine quality message
              const message = this.getEnhancedQualityMessage(overall, grade, trend);

              // Store in history for trend analysis
              this.addToHistory(code, category, overall);

              const result: QualityScore = {
                overall,
                message,
                breakdown,
                recommendations,
                timestamp: new Date().toISOString(),
                grade,
                trend,
                benchmark,
                compliance,
                metrics,
              };

              return result;
            }
          );
        },
        // Fallback for quality analysis errors
        async () => {
          console.warn('[QualityAssuranceEngine] Using fallback quality analysis');
          return {
            overall: 70,
            message: 'Quality analysis failed, using fallback assessment',
            timestamp: new Date().toISOString(),
            grade: this.calculateQualityGrade(70),
          };
        }
      );
    } catch (error) {
      console.error('[QualityAssuranceEngine] Critical error in quality analysis:', error);

      return {
        overall: 0,
        message: 'Unable to analyze code quality due to a critical error',
        timestamp: new Date().toISOString(),
        grade: this.calculateQualityGrade(0),
      };
    }
  }

  /**
   * Perform comprehensive quality analysis
   */
  private async performQualityAnalysis(code: string, category: string): Promise<QualityBreakdown> {
    // Base quality metrics for all categories
    const analysis: QualityBreakdown = {
      maintainability: await this.analyzeMaintainability(code),
      performance: await this.analyzePerformance(code),
      security: await this.analyzeSecurity(code),
      reliability: await this.analyzeReliability(code),
      usability: await this.analyzeUsability(code),
    };

    // Add category-specific analysis
    switch (category) {
      case 'frontend':
        analysis.accessibility = await this.analyzeAccessibility(code);
        analysis.seo = await this.analyzeSEO(code);
        break;

      case 'backend':
        analysis.scalability = await this.analyzeScalability(code);
        analysis.apiDesign = await this.analyzeAPIDesign(code);
        break;

      case 'database':
        analysis.queryOptimization = await this.analyzeQueryOptimization(code);
        analysis.dataIntegrity = await this.analyzeDataIntegrity(code);
        break;

      case 'devops':
        analysis.scalability = await this.analyzeScalability(code);
        break;

      case 'mobile':
        analysis.accessibility = await this.analyzeAccessibility(code);
        analysis.usability = Math.min(100, analysis.usability + 10); // Mobile UX bonus
        break;

      case 'datascience':
        analysis.performance = Math.min(100, analysis.performance + 5); // Performance is critical
        break;
    }

    return analysis;
  }

  /**
   * Analyze maintainability aspects
   */
  private async analyzeMaintainability(code: string): Promise<number> {
    let score = 100;
    const lines = code.split('\n');

    // Check code length
    if (lines.length > 500) score -= 10;
    if (lines.length > 1000) score -= 10;

    // Check line length
    const longLines = lines.filter(line => line.length > 120).length;
    if (longLines > lines.length * 0.1) score -= 10;

    // Check nesting depth
    const maxNesting = this.calculateMaxNesting(code);
    if (maxNesting > 3) score -= 5;
    if (maxNesting > 5) score -= 10;

    // Check function complexity
    const complexity = this.calculateComplexity(code);
    if (complexity > 10) score -= 10;
    if (complexity > 20) score -= 15;

    // Check for documentation
    const hasComments = code.includes('//') || code.includes('/*') || code.includes('#');
    if (!hasComments) score -= 15;

    // Check for consistent indentation
    const hasInconsistentIndentation = this.checkIndentationConsistency(lines);
    if (hasInconsistentIndentation) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Analyze performance aspects
   */
  private async analyzePerformance(code: string): Promise<number> {
    let score = 90; // Base performance score

    // Check for performance anti-patterns
    const antiPatterns = [
      { pattern: /forEach.*await/s, penalty: 15, reason: 'Async in forEach' },
      { pattern: /for.*in\s+/, penalty: 5, reason: 'for...in loop' },
      { pattern: /document\.write/g, penalty: 20, reason: 'document.write usage' },
      { pattern: /eval\s*\(/g, penalty: 25, reason: 'eval usage' },
      { pattern: /innerHTML\s*\+=/g, penalty: 10, reason: 'innerHTML concatenation' },
      { pattern: /SELECT\s+\*/gi, penalty: 10, reason: 'SELECT * query' },
      { pattern: /N\+1/gi, penalty: 20, reason: 'N+1 query pattern' },
    ];

    for (const { pattern, penalty } of antiPatterns) {
      if (pattern.test(code)) {
        score -= penalty;
      }
    }

    // Check for performance best practices
    const bestPractices = [
      { pattern: /Promise\.all/g, bonus: 5, reason: 'Parallel processing' },
      { pattern: /\.memo|useMemo|useCallback/g, bonus: 5, reason: 'Memoization' },
      { pattern: /lazy|Lazy|Suspense/g, bonus: 5, reason: 'Lazy loading' },
      { pattern: /cache|Cache/g, bonus: 5, reason: 'Caching implementation' },
      { pattern: /INDEX|index.*ON/gi, bonus: 5, reason: 'Database indexing' },
    ];

    for (const { pattern, bonus } of bestPractices) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze security aspects
   */
  private async analyzeSecurity(code: string): Promise<number> {
    let score = 95; // Base security score

    // Check for security vulnerabilities
    const vulnerabilities = [
      { pattern: /innerHTML\s*=\s*[^`'"]/, penalty: 20, reason: 'Potential XSS' },
      { pattern: /eval\s*\(/g, penalty: 30, reason: 'eval usage' },
      { pattern: /Function\s*\(/g, penalty: 25, reason: 'Function constructor' },
      { pattern: /password.*=.*["'][^"']+["']/i, penalty: 35, reason: 'Hardcoded password' },
      { pattern: /api[_-]?key.*=.*["'][^"']+["']/i, penalty: 35, reason: 'Hardcoded API key' },
      { pattern: /SELECT.*FROM.*WHERE.*\+/gi, penalty: 25, reason: 'SQL injection risk' },
      { pattern: /exec\s*\(/g, penalty: 20, reason: 'Command injection risk' },
      { pattern: /crypto\.pseudoRandomBytes/g, penalty: 15, reason: 'Weak randomness' },
      { pattern: /md5|sha1/gi, penalty: 10, reason: 'Weak hashing algorithm' },
    ];

    for (const { pattern, penalty } of vulnerabilities) {
      if (pattern.test(code)) {
        score -= penalty;
      }
    }

    // Check for security best practices
    const securityPractices = [
      { pattern: /bcrypt|argon2|scrypt/gi, bonus: 5, reason: 'Strong hashing' },
      { pattern: /helmet|cors|csrf/gi, bonus: 5, reason: 'Security middleware' },
      { pattern: /sanitize|escape|validate/gi, bonus: 5, reason: 'Input validation' },
      { pattern: /https:|wss:/gi, bonus: 3, reason: 'Secure protocols' },
      {
        pattern: /prepared.*statement|parameterized/gi,
        bonus: 10,
        reason: 'SQL injection prevention',
      },
    ];

    for (const { pattern, bonus } of securityPractices) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze reliability aspects
   */
  private async analyzeReliability(code: string): Promise<number> {
    let score = 85; // Base reliability score

    // Check for error handling
    const hasTryCatch = /try\s*{/.test(code);
    const hasCatch = /catch\s*\(/.test(code);
    const hasErrorHandling = hasTryCatch && hasCatch;

    if (!hasErrorHandling) score -= 20;

    // Check for logging
    const hasLogging = /console\.(log|error|warn)|logger\.|log\./gi.test(code);
    if (!hasLogging) score -= 10;

    // Check for validation
    const hasValidation = /validate|check|verify|assert/gi.test(code);
    if (hasValidation) score += 5;

    // Check for null/undefined checks
    const hasNullChecks = /!==\s*(null|undefined)|!=\s*(null|undefined)|\?\?|\?\./.test(code);
    if (hasNullChecks) score += 5;

    // Check for timeout handling
    const hasTimeout = /timeout|setTimeout|deadline/gi.test(code);
    if (hasTimeout) score += 3;

    // Check for retry logic
    const hasRetry = /retry|attempt|backoff/gi.test(code);
    if (hasRetry) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze usability aspects
   */
  private async analyzeUsability(code: string): Promise<number> {
    let score = 80; // Base usability score

    // Check for clear naming
    const hasDescriptiveNames = !/[a-z]\d{1}[^a-zA-Z]/g.test(code); // No single letter vars
    if (hasDescriptiveNames) score += 5;

    // Check for documentation
    const hasDocComments = /\/\*\*|\"\"\"|'''/g.test(code);
    if (hasDocComments) score += 10;

    // Check for consistent formatting
    const lines = code.split('\n');
    const hasConsistentIndentation = !this.checkIndentationConsistency(lines);
    if (hasConsistentIndentation) score += 5;

    // Check for modularity
    const functionCount = (code.match(/function|def|func|method/gi) || []).length;
    const classCount = (code.match(/class\s+\w+/gi) || []).length;
    const hasModularStructure = functionCount > 1 || classCount > 0;
    if (hasModularStructure) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze accessibility (for frontend/mobile)
   */
  private async analyzeAccessibility(code: string): Promise<number> {
    let score = 75; // Base accessibility score

    // Check for accessibility attributes
    const accessibilityPatterns = [
      { pattern: /aria-|role=/gi, bonus: 10, reason: 'ARIA attributes' },
      { pattern: /alt\s*=/gi, bonus: 5, reason: 'Alt text' },
      { pattern: /tabindex/gi, bonus: 3, reason: 'Keyboard navigation' },
      { pattern: /label.*for=/gi, bonus: 5, reason: 'Form labels' },
      { pattern: /<h[1-6]/gi, bonus: 3, reason: 'Semantic headings' },
      { pattern: /<nav|<main|<article|<section/gi, bonus: 5, reason: 'Semantic HTML' },
    ];

    for (const { pattern, bonus } of accessibilityPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    // Check for accessibility anti-patterns
    const antiPatterns = [
      { pattern: /onclick\s*=\s*["'](?!.*key)/gi, penalty: 5, reason: 'Click without keyboard' },
      { pattern: /<div.*onclick/gi, penalty: 5, reason: 'Non-semantic clickable' },
      {
        pattern: /color:\s*#[0-9a-f]{3,6}(?!.*contrast)/gi,
        penalty: 3,
        reason: 'Color without contrast check',
      },
    ];

    for (const { pattern, penalty } of antiPatterns) {
      if (pattern.test(code)) {
        score -= penalty;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze SEO (for frontend)
   */
  private async analyzeSEO(code: string): Promise<number> {
    let score = 70; // Base SEO score

    // Check for SEO elements
    const seoPatterns = [
      { pattern: /<title>/gi, bonus: 10, reason: 'Page title' },
      { pattern: /meta.*description/gi, bonus: 10, reason: 'Meta description' },
      { pattern: /meta.*keywords/gi, bonus: 5, reason: 'Meta keywords' },
      { pattern: /og:|twitter:/gi, bonus: 5, reason: 'Social media tags' },
      { pattern: /schema\.org|json-ld/gi, bonus: 10, reason: 'Structured data' },
      { pattern: /<h1/gi, bonus: 5, reason: 'H1 heading' },
      { pattern: /canonical/gi, bonus: 5, reason: 'Canonical URL' },
      { pattern: /sitemap/gi, bonus: 3, reason: 'Sitemap reference' },
    ];

    for (const { pattern, bonus } of seoPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze scalability (for backend/devops)
   */
  private async analyzeScalability(code: string): Promise<number> {
    let score = 75; // Base scalability score

    // Check for scalability patterns
    const scalabilityPatterns = [
      { pattern: /cache|redis|memcached/gi, bonus: 10, reason: 'Caching' },
      { pattern: /queue|rabbit|kafka|sqs/gi, bonus: 10, reason: 'Message queues' },
      { pattern: /pool|connection.*pool/gi, bonus: 5, reason: 'Connection pooling' },
      { pattern: /cluster|replicas?|shard/gi, bonus: 8, reason: 'Clustering/Sharding' },
      { pattern: /load.*balanc|nginx|haproxy/gi, bonus: 5, reason: 'Load balancing' },
      { pattern: /async|await|promise/gi, bonus: 5, reason: 'Async processing' },
      { pattern: /stream|chunk/gi, bonus: 5, reason: 'Streaming' },
    ];

    for (const { pattern, bonus } of scalabilityPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    // Check for scalability anti-patterns
    const antiPatterns = [
      { pattern: /global\s+\w+\s*=/g, penalty: 5, reason: 'Global state' },
      { pattern: /singleton/gi, penalty: 3, reason: 'Singleton pattern' },
      { pattern: /SELECT.*JOIN.*JOIN.*JOIN/gi, penalty: 10, reason: 'Complex joins' },
    ];

    for (const { pattern, penalty } of antiPatterns) {
      if (pattern.test(code)) {
        score -= penalty;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze API design (for backend)
   */
  private async analyzeAPIDesign(code: string): Promise<number> {
    let score = 75; // Base API design score

    // Check for RESTful patterns
    const restPatterns = [
      { pattern: /GET|POST|PUT|DELETE|PATCH/g, bonus: 5, reason: 'REST methods' },
      { pattern: /\/api\/v\d+/gi, bonus: 5, reason: 'API versioning' },
      { pattern: /status\s*\(\s*\d{3}/g, bonus: 3, reason: 'HTTP status codes' },
      { pattern: /application\/json/gi, bonus: 3, reason: 'JSON content type' },
      { pattern: /swagger|openapi/gi, bonus: 10, reason: 'API documentation' },
    ];

    for (const { pattern, bonus } of restPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    // Check for GraphQL patterns
    if (/graphql|query|mutation|resolver/gi.test(code)) {
      score += 10;
    }

    // Check for validation
    if (/validate|schema|joi|yup|zod/gi.test(code)) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze query optimization (for database)
   */
  private async analyzeQueryOptimization(code: string): Promise<number> {
    let score = 80; // Base query optimization score

    // Check for optimization patterns
    const optimizationPatterns = [
      { pattern: /INDEX|CREATE\s+INDEX/gi, bonus: 10, reason: 'Indexing' },
      { pattern: /EXPLAIN|ANALYZE/gi, bonus: 5, reason: 'Query analysis' },
      { pattern: /LIMIT\s+\d+/gi, bonus: 3, reason: 'Result limiting' },
      { pattern: /JOIN.*ON.*=/gi, bonus: 3, reason: 'Proper joins' },
    ];

    for (const { pattern, bonus } of optimizationPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    // Check for anti-patterns
    const antiPatterns = [
      { pattern: /SELECT\s+\*/gi, penalty: 10, reason: 'SELECT *' },
      { pattern: /NOT\s+IN\s*\(/gi, penalty: 5, reason: 'NOT IN subquery' },
      { pattern: /LIKE\s+['"]%/gi, penalty: 5, reason: 'Leading wildcard' },
      { pattern: /ORDER\s+BY\s+RAND/gi, penalty: 15, reason: 'ORDER BY RAND()' },
    ];

    for (const { pattern, penalty } of antiPatterns) {
      if (pattern.test(code)) {
        score -= penalty;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze data integrity (for database)
   */
  private async analyzeDataIntegrity(code: string): Promise<number> {
    let score = 80; // Base data integrity score

    // Check for integrity patterns
    const integrityPatterns = [
      { pattern: /CONSTRAINT|CHECK|UNIQUE/gi, bonus: 8, reason: 'Constraints' },
      { pattern: /FOREIGN\s+KEY/gi, bonus: 8, reason: 'Foreign keys' },
      { pattern: /TRANSACTION|BEGIN|COMMIT|ROLLBACK/gi, bonus: 10, reason: 'Transactions' },
      { pattern: /PRIMARY\s+KEY/gi, bonus: 5, reason: 'Primary keys' },
      { pattern: /NOT\s+NULL/gi, bonus: 3, reason: 'Not null constraints' },
      { pattern: /TRIGGER/gi, bonus: 5, reason: 'Triggers' },
    ];

    for (const { pattern, bonus } of integrityPatterns) {
      if (pattern.test(code)) {
        score += bonus;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(breakdown: QualityBreakdown): number {
    const scores = Object.values(breakdown);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;

    // Round to nearest integer
    return Math.round(average);
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateRecommendations(breakdown: QualityBreakdown, category: string): string[] {
    const recommendations: string[] = [];

    // Maintainability recommendations
    if (breakdown.maintainability < 70) {
      recommendations.push(
        'Improve code maintainability by reducing complexity and adding documentation'
      );
    }

    // Performance recommendations
    if (breakdown.performance < 70) {
      recommendations.push(
        'Optimize performance by addressing bottlenecks and implementing caching'
      );
    }

    // Security recommendations
    if (breakdown.security < 80) {
      recommendations.push(
        'Enhance security by validating inputs and using secure coding practices'
      );
    }

    // Reliability recommendations
    if (breakdown.reliability < 75) {
      recommendations.push('Improve reliability by adding error handling and logging');
    }

    // Category-specific recommendations
    if (category === 'frontend') {
      if (breakdown.accessibility && breakdown.accessibility < 80) {
        recommendations.push('Improve accessibility by adding ARIA attributes and semantic HTML');
      }
      if (breakdown.seo && breakdown.seo < 70) {
        recommendations.push('Enhance SEO by adding meta tags and structured data');
      }
    }

    if (category === 'backend') {
      if (breakdown.scalability && breakdown.scalability < 75) {
        recommendations.push('Improve scalability by implementing caching and async processing');
      }
      if (breakdown.apiDesign && breakdown.apiDesign < 75) {
        recommendations.push(
          'Enhance API design by following REST principles and adding documentation'
        );
      }
    }

    if (category === 'database') {
      if (breakdown.queryOptimization && breakdown.queryOptimization < 80) {
        recommendations.push('Optimize queries by adding indexes and avoiding SELECT *');
      }
      if (breakdown.dataIntegrity && breakdown.dataIntegrity < 80) {
        recommendations.push('Enhance data integrity by adding constraints and using transactions');
      }
    }

    // Limit to top 5 recommendations
    return recommendations.slice(0, 5);
  }

  /**
   * Get quality message based on score
   */
  private getQualityMessage(score: number): string {
    if (score >= QUALITY_THRESHOLDS.excellent) {
      return 'Excellent code quality! Meets all best practices and standards.';
    } else if (score >= QUALITY_THRESHOLDS.good) {
      return 'Good code quality. Minor improvements could enhance the code further.';
    } else if (score >= QUALITY_THRESHOLDS.acceptable) {
      return 'Acceptable code quality. Consider addressing the recommendations for improvement.';
    } else if (score >= QUALITY_THRESHOLDS.needsImprovement) {
      return 'Code quality needs improvement. Please review and address the recommendations.';
    } else {
      return 'Poor code quality. Significant improvements required to meet standards.';
    }
  }

  /**
   * Helper: Calculate maximum nesting depth
   */
  private calculateMaxNesting(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  /**
   * Helper: Calculate cyclomatic complexity
   */
  private calculateComplexity(code: string): number {
    let complexity = 1;

    // Count decision points
    const patterns = [
      /if\s*\(/g,
      /else\s+if/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*[^:]+:/g, // ternary
    ];

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Helper: Check indentation consistency
   */
  private checkIndentationConsistency(lines: string[]): boolean {
    const indentations = new Set<number>();

    for (const line of lines) {
      const match = line.match(/^(\s+)/);
      if (match) {
        indentations.add(match[1].length);
      }
    }

    // Check if indentations follow a pattern (e.g., multiples of 2 or 4)
    const indentArray = Array.from(indentations).sort((a, b) => a - b);
    if (indentArray.length <= 1) return false;

    const baseIndent = indentArray[1] - indentArray[0];
    for (let i = 2; i < indentArray.length; i++) {
      const diff = indentArray[i] - indentArray[i - 1];
      if (diff !== baseIndent && diff !== 0) {
        return true; // Inconsistent
      }
    }

    return false; // Consistent
  }

  /**
   * Enhanced Phase 2 Methods
   */

  /**
   * Calculate quality grade based on score
   */
  private calculateQualityGrade(score: number): QualityGrade {
    if (score >= 95) {
      return { letter: 'A+', description: 'Exceptional Quality', color: '#00C851' };
    } else if (score >= 90) {
      return { letter: 'A', description: 'Excellent Quality', color: '#2BBBAD' };
    } else if (score >= 85) {
      return { letter: 'B+', description: 'Very Good Quality', color: '#4285F4' };
    } else if (score >= 80) {
      return { letter: 'B', description: 'Good Quality', color: '#AA66CC' };
    } else if (score >= 75) {
      return { letter: 'C+', description: 'Above Average Quality', color: '#FFBB33' };
    } else if (score >= 70) {
      return { letter: 'C', description: 'Average Quality', color: '#FF8800' };
    } else if (score >= 60) {
      return { letter: 'D', description: 'Below Average Quality', color: '#FF4444' };
    } else {
      return { letter: 'F', description: 'Poor Quality', color: '#CC0000' };
    }
  }

  /**
   * Analyze quality trend compared to previous assessments
   */
  private async analyzeQualityTrend(code: string, category: string, currentScore: number): Promise<QualityTrend> {
    const codeHash = this.generateCodeHash(code);
    const recentHistory = this.qualityHistory
      .filter(entry => entry.category === category)
      .slice(-5); // Last 5 assessments

    if (recentHistory.length === 0) {
      return {
        direction: 'stable',
        change: 0,
        confidence: 50,
        improvementAreas: [],
        regressionAreas: [],
      };
    }

    const previousScore = recentHistory[recentHistory.length - 1].score;
    const change = ((currentScore - previousScore) / previousScore) * 100;

    let direction: 'improving' | 'stable' | 'declining';
    if (Math.abs(change) < 2) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'improving';
    } else {
      direction = 'declining';
    }

    // Calculate confidence based on consistency of trend
    const scores = recentHistory.map(h => h.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / scores.length;
    const confidence = Math.max(0, Math.min(100, 100 - variance));

    return {
      direction,
      change: Math.round(change * 100) / 100,
      confidence: Math.round(confidence),
      previousScore,
      improvementAreas: direction === 'improving' ? ['overall quality'] : [],
      regressionAreas: direction === 'declining' ? ['overall quality'] : [],
    };
  }

  /**
   * Calculate benchmark comparison
   */
  private calculateBenchmark(score: number, category: string): QualityBenchmark {
    const benchmarks = INDUSTRY_BENCHMARKS[category as keyof typeof INDUSTRY_BENCHMARKS] || INDUSTRY_BENCHMARKS.generic;

    // Calculate percentile (simplified model)
    let percentile: number;
    if (score >= benchmarks.excellent) {
      percentile = 90 + ((score - benchmarks.excellent) / (100 - benchmarks.excellent)) * 10;
    } else if (score >= benchmarks.good) {
      percentile = 70 + ((score - benchmarks.good) / (benchmarks.excellent - benchmarks.good)) * 20;
    } else if (score >= benchmarks.average) {
      percentile = 40 + ((score - benchmarks.average) / (benchmarks.good - benchmarks.average)) * 30;
    } else {
      percentile = (score / benchmarks.average) * 40;
    }

    percentile = Math.max(0, Math.min(100, Math.round(percentile)));

    let ranking: 'excellent' | 'above-average' | 'average' | 'below-average' | 'poor';
    if (percentile >= 90) ranking = 'excellent';
    else if (percentile >= 70) ranking = 'above-average';
    else if (percentile >= 40) ranking = 'average';
    else if (percentile >= 20) ranking = 'below-average';
    else ranking = 'poor';

    return {
      industryAverage: benchmarks.average,
      categoryAverage: benchmarks.average,
      percentile,
      ranking,
      comparison: {
        vsIndustry: Math.round((score - benchmarks.average) * 100) / 100,
        vsCategory: Math.round((score - benchmarks.average) * 100) / 100,
      },
    };
  }

  /**
   * Assess compliance with industry standards
   */
  private async assessCompliance(code: string, category: string): Promise<ComplianceStatus> {
    const standards = COMPLIANCE_STANDARDS[category as keyof typeof COMPLIANCE_STANDARDS] || COMPLIANCE_STANDARDS.generic;
    const complianceResults: ComplianceStandard[] = [];
    let totalScore = 0;
    let criticalIssues = 0;
    let warnings = 0;

    for (const standard of standards) {
      const compliance = await this.checkStandardCompliance(code, standard, category);
      complianceResults.push(compliance);
      totalScore += compliance.score;

      if (!compliance.compliant && compliance.score < 50) {
        criticalIssues++;
      } else if (!compliance.compliant) {
        warnings++;
      }
    }

    const overallCompliance = Math.round(totalScore / standards.length);

    return {
      standards: complianceResults,
      overallCompliance,
      criticalIssues,
      warnings,
    };
  }

  /**
   * Check compliance with a specific standard
   */
  private async checkStandardCompliance(code: string, standard: any, category: string): Promise<ComplianceStandard> {
    let score = 100;
    const issues: string[] = [];

    // Check requirements based on standard name
    switch (standard.name) {
      case 'WCAG':
        if (!code.includes('aria-') && !code.includes('role=')) {
          issues.push('Missing ARIA attributes for accessibility');
          score -= 25;
        }
        if (!/<(nav|main|section|article|header|footer)/.test(code)) {
          issues.push('Missing semantic HTML elements');
          score -= 20;
        }
        break;

      case 'OWASP':
        if (/password.*=.*["'][^"']+["']/i.test(code)) {
          issues.push('Hardcoded credentials detected');
          score -= 40;
        }
        if (/innerHTML\s*=\s*[^`'"]/.test(code)) {
          issues.push('Potential XSS vulnerability');
          score -= 30;
        }
        break;

      case 'Clean Code':
        if (!/\/\*|\/\/|#/.test(code)) {
          issues.push('Insufficient code documentation');
          score -= 15;
        }
        if (this.calculateComplexity(code) > 10) {
          issues.push('High cyclomatic complexity');
          score -= 20;
        }
        break;

      case 'ACID':
        if (!/TRANSACTION|BEGIN|COMMIT/gi.test(code)) {
          issues.push('Missing transaction management');
          score -= 25;
        }
        break;
    }

    return {
      name: standard.name,
      version: standard.version,
      compliant: score >= 80,
      score: Math.max(0, score),
      issues,
      requirements: standard.requirements,
    };
  }

  /**
   * Calculate advanced quality metrics
   */
  private async calculateAdvancedMetrics(code: string, breakdown: QualityBreakdown): Promise<QualityMetrics> {
    const lines = code.split('\n');
    const totalLines = lines.length;

    // Code health score (weighted average of key metrics)
    const codeHealthScore = Math.round(
      (breakdown.maintainability * 0.3) +
      (breakdown.reliability * 0.25) +
      (breakdown.security * 0.25) +
      (breakdown.performance * 0.2)
    );

    // Technical debt ratio (based on complexity and maintainability)
    const complexity = this.calculateComplexity(code);
    const technicalDebtRatio = Math.max(0, Math.min(100,
      ((complexity - 5) * 10) + ((100 - breakdown.maintainability) * 0.5)
    ));

    // Maintainability index (industry standard formula)
    const maintainabilityIndex = Math.max(0,
      171 - (5.2 * Math.log(complexity)) - (0.23 * complexity) -
      (16.2 * Math.log(totalLines)) + (breakdown.maintainability * 0.5)
    );

    // Duplication percentage (simplified heuristic)
    const duplicatedLines = this.estimateDuplication(lines);
    const duplicationPercentage = (duplicatedLines / totalLines) * 100;

    // Documentation coverage
    const commentLines = lines.filter(line =>
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('#') ||
      line.trim().startsWith('"""') ||
      line.trim().startsWith("'''")
    ).length;
    const documentationCoverage = Math.min(100, (commentLines / totalLines) * 200); // 2 comments per 10 lines of code is 100%

    // Risk assessments
    const securityRiskLevel = this.assessSecurityRisk(breakdown.security);
    const performanceRisk = this.assessPerformanceRisk(breakdown.performance);

    return {
      codeHealthScore,
      technicalDebtRatio: Math.round(technicalDebtRatio * 100) / 100,
      maintainabilityIndex: Math.round(maintainabilityIndex * 100) / 100,
      duplicationPercentage: Math.round(duplicationPercentage * 100) / 100,
      complexityScore: complexity,
      documentationCoverage: Math.round(documentationCoverage * 100) / 100,
      securityRiskLevel,
      performanceRisk,
    };
  }

  /**
   * Generate enhanced recommendations with prioritization
   */
  private generateEnhancedRecommendations(
    breakdown: QualityBreakdown,
    category: string,
    compliance: ComplianceStatus,
    metrics: QualityMetrics
  ): string[] {
    const recommendations: { text: string; priority: number }[] = [];

    // Critical compliance issues (highest priority)
    if (compliance.criticalIssues > 0) {
      recommendations.push({
        text: `CRITICAL: Address ${compliance.criticalIssues} critical compliance issues immediately`,
        priority: 10
      });
    }

    // High technical debt
    if (metrics.technicalDebtRatio > 50) {
      recommendations.push({
        text: `HIGH: Reduce technical debt (${metrics.technicalDebtRatio}%) through refactoring`,
        priority: 9
      });
    }

    // Security risks
    if (metrics.securityRiskLevel === 'critical' || metrics.securityRiskLevel === 'high') {
      recommendations.push({
        text: `SECURITY: Address ${metrics.securityRiskLevel} security vulnerabilities`,
        priority: 9
      });
    }

    // Performance risks
    if (metrics.performanceRisk === 'critical' || metrics.performanceRisk === 'high') {
      recommendations.push({
        text: `PERFORMANCE: Optimize ${metrics.performanceRisk} performance bottlenecks`,
        priority: 8
      });
    }

    // Standard quality recommendations (existing logic enhanced)
    if (breakdown.maintainability < 70) {
      recommendations.push({
        text: `Improve maintainability (${breakdown.maintainability}/100) through complexity reduction`,
        priority: 7
      });
    }

    if (metrics.documentationCoverage < 30) {
      recommendations.push({
        text: `Increase documentation coverage from ${metrics.documentationCoverage}% to at least 50%`,
        priority: 6
      });
    }

    if (metrics.duplicationPercentage > 15) {
      recommendations.push({
        text: `Reduce code duplication from ${metrics.duplicationPercentage}% through refactoring`,
        priority: 6
      });
    }

    // Category-specific enhanced recommendations
    if (category === 'frontend' && breakdown.accessibility && breakdown.accessibility < 80) {
      recommendations.push({
        text: `Improve accessibility compliance to meet WCAG 2.1 AA standards`,
        priority: 8
      });
    }

    if (category === 'backend' && breakdown.scalability && breakdown.scalability < 75) {
      recommendations.push({
        text: `Enhance scalability patterns for production readiness`,
        priority: 7
      });
    }

    if (category === 'database' && breakdown.queryOptimization && breakdown.queryOptimization < 80) {
      recommendations.push({
        text: `Optimize database queries and add strategic indexes`,
        priority: 7
      });
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8)
      .map(r => r.text);
  }

  /**
   * Get enhanced quality message with trend information
   */
  private getEnhancedQualityMessage(score: number, grade: QualityGrade, trend?: QualityTrend): string {
    let baseMessage = this.getQualityMessage(score);

    if (trend) {
      if (trend.direction === 'improving') {
        baseMessage += ` Quality is improving (+${trend.change}%).`;
      } else if (trend.direction === 'declining') {
        baseMessage += ` Quality is declining (${trend.change}%).`;
      } else {
        baseMessage += ' Quality is stable.';
      }
    }

    baseMessage += ` Grade: ${grade.letter} - ${grade.description}`;

    return baseMessage;
  }

  /**
   * Helper methods for advanced calculations
   */

  private generateCodeHash(code: string): string {
    // Simple hash function for code identity
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private estimateDuplication(lines: string[]): number {
    const trimmedLines = lines.map(line => line.trim()).filter(line => line.length > 10);
    const lineCount = new Map<string, number>();

    for (const line of trimmedLines) {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    }

    let duplicated = 0;
    for (const [line, count] of lineCount) {
      if (count > 1) {
        duplicated += count - 1; // All occurrences except the first
      }
    }

    return duplicated;
  }

  private assessSecurityRisk(securityScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (securityScore >= 90) return 'low';
    if (securityScore >= 75) return 'medium';
    if (securityScore >= 60) return 'high';
    return 'critical';
  }

  private assessPerformanceRisk(performanceScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (performanceScore >= 85) return 'low';
    if (performanceScore >= 70) return 'medium';
    if (performanceScore >= 55) return 'high';
    return 'critical';
  }

  private addToHistory(code: string, category: string, score: number): void {
    const codeHash = this.generateCodeHash(code);

    this.qualityHistory.push({
      timestamp: new Date().toISOString(),
      score,
      category,
      codeHash,
    });

    // Maintain history size limit
    if (this.qualityHistory.length > this.maxHistorySize) {
      this.qualityHistory = this.qualityHistory.slice(-Math.floor(this.maxHistorySize * 0.8));
    }
  }

  /**
   * Public methods for external access to enhanced features
   */

  /**
   * Get quality statistics across all assessments
   */
  getQualityStatistics(): {
    totalAssessments: number;
    averageScore: number;
    categoryBreakdown: Record<string, { count: number; average: number }>;
    trendDirection: 'improving' | 'stable' | 'declining';
  } {
    if (this.qualityHistory.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        categoryBreakdown: {},
        trendDirection: 'stable',
      };
    }

    const totalScore = this.qualityHistory.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalScore / this.qualityHistory.length;

    const categoryBreakdown: Record<string, { count: number; average: number }> = {};
    for (const entry of this.qualityHistory) {
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = { count: 0, average: 0 };
      }
      categoryBreakdown[entry.category].count++;
    }

    for (const category in categoryBreakdown) {
      const categoryEntries = this.qualityHistory.filter(e => e.category === category);
      const categorySum = categoryEntries.reduce((sum, entry) => sum + entry.score, 0);
      categoryBreakdown[category].average = categorySum / categoryEntries.length;
    }

    // Determine overall trend
    const recentScores = this.qualityHistory.slice(-10).map(e => e.score);
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trendDirection: 'improving' | 'stable' | 'declining';
    const change = secondAvg - firstAvg;
    if (Math.abs(change) < 2) {
      trendDirection = 'stable';
    } else if (change > 0) {
      trendDirection = 'improving';
    } else {
      trendDirection = 'declining';
    }

    return {
      totalAssessments: this.qualityHistory.length,
      averageScore: Math.round(averageScore * 100) / 100,
      categoryBreakdown,
      trendDirection,
    };
  }

  /**
   * Clear quality history
   */
  clearHistory(): void {
    this.qualityHistory = [];
    console.log('[QualityAssuranceEngine] Quality history cleared');
  }
}
