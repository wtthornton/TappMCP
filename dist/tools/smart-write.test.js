import { describe, it, expect } from 'vitest';
import { handleSmartWrite, smartWriteTool } from './smart-write';
describe('smart_write tool', () => {
    describe('tool definition', () => {
        it('should have correct name and description', () => {
            expect(smartWriteTool.name).toBe('smart_write');
            expect(smartWriteTool.description).toContain('Generate code with role-based expertise');
        });
        it('should have proper input schema', () => {
            expect(smartWriteTool.inputSchema).toBeDefined();
            expect(smartWriteTool.inputSchema.type).toBe('object');
            expect(smartWriteTool.inputSchema.properties).toBeDefined();
        });
    });
    describe('handleSmartWrite', () => {
        it('should successfully generate code with minimal input', async () => {
            const input = {
                projectId: 'proj_test_123',
                featureDescription: 'Create a simple payment processing function',
                codeType: 'function',
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.codeId).toBeDefined();
            expect(result.data?.generatedCode).toBeDefined();
            expect(result.data?.qualityMetrics).toBeDefined();
            expect(result.data?.businessValue).toBeDefined();
            expect(result.data?.nextSteps).toBeDefined();
            expect(result.data?.technicalMetrics).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should successfully generate code with full input', async () => {
            const input = {
                projectId: 'proj_test_456',
                featureDescription: 'Create a comprehensive payment processing system with validation and error handling',
                codeType: 'api',
                targetRole: 'developer',
                techStack: ['typescript', 'express'],
                businessContext: {
                    goals: ['secure payments', 'user experience'],
                    targetUsers: ['customers', 'merchants'],
                    priority: 'high',
                },
                qualityRequirements: {
                    testCoverage: 95,
                    complexity: 3,
                    securityLevel: 'high',
                },
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.codeId).toContain('payment_processing');
            expect(result.data?.generatedCode.files.length).toBeGreaterThanOrEqual(1);
            expect(result.data?.generatedCode.files[0].path).toContain('payment_processing');
            expect(result.data?.qualityMetrics.testCoverage).toBeGreaterThanOrEqual(80);
            expect(result.data?.qualityMetrics.securityScore).toBeGreaterThanOrEqual(75);
        });
        it('should generate different code types', async () => {
            const codeTypes = ['function', 'api', 'test', 'config', 'documentation'];
            for (const codeType of codeTypes) {
                const input = {
                    projectId: 'proj_test_789',
                    featureDescription: `Create a ${codeType} for user authentication`,
                    codeType,
                };
                const result = (await handleSmartWrite(input));
                expect(result.success).toBe(true);
                expect(result.data?.generatedCode.files[0].type).toBe(codeType);
            }
        });
        it('should generate role-specific code', async () => {
            const roles = ['developer', 'product-strategist', 'designer'];
            for (const role of roles) {
                const input = {
                    projectId: 'proj_test_101',
                    featureDescription: 'Create a user management system',
                    codeType: 'api',
                    targetRole: role,
                };
                const result = (await handleSmartWrite(input));
                expect(result.success).toBe(true);
                const roleDisplayName = role === 'product-strategist' ? 'Product Strategist' :
                    role.charAt(0).toUpperCase() + role.slice(1);
                expect(result.data?.generatedCode.files[0].content).toContain(`${roleDisplayName} Role Implementation`);
            }
        });
        it('should generate different code types based on requirements', async () => {
            const codeTypes = ['function', 'api', 'test'];
            for (const codeType of codeTypes) {
                const input = {
                    projectId: 'proj_test_202',
                    featureDescription: 'Create a data validation system',
                    codeType,
                };
                const result = (await handleSmartWrite(input));
                expect(result.success).toBe(true);
                expect(result.data?.generatedCode.files[0].type).toBe(codeType);
            }
        });
        it('should calculate technical metrics', async () => {
            const input = {
                projectId: 'proj_test_303',
                featureDescription: 'Create a complex data processing pipeline',
                codeType: 'api',
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(true);
            expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            expect(result.data?.technicalMetrics.generationTime).toBeGreaterThan(0);
            expect(result.data?.technicalMetrics.linesGenerated).toBeGreaterThan(0);
        });
        it('should calculate business value', async () => {
            const input = {
                projectId: 'proj_test_404',
                featureDescription: 'Create an automated testing framework',
                codeType: 'test',
                businessContext: {
                    industry: 'fintech',
                },
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(true);
            expect(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
            expect(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
            expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
        });
        it('should generate quality metrics', async () => {
            const input = {
                projectId: 'proj_test_505',
                featureDescription: 'Create a secure authentication service',
                codeType: 'api',
                qualityRequirements: {
                    testCoverage: 95,
                    complexity: 2,
                    securityLevel: 'high',
                },
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(true);
            expect(result.data?.qualityMetrics.testCoverage).toBeGreaterThanOrEqual(80);
            expect(result.data?.qualityMetrics.complexity).toBeLessThanOrEqual(5);
            expect(result.data?.qualityMetrics.securityScore).toBeGreaterThanOrEqual(75);
            expect(result.data?.qualityMetrics.maintainability).toBeGreaterThan(0);
        });
        it('should handle errors gracefully', async () => {
            const input = {
                projectId: 'proj_test_606',
                featureDescription: '', // Invalid empty description
            };
            const result = (await handleSmartWrite(input));
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await handleSmartWrite(invalidInput));
            expect(result.success).toBe(false);
            expect(result.error).toContain('Required');
        });
    });
});
//# sourceMappingURL=smart-write.test.js.map