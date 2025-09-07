#!/usr/bin/env node
/**
 * Context-Aware Template Engine - Week 2 Enhanced
 *
 * Advanced dynamic template generation with cross-session intelligence,
 * user behavior adaptation, and deep Context7 integration.
 * Provides maximum efficiency through predictive template optimization.
 *
 * Phase 1, Week 2 - Advanced Template Intelligence Implementation
 */
import { z } from 'zod';
/**
 * Template Context Schema
 */
export declare const TemplateContextSchema: z.ZodObject<{
    toolName: z.ZodString;
    taskType: z.ZodEnum<["generation", "analysis", "transformation", "planning", "debugging"]>;
    userLevel: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    outputFormat: z.ZodDefault<z.ZodEnum<["code", "text", "structured", "markdown"]>>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    contextHistory: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    timeConstraint: z.ZodDefault<z.ZodEnum<["immediate", "standard", "thorough"]>>;
    sessionId: z.ZodOptional<z.ZodString>;
    projectContext: z.ZodOptional<z.ZodObject<{
        projectId: z.ZodOptional<z.ZodString>;
        domain: z.ZodOptional<z.ZodString>;
        complexity: z.ZodOptional<z.ZodEnum<["simple", "moderate", "complex"]>>;
    }, "strip", z.ZodTypeAny, {
        projectId?: string | undefined;
        complexity?: "moderate" | "complex" | "simple" | undefined;
        domain?: string | undefined;
    }, {
        projectId?: string | undefined;
        complexity?: "moderate" | "complex" | "simple" | undefined;
        domain?: string | undefined;
    }>>;
    userBehaviorProfile: z.ZodOptional<z.ZodObject<{
        preferredVerbosity: z.ZodOptional<z.ZodEnum<["concise", "moderate", "detailed"]>>;
        commonPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        successfulTemplateIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        preferredVerbosity?: "detailed" | "moderate" | "concise" | undefined;
        commonPatterns?: string[] | undefined;
        successfulTemplateIds?: string[] | undefined;
    }, {
        preferredVerbosity?: "detailed" | "moderate" | "concise" | undefined;
        commonPatterns?: string[] | undefined;
        successfulTemplateIds?: string[] | undefined;
    }>>;
    contextualFactors: z.ZodOptional<z.ZodObject<{
        relatedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        workflowStage: z.ZodOptional<z.ZodEnum<["planning", "implementation", "testing", "deployment"]>>;
        urgencyLevel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        workflowStage?: "testing" | "deployment" | "planning" | "implementation" | undefined;
        relatedTools?: string[] | undefined;
        urgencyLevel?: number | undefined;
    }, {
        workflowStage?: "testing" | "deployment" | "planning" | "implementation" | undefined;
        relatedTools?: string[] | undefined;
        urgencyLevel?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    constraints: string[];
    toolName: string;
    userLevel: "beginner" | "intermediate" | "advanced";
    taskType: "planning" | "analysis" | "generation" | "transformation" | "debugging";
    outputFormat: "code" | "markdown" | "text" | "structured";
    preferences: Record<string, any>;
    contextHistory: string[];
    timeConstraint: "standard" | "immediate" | "thorough";
    sessionId?: string | undefined;
    projectContext?: {
        projectId?: string | undefined;
        complexity?: "moderate" | "complex" | "simple" | undefined;
        domain?: string | undefined;
    } | undefined;
    userBehaviorProfile?: {
        preferredVerbosity?: "detailed" | "moderate" | "concise" | undefined;
        commonPatterns?: string[] | undefined;
        successfulTemplateIds?: string[] | undefined;
    } | undefined;
    contextualFactors?: {
        workflowStage?: "testing" | "deployment" | "planning" | "implementation" | undefined;
        relatedTools?: string[] | undefined;
        urgencyLevel?: number | undefined;
    } | undefined;
}, {
    toolName: string;
    taskType: "planning" | "analysis" | "generation" | "transformation" | "debugging";
    constraints?: string[] | undefined;
    sessionId?: string | undefined;
    userLevel?: "beginner" | "intermediate" | "advanced" | undefined;
    outputFormat?: "code" | "markdown" | "text" | "structured" | undefined;
    preferences?: Record<string, any> | undefined;
    contextHistory?: string[] | undefined;
    timeConstraint?: "standard" | "immediate" | "thorough" | undefined;
    projectContext?: {
        projectId?: string | undefined;
        complexity?: "moderate" | "complex" | "simple" | undefined;
        domain?: string | undefined;
    } | undefined;
    userBehaviorProfile?: {
        preferredVerbosity?: "detailed" | "moderate" | "concise" | undefined;
        commonPatterns?: string[] | undefined;
        successfulTemplateIds?: string[] | undefined;
    } | undefined;
    contextualFactors?: {
        workflowStage?: "testing" | "deployment" | "planning" | "implementation" | undefined;
        relatedTools?: string[] | undefined;
        urgencyLevel?: number | undefined;
    } | undefined;
}>;
export type TemplateContext = z.infer<typeof TemplateContextSchema>;
export type { UserProfile, SessionContext, TemplateEngineMetrics };
/**
 * Template Metadata
 */
export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    toolName: string;
    taskType: string;
    baseTokens: number;
    compressionRatio: number;
    qualityScore: number;
    usageCount: number;
    lastUpdated: Date;
    variables: string[];
    adaptationLevel: number;
    crossSessionCompatible: boolean;
    userSegments: string[];
    performanceMetrics: {
        avgTokenReduction: number;
        successRate: number;
        avgQualityScore: number;
        adaptationAccuracy: number;
    };
    learningData: {
        effectiveContexts: string[];
        failurePatterns: string[];
        optimizationHistory: Array<{
            date: Date;
            change: string;
            impact: number;
        }>;
    };
}
/**
 * Template Generation Result
 */
