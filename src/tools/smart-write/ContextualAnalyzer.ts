/**
 * Contextual Analyzer for Smart Write Tool
 *
 * Handles Context7 integration, project analysis, and contextual insights
 * for intelligent code generation. Extracted from smart-write for better modularity.
 */

import { Context7Cache } from '../../core/context7-cache.js';
import { enhanceWithContext7 } from '../../utils/context7-enhancer.js';
import { SimpleAnalyzer } from '../../core/simple-analyzer.js';
import { SecurityScanner } from '../../core/security-scanner.js';
import { StaticAnalyzer } from '../../core/static-analyzer.js';
import { Context7ProjectAnalyzer } from '../../core/context7-project-analyzer.js';

/**
 * Business context interface for code generation
 */
export interface BusinessContext {
  goals?: string[];
  targetUsers?: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Enhanced input with contextual analysis
 */
export interface EnhancedInput {
  projectId: string;
  featureDescription: string;
  targetRole: string;
  codeType: string;
  techStack: string[];
  businessContext?: BusinessContext;
  qualityRequirements?: any;
  quality: string;
  projectPath?: string;
  writeMode: string;
  backupOriginal: boolean;
  modificationStrategy: string;
  externalSources: any;
  projectAnalysis?: any;
  context7Insights?: any;
}

/**
 * Project analysis result
 */
export interface ProjectAnalysisResult {
  security: any;
  static: any;
  simple: any;
  project: {
    detectedTechStack: string[];
    qualityIssues: string[];
  };
  summary: {
    status: 'pass' | 'warning' | 'fail';
    overallScore: number;
    criticalIssues: number;
    recommendations: string[];
  };
}

/**
 * Context7 project data structure
 */
export interface Context7ProjectData {
  topics: string[];
  data: any[];
  insights: {
    patterns: string[];
    bestPractices: string[];
    warnings: string[];
    recommendations: string[];
    techStackSpecific: any;
  };
  metadata: {
    fetchTime: number;
  };
}

/**
 * Contextual Analyzer for smart code generation
 */
export class ContextualAnalyzer {
  private cache = new Context7Cache();
  private simpleAnalyzer = new SimpleAnalyzer();
  private securityScanner!: SecurityScanner;
  private staticAnalyzer!: StaticAnalyzer;
  private context7ProjectAnalyzer = new Context7ProjectAnalyzer();

  /**
   * Perform comprehensive project analysis
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysisResult | null> {
    if (!projectPath) {
      return null;
    }

    try {
      console.log(`Analyzing project: ${projectPath}`);

      // Initialize analyzers for this project
      this.simpleAnalyzer.initializeForProject(projectPath);
      this.securityScanner = new SecurityScanner(projectPath);
      this.staticAnalyzer = new StaticAnalyzer(projectPath);

      // Run comprehensive analysis
      const simpleResults = await this.simpleAnalyzer.runBasicAnalysis(projectPath, 'standard');

      // Extract individual results from the comprehensive analysis
      const securityResults = simpleResults.security;
      const staticResults = simpleResults.static;

      // Combine results into comprehensive analysis
      const detectedTechStack = this.extractTechStack(simpleResults, staticResults);
      const qualityIssues = this.extractQualityIssues(securityResults, staticResults);

      const overallScore = this.calculateOverallScore(
        securityResults,
        staticResults,
        simpleResults
      );

      const status = this.determineProjectStatus(overallScore, securityResults, qualityIssues);
      const recommendations = this.generateRecommendations(
        securityResults,
        staticResults,
        simpleResults
      );

      return {
        security: securityResults,
        static: staticResults,
        simple: simpleResults,
        project: {
          detectedTechStack,
          qualityIssues
        },
        summary: {
          status,
          overallScore,
          criticalIssues: this.countCriticalIssues(securityResults, qualityIssues),
          recommendations
        }
      };
    } catch (error) {
      console.error('Project analysis failed:', error);
      return null;
    }
  }

  /**
   * Fetch Context7 project insights
   */
  async fetchContext7ProjectData(
    input: any,
    projectAnalysis: ProjectAnalysisResult | null
  ): Promise<Context7ProjectData | null> {
    if (!input.externalSources?.useContext7) {
      return null;
    }

    try {
      const context7Data = await enhanceWithContext7({
        featureDescription: input.featureDescription,
        role: input.targetRole,
        techStack: input.techStack?.length > 0 ? input.techStack : ['generic'],
        businessGoals: input.businessContext?.goals || [],
        priority: input.businessContext?.priority || 'medium',
      }, input.featureDescription, { maxResults: 3 });

      // Transform Context7 data into structured insights
      const insights = this.extractContext7Insights(context7Data, projectAnalysis);

      return {
        topics: [], // Context7 data structure doesn't have topics
        data: context7Data?.context7Data || [],
        insights,
        metadata: {
          fetchTime: context7Data?.enhancementMetadata?.timestamp || Date.now()
        }
      };
    } catch (error) {
      console.warn('Context7 integration failed:', error);
      return null;
    }
  }

  /**
   * Create enhanced input with all contextual analysis
   */
  async enhanceInput(
    input: any,
    projectAnalysis: ProjectAnalysisResult | null,
    context7ProjectData: Context7ProjectData | null
  ): Promise<EnhancedInput> {
    return {
      ...input,
      featureDescription: input.featureDescription, // Ensure required field is present
      targetRole: input.targetRole, // Ensure required field is present
      projectAnalysis: projectAnalysis ? {
        techStack: projectAnalysis.project.detectedTechStack,
        qualityIssues: projectAnalysis.project.qualityIssues,
        recommendations: projectAnalysis.summary.recommendations,
        securityLevel: this.determineSecurityLevel(projectAnalysis)
      } : null,
      context7Insights: context7ProjectData ? {
        patterns: context7ProjectData.insights.patterns,
        bestPractices: context7ProjectData.insights.bestPractices,
        warnings: context7ProjectData.insights.warnings,
        recommendations: context7ProjectData.insights.recommendations,
        techStackSpecific: context7ProjectData.insights.techStackSpecific,
      } : null,
    };
  }

