import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface Context7MCPConfig {
  apiKey: string;
  mcpUrl: string;
  timeout: number;
}

export interface Context7LibraryDoc {
  id: string;
  title: string;
  content: string;
  url?: string;
  version: string;
  lastUpdated: Date;
  relevanceScore: number;
}

export class Context7MCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private config: Context7MCPConfig;
  private isConnected: boolean = false;

  constructor(config: Context7MCPConfig) {
    this.config = config;

    // Create MCP client
    this.client = new Client({
      name: 'TappMCP-Context7Client',
      version: '1.0.0',
    });

    // Create stdio transport for Context7 MCP server
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
      env: {
        ...process.env,
        CONTEXT7_API_KEY: config.apiKey,
      },
    });
  }

  /**
   * Connect to Context7 MCP server
   */
  async connect(): Promise<void> {
    try {
      await this.transport.start();
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log('✅ Connected to Context7 MCP server');
    } catch (error) {
      console.error('❌ Failed to connect to Context7 MCP server:', error);
      throw new Error(
        `Context7 MCP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect from Context7 MCP server
   */
  async disconnect(): Promise<void> {
    try {
      await this.transport.close();
      this.isConnected = false;
      console.log('✅ Disconnected from Context7 MCP server');
    } catch (error) {
      console.error('❌ Error disconnecting from Context7 MCP server:', error);
    }
  }

  /**
   * Check if client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Resolve library ID using Context7 MCP tool
   */
  async resolveLibraryId(libraryName: string): Promise<string | null> {
    if (!this.isConnected) {
      throw new Error('Context7 MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'resolve-library-id',
        arguments: {
          libraryName,
        },
      });

      if (result.isError) {
        console.warn(`Failed to resolve library ID for ${libraryName}:`, result.toolResult);
        return null;
      }

      // Extract library ID from result
      const content = (result as any).content?.[0];
      if (content?.type === 'text') {
        try {
          const data = JSON.parse(content.text);
          return data.libraryId || null;
        } catch {
          // If not JSON, try to extract from text
          return content.text || null;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error resolving library ID for ${libraryName}:`, error);
      return null;
    }
  }

  /**
   * Get library documentation using Context7 MCP tool
   */
  async getLibraryDocs(
    libraryId: string,
    topic: string,
    version: string = 'latest'
  ): Promise<Context7LibraryDoc[]> {
    if (!this.isConnected) {
      throw new Error('Context7 MCP client not connected');
    }

    try {
      const result = await this.client.callTool({
        name: 'get-library-docs',
        arguments: {
          libraryId,
          topic,
          version,
          tokenLimit: 4000,
        },
      });

      if (result.isError) {
        console.warn(`Failed to get library docs for ${libraryId}:`, result.toolResult);
        return [];
      }

      // Extract documentation from result
      const content = (result as any).content?.[0];
      if (content?.type === 'text') {
        try {
          const data = JSON.parse(content.text);
          return this.transformDocs(data.docs || []);
        } catch {
          // If not JSON, create a single doc from text
          return [
            {
              id: `doc-${libraryId}-${Date.now()}`,
              title: `${topic} Documentation`,
              content: content.text,
              version,
              lastUpdated: new Date(),
              relevanceScore: 0.8,
            },
          ];
        }
      }

      return [];
    } catch (error) {
      console.error(`Error getting library docs for ${libraryId}:`, error);
      return [];
    }
  }

  /**
   * Transform raw docs to Context7LibraryDoc format
   */
  private transformDocs(docs: any[]): Context7LibraryDoc[] {
    return docs.map((doc: any, index: number) => ({
      id: doc.id || `doc-${Date.now()}-${index}`,
      title: doc.title || 'Documentation',
      content: doc.content || doc.text || doc.description || '',
      url: doc.url || doc.link,
      version: doc.version || 'latest',
      lastUpdated: doc.lastUpdated ? new Date(doc.lastUpdated) : new Date(),
      relevanceScore: doc.relevanceScore || doc.score || 0.8,
    }));
  }

  /**
   * Health check for MCP connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      // Try to ping the server
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Context7 MCP health check failed:', error);
      return false;
    }
  }

  /**
   * List available tools from Context7 MCP server
   */
  async listTools(): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Context7 MCP client not connected');
    }

    try {
      const result = await this.client.listTools();
      return result.tools || [];
    } catch (error) {
      console.error('Error listing Context7 MCP tools:', error);
      return [];
    }
  }
}
