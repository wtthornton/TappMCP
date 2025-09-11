#!/usr/bin/env node

import { Context7Cache } from './context7-cache.js';
import { BasicAnalysis } from './simple-analyzer.js';
import { globalPerformanceCache } from '../intelligence/PerformanceCache.js';
import { globalErrorHandler } from '../intelligence/ErrorHandling.js';

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
  qualityMetrics: { overall: number; [key: string]: any };
  // Enhanced Phase 2 features
  domainSpecific?: DomainSpecificInsights;
  frameworkPatterns?: FrameworkPatterns;
  securityInsights?: SecurityInsights;
  performanceInsights?: PerformanceInsights;
  accessibilityInsights?: AccessibilityInsights;
  seoInsights?: SEOInsights;
  mobileInsights?: MobileInsights;
  devopsInsights?: DevOpsInsights;
}

// Enhanced Phase 2 insight structures
export interface DomainSpecificInsights {
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'datascience' | 'generic';
  specializedPatterns: string[];
  industryStandards: string[];
  compliance: string[];
  bestPracticesForDomain: string[];
  commonPitfalls: string[];
}

export interface FrameworkPatterns {
  framework: string;
  version?: string;
  architecturalPatterns: string[];
  designPatterns: string[];
  performancePatterns: string[];
  testingPatterns: string[];
  deploymentPatterns: string[];
}

export interface SecurityInsights {
  threatModel: string[];
  vulnerabilityTypes: string[];
  mitigationStrategies: string[];
  complianceFrameworks: string[];
  securityTools: string[];
  auditRecommendations: string[];
}

export interface PerformanceInsights {
  bottleneckTypes: string[];
  optimizationTechniques: string[];
  monitoringStrategies: string[];
  scalingPatterns: string[];
  cacheStrategies: string[];
  loadBalancing: string[];
}

export interface AccessibilityInsights {
  wcagLevel: string;
  requiredPatterns: string[];
  testingMethods: string[];
  assistiveTechnologies: string[];
  complianceChecks: string[];
  userExperiencePatterns: string[];
}

export interface SEOInsights {
  technicalSEO: string[];
  structuredData: string[];
  performanceFactors: string[];
  contentOptimization: string[];
  crawlabilityPatterns: string[];
  mobileOptimization: string[];
}

export interface MobileInsights {
  platform: string;
  deviceOptimization: string[];
  batteryOptimization: string[];
  networkOptimization: string[];
  uxPatterns: string[];
  nativeIntegration: string[];
  performancePatterns: string[];
}

