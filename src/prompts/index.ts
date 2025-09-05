/**
 * MCP Prompts Module
 *
 * Exports all prompt implementations for the MCP Framework
 */

export { CodeGenerationPrompt, CodeGenerationPromptSchema, type CodeGenerationPromptInput } from './code-generation-prompt.js';
export { ErrorAnalysisPrompt, ErrorAnalysisPromptSchema, type ErrorAnalysisPromptInput } from './error-analysis-prompt.js';
export { CodeReviewPrompt, CodeReviewPromptSchema, type CodeReviewPromptInput } from './code-review-prompt.js';
export { DocumentationPrompt, DocumentationPromptSchema, type DocumentationPromptInput } from './documentation-prompt.js';

// Re-export base classes and types
export { MCPPrompt, type MCPPromptConfig, type MCPPromptContext, type MCPPromptResult } from '../framework/mcp-prompt.js';
