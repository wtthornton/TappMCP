import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartFinishMCPTool } from './smart-finish-mcp.js';
// Mock the core modules
vi.mock('../core/security-scanner.js', () => ({
    SecurityScanner: vi.fn().mockImplementation(() => ({
        scan: vi.fn().mockResolvedValue({ vulnerabilities: [], score: 95 }),
    })),
}));
vi.mock('../core/static-analyzer.js', () => ({
    StaticAnalyzer: vi.fn().mockImplementation(() => ({
        analyze: vi.fn().mockResolvedValue({ complexity: 5, maintainability: 80 }),
    })),
}));
vi.mock('../core/quality-scorecard.js', () => ({
    QualityScorecardGenerator: vi.fn().mockImplementation(() => ({
        generate: vi.fn().mockResolvedValue({ overallScore: 85 }),
    })),
}));
describe('SmartFinishMCPTool', () => {
    let tool;
    beforeEach(() => {
        tool = new SmartFinishMCPTool();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(tool).toBeDefined();
            expect(tool).toBeInstanceOf(SmartFinishMCPTool);
        });
    });
    describe('Quality Scorecard Generation', () => {
        it('should generate comprehensive quality scorecard', async () => {
            const input = {
                projectId: 'test-project',
                codeIds: ['code-1', 'code-2', 'code-3'],
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    complexityScore: 80,
                    maintainabilityScore: 85,
                },
                businessRequirements: {
                    costPrevention: 15000,
                    timeSaved: 3,
                    userSatisfaction: 95,
                },
                productionReadiness: {
                    securityScan: true,
                    performanceTest: true,
                    documentationComplete: true,
                    deploymentReady: true,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectId).toBe('test-project');
            expect(result.data?.qualityScorecard.overallScore).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.testCoverage.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.securityScore.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.complexityScore.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.maintainabilityScore.score).toBeGreaterThan(0);
            expect(result.data?.businessValue.roi).toBeGreaterThan(0);
            expect(result.data?.nextSteps).toHaveLength(5);
            expect(result.data?.recommendations).toHaveLength(5);
        });
        it('should handle minimal input with defaults', async () => {
            const input = {
                projectId: 'minimal-project',
                codeIds: ['code-1'],
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.projectId).toBe('minimal-project');
            expect(result.data?.qualityScorecard.overallScore).toBeGreaterThan(0);
            expect(result.data?.businessValue.costPrevention).toBeGreaterThan(8000); // Default value
            expect(result.data?.businessValue.timeSaved).toBeGreaterThan(1.5); // Default value
            expect(result.data?.businessValue.userSatisfaction).toBeCloseTo(77.5, 1); // Default value
        });
    });
    describe('Test Coverage Analysis', () => {
        it('should analyze test coverage correctly', async () => {
            const input = {
                projectId: 'coverage-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 85,
                    securityScore: 90,
                    complexityScore: 70,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.testCoverage.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.testCoverage.details).toContain('Test coverage: 75%');
            expect(result.data?.qualityScorecard.testCoverage.recommendations).toHaveLength(3);
        });
    });
    describe('Security Analysis', () => {
        it('should analyze security correctly', async () => {
            const input = {
                projectId: 'security-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 85,
                    securityScore: 90,
                    complexityScore: 70,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.securityScore.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.securityScore.details).toContain('Security score: 70%');
            expect(result.data?.qualityScorecard.securityScore.vulnerabilities).toHaveLength(2);
            expect(result.data?.qualityScorecard.securityScore.recommendations).toHaveLength(3);
        });
    });
    describe('Complexity Analysis', () => {
        it('should analyze complexity correctly', async () => {
            const input = {
                projectId: 'complexity-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 85,
                    securityScore: 90,
                    complexityScore: 70,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.complexityScore.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.complexityScore.details).toContain('Complexity score: 60%');
            expect(result.data?.qualityScorecard.complexityScore.metrics.cyclomaticComplexity).toBe(8.5);
            expect(result.data?.qualityScorecard.complexityScore.metrics.maintainabilityIndex).toBe(72);
            expect(result.data?.qualityScorecard.complexityScore.metrics.duplicationPercentage).toBe(3.2);
            expect(result.data?.qualityScorecard.complexityScore.recommendations).toHaveLength(3);
        });
    });
    describe('Maintainability Analysis', () => {
        it('should analyze maintainability correctly', async () => {
            const input = {
                projectId: 'maintainability-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 85,
                    securityScore: 90,
                    complexityScore: 70,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.qualityScorecard.maintainabilityScore.score).toBeGreaterThan(0);
            expect(result.data?.qualityScorecard.maintainabilityScore.details).toContain('Maintainability score: 65%');
            expect(result.data?.qualityScorecard.maintainabilityScore.metrics.codeSmells).toBe(12);
            expect(result.data?.qualityScorecard.maintainabilityScore.metrics.technicalDebt).toBe('2.5 days');
            expect(result.data?.qualityScorecard.maintainabilityScore.metrics.documentationCoverage).toBe(85);
            expect(result.data?.qualityScorecard.maintainabilityScore.recommendations).toHaveLength(3);
        });
    });
    describe('Business Value Calculation', () => {
        it('should calculate business value correctly', async () => {
            const input = {
                projectId: 'business-project',
                codeIds: ['code-1'],
                businessRequirements: {
                    costPrevention: 20000,
                    timeSaved: 5,
                    userSatisfaction: 95,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
            expect(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
            expect(result.data?.businessValue.userSatisfaction).toBeGreaterThan(0);
            expect(result.data?.businessValue.roi).toBeGreaterThan(0);
            expect(result.data?.businessValue.riskMitigation).toHaveLength(2);
        });
        it('should adjust business value based on quality scores', async () => {
            const input = {
                projectId: 'quality-project',
                codeIds: ['code-1'],
                businessRequirements: {
                    costPrevention: 10000,
                    timeSaved: 2,
                    userSatisfaction: 90,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            // Business value should be adjusted based on quality scores
            expect(result.data?.businessValue.costPrevention).toBeLessThanOrEqual(10000);
            expect(result.data?.businessValue.timeSaved).toBeLessThanOrEqual(2);
            expect(result.data?.businessValue.userSatisfaction).toBeLessThanOrEqual(90);
        });
    });
    describe('Production Readiness', () => {
        it('should check all production readiness criteria', async () => {
            const input = {
                projectId: 'production-project',
                codeIds: ['code-1'],
                productionReadiness: {
                    securityScan: true,
                    performanceTest: true,
                    documentationComplete: true,
                    deploymentReady: true,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.productionReadiness.securityScan.passed).toBeDefined();
            expect(result.data?.productionReadiness.performanceTest.passed).toBeDefined();
            expect(result.data?.productionReadiness.documentationComplete.passed).toBeDefined();
            expect(result.data?.productionReadiness.deploymentReady.passed).toBeDefined();
        });
        it('should handle security scan results', async () => {
            const input = {
                projectId: 'security-scan-project',
                codeIds: ['code-1'],
                productionReadiness: {
                    securityScan: true,
                    performanceTest: false,
                    documentationComplete: false,
                    deploymentReady: false,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.productionReadiness.securityScan.passed).toBe(false); // Score < 90
            expect(result.data?.productionReadiness.securityScan.score).toBeCloseTo(77.8, 1);
            expect(result.data?.productionReadiness.securityScan.issues).toHaveLength(2);
            expect(result.data?.productionReadiness.securityScan.recommendations).toHaveLength(3);
        });
        it('should handle performance test results', async () => {
            const input = {
                projectId: 'performance-project',
                codeIds: ['code-1'],
                productionReadiness: {
                    securityScan: false,
                    performanceTest: true,
                    documentationComplete: false,
                    deploymentReady: false,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.productionReadiness.performanceTest.passed).toBe(true); // Score >= 80
            expect(result.data?.productionReadiness.performanceTest.score).toBeGreaterThan(80);
            expect(result.data?.productionReadiness.performanceTest.metrics.responseTime).toBe(120);
            expect(result.data?.productionReadiness.performanceTest.metrics.throughput).toBe(850);
            expect(result.data?.productionReadiness.performanceTest.metrics.memoryUsage).toBe(256);
            expect(result.data?.productionReadiness.performanceTest.recommendations).toHaveLength(3);
        });
        it('should handle documentation completeness', async () => {
            const input = {
                projectId: 'docs-project',
                codeIds: ['code-1'],
                productionReadiness: {
                    securityScan: false,
                    performanceTest: false,
                    documentationComplete: true,
                    deploymentReady: false,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.productionReadiness.documentationComplete.passed).toBe(true); // Score >= 80
            expect(result.data?.productionReadiness.documentationComplete.score).toBe(85);
            expect(result.data?.productionReadiness.documentationComplete.coverage.apiDocumentation).toBe(85);
            expect(result.data?.productionReadiness.documentationComplete.coverage.userGuide).toBe(90);
            expect(result.data?.productionReadiness.documentationComplete.coverage.technicalDocs).toBe(75);
            expect(result.data?.productionReadiness.documentationComplete.recommendations).toHaveLength(3);
        });
        it('should handle deployment readiness', async () => {
            const input = {
                projectId: 'deploy-project',
                codeIds: ['code-1'],
                productionReadiness: {
                    securityScan: false,
                    performanceTest: false,
                    documentationComplete: false,
                    deploymentReady: true,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.productionReadiness.deploymentReady.passed).toBe(true); // Score >= 75
            expect(result.data?.productionReadiness.deploymentReady.score).toBeGreaterThan(75);
            expect(result.data?.productionReadiness.deploymentReady.checks).toHaveLength(4);
            expect(result.data?.productionReadiness.deploymentReady.recommendations).toHaveLength(3);
        });
    });
    describe('Next Steps Generation', () => {
        it('should generate appropriate next steps for high quality', async () => {
            const input = {
                projectId: 'high-quality-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 95,
                    securityScore: 95,
                    complexityScore: 85,
                    maintainabilityScore: 85,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.nextSteps).toContain('Address quality issues before production deployment');
            expect(result.data?.nextSteps).toContain('Fix security vulnerabilities identified in scan');
            expect(result.data?.nextSteps).toContain('Complete remaining production readiness checks');
        });
        it('should generate appropriate next steps for low quality', async () => {
            const input = {
                projectId: 'low-quality-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 60,
                    securityScore: 60,
                    complexityScore: 50,
                    maintainabilityScore: 50,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.nextSteps).toContain('Proceed with production deployment');
            expect(result.data?.nextSteps).toContain('Set up monitoring and alerting');
            expect(result.data?.nextSteps).toContain('Plan post-deployment validation');
        });
    });
    describe('Recommendations Generation', () => {
        it('should generate comprehensive recommendations', async () => {
            const input = {
                projectId: 'recommendations-project',
                codeIds: ['code-1'],
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.recommendations).toHaveLength(4);
            expect(result.data?.recommendations).toContain('Implement continuous integration and deployment');
            expect(result.data?.recommendations).toContain('Set up automated quality monitoring');
            expect(result.data?.recommendations).toContain('Establish regular code review processes');
        });
    });
    describe('Error Handling', () => {
        it('should handle validation errors', async () => {
            const invalidInput = {
                projectId: '', // Invalid: empty string
                codeIds: [], // Invalid: empty array
                qualityGates: 'not-an-object', // Invalid: should be object
            };
            const result = await tool.execute(invalidInput);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Project ID is required');
            expect(result.error).toContain('At least one code ID is required');
        });
        it('should handle missing required fields', async () => {
            const invalidInput = {
                // Missing projectId and codeIds
                qualityGates: {
                    testCoverage: 85,
                    securityScore: 90,
                    complexityScore: 70,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(invalidInput);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Required');
        });
    });
    describe('Performance', () => {
        it('should complete within reasonable time', async () => {
            const input = {
                projectId: 'perf-project',
                codeIds: ['code-1', 'code-2', 'code-3', 'code-4', 'code-5'],
                qualityGates: {
                    testCoverage: 90,
                    securityScore: 95,
                    complexityScore: 80,
                    maintainabilityScore: 85,
                },
                businessRequirements: {
                    costPrevention: 25000,
                    timeSaved: 5,
                    userSatisfaction: 95,
                },
                productionReadiness: {
                    securityScan: true,
                    performanceTest: true,
                    documentationComplete: true,
                    deploymentReady: true,
                },
            };
            const startTime = performance.now();
            const result = await tool.execute(input);
            const endTime = performance.now();
            expect(result.success).toBe(true);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });
    describe('Quality Score Calculations', () => {
        it('should calculate scores relative to quality gates', async () => {
            const input = {
                projectId: 'score-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 100, // High target
                    securityScore: 50, // Low target
                    complexityScore: 80,
                    maintainabilityScore: 70,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            // Test coverage score should be lower due to high target
            expect(result.data?.qualityScorecard.testCoverage.score).toBeLessThan(100);
            // Security score should be higher due to low target (capped at 100)
            expect(result.data?.qualityScorecard.securityScore.score).toBe(100);
        });
    });
    describe('Risk Mitigation', () => {
        it('should include risk mitigation based on quality scores', async () => {
            const input = {
                projectId: 'risk-project',
                codeIds: ['code-1'],
                qualityGates: {
                    testCoverage: 95,
                    securityScore: 95,
                    complexityScore: 80,
                    maintainabilityScore: 80,
                },
            };
            const result = await tool.execute(input);
            expect(result.success).toBe(true);
            expect(result.data?.businessValue.riskMitigation).toContain('Good maintainability reduces future costs');
        });
    });
});
//# sourceMappingURL=smart-finish-mcp.test.js.map