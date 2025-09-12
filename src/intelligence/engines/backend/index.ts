/**
 * Backend Intelligence Engine - Modular Architecture
 *
 * Exports all backend analysis modules with backward compatibility.
 * This modular approach replaces the monolithic BackendIntelligenceEngine.
 */

// Core analyzer (replaces BackendIntelligenceEngine)
export { BackendAnalyzer } from './BackendAnalyzer.js';

// Specialized analyzers
export { APISecurityAnalyzer } from './APISecurityAnalyzer.js';
export { PerformanceAnalyzer } from './PerformanceAnalyzer.js';
export { ScalabilityAnalyzer } from './ScalabilityAnalyzer.js';

// Backward compatibility - export BackendAnalyzer as BackendIntelligenceEngine
export { BackendAnalyzer as BackendIntelligenceEngine } from './BackendAnalyzer.js';