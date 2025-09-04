"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_write_1 = require("./smart_write");
(0, vitest_1.describe)('smart_write tool', () => {
    (0, vitest_1.describe)('tool definition', () => {
        (0, vitest_1.it)('should have correct name and description', () => {
            (0, vitest_1.expect)(smart_write_1.smartWriteTool.name).toBe('smart_write');
            (0, vitest_1.expect)(smart_write_1.smartWriteTool.description).toContain('AI-assisted code generation');
        });
        (0, vitest_1.it)('should have proper input schema', () => {
            (0, vitest_1.expect)(smart_write_1.smartWriteTool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(smart_write_1.smartWriteTool.inputSchema.type).toBe('object');
            (0, vitest_1.expect)(smart_write_1.smartWriteTool.inputSchema.properties).toBeDefined();
        });
    });
    (0, vitest_1.describe)('handleSmartWrite', () => {
        (0, vitest_1.it)('should successfully generate code with minimal input', async () => {
            const input = {
                codeDescription: 'Create a simple payment processing function',
                codeType: 'function',
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.codeId).toBeDefined();
            (0, vitest_1.expect)(result.data?.generatedCode).toBeDefined();
            (0, vitest_1.expect)(result.data?.qualityMetrics).toBeDefined();
            (0, vitest_1.expect)(result.data?.businessValue).toBeDefined();
            (0, vitest_1.expect)(result.data?.nextSteps).toBeDefined();
            (0, vitest_1.expect)(result.data?.technicalMetrics).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should successfully generate code with full input', async () => {
            const input = {
                codeDescription: 'Create a comprehensive payment processing system with validation and error handling',
                codeType: 'module',
                targetLanguage: 'typescript',
                framework: 'express',
                requirements: {
                    security: 'high',
                    performance: 'medium',
                    maintainability: 'high',
                },
                qualityGates: {
                    testCoverage: 90,
                    complexity: 2,
                },
                businessContext: {
                    industry: 'e-commerce',
                    userRole: 'vibe-coder',
                },
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data).toBeDefined();
            (0, vitest_1.expect)(result.data?.codeId).toContain('payment_processing');
            (0, vitest_1.expect)(result.data?.generatedCode.files).toHaveLength(1);
            (0, vitest_1.expect)(result.data?.generatedCode.files[0].path).toContain('payment-processing');
            (0, vitest_1.expect)(result.data?.qualityMetrics.testCoverage).toBe(90);
            (0, vitest_1.expect)(result.data?.qualityMetrics.securityScore).toBe(95);
        });
        (0, vitest_1.it)('should generate different code types', async () => {
            const codeTypes = ['function', 'class', 'module', 'component', 'service'];
            for (const codeType of codeTypes) {
                const input = {
                    codeDescription: `Create a ${codeType} for user authentication`,
                    codeType,
                };
                const result = (await (0, smart_write_1.handleSmartWrite)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.generatedCode.files[0].type).toBe(codeType);
            }
        });
        (0, vitest_1.it)('should generate role-specific code', async () => {
            const roles = ['vibe-coder', 'strategy-person', 'non-technical-founder'];
            for (const role of roles) {
                const input = {
                    codeDescription: 'Create a user management system',
                    codeType: 'module',
                    businessContext: {
                        userRole: role,
                    },
                };
                const result = (await (0, smart_write_1.handleSmartWrite)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.generatedCode.files[0].content).toContain(role);
            }
        });
        (0, vitest_1.it)('should generate different code types based on requirements', async () => {
            const codeTypes = ['function', 'class', 'module'];
            for (const codeType of codeTypes) {
                const input = {
                    codeDescription: 'Create a data validation system',
                    codeType,
                };
                const result = (await (0, smart_write_1.handleSmartWrite)(input));
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data?.generatedCode.files[0].type).toBe(codeType);
            }
        });
        (0, vitest_1.it)('should calculate technical metrics', async () => {
            const input = {
                codeDescription: 'Create a complex data processing pipeline',
                codeType: 'module',
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            (0, vitest_1.expect)(result.data?.technicalMetrics.generationTime).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.linesGenerated).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.technicalMetrics.filesCreated).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should calculate business value', async () => {
            const input = {
                codeDescription: 'Create an automated testing framework',
                codeType: 'module',
                businessContext: {
                    industry: 'fintech',
                },
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should generate quality metrics', async () => {
            const input = {
                codeDescription: 'Create a secure authentication service',
                codeType: 'service',
                requirements: {
                    security: 'high',
                },
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.data?.qualityMetrics.testCoverage).toBe(95);
            (0, vitest_1.expect)(result.data?.qualityMetrics.complexity).toBe(2);
            (0, vitest_1.expect)(result.data?.qualityMetrics.securityScore).toBe(95);
            (0, vitest_1.expect)(result.data?.qualityMetrics.maintainability).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            const input = {
                codeDescription: '', // Invalid empty description
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(input));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toBeDefined();
            (0, vitest_1.expect)(result.timestamp).toBeDefined();
        });
        (0, vitest_1.it)('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await (0, smart_write_1.handleSmartWrite)(invalidInput));
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid arguments');
        });
    });
});
//# sourceMappingURL=smart_write.test.js.map