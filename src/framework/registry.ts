/**
 * MCP Registry System
 *
 * Centralized registry for managing MCP tools, resources, and prompts
 * Provides discovery, dependency injection, and lifecycle management
 */

import { MCPTool, MCPToolFactory } from './mcp-tool';
import { MCPResource, MCPResourceFactory } from './mcp-resource';
import { MCPPrompt, MCPPromptFactory } from './mcp-prompt';

export interface MCPRegistryConfig {
  enableAutoDiscovery?: boolean;
  enableDependencyInjection?: boolean;
  enableHealthMonitoring?: boolean;
  healthCheckInterval?: number;
  logger?: any;
}

export interface MCPRegistryStats {
  tools: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  resources: {
    total: number;
    healthy: number;
    unhealthy: number;
    connections: number;
  };
  prompts: {
    total: number;
    healthy: number;
    unhealthy: number;
    cacheSize: number;
  };
}

export class MCPRegistry {
  private config: MCPRegistryConfig;
  private logger: any;
  private healthCheckInterval?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor(config: MCPRegistryConfig = {}) {
    this.config = {
      enableAutoDiscovery: true,
      enableDependencyInjection: true,
      enableHealthMonitoring: true,
      healthCheckInterval: 30000, // 30 seconds
      ...config
    };
    this.logger = this.config.logger || console;
  }

  /**
   * Initialize the registry
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up factories
      MCPToolFactory.setLogger(this.logger);
      MCPResourceFactory.setLogger(this.logger);
      MCPPromptFactory.setLogger(this.logger);

      // Initialize all resources
      await MCPResourceFactory.initializeAllResources();

      // Start health monitoring if enabled
      if (this.config.enableHealthMonitoring) {
        this.startHealthMonitoring();
      }

      this.isInitialized = true;

      this.logger.info('MCP Registry initialized successfully', {
        timestamp: new Date().toISOString(),
        config: this.config
      });

    } catch (error) {
      this.logger.error('MCP Registry initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Register a tool
   */
  registerTool(tool: MCPTool): void {
    MCPToolFactory.registerTool(tool);
    this.logger.info('Tool registered', {
      toolName: tool.getName(),
      version: tool.getVersion(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Register a resource
   */
  registerResource(resource: MCPResource): void {
    MCPResourceFactory.registerResource(resource);
    this.logger.info('Resource registered', {
      resourceName: resource.getName(),
      type: resource.getType(),
      version: resource.getVersion(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Register a prompt
   */
  registerPrompt(prompt: MCPPrompt): void {
    MCPPromptFactory.registerPrompt(prompt);
    this.logger.info('Prompt registered', {
      promptName: prompt.getName(),
      version: prompt.getVersion(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return MCPToolFactory.getTool(name);
  }

  /**
   * Get a resource by name
   */
  getResource(name: string): MCPResource | undefined {
    return MCPResourceFactory.getResource(name);
  }

  /**
   * Get a prompt by name
   */
  getPrompt(name: string): MCPPrompt | undefined {
    return MCPPromptFactory.getPrompt(name);
  }

  /**
   * Get all tools
   */
  getAllTools(): MCPTool[] {
    return MCPToolFactory.getAllTools();
  }

  /**
   * Get all resources
   */
  getAllResources(): MCPResource[] {
    return MCPResourceFactory.getAllResources();
  }

  /**
   * Get all prompts
   */
  getAllPrompts(): MCPPrompt[] {
    return MCPPromptFactory.getAllPrompts();
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    return MCPToolFactory.getToolNames();
  }

  /**
   * Get resource names
   */
  getResourceNames(): string[] {
    return MCPResourceFactory.getResourceNames();
  }

  /**
   * Get prompt names
   */
  getPromptNames(): string[] {
    return MCPPromptFactory.getPromptNames();
  }

  /**
   * Discover and register components automatically
   */
  async discoverComponents(): Promise<void> {
    if (!this.config.enableAutoDiscovery) {
      return;
    }

    try {
      // This would typically scan for components in a specific directory
      // For now, we'll just log that discovery is enabled
      this.logger.info('Component discovery enabled', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Component discovery failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get registry statistics
   */
  async getStats(): Promise<MCPRegistryStats> {
    const tools = this.getAllTools();
    const resources = this.getAllResources();
    const prompts = this.getAllPrompts();

    // Check health of all components
    const toolHealthChecks = await Promise.allSettled(
      tools.map(tool => tool.healthCheck())
    );
    const resourceHealthChecks = await Promise.allSettled(
      resources.map(resource => resource.healthCheck())
    );
    const promptHealthChecks = await Promise.allSettled(
      prompts.map(prompt => prompt.healthCheck())
    );

    const healthyTools = toolHealthChecks.filter(result =>
      result.status === 'fulfilled' && result.value
    ).length;

    const healthyResources = resourceHealthChecks.filter(result =>
      result.status === 'fulfilled' && result.value
    ).length;

    const healthyPrompts = promptHealthChecks.filter(result =>
      result.status === 'fulfilled' && result.value
    ).length;

    // Calculate total connections for resources
    const totalConnections = resources.reduce((total, resource) => {
      // This would need to be implemented in the resource classes
      return total + 0; // Placeholder
    }, 0);

    // Calculate total cache size for prompts
    const totalCacheSize = prompts.reduce((total, prompt) => {
      const stats = prompt.getCacheStats();
      return total + stats.size;
    }, 0);

    return {
      tools: {
        total: tools.length,
        healthy: healthyTools,
        unhealthy: tools.length - healthyTools
      },
      resources: {
        total: resources.length,
        healthy: healthyResources,
        unhealthy: resources.length - healthyResources,
        connections: totalConnections
      },
      prompts: {
        total: prompts.length,
        healthy: healthyPrompts,
        unhealthy: prompts.length - healthyPrompts,
        cacheSize: totalCacheSize
      }
    };
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const stats = await this.getStats();

        this.logger.info('Health monitoring check', {
          stats,
          timestamp: new Date().toISOString()
        });

        // Log warnings for unhealthy components
        if (stats.tools.unhealthy > 0) {
          this.logger.warn('Unhealthy tools detected', {
            count: stats.tools.unhealthy,
            timestamp: new Date().toISOString()
          });
        }

        if (stats.resources.unhealthy > 0) {
          this.logger.warn('Unhealthy resources detected', {
            count: stats.resources.unhealthy,
            timestamp: new Date().toISOString()
          });
        }

        if (stats.prompts.unhealthy > 0) {
          this.logger.warn('Unhealthy prompts detected', {
            count: stats.prompts.unhealthy,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        this.logger.error('Health monitoring check failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    try {
      // Stop health monitoring
      this.stopHealthMonitoring();

      // Cleanup all resources
      await MCPResourceFactory.cleanupAllResources();

      // Clear all registries
      MCPToolFactory.clearTools();
      MCPResourceFactory.clearResources();
      MCPPromptFactory.clearPrompts();

      this.isInitialized = false;

      this.logger.info('MCP Registry cleanup completed', {
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('MCP Registry cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Check if registry is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get registry configuration
   */
  getConfig(): MCPRegistryConfig {
    return { ...this.config };
  }
}

/**
 * Global registry instance
 */
export const mcpRegistry = new MCPRegistry();
