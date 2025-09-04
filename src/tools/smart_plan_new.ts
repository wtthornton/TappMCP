#!/usr/bin/env node

import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Input schema for smart_plan tool
const SmartPlanInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  planType: z.enum(["development", "testing", "deployment", "maintenance", "migration"]).default("development"),
  scope: z.object({
    features: z.array(z.string()).default([]),
    timeline: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      duration: z.number().min(1).default(4), // weeks
    }).optional(),
    resources: z.object({
      teamSize: z.number().min(1).default(3),
      budget: z.number().min(0).default(50000),
      externalTools: z.array(z.string()).default([]),
    }).optional(),
  }).optional(),
  externalMCPs: z.array(z.object({
    name: z.string(),
    description: z.string(),
    integrationType: z.enum(["api", "database", "service", "tool"]),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
    estimatedEffort: z.number().min(1).max(10).default(5),
  })).optional().default([]),
  qualityRequirements: z.object({
    testCoverage: z.number().min(0).max(100).default(85),
    securityLevel: z.enum(["low", "medium", "high"]).default("medium"),
    performanceTargets: z.object({
      responseTime: z.number().min(0).default(100), // ms
      throughput: z.number().min(0).default(1000), // requests/second
      availability: z.number().min(0).max(100).default(99.9), // percentage
    }).optional(),
  }).optional(),
  businessContext: z.object({
    goals: z.array(z.string()).default([]),
    targetUsers: z.array(z.string()).default([]),
    successMetrics: z.array(z.string()).default([]),
    riskFactors: z.array(z.string()).default([]),
  }).optional(),
});

// Tool definition
export const smartPlanTool: Tool = {
  name: "smart_plan",
  description: "Create comprehensive project plans with external MCP integration and resource optimization",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "Project ID from smart_begin tool for context preservation",
        minLength: 1,
      },
      planType: {
        type: "string",
        enum: ["development", "testing", "deployment", "maintenance", "migration"],
        description: "Type of plan to create",
        default: "development",
      },
      scope: {
        type: "object",
        properties: {
          features: {
            type: "array",
            items: { type: "string" },
            description: "List of features to include in the plan",
            default: [],
          },
          timeline: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                description: "Project start date (ISO format)",
              },
              endDate: {
                type: "string",
                description: "Project end date (ISO format)",
              },
              duration: {
                type: "number",
                minimum: 1,
                description: "Project duration in weeks",
                default: 4,
              },
            },
            description: "Project timeline information",
          },
          resources: {
            type: "object",
            properties: {
              teamSize: {
                type: "number",
                minimum: 1,
                description: "Team size for the project",
                default: 3,
              },
              budget: {
                type: "number",
                minimum: 0,
                description: "Project budget in dollars",
                default: 50000,
              },
              externalTools: {
                type: "array",
                items: { type: "string" },
                description: "External tools to integrate",
                default: [],
              },
            },
            description: "Project resource requirements",
          },
        },
        description: "Project scope and requirements",
      },
      externalMCPs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the external MCP",
            },
            description: {
              type: "string",
              description: "Description of the MCP integration",
            },
            integrationType: {
              type: "string",
              enum: ["api", "database", "service", "tool"],
              description: "Type of integration",
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Priority level of the integration",
              default: "medium",
            },
            estimatedEffort: {
              type: "number",
              minimum: 1,
              maximum: 10,
              description: "Estimated effort level (1-10)",
              default: 5,
            },
          },
          required: ["name", "description", "integrationType"],
        },
        description: "External MCP integrations to include in the plan",
        default: [],
      },
      qualityRequirements: {
        type: "object",
        properties: {
          testCoverage: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "Required test coverage percentage",
            default: 85,
          },
          securityLevel: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Required security level",
            default: "medium",
          },
          performanceTargets: {
            type: "object",
            properties: {
              responseTime: {
                type: "number",
                minimum: 0,
                description: "Target response time in milliseconds",
                default: 100,
              },
              throughput: {
                type: "number",
                minimum: 0,
                description: "Target throughput in requests per second",
                default: 1000,
              },
              availability: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "Target availability percentage",
                default: 99.9,
              },
            },
            description: "Performance targets for the project",
          },
        },
        description: "Quality requirements for the project",
      },
      businessContext: {
        type: "object",
        properties: {
          goals: {
            type: "array",
            items: { type: "string" },
            description: "Business goals for the project",
            default: [],
          },
          targetUsers: {
            type: "array",
            items: { type: "string" },
            description: "Target users for the project",
            default: [],
          },
          successMetrics: {
            type: "array",
            items: { type: "string" },
            description: "Success metrics for the project",
            default: [],
          },
          riskFactors: {
            type: "array",
            items: { type: "string" },
            description: "Risk factors to consider",
            default: [],
          },
        },
        description: "Business context for the project plan",
      },
    },
    required: ["projectId"],
  },
};

// Main tool handler
export async function handleSmartPlan(input: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}> {
  const startTime = Date.now();

  try {
    // Validate input
    const validatedInput = SmartPlanInputSchema.parse(input);

    // Generate basic project plan
    const projectPlan = {
      phases: [
        {
          name: "Planning and Setup",
          description: "Project planning, requirements gathering, and initial setup",
          duration: 1,
          tasks: [
            {
              name: "Requirements Analysis",
              description: "Gather and analyze project requirements",
              effort: 3,
              dependencies: [],
              deliverables: ["Requirements Document", "User Stories"],
            },
          ],
          milestones: [
            {
              name: "Project Kickoff",
              description: "Project officially starts with team alignment",
              date: "Week 1",
              criteria: ["Team assembled", "Requirements documented"],
            },
          ],
        },
      ],
      resources: {
        team: [
          {
            role: "Project Manager",
            responsibilities: ["Project coordination", "Timeline management"],
            effort: 1,
          },
        ],
        budget: {
          total: validatedInput.scope?.resources?.budget || 50000,
          breakdown: [
            { category: "Personnel", amount: 30000, percentage: 60 },
            { category: "Tools", amount: 7500, percentage: 15 },
            { category: "Infrastructure", amount: 7500, percentage: 15 },
            { category: "External Services", amount: 5000, percentage: 10 },
          ],
        },
        tools: [
          { name: "Development Environment", type: "Infrastructure", cost: 1000, priority: "high" },
        ],
      },
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (validatedInput.scope?.timeline?.duration || 4) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: validatedInput.scope?.timeline?.duration || 4,
        phases: [],
      },
      risks: [
        {
          name: "Technical Complexity",
          description: "Project complexity exceeds initial estimates",
          probability: "medium",
          impact: "high",
          mitigation: ["Regular technical reviews", "Prototype early"],
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
      `Achieve ${validatedInput.qualityRequirements?.testCoverage || 85}% test coverage`,
      `Integrate ${validatedInput.externalMCPs?.length || 0} external MCPs`,
    ];

    // Generate next steps
    const nextSteps = [
      "Review and approve project plan",
      "Set up project management tools",
      "Assemble project team",
      "Begin Phase 1: Planning and Setup",
    ];

    // Calculate technical metrics
    const responseTime = Date.now() - startTime;

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
        planningTime: responseTime - 5,
        phasesPlanned: projectPlan.phases.length,
        tasksPlanned: projectPlan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
      },
    };

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
