/**
 * MCP Prompt Base Class
 * 
 * Provides the foundation for all MCP prompts with standardized patterns for:
 * - Template management and rendering
 * - Context management and memory
 * - Prompt optimization and A/B testing
 * - Performance monitoring
 * - Error handling and recovery
 */

import { z } from 'zod';
import { performance } from 'perf_hooks';

export interface MCPPromptConfig {
  name: string;
  description: string;
  version: string;
  template: string;
  variables: Record<string, z.ZodSchema>;
  contextSchema?: z.ZodSchema;
  optimizationConfig?: {
    enableA_BTesting?: boolean;
    maxVariations?: number;
    optimizationMetrics?: string[];
  };
  cacheConfig?: {
    enabled: boolean;
    ttl?: number;
    maxSize?: number;
  };
}

export interface MCPPromptResult<T = any> {
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
  businessContext?: Record<string, any>;
  role?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  memory?: Record<string, any>;
}

export abstract class MCPPrompt<TVariables = any, TOutput = any> {
  protected config: MCPPromptConfig;
  protected logger: any;
  protected templateCache: Map<string, string> = new Map();
  protected optimizationData: Map<string, any> = new Map();

  constructor(config: MCPPromptConfig, logger?: any) {
    this.config = config;
    this.logger = logger || console;
  }

  /**
   * Generate prompt with variables and context
   */
  async generate(
    variables: TVariables,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<TOutput>> {
    const startTime = performance.now();
    const requestId = context?.requestId || this.generateRequestId();

    try {
      // Validate variables
      const validatedVariables = await this.validateVariables(variables);

      // Validate context if schema provided
      const validatedContext = context ? await this.validateContext(context) : context;

      // Generate prompt
      const prompt = await this.renderTemplate(validatedVariables, validatedContext);

      // Process prompt if needed
      const result = await this.processPrompt(prompt, validatedContext);

      const executionTime = performance.now() - startTime;
      const templateHash = this.generateTemplateHash(validatedVariables);

      // Log successful generation
      this.logger.info('Prompt generated successfully', {
        promptName: this.config.name,
        requestId,
        executionTime,
        templateHash,
        variablesUsed: Object.keys(validatedVariables),
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        prompt,
        data: result,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          promptName: this.config.name,
          version: this.config.version,
          templateHash,
          variablesUsed: Object.keys(validatedVariables)
        }
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error
      this.logger.error('Prompt generation failed', {
        promptName: this.config.name,
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
          promptName: this.config.name,
          version: this.config.version,
          templateHash: '',
          variablesUsed: []
        }
      };
    }
  }

  /**
   * Validate variables using the configured schema
   */
  protected async validateVariables(variables: TVariables): Promise<TVariables> {
    try {
      const validationSchema = z.object(this.config.variables);
      return validationSchema.parse(variables);
    } catch (error) {
      throw new Error(`Variable validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  /**
   * Validate context using the configured schema
   */
  protected async validateContext(context: MCPPromptContext): Promise<MCPPromptContext> {
    if (!this.config.contextSchema) {
      return context;
    }

    try {
      return this.config.contextSchema.parse(context);
    } catch (error) {
      throw new Error(`Context validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  /**
   * Render template with variables and context
   */
  protected async renderTemplate(
    variables: TVariables,
    context?: MCPPromptContext
  ): Promise<string> {
    const templateKey = this.generateTemplateKey(variables, context);
    
    // Check cache first
    if (this.config.cacheConfig?.enabled && this.templateCache.has(templateKey)) {
      return this.templateCache.get(templateKey)!;
    }

    let renderedTemplate = this.config.template;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      renderedTemplate = renderedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Replace context variables
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          const placeholder = `{{context.${key}}}`;
          renderedTemplate = renderedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
        }
      }
      
      // Also replace businessContext variables
      if (context.businessContext) {
        for (const [key, value] of Object.entries(context.businessContext)) {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            const placeholder = `{{context.${key}}}`;
            renderedTemplate = renderedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
          }
        }
      }
    }

    // Cache the rendered template
    if (this.config.cacheConfig?.enabled) {
      this.templateCache.set(templateKey, renderedTemplate);
      
      // Cleanup cache if it exceeds max size
      if (this.templateCache.size > (this.config.cacheConfig.maxSize || 100)) {
        const firstKey = this.templateCache.keys().next().value;
        this.templateCache.delete(firstKey);
      }
    }

    return renderedTemplate;
  }

  /**
   * Process the rendered prompt (can be overridden by subclasses)
   */
  protected async processPrompt(
    prompt: string,
    context?: MCPPromptContext
  ): Promise<TOutput> {
    // Default implementation returns the prompt as-is
    return prompt as TOutput;
  }

  /**
   * Generate template key for caching
   */
  private generateTemplateKey(variables: TVariables, context?: MCPPromptContext): string {
    const variablesStr = JSON.stringify(variables);
    const contextStr = context ? JSON.stringify(context) : '';
    return `${this.config.name}_${this.hashString(variablesStr + contextStr)}`;
  }

  /**
   * Generate template hash for tracking
   */
  private generateTemplateHash(variables: TVariables): string {
    return this.hashString(JSON.stringify(variables));
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get prompt configuration
   */
  getConfig(): MCPPromptConfig {
    return { ...this.config };
  }

  /**
   * Get prompt name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get prompt description
   */
  getDescription(): string {
    return this.config.description;
  }

  /**
   * Get prompt version
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Check if prompt is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with minimal variables
      const testVariables = this.createTestVariables();
      await this.generate(testVariables);
      return true;
    } catch (error) {
      this.logger.error('Health check failed', {
        promptName: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Create test variables for health check
   */
  protected createTestVariables(): Partial<TVariables> {
    const testVariables: any = {};
    for (const [key, schema] of Object.entries(this.config.variables)) {
      // Create minimal test value based on schema type
      if (schema instanceof z.ZodString) {
        testVariables[key] = 'test';
      } else if (schema instanceof z.ZodNumber) {
        testVariables[key] = 0;
      } else if (schema instanceof z.ZodBoolean) {
        testVariables[key] = false;
      } else if (schema instanceof z.ZodArray) {
        testVariables[key] = [];
      } else if (schema instanceof z.ZodObject) {
        testVariables[key] = {};
      } else {
        testVariables[key] = null;
      }
    }
    return testVariables;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.templateCache.size,
      maxSize: this.config.cacheConfig?.maxSize || 100
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MCP Prompt Factory
 * 
 * Creates and manages MCP prompt instances
 */
export class MCPPromptFactory {
  private static prompts = new Map<string, MCPPrompt>();
  private static logger: any;

  static setLogger(logger: any): void {
    MCPPromptFactory.logger = logger;
  }

  static registerPrompt<T extends MCPPrompt>(prompt: T): void {
    MCPPromptFactory.prompts.set(prompt.getName(), prompt);
  }

  static getPrompt(name: string): MCPPrompt | undefined {
    return MCPPromptFactory.prompts.get(name);
  }

  static getAllPrompts(): MCPPrompt[] {
    return Array.from(MCPPromptFactory.prompts.values());
  }

  static getPromptNames(): string[] {
    return Array.from(MCPPromptFactory.prompts.keys());
  }

  static clearPrompts(): void {
    MCPPromptFactory.prompts.clear();
  }
}
