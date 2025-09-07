/**
 * MCP Registry System
 *
 * Centralized registry for managing MCP tools, resources, and prompts
 * Provides discovery, dependency injection, and lifecycle management
 */
import { MCPTool } from './mcp-tool';
import { MCPResource } from './mcp-resource';
import { MCPPrompt } from './mcp-prompt';
export interface MCPRegistryConfig {
    enableAutoDiscovery?: boolean;
    enableDependencyInjection?: boolean;
    enableHealthMonitoring?: boolean;
    healthCheckInterval?: number;
    logger?: Console;
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
export declare class MCPRegistry {
    private config;
    private logger;
    private healthCheckInterval?;
    private isInitialized;
    constructor(config?: MCPRegistryConfig);
    /**
     * Initialize the registry
     */
    initialize(): Promise<void>;
    /**
     * Register a tool
     */
    registerTool(tool: MCPTool): void;
    /**
     * Register a resource
     */
    registerResource(resource: MCPResource): void;
    /**
     * Register a prompt
     */
    registerPrompt(prompt: MCPPrompt): void;
    /**
     * Get a tool by name
     */
    getTool(name: string): MCPTool | undefined;
    /**
     * Get a resource by name
     */
    getResource(name: string): MCPResource | undefined;
    /**
     * Get a prompt by name
     */
    getPrompt(name: string): MCPPrompt | undefined;
    /**
     * Get all tools
     */
    getAllTools(): MCPTool[];
    /**
     * Get all resources
     */
    getAllResources(): MCPResource[];
    /**
     * Get all prompts
     */
    getAllPrompts(): MCPPrompt[];
    /**
     * Get tool names
     */
    getToolNames(): string[];
    /**
     * Get resource names
     */
    getResourceNames(): string[];
    /**
     * Get prompt names
     */
    getPromptNames(): string[];
    /**
     * Discover and register components automatically
     */
    discoverComponents(): Promise<void>;
    /**
     * Get registry statistics
     */
    getStats(): Promise<MCPRegistryStats>;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Stop health monitoring
     */
    stopHealthMonitoring(): void;
    /**
     * Cleanup and shutdown
     */
    cleanup(): Promise<void>;
    /**
     * Check if registry is initialized
     */
    isReady(): boolean;
    /**
     * Get registry configuration
     */
    getConfig(): MCPRegistryConfig;
}
/**
 * Global registry instance
 */
export declare const mcpRegistry: MCPRegistry;
//# sourceMappingURL=registry.d.ts.map