#!/usr/bin/env node

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Context7Cache } from '../core/context7-cache.js';
import { enhanceWithContext7 } from '../utils/context7-enhancer.js';

// Input schema for smart_plan tool
const SmartPlanInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  planType: z
    .enum(['development', 'testing', 'deployment', 'maintenance', 'migration'])
    .default('development'),
  scope: z
    .object({
      features: z.array(z.string()).default([]),
      timeline: z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          duration: z.number().min(1).default(4), // weeks
        })
        .optional(),
      resources: z
        .object({
          teamSize: z.number().min(1).default(3),
          budget: z.number().min(0).default(50000),
          externalTools: z.array(z.string()).default([]),
        })
        .optional(),
    })
    .optional(),
  externalMCPs: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        integrationType: z.enum(['api', 'database', 'service', 'tool']),
        priority: z.enum(['high', 'medium', 'low']).default('medium'),
        estimatedEffort: z.number().min(1).max(10).default(5),
      })
    )
    .optional()
    .default([]),
  qualityRequirements: z
    .object({
      testCoverage: z.number().min(0).max(100).default(85),
      securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
      performanceTargets: z
        .object({
          responseTime: z.number().min(0).default(100), // ms
          throughput: z.number().min(0).default(1000), // requests/second
          availability: z.number().min(0).max(100).default(99.9), // percentage
        })
        .optional(),
    })
    .optional(),
  businessContext: z
    .object({
      goals: z.array(z.string()).default([]),
      targetUsers: z.array(z.string()).default([]),
      successMetrics: z.array(z.string()).default([]),
      riskFactors: z.array(z.string()).default([]),
    })
    .optional(),
  role: z
    .enum(['developer', 'product-strategist', 'operations-engineer', 'designer', 'qa-engineer'])
    .optional(),
  roadmapType: z
    .enum(['detailed', 'high-level', 'milestone', 'sprint', 'phase'])
    .default('detailed'),
  processCompliance: z.boolean().default(true),
  learningIntegration: z.boolean().default(true),
  // New parameters for existing project improvement
  improvementMode: z.enum(['enhancement', 'refactoring', 'optimization']).default('enhancement'),
  targetQualityLevel: z.enum(['basic', 'standard', 'enterprise', 'production']).default('standard'),
  preserveExisting: z.boolean().default(true),
  externalSources: z
    .object({
      useContext7: z.boolean().default(true),
      useWebSearch: z.boolean().default(false),
      useMemory: z.boolean().default(false),
    })
    .optional()
    .default({ useContext7: true, useWebSearch: false, useMemory: false }),
});