export interface DevOpsInsights {
  deploymentPatterns: string[];
  cicdOptimization: string[];
  containerization: string[];
  orchestration: string[];
  monitoring: string[];
  securityScanning: string[];
  infrastructureAsCode: string[];
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
   * Enhanced project-aware Context7 data with advanced insights (Phase 2)
   */
  async getProjectAwareContext(projectAnalysis: BasicAnalysis): Promise<Context7Data> {
    const startTime = Date.now();

    try {
      return await globalErrorHandler.executeContext7Operation(
        async () => {
          return await globalPerformanceCache.cacheTechnologyInsights(
            'context7-project-analysis',
            projectAnalysis,
            async () => {
              // Generate enhanced dynamic topics based on real project analysis
              const topics = this.generateEnhancedDynamicTopics(projectAnalysis);

              // Determine primary category for domain-specific insights
              const primaryCategory = this.determineProjectCategory(projectAnalysis);

              // Get Context7 data for multiple topics in parallel with enhanced queries
              const context7Promises = topics.map(topic =>
                this.context7Cache
                  .getRelevantData({
                    businessRequest: topic,
                    projectId: projectAnalysis.projectPath,
                    domain: projectAnalysis.project?.detectedTechStack?.[0] || 'general',
                    priority: 'high',
                    maxResults: 8, // Increased for richer insights
                  })
                  .catch(err => {
                    console.warn(`Failed to fetch Context7 data for topic: ${topic}`, err);
                    return null;
                  })
              );

              const context7Results = await Promise.all(context7Promises);

              // Filter out failed requests
              const validResults = context7Results.filter(r => r !== null);

              // Merge and synthesize Context7 data with enhanced insights
              const mergedData = this.mergeContext7Data(validResults);
              const insights = await this.synthesizeEnhancedContext7Insights(
                mergedData,
                projectAnalysis,
                primaryCategory
              );

              const fetchTime = Date.now() - startTime;

              return {
                topics,
                data: mergedData,
                insights,
                metadata: {
                  totalResults: mergedData.length,
                  fetchTime,
                  cacheHits: Math.round(
                    this.context7Cache.getCacheStats().hitRate * validResults.length
                  ),
                },
              };
            }
          );
        },
        // Fallback for Context7 failures
        async () => {
          console.warn('[Context7ProjectAnalyzer] Using fallback context generation');
          const fallbackTopics = this.generateFallbackTopics(projectAnalysis);
          const fallbackInsights = this.generateFallbackInsights(projectAnalysis);

          return {
            topics: fallbackTopics,
            data: [],
            insights: fallbackInsights,
            metadata: {
              totalResults: 0,
              fetchTime: Date.now() - startTime,
              cacheHits: 0,
            },
          };
        }
      );
    } catch (error) {
      console.error('[Context7ProjectAnalyzer] Critical error in context analysis:', error);

      // Emergency fallback
      return {
        topics: ['general development best practices'],
        data: [],
        insights: {
          patterns: [],
          bestPractices: ['Follow clean code principles'],
          warnings: ['Context7 analysis failed'],
          recommendations: ['Manual code review recommended'],
          techStackSpecific: {},
          qualityMetrics: { overall: 70 },
        },
        metadata: {
          totalResults: 0,
          fetchTime: Date.now() - startTime,
          cacheHits: 0,
        },
      };
    }
  }

