import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';

/**
 * Database Resource Schema
 */
export const DatabaseResourceSchema = z.object({
  operation: z.enum(['query', 'insert', 'update', 'delete', 'transaction']),
  table: z.string().min(1, 'Table name is required'),
  query: z.string().optional(),
  data: z.record(z.any()).optional(),
  where: z.record(z.any()).optional(),
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['ASC', 'DESC']).default('ASC'),
  transaction: z.array(z.object({
    operation: z.enum(['query', 'insert', 'update', 'delete']),
    table: z.string(),
    query: z.string().optional(),
    data: z.record(z.any()).optional(),
    where: z.record(z.any()).optional()
  })).optional()
});

export type DatabaseResourceConfig = z.infer<typeof DatabaseResourceSchema>;

/**
 * Database Resource Response Schema
 */
export const DatabaseResourceResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.record(z.any())).optional(),
  count: z.number().optional(),
  affectedRows: z.number().optional(),
  insertId: z.number().optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
  query: z.string().optional()
});

export type DatabaseResourceResponse = z.infer<typeof DatabaseResourceResponseSchema>;

/**
 * Database Connection Pool Configuration
 */
interface ConnectionPoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

/**
 * MCP Database Resource
 * Provides database operations with connection pooling and transaction support
 */
export class DatabaseResource extends MCPResource {
  private connectionPool: any[] = [];
  private poolConfig: ConnectionPoolConfig;
  private isInitialized = false;
  private activeConnections = 0;
  private maxConnections: number;
  private readonly schema: z.ZodSchema<DatabaseResourceConfig>;

  constructor(config: {
    connectionString?: string;
    poolConfig?: Partial<ConnectionPoolConfig>;
  } = {}) {
    const mcpConfig: MCPResourceConfig = {
      name: 'database-resource',
      type: 'database',
      version: '1.0.0',
      description: 'Database operations with connection pooling and transaction support',
      connectionConfig: {},
      maxConnections: config.poolConfig?.max || 10
    };

    super(mcpConfig);

    this.poolConfig = {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      ...config.poolConfig
    };

    this.maxConnections = this.poolConfig.max;
    this.schema = DatabaseResourceSchema;
  }