export interface TemplateResult {
    template: string;
    variables: Record<string, any>;
    metadata: TemplateMetadata;
    estimatedTokens: number;
    contextInjections: string[];
    adaptationReason: string;
    confidenceScore: number;
    alternativeTemplates: Array<{
        id: string;
        reason: string;
        estimatedTokens: number;
    }>;
    predictiveOptimizations: string[];
    crossSessionContext: {
        relatedSessions: string[];
        carryOverContext: string[];
        persistentPreferences: Record<string, any>;
    };
}
/**
 * Context-Aware Template Engine Class
 */
export declare class ContextAwareTemplateEngine {
    private templates;
    private compiledTemplates;
    private contextPatterns;
    private optimizationStats;
    private userProfiles;
    private sessionMemory;
    private adaptationEngine;
    private crossSessionLearning;
    private performanceTracker;
    constructor();
    /**
     * Generate context-aware template with Week 2 advanced intelligence
     */
    generateTemplate(context: TemplateContext): Promise<TemplateResult>;
    /**
     * Get optimal template for given context
     */
    private getOptimalTemplate;
    /**
     * Create new template based on context
     */
    private createNewTemplate;
    /**
     * Generate base template structure
     */
    private generateBaseTemplate;
    /**
     * Built-in template definitions
     */
    private getGenerationTemplate;
    private getAnalysisTemplate;
    private getTransformationTemplate;
    private getPlanningTemplate;
    private getDebuggingTemplate;
    /**
     * Adapt template for specific user context
     */
    private adaptTemplateForUser;
    /**
     * Extract variables from context
     */
    private extractVariables;
    /**
     * Optimize template for specific context
     */
    private optimizeTemplate;
    /**
     * Get context injections based on history
     */
    private getContextInjections;
    /**
     * Initialize built-in templates
     */
    private initializeBuiltInTemplates;
    /**
     * Register Handlebars helpers
     */
    private registerHandlebarsHelpers;
    /**
     * Helper methods
     */
    private extractTemplateVariables;
    private countTokens;
    private estimateTokens;
    private addCodeSpecificOptimizations;
    private applyAdvancedUserOptimizations;
    private updateUsageStats;
    /**
     * Public API methods
     */
    getTemplateById(id: string): TemplateMetadata | undefined;
    getAllTemplates(): TemplateMetadata[];
    addCustomTemplate(template: TemplateMetadata & {
        template: string;
    }): void;
    /**
     * Week 2: Advanced user profile analysis
     */
    private analyzeUserProfile;
    /**
     * Week 2: Build session context with cross-session intelligence
     */
    private buildSessionContext;
    /**
     * Week 2: Advanced template selection with behavioral modeling
     */
    private getOptimalTemplateAdvanced;
    /**
     * Week 2: Advanced variable extraction with cross-session intelligence
     */
    private extractVariablesAdvanced;
    /**
     * Week 2: Advanced template optimization with behavioral adaptation
     */
    private optimizeTemplateAdvanced;
    /**
     * Week 2: Advanced context injections with session intelligence
     */
    private getAdvancedContextInjections;
    private findRelatedSessions;
    private createAdvancedTemplate;
    private getAdaptationReason;
    private calculateConfidenceScore;
    private generateAlternativeTemplates;
    private generatePredictiveOptimizations;
    private estimateTokensAdvanced;
    private updateAdvancedUsageStats;
    private applyConcisenessOptimizations;
    private applyDetailedOptimizations;
    private applyWorkflowOptimizations;
    private initializeAdvancedFeatures;
    getUsageStats(): Map<string, {
        uses: number;
        avgReduction: number;
    }>;
    renderTemplate(templateId: string, variables: Record<string, any>): string | null;
    getUserProfile(sessionId: string): Promise<UserProfile | undefined>;
    updateUserProfile(sessionId: string, updates: Partial<UserProfile>): Promise<void>;
    getPerformanceMetrics(): TemplateEngineMetrics;
}
interface UserProfile {
    userId: string;
    preferredVerbosity: 'concise' | 'moderate' | 'detailed';
    successfulTemplates: string[];
    commonPatterns: string[];
    adaptationHistory: Array<{
        templateId: string;
        adaptation: string;
        success: boolean;
    }>;
    persistentPreferences: Record<string, any>;
    performanceMetrics: {
        avgSatisfactionScore: number;
        preferredTokenRange: {
            min: number;
            max: number;
        };
        adaptationSuccessRate: number;
    };
}
interface SessionContext {
    sessionId: string;
    relatedSessions?: string[];
    carryOverContext?: string[];
    workflowStage: 'planning' | 'implementation' | 'testing' | 'deployment';
    contextualFactors: {
        relatedTools?: string[];
        workflowStage?: 'planning' | 'implementation' | 'testing' | 'deployment';
        urgencyLevel?: number;
    };
}
interface TemplateEngineMetrics {
    totalTemplates: number;
    activeUsers: number;
    avgAdaptationAccuracy: number;
    crossSessionEfficiency: number;
    overallPerformance: number;
}
export declare function createTemplateEngine(): ContextAwareTemplateEngine;
//# sourceMappingURL=ContextAwareTemplateEngine-old.d.ts.map