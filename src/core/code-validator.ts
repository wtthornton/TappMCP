#!/usr/bin/env node

import { SecurityScanner } from './security-scanner.js';
import { StaticAnalyzer } from './static-analyzer.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CodeValidationResult {
  isValid: boolean;
  validationTime: number;
  security: {
    status: 'pass' | 'fail' | 'warning';
    issues: Array<{
      type: 'vulnerability' | 'pattern' | 'dependency';
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
      line?: number;
      column?: number;
      fix?: string;
    }>;
    score: number;
  };
  quality: {
    status: 'pass' | 'fail' | 'warning';
    issues: Array<{
      type: 'syntax' | 'complexity' | 'style' | 'logic';
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      column?: number;
      fix?: string;
    }>;
    metrics: {
      complexity: number;
      maintainability: number;
      testability: number;
    };
    score: number;
  };
  recommendations: string[];
  overallScore: number;
}

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  dependencies?: string[];
}

export class CodeValidator {
  private tempDir: string;

  constructor(tempDir = './temp-validation') {
    this.tempDir = tempDir;
  }

  /**
   * Validate generated code in real-time
   */
  async validateGeneratedCode(
    generatedCode: GeneratedCode,
    _projectPath?: string
  ): Promise<CodeValidationResult> {
    const startTime = Date.now();

    try {
      // Create temporary files for validation
      const tempValidationDir = await this.createTempFiles(generatedCode);

      // Run validation in parallel
      const [securityResult, qualityResult] = await Promise.all([
        this.validateSecurity(tempValidationDir, generatedCode),
        this.validateQuality(tempValidationDir, generatedCode),
      ]);

      // Calculate overall score and recommendations
      const overallScore = Math.round((securityResult.score + qualityResult.score) / 2);
      const recommendations = this.generateValidationRecommendations(securityResult, qualityResult);

      // Cleanup temp files
      await this.cleanupTempFiles(tempValidationDir);

      const validationTime = Date.now() - startTime;

      return {
        isValid: securityResult.status === 'pass' && qualityResult.status === 'pass',
        validationTime,
        security: securityResult,
        quality: qualityResult,
        recommendations,
        overallScore,
      };
    } catch (error) {
      console.warn('Code validation failed:', error);

      return {
        isValid: false,
        validationTime: Date.now() - startTime,
        security: {
          status: 'warning',
          issues: [
            {
              type: 'vulnerability',
              severity: 'medium',
              message: 'Validation failed - manual review required',
            },
          ],
          score: 50,
        },
        quality: {
          status: 'warning',
          issues: [
            { type: 'syntax', severity: 'warning', message: 'Could not validate code quality' },
          ],
          metrics: { complexity: 0, maintainability: 50, testability: 50 },
          score: 50,
        },
        recommendations: ['Manual code review recommended due to validation failure'],
        overallScore: 50,
      };
    }
  }

