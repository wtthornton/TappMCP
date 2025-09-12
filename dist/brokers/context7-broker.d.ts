#!/usr/bin/env node
/**
 * Context7 Broker for MCP Integration
 *
 * Provides integration with Context7 service for:
 * - Documentation retrieval
 * - Code examples
 * - Best practices
 * - Troubleshooting guides
 */
export interface Documentation {
    id: string;
    title: string;
    content: string;
    url?: string;
    version?: string;
    lastUpdated: Date;
    relevanceScore: number;
}
export interface CodeExample {
    id: string;
    title: string;
    code: string;
    language: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    relevanceScore: number;
}
export interface BestPractice {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    applicableScenarios: string[];
    benefits: string[];
    relevanceScore: number;
}
export interface TroubleshootingGuide {
    id: string;
    problem: string;
    solutions: Array<{
        description: string;
        steps: string[];
        difficulty: 'easy' | 'medium' | 'hard';
        successRate: number;
    }>;
    relatedIssues: string[];
    relevanceScore: number;
}
export interface Context7BrokerConfig {
    apiUrl?: string;
    apiKey?: string | undefined;
    baseUrl?: string;
    timeout: number;
    maxRetries: number;
    enableFallback: boolean;
    enableCache: boolean;
    cacheExpiryHours: number;
    rateLimit: {
        requestsPerMinute: number;
        burstLimit: number;
    };
    retryPolicy: {
        maxRetries: number;
        baseDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
    };
}
/**
 * Context7 Broker for external knowledge integration
 */
export declare class Context7Broker {
    private config;
    private httpClient;
    private mcpClient;
    private isAvailable;
    private cache;
    private cacheFile;
    constructor(config?: Partial<Context7BrokerConfig>);
    /**
     * Check if Context7 MCP tools are available
     */
    private checkMCPAvailability;
    /**
     * Get cached data if available and not expired
     */
    private getCachedData;
    /**
     * Cache data with expiry
     */
    private setCachedData;
    /**
     * Save cache to file
     */
    private saveCache;
    /**
     * Load cache from file
     */
    private loadCache;
    /**
     * Get documentation for a specific topic
     */
    getDocumentation(topic: string, version?: string): Promise<Documentation[]>;
    /**
     * Fetch real documentation from Context7 MCP
     */
    private fetchRealDocumentation;
    /**
     * Resolve library ID using Context7 search API
     */
    private resolveLibraryId;
    /**
     * Get library documentation using Context7 library API
     */
    private getLibraryDocs;
    /**
     * Map topic to Context7 library ID (fallback method)
     */
    private mapTopicToLibraryId;
    /**
     * Get code examples for a technology and pattern
     */
    getCodeExamples(technology: string, pattern: string): Promise<CodeExample[]>;
    /**
     * Fetch real code examples from Context7 MCP
     */
    private fetchRealCodeExamples;
    /**
     * Get best practices for a domain
     */
    getBestPractices(domain: string): Promise<BestPractice[]>;
    /**
     * Fetch real best practices from Context7 MCP
     */
    private fetchRealBestPractices;
    /**
     * Get troubleshooting guides for a problem
     */
    getTroubleshootingGuides(problem: string): Promise<TroubleshootingGuide[]>;
    /**
     * Fetch real troubleshooting guides from Context7 MCP
     */
    private fetchRealTroubleshootingGuides;
    /**
     * Get knowledge for a specific topic (general method that combines all knowledge types)
     */
    getKnowledge(params: {
        topic: string;
        projectId: string;
        priority: 'low' | 'medium' | 'high';
    }): Promise<{
        documentation: Documentation[];
        codeExamples: CodeExample[];
        bestPractices: BestPractice[];
        troubleshootingGuides: TroubleshootingGuide[];
        summary: string;
    }>;
    /**
     * Generate a summary of the knowledge gathered
     */
    private generateKnowledgeSummary;
    /**
     * Check if Context7 service is available
     */
    checkAvailability(): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRate: string;
        memoryUsage: string;
    };
    /**
     * Check if cache is healthy
     */
    isCacheHealthy(): boolean;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Validate response time meets performance requirements
     */
    private validateResponseTime;
    private getFallbackDocumentation;
    private getFallbackCodeExamples;
    private getFallbackBestPractices;
    private getFallbackTroubleshootingGuides;
}
//# sourceMappingURL=context7-broker.d.ts.map