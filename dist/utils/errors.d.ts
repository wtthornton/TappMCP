/**
 * Error Handling Utilities
 *
 * Provides standardized error handling patterns for the Smart MCP project
 */
export declare class MCPError extends Error {
    code: string;
    context?: Record<string, unknown>;
    constructor(message: string, code: string, context?: Record<string, unknown>);
}
export declare class ValidationError extends MCPError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class BusinessLogicError extends MCPError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class SystemError extends MCPError {
    constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Standard error handler that converts unknown errors to MCPError
 */
export declare function handleError(error: unknown, context?: Record<string, unknown>): MCPError;
/**
 * Safe error message extraction
 */
export declare function getErrorMessage(error: unknown): string;
//# sourceMappingURL=errors.d.ts.map