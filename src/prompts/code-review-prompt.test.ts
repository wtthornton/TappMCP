#!/usr/bin/env node

import { describe, it, expect } from 'vitest';
import {
  CodeReviewPrompt,
  CodeReviewPromptSchema,
  type CodeReviewPromptInput,
} from './code-review-prompt.js';

describe('CodeReviewPrompt', () => {
  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const validInput = {
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        reviewType: 'comprehensive' as const,
      };

      const result = CodeReviewPromptSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate all reviewType enum values', () => {
      const reviewTypes = ['security', 'performance', 'maintainability', 'readability', 'comprehensive'] as const;

      for (const reviewType of reviewTypes) {
        const input = {
          code: 'sample code',
          language: 'javascript',
          reviewType,
        };

        const result = CodeReviewPromptSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should validate all severity enum values', () => {
      const severities = ['low', 'medium', 'high'] as const;

      for (const severity of severities) {
        const input = {
          code: 'sample code',
          language: 'python',
          reviewType: 'security' as const,
          severity,
        };

        const result = CodeReviewPromptSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid reviewType values', () => {
      const invalidInput = {
        code: 'sample code',
        language: 'javascript',
        reviewType: 'invalid-type', // Invalid enum value
      };

      const result = CodeReviewPromptSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should require all mandatory fields', () => {
      const invalidInputs = [
        { language: 'javascript', reviewType: 'security' }, // Missing code
        { code: 'sample code', reviewType: 'security' }, // Missing language
        { code: 'sample code', language: 'javascript' }, // Missing reviewType
      ];

      for (const invalidInput of invalidInputs) {
        const result = CodeReviewPromptSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      }
    });

    it('should validate complete input with all optional fields', () => {
      const validInput = {
        code: 'function processData(data) { return data.map(x => x.trim().toLowerCase()); }',
        language: 'javascript',
        reviewType: 'comprehensive' as const,
        focusAreas: ['error handling', 'input validation', 'performance'],
        standards: ['ESLint', 'Airbnb Style Guide'],
        context: 'Data processing utility function',
        requirements: ['Handle null inputs', 'Maintain immutability'],
        includeSuggestions: true,
        includeExamples: true,
        severity: 'medium' as const,
      };

      const result = CodeReviewPromptSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.focusAreas).toHaveLength(3);
        expect(result.data.standards).toHaveLength(2);
        expect(result.data.includeSuggestions).toBe(true);
      }
    });
  });

  describe('CodeReviewPrompt Class', () => {
    it('should create prompt with valid configuration', () => {
      const config = {
        name: 'code-review',
        description: 'Comprehensive code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      expect(prompt).toBeInstanceOf(CodeReviewPrompt);
    });

    it('should generate prompt for security review', async () => {
      const config = {
        name: 'code-review',
        description: 'Security-focused code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `function authenticateUser(username, password) {
          const query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";
          return database.query(query);
        }`,
        language: 'javascript',
        reviewType: 'security',
        severity: 'high',
      };

      const context = {
        requestId: 'security-review-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('security');
      expect(result.prompt).toContain('authenticateUser');
      expect(result.variables).toMatchObject(input);
    });

    it('should generate prompt for performance review', async () => {
      const config = {
        name: 'code-review',
        description: 'Performance-focused code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `function findMaxValue(array) {
          let max = array[0];
          for (let i = 1; i < array.length; i++) {
            if (array[i] > max) {
              max = array[i];
            }
          }
          return max;
        }`,
        language: 'javascript',
        reviewType: 'performance',
        focusAreas: ['algorithmic complexity', 'memory usage'],
        includeSuggestions: true,
      };

      const context = {
        requestId: 'performance-review-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('performance');
      expect(result.prompt).toContain('findMaxValue');
      expect(result.variables.focusAreas).toHaveLength(2);
    });

    it('should generate prompt for maintainability review', async () => {
      const config = {
        name: 'code-review',
        description: 'Maintainability-focused code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `def process_data(d, t, f=False):
          if t == 1:
            return [x*2 for x in d if x > 0]
          elif t == 2:
            return [x/2 for x in d if x < 100]
          else:
            return d if not f else []`,
        language: 'python',
        reviewType: 'maintainability',
        focusAreas: ['code clarity', 'function naming', 'documentation'],
        standards: ['PEP 8', 'Clean Code'],
        includeExamples: true,
      };

      const context = {
        requestId: 'maintainability-review-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('maintainability');
      expect(result.prompt).toContain('process_data');
      expect(result.variables.standards).toContain('PEP 8');
    });

    it('should generate prompt for readability review', async () => {
      const config = {
        name: 'code-review',
        description: 'Readability-focused code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `public class DataProcessor {
          private List<Integer> data;

          public DataProcessor(List<Integer> d) { this.data = d; }

          public List<Integer> process() {
            return data.stream()
              .filter(x -> x != null)
              .map(x -> x * 2)
              .collect(Collectors.toList());
          }
        }`,
        language: 'java',
        reviewType: 'readability',
        focusAreas: ['variable naming', 'code structure', 'comments'],
        context: 'Data processing utility class',
        includeSuggestions: true,
      };

      const context = {
        requestId: 'readability-review-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('readability');
      expect(result.prompt).toContain('DataProcessor');
      expect(result.variables.context).toContain('utility class');
    });

    it('should generate prompt for comprehensive review', async () => {
      const config = {
        name: 'code-review',
        description: 'Comprehensive code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `async function fetchUserData(userId) {
          try {
            const response = await fetch(\`/api/users/\${userId}\`);
            const userData = await response.json();
            return userData;
          } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
          }
        }`,
        language: 'javascript',
        reviewType: 'comprehensive',
        focusAreas: ['error handling', 'security', 'performance', 'maintainability'],
        standards: ['TypeScript strict mode', 'ESLint recommended'],
        context: 'User data fetching for web application',
        requirements: ['Handle network failures', 'Validate response data', 'Log errors appropriately'],
        includeSuggestions: true,
        includeExamples: true,
        severity: 'medium',
      };

      const context = {
        requestId: 'comprehensive-review-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('comprehensive');
      expect(result.prompt).toContain('fetchUserData');
      expect(result.variables.focusAreas).toHaveLength(4);
      expect(result.variables.requirements).toHaveLength(3);
    });

    it('should handle validation errors gracefully', async () => {
      const config = {
        name: 'code-review',
        description: 'Code review with validation',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const invalidInput = {
        code: 'function test() {}',
        language: 'javascript',
        // Missing required reviewType field
      } as any;

      const context = {
        requestId: 'validation-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(invalidInput, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });

    it('should handle different programming languages', async () => {
      const config = {
        name: 'code-review',
        description: 'Multi-language code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);

      const languages = [
        { lang: 'javascript', code: 'const multiply = (a, b) => a * b;' },
        { lang: 'python', code: 'def multiply(a, b):\n    return a * b' },
        { lang: 'typescript', code: 'function multiply(a: number, b: number): number { return a * b; }' },
        { lang: 'java', code: 'public int multiply(int a, int b) { return a * b; }' },
        { lang: 'csharp', code: 'public int Multiply(int a, int b) { return a * b; }' },
      ];

      for (const { lang, code } of languages) {
        const input: CodeReviewPromptInput = {
          code,
          language: lang,
          reviewType: 'comprehensive',
        };

        const context = {
          requestId: `${lang}-review-test`,
          timestamp: new Date().toISOString(),
        };

        const result = await prompt.generatePrompt(input, context);

        expect(result.success).toBe(true);
        expect(result.prompt).toContain(lang);
        expect(result.variables.language).toBe(lang);
      }
    });

    it('should handle different severity levels', async () => {
      const config = {
        name: 'code-review',
        description: 'Severity-aware code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const severities = ['low', 'medium', 'high'] as const;

      for (const severity of severities) {
        const input: CodeReviewPromptInput = {
          code: 'function test() { return "test"; }',
          language: 'javascript',
          reviewType: 'security',
          severity,
        };

        const context = {
          requestId: `${severity}-severity-test`,
          timestamp: new Date().toISOString(),
        };

        const result = await prompt.generatePrompt(input, context);

        expect(result.success).toBe(true);
        expect(result.variables.severity).toBe(severity);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle code with special characters and escapes', async () => {
      const config = {
        name: 'code-review',
        description: 'Special character code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `const regex = /^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$/;
function validateEmail(email) {
  return regex.test(email) && !email.includes('..') && email.length < 255;
}`,
        language: 'javascript',
        reviewType: 'security',
        focusAreas: ['input validation', 'regex security'],
      };

      const context = {
        requestId: 'special-chars-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('validateEmail');
      expect(result.prompt).toContain('regex');
    });

    it('should handle very long code snippets', async () => {
      const config = {
        name: 'code-review',
        description: 'Long code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const longCode = 'function longFunction() {\n' + '  console.log("line");\n'.repeat(50) + '}';

      const input: CodeReviewPromptInput = {
        code: longCode,
        language: 'javascript',
        reviewType: 'maintainability',
        focusAreas: ['function length', 'code structure'],
      };

      const context = {
        requestId: 'long-code-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('longFunction');
    });

    it('should handle empty optional arrays', async () => {
      const config = {
        name: 'code-review',
        description: 'Empty arrays code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: 'function simple() { return true; }',
        language: 'javascript',
        reviewType: 'readability',
        focusAreas: [], // Empty array
        standards: [], // Empty array
        requirements: [], // Empty array
      };

      const context = {
        requestId: 'empty-arrays-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.variables.focusAreas).toEqual([]);
      expect(result.variables.standards).toEqual([]);
      expect(result.variables.requirements).toEqual([]);
    });

    it('should handle code with multiple languages mixed', async () => {
      const config = {
        name: 'code-review',
        description: 'Mixed language code review',
        version: '1.0.0',
      };

      const prompt = new CodeReviewPrompt(config);
      const input: CodeReviewPromptInput = {
        code: `<!-- HTML Template -->
<script>
  function updateUI(data) {
    document.getElementById('result').innerHTML = data;
  }
</script>
<style>
  .result { color: blue; }
</style>`,
        language: 'html',
        reviewType: 'security',
        focusAreas: ['XSS prevention', 'DOM manipulation'],
        severity: 'high',
      };

      const context = {
        requestId: 'mixed-lang-test',
        timestamp: new Date().toISOString(),
      };

      const result = await prompt.generatePrompt(input, context);

      expect(result.success).toBe(true);
      expect(result.prompt).toContain('updateUI');
      expect(result.variables.focusAreas).toContain('XSS prevention');
    });
  });
});