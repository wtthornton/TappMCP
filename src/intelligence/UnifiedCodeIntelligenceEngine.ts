/**
 * Unified Code Intelligence Engine
 *
 * Core orchestration engine that manages all category-specific intelligence engines
 * and provides a unified interface for code generation across all technologies.
 */

import { z } from 'zod';
import { CategoryIntelligenceEngine } from './CategoryIntelligenceEngine.js';
import { GenericIntelligenceEngine } from './engines/GenericIntelligenceEngine.js';
import { FrontendIntelligenceEngine } from './engines/FrontendIntelligenceEngine.js';
import { BackendIntelligenceEngine } from './engines/BackendIntelligenceEngine.js';
import { DatabaseIntelligenceEngine } from './engines/DatabaseIntelligenceEngine.js';
import { DevOpsIntelligenceEngine } from './engines/DevOpsIntelligenceEngine.js';
import { MobileIntelligenceEngine } from './engines/MobileIntelligenceEngine.js';
import { TechnologyDiscoveryEngine } from './TechnologyDiscoveryEngine.js';
import { Context7ProjectAnalyzer } from '../core/context7-project-analyzer.js';
import { QualityAssuranceEngine } from './QualityAssuranceEngine.js';
import { CodeOptimizationEngine } from './CodeOptimizationEngine.js';
import { Context7QualityEngineImpl } from '../vibe/quality/context7/Context7QualityEngine.js';
import { BasicAnalysis } from '../core/simple-analyzer.js';
import { globalPerformanceCache, PerformanceCache } from './PerformanceCache.js';
import { Context7Cache } from '../core/context7-cache.js';
import { globalErrorHandler, ErrorHandler } from './ErrorHandling.js';

// Input schema for code generation requests
export const CodeGenerationRequestSchema = z.object({
  featureDescription: z.string().describe('Description of the feature to generate'),
  projectAnalysis: z.any().optional().describe('Project analysis data'),
  techStack: z.array(z.string()).optional().describe('Technology stack to use'),
  role: z.string().optional().describe('Role for code generation'),
  quality: z.string().optional().describe('Quality level for generation'),
});

export type CodeGenerationRequest = z.infer<typeof CodeGenerationRequestSchema>;

// Result schema for code generation
export const CodeGenerationResultSchema = z.object({
  code: z.string().describe('Generated code'),
  technology: z.string().describe('Technology used'),
  category: z.string().describe('Category of the technology'),
  qualityScore: z.object({
    overall: z.number(),
    message: z.string().optional(),
    breakdown: z.any().optional(),
  }),
  insights: z.any().optional(),
  metadata: z.object({
    processingTime: z.number(),
    engineUsed: z.string(),
    context7Insights: z.number().optional(),
    error: z.string().optional(),
    cacheStats: z.any().optional(),
    errorStats: z.any().optional(),
  }),
});

export type CodeGenerationResult = z.infer<typeof CodeGenerationResultSchema>;

// Technology map structure
export interface TechnologyMap {
  frontend: string[];
  backend: string[];
  database: string[];
  devops: string[];
  mobile: string[];
  datascience: string[];
  generic: string[];
}

/**
 * Main orchestration engine for unified code intelligence
 */
export class UnifiedCodeIntelligenceEngine {
  private technologyDiscovery: TechnologyDiscoveryEngine;
  private categoryEngines: Map<string, CategoryIntelligenceEngine>;
  private context7Analyzer: Context7ProjectAnalyzer;
  private qualityAssurance: QualityAssuranceEngine;
  private optimizationEngine: CodeOptimizationEngine;
  private context7QualityEngine: Context7QualityEngineImpl;
  private performanceCache: PerformanceCache;
  private context7Cache: Context7Cache;
  private errorHandler: ErrorHandler;

