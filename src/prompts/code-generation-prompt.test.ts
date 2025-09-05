import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CodeGenerationPrompt,
  CodeGenerationPromptSchema,
  type CodeGenerationPromptInput,
} from './code-generation-prompt.js';

describe('CodeGenerationPrompt', () => {
  let prompt: CodeGenerationPrompt;

  beforeEach(() => {
    prompt = new CodeGenerationPrompt();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(prompt).toBeDefined();
      expect(prompt).toBeInstanceOf(CodeGenerationPrompt);
    });
  });

  describe('Code Generation', () => {
    it('should generate code for basic task', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a function to calculate the factorial of a number',
        language: 'TypeScript',
        includeTests: true,
        includeComments: true,
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('TypeScript');
      expect(result.prompt).toContain('factorial');
      expect(result.prompt).toContain('unit tests');
      expect(result.prompt).toContain('comments');
      expect(result.metadata.promptName).toBe('code-generation-prompt');
    });

    it('should generate code with specific framework', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a React component for user authentication',
        language: 'TypeScript',
        framework: 'React',
        requirements: ['Use hooks', 'Include form validation'],
        includeTests: true,
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('React');
      expect(result.prompt).toContain('authentication');
      expect(result.prompt).toContain('hooks');
      expect(result.prompt).toContain('form validation');
    });

    it('should generate code with specific style', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a data processing pipeline',
        language: 'Python',
        style: 'functional',
        complexity: 'medium',
        includeDocumentation: true,
      };

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('functional');
      expect(result.prompt).toContain('medium');
      expect(result.prompt).toContain('JSDoc/documentation');
    });

    it('should handle validation errors', async () => {
      const input = {
        task: 'Create a function',
        // Missing required language field
      } as CodeGenerationPromptInput;

      const result = await prompt.generateCode(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('language');
    });
  });

  describe('Pattern-based Generation', () => {
    it('should generate code with singleton pattern', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a database connection manager',
        language: 'TypeScript',
      };

      const result = await prompt.generateWithPattern(input, 'singleton');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('singleton');
      expect(result.prompt).toContain('database connection manager');
    });

    it('should generate code with factory pattern', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a payment processor',
        language: 'TypeScript',
      };

      const result = await prompt.generateWithPattern(input, 'factory');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('factory');
      expect(result.prompt).toContain('payment processor');
    });

    it('should generate code with observer pattern', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create an event system',
        language: 'TypeScript',
      };

      const result = await prompt.generateWithPattern(input, 'observer');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('observer');
      expect(result.prompt).toContain('event system');
    });
  });

  describe('Test Generation', () => {
    it('should generate tests with Jest', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a utility function for string manipulation',
        language: 'TypeScript',
      };

      const result = await prompt.generateTests(input, 'jest');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('jest');
      expect(result.prompt).toContain('80% test coverage');
    });

    it('should generate tests with Vitest', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a data validation function',
        language: 'TypeScript',
      };

      const result = await prompt.generateTests(input, 'vitest');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('vitest');
      expect(result.prompt).toContain('edge cases');
    });

    it('should generate tests with pytest', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a data processing function',
        language: 'Python',
      };

      const result = await prompt.generateTests(input, 'pytest');

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('pytest');
      expect(result.prompt).toContain('error scenarios');
    });
  });

  describe('Code Optimization', () => {
    it('should optimize code for performance', async () => {
      const code = `
        function slowFunction(arr) {
          let result = [];
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] > 0) {
              result.push(arr[i] * 2);
            }
          }
          return result;
        }
      `;

      const result = await prompt.optimizeCode(code, 'JavaScript', ['performance']);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('performance');
      expect(result.prompt).toContain('Optimize');
    });

    it('should optimize code for readability', async () => {
      const code = `
        function f(x,y){return x>y?x:y;}
      `;

      const result = await prompt.optimizeCode(code, 'JavaScript', ['readability']);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('readability');
      expect(result.prompt).toContain('maintainable');
    });

    it('should optimize code for multiple goals', async () => {
      const code = `
        function processData(data) {
          // Complex processing logic
          return data.map(item => item.value).filter(val => val > 0);
        }
      `;

      const result = await prompt.optimizeCode(code, 'JavaScript', [
        'performance',
        'maintainability',
      ]);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('performance');
      expect(result.prompt).toContain('maintainability');
    });
  });

  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const validInput = {
        task: 'Create a function',
        language: 'TypeScript',
      };

      expect(() => CodeGenerationPromptSchema.parse(validInput)).not.toThrow();
    });

    it('should reject invalid language', () => {
      const invalidInput = {
        task: 'Create a function',
        language: 123, // Should be string
      };

      expect(() => CodeGenerationPromptSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid style', () => {
      const invalidInput = {
        task: 'Create a function',
        language: 'TypeScript',
        style: 'invalid-style',
      };

      expect(() => CodeGenerationPromptSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid complexity', () => {
      const invalidInput = {
        task: 'Create a function',
        language: 'TypeScript',
        complexity: 'very-complex',
      };

      expect(() => CodeGenerationPromptSchema.parse(invalidInput)).toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input: CodeGenerationPromptInput = {
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

  describe('Caching', () => {
    it('should use caching for repeated requests', async () => {
      const input: CodeGenerationPromptInput = {
        task: 'Create a simple function',
        language: 'TypeScript',
      };

      // First call
      const result1 = await prompt.generateCode(input);
      expect(result1.success).toBe(true);

      // Second call should be faster due to caching
      const result2 = await prompt.generateCode(input);
      expect(result2.success).toBe(true);
      expect(result2.metadata.executionTime).toBeLessThan(result1.metadata.executionTime);
    });
  });
});
