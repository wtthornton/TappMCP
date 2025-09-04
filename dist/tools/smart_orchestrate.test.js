"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_orchestrate_1 = require("./smart_orchestrate");
(0, vitest_1.describe)('smart_orchestrate tool', () => {
    (0, vitest_1.describe)('tool definition', () => {
        (0, vitest_1.it)('should have correct name and description', () => {
            (0, vitest_1.expect)(smart_orchestrate_1.smartOrchestrateTool.name).toBe('smart_orchestrate');
            (0, vitest_1.expect)(smart_orchestrate_1.smartOrchestrateTool.description).toContain('Orchestrate complete development workflow');
        });
        (0, vitest_1.it)('should have proper input schema', () => {
            (0, vitest_1.expect)(smart_orchestrate_1.smartOrchestrateTool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(smart_orchestrate_1.smartOrchestrateTool.inputSchema.type).toBe('object');
            (0, vitest_1.expect)(smart_orchestrate_1.smartOrchestrateTool.inputSchema.properties).toBeDefined();
        });
    });
    (0, vitest_1.describe)('handleSmartOrchestrate', () => {
        (0, vitest_1.it)('should successfully orchestrate workflow with minimal input', async () => {
            const input = {
                projectId: 'proj_123_test',
                workflowType: 'full-development',
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBe('proj_123_test');
            (0, vitest_1.expect)(result.data?.orchestration).toBeDefined();
            (0, vitest_1.expect)(result.data?.successMetrics).toBeDefined();
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(result.data?.technicalMetrics).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should successfully orchestrate comprehensive workflow', async () => {
            const input = {
                projectId: 'proj_456_full',
                workflowType: 'full-development',
                orchestrationScope: {
                    includePlanning: true,
                    includeDevelopment: true,
                    includeTesting: true,
                    includeDeployment: true,
                    includeMonitoring: true,
                },
                externalIntegrations: [
                    { name: 'GitHub', type: 'api', priority: 'high' },
                    { name: 'Docker', type: 'tool', priority: 'medium' },
                    { name: 'AWS', type: 'service', priority: 'low' },
                ],
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    performanceScore: 85,
                },
                businessRequirements: {
                    roiTarget: 300,
                    costPrevention: 25000,
                    timeSaved: 8,
                    userSatisfaction: 95,
                },
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBe('proj_456_full');
            (0, vitest_1.expect)(result.data?.workflowType).toBe('full-development');
            (0, vitest_1.expect)(result.data?.orchestration.workflow).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.automation).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.businessValue).toBeDefined();
        });
        (0, vitest_1.it)('should generate different workflow types', async () => {
            const workflowTypes = ['full-development', 'feature-development', 'maintenance', 'migration'];
            for (const workflowType of workflowTypes) {
                const input = {
                    projectId: `proj_${workflowType}`,
                    workflowType,
                };
                const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.workflowType).toBe(workflowType);
            }
        });
        (0, vitest_1.it)('should generate workflow phases', async () => {
            const input = {
                projectId: 'proj_phases',
                workflowType: 'full-development',
                orchestrationScope: {
                    includePlanning: true,
                    includeDevelopment: true,
                    includeTesting: true,
                },
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.workflow.phases).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.orchestration.workflow.phases)).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.workflow.phases.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should configure external integrations', async () => {
            const input = {
                projectId: 'proj_integrations',
                workflowType: 'full-development',
                externalIntegrations: [
                    { name: 'GitHub', type: 'api', priority: 'high' },
                    { name: 'Docker', type: 'tool', priority: 'medium' },
                    { name: 'AWS', type: 'service', priority: 'low' },
                ],
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.workflow.integrations).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.workflow.integrations.length).toBe(3);
        });
        (0, vitest_1.it)('should configure quality gates', async () => {
            const input = {
                projectId: 'proj_gates',
                workflowType: 'full-development',
                qualityGates: {
                    testCoverage: 95,
                    securityScore: 98,
                    performanceScore: 90,
                },
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.workflow.qualityGates).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.orchestration.workflow.qualityGates)).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should generate automation configuration', async () => {
            const input = {
                projectId: 'proj_automation',
                workflowType: 'full-development',
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.automation).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.automation.triggers).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.automation.workflows).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.automation.monitoring).toBeDefined();
        });
        (0, vitest_1.it)('should calculate business value', async () => {
            const input = {
                projectId: 'proj_business',
                workflowType: 'full-development',
                businessRequirements: {
                    roiTarget: 400,
                    costPrevention: 30000,
                    timeSaved: 12,
                    userSatisfaction: 98,
                },
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.orchestration.businessValue).toBeDefined();
            (0, vitest_1.expect)(result.data?.orchestration.businessValue.estimatedROI).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.orchestration.businessValue.timeToMarket).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.orchestration.businessValue.costPrevention).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.orchestration.businessValue.qualityImprovement).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.orchestration.businessValue.userSatisfaction).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should generate success metrics', async () => {
            const input = {
                projectId: 'proj_metrics',
                workflowType: 'full-development',
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.successMetrics).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.successMetrics)).toBe(true);
            (0, vitest_1.expect)(result.data?.successMetrics.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should calculate technical metrics', async () => {
            const input = {
                projectId: 'proj_tech',
                workflowType: 'full-development',
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.orchestrationTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.phasesOrchestrated).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.integrationsConfigured).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.qualityGatesConfigured).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            const input = {
                projectId: '', // Invalid empty ID
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(input));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(invalidInput));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Required');
        });
    });
});
//# sourceMappingURL=smart_orchestrate.test.js.map
