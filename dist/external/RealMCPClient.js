/**
 * Real MCP Client Implementation
 *
 * This implements actual MCP protocol connections instead of relying on
 * simulated brokers. Connects to real external MCP servers via stdio.
 */
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
export class RealMCPClient extends EventEmitter {
    connections = new Map();
    messageId = 1;
    pendingRequests = new Map();
    constructor() {
        super();
    }
    /**
     * Connect to a real MCP server using stdio transport
     */
    async connectToServer(serverName, command, args = []) {
        try {
            console.log(`🔌 Connecting to ${serverName} MCP server...`);
            console.log(`📋 Command: ${command.join(' ')} ${args.join(' ')}`);
            // Fix npx path for Windows
            const execCommand = command[0] === 'npx' ? 'npx.cmd' : command[0];
            const process = spawn(execCommand, [...command.slice(1), ...args], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true, // Enable shell for Windows compatibility
            });
            const connection = {
                serverName,
                process,
                isConnected: false,
                // lastError: undefined
            };
            // Set up message handling
            let buffer = '';
            process.stdout?.on('data', data => {
                buffer += data.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        this.handleMessage(serverName, line.trim());
                    }
                }
            });
            process.stderr?.on('data', data => {
                const error = data.toString();
                console.error(`❌ ${serverName} stderr:`, error);
                connection.lastError = error;
            });
            process.on('exit', code => {
                console.log(`🔌 ${serverName} process exited with code ${code}`);
                connection.isConnected = false;
            });
            process.on('error', error => {
                console.error(`❌ ${serverName} process error:`, error);
                connection.lastError = error.message;
                connection.isConnected = false;
            });
            this.connections.set(serverName, connection);
            // Try to initialize the connection
            const initialized = await this.initializeServer(serverName);
            connection.isConnected = initialized;
            if (initialized) {
                console.log(`✅ ${serverName} MCP server connected successfully`);
            }
            else {
                console.log(`❌ ${serverName} MCP server failed to initialize`);
            }
            return initialized;
        }
        catch (error) {
            console.error(`❌ Failed to connect to ${serverName}:`, error);
            return false;
        }
    }
    /**
     * Send MCP initialize request
     */
    async initializeServer(serverName) {
        const initMessage = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                },
                clientInfo: {
                    name: 'TappMCP-Client',
                    version: '1.0.0',
                },
            },
        };
        try {
            const response = await this.sendMessage(serverName, initMessage, 5000);
            return !!response && !response.error;
        }
        catch (error) {
            console.error(`❌ ${serverName} initialization failed:`, error);
            return false;
        }
    }
    /**
     * Send a message to MCP server and wait for response
     */
    async sendMessage(serverName, message, timeout = 10000) {
        const connection = this.connections.get(serverName);
        if (!connection?.process.stdin) {
            throw new Error(`No connection to ${serverName}`);
        }
        return new Promise((resolve, reject) => {
            const messageId = message.id;
            // Set up timeout
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(messageId);
                reject(new Error(`Timeout waiting for response from ${serverName}`));
            }, timeout);
            // Store pending request
            this.pendingRequests.set(messageId, {
                resolve: (response) => {
                    clearTimeout(timeoutHandle);
                    resolve(response);
                },
                reject: (error) => {
                    clearTimeout(timeoutHandle);
                    reject(error);
                },
            });
            // Send message
            const messageStr = `${JSON.stringify(message)}\n`;
            connection.process.stdin.write(messageStr);
        });
    }
    /**
     * Handle incoming message from MCP server
     */
    handleMessage(serverName, messageStr) {
        try {
            const message = JSON.parse(messageStr);
            if (message.id && this.pendingRequests.has(message.id)) {
                // This is a response to a pending request
                const pending = this.pendingRequests.get(message.id);
                this.pendingRequests.delete(message.id);
                pending.resolve(message);
            }
            else {
                // This is a notification or unsolicited message
                console.log(`📨 ${serverName} notification:`, message);
                this.emit('message', serverName, message);
            }
        }
        catch (_error) {
            console.error(`❌ Failed to parse message from ${serverName}:`, messageStr);
        }
    }
    /**
     * List available tools from a server
     */
    async listTools(serverName) {
        const message = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/list',
        };
        try {
            const response = await this.sendMessage(serverName, message);
            return response?.result?.tools || [];
        }
        catch (error) {
            console.error(`❌ Failed to list tools from ${serverName}:`, error);
            return [];
        }
    }
    /**
     * Call a tool on a server
     */
    async callTool(serverName, toolName, args = {}) {
        const message = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args,
            },
        };
        try {
            const response = await this.sendMessage(serverName, message);
            if (response?.error) {
                throw new Error(`Tool call failed: ${response.error.message}`);
            }
            return response?.result;
        }
        catch (error) {
            console.error(`❌ Failed to call tool ${toolName} on ${serverName}:`, error);
            throw error;
        }
    }
    /**
     * Test real connectivity to known working MCP servers
     */
    async testRealConnectivity() {
        console.log('\n🧪 TESTING REAL MCP SERVER CONNECTIVITY...\n');
        const results = {};
        // Test FileSystem MCP Server (we know this package exists)
        console.log('🔍 Testing FileSystem MCP Server...');
        const fsConnected = await this.connectToServer('filesystem', ['npx', '@modelcontextprotocol/server-filesystem@latest'], [process.cwd()]);
        results['filesystem'] = fsConnected;
        if (fsConnected) {
            try {
                const tools = await this.listTools('filesystem');
                console.log(`✅ FileSystem tools available: ${tools.map((t) => t.name).join(', ')}`);
                // Try to call a simple tool
                const result = await this.callTool('filesystem', 'list_directory', { path: '.' });
                console.log(`✅ FileSystem tool call successful: ${result?.content?.length || 0} items`);
            }
            catch (error) {
                console.log(`⚠️ FileSystem tool call failed: ${error}`);
            }
        }
        // Test GitHub MCP Server
        console.log('\n🔍 Testing GitHub MCP Server...');
        const githubConnected = await this.connectToServer('github', [
            'npx',
            '@modelcontextprotocol/server-github@latest',
        ]);
        results['github'] = githubConnected;
        if (githubConnected) {
            try {
                const tools = await this.listTools('github');
                console.log(`✅ GitHub tools available: ${tools.map((t) => t.name).join(', ')}`);
            }
            catch (error) {
                console.log(`⚠️ GitHub tool listing failed: ${error}`);
            }
        }
        // Test TestSprite MCP Server
        console.log('\n🔍 Testing TestSprite MCP Server...');
        const testspriteConnected = await this.connectToServer('testsprite', [
            'npx',
            '@testsprite/testsprite-mcp@latest',
        ]);
        results['testsprite'] = testspriteConnected;
        console.log('\n📊 REAL CONNECTIVITY TEST RESULTS:');
        console.log('=====================================');
        let realConnections = 0;
        for (const [name, connected] of Object.entries(results)) {
            console.log(`${connected ? '✅' : '❌'} ${name}: ${connected ? 'REAL CONNECTION' : 'FAILED'}`);
            if (connected)
                realConnections++;
        }
        const percentage = (realConnections / Object.keys(results).length) * 100;
        console.log(`\n📈 Real Integration Achievement: ${realConnections}/${Object.keys(results).length} (${percentage.toFixed(1)}%)`);
        if (percentage > 0) {
            console.log('🎉 SUCCESS: Achieved real MCP server connections!');
        }
        else {
            console.log('🚨 FAILURE: No real MCP connections achieved');
        }
        return results;
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        const status = {};
        for (const [name, connection] of this.connections) {
            status[name] = {
                connected: connection.isConnected,
                ...(connection.lastError && { error: connection.lastError }),
            };
        }
        return status;
    }
    /**
     * Disconnect from all servers
     */
    async disconnectAll() {
        console.log('🔌 Disconnecting from all MCP servers...');
        for (const [name, connection] of this.connections) {
            try {
                if (!connection.process.killed) {
                    connection.process.kill('SIGTERM');
                    console.log(`🛑 Disconnected from ${name}`);
                }
            }
            catch (error) {
                console.error(`Error disconnecting from ${name}:`, error);
            }
        }
        this.connections.clear();
        this.pendingRequests.clear();
    }
}
export function createRealMCPClient() {
    return new RealMCPClient();
}
//# sourceMappingURL=RealMCPClient.js.map