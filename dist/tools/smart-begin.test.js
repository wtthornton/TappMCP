#!/usr/bin/env node
import { describe, it, expect } from 'vitest';
import { handleSmartBegin, smartBeginTool } from './smart-begin';
describe('SmartBegin - REAL TESTS (Expose Template Theater)', () => {
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
    describe('EXPOSE TEMPLATE GENERATION - Not Real Intelligence', () => {
        it('should return IDENTICAL structures for DIFFERENT domains', async () => {
            const ecommerceInput = {
                projectName: 'ecommerce-platform',
                projectType: 'web-app',
                businessContext: {
                    industry: 'e-commerce',
                    targetUsers: 'online shoppers',
                    keyFeatures: ['payment processing', 'product catalog', 'inventory management'],
                },
                techStack: ['react', 'nodejs'],
            };
            const healthcareInput = {
                projectName: 'healthcare-system',
                projectType: 'web-app',
                businessContext: {
                    industry: 'healthcare',
                    targetUsers: 'patients and doctors',
                    keyFeatures: ['patient records', 'appointment scheduling', 'medical billing'],
                },
                techStack: ['react', 'nodejs'],
            };
            const ecommerceResult = (await handleSmartBegin(ecommerceInput));
            const healthcareResult = (await handleSmartBegin(healthcareInput));
            // EXPOSE THE TRUTH: Same tech stack = identical project structure
            expect(ecommerceResult.data?.projectStructure.folders).toEqual(healthcareResult.data?.projectStructure.folders);
            expect(ecommerceResult.data?.projectStructure.files).toEqual(healthcareResult.data?.projectStructure.files);
            // "Smart" tool doesn't understand domain context - just template matching
            expect(ecommerceResult.data?.qualityGates).toEqual(healthcareResult.data?.qualityGates);
            console.log('EXPOSED: E-commerce and Healthcare produce identical structures');
        });
        it('should return HARDCODED business values regardless of actual project', async () => {
            const smallProjectInput = {
                projectName: 'simple-todo-app',
                techStack: [],
                businessContext: { budget: '$1000' },
            };
            const enterpriseProjectInput = {
                projectName: 'enterprise-banking-system',
                techStack: [],
                businessContext: { budget: '$10M' },
            };
            const smallResult = (await handleSmartBegin(smallProjectInput));
            const enterpriseResult = (await handleSmartBegin(enterpriseProjectInput));
            // EXPOSE THE TRUTH: Business value calculations are hardcoded, not calculated
            expect(smallResult.data?.businessValue.costPrevention).toBe(enterpriseResult.data?.businessValue.costPrevention);
            expect(smallResult.data?.businessValue.timeSaved).toBe(enterpriseResult.data?.businessValue.timeSaved);
            // Both should return the SAME base value (10000)
            expect(smallResult.data?.businessValue.costPrevention).toBe(10000);
            expect(enterpriseResult.data?.businessValue.costPrevention).toBe(10000);
            console.log(`EXPOSED: $1K todo app and $10M banking system both claim $${smallResult.data?.businessValue.costPrevention} cost prevention`);
        });
        it('should have HARDCODED tech stack bonuses, not intelligent analysis', async () => {
            const noTechStackInput = {
                projectName: 'plain-project',
                techStack: [],
            };
            const typescriptInput = {
                projectName: 'typescript-project',
                techStack: ['typescript'],
            };
            const typescriptReactInput = {
                projectName: 'full-stack-project',
                techStack: ['typescript', 'react'],
            };
            const plainResult = (await handleSmartBegin(noTechStackInput));
            const tsResult = (await handleSmartBegin(typescriptInput));
            const fullResult = (await handleSmartBegin(typescriptReactInput));
            // EXPOSE THE TRUTH: Cost prevention is just adding fixed bonuses
            expect(plainResult.data?.businessValue.costPrevention).toBe(10000); // Base
            expect(tsResult.data?.businessValue.costPrevention).toBe(15000); // Base + TS bonus (5000)
            expect(fullResult.data?.businessValue.costPrevention).toBe(18000); // Base + TS + React (5000 + 3000)
            // No intelligence - just hardcoded if/then statements
            console.log('EXPOSED: Cost calculation is simple addition of hardcoded bonuses');
        });
        it('should return STATIC security scores, not real security analysis', async () => {
            const insecureInput = {
                projectName: 'insecure-app',
                techStack: [],
                securityRequirements: 'none',
                qualityLevel: 'basic',
            };
            const secureInput = {
                projectName: 'high-security-banking',
                techStack: ['typescript', 'react'],
                securityRequirements: 'maximum',
                qualityLevel: 'enterprise',
            };
            const insecureResult = (await handleSmartBegin(insecureInput));
            const secureResult = (await handleSmartBegin(secureInput));
            // EXPOSE THE TRUTH: Security score is hardcoded to 95 regardless of requirements
            expect(insecureResult.data?.technicalMetrics.securityScore).toBe(95);
            expect(secureResult.data?.technicalMetrics.securityScore).toBe(95);
            // No actual security analysis - just static values
            expect(insecureResult.data?.technicalMetrics.complexityScore).toBe(85);
            expect(secureResult.data?.technicalMetrics.complexityScore).toBe(85);
            console.log('EXPOSED: All projects get identical security scores (95) regardless of actual security needs');
        });
        it('should generate TEMPLATE-BASED next steps, not intelligent recommendations', async () => {
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
            // All should have same BASE steps (template)
            const baseSteps = [
                'Review generated project structure and configuration',
                "Install dependencies with 'npm install'",
                "Run tests with 'npm test'",
                "Start development with 'npm run dev'",
            ];
            baseSteps.forEach(step => {
                expect(strategyResult.data?.nextSteps.some((s) => s.includes(step.split("'")[0]))).toBe(true);
                expect(coderResult.data?.nextSteps.some((s) => s.includes(step.split("'")[0]))).toBe(true);
                expect(founderResult.data?.nextSteps.some((s) => s.includes(step.split("'")[0]))).toBe(true);
            });
            // EXPOSE: Just adds specific templates based on user type keywords
            expect(strategyResult.data?.nextSteps.some((s) => s.includes('business value'))).toBe(true);
            expect(coderResult.data?.nextSteps.some((s) => s.includes('development environment'))).toBe(true);
            expect(founderResult.data?.nextSteps.some((s) => s.includes('business-focused documentation'))).toBe(true);
            console.log('EXPOSED: Next steps are keyword matching + template insertion, not intelligent analysis');
        });
        it('should be DETERMINISTIC - same input produces identical output', async () => {
            const input = {
                projectName: 'consistency-test',
                techStack: ['typescript', 'react'],
                targetUsers: ['strategy-people'],
            };
            // Run the same input 5 times
            const results = [];
            for (let i = 0; i < 5; i++) {
                const result = (await handleSmartBegin(input));
                results.push(result);
            }
            // All results should be identical (except timestamps and project IDs)
            for (let i = 1; i < results.length; i++) {
                expect(results[i].data?.projectStructure).toEqual(results[0].data?.projectStructure);
                expect(results[i].data?.businessValue).toEqual(results[0].data?.businessValue);
                expect(results[i].data?.qualityGates).toEqual(results[0].data?.qualityGates);
                expect(results[i].data?.technicalMetrics.securityScore).toBe(results[0].data?.technicalMetrics.securityScore);
                expect(results[i].data?.technicalMetrics.complexityScore).toBe(results[0].data?.technicalMetrics.complexityScore);
            }
            console.log('EXPOSED: SmartBegin is deterministic template generator, not AI-powered analysis');
        });
        it('should ignore COMPLEX business context and return generic templates', async () => {
            const complexBusinessInput = {
                projectName: 'complex-fintech',
                businessContext: {
                    industry: 'financial technology',
                    compliance: ['SOX', 'PCI-DSS', 'GDPR'],
                    targetMarkets: ['North America', 'Europe'],
                    userBase: '10M+ active users',
                    revenue: '$50M ARR',
                    riskProfile: 'high',
                    integrations: ['banks', 'payment processors', 'credit bureaus'],
                    scalingChallenges: ['real-time fraud detection', 'high-frequency transactions'],
                },
                techStack: ['react'],
            };
            const simpleInput = {
                projectName: 'simple-blog',
                techStack: ['react'],
            };
            const complexResult = (await handleSmartBegin(complexBusinessInput));
            const simpleResult = (await handleSmartBegin(simpleInput));
            // EXPOSE THE TRUTH: Complex business context is ignored - same structure generated
            expect(complexResult.data?.projectStructure.folders).toEqual(simpleResult.data?.projectStructure.folders);
            expect(complexResult.data?.projectStructure.files).toEqual(simpleResult.data?.projectStructure.files);
            // No special handling for compliance, risk, or scale
            expect(complexResult.data?.qualityGates).toEqual(simpleResult.data?.qualityGates);
            // Same hardcoded business value calculation
            expect(complexResult.data?.businessValue.costPrevention).toBe(simpleResult.data?.businessValue.costPrevention);
            console.log('EXPOSED: $50M fintech with 10M users gets same template as simple blog');
        });
    });
    describe('PERFORMANCE ANALYSIS - Fake vs Real Processing', () => {
        it('should complete in <2ms because its just template matching', async () => {
            const complexInput = {
                projectName: 'performance-test',
                techStack: ['typescript', 'react', 'nodejs'],
                businessContext: { industry: 'enterprise' },
                targetUsers: ['strategy-people', 'vibe-coders'],
            };
            const startTime = performance.now();
            const result = (await handleSmartBegin(complexInput));
            const duration = performance.now() - startTime;
            expect(result.success).toBe(true);
            // Should be extremely fast because it's just template generation
            expect(duration).toBeLessThan(2); // <2ms indicates no real analysis
            // Response time in result should match actual duration
            expect(Math.abs(result.data?.technicalMetrics.responseTime - duration)).toBeLessThan(5);
            console.log(`EXPOSED: "Smart" analysis completed in ${duration.toFixed(2)}ms - too fast for real intelligence`);
        });
        it('should have consistent performance regardless of input complexity', async () => {
            const simpleInput = { projectName: 'simple' };
            const complexInput = {
                projectName: 'complex-enterprise-system',
                techStack: ['typescript', 'react', 'nodejs', 'postgresql', 'redis', 'docker'],
                businessContext: {
                    industry: 'healthcare',
                    compliance: ['HIPAA', 'SOC2', 'GDPR'],
                    targetUsers: ['doctors', 'patients', 'administrators'],
                    features: ['patient records', 'billing', 'scheduling', 'telemedicine', 'analytics'],
                },
            };
            const simpleTimes = [];
            const complexTimes = [];
            // Test multiple times for consistency
            for (let i = 0; i < 3; i++) {
                const simpleStart = performance.now();
                await handleSmartBegin(simpleInput);
                simpleTimes.push(performance.now() - simpleStart);
                const complexStart = performance.now();
                await handleSmartBegin(complexInput);
                complexTimes.push(performance.now() - complexStart);
            }
            const avgSimple = simpleTimes.reduce((sum, time) => sum + time, 0) / simpleTimes.length;
            const avgComplex = complexTimes.reduce((sum, time) => sum + time, 0) / complexTimes.length;
            // Should have similar performance (template generation doesn't scale with complexity)
            expect(Math.abs(avgSimple - avgComplex)).toBeLessThan(1); // Within 1ms
            console.log(`EXPOSED: Simple (${avgSimple.toFixed(2)}ms) vs Complex (${avgComplex.toFixed(2)}ms) - no analysis complexity scaling`);
        });
    });
    describe('ERROR HANDLING - Basic Validation Only', () => {
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
    describe('INTEGRATION - Full SmartBegin Analysis', () => {
        it('should provide complete template-based project setup', async () => {
            const input = {
                projectName: 'integration-test-project',
                techStack: ['typescript', 'react', 'nodejs'],
                targetUsers: ['strategy-people'],
                businessGoals: ['reduce costs', 'improve quality'],
                qualityLevel: 'enterprise',
                role: 'developer',
            };
            const result = (await handleSmartBegin(input));
            expect(result.success).toBe(true);
            expect(result.data?.projectId).toContain('integration-test-project');
            // Should have all template sections populated
            expect(result.data?.projectStructure.folders.length).toBeGreaterThan(5);
            expect(result.data?.projectStructure.files.length).toBeGreaterThan(5);
            expect(result.data?.qualityGates.length).toBeGreaterThan(5);
            expect(result.data?.nextSteps.length).toBeGreaterThan(5);
            // Business value should be calculated (template-based)
            expect(result.data?.businessValue.costPrevention).toBe(18000); // 10K + 5K (TS) + 3K (React)
            expect(result.data?.businessValue.timeSaved).toBe(2.5); // Hardcoded
            // Technical metrics should be static
            expect(result.data?.technicalMetrics.securityScore).toBe(95);
            expect(result.data?.technicalMetrics.complexityScore).toBe(85);
            // Process compliance should be basic boolean logic
            expect(result.data?.processCompliance?.roleValidation).toBe(true); // role provided
            expect(result.data?.processCompliance?.qualityGates).toBe(true); // always true
            expect(result.data?.processCompliance?.documentation).toBe(true); // always true
            expect(result.data?.processCompliance?.testing).toBe(true); // always true
            console.log('SmartBegin Summary:', {
                isIntelligent: false,
                isTemplateGenerator: true,
                costPreventionClaim: result.data?.businessValue.costPrevention,
                actualProcessingTime: result.data?.technicalMetrics.responseTime,
                verdict: 'Sophisticated template system masquerading as AI analysis',
            });
        });
    });
});
//# sourceMappingURL=smart-begin.test.js.map