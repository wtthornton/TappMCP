#!/usr/bin/env node
/**
 * Web Search Broker for MCP Integration
 *
 * Provides integration with web search services for:
 * - Market research and competitive analysis
 * - Current trends and technology insights
 * - Real-time information gathering
 * - Technical assumption validation
 */
export interface SearchResult {
    id: string;
    title: string;
    url: string;
    snippet: string;
    publishedDate?: Date;
    source: string;
    relevanceScore: number;
    trustScore: number;
}
export interface Trend {
    id: string;
    topic: string;
    description: string;
    category: string;
    popularity: number;
    growth: 'increasing' | 'decreasing' | 'stable';
    timeframe: string;
    relatedTopics: string[];
    relevanceScore: number;
}
export interface ValidationResult {
    id: string;
    assumption: string;
    isValid: boolean;
    confidence: number;
    sources: SearchResult[];
    contradictingEvidence: string[];
    supportingEvidence: string[];
    recommendation: string;
}
export interface MarketAnalysis {
    id: string;
    domain: string;
    marketSize: {
        value: number;
        currency: string;
        year: number;
    };
    growthRate: number;
    keyPlayers: Array<{
        name: string;
        marketShare: number;
        description: string;
    }>;
    trends: string[];
    opportunities: string[];
    challenges: string[];
    relevanceScore: number;
}
export interface WebSearchBrokerConfig {
    apiUrl?: string;
    timeout: number;
    maxRetries: number;
    enableFallback: boolean;
    maxResults: number;
}
/**
 * Web Search Broker for market research and trend analysis
 */
export declare class WebSearchBroker {
    private config;
    private isAvailable;
    constructor(config?: Partial<WebSearchBrokerConfig>);
    /**
     * Search for relevant information on a topic
     */
    searchRelevantInfo(query: string, maxResults?: number): Promise<SearchResult[]>;
    /**
     * Get current trends for a topic
     */
    getCurrentTrends(topic: string): Promise<Trend[]>;
    /**
     * Validate technical assumptions against current information
     */
    validateTechnicalAssumptions(assumption: string): Promise<ValidationResult>;
    /**
     * Get market analysis for a domain
     */
    getMarketAnalysis(domain: string): Promise<MarketAnalysis>;
    /**
     * Check if web search service is available
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
    private getFallbackSearchResults;
    private getFallbackTrends;
    private getFallbackValidation;
    private getFallbackMarketAnalysis;
}
//# sourceMappingURL=websearch-broker.d.ts.map