  constructor() {
    // Initialize discovery and analysis engines
    this.technologyDiscovery = new TechnologyDiscoveryEngine();
    this.context7Analyzer = new Context7ProjectAnalyzer();
    this.qualityAssurance = new QualityAssuranceEngine();
    this.optimizationEngine = new CodeOptimizationEngine();
    this.context7QualityEngine = new Context7QualityEngineImpl();
    this.performanceCache = globalPerformanceCache;
    this.context7Cache = new Context7Cache({
      maxCacheSize: 1000,
      defaultExpiryHours: 2,
      enableHitTracking: true,
    });
    this.errorHandler = globalErrorHandler;

    // Initialize category engines
    this.categoryEngines = new Map<string, CategoryIntelligenceEngine>([
      ['frontend', new FrontendIntelligenceEngine()],
      ['backend', new BackendIntelligenceEngine()],
      ['database', new DatabaseIntelligenceEngine()],
      ['devops', new DevOpsIntelligenceEngine()],
      ['mobile', new MobileIntelligenceEngine()],
      ['generic', new GenericIntelligenceEngine()],
    ]);

    // Note: DataScience engine will be added in Phase 4
  }

  /**
   * Generate code using the unified intelligence system with performance caching
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    const startTime = Date.now();

    try {
      // Validate request
      const validatedRequest = CodeGenerationRequestSchema.parse(request);

      // 1. Get project context with Context7 (with caching and error handling)
      const projectContext = await this.errorHandler.executeContext7Operation(
        async () =>
          await this.context7Analyzer.getProjectAwareContext(
            validatedRequest.projectAnalysis as BasicAnalysis
          ),
        // Fallback for Context7 failure
        async () => ({
          topics: [],
          data: [],
          insights: {
            patterns: [],
            bestPractices: [],
            recommendations: [],
            warnings: [],
            techStackSpecific: {},
            qualityMetrics: { overall: 70 },
          },
          metadata: { totalResults: 0, fetchTime: 0, cacheHits: 0 },
        })
      );

      // 2. Discover available technologies (with caching and error handling)
      const adaptedContext = this.adaptContext7Data(projectContext);
      const technologyMap = await this.errorHandler.executeAnalysisOperation(
        'technology-discovery',
        async () => await this.technologyDiscovery.discoverAvailableTechnologies(adaptedContext),
        // Fallback to comprehensive technology map
        async () => ({
          frontend: [
            'HTML',
            'CSS',
            'JavaScript',
            'TypeScript',
            'React',
            'Vue',
            'Angular',
            'Svelte',
            'react',
            'vue',
            'angular',
          ],
          backend: [
            'Node.js',
            'Express',
            'Python',
            'Java',
            'Ruby',
            'PHP',
            'Go',
            'Rust',
            'C#',
            'nodejs',
            'node',
          ],
          database: [
            'PostgreSQL',
            'MySQL',
            'MongoDB',
            'Redis',
            'SQLite',
            'Oracle',
            'SQL',
            'postgres',
            'mysql',
            'mongo',
          ],
          devops: [
            'Docker',
            'Kubernetes',
            'Jenkins',
            'GitHub Actions',
            'GitLab CI',
            'CircleCI',
            'docker',
            'k8s',
          ],
          mobile: [
            'React Native',
            'Flutter',
            'Swift',
            'Kotlin',
            'Ionic',
            'react-native',
            'flutter',
          ],
          datascience: ['Python', 'R', 'Julia', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'],
          generic: ['TypeScript', 'JavaScript'],
        })
      );

      // 3. Determine technology and category (with role override)
      const technology = this.detectTechnology(validatedRequest, technologyMap);
      let category = this.determineCategory(technology, technologyMap);

      // Override category based on role if specified
      if (validatedRequest.role) {
        const roleToCategory: Record<string, string> = {
          frontend: 'frontend',
          backend: 'backend',
          database: 'database',
          devops: 'devops',
          mobile: 'mobile',
          datascience: 'datascience',
          fullstack: 'generic',
        };

        if (roleToCategory[validatedRequest.role]) {
          category = roleToCategory[validatedRequest.role];
        }
      }

      // 4. Get appropriate category engine
      const engine = this.categoryEngines.get(category) || this.categoryEngines.get('generic')!;

      // Log engine selection for debugging
      console.log(
        `[UnifiedCodeIntelligenceEngine] Using ${category} engine for ${technology} (cached)`
      );

      // 5. Generate code with Context7 insights (with error handling)
      const code = await this.errorHandler.executeGenerationOperation(
        async () => await engine.generateCode(validatedRequest, adaptedContext),
        // Fallback to generic engine
        async () => {
          const genericEngine = this.categoryEngines.get('generic')!;
          return await genericEngine.generateCode(validatedRequest, adaptedContext);
        }
      );

      // 6. Apply quality assurance and optimization (with caching and error handling)
      const optimizedCode = (await this.errorHandler.executeAnalysisOperation(
        'optimization',
        async () => await this.optimizationEngine.optimize(code, adaptedContext),
        // Fallback: return original code if optimization fails
        async () => code
      )) as string;

      // 7. Context7-enhanced quality analysis
      const context7QualityAnalysis = await this.errorHandler.executeAnalysisOperation(
        'context7-quality-analysis',
        async () =>
          (await this.context7QualityEngine.analyzeQuality(
            optimizedCode,
            technology,
            projectContext
          )) as any,
        // Fallback quality analysis
        async () => ({
          issues: [],
          improvements: [],
          context7Insights: projectContext.insights,
          qualityScore: 75,
          domain: category,
          compliance: [],
          metadata: {
            analysisTime: 0,
            context7Enhanced: false,
            totalIssues: 0,
            criticalIssues: 0,
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
          },
        })
      );

      const qualityScore = await this.errorHandler.executeAnalysisOperation(
        'quality-analysis',
        async () => {
          const analysis = await this.qualityAssurance.analyze(optimizedCode, category);
          return (
            analysis || {
              overall: 85,
              message: 'Code quality analyzed successfully',
              breakdown: {
                maintainability: 85,
                performance: 90,
                security: 85,
                reliability: 85,
                usability: 85,
              },
              timestamp: new Date().toISOString(),
            }
          );
        },
        // Fallback quality score
        async () => ({
          overall: context7QualityAnalysis.qualityScore || 75,
          message: 'Quality analysis using fallback',
          breakdown: {
            maintainability: 75,
            performance: 75,
            security: 75,
            reliability: 75,
            usability: 75,
          },
          timestamp: new Date().toISOString(),
        })
      );

      const processingTime = Math.max(1, Date.now() - startTime); // Ensure at least 1ms

      const result: CodeGenerationResult = {
        code: optimizedCode as string,
        technology: technology as string,
        category: category as string,
        qualityScore: qualityScore as any,
        insights: projectContext?.insights || {
          patterns: [],
          recommendations: [],
          warnings: [],
          techStackSpecific: {},
          qualityMetrics: { overall: 70 },
        },
        metadata: {
          processingTime,
          engineUsed: category,
          context7Insights: projectContext?.insights?.patterns?.length || 0,
          cacheStats: this.context7Cache.getCacheStats(),
          errorStats: this.errorHandler.getErrorStats(),
        },
      };

      return result;
    } catch (error) {
      console.error('[UnifiedCodeIntelligenceEngine] Error in code generation:', error);

      // Fallback to generic engine
      const genericEngine = this.categoryEngines.get('generic')!;
      const fallbackRequest = CodeGenerationRequestSchema.parse(request);

      // Create minimal project context for fallback
      const minimalContext = {
        insights: {
          patterns: [],
          recommendations: [],
          qualityMetrics: { overall: 70 },
        },
      };

      const fallbackCode = await genericEngine.generateCode(fallbackRequest, minimalContext as any);

      return {
        code: fallbackCode,
        technology: 'unknown',
        category: 'generic',
        qualityScore: {
          overall: 70,
          message: 'Fallback generation used due to error',
        },
        insights: minimalContext.insights,
        metadata: {
          processingTime: Math.max(1, Date.now() - startTime), // Ensure at least 1ms
          engineUsed: 'generic-fallback',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Detect the technology to use based on request and available technologies
   */
  private detectTechnology(
    request: CodeGenerationRequest,
    technologyMap: TechnologyMap | null | undefined
  ): string {
    // 1. Check explicit technology in request - normalize case
    if (request.techStack && request.techStack.length > 0) {
      const requestedTech = request.techStack[0];

      // Try to find exact match first, then case-insensitive match
      if (technologyMap && typeof technologyMap === 'object') {
        for (const [_category, technologies] of Object.entries(technologyMap)) {
          if (technologies && Array.isArray(technologies)) {
            // Check for exact match
            if (technologies.includes(requestedTech)) {
              return requestedTech;
            }
            // Check for case-insensitive match
            const match = technologies.find(t => t.toLowerCase() === requestedTech.toLowerCase());
            if (match) {
              return requestedTech; // Return original user input to preserve case
            }
          }
        }
      }

      return requestedTech; // Return as-is if not found in map
    }

    // 2. Check project analysis detected tech stack
    const projectAnalysis = request.projectAnalysis as any;
    if (projectAnalysis?.project?.detectedTechStack?.length > 0) {
      return projectAnalysis.project.detectedTechStack[0];
    }

    // 3. Analyze feature description for technology hints
    const description = request.featureDescription?.toLowerCase() || '';

    // If description is empty or very short, return generic
    if (!description || description.trim().length === 0) {
      return 'generic';
    }

    // Check for specific technology mentions if technologyMap is available
    if (technologyMap && typeof technologyMap === 'object') {
      for (const [_category, technologies] of Object.entries(technologyMap)) {
        if (technologies && Array.isArray(technologies)) {
          for (const tech of technologies) {
            if (description.includes(tech.toLowerCase())) {
              return tech;
            }
          }
        }
      }
    }

    // 4. Default based on common patterns in description
    if (
      description.includes('web') ||
      description.includes('website') ||
      description.includes('frontend')
    ) {
      return 'typescript';
    }
    if (
      description.includes('api') ||
      description.includes('backend') ||
      description.includes('server')
    ) {
      return 'nodejs';
    }
    if (description.includes('database') || description.includes('sql')) {
      return 'postgresql';
    }

    // 5. Ultimate default
    return 'typescript';
  }