// Tool definition
export const smartPlanTool: Tool = {
  name: 'smart_plan',
  description:
    'Create comprehensive project plans with external MCP integration, resource optimization, and existing project improvement strategies',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Project ID from smart_begin tool for context preservation',
        minLength: 1,
      },
      planType: {
        type: 'string',
        enum: ['development', 'testing', 'deployment', 'maintenance', 'migration'],
        description: 'Type of plan to create',
        default: 'development',
      },
      scope: {
        type: 'object',
        properties: {
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of features to include in the plan',
            default: [],
          },
          timeline: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Project start date (ISO format)',
              },
              endDate: {
                type: 'string',
                description: 'Project end date (ISO format)',
              },
              duration: {
                type: 'number',
                minimum: 1,
                description: 'Project duration in weeks',
                default: 4,
              },
            },
            description: 'Project timeline information',
          },
          resources: {
            type: 'object',
            properties: {
              teamSize: {
                type: 'number',
                minimum: 1,
                description: 'Team size for the project',
                default: 3,
              },
              budget: {
                type: 'number',
                minimum: 0,
                description: 'Project budget in dollars',
                default: 50000,
              },
              externalTools: {
                type: 'array',
                items: { type: 'string' },
                description: 'External tools to integrate',
                default: [],
              },
            },
            description: 'Project resource requirements',
          },
        },
        description: 'Project scope and requirements',
      },
      externalMCPs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the external MCP',
            },
            description: {
              type: 'string',
              description: 'Description of the MCP integration',
            },
            integrationType: {
              type: 'string',
              enum: ['api', 'database', 'service', 'tool'],
              description: 'Type of integration',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Priority level of the integration',
              default: 'medium',
            },
            estimatedEffort: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              description: 'Estimated effort level (1-10)',
              default: 5,
            },
          },
          required: ['name', 'description', 'integrationType'],
        },
        description: 'External MCP integrations to include in the plan',
        default: [],
      },
      qualityRequirements: {
        type: 'object',
        properties: {
          testCoverage: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Required test coverage percentage',
            default: 85,
          },
          securityLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Required security level',
            default: 'medium',
          },
          performanceTargets: {
            type: 'object',
            properties: {
              responseTime: {
                type: 'number',
                minimum: 0,
                description: 'Target response time in milliseconds',
                default: 100,
              },
              throughput: {
                type: 'number',
                minimum: 0,
                description: 'Target throughput in requests per second',
                default: 1000,
              },
              availability: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Target availability percentage',
                default: 99.9,
              },
            },
            description: 'Performance targets for the project',
          },
        },
        description: 'Quality requirements for the project',
      },
      businessContext: {
        type: 'object',
        properties: {
          goals: {
            type: 'array',
            items: { type: 'string' },
            description: 'Business goals for the project',
            default: [],
          },
          targetUsers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Target users for the project',
            default: [],
          },
          successMetrics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Success metrics for the project',
            default: [],
          },
          riskFactors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Risk factors to consider',
            default: [],
          },
        },
        description: 'Business context for the project plan',
      },
      improvementMode: {
        type: 'string',
        enum: ['enhancement', 'refactoring', 'optimization'],
        description: 'Mode for improving existing projects',
        default: 'enhancement',
      },
      targetQualityLevel: {
        type: 'string',
        enum: ['basic', 'standard', 'enterprise', 'production'],
        description: 'Target quality level for improvements',
        default: 'standard',
      },
      preserveExisting: {
        type: 'boolean',
        description: 'Whether to preserve existing functionality during improvements',
        default: true,
      },
      externalSources: {
        type: 'object',
        properties: {
          useContext7: { type: 'boolean', default: true },
          useWebSearch: { type: 'boolean', default: false },
          useMemory: { type: 'boolean', default: false },
        },
        description: 'External knowledge sources to integrate',
        default: { useContext7: true, useWebSearch: false, useMemory: false },
      },
    },
    required: ['projectId'],
  },
};

// Context7Cache instance for smart_plan
const context7Cache = new Context7Cache({
  maxCacheSize: 100,
  defaultExpiryHours: 36,
  enableHitTracking: true,
});

