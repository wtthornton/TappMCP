import { z } from 'zod';
import {
  MCPTool,
  type MCPToolConfig,
  type MCPToolContext,
  type MCPToolResult,
} from '../framework/mcp-tool.js';
import {
  OrchestrationEngine,
  type Workflow,
  type WorkflowPhase as EngineWorkflowPhase,
  type WorkflowResult,
} from '../core/orchestration-engine.js';
import { BusinessContextBroker, type BusinessContext } from '../core/business-context-broker.js';
import { MCPCoordinator } from '../core/mcp-coordinator.js';

// Input schema for smart-orchestrate tool
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

// Output schema for smart-orchestrate tool
const SmartOrchestrateOutputSchema = z.object({
  orchestrationId: z.string(),
  workflow: z.object({
    success: z.boolean(),
    phases: z.array(z.any()),
    technicalMetrics: z.object({
      totalExecutionTime: z.number(),
      roleTransitionTime: z.number(),
      contextPreservationAccuracy: z.number(),
    }),
  }),
  businessContext: z.object({
    projectId: z.string(),
    businessGoals: z.array(z.string()),
    requirements: z.array(z.string()),
    stakeholders: z.array(z.string()),
    constraints: z.record(z.unknown()),
    marketContext: z
      .object({
        industry: z.string(),
        targetMarket: z.string(),
        competitors: z.array(z.string()),
      })
      .optional(),
    success: z.object({
      metrics: z.array(z.string()),
      criteria: z.array(z.string()),
    }),
    timestamp: z.string(),
    version: z.number(),
  }),
  businessValue: z.object({
    costPrevention: z.number(),
    timesSaved: z.number(),
    qualityImprovement: z.number(),
    riskMitigation: z.array(z.string()),
    strategicAlignment: z.number(),
    userSatisfaction: z.number(),
  }),
  technicalMetrics: z.object({
    responseTime: z.number(),
    orchestrationTime: z.number(),
    roleTransitionTime: z.number(),
    contextPreservationAccuracy: z.number(),
    businessAlignmentScore: z.number(),
  }),
  nextSteps: z.array(
    z.object({
      step: z.string(),
      role: z.string(),
      estimatedTime: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  externalIntegration: z.object({
    context7Status: z.string(),
    webSearchStatus: z.string(),
    memoryStatus: z.string(),
    integrationTime: z.number(),
  }),
  data: z.object({
    projectId: z.string(),
    workflowType: z.string(),
    orchestration: z.object({
      workflow: z.object({
        phases: z.array(z.any()),
        integrations: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            priority: z.string(),
          })
        ),
        qualityGates: z.array(z.string()),
      }),
      automation: z.object({
        triggers: z.array(z.string()),
        workflows: z.array(z.string()),
        monitoring: z.array(z.string()),
      }),
      businessValue: z.object({
        estimatedROI: z.number(),
        timeToMarket: z.number(),
        costPrevention: z.number(),
        qualityImprovement: z.number(),
        userSatisfaction: z.number(),
      }),
    }),
    successMetrics: z.array(z.string()),
    technicalMetrics: z.object({
      responseTime: z.number(),
      orchestrationTime: z.number(),
      roleTransitionTime: z.number(),
      contextPreservationAccuracy: z.number(),
      businessAlignmentScore: z.number(),
      phasesOrchestrated: z.number(),
      integrationsConfigured: z.number(),
      qualityGatesConfigured: z.number(),
    }),
    nextSteps: z.array(
      z.object({
        step: z.string(),
        role: z.string(),
        estimatedTime: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
      })
    ),
  }),
});

type SmartOrchestrateInput = z.infer<typeof SmartOrchestrateInputSchema>;
type SmartOrchestrateOutput = z.infer<typeof SmartOrchestrateOutputSchema>;

// Tool configuration
const config: MCPToolConfig = {
  name: 'smart_orchestrate',
  description:
    'Phase 2B: Orchestrate complete SDLC workflows with automatic role switching, business context management, and comprehensive business value validation',
  version: '1.0.0',
  inputSchema: SmartOrchestrateInputSchema,
  outputSchema: SmartOrchestrateOutputSchema,
};

/**
 * Smart Orchestrate MCP Tool
 * Orchestrates complete SDLC workflows with role switching and business context management
 */
export class SmartOrchestrateMCPTool extends MCPTool<
  SmartOrchestrateInput,
  SmartOrchestrateOutput
> {
  private orchestrationEngine: OrchestrationEngine;
  private contextBroker: BusinessContextBroker;
  private mcpCoordinator: MCPCoordinator;

  constructor() {
    super(config);
    this.orchestrationEngine = new OrchestrationEngine();
    this.contextBroker = new BusinessContextBroker();
    this.mcpCoordinator = new MCPCoordinator();
  }

  /**
   * Execute the smart orchestrate tool
   */
  async execute(
    input: SmartOrchestrateInput,
    _context?: MCPToolContext
  ): Promise<MCPToolResult<SmartOrchestrateOutput>> {
    return super.execute(input, _context);
  }

  /**
   * Process the smart orchestrate logic
   */
  protected async executeInternal(
    input: SmartOrchestrateInput,
    _context?: MCPToolContext
  ): Promise<SmartOrchestrateOutput> {
    const startTime = Date.now();
    const { request, options, workflow: workflowType, externalSources } = input;

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
    this.contextBroker.setContext(
      `project:${businessContext.projectId}:context`,
      businessContext,
      'system'
    );

    // Gather external knowledge if enabled
    const externalIntegrationStart = Date.now();
    let _externalKnowledge = null;
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
        _externalKnowledge = await this.mcpCoordinator.gatherKnowledge({
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
      phases: this.generateEnhancedWorkflowPhases(workflowType, request, options),
      businessContext,
      status: 'pending',
    };

    // Execute the workflow with role orchestration
    const workflowResult = await this.orchestrationEngine.executeWorkflow(
      workflow,
      businessContext
    );

    // Get business value metrics
    const businessValue = this.contextBroker.getBusinessValue(businessContext.projectId);

    // Generate context insights
    const contextInsights = this.contextBroker.generateContextInsights(businessContext.projectId);

    // Generate next steps based on workflow result
    const nextSteps = this.generateNextSteps(workflowResult, businessContext);

    // Calculate enhanced technical metrics
    const responseTime = Date.now() - startTime;
    const orchestrationTime = workflowResult.technicalMetrics.totalExecutionTime;
    const { roleTransitionTime } = workflowResult.technicalMetrics;

    return {
      orchestrationId: workflow.id,
      workflow: workflowResult,
      businessContext,
      businessValue: {
        ...businessValue,
        costPrevention: businessValue.costPrevention,
        timesSaved: businessValue.timesSaved,
        qualityImprovement: businessValue.qualityImprovement,
        riskMitigation: Array.isArray(businessValue.riskMitigation)
          ? businessValue.riskMitigation
          : [],
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
  }

  /**
   * Generate enhanced workflow phases for Phase 2B with role integration
   */
  private generateEnhancedWorkflowPhases(
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
  private generateNextSteps(
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
}
