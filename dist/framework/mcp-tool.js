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
import { performance } from 'perf_hooks';
export class MCPTool {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger ?? console;
    }
    /**
     * Main execution method - validates input, executes tool logic, and returns result
     */
    async execute(input, context) {
        const startTime = performance.now();
        const requestId = context?.requestId ?? this.generateRequestId();
        try {
            // Validate input
            const validatedInput = await this.validateInput(input);
            // Execute tool logic
            const result = await this.executeInternal(validatedInput, context);
            // Validate output
            const validatedOutput = await this.validateOutput(result);
            const executionTime = performance.now() - startTime;
            // Log successful execution
            this.logger.info('Tool execution successful', {
                toolName: this.config.name,
                requestId,
                executionTime,
                timestamp: new Date().toISOString(),
            });
            return {
                success: true,
                data: validatedOutput,
                metadata: {
                    executionTime,
                    timestamp: new Date().toISOString(),
                    toolName: this.config.name,
                    version: this.config.version,
                },
            };
        }
        catch (error) {
            const executionTime = performance.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // Log error
            this.logger.error('Tool execution failed', {
                toolName: this.config.name,
                requestId,
                error: errorMessage,
                executionTime,
                timestamp: new Date().toISOString(),
            });
            return {
                success: false,
                error: errorMessage,
                metadata: {
                    executionTime,
                    timestamp: new Date().toISOString(),
                    toolName: this.config.name,
                    version: this.config.version,
                },
            };
        }
    }
    /**
     * Validate input using the configured schema
     */
    async validateInput(input) {
        try {
            return this.config.inputSchema.parse(input);
        }
        catch (error) {
            throw new Error(`Input validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
        }
    }
    /**
     * Validate output using the configured schema
     */
    async validateOutput(output) {
        try {
            return this.config.outputSchema.parse(output);
        }
        catch (error) {
            throw new Error(`Output validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
        }
    }
    /**
     * Get tool configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get tool name
     */
    getName() {
        return this.config.name;
    }
    /**
     * Get tool description
     */
    getDescription() {
        return this.config.description;
    }
    /**
     * Get tool version
     */
    getVersion() {
        return this.config.version;
    }
    /**
     * Check if tool is healthy
     */
    async healthCheck() {
        // Basic health check - can be overridden by subclasses
        return true;
    }
    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * MCP Tool Factory
 *
 * Creates and manages MCP tool instances
 */
export class MCPToolFactory {
    static tools = new Map();
    static registerTool(tool) {
        MCPToolFactory.tools.set(tool.getName(), tool);
    }
    static getTool(name) {
        return MCPToolFactory.tools.get(name);
    }
    static getAllTools() {
        return Array.from(MCPToolFactory.tools.values());
    }
    static getToolNames() {
        return Array.from(MCPToolFactory.tools.keys());
    }
    static clearTools() {
        MCPToolFactory.tools.clear();
    }
}
//# sourceMappingURL=mcp-tool.js.map