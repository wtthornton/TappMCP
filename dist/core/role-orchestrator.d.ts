#!/usr/bin/env node
/**
 * Role Orchestrator for Smart Orchestrate Tool
 *
 * Manages automatic role switching and role-based workflow orchestration.
 * Ensures specialized expertise is applied at the right workflow phases.
 */
import type { BusinessContext, RoleTransition } from './business-context-broker.js';
export interface RoleCapabilities {
    name: string;
    description: string;
    expertise: string[];
    tools: string[];
    phases: string[];
    responsibilities: string[];
    qualityGates: string[];
}
export interface RoleTransitionRule {
    fromRole: string;
    toRole: string;
    trigger: string;
    condition: string;
    priority: number;
}
export interface WorkflowTask {
    id: string;
    name: string;
    description: string;
    role: string;
    phase: string;
    dependencies: string[];
    deliverables: string[];
    estimatedTime: number;
}
export interface OrchestrationPlan {
    id: string;
    phases: string[];
    roleSequence: string[];
    tasks: WorkflowTask[];
    transitions: RoleTransitionRule[];
    estimatedDuration: number;
}
/**
 * Role Orchestrator for managing AI role switching and workflow orchestration
 */
export declare class RoleOrchestrator {
    private readonly roleCapabilities;
    private readonly transitionRules;
    private activeRole;
    private transitionHistory;
    constructor();
    /**
     * Initialize role capabilities and definitions
     */
    private initializeRoles;
    /**
     * Initialize role transition rules
     */
    private initializeTransitionRules;
    /**
     * Determine the next role based on context and current task
     */
    determineNextRole(_context: BusinessContext, task: string): string;
    /**
     * Switch to a new role with context preservation
     */
    switchRole(fromRole: string, toRole: string, context: BusinessContext): Promise<RoleTransition>;
    /**
     * Preserve context during role transitions
     */
    preserveContext(transition: RoleTransition): void;
    /**
     * Get capabilities for a specific role
     */
    getRoleCapabilities(role: string): RoleCapabilities | null;
    /**
     * Validate a role transition
     */
    validateRoleTransition(transition: RoleTransition): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    };
    /**
     * Generate an orchestration plan for a workflow
     */
    generateOrchestrationPlan(workflowType: string, businessContext: BusinessContext, requirements: string[]): OrchestrationPlan;
    /**
     * Get current active role
     */
    getCurrentRole(): string;
    /**
     * Get role transition history
     */
    getTransitionHistory(): RoleTransition[];
    /**
     * Helper methods
     */
    private inferPhaseFromTask;
    private analyzeTaskRequirements;
    private findTransitionRule;
    private determinePhases;
    private planRoleSequence;
    private generateTasks;
    private planTransitions;
    private calculateEstimatedDuration;
}
//# sourceMappingURL=role-orchestrator.d.ts.map