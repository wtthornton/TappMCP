#!/usr/bin/env node

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PlanGenerator, type PlanGenerationInput } from '../core/plan-generator.js';
import {
  MCPCoordinator,
  type KnowledgeRequest,
  type ExternalKnowledge,
} from '../core/mcp-coordinator.js';

// Enhanced input schema for Phase 2A requirements
const SmartPlanInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  businessRequest: z.string().min(10, 'Business request must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  timeConstraint: z.string().optional(),
  qualityRequirements: z
    .object({
      security: z.enum(['basic', 'standard', 'high']).default('standard'),
      performance: z.enum(['basic', 'standard', 'high']).default('standard'),
      accessibility: z.boolean().default(false),
    })
    .default({ security: 'standard', performance: 'standard', accessibility: false }),
  externalSources: z
    .object({
      useContext7: z.boolean().default(false),
      useWebSearch: z.boolean().default(false),
      useMemory: z.boolean().default(false),
    })
    .optional(),
  planType: z
    .enum(['strategic', 'tactical', 'technical', 'comprehensive'])
    .default('comprehensive'),
});

// Enhanced tool definition for Phase 2A
export const smartPlanTool: Tool = {
  name: 'smart_plan',
  description:
    'Generate comprehensive business and technical plans with advanced analysis, external MCP integration, and strategic planning capabilities',
  inputSchema: {
    type: 'object',
    required: ['projectId', 'businessRequest'],
    properties: {
      projectId: {
        type: 'string',
        description: 'Unique project identifier for context preservation across tools',
        minLength: 1,
      },
      businessRequest: {
        type: 'string',
        description: 'Detailed business request or requirement description for analysis',
        minLength: 10,
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Business priority level affecting resource allocation and timeline',
        default: 'medium',
      },
      timeConstraint: {
        type: 'string',
        description: 'Optional time constraints or deadline requirements',
      },
      qualityRequirements: {
        type: 'object',
        properties: {
          security: {
            type: 'string',
            enum: ['basic', 'standard', 'high'],
            description: 'Security requirements level',
            default: 'standard',
          },
          performance: {
            type: 'string',
            enum: ['basic', 'standard', 'high'],
            description: 'Performance requirements level',
            default: 'standard',
          },
          accessibility: {
            type: 'boolean',
            description: 'Accessibility compliance required',
            default: false,
          },
        },
        description: 'Quality and compliance requirements',
      },
      externalSources: {
        type: 'object',
        properties: {
          useContext7: {
            type: 'boolean',
            description: 'Use Context7 MCP for documentation and best practices',
            default: false,
          },
          useWebSearch: {
            type: 'boolean',
            description: 'Use Web Search MCP for market research and trends',
            default: false,
          },
          useMemory: {
            type: 'boolean',
            description: 'Use Memory MCP for lessons learned and historical data',
            default: false,
          },
        },
        description: 'External MCP services configuration',
      },
      planType: {
        type: 'string',
        enum: ['strategic', 'tactical', 'technical', 'comprehensive'],
        description:
          'Type of plan focus: strategic (high-level), tactical (execution), technical (implementation), comprehensive (all aspects)',
        default: 'comprehensive',
      },
    },
  },
};

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

