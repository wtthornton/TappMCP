/**
 * Quality Validator for Smart Write Tool
 *
 * Handles quality requirements validation, code quality assessment,
 * and ensures generated code meets specified standards.
 * Extracted from smart-write for better modularity.
 */

import { GeneratedCode } from './CodeGenerator.js';
import { EnhancedInput } from './ContextualAnalyzer.js';

/**
 * Quality requirements interface
 */
export interface QualityRequirements {
  testCoverage: number;
  complexity: number;
  securityLevel: 'low' | 'medium' | 'high';
}

/**
 * Quality validation result
 */
export interface QualityValidationResult {
  passed: boolean;
  score: number;
  issues: QualityIssue[];
  recommendations: string[];
  metrics: QualityMetrics;
}

/**
 * Quality issue interface
 */
export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'security' | 'performance' | 'maintainability' | 'testing' | 'documentation';
  message: string;
  file?: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Quality metrics interface
 */
export interface QualityMetrics {
  codeQuality: number;
  testCoverage: number;
  security: number;
  performance: number;
  maintainability: number;
  documentation: number;
  overall: number;
}

/**
 * Enhanced generated code with quality validation
 */
export interface ValidatedGeneratedCode extends GeneratedCode {
  qualityValidation: QualityValidationResult;
  qualityEnhancements?: {
    improvedFiles: Array<{
      path: string;
      originalContent: string;
      improvedContent: string;
      improvements: string[];
    }>;
  };
}

/**
 * Quality Validator for ensuring code meets standards
 */
export class QualityValidator {
  /**
   * Validate generated code against quality requirements
   */
  async validateQuality(
    generatedCode: GeneratedCode,
    input: EnhancedInput
  ): Promise<ValidatedGeneratedCode> {
    const qualityRequirements = this.extractQualityRequirements(input);
    const validationResult = await this.performQualityValidation(
      generatedCode,
      qualityRequirements,
      input
    );

    // Apply quality enhancements if needed
    const qualityEnhancements = await this.applyQualityEnhancements(
      generatedCode,
      validationResult,
      input
    );

    const result: ValidatedGeneratedCode = {
      ...generatedCode,
      qualityValidation: validationResult,
    };

    if (qualityEnhancements) {
      result.qualityEnhancements = qualityEnhancements;
    }

    return result;
  }

  /**
   * Extract quality requirements from input
   */
  private extractQualityRequirements(input: EnhancedInput): QualityRequirements {
    return {
      testCoverage: input.qualityRequirements?.testCoverage || 85,
      complexity: input.qualityRequirements?.complexity || 5,
      securityLevel: input.qualityRequirements?.securityLevel || 'medium',
    };
  }

  /**
   * Perform comprehensive quality validation
   */
  private async performQualityValidation(
    generatedCode: GeneratedCode,
    requirements: QualityRequirements,
    input: EnhancedInput
  ): Promise<QualityValidationResult> {
    const issues: QualityIssue[] = [];
    const recommendations: string[] = [];

    // Validate each file
    const metrics = await this.calculateQualityMetrics(generatedCode, requirements);

    // Security validation
    this.validateSecurity(generatedCode, requirements, issues, recommendations);

    // Performance validation
    this.validatePerformance(generatedCode, input, issues, recommendations);

    // Maintainability validation
    this.validateMaintainability(generatedCode, requirements, issues, recommendations);

    // Testing validation
    this.validateTesting(generatedCode, requirements, issues, recommendations);

    // Documentation validation
    this.validateDocumentation(generatedCode, issues, recommendations);

    // Role-specific validation
    this.validateRoleSpecific(generatedCode, input, issues, recommendations);

    // Calculate overall score
    const score = this.calculateOverallScore(metrics, issues);
    const passed = this.determineValidationPass(score, issues, requirements);

    return {
      passed,
      score,
      issues,
      recommendations,
      metrics,
    };
  }

