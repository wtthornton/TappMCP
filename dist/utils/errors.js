/**
 * Error Handling Utilities
 *
 * Provides standardized error handling patterns for the Smart MCP project
 */
export class MCPError extends Error {
    code;
    context;
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'MCPError';
    }
}
export class ValidationError extends MCPError {
    constructor(message, context) {
        super(message, 'VALIDATION_ERROR', context);
        this.name = 'ValidationError';
    }
}
export class BusinessLogicError extends MCPError {
    constructor(message, context) {
        super(message, 'BUSINESS_LOGIC_ERROR', context);
        this.name = 'BusinessLogicError';
    }
}
export class SystemError extends MCPError {
    constructor(message, context) {
        super(message, 'SYSTEM_ERROR', context);
        this.name = 'SystemError';
    }
}
/**
 * Standard error handler that converts unknown errors to MCPError
 */
export function handleError(error, context) {
    if (error instanceof MCPError) {
        return error;
    }
    if (error instanceof Error) {
        return new SystemError(error.message, { ...context, originalError: error.name });
    }
    return new SystemError('Unknown error occurred', { ...context, originalError: String(error) });
}
/**
 * Safe error message extraction
 */
export function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
//# sourceMappingURL=errors.js.map