import { MCPPrompt, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Documentation Prompt Schema
 */
export declare const DocumentationPromptSchema: z.ZodObject<{
    code: z.ZodString;
    language: z.ZodString;
    docType: z.ZodEnum<["api", "function", "class", "module", "readme", "tutorial", "guide"]>;
    style: z.ZodOptional<z.ZodEnum<["jsdoc", "tsdoc", "sphinx", "markdown", "asciidoc", "plain"]>>;
    audience: z.ZodOptional<z.ZodEnum<["developer", "end-user", "maintainer", "beginner", "expert"]>>;
    includeExamples: z.ZodOptional<z.ZodBoolean>;
    includeParameters: z.ZodOptional<z.ZodBoolean>;
    includeReturnValues: z.ZodOptional<z.ZodBoolean>;
    includeErrors: z.ZodOptional<z.ZodBoolean>;
    includeUsage: z.ZodOptional<z.ZodBoolean>;
    contextInfo: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code?: string;
    requirements?: string[];
    language?: string;
    style?: "markdown" | "jsdoc" | "tsdoc" | "sphinx" | "asciidoc" | "plain";
    includeExamples?: boolean;
    docType?: "function" | "api" | "class" | "module" | "readme" | "tutorial" | "guide";
    audience?: "beginner" | "developer" | "expert" | "end-user" | "maintainer";
    includeParameters?: boolean;
    includeReturnValues?: boolean;
    includeErrors?: boolean;
    includeUsage?: boolean;
    contextInfo?: string;
}, {
    code?: string;
    requirements?: string[];
    language?: string;
    style?: "markdown" | "jsdoc" | "tsdoc" | "sphinx" | "asciidoc" | "plain";
    includeExamples?: boolean;
    docType?: "function" | "api" | "class" | "module" | "readme" | "tutorial" | "guide";
    audience?: "beginner" | "developer" | "expert" | "end-user" | "maintainer";
    includeParameters?: boolean;
    includeReturnValues?: boolean;
    includeErrors?: boolean;
    includeUsage?: boolean;
    contextInfo?: string;
}>;
export type DocumentationPromptInput = z.infer<typeof DocumentationPromptSchema>;
/**
 * Documentation Prompt Class
 */
export declare class DocumentationPrompt extends MCPPrompt {
    constructor();
    /**
     * Generate documentation
     */
    generateDocumentation(input: DocumentationPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate API documentation
     */
    generateApiDocs(code: string, language: string, style?: 'jsdoc' | 'tsdoc' | 'sphinx' | 'markdown', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate README documentation
     */
    generateReadme(code: string, language: string, projectName: string, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate tutorial documentation
     */
    generateTutorial(code: string, language: string, topic: string, context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate function documentation
     */
    generateFunctionDocs(code: string, language: string, style?: 'jsdoc' | 'tsdoc', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
    /**
     * Generate class documentation
     */
    generateClassDocs(code: string, language: string, style?: 'jsdoc' | 'tsdoc', context?: MCPPromptContext): Promise<MCPPromptResult<string>>;
}
//# sourceMappingURL=documentation-prompt.d.ts.map