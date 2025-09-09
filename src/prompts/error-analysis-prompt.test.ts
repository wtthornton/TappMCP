#!/usr/bin/env node

import { describe, it, expect } from 'vitest';
import {
  ErrorAnalysisPrompt,
  ErrorAnalysisPromptSchema,
  type ErrorAnalysisPromptInput,
} from './error-analysis-prompt.js';

describe('ErrorAnalysisPrompt', () => {
  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const validInput = {
        errorMessage: 'TypeError: Cannot read property "name" of undefined',
      };

      const result = ErrorAnalysisPromptSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate complete input', () => {
      const validInput = {
        errorMessage: 'ReferenceError: myVariable is not defined',
        errorType: 'ReferenceError',
        stackTrace: 'at myFunction (app.js:10:5)',
        codeContext: 'function myFunction() { console.log(myVariable); }',
        language: 'javascript',
        framework: 'nodejs',
        environment: 'Node.js v18',
        recentChanges: ['Removed global variable declaration', 'Refactored function scope'],
        severity: 'high' as const,
      };

      const result = ErrorAnalysisPromptSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.errorMessage).toBe('ReferenceError: myVariable is not defined');
        expect(result.data.severity).toBe('high');
        expect(result.data.recentChanges).toHaveLength(2);
      }
    });

    it('should reject invalid severity levels', () => {
      const invalidInput = {
        errorMessage: 'Test error',
        severity: 'extreme', // Invalid enum value
      };

      const result = ErrorAnalysisPromptSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require errorMessage field', () => {
      const invalidInput = {
        errorType: 'TypeError',
        // Missing required errorMessage
      };

      const result = ErrorAnalysisPromptSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate all severity enum values', () => {
      const severityLevels = ['low', 'medium', 'high', 'critical'] as const;

      for (const severity of severityLevels) {
        const input = {
          errorMessage: 'Test error',
          severity,
        };

        const result = ErrorAnalysisPromptSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('ErrorAnalysisPrompt Class', () => {
    it('should create prompt with valid configuration', () => {
      const config = {
        name: 'error-analysis',
        description: 'Analyzes programming errors and provides solutions',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      expect(prompt).toBeInstanceOf(ErrorAnalysisPrompt);
    });

    it('should generate prompt for basic error', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Analyzes programming errors',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const input: ErrorAnalysisPromptInput = {
        errorMessage: 'TypeError: Cannot read property "length" of null',
      };

      const context = {
        requestId: 'test-123',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('TypeError');
      expect(result.prompt).toContain('length');
      expect(result.variables).toMatchObject(input);
    });

    it('should generate comprehensive prompt with all fields', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Comprehensive error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const input: ErrorAnalysisPromptInput = {
        errorMessage: 'ReferenceError: fetch is not defined',
        errorType: 'ReferenceError',
        stackTrace: 'at fetchData (api.js:15:3)\n    at main (app.js:5:1)',
        codeContext: 'async function fetchData() { const response = await fetch("/api/data"); }',
        language: 'javascript',
        framework: 'nodejs',
        environment: 'Node.js v16',
        recentChanges: [
          'Migrated from browser to Node.js environment',
          'Removed fetch polyfill import'
        ],
        severity: 'high',
      };

      const context = {
        requestId: 'comprehensive-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('ReferenceError');
      expect(result.prompt).toContain('fetch is not defined');
      expect(result.prompt).toContain('Node.js');
      expect(result.prompt).toContain('high');
      expect(result.variables.severity).toBe('high');
      expect(result.variables.recentChanges).toHaveLength(2);
    });

    it('should handle JavaScript-specific errors', async () => {
      const config = {
        name: 'error-analysis',
        description: 'JavaScript error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const input: ErrorAnalysisPromptInput = {
        errorMessage: 'SyntaxError: Unexpected token "}" in JSON',
        errorType: 'SyntaxError',
        language: 'javascript',
        environment: 'browser',
        severity: 'medium',
      };

      const context = {
        requestId: 'js-error-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('SyntaxError');
      expect(result.prompt).toContain('JSON');
      expect(result.prompt).toContain('javascript');
    });

    it('should handle validation errors gracefully', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Error analysis with validation',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const invalidInput = {
        // Missing required errorMessage field
        errorType: 'TypeError',
      } as any;

      const context = {
        requestId: 'validation-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(invalidInput, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });

    it('should include all optional fields when provided', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Complete error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const input: ErrorAnalysisPromptInput = {
        errorMessage: 'ModuleNotFoundError: No module named "requests"',
        errorType: 'ModuleNotFoundError',
        stackTrace: 'File "app.py", line 1, in <module>\n    import requests',
        codeContext: 'import requests\nresponse = requests.get("https://api.example.com")',
        language: 'python',
        framework: 'flask',
        environment: 'Python 3.9',
        recentChanges: ['Removed requirements.txt entry', 'Updated virtual environment'],
        severity: 'critical',
      };

      const context = {
        requestId: 'complete-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('ModuleNotFoundError');
      expect(result.prompt).toContain('python');
      expect(result.prompt).toContain('critical');
      expect(result.variables.framework).toBe('flask');
      expect(result.variables.environment).toBe('Python 3.9');
      expect(result.variables.recentChanges).toHaveLength(2);
    });
  });

  describe('Error Categories', () => {
    it('should handle different error types', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Multi-type error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);

      const errorTypes = [
        'TypeError',
        'ReferenceError',
        'SyntaxError',
        'RangeError',
        'NetworkError',
        'PermissionError',
      ];

      for (const errorType of errorTypes) {
        const input: ErrorAnalysisPromptInput = {
          errorMessage: `${errorType}: Test error message`,
          errorType,
          severity: 'medium',
        };

        const context = {
          requestId: `${errorType}-test`,
          timestamp: new Date().toISOString(),
        };

        const result = await prompt.generatePrompt(input, context);

        expect(result.success).toBe(true);
        expect(result.prompt).toContain(errorType);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long error messages', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Long error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const longErrorMessage = 'Error: ' + 'x'.repeat(1000);

      const input: ErrorAnalysisPromptInput = {
        errorMessage: longErrorMessage,
        severity: 'low',
      };

      const context = {
        requestId: 'long-error-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('x'.repeat(50)); // Should contain part of the long message
    });

    it('should handle special characters in error messages', async () => {
      const config = {
        name: 'error-analysis',
        description: 'Special character error analysis',
        version: '1.0.0',
      };

      const prompt = new ErrorAnalysisPrompt(config);
      const input: ErrorAnalysisPromptInput = {
        errorMessage: 'Error: Failed to parse JSON: {"invalid": "syntax}',
        codeContext: 'const data = JSON.parse(\'{"invalid": "syntax}\');',
        severity: 'medium',
      };

      const context = {
        requestId: 'special-chars-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('JSON');
      expect(result.prompt).toContain('syntax');
    });
  });
});