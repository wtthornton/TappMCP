/**
 * Template Schemas and Types
 *
 * Contains all Zod schemas and TypeScript types for the template engine
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
        projectId?: string;
        complexity?: "moderate" | "complex" | "simple";
        domain?: string;
    }, {
        projectId?: string;
        complexity?: "moderate" | "complex" | "simple";
        domain?: string;
    }>>;
    userBehaviorProfile: z.ZodOptional<z.ZodObject<{
        preferredVerbosity: z.ZodOptional<z.ZodEnum<["concise", "moderate", "detailed"]>>;
        commonPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        successfulTemplateIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        preferredVerbosity?: "moderate" | "detailed" | "concise";
        commonPatterns?: string[];
        successfulTemplateIds?: string[];
    }, {
        preferredVerbosity?: "moderate" | "detailed" | "concise";
        commonPatterns?: string[];
        successfulTemplateIds?: string[];
    }>>;
    contextualFactors: z.ZodOptional<z.ZodObject<{
        relatedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        workflowStage: z.ZodOptional<z.ZodEnum<["planning", "implementation", "testing", "deployment"]>>;
        urgencyLevel: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        workflowStage?: "planning" | "testing" | "deployment" | "implementation";
        relatedTools?: string[];
        urgencyLevel?: number;
    }, {
        workflowStage?: "planning" | "testing" | "deployment" | "implementation";
        relatedTools?: string[];
        urgencyLevel?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    constraints?: string[];
    preferences?: Record<string, any>;
    toolName?: string;
    sessionId?: string;
    userLevel?: "beginner" | "intermediate" | "advanced";
    taskType?: "analysis" | "generation" | "planning" | "transformation" | "debugging";
    outputFormat?: "text" | "code" | "markdown" | "structured";
    contextHistory?: string[];
    timeConstraint?: "standard" | "immediate" | "thorough";
    projectContext?: {
        projectId?: string;
        complexity?: "moderate" | "complex" | "simple";
        domain?: string;
    };
    userBehaviorProfile?: {
        preferredVerbosity?: "moderate" | "detailed" | "concise";
        commonPatterns?: string[];
        successfulTemplateIds?: string[];
    };
    contextualFactors?: {
        workflowStage?: "planning" | "testing" | "deployment" | "implementation";
        relatedTools?: string[];
        urgencyLevel?: number;
    };
}, {
    constraints?: string[];
    preferences?: Record<string, any>;
    toolName?: string;
    sessionId?: string;
    userLevel?: "beginner" | "intermediate" | "advanced";
    taskType?: "analysis" | "generation" | "planning" | "transformation" | "debugging";
    outputFormat?: "text" | "code" | "markdown" | "structured";
    contextHistory?: string[];
    timeConstraint?: "standard" | "immediate" | "thorough";
    projectContext?: {
        projectId?: string;
        complexity?: "moderate" | "complex" | "simple";
        domain?: string;
    };
    userBehaviorProfile?: {
        preferredVerbosity?: "moderate" | "detailed" | "concise";
        commonPatterns?: string[];
        successfulTemplateIds?: string[];
    };
    contextualFactors?: {
        workflowStage?: "planning" | "testing" | "deployment" | "implementation";
        relatedTools?: string[];
        urgencyLevel?: number;
    };
}>;
export type TemplateContext = z.infer<typeof TemplateContextSchema>;
/**
 * User Profile Schema
 */
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    experienceLevel: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    preferredStyle: z.ZodEnum<["concise", "detailed", "technical", "business"]>;
    commonTasks: z.ZodArray<z.ZodString, "many">;
    successPatterns: z.ZodArray<z.ZodString, "many">;
    lastActive: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    experienceLevel?: "beginner" | "intermediate" | "advanced";
    preferredStyle?: "technical" | "business" | "detailed" | "concise";
    commonTasks?: string[];
    successPatterns?: string[];
    lastActive?: Date;
}, {
    id?: string;
    experienceLevel?: "beginner" | "intermediate" | "advanced";
    preferredStyle?: "technical" | "business" | "detailed" | "concise";
    commonTasks?: string[];
    successPatterns?: string[];
    lastActive?: Date;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
/**
 * Session Context Schema
 */
export declare const SessionContextSchema: z.ZodObject<{
    sessionId: z.ZodString;
    startTime: z.ZodDate;
    templatesUsed: z.ZodArray<z.ZodString, "many">;
    successRate: z.ZodNumber;
    userSatisfaction: z.ZodOptional<z.ZodNumber>;
    contextPreservation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userSatisfaction?: number;
    successRate?: number;
    sessionId?: string;
    startTime?: Date;
    templatesUsed?: string[];
    contextPreservation?: boolean;
}, {
    userSatisfaction?: number;
    successRate?: number;
    sessionId?: string;
    startTime?: Date;
    templatesUsed?: string[];
    contextPreservation?: boolean;
}>;
export type SessionContext = z.infer<typeof SessionContextSchema>;
/**
 * Template Metadata Schema
 */
export declare const TemplateMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    toolName: z.ZodString;
    taskType: z.ZodString;
    baseTokens: z.ZodNumber;
    compressionRatio: z.ZodNumber;
    qualityScore: z.ZodNumber;
    usageCount: z.ZodNumber;
    lastUpdated: z.ZodDate;
    variables: z.ZodArray<z.ZodString, "many">;
    adaptationLevel: z.ZodDefault<z.ZodEnum<["static", "dynamic", "adaptive"]>>;
    crossSessionCompatible: z.ZodDefault<z.ZodBoolean>;
    userSegments: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    performanceMetrics: z.ZodOptional<z.ZodObject<{
        averageExecutionTime: z.ZodNumber;
        successRate: z.ZodNumber;
        userSatisfaction: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userSatisfaction?: number;
        successRate?: number;
        averageExecutionTime?: number;
    }, {
        userSatisfaction?: number;
        successRate?: number;
        averageExecutionTime?: number;
    }>>;
    learningData: z.ZodOptional<z.ZodObject<{
        successfulOutcomes: z.ZodNumber;
        failedOutcomes: z.ZodNumber;
        adaptationTriggers: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        successfulOutcomes?: number;
        failedOutcomes?: number;
        adaptationTriggers?: string[];
    }, {
        successfulOutcomes?: number;
        failedOutcomes?: number;
        adaptationTriggers?: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    id?: string;
    qualityScore?: number;
    lastUpdated?: Date;
    usageCount?: number;
    toolName?: string;
    compressionRatio?: number;
    taskType?: string;
    baseTokens?: number;
    variables?: string[];
    adaptationLevel?: "static" | "adaptive" | "dynamic";
    crossSessionCompatible?: boolean;
    userSegments?: string[];
    performanceMetrics?: {
        userSatisfaction?: number;
        successRate?: number;
        averageExecutionTime?: number;
    };
    learningData?: {
        successfulOutcomes?: number;
        failedOutcomes?: number;
        adaptationTriggers?: string[];
    };
}, {
    name?: string;
    description?: string;
    id?: string;
    qualityScore?: number;
    lastUpdated?: Date;
    usageCount?: number;
    toolName?: string;
    compressionRatio?: number;
    taskType?: string;
    baseTokens?: number;
    variables?: string[];
    adaptationLevel?: "static" | "adaptive" | "dynamic";
    crossSessionCompatible?: boolean;
    userSegments?: string[];
    performanceMetrics?: {
        userSatisfaction?: number;
        successRate?: number;
        averageExecutionTime?: number;
    };
    learningData?: {
        successfulOutcomes?: number;
        failedOutcomes?: number;
        adaptationTriggers?: string[];
    };
}>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
/**
 * Template Engine Metrics Schema
 */
export declare const TemplateEngineMetricsSchema: z.ZodObject<{
    totalTemplates: z.ZodNumber;
    activeTemplates: z.ZodNumber;
    averageQualityScore: z.ZodNumber;
    totalUsage: z.ZodNumber;
    crossSessionLearning: z.ZodBoolean;
    adaptationEnabled: z.ZodBoolean;
    performanceScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    performanceScore?: number;
    totalTemplates?: number;
    activeTemplates?: number;
    averageQualityScore?: number;
    totalUsage?: number;
    crossSessionLearning?: boolean;
    adaptationEnabled?: boolean;
}, {
    performanceScore?: number;
    totalTemplates?: number;
    activeTemplates?: number;
    averageQualityScore?: number;
    totalUsage?: number;
    crossSessionLearning?: boolean;
    adaptationEnabled?: boolean;
}>;
export type TemplateEngineMetrics = z.infer<typeof TemplateEngineMetricsSchema>;
//# sourceMappingURL=template-schemas.d.ts.map