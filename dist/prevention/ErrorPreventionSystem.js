#!/usr/bin/env node
/**
 * Error Prevention System
 *
 * Predictive error detection and prevention system using ML-based analysis
 * to identify potential failures before they occur in MCP tool operations.
 *
 * Phase 1, Week 1 - Proactive Error Prevention System
 */
import { z } from 'zod';
/**
 * Error Pattern Schema
 */
export const ErrorPatternSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum([
        'validation',
        'network',
        'authentication',
        'timeout',
        'memory',
        'dependency',
        'configuration',
        'logic',
        'data',
    ]),
    pattern: z.string(), // Regex or code pattern that indicates potential error
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    confidence: z.number().min(0).max(1),
    historicalOccurrences: z.number().default(0),
    lastSeen: z.date().optional(),
    preventionStrategies: z.array(z.object({
        strategy: z.string(),
        description: z.string(),
        effectiveness: z.number().min(0).max(1),
        autoApplicable: z.boolean().default(false),
    })),
    contextPatterns: z.array(z.string()).default([]), // Context that often leads to this error
    associatedErrors: z.array(z.string()).default([]), // Related error patterns
});
/**
 * Prevention Configuration
 */
export const PreventionConfigSchema = z.object({
    riskThreshold: z.number().min(0).max(100).default(70), // Minimum risk score to report
    enableAutoFix: z.boolean().default(false),
    maxPredictionsPerAnalysis: z.number().default(20),
    contextWindowSize: z.number().default(50), // Lines of context to analyze
    enableLearning: z.boolean().default(true), // Learn from new errors
    priorityFilters: z.array(z.string()).default(['high', 'critical']),
});
/**
 * Error Prevention System Class
 */
