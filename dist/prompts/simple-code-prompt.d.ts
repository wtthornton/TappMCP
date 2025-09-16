import { MCPPrompt, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Simple Code Generation Prompt Schema
 */
export declare const SimpleCodePromptSchema: z.ZodObject<{
    task: z.ZodString;
    language: z.ZodString;
    includeTests: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    task?: string;
    language?: string;
    includeTests?: boolean;
}, {
    task?: string;
    language?: string;
    includeTests?: boolean;
}>;
export type SimpleCodePromptInput = z.infer<typeof SimpleCodePromptSchema>;
/**
 * Simple Code Generation Prompt Class
 */
export declare class SimpleCodePrompt extends MCPPrompt<SimpleCodePromptInput, string> {
    constructor();
    /**
     * Generate code based on input parameters
     */
    generateCode(input: SimpleCodePromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
}
//# sourceMappingURL=simple-code-prompt.d.ts.map