"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_plan_1 = require("./smart_plan");
(0, vitest_1.describe)('smart_plan tool', () => {
    (0, vitest_1.describe)('tool definition', () => {
        (0, vitest_1.it)('should have correct name and description', () => {
            (0, vitest_1.expect)(smart_plan_1.smartPlanTool.name).toBe('smart_plan');
            (0, vitest_1.expect)(smart_plan_1.smartPlanTool.description).toContain('AI-assisted project planning');
        });
        (0, vitest_1.it)('should have proper input schema', () => {
            (0, vitest_1.expect)(smart_plan_1.smartPlanTool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(smart_plan_1.smartPlanTool.inputSchema.type).toBe('object');
            (0, vitest_1.expect)(smart_plan_1.smartPlanTool.inputSchema.properties).toBeDefined();
        });
    });
    (0, vitest_1.describe)('handleSmartPlan', () => {
        (0, vitest_1.it)('should successfully create a project plan with minimal input', async () => {
            const input = {
                projectId: 'proj_123_test',
                planType: 'development',
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBe('proj_123_test');
            (0, vitest_1.expect)(result.data?.projectPlan).toBeDefined();
            (0, vitest_1.expect)(result.data?.businessValue).toBeDefined();
            (0, vitest_1.expect)(result.data?.successMetrics).toBeDefined();
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(result.data?.technicalMetrics).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should successfully create a comprehensive project plan', async () => {
            const input = {
                projectId: 'proj_456_full',
                planType: 'development',
                projectScope: {
                    phases: ['planning', 'development', 'testing', 'deployment'],
                    duration: 6,
                    complexity: 'high',
                },
                resources: {
                    team: [
                        { role: 'developer', count: 3, skills: ['typescript', 'react'] },
                        { role: 'designer', count: 1, skills: ['ui/ux', 'figma'] },
                    ],
                    budget: 200000,
                    tools: ['vscode', 'git', 'docker'],
                },
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    performanceScore: 85,
                },
                businessRequirements: {
                    roiTarget: 300,
                    timeToMarket: 6,
                    riskTolerance: 'medium',
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBe('proj_456_full');
            (0, vitest_1.expect)(result.data?.planType).toBe('development');
            (0, vitest_1.expect)(result.data?.projectPlan.phases).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.resources).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.timeline).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.risks).toBeDefined();
        });
        (0, vitest_1.it)('should generate different plan types', async () => {
            const planTypes = ['development', 'maintenance', 'migration', 'optimization'];
            for (const planType of planTypes) {
                const input = {
                    projectId: `proj_${planType}`,
                    planType,
                };
                const result = (await (0, smart_plan_1.handleSmartPlan)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.planType).toBe(planType);
            }
        });
        (0, vitest_1.it)('should generate project phases', async () => {
            const input = {
                projectId: 'proj_phases',
                planType: 'development',
                projectScope: {
                    phases: ['planning', 'development', 'testing', 'deployment'],
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.phases).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.projectPlan.phases)).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.phases.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should generate resource planning', async () => {
            const input = {
                projectId: 'proj_resources',
                planType: 'development',
                resources: {
                    team: [
                        { role: 'developer', count: 2, skills: ['typescript'] },
                        { role: 'tester', count: 1, skills: ['jest', 'cypress'] },
                    ],
                    budget: 100000,
                    tools: ['vscode', 'git'],
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.resources.team).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.resources.budget).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.resources.tools).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.resources.budget.total).toBe(100000);
        });
        (0, vitest_1.it)('should generate timeline planning', async () => {
            const input = {
                projectId: 'proj_timeline',
                planType: 'development',
                projectScope: {
                    duration: 4,
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.timeline).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.timeline.duration).toBe(4);
            (0, vitest_1.expect)(result.data?.projectPlan.timeline.startDate).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectPlan.timeline.endDate).toBeDefined();
        });
        (0, vitest_1.it)('should generate risk assessment', async () => {
            const input = {
                projectId: 'proj_risks',
                planType: 'development',
                businessRequirements: {
                    riskTolerance: 'high',
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.risks).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.projectPlan.risks)).toBe(true);
            (0, vitest_1.expect)(result.data?.projectPlan.risks.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should calculate business value', async () => {
            const input = {
                projectId: 'proj_business',
                planType: 'development',
                businessRequirements: {
                    roiTarget: 400,
                    timeToMarket: 8,
                },
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.businessValue.estimatedROI).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.timeToMarket).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.riskMitigation).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should generate success metrics', async () => {
            const input = {
                projectId: 'proj_metrics',
                planType: 'development',
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.successMetrics).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.successMetrics)).toBe(true);
            (0, vitest_1.expect)(result.data?.successMetrics.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should calculate technical metrics', async () => {
            const input = {
                projectId: 'proj_tech',
                planType: 'development',
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.planningTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.phasesPlanned).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.tasksPlanned).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            const input = {
                projectId: '', // Invalid empty ID
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(input));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await (0, smart_plan_1.handleSmartPlan)(invalidInput));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid arguments');
        });
    });
});
//# sourceMappingURL=smart_plan.test.js.map