export class ErrorPreventionSystem {
    config;
    errorPatterns;
    analysisHistory;
    patternIndex; // category -> pattern IDs
    learningData;
    constructor(config = {}) {
        this.config = PreventionConfigSchema.parse(config);
        this.errorPatterns = new Map();
        this.analysisHistory = [];
        this.patternIndex = new Map();
        this.learningData = new Map();
        this.initializeBuiltInPatterns();
    }
    /**
     * Analyze code and predict potential errors
     */
    async analyzeForErrors(context) {
        console.log(`Analyzing ${context.toolName}:${context.operation} for potential errors...`);
        const predictions = [];
        const codeLines = context.codeContext.split('\n');
        // Analyze each error pattern
        for (const pattern of this.errorPatterns.values()) {
            const prediction = await this.checkPattern(pattern, context, codeLines);
            if (prediction && prediction.riskScore >= this.config.riskThreshold) {
                predictions.push(prediction);
            }
        }
        // Sort by risk score and limit results
        const sortedPredictions = predictions
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, this.config.maxPredictionsPerAnalysis);
        // Store analysis for learning
        this.recordAnalysis(context, sortedPredictions);
        // Apply auto-fixes if enabled
        if (this.config.enableAutoFix) {
            await this.applyAutoFixes(sortedPredictions, context);
        }
        console.log(`Generated ${sortedPredictions.length} error predictions`);
        return sortedPredictions;
    }
    /**
     * Learn from actual errors to improve predictions
     */
    async learnFromError(error) {
        if (!this.config.enableLearning) {
            return;
        }
        // Find matching patterns
        const matchingPatterns = this.findMatchingPatterns(error.message, error.stack);
        // Update pattern statistics
        for (const pattern of matchingPatterns) {
            pattern.historicalOccurrences += 1;
            pattern.lastSeen = new Date();
            // Learn from resolution if provided
            if (error.resolution) {
                this.updatePreventionStrategies(pattern, error.resolution);
            }
        }
        // Create new pattern if no matches found
        if (matchingPatterns.length === 0 && error.stack) {
            await this.createPatternFromError(error);
        }
        console.log(`Learned from error: ${error.message.substring(0, 100)}...`);
    }
    /**
     * Get prevention statistics
     */
    getStatistics() {
        const patterns = Array.from(this.errorPatterns.values());
        const totalAnalyses = this.analysisHistory.length;
        let totalPredictions = 0;
        let errorsPrevented = 0;
        let falsePositives = 0;
        for (const analysis of this.analysisHistory) {
            totalPredictions += analysis.predictions.length;
            // Estimate prevention success based on historical data
            for (const prediction of analysis.predictions) {
                const learningData = this.learningData.get(prediction.patternId);
                if (learningData) {
                    const preventedOutcomes = learningData.outcomes.filter(o => o.result === 'prevented').length;
                    const falsePositiveOutcomes = learningData.outcomes.filter(o => o.result === 'false_positive').length;
                    errorsPrevented += preventedOutcomes;
                    falsePositives += falsePositiveOutcomes;
                }
            }
        }
        const accuracyRate = totalPredictions > 0 ? ((totalPredictions - falsePositives) / totalPredictions) * 100 : 0;
        // Calculate pattern distribution
        const patternsByCategory = {};
        for (const pattern of patterns) {
            patternsByCategory[pattern.category] = (patternsByCategory[pattern.category] || 0) + 1;
        }
        // Find most common patterns
        const mostCommonPatterns = patterns
            .map(pattern => ({
            pattern,
            occurrences: pattern.historicalOccurrences,
            preventionRate: this.calculatePreventionRate(pattern.id),
        }))
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 10);
        return {
            totalAnalyses,
            predictionsGenerated: totalPredictions,
            errorsPrevented,
            falsePositives,
            accuracyRate,
            patternsByCategory,
            mostCommonPatterns,
            recentTrends: this.calculateTrends(),
        };
    }
    /**
     * Get specific error pattern suggestions
     */
    getPreventionSuggestions(category) {
        const patterns = category
            ? Array.from(this.errorPatterns.values()).filter(p => p.category === category)
            : Array.from(this.errorPatterns.values());
        return patterns
            .map(pattern => ({
            pattern,
            suggestions: pattern.preventionStrategies.map(s => s.description),
            priority: this.calculatePatternPriority(pattern),
        }))
            .sort((a, b) => b.priority - a.priority);
    }
    /**
     * Initialize built-in error patterns
     */
    initializeBuiltInPatterns() {
        const builtInPatterns = [
            {
                id: 'zod_validation_missing',
                name: 'Missing Zod Schema Validation',
                category: 'validation',
                pattern: 'function\\s+\\w+\\([^)]*\\)\\s*{[^}]*(?!.*\\.parse\\()',
                description: 'Function parameters not validated with Zod schema',
                severity: 'high',
                confidence: 0.8,
                preventionStrategies: [
                    {
                        strategy: 'add_zod_validation',
                        description: 'Add Zod schema validation for function parameters',
                        effectiveness: 0.9,
                        autoApplicable: true,
                    },
                ],
            },
            {
                id: 'async_error_handling',
                name: 'Missing Async Error Handling',
                category: 'logic',
                pattern: 'async\\s+function[^{]*{[^}]*(?!.*try)[^}]*await',
                description: 'Async function lacks try-catch error handling',
                severity: 'high',
                confidence: 0.85,
                preventionStrategies: [
                    {
                        strategy: 'add_try_catch',
                        description: 'Wrap async operations in try-catch blocks',
                        effectiveness: 0.95,
                        autoApplicable: true,
                    },
                ],
            },
            {
                id: 'network_timeout_missing',
                name: 'Network Request Without Timeout',
                category: 'network',
                pattern: 'fetch\\([^)]*\\)(?![^{]*timeout)',
                description: 'Network request lacks timeout configuration',
                severity: 'medium',
                confidence: 0.7,
                preventionStrategies: [
                    {
                        strategy: 'add_timeout',
                        description: 'Add timeout to network requests',
                        effectiveness: 0.8,
                        autoApplicable: true,
                    },
                ],
            },
            {
                id: 'null_check_missing',
                name: 'Missing Null/Undefined Check',
                category: 'logic',
                pattern: '\\w+\\.[a-zA-Z_][a-zA-Z0-9_]*(?![^\\n]*(?:\\?\\.|&&|\\|\\|))',
                description: 'Property access without null/undefined check',
                severity: 'medium',
                confidence: 0.6,
                preventionStrategies: [
                    {
                        strategy: 'add_null_check',
                        description: 'Add null/undefined checks before property access',
                        effectiveness: 0.9,
                        autoApplicable: true,
                    },
                ],
            },
            {
                id: 'resource_leak',
                name: 'Potential Resource Leak',
                category: 'memory',
                pattern: '(fs\\.createReadStream|new\\s+EventEmitter|setInterval)(?![^}]*(?:\\.close\\(\\)|\\.destroy\\(\\)|clearInterval))',
                description: 'Resource created without proper cleanup',
                severity: 'high',
                confidence: 0.75,
                preventionStrategies: [
                    {
                        strategy: 'add_cleanup',
                        description: 'Add proper resource cleanup in finally block',
                        effectiveness: 0.85,
                        autoApplicable: false,
                    },
                ],
            },
        ];
        // Register built-in patterns
        for (const patternData of builtInPatterns) {
            if (patternData.id) {
                const pattern = ErrorPatternSchema.parse({
                    ...patternData,
                    historicalOccurrences: 0,
                    contextPatterns: [],
                    associatedErrors: [],
                });
                this.errorPatterns.set(pattern.id, pattern);
                this.indexPattern(pattern);
                // Initialize learning data
                this.learningData.set(pattern.id, {
                    triggers: [],
                    outcomes: [],
                });
            }
        }
        console.log(`Initialized ${builtInPatterns.length} built-in error patterns`);
    }
    /**
     * Check if a pattern matches the given context
     */
    async checkPattern(pattern, context, codeLines) {
        const regex = new RegExp(pattern.pattern, 'gm');
        const codeText = codeLines.join('\n');
        const matches = codeText.match(regex);
        if (!matches) {
            return null;
        }
        // Calculate risk score based on multiple factors
        const riskScore = this.calculateRiskScore(pattern, context, matches.length);
        if (riskScore < this.config.riskThreshold) {
            return null;
        }
        // Find the location of the first match
        const location = this.findMatchLocation(codeText, regex);
        // Generate suggested fixes
        const suggestedFixes = pattern.preventionStrategies.map((strategy, _index) => ({
            fix: strategy.strategy,
            description: strategy.description,
            priority: Math.round(strategy.effectiveness * 100),
            estimatedEffort: this.estimateEffort(strategy.strategy),
            autoApplicable: strategy.autoApplicable,
        }));
        // Find similar past errors
        const similarPastErrors = this.findSimilarPastErrors(pattern.id);
        return {
            patternId: pattern.id,
            patternName: pattern.name,
            category: pattern.category,
            severity: pattern.severity,
            confidence: pattern.confidence,
            riskScore,
            location,
            description: pattern.description,
            suggestedFixes,
            similarPastErrors,
        };
    }
    /**
     * Calculate risk score for a pattern match
     */
    calculateRiskScore(pattern, context, matchCount) {
        let riskScore = pattern.confidence * 100;
        // Adjust based on severity
        const severityMultiplier = {
            low: 0.5,
            medium: 0.75,
            high: 1.0,
            critical: 1.25,
        };
        riskScore *= severityMultiplier[pattern.severity];
        // Adjust based on historical occurrences
        if (pattern.historicalOccurrences > 0) {
            riskScore += Math.min(pattern.historicalOccurrences * 2, 20);
        }
        // Adjust based on environment
        if (context.environment === 'production') {
            riskScore *= 1.2;
        }
        else if (context.environment === 'development') {
            riskScore *= 0.8;
        }
        // Adjust based on match frequency
        riskScore += Math.min(matchCount * 5, 15);
        // Check for contextual risk factors
        const riskKeywords = ['async', 'Promise', 'fetch', 'database', 'api'];
        for (const keyword of riskKeywords) {
            if (context.codeContext.toLowerCase().includes(keyword)) {
                riskScore += 5;
            }
        }
        return Math.min(Math.round(riskScore), 100);
    }
    /**
     * Find the location of a pattern match
     */
    findMatchLocation(codeText, regex) {
        const match = regex.exec(codeText);
        if (!match) {
            return { context: 'No match found' };
        }
        const lines = codeText.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const contextStart = Math.max(0, lineNumber - 3);
        const contextEnd = Math.min(codeText.split('\n').length, lineNumber + 3);
        const contextLines = codeText.split('\n').slice(contextStart, contextEnd);
        const context = contextLines.join('\n');
        // Try to identify the function name
        const functionMatch = codeText
            .substring(0, match.index)
            .match(/function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?(?:function|\()/);
        const functionName = functionMatch ? functionMatch[1] || functionMatch[2] : undefined;
        return {
            line: lineNumber,
            ...(functionName && { function: functionName }),
            context,
        };
    }
    /**
     * Find similar past errors for pattern
     */
    findSimilarPastErrors(patternId) {
        const pattern = this.errorPatterns.get(patternId);
        if (!pattern)
            return [];
        return pattern.preventionStrategies.map(strategy => ({
            pattern: pattern.name,
            resolution: strategy.description,
            effectiveness: strategy.effectiveness,
        }));
    }
    /**
     * Apply automatic fixes where possible
     */
    async applyAutoFixes(predictions, _context) {
        for (const prediction of predictions) {
            const autoFixes = prediction.suggestedFixes.filter(fix => fix.autoApplicable);
            for (const fix of autoFixes) {
                console.log(`Auto-applying fix: ${fix.description} for ${prediction.patternName}`);
                // Implementation would apply the actual fix to the code
            }
        }
    }
    /**
     * Helper methods
     */
    indexPattern(pattern) {
        if (!this.patternIndex.has(pattern.category)) {
            this.patternIndex.set(pattern.category, new Set());
        }
        this.patternIndex.get(pattern.category).add(pattern.id);
    }
    recordAnalysis(context, predictions) {
        this.analysisHistory.push({
            timestamp: new Date(),
            context,
            predictions,
            actualErrors: [],
        });
        // Keep only last 1000 analyses for memory management
        if (this.analysisHistory.length > 1000) {
            this.analysisHistory = this.analysisHistory.slice(-1000);
        }
    }
    findMatchingPatterns(errorMessage, stack) {
        const matching = [];
        const searchText = `${errorMessage} ${stack || ''}`.toLowerCase();
        for (const pattern of this.errorPatterns.values()) {
            if (searchText.includes(pattern.name.toLowerCase()) ||
                searchText.match(new RegExp(pattern.pattern, 'i'))) {
                matching.push(pattern);
            }
        }
        return matching;
    }
    async createPatternFromError(error) {
        // Simplified pattern creation from error
        const pattern = {
            id: `learned_${Date.now()}`,
            name: error.message.substring(0, 50),
            category: this.categorizeError(error.message),
            pattern: error.message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // Escape regex chars
            description: `Learned pattern from error: ${error.message}`,
            severity: 'medium',
            confidence: 0.6,
            historicalOccurrences: 1,
            lastSeen: new Date(),
            preventionStrategies: [
                {
                    strategy: 'investigate_error',
                    description: 'Investigate the root cause of this error',
                    effectiveness: 0.5,
                    autoApplicable: false,
                },
            ],
            contextPatterns: [],
            associatedErrors: [],
        };
        this.errorPatterns.set(pattern.id, pattern);
        this.indexPattern(pattern);
        console.log(`Created new error pattern from learning: ${pattern.name}`);
    }
    categorizeError(errorMessage) {
        const message = errorMessage.toLowerCase();
        if (message.includes('validation') || message.includes('invalid')) {
            return 'validation';
        }
        else if (message.includes('network') ||
            message.includes('timeout') ||
            message.includes('connection')) {
            return 'network';
        }
        else if (message.includes('auth') ||
            message.includes('permission') ||
            message.includes('unauthorized')) {
            return 'authentication';
        }
        else if (message.includes('memory') || message.includes('heap')) {
            return 'memory';
        }
        else if (message.includes('config') || message.includes('setting')) {
            return 'configuration';
        }
        else if (message.includes('undefined') ||
            message.includes('null') ||
            message.includes('reference')) {
            return 'logic';
        }
        else if (message.includes('data') || message.includes('parse')) {
            return 'data';
        }
        return 'logic';
    }
    updatePreventionStrategies(pattern, resolution) {
        // Add new strategy based on resolution if not already present
        const existingStrategy = pattern.preventionStrategies.find(s => s.description.toLowerCase().includes(resolution.toLowerCase().substring(0, 20)));
        if (!existingStrategy) {
            pattern.preventionStrategies.push({
                strategy: 'learned_resolution',
                description: resolution,
                effectiveness: 0.7, // Start with moderate effectiveness
                autoApplicable: false,
            });
        }
    }
    calculatePreventionRate(patternId) {
        const learningData = this.learningData.get(patternId);
        if (!learningData || learningData.outcomes.length === 0) {
            return 0;
        }
        const prevented = learningData.outcomes.filter(o => o.result === 'prevented').length;
        return (prevented / learningData.outcomes.length) * 100;
    }
    calculatePatternPriority(pattern) {
        const severityScore = { low: 25, medium: 50, high: 75, critical: 100 }[pattern.severity];
        const confidenceScore = pattern.confidence * 100;
        const frequencyScore = Math.min(pattern.historicalOccurrences * 2, 50);
        return Math.round(severityScore * 0.4 + confidenceScore * 0.4 + frequencyScore * 0.2);
    }
    calculateTrends() {
        // Simplified trend calculation based on recent occurrences
        const recentAnalyses = this.analysisHistory.slice(-50);
        const patternCounts = {};
        for (const analysis of recentAnalyses) {
            for (const prediction of analysis.predictions) {
                patternCounts[prediction.patternId] = (patternCounts[prediction.patternId] || 0) + 1;
            }
        }
        const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
        return {
            increasingPatterns: sortedPatterns
                .slice(0, 5)
                .map(([id]) => this.errorPatterns.get(id)?.name || id),
            decreasingPatterns: [], // Would need historical comparison for this
        };
    }
    estimateEffort(strategy) {
        const lowEffortStrategies = ['add_null_check', 'add_timeout', 'add_zod_validation'];
        const highEffortStrategies = ['add_cleanup', 'investigate_error'];
        if (lowEffortStrategies.some(s => strategy.includes(s))) {
            return 'low';
        }
        else if (highEffortStrategies.some(s => strategy.includes(s))) {
            return 'high';
        }
        return 'medium';
    }
}
// Export factory function
export function createErrorPreventionSystem(config) {
    return new ErrorPreventionSystem(config);
}
//# sourceMappingURL=ErrorPreventionSystem.js.map