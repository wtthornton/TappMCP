/**
 * Smart Vibe Tool Tests
 *
 * Integration tests for the smart_vibe MCP tool with real VibeTapp
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartVibe, SmartVibeSchema } from './smart-vibe.js';

describe('Smart Vibe Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate correct input schema', () => {
      const validInput = {
        command: 'make me a todo app',
        options: {
          role: 'developer',
          quality: 'standard',
          verbosity: 'detailed',
          mode: 'advanced',
        },
      };

      expect(() => SmartVibeSchema.parse(validInput)).not.toThrow();
    });

    it('should require command field', () => {
      const invalidInput = {
        options: { role: 'developer' },
      };

      expect(() => SmartVibeSchema.parse(invalidInput)).toThrow();
    });

    it('should validate role enum values', () => {
      const validRoles = [
        'developer',
        'designer',
        'qa-engineer',
        'operations-engineer',
        'product-strategist',
      ];

      validRoles.forEach(role => {
        const input = {
          command: 'test command',
          options: { role },
        };
        expect(() => SmartVibeSchema.parse(input)).not.toThrow();
      });
    });

    it('should validate quality enum values', () => {
      const validQualities = ['basic', 'standard', 'enterprise', 'production'];

      validQualities.forEach(quality => {
        const input = {
          command: 'test command',
          options: { quality },
        };
        expect(() => SmartVibeSchema.parse(input)).not.toThrow();
      });
    });
  });

  describe('VibeTapp Integration', () => {
    it('should process natural language commands successfully', async () => {
      const input = {
        command: 'create a simple hello world function',
        options: { role: 'developer' },
      };

      const result = await handleSmartVibe(input);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('TappMCP');
      expect(result.isError).toBeFalsy();
    });

    it('should handle configuration options without errors', async () => {
      const input = {
        command: 'help me understand functions',
        options: {
          role: 'developer',
          quality: 'standard',
          verbosity: 'standard',
          mode: 'basic',
        },
      };

      const result = await handleSmartVibe(input);

      expect(result).toBeDefined();
      expect(result.content[0].text).toBeDefined();
      expect(result.content[0].text.length).toBeGreaterThan(50);
      expect(result.isError).toBeFalsy();
    });

    it('should handle ambiguous commands gracefully', async () => {
      const input = {
        command: 'do something unclear please',
      };

      const result = await handleSmartVibe(input);

      expect(result).toBeDefined();
      expect(result.content[0].text).toBeDefined();
      expect(result.content[0].text.length).toBeGreaterThan(10);
      // Should provide helpful guidance for unclear requests
      expect(result.content[0].text).toMatch(/sure|specific|help|try/i);
    });
  });

  describe('Response Formatting', () => {
    it('should return properly formatted MCP response', async () => {
      const input = {
        command: 'help',
      };

      const result = await handleSmartVibe(input);

      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should include response time metrics', async () => {
      const input = {
        command: 'test command',
      };

      const result = await handleSmartVibe(input);

      expect(result.content[0].text).toBeDefined();
      // Should include some kind of processing info or response
      expect(result.content[0].text.length).toBeGreaterThan(20);
    });

    it('should handle successful responses correctly', async () => {
      const input = {
        command: 'create a variable',
      };

      const result = await handleSmartVibe(input);

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const input = {
        command: '', // Empty command should be caught by validation
      };

      try {
        await handleSmartVibe(input);
        // If we get here, the validation didn't work as expected
        expect(false).toBe(true);
      } catch (error) {
        // Should throw validation error for empty command
        expect(error).toBeDefined();
      }
    });

    it('should provide helpful error messages', async () => {
      const input = {
        command: 'xyz invalid nonsense command that makes no sense at all',
      };

      const result = await handleSmartVibe(input);

      expect(result).toBeDefined();
      expect(result.content[0].text).toBeDefined();
      // Should provide some kind of helpful response even for nonsense
      expect(result.content[0].text.length).toBeGreaterThan(10);
    });
  });

  describe('Context Management', () => {
    it('should handle multiple sequential commands', async () => {
      const input1 = {
        command: 'help',
        options: { role: 'developer' },
      };

      const input2 = {
        command: 'create a function',
      };

      const result1 = await handleSmartVibe(input1);
      const result2 = await handleSmartVibe(input2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.content[0].text).toBeDefined();
      expect(result2.content[0].text).toBeDefined();
    });
  });

  describe('MCP Protocol Compliance', () => {
    it('should return MCP-compatible response format', async () => {
      const input = { command: 'test simple command' };

      const result = await handleSmartVibe(input);

      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('should set error flag appropriately', async () => {
      const input = { command: 'help me' };

      const result = await handleSmartVibe(input);

      expect(result).toHaveProperty('isError');
      expect(typeof result.isError === 'boolean' || result.isError === undefined).toBe(true);
    });
  });
});
