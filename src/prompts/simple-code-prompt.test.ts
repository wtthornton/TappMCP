import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SimpleCodePrompt,
  SimpleCodePromptSchema,
  type SimpleCodePromptInput,
} from './simple-code-prompt.js';

describe('SimpleCodePrompt', () => {
  let prompt: SimpleCodePrompt;

  beforeEach(() => {
    prompt = new SimpleCodePrompt();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(prompt).toBeDefined();
      expect(prompt).toBeInstanceOf(SimpleCodePrompt);
    });
  });

  describe('Code Generation', () => {
    it('should generate code for basic task', async () => {
      const input: SimpleCodePromptInput = {
        task: 'Create a function to calculate the factorial of a number',
        language: 'TypeScript',
        includeTests: true,
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('TypeScript');
      expect(result.prompt).toContain('factorial');
      expect(result.prompt).toContain('unit tests');
      expect(result.metadata.promptName).toBe('simple-code-prompt');
    });

    it('should generate code without tests', async () => {
      const input: SimpleCodePromptInput = {
        task: 'Create a simple calculator',
        language: 'JavaScript',
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('JavaScript');
      expect(result.prompt).toContain('calculator');
      expect(result.prompt).not.toContain('unit tests');
    });

    it('should handle validation errors', async () => {
      const input = {
        task: 'Create a function',
        // Missing required language field
      } as SimpleCodePromptInput;

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('language');
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const validInput = {
        task: 'Create a function',
        language: 'TypeScript',
      };

      expect(() => SimpleCodePromptSchema.parse(validInput)).not.toThrow();
    });

    it('should reject invalid language type', () => {
      const invalidInput = {
        task: 'Create a function',
        language: 123, // Should be string
      };

      expect(() => SimpleCodePromptSchema.parse(invalidInput)).toThrow();
    });

    it('should accept optional includeTests field', () => {
      const validInput = {
        task: 'Create a function',
        language: 'TypeScript',
        includeTests: true,
      };

      expect(() => SimpleCodePromptSchema.parse(validInput)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input: SimpleCodePromptInput = {
        task: 'Create a simple calculator',
        language: 'TypeScript',
      };

      const startTime = performance.now();
      const result = await prompt.generateCode(input);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', async () => {
      const input: SimpleCodePromptInput = {
        task: 'Create a data validator',
        language: 'Python',
        includeTests: true,
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('Python');
      expect(result.prompt).toContain('data validator');
      expect(result.prompt).toContain('unit tests');
    });

    it('should handle missing optional variables', async () => {
      const input: SimpleCodePromptInput = {
        task: 'Create a utility function',
        language: 'JavaScript',
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('JavaScript');
      expect(result.prompt).toContain('utility function');
      expect(result.prompt).not.toContain('unit tests');
    });
  });
});
