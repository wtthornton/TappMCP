/**
 * MCP Prompts Module
 *
 * Exports all prompt implementations for the MCP Framework
 */
export { CodeGenerationPrompt, CodeGenerationPromptSchema, } from './code-generation-prompt.js';
export { ErrorAnalysisPrompt, ErrorAnalysisPromptSchema, } from './error-analysis-prompt.js';
export { CodeReviewPrompt, CodeReviewPromptSchema, } from './code-review-prompt.js';
export { DocumentationPrompt, DocumentationPromptSchema, } from './documentation-prompt.js';
// Re-export base classes and types
export { MCPPrompt, } from '../framework/mcp-prompt.js';
//# sourceMappingURL=index.js.map