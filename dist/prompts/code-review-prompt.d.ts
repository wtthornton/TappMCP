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
    severity?: "low" | "medium" | "high";
    code?: string;
    requirements?: string[];
    context?: string;
    language?: string;
    standards?: string[];
    focusAreas?: string[];
    reviewType?: "maintainability" | "performance" | "security" | "readability" | "comprehensive";
    includeSuggestions?: boolean;
    includeExamples?: boolean;
}, {
    severity?: "low" | "medium" | "high";
    code?: string;
    requirements?: string[];
    context?: string;
    language?: string;
    standards?: string[];
    focusAreas?: string[];
    reviewType?: "maintainability" | "performance" | "security" | "readability" | "comprehensive";
    includeSuggestions?: boolean;
    includeExamples?: boolean;
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