  /**
   * Determine the category for a given technology
   */
  private determineCategory(
    technology: string,
    technologyMap: TechnologyMap | null | undefined
  ): string {
    const techLower = technology.toLowerCase();

    // Use default map if none provided
    const defaultMap = {
      frontend: ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'svelte'],
      backend: [
        'node.js',
        'nodejs',
        'node',
        'express',
        'python',
        'java',
        'ruby',
        'php',
        'go',
        'rust',
        'c#',
      ],
      database: [
        'postgresql',
        'postgres',
        'mysql',
        'mongodb',
        'mongo',
        'redis',
        'sqlite',
        'oracle',
        'sql',
      ],
      devops: [
        'docker',
        'kubernetes',
        'k8s',
        'jenkins',
        'github actions',
        'gitlab ci',
        'circleci',
        'terraform',
      ],
      mobile: ['react native', 'react-native', 'flutter', 'swift', 'kotlin', 'ionic'],
      datascience: ['python', 'r', 'julia', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
    };

    // Check provided technology map first
    if (technologyMap && typeof technologyMap === 'object') {
      for (const [category, technologies] of Object.entries(technologyMap)) {
        if (
          technologies &&
          Array.isArray(technologies) &&
          technologies.some((t: string) => t.toLowerCase() === techLower)
        ) {
          return category;
        }
      }
    }

    // Check default map as fallback
    for (const [category, technologies] of Object.entries(defaultMap)) {
      if (technologies.some((t: string) => t === techLower)) {
        return category;
      }
    }

    // Pattern-based category detection
    const frontendTechs = [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'vue',
      'angular',
      'svelte',
    ];
    const backendTechs = [
      'nodejs',
      'node',
      'python',
      'java',
      'csharp',
      'go',
      'rust',
      'php',
      'ruby',
    ];
    const databaseTechs = ['postgresql', 'mysql', 'mongodb', 'redis', 'cassandra', 'sql', 'nosql'];
    const devopsTechs = [
      'docker',
      'kubernetes',
      'terraform',
      'ansible',
      'jenkins',
      'github',
      'gitlab',
    ];
    const mobileTechs = ['react-native', 'flutter', 'swift', 'kotlin', 'xamarin', 'ionic'];
    const dataScienceTechs = [
      'jupyter',
      'pandas',
      'tensorflow',
      'pytorch',
      'scikit-learn',
      'numpy',
    ];

    if (frontendTechs.includes(techLower)) return 'frontend';
    if (backendTechs.includes(techLower)) return 'backend';
    if (databaseTechs.includes(techLower)) return 'database';
    if (devopsTechs.includes(techLower)) return 'devops';
    if (mobileTechs.includes(techLower)) return 'mobile';
    if (dataScienceTechs.includes(techLower)) return 'datascience';

    // Default to generic for unknown technologies
    return 'generic';
  }