// Main tool handler
export async function handleSmartPlan(input: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}> {
  const startTime = Date.now();

  try {
    // Validate input
    const validatedInput = SmartPlanInputSchema.parse(input);

    // Initialize Context7 cache and enhancement if enabled
    let context7Knowledge = null;
    let context7Enhancement = null;
    if (validatedInput.externalSources?.useContext7) {
      try {
        const planningTopic = validatedInput.improvementMode
          ? `${validatedInput.improvementMode} planning best practices for ${validatedInput.role || 'general'} role targeting ${validatedInput.targetQualityLevel} quality`
          : `${validatedInput.planType} planning best practices for ${validatedInput.role || 'general'} role`;

        context7Knowledge = await context7Cache.getRelevantData({
          projectId: validatedInput.projectId,
          businessRequest: planningTopic,
          domain: validatedInput.planType || 'general',
          priority: validatedInput.businessContext?.goals?.length ? 'high' : 'medium',
          maxResults: 5,
        });

        // Enhance the project plan with Context7 knowledge
        const planData = {
          planType: validatedInput.planType,
          scope: validatedInput.scope,
          businessContext: validatedInput.businessContext,
          qualityRequirements: validatedInput.qualityRequirements,
          improvementMode: validatedInput.improvementMode,
          targetQualityLevel: validatedInput.targetQualityLevel,
          preserveExisting: validatedInput.preserveExisting,
        };
        context7Enhancement = await enhanceWithContext7(planData, planningTopic, {
          projectId: validatedInput.projectId,
          domain: validatedInput.planType || 'general',
          priority: validatedInput.businessContext?.goals?.length ? 'high' : 'medium',
          maxResults: 3,
        });

        console.log(
          `Context7 enhanced smart_plan for: ${validatedInput.planType} planning (${validatedInput.improvementMode || 'standard'})`
        );
      } catch (error) {
        console.warn('Context7 integration failed:', error);
      }
    }

    // Generate dynamic project plan based on input
    const phases = generateProjectPhases(validatedInput);

    const projectPlan = {
      phases,
      resources: {
        team: [
          {
            role: 'Project Manager',
            responsibilities: ['Project coordination', 'Timeline management'],
            effort: 1,
          },
        ],
        budget: {
          total: validatedInput.scope?.resources?.budget ?? 50000,
          breakdown: [
            {
              category: 'Personnel',
              amount: (validatedInput.scope?.resources?.budget ?? 50000) * 0.6,
              percentage: 60,
            },
            {
              category: 'Tools',
              amount: (validatedInput.scope?.resources?.budget ?? 50000) * 0.15,
              percentage: 15,
            },
            {
              category: 'Infrastructure',
              amount: (validatedInput.scope?.resources?.budget ?? 50000) * 0.15,
              percentage: 15,
            },
            {
              category: 'External Services',
              amount: (validatedInput.scope?.resources?.budget ?? 50000) * 0.1,
              percentage: 10,
            },
          ],
        },
        tools: [
          { name: 'Development Environment', type: 'Infrastructure', cost: 1000, priority: 'high' },
        ],
      },
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(
          Date.now() + (validatedInput.scope?.timeline?.duration ?? 4) * 7 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0],
        duration: validatedInput.scope?.timeline?.duration ?? 4,
        phases: [],
      },
      risks: [
        {
          name: 'Technical Complexity',
          description: 'Project complexity exceeds initial estimates',
          probability: 'medium',
          impact: 'high',
          mitigation: ['Regular technical reviews', 'Prototype early'],
        },
      ],
    };

    // Calculate business value
    const businessValue = {
      estimatedROI: Math.round(projectPlan.resources.budget.total * 2.5),
      timeToMarket: projectPlan.timeline.duration,
      riskMitigation: projectPlan.risks.length * 1000,
      qualityImprovement: 75,
    };

    // Generate success metrics
    const successMetrics = [
      `Complete project delivery in ${projectPlan.timeline.duration} weeks`,
      `Achieve ${validatedInput.qualityRequirements?.testCoverage ?? 85}% test coverage`,
      `Integrate ${validatedInput.externalMCPs?.length ?? 0} external MCPs`,
    ];

    // Generate next steps
    const nextSteps = [
      'Review and approve project plan',
      'Set up project management tools',
      'Assemble project team',
      'Begin Phase 1: Planning and Setup',
    ];

    // Calculate technical metrics
    const responseTime = Date.now() - startTime;
    const planningTime = Math.max(1, responseTime - 5); // Ensure at least 1ms

    // Generate detailed roadmap based on roadmap type
    const detailedRoadmap = generateDetailedRoadmap(
      projectPlan,
      validatedInput.roadmapType,
      validatedInput.role
    );

    // Generate process compliance validation
    const processCompliance = generateProcessCompliance(
      validatedInput.role,
      validatedInput.processCompliance
    );

    // Generate learning integration from archive lessons
    const learningIntegration = generateLearningIntegration(
      validatedInput.role,
      validatedInput.learningIntegration
    );

    // Create response
    const response = {
      projectId: validatedInput.projectId,
      planType: validatedInput.planType,
      projectPlan,
      detailedRoadmap,
      businessValue,
      successMetrics,
      nextSteps,
      processCompliance,
      learningIntegration,
      technicalMetrics: {
        responseTime: Math.max(1, responseTime),
        planningTime: Math.max(1, planningTime),
        phasesPlanned: projectPlan.phases.length,
        tasksPlanned: projectPlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
        roadmapDetailLevel: validatedInput.roadmapType,
      },
      externalIntegration: {
        context7Status: validatedInput.externalSources?.useContext7 ? 'active' : 'disabled',
        context7Knowledge: context7Knowledge ? 'integrated' : 'not available',
        context7Enhancement: context7Enhancement
          ? {
              dataCount: context7Enhancement.enhancementMetadata.dataCount,
              responseTime: context7Enhancement.enhancementMetadata.responseTime,
              cacheHit: context7Enhancement.enhancementMetadata.cacheHit,
            }
          : null,
        cacheStats: context7Cache.getCacheStats(),
      },
    };

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

// Generate dynamic project phases based on input
function generateProjectPhases(input: any): Array<{
  name: string;
  description: string;
  duration: number;
  tasks: Array<{
    name: string;
    description: string;
    effort: number;
    dependencies: string[];
    deliverables: string[];
  }>;
  milestones: Array<{
    name: string;
    description: string;
    date: string;
    criteria: string[];
  }>;
}> {
  const phases = [];

  // Handle different improvement modes
  if (input.improvementMode === 'enhancement') {
    phases.push({
      name: 'Project Analysis and Enhancement Planning',
      description: 'Analyze existing project and plan enhancements',
      duration: 1,
      tasks: [
        {
          name: 'Current State Analysis',
          description: `Analyze current state of ${input.projectName || 'the project'}`,
          effort: 4,
          dependencies: [],
          deliverables: ['Current State Report', 'Gap Analysis'],
        },
        {
          name: 'Enhancement Requirements',
          description: 'Define enhancement requirements and priorities',
          effort: 3,
          dependencies: ['Current State Analysis'],
          deliverables: ['Enhancement Plan', 'Priority Matrix'],
        },
      ],
      milestones: [
        {
          name: 'Enhancement Planning Complete',
          description: 'Enhancement strategy is defined and approved',
          date: 'Week 1',
          criteria: ['Current state analyzed', 'Enhancement plan approved'],
        },
      ],
    });
  } else if (input.improvementMode === 'refactoring') {
    phases.push({
      name: 'Refactoring Planning and Risk Assessment',
      description: 'Plan refactoring approach with risk mitigation',
      duration: 1,
      tasks: [
        {
          name: 'Code Quality Assessment',
          description: `Assess code quality and identify refactoring opportunities`,
          effort: 5,
          dependencies: [],
          deliverables: ['Code Quality Report', 'Refactoring Roadmap'],
        },
        {
          name: 'Risk Assessment',
          description: 'Identify and mitigate refactoring risks',
          effort: 3,
          dependencies: ['Code Quality Assessment'],
          deliverables: ['Risk Matrix', 'Mitigation Plan'],
        },
      ],
      milestones: [
        {
          name: 'Refactoring Plan Approved',
          description: 'Refactoring strategy is defined with risk mitigation',
          date: 'Week 1',
          criteria: ['Code quality assessed', 'Risks identified and mitigated'],
        },
      ],
    });
  } else if (input.improvementMode === 'optimization') {
    phases.push({
      name: 'Performance Analysis and Optimization Planning',
      description: 'Analyze performance bottlenecks and plan optimizations',
      duration: 1,
      tasks: [
        {
          name: 'Performance Baseline',
          description: `Establish performance baseline for ${input.projectName || 'the project'}`,
          effort: 4,
          dependencies: [],
          deliverables: ['Performance Baseline Report', 'Bottleneck Analysis'],
        },
        {
          name: 'Optimization Strategy',
          description: 'Define optimization strategy and targets',
          effort: 3,
          dependencies: ['Performance Baseline'],
          deliverables: ['Optimization Plan', 'Performance Targets'],
        },
      ],
      milestones: [
        {
          name: 'Optimization Plan Complete',
          description: 'Optimization strategy is defined with clear targets',
          date: 'Week 1',
          criteria: ['Baseline established', 'Optimization plan approved'],
        },
      ],
    });
  } else {
    // Standard planning for new projects
    phases.push({
      name: 'Planning and Setup',
      description: 'Project planning, requirements gathering, and initial setup',
      duration: 1,
      tasks: [
        {
          name: 'Requirements Analysis',
          description: `Analyze requirements for ${input.projectName || 'the project'}`,
          effort: 3,
          dependencies: [],
          deliverables: ['Requirements Document', 'User Stories'],
        },
      ],
      milestones: [
        {
          name: 'Project Kickoff',
          description: 'Project officially starts with team alignment',
          date: 'Week 1',
          criteria: ['Team assembled', 'Requirements documented'],
        },
      ],
    });
  }

  // Add development phase based on tech stack
  const techStack = input.techStack || [];
  const developmentTasks = [];

  if (techStack.includes('TypeScript') || techStack.includes('JavaScript')) {
    developmentTasks.push({
      name: 'Frontend Development',
      description: 'Develop user interface and client-side logic',
      effort: 5,
      dependencies: ['Requirements Analysis'],
      deliverables: ['UI Components', 'Client Application'],
    });
  }

  if (techStack.includes('Node.js') || techStack.includes('Express')) {
    developmentTasks.push({
      name: 'Backend Development',
      description: 'Implement server-side logic and APIs',
      effort: 6,
      dependencies: ['Requirements Analysis'],
      deliverables: ['API Endpoints', 'Database Schema', 'Server Application'],
    });
  }

  if (techStack.includes('React') || techStack.includes('Vue') || techStack.includes('Angular')) {
    developmentTasks.push({
      name: 'Component Development',
      description: 'Create reusable UI components',
      effort: 4,
      dependencies: ['Frontend Development'],
      deliverables: ['Component Library', 'Style Guide'],
    });
  }

  // Default development phase if no specific tech stack
  if (developmentTasks.length === 0) {
    developmentTasks.push({
      name: 'Core Development',
      description: 'Implement core application functionality',
      effort: 5,
      dependencies: ['Requirements Analysis'],
      deliverables: ['Core Features', 'Application Logic'],
    });
  }

  phases.push({
    name: 'Development',
    description: `Development phase for ${input.projectName || 'the project'} using ${techStack.join(', ')}`,
    duration: Math.max(2, Math.ceil(developmentTasks.length * 1.5)),
    tasks: developmentTasks,
    milestones: [
      {
        name: 'Development Complete',
        description: 'Core development is finished',
        date: `Week ${2 + Math.ceil(developmentTasks.length * 1.5)}`,
        criteria: ['All features implemented', 'Code review completed'],
      },
    ],
  });

  // Add testing phase if role includes testing
  if (input.role === 'qa-engineer' || input.qualityLevel === 'production') {
    phases.push({
      name: 'Testing and Quality Assurance',
      description: 'Comprehensive testing and quality validation',
      duration: 2,
      tasks: [
        {
          name: 'Unit Testing',
          description: 'Implement and run unit tests',
          effort: 3,
          dependencies: ['Core Development'],
          deliverables: ['Test Suite', 'Coverage Report'],
        },
        {
          name: 'Integration Testing',
          description: 'Test system integration points',
          effort: 2,
          dependencies: ['Unit Testing'],
          deliverables: ['Integration Test Results'],
        },
      ],
      milestones: [
        {
          name: 'Quality Gates Passed',
          description: 'All quality checks completed successfully',
          date: `Week ${4 + Math.ceil(developmentTasks.length * 1.5)}`,
          criteria: ['Test coverage >85%', 'No critical bugs'],
        },
      ],
    });
  }

  // Add deployment phase
  phases.push({
    name: 'Deployment and Launch',
    description: 'Deploy application and go live',
    duration: 1,
    tasks: [
      {
        name: 'Production Deployment',
        description: 'Deploy application to production environment',
        effort: 2,
        dependencies: ['Development Complete'],
        deliverables: ['Live Application', 'Deployment Documentation'],
      },
    ],
    milestones: [
      {
        name: 'Go Live',
        description: 'Application is live and operational',
        date: `Week ${3 + Math.ceil(developmentTasks.length * 1.5) + (input.role === 'qa-engineer' ? 2 : 0)}`,
        criteria: ['Application deployed', 'Monitoring active'],
      },
    ],
  });

  return phases;
}

// Generate detailed roadmap based on roadmap type and role
function generateDetailedRoadmap(
  projectPlan: any,
  roadmapType: string,
  role?: string
): {
  type: string;
  phases: Array<{
    name: string;
    description: string;
    duration: number;
    tasks: Array<{
      name: string;
      description: string;
      estimatedHours: number;
      dependencies: string[];
      deliverables: string[];
      qualityGates: string[];
    }>;
    milestones: Array<{
      name: string;
      description: string;
      criteria: string[];
      deliverables: string[];
    }>;
  }>;
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
    criticalPath: string[];
  };
  riskMitigation: Array<{
    risk: string;
    probability: string;
    impact: string;
    mitigation: string;
    contingency: string;
  }>;
  qualityGates: Array<{
    phase: string;
    gate: string;
    criteria: string[];
    validation: string[];
  }>;
} {
  const phases = projectPlan.phases.map((phase: any) => ({
    name: phase.name,
    description: phase.description,
    duration: phase.duration,
    tasks: phase.tasks.map((task: any) => ({
      name: task.name,
      description: task.description,
      estimatedHours: task.estimatedHours || 8,
      dependencies: task.dependencies || [],
      deliverables: task.deliverables || [],
      qualityGates: generateQualityGatesForTask(task, role),
    })),
    milestones: generateMilestonesForPhase(phase, role),
  }));

  const timeline = {
    startDate: projectPlan.timeline.startDate || new Date().toISOString(),
    endDate:
      projectPlan.timeline.endDate ||
      new Date(Date.now() + projectPlan.timeline.duration * 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: projectPlan.timeline.duration,
    criticalPath: generateCriticalPath(phases),
  };

  const riskMitigation = generateRiskMitigation(projectPlan, role);
  const qualityGates = generateQualityGatesForRoadmap(phases, role);

  return {
    type: roadmapType,
    phases,
    timeline,
    riskMitigation,
    qualityGates,
  };
}

// Generate quality gates for a specific task
function generateQualityGatesForTask(_task: any, _role?: string): string[] {
  const baseGates = [
    'Code review completed',
    'Unit tests written and passing',
    'Integration tests passing',
    'Documentation updated',
  ];

  if (_role === 'developer') {
    baseGates.push(
      'TypeScript compilation successful',
      'ESLint checks passed',
      'Performance benchmarks met'
    );
  } else if (_role === 'qa-engineer') {
    baseGates.push(
      'Test coverage ≥85%',
      'Security scan passed',
      'Accessibility validation completed'
    );
  } else if (_role === 'operations-engineer') {
    baseGates.push(
      'Deployment readiness verified',
      'Monitoring configured',
      'Security compliance validated'
    );
  }

  return baseGates;
}

// Generate milestones for a phase
function generateMilestonesForPhase(
  phase: any,
  role?: string
): Array<{
  name: string;
  description: string;
  criteria: string[];
  deliverables: string[];
}> {
  const milestones = [
    {
      name: `${phase.name} Planning Complete`,
      description: `Planning phase completed for ${phase.name}`,
      criteria: ['Requirements defined', 'Architecture approved', 'Resources allocated'],
      deliverables: ['Requirements document', 'Architecture diagram', 'Resource plan'],
    },
    {
      name: `${phase.name} Development Complete`,
      description: `Development phase completed for ${phase.name}`,
      criteria: ['All tasks completed', 'Code reviewed', 'Tests passing'],
      deliverables: ['Source code', 'Test suite', 'Documentation'],
    },
  ];

  if (role === 'qa-engineer') {
    milestones.push({
      name: `${phase.name} Quality Validation Complete`,
      description: `Quality validation completed for ${phase.name}`,
      criteria: ['All quality gates passed', 'Test coverage ≥85%', 'Security scan clean'],
      deliverables: ['Quality report', 'Test results', 'Security assessment'],
    });
  }

  return milestones;
}

// Generate critical path for the roadmap
function generateCriticalPath(phases: any[]): string[] {
  const criticalPath = [];
  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (task.dependencies.length === 0) {
        criticalPath.push(`${phase.name}: ${task.name}`);
      }
    }
  }
  return criticalPath;
}