  /**
   * Calculate quality metrics for generated code
   */
  private async calculateQualityMetrics(
    generatedCode: GeneratedCode,
    requirements: QualityRequirements
  ): Promise<QualityMetrics> {
    const codeQuality = this.assessCodeQuality(generatedCode);
    const testCoverage = this.assessTestCoverage(generatedCode, requirements);
    const security = this.assessSecurity(generatedCode, requirements);
    const performance = this.assessPerformance(generatedCode);
    const maintainability = this.assessMaintainability(generatedCode, requirements);
    const documentation = this.assessDocumentation(generatedCode);

    const overall = Math.round(
      (codeQuality * 0.25 +
        testCoverage * 0.20 +
        security * 0.20 +
        performance * 0.15 +
        maintainability * 0.15 +
        documentation * 0.05)
    );

    return {
      codeQuality,
      testCoverage,
      security,
      performance,
      maintainability,
      documentation,
      overall,
    };
  }

  /**
   * Validate security aspects
   */
  private validateSecurity(
    generatedCode: GeneratedCode,
    requirements: QualityRequirements,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    generatedCode.files.forEach(file => {
      // Check for hardcoded secrets
      if (this.containsHardcodedSecrets(file.content)) {
        issues.push({
          type: 'error',
          category: 'security',
          message: 'Hardcoded secrets detected',
          file: file.path,
          severity: 'critical',
        });
        recommendations.push('Use environment variables for secrets');
      }

      // Check for SQL injection vulnerabilities
      if (this.hasSQLInjectionRisk(file.content)) {
        issues.push({
          type: 'error',
          category: 'security',
          message: 'Potential SQL injection vulnerability',
          file: file.path,
          severity: 'high',
        });
        recommendations.push('Use parameterized queries');
      }

      // Check for XSS vulnerabilities
      if (this.hasXSSRisk(file.content)) {
        issues.push({
          type: 'warning',
          category: 'security',
          message: 'Potential XSS vulnerability',
          file: file.path,
          severity: 'medium',
        });
        recommendations.push('Sanitize user inputs and use proper output encoding');
      }

      // Security level specific checks
      if (requirements.securityLevel === 'high') {
        if (!this.hasInputValidation(file.content)) {
          issues.push({
            type: 'warning',
            category: 'security',
            message: 'Missing comprehensive input validation',
            file: file.path,
            severity: 'medium',
          });
          recommendations.push('Implement comprehensive input validation for high security level');
        }

        if (!this.hasErrorHandling(file.content)) {
          issues.push({
            type: 'warning',
            category: 'security',
            message: 'Insufficient error handling for security',
            file: file.path,
            severity: 'medium',
          });
        }
      }
    });
  }

  /**
   * Validate performance aspects
   */
  private validatePerformance(
    generatedCode: GeneratedCode,
    _input: EnhancedInput,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    generatedCode.files.forEach(file => {
      // Check for performance anti-patterns
      if (this.hasPerformanceAntiPatterns(file.content)) {
        issues.push({
          type: 'warning',
          category: 'performance',
          message: 'Performance anti-patterns detected',
          file: file.path,
          severity: 'medium',
        });
        recommendations.push('Optimize performance-critical code paths');
      }

      // Check for inefficient loops
      if (this.hasInefficientLoops(file.content)) {
        issues.push({
          type: 'warning',
          category: 'performance',
          message: 'Inefficient loop patterns detected',
          file: file.path,
          severity: 'low',
        });
        recommendations.push('Consider optimizing loop implementations');
      }

      // Check for missing async patterns
      if (this.needsAsyncOptimization(file.content)) {
        issues.push({
          type: 'info',
          category: 'performance',
          message: 'Consider async optimization opportunities',
          file: file.path,
          severity: 'low',
        });
        recommendations.push('Use async/await for I/O operations');
      }
    });
  }