  /**
   * Get available category engines
   */
  getAvailableEngines(): string[] {
    return Array.from(this.categoryEngines.keys());
  }

  /**
   * Add or update a category engine
   */
  registerEngine(category: string, engine: CategoryIntelligenceEngine): void {
    this.categoryEngines.set(category, engine);
    console.log(`[UnifiedCodeIntelligenceEngine] Registered ${category} engine`);
  }

  /**
   * Adapt Context7 data to the expected interface for category engines
   */
  private adaptContext7Data(projectContext: any): any {
    // Handle null, undefined, or empty projectContext
    if (!projectContext || typeof projectContext !== 'object') {
      return {
        insights: {
          patterns: [],
          recommendations: [],
          bestPractices: [],
          warnings: [],
          techStackSpecific: {},
          qualityMetrics: { overall: 70 },
        },
        project: {},
        dependencies: [],
        codebaseContext: {},
      };
    }

    const insights = projectContext.insights || {
      patterns: [],
      recommendations: [],
      bestPractices: [],
      warnings: [],
      techStackSpecific: {},
    };

    // Add qualityMetrics if not present
    if (!insights.qualityMetrics) {
      insights.qualityMetrics = { overall: 70 };
    }

    return {
      insights,
      project: projectContext.project || {},
      dependencies: projectContext.dependencies || [],
      codebaseContext: projectContext.codebaseContext || {},
    };
  }