  /**
   * Initialize the database resource and connection pool
   */
  async initialize(): Promise<void> {
    try {
      // Initialize connection pool
      await this.initializeConnectionPool();
      this.isInitialized = true;

      this.logger.info('Database resource initialized', {
        poolSize: this.connectionPool.length,
        maxConnections: this.maxConnections
      });
    } catch (error) {
      this.logger.error('Failed to initialize database resource', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute database operation
   */
  async execute(config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    const startTime = Date.now();

    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Database resource not initialized'
      };
    }

    try {
      // Validate configuration
      const validatedConfig = this.schema.parse(config);

      // Get connection from pool
      const connection = await this.getConnection();

      try {
        let result: DatabaseResourceResponse;

        switch (validatedConfig.operation) {
          case 'query':
            result = await this.executeQuery(connection, validatedConfig);
            break;
          case 'insert':
            result = await this.executeInsert(connection, validatedConfig);
            break;
          case 'update':
            result = await this.executeUpdate(connection, validatedConfig);
            break;
          case 'delete':
            result = await this.executeDelete(connection, validatedConfig);
            break;
          case 'transaction':
            result = await this.executeTransaction(connection, validatedConfig);
            break;
          default:
            throw new Error(`Unsupported operation: ${validatedConfig.operation}`);
        }

        // Add execution time
        result.executionTime = Date.now() - startTime;

        // Log performance metrics
        this.logger.info('Database operation completed', {
          operation: validatedConfig.operation,
          table: validatedConfig.table,
          executionTime: `${result.executionTime}ms`,
          affectedRows: result.affectedRows || 0
        });

        return result;

      } finally {
        // Return connection to pool
        this.returnConnection(connection);
      }

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('Database operation failed', {
        error: error.message,
        operation: config.operation,
        table: config.table,
        executionTime: `${executionTime}ms`
      });

      return {
        success: false,
        error: error.message,
        executionTime
      };
    }
  }

  /**
   * Execute SELECT query
   */
  private async executeQuery(connection: any, config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    const query = this.buildSelectQuery(config);
    const results = await this.runQuery(connection, query);

    return {
      success: true,
      data: results,
      count: results.length,
      query
    };
  }

  /**
   * Execute INSERT operation
   */
  private async executeInsert(connection: any, config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    if (!config.data) {
      throw new Error('Data is required for insert operation');
    }

    const query = this.buildInsertQuery(config);
    const result = await this.runQuery(connection, query);

    return {
      success: true,
      affectedRows: 1,
      insertId: result.insertId,
      query
    };
  }

  /**
   * Execute UPDATE operation
   */
  private async executeUpdate(connection: any, config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    if (!config.data || !config.where) {
      throw new Error('Data and where clause are required for update operation');
    }

    const query = this.buildUpdateQuery(config);
    const result = await this.runQuery(connection, query);

    return {
      success: true,
      affectedRows: result.affectedRows,
      query
    };
  }

  /**
   * Execute DELETE operation
   */
  private async executeDelete(connection: any, config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    if (!config.where) {
      throw new Error('Where clause is required for delete operation');
    }

    const query = this.buildDeleteQuery(config);
    const result = await this.runQuery(connection, query);

    return {
      success: true,
      affectedRows: result.affectedRows,
      query
    };
  }

  /**
   * Execute transaction
   */
  private async executeTransaction(connection: any, config: DatabaseResourceConfig): Promise<DatabaseResourceResponse> {
    if (!config.transaction || config.transaction.length === 0) {
      throw new Error('Transaction operations are required');
    }

    try {
      // Begin transaction
      await this.runQuery(connection, 'BEGIN TRANSACTION');

      const results: any[] = [];

      for (const operation of config.transaction) {
        let result: any;

        switch (operation.operation) {
          case 'query':
            result = await this.executeQuery(connection, operation);
            break;
          case 'insert':
            result = await this.executeInsert(connection, operation);
            break;
          case 'update':
            result = await this.executeUpdate(connection, operation);
            break;
          case 'delete':
            result = await this.executeDelete(connection, operation);
            break;
          default:
            throw new Error(`Unsupported transaction operation: ${operation.operation}`);
        }

        results.push(result);
      }

      // Commit transaction
      await this.runQuery(connection, 'COMMIT');

      return {
        success: true,
        data: results,
        count: results.length
      };

    } catch (error) {
      // Rollback transaction on error
      try {
        await this.runQuery(connection, 'ROLLBACK');
      } catch (rollbackError) {
        this.logger.error('Failed to rollback transaction', { error: rollbackError.message });
      }
      throw error;
    }
  }

  /**
   * Build SELECT query
   */
  private buildSelectQuery(config: DatabaseResourceConfig): string {
    let query = `SELECT * FROM ${config.table}`;

    if (config.where) {
      const whereClause = Object.entries(config.where)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    if (config.orderBy) {
      query += ` ORDER BY ${config.orderBy} ${config.orderDirection}`;
    }

    if (config.limit) {
      query += ` LIMIT ${config.limit}`;
    }

    if (config.offset) {
      query += ` OFFSET ${config.offset}`;
    }

    return query;
  }

  /**
   * Build INSERT query
   */
  private buildInsertQuery(config: DatabaseResourceConfig): string {
    const columns = Object.keys(config.data!);
    const values = Object.values(config.data!);

    const columnsStr = columns.join(', ');
    const valuesStr = values.map(v => `'${v}'`).join(', ');

    return `INSERT INTO ${config.table} (${columnsStr}) VALUES (${valuesStr})`;
  }

  /**
   * Build UPDATE query
   */
  private buildUpdateQuery(config: DatabaseResourceConfig): string {
    const setClause = Object.entries(config.data!)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');

    const whereClause = Object.entries(config.where!)
      .map(([key, value]) => `${key} = ${value}`)
      .join(' AND ');

    return `UPDATE ${config.table} SET ${setClause} WHERE ${whereClause}`;
  }

  /**
   * Build DELETE query
   */
  private buildDeleteQuery(config: DatabaseResourceConfig): string {
    const whereClause = Object.entries(config.where!)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');

    return `DELETE FROM ${config.table} WHERE ${whereClause}`;
  }

  /**
   * Run SQL query
   */
  private async runQuery(connection: any, query: string): Promise<any> {
    // Mock database query execution
    // In a real implementation, this would use a database driver
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock successful query execution
        if (query.includes('SELECT')) {
          resolve([{ id: 1, name: 'Test' }]);
        } else if (query.includes('INSERT')) {
          resolve({ insertId: 1, affectedRows: 1 });
        } else if (query.includes('UPDATE') || query.includes('DELETE')) {
          resolve({ affectedRows: 1 });
        } else if (query.includes('BEGIN') || query.includes('COMMIT') || query.includes('ROLLBACK')) {
          resolve({});
        } else {
          reject(new Error('Invalid query'));
        }
      }, 10); // Simulate database latency
    });
  }

  /**
   * Initialize connection pool
   */
  private async initializeConnectionPool(): Promise<void> {
    // Create initial connections
    for (let i = 0; i < this.poolConfig.min; i++) {
      const connection = await this.createConnection();
      this.connectionPool.push(connection);
    }
  }


  /**
   * Get connection from pool
   */
  private async getConnection(): Promise<any> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop()!;
    }

    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return await this.createConnection();
    }

    // Wait for available connection
    return new Promise((resolve) => {
      const checkForConnection = () => {
        if (this.connectionPool.length > 0) {
          resolve(this.connectionPool.pop()!);
        } else {
          setTimeout(checkForConnection, 100);
        }
      };
      checkForConnection();
    });
  }

  /**
   * Return connection to pool
   */
  private returnConnection(connection: any): void {
    if (connection && connection.connected) {
      this.connectionPool.push(connection);
    } else {
      this.activeConnections--;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const connection = await this.getConnection();
      this.returnConnection(connection);

      return {
        status: 'healthy',
        details: {
          poolSize: this.connectionPool.length,
          activeConnections: this.activeConnections,
          maxConnections: this.maxConnections,
          poolConfig: this.poolConfig
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          poolSize: this.connectionPool.length,
          activeConnections: this.activeConnections
        }
      };
    }
  }

  /**
   * Create a new database connection
   */
  protected async createConnection(): Promise<any> {
    // Mock connection creation
    return {
      id: Math.random().toString(36).substr(2, 9),
      connected: true,
      createdAt: new Date()
    };
  }

  /**
   * Close a database connection
   */
  protected async closeConnection(connection: any): Promise<void> {
    connection.connected = false;
  }

  /**
   * Get connection ID
   */
  protected getConnectionId(connection: any): string {
    return connection.id;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Close all connections in pool
    for (const connection of this.connectionPool) {
      if (connection && connection.connected) {
        // Close connection (mock)
        connection.connected = false;
      }
    }

    this.connectionPool = [];
    this.activeConnections = 0;
    this.isInitialized = false;

    this.logger.info('Database resource cleanup completed');
  }
}
