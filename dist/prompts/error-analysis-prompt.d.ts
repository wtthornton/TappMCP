import { MCPPrompt, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Error Analysis Prompt Schema
 */
export declare const ErrorAnalysisPromptSchema: z.ZodObject<{
    errorMessage: z.ZodString;
    errorType: z.ZodOptional<z.ZodString>;
    stackTrace: z.ZodOptional<z.ZodString>;
    codeContext: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    recentChanges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    errorMessage: string;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    language?: string | undefined;
    framework?: string | undefined;
    environment?: string | undefined;
    errorType?: string | undefined;
    stackTrace?: string | undefined;
    codeContext?: string | undefined;
    recentChanges?: string[] | undefined;
}, {
    errorMessage: string;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    language?: string | undefined;
    framework?: string | undefined;
    environment?: string | undefined;
    errorType?: string | undefined;
    stackTrace?: string | undefined;
    codeContext?: string | undefined;
    recentChanges?: string[] | undefined;
}>;
export type ErrorAnalysisPromptInput = z.infer<typeof ErrorAnalysisPromptSchema>;
/**
 * Error Analysis Prompt Class
 */
export declare class ErrorAnalysisPrompt extends MCPPrompt {
    constructor();
    /**
     * Analyze an error and provide debugging guidance
     */
    analyzeError(input: ErrorAnalysisPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Analyze common error patterns
     */
    analyzeCommonPattern(errorMessage: string, pattern: 'async-await' | 'promise-handling' | 'type-errors' | 'import-export' | 'scope-issues', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate debugging checklist
     */
    generateDebuggingChecklist(input: ErrorAnalysisPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string[]>>;
    /**
     * Suggest prevention strategies
     */
    suggestPreventionStrategies(input: ErrorAnalysisPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string[]>>;
}
//# sourceMappingURL=error-analysis-prompt.d.ts.map