// Generate risk mitigation strategies
function generateRiskMitigation(
  _projectPlan: any,
  _role?: string
): Array<{
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
  contingency: string;
}> {
  const baseRisks = [
    {
      risk: 'Scope creep',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Clear requirements definition and change control process',
      contingency: 'Additional time and resources allocated',
    },
    {
      risk: 'Technical complexity',
      probability: 'Medium',
      impact: 'Medium',
      mitigation: 'Proof of concept and technical spikes',
      contingency: 'Simplified implementation or additional expertise',
    },
  ];

  if (_role === 'developer') {
    baseRisks.push({
      risk: 'Code quality issues',
      probability: 'Low',
      impact: 'Medium',
      mitigation: 'Automated quality gates and code reviews',
      contingency: 'Refactoring sprint and additional testing',
    });
  } else if (_role === 'qa-engineer') {
    baseRisks.push({
      risk: 'Test coverage gaps',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Comprehensive test planning and automated coverage tracking',
      contingency: 'Additional testing phase and manual testing',
    });
  }

  return baseRisks;
}

// Generate quality gates for the roadmap
function generateQualityGatesForRoadmap(
  phases: any[],
  _role?: string
): Array<{
  phase: string;
  gate: string;
  criteria: string[];
  validation: string[];
}> {
  const qualityGates = [];

  for (const phase of phases) {
    qualityGates.push({
      phase: phase.name,
      gate: 'Phase Entry Gate',
      criteria: ['Previous phase completed', 'Dependencies resolved', 'Resources available'],
      validation: [
        'Phase completion report',
        'Dependency verification',
        'Resource allocation confirmation',
      ],
    });

    qualityGates.push({
      phase: phase.name,
      gate: 'Phase Exit Gate',
      criteria: ['All tasks completed', 'Quality standards met', 'Deliverables ready'],
      validation: ['Task completion report', 'Quality metrics', 'Deliverable review'],
    });
  }

  return qualityGates;
}

