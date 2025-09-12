/**
 * Frontend Intelligence Engine - Modular Export
 *
 * This module provides the refactored FrontendIntelligenceEngine with a clean
 * modular architecture. The original monolithic file has been broken down into:
 *
 * - FrontendAnalyzer: Core analysis coordination
 * - AccessibilityAnalyzer: WCAG compliance and accessibility
 * - PerformanceAnalyzer: Core Web Vitals and performance optimization
 * - SEOAnalyzer: Search engine optimization and meta tags
 */

export { FrontendAnalyzer } from './FrontendAnalyzer.js';
export { AccessibilityAnalyzer } from './AccessibilityAnalyzer.js';
export { PerformanceAnalyzer } from './PerformanceAnalyzer.js';
export { SEOAnalyzer } from './SEOAnalyzer.js';

// Export the main class with the original name for backward compatibility
export { FrontendAnalyzer as FrontendIntelligenceEngine } from './FrontendAnalyzer.js';