  /**
   * Validate maintainability aspects
   */
  private validateMaintainability(
    generatedCode: GeneratedCode,
    requirements: QualityRequirements,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    generatedCode.files.forEach(file => {
      // Check code complexity
      const complexity = this.calculateComplexity(file.content);
      if (complexity > requirements.complexity) {
        issues.push({
          type: 'warning',
          category: 'maintainability',
          message: `Code complexity (${complexity}) exceeds limit (${requirements.complexity})`,
          file: file.path,
          severity: 'medium',
        });
        recommendations.push('Refactor complex functions into smaller, focused functions');
      }

      // Check function length
      if (this.hasLongFunctions(file.content)) {
        issues.push({
          type: 'info',
          category: 'maintainability',
          message: 'Long functions detected',
          file: file.path,
          severity: 'low',
        });
        recommendations.push('Break down long functions for better maintainability');
      }

      // Check naming conventions
      if (!this.hasGoodNamingConventions(file.content)) {
        issues.push({
          type: 'info',
          category: 'maintainability',
          message: 'Naming convention improvements needed',
          file: file.path,
          severity: 'low',
        });
        recommendations.push('Use clear, descriptive variable and function names');
      }
    });
  }

  /**
   * Validate testing aspects
   */
  private validateTesting(
    generatedCode: GeneratedCode,
    requirements: QualityRequirements,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    const testFiles = generatedCode.files.filter(file => file.type === 'test');
    const codeFiles = generatedCode.files.filter(file => file.type !== 'test' && file.type !== 'documentation');

    // Check test coverage
    const estimatedCoverage = this.estimateTestCoverage(testFiles, codeFiles);
    if (estimatedCoverage < requirements.testCoverage) {
      issues.push({
        type: 'warning',
        category: 'testing',
        message: `Estimated test coverage (${estimatedCoverage}%) below requirement (${requirements.testCoverage}%)`,
        severity: 'medium',
      });
      recommendations.push('Add more comprehensive test cases');
    }

    // Check for missing test types
    if (!this.hasUnitTests(testFiles)) {
      issues.push({
        type: 'warning',
        category: 'testing',
        message: 'Missing unit tests',
        severity: 'medium',
      });
      recommendations.push('Add unit tests for core functionality');
    }

    if (!this.hasIntegrationTests(testFiles)) {
      issues.push({
        type: 'info',
        category: 'testing',
        message: 'Consider adding integration tests',
        severity: 'low',
      });
      recommendations.push('Add integration tests for end-to-end workflows');
    }
  }

  /**
   * Validate documentation aspects
   */
  private validateDocumentation(
    generatedCode: GeneratedCode,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    const docFiles = generatedCode.files.filter(file => file.type === 'documentation');
    const codeFiles = generatedCode.files.filter(file => file.type !== 'documentation');

    // Check for missing documentation
    if (docFiles.length === 0) {
      issues.push({
        type: 'info',
        category: 'documentation',
        message: 'Missing documentation files',
        severity: 'low',
      });
      recommendations.push('Add README and API documentation');
    }

    // Check inline documentation
    codeFiles.forEach(file => {
      if (!this.hasInlineDocumentation(file.content)) {
        issues.push({
          type: 'info',
          category: 'documentation',
          message: 'Missing inline documentation',
          file: file.path,
          severity: 'low',
        });
        recommendations.push('Add JSDoc comments for functions and classes');
      }
    });
  }

  /**
   * Validate role-specific requirements
   */
  private validateRoleSpecific(
    generatedCode: GeneratedCode,
    input: EnhancedInput,
    issues: QualityIssue[],
    recommendations: string[]
  ): void {
    switch (input.targetRole) {
      case 'qa-engineer':
        this.validateQASpecific(generatedCode, issues, recommendations);
        break;
      case 'operations-engineer':
        this.validateOpsSpecific(generatedCode, issues, recommendations);
        break;
      case 'product-strategist':
        this.validateProductSpecific(generatedCode, issues, recommendations);
        break;
      case 'designer':
        this.validateDesignSpecific(generatedCode, issues, recommendations);
        break;
      default:
        this.validateDeveloperSpecific(generatedCode, issues, recommendations);
        break;
    }
  }

