#!/usr/bin/env node
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type ExternalKnowledge } from '../core/mcp-coordinator.js';
export declare const smartPlanTool: Tool;
/**
 * Enhanced Smart Plan tool handler with business analysis and strategic planning
 */
interface SmartPlanSuccessResponse {
    success: true;
    planId: string;
    planType: string;
    businessAnalysis: {
        requirements: unknown;
        complexity: unknown;
        stakeholderCount: number;
        riskFactors: number;
    };
    strategicPlan: {
        phases: unknown[];
        timeline: unknown;
        userStories: unknown[];
        businessValue: unknown;
    };
    technicalPlan: {
        architecture: unknown;
        effort: unknown;
        optimization: unknown;
        qualityGates: unknown[];
    };
    validation: {
        isValid: boolean;
        issues: unknown[];
        recommendations: unknown[];
        confidenceLevel: string;
    };
    externalIntegration: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
        knowledgeCount: number;
    };
    externalKnowledge: ExternalKnowledge[];
    deliverables: {
        successMetrics: string[];
        nextSteps: string[];
        qualityTargets: Array<{
            phase: string;
            threshold: string;
        }>;
    };
    technicalMetrics: {
        responseTime: number;
        planGenerationTime: number;
        businessAnalysisTime: number;
        technicalPlanningTime: number;
        validationTime: number;
        phasesPlanned: number;
        tasksPlanned: number;
        risksIdentified: number;
        userStoriesGenerated: number;
        componentsMapped: number;
    };
    businessMetrics: {
        estimatedROI: number;
        timeToMarket: string;
        costSavings: number;
        riskMitigation: number;
        qualityImprovement: string;
    };
    timestamp: string;
}
interface SmartPlanErrorResponse {
    success: false;
    error: string;
    errorType: 'validation_error' | 'generation_error';
    responseTime: number;
    timestamp: string;
}
type SmartPlanResponse = SmartPlanSuccessResponse | SmartPlanErrorResponse;
export declare function handleSmartPlan(input: unknown): Promise<SmartPlanResponse>;
export { smartPlanTool as default };
//# sourceMappingURL=smart-plan-enhanced.d.ts.map