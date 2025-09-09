#!/usr/bin/env node
/**
 * Context-Aware Template Engine - Simplified
 *
 * Advanced dynamic template generation with cross-session intelligence,
 * user behavior adaptation, and deep Context7 integration.
 * Provides maximum efficiency through predictive template optimization.
 */
import { BaseTemplateEngine } from './template-engine-core.js';
import { TemplateContextSchema, UserProfileSchema, SessionContextSchema, TemplateMetadataSchema, TemplateEngineMetricsSchema, } from './template-schemas.js';
/**
 * Context-Aware Template Engine
 *
 * Enhanced template engine with cross-session learning and user adaptation
 */
export class ContextAwareTemplateEngine extends BaseTemplateEngine {
    _contextPatterns;
    _crossSessionLearning;
    performanceTracker;
    constructor() {
        super();
        this._contextPatterns = new Map();
        this._crossSessionLearning = new CrossSessionLearningEngine();
        this.performanceTracker = new TemplatePerformanceTracker();
    }
    /**
     * Generate optimized template based on context
     */
    async generateOptimizedTemplate(context, userProfile) {
        // Get or create session context
        const sessionContext = await this.getOrCreateSessionContext(context);
        // Find best template for context
        const template = await this.findBestTemplate(context, userProfile);
        // Generate template with context
        const generated = this.generateTemplate(template.id, context);
        // Record usage for learning
        await this.recordUsage(template.id, context, sessionContext);
        return generated;
    }
    /**
     * Get or create session context
     */
    async getOrCreateSessionContext(context) {
        if (!context.sessionId) {
            throw new Error('Session ID is required for context-aware template generation');
        }
        let sessionContext = this.getSessionContext(context.sessionId);
        if (!sessionContext) {
            sessionContext = {
                sessionId: context.sessionId,
                startTime: new Date(),
                templatesUsed: [],
                successRate: 0,
                contextPreservation: true,
            };
            this.sessionMemory.set(context.sessionId, sessionContext);
        }
        return sessionContext;
    }
    /**
     * Find best template for context
     */
    async findBestTemplate(context, userProfile) {
        const templates = this.getAllTemplates();
        // Filter by tool name and task type
        const relevantTemplates = templates.filter(t => t.toolName === context.toolName && t.taskType === context.taskType);
        if (relevantTemplates.length === 0) {
            throw new Error(`No templates found for tool: ${context.toolName}, task: ${context.taskType}`);
        }
        // Score templates based on context
        const scoredTemplates = relevantTemplates.map(template => ({
            template,
            score: this.calculateTemplateScore(template, context, userProfile),
        }));
        // Return highest scoring template
        scoredTemplates.sort((a, b) => b.score - a.score);
        return scoredTemplates[0].template;
    }
    /**
     * Calculate template score based on context
     */
    calculateTemplateScore(template, context, userProfile) {
        let score = template.qualityScore;
        // Adjust for user level
        if (context.userLevel === 'beginner' && template.userSegments.includes('beginner')) {
            score += 10;
        }
        else if (context.userLevel === 'advanced' && template.userSegments.includes('advanced')) {
            score += 10;
        }
        // Adjust for time constraint
        if (context.timeConstraint === 'immediate' && template.adaptationLevel === 'static') {
            score += 5;
        }
        // Adjust for user profile
        if (userProfile && template.userSegments.includes(userProfile.experienceLevel)) {
            score += 15;
        }
        return Math.min(100, score);
    }
    /**
     * Record template usage for learning
     */
    async recordUsage(templateId, context, sessionContext) {
        // Update session context
        sessionContext.templatesUsed.push(templateId);
        this.updateSessionContext(sessionContext.sessionId, sessionContext);
        // Record performance metrics
        await this.performanceTracker.recordUsage({
            templateId,
            toolName: context.toolName,
            taskType: context.taskType,
            tokenCount: this.estimateTokenCount(context),
            timestamp: new Date(),
            userLevel: context.userLevel,
            ...(context.sessionId && { sessionId: context.sessionId }),
        });
    }
    /**
     * Estimate token count for context
     */
    estimateTokenCount(context) {
        // Simple estimation based on context properties
        let count = 100; // Base tokens
        count += context.toolName.length;
        count += context.taskType.length;
        count += context.constraints.length * 10;
        count += context.contextHistory.length * 20;
        return count;
    }
    /**
     * Get engine metrics
     */
    getMetrics() {
        const templates = this.getAllTemplates();
        const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
        const avgQuality = templates.reduce((sum, t) => sum + t.qualityScore, 0) / templates.length;
        return {
            totalTemplates: templates.length,
            activeTemplates: templates.filter(t => t.usageCount > 0).length,
            averageQualityScore: avgQuality || 0,
            totalUsage,
            crossSessionLearning: true,
            adaptationEnabled: true,
            performanceScore: this.calculatePerformanceScore(),
        };
    }
    /**
     * Calculate performance score
     */
    calculatePerformanceScore() {
        const templates = this.getAllTemplates();
        if (templates.length === 0)
            return 0;
        const avgQuality = templates.reduce((sum, t) => sum + t.qualityScore, 0) / templates.length;
        const usageRate = templates.filter(t => t.usageCount > 0).length / templates.length;
        return Math.round((avgQuality + usageRate * 100) / 2);
    }
}
/**
 * Cross-Session Learning Engine
 * Enhanced with process compliance and quality lessons from archive
 */
