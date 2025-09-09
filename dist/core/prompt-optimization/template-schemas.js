/**
 * Template Schemas and Types
 *
 * Contains all Zod schemas and TypeScript types for the template engine
 */
import { z } from 'zod';
/**
 * Template Context Schema
 */
export const TemplateContextSchema = z.object({
    toolName: z.string(),
    taskType: z.enum(['generation', 'analysis', 'transformation', 'planning', 'debugging']),
    userLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    outputFormat: z.enum(['code', 'text', 'structured', 'markdown']).default('text'),
    constraints: z.array(z.string()).default([]),
    preferences: z.record(z.any()).default({}),
    contextHistory: z.array(z.string()).default([]),
    timeConstraint: z.enum(['immediate', 'standard', 'thorough']).default('standard'),
    // Week 2 Enhancements
    sessionId: z.string().optional(),
    projectContext: z
        .object({
        projectId: z.string().optional(),
        domain: z.string().optional(),
        complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
    })
        .optional(),
    userBehaviorProfile: z
        .object({
        preferredVerbosity: z.enum(['concise', 'moderate', 'detailed']).optional(),
        commonPatterns: z.array(z.string()).optional(),
        successfulTemplateIds: z.array(z.string()).optional(),
    })
        .optional(),
    contextualFactors: z
        .object({
        relatedTools: z.array(z.string()).optional(),
        workflowStage: z.enum(['planning', 'implementation', 'testing', 'deployment']).optional(),
        urgencyLevel: z.number().min(1).max(10).optional(),
    })
        .optional(),
});
/**
 * User Profile Schema
 */
export const UserProfileSchema = z.object({
    id: z.string(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    preferredStyle: z.enum(['concise', 'detailed', 'technical', 'business']),
    commonTasks: z.array(z.string()),
    successPatterns: z.array(z.string()),
    lastActive: z.date(),
});
/**
 * Session Context Schema
 */
export const SessionContextSchema = z.object({
    sessionId: z.string(),
    startTime: z.date(),
    templatesUsed: z.array(z.string()),
    successRate: z.number().min(0).max(1),
    userSatisfaction: z.number().min(1).max(5).optional(),
    contextPreservation: z.boolean().default(true),
});
/**
 * Template Metadata Schema
 */
export const TemplateMetadataSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    toolName: z.string(),
    taskType: z.string(),
    baseTokens: z.number(),
    compressionRatio: z.number().min(0).max(1),
    qualityScore: z.number().min(0).max(100),
    usageCount: z.number().min(0),
    lastUpdated: z.date(),
    variables: z.array(z.string()),
    adaptationLevel: z.enum(['static', 'dynamic', 'adaptive']).default('static'),
    crossSessionCompatible: z.boolean().default(true),
    userSegments: z.array(z.string()).default([]),
    performanceMetrics: z
        .object({
        averageExecutionTime: z.number(),
        successRate: z.number(),
        userSatisfaction: z.number(),
    })
        .optional(),
    learningData: z
        .object({
        successfulOutcomes: z.number(),
        failedOutcomes: z.number(),
        adaptationTriggers: z.array(z.string()),
    })
        .optional(),
});
/**
 * Template Engine Metrics Schema
 */
export const TemplateEngineMetricsSchema = z.object({
    totalTemplates: z.number(),
    activeTemplates: z.number(),
    averageQualityScore: z.number(),
    totalUsage: z.number(),
    crossSessionLearning: z.boolean(),
    adaptationEnabled: z.boolean(),
    performanceScore: z.number(),
});
//# sourceMappingURL=template-schemas.js.map