/**
 * MCP Prompt Base Class
 *
 * Provides the foundation for all MCP prompts with standardized patterns for:
 * - Template management and rendering
 * - Context management and memory
 * - Prompt optimization
 * - Performance monitoring
 * - Error handling and recovery
 */
import { z } from 'zod';
export interface MCPPromptConfig {
    name: string;
    description: string;
    version: string;
    template: string;
    variables: Record<string, z.ZodSchema>;
    contextSchema?: z.ZodSchema;
    cacheConfig?: {
        enabled: boolean;
        ttl?: number;
        maxSize?: number;
    };
}
export interface MCPPromptResult<T = unknown> {
    success: boolean;
    prompt?: string;
    data?: T;
    error?: string;
    metadata: {
        executionTime: number;
        timestamp: string;
        promptName: string;
        version: string;
        templateHash: string;
        variablesUsed: string[];
    };
}
export interface MCPPromptContext {
    requestId: string;
    userId?: string;
    sessionId?: string;
    businessContext?: Record<string, unknown>;
    role?: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: string;
    }>;
    memory?: Record<string, unknown>;
}
export declare abstract class MCPPrompt<TVariables = unknown, TOutput = unknown> {
    protected config: MCPPromptConfig;
    protected logger: Console;
    protected templateCache: Map<string, string>;
    constructor(config: MCPPromptConfig, logger?: Console);
    /**
     * Generate prompt with variables and context
     */
    generate(variables: TVariables, context?: MCPPromptContext): Promise<MCPPromptResult<TOutput>>;
    /**
     * Validate variables using the configured schema
     */
    protected validateVariables(variables: TVariables): Promise<TVariables>;
    /**
     * Validate context using the configured schema
     */
    protected validateContext(context: MCPPromptContext): Promise<MCPPromptContext>;
    /**
     * Render template with variables and context using Handlebars
     */
    protected renderTemplate(variables: TVariables, context?: MCPPromptContext): Promise<string>;
    /**
     * Process the rendered prompt (can be overridden by subclasses)
     */
    protected processPrompt(prompt: string, _context?: MCPPromptContext): Promise<TOutput>;
    /**
     * Generate template key for caching
     */
    private generateTemplateKey;
    /**
     * Generate template hash for tracking
     */
    private generateTemplateHash;
    /**
     * Simple hash function for strings
     */
    private hashString;
    /**
     * Get prompt configuration
     */
    getConfig(): MCPPromptConfig;
    /**
     * Get prompt name
     */
    getName(): string;
    /**
     * Get prompt description
     */
    getDescription(): string;
    /**
     * Get prompt version
     */
    getVersion(): string;
    /**
     * Check if prompt is healthy
     */
    healthCheck(): Promise<boolean>;
    /**
     * Create test variables for health check
     */
    protected createTestVariables(): TVariables;
    /**
     * Clear template cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
    };
    /**
     * Generate unique request ID
     */
    private generateRequestId;
}
/**
 * MCP Prompt Factory
 *
 * Creates and manages MCP prompt instances
 */
export declare class MCPPromptFactory {
    private static prompts;
    static setLogger(_logger: Console): void;
    static registerPrompt<T extends MCPPrompt>(prompt: T): void;
    static getPrompt(name: string): MCPPrompt | undefined;
    static getAllPrompts(): MCPPrompt[];
    static getPromptNames(): string[];
    static clearPrompts(): void;
}
//# sourceMappingURL=mcp-prompt.d.ts.map