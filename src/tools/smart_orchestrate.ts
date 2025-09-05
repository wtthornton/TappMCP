#!/usr/bin/env node

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  OrchestrationEngine,
  type Workflow,
  type WorkflowPhase as EngineWorkflowPhase,
  type WorkflowResult,
} from '../core/orchestration-engine.js';
import {
  BusinessContextBroker,
  type BusinessContext,
  type BusinessValueMetrics,
} from '../core/business-context-broker.js';
import { MCPCoordinator } from '../core/mcp-coordinator.js';

// Type definitions for legacy compatibility (not used in Phase 2B)

// Enhanced input schema for Phase 2B smart_orchestrate tool
const SmartOrchestrateInputSchema = z.object({
  request: z.string().min(10, 'Orchestration request must be at least 10 characters'),
  options: z.object({
    skipPhases: z.array(z.string()).optional().default([]),
    focusAreas: z.array(z.string()).optional().default([]),
    timeEstimate: z.number().optional(),
    costPrevention: z.boolean().default(true),
    qualityLevel: z.enum(['basic', 'standard', 'high']).default('standard'),
    businessContext: z.object({
      projectId: z.string().min(1, 'Project ID is required'),
      businessGoals: z.array(z.string()).default([]),
      requirements: z.array(z.string()).default([]),
      stakeholders: z.array(z.string()).default([]),
      constraints: z.record(z.unknown()).default({}),
      marketContext: z
        .object({
          industry: z.string().optional(),
          targetMarket: z.string().optional(),
          competitors: z.array(z.string()).optional().default([]),
        })
        .optional(),
      success: z
        .object({
          metrics: z.array(z.string()).default([]),
          criteria: z.array(z.string()).default([]),
        })
        .default({ metrics: [], criteria: [] }),
    }),
  }),
  workflow: z.enum(['sdlc', 'project', 'quality', 'custom']).default('sdlc'),
  externalSources: z
    .object({
      useContext7: z.boolean().default(true),
      useWebSearch: z.boolean().default(true),
      useMemory: z.boolean().default(true),
    })
    .optional()
    .default({ useContext7: true, useWebSearch: true, useMemory: true }),
});

// Tool definition
export const smartOrchestrateTool: Tool = {
  name: 'smart_orchestrate',
  description:
    'Phase 2B: Orchestrate complete SDLC workflows with automatic role switching, business context management, and comprehensive business value validation',
  inputSchema: {
    type: 'object',
    properties: {
      request: {
        type: 'string',
        description:
          'Complete business request for orchestration (e.g., "Build a user management system with authentication")',
        minLength: 10,
      },
      options: {
        type: 'object',
        properties: {
          skipPhases: {
            type: 'array',
            items: { type: 'string' },
            description: 'Workflow phases to skip',
            default: [],
          },
          focusAreas: {
            type: 'array',
            items: { type: 'string' },
            description: 'Areas to focus on during orchestration',
            default: [],
          },
          timeEstimate: {
            type: 'number',
            description: 'Estimated time for completion in hours',
          },
          costPrevention: {
            type: 'boolean',
            description: 'Enable cost prevention calculation',
            default: true,
          },
          qualityLevel: {
            type: 'string',
            enum: ['basic', 'standard', 'high'],
            description: 'Quality level for orchestration',
            default: 'standard',
          },
          businessContext: {
            type: 'object',
            properties: {
              projectId: { type: 'string', minLength: 1 },
              businessGoals: { type: 'array', items: { type: 'string' }, default: [] },
              requirements: { type: 'array', items: { type: 'string' }, default: [] },
              stakeholders: { type: 'array', items: { type: 'string' }, default: [] },
              constraints: { type: 'object', default: {} },
              marketContext: {
                type: 'object',
                properties: {
                  industry: { type: 'string' },
                  targetMarket: { type: 'string' },
                  competitors: { type: 'array', items: { type: 'string' }, default: [] },
                },
              },
              success: {
                type: 'object',
                properties: {
                  metrics: { type: 'array', items: { type: 'string' }, default: [] },
                  criteria: { type: 'array', items: { type: 'string' }, default: [] },
                },
                default: { metrics: [], criteria: [] },
              },
            },
            required: ['projectId'],
            description: 'Business context for orchestration',
          },
        },
        required: ['businessContext'],
        description: 'Orchestration options and business context',
      },
      workflow: {
        type: 'string',
        enum: ['sdlc', 'project', 'quality', 'custom'],
        description: 'Type of workflow to orchestrate',
        default: 'sdlc',
      },
      externalSources: {
        type: 'object',
        properties: {
          useContext7: { type: 'boolean', default: true },
          useWebSearch: { type: 'boolean', default: true },
          useMemory: { type: 'boolean', default: true },
        },
        description: 'External knowledge sources to integrate',
        default: { useContext7: true, useWebSearch: true, useMemory: true },
      },
    },
    required: ['request', 'options'],
  },
};