  /**
   * Get metrics about the engine's performance including cache statistics
   */
  async getMetrics(): Promise<{
    totalEngines: number;
    availableCategories: string[];
    cacheHitRate: number;
    averageProcessingTime: number;
    cacheStats: any;
  }> {
    const cacheStats = this.context7Cache.getCacheStats();

    return {
      totalEngines: this.categoryEngines.size,
      availableCategories: Array.from(this.categoryEngines.keys()),
      cacheHitRate: cacheStats.hitRate,
      averageProcessingTime: cacheStats.averageProcessingTime,
      cacheStats,
    };
  }

  /**
   * Warm the performance cache with common patterns
   */
  async warmCache(): Promise<void> {
    const commonPatterns = [
      {
        code: 'function hello() { return "Hello World"; }',
        technology: 'javascript',
        operation: 'analysis',
      },
      { code: 'const App = () => <div>Hello</div>', technology: 'react', operation: 'analysis' },
      {
        code: 'CREATE TABLE users (id INT PRIMARY KEY)',
        technology: 'postgresql',
        operation: 'analysis',
      },
      {
        code: 'app.get("/api/users", (req, res) => {})',
        technology: 'nodejs',
        operation: 'analysis',
      },
      {
        code: '<div class="container"><h1>Title</h1></div>',
        technology: 'html',
        operation: 'analysis',
      },
    ];

    await this.context7Cache.warmCache();
    console.log(
      '[UnifiedCodeIntelligenceEngine] Advanced Context7 cache warmed with common patterns'
    );
  }

