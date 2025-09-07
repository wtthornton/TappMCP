#!/usr/bin/env node
/**
 * Orchestration Engine for Smart Orchestrate Tool
 *
 * Main engine that coordinates workflow execution, role switching,
 * and business context management for complete SDLC orchestration.
 */
import { type BusinessContext, type RoleTransition } from './business-context-broker.js';
export interface Workflow {
    id: string;
    name: string;
    type: string;
    phases: WorkflowPhase[];
    businessContext: BusinessContext;
    currentPhase?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
}
export interface WorkflowPhase {
    name: string;
    description: string;
    role: string;
    tools: string[];
    tasks: WorkflowTask[];
    dependencies: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
}
export interface WorkflowResult {
    workflowId: string;
    success: boolean;
    phases: WorkflowPhaseResult[];
    businessValue: BusinessValueResult;
    roleTransitions: RoleTransition[];
    technicalMetrics: OrchestrationMetrics;
    errors?: string[];
}
export interface WorkflowPhaseResult {
    phase: string;
    role: string;
    success: boolean;
    deliverables: string[];
    qualityMetrics: Record<string, number>;
    duration: number;
    issues?: string[];
}
export interface BusinessValueResult {
    costPrevention: number;
    timeToMarket: number;
    qualityImprovement: number;
    riskMitigation: number;
    strategicAlignment: number;
    businessScore: number;
}
export interface OrchestrationMetrics {
    totalExecutionTime: number;
    roleTransitionTime: number;
    contextPreservationAccuracy: number;
    phaseSuccessRate: number;
    businessAlignmentScore: number;
    performanceScore: number;
}
export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
}
export interface OptimizedWorkflow {
    original: Workflow;
    optimized: Workflow;
    improvements: string[];
    estimatedImprovements: {
        timeReduction: number;
        qualityIncrease: number;
        costReduction: number;
    };
}
/**
 * Main Orchestration Engine for complete workflow management
 */
export declare class OrchestrationEngine {
    private contextBroker;
    private activeWorkflows;
    private workflowResults;
    constructor();
    /**
     * Execute a complete workflow with role orchestration and context management
     */
    executeWorkflow(workflow: Workflow, context: BusinessContext): Promise<WorkflowResult>;
    /**
     * Role switching now handled by individual tools
     * No complex orchestration needed
     */
    switchRole(fromRole: string, toRole: string, context: BusinessContext): Promise<RoleTransition>;
    /**
     * Validate workflow before execution
     */
    validateWorkflow(workflow: Workflow): ValidationResult;
    /**
     * Optimize workflow for better performance and quality
     */
    optimizeWorkflow(workflow: Workflow): OptimizedWorkflow;
    /**
     * Get active workflows
     */
    getActiveWorkflows(): Workflow[];
    /**
     * Get workflow results
     */
    getWorkflowResult(workflowId: string): WorkflowResult | null;
    /**
     * Private helper methods
     */
    private executePhase;
    private generatePhaseDeliverables;
    private calculatePhaseQualityMetrics;
    private calculateBusinessValue;
    private calculateTechnicalMetrics;
    private optimizePhaseOrder;
    private optimizeRoleTransitions;
    private optimizeToolUsage;
}
//# sourceMappingURL=orchestration-engine.d.ts.map