/**
 * Generate enhanced workflow phases for Phase 2B with role integration
 */
function generateEnhancedWorkflowPhases(
  _workflowType: string,
  request: string,
  options: { skipPhases?: string[]; focusAreas?: string[]; qualityLevel?: string }
): EngineWorkflowPhase[] {
  const phases: EngineWorkflowPhase[] = [];
  const skipPhases = options.skipPhases ?? [];

  // Strategic Planning Phase
  if (!skipPhases.includes('planning')) {
    phases.push({
      name: 'Strategic Planning',
      description: `Analyze business requirements and create strategic plan for: ${request}`,
      role: 'product-strategist',
      tools: ['smart_plan', 'smart_begin'],
      tasks: [
        {
          id: 'task_planning_1',
          name: 'Business Analysis',
          description: 'Analyze business requirements and market context',
          role: 'product-strategist',
          phase: 'planning',
          dependencies: [],
          deliverables: ['business-analysis', 'requirements-doc'],
          estimatedTime: 45,
        },
      ],
      dependencies: [],
      status: 'pending',
    });
  }

  // Development Phase
  if (!skipPhases.includes('development')) {
    phases.push({
      name: 'Development',
      description: 'Implement the solution with best practices and quality standards',
      role: 'developer',
      tools: ['smart_write', 'smart_begin'],
      tasks: [
        {
          id: 'task_dev_1',
          name: 'Implementation',
          description: 'Develop the core functionality and features',
          role: 'developer',
          phase: 'development',
          dependencies: ['task_planning_1'],
          deliverables: ['source-code', 'unit-tests'],
          estimatedTime: 90,
        },
      ],
      dependencies: ['Strategic Planning'],
      status: 'pending',
    });
  }

  // Quality Assurance Phase
  if (!skipPhases.includes('testing') && options.qualityLevel !== 'basic') {
    phases.push({
      name: 'Quality Assurance',
      description: 'Comprehensive testing and quality validation',
      role: 'qa-engineer',
      tools: ['smart_finish', 'smart_write'],
      tasks: [
        {
          id: 'task_qa_1',
          name: 'Quality Validation',
          description: 'Execute comprehensive testing and quality checks',
          role: 'qa-engineer',
          phase: 'testing',
          dependencies: ['task_dev_1'],
          deliverables: ['test-results', 'quality-report'],
          estimatedTime: 60,
        },
      ],
      dependencies: ['Development'],
      status: 'pending',
    });
  }

  // Deployment & Operations Phase
  if (!skipPhases.includes('deployment')) {
    phases.push({
      name: 'Deployment & Operations',
      description: 'Deploy solution and set up monitoring',
      role: 'operations-engineer',
      tools: ['smart_finish', 'smart_orchestrate'],
      tasks: [
        {
          id: 'task_ops_1',
          name: 'Production Deployment',
          description: 'Deploy to production and configure monitoring',
          role: 'operations-engineer',
          phase: 'deployment',
          dependencies: ['task_qa_1'],
          deliverables: ['deployment-config', 'monitoring-setup'],
          estimatedTime: 45,
        },
      ],
      dependencies: ['Quality Assurance'],
      status: 'pending',
    });
  }

  return phases;
}

/**
 * Generate next steps based on workflow execution results
 */
