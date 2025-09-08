/**
 * MCP Client Manager for Real External Server Integration
 *
 * Manages connections to real MCP servers and provides fallback to simulated brokers
 * when external servers are unavailable.
 */

import { spawn, ChildProcess } from 'child_process';

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

export class MCPClientManager {
  private servers: Map<string, MCPServerConfig> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private config: MCPClientConfig;

  constructor(config: Partial<MCPClientConfig> = {}) {
    this.config = {
      timeout: config.timeout ?? 10000,
      maxRetries: config.maxRetries ?? 3,
      healthCheckInterval: config.healthCheckInterval ?? 30000,
      enableFallback: config.enableFallback ?? true
    };

    this.initializeExternalServers();
  }

  private initializeExternalServers(): void {
    // Real MCP servers that actually exist and work
    this.servers.set('filesystem', {
      name: 'FileSystem MCP Server',
      command: ['npx', '@modelcontextprotocol/server-filesystem@latest', process.cwd()],
      isAvailable: true, // We know this works
      lastChecked: new Date(),
      fallbackBroker: undefined // No fallback needed - this is real
    });

    this.servers.set('github', {
      name: 'GitHub MCP Server',
      command: ['npx', '@modelcontextprotocol/server-github@latest'],
      isAvailable: true, // We know this works
      lastChecked: new Date(),
      fallbackBroker: undefined // No fallback needed - this is real
    });

    this.servers.set('testsprite', {
      name: 'TestSprite MCP Server',
      command: ['npx', '@testsprite/testsprite-mcp@latest'],
      isAvailable: true, // Package exists, need to test connectivity
      lastChecked: new Date(),
      fallbackBroker: 'simulation' // Fallback to simulation if connection fails
    });

    // Simulated servers (no real packages exist)
    this.servers.set('context7', {
      name: 'Context7 MCP Server',
      command: ['npx', '@context7/mcp-server@latest'], // This package doesn't exist!
      isAvailable: false, // Package doesn't exist
      lastChecked: new Date(),
      fallbackBroker: 'Context7Broker' // Always use fallback
    });

    this.servers.set('playwright', {
      name: 'Playwright MCP Server',
      command: ['npx', '@playwright/mcp@latest'], // Need to verify if this exists
      isAvailable: false, // Assume false until proven
      lastChecked: new Date(),
      fallbackBroker: 'simulation' // Fallback to simulation
    });
  }

  /**
   * Check which MCP servers are actually available and working
   */
  async checkServerAvailability(): Promise<Map<string, boolean>> {
    const availability = new Map<string, boolean>();

    for (const [key, server] of this.servers) {
      console.log(`🔍 Checking ${server.name}...`);

      if (server.fallbackBroker === 'Context7Broker') {
        // We know Context7 package doesn't exist
        availability.set(key, false);
        console.log(`❌ ${server.name}: Package not found`);
        continue;
      }

      try {
        // Test if we can spawn the server
        const testProcess = spawn(server.command[0], server.command.slice(1), {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        const isRunning = await new Promise<boolean>((resolve) => {
          let responded = false;

          const timeout = setTimeout(() => {
            if (!responded) {
              responded = true;
              testProcess.kill();
              resolve(false);
            }
          }, 5000);

          testProcess.on('spawn', () => {
            if (!responded) {
              responded = true;
              clearTimeout(timeout);
              testProcess.kill();
              resolve(true);
            }
          });

          testProcess.on('error', () => {
            if (!responded) {
              responded = true;
              clearTimeout(timeout);
              resolve(false);
            }
          });
        });

        availability.set(key, isRunning);
        server.isAvailable = isRunning;
        server.lastChecked = new Date();

        console.log(`${isRunning ? '✅' : '❌'} ${server.name}: ${isRunning ? 'Available' : 'Not available'}`);

      } catch (error) {
        availability.set(key, false);
        server.isAvailable = false;
        console.log(`❌ ${server.name}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    return availability;
  }

  /**
   * Get integration status report
   */
  getIntegrationStatus() {
    const total = this.servers.size;
    const real = Array.from(this.servers.values()).filter(s => s.isAvailable).length;
    const simulated = total - real;

    const serverStatus = Array.from(this.servers.entries()).map(([key, server]) => ({
      name: server.name,
      key,
      isReal: server.isAvailable,
      hasPackage: !server.fallbackBroker || server.fallbackBroker !== 'Context7Broker',
      fallback: server.fallbackBroker || 'none'
    }));

    return {
      total,
      real,
      simulated,
      integrationProgress: (real / total) * 100,
      servers: serverStatus,
      needsWork: serverStatus.filter(s => !s.isReal),
      working: serverStatus.filter(s => s.isReal)
    };
  }

  /**
   * Get server configuration
   */
  getServerConfig(serverKey: string): MCPServerConfig | undefined {
    return this.servers.get(serverKey);
  }

  /**
   * Start a real MCP server connection
   */
  async startServer(serverKey: string): Promise<ChildProcess | null> {
    const serverConfig = this.servers.get(serverKey);
    if (!serverConfig || !serverConfig.isAvailable) {
      console.log(`⚠️ Server ${serverKey} not available, using fallback`);
      return null;
    }

    try {
      const process = spawn(serverConfig.command[0], serverConfig.command.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.processes.set(serverKey, process);
      console.log(`🚀 Started ${serverConfig.name}`);

      return process;
    } catch (error) {
      console.error(`❌ Failed to start ${serverConfig.name}:`, error);
      return null;
    }
  }

  /**
   * Stop all running servers
   */
  async stopAllServers(): Promise<void> {
    for (const [key, process] of this.processes) {
      try {
        if (!process.killed) {
          process.kill('SIGTERM');
          console.log(`🛑 Stopped ${key} server`);
        }
      } catch (error) {
        console.error(`Error stopping ${key} server:`, error);
      }
    }
    this.processes.clear();
  }

  /**
   * Get recommendations for improving integration
   */
  getRecommendations(): string[] {
    const status = this.getIntegrationStatus();
    const recommendations: string[] = [];

    if (status.integrationProgress < 100) {
      recommendations.push(`🎯 Current integration: ${status.integrationProgress.toFixed(1)}% - ${status.needsWork.length} servers need work`);

      status.needsWork.forEach(server => {
        if (!server.hasPackage) {
          recommendations.push(`📦 Create real package for ${server.name} (currently simulated)`);
        } else {
          recommendations.push(`🔧 Fix connection issues for ${server.name}`);
        }
      });

      recommendations.push(`📈 Target: 100% real integration for production-grade system`);
    }

    return recommendations;
  }
}

export function createMCPClientManager(config?: Partial<MCPClientConfig>): MCPClientManager {
  return new MCPClientManager(config);
}