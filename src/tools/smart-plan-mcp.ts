#!/usr/bin/env node

import { z } from 'zod';
import { MCPTool, MCPToolConfig, MCPToolContext, MCPToolResult } from '../framework/mcp-tool.js';

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
      goals: z.array(z.string()).optional(),
      targetUsers: z.array(z.string()).optional(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
      riskTolerance: z.enum(['low', 'medium', 'high']).default('medium'),
    })
    .optional(),
});

// Output schema for smart_plan tool
const SmartPlanOutputSchema = z.object({
  planId: z.string(),
  projectPlan: z.object({
    phases: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        duration: z.number(),
        tasks: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            effort: z.number(),
            dependencies: z.array(z.string()),
            deliverables: z.array(z.string()),
            assignee: z.string().optional(),
            status: z.enum(['pending', 'in-progress', 'completed', 'blocked']).default('pending'),
          })
        ),
        milestones: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            dueDate: z.string(),
            successCriteria: z.array(z.string()),
            dependencies: z.array(z.string()),
          })
        ),
        risks: z.array(
          z.object({
            description: z.string(),
            impact: z.enum(['low', 'medium', 'high']),
            probability: z.enum(['low', 'medium', 'high']),
            mitigation: z.string(),
          })
        ),
      })
    ),
    timeline: z.object({
      startDate: z.string(),
      endDate: z.string(),
      totalDuration: z.number(),
      criticalPath: z.array(z.string()),
    }),
    resources: z.object({
      team: z.array(
        z.object({
          role: z.string(),
          name: z.string(),
          skills: z.array(z.string()),
          availability: z.number().min(0).max(100),
          cost: z.number(),
        })
      ),
      budget: z.object({
        total: z.number(),
        allocated: z.number(),
        remaining: z.number(),
        breakdown: z.record(z.number()),
      }),
      tools: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          cost: z.number(),
          necessity: z.enum(['required', 'recommended', 'optional']),
        })
      ),
    }),
    quality: z.object({
      testStrategy: z.object({
        unitTests: z.object({
          coverage: z.number(),
          framework: z.string(),
          estimatedEffort: z.number(),
        }),
        integrationTests: z.object({
          coverage: z.number(),
          framework: z.string(),
          estimatedEffort: z.number(),
        }),
        e2eTests: z.object({
          coverage: z.number(),
          framework: z.string(),
          estimatedEffort: z.number(),
        }),
      }),
      security: z.object({
        level: z.string(),
        requirements: z.array(z.string()),
        tools: z.array(z.string()),
        estimatedEffort: z.number(),
      }),
      performance: z.object({
        targets: z.object({
          responseTime: z.number(),
          throughput: z.number(),
          availability: z.number(),
        }),
        monitoring: z.array(z.string()),
        estimatedEffort: z.number(),
      }),
    }),
  }),
  businessValue: z.object({
    roi: z.number(),
    costBenefit: z.object({
      developmentCost: z.number(),
      maintenanceCost: z.number(),
      expectedSavings: z.number(),
      paybackPeriod: z.number(),
    }),
    riskAssessment: z.object({
      technicalRisks: z.array(z.string()),
      businessRisks: z.array(z.string()),
      mitigationStrategies: z.array(z.string()),
    }),
    successMetrics: z.array(
      z.object({
        metric: z.string(),
        target: z.string(),
        measurement: z.string(),
      })
    ),
  }),
  nextSteps: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// MCP Tool Configuration
const config: MCPToolConfig = {
  name: 'smart_plan',
  description:
    'Generate comprehensive project plans with timeline, resources, and quality requirements',
  version: '2.0.0',
  inputSchema: SmartPlanInputSchema,
  outputSchema: SmartPlanOutputSchema,
  timeout: 45000, // 45 seconds for complex planning
  retries: 1,
};

export type SmartPlanInput = z.infer<typeof SmartPlanInputSchema>;
export type SmartPlanOutput = z.infer<typeof SmartPlanOutputSchema>;

