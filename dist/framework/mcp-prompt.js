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
import { performance } from 'perf_hooks';
import Handlebars from 'handlebars';
export class MCPPrompt {
    config;
    logger;
    templateCache = new Map();
    constructor(config, logger) {
        this.config = config;
        this.logger = logger || console;
    }
    /**
     * Generate prompt with variables and context
     */
    async generate(variables, context) {
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
                variablesUsed: validatedVariables && typeof validatedVariables === 'object'
                    ? Object.keys(validatedVariables)
                    : [],
                timestamp: new Date().toISOString(),
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
                    variablesUsed: validatedVariables && typeof validatedVariables === 'object'
                        ? Object.keys(validatedVariables)
                        : [],
                },
            };
        }
        catch (error) {
            const executionTime = performance.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            // Log error
            this.logger.error('Prompt generation failed', {
                promptName: this.config.name,
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
                    promptName: this.config.name,
                    version: this.config.version,
                    templateHash: '',
                    variablesUsed: [],
                },
            };
        }
    }
    /**
     * Validate variables using the configured schema
     */
    async validateVariables(variables) {
        try {
            const validationSchema = z.object(this.config.variables);
            return validationSchema.parse(variables);
        }
        catch (error) {
            throw new Error(`Variable validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
        }
    }
    /**
     * Validate context using the configured schema
     */
    async validateContext(context) {
        if (!this.config.contextSchema) {
            return context;
        }
        try {
            return this.config.contextSchema.parse(context);
        }
        catch (error) {
            throw new Error(`Context validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
        }
    }
    /**
     * Render template with variables and context using Handlebars
     */
    async renderTemplate(variables, context) {
        const templateKey = this.generateTemplateKey(variables, context);
        // Check cache first
        if (this.config.cacheConfig?.enabled && this.templateCache.has(templateKey)) {
            return this.templateCache.get(templateKey);
        }
        try {
            // Compile Handlebars template
            const template = Handlebars.compile(this.config.template);
            // Prepare template data
            const templateData = {
                ...variables,
                context: context || {},
            };
            // Render template
            const renderedTemplate = template(templateData);
            // Cache the rendered template
            if (this.config.cacheConfig?.enabled) {
                this.templateCache.set(templateKey, renderedTemplate);
                // Cleanup cache if it exceeds max size
                if (this.templateCache.size > (this.config.cacheConfig.maxSize || 100)) {
                    const firstKey = this.templateCache.keys().next().value;
                    if (firstKey !== undefined) {
                        this.templateCache.delete(firstKey);
                    }
                }
            }
            return renderedTemplate;
        }
        catch (error) {
            this.logger.error('Template rendering failed', {
                promptName: this.config.name,
                error: error instanceof Error ? error.message : 'Unknown error',
                template: `${this.config.template.substring(0, 100)}...`,
            });
            throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Process the rendered prompt (can be overridden by subclasses)
     */
    async processPrompt(prompt, _context) {
        // Default implementation returns the prompt as-is
        return prompt;
    }
    /**
     * Generate template key for caching
     */
    generateTemplateKey(variables, context) {
        const variablesStr = JSON.stringify(variables);
        const contextStr = context ? JSON.stringify(context) : '';
        return `${this.config.name}_${this.hashString(variablesStr + contextStr)}`;
    }
    /**
     * Generate template hash for tracking
     */
    generateTemplateHash(variables) {
        return this.hashString(JSON.stringify(variables));
    }
    /**
     * Simple hash function for strings
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Get prompt configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get prompt name
     */
    getName() {
        return this.config.name;
    }
    /**
     * Get prompt description
     */
    getDescription() {
        return this.config.description;
    }
    /**
     * Get prompt version
     */
    getVersion() {
        return this.config.version;
    }
    /**
     * Check if prompt is healthy
     */
    async healthCheck() {
        try {
            // Test with minimal variables
            const testVariables = this.createTestVariables();
            await this.generate(testVariables);
            return true;
        }
        catch (error) {
            this.logger.error('Health check failed', {
                promptName: this.config.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return false;
        }
    }
    /**
     * Create test variables for health check
     */
    createTestVariables() {
        const testVariables = {};
        for (const [key, schema] of Object.entries(this.config.variables)) {
            // Create minimal test value based on schema type
            if (schema instanceof z.ZodString) {
                testVariables[key] = 'test';
            }
            else if (schema instanceof z.ZodNumber) {
                testVariables[key] = 0;
            }
            else if (schema instanceof z.ZodBoolean) {
                testVariables[key] = false;
            }
            else if (schema instanceof z.ZodArray) {
                testVariables[key] = [];
            }
            else if (schema instanceof z.ZodObject) {
                testVariables[key] = {};
            }
            else {
                testVariables[key] = null;
            }
        }
        return testVariables;
    }
    /**
     * Clear template cache
     */
    clearCache() {
        this.templateCache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.templateCache.size,
            maxSize: this.config.cacheConfig?.maxSize || 100,
        };
    }
    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * MCP Prompt Factory
 *
 * Creates and manages MCP prompt instances
 */
export class MCPPromptFactory {
    static prompts = new Map();
    static setLogger(_logger) {
        // Logger functionality not yet implemented
    }
    static registerPrompt(prompt) {
        MCPPromptFactory.prompts.set(prompt.getName(), prompt);
    }
    static getPrompt(name) {
        return MCPPromptFactory.prompts.get(name);
    }
    static getAllPrompts() {
        return Array.from(MCPPromptFactory.prompts.values());
    }
    static getPromptNames() {
        return Array.from(MCPPromptFactory.prompts.keys());
    }
    static clearPrompts() {
        MCPPromptFactory.prompts.clear();
    }
}
//# sourceMappingURL=mcp-prompt.js.map