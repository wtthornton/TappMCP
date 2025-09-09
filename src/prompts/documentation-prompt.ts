import {
  MCPPrompt,
  MCPPromptConfig,
  MCPPromptContext,
  MCPPromptResult,
} from '../framework/mcp-prompt.js';
import { z } from 'zod';

/**
 * Documentation Prompt Schema
 */
export const DocumentationPromptSchema = z.object({
  code: z.string().describe('The code to document'),
  language: z.string().describe('Programming language'),
  docType: z
    .enum(['api', 'function', 'class', 'module', 'readme', 'tutorial', 'guide'])
    .describe('Type of documentation to generate'),
  style: z
    .enum(['jsdoc', 'tsdoc', 'sphinx', 'markdown', 'asciidoc', 'plain'])
    .optional()
    .describe('Documentation style'),
  audience: z
    .enum(['developer', 'end-user', 'maintainer', 'beginner', 'expert'])
    .optional()
    .describe('Target audience'),
  includeExamples: z.boolean().optional().describe('Whether to include code examples'),
  includeParameters: z.boolean().optional().describe('Whether to include parameter documentation'),
  includeReturnValues: z
    .boolean()
    .optional()
    .describe('Whether to include return value documentation'),
  includeErrors: z.boolean().optional().describe('Whether to include error documentation'),
  includeUsage: z.boolean().optional().describe('Whether to include usage examples'),
  contextInfo: z.string().optional().describe('Additional context about the code'),
  requirements: z.array(z.string()).optional().describe('Specific documentation requirements'),
});

export type DocumentationPromptInput = z.infer<typeof DocumentationPromptSchema>;

/**
 * Documentation Prompt Configuration
 */
const config: MCPPromptConfig = {
  name: 'documentation-prompt',
  description: 'Generates comprehensive documentation for code',
  version: '1.0.0',
  template: `You are an expert technical writer. Generate {{docType}} documentation for the following {{language}} code.

Code to Document:
\`\`\`{{language}}
{{code}}
\`\`\`

{{#if contextInfo}}
Context: {{contextInfo}}
{{/if}}

{{#if requirements}}
Requirements:
{{#each requirements}}
- {{this}}
{{/each}}
{{/if}}

Documentation Style: {{style}}
Target Audience: {{audience}}

Please generate comprehensive documentation that includes:

{{#if includeParameters}}
1. **Parameters/Arguments**
   - Detailed parameter descriptions
   - Types and constraints
   - Default values
   - Required vs optional parameters
{{/if}}

{{#if includeReturnValues}}
2. **Return Values**
   - Return type and structure
   - Possible return values
   - Error conditions
{{/if}}

{{#if includeErrors}}
3. **Error Handling**
   - Possible exceptions and errors
   - Error conditions and causes
   - How to handle errors
{{/if}}

{{#if includeUsage}}
4. **Usage Examples**
   - Basic usage examples
   - Advanced use cases
   - Common patterns
   - Best practices
{{/if}}

{{#if includeExamples}}
5. **Code Examples**
   - Working code samples
   - Integration examples
   - Real-world scenarios
{{/if}}

6. **General Documentation**
   - Purpose and functionality
   - Dependencies and prerequisites
   - Performance considerations
   - Security considerations
   - Version compatibility

Format the documentation according to {{style}} standards and make it suitable for {{audience}} audience.`,
  variables: {
    code: z.string(),
    language: z.string(),
    docType: z.enum(['api', 'function', 'class', 'module', 'readme', 'tutorial', 'guide']),
    style: z.enum(['jsdoc', 'tsdoc', 'sphinx', 'markdown', 'asciidoc', 'plain']).optional(),
    audience: z.enum(['developer', 'end-user', 'maintainer', 'beginner', 'expert']).optional(),
    includeExamples: z.boolean().optional(),
    includeParameters: z.boolean().optional(),
    includeReturnValues: z.boolean().optional(),
    includeErrors: z.boolean().optional(),
    includeUsage: z.boolean().optional(),
    contextInfo: z.string().optional(),
    requirements: z.array(z.string()).optional(),
  },
  contextSchema: DocumentationPromptSchema,
  cacheConfig: {
    enabled: true,
    ttl: 10800000, // 3 hours
    maxSize: 150,
  },
};

/**
 * Documentation Prompt Class
 */
export class DocumentationPrompt extends MCPPrompt {
  constructor() {
    super(config);
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(
    input: DocumentationPromptInput,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const startTime = performance.now();

    try {
      // Validate input
      const validatedInput = DocumentationPromptSchema.parse(input);

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
   * Generate API documentation
   */
  async generateApiDocs(
    code: string,
    language: string,
    style: 'jsdoc' | 'tsdoc' | 'sphinx' | 'markdown' = 'markdown',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: DocumentationPromptInput = {
      code,
      language,
      docType: 'api',
      style,
      audience: 'developer',
      includeParameters: true,
      includeReturnValues: true,
      includeErrors: true,
      includeUsage: true,
      includeExamples: true,
    };

    return this.generateDocumentation(input, context);
  }

  /**
   * Generate README documentation
   */
  async generateReadme(
    code: string,
    language: string,
    projectName: string,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: DocumentationPromptInput = {
      code,
      language,
      docType: 'readme',
      style: 'markdown',
      audience: 'developer',
      contextInfo: `Project: ${projectName}`,
      requirements: [
        'Include installation instructions',
        'Include usage examples',
        'Include API reference',
        'Include contributing guidelines',
        'Include license information',
      ],
      includeUsage: true,
      includeExamples: true,
    };

    return this.generateDocumentation(input, context);
  }

  /**
   * Generate tutorial documentation
   */
  async generateTutorial(
    code: string,
    language: string,
    topic: string,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: DocumentationPromptInput = {
      code,
      language,
      docType: 'tutorial',
      style: 'markdown',
      audience: 'beginner',
      contextInfo: `Topic: ${topic}`,
      requirements: [
        'Step-by-step instructions',
        'Beginner-friendly explanations',
        'Common pitfalls and how to avoid them',
        'Progressive complexity',
        'Practical examples',
      ],
      includeUsage: true,
      includeExamples: true,
    };

    return this.generateDocumentation(input, context);
  }

  /**
   * Generate function documentation
   */
  async generateFunctionDocs(
    code: string,
    language: string,
    style: 'jsdoc' | 'tsdoc' = 'jsdoc',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: DocumentationPromptInput = {
      code,
      language,
      docType: 'function',
      style,
      audience: 'developer',
      includeParameters: true,
      includeReturnValues: true,
      includeErrors: true,
      includeUsage: true,
      includeExamples: true,
    };

    return this.generateDocumentation(input, context);
  }

  /**
   * Generate class documentation
   */
  async generateClassDocs(
    code: string,
    language: string,
    style: 'jsdoc' | 'tsdoc' = 'jsdoc',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const input: DocumentationPromptInput = {
      code,
      language,
      docType: 'class',
      style,
      audience: 'developer',
      includeParameters: true,
      includeReturnValues: true,
      includeErrors: true,
      includeUsage: true,
      includeExamples: true,
      requirements: [
        'Document all public methods',
        'Document all properties',
        'Include inheritance information',
        'Include usage patterns',
        'Include design rationale',
      ],
    };

    return this.generateDocumentation(input, context);
  }
}
