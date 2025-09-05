import { z } from 'zod';
/**
 * Smart Thought Process Tool
 *
 * This tool provides access to TappMCP's thought process and decision-making
 * during code generation. It reveals the reasoning behind code generation choices.
 */
declare const SmartThoughtProcessInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    codeId: z.ZodOptional<z.ZodString>;
    includeDetails: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeMetrics: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeRecommendations: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    includeDetails: boolean;
    includeMetrics: boolean;
    includeRecommendations: boolean;
    codeId?: string | undefined;
}, {
    projectId: string;
    codeId?: string | undefined;
    includeDetails?: boolean | undefined;
    includeMetrics?: boolean | undefined;
    includeRecommendations?: boolean | undefined;
}>;
type SmartThoughtProcessInput = z.infer<typeof SmartThoughtProcessInputSchema>;
interface ThoughtProcess {
    step1_analysis: {
        description: string;
        input: string;
        detectedKeywords: string[];
        decision: string;
        reasoning: string;
    };
    step2_detection: {
        description: string;
        isHtmlRequest: boolean;
        detectionCriteria: string[];
        confidence: number;
    };
    step3_generation: {
        description: string;
        chosenApproach: string;
        filesToCreate: string[];
        dependencies: string[];
        qualityConsiderations: string[];
    };
    step4_validation: {
        description: string;
        requirementsCheck: string[];
        qualityMetrics: Record<string, string>;
        potentialIssues: string[];
    };
}
/**
 * Get thought process for a specific code generation
 */
export declare function handleSmartThoughtProcess(input: unknown): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    timestamp: string;
}>;
export { SmartThoughtProcessInputSchema };
export type { SmartThoughtProcessInput, ThoughtProcess };
//# sourceMappingURL=smart_thought_process.d.ts.map