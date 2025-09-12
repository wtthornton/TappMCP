#!/usr/bin/env node
/**
 * Smart Write Tool - Modular Implementation
 *
 * This is the main entry point that uses the new modular architecture.
 * The original monolithic implementation (1,539 lines) has been refactored
 * into specialized modules for better maintainability and extensibility.
 *
 * Modules:
 * - ContextualAnalyzer: Context7 integration and project analysis
 * - CodeGenerator: Intelligent code generation with role-specific templates
 * - QualityValidator: Quality requirements validation and code assessment
 * - SmartWriteCore: Main orchestration and MCP tool definition
 *
 * This maintains full backward compatibility while providing enhanced
 * functionality and better code organization.
 */
export { smartWriteTool, handleSmartWrite } from './smart-write/index.js';
import { smartWriteTool } from './smart-write/index.js';
export default smartWriteTool;
//# sourceMappingURL=smart-write.d.ts.map