  /**
   * Private helper methods
   */
  private extractTechStack(simpleResults: any, staticResults: any): string[] {
    const techStack = new Set<string>();

    // Extract from simple analysis
    if (simpleResults?.detectedLanguages) {
      simpleResults.detectedLanguages.forEach((lang: string) => techStack.add(lang));
    }

    // Extract from static analysis
    if (staticResults?.frameworks) {
      staticResults.frameworks.forEach((framework: string) => techStack.add(framework));
    }

    if (staticResults?.dependencies) {
      // Add major dependencies as tech stack components
      const majorDeps = ['react', 'express', 'typescript', 'node', 'python', 'java'];
      Object.keys(staticResults.dependencies).forEach(dep => {
        if (majorDeps.some(major => dep.toLowerCase().includes(major))) {
          techStack.add(dep);
        }
      });
    }

    return Array.from(techStack);
  }

  private extractQualityIssues(securityResults: any, staticResults: any): string[] {
    const issues: string[] = [];

    // Extract security issues
    if (securityResults?.vulnerabilities) {
      issues.push(...securityResults.vulnerabilities.map((vuln: any) =>
        `Security: ${vuln.type || vuln.message}`
      ));
    }

    // Extract static analysis issues
    if (staticResults?.issues) {
      issues.push(...staticResults.issues.map((issue: any) =>
        `Code Quality: ${issue.type || issue.message}`
      ));
    }

    return issues;
  }

  private calculateOverallScore(
    securityResults: any,
    staticResults: any,
    simpleResults: any
  ): number {
    const securityScore = securityResults?.score || 70;
    const staticScore = staticResults?.score || 70;
    const simpleScore = simpleResults?.score || 70;

    // Weighted average: security 40%, static 35%, simple 25%
    return Math.round(securityScore * 0.4 + staticScore * 0.35 + simpleScore * 0.25);
  }

  private determineProjectStatus(
    overallScore: number,
    securityResults: any,
    qualityIssues: string[]
  ): 'pass' | 'warning' | 'fail' {
    // Critical security issues = fail
    if (securityResults?.criticalVulnerabilities > 0) {
      return 'fail';
    }

    // Low overall score = fail
    if (overallScore < 60) {
      return 'fail';
    }

    // Multiple quality issues = warning
    if (qualityIssues.length > 5) {
      return 'warning';
    }

    // Medium score = warning
    if (overallScore < 80) {
      return 'warning';
    }

    return 'pass';
  }

  private generateRecommendations(
    securityResults: any,
    staticResults: any,
    simpleResults: any
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (securityResults?.recommendations) {
      recommendations.push(...securityResults.recommendations.slice(0, 3));
    }

    // Static analysis recommendations
    if (staticResults?.suggestions) {
      recommendations.push(...staticResults.suggestions.slice(0, 3));
    }

    // Simple analysis recommendations
    if (simpleResults?.suggestions) {
      recommendations.push(...simpleResults.suggestions.slice(0, 2));
    }

    // Default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push(
        'Add comprehensive test coverage',
        'Implement proper error handling',
        'Use TypeScript for better type safety'
      );
    }

    return recommendations;
  }

  private countCriticalIssues(securityResults: any, qualityIssues: string[]): number {
    let criticalCount = 0;

    // Count critical security vulnerabilities
    if (securityResults?.criticalVulnerabilities) {
      criticalCount += securityResults.criticalVulnerabilities;
    }

    // Count critical quality issues (those mentioning "critical" or "error")
    criticalCount += qualityIssues.filter(issue =>
      issue.toLowerCase().includes('critical') || issue.toLowerCase().includes('error')
    ).length;

    return criticalCount;
  }

  private determineSecurityLevel(projectAnalysis: ProjectAnalysisResult): 'low' | 'medium' | 'high' {
    if (projectAnalysis.summary.status === 'fail') {
      return 'high';
    } else if (projectAnalysis.summary.status === 'warning') {
      return 'medium';
    }
    return 'low';
  }

  private extractContext7Insights(
    context7Data: any,
    projectAnalysis: ProjectAnalysisResult | null
  ): Context7ProjectData['insights'] {
    const insights = {
      patterns: [] as string[],
      bestPractices: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[],
      techStackSpecific: {} as any
    };

    if (!context7Data) {
      return insights;
    }

    // Extract patterns from Context7 data
    if (context7Data.insights?.patterns) {
      insights.patterns = context7Data.insights.patterns;
    }

    // Extract best practices
    if (context7Data.insights?.bestPractices) {
      insights.bestPractices = context7Data.insights.bestPractices;
    }

    // Extract warnings
    if (context7Data.insights?.warnings) {
      insights.warnings = context7Data.insights.warnings;
    }

    // Extract recommendations
    if (context7Data.insights?.recommendations) {
      insights.recommendations = context7Data.insights.recommendations;
    }

    // Combine with project analysis insights
    if (projectAnalysis) {
      insights.recommendations.push(...projectAnalysis.summary.recommendations.slice(0, 2));

      // Add tech stack specific insights
      projectAnalysis.project.detectedTechStack.forEach(tech => {
        insights.techStackSpecific[tech] = {
          detected: true,
          recommendations: context7Data.insights?.techStackSpecific?.[tech] || []
        };
      });
    }

    return insights;
  }
}