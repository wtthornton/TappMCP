/**
 * Error Handling Utilities
 *
 * Provides standardized error handling patterns for the Smart MCP project
 */

export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class BusinessLogicError extends MCPError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BUSINESS_LOGIC_ERROR', context);
    this.name = 'BusinessLogicError';
  }
}

export class SystemError extends MCPError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SYSTEM_ERROR', context);
    this.name = 'SystemError';
  }
}

/**
 * Standard error handler that converts unknown errors to MCPError
 */
export function handleError(error: unknown, context?: Record<string, unknown>): MCPError {
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
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
