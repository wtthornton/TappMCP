/**
 * MCP Tool Base Class
 *
 * Provides the foundation for all MCP tools with standardized patterns for:
 * - Input validation using Zod schemas
 * - Output generation with business context
 * - Error handling and recovery
 * - Performance monitoring
 * - Logging and debugging
 */
import { z } from 'zod';
export interface MCPToolConfig {
    name: string;
    description: string;
    version: string;
    inputSchema: z.ZodSchema;
    outputSchema: z.ZodSchema;
    timeout?: number;
    retries?: number;
}
export interface MCPToolResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        executionTime: number;
        timestamp: string;
        toolName: string;
        version: string;
    };
}
export interface MCPToolContext {
    requestId: string;
    userId?: string;
    sessionId?: string;
    businessContext?: Record<string, unknown>;
    role?: string;
}
export declare abstract class MCPTool<TInput = unknown, TOutput = unknown> {
    protected config: MCPToolConfig;
    protected logger: Console;
    constructor(config: MCPToolConfig, logger?: Console);
    /**
     * Main execution method - validates input, executes tool logic, and returns result
     */
    execute(input: TInput, context?: MCPToolContext): Promise<MCPToolResult<TOutput>>;
    /**
     * Validate input using the configured schema
     */
    protected validateInput(input: TInput): Promise<TInput>;
    /**
     * Validate output using the configured schema
     */
    protected validateOutput(output: TOutput): Promise<TOutput>;
    /**
     * Abstract method to be implemented by concrete tools
     */
    protected abstract executeInternal(input: TInput, context?: MCPToolContext): Promise<TOutput>;
    /**
     * Get tool configuration
     */
    getConfig(): MCPToolConfig;
    /**
     * Get tool name
     */
    getName(): string;
    /**
     * Get tool description
     */
    getDescription(): string;
    /**
     * Get tool version
     */
    getVersion(): string;
    /**
     * Check if tool is healthy
     */
    healthCheck(): Promise<boolean>;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
}
/**
 * MCP Tool Factory
 *
 * Creates and manages MCP tool instances
 */
export declare class MCPToolFactory {
    private static tools;
    static registerTool<T extends MCPTool>(tool: T): void;
    static getTool(name: string): MCPTool | undefined;
    static getAllTools(): MCPTool[];
    static getToolNames(): string[];
    static clearTools(): void;
}
//# sourceMappingURL=mcp-tool.d.ts.map