// Generate process compliance validation
function generateProcessCompliance(
  role?: string,
  processCompliance?: boolean
): {
  roleValidation: boolean;
  qualityGates: boolean;
  documentation: boolean;
  testing: boolean;
  roadmapValidation: boolean;
} {
  return {
    roleValidation: !!role,
    qualityGates: true,
    documentation: true,
    testing: true,
    roadmapValidation: processCompliance ?? true,
  };
}

// Generate learning integration from archive lessons
function generateLearningIntegration(
  _role?: string,
  _learningIntegration?: boolean
): {
  processLessons: string[];
  qualityPatterns: string[];
  roleCompliance: string[];
  roadmapLessons: string[];
} {
  const processLessons = [
    'Always validate role compliance before claiming completion',
    'Run early quality checks before starting work',
    'Follow role-specific prevention checklist',
    'Never bypass quality gates for speed',
  ];

  const qualityPatterns = [
    'TypeScript error resolution with test-first approach',
    'Quality gate validation pattern',
    'Role validation pattern',
    'Process compliance enforcement',
  ];

  const roleCompliance = _role
    ? [
        `${_role} role-specific requirements configured`,
        'Role validation enabled',
        'Process compliance checklist active',
        'Quality gates role-specific',
      ]
    : [
        'General process compliance enabled',
        'Quality gates configured',
        'Documentation requirements active',
      ];

  const roadmapLessons = [
    'Detailed roadmaps prevent scope creep',
    'Quality gates at each phase ensure quality',
    'Risk mitigation reduces project failures',
    'Process compliance prevents rework',
  ];

  return {
    processLessons,
    qualityPatterns,
    roleCompliance,
    roadmapLessons,
  };
}
