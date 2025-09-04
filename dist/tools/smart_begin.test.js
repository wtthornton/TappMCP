"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_begin_1 = require("./smart_begin");
(0, vitest_1.describe)('smart_begin tool', () => {
    (0, vitest_1.describe)('tool definition', () => {
        (0, vitest_1.it)('should have correct name and description', () => {
            (0, vitest_1.expect)(smart_begin_1.smartBeginTool.name).toBe('smart_begin');
            (0, vitest_1.expect)(smart_begin_1.smartBeginTool.description).toContain('Initialize a new project');
        });
        (0, vitest_1.it)('should have proper input schema', () => {
            (0, vitest_1.expect)(smart_begin_1.smartBeginTool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(smart_begin_1.smartBeginTool.inputSchema.type).toBe('object');
            (0, vitest_1.expect)(smart_begin_1.smartBeginTool.inputSchema.properties).toBeDefined();
        });
    });
    (0, vitest_1.describe)('handleSmartBegin', () => {
        (0, vitest_1.it)('should successfully initialize a project with minimal input', async () => {
            const input = {
                projectName: 'test-project',
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectStructure).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityGates).toBeDefined();
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(result.data?.businessValue).toBeDefined();
            (0, vitest_1.expect)(result.data?.technicalMetrics).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should successfully initialize a project with full input', async () => {
            const input = {
                projectName: 'my-awesome-project',
                projectType: 'web-app',
                businessContext: {
                    industry: 'e-commerce',
                    targetUsers: 'small businesses',
                    keyFeatures: ['payment processing', 'inventory management'],
                },
                technicalRequirements: {
                    frontend: 'React',
                    backend: 'Node.js',
                    database: 'PostgreSQL',
                },
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    performanceScore: 85,
                },
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toContain('my-awesome-project');
            (0, vitest_1.expect)(result.data?.projectStructure.folders).toContain('src');
            (0, vitest_1.expect)(result.data?.projectStructure.files).toContain('package.json');
            (0, vitest_1.expect)(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.nextSteps.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle different project types', async () => {
            const projectTypes = ['web-app', 'api', 'mobile-app', 'desktop-app'];
            for (const projectType of projectTypes) {
                const input = {
                    projectName: `test-${projectType}`,
                    projectType,
                };
                const result = (await (0, smart_begin_1.handleSmartBegin)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.projectStructure).toBeDefined();
            }
        });
        (0, vitest_1.it)('should generate appropriate next steps based on user role', async () => {
            const strategyInput = {
                projectName: 'strategy-project',
                businessContext: {
                    targetUsers: ['strategy-people'],
                },
            };
            const coderInput = {
                projectName: 'coder-project',
                businessContext: {
                    targetUsers: ['vibe-coders'],
                },
            };
            const founderInput = {
                projectName: 'founder-project',
                businessContext: {
                    targetUsers: ['non-technical-founder'],
                },
            };
            const strategyResult = (await (0, smart_begin_1.handleSmartBegin)(strategyInput));
            const coderResult = (await (0, smart_begin_1.handleSmartBegin)(coderInput));
            const founderResult = (await (0, smart_begin_1.handleSmartBegin)(founderInput));
            (0, vitest_1.expect)(strategyResult.success).toBe(true);
            (0, vitest_1.expect)(coderResult.success).toBe(true);
            (0, vitest_1.expect)(founderResult.success).toBe(true);
            // Strategy people should get business-focused next steps
            (0, vitest_1.expect)(strategyResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('business value') || step.includes('stakeholders'))).toBe(true);
            // Vibe coders should get technical next steps
            (0, vitest_1.expect)(coderResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('development environment') || step.includes('code quality'))).toBe(true);
            // Non-technical founders should get business-focused next steps
            (0, vitest_1.expect)(founderResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('business-focused documentation') || step.includes('technical foundation created'))).toBe(true);
        });
        (0, vitest_1.it)('should calculate business value correctly', async () => {
            const input = {
                projectName: 'business-value-test',
                projectType: 'web-app',
                businessContext: {
                    industry: 'fintech',
                    targetUsers: 'enterprise',
                },
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.qualityImprovements).toBeDefined();
        });
        (0, vitest_1.it)('should generate technical metrics', async () => {
            const input = {
                projectName: 'metrics-test',
                projectType: 'api',
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.securityScore).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            const input = {
                projectName: '', // Invalid empty name
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(input));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await (0, smart_begin_1.handleSmartBegin)(invalidInput));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
        });
    });
});
//# sourceMappingURL=smart_begin.test.js.map
