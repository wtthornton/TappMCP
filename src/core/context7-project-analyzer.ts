#!/usr/bin/env node

import { Context7Cache } from './context7-cache.js';
import { BasicAnalysis } from './simple-analyzer.js';

export interface Context7Data {
  topics: string[];
  data: Array<{
    topic: string;
    content: any;
    relevance: number;
    timestamp: string;
  }>;
  insights: Context7Insights;
  metadata: {
    totalResults: number;
    fetchTime: number;
    cacheHits: number;
  };
}

export interface Context7Insights {
  patterns: string[];
  bestPractices: string[];
  warnings: string[];
  recommendations: string[];
  techStackSpecific: Record<string, string[]>;
}

export class Context7ProjectAnalyzer {
  private context7Cache: Context7Cache;

  constructor() {
    this.context7Cache = new Context7Cache({
      maxCacheSize: 200,
      defaultExpiryHours: 48,
      enableHitTracking: true,
    });
  }

  /**
   * Get project-aware Context7 data based on analysis results
   */
  async getProjectAwareContext(projectAnalysis: BasicAnalysis): Promise<Context7Data> {
    const startTime = Date.now();

    // Generate dynamic topics based on real project analysis
    const topics = this.generateDynamicTopics(projectAnalysis);

    // Get Context7 data for multiple topics in parallel
    const context7Promises = topics.map(topic =>
      this.context7Cache.getRelevantData({
        businessRequest: topic,
        projectId: projectAnalysis.projectPath,
        domain: projectAnalysis.project.detectedTechStack[0] || 'general',
        priority: 'high',
        maxResults: 5,
      }).catch(err => {
        console.warn(`Failed to fetch Context7 data for topic: ${topic}`, err);
        return null;
      })
    );

    const context7Results = await Promise.all(context7Promises);

    // Filter out failed requests
    const validResults = context7Results.filter(r => r !== null);

    // Merge and synthesize Context7 data
    const mergedData = this.mergeContext7Data(validResults);
    const insights = this.synthesizeContext7Insights(mergedData, projectAnalysis);

    const fetchTime = Date.now() - startTime;

    return {
      topics,
      data: mergedData,
      insights,
      metadata: {
        totalResults: mergedData.length,
        fetchTime,
        cacheHits: this.context7Cache.getCacheStats().hitRate * validResults.length,
      },
    };
  }

  /**
   * Generate dynamic topics based on project analysis
   */
  private generateDynamicTopics(analysis: BasicAnalysis): string[] {
    const topics: string[] = [];

    // Tech stack specific topics
    if (analysis.project.detectedTechStack.length > 0) {
      const primaryTech = analysis.project.detectedTechStack[0];
      topics.push(`advanced patterns for ${primaryTech} applications`);
      topics.push(`security best practices for ${analysis.project.detectedTechStack.join(', ')} projects`);
      topics.push(`performance optimization for ${primaryTech}`);
    }

    // Quality issue specific topics
    if (analysis.static.issues.length > 0) {
      const issueTypes = [...new Set(analysis.static.issues.map(i => i.severity))];
      topics.push(`solutions for ${issueTypes.join(' and ')} code quality issues`);
    }

    // Security specific topics
    if (analysis.security.vulnerabilities.length > 0) {
      topics.push(`vulnerability remediation for ${analysis.security.summary.critical} critical and ${analysis.security.summary.high} high severity issues`);

      // Get unique vulnerability types
      const vulnTypes = [...new Set(analysis.security.vulnerabilities.map(v => v.package))];
      if (vulnTypes.length > 0) {
        topics.push(`dependency security for ${vulnTypes.slice(0, 3).join(', ')}`);
      }
    }

    // Complexity and maintainability topics
    if (analysis.static.metrics.complexity > 10) {
      topics.push('refactoring strategies for high complexity code');
      topics.push('design patterns for maintainable architecture');
    }

    // Duplication topics
    if (analysis.static.metrics.duplication > 5) {
      topics.push('code reuse patterns and DRY principles');
    }

    // Project structure topics
    if (!analysis.project.projectStructure.configFiles.includes('tsconfig.json') &&
        analysis.project.detectedTechStack.includes('typescript')) {
      topics.push('TypeScript migration best practices');
    }

    // Testing topics
    const hasTests = analysis.project.projectStructure.folders.some(f =>
      f.includes('test') || f.includes('spec')
    );
    if (!hasTests) {
      topics.push('test-driven development implementation strategies');
    }

    // Add general improvement topic
    topics.push('continuous improvement and code quality metrics');

    // Limit to top 10 topics
    return topics.slice(0, 10);
  }

