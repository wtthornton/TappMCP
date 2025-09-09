/**
 * Real MCP Client Implementation
 *
 * This implements actual MCP protocol connections instead of relying on
 * simulated brokers. Connects to real external MCP servers via stdio.
 */
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
export interface MCPMessage {
    jsonrpc: string;
    id?: number | string;
    method?: string;
    params?: any;
    result?: any;
    error?: any;
}
export interface RealMCPConnection {
    serverName: string;
    process: ChildProcess;
    isConnected: boolean;
    lastError?: string;
}
export declare class RealMCPClient extends EventEmitter {
    private connections;
    private messageId;
    private pendingRequests;
    constructor();
    /**
     * Connect to a real MCP server using stdio transport
     */
    connectToServer(serverName: string, command: string[], args?: string[]): Promise<boolean>;
    /**
     * Send MCP initialize request
     */
    private initializeServer;
    /**
     * Send a message to MCP server and wait for response
     */
    private sendMessage;
    /**
     * Handle incoming message from MCP server
     */
    private handleMessage;
    /**
     * List available tools from a server
     */
    listTools(serverName: string): Promise<any[]>;
    /**
     * Call a tool on a server
     */
    callTool(serverName: string, toolName: string, args?: any): Promise<any>;
    /**
     * Test real connectivity to known working MCP servers
     */
    testRealConnectivity(): Promise<{
        [serverName: string]: boolean;
    }>;
    /**
     * Get connection status
     */
    getConnectionStatus(): {
        [serverName: string]: {
            connected: boolean;
            error?: string;
        };
    };
    /**
     * Disconnect from all servers
     */
    disconnectAll(): Promise<void>;
}
export declare function createRealMCPClient(): RealMCPClient;
//# sourceMappingURL=RealMCPClient.d.ts.map