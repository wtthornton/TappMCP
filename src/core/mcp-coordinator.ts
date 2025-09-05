#!/usr/bin/env node

/**
 * MCP Coordinator for External Service Integration
 * 
 * Orchestrates and coordinates multiple MCP (Model Context Protocol) services
 * including Context7, Web Search, and Memory brokers for comprehensive
 * external knowledge integration in the Smart Plan tool.
 */

import { Context7Broker, type Documentation, type CodeExample, type BestPractice } from '../brokers/context7-broker.js';
import { WebSearchBroker, type SearchResult, type Trend, type ValidationResult, type MarketAnalysis } from '../brokers/websearch-broker.js';
import { MemoryBroker, type Lesson, type Pattern, type Insight } from '../brokers/memory-broker.js';

export interface ExternalKnowledge {
  id: string;
  source: 'context7' | 'websearch' | 'memory';
  type: 'documentation' | 'example' | 'best-practice' | 'search' | 'trend' | 'lesson' | 'pattern' | 'insight';
  title: string;
  content: string;
  relevanceScore: number;
  retrievalTime: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeRequest {
  projectId: string;
  businessRequest: string;
  domain: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sources: {
    useContext7: boolean;
    useWebSearch: boolean;
    useMemory: boolean;
  };
  maxResults?: number;
}

export interface ServiceHealth {
  service: 'context7' | 'websearch' | 'memory';
  isAvailable: boolean;
  responseTime: number;
  lastChecked: Date;
  errorCount: number;
}

export interface MCPCoordinatorConfig {
  timeout: number;
  maxConcurrentRequests: number;
  enableFallbacks: boolean;
  healthCheckInterval: number;
}

/**
 * MCP Coordinator for orchestrating external knowledge services
 */
export class MCPCoordinator {
  private context7: Context7Broker;
  private webSearch: WebSearchBroker;
  private memory: MemoryBroker;
  private config: MCPCoordinatorConfig;
  private serviceHealth: Map<string, ServiceHealth> = new Map();

  constructor(config: Partial<MCPCoordinatorConfig> = {}) {
    this.config = {
      timeout: config.timeout ?? 3000, // 3 second total timeout for tests
      maxConcurrentRequests: config.maxConcurrentRequests ?? 5,
      enableFallbacks: config.enableFallbacks ?? true,
      healthCheckInterval: config.healthCheckInterval ?? 300000, // 5 minutes
    };

    // Initialize brokers
    this.context7 = new Context7Broker({
      timeout: 1000, // Reduced for test performance
      enableFallback: this.config.enableFallbacks,
    });

    this.webSearch = new WebSearchBroker({
      timeout: 1000, // Reduced for test performance
      enableFallback: this.config.enableFallbacks,
      maxResults: 5,
    });

    this.memory = new MemoryBroker({
      timeout: 1000, // Reduced for test performance
      enableFallback: this.config.enableFallbacks,
      enablePersistence: true,
    });

    // Initialize service health tracking
    this.initializeServiceHealth();
  }

  /**
   * Gather comprehensive external knowledge for a business request
   */
  async gatherKnowledge(request: KnowledgeRequest): Promise<ExternalKnowledge[]> {
    const startTime = Date.now();
    const allKnowledge: ExternalKnowledge[] = [];
    const promises: Promise<ExternalKnowledge[]>[] = [];

    try {
      // Gather knowledge from enabled sources in parallel
      if (request.sources.useContext7) {
        promises.push(this.gatherContext7Knowledge(request));
      }

      if (request.sources.useWebSearch) {
        promises.push(this.gatherWebSearchKnowledge(request));
      }

      if (request.sources.useMemory) {
        promises.push(this.gatherMemoryKnowledge(request));
      }

      // Execute all requests with timeout protection
      const timeoutPromise = new Promise<ExternalKnowledge[]>((_, reject) => {
        setTimeout(() => reject(new Error('MCP knowledge gathering timeout')), this.config.timeout);
      });

      const results = await Promise.allSettled([
        ...promises,
        timeoutPromise as any, // Type workaround for timeout promise
      ]);

      // Process successful results
      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allKnowledge.push(...result.value);
        } else if (result.status === 'rejected') {
          console.warn('MCP service failed:', result.reason);
        }
      }

      // Sort by relevance score and limit results
      const maxResults = request.maxResults ?? 20;
      const sortedKnowledge = allKnowledge
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);

