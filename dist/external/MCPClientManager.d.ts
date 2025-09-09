/**
 * MCP Client Manager for Real External Server Integration
 *
 * Manages connections to real MCP servers and provides fallback to simulated brokers
 * when external servers are unavailable.
 */
import { ChildProcess } from 'child_process';
export interface MCPServerConfig {
    name: string;
    command: string[];
    isAvailable: boolean;
    lastChecked: Date;
    fallbackBroker?: string;
}
export interface MCPClientConfig {
    timeout: number;
    maxRetries: number;
    healthCheckInterval: number;
    enableFallback: boolean;
}
export declare class MCPClientManager {
    private servers;
    private processes;
    constructor(_config?: Partial<MCPClientConfig>);
    private initializeExternalServers;
    /**
     * Check which MCP servers are actually available and working
     */
    checkServerAvailability(): Promise<Map<string, boolean>>;
    /**
     * Get integration status report
     */
    getIntegrationStatus(): {
        total: number;
        real: number;
        simulated: number;
        integrationProgress: number;
        servers: {
            name: string;
            key: string;
            isReal: boolean;
            hasPackage: boolean;
            fallback: string;
        }[];
        needsWork: {
            name: string;
            key: string;
            isReal: boolean;
            hasPackage: boolean;
            fallback: string;
        }[];
        working: {
            name: string;
            key: string;
            isReal: boolean;
            hasPackage: boolean;
            fallback: string;
        }[];
    };
    /**
     * Get server configuration
     */
    getServerConfig(serverKey: string): MCPServerConfig | undefined;
    /**
     * Start a real MCP server connection
     */
    startServer(serverKey: string): Promise<ChildProcess | null>;
    /**
     * Stop all running servers
     */
    stopAllServers(): Promise<void>;
    /**
     * Get recommendations for improving integration
     */
    getRecommendations(): string[];
}
export declare function createMCPClientManager(config?: Partial<MCPClientConfig>): MCPClientManager;
//# sourceMappingURL=MCPClientManager.d.ts.map