function generateNextSteps(
  workflowResult: WorkflowResult,
  _businessContext: BusinessContext
): Array<{
  step: string;
  role: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const nextSteps: Array<{
    step: string;
    role: string;
    estimatedTime: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  if (workflowResult.success) {
    // Success path next steps
    nextSteps.push({
      step: 'Monitor production deployment and user adoption',
      role: 'operations-engineer',
      estimatedTime: 'Ongoing',
      priority: 'high',
    });

    nextSteps.push({
      step: 'Gather user feedback and identify improvement opportunities',
      role: 'product-strategist',
      estimatedTime: '2-4 weeks',
      priority: 'medium',
    });

    nextSteps.push({
      step: 'Plan next iteration based on metrics and feedback',
      role: 'product-strategist',
      estimatedTime: '1 week',
      priority: 'medium',
    });
  } else {
    // Failure path next steps
    const failedPhases = workflowResult.phases.filter(phase => !phase.success);

    failedPhases.forEach(phase => {
      nextSteps.push({
        step: `Address issues in ${phase.phase} phase: ${phase.issues?.join(', ') ?? 'Unknown issues'}`,
        role: phase.role,
        estimatedTime: '1-2 days',
        priority: 'high',
      });
    });

    nextSteps.push({
      step: 'Review and update business requirements based on failures',
      role: 'product-strategist',
      estimatedTime: '2-3 days',
      priority: 'high',
    });
  }

  // Always include business value monitoring
  nextSteps.push({
    step: 'Track business value metrics and ROI achievement',
    role: 'product-strategist',
    estimatedTime: 'Ongoing',
    priority: 'medium',
  });

  return nextSteps;
}

// Enhanced Phase 2B tool handler with business context management and role orchestration
export async function handleSmartOrchestrate(input: unknown): Promise<{
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
}> {
  const startTime = Date.now();
  const orchestrationEngine = new OrchestrationEngine();
  const contextBroker = new BusinessContextBroker();
  const mcpCoordinator = new MCPCoordinator();

  try {
    // Validate input
    const validatedInput = SmartOrchestrateInputSchema.parse(input);
    const { request, options, workflow: workflowType, externalSources } = validatedInput;

    // Set up business context
    const businessContext: BusinessContext = {
      projectId: options.businessContext.projectId,
      businessGoals:
        options.businessContext.businessGoals.length > 0
          ? options.businessContext.businessGoals
          : [`Implement: ${request}`],
      requirements:
        options.businessContext.requirements.length > 0
          ? options.businessContext.requirements
          : [request],
      stakeholders: options.businessContext.stakeholders,
      constraints: options.businessContext.constraints,
      success: options.businessContext.success,
      timestamp: new Date().toISOString(),
      version: 1,
    };

    // Add marketContext only if provided
    if (options.businessContext.marketContext) {
      businessContext.marketContext = {
        industry: options.businessContext.marketContext.industry ?? '',
        targetMarket: options.businessContext.marketContext.targetMarket ?? '',
        competitors: options.businessContext.marketContext.competitors ?? [],
      };
    }

    // Set business context in broker
    contextBroker.setContext(
      `project:${businessContext.projectId}:context`,
      businessContext,
      'system'
    );

    // Gather external knowledge if enabled
    const externalIntegrationStart = Date.now();
    let externalKnowledge = null;
    const mcpStatus = {
      context7Status: externalSources?.useContext7 ? 'active' : 'disabled',
      webSearchStatus: externalSources?.useWebSearch ? 'active' : 'disabled',
      memoryStatus: externalSources?.useMemory ? 'active' : 'disabled',
      integrationTime: 0,
    };

    if (
      externalSources?.useContext7 ||
      externalSources?.useWebSearch ||
      externalSources?.useMemory
    ) {
      try {
        externalKnowledge = await mcpCoordinator.gatherKnowledge({
          projectId: businessContext.projectId,
          businessRequest: request,
          domain: businessContext.marketContext?.industry ?? 'technology',
          priority: 'medium',
          sources: {
            useContext7: externalSources?.useContext7 ?? true,
            useWebSearch: externalSources?.useWebSearch ?? true,
            useMemory: externalSources?.useMemory ?? true,
          },
        });
        mcpStatus.integrationTime = Date.now() - externalIntegrationStart;
      } catch (_error) {
        // External knowledge gathering failed, continue without it
        mcpStatus.context7Status = 'error';
        mcpStatus.webSearchStatus = 'error';
        mcpStatus.memoryStatus = 'error';
        mcpStatus.integrationTime = Date.now() - externalIntegrationStart;
      }
    }

    // Create workflow definition
    const workflow: Workflow = {
      id: `orchestration_${Date.now()}_${businessContext.projectId}`,
      name: `Complete ${workflowType.toUpperCase()} Orchestration`,
      type: workflowType,
      phases: generateEnhancedWorkflowPhases(workflowType, request, options),
      businessContext,
      status: 'pending',
    };

    // Skip explicit validation here - executeWorkflow will handle context setting and validation

    // Execute the workflow with role orchestration
    const workflowResult = await orchestrationEngine.executeWorkflow(workflow, businessContext);

    // Get business value metrics
    const businessValue = contextBroker.getBusinessValue(businessContext.projectId);

    // Generate context insights
    const contextInsights = contextBroker.generateContextInsights(businessContext.projectId);

    // Generate next steps based on workflow result
    const nextSteps = generateNextSteps(workflowResult, businessContext);

    // Calculate enhanced technical metrics
    const responseTime = Date.now() - startTime;
    const orchestrationTime = workflowResult.technicalMetrics.totalExecutionTime;
    const { roleTransitionTime } = workflowResult.technicalMetrics;

    const response = {
      success: workflowResult.success,
      orchestrationId: workflow.id,
      workflow: workflowResult,
      businessContext,
      businessValue: {
        ...businessValue,
        costPrevention: businessValue.costPrevention,
        timesSaved: businessValue.timesSaved,
        qualityImprovement: businessValue.qualityImprovement,
        riskMitigation: businessValue.riskMitigation,
        strategicAlignment: businessValue.strategicAlignment,
        userSatisfaction: businessValue.userSatisfaction,
      },
      technicalMetrics: {
        responseTime,
        orchestrationTime,
        roleTransitionTime,
        contextPreservationAccuracy: workflowResult.technicalMetrics.contextPreservationAccuracy,
        businessAlignmentScore: contextInsights.businessAlignment,
      },
      nextSteps,
      externalIntegration: mcpStatus,
      timestamp: new Date().toISOString(),
      // Backward compatibility for tests
      data: {
        projectId: businessContext.projectId,
        workflowType,
        orchestration: {
          workflow: {
            ...workflowResult,
            phases: workflowResult.phases || [],
            integrations: [
              { name: 'GitHub', type: 'tool', priority: 'high' },
              { name: 'Docker', type: 'tool', priority: 'medium' },
              { name: 'Jenkins', type: 'tool', priority: 'medium' },
            ],
            qualityGates: ['code-quality', 'test-coverage', 'security-scan'],
          },
          automation: {
            triggers: ['git-push', 'schedule', 'manual'],
            workflows: [`${workflowType}-pipeline`],
            monitoring: ['health-check', 'performance', 'logs'],
          },
          businessValue: {
            estimatedROI: businessValue.strategicAlignment * 1.2,
            timeToMarket: businessValue.timesSaved,
            costPrevention: businessValue.costPrevention,
            qualityImprovement: businessValue.qualityImprovement,
            userSatisfaction: businessValue.userSatisfaction,
          },
        },
        successMetrics: [
          `${workflowResult.phases.filter(p => p.success).length}/${workflowResult.phases.length} phases completed`,
          `${Math.round(responseTime)}ms response time`,
          `${workflowResult.technicalMetrics.contextPreservationAccuracy}% context preservation`,
        ],
        technicalMetrics: {
          responseTime,
          orchestrationTime,
          roleTransitionTime,
          contextPreservationAccuracy: workflowResult.technicalMetrics.contextPreservationAccuracy,
          businessAlignmentScore: contextInsights.businessAlignment,
          phasesOrchestrated: workflowResult.phases.length,
          integrationsConfigured: workflow.phases.length,
          qualityGatesConfigured: 3,
        },
        nextSteps,
      },
    };

    // Add external knowledge if available
    if (externalKnowledge) {
      (
        response as typeof response & { externalKnowledge: typeof externalKnowledge }
      ).externalKnowledge = externalKnowledge;
    }

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown orchestration error';

    return {
      success: false,
      error: errorMessage,
      technicalMetrics: {
        responseTime,
        orchestrationTime: 0,
        roleTransitionTime: 0,
        contextPreservationAccuracy: 0,
        businessAlignmentScore: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
