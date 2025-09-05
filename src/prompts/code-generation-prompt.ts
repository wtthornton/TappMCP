import { MCPPrompt, MCPPromptConfig, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';

/**
 * Code Generation Prompt Schema
 */
export const CodeGenerationPromptSchema = z.object({
  task: z.string().describe('The coding task to be performed'),
  language: z.string().describe('Programming language (e.g., TypeScript, Python, JavaScript)'),
  framework: z.string().optional().describe('Framework or library to use'),
  requirements: z.array(z.string()).optional().describe('Specific requirements or constraints'),
  context: z.string().optional().describe('Additional context or background information'),
  style: z.enum(['functional', 'object-oriented', 'procedural']).optional().describe('Code style preference'),
  complexity: z.enum(['simple', 'medium', 'complex']).optional().describe('Expected complexity level'),
  includeTests: z.boolean().optional().describe('Whether to include unit tests'),
  includeComments: z.boolean().optional().describe('Whether to include detailed comments'),
  includeDocumentation: z.boolean().optional().describe('Whether to include JSDoc/documentation')
});

export type CodeGenerationPromptInput = z.infer<typeof CodeGenerationPromptSchema>;

/**
 * Code Generation Prompt Configuration
 */
const config: MCPPromptConfig = {
  name: 'code-generation-prompt',
  description: 'Generates code based on task description and requirements',
  version: '1.0.0',
  template: `You are an expert {{language}} developer. Your task is to {{task}}.

{{#if framework}}
Framework: {{framework}}
{{/if}}

{{#if requirements}}
Requirements:
{{#each requirements}}
- {{this}}
{{/each}}
{{/if}}

{{#if context}}
Context: {{context}}
{{/if}}

{{#if style}}
Code Style: {{style}}
{{/if}}

{{#if complexity}}
Complexity Level: {{complexity}}
{{/if}}

{{#if includeTests}}
Please include comprehensive unit tests.
{{/if}}

{{#if includeComments}}
Please include detailed comments explaining the code.
{{/if}}

{{#if includeDocumentation}}
Please include JSDoc/documentation for all public functions.
{{/if}}

Generate clean, efficient, and well-structured {{language}} code that follows best practices.`,
  variables: {
    language: z.string(),
    task: z.string(),
    framework: z.string().optional(),
    requirements: z.array(z.string()).optional(),
    context: z.string().optional(),
    style: z.enum(['functional', 'object-oriented', 'procedural']).optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional(),
    includeTests: z.boolean().optional(),
    includeComments: z.boolean().optional(),
    includeDocumentation: z.boolean().optional()
  },
  contextSchema: CodeGenerationPromptSchema,
  cacheConfig: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 100
  }
};

/**
 * Code Generation Prompt Class
 */
export class CodeGenerationPrompt extends MCPPrompt {
  constructor() {
    super(config);
  }

  /**
   * Generate code based on input parameters
   */
  async generateCode(input: CodeGenerationPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>> {
    return this.generate(input, context);
  }

  /**
   * Generate code with specific patterns
   */
  async generateWithPattern(
    input: CodeGenerationPromptInput,
    pattern: 'singleton' | 'factory' | 'observer' | 'strategy' | 'builder',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const patternContext = {
      ...input,
      pattern,
      requirements: [
        ...(input.requirements || []),
        `Implement using ${pattern} design pattern`
      ]
    };

    return this.generateCode(patternContext, context);
  }

  /**
   * Generate test code
   */
  async generateTests(
    input: CodeGenerationPromptInput,
    testFramework: 'jest' | 'vitest' | 'mocha' | 'pytest' | 'unittest',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const testContext = {
      ...input,
      includeTests: true,
      requirements: [
        ...(input.requirements || []),
        `Use ${testFramework} testing framework`,
        'Include edge cases and error scenarios',
        'Achieve at least 80% test coverage'
      ]
    };

    return this.generateCode(testContext, context);
  }

  /**
   * Optimize existing code
   */
  async optimizeCode(
    code: string,
    language: string,
    optimizationGoals: ('performance' | 'readability' | 'maintainability')[],
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const optimizationInput: CodeGenerationPromptInput = {
      task: `Optimize the following ${language} code for: ${optimizationGoals.join(', ')}`,
      language,
      context: `Original code:\n\`\`\`${language}\n${code}\n\`\`\``,
      requirements: [
        'Maintain the same functionality',
        'Improve code quality',
        'Add performance optimizations where appropriate',
        'Ensure code is maintainable and readable'
      ],
      includeComments: true,
      includeDocumentation: true
    };

    return this.generateCode(optimizationInput, context);
  }
}