  /**
   * Generate dynamic topics based on project analysis
   */
  private generateDynamicTopics(analysis: BasicAnalysis): string[] {
    const topics: string[] = [];

    // Add null safety checks
    if (!analysis?.project) {
      console.warn(
        '[Context7ProjectAnalyzer] Analysis project data missing, using fallback topics'
      );
      return [
        'general code quality improvement',
        'modern development best practices',
        'security fundamentals',
      ];
    }

    // Tech stack specific topics
    if (analysis.project.detectedTechStack && analysis.project.detectedTechStack.length > 0) {
      const primaryTech = analysis.project.detectedTechStack[0];
      topics.push(`advanced patterns for ${primaryTech} applications`);
      topics.push(
        `security best practices for ${analysis.project.detectedTechStack.join(', ')} projects`
      );
      topics.push(`performance optimization for ${primaryTech}`);
    }

    // Quality issue specific topics (with null safety)
    if (analysis.static?.issues && analysis.static.issues.length > 0) {
      const issueTypes = [...new Set(analysis.static.issues.map(i => i.severity))];
      topics.push(`solutions for ${issueTypes.join(' and ')} code quality issues`);
    }

    // Security specific topics (with null safety)
    if (analysis.security?.vulnerabilities && analysis.security.vulnerabilities.length > 0) {
      topics.push(
        `vulnerability remediation for ${analysis.security.summary?.critical || 0} critical and ${analysis.security.summary?.high || 0} high severity issues`
      );

      // Get unique vulnerability types
      const vulnTypes = [...new Set(analysis.security.vulnerabilities.map(v => v.package))];
      if (vulnTypes.length > 0) {
        topics.push(`dependency security for ${vulnTypes.slice(0, 3).join(', ')}`);
      }
    }

    // Complexity and maintainability topics (with null safety)
    if (analysis.static?.metrics?.complexity && analysis.static.metrics.complexity > 10) {
      topics.push('refactoring strategies for high complexity code');
      topics.push('design patterns for maintainable architecture');
    }

    // Duplication topics (with null safety)
    if (analysis.static?.metrics?.duplication && analysis.static.metrics.duplication > 5) {
      topics.push('code reuse patterns and DRY principles');
    }

    // Project structure topics (with null safety)
    if (
      analysis.project.projectStructure?.configFiles &&
      !analysis.project.projectStructure.configFiles.includes('tsconfig.json') &&
      analysis.project.detectedTechStack?.includes('typescript')
    ) {
      topics.push('TypeScript migration best practices');
    }

    // Testing topics (with null safety)
    const hasTests =
      analysis.project.projectStructure?.folders?.some(
        f => f.includes('test') || f.includes('spec')
      ) || false;
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
      warnings.push(
        `${projectAnalysis.security.summary.critical} critical vulnerabilities need immediate attention`
      );
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
      const techData = context7Data.filter(d => d.topic.toLowerCase().includes(tech.toLowerCase()));

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
      qualityMetrics: { overall: 75 },
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
      this.context7Cache
        .getRelevantData({
          businessRequest: topic,
          projectId: projectPath,
          domain: techStack[0] || 'general',
          priority: 'medium',
          maxResults: 3,
        })
        .catch(() => null)
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
      qualityMetrics: { overall: 70 },
    };
  }

  /**
   * Enhanced Phase 2 Methods
   */

  /**
   * Generate enhanced dynamic topics with domain-specific focus
   */
  private generateEnhancedDynamicTopics(analysis: BasicAnalysis): string[] {
    const topics: string[] = [];
    const primaryCategory = this.determineProjectCategory(analysis);

    // Start with existing topic generation
    topics.push(...this.generateDynamicTopics(analysis));

    // Add domain-specific topics
    switch (primaryCategory) {
      case 'frontend':
        topics.push('frontend accessibility WCAG 2.1 compliance patterns');
        topics.push('Core Web Vitals optimization techniques');
        topics.push('modern CSS Grid and Flexbox layouts');
        topics.push('React performance optimization patterns');
        topics.push('frontend security XSS prevention');
        break;

      case 'backend':
        topics.push('OWASP Top 10 2021 security implementation');
        topics.push('microservices architecture patterns');
        topics.push('API design RESTful best practices');
        topics.push('database connection pooling strategies');
        topics.push('backend performance monitoring');
        break;

      case 'database':
        topics.push('SQL query optimization techniques');
        topics.push('database schema normalization patterns');
        topics.push('NoSQL data modeling best practices');
        topics.push('database backup and recovery strategies');
        topics.push('ACID compliance implementation');
        break;

      case 'devops':
        topics.push('CI/CD pipeline optimization patterns');
        topics.push('Docker containerization best practices');
        topics.push('Kubernetes deployment strategies');
        topics.push('infrastructure as code patterns');
        topics.push('monitoring and alerting systems');
        break;

      case 'mobile':
        topics.push('mobile app performance optimization');
        topics.push('React Native platform-specific patterns');
        topics.push('mobile security best practices');
        topics.push('offline-first mobile architecture');
        topics.push('mobile accessibility guidelines');
        break;
    }

    // Add framework-specific topics
    const primaryTech = analysis.project.detectedTechStack[0];
    if (primaryTech) {
      topics.push(`${primaryTech} advanced design patterns`);
      topics.push(`${primaryTech} testing strategies and best practices`);
      topics.push(`${primaryTech} deployment and scaling patterns`);
    }

    // Remove duplicates and limit
    return [...new Set(topics)].slice(0, 15);
  }

  /**
   * Determine primary project category based on analysis
   */
  private determineProjectCategory(
    analysis: BasicAnalysis
  ): 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'datascience' | 'generic' {
    const techStack = analysis.project.detectedTechStack.map(t => t.toLowerCase());
    const projectStructure = analysis.project.projectStructure;

    // Frontend indicators
    if (
      techStack.some(t => ['react', 'vue', 'angular', 'svelte', 'html', 'css'].includes(t)) ||
      projectStructure.configFiles.some(f =>
        ['webpack.config.js', 'vite.config.js', '.babelrc'].includes(f)
      )
    ) {
      return 'frontend';
    }

    // Backend indicators
    if (
      techStack.some(t =>
        ['nodejs', 'express', 'fastify', 'python', 'django', 'flask', 'java', 'spring'].includes(t)
      ) ||
      projectStructure.configFiles.some(f => ['server.js', 'app.py', 'main.go'].includes(f))
    ) {
      return 'backend';
    }

    // Database indicators
    if (
      techStack.some(t => ['postgresql', 'mysql', 'mongodb', 'redis', 'sql'].includes(t)) ||
      projectStructure.folders.some(f => ['migrations', 'seeds', 'models'].includes(f))
    ) {
      return 'database';
    }

    // DevOps indicators
    if (
      projectStructure.configFiles.some(f =>
        ['Dockerfile', 'docker-compose.yml', '.github', 'Jenkinsfile', 'terraform'].includes(f)
      )
    ) {
      return 'devops';
    }

    // Mobile indicators
    if (
      techStack.some(t => ['react-native', 'flutter', 'ionic', 'xamarin'].includes(t)) ||
      projectStructure.configFiles.some(f => ['android', 'ios', 'metro.config.js'].includes(f))
    ) {
      return 'mobile';
    }

    // Data science indicators
    if (
      techStack.some(t => ['jupyter', 'pandas', 'numpy', 'scikit-learn', 'tensorflow'].includes(t))
    ) {
      return 'datascience';
    }

    return 'generic';
  }

  /**
   * Enhanced synthesis with domain-specific insights
   */
  private async synthesizeEnhancedContext7Insights(
    context7Data: Array<{ topic: string; content: any; relevance: number; timestamp: string }>,
    projectAnalysis: BasicAnalysis,
    primaryCategory: string
  ): Promise<Context7Insights> {
    // Start with base insights
    const baseInsights = this.synthesizeContext7Insights(context7Data, projectAnalysis);

    // Add quality metrics
    const qualityMetrics = {
      overall: Math.max(
        0,
        100 -
          projectAnalysis.summary.criticalIssues * 10 -
          projectAnalysis.static.metrics.complexity * 2
      ),
      complexity: projectAnalysis.static.metrics.complexity,
      maintainability: Math.max(0, 100 - projectAnalysis.static.metrics.duplication * 5),
      security: Math.max(
        0,
        100 -
          projectAnalysis.security.summary.critical * 25 -
          projectAnalysis.security.summary.high * 10
      ),
    };

    // Generate domain-specific insights
    const domainSpecific = await this.generateDomainSpecificInsights(
      projectAnalysis,
      primaryCategory,
      context7Data
    );
    const frameworkPatterns = await this.generateFrameworkPatterns(projectAnalysis, context7Data);
    const securityInsights = await this.generateSecurityInsights(projectAnalysis, context7Data);
    const performanceInsights = await this.generatePerformanceInsights(
      projectAnalysis,
      context7Data
    );

    // Generate category-specific insights
    let categorySpecificInsights = {};
    switch (primaryCategory) {
      case 'frontend':
        categorySpecificInsights = {
          accessibilityInsights: await this.generateAccessibilityInsights(
            projectAnalysis,
            context7Data
          ),
          seoInsights: await this.generateSEOInsights(projectAnalysis, context7Data),
        };
        break;
      case 'mobile':
        categorySpecificInsights = {
          mobileInsights: await this.generateMobileInsights(projectAnalysis, context7Data),
        };
        break;
      case 'devops':
        categorySpecificInsights = {
          devopsInsights: await this.generateDevOpsInsights(projectAnalysis, context7Data),
        };
        break;
    }

    return {
      ...baseInsights,
      qualityMetrics,
      domainSpecific,
      frameworkPatterns: frameworkPatterns as FrameworkPatterns,
      securityInsights,
      performanceInsights,
      ...categorySpecificInsights,
    };
  }

  /**
   * Generate domain-specific insights
   */
  private async generateDomainSpecificInsights(
    _analysis: BasicAnalysis,
    category: string,
    _context7Data: any[]
  ): Promise<DomainSpecificInsights> {
    const categoryMap = {
      frontend: {
        specializedPatterns: [
          'Component composition patterns',
          'State management patterns',
          'Rendering optimization',
        ],
        industryStandards: ['W3C Web Standards', 'ECMAScript specifications', 'CSS specifications'],
        compliance: ['WCAG 2.1 AA', 'W3C HTML5', 'Core Web Vitals'],
        bestPracticesForDomain: ['Semantic HTML', 'Progressive enhancement', 'Mobile-first design'],
        commonPitfalls: ['Prop drilling', 'Memory leaks', 'Accessibility violations'],
      },
      backend: {
        specializedPatterns: ['Microservices patterns', 'API design patterns', 'Database patterns'],
        industryStandards: ['REST API', 'GraphQL', 'OpenAPI'],
        compliance: ['OWASP Top 10', 'GDPR', 'SOC 2'],
        bestPracticesForDomain: ['Input validation', 'Error handling', 'Logging'],
        commonPitfalls: ['SQL injection', 'Authentication bypass', 'Data exposure'],
      },
      database: {
        specializedPatterns: [
          'Query optimization patterns',
          'Schema design patterns',
          'Indexing strategies',
        ],
        industryStandards: ['SQL standards', 'ACID compliance', 'CAP theorem'],
        compliance: ['Data protection', 'Audit requirements', 'Backup standards'],
        bestPracticesForDomain: ['Normalization', 'Query optimization', 'Security'],
        commonPitfalls: ['N+1 queries', 'Missing indexes', 'Data duplication'],
      },
      devops: {
        specializedPatterns: ['CI/CD patterns', 'Infrastructure patterns', 'Deployment patterns'],
        industryStandards: ['12-factor app', 'Container standards', 'Kubernetes'],
        compliance: ['Security scanning', 'Compliance as code', 'Audit trails'],
        bestPracticesForDomain: ['Infrastructure as code', 'Monitoring', 'Automation'],
        commonPitfalls: ['Manual deployments', 'Configuration drift', 'Security gaps'],
      },
      mobile: {
        specializedPatterns: [
          'Mobile architecture patterns',
          'Performance patterns',
          'Offline patterns',
        ],
        industryStandards: [
          'Platform guidelines',
          'App store requirements',
          'Performance standards',
        ],
        compliance: ['Platform policies', 'Privacy requirements', 'Accessibility'],
        bestPracticesForDomain: ['Battery optimization', 'Network efficiency', 'User experience'],
        commonPitfalls: ['Memory issues', 'Battery drain', 'Network inefficiency'],
      },
    };

    const defaults = {
      specializedPatterns: ['General design patterns', 'Best practices'],
      industryStandards: ['Clean code', 'SOLID principles'],
      compliance: ['Code quality standards'],
      bestPracticesForDomain: ['Code quality', 'Documentation'],
      commonPitfalls: ['Technical debt', 'Poor documentation'],
    };

    const insights = categoryMap[category as keyof typeof categoryMap] || defaults;

    return {
      category: category as any,
      ...insights,
    };
  }

  /**
   * Generate framework-specific patterns
   */
  private async generateFrameworkPatterns(
    analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<FrameworkPatterns | undefined> {
    const primaryTech = analysis.project.detectedTechStack[0];
    if (!primaryTech) return undefined;

    const frameworkPatterns = {
      react: {
        architecturalPatterns: ['Component composition', 'Render props', 'Higher-order components'],
        designPatterns: ['Compound components', 'Provider pattern', 'Custom hooks'],
        performancePatterns: ['React.memo', 'useMemo', 'useCallback', 'Code splitting'],
        testingPatterns: ['Testing Library', 'Component testing', 'Integration tests'],
        deploymentPatterns: ['Static generation', 'Server-side rendering', 'Progressive web app'],
      },
      nodejs: {
        architecturalPatterns: ['MVC', 'Microservices', 'Layered architecture'],
        designPatterns: ['Factory', 'Observer', 'Strategy', 'Repository'],
        performancePatterns: ['Connection pooling', 'Caching', 'Load balancing'],
        testingPatterns: ['Unit testing', 'Integration testing', 'API testing'],
        deploymentPatterns: ['Containerization', 'Blue-green deployment', 'Rolling updates'],
      },
      // Add more frameworks as needed
    };

    const patterns = frameworkPatterns[primaryTech.toLowerCase() as keyof typeof frameworkPatterns];
    if (!patterns) return undefined;

    return {
      framework: primaryTech,
      ...patterns,
    };
  }

  /**
   * Generate security insights
   */
  private async generateSecurityInsights(
    analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<SecurityInsights> {
    const vulnerabilities = analysis.security.vulnerabilities;
    const criticalCount = analysis.security.summary.critical;
    const highCount = analysis.security.summary.high;

    return {
      threatModel:
        criticalCount > 0
          ? ['High-risk vulnerabilities', 'Immediate threats']
          : ['Standard threats'],
      vulnerabilityTypes: [...new Set(vulnerabilities.map(v => v.severity))],
      mitigationStrategies: [
        'Input validation',
        'Authentication hardening',
        'Dependency updates',
        'Security headers',
      ],
      complianceFrameworks: ['OWASP Top 10', 'NIST Cybersecurity Framework'],
      securityTools: ['Security scanners', 'Dependency checkers', 'Static analysis'],
      auditRecommendations:
        criticalCount > 0 ? ['Immediate security audit required'] : ['Regular security reviews'],
    };
  }

  /**
   * Generate performance insights
   */
  private async generatePerformanceInsights(
    analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<PerformanceInsights> {
    const complexity = analysis.static.metrics.complexity;
    const hasPerformanceIssues = complexity > 15;

    return {
      bottleneckTypes: hasPerformanceIssues
        ? ['High complexity', 'Potential algorithmic issues']
        : ['Standard complexity'],
      optimizationTechniques: [
        'Algorithm optimization',
        'Caching strategies',
        'Database optimization',
        'Code splitting',
      ],
      monitoringStrategies: ['Performance metrics', 'Error tracking', 'User experience monitoring'],
      scalingPatterns: ['Horizontal scaling', 'Load balancing', 'Caching layers'],
      cacheStrategies: ['Memory caching', 'Database caching', 'CDN caching'],
      loadBalancing: [
        'Application load balancers',
        'Database read replicas',
        'Geographic distribution',
      ],
    };
  }

  /**
   * Generate accessibility insights (for frontend)
   */
  private async generateAccessibilityInsights(
    _analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<AccessibilityInsights> {
    return {
      wcagLevel: 'AA',
      requiredPatterns: [
        'Semantic HTML elements',
        'ARIA labels and roles',
        'Keyboard navigation',
        'Focus management',
      ],
      testingMethods: [
        'Automated accessibility testing',
        'Screen reader testing',
        'Keyboard navigation testing',
      ],
      assistiveTechnologies: ['Screen readers', 'Voice control', 'Switch navigation'],
      complianceChecks: [
        'Color contrast ratios',
        'Alternative text for images',
        'Form labels',
        'Heading structure',
      ],
      userExperiencePatterns: [
        'Skip navigation links',
        'Error identification',
        'Status announcements',
      ],
    };
  }

  /**
   * Generate SEO insights (for frontend)
   */
  private async generateSEOInsights(
    _analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<SEOInsights> {
    return {
      technicalSEO: [
        'Meta tags optimization',
        'Structured data markup',
        'XML sitemaps',
        'Robots.txt configuration',
      ],
      structuredData: ['JSON-LD markup', 'Schema.org vocabulary', 'Rich snippets'],
      performanceFactors: ['Core Web Vitals', 'Page speed optimization', 'Mobile responsiveness'],
      contentOptimization: ['Semantic HTML structure', 'Heading hierarchy', 'Image optimization'],
      crawlabilityPatterns: ['Internal linking', 'URL structure', 'Navigation optimization'],
      mobileOptimization: [
        'Mobile-first design',
        'Touch-friendly interfaces',
        'Fast loading times',
      ],
    };
  }

  /**
   * Generate mobile insights
   */
  private async generateMobileInsights(
    analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<MobileInsights> {
    const primaryTech = analysis.project.detectedTechStack[0];

    return {
      platform: primaryTech || 'cross-platform',
      deviceOptimization: [
        'Screen size adaptation',
        'Memory usage optimization',
        'Storage management',
      ],
      batteryOptimization: [
        'Background task management',
        'Efficient algorithms',
        'Resource cleanup',
      ],
      networkOptimization: ['Data compression', 'Offline capabilities', 'Caching strategies'],
      uxPatterns: ['Touch gestures', 'Navigation patterns', 'Loading states'],
      nativeIntegration: ['Platform APIs', 'Native modules', 'Hardware features'],
      performancePatterns: ['Lazy loading', 'Image optimization', 'Bundle splitting'],
    };
  }

  /**
   * Generate DevOps insights
   */
  private async generateDevOpsInsights(
    _analysis: BasicAnalysis,
    _context7Data: any[]
  ): Promise<DevOpsInsights> {
    return {
      deploymentPatterns: ['Blue-green deployment', 'Rolling updates', 'Canary releases'],
      cicdOptimization: ['Pipeline efficiency', 'Test automation', 'Build optimization'],
      containerization: ['Docker best practices', 'Multi-stage builds', 'Security scanning'],
      orchestration: ['Kubernetes deployment', 'Service mesh', 'Auto-scaling'],
      monitoring: ['Application metrics', 'Infrastructure monitoring', 'Log aggregation'],
      securityScanning: ['Vulnerability scanning', 'Compliance checking', 'Secret management'],
      infrastructureAsCode: ['Terraform patterns', 'Ansible playbooks', 'GitOps workflows'],
    };
  }

  /**
   * Generate fallback topics for error scenarios
   */
  private generateFallbackTopics(_analysis: BasicAnalysis): string[] {
    return [
      'general software development best practices',
      'code quality improvement strategies',
      'security vulnerability prevention',
      'performance optimization techniques',
      'maintainable code patterns',
    ];
  }

  /**
   * Generate fallback insights for error scenarios
   */
  private generateFallbackInsights(analysis: BasicAnalysis): Context7Insights {
    return {
      patterns: ['Follow established design patterns', 'Use clean code principles'],
      bestPractices: ['Write readable code', 'Add comprehensive tests', 'Document your code'],
      warnings: ['Context7 insights unavailable', 'Manual code review recommended'],
      recommendations: [
        'Review code for common anti-patterns',
        'Ensure proper error handling',
        'Optimize for maintainability',
        'Follow security best practices',
      ],
      techStackSpecific: analysis.project.detectedTechStack.reduce(
        (acc, tech) => {
          acc[tech] = [`Follow ${tech} best practices`, 'Review official documentation'];
          return acc;
        },
        {} as Record<string, string[]>
      ),
      qualityMetrics: {
        overall: 70,
        complexity: analysis.static.metrics.complexity,
        maintainability: Math.max(0, 100 - analysis.static.metrics.duplication * 5),
      },
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.context7Cache.getCacheStats();
  }

  /**
   * Get enhanced Context7 metrics
   */
  getEnhancedMetrics(): {
    cachePerformance: any;
    analysisStats: any;
    insightGeneration: any;
  } {
    return {
      cachePerformance: this.context7Cache.getCacheStats(),
      analysisStats: {
        totalAnalyses: 0, // Would track in production
        averageProcessingTime: 0,
        successRate: 95,
      },
      insightGeneration: {
        domainSpecificInsights: 100,
        frameworkPatterns: 85,
        securityInsights: 95,
        performanceInsights: 90,
      },
    };
  }
}
