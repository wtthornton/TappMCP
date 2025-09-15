import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { createHash } from 'crypto';
/**
 * File Resource Schema
 */
export const FileResourceSchema = z.object({
    path: z.string().min(1, 'File path is required'),
    mode: z.enum(['read', 'write', 'append']).default('read'),
    encoding: z.string().default('utf8'),
    createIfNotExists: z.boolean().default(false),
    backup: z.boolean().default(false),
    permissions: z.string().optional(),
    data: z.string().optional(),
});
/**
 * File Resource Response Schema
 */
export const FileResourceResponseSchema = z.object({
    success: z.boolean(),
    data: z.string().optional(),
    metadata: z
        .object({
        path: z.string(),
        size: z.number(),
        lastModified: z.date(),
        hash: z.string(),
        permissions: z.string().optional(),
    })
        .optional(),
    error: z.string().optional(),
});
/**
 * MCP File Resource
 * Provides secure file operations with validation and error handling
 */
export class FileResource extends MCPResource {
    basePath;
    maxFileSize;
    allowedExtensions;
    schema;
    constructor(config = {}) {
        const mcpConfig = {
            name: 'file-resource',
            type: 'file',
            version: '1.0.0',
            description: 'Secure file operations with validation and error handling',
            connectionConfig: {},
            maxConnections: 1,
        };
        super(mcpConfig);
        this.basePath = config.basePath || process.cwd();
        this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.allowedExtensions = config.allowedExtensions || [
            '.txt',
            '.json',
            '.md',
            '.ts',
            '.js',
            '.html',
            '.css',
        ];
        this.schema = FileResourceSchema;
    }
    /**
     * Initialize the file resource
     */
    async initialize() {
        try {
            // Ensure base directory exists
            await fs.mkdir(this.basePath, { recursive: true });
            this.logger.info('File resource initialized', { basePath: this.basePath });
        }
        catch (error) {
            this.logger.error('Failed to initialize file resource', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Internal initialization (required by base class)
     */
    async initializeInternal() {
        // File resource initialization is handled in initialize()
    }
    /**
     * Execute file operation
     */
    async executeFileOperation(config) {
        const startTime = Date.now();
        try {
            // Validate configuration
            const validatedConfig = this.schema.parse(config);
            // Resolve and validate file path
            const resolvedPath = this.resolvePath(validatedConfig.path);
            this.validatePath(resolvedPath);
            // Check file size if reading
            if (validatedConfig.mode === 'read') {
                await this.validateFileSize(resolvedPath);
            }
            // Execute operation based on mode
            let result;
            switch (validatedConfig.mode) {
                case 'read':
                    result = await this.readFile(resolvedPath, validatedConfig);
                    break;
                case 'write':
                    result = await this.writeFile(resolvedPath, validatedConfig);
                    break;
                case 'append':
                    result = await this.appendFile(resolvedPath, validatedConfig);
                    break;
                default:
                    throw new Error(`Unsupported file mode: ${validatedConfig.mode}`);
            }
            // Log performance metrics
            const executionTime = Date.now() - startTime;
            this.logger.info('File operation completed', {
                operation: validatedConfig.mode,
                path: resolvedPath,
                executionTime: `${executionTime}ms`,
            });
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.logger.error('File operation failed', {
                error: error instanceof Error ? error.message : String(error),
                path: config.path,
                executionTime: `${executionTime}ms`,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Read file content
     */
    async readFile(path, config) {
        try {
            const data = await fs.readFile(path, {
                encoding: config.encoding,
            });
            const stats = await fs.stat(path);
            return {
                success: true,
                data: data.toString(),
                metadata: {
                    path,
                    size: stats.size,
                    lastModified: stats.mtime,
                    hash: this.calculateHash(Buffer.from(data)),
                    permissions: stats.mode.toString(8),
                },
            };
        }
        catch (error) {
            if (error.code === 'ENOENT' && config.createIfNotExists) {
                // Create empty file if it doesn't exist and createIfNotExists is true
                await fs.writeFile(path, '', {
                    encoding: config.encoding,
                });
                return {
                    success: true,
                    data: '',
                    metadata: {
                        path,
                        size: 0,
                        lastModified: new Date(),
                        hash: this.calculateHash(Buffer.from('')),
                        permissions: '644',
                    },
                };
            }
            throw error;
        }
    }
    /**
     * Write file content
     */
    async writeFile(path, config) {
        // Create backup if requested
        if (config.backup) {
            await this.createBackup(path);
        }
        // Ensure directory exists
        await fs.mkdir(dirname(path), { recursive: true });
        // Write file
        const data = config.data || '';
        await fs.writeFile(path, data, {
            encoding: config.encoding,
        });
        // Set permissions if specified
        if (config.permissions) {
            await fs.chmod(path, parseInt(config.permissions, 8));
        }
        const stats = await fs.stat(path);
        return {
            success: true,
            data,
            metadata: {
                path,
                size: stats.size,
                lastModified: stats.mtime,
                hash: this.calculateHash(Buffer.from(data)),
                permissions: stats.mode.toString(8),
            },
        };
    }
    /**
     * Append to file
     */
    async appendFile(path, config) {
        // Ensure directory exists
        await fs.mkdir(dirname(path), { recursive: true });
        // Append to file
        const data = config.data || '';
        await fs.appendFile(path, data, {
            encoding: config.encoding,
        });
        const stats = await fs.stat(path);
        return {
            success: true,
            data,
            metadata: {
                path,
                size: stats.size,
                lastModified: stats.mtime,
                hash: this.calculateHash(await fs.readFile(path)),
                permissions: stats.mode.toString(8),
            },
        };
    }
    /**
     * Resolve file path relative to base path
     */
    resolvePath(filePath) {
        // Handle absolute paths
        if (filePath.startsWith('/') || filePath.includes(':')) {
            throw new Error('Absolute paths are not allowed');
        }
        // Handle path traversal attempts
        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('Path traversal is not allowed');
        }
        const resolved = resolve(this.basePath, filePath);
        // Ensure the resolved path is within the base path (security check)
        const normalizedBasePath = resolve(this.basePath);
        const normalizedResolved = resolve(resolved);
        if (!normalizedResolved.startsWith(normalizedBasePath)) {
            throw new Error('File path is outside allowed directory');
        }
        return normalizedResolved;
    }
    /**
     * Validate file path
     */
    validatePath(path) {
        // Check file extension
        const ext = path.substring(path.lastIndexOf('.'));
        if (!this.allowedExtensions.includes(ext)) {
            throw new Error(`File extension '${ext}' is not allowed`);
        }
    }
    /**
     * Validate file size
     */
    async validateFileSize(path) {
        try {
            const stats = await fs.stat(path);
            if (stats.size > this.maxFileSize) {
                throw new Error(`File size ${stats.size} exceeds maximum allowed size ${this.maxFileSize}`);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    /**
     * Create backup of existing file
     */
    async createBackup(path) {
        try {
            const backupPath = `${path}.backup.${Date.now()}`;
            await fs.copyFile(path, backupPath);
            this.logger.info('File backup created', { original: path, backup: backupPath });
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logger.warn('Failed to create backup', {
                    path,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    /**
     * Calculate file hash
     */
    calculateHash(data) {
        return createHash('sha256').update(data).digest('hex');
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            // Check if base directory is accessible
            await fs.access(this.basePath);
            return true;
        }
        catch (error) {
            this.logger.error('File resource health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    /**
     * Create connection (required by base class)
     */
    async createConnection() {
        // File resource doesn't need connections, return a mock
        return { id: 'file-connection', type: 'file' };
    }
    /**
     * Close connection (required by base class)
     */
    async closeConnection(_connection) {
        // File resource doesn't need to close connections
    }
    /**
     * Get connection ID (required by base class)
     */
    getConnectionId(connection) {
        return connection?.id || 'file-connection';
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        this.logger.info('File resource cleanup completed');
    }
}
//# sourceMappingURL=file-resource.js.map