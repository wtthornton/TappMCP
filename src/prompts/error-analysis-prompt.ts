import { MCPPrompt, MCPPromptConfig, MCPPromptContext, MCPPromptResult } from '../framework/mcp-prompt.js';
import { z } from 'zod';

/**
 * Error Analysis Prompt Schema
 */
export const ErrorAnalysisPromptSchema = z.object({
  errorMessage: z.string().describe('The error message to analyze'),
  errorType: z.string().optional().describe('Type of error (e.g., TypeError, ReferenceError)'),
  stackTrace: z.string().optional().describe('Full stack trace if available'),
  codeContext: z.string().optional().describe('Code context where error occurred'),
  language: z.string().optional().describe('Programming language'),
  framework: z.string().optional().describe('Framework or library being used'),
  environment: z.string().optional().describe('Runtime environment (Node.js, browser, etc.)'),
  recentChanges: z.array(z.string()).optional().describe('Recent code changes that might be related'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Error severity level')
});

export type ErrorAnalysisPromptInput = z.infer<typeof ErrorAnalysisPromptSchema>;

/**
 * Error Analysis Prompt Configuration
 */
const config: MCPPromptConfig = {
  name: 'error-analysis-prompt',
  description: 'Analyzes errors and provides debugging guidance',
  version: '1.0.0',
  template: `You are an expert debugging assistant. Analyze the following error and provide comprehensive guidance.

Error Details:
- Message: {{errorMessage}}
{{#if errorType}}
- Type: {{errorType}}
{{/if}}
{{#if language}}
- Language: {{language}}
{{/if}}
{{#if framework}}
- Framework: {{framework}}
{{/if}}
{{#if environment}}
- Environment: {{environment}}
{{/if}}
{{#if severity}}
- Severity: {{severity}}
{{/if}}

{{#if stackTrace}}
Stack Trace:
\`\`\`
{{stackTrace}}
\`\`\`
{{/if}}

{{#if codeContext}}
Code Context:
\`\`\`{{language}}
{{codeContext}}
\`\`\`
{{/if}}

{{#if recentChanges}}
Recent Changes:
{{#each recentChanges}}
- {{this}}
{{/each}}
{{/if}}

Please provide:
1. Root cause analysis
2. Step-by-step debugging approach
3. Potential solutions (ranked by likelihood)
4. Prevention strategies
5. Code fixes if applicable
6. Testing recommendations

Be specific and actionable in your recommendations.`,
  variables: {
    errorMessage: z.string(),
    errorType: z.string().optional(),
    stackTrace: z.string().optional(),
    codeContext: z.string().optional(),
    language: z.string().optional(),
    framework: z.string().optional(),
    environment: z.string().optional(),
    recentChanges: z.array(z.string()).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
  },
  contextSchema: ErrorAnalysisPromptSchema,
  optimizationConfig: {
    enableA_BTesting: true,
    maxVariations: 2,
    optimizationMetrics: ['accuracy', 'actionability', 'completeness']
  },
  cacheConfig: {
    enabled: true,
    ttl: 1800000, // 30 minutes
    maxSize: 50
  }
};

/**
 * Error Analysis Prompt Class
 */
export class ErrorAnalysisPrompt extends MCPPrompt {
  constructor() {
    super(config);
  }

  /**
   * Analyze an error and provide debugging guidance
   */
  async analyzeError(input: ErrorAnalysisPromptInput, context?: MCPPromptContext): Promise<MCPPromptResult<string>> {
    const startTime = performance.now();

    try {
      // Validate input
      const validatedInput = ErrorAnalysisPromptSchema.parse(input);

      // Render the prompt template
      const prompt = await this.render(validatedInput, context);

      // Add error analysis specific metadata
      const metadata = {
        ...this.getBaseMetadata(),
        variablesUsed: Object.keys(validatedInput),
        errorType: validatedInput.errorType,
        severity: validatedInput.severity || 'medium',
        analysisType: 'error_debugging'
      };

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        prompt,
        data: prompt,
        metadata: {
          ...metadata,
          executionTime
        }
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;

      return {
        success: false,
        error: error.message,
        metadata: {
          ...this.getBaseMetadata(),
          executionTime
        }
      };
    }
  }

  /**
   * Analyze common error patterns
   */
  async analyzeCommonPattern(
    errorMessage: string,
    pattern: 'async-await' | 'promise-handling' | 'type-errors' | 'import-export' | 'scope-issues',
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string>> {
    const patternContext = {
      ...context,
      pattern,
      commonPatterns: {
        'async-await': 'Async/await syntax or promise handling issues',
        'promise-handling': 'Promise rejection or unhandled promise errors',
        'type-errors': 'TypeScript or JavaScript type-related errors',
        'import-export': 'Module import/export syntax or resolution issues',
        'scope-issues': 'Variable scope or closure-related problems'
      }
    };

    const input: ErrorAnalysisPromptInput = {
      errorMessage,
      context: `This appears to be a ${pattern} related error. ${patternContext.commonPatterns[pattern]}`,
      severity: 'medium'
    };

    return this.analyzeError(input, context);
  }

  /**
   * Generate debugging checklist
   */
  async generateDebuggingChecklist(
    input: ErrorAnalysisPromptInput,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string[]>> {
    const analysis = await this.analyzeError(input, context);
    
    if (!analysis.success) {
      return analysis as MCPPromptResult<string[]>;
    }

    // Extract debugging steps from the analysis
    const checklist = [
      '1. Verify error message and type',
      '2. Check stack trace for specific line numbers',
      '3. Review recent code changes',
      '4. Test with minimal reproduction case',
      '5. Check environment and dependencies',
      '6. Validate input data and parameters',
      '7. Review error handling logic',
      '8. Test edge cases and boundary conditions'
    ];

    return {
      success: true,
      data: checklist,
      metadata: analysis.metadata
    };
  }

  /**
   * Suggest prevention strategies
   */
  async suggestPreventionStrategies(
    input: ErrorAnalysisPromptInput,
    context?: MCPPromptContext
  ): Promise<MCPPromptResult<string[]>> {
    const analysis = await this.analyzeError(input, context);
    
    if (!analysis.success) {
      return analysis as MCPPromptResult<string[]>;
    }

    const strategies = [
      'Add comprehensive error handling',
      'Implement input validation',
      'Use TypeScript for type safety',
      'Add unit tests for edge cases',
      'Implement logging and monitoring',
      'Use linting and static analysis tools',
      'Follow coding best practices',
      'Regular code reviews and refactoring'
    ];

    return {
      success: true,
      data: strategies,
      metadata: analysis.metadata
    };
  }
}
