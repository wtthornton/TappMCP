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
    timeout: number;
    maxRetries: number;
    enableFallback: boolean;
}
/**
 * Context7 Broker for external knowledge integration
 */
export declare class Context7Broker {
    private config;
    private isAvailable;
    constructor(config?: Partial<Context7BrokerConfig>);
    /**
     * Get documentation for a specific topic
     */
    getDocumentation(topic: string, version?: string): Promise<Documentation[]>;
    /**
     * Get code examples for a technology and pattern
     */
    getCodeExamples(technology: string, pattern: string): Promise<CodeExample[]>;
    /**
     * Get best practices for a domain
     */
    getBestPractices(domain: string): Promise<BestPractice[]>;
    /**
     * Get troubleshooting guides for a problem
     */
    getTroubleshootingGuides(problem: string): Promise<TroubleshootingGuide[]>;
    /**
     * Check if Context7 service is available
     */
    checkAvailability(): Promise<boolean>;
    /**
     * Simulate API call with configurable delay
     */
    private simulateAPICall;
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