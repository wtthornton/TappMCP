#!/usr/bin/env node

import { describe, it, expect } from 'vitest';
import {
  MCPError,
  ValidationError,
  BusinessLogicError,
  SystemError,
  handleError,
  getErrorMessage,
} from './errors.js';

describe('Error Handling Utilities', () => {
  describe('MCPError', () => {
    it('should create MCPError with message and code', () => {
      const error = new MCPError('Test error', 'TEST_ERROR');

      expect(error.name).toBe('MCPError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toBeUndefined();
    });

    it('should create MCPError with context', () => {
      const context = { userId: '123', operation: 'test' };
      const error = new MCPError('Test error', 'TEST_ERROR', context);

      expect(error.context).toEqual(context);
    });

    it('should extend Error properly', () => {
      const error = new MCPError('Test error', 'TEST_ERROR');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create ValidationError with context', () => {
      const context = { field: 'username', value: 'invalid' };
      const error = new ValidationError('Invalid username', context);

      expect(error.context).toEqual(context);
    });
  });

  describe('BusinessLogicError', () => {
    it('should create BusinessLogicError with correct properties', () => {
      const error = new BusinessLogicError('Business rule violated');

      expect(error.name).toBe('BusinessLogicError');
      expect(error.message).toBe('Business rule violated');
      expect(error.code).toBe('BUSINESS_LOGIC_ERROR');
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create BusinessLogicError with context', () => {
      const context = { rule: 'max_users', limit: 100 };
      const error = new BusinessLogicError('User limit exceeded', context);

      expect(error.context).toEqual(context);
    });
  });

  describe('SystemError', () => {
    it('should create SystemError with correct properties', () => {
      const error = new SystemError('System failure');

      expect(error.name).toBe('SystemError');
      expect(error.message).toBe('System failure');
      expect(error.code).toBe('SYSTEM_ERROR');
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create SystemError with context', () => {
      const context = { service: 'database', host: 'localhost' };
      const error = new SystemError('Connection failed', context);

      expect(error.context).toEqual(context);
    });
  });

  describe('handleError', () => {
    it('should return MCPError unchanged', () => {
      const originalError = new ValidationError('Test validation error');
      const result = handleError(originalError);

      expect(result).toBe(originalError);
      expect(result instanceof ValidationError).toBe(true);
    });

    it('should convert standard Error to SystemError', () => {
      const originalError = new Error('Standard error');
      const result = handleError(originalError);

      expect(result instanceof SystemError).toBe(true);
      expect(result.message).toBe('Standard error');
      expect(result.code).toBe('SYSTEM_ERROR');
      expect(result.context?.originalError).toBe('Error');
    });

    it('should convert standard Error with context', () => {
      const originalError = new Error('File not found');
      const context = { filePath: '/tmp/test.txt' };
      const result = handleError(originalError, context);

      expect(result instanceof SystemError).toBe(true);
      expect(result.context?.filePath).toBe('/tmp/test.txt');
      expect(result.context?.originalError).toBe('Error');
    });

    it('should handle custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const originalError = new CustomError('Custom error occurred');
      const result = handleError(originalError);

      expect(result instanceof SystemError).toBe(true);
      expect(result.message).toBe('Custom error occurred');
      expect(result.context?.originalError).toBe('CustomError');
    });

    it('should handle non-Error objects', () => {
      const nonError = 'String error';
      const result = handleError(nonError);

      expect(result instanceof SystemError).toBe(true);
      expect(result.message).toBe('Unknown error occurred');
      expect(result.context?.originalError).toBe('String error');
    });

    it('should handle null and undefined', () => {
      const nullResult = handleError(null);
      expect(nullResult instanceof SystemError).toBe(true);
      expect(nullResult.message).toBe('Unknown error occurred');
      expect(nullResult.context?.originalError).toBe('null');

      const undefinedResult = handleError(undefined);
      expect(undefinedResult instanceof SystemError).toBe(true);
      expect(undefinedResult.message).toBe('Unknown error occurred');
      expect(undefinedResult.context?.originalError).toBe('undefined');
    });

    it('should handle complex objects', () => {
      const complexError = { error: 'Complex error', code: 500 };
      const result = handleError(complexError);

      expect(result instanceof SystemError).toBe(true);
      expect(result.message).toBe('Unknown error occurred');
      expect(result.context?.originalError).toBe('[object Object]');
    });

    it('should merge context with existing context', () => {
      const originalError = new Error('Network error');
      const context = { service: 'api', retry: true };
      const result = handleError(originalError, context);

      expect(result.context?.service).toBe('api');
      expect(result.context?.retry).toBe(true);
      expect(result.context?.originalError).toBe('Error');
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error instances', () => {
      const error = new Error('Test error message');
      const result = getErrorMessage(error);

      expect(result).toBe('Test error message');
    });

    it('should extract message from MCPError instances', () => {
      const error = new ValidationError('Validation failed');
      const result = getErrorMessage(error);

      expect(result).toBe('Validation failed');
    });

    it('should convert non-Error objects to string', () => {
      expect(getErrorMessage('String error')).toBe('String error');
      expect(getErrorMessage(123)).toBe('123');
      expect(getErrorMessage(true)).toBe('true');
      expect(getErrorMessage(null)).toBe('null');
      expect(getErrorMessage(undefined)).toBe('undefined');
    });

    it('should handle complex objects', () => {
      const complexObject = { error: 'Complex error', code: 500 };
      const result = getErrorMessage(complexObject);

      expect(result).toBe('[object Object]');
    });

    it('should handle arrays', () => {
      const arrayError = ['error1', 'error2'];
      const result = getErrorMessage(arrayError);

      expect(result).toBe('error1,error2');
    });

    it('should handle custom Error types with different messages', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error message');
      const result = getErrorMessage(error);

      expect(result).toBe('Custom error message');
    });
  });

  describe('Error Inheritance Chain', () => {
    it('should maintain proper inheritance chain', () => {
      const validationError = new ValidationError('Test');
      const businessError = new BusinessLogicError('Test');
      const systemError = new SystemError('Test');

      // All should be instances of their specific type
      expect(validationError instanceof ValidationError).toBe(true);
      expect(businessError instanceof BusinessLogicError).toBe(true);
      expect(systemError instanceof SystemError).toBe(true);

      // All should be instances of MCPError
      expect(validationError instanceof MCPError).toBe(true);
      expect(businessError instanceof MCPError).toBe(true);
      expect(systemError instanceof MCPError).toBe(true);

      // All should be instances of Error
      expect(validationError instanceof Error).toBe(true);
      expect(businessError instanceof Error).toBe(true);
      expect(systemError instanceof Error).toBe(true);
    });

    it('should have correct error codes', () => {
      expect(new ValidationError('Test').code).toBe('VALIDATION_ERROR');
      expect(new BusinessLogicError('Test').code).toBe('BUSINESS_LOGIC_ERROR');
      expect(new SystemError('Test').code).toBe('SYSTEM_ERROR');
    });
  });
});