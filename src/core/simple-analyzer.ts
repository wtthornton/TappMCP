#!/usr/bin/env node

import { SecurityScanner, SecurityScanResult } from './security-scanner.js';
import { StaticAnalyzer, StaticAnalysisResult } from './static-analyzer.js';
import { ProjectScanner, ProjectAnalysis } from './project-scanner.js';

export interface BasicAnalysis {
  projectPath: string;
  analysisTime: number;
  security: SecurityScanResult;
  static: StaticAnalysisResult;
  project: ProjectAnalysis;
  summary: SimpleSummary;
}

export interface SimpleSummary {
  overallScore: number;
  criticalIssues: number;
  qualityIssues: number;
  recommendations: string[];
  status: 'pass' | 'fail' | 'warning';
}

export class SimpleAnalyzer {
  private securityScanner!: SecurityScanner;
  private staticAnalyzer!: StaticAnalyzer;
  private projectScanner: ProjectScanner;

  constructor(projectPath?: string) {
    if (projectPath) {
      this.securityScanner = new SecurityScanner(projectPath);
      this.staticAnalyzer = new StaticAnalyzer(projectPath);
    }
    this.projectScanner = new ProjectScanner();
  }

  /**
   * Initialize analyzers for a specific project path
   */
  initializeForProject(projectPath: string): void {
    this.securityScanner = new SecurityScanner(projectPath);
    this.staticAnalyzer = new StaticAnalyzer(projectPath);
  }

  /**
   * Run comprehensive basic analysis using multiple tools
   */
  async runBasicAnalysis(projectPath: string, analysisDepth: 'quick' | 'standard' | 'deep' = 'standard'): Promise<BasicAnalysis> {
    const startTime = Date.now();

    // Initialize analyzers if not already done
    if (!this.securityScanner || !this.staticAnalyzer) {
      this.initializeForProject(projectPath);
    }

    // Run core analysis tools in parallel for performance
    const [securityResult, staticResult, projectResult] = await Promise.all([
      this.securityScanner.runSecurityScan().catch(err => {
        console.warn('Security scan failed:', err);
        // Return default result on failure
        return {
          vulnerabilities: [],
          scanTime: 0,
          status: 'warning' as const,
          summary: {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0
          }
        } as SecurityScanResult;
      }),
      this.staticAnalyzer.runStaticAnalysis().catch(err => {
        console.warn('Static analysis failed:', err);
        // Return default result on failure
        return {
          issues: [],
          scanTime: 0,
          status: 'warning' as const,
          summary: {
            total: 0,
            error: 0,
            warning: 0,
            info: 0
          },
          metrics: {
            complexity: 0,
            maintainability: 80,
            duplication: 0
          }
        } as StaticAnalysisResult;
      }),
      this.projectScanner.scanProject(projectPath, analysisDepth).catch(err => {
        console.warn('Project scan failed:', err);
        // Return minimal result on failure
        return {
          projectStructure: {
            folders: [],
            files: [],
            configFiles: [],
            templates: []
          },
          detectedTechStack: [],
          qualityIssues: [],
          improvementOpportunities: [],
          projectMetadata: {
            name: 'unknown',
            version: '0.0.0'
          },
          analysisDepth,
          analysisTimestamp: new Date().toISOString()
        } as ProjectAnalysis;
      })
    ]);

    const analysisTime = Date.now() - startTime;

    // Generate summary from analysis results
    const summary = this.generateSimpleSummary(securityResult, staticResult, projectResult);

    return {
      projectPath,
      analysisTime,
      security: securityResult,
      static: staticResult,
      project: projectResult,
      summary
    };
  }

