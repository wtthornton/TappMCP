#!/usr/bin/env node
/**
 * Memory Broker for MCP Integration
 *
 * Provides integration with memory services for:
 * - Lessons learned storage and retrieval
 * - Pattern recognition and matching
 * - Project insights and historical data
 * - Decision context preservation
 */
export interface Lesson {
    id: string;
    title: string;
    description: string;
    domain: string;
    problem: string;
    solution: string;
    outcome: 'success' | 'failure' | 'partial';
    tags: string[];
    projectId?: string;
    dateAdded: Date;
    applicability: number;
    confidence: number;
}
export interface Pattern {
    id: string;
    name: string;
    description: string;
    problem: string;
    context: string;
    solution: string;
    consequences: string[];
    applicableScenarios: string[];
    relatedPatterns: string[];
    usageCount: number;
    successRate: number;
    lastUsed: Date;
}
export interface Insight {
    id: string;
    title: string;
    description: string;
    projectType: string;
    requirements: string;
    category: 'technical' | 'business' | 'process' | 'risk';
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    sources: string[];
    recommendations: string[];
    dateGenerated: Date;
}
export interface HistoricalData {
    id: string;
    metric: string;
    timeframe: string;
    dataPoints: Array<{
        date: Date;
        value: number;
        context: string;
    }>;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    average: number;
    variance: number;
    predictions: Array<{
        date: Date;
        predictedValue: number;
        confidence: number;
    }>;
}
export interface MemoryBrokerConfig {
    apiUrl?: string;
    timeout: number;
    maxRetries: number;
    enableFallback: boolean;
    enablePersistence: boolean;
}
/**
 * Memory Broker for organizational learning and pattern recognition
 */
export declare class MemoryBroker {
    private config;
    private isAvailable;
    private inMemoryStorage;
    constructor(config?: Partial<MemoryBrokerConfig>);
    /**
     * Get lessons learned for a domain and problem
     */
    getLessonsLearned(domain: string, problem: string): Promise<Lesson[]>;
    /**
     * Get patterns for a problem and context
     */
    getPatterns(problem: string, context: string): Promise<Pattern[]>;
    /**
     * Get insights for a project type and requirements
     */
    getInsights(projectType: string, requirements: string): Promise<Insight[]>;
    /**
     * Get historical data for a metric
     */
    getHistoricalData(metric: string, timeframe: string): Promise<HistoricalData>;
    /**
     * Store a new lesson learned
     */
    storeLessonLearned(lesson: Omit<Lesson, 'id' | 'dateAdded'>): Promise<string>;
    /**
     * Check if memory service is available
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
    /**
     * Initialize sample data for demonstration
     */
    private initializeSampleData;
    /**
     * Generate sample data points for historical data
     */
    private generateSampleDataPoints;
    /**
     * Determine trend from data points
     */
    private determineTrend;
    /**
     * Generate predictions based on historical data
     */
    private generatePredictions;
    private getFallbackLessons;
    private getFallbackPatterns;
    private getFallbackInsights;
    private getFallbackHistoricalData;
}
//# sourceMappingURL=memory-broker.d.ts.map