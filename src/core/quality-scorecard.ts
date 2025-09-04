#!/usr/bin/env node

import { SecurityScanResult } from './security-scanner.js';
import { StaticAnalysisResult } from './static-analyzer.js';

export interface QualityScorecard {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'pass' | 'fail' | 'warning';
  };
  security: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    vulnerabilities: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  coverage: {
    lineCoverage: number;
    branchCoverage: number;
    functionCoverage: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  complexity: {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    duplication: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    efficiency: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  business: {
    costPrevention: number;
    timeSaved: number;
    userSatisfaction: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  quality: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'pass' | 'fail' | 'warning';
  };
  production: {
    securityScan: boolean;
    performanceTest: boolean;
    documentationComplete: boolean;
    deploymentReady: boolean;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  recommendations: string[];
  issues: QualityIssue[];
}

export interface QualityIssue {
  id: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  category: 'security' | 'coverage' | 'complexity' | 'performance' | 'business';
  message: string;
  file?: string;
  line?: number;
  fix: string;
}

export interface QualityMetrics {
  testCoverage: number;
  securityScore: number;
  complexityScore: number;
  maintainabilityScore: number;
  responseTime: number;
  memoryUsage: number;
  businessValue: number;
}

export class QualityScorecardGenerator {
  /**
   * Generate comprehensive quality scorecard
   */
  generateScorecard(
    securityResult: SecurityScanResult,
    staticResult: StaticAnalysisResult,
    coverageMetrics: { line: number; branch: number; function: number },
    performanceMetrics: { responseTime: number; memoryUsage: number },
    businessMetrics: { costPrevention: number; timeSaved: number; userSatisfaction: number }
  ): QualityScorecard {
    // Calculate individual scores
    const securityScore = this.calculateSecurityScore(securityResult);
    const coverageScore = this.calculateCoverageScore(coverageMetrics);
    const complexityScore = this.calculateComplexityScore(staticResult.metrics);
    const performanceScore = this.calculatePerformanceScore(performanceMetrics);
    const businessScore = this.calculateBusinessScore(businessMetrics);

    // Calculate overall score
    const overallScore = Math.round(
      (securityScore.score +
        coverageScore.score +
        complexityScore.score +
        performanceScore.score +
        businessScore.score) /
        5
    );

    // Generate grades
    const securityGrade = this.calculateGrade(securityScore.score);
    const coverageGrade = this.calculateGrade(coverageScore.score);
    const complexityGrade = this.calculateGrade(complexityScore.score);
    const performanceGrade = this.calculateGrade(performanceScore.score);
    const businessGrade = this.calculateGrade(businessScore.score);
    const overallGrade = this.calculateGrade(overallScore);

    // Determine overall status
    const overallStatus = this.determineOverallStatus(
      securityResult,
      staticResult,
      coverageMetrics,
      performanceMetrics
    );

    // Generate recommendations and issues
    const recommendations = this.generateRecommendations(
      securityResult,
      staticResult,
      coverageMetrics,
      performanceMetrics,
      businessMetrics
    );

    const issues = this.generateIssues(
      securityResult,
      staticResult,
      coverageMetrics,
      performanceMetrics
    );

    return {
      overall: {
        score: overallScore,
        grade: overallGrade,
        status: overallStatus,
      },
      security: {
        score: securityScore.score,
        grade: securityGrade,
        vulnerabilities: securityResult.summary.total,
        critical: securityResult.summary.critical,
        high: securityResult.summary.high,
        moderate: securityResult.summary.moderate,
        low: securityResult.summary.low,
      },
      coverage: {
        lineCoverage: coverageMetrics.line,
        branchCoverage: coverageMetrics.branch,
        functionCoverage: coverageMetrics.function,
        grade: coverageGrade,
      },
      complexity: {
        cyclomaticComplexity: staticResult.metrics.complexity,
        maintainabilityIndex: staticResult.metrics.maintainability,
        duplication: staticResult.metrics.duplication,
        grade: complexityGrade,
      },
      performance: {
        responseTime: performanceMetrics.responseTime,
        memoryUsage: performanceMetrics.memoryUsage,
        efficiency: performanceScore.score,
        grade: performanceGrade,
      },
      business: {
        costPrevention: businessMetrics.costPrevention,
        timeSaved: businessMetrics.timeSaved,
        userSatisfaction: businessMetrics.userSatisfaction,
        grade: businessGrade,
      },
      quality: {
        score: Math.round((coverageScore.score + complexityScore.score) / 2),
        grade: this.calculateGrade(Math.round((coverageScore.score + complexityScore.score) / 2)),
        status:
          coverageMetrics.line >= 85 && staticResult.metrics.complexity <= 10 ? 'pass' : 'fail',
      },
      production: {
        securityScan: securityResult.summary.critical === 0 && securityResult.summary.high === 0,
        performanceTest:
          performanceMetrics.responseTime <= 100 && performanceMetrics.memoryUsage <= 256,
        documentationComplete: true, // Assume complete for now
        deploymentReady:
          securityResult.summary.critical === 0 && performanceMetrics.responseTime <= 100,
        grade: this.calculateGrade(Math.round((securityScore.score + performanceScore.score) / 2)),
      },
      recommendations,
      issues,
    };
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(securityResult: SecurityScanResult): { score: number } {
    const { critical, high, moderate, low } = securityResult.summary;

    // Penalize based on vulnerability severity
    let score = 100;
    score -= critical * 25; // -25 points per critical
    score -= high * 15; // -15 points per high
    score -= moderate * 5; // -5 points per moderate
    score -= low * 1; // -1 point per low

    return { score: Math.max(0, Math.round(score)) };
  }

  /**
   * Calculate coverage score
   */
  private calculateCoverageScore(coverage: { line: number; branch: number; function: number }): {
    score: number;
  } {
    const avgCoverage = (coverage.line + coverage.branch + coverage.function) / 3;
    return { score: Math.round(avgCoverage) };
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(metrics: {
    complexity: number;
    maintainability: number;
    duplication: number;
  }): { score: number } {
    // Weight maintainability index heavily, penalize high complexity and duplication
    let score = metrics.maintainability;

    // Penalize high complexity
    if (metrics.complexity > 10) {
      score -= (metrics.complexity - 10) * 2;
    }

    // Penalize high duplication
    if (metrics.duplication > 5) {
      score -= (metrics.duplication - 5) * 3;
    }

    return { score: Math.max(0, Math.round(score)) };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(metrics: { responseTime: number; memoryUsage: number }): {
    score: number;
  } {
    let score = 100;

    // Penalize slow response times
    if (metrics.responseTime > 100) {
      score -= (metrics.responseTime - 100) / 10;
    }

    // Penalize high memory usage
    if (metrics.memoryUsage > 256) {
      score -= (metrics.memoryUsage - 256) / 10;
    }

    return { score: Math.max(0, Math.round(score)) };
  }

  /**
   * Calculate business score
   */
  private calculateBusinessScore(metrics: {
    costPrevention: number;
    timeSaved: number;
    userSatisfaction: number;
  }): { score: number } {
    // Normalize business metrics to 0-100 scale
    const costScore = Math.min(100, (metrics.costPrevention / 10000) * 100);
    const timeScore = Math.min(100, (metrics.timeSaved / 10) * 100);
    const satisfactionScore = metrics.userSatisfaction;

    return { score: Math.round((costScore + timeScore + satisfactionScore) / 3) };
  }

  /**
   * Calculate grade from score
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(
    securityResult: SecurityScanResult,
    staticResult: StaticAnalysisResult,
    coverage: { line: number; branch: number; function: number },
    performance: { responseTime: number; memoryUsage: number }
  ): 'pass' | 'fail' | 'warning' {
    // Fail if critical security issues or high complexity
    if (securityResult.summary.critical > 0 || staticResult.summary.error > 0) {
      return 'fail';
    }

    // Fail if high severity issues or low coverage (changed from warning to fail)
    if (
      securityResult.summary.high > 0 ||
      staticResult.summary.warning > 5 ||
      coverage.line < 85 ||
      performance.responseTime > 300
    ) {
      return 'fail';
    }

    return 'pass';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    securityResult: SecurityScanResult,
    staticResult: StaticAnalysisResult,
    coverage: { line: number; branch: number; function: number },
    performance: { responseTime: number; memoryUsage: number },
    business: { costPrevention: number; timeSaved: number; userSatisfaction: number }
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (securityResult.summary.critical > 0) {
      recommendations.push('Address critical security vulnerabilities immediately');
    }
    if (securityResult.summary.high > 0) {
      recommendations.push('Fix high-severity security issues');
    }
    if (securityResult.summary.moderate > 0) {
      recommendations.push('Review and fix moderate security issues');
    }

    // Coverage recommendations
    if (coverage.line < 85) {
      recommendations.push(`Improve test coverage from ${coverage.line}% to at least 85%`);
    }
    if (coverage.branch < 85) {
      recommendations.push(`Improve branch coverage from ${coverage.branch}% to at least 85%`);
    }

    // Complexity recommendations
    if (staticResult.metrics.complexity > 10) {
      recommendations.push('Reduce cyclomatic complexity by refactoring complex functions');
    }
    if (staticResult.metrics.maintainability < 70) {
      recommendations.push(
        'Improve code maintainability through better structure and documentation'
      );
    }
    if (staticResult.metrics.duplication > 5) {
      recommendations.push('Reduce code duplication by extracting common functionality');
    }

    // Performance recommendations
    if (performance.responseTime > 100) {
      recommendations.push(
        `Performance optimization: Reduce response time from ${performance.responseTime}ms to under 100ms`
      );
    }
    if (performance.memoryUsage > 256) {
      recommendations.push(
        `Performance optimization: Reduce memory usage from ${performance.memoryUsage}MB to under 256MB`
      );
    }

    // Business recommendations
    if (business.userSatisfaction < 90) {
      recommendations.push('Improve user satisfaction through better UX and performance');
    }
    if (business.costPrevention < 10000) {
      recommendations.push('Focus on cost prevention through better quality and automation');
    }

    // Default recommendation if all is well
    if (recommendations.length === 0) {
      recommendations.push('Project meets all quality standards - ready for production');
    }

    return recommendations;
  }

  /**
   * Generate quality issues
   */
  private generateIssues(
    securityResult: SecurityScanResult,
    staticResult: StaticAnalysisResult,
    coverage: { line: number; branch: number; function: number },
    performance: { responseTime: number; memoryUsage: number }
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Security issues
    for (const vuln of securityResult.vulnerabilities) {
      issues.push({
        id: vuln.id,
        severity: vuln.severity,
        category: 'security',
        message: vuln.description,
        fix: vuln.fix ?? 'No fix available',
      });
    }

    // Static analysis issues
    for (const issue of staticResult.issues) {
      issues.push({
        id: issue.id,
        severity:
          issue.severity === 'error' ? 'high' : issue.severity === 'warning' ? 'moderate' : 'low',
        category: 'complexity',
        message: issue.message,
        file: issue.file,
        line: issue.line,
        fix: issue.fix ?? 'No fix available',
      });
    }

    // Coverage issues
    if (coverage.line < 85) {
      issues.push({
        id: 'low-line-coverage',
        severity: 'moderate',
        category: 'coverage',
        message: `Line coverage ${coverage.line}% is below 85% requirement`,
        fix: 'Add more unit tests to improve coverage',
      });
    }

    if (coverage.branch < 85) {
      issues.push({
        id: 'low-branch-coverage',
        severity: 'moderate',
        category: 'coverage',
        message: `Branch coverage ${coverage.branch}% is below 85% requirement`,
        fix: 'Add tests for all code branches',
      });
    }

    // Performance issues
    if (performance.responseTime > 100) {
      issues.push({
        id: 'slow-response',
        severity: 'moderate',
        category: 'performance',
        message: `Response time ${performance.responseTime}ms exceeds 100ms target`,
        fix: 'Optimize code and reduce processing time',
      });
    }

    if (performance.memoryUsage > 256) {
      issues.push({
        id: 'high-memory-usage',
        severity: 'moderate',
        category: 'performance',
        message: `Memory usage ${performance.memoryUsage}MB exceeds 256MB target`,
        fix: 'Optimize memory usage and reduce allocations',
      });
    }

    return issues;
  }
}