  /**
   * Apply quality enhancements to generated code
   */
  private async applyQualityEnhancements(
    generatedCode: GeneratedCode,
    validationResult: QualityValidationResult,
    input: EnhancedInput
  ): Promise<ValidatedGeneratedCode['qualityEnhancements']> {
    if (validationResult.passed && validationResult.score >= 85) {
      return undefined; // No enhancements needed
    }

    const improvedFiles = await Promise.all(
      generatedCode.files.map(async file => {
        const improvements = this.generateImprovements(file, validationResult, input);
        const improvedContent = await this.applyImprovements(file.content, improvements);

        return {
          path: file.path,
          originalContent: file.content,
          improvedContent,
          improvements: improvements.map(imp => imp.description),
        };
      })
    );

    return { improvedFiles };
  }

  /**
   * Assessment methods
   */
  private assessCodeQuality(generatedCode: GeneratedCode): number {
    let totalScore = 0;
    let fileCount = 0;

    generatedCode.files.forEach(file => {
      if (file.type === 'test' || file.type === 'documentation') return;

      fileCount++;
      let fileScore = 85; // Base score

      // Check for best practices
      if (this.hasTypeDefinitions(file.content)) fileScore += 5;
      if (this.hasErrorHandling(file.content)) fileScore += 5;
      if (this.hasInputValidation(file.content)) fileScore += 3;
      if (this.hasGoodNamingConventions(file.content)) fileScore += 2;

      // Deduct for anti-patterns
      if (this.hasCodeSmells(file.content)) fileScore -= 10;
      if (this.hasPerformanceAntiPatterns(file.content)) fileScore -= 5;

      totalScore += Math.max(0, Math.min(100, fileScore));
    });

    return fileCount > 0 ? Math.round(totalScore / fileCount) : 70;
  }

  private assessTestCoverage(generatedCode: GeneratedCode, _requirements: QualityRequirements): number {
    const testFiles = generatedCode.files.filter(file => file.type === 'test');
    const codeFiles = generatedCode.files.filter(file => file.type !== 'test' && file.type !== 'documentation');

    return this.estimateTestCoverage(testFiles, codeFiles);
  }

