#!/usr/bin/env node
"use strict";
/**
 * Business Context Broker for Smart Orchestrate Tool
 *
 * Manages business context preservation across role transitions and workflow phases.
 * Ensures all development activities remain aligned with business goals.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessContextBroker = void 0;
/**
 * Business Context Broker for managing context across workflow phases
 */
class BusinessContextBroker {
    contextStore = new Map();
    roleHistory = new Map();
    contextMetadata = new Map();
    /**
     * Set business context with role and metadata information
     */
    setContext(key, value, role, metadata) {
        // Update context version
        const existingContext = this.contextStore.get(key);
        const updatedContext = {
            ...value,
            version: (existingContext?.version ?? 0) + 1,
            timestamp: new Date().toISOString(),
        };
        this.contextStore.set(key, updatedContext);
        // Set metadata
        const contextMetadata = {
            role: role ?? 'system',
            phase: 'active',
            priority: 'medium',
            tags: [],
            ...metadata,
        };
        this.contextMetadata.set(key, contextMetadata);
    }
    /**
     * Get business context with optional role filtering
     */
    getContext(key, role) {
        const context = this.contextStore.get(key);
        if (!context) {
            return null;
        }
        // Check role access if specified
        if (role) {
            const metadata = this.contextMetadata.get(key);
            if (metadata && metadata.role !== role && metadata.role !== 'system') {
                // Role doesn't have access to this context
                return null;
            }
        }
        return context;
    }
    /**
     * Preserve context during role transitions
     */
    preserveContext(transition) {
        const { projectId } = transition.context;
        // Store transition in role history
        const history = this.roleHistory.get(projectId) ?? [];
        history.push(transition);
        this.roleHistory.set(projectId, history);
        // Update context with preserved data
        const contextKey = `project:${projectId}:context`;
        const existingContext = this.getContext(contextKey);
        if (existingContext) {
            const preservedContext = {
                ...existingContext,
                ...transition.context,
                version: existingContext.version + 1,
                timestamp: transition.timestamp,
            };
            this.setContext(contextKey, preservedContext, transition.toRole, {
                role: transition.toRole,
                phase: 'transition',
                priority: 'high',
                tags: ['role-transition', transition.fromRole, transition.toRole],
            });
        }
    }
    /**
     * Get role transition history for a project
     */
    getRoleHistory(projectId) {
        return this.roleHistory.get(projectId) ?? [];
    }
    /**
     * Calculate business value metrics from context
     */
    getBusinessValue(projectId) {
        const context = this.getContext(`project:${projectId}:context`);
        const history = this.getRoleHistory(projectId);
        if (!context) {
            return {
                costPrevention: 0,
                timesSaved: 0,
                qualityImprovement: 0,
                riskMitigation: 0,
                strategicAlignment: 0,
                userSatisfaction: 0,
            };
        }
        // Calculate metrics based on context and role transitions
        const roleTransitionCount = history.length;
        const businessGoalCount = context.businessGoals.length;
        const requirementCount = context.requirements.length;
        return {
            costPrevention: Math.min(50000, 5000 + businessGoalCount * 2000 + roleTransitionCount * 1000),
            timesSaved: Math.min(20, 2 + businessGoalCount * 0.5 + roleTransitionCount * 0.3),
            qualityImprovement: Math.min(100, 70 + businessGoalCount * 2 + roleTransitionCount * 1),
            riskMitigation: Math.min(100, 60 + requirementCount * 3 + roleTransitionCount * 2),
            strategicAlignment: Math.min(100, 80 + businessGoalCount * 1.5),
            userSatisfaction: Math.min(100, 85 + businessGoalCount * 1 + roleTransitionCount * 0.5),
        };
    }
    /**
     * Clean up expired or invalid context entries
     */
    cleanupContext(projectId) {
        const keysToRemove = [];
        const now = new Date();
        this.contextMetadata.forEach((metadata, key) => {
            if (key.includes(projectId)) {
                // Check expiration
                if (metadata.expiresAt && metadata.expiresAt < now) {
                    keysToRemove.push(key);
                }
            }
        });
        keysToRemove.forEach(key => {
            this.contextStore.delete(key);
            this.contextMetadata.delete(key);
        });
        // Clean up old role history (keep last 50 transitions)
        const history = this.roleHistory.get(projectId);
        if (history && history.length > 50) {
            const trimmedHistory = history.slice(-50);
            this.roleHistory.set(projectId, trimmedHistory);
        }
    }
    /**
     * Validate context integrity and consistency
     */
    validateContext(projectId) {
        const contextKey = `project:${projectId}:context`;
        const context = this.getContext(contextKey);
        const issues = [];
        const recommendations = [];
        if (!context) {
            issues.push('No business context found for project');
            recommendations.push('Initialize business context with setContext()');
            return { isValid: false, issues, recommendations };
        }
        // Validate required fields
        if (!context.projectId || context.projectId.trim() === '') {
            issues.push('Missing or empty project ID');
        }
        if (!context.businessGoals || context.businessGoals.length === 0) {
            issues.push('No business goals defined');
            recommendations.push('Define at least one business goal');
        }
        if (!context.requirements || context.requirements.length === 0) {
            issues.push('No requirements defined');
            recommendations.push('Define project requirements');
        }
        if (!context.success?.metrics || context.success.metrics.length === 0) {
            issues.push('No success metrics defined');
            recommendations.push('Define measurable success metrics');
        }
        // Check context freshness
        const contextAge = Date.now() - new Date(context.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (contextAge > maxAge) {
            issues.push('Context is stale (older than 24 hours)');
            recommendations.push('Refresh context with current business information');
        }
        return {
            isValid: issues.length === 0,
            issues,
            recommendations,
        };
    }
    /**
     * Generate context insights and analysis
     */
    generateContextInsights(projectId) {
        const context = this.getContext(`project:${projectId}:context`);
        const history = this.getRoleHistory(projectId);
        if (!context) {
            return {
                businessAlignment: 0,
                contextRichness: 0,
                roleTransitionEfficiency: 0,
                recommendations: ['Initialize business context for project'],
            };
        }
        // Calculate business alignment score
        const businessAlignment = Math.min(100, context.businessGoals.length * 15 +
            context.requirements.length * 10 +
            context.success.metrics.length * 20 +
            context.stakeholders.length * 5);
        // Calculate context richness
        const contextRichness = Math.min(100, (context.businessGoals.length > 0 ? 25 : 0) +
            (context.requirements.length > 0 ? 25 : 0) +
            (context.stakeholders.length > 0 ? 15 : 0) +
            (context.marketContext ? 20 : 0) +
            (context.success.metrics.length > 0 ? 15 : 0));
        // Calculate role transition efficiency
        const avgTransitionTime = history.length > 1
            ? history.slice(1).reduce((acc, transition, index) => {
                const prevTime = new Date(history[index].timestamp).getTime();
                const currTime = new Date(transition.timestamp).getTime();
                return acc + (currTime - prevTime);
            }, 0) /
                (history.length - 1)
            : 0;
        const roleTransitionEfficiency = Math.max(0, Math.min(100, 100 - (avgTransitionTime / (5 * 60 * 1000)) * 10 // Penalty for transitions > 5 minutes
        ));
        const recommendations = [];
        if (businessAlignment < 70) {
            recommendations.push('Enhance business goal definition and requirements clarity');
        }
        if (contextRichness < 60) {
            recommendations.push('Add market context and stakeholder information');
        }
        if (roleTransitionEfficiency < 80 && history.length > 1) {
            recommendations.push('Optimize role transition process to reduce context switching time');
        }
        return {
            businessAlignment,
            contextRichness,
            roleTransitionEfficiency,
            recommendations,
        };
    }
    /**
     * Get all active contexts (for debugging/monitoring)
     */
    getActiveContexts() {
        const result = [];
        this.contextStore.forEach((context, key) => {
            const metadata = this.contextMetadata.get(key);
            if (metadata) {
                result.push({ key, context, metadata });
            }
        });
        return result;
    }
}
exports.BusinessContextBroker = BusinessContextBroker;
//# sourceMappingURL=business-context-broker.js.map