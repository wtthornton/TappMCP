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
    id: string;
    experienceLevel: "beginner" | "intermediate" | "advanced";
    preferredStyle: "detailed" | "business" | "technical" | "concise";
    commonTasks: string[];
    successPatterns: string[];
    lastActive: Date;
}, {
    id: string;
    experienceLevel: "beginner" | "intermediate" | "advanced";
    preferredStyle: "detailed" | "business" | "technical" | "concise";
    commonTasks: string[];
    successPatterns: string[];
    lastActive: Date;
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
    sessionId: string;
    startTime: Date;
    templatesUsed: string[];
    successRate: number;
    contextPreservation: boolean;
    userSatisfaction?: number | undefined;
}, {
    sessionId: string;
    startTime: Date;
    templatesUsed: string[];
    successRate: number;
    userSatisfaction?: number | undefined;
    contextPreservation?: boolean | undefined;
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
        userSatisfaction: number;
        successRate: number;
        averageExecutionTime: number;
    }, {
        userSatisfaction: number;
        successRate: number;
        averageExecutionTime: number;
    }>>;
    learningData: z.ZodOptional<z.ZodObject<{
        successfulOutcomes: z.ZodNumber;
        failedOutcomes: z.ZodNumber;
        adaptationTriggers: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        successfulOutcomes: number;
        failedOutcomes: number;
        adaptationTriggers: string[];
    }, {
        successfulOutcomes: number;
        failedOutcomes: number;
        adaptationTriggers: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    id: string;
    lastUpdated: Date;
    usageCount: number;
    toolName: string;
    qualityScore: number;
    compressionRatio: number;
    taskType: string;
    baseTokens: number;
    variables: string[];
    adaptationLevel: "adaptive" | "static" | "dynamic";
    crossSessionCompatible: boolean;
    userSegments: string[];
    performanceMetrics?: {
        userSatisfaction: number;
        successRate: number;
        averageExecutionTime: number;
    } | undefined;
    learningData?: {
        successfulOutcomes: number;
        failedOutcomes: number;
        adaptationTriggers: string[];
    } | undefined;
}, {
    description: string;
    name: string;
    id: string;
    lastUpdated: Date;
    usageCount: number;
    toolName: string;
    qualityScore: number;
    compressionRatio: number;
    taskType: string;
    baseTokens: number;
    variables: string[];
    adaptationLevel?: "adaptive" | "static" | "dynamic" | undefined;
    crossSessionCompatible?: boolean | undefined;
    userSegments?: string[] | undefined;
    performanceMetrics?: {
        userSatisfaction: number;
        successRate: number;
        averageExecutionTime: number;
    } | undefined;
    learningData?: {
        successfulOutcomes: number;
        failedOutcomes: number;
        adaptationTriggers: string[];
    } | undefined;
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
    totalTemplates: number;
    activeTemplates: number;
    averageQualityScore: number;
    totalUsage: number;
    crossSessionLearning: boolean;
    adaptationEnabled: boolean;
    performanceScore: number;
}, {
    totalTemplates: number;
    activeTemplates: number;
    averageQualityScore: number;
    totalUsage: number;
    crossSessionLearning: boolean;
    adaptationEnabled: boolean;
    performanceScore: number;
}>;
export type TemplateEngineMetrics = z.infer<typeof TemplateEngineMetricsSchema>;
//# sourceMappingURL=template-schemas.d.ts.map