  private assessSecurity(generatedCode: GeneratedCode, requirements: QualityRequirements): number {
    let score = 80; // Base score

    generatedCode.files.forEach(file => {
      if (this.containsHardcodedSecrets(file.content)) score -= 30;
      if (this.hasSQLInjectionRisk(file.content)) score -= 25;
      if (this.hasXSSRisk(file.content)) score -= 15;
      if (this.hasInputValidation(file.content)) score += 10;
      if (this.hasErrorHandling(file.content)) score += 5;
    });

    // Adjust for security level requirements
    if (requirements.securityLevel === 'high' && score < 90) {
      score = Math.max(score - 10, 60);
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessPerformance(generatedCode: GeneratedCode): number {
    let score = 75; // Base score

    generatedCode.files.forEach(file => {
      if (this.hasPerformanceAntiPatterns(file.content)) score -= 15;
      if (this.hasInefficientLoops(file.content)) score -= 10;
      if (this.hasAsyncPatterns(file.content)) score += 10;
      if (this.hasCachingPatterns(file.content)) score += 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private assessMaintainability(generatedCode: GeneratedCode, requirements: QualityRequirements): number {
    let totalScore = 0;
    let fileCount = 0;

    generatedCode.files.forEach(file => {
      if (file.type === 'test' || file.type === 'documentation') return;

      fileCount++;
      let fileScore = 75;

      const complexity = this.calculateComplexity(file.content);
      if (complexity <= requirements.complexity) {
        fileScore += 10;
      } else {
        fileScore -= (complexity - requirements.complexity) * 5;
      }

      if (this.hasGoodNamingConventions(file.content)) fileScore += 5;
      if (this.hasModularStructure(file.content)) fileScore += 5;
      if (this.hasLongFunctions(file.content)) fileScore -= 10;

      totalScore += Math.max(0, Math.min(100, fileScore));
    });

    return fileCount > 0 ? Math.round(totalScore / fileCount) : 70;
  }

  private assessDocumentation(generatedCode: GeneratedCode): number {
    let score = 60; // Base score

    const docFiles = generatedCode.files.filter(file => file.type === 'documentation');
    const codeFiles = generatedCode.files.filter(file => file.type !== 'documentation');

    // Check for documentation files
    if (docFiles.length > 0) score += 20;

    // Check inline documentation
    codeFiles.forEach(file => {
      if (this.hasInlineDocumentation(file.content)) score += 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Utility methods for code analysis
   */
  private containsHardcodedSecrets(content: string): boolean {
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
      /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
      /secret\s*[:=]\s*['"][^'"]{16,}['"]/i,
      /token\s*[:=]\s*['"][^'"]{20,}['"]/i,
    ];

    return secretPatterns.some(pattern => pattern.test(content));
  }

  private hasSQLInjectionRisk(content: string): boolean {
    return /query.*\+.*['\"]/.test(content) || /SELECT.*\+/.test(content);
  }

  private hasXSSRisk(content: string): boolean {
    return /innerHTML\s*=/.test(content) && !/sanitize|escape/.test(content);
  }

  private hasInputValidation(content: string): boolean {
    const validationPatterns = [
      /validate\(/,
      /isValid\(/,
      /typeof.*===.*string/,
      /instanceof/,
      /\.length\s*>/,
      /zod|joi|yup/,
    ];

    return validationPatterns.some(pattern => pattern.test(content));
  }

  private hasErrorHandling(content: string): boolean {
    return /try\s*{/.test(content) || /catch\s*\(/.test(content) || /\.catch\(/.test(content);
  }

  private hasPerformanceAntiPatterns(content: string): boolean {
    const antiPatterns = [
      /for\s*\([^)]*\)\s*{[^}]*for\s*\(/, // Nested loops
      /while\s*\(.*\.length/, // Loop using length property
      /forEach.*forEach/, // Nested forEach
    ];

    return antiPatterns.some(pattern => pattern.test(content));
  }

  private hasInefficientLoops(content: string): boolean {
    return /for\s*\([^)]*i\s*<\s*.*\.length[^)]*\)/.test(content);
  }

  private needsAsyncOptimization(content: string): boolean {
    return /fetch\(|http\.|fs\.|database/.test(content) && !/await|\.then\(/.test(content);
  }

  private hasAsyncPatterns(content: string): boolean {
    return /async|await|Promise|\.then\(/.test(content);
  }

  private hasCachingPatterns(content: string): boolean {
    return /cache|memoize|Map\(|WeakMap\(/.test(content);
  }

  private calculateComplexity(content: string): number {
    // Simplified cyclomatic complexity calculation
    const complexityIndicators = [
      /if\s*\(/g,
      /else/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&|\|\|/g,
    ];

    let complexity = 1; // Base complexity
    complexityIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  private hasLongFunctions(content: string): boolean {
    const functions = content.match(/function[^{]*{[^}]*}/g) || [];
    return functions.some(fn => fn.split('\n').length > 30);
  }

  private hasGoodNamingConventions(content: string): boolean {
    // Check for camelCase functions and variables
    const hasGoodFunctionNames = /function\s+[a-z][a-zA-Z0-9]*\s*\(/.test(content);
    const hasGoodVariableNames = /(?:const|let|var)\s+[a-z][a-zA-Z0-9]*\s*=/.test(content);

    return hasGoodFunctionNames && hasGoodVariableNames;
  }

  private hasCodeSmells(content: string): boolean {
    const codeSmells = [
      /var\s+/, // Use of var instead of const/let
      /function\s*\(\s*\)\s*{[^}]{200,}/, // Very long anonymous functions
      /console\.log/, // Console.log statements
      /debugger/, // Debugger statements
      /TODO|FIXME|HACK/i, // TODO comments
    ];

    return codeSmells.some(pattern => pattern.test(content));
  }

  private hasTypeDefinitions(content: string): boolean {
    return /interface\s+|type\s+|:\s*string|:\s*number|:\s*boolean/.test(content);
  }

  private hasModularStructure(content: string): boolean {
    return /export\s+|import\s+|module\.exports/.test(content);
  }

  private hasInlineDocumentation(content: string): boolean {
    return /\/\*\*[\s\S]*?\*\/|\/\/.*@param|\/\/.*@returns/.test(content);
  }

  private estimateTestCoverage(testFiles: any[], codeFiles: any[]): number {
    if (testFiles.length === 0) return 0;
    if (codeFiles.length === 0) return 100;

    // Simple heuristic: count test cases vs functions
    let totalFunctions = 0;
    let totalTestCases = 0;

    codeFiles.forEach(file => {
      const functions = file.content.match(/function\s+\w+|const\s+\w+\s*=\s*async|export\s+function/g) || [];
      totalFunctions += functions.length;
    });

    testFiles.forEach(file => {
      const testCases = file.content.match(/it\s*\(|test\s*\(/g) || [];
      totalTestCases += testCases.length;
    });

    return totalFunctions > 0 ? Math.min(100, Math.round((totalTestCases / totalFunctions) * 100)) : 0;
  }

  private hasUnitTests(testFiles: any[]): boolean {
    return testFiles.some(file =>
      file.content.includes('it(') ||
      file.content.includes('test(') ||
      file.content.includes('describe(')
    );
  }

  private hasIntegrationTests(testFiles: any[]): boolean {
    return testFiles.some(file =>
      file.path.includes('integration') ||
      file.path.includes('e2e') ||
      file.content.includes('integration')
    );
  }

  /**
   * Role-specific validation methods
   */
  private validateQASpecific(generatedCode: GeneratedCode, issues: QualityIssue[], recommendations: string[]): void {
    const hasComprehensiveTests = generatedCode.files.some(file =>
      file.type === 'test' && file.content.includes('describe') && file.content.includes('it')
    );

    if (!hasComprehensiveTests) {
      issues.push({
        type: 'warning',
        category: 'testing',
        message: 'QA role requires comprehensive test suites',
        severity: 'medium',
      });
      recommendations.push('Add comprehensive test coverage with describe/it blocks');
    }
  }

  private validateOpsSpecific(generatedCode: GeneratedCode, issues: QualityIssue[], recommendations: string[]): void {
    const hasMonitoring = generatedCode.files.some(file =>
      file.content.includes('monitoring') || file.content.includes('metrics')
    );

    if (!hasMonitoring) {
      issues.push({
        type: 'info',
        category: 'maintainability',
        message: 'Operations role benefits from monitoring integration',
        severity: 'low',
      });
      recommendations.push('Add monitoring and metrics collection');
    }
  }

  private validateProductSpecific(generatedCode: GeneratedCode, issues: QualityIssue[], recommendations: string[]): void {
    const hasBusinessMetrics = generatedCode.files.some(file =>
      file.content.includes('businessValue') || file.content.includes('metrics')
    );

    if (!hasBusinessMetrics) {
      issues.push({
        type: 'info',
        category: 'maintainability',
        message: 'Product strategist role benefits from business metrics',
        severity: 'low',
      });
      recommendations.push('Add business value tracking and KPIs');
    }
  }

  private validateDesignSpecific(generatedCode: GeneratedCode, issues: QualityIssue[], recommendations: string[]): void {
    const hasAccessibility = generatedCode.files.some(file =>
      file.content.includes('accessibility') || file.content.includes('aria-')
    );

    if (!hasAccessibility) {
      issues.push({
        type: 'info',
        category: 'maintainability',
        message: 'Designer role benefits from accessibility considerations',
        severity: 'low',
      });
      recommendations.push('Add accessibility features and ARIA labels');
    }
  }

  private validateDeveloperSpecific(generatedCode: GeneratedCode, issues: QualityIssue[], recommendations: string[]): void {
    const hasPerformanceMetrics = generatedCode.files.some(file =>
      file.content.includes('performance') || file.content.includes('metrics')
    );

    if (!hasPerformanceMetrics) {
      issues.push({
        type: 'info',
        category: 'performance',
        message: 'Developer role benefits from performance tracking',
        severity: 'low',
      });
      recommendations.push('Add performance monitoring and metrics');
    }
  }

  /**
   * Calculate overall score and determine pass/fail
   */
  private calculateOverallScore(metrics: QualityMetrics, issues: QualityIssue[]): number {
    let score = metrics.overall;

    // Deduct points for critical issues
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const highIssues = issues.filter(issue => issue.severity === 'high').length;

    score -= criticalIssues * 20;
    score -= highIssues * 10;

    return Math.max(0, Math.min(100, score));
  }

  private determineValidationPass(
    score: number,
    issues: QualityIssue[],
    requirements: QualityRequirements
  ): boolean {
    // Fail if there are critical issues
    if (issues.some(issue => issue.severity === 'critical')) {
      return false;
    }

    // Fail if score is too low
    if (score < 70) {
      return false;
    }

    // High security level requires higher standards
    if (requirements.securityLevel === 'high' && score < 80) {
      return false;
    }

    return true;
  }

  /**
   * Generate and apply improvements
   */
  private generateImprovements(
    file: any,
    validationResult: QualityValidationResult,
    _input: EnhancedInput
  ): Array<{ type: string; description: string; code: string }> {
    const improvements: Array<{ type: string; description: string; code: string }> = [];

    // Generate improvements based on validation issues
    validationResult.issues.forEach(issue => {
      if (issue.file === file.path) {
        switch (issue.category) {
          case 'security':
            if (issue.message.includes('hardcoded secrets')) {
              improvements.push({
                type: 'security',
                description: 'Replace hardcoded secrets with environment variables',
                code: this.generateSecurityImprovement(file.content, 'secrets'),
              });
            }
            break;
          case 'performance':
            if (issue.message.includes('async')) {
              improvements.push({
                type: 'performance',
                description: 'Add async/await patterns',
                code: this.generatePerformanceImprovement(file.content),
              });
            }
            break;
          case 'testing':
            improvements.push({
              type: 'testing',
              description: 'Add more comprehensive tests',
              code: this.generateTestingImprovement(file.content),
            });
            break;
        }
      }
    });

    return improvements;
  }

  private async applyImprovements(content: string, improvements: any[]): Promise<string> {
    let improvedContent = content;

    improvements.forEach(improvement => {
      switch (improvement.type) {
        case 'security':
          improvedContent = this.applySecurityImprovement(improvedContent, improvement.code);
          break;
        case 'performance':
          improvedContent = this.applyPerformanceImprovement(improvedContent, improvement.code);
          break;
        case 'testing':
          improvedContent = this.applyTestingImprovement(improvedContent, improvement.code);
          break;
      }
    });

    return improvedContent;
  }

  private generateSecurityImprovement(_content: string, type: string): string {
    if (type === 'secrets') {
      return `// Use environment variables for secrets
const secret = process.env.SECRET_KEY || 'default-secret';`;
    }
    return '';
  }

  private generatePerformanceImprovement(_content: string): string {
    return `// Add async/await for better performance
async function optimizedFunction() {
  try {
    const result = await performAsyncOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}`;
  }

  private generateTestingImprovement(_content: string): string {
    return `// Additional test cases
it('should handle edge cases', () => {
  // Test edge case scenarios
  expect(functionUnderTest(null)).toBeDefined();
  expect(functionUnderTest(undefined)).toBeDefined();
});

it('should validate performance requirements', async () => {
  const start = performance.now();
  await functionUnderTest('performance test');
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // Should complete in less than 100ms
});`;
  }

  private applySecurityImprovement(content: string, _improvement: string): string {
    // Replace hardcoded values with environment variable references
    return content.replace(/password\s*[:=]\s*['"][^'"]+['"]/, 'password: process.env.PASSWORD');
  }

  private applyPerformanceImprovement(content: string, _improvement: string): string {
    // Add async patterns where appropriate
    if (content.includes('function ') && !content.includes('async')) {
      return content.replace(/function\s+(\w+)/, 'async function $1');
    }
    return content;
  }

  private applyTestingImprovement(content: string, improvement: string): string {
    // Add the improvement to the end of the file
    return `${content}\n\n${improvement}`;
  }
}