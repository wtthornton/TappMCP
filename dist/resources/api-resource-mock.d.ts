import { MCPResource } from '../framework/mcp-resource.js';
import { z } from 'zod';
/**
 * API Resource Schema
 */
export declare const ApiResourceSchema: z.ZodObject<{
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>;
    url: z.ZodString;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    body: z.ZodOptional<z.ZodAny>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
    retryDelay: z.ZodDefault<z.ZodNumber>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        requests: z.ZodNumber;
        window: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        window: number;
        requests: number;
    }, {
        window: number;
        requests: number;
    }>>;
    auth: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["bearer", "basic", "api-key", "oauth2"]>;
        token: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
        apiKeyHeader: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "basic" | "bearer" | "api-key" | "oauth2";
        apiKeyHeader: string;
        apiKey?: string | undefined;
        password?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
    }, {
        type: "basic" | "bearer" | "api-key" | "oauth2";
        apiKey?: string | undefined;
        password?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
        apiKeyHeader?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
    timeout: number;
    retries: number;
    retryDelay: number;
    headers?: Record<string, string> | undefined;
    params?: Record<string, string> | undefined;
    auth?: {
        type: "basic" | "bearer" | "api-key" | "oauth2";
        apiKeyHeader: string;
        apiKey?: string | undefined;
        password?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
    } | undefined;
    body?: any;
    rateLimit?: {
        window: number;
        requests: number;
    } | undefined;
}, {
    url: string;
    method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
    headers?: Record<string, string> | undefined;
    params?: Record<string, string> | undefined;
    timeout?: number | undefined;
    auth?: {
        type: "basic" | "bearer" | "api-key" | "oauth2";
        apiKey?: string | undefined;
        password?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
        apiKeyHeader?: string | undefined;
    } | undefined;
    body?: any;
    rateLimit?: {
        window: number;
        requests: number;
    } | undefined;
    retries?: number | undefined;
    retryDelay?: number | undefined;
}>;
export type ApiResourceConfig = z.infer<typeof ApiResourceSchema>;
/**
 * API Resource Response Schema
 */
export declare const ApiResourceResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    status: z.ZodOptional<z.ZodNumber>;
    statusText: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    error: z.ZodOptional<z.ZodString>;
    executionTime: z.ZodOptional<z.ZodNumber>;
    retryCount: z.ZodOptional<z.ZodNumber>;
    rateLimitInfo: z.ZodOptional<z.ZodObject<{
        remaining: z.ZodNumber;
        resetTime: z.ZodNumber;
        limit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        remaining: number;
        resetTime: number;
    }, {
        limit: number;
        remaining: number;
        resetTime: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    headers?: Record<string, string> | undefined;
    data?: any;
    status?: number | undefined;
    executionTime?: number | undefined;
    statusText?: string | undefined;
    retryCount?: number | undefined;
    rateLimitInfo?: {
        limit: number;
        remaining: number;
        resetTime: number;
    } | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    headers?: Record<string, string> | undefined;
    data?: any;
    status?: number | undefined;
    executionTime?: number | undefined;
    statusText?: string | undefined;
    retryCount?: number | undefined;
    rateLimitInfo?: {
        limit: number;
        remaining: number;
        resetTime: number;
    } | undefined;
}>;
export type ApiResourceResponse = z.infer<typeof ApiResourceResponseSchema>;
/**
 * API Resource for HTTP operations
 */
export declare class ApiResource extends MCPResource {
    private readonly schema;
    private rateLimitStore;
    constructor();
    protected initializeInternal(): Promise<void>;
    protected createConnection(): Promise<any>;
    protected closeConnection(_connection: any): Promise<void>;
    protected getConnectionId(connection: any): string;
    /**
     * Execute API request
     */
    executeRequest(config: ApiResourceConfig): Promise<ApiResourceResponse>;
    /**
     * Execute request with retry logic
     */
    private executeWithRetries;
    /**
     * Make HTTP request (mock implementation for fast testing)
     */
    private makeRequest;
    /**
     * Simulate HTTP response based on configuration
     */
    private simulateResponse;
    /**
     * Check rate limiting
     */
    private checkRateLimit;
    /**
     * Build URL with query parameters
     */
    private buildUrl;
    /**
     * Prepare request headers
     */
    private prepareHeaders;
    /**
     * Delay utility
     */
    private delay;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=api-resource-mock.d.ts.map