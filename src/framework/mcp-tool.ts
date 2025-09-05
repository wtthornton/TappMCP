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
import { performance } from 'perf_hooks';

export interface MCPToolConfig {
  name: string;
  description: string;
  version: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  timeout?: number;
  retries?: number;
}

export interface MCPToolResult<T = any> {
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
  businessContext?: Record<string, any>;
  role?: string;
}

export abstract class MCPTool<TInput = any, TOutput = any> {
  protected config: MCPToolConfig;
  protected logger: any;

  constructor(config: MCPToolConfig, logger?: any) {
    this.config = config;
    this.logger = logger || console;
  }

  /**
   * Main execution method - validates input, executes tool logic, and returns result
   */
  async execute(input: TInput, context?: MCPToolContext): Promise<MCPToolResult<TOutput>> {
    const startTime = performance.now();
    const requestId = context?.requestId || this.generateRequestId();
    
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
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        data: validatedOutput,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          toolName: this.config.name,
          version: this.config.version
        }
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log error
      this.logger.error('Tool execution failed', {
        toolName: this.config.name,
        requestId,
        error: errorMessage,
        executionTime,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: errorMessage,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          toolName: this.config.name,
          version: this.config.version
        }
      };
    }
  }

  /**
   * Validate input using the configured schema
   */
  protected async validateInput(input: TInput): Promise<TInput> {
    try {
      return this.config.inputSchema.parse(input);
    } catch (error) {
      throw new Error(`Input validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  /**
   * Validate output using the configured schema
   */
  protected async validateOutput(output: TOutput): Promise<TOutput> {
    try {
      return this.config.outputSchema.parse(output);
    } catch (error) {
      throw new Error(`Output validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  /**
   * Abstract method to be implemented by concrete tools
   */
  protected abstract executeInternal(input: TInput, context?: MCPToolContext): Promise<TOutput>;

  /**
   * Get tool configuration
   */
  getConfig(): MCPToolConfig {
    return { ...this.config };
  }

  /**
   * Get tool name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get tool description
   */
  getDescription(): string {
    return this.config.description;
  }

  /**
   * Get tool version
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Check if tool is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Basic health check - can be overridden by subclasses
      return true;
    } catch (error) {
      this.logger.error('Health check failed', {
        toolName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MCP Tool Factory
 * 
 * Creates and manages MCP tool instances
 */
export class MCPToolFactory {
  private static tools = new Map<string, MCPTool>();
  private static logger: any;

  static setLogger(logger: any): void {
    MCPToolFactory.logger = logger;
  }

  static registerTool<T extends MCPTool>(tool: T): void {
    MCPToolFactory.tools.set(tool.getName(), tool);
  }

  static getTool(name: string): MCPTool | undefined {
    return MCPToolFactory.tools.get(name);
  }

  static getAllTools(): MCPTool[] {
    return Array.from(MCPToolFactory.tools.values());
  }

  static getToolNames(): string[] {
    return Array.from(MCPToolFactory.tools.keys());
  }

  static clearTools(): void {
    MCPToolFactory.tools.clear();
  }
}