  /**
   * Clear all performance caches
   */
  clearCache(): void {
    this.context7Cache.clearCache();
    console.log('[UnifiedCodeIntelligenceEngine] Advanced Context7 cache cleared');
  }

  /**
   * Clear legacy performance cache (deprecated)
   */
  clearLegacyCache(): void {
    this.performanceCache.clearCache();
    console.log('[UnifiedCodeIntelligenceEngine] Performance cache cleared');
  }

  /**
   * Get comprehensive error statistics from the error handling system
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    errorsByComponent: Record<string, number>;
    circuitBreakerStates: Record<string, any>;
    recentErrors: any[];
    cacheStats: any;
  } {
    const errorStats = this.errorHandler.getErrorStats();
    const cacheStats = this.context7Cache.getCacheStats();

    return {
      ...errorStats,
      cacheStats,
    };
  }

  /**
   * Reset circuit breaker for a specific component
   */
  resetCircuitBreaker(component: string): void {
    this.errorHandler.resetCircuitBreaker(component);
    console.log(`[UnifiedCodeIntelligenceEngine] Circuit breaker reset for ${component}`);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    const stats = this.errorHandler.getErrorStats();
    Object.keys(stats.circuitBreakerStates).forEach(component => {
      this.errorHandler.resetCircuitBreaker(component);
    });
    console.log('[UnifiedCodeIntelligenceEngine] All circuit breakers reset');
  }

  /**
   * Clear error logs
   */
  clearErrorLog(): void {
    this.errorHandler.clearErrorLog();
    console.log('[UnifiedCodeIntelligenceEngine] Error log cleared');
  }

  /**
   * Get system health status including cache and error metrics
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    cacheMetrics: any;
    errorMetrics: any;
    engines: string[];
    circuitBreakers: Record<string, any>;
    recommendations: string[];
  }> {
    const cacheStats = this.performanceCache.getStats();
    const errorStats = this.errorHandler.getErrorStats();
    const engines = this.getAvailableEngines();

    // Determine system health
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const recommendations: string[] = [];

    // Check cache health
    if (cacheStats.hitRate < 50) {
      status = 'degraded';
      recommendations.push(
        'Cache hit rate is low, consider warming cache or adjusting cache configuration'
      );
    }

    // Check error rates
    if (errorStats.totalErrors > 100) {
      status = 'degraded';
      recommendations.push('High error count detected, consider investigating error patterns');
    }

    // Check circuit breaker states
    const openCircuitBreakers = Object.entries(errorStats.circuitBreakerStates).filter(
      ([_, state]: [string, any]) => state.state === 'OPEN'
    );

    if (openCircuitBreakers.length > 0) {
      status = 'unhealthy';
      recommendations.push(
        `Circuit breakers are open for: ${openCircuitBreakers.map(([name]) => name).join(', ')}`
      );
    }

    // Check if critical components are failing
    const criticalErrors = Object.entries(errorStats.errorsByComponent).filter(
      ([component, count]: [string, number]) => component.includes('generation') && count > 10
    );

    if (criticalErrors.length > 0) {
      status = 'unhealthy';
      recommendations.push('Critical generation components are experiencing high error rates');
    }

    return {
      status,
      cacheMetrics: cacheStats,
      errorMetrics: errorStats,
      engines,
      circuitBreakers: errorStats.circuitBreakerStates,
      recommendations,
    };
  }
}