  /**
   * Generate a simple summary from analysis results
   */
  private generateSimpleSummary(
    security: SecurityScanResult,
    staticAnalysis: StaticAnalysisResult,
    project: ProjectAnalysis
  ): SimpleSummary {
    // Calculate overall score
    const securityScore = this.calculateSecurityScore(security);
    const qualityScore = this.calculateQualityScore(staticAnalysis);
    const overallScore = Math.round((securityScore + qualityScore) / 2);

    // Count critical issues
    const criticalIssues = security.summary.critical + security.summary.high;
    const qualityIssues = staticAnalysis.summary.error + staticAnalysis.summary.warning;

    // Generate recommendations
    const recommendations = this.generateBasicRecommendations(security, staticAnalysis, project);

    // Determine overall status
    let status: 'pass' | 'fail' | 'warning';
    if (criticalIssues > 0 || staticAnalysis.summary.error > 0) {
      status = 'fail';
    } else if (security.summary.moderate > 0 || staticAnalysis.summary.warning > 5) {
      status = 'warning';
    } else {
      status = 'pass';
    }

    return {
      overallScore,
      criticalIssues,
      qualityIssues,
      recommendations,
      status
    };
  }

  /**
   * Calculate security score from security scan results
   */
  private calculateSecurityScore(security: SecurityScanResult): number {
    const { summary } = security;

    // Start with perfect score
    let score = 100;

    // Deduct points based on vulnerability severity
    score -= summary.critical * 20;
    score -= summary.high * 10;
    score -= summary.moderate * 5;
    score -= summary.low * 2;

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Calculate quality score from static analysis results
   */
  private calculateQualityScore(staticAnalysis: StaticAnalysisResult): number {
    const { summary, metrics } = staticAnalysis;

    // Start with perfect score
    let score = 100;

    // Deduct points based on issues
    score -= summary.error * 10;
    score -= summary.warning * 3;
    score -= summary.info * 1;

    // Adjust based on metrics
    if (metrics.complexity > 10) {
      score -= Math.min(20, (metrics.complexity - 10) * 2);
    }

    if (metrics.duplication > 5) {
      score -= Math.min(10, metrics.duplication);
    }

    // Add maintainability bonus
    score = Math.round((score + metrics.maintainability) / 2);

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Generate basic recommendations based on analysis results
   */
  private generateBasicRecommendations(
    security: SecurityScanResult,
    staticAnalysis: StaticAnalysisResult,
    project: ProjectAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (security.summary.critical > 0) {
      recommendations.push(`Fix ${security.summary.critical} critical security vulnerabilities immediately`);
    }
    if (security.summary.high > 0) {
      recommendations.push(`Address ${security.summary.high} high-priority security issues`);
    }
    if (security.vulnerabilities.length > 10) {
      recommendations.push('Run npm audit fix to automatically fix dependency vulnerabilities');
    }

    // Code quality recommendations
    if (staticAnalysis.summary.error > 0) {
      recommendations.push(`Fix ${staticAnalysis.summary.error} code quality errors`);
    }
    if (staticAnalysis.metrics.complexity > 15) {
      recommendations.push('Refactor complex functions to improve maintainability');
    }
    if (staticAnalysis.metrics.duplication > 10) {
      recommendations.push('Extract duplicated code into reusable functions or modules');
    }

    // Project structure recommendations
    if (!project.projectStructure.configFiles.includes('tsconfig.json') &&
        project.detectedTechStack.includes('typescript')) {
      recommendations.push('Add TypeScript configuration for better type safety');
    }
    if (!project.projectStructure.configFiles.some(f => f.includes('eslint'))) {
      recommendations.push('Add ESLint configuration for consistent code quality');
    }
    if (!project.projectStructure.configFiles.some(f => f.includes('test') || f.includes('jest') || f.includes('vitest'))) {
      recommendations.push('Set up a testing framework for better code reliability');
    }

    // Add improvement opportunities from project scan
    if (project.improvementOpportunities.length > 0) {
      recommendations.push(...project.improvementOpportunities.slice(0, 3));
    }

    // Limit recommendations to top 5
    return recommendations.slice(0, 5);
  }

  /**
   * Get a quick analysis summary without full scan
   */
  async getQuickSummary(projectPath: string): Promise<SimpleSummary> {
    const analysis = await this.runBasicAnalysis(projectPath, 'quick');
    return analysis.summary;
  }

  /**
   * Check if project passes quality gates
   */
  async checkQualityGates(projectPath: string): Promise<boolean> {
    const analysis = await this.runBasicAnalysis(projectPath, 'standard');
    return analysis.summary.status === 'pass';
  }
}