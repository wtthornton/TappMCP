#!/usr/bin/env node
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { type WorkflowResult } from '../core/orchestration-engine.js';
import { type BusinessContext, type BusinessValueMetrics } from '../core/business-context-broker.js';
export declare const smartOrchestrateTool: Tool;
/**
 * Enhanced Phase 2B tool handler with business context management and role orchestration
 *
 * This is the main entry point for the Smart Orchestrate MCP tool. It processes
 * business requests and orchestrates complete SDLC workflows with role transitions,
 * quality gates, and business value tracking.
 *
 * @param input - The orchestration request containing business context and options
 * @returns Promise resolving to orchestration results with workflow, metrics, and next steps
 *
 * @example
 * ```typescript
 * const result = await handleSmartOrchestrate({
 *   request: "Build a user management system with authentication",
 *   options: {
 *     qualityLevel: "high",
 *     businessContext: {
 *       projectId: "user-mgmt-001",
 *       businessGoals: ["Improve user experience", "Increase security"],
 *       requirements: ["OAuth integration", "Role-based access"]
 *     }
 *   }
 * });
 * ```
 *
 * @throws {Error} When input validation fails or orchestration encounters critical errors
 * @since 2.0.0
 * @author TappMCP Team
 */
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
//# sourceMappingURL=smart-orchestrate.d.ts.map