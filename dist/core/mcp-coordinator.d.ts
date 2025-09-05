#!/usr/bin/env node
/**
 * MCP Coordinator for External Service Integration
 *
 * Orchestrates and coordinates multiple MCP (Model Context Protocol) services
 * including Context7, Web Search, and Memory brokers for comprehensive
 * external knowledge integration in the Smart Plan tool.
 */
import { type Trend, type ValidationResult, type MarketAnalysis } from '../brokers/websearch-broker.js';
import { type Insight } from '../brokers/memory-broker.js';
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
export declare class MCPCoordinator {
    private context7;
    private webSearch;
    private memory;
    private config;
    private serviceHealth;
    constructor(config?: Partial<MCPCoordinatorConfig>);
    /**
     * Gather comprehensive external knowledge for a business request
     */
    gatherKnowledge(request: KnowledgeRequest): Promise<ExternalKnowledge[]>;
    /**
     * Validate business assumptions using external sources
     */
    validateAssumptions(assumptions: string[], domain: string): Promise<ValidationResult[]>;
    /**
     * Get market intelligence for business planning
     */
    getMarketIntelligence(domain: string, businessRequest: string): Promise<{
        analysis: MarketAnalysis | null;
        trends: Trend[];
        insights: Insight[];
    }>;
    /**
     * Get service health status
     */
    getServiceHealth(): Promise<ServiceHealth[]>;
    /**
     * Store lessons learned from project outcomes
     */
    storeLessonsLearned(domain: string, problem: string, solution: string, outcome: 'success' | 'failure' | 'partial', projectId?: string): Promise<void>;
    /**
     * Gather knowledge from Context7
     */
    private gatherContext7Knowledge;
    /**
     * Gather knowledge from Web Search
     */
    private gatherWebSearchKnowledge;
    /**
     * Gather knowledge from Memory
     */
    private gatherMemoryKnowledge;
    /**
     * Extract key topics from business request
     */
    private extractTopics;
    /**
     * Extract problems from business request
     */
    private extractProblems;
    private transformDocumentation;
    private transformCodeExample;
    private transformBestPractice;
    private transformSearchResult;
    private transformTrend;
    private transformLesson;
    private transformPattern;
    private transformInsight;
    /**
     * Initialize service health tracking
     */
    private initializeServiceHealth;
    /**
     * Update performance metrics
     */
    private updatePerformanceMetrics;
    /**
     * Provide fallback knowledge when services are unavailable
     */
    private getFallbackKnowledge;
}
//# sourceMappingURL=mcp-coordinator.d.ts.map