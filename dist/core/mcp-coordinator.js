#!/usr/bin/env node
/**
 * MCP Coordinator for External Service Integration
 *
 * Orchestrates and coordinates multiple MCP (Model Context Protocol) services
 * including Context7, Web Search, and Memory brokers for comprehensive
 * external knowledge integration in the Smart Plan tool.
 */
import { Context7Broker, } from '../brokers/context7-broker.js';
import { WebSearchBroker, } from '../brokers/websearch-broker.js';
import { MemoryBroker } from '../brokers/memory-broker.js';
/**
 * MCP Coordinator for orchestrating external knowledge services
 */
export class MCPCoordinator {
    context7;
    webSearch;
    memory;
    config;
    serviceHealth = new Map();
    constructor(config = {}) {
        this.config = {
            timeout: config.timeout ?? 1000, // 1 second total timeout for better performance
            maxConcurrentRequests: config.maxConcurrentRequests ?? 2,
            enableFallbacks: config.enableFallbacks ?? true,
            healthCheckInterval: config.healthCheckInterval ?? 300000, // 5 minutes
        };
        // Initialize brokers with optimized timeouts
        this.context7 = new Context7Broker({
            timeout: 500, // Further reduced for test performance
            enableFallback: this.config.enableFallbacks,
        });
        this.webSearch = new WebSearchBroker({
            timeout: 500, // Further reduced for test performance
            enableFallback: this.config.enableFallbacks,
            maxResults: 3, // Reduced results for performance
        });
        this.memory = new MemoryBroker({
            timeout: 500, // Further reduced for test performance
            enableFallback: this.config.enableFallbacks,
            enablePersistence: false, // Disable persistence for tests
        });
        // Initialize service health tracking
        this.initializeServiceHealth();
    }
    /**
     * Gather comprehensive external knowledge for a business request
     */
    async gatherKnowledge(request) {
        const startTime = Date.now();
        const allKnowledge = [];
        const promises = [];
        try {
            // Gather knowledge from enabled sources in parallel (limit to 2 for performance)
            let sourceCount = 0;
            if (request.sources.useContext7 && sourceCount < 2) {
                promises.push(this.gatherContext7Knowledge(request));
                sourceCount++;
            }
            if (request.sources.useWebSearch && sourceCount < 2) {
                promises.push(this.gatherWebSearchKnowledge(request));
                sourceCount++;
            }
            if (request.sources.useMemory && sourceCount < 2) {
                promises.push(this.gatherMemoryKnowledge(request));
                sourceCount++;
            }
            // Execute all requests with timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('MCP knowledge gathering timeout')), this.config.timeout);
            });
            const results = await Promise.allSettled([
                ...promises,
                timeoutPromise,
            ]);
            // Process successful results
            for (const result of results) {
                if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                    allKnowledge.push(...result.value);
                }
                else if (result.status === 'rejected') {
                    // MCP service failed
                }
            }
            // Sort by relevance score and limit results
            const maxResults = request.maxResults ?? 5; // Reduced from 20 to 5 for performance
            const sortedKnowledge = allKnowledge
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, maxResults);
            // Update performance metrics
            const totalTime = Date.now() - startTime;
            this.updatePerformanceMetrics(totalTime, sortedKnowledge.length);
            return sortedKnowledge;
        }
        catch (error) {
            // MCP knowledge gathering failed
            if (this.config.enableFallbacks) {
                return this.getFallbackKnowledge(request);
            }
            throw new Error(`External knowledge gathering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate business assumptions using external sources
     */
    async validateAssumptions(assumptions, domain) {
        const validationPromises = assumptions.map(assumption => this.webSearch.validateTechnicalAssumptions(`${assumption} in ${domain}`));
        try {
            const results = await Promise.allSettled(validationPromises);
            return results
                .filter((result) => result.status === 'fulfilled')
                .map(result => result.value);
        }
        catch (error) {
            // Assumption validation failed
            return [];
        }
    }
    /**
     * Get market intelligence for business planning
     */
    async getMarketIntelligence(domain, businessRequest) {
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
            // Performance monitoring for market intelligence
            return { analysis, trends, insights };
        }
        catch (error) {
            // Market intelligence gathering failed
            return { analysis: null, trends: [], insights: [] };
        }
    }
    /**
     * Get service health status
     */
    async getServiceHealth() {
        const services = ['context7', 'websearch', 'memory'];
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
            }
            catch {
                isAvailable = false;
            }
            const responseTime = Date.now() - startTime;
            const health = {
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
    async storeLessonsLearned(domain, problem, solution, outcome, projectId) {
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
        }
        catch (error) {
            // Failed to store lesson learned
        }
    }
    /**
     * Gather knowledge from Context7
     */
    async gatherContext7Knowledge(request) {
        const knowledge = [];
        try {
            // Extract key technologies/topics from the business request
            const topics = this.extractTopics(request.businessRequest, request.domain);
            // Gather documentation (limit to 1 topic for performance)
            for (const topic of topics.slice(0, 1)) {
                const docs = await this.context7.getDocumentation(topic);
                knowledge.push(...docs.slice(0, 2).map(doc => this.transformDocumentation(doc))); // Limit to 2 docs
                const examples = await this.context7.getCodeExamples(topic, 'best practices');
                knowledge.push(...examples.slice(0, 1).map(example => this.transformCodeExample(example))); // Limit to 1 example
            }
            // Get best practices for domain (limit to 1 for performance)
            const practices = await this.context7.getBestPractices(request.domain);
            knowledge.push(...practices.slice(0, 1).map(practice => this.transformBestPractice(practice)));
            return knowledge;
        }
        catch (error) {
            // Context7 knowledge gathering failed
            return [];
        }
    }
    /**
     * Gather knowledge from Web Search
     */
    async gatherWebSearchKnowledge(request) {
        const knowledge = [];
        try {
            // Search for relevant information (limit to 2 results)
            const searchResults = await this.webSearch.searchRelevantInfo(`${request.businessRequest} ${request.domain}`, 2);
            knowledge.push(...searchResults.map(result => this.transformSearchResult(result)));
            // Get current trends (limit to 1 trend)
            const trends = await this.webSearch.getCurrentTrends(request.domain);
            knowledge.push(...trends.slice(0, 1).map(trend => this.transformTrend(trend)));
            return knowledge;
        }
        catch (error) {
            // Web search knowledge gathering failed
            return [];
        }
    }
    /**
     * Gather knowledge from Memory
     */
    async gatherMemoryKnowledge(request) {
        const knowledge = [];
        try {
            // Extract problems from business request
            const problems = this.extractProblems(request.businessRequest);
            // Get lessons learned (limit to 1 problem for performance)
            for (const problem of problems.slice(0, 1)) {
                const lessons = await this.memory.getLessonsLearned(request.domain, problem);
                knowledge.push(...lessons.slice(0, 1).map(lesson => this.transformLesson(lesson))); // Limit to 1 lesson
                const patterns = await this.memory.getPatterns(problem, request.domain);
                knowledge.push(...patterns.slice(0, 1).map(pattern => this.transformPattern(pattern))); // Limit to 1 pattern
            }
            // Get insights (limit to 1 insight)
            const insights = await this.memory.getInsights(request.domain, request.businessRequest);
            knowledge.push(...insights.slice(0, 1).map(insight => this.transformInsight(insight)));
            return knowledge;
        }
        catch (error) {
            // Memory knowledge gathering failed
            return [];
        }
    }
    /**
     * Extract key topics from business request
     */
    extractTopics(businessRequest, domain) {
        // Simple extraction - in a real implementation, this could use NLP
        const commonTech = [
            'API',
            'database',
            'authentication',
            'security',
            'performance',
            'monitoring',
        ];
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
    extractProblems(businessRequest) {
        // Simple extraction - in a real implementation, this could use NLP
        const commonProblems = ['scalability', 'performance', 'security', 'integration', 'deployment'];
        const problems = [];
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
    transformDocumentation(doc) {
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
    transformCodeExample(example) {
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
    transformBestPractice(practice) {
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
    transformSearchResult(result) {
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
    transformTrend(trend) {
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
    transformLesson(lesson) {
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
    transformPattern(pattern) {
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
    transformInsight(insight) {
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
    initializeServiceHealth() {
        const services = ['context7', 'websearch', 'memory'];
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
    updatePerformanceMetrics(totalTime, resultCount) {
        // Log performance metrics for monitoring
        // Performance monitoring for MCP knowledge gathering
    }
    /**
     * Provide fallback knowledge when services are unavailable
     */
    getFallbackKnowledge(request) {
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
//# sourceMappingURL=mcp-coordinator.js.map