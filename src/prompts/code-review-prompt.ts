import {
  MCPPrompt,
  MCPPromptConfig,
  MCPPromptContext,
  MCPPromptResult,
} from '../framework/mcp-prompt.js';
import { z } from 'zod';

/**
 * Code Review Prompt Schema
 */
export const CodeReviewPromptSchema = z.object({
  code: z.string().describe('The code to review'),
  language: z.string().describe('Programming language'),
  reviewType: z
    .enum(['security', 'performance', 'maintainability', 'readability', 'comprehensive'])
    .describe('Type of review to perform'),
  focusAreas: z.array(z.string()).optional().describe('Specific areas to focus on'),
  standards: z.array(z.string()).optional().describe('Coding standards to check against'),
  context: z.string().optional().describe('Additional context about the code'),
  requirements: z.array(z.string()).optional().describe('Specific requirements to validate'),
  includeSuggestions: z.boolean().optional().describe('Whether to include improvement suggestions'),
  includeExamples: z.boolean().optional().describe('Whether to include code examples'),
  severity: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('Minimum severity level for issues'),
});

export type CodeReviewPromptInput = z.infer<typeof CodeReviewPromptSchema>;

/**
 * Code Review Prompt Configuration
 */
const config: MCPPromptConfig = {
  name: 'code-review-prompt',
  description: 'Performs comprehensive code review and provides feedback',
  version: '1.0.0',
  template: `You are an expert code reviewer. Perform a {{reviewType}} review of the following {{language}} code.

Code to Review:
\`\`\`{{language}}
{{code}}
\`\`\`

{{#if context}}
Context: {{context}}
{{/if}}

{{#if requirements}}
Requirements to Validate:
{{#each requirements}}
- {{this}}
{{/each}}
{{/if}}

{{#if standards}}
Coding Standards:
{{#each standards}}
- {{this}}
{{/each}}
{{/if}}

{{#if focusAreas}}
Focus Areas:
{{#each focusAreas}}
- {{this}}
{{/each}}
{{/if}}

{{#if severity}}
Minimum Severity: {{severity}}
{{/if}}

Please provide a comprehensive review covering:

1. **Code Quality**
   - Correctness and logic
   - Readability and clarity
   - Maintainability
   - Performance considerations

2. **Security Analysis**
   - Potential vulnerabilities
   - Input validation
   - Error handling
   - Data protection

3. **Best Practices**
   - Language-specific conventions
   - Design patterns
   - Error handling
   - Documentation

4. **Issues Found**
   - List specific issues with severity levels
   - Line numbers and descriptions
   - Impact assessment

{{#if includeSuggestions}}
5. **Improvement Suggestions**
   - Specific recommendations
   - Code refactoring ideas
   - Performance optimizations
{{/if}}

{{#if includeExamples}}
6. **Code Examples**
   - Show improved versions where applicable
   - Demonstrate best practices
{{/if}}

7. **Overall Assessment**
   - Summary of findings
   - Priority recommendations
   - Approval status

Be thorough, constructive, and specific in your feedback.`,
  variables: {
    code: z.string(),
    language: z.string(),
    reviewType: z.enum([
      'security',
      'performance',
      'maintainability',
      'readability',
      'comprehensive',
    ]),
    focusAreas: z.array(z.string()).optional(),
    standards: z.array(z.string()).optional(),
    context: z.string().optional(),
    requirements: z.array(z.string()).optional(),
    includeSuggestions: z.boolean().optional(),
    includeExamples: z.boolean().optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
  },
  contextSchema: CodeReviewPromptSchema,
  cacheConfig: {
    enabled: true,
    ttl: 7200000, // 2 hours
    maxSize: 200,
  },
};

/**
 * Code Review Prompt Class
 */
export class CodeReviewPrompt extends MCPPrompt {
  constructor() {
    super(config);
  }

