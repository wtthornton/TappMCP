"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_finish_1 = require("./smart_finish");
(0, vitest_1.describe)('smart_finish tool', () => {
    (0, vitest_1.describe)('tool definition', () => {
        (0, vitest_1.it)('should have correct name and description', () => {
            (0, vitest_1.expect)(smart_finish_1.smartFinishTool.name).toBe('smart_finish');
            (0, vitest_1.expect)(smart_finish_1.smartFinishTool.description).toContain('AI-assisted project completion');
        });
        (0, vitest_1.it)('should have proper input schema', () => {
            (0, vitest_1.expect)(smart_finish_1.smartFinishTool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(smart_finish_1.smartFinishTool.inputSchema.type).toBe('object');
            (0, vitest_1.expect)(smart_finish_1.smartFinishTool.inputSchema.properties).toBeDefined();
        });
    });
    (0, vitest_1.describe)('handleSmartFinish', () => {
        (0, vitest_1.it)('should successfully validate project with minimal input', async () => {
            const input = {
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard).toBeDefined();
            (0, vitest_1.expect)(result.data?.recommendations).toBeDefined();
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(result.data?.technicalMetrics).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should successfully validate project with full input', async () => {
            const input = {
                codeIds: ['code_123', 'code_456'],
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    performanceScore: 85,
                    maintainabilityScore: 88,
                },
                businessRequirements: {
                    roiTarget: 300,
                    costPrevention: 25000,
                    timeSaved: 8,
                    userSatisfaction: 95,
                },
                productionReadiness: {
                    securityScan: true,
                    performanceTest: true,
                    documentationComplete: true,
                    deploymentReady: true,
                },
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.projectId).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.overall).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.quality).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.business).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.production).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.production.securityScan).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.production.performanceTest).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.production.documentationComplete).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityScorecard.production.deploymentReady).toBeDefined();
        });
        (0, vitest_1.it)('should generate appropriate recommendations', async () => {
            const input = {
                codeIds: ['code_123'],
                qualityGates: {
                    testCoverage: 70, // Below threshold
                    securityScore: 60, // Below threshold
                },
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.recommendations).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.recommendations)).toBe(true);
        });
        (0, vitest_1.it)('should generate next steps', async () => {
            const input = {
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(result.data?.nextSteps)).toBe(true);
            (0, vitest_1.expect)(result.data?.nextSteps.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should calculate technical metrics correctly', async () => {
            const input = {
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.validationTime).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.codeUnitsValidated).toBe(2);
        });
        (0, vitest_1.it)('should validate different quality gates', async () => {
            const qualityGates = [
                { testCoverage: 95, securityScore: 90, performanceScore: 85, maintainabilityScore: 88 },
                { testCoverage: 70, securityScore: 60, performanceScore: 50, maintainabilityScore: 65 },
            ];
            for (const gates of qualityGates) {
                const input = {
                    codeIds: ['code_123'],
                    qualityGates: gates,
                };
                const result = (await (0, smart_finish_1.handleSmartFinish)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.qualityScorecard.quality).toBeDefined();
            }
        });
        (0, vitest_1.it)('should validate business requirements', async () => {
            const input = {
                codeIds: ['code_123'],
                businessRequirements: {
                    roiTarget: 400,
                    costPrevention: 30000,
                    timeSaved: 12,
                    userSatisfaction: 98,
                },
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.qualityScorecard.business).toBeDefined();
        });
        (0, vitest_1.it)('should validate production readiness', async () => {
            const input = {
                codeIds: ['code_123'],
                productionReadiness: {
                    securityScan: true,
                    performanceTest: false,
                    documentationComplete: true,
                    deploymentReady: false,
                },
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.qualityScorecard.production).toBeDefined();
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            const input = {
                codeIds: [], // Invalid empty array
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(input));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await (0, smart_finish_1.handleSmartFinish)(invalidInput));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid arguments');
        });
    });
});
//# sourceMappingURL=smart_finish.test.js.map