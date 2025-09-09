#!/usr/bin/env node
/**
 * Context-Aware Template Engine - Simplified
 *
 * Advanced dynamic template generation with cross-session intelligence,
 * user behavior adaptation, and deep Context7 integration.
 * Provides maximum efficiency through predictive template optimization.
 */
import { BaseTemplateEngine } from './template-engine-core.js';
import { TemplateContext, TemplateMetadata, UserProfile, SessionContext, TemplateContextSchema, UserProfileSchema, SessionContextSchema, TemplateMetadataSchema, TemplateEngineMetricsSchema, type TemplateEngineMetrics } from './template-schemas.js';
/**
 * Context-Aware Template Engine
 *
 * Enhanced template engine with cross-session learning and user adaptation
 */
export declare class ContextAwareTemplateEngine extends BaseTemplateEngine {
    private _contextPatterns;
    private _crossSessionLearning;
    private performanceTracker;
    constructor();
    /**
     * Generate optimized template based on context
     */
    generateOptimizedTemplate(context: TemplateContext, userProfile?: UserProfile): Promise<string>;
    /**
     * Get or create session context
     */
    private getOrCreateSessionContext;
    /**
     * Find best template for context
     */
    private findBestTemplate;
    /**
     * Calculate template score based on context
     */
    private calculateTemplateScore;
    /**
     * Record template usage for learning
     */
    private recordUsage;
    /**
     * Estimate token count for context
     */
    private estimateTokenCount;
    /**
     * Get engine metrics
     */
    getMetrics(): TemplateEngineMetrics;
    /**
     * Calculate performance score
     */
    private calculatePerformanceScore;
}
export declare function createTemplateEngine(): ContextAwareTemplateEngine;
export { TemplateContextSchema, UserProfileSchema, SessionContextSchema, TemplateMetadataSchema, TemplateEngineMetricsSchema, type TemplateContext, type UserProfile, type SessionContext, type TemplateMetadata, type TemplateEngineMetrics, };
//# sourceMappingURL=ContextAwareTemplateEngine.d.ts.map