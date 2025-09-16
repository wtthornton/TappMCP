import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';
/**
 * File Resource Schema
 */
export declare const FileResourceSchema: z.ZodObject<{
    path: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["read", "write", "append"]>>;
    encoding: z.ZodDefault<z.ZodString>;
    createIfNotExists: z.ZodDefault<z.ZodBoolean>;
    backup: z.ZodDefault<z.ZodBoolean>;
    permissions: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    encoding: string;
    mode: "write" | "read" | "append";
    backup: boolean;
    createIfNotExists: boolean;
    data?: string | undefined;
    permissions?: string | undefined;
}, {
    path: string;
    data?: string | undefined;
    encoding?: string | undefined;
    mode?: "write" | "read" | "append" | undefined;
    backup?: boolean | undefined;
    createIfNotExists?: boolean | undefined;
    permissions?: string | undefined;
}>;
export type FileResourceConfig = z.infer<typeof FileResourceSchema>;
/**
 * File Resource Response Schema
 */
export declare const FileResourceResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodObject<{
        path: z.ZodString;
        size: z.ZodNumber;
        lastModified: z.ZodDate;
        hash: z.ZodString;
        permissions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        size: number;
        hash: string;
        lastModified: Date;
        permissions?: string | undefined;
    }, {
        path: string;
        size: number;
        hash: string;
        lastModified: Date;
        permissions?: string | undefined;
    }>>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    data?: string | undefined;
    metadata?: {
        path: string;
        size: number;
        hash: string;
        lastModified: Date;
        permissions?: string | undefined;
    } | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    data?: string | undefined;
    metadata?: {
        path: string;
        size: number;
        hash: string;
        lastModified: Date;
        permissions?: string | undefined;
    } | undefined;
}>;
export type FileResourceResponse = z.infer<typeof FileResourceResponseSchema>;
/**
 * MCP File Resource
 * Provides secure file operations with validation and error handling
 */
export declare class FileResource extends MCPResource {
    private readonly basePath;
    private readonly maxFileSize;
    private readonly allowedExtensions;
    private readonly schema;
    constructor(config?: {
        basePath?: string;
        maxFileSize?: number;
        allowedExtensions?: string[];
    });
    /**
     * Initialize the file resource
     */
    initialize(): Promise<void>;
    /**
     * Internal initialization (required by base class)
     */
    protected initializeInternal(): Promise<void>;
    /**
     * Execute file operation
     */
    executeFileOperation(config: FileResourceConfig): Promise<FileResourceResponse>;
    /**
     * Read file content
     */
    private readFile;
    /**
     * Write file content
     */
    private writeFile;
    /**
     * Append to file
     */
    private appendFile;
    /**
     * Resolve file path relative to base path
     */
    private resolvePath;
    /**
     * Validate file path
     */
    private validatePath;
    /**
     * Validate file size
     */
    private validateFileSize;
    /**
     * Create backup of existing file
     */
    private createBackup;
    /**
     * Calculate file hash
     */
    private calculateHash;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Create connection (required by base class)
     */
    protected createConnection(): Promise<any>;
    /**
     * Close connection (required by base class)
     */
    protected closeConnection(_connection: any): Promise<void>;
    /**
     * Get connection ID (required by base class)
     */
    protected getConnectionId(connection: any): string;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=file-resource.d.ts.map