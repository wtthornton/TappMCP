#!/usr/bin/env node
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type WorkflowResult } from '../core/orchestration-engine.js';
import { type BusinessContext, type BusinessValueMetrics } from '../core/business-context-broker.js';
export declare const smartOrchestrateTool: Tool;
export declare function handleSmartOrchestrate(input: unknown): Promise<{
    success: boolean;
    orchestrationId?: string;
    workflow?: WorkflowResult;
    businessContext?: BusinessContext;
    businessValue?: BusinessValueMetrics;
    technicalMetrics?: {
        responseTime: number;
        orchestrationTime: number;
        roleTransitionTime: number;
        contextPreservationAccuracy: number;
        businessAlignmentScore: number;
    };
    nextSteps?: Array<{
        step: string;
        role: string;
        estimatedTime: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    externalIntegration?: {
        context7Status: string;
        webSearchStatus: string;
        memoryStatus: string;
        integrationTime: number;
    };
    error?: string;
    timestamp: string;
}>;
//# sourceMappingURL=smart_orchestrate.d.ts.map