  /**
   * Perform code review
   */
  async reviewCode(
    input: CodeReviewPromptInput,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const startTime = performance.now();

    try {
      // Validate input
      const validatedInput = CodeReviewPromptSchema.parse(input);

      // Render the prompt template
      const prompt = await this.renderTemplate(validatedInput, context);

      // Metadata will be handled by base class

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        prompt,
        data: prompt,
        variables: validatedInput,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          promptName: this.config.name,
          version: this.config.version,
          templateHash: '',
          variablesUsed: Object.keys(validatedInput),
        },
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          promptName: this.config.name,
          version: this.config.version,
          templateHash: '',
          variablesUsed: [],
        },
      };
    }
  }

  /**
   * Perform security-focused review
   */
  async securityReview(
    code: string,
    language: string,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: CodeReviewPromptInput = {
      code,
      language,
      reviewType: 'security',
      focusAreas: [
        'SQL injection vulnerabilities',
        'XSS prevention',
        'Input validation',
        'Authentication and authorization',
        'Data encryption',
        'Error information disclosure',
      ],
      includeSuggestions: true,
      includeExamples: true,
      severity: 'medium',
    };

    return this.reviewCode(input, context);
  }

  /**
   * Perform performance-focused review
   */
  async performanceReview(
    code: string,
    language: string,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: CodeReviewPromptInput = {
      code,
      language,
      reviewType: 'performance',
      focusAreas: [
        'Algorithm efficiency',
        'Memory usage',
        'Database queries',
        'Network requests',
        'Caching opportunities',
        'Resource cleanup',
      ],
      includeSuggestions: true,
      includeExamples: true,
      severity: 'medium',
    };

    return this.reviewCode(input, context);
  }

  /**
   * Perform maintainability review
   */
  async maintainabilityReview(
    code: string,
    language: string,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: CodeReviewPromptInput = {
      code,
      language,
      reviewType: 'maintainability',
      focusAreas: [
        'Code organization',
        'Function complexity',
        'Documentation',
        'Error handling',
        'Testability',
        'Dependencies',
      ],
      includeSuggestions: true,
      includeExamples: true,
      severity: 'low',
    };

    return this.reviewCode(input, context);
  }

  /**
   * Generate review checklist
   */
  async generateReviewChecklist(
    _language: string,
    reviewType: 'security' | 'performance' | 'maintainability' | 'readability' | 'comprehensive',
    _context?: MCPPromptContext
  ): Promise<MCPPromptResult<string[]>> {
    const checklists = {
      security: [
        'Input validation and sanitization',
        'SQL injection prevention',
        'XSS protection',
        'Authentication mechanisms',
        'Authorization checks',
        'Error handling without information disclosure',
        'Secure data storage and transmission',
      ],
      performance: [
        'Algorithm complexity analysis',
        'Memory usage optimization',
        'Database query efficiency',
        'Caching implementation',
        'Resource cleanup',
        'Async operation handling',
        'Network request optimization',
      ],
      maintainability: [
        'Code organization and structure',
        'Function and class complexity',
        'Documentation completeness',
        'Error handling consistency',
        'Test coverage',
        'Dependency management',
        'Code reusability',
      ],
      readability: [
        'Variable and function naming',
        'Code formatting and style',
        'Comment quality and relevance',
        'Code organization',
        'Consistent coding patterns',
        'Clear logic flow',
        'Appropriate abstraction levels',
      ],
      comprehensive: [
        'All security considerations',
        'All performance considerations',
        'All maintainability considerations',
        'All readability considerations',
        'Best practices compliance',
        'Standards adherence',
        'Overall code quality',
      ],
    };

    const checklist = checklists[reviewType] || checklists.comprehensive;

    return {
      success: true,
      data: checklist,
      metadata: {
        executionTime: 0,
        timestamp: new Date().toISOString(),
        promptName: this.config.name,
        version: this.config.version,
        templateHash: '',
        variablesUsed: [],
      },
    };
  }
}
