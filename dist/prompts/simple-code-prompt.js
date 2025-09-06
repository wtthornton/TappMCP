import { MCPPrompt, } from '../framework/mcp-prompt.js';
import { z } from 'zod';
/**
 * Simple Code Generation Prompt Schema
 */
export const SimpleCodePromptSchema = z.object({
    task: z.string().describe('The coding task to be performed'),
    language: z.string().describe('Programming language'),
    includeTests: z.boolean().optional().describe('Whether to include unit tests'),
});
/**
 * Simple Code Generation Prompt Configuration
 */
const config = {
    name: 'simple-code-prompt',
    description: 'Generates simple code based on task description',
    version: '1.0.0',
    template: `You are an expert {{language}} developer. Your task is to {{task}}.

{{#if includeTests}}
Please include unit tests for the code.
{{/if}}

Generate clean, efficient, and well-structured {{language}} code.`,
    variables: {
        language: z.string(),
        task: z.string(),
        includeTests: z.boolean().optional(),
    },
    contextSchema: SimpleCodePromptSchema,
    cacheConfig: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 100,
    },
};
/**
 * Simple Code Generation Prompt Class
 */
export class SimpleCodePrompt extends MCPPrompt {
    constructor() {
        super(config);
    }
    /**
     * Generate code based on input parameters
     */
    async generateCode(input, context) {
        return this.generate(input, context);
    }
}
//# sourceMappingURL=simple-code-prompt.js.map