      // Update performance metrics
      const totalTime = Date.now() - startTime;
      this.updatePerformanceMetrics(totalTime, sortedKnowledge.length);

      return sortedKnowledge;
    } catch (error) {
      console.error('MCP knowledge gathering failed:', error);
      if (this.config.enableFallbacks) {
        return this.getFallbackKnowledge(request);
      }
      throw new Error(`External knowledge gathering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate business assumptions using external sources
   */
  async validateAssumptions(assumptions: string[], domain: string): Promise<ValidationResult[]> {
    const validationPromises = assumptions.map(assumption => 
      this.webSearch.validateTechnicalAssumptions(`${assumption} in ${domain}`)
    );

    try {
      const results = await Promise.allSettled(validationPromises);
      return results
        .filter((result): result is PromiseFulfilledResult<ValidationResult> => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Assumption validation failed:', error);
      return [];
    }
  }

  /**
   * Get market intelligence for business planning
   */
  async getMarketIntelligence(domain: string, businessRequest: string): Promise<{
    analysis: MarketAnalysis | null;
    trends: Trend[];
    insights: Insight[];
  }> {
    const startTime = Date.now();

    try {
      const [analysisResult, trendsResult, insightsResult] = await Promise.allSettled([
        this.webSearch.getMarketAnalysis(domain),
        this.webSearch.getCurrentTrends(domain),
        this.memory.getInsights(domain, businessRequest),
      ]);

      const analysis = analysisResult.status === 'fulfilled' ? analysisResult.value : null;
      const trends = trendsResult.status === 'fulfilled' ? trendsResult.value : [];
      const insights = insightsResult.status === 'fulfilled' ? insightsResult.value : [];

      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        console.warn(`Market intelligence gathering took ${responseTime}ms`);
      }

      return { analysis, trends, insights };
    } catch (error) {
      console.error('Market intelligence gathering failed:', error);
      return { analysis: null, trends: [], insights: [] };
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<ServiceHealth[]> {
    const services = ['context7', 'websearch', 'memory'] as const;
    const healthChecks = services.map(async (service) => {
      const startTime = Date.now();
      let isAvailable = false;

      try {
        switch (service) {
          case 'context7':
            isAvailable = await this.context7.checkAvailability();
            break;
          case 'websearch':
            isAvailable = await this.webSearch.checkAvailability();
            break;
          case 'memory':
            isAvailable = await this.memory.checkAvailability();
            break;
        }
      } catch {
        isAvailable = false;
      }

      const responseTime = Date.now() - startTime;
      const health: ServiceHealth = {
        service,
        isAvailable,
        responseTime,
        lastChecked: new Date(),
        errorCount: this.serviceHealth.get(service)?.errorCount ?? 0,
      };

      this.serviceHealth.set(service, health);
      return health;
    });

    return Promise.all(healthChecks);
  }

  /**
   * Store lessons learned from project outcomes
   */
  async storeLessonsLearned(
    domain: string,
    problem: string,
    solution: string,
    outcome: 'success' | 'failure' | 'partial',
    projectId?: string
  ): Promise<void> {
    try {
      const lessonData = {
        title: `${problem} Resolution`,
        description: `Lesson learned from ${outcome} in ${domain}`,
        domain,
        problem,
        solution,
        outcome,
        tags: [domain.toLowerCase(), problem.toLowerCase(), outcome],
        applicability: outcome === 'success' ? 0.8 : 0.6,
        confidence: outcome === 'success' ? 0.9 : 0.7,
        ...(projectId && { projectId }), // Only include if not undefined
      };

      await this.memory.storeLessonLearned(lessonData);
    } catch (error) {
      console.error('Failed to store lesson learned:', error);
    }
  }

  /**
   * Gather knowledge from Context7
   */
  private async gatherContext7Knowledge(request: KnowledgeRequest): Promise<ExternalKnowledge[]> {
    const knowledge: ExternalKnowledge[] = [];

    try {
      // Extract key technologies/topics from the business request
      const topics = this.extractTopics(request.businessRequest, request.domain);

      // Gather documentation
      for (const topic of topics.slice(0, 2)) { // Limit to 2 topics for performance
        const docs = await this.context7.getDocumentation(topic);
        knowledge.push(...docs.map(doc => this.transformDocumentation(doc)));

        const examples = await this.context7.getCodeExamples(topic, 'best practices');
        knowledge.push(...examples.map(example => this.transformCodeExample(example)));
      }

      // Get best practices for domain
      const practices = await this.context7.getBestPractices(request.domain);
      knowledge.push(...practices.map(practice => this.transformBestPractice(practice)));

      return knowledge;
    } catch (error) {
      console.error('Context7 knowledge gathering failed:', error);
      return [];
    }
  }

  /**
   * Gather knowledge from Web Search
   */
  private async gatherWebSearchKnowledge(request: KnowledgeRequest): Promise<ExternalKnowledge[]> {
    const knowledge: ExternalKnowledge[] = [];

    try {
      // Search for relevant information
      const searchResults = await this.webSearch.searchRelevantInfo(
        `${request.businessRequest} ${request.domain}`,
        3
      );
      knowledge.push(...searchResults.map(result => this.transformSearchResult(result)));

      // Get current trends
      const trends = await this.webSearch.getCurrentTrends(request.domain);
      knowledge.push(...trends.map(trend => this.transformTrend(trend)));

      return knowledge;
    } catch (error) {
      console.error('Web search knowledge gathering failed:', error);
      return [];
    }
  }

  /**
   * Gather knowledge from Memory
   */
  private async gatherMemoryKnowledge(request: KnowledgeRequest): Promise<ExternalKnowledge[]> {
    const knowledge: ExternalKnowledge[] = [];

    try {
      // Extract problems from business request
      const problems = this.extractProblems(request.businessRequest);

      // Get lessons learned
      for (const problem of problems.slice(0, 2)) { // Limit for performance
        const lessons = await this.memory.getLessonsLearned(request.domain, problem);
        knowledge.push(...lessons.map(lesson => this.transformLesson(lesson)));

        const patterns = await this.memory.getPatterns(problem, request.domain);
        knowledge.push(...patterns.map(pattern => this.transformPattern(pattern)));
      }

      // Get insights
      const insights = await this.memory.getInsights(request.domain, request.businessRequest);
      knowledge.push(...insights.map(insight => this.transformInsight(insight)));

      return knowledge;
    } catch (error) {
      console.error('Memory knowledge gathering failed:', error);
      return [];
    }
  }

  /**
   * Extract key topics from business request
   */
  private extractTopics(businessRequest: string, domain: string): string[] {
    // Simple extraction - in a real implementation, this could use NLP
    const commonTech = ['API', 'database', 'authentication', 'security', 'performance', 'monitoring'];
    const topics = [domain];
    
    const requestLower = businessRequest.toLowerCase();
    for (const tech of commonTech) {
      if (requestLower.includes(tech.toLowerCase())) {
        topics.push(tech);
      }
    }

    return topics.slice(0, 3); // Limit to 3 topics
  }

  /**
   * Extract problems from business request
   */
  private extractProblems(businessRequest: string): string[] {
    // Simple extraction - in a real implementation, this could use NLP
    const commonProblems = ['scalability', 'performance', 'security', 'integration', 'deployment'];
    const problems: string[] = [];
    
    const requestLower = businessRequest.toLowerCase();
    for (const problem of commonProblems) {
      if (requestLower.includes(problem)) {
        problems.push(problem);
      }
    }

    // Add a generic problem if none found
    if (problems.length === 0) {
      problems.push('implementation');
    }

    return problems;
  }

  // Transform methods to convert broker responses to ExternalKnowledge format

  private transformDocumentation(doc: Documentation): ExternalKnowledge {
    return {
      id: doc.id,
      source: 'context7',
      type: 'documentation',
      title: doc.title,
      content: doc.content,
      relevanceScore: doc.relevanceScore,
      retrievalTime: Date.now(),
      metadata: {
        url: doc.url,
        version: doc.version,
        lastUpdated: doc.lastUpdated,
      },
    };
  }

  private transformCodeExample(example: CodeExample): ExternalKnowledge {
    return {
      id: example.id,
      source: 'context7',
      type: 'example',
      title: example.title,
      content: `${example.description}\n\n\`\`\`${example.language}\n${example.code}\n\`\`\``,
      relevanceScore: example.relevanceScore,
      retrievalTime: Date.now(),
      metadata: {
        language: example.language,
        tags: example.tags,
        difficulty: example.difficulty,
      },
    };
  }

  private transformBestPractice(practice: BestPractice): ExternalKnowledge {
    return {
      id: practice.id,
      source: 'context7',
      type: 'best-practice',
      title: practice.title,
      content: `${practice.description}\n\nBenefits: ${practice.benefits.join(', ')}\nApplicable scenarios: ${practice.applicableScenarios.join(', ')}`,
      relevanceScore: practice.relevanceScore,
      retrievalTime: Date.now(),
      metadata: {
        category: practice.category,
        priority: practice.priority,
      },
    };
  }

  private transformSearchResult(result: SearchResult): ExternalKnowledge {
    return {
      id: result.id,
      source: 'websearch',
      type: 'search',
      title: result.title,
      content: result.snippet,
      relevanceScore: result.relevanceScore,
      retrievalTime: Date.now(),
      metadata: {
        url: result.url,
        source: result.source,
        publishedDate: result.publishedDate,
        trustScore: result.trustScore,
      },
    };
  }

  private transformTrend(trend: Trend): ExternalKnowledge {
    return {
      id: trend.id,
      source: 'websearch',
      type: 'trend',
      title: trend.topic,
      content: `${trend.description}\n\nPopularity: ${trend.popularity}% | Growth: ${trend.growth} | Timeframe: ${trend.timeframe}`,
      relevanceScore: trend.relevanceScore,
      retrievalTime: Date.now(),
      metadata: {
        category: trend.category,
        popularity: trend.popularity,
        growth: trend.growth,
        relatedTopics: trend.relatedTopics,
      },
    };
  }

  private transformLesson(lesson: Lesson): ExternalKnowledge {
    return {
      id: lesson.id,
      source: 'memory',
      type: 'lesson',
      title: lesson.title,
      content: `${lesson.description}\n\nProblem: ${lesson.problem}\nSolution: ${lesson.solution}\nOutcome: ${lesson.outcome}`,
      relevanceScore: lesson.applicability,
      retrievalTime: Date.now(),
      metadata: {
        domain: lesson.domain,
        outcome: lesson.outcome,
        tags: lesson.tags,
        confidence: lesson.confidence,
        dateAdded: lesson.dateAdded,
      },
    };
  }

  private transformPattern(pattern: Pattern): ExternalKnowledge {
    return {
      id: pattern.id,
      source: 'memory',
      type: 'pattern',
      title: pattern.name,
      content: `${pattern.description}\n\nSolution: ${pattern.solution}\nConsequences: ${pattern.consequences.join(', ')}\nSuccess Rate: ${Math.round(pattern.successRate * 100)}%`,
      relevanceScore: pattern.successRate,
      retrievalTime: Date.now(),
      metadata: {
        problem: pattern.problem,
        context: pattern.context,
        usageCount: pattern.usageCount,
        lastUsed: pattern.lastUsed,
        applicableScenarios: pattern.applicableScenarios,
      },
    };
  }

  private transformInsight(insight: Insight): ExternalKnowledge {
    return {
      id: insight.id,
      source: 'memory',
      type: 'insight',
      title: insight.title,
      content: `${insight.description}\n\nRecommendations:\n${insight.recommendations.map(r => `• ${r}`).join('\n')}`,
      relevanceScore: insight.confidence,
      retrievalTime: Date.now(),
      metadata: {
        category: insight.category,
        impact: insight.impact,
        projectType: insight.projectType,
        sources: insight.sources,
      },
    };
  }

  /**
   * Initialize service health tracking
   */
  private initializeServiceHealth(): void {
    const services = ['context7', 'websearch', 'memory'] as const;
    services.forEach(service => {
      this.serviceHealth.set(service, {
        service,
        isAvailable: false,
        responseTime: 0,
        lastChecked: new Date(),
        errorCount: 0,
      });
    });
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(totalTime: number, resultCount: number): void {
    // Log performance metrics for monitoring
    if (totalTime > 8000) { // 8 second warning threshold
      console.warn(`MCP knowledge gathering took ${totalTime}ms for ${resultCount} results`);
    }
  }

  /**
   * Provide fallback knowledge when services are unavailable
   */
  private getFallbackKnowledge(request: KnowledgeRequest): ExternalKnowledge[] {
    return [
      {
        id: `fallback-${request.projectId}`,
        source: 'memory',
        type: 'insight',
        title: 'General Guidance (Fallback)',
        content: `Basic guidance for ${request.businessRequest} in ${request.domain}. External services unavailable.`,
        relevanceScore: 0.4,
        retrievalTime: Date.now(),
        metadata: {
          fallback: true,
          originalRequest: request.businessRequest,
        },
      },
    ];
  }
}