/**
 * Smart Plan MCP Tool
 *
 * Migrated to use MCPTool base class with enhanced error handling,
 * performance monitoring, and standardized patterns.
 */
export class SmartPlanMCPTool extends MCPTool<SmartPlanInput, SmartPlanOutput> {
  constructor() {
    super(config);
  }

  /**
   * Execute the smart plan tool
   */
  async execute(
    input: SmartPlanInput,
    _context?: MCPToolContext
  ): Promise<MCPToolResult<SmartPlanOutput>> {
    return super.execute(input, _context);
  }

  /**
   * Process the smart plan logic
   */
  protected async executeInternal(
    input: SmartPlanInput,
    _context?: MCPToolContext
  ): Promise<SmartPlanOutput> {
    // Generate plan ID
    const planId = this.generatePlanId(input.projectId, input.planType);

    // Generate project plan
    const projectPlan = this.generateProjectPlan(input);

    // Calculate business value
    const businessValue = this.calculateBusinessValue(input, projectPlan);

    // Generate next steps
    const nextSteps = this.generateNextSteps(input, projectPlan);

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, projectPlan);

    return {
      planId,
      projectPlan,
      businessValue,
      nextSteps,
      recommendations,
    };
  }

  /**
   * Generate unique plan ID
   */
  private generatePlanId(projectId: string, planType: string): string {
    const timestamp = Date.now();
    const cleanProjectId = projectId.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `plan_${cleanProjectId}_${planType}_${timestamp}`;
  }

  /**
   * Generate comprehensive project plan
   */
  private generateProjectPlan(input: SmartPlanInput): SmartPlanOutput['projectPlan'] {
    const { planType, scope, externalMCPs, qualityRequirements, businessContext } = input;

    // Generate phases based on plan type
    const phases = this.generatePhases(planType, scope, externalMCPs, qualityRequirements);

    // Calculate timeline
    const timeline = this.calculateTimeline(phases, scope?.timeline as any);

    // Allocate resources
    const resources = this.allocateResources(
      scope?.resources as any,
      timeline.totalDuration,
      businessContext
    );

    // Define quality requirements
    const quality = this.defineQualityRequirements(qualityRequirements, planType);

    return {
      phases,
      timeline,
      resources,
      quality,
    };
  }

  /**
   * Generate project phases
   */
  private generatePhases(
    planType: string,
    _scope: SmartPlanInput['scope'],
    externalMCPs: SmartPlanInput['externalMCPs'],
    _qualityRequirements: SmartPlanInput['qualityRequirements']
  ): SmartPlanOutput['projectPlan']['phases'] {
    const phases = [];

    switch (planType) {
      case 'development':
        phases.push(
          this.createPhase(
            'Planning and Setup',
            'Project planning, requirements gathering, and initial setup',
            1,
            [
              this.createTask(
                'Requirements Analysis',
                'Gather and analyze project requirements',
                3,
                [],
                ['Requirements Document', 'User Stories']
              ),
              this.createTask(
                'Technical Architecture',
                'Design system architecture and technical specifications',
                5,
                ['Requirements Analysis'],
                ['Architecture Document', 'Technical Specs']
              ),
              this.createTask(
                'Environment Setup',
                'Set up development, staging, and production environments',
                2,
                [],
                ['Environment Configs', 'CI/CD Pipeline']
              ),
            ],
            [
              this.createMilestone(
                'Project Kickoff',
                'Project officially starts with all stakeholders aligned',
                this.getDateString(0),
                ['Requirements Document', 'Architecture Document']
              ),
            ]
          ),
          this.createPhase(
            'Core Development',
            'Implement core features and functionality',
            3,
            [
              this.createTask(
                'Backend Development',
                'Implement server-side logic and APIs',
                8,
                ['Technical Architecture'],
                ['API Endpoints', 'Database Schema']
              ),
              this.createTask(
                'Frontend Development',
                'Implement user interface and client-side logic',
                6,
                ['Technical Architecture'],
                ['UI Components', 'User Flows']
              ),
              this.createTask(
                'Integration Development',
                'Integrate frontend and backend components',
                4,
                ['Backend Development', 'Frontend Development'],
                ['Integrated Features']
              ),
            ],
            [
              this.createMilestone(
                'MVP Complete',
                'Minimum viable product is ready for testing',
                this.getDateString(4),
                ['Core Features', 'Basic UI']
              ),
            ]
          ),
          this.createPhase(
            'Testing and Quality Assurance',
            'Comprehensive testing and quality validation',
            2,
            [
              this.createTask(
                'Unit Testing',
                'Write and execute unit tests for all components',
                3,
                ['Core Development'],
                ['Unit Test Suite', 'Test Coverage Report']
              ),
              this.createTask(
                'Integration Testing',
                'Test component interactions and data flow',
                2,
                ['Integration Development'],
                ['Integration Test Suite', 'Test Results']
              ),
              this.createTask(
                'User Acceptance Testing',
                'Validate features against user requirements',
                2,
                ['Integration Testing'],
                ['UAT Report', 'User Feedback']
              ),
            ],
            [
              this.createMilestone(
                'Quality Gate Passed',
                'All quality requirements met and validated',
                this.getDateString(6),
                ['Test Coverage', 'Quality Metrics']
              ),
            ]
          ),
          this.createPhase(
            'Deployment and Launch',
            'Deploy to production and launch the application',
            1,
            [
              this.createTask(
                'Production Deployment',
                'Deploy application to production environment',
                1,
                ['Quality Gate Passed'],
                ['Production Deployment', 'Monitoring Setup']
              ),
              this.createTask(
                'Launch Activities',
                'Execute launch strategy and user onboarding',
                1,
                ['Production Deployment'],
                ['Launch Plan', 'User Documentation']
              ),
            ],
            [
              this.createMilestone(
                'Production Launch',
                'Application is live and available to users',
                this.getDateString(7),
                ['Live Application', 'User Onboarding']
              ),
            ]
          )
        );
        break;

      case 'testing':
        phases.push(
          this.createPhase(
            'Test Planning',
            'Plan and design comprehensive testing strategy',
            1,
            [
              this.createTask(
                'Test Strategy Design',
                'Design overall testing approach and methodology',
                2,
                [],
                ['Test Strategy Document', 'Test Plan']
              ),
              this.createTask(
                'Test Environment Setup',
                'Set up testing environments and tools',
                1,
                [],
                ['Test Environment', 'Test Tools']
              ),
            ],
            [
              this.createMilestone(
                'Test Strategy Approved',
                'Testing approach is validated and approved',
                this.getDateString(1),
                ['Test Strategy Document']
              ),
            ]
          ),
          this.createPhase(
            'Test Execution',
            'Execute all planned tests and collect results',
            2,
            [
              this.createTask(
                'Automated Testing',
                'Run automated test suites and analyze results',
                3,
                ['Test Environment Setup'],
                ['Test Results', 'Bug Reports']
              ),
              this.createTask(
                'Manual Testing',
                'Perform manual testing and exploratory testing',
                2,
                ['Test Environment Setup'],
                ['Manual Test Results', 'User Scenarios']
              ),
            ],
            [
              this.createMilestone(
                'Testing Complete',
                'All tests executed and results analyzed',
                this.getDateString(3),
                ['Test Results', 'Quality Report']
              ),
            ]
          )
        );
        break;

      case 'deployment':
        phases.push(
          this.createPhase(
            'Deployment Planning',
            'Plan deployment strategy and prepare environments',
            1,
            [
              this.createTask(
                'Deployment Strategy',
                'Design deployment approach and rollback plan',
                2,
                [],
                ['Deployment Plan', 'Rollback Strategy']
              ),
              this.createTask(
                'Environment Preparation',
                'Prepare production and staging environments',
                1,
                [],
                ['Environment Setup', 'Configuration']
              ),
            ],
            [
              this.createMilestone(
                'Deployment Ready',
                'All systems ready for deployment',
                this.getDateString(1),
                ['Deployment Plan', 'Environment Setup']
              ),
            ]
          ),
          this.createPhase(
            'Deployment Execution',
            'Execute deployment and validate functionality',
            1,
            [
              this.createTask(
                'Production Deployment',
                'Deploy application to production',
                1,
                ['Deployment Ready'],
                ['Production Deployment', 'Health Checks']
              ),
              this.createTask(
                'Post-Deployment Validation',
                'Validate deployment and monitor system health',
                1,
                ['Production Deployment'],
                ['Validation Report', 'Monitoring Data']
              ),
            ],
            [
              this.createMilestone(
                'Deployment Complete',
                'Application successfully deployed and validated',
                this.getDateString(2),
                ['Live Application', 'Health Validation']
              ),
            ]
          )
        );
        break;

      case 'maintenance':
        phases.push(
          this.createPhase(
            'Maintenance Planning',
            'Plan ongoing maintenance activities',
            1,
            [
              this.createTask(
                'Maintenance Strategy',
                'Define maintenance approach and schedule',
                1,
                [],
                ['Maintenance Plan', 'Schedule']
              ),
              this.createTask(
                'Monitoring Setup',
                'Set up monitoring and alerting systems',
                1,
                [],
                ['Monitoring Dashboard', 'Alert Configuration']
              ),
            ],
            [
              this.createMilestone(
                'Maintenance Ready',
                'Maintenance systems and processes in place',
                this.getDateString(1),
                ['Maintenance Plan', 'Monitoring Setup']
              ),
            ]
          ),
          this.createPhase(
            'Ongoing Maintenance',
            'Execute regular maintenance activities',
            4,
            [
              this.createTask(
                'Regular Updates',
                'Apply security patches and updates',
                2,
                ['Maintenance Ready'],
                ['Update Log', 'Security Patches']
              ),
              this.createTask(
                'Performance Monitoring',
                'Monitor system performance and optimize',
                2,
                ['Maintenance Ready'],
                ['Performance Reports', 'Optimization Recommendations']
              ),
            ],
            [
              this.createMilestone(
                'Maintenance Cycle Complete',
                'First maintenance cycle completed successfully',
                this.getDateString(5),
                ['Maintenance Reports', 'System Health']
              ),
            ]
          )
        );
        break;

      case 'migration':
        phases.push(
          this.createPhase(
            'Migration Planning',
            'Plan migration strategy and prepare for transition',
            2,
            [
              this.createTask(
                'Migration Strategy',
                'Design migration approach and timeline',
                3,
                [],
                ['Migration Plan', 'Risk Assessment']
              ),
              this.createTask(
                'Data Analysis',
                'Analyze existing data and dependencies',
                2,
                [],
                ['Data Analysis Report', 'Dependency Map']
              ),
            ],
            [
              this.createMilestone(
                'Migration Plan Approved',
                'Migration strategy is validated and approved',
                this.getDateString(2),
                ['Migration Plan', 'Risk Assessment']
              ),
            ]
          ),
          this.createPhase(
            'Migration Execution',
            'Execute migration and validate results',
            3,
            [
              this.createTask(
                'Data Migration',
                'Migrate data to new system',
                4,
                ['Migration Plan Approved'],
                ['Data Migration Report', 'Validation Results']
              ),
              this.createTask(
                'System Migration',
                'Migrate application components',
                3,
                ['Data Migration'],
                ['System Migration Report', 'Integration Tests']
              ),
            ],
            [
              this.createMilestone(
                'Migration Complete',
                'Migration successfully completed and validated',
                this.getDateString(5),
                ['Migration Report', 'System Validation']
              ),
            ]
          )
        );
        break;
    }

    // Add external MCP integration tasks if specified
    if (externalMCPs && externalMCPs.length > 0) {
      const integrationPhase = this.createPhase(
        'External Integration',
        'Integrate with external MCPs and services',
        2,
        externalMCPs.map(mcp =>
          this.createTask(
            `Integrate ${mcp.name}`,
            `Integrate with ${mcp.description}`,
            mcp.estimatedEffort,
            [],
            [`${mcp.name} Integration`, 'API Documentation']
          )
        ),
        [
          this.createMilestone(
            'External Integration Complete',
            'All external MCPs successfully integrated',
            this.getDateString(phases.length + 1),
            ['Integration Reports', 'API Documentation']
          ),
        ]
      );
      phases.push(integrationPhase);
    }

    return phases;
  }

  /**
   * Create a project phase
   */
  private createPhase(
    name: string,
    description: string,
    duration: number,
    tasks: SmartPlanOutput['projectPlan']['phases'][0]['tasks'],
    milestones: SmartPlanOutput['projectPlan']['phases'][0]['milestones']
  ): SmartPlanOutput['projectPlan']['phases'][0] {
    return {
      name,
      description,
      duration,
      tasks,
      milestones,
      risks: this.generateRisks(name, duration),
    };
  }

  /**
   * Create a task
   */
  private createTask(
    name: string,
    description: string,
    effort: number,
    dependencies: string[],
    deliverables: string[],
    assignee?: string
  ): SmartPlanOutput['projectPlan']['phases'][0]['tasks'][0] {
    return {
      name,
      description,
      effort,
      dependencies,
      deliverables,
      assignee,
      status: 'pending',
    };
  }

  /**
   * Create a milestone
   */
  private createMilestone(
    name: string,
    description: string,
    dueDate: string,
    successCriteria: string[]
  ): SmartPlanOutput['projectPlan']['phases'][0]['milestones'][0] {
    return {
      name,
      description,
      dueDate,
      successCriteria,
      dependencies: [],
    };
  }

  /**
   * Generate risks for a phase
   */
  private generateRisks(
    _phaseName: string,
    duration: number
  ): SmartPlanOutput['projectPlan']['phases'][0]['risks'] {
    const risks = [
      {
        description: 'Resource availability issues',
        impact: 'medium' as const,
        probability: 'medium' as const,
        mitigation: 'Maintain backup resource list and cross-train team members',
      },
      {
        description: 'Technical complexity underestimated',
        impact: 'high' as const,
        probability: 'low' as const,
        mitigation: 'Conduct thorough technical analysis and include buffer time',
      },
    ];

    if (duration > 2) {
      risks.push({
        description: 'Scope creep during long phase',
        impact: 'medium' as const,
        probability: 'medium' as const,
        mitigation: 'Implement strict change control process and regular reviews',
      });
    }

    return risks;
  }

  /**
   * Calculate project timeline
   */
  private calculateTimeline(
    phases: SmartPlanOutput['projectPlan']['phases'],
    timelineInput?: SmartPlanInput['scope'] extends { timeline: any }
      ? SmartPlanInput['scope']['timeline']
      : undefined
  ): SmartPlanOutput['projectPlan']['timeline'] {
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    const startDate = timelineInput?.startDate ?? this.getDateString(0);
    const endDate = timelineInput?.endDate ?? this.getDateString(totalDuration);

    // Calculate critical path (simplified - just the longest phase)
    const criticalPath = phases
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 2)
      .map(phase => phase.name);

    return {
      startDate,
      endDate,
      totalDuration,
      criticalPath,
    };
  }

  /**
   * Allocate resources
   */
  private allocateResources(
    resourcesInput?: SmartPlanInput['scope'] extends { resources: any }
      ? SmartPlanInput['scope']['resources']
      : undefined,
    _duration: number,
    _businessContext?: SmartPlanInput['businessContext']
  ): SmartPlanOutput['projectPlan']['resources'] {
    const teamSize = resourcesInput?.teamSize ?? 3;
    const budget = resourcesInput?.budget ?? 50000;
    const externalTools = resourcesInput?.externalTools ?? [];

    // Generate team based on plan type and size
    const team = this.generateTeam(teamSize, _businessContext);

    // Calculate costs
    const teamCost = team.reduce((sum, member) => sum + member.cost, 0);
    const toolCost = externalTools.length * 1000; // $1000 per tool
    const totalCost = teamCost + toolCost;

    const budgetBreakdown = {
      'Team Costs': teamCost,
      'Tools & Licenses': toolCost,
      Infrastructure: totalCost * 0.2,
      Contingency: totalCost * 0.1,
    };

    return {
      team,
      budget: {
        total: budget,
        allocated: totalCost,
        remaining: budget - totalCost,
        breakdown: budgetBreakdown,
      },
      tools: externalTools.map((tool: any) => ({
        name: tool,
        type: 'External Service',
        cost: 1000,
        necessity: 'required' as const,
      })),
    };
  }

  /**
   * Generate team members
   */
  private generateTeam(
    size: number,
    _businessContext?: SmartPlanInput['businessContext']
  ): SmartPlanOutput['projectPlan']['resources']['team'] {
    const roles = ['Developer', 'QA Engineer', 'DevOps Engineer', 'Product Manager', 'Designer'];
    const skills = ['TypeScript', 'React', 'Node.js', 'Testing', 'CI/CD', 'AWS', 'Docker'];

    return Array.from({ length: size }, (_, i) => ({
      role: roles[i % roles.length],
      name: `Team Member ${i + 1}`,
      skills: skills.slice(0, 3 + (i % 3)),
      availability: 80 + (i % 20),
      cost: 5000 + i * 1000,
    }));
  }

  /**
   * Define quality requirements
   */
  private defineQualityRequirements(
    qualityRequirements?: SmartPlanInput['qualityRequirements'],
    _planType: string
  ): SmartPlanOutput['projectPlan']['quality'] {
    const testCoverage = qualityRequirements?.testCoverage ?? 85;
    const securityLevel = qualityRequirements?.securityLevel ?? 'medium';
    const performanceTargets = qualityRequirements?.performanceTargets ?? {
      responseTime: 100,
      throughput: 1000,
      availability: 99.9,
    };

    return {
      testStrategy: {
        unitTests: {
          coverage: testCoverage,
          framework: 'Vitest',
          estimatedEffort: 2,
        },
        integrationTests: {
          coverage: Math.max(70, testCoverage - 15),
          framework: 'Jest',
          estimatedEffort: 3,
        },
        e2eTests: {
          coverage: Math.max(50, testCoverage - 30),
          framework: 'Playwright',
          estimatedEffort: 4,
        },
      },
      security: {
        level: securityLevel,
        requirements: this.getSecurityRequirements(securityLevel),
        tools: this.getSecurityTools(securityLevel),
        estimatedEffort: securityLevel === 'high' ? 5 : securityLevel === 'medium' ? 3 : 1,
      },
      performance: {
        targets: performanceTargets,
        monitoring: [
          'Application Performance Monitoring',
          'Database Monitoring',
          'Infrastructure Monitoring',
        ],
        estimatedEffort: 2,
      },
    };
  }

  /**
   * Get security requirements based on level
   */
  private getSecurityRequirements(level: string): string[] {
    const baseRequirements = [
      'Input validation and sanitization',
      'Authentication and authorization',
      'HTTPS encryption',
    ];

    if (level === 'high') {
      return [
        ...baseRequirements,
        'Penetration testing',
        'Security audit',
        'Vulnerability scanning',
        'Data encryption at rest',
        'Multi-factor authentication',
      ];
    } else if (level === 'medium') {
      return [
        ...baseRequirements,
        'Regular security updates',
        'Access logging',
        'SQL injection prevention',
      ];
    }

    return baseRequirements;
  }

  /**
   * Get security tools based on level
   */
  private getSecurityTools(level: string): string[] {
    const baseTools = ['ESLint security rules', 'npm audit'];

    if (level === 'high') {
      return [...baseTools, 'OWASP ZAP', 'Snyk', 'SonarQube', 'Burp Suite'];
    } else if (level === 'medium') {
      return [...baseTools, 'Snyk', 'SonarQube'];
    }

    return baseTools;
  }

  /**
   * Calculate business value
   */
  private calculateBusinessValue(
    input: SmartPlanInput,
    projectPlan: SmartPlanOutput['projectPlan']
  ): SmartPlanOutput['businessValue'] {
    const budget = projectPlan.resources.budget.total;
    const _duration = projectPlan.timeline.totalDuration;

    // Calculate ROI based on plan type and duration
    let expectedSavings = 0;
    const developmentCost = budget;
    const maintenanceCost = budget * 0.2; // 20% of development cost

    switch (input.planType) {
      case 'development':
        expectedSavings = budget * 2.5; // 250% ROI
        break;
      case 'testing':
        expectedSavings = budget * 1.5; // 150% ROI
        break;
      case 'deployment':
        expectedSavings = budget * 3; // 300% ROI
        break;
      case 'maintenance':
        expectedSavings = budget * 1.2; // 120% ROI
        break;
      case 'migration':
        expectedSavings = budget * 2; // 200% ROI
        break;
    }

    const roi = ((expectedSavings - developmentCost) / developmentCost) * 100;
    const paybackPeriod = developmentCost / (expectedSavings / 12); // months

    return {
      roi,
      costBenefit: {
        developmentCost,
        maintenanceCost,
        expectedSavings,
        paybackPeriod,
      },
      riskAssessment: {
        technicalRisks: [
          'Technology stack complexity',
          'Integration challenges',
          'Performance bottlenecks',
        ],
        businessRisks: ['Market changes', 'Competitor actions', 'Regulatory changes'],
        mitigationStrategies: [
          'Regular technical reviews',
          'Agile development approach',
          'Continuous monitoring',
        ],
      },
      successMetrics: [
        {
          metric: 'On-time delivery',
          target: '90%',
          measurement: 'Milestone completion rate',
        },
        {
          metric: 'Quality score',
          target: '85%',
          measurement: 'Test coverage and defect rate',
        },
        {
          metric: 'Budget adherence',
          target: '95%',
          measurement: 'Actual vs planned costs',
        },
      ],
    };
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    input: SmartPlanInput,
    _projectPlan: SmartPlanOutput['projectPlan']
  ): string[] {
    const steps = [
      'Review and approve the project plan',
      'Set up project management tools and tracking',
      'Assign team members to specific tasks',
      'Schedule regular review meetings',
    ];

    if (input.planType === 'development') {
      steps.push('Set up development environments');
      steps.push('Create initial project repository');
      steps.push('Establish coding standards and guidelines');
    } else if (input.planType === 'testing') {
      steps.push('Set up test environments');
      steps.push('Configure testing tools and frameworks');
      steps.push('Create test data and scenarios');
    } else if (input.planType === 'deployment') {
      steps.push('Prepare production environments');
      steps.push('Set up monitoring and alerting');
      steps.push('Create deployment scripts');
    }

    return steps;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    input: SmartPlanInput,
    _projectPlan: SmartPlanOutput['projectPlan']
  ): string[] {
    const recommendations = [
      'Consider adding buffer time for unexpected delays',
      'Implement regular risk assessment reviews',
      'Establish clear communication channels',
    ];

    if (_projectPlan.timeline.totalDuration > 8) {
      recommendations.push('Consider breaking down into smaller phases for better manageability');
    }

    if (_projectPlan.resources.budget.remaining < 0) {
      recommendations.push('Review budget allocation - current plan exceeds available budget');
    }

    if (input.qualityRequirements?.securityLevel === 'high') {
      recommendations.push('Engage security experts early in the process');
    }

    return recommendations;
  }

  /**
   * Get date string for given weeks from now
   */
  private getDateString(weeksFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + weeksFromNow * 7);
    return date.toISOString().split('T')[0];
  }
}

// Export the tool instance for backward compatibility
export const smartPlanMCPTool = new SmartPlanMCPTool();

// Export the legacy handler for backward compatibility
export async function handleSmartPlan(input: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}> {
  const tool = new SmartPlanMCPTool();
  const result = await tool.execute(input as SmartPlanInput);

  return {
    success: result.success,
    data: result.data,
    error: result.error ?? undefined,
    timestamp: result.metadata.timestamp,
  };
}
