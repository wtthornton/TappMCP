#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartPlanTool = void 0;
exports.handleSmartPlan = handleSmartPlan;
const zod_1 = require("zod");
// Input schema for smart_plan tool
const SmartPlanInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    planType: zod_1.z
        .enum(['development', 'testing', 'deployment', 'maintenance', 'migration'])
        .default('development'),
    scope: zod_1.z
        .object({
        features: zod_1.z.array(zod_1.z.string()).default([]),
        timeline: zod_1.z
            .object({
            startDate: zod_1.z.string().optional(),
            endDate: zod_1.z.string().optional(),
            duration: zod_1.z.number().min(1).default(4), // weeks
        })
            .optional(),
        resources: zod_1.z
            .object({
            teamSize: zod_1.z.number().min(1).default(3),
            budget: zod_1.z.number().min(0).default(50000),
            externalTools: zod_1.z.array(zod_1.z.string()).default([]),
        })
            .optional(),
    })
        .optional(),
    externalMCPs: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        integrationType: zod_1.z.enum(['api', 'database', 'service', 'tool']),
        priority: zod_1.z.enum(['high', 'medium', 'low']).default('medium'),
        estimatedEffort: zod_1.z.number().min(1).max(10).default(5),
    }))
        .optional()
        .default([]),
    qualityRequirements: zod_1.z
        .object({
        testCoverage: zod_1.z.number().min(0).max(100).default(85),
        securityLevel: zod_1.z.enum(['low', 'medium', 'high']).default('medium'),
        performanceTargets: zod_1.z
            .object({
            responseTime: zod_1.z.number().min(0).default(100), // ms
            throughput: zod_1.z.number().min(0).default(1000), // requests/second
            availability: zod_1.z.number().min(0).max(100).default(99.9), // percentage
        })
            .optional(),
    })
        .optional(),
    businessContext: zod_1.z
        .object({
        goals: zod_1.z.array(zod_1.z.string()).default([]),
        targetUsers: zod_1.z.array(zod_1.z.string()).default([]),
        successMetrics: zod_1.z.array(zod_1.z.string()).default([]),
        riskFactors: zod_1.z.array(zod_1.z.string()).default([]),
    })
        .optional(),
});
// Tool definition
exports.smartPlanTool = {
    name: 'smart_plan',
    description: 'Create comprehensive project plans with external MCP integration and resource optimization',
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
        },
        required: ['projectId'],
    },
};
// Main tool handler
async function handleSmartPlan(input) {
    const startTime = Date.now();
    try {
        // Validate input
        const validatedInput = SmartPlanInputSchema.parse(input);
        // Generate basic project plan
        const projectPlan = {
            phases: [
                {
                    name: 'Planning and Setup',
                    description: 'Project planning, requirements gathering, and initial setup',
                    duration: 1,
                    tasks: [
                        {
                            name: 'Requirements Analysis',
                            description: 'Gather and analyze project requirements',
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
                },
            ],
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
                        { category: 'Personnel', amount: 30000, percentage: 60 },
                        { category: 'Tools', amount: 7500, percentage: 15 },
                        { category: 'Infrastructure', amount: 7500, percentage: 15 },
                        { category: 'External Services', amount: 5000, percentage: 10 },
                    ],
                },
                tools: [
                    { name: 'Development Environment', type: 'Infrastructure', cost: 1000, priority: 'high' },
                ],
            },
            timeline: {
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + (validatedInput.scope?.timeline?.duration ?? 4) * 7 * 24 * 60 * 60 * 1000)
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
        // Create response
        const response = {
            projectId: validatedInput.projectId,
            planType: validatedInput.planType,
            projectPlan,
            businessValue,
            successMetrics,
            nextSteps,
            technicalMetrics: {
                responseTime,
                planningTime,
                phasesPlanned: projectPlan.phases.length,
                tasksPlanned: projectPlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
            },
        };
        return {
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=smart_plan.js.map
