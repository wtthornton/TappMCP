import { describe, it, expect } from 'vitest';
import { handleSmartFinish, smartFinishTool } from './smart-finish';
describe('smart_finish tool', () => {
    describe('tool definition', () => {
        it('should have correct name and description', () => {
            expect(smartFinishTool.name).toBe('smart_finish');
            expect(smartFinishTool.description).toContain('Check quality and validate production readiness');
        });
        it('should have proper input schema', () => {
            expect(smartFinishTool.inputSchema).toBeDefined();
            expect(smartFinishTool.inputSchema.type).toBe('object');
            expect(smartFinishTool.inputSchema.properties).toBeDefined();
        });
    });
    describe('handleSmartFinish', () => {
        it('should successfully validate project with minimal input', async () => {
            const input = {
                projectId: 'proj_test_123',
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectId).toBeDefined();
            expect(result.data?.qualityScorecard).toBeDefined();
            expect(result.data?.recommendations).toBeDefined();
            expect(result.data?.nextSteps).toBeDefined();
            expect(result.data?.technicalMetrics).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should successfully validate project with full input', async () => {
            const input = {
                projectId: 'proj_test_456',
                codeIds: ['code_123', 'code_456'],
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    complexityScore: 85,
                    maintainabilityScore: 88,
                },
                businessRequirements: {
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
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectId).toBeDefined();
            expect(result.data?.qualityScorecard.overall).toBeDefined();
            expect(result.data?.qualityScorecard.quality).toBeDefined();
            expect(result.data?.qualityScorecard.business).toBeDefined();
            expect(result.data?.qualityScorecard.production).toBeDefined();
            expect(result.data?.qualityScorecard.production.securityScan).toBeDefined();
            expect(result.data?.qualityScorecard.production.performanceTest).toBeDefined();
            expect(result.data?.qualityScorecard.production.documentationComplete).toBeDefined();
            expect(result.data?.qualityScorecard.production.deploymentReady).toBeDefined();
        });
        it('should generate appropriate recommendations', async () => {
            const input = {
                projectId: 'proj_test_789',
                codeIds: ['code_123'],
                qualityGates: {
                    testCoverage: 70, // Below threshold
                    securityScore: 60, // Below threshold
                    complexityScore: 50,
                    maintainabilityScore: 65,
                },
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data?.recommendations).toBeDefined();
            expect(Array.isArray(result.data?.recommendations)).toBe(true);
        });
        it('should generate next steps', async () => {
            const input = {
                projectId: 'proj_test_101',
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data?.nextSteps).toBeDefined();
            expect(Array.isArray(result.data?.nextSteps)).toBe(true);
            expect(result.data?.nextSteps.length).toBeGreaterThan(0);
        });
        it('should calculate technical metrics correctly', async () => {
            const input = {
                projectId: 'proj_test_202',
                codeIds: ['code_123', 'code_456'],
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            expect(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            expect(result.data?.technicalMetrics.validationTime).toBeGreaterThanOrEqual(0);
            expect(result.data?.technicalMetrics.codeUnitsValidated).toBe(2);
        });
        it('should validate different quality gates', async () => {
            const qualityGates = [
                { testCoverage: 95, securityScore: 90, performanceScore: 85, maintainabilityScore: 88 },
                { testCoverage: 70, securityScore: 60, performanceScore: 50, maintainabilityScore: 65 },
            ];
            for (const gates of qualityGates) {
                const input = {
                    projectId: 'proj_test_303',
                    codeIds: ['code_123'],
                    qualityGates: gates,
                };
                const result = (await handleSmartFinish(input));
                expect(result.success).toBe(true);
                expect(result.data?.qualityScorecard.quality).toBeDefined();
            }
        });
        it('should validate business requirements', async () => {
            const input = {
                projectId: 'proj_test_404',
                codeIds: ['code_123'],
                businessRequirements: {
                    costPrevention: 30000,
                    timeSaved: 12,
                    userSatisfaction: 98,
                },
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.business).toBeDefined();
        });
        it('should validate production readiness', async () => {
            const input = {
                projectId: 'proj_test_505',
                codeIds: ['code_123'],
                productionReadiness: {
                    securityScan: true,
                    performanceTest: false,
                    documentationComplete: true,
                    deploymentReady: false,
                },
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.production).toBeDefined();
        });
        it('should handle errors gracefully', async () => {
            const input = {
                codeIds: [], // Invalid empty array
            };
            const result = (await handleSmartFinish(input));
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await handleSmartFinish(invalidInput));
            expect(result.success).toBe(false);
            expect(result.error).toContain('Required');
        });
    });
});
//# sourceMappingURL=smart-finish.test.js.map