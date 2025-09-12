/**
 * Smart Write Tool - Modular Architecture
 *
 * Exports all smart-write modules with backward compatibility.
 * This modular approach replaces the monolithic smart-write.ts.
 */

// Core orchestrator (replaces smart-write.ts)
export { SmartWriteCore, smartWriteTool, handleSmartWrite } from './SmartWriteCore.js';

// Specialized modules
export { ContextualAnalyzer } from './ContextualAnalyzer.js';
export { CodeGenerator } from './CodeGenerator.js';
export { QualityValidator } from './QualityValidator.js';

// Type exports
export type {
  EnhancedInput,
  ProjectAnalysisResult,
  Context7ProjectData
} from './ContextualAnalyzer.js';

export type {
  GeneratedCode,
  GeneratedFile
} from './CodeGenerator.js';

export type {
  ValidatedGeneratedCode,
  QualityValidationResult,
  QualityRequirements,
  QualityIssue,
  QualityMetrics
} from './QualityValidator.js';

// Backward compatibility - export smartWriteTool as default
export { smartWriteTool as default } from './SmartWriteCore.js';