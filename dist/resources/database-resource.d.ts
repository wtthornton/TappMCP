import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';
/**
 * Database Resource Schema
 */
export declare const DatabaseResourceSchema: z.ZodObject<{
    operation: z.ZodEnum<["query", "insert", "update", "delete", "transaction"]>;
    table: z.ZodString;
    query: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    where: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    orderBy: z.ZodOptional<z.ZodString>;
    orderDirection: z.ZodDefault<z.ZodEnum<["ASC", "DESC"]>>;
    transaction: z.ZodOptional<z.ZodArray<z.ZodObject<{
        operation: z.ZodEnum<["query", "insert", "update", "delete"]>;
        table: z.ZodString;
        query: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        where: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        operation: "query" | "delete" | "insert" | "update";
        table: string;
        data?: Record<string, any> | undefined;
        query?: string | undefined;
        where?: Record<string, any> | undefined;
    }, {
        operation: "query" | "delete" | "insert" | "update";
        table: string;
        data?: Record<string, any> | undefined;
        query?: string | undefined;
        where?: Record<string, any> | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    operation: "transaction" | "query" | "delete" | "insert" | "update";
    table: string;
    orderDirection: "ASC" | "DESC";
    data?: Record<string, any> | undefined;
    limit?: number | undefined;
    transaction?: {
        operation: "query" | "delete" | "insert" | "update";
        table: string;
        data?: Record<string, any> | undefined;
        query?: string | undefined;
        where?: Record<string, any> | undefined;
    }[] | undefined;
    query?: string | undefined;
    where?: Record<string, any> | undefined;
    offset?: number | undefined;
    orderBy?: string | undefined;
}, {
    operation: "transaction" | "query" | "delete" | "insert" | "update";
    table: string;
    data?: Record<string, any> | undefined;
    limit?: number | undefined;
    transaction?: {
        operation: "query" | "delete" | "insert" | "update";
        table: string;
        data?: Record<string, any> | undefined;
        query?: string | undefined;
        where?: Record<string, any> | undefined;
    }[] | undefined;
    query?: string | undefined;
    where?: Record<string, any> | undefined;
    offset?: number | undefined;
    orderBy?: string | undefined;
    orderDirection?: "ASC" | "DESC" | undefined;
}>;
export type DatabaseResourceConfig = z.infer<typeof DatabaseResourceSchema>;
/**
 * Database Resource Response Schema
 */
export declare const DatabaseResourceResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
    count: z.ZodOptional<z.ZodNumber>;
    affectedRows: z.ZodOptional<z.ZodNumber>;
    insertId: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
    executionTime: z.ZodOptional<z.ZodNumber>;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    data?: Record<string, any>[] | undefined;
    count?: number | undefined;
    executionTime?: number | undefined;
    query?: string | undefined;
    affectedRows?: number | undefined;
    insertId?: number | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    data?: Record<string, any>[] | undefined;
    count?: number | undefined;
    executionTime?: number | undefined;
    query?: string | undefined;
    affectedRows?: number | undefined;
    insertId?: number | undefined;
}>;
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
export declare class DatabaseResource extends MCPResource {
    protected connectionPool: any[];
    private poolConfig;
    protected isInitialized: boolean;
    private activeConnections;
    private maxConnections;
    private readonly schema;
    constructor(config?: {
        connectionString?: string;
        poolConfig?: Partial<ConnectionPoolConfig>;
    });
    /**
     * Initialize the database resource and connection pool
     */
    initialize(): Promise<void>;
    /**
     * Internal initialization (required by base class)
     */
    protected initializeInternal(): Promise<void>;
    /**
     * Execute database operation
     */
    execute<TResult = DatabaseResourceResponse>(operation: (connection: any) => Promise<TResult>, _context?: any): Promise<{
        success: boolean;
        data?: TResult;
        error?: string;
        timestamp: string;
        metadata: {
            timestamp: string;
            executionTime: number;
            resourceName: string;
            version: string;
            connectionId?: string;
        };
    }>;
    /**
     * Execute database operation with config
     */
    executeOperation(config: DatabaseResourceConfig): Promise<DatabaseResourceResponse>;
    /**
     * Execute SELECT query
     */
    private executeQuery;
    /**
     * Execute INSERT operation
     */
    private executeInsert;
    /**
     * Execute UPDATE operation
     */
    private executeUpdate;
    /**
     * Execute DELETE operation
     */
    private executeDelete;
    /**
     * Execute transaction
     */
    private executeTransaction;
    /**
     * Build SELECT query
     */
    private buildSelectQuery;
    /**
     * Build INSERT query
     */
    private buildInsertQuery;
    /**
     * Build UPDATE query
     */
    private buildUpdateQuery;
    /**
     * Build DELETE query
     */
    private buildDeleteQuery;
    /**
     * Run SQL query
     */
    private runQuery;
    /**
     * Initialize connection pool
     */
    private initializeConnectionPool;
    /**
     * Get connection from pool
     */
    protected getConnection(): Promise<any>;
    /**
     * Return connection to pool
     */
    returnConnection(connection: any): Promise<void>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Create a new database connection
     */
    protected createConnection(): Promise<any>;
    /**
     * Close a database connection
     */
    protected closeConnection(connection: any): Promise<void>;
    /**
     * Get connection ID
     */
    protected getConnectionId(connection: any): string;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=database-resource.d.ts.map