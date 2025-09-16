/**
 * Smart Converse Tool - Natural Language Interface for TappMCP
 *
 * Provides a conversational interface that maps natural language
 * to existing TappMCP tools using simple keyword matching.
 */
import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const SmartConverseSchema: z.ZodObject<{
    userMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userMessage: string;
}, {
    userMessage: string;
}>;
export type SmartConverseInput = z.infer<typeof SmartConverseSchema>;
export declare const smartConverseTool: Tool;
/**
 * Parse user intent from natural language message
 * @param message - User's natural language input
 * @returns Parsed intent with project details
 */
export declare function parseIntent(message: string): {
    projectId: string;
    projectName: string;
    projectType: string;
    techStack: string[];
    role: string;
    description: string;
};
/**
 * Generate human-friendly response based on orchestration result
 * @param intent - Parsed user intent
 * @param orchestrateResult - Result from smart_orchestrate
 * @returns Formatted response text
 */
export declare function generateResponse(intent: ReturnType<typeof parseIntent>, orchestrateResult: any): string;
/**
 * Handle natural language conversation and map to TappMCP tools
 * @param input - User's natural language message
 * @returns Tool response with conversation result
 */
export declare function handleSmartConverse(input: SmartConverseInput): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}>;
//# sourceMappingURL=smart-converse.d.ts.map