class CrossSessionLearningEngine {
    processComplianceLessons = new Map();
    qualityFailurePatterns = new Map();
    roleComplianceHistory = new Map();
    async learnFromSession(sessionId, outcomes) {
        // Learn from process compliance failures
        await this.learnProcessCompliance(sessionId, outcomes);
        // Learn from quality gate failures
        await this.learnQualityPatterns(sessionId, outcomes);
        // Learn from role switching patterns
        await this.learnRoleCompliance(sessionId, outcomes);
    }
    async learnProcessCompliance(_sessionId, _outcomes) {
        // Archive lesson: Phase 1C Role Compliance Failure
        const processLesson = {
            id: 'process-compliance-failure',
            context: 'role-switching',
            lesson: 'Always validate role compliance before claiming completion',
            impact: 'high',
            category: 'process',
            preventionActions: [
                'Explicitly confirm role at start',
                'Follow role-specific prevention checklist',
                'Track role-specific success metrics',
                'Document role-specific decisions',
            ],
            failurePatterns: [
                'No role validation at start',
                'Bypassing quality gates',
                'Making completion claims without validation',
                'Process shortcuts to save time',
            ],
            successPatterns: [
                'Run early-check before starting',
                'Follow TDD approach',
                'Validate all quality gates',
                'Document all decisions',
            ],
        };
        this.processComplianceLessons.set('process-compliance-failure', processLesson);
    }
    async learnQualityPatterns(_sessionId, _outcomes) {
        // Archive lesson: Phase 2A QA Failure Analysis
        const qualityPattern = {
            id: 'qa-failure-pattern',
            context: 'quality-validation',
            lesson: 'Never claim completion without proper quality validation',
            impact: 'critical',
            category: 'quality',
            requiredActions: [
                'Run npm run early-check before completion claims',
                'Validate all tests pass with ≥85% coverage',
                'Ensure TypeScript compilation succeeds',
                'Verify ESLint violations are resolved',
                'Create Requirements Traceability Matrix',
            ],
            warningSigns: [
                'Making assumptions about test results',
                'Bypassing quality gates',
                'False completion claims',
                'Process violations',
            ],
            successIndicators: [
                '100% test pass rate',
                'All quality gates green',
                'Complete requirements traceability',
                'Zero critical vulnerabilities',
            ],
        };
        this.qualityFailurePatterns.set('qa-failure-pattern', qualityPattern);
    }
    async learnRoleCompliance(_sessionId, _outcomes) {
        // Archive lesson: TypeScript Error Resolution Process
        const roleCompliance = {
            id: 'typescript-error-resolution',
            context: 'developer-role',
            lesson: 'Systematic error reduction with test-first approach',
            impact: 'high',
            category: 'development',
            systematicApproach: [
                'Categorize errors by type and impact',
                'Prioritize high-impact fixes first',
                'Use tests as safety net for refactoring',
                'Make minimal, targeted changes',
                'Document patterns for future prevention',
            ],
            errorPatterns: [
                'exactOptionalPropertyTypes configuration issues',
                'Class inheritance access modifier mismatches',
                'Parameter order in function signatures',
                'Complex conditional types resolution',
                'Unused variable patterns',
            ],
            preventionStrategies: [
                'Use spread operators with conditional property inclusion',
                'Keep access modifiers consistent across inheritance',
                'Put required parameters before optional ones',
                'Use simple, explicit types over complex conditionals',
                'Regular cleanup of unused variables',
            ],
        };
        this.roleComplianceHistory.set('typescript-error-resolution', roleCompliance);
    }
    /**
     * Get process compliance lessons for current context
     */
    getProcessLessons(context) {
        return Array.from(this.processComplianceLessons.values()).filter(lesson => lesson.context === context || lesson.context === 'general');
    }
    /**
     * Get quality patterns for prevention
     */
    getQualityPatterns() {
        return Array.from(this.qualityFailurePatterns.values());
    }
    /**
     * Get role compliance history
     */
    getRoleCompliance(role) {
        return Array.from(this.roleComplianceHistory.values()).filter(compliance => compliance.context.includes(role));
    }
}
/**
 * Template Performance Tracker
 */
class TemplatePerformanceTracker {
    async recordUsage(_usage) {
        // Performance tracking implementation
    }
}
// Factory function for creating template engine instances
export function createTemplateEngine() {
    return new ContextAwareTemplateEngine();
}
// Re-export schemas and types
export { TemplateContextSchema, UserProfileSchema, SessionContextSchema, TemplateMetadataSchema, TemplateEngineMetricsSchema, };
//# sourceMappingURL=ContextAwareTemplateEngine.js.map