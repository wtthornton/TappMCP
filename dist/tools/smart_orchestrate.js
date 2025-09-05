#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartOrchestrateTool = void 0;
exports.handleSmartOrchestrate = handleSmartOrchestrate;
const zod_1 = require("zod");
const orchestration_engine_js_1 = require("../core/orchestration-engine.js");
const business_context_broker_js_1 = require("../core/business-context-broker.js");
const mcp_coordinator_js_1 = require("../core/mcp-coordinator.js");
// Type definitions for legacy compatibility (not used in Phase 2B)
// Enhanced input schema for Phase 2B smart_orchestrate tool
const SmartOrchestrateInputSchema = zod_1.z.object({
    request: zod_1.z.string().min(10, 'Orchestration request must be at least 10 characters'),
    options: zod_1.z.object({
        skipPhases: zod_1.z.array(zod_1.z.string()).optional().default([]),
        focusAreas: zod_1.z.array(zod_1.z.string()).optional().default([]),
        timeEstimate: zod_1.z.number().optional(),
        costPrevention: zod_1.z.boolean().default(true),
        qualityLevel: zod_1.z.enum(['basic', 'standard', 'high']).default('standard'),
        businessContext: zod_1.z.object({
            projectId: zod_1.z.string().min(1, 'Project ID is required'),
            businessGoals: zod_1.z.array(zod_1.z.string()).default([]),
            requirements: zod_1.z.array(zod_1.z.string()).default([]),
            stakeholders: zod_1.z.array(zod_1.z.string()).default([]),
            constraints: zod_1.z.record(zod_1.z.unknown()).default({}),
            marketContext: zod_1.z.object({
                industry: zod_1.z.string().optional(),
                targetMarket: zod_1.z.string().optional(),
                competitors: zod_1.z.array(zod_1.z.string()).optional().default([]),
            }).optional(),
            success: zod_1.z.object({
                metrics: zod_1.z.array(zod_1.z.string()).default([]),
                criteria: zod_1.z.array(zod_1.z.string()).default([]),
            }).default({ metrics: [], criteria: [] }),
        }),
    }),
    workflow: zod_1.z.enum(['sdlc', 'project', 'quality', 'custom']).default('sdlc'),
    externalSources: zod_1.z.object({
        useContext7: zod_1.z.boolean().default(true),
        useWebSearch: zod_1.z.boolean().default(true),
        useMemory: zod_1.z.boolean().default(true),
    }).optional().default({ useContext7: true, useWebSearch: true, useMemory: true }),
});
// Tool definition
exports.smartOrchestrateTool = {
    name: 'smart_orchestrate',
    description: 'Phase 2B: Orchestrate complete SDLC workflows with automatic role switching, business context management, and comprehensive business value validation',
    inputSchema: {
        type: 'object',
        properties: {
            request: {
                type: 'string',
                description: 'Complete business request for orchestration (e.g., "Build a user management system with authentication")',
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
function generateEnhancedWorkflowPhases(_workflowType, request, options) {
    const phases = [];
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
                }
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
                }
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
                }
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
                }
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
function generateNextSteps(workflowResult, _businessContext) {
    const nextSteps = [];
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
    }
    else {
        // Failure path next steps
        const failedPhases = workflowResult.phases.filter((phase) => !phase.success);
        failedPhases.forEach((phase) => {
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
async function handleSmartOrchestrate(input) {
    const startTime = Date.now();
    const orchestrationEngine = new orchestration_engine_js_1.OrchestrationEngine();
    const contextBroker = new business_context_broker_js_1.BusinessContextBroker();
    const mcpCoordinator = new mcp_coordinator_js_1.MCPCoordinator();
    try {
        // Validate input
        const validatedInput = SmartOrchestrateInputSchema.parse(input);
        const { request, options, workflow: workflowType, externalSources } = validatedInput;
        // Set up business context
        const businessContext = {
            projectId: options.businessContext.projectId,
            businessGoals: options.businessContext.businessGoals.length > 0
                ? options.businessContext.businessGoals
                : [`Implement: ${request}`],
            requirements: options.businessContext.requirements.length > 0
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
        contextBroker.setContext(`project:${businessContext.projectId}:context`, businessContext, 'system');
        // Gather external knowledge if enabled
        const externalIntegrationStart = Date.now();
        let externalKnowledge = null;
        const mcpStatus = {
            context7Status: externalSources?.useContext7 ? 'active' : 'disabled',
            webSearchStatus: externalSources?.useWebSearch ? 'active' : 'disabled',
            memoryStatus: externalSources?.useMemory ? 'active' : 'disabled',
            integrationTime: 0,
        };
        if (externalSources?.useContext7 || externalSources?.useWebSearch || externalSources?.useMemory) {
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
            }
            catch (error) {
                // External knowledge gathering failed, continue without it
                mcpStatus.context7Status = 'error';
                mcpStatus.webSearchStatus = 'error';
                mcpStatus.memoryStatus = 'error';
                mcpStatus.integrationTime = Date.now() - externalIntegrationStart;
            }
        }
        // Create workflow definition
        const workflow = {
            id: `orchestration_${Date.now()}_${businessContext.projectId}`,
            name: `Complete ${workflowType.toUpperCase()} Orchestration`,
            type: workflowType,
            phases: generateEnhancedWorkflowPhases(workflowType, request, options),
            businessContext,
            status: 'pending',
        };
        // Validate workflow before execution
        const validation = orchestrationEngine.validateWorkflow(workflow);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Workflow validation failed: ${validation.issues.join(', ')}`,
                timestamp: new Date().toISOString(),
            };
        }
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
        const roleTransitionTime = workflowResult.technicalMetrics.roleTransitionTime;
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
        };
        // Add external knowledge if available
        if (externalKnowledge) {
            response.externalKnowledge = externalKnowledge;
        }
        return response;
    }
    catch (error) {
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
//# sourceMappingURL=smart_orchestrate.js.map