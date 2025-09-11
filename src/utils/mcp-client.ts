#!/usr/bin/env node

import { spawn } from 'child_process';

/**
 * MCP Client for stdio communication
 *
 * This client handles communication with MCP servers via stdio (stdin/stdout)
 * using the JSON-RPC protocol as specified by the MCP standard.
 */
export class MCPClient {
  private process: any = null;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
  private isConnected = false;

  /**
   * Connect to the MCP server via stdio
   */
  async connect(serverPath: string = 'dist/server.js'): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Connect to the MCP server via stdio
      this.process = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
      });

      this.process.stdout.on('data', (data: Buffer) => {
        try {
          const lines = data
            .toString()
            .split('\n')
            .filter(line => line.trim());
          for (const line of lines) {
            const message = JSON.parse(line);
            this.handleMessage(message);
          }
        } catch (error) {
          console.error('Error parsing MCP response:', error);
        }
      });

      this.process.stderr.on('data', (data: Buffer) => {
        console.error('MCP stderr:', data.toString());
      });

      this.process.on('close', (code: number) => {
        console.log(`MCP process exited with code ${code}`);
        this.isConnected = false;
      });

      this.process.on('error', (error: Error) => {
        console.error('MCP process error:', error);
        this.isConnected = false;
        reject(error);
      });

      // Initialize MCP connection
      setTimeout(() => {
        this.sendMessage({
          jsonrpc: '2.0',
          id: this.messageId++,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            clientInfo: {
              name: 'test-client',
              version: '1.0.0',
            },
          },
        })
          .then(() => {
            this.isConnected = true;
            resolve();
          })
          .catch(reject);
      }, 1000);
    });
  }

  /**
   * Handle incoming messages from the MCP server
   */
  private handleMessage(message: any) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'MCP Error'));
      } else {
        resolve(message.result);
      }
    }
  }

  /**
   * Send a message to the MCP server
   */
  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      message.id = id;

      this.pendingRequests.set(id, { resolve, reject });

      this.process.stdin.write(`${JSON.stringify(message)}\n`);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Call an MCP tool
   */
  async callTool(toolName: string, arguments_: any): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    console.log(`🔧 Calling MCP Tool: ${toolName}`);
    console.log(`📝 Arguments:`, JSON.stringify(arguments_, null, 2));

    const result = await this.sendMessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: arguments_,
      },
    });

    console.log(`✅ MCP Response:`, JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    const result = await this.sendMessage({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
    });

    return result;
  }

  /**
   * Check if the client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isConnected = false;
    }
  }
}
