/**
 * Database Intelligence Engine - Modular Export
 *
 * This module provides the refactored DatabaseIntelligenceEngine with a clean
 * modular architecture. The original monolithic file has been broken down into:
 *
 * - DatabaseAnalyzer: Core database analysis coordination
 * - QueryOptimizer: SQL query optimization and performance analysis
 * - DataIntegrityAnalyzer: Data integrity, constraints, and relationships
 * - DatabasePerformanceAnalyzer: Database-specific performance optimization
 */

export { DatabaseAnalyzer } from './DatabaseAnalyzer.js';
export { QueryOptimizer, QueryOptimizationAnalysis } from './QueryOptimizer.js';
export { DataIntegrityAnalyzer, DataIntegrityAnalysis } from './DataIntegrityAnalyzer.js';
export { DatabasePerformanceAnalyzer } from './DatabasePerformanceAnalyzer.js';

// Export the main class with the original name for backward compatibility
export { DatabaseAnalyzer as DatabaseIntelligenceEngine } from './DatabaseAnalyzer.js';
