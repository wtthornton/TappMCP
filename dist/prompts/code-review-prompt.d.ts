import { MCPPrompt, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Code Review Prompt Schema
 */
export declare const CodeReviewPromptSchema: z.ZodObject<{
    code: z.ZodString;
    language: z.ZodString;
    reviewType: z.ZodEnum<["security", "performance", "maintainability", "readability", "comprehensive"]>;
    focusAreas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    standards: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    context: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeSuggestions: z.ZodOptional<z.ZodBoolean>;
    includeExamples: z.ZodOptional<z.ZodBoolean>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    language: string;
    reviewType: "security" | "maintainability" | "performance" | "comprehensive" | "readability";
    severity?: "high" | "medium" | "low" | undefined;
    requirements?: string[] | undefined;
    context?: string | undefined;
    focusAreas?: string[] | undefined;
    includeSuggestions?: boolean | undefined;
    standards?: string[] | undefined;
    includeExamples?: boolean | undefined;
}, {
    code: string;
    language: string;
    reviewType: "security" | "maintainability" | "performance" | "comprehensive" | "readability";
    severity?: "high" | "medium" | "low" | undefined;
    requirements?: string[] | undefined;
    context?: string | undefined;
    focusAreas?: string[] | undefined;
    includeSuggestions?: boolean | undefined;
    standards?: string[] | undefined;
    includeExamples?: boolean | undefined;
}>;
export type CodeReviewPromptInput = z.infer<typeof CodeReviewPromptSchema>;
/**
 * Code Review Prompt Class
 */
export declare class CodeReviewPrompt extends MCPPrompt {
    constructor();
    /**
     * Perform code review
     */
    reviewCode(input: CodeReviewPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Perform security-focused review
     */
    securityReview(code: string, language: string, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Perform performance-focused review
     */
    performanceReview(code: string, language: string, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Perform maintainability review
     */
    maintainabilityReview(code: string, language: string, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate review checklist
     */
    generateReviewChecklist(_language: string, reviewType: 'security' | 'performance' | 'maintainability' | 'readability' | 'comprehensive', _context?: MCPPromptContext): Promise<MCPPromptResult<string[]>>;
}
//# sourceMappingURL=code-review-prompt.d.ts.map