  /**
   * Merge Context7 data from multiple sources
   */
  private mergeContext7Data(results: any[]): Array<{
    topic: string;
    content: any;
    relevance: number;
    timestamp: string;
  }> {
    const mergedData: Array<{
      topic: string;
      content: any;
      relevance: number;
      timestamp: string;
    }> = [];

    for (const result of results) {
      if (result && result.data) {
        for (const item of result.data) {
          mergedData.push({
            topic: result.businessRequest || 'general',
            content: item,
            relevance: item.relevance || 0.5,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Sort by relevance and take top results
    mergedData.sort((a, b) => b.relevance - a.relevance);
    return mergedData.slice(0, 20);
  }

  /**
   * Synthesize insights from Context7 data and project analysis
   */
  private synthesizeContext7Insights(
    context7Data: Array<{ topic: string; content: any; relevance: number; timestamp: string }>,
    projectAnalysis: BasicAnalysis
  ): Context7Insights {
    const patterns: string[] = [];
    const bestPractices: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const techStackSpecific: Record<string, string[]> = {};

    // Extract patterns from Context7 data
    for (const item of context7Data) {
      if (item.content) {
        // Extract patterns (simplified - in real implementation would use NLP)
        if (item.topic.includes('pattern')) {
          patterns.push(`Apply ${item.topic} to improve code structure`);
        }

        // Extract best practices
        if (item.topic.includes('best practice') || item.topic.includes('security')) {
          bestPractices.push(`Follow ${item.topic} guidelines`);
        }
      }
    }

    // Generate warnings based on analysis
    if (projectAnalysis.summary.criticalIssues > 0) {
      warnings.push(`Critical security issues detected - immediate action required`);
    }

    if (projectAnalysis.static.metrics.complexity > 15) {
      warnings.push(`High complexity detected - consider refactoring`);
    }

    if (projectAnalysis.security.summary.critical > 0) {
      warnings.push(`${projectAnalysis.security.summary.critical} critical vulnerabilities need immediate attention`);
    }

    // Generate recommendations combining Context7 and analysis
    recommendations.push(...projectAnalysis.summary.recommendations);

    // Add Context7-enhanced recommendations
    if (context7Data.length > 0) {
      recommendations.push('Apply Context7 insights to improve code quality');
      recommendations.push('Review suggested patterns for your tech stack');
    }

    // Tech stack specific insights
    for (const tech of projectAnalysis.project.detectedTechStack) {
      techStackSpecific[tech] = [];

      // Find relevant Context7 data for this tech
      const techData = context7Data.filter(d =>
        d.topic.toLowerCase().includes(tech.toLowerCase())
      );

      if (techData.length > 0) {
        techStackSpecific[tech].push(`${techData.length} Context7 insights available for ${tech}`);
        techStackSpecific[tech].push(`Apply ${tech}-specific best practices`);
      }

      // Add analysis-based insights
      if (tech === 'typescript' && projectAnalysis.static.metrics.complexity > 10) {
        techStackSpecific[tech].push('Use TypeScript strict mode to catch more errors');
        techStackSpecific[tech].push('Consider using type guards for better type safety');
      }

      if (tech === 'react' || tech === 'vue') {
        techStackSpecific[tech].push('Implement component testing strategy');
        techStackSpecific[tech].push('Use performance optimization techniques');
      }
    }

    return {
      patterns: patterns.slice(0, 5),
      bestPractices: bestPractices.slice(0, 5),
      warnings: warnings.slice(0, 5),
      recommendations: recommendations.slice(0, 8),
      techStackSpecific,
    };
  }

  /**
   * Get quick Context7 insights without full analysis
   */
  async getQuickInsights(projectPath: string, techStack: string[]): Promise<Context7Insights> {
    const topics = [
      `best practices for ${techStack.join(', ')} development`,
      'code quality improvement strategies',
      'security vulnerability prevention',
    ];

    const context7Promises = topics.map(topic =>
      this.context7Cache.getRelevantData({
        businessRequest: topic,
        projectId: projectPath,
        domain: techStack[0] || 'general',
        priority: 'medium',
        maxResults: 3,
      }).catch(() => null)
    );

    const results = await Promise.all(context7Promises);
    const validResults = results.filter(r => r !== null);
    const mergedData = this.mergeContext7Data(validResults);

    // Create simplified insights
    return {
      patterns: [`Apply ${techStack[0]} patterns`],
      bestPractices: ['Follow industry best practices', 'Maintain code quality standards'],
      warnings: [],
      recommendations: ['Review Context7 insights for improvements'],
      techStackSpecific: {
        [techStack[0] || 'general']: ['Context7 insights available'],
      },
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.context7Cache.getCacheStats();
  }
}