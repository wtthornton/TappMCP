import { MCPPrompt, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Code Generation Prompt Schema
 */
export declare const CodeGenerationPromptSchema: z.ZodObject<{
    task: z.ZodString;
    language: z.ZodString;
    framework: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    context: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodEnum<["functional", "object-oriented", "procedural"]>>;
    complexity: z.ZodOptional<z.ZodEnum<["simple", "medium", "complex"]>>;
    includeTests: z.ZodOptional<z.ZodBoolean>;
    includeComments: z.ZodOptional<z.ZodBoolean>;
    includeDocumentation: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    language: string;
    task: string;
    complexity?: "medium" | "complex" | "simple" | undefined;
    requirements?: string[] | undefined;
    context?: string | undefined;
    framework?: string | undefined;
    style?: "functional" | "object-oriented" | "procedural" | undefined;
    includeTests?: boolean | undefined;
    includeComments?: boolean | undefined;
    includeDocumentation?: boolean | undefined;
}, {
    language: string;
    task: string;
    complexity?: "medium" | "complex" | "simple" | undefined;
    requirements?: string[] | undefined;
    context?: string | undefined;
    framework?: string | undefined;
    style?: "functional" | "object-oriented" | "procedural" | undefined;
    includeTests?: boolean | undefined;
    includeComments?: boolean | undefined;
    includeDocumentation?: boolean | undefined;
}>;
export type CodeGenerationPromptInput = z.infer<typeof CodeGenerationPromptSchema>;
/**
 * Code Generation Prompt Class
 */
export declare class CodeGenerationPrompt extends MCPPrompt {
    constructor();
    /**
     * Generate code based on input parameters
     */
    generateCode(input: CodeGenerationPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate code with specific patterns
     */
    generateWithPattern(input: CodeGenerationPromptInput, pattern: 'singleton' | 'factory' | 'observer' | 'strategy' | 'builder', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate test code
     */
    generateTests(input: CodeGenerationPromptInput, testFramework: 'jest' | 'vitest' | 'mocha' | 'pytest' | 'unittest', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Optimize existing code
     */
    optimizeCode(code: string, language: string, optimizationGoals: ('performance' | 'readability' | 'maintainability')[], context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
}
//# sourceMappingURL=code-generation-prompt.d.ts.map