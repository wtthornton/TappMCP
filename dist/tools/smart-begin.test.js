import { describe, it, expect } from 'vitest';
import { handleSmartBegin, smartBeginTool } from './smart-begin';
describe('smart_begin tool', () => {
    describe('tool definition', () => {
        it('should have correct name and description', () => {
            expect(smartBeginTool.name).toBe('smart_begin');
            expect(smartBeginTool.description).toContain('Initialize a new project');
        });
        it('should have proper input schema', () => {
            expect(smartBeginTool.inputSchema).toBeDefined();
            expect(smartBeginTool.inputSchema.type).toBe('object');
            expect(smartBeginTool.inputSchema.properties).toBeDefined();
        });
    });
    describe('handleSmartBegin', () => {
        it('should successfully initialize a project with minimal input', async () => {
            const input = {
                projectName: 'test-project',
            };
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectId).toBeDefined();
            expect(result.data?.projectStructure).toBeDefined();
            expect(result.data?.qualityGates).toBeDefined();
            expect(result.data?.nextSteps).toBeDefined();
            expect(result.data?.businessValue).toBeDefined();
            expect(result.data?.technicalMetrics).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should successfully initialize a project with full input', async () => {
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
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.projectId).toContain('my-awesome-project');
            expect(result.data?.projectStructure.folders).toContain('src');
            expect(result.data?.projectStructure.files).toContain('package.json');
            expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
            expect(result.data?.nextSteps.length).toBeGreaterThan(0);
        });
        it('should handle different project types', async () => {
            const projectTypes = ['web-app', 'api', 'mobile-app', 'desktop-app'];
            for (const projectType of projectTypes) {
                const input = {
                    projectName: `test-${projectType}`,
                    projectType,
                };
                const result = (await handleSmartBegin(input));
                expect(result.success).toBe(true);
                expect(result.data?.projectStructure).toBeDefined();
            }
        });
        it('should generate appropriate next steps based on user role', async () => {
            const strategyInput = {
                projectName: 'strategy-project',
                targetUsers: ['strategy-people'],
            };
            const coderInput = {
                projectName: 'coder-project',
                targetUsers: ['vibe-coders'],
            };
            const founderInput = {
                projectName: 'founder-project',
                targetUsers: ['non-technical-founder'],
            };
            const strategyResult = (await handleSmartBegin(strategyInput));
            const coderResult = (await handleSmartBegin(coderInput));
            const founderResult = (await handleSmartBegin(founderInput));
            expect(strategyResult.success).toBe(true);
            expect(coderResult.success).toBe(true);
            expect(founderResult.success).toBe(true);
            // Strategy people should get business-focused next steps
            expect(strategyResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('business value') || step.includes('stakeholders'))).toBe(true);
            // Vibe coders should get technical next steps
            expect(coderResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('development environment') || step.includes('code quality'))).toBe(true);
            // Non-technical founders should get business-focused next steps
            expect(founderResult.data?.nextSteps.some(
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            step => step.includes('business-focused documentation') ||
                step.includes('technical foundation created'))).toBe(true);
        });
        it('should calculate business value correctly', async () => {
            const input = {
                projectName: 'business-value-test',
                projectType: 'web-app',
                businessContext: {
                    industry: 'fintech',
                    targetUsers: 'enterprise',
                },
            };
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(true);
            expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
            expect(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
            expect(result.data?.businessValue.qualityImprovements).toBeDefined();
        });
        it('should generate technical metrics', async () => {
            const input = {
                projectName: 'metrics-test',
                projectType: 'api',
            };
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(true);
            expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
            expect(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
            expect(result.data?.technicalMetrics.securityScore).toBeGreaterThan(0);
        });
        it('should handle errors gracefully', async () => {
            const input = {
                projectName: '', // Invalid empty name
            };
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await handleSmartBegin(invalidInput));
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
//# sourceMappingURL=smart-begin.test.js.map