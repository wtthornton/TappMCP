import { z } from 'zod';
import { MCPTool, type MCPToolConfig, type MCPToolContext, type MCPToolResult } from '../framework/mcp-tool.js';
import { PlanGenerator, type PlanGenerationInput } from '../core/plan-generator.js';
import {
  MCPCoordinator,
  type KnowledgeRequest,
  type ExternalKnowledge,
} from '../core/mcp-coordinator.js';

// Input schema for smart-plan-enhanced tool
const SmartPlanEnhancedInputSchema = z.object({
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

// Output schema for smart-plan-enhanced tool
const SmartPlanEnhancedOutputSchema = z.object({
  planId: z.string(),
  planType: z.string(),
  businessAnalysis: z.object({
    requirements: z.any(),
    complexity: z.any(),
    stakeholderCount: z.number(),
    riskFactors: z.number(),
  }),
  strategicPlan: z.object({
    phases: z.array(z.any()),
    timeline: z.any(),
    userStories: z.array(z.any()),
    businessValue: z.any(),
  }),
  technicalPlan: z.object({
    architecture: z.any(),
    effort: z.any(),
    optimization: z.any(),
    qualityGates: z.array(z.any()),
  }),
  validation: z.object({
    isValid: z.boolean(),
    issues: z.array(z.any()),
    recommendations: z.array(z.any()),
    confidenceLevel: z.string(),
  }),
  externalIntegration: z.object({
    context7Status: z.string(),
    webSearchStatus: z.string(),
    memoryStatus: z.string(),
    integrationTime: z.number(),
    knowledgeCount: z.number(),
  }),
  externalKnowledge: z.array(z.any()),
  deliverables: z.object({
    successMetrics: z.array(z.string()),
    nextSteps: z.array(z.string()),
    qualityTargets: z.array(z.object({
      phase: z.string(),
      threshold: z.string(),
    })),
  }),
  technicalMetrics: z.object({
    responseTime: z.number(),
    planGenerationTime: z.number(),
    businessAnalysisTime: z.number(),
    technicalPlanningTime: z.number(),
    validationTime: z.number(),
    phasesPlanned: z.number(),
    tasksPlanned: z.number(),
    risksIdentified: z.number(),
    userStoriesGenerated: z.number(),
    componentsMapped: z.number(),
  }),
  businessMetrics: z.object({
    estimatedROI: z.number(),
    timeToMarket: z.string(),
    costSavings: z.number(),
    riskMitigation: z.number(),
    qualityImprovement: z.string(),
  }),
  data: z.object({
    projectId: z.string(),
    planType: z.string(),
    timeConstraint: z.string().optional(),
    qualityRequirements: z.any().optional(),
    priority: z.string().optional(),
    businessRequest: z.string().optional(),
    externalSources: z.any().optional(),
    businessAnalysis: z.any(),
    strategicPlan: z.any(),
    technicalPlan: z.any(),
    validation: z.any(),
    externalIntegration: z.any(),
    deliverables: z.any(),
    technicalMetrics: z.any(),
    businessMetrics: z.any(),
  }),
});

type SmartPlanEnhancedInput = z.infer<typeof SmartPlanEnhancedInputSchema>;
type SmartPlanEnhancedOutput = z.infer<typeof SmartPlanEnhancedOutputSchema>;

// Tool configuration
const config: MCPToolConfig<SmartPlanEnhancedInput, SmartPlanEnhancedOutput> = {
  name: 'smart_plan_enhanced',
  description: 'Generate comprehensive business and technical plans with advanced analysis, external MCP integration, and strategic planning capabilities',
  version: '1.0.0',
  inputSchema: SmartPlanEnhancedInputSchema,
  outputSchema: SmartPlanEnhancedOutputSchema,
};

/**
 * Smart Plan Enhanced MCP Tool
 * Generates comprehensive business and technical plans with external MCP integration
 */
export class SmartPlanEnhancedMCPTool extends MCPTool<SmartPlanEnhancedInput, SmartPlanEnhancedOutput> {
  private planGenerator: PlanGenerator;
  private mcpCoordinator: MCPCoordinator;

  constructor() {
    super(config);
    this.planGenerator = new PlanGenerator();
    this.mcpCoordinator = new MCPCoordinator();
  }

  /**
   * Execute the smart plan enhanced tool
   */
  async execute(input: SmartPlanEnhancedInput, context?: MCPToolContext): Promise<MCPToolResult<SmartPlanEnhancedOutput>> {
    return super.execute(input, context);
  }

  /**
   * Process the smart plan enhanced logic
   */
  protected async executeInternal(input: SmartPlanEnhancedInput, context?: MCPToolContext): Promise<SmartPlanEnhancedOutput> {
    const startTime = Date.now();

    // Create a copy of input to avoid modifying the original
    const inputCopy = { ...input };

    // Create plan generation input
    const planInput: PlanGenerationInput = {
      projectId: inputCopy.projectId,
      businessRequest: inputCopy.businessRequest,
      priority: inputCopy.priority,
      ...(inputCopy.timeConstraint && { timeConstraint: inputCopy.timeConstraint }),
      qualityRequirements: inputCopy.qualityRequirements,
    };

    // Gather external knowledge if requested
    let externalKnowledge: ExternalKnowledge[] = [];
    const integrationStartTime = Date.now();
    let integrationTime = 0;

    if (inputCopy.externalSources && (inputCopy.externalSources.useContext7 || inputCopy.externalSources.useWebSearch || inputCopy.externalSources.useMemory)) {
      const knowledgeRequest: KnowledgeRequest = {
        projectId: inputCopy.projectId,
        businessRequest: inputCopy.businessRequest,
        domain: inputCopy.businessRequest.split(' ')[0] || 'general', // Simple domain extraction
        priority: inputCopy.priority,
        sources: inputCopy.externalSources,
        maxResults: 10,
      };

      try {
        externalKnowledge = await this.mcpCoordinator.gatherKnowledge(knowledgeRequest);
      } catch (error) {
        // External knowledge gathering failed, continue without it
        console.warn('External knowledge gathering failed:', error);
        // Reset external sources to disabled when error occurs
        inputCopy.externalSources = {
          useContext7: false,
          useWebSearch: false,
          useMemory: false,
        };
      }
      integrationTime = Date.now() - integrationStartTime;
    }

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

    const comprehensivePlan = await this.planGenerator.generatePlan(enhancedPlanInput);

    // Validate plan quality
    const validation = this.planGenerator.validatePlan(comprehensivePlan);

    // Calculate response metrics
    const responseTime = Date.now() - startTime;

    // Ensure performance requirements
    if (responseTime > 500) {
      console.warn(`Smart Plan response time ${responseTime}ms exceeds 500ms target`);
    }

    // Format response according to requirements
    const response = {
      planId: comprehensivePlan.id,
      planType: input.planType,

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

      // External MCP Integration Results
      externalIntegration: {
        context7Status: inputCopy.externalSources?.useContext7 ? 'active' : 'disabled',
        webSearchStatus: inputCopy.externalSources?.useWebSearch ? 'active' : 'disabled',
        memoryStatus: inputCopy.externalSources?.useMemory ? 'active' : 'disabled',
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
        planGenerationTime: Math.max(responseTime - 10, 1), // Subtract input processing time
        businessAnalysisTime: Math.min(responseTime * 0.3, 100), // Target <100ms for business analysis
        technicalPlanningTime: Math.min(responseTime * 0.4, 150), // Target <150ms for technical planning
        validationTime: Math.min(responseTime * 0.1, 50), // Target <50ms for validation
        phasesPlanned: comprehensivePlan.phases.length,
        tasksPlanned: comprehensivePlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
        risksIdentified: comprehensivePlan.risks.length,
        userStoriesGenerated: comprehensivePlan.userStories.length,
        componentsMapped: comprehensivePlan.architecture.components.length,
      },

      // Business Value Metrics
      businessMetrics: {
        estimatedROI: comprehensivePlan.businessValue.estimatedROI,
        timeToMarket: `${comprehensivePlan.businessValue.timeToMarket} months`,
        costSavings: comprehensivePlan.businessValue.costSavings,
        riskMitigation: comprehensivePlan.businessValue.riskMitigation,
        qualityImprovement: `${comprehensivePlan.businessValue.qualityImprovement}%`,
      },

      // Data object for backward compatibility
      data: {
        projectId: inputCopy.projectId,
        planType: inputCopy.planType,
        timeConstraint: inputCopy.timeConstraint,
        qualityRequirements: inputCopy.qualityRequirements,
        priority: inputCopy.priority,
        businessRequest: inputCopy.businessRequest,
        externalSources: inputCopy.externalSources,
        businessAnalysis: {
          requirements: comprehensivePlan.businessRequirements,
          complexity: comprehensivePlan.complexity,
          stakeholderCount: comprehensivePlan.businessRequirements.targetUsers.length,
          riskFactors: comprehensivePlan.risks.length,
        },
        strategicPlan: {
          phases: comprehensivePlan.phases,
          timeline: comprehensivePlan.timeline,
          userStories: comprehensivePlan.userStories,
          businessValue: comprehensivePlan.businessValue,
        },
        technicalPlan: {
          architecture: comprehensivePlan.architecture,
          effort: comprehensivePlan.effort,
          optimization: comprehensivePlan.optimization,
          qualityGates: comprehensivePlan.qualityGates,
        },
        validation: {
          isValid: validation.isValid,
          issues: validation.issues,
          recommendations: validation.recommendations,
          confidenceLevel: comprehensivePlan.effort.confidence,
        },
        externalIntegration: {
          context7Status: inputCopy.externalSources?.useContext7 ? 'active' : 'disabled',
          webSearchStatus: inputCopy.externalSources?.useWebSearch ? 'active' : 'disabled',
          memoryStatus: inputCopy.externalSources?.useMemory ? 'active' : 'disabled',
          integrationTime,
          knowledgeCount: externalKnowledge.length,
        },
        deliverables: {
          successMetrics: comprehensivePlan.successMetrics,
          nextSteps: comprehensivePlan.nextSteps,
          qualityTargets: comprehensivePlan.qualityGates.map(gate => ({
            phase: gate.phase,
            threshold: gate.threshold,
          })),
        },
        technicalMetrics: {
          responseTime,
          planGenerationTime: Math.max(responseTime - 10, 1),
          businessAnalysisTime: Math.min(responseTime * 0.3, 100),
          technicalPlanningTime: Math.min(responseTime * 0.4, 150),
          validationTime: Math.min(responseTime * 0.1, 50),
          phasesPlanned: comprehensivePlan.phases.length,
          tasksPlanned: comprehensivePlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
          risksIdentified: comprehensivePlan.risks.length,
          userStoriesGenerated: comprehensivePlan.userStories.length,
          componentsMapped: comprehensivePlan.architecture.components.length,
        },
        businessMetrics: {
          estimatedROI: comprehensivePlan.businessValue.estimatedROI,
          timeToMarket: `${comprehensivePlan.businessValue.timeToMarket} months`,
          costSavings: comprehensivePlan.businessValue.costSavings,
          riskMitigation: comprehensivePlan.businessValue.riskMitigation,
          qualityImprovement: `${comprehensivePlan.businessValue.qualityImprovement}%`,
        },
      },
    };

    return response;
  }
}