  /**
   * Create temporary files for validation
   */
  private async createTempFiles(generatedCode: GeneratedCode): Promise<string> {
    const timestamp = Date.now();
    const tempDir = path.join(this.tempDir, `validation-${timestamp}`);

    try {
      await fs.mkdir(tempDir, { recursive: true });

      // Write generated files
      for (const file of generatedCode.files) {
        const fullPath = path.join(tempDir, file.path);
        const dir = path.dirname(fullPath);

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, file.content, 'utf8');
      }

      // Create basic package.json for dependency analysis
      if (generatedCode.dependencies && generatedCode.dependencies.length > 0) {
        const packageJson = {
          name: 'temp-validation',
          version: '1.0.0',
          dependencies: generatedCode.dependencies.reduce(
            (acc, dep) => {
              acc[dep] = '*';
              return acc;
            },
            {} as Record<string, string>
          ),
        };

        await fs.writeFile(
          path.join(tempDir, 'package.json'),
          JSON.stringify(packageJson, null, 2),
          'utf8'
        );
      }

      return tempDir;
    } catch (error) {
      console.warn('Failed to create temp files for validation:', error);
      throw error;
    }
  }

  /**
   * Validate security of generated code
   */
  private async validateSecurity(
    tempDir: string,
    generatedCode: GeneratedCode
  ): Promise<CodeValidationResult['security']> {
    try {
      const securityScanner = new SecurityScanner(tempDir);
      const result = await securityScanner.runSecurityScan();

      // Analyze code patterns for security issues
      const codeIssues = await this.analyzeCodeSecurityPatterns(generatedCode);

      const allIssues = [
        ...result.vulnerabilities.map(vuln => ({
          type: 'vulnerability' as const,
          severity:
            vuln.severity === 'moderate'
              ? 'medium'
              : (vuln.severity as 'critical' | 'high' | 'medium' | 'low'),
          message: `${vuln.package}: ${vuln.description}`,
          ...(vuln.fix && { fix: vuln.fix }),
        })),
        ...codeIssues,
      ];

      const score = this.calculateSecurityScore(allIssues);
      const status = this.determineSecurityStatus(allIssues);

      return {
        status,
        issues: allIssues,
        score,
      };
    } catch (error) {
      console.warn('Security validation failed:', error);
      return {
        status: 'warning',
        issues: [
          { type: 'vulnerability', severity: 'medium', message: 'Security validation incomplete' },
        ],
        score: 60,
      };
    }
  }

  /**
   * Validate code quality
   */
  private async validateQuality(
    tempDir: string,
    generatedCode: GeneratedCode
  ): Promise<CodeValidationResult['quality']> {
    try {
      const staticAnalyzer = new StaticAnalyzer(tempDir);
      const result = await staticAnalyzer.runStaticAnalysis();

      // Analyze code patterns and structure
      const codeIssues = await this.analyzeCodeQualityPatterns(generatedCode);

      const allIssues = [
        ...result.issues.map(issue => ({
          type: 'syntax' as const,
          severity: issue.severity,
          message: issue.message,
          line: issue.line,
          column: issue.column,
          fix: issue.fix,
        })),
        ...codeIssues,
      ];

      const score = this.calculateQualityScore(result.metrics, allIssues);
      const status = this.determineQualityStatus(allIssues, result.metrics);

      return {
        status,
        issues: allIssues,
        metrics: {
          complexity: result.metrics.complexity,
          maintainability: result.metrics.maintainability,
          testability: this.calculateTestability(generatedCode),
        },
        score,
      };
    } catch (error) {
      console.warn('Quality validation failed:', error);
      return {
        status: 'warning',
        issues: [{ type: 'syntax', severity: 'warning', message: 'Quality validation incomplete' }],
        metrics: { complexity: 0, maintainability: 50, testability: 50 },
        score: 60,
      };
    }
  }

  /**
   * Analyze code for security patterns
   */
  private async analyzeCodeSecurityPatterns(generatedCode: GeneratedCode): Promise<
    Array<{
      type: 'vulnerability' | 'pattern' | 'dependency';
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
      line?: number;
      fix?: string;
    }>
  > {
    const issues: Array<{
      type: 'vulnerability' | 'pattern' | 'dependency';
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
      line?: number;
      fix?: string;
    }> = [];

    for (const file of generatedCode.files) {
      const lines = file.content.split('\n');

      lines.forEach((line, index) => {
        // Check for common security anti-patterns
        if (line.includes('eval(') || line.includes('Function(')) {
          issues.push({
            type: 'vulnerability',
            severity: 'high',
            message: 'Dangerous use of eval() or Function() constructor',
            line: index + 1,
            fix: 'Use safer alternatives like JSON.parse() or specific parsing libraries',
          });
        }

        if (line.includes('innerHTML') && !line.includes('textContent')) {
          issues.push({
            type: 'vulnerability',
            severity: 'medium',
            message: 'Potential XSS vulnerability with innerHTML',
            line: index + 1,
            fix: 'Use textContent or properly sanitize HTML content',
          });
        }

        if (
          line.match(/password.*=.*['"][^'"]+['"]/i) ||
          line.match(/api.*key.*=.*['"][^'"]+['"]/i) ||
          line.match(/secret.*=.*['"][^'"]+['"]/i)
        ) {
          issues.push({
            type: 'vulnerability',
            severity: 'critical',
            message: 'Hardcoded credentials detected',
            line: index + 1,
            fix: 'Use environment variables or secure configuration management',
          });
        }

        if (line.includes('console.log') && file.type !== 'test') {
          issues.push({
            type: 'pattern',
            severity: 'low',
            message: 'Debug console.log statement in production code',
            line: index + 1,
            fix: 'Remove console.log or use proper logging framework',
          });
        }
      });
    }

    return issues;
  }

  /**
   * Analyze code for quality patterns
   */
  private async analyzeCodeQualityPatterns(generatedCode: GeneratedCode): Promise<
    Array<{
      type: 'syntax' | 'complexity' | 'style' | 'logic';
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      fix?: string;
    }>
  > {
    const issues: Array<{
      type: 'syntax' | 'complexity' | 'style' | 'logic';
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      fix?: string;
    }> = [];

    for (const file of generatedCode.files) {
      const lines = file.content.split('\n');

      lines.forEach((line, index) => {
        // Check for common quality issues
        if (line.trim().length > 120) {
          issues.push({
            type: 'style',
            severity: 'info',
            message: 'Line too long (>120 characters)',
            line: index + 1,
            fix: 'Break long lines for better readability',
          });
        }

        if (line.includes('any') && file.path.endsWith('.ts')) {
          issues.push({
            type: 'style',
            severity: 'warning',
            message: 'Use of "any" type reduces type safety',
            line: index + 1,
            fix: 'Use specific types or unknown instead of any',
          });
        }

        // Check for deeply nested blocks (complexity)
        const indentation = line.match(/^(\s*)/)?.[1]?.length || 0;
        if (indentation > 24) {
          // More than 6 levels of indentation (4 spaces each)
          issues.push({
            type: 'complexity',
            severity: 'warning',
            message: 'Deeply nested code block',
            line: index + 1,
            fix: 'Extract nested logic into separate functions',
          });
        }

        // Check for missing error handling in async functions
        if (
          line.includes('await ') &&
          !lines
            .slice(Math.max(0, index - 5), index + 5)
            .some(l => l.includes('try') || l.includes('catch'))
        ) {
          issues.push({
            type: 'logic',
            severity: 'warning',
            message: 'Async operation without error handling',
            line: index + 1,
            fix: 'Wrap await operations in try-catch blocks',
          });
        }
      });
    }

    return issues;
  }

  /**
   * Calculate testability score based on code structure
   */
  private calculateTestability(generatedCode: GeneratedCode): number {
    let score = 100;

    const hasTests = generatedCode.files.some(
      f => f.path.includes('.test.') || f.path.includes('.spec.')
    );
    if (!hasTests) {score -= 20;}

    // Check for testable patterns
    const codeFiles = generatedCode.files.filter(
      f => f.type !== 'test' && f.type !== 'documentation'
    );
    for (const file of codeFiles) {
      // Functions should be exported for testability
      if (!file.content.includes('export')) {score -= 15;}

      // Pure functions are more testable
      if (file.content.includes('Date.now()') || file.content.includes('Math.random()')) {
        score -= 10; // Side effects reduce testability
      }

      // Side effects like console.log reduce testability
      if (file.content.includes('console.log')) {
        score -= 5;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(issues: Array<{ severity: string }>): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
        default:
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(metrics: any, issues: Array<{ severity: string }>): number {
    let score = metrics.maintainability || 80;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 8;
          break;
        case 'info':
          score -= 3;
          break;
        default:
          score -= 1;
          break;
      }
    }

    // Adjust for complexity
    if (metrics.complexity > 10) {
      score -= Math.min(20, (metrics.complexity - 10) * 2);
    }

    return Math.max(0, score);
  }

  /**
   * Determine security status
   */
  private determineSecurityStatus(
    issues: Array<{ severity: string }>
  ): 'pass' | 'fail' | 'warning' {
    const hasCritical = issues.some(i => i.severity === 'critical');
    const hasHigh = issues.some(i => i.severity === 'high');

    if (hasCritical) {return 'fail';}
    if (hasHigh || issues.length > 5) {return 'warning';}
    return 'pass';
  }

  /**
   * Determine quality status
   */
  private determineQualityStatus(
    issues: Array<{ severity: string }>,
    metrics: any
  ): 'pass' | 'fail' | 'warning' {
    const hasErrors = issues.some(i => i.severity === 'error');
    const hasWarnings = issues.filter(i => i.severity === 'warning').length;

    if (hasErrors || metrics.complexity > 20) {return 'fail';}
    if (hasWarnings > 3 || metrics.complexity > 10) {return 'warning';}
    return 'pass';
  }

  /**
   * Generate validation recommendations
   */
  private generateValidationRecommendations(
    security: CodeValidationResult['security'],
    quality: CodeValidationResult['quality']
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    const criticalSecurity = security.issues.filter(i => i.severity === 'critical');
    const highSecurity = security.issues.filter(i => i.severity === 'high');

    if (criticalSecurity.length > 0) {
      recommendations.push(
        `🚨 CRITICAL: Fix ${criticalSecurity.length} critical security issues immediately`
      );
    }
    if (highSecurity.length > 0) {
      recommendations.push(
        `⚠️ Address ${highSecurity.length} high-priority security vulnerabilities`
      );
    }

    // Quality recommendations
    const qualityErrors = quality.issues.filter(i => i.severity === 'error');
    const qualityWarnings = quality.issues.filter(i => i.severity === 'warning');

    if (qualityErrors.length > 0) {
      recommendations.push(`🔧 Fix ${qualityErrors.length} code quality errors`);
    }
    if (quality.metrics.complexity >= 15) {
      recommendations.push(
        `📊 Reduce complexity from ${quality.metrics.complexity} to improve maintainability`
      );
    }
    if (quality.metrics.testability < 70) {
      recommendations.push(`🧪 Improve testability (current: ${quality.metrics.testability}%)`);
    }

    // General recommendations
    if (security.status === 'warning' && quality.status === 'warning') {
      recommendations.push('Manual code review recommended due to validation failure');
    } else if (security.score < 80 || quality.score < 80) {
      recommendations.push('📋 Consider code review before deployment');
    }
    if (qualityWarnings.length > 5) {
      recommendations.push(`📝 Address ${qualityWarnings.length} code style warnings`);
    }

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }

  /**
   * Quick validation for simple code snippets
   */
  async quickValidate(
    code: string,
    type = 'typescript'
  ): Promise<{ isValid: boolean; issues: string[]; score: number }> {
    const generatedCode: GeneratedCode = {
      files: [
        {
          path: `temp.${type === 'typescript' ? 'ts' : 'js'}`,
          content: code,
          type,
        },
      ],
    };

    const result = await this.validateGeneratedCode(generatedCode);

    return {
      isValid: result.isValid,
      issues: [
        ...result.security.issues.map(i => `Security: ${i.message}`),
        ...result.quality.issues.map(i => `Quality: ${i.message}`),
      ].slice(0, 10),
      score: result.overallScore,
    };
  }
}