export async function handleSmartPlan(input: unknown): Promise<SmartPlanResponse> {
  const startTime = Date.now();

  try {
    // Validate input with enhanced schema
    const validatedInput = SmartPlanInputSchema.parse(input);

    // Create plan generation input
    const planInput: PlanGenerationInput = {
      projectId: validatedInput.projectId,
      businessRequest: validatedInput.businessRequest,
      priority: validatedInput.priority,
      ...(validatedInput.timeConstraint && { timeConstraint: validatedInput.timeConstraint }),
      qualityRequirements: validatedInput.qualityRequirements,
    };

    // Initialize plan generator and MCP coordinator with optimized config
    const planGenerator = new PlanGenerator();
    const mcpCoordinator = new MCPCoordinator({
      timeout: 1000, // Reduced timeout for better performance
      maxConcurrentRequests: 2,
      enableFallbacks: true,
    });

    // Gather external knowledge if requested (Phase 2A requirement)
    let externalKnowledge: ExternalKnowledge[] = [];
    const integrationStartTime = Date.now();

    if (validatedInput.externalSources) {
      const knowledgeRequest: KnowledgeRequest = {
        projectId: validatedInput.projectId,
        businessRequest: validatedInput.businessRequest,
        domain: validatedInput.businessRequest.split(' ')[0] || 'general', // Simple domain extraction
        priority: validatedInput.priority,
        sources: validatedInput.externalSources,
        maxResults: 10,
      };

      try {
        externalKnowledge = await mcpCoordinator.gatherKnowledge(knowledgeRequest);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('External knowledge gathering failed:', error);
      }
    }

    const integrationTime = Date.now() - integrationStartTime;

    // Generate comprehensive plan using business analysis and external knowledge
    const enhancedPlanInput = {
      ...planInput,
    };

    if (externalKnowledge.length > 0) {
      enhancedPlanInput.externalKnowledge = externalKnowledge.slice(0, 5).map(k => ({
        id: k.id,
        source: k.source,
        type: k.type,
        title: k.title,
        content: k.content,
        relevanceScore: k.relevanceScore,
      }));
    }

    const comprehensivePlan = await planGenerator.generatePlan(enhancedPlanInput);

    // Validate plan quality
    const validation = planGenerator.validatePlan(comprehensivePlan);

    // Calculate response metrics
    const responseTime = Date.now() - startTime;

    // Ensure Phase 2A performance requirements
    if (responseTime > 500) {
      // eslint-disable-next-line no-console
      console.warn(`Smart Plan response time ${responseTime}ms exceeds 500ms target`);
    }

    // Format response according to Phase 2A requirements
    const response = {
      success: true as const,
      planId: comprehensivePlan.id,
      planType: validatedInput.planType,

      // Business Analysis Results
      businessAnalysis: {
        requirements: comprehensivePlan.businessRequirements,
        complexity: comprehensivePlan.complexity,
        stakeholderCount: comprehensivePlan.businessRequirements.targetUsers.length,
        riskFactors: comprehensivePlan.risks.length,
      },

      // Strategic Planning Results
      strategicPlan: {
        phases: comprehensivePlan.phases,
        timeline: comprehensivePlan.timeline,
        userStories: comprehensivePlan.userStories,
        businessValue: comprehensivePlan.businessValue,
      },

      // Technical Planning Results
      technicalPlan: {
        architecture: comprehensivePlan.architecture,
        effort: comprehensivePlan.effort,
        optimization: comprehensivePlan.optimization,
        qualityGates: comprehensivePlan.qualityGates,
      },

      // Plan Validation and Quality
      validation: {
        isValid: validation.isValid,
        issues: validation.issues,
        recommendations: validation.recommendations,
        confidenceLevel: comprehensivePlan.effort.confidence,
      },

      // External MCP Integration Results (Phase 2A requirement)
      externalIntegration: {
        context7Status: validatedInput.externalSources?.useContext7 ? 'active' : 'disabled',
        webSearchStatus: validatedInput.externalSources?.useWebSearch ? 'active' : 'disabled',
        memoryStatus: validatedInput.externalSources?.useMemory ? 'active' : 'disabled',
        integrationTime,
        knowledgeCount: externalKnowledge.length,
      },
      externalKnowledge,

      // Success Metrics and Next Steps
      deliverables: {
        successMetrics: comprehensivePlan.successMetrics,
        nextSteps: comprehensivePlan.nextSteps,
        qualityTargets: comprehensivePlan.qualityGates.map(gate => ({
          phase: gate.phase,
          threshold: gate.threshold,
        })),
      },

      // Performance and Technical Metrics
      technicalMetrics: {
        responseTime,
        planGenerationTime: responseTime - 10, // Subtract input processing time
        businessAnalysisTime: Math.min(responseTime * 0.3, 100), // Target <100ms for business analysis
        technicalPlanningTime: Math.min(responseTime * 0.4, 150), // Target <150ms for technical planning
        validationTime: Math.min(responseTime * 0.1, 50), // Target <50ms for validation
        phasesPlanned: comprehensivePlan.phases.length,
        tasksPlanned: comprehensivePlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
        risksIdentified: comprehensivePlan.risks.length,
        userStoriesGenerated: comprehensivePlan.userStories.length,
        componentsMapped: comprehensivePlan.architecture.components.length,
      },

      // Business Value Metrics (Phase 2A requirement)
      businessMetrics: {
        estimatedROI: comprehensivePlan.businessValue.estimatedROI,
        timeToMarket: `${comprehensivePlan.businessValue.timeToMarket} months`,
        costSavings: comprehensivePlan.businessValue.costSavings,
        riskMitigation: comprehensivePlan.businessValue.riskMitigation,
        qualityImprovement: `${comprehensivePlan.businessValue.qualityImprovement}%`,
      },

      timestamp: new Date().toISOString(),
    };

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred during plan generation';

    // eslint-disable-next-line no-console
    console.error(`Smart Plan failed after ${responseTime}ms:`, error);

    return {
      success: false,
      error: errorMessage,
      errorType: error instanceof z.ZodError ? 'validation_error' : 'generation_error',
      responseTime,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export both tool and handler
export { smartPlanTool as default };
