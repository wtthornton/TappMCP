#!/usr/bin/env node
/**
 * Business Context Broker for Smart Orchestrate Tool
 *
 * Manages business context preservation across role transitions and workflow phases.
 * Ensures all development activities remain aligned with business goals.
 */
export interface BusinessContext {
    projectId: string;
    businessGoals: string[];
    requirements: string[];
    stakeholders: string[];
    constraints: Record<string, unknown>;
    marketContext?: {
        industry: string;
        targetMarket: string;
        competitors: string[];
    };
    success: {
        metrics: string[];
        criteria: string[];
    };
    timestamp: string;
    version: number;
}
export interface RoleTransition {
    fromRole: string;
    toRole: string;
    timestamp: string;
    context: BusinessContext;
    preservedData: Record<string, unknown>;
    transitionId: string;
}
export interface BusinessValueMetrics {
    costPrevention: number;
    timesSaved: number;
    qualityImprovement: number;
    riskMitigation: number;
    strategicAlignment: number;
    userSatisfaction: number;
}
export interface ContextMetadata {
    role: string;
    phase: string;
    priority: 'low' | 'medium' | 'high';
    expiresAt?: Date;
    tags: string[];
}
/**
 * Business Context Broker for managing context across workflow phases
 */
export declare class BusinessContextBroker {
    private contextStore;
    private roleHistory;
    private contextMetadata;
    /**
     * Set business context with role and metadata information
     */
    setContext(key: string, value: BusinessContext, role?: string, metadata?: Partial<ContextMetadata>): void;
    /**
     * Get business context with optional role filtering
     */
    getContext(key: string, role?: string): BusinessContext | null;
    /**
     * Preserve context during role transitions
     */
    preserveContext(transition: RoleTransition): void;
    /**
     * Get role transition history for a project
     */
    getRoleHistory(projectId: string): RoleTransition[];
    /**
     * Calculate business value metrics from context
     */
    getBusinessValue(projectId: string): BusinessValueMetrics;
    /**
     * Clean up expired or invalid context entries
     */
    cleanupContext(projectId: string): void;
    /**
     * Validate context integrity and consistency
     */
    validateContext(projectId: string): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    };
    /**
     * Generate context insights and analysis
     */
    generateContextInsights(projectId: string): {
        businessAlignment: number;
        contextRichness: number;
        roleTransitionEfficiency: number;
        recommendations: string[];
    };
    /**
     * Get all active contexts (for debugging/monitoring)
     */
    getActiveContexts(): {
        key: string;
        context: BusinessContext;
        metadata: ContextMetadata;
    }[];
}
//# sourceMappingURL=business-context-broker.d.ts.map