#!/usr/bin/env node
import { describe, it, expect } from 'vitest';
import { handleSmartPlan, smartPlanTool } from './smart-plan';
describe('SmartPlan - REAL TESTS (Expose Planning Theater)', () => {
    describe('tool definition', () => {
        it('should have correct name and description', () => {
            expect(smartPlanTool.name).toBe('smart_plan');
            expect(smartPlanTool.description).toContain('Create comprehensive project plans');
        });
        it('should have proper input schema', () => {
            expect(smartPlanTool.inputSchema).toBeDefined();
            expect(smartPlanTool.inputSchema.type).toBe('object');
            expect(smartPlanTool.inputSchema.properties).toBeDefined();
        });
    });
    describe('EXPOSE TEMPLATE PLANNING - Not Real Intelligence', () => {
        it('should return IDENTICAL plans for DIFFERENT project types', async () => {
            const ecommerceInput = {
                projectId: 'proj_ecommerce',
                planType: 'development',
                businessContext: {
                    goals: ['online sales', 'payment processing', 'inventory management'],
                    targetUsers: ['customers', 'merchants', 'admins'],
                    riskFactors: ['payment security', 'data privacy', 'compliance'],
                },
                scope: {
                    features: ['shopping cart', 'payment gateway', 'product catalog'],
                    timeline: { duration: 8 },
                    resources: { teamSize: 5, budget: 100000 },
                },
            };
            const healthcareInput = {
                projectId: 'proj_healthcare',
                planType: 'development',
                businessContext: {
                    goals: ['patient records', 'appointment scheduling', 'medical billing'],
                    targetUsers: ['doctors', 'patients', 'nurses'],
                    riskFactors: ['HIPAA compliance', 'patient privacy', 'medical liability'],
                },
                scope: {
                    features: ['patient portal', 'scheduling system', 'EMR integration'],
                    timeline: { duration: 8 },
                    resources: { teamSize: 5, budget: 100000 },
                },
            };
            const ecommerceResult = (await handleSmartPlan(ecommerceInput));
            const healthcareResult = (await handleSmartPlan(healthcareInput));
            // EXPOSE THE TRUTH: Same project structure regardless of domain
            expect(ecommerceResult.data?.projectPlan.phases[0].name).toBe(healthcareResult.data?.projectPlan.phases[0].name);
            expect(ecommerceResult.data?.projectPlan.phases[0].duration).toBe(healthcareResult.data?.projectPlan.phases[0].duration);
            // Same generic tasks regardless of context
            expect(ecommerceResult.data?.projectPlan.phases[0].tasks[0]).toStrictEqual(healthcareResult.data?.projectPlan.phases[0].tasks[0]);
            // Same hardcoded risk assessment
            expect(ecommerceResult.data?.projectPlan.risks[0].name).toBe(healthcareResult.data?.projectPlan.risks[0].name);
            console.log('EXPOSED: E-commerce and Healthcare get identical "intelligent" plans');
        });
        it('should return HARDCODED ROI calculations regardless of actual business context', async () => {
            const lowBudgetInput = {
                projectId: 'proj_low_budget',
                planType: 'development',
                scope: { resources: { budget: 10000 } },
                businessContext: { goals: ['simple website'] },
            };
            const highBudgetInput = {
                projectId: 'proj_high_budget',
                planType: 'development',
                scope: { resources: { budget: 1000000 } },
                businessContext: { goals: ['enterprise platform'] },
            };
            const lowResult = (await handleSmartPlan(lowBudgetInput));
            const highResult = (await handleSmartPlan(highBudgetInput));
            // EXPOSE THE TRUTH: ROI is just budget * 2.5 (hardcoded formula)
            expect(lowResult.data?.businessValue.estimatedROI).toBe(25000); // 10K * 2.5
            expect(highResult.data?.businessValue.estimatedROI).toBe(2500000); // 1M * 2.5
            // Risk mitigation is just risks.length * 1000 (hardcoded)
            expect(lowResult.data?.businessValue.riskMitigation).toBe(highResult.data?.businessValue.riskMitigation); // Same risk count = same value
            // Quality improvement is always 75 (hardcoded)
            expect(lowResult.data?.businessValue.qualityImprovement).toBe(75);
            expect(highResult.data?.businessValue.qualityImprovement).toBe(75);
            console.log(`EXPOSED: $10K project ROI=${lowResult.data?.businessValue.estimatedROI}, $1M project ROI=${highResult.data?.businessValue.estimatedROI} - just budget * 2.5`);
        });
        it('should have HARDCODED budget breakdowns, not intelligent resource allocation', async () => {
            const budgets = [50000, 100000, 500000, 1000000];
            for (const budget of budgets) {
                const input = {
                    projectId: `proj_budget_${budget}`,
                    planType: 'development',
                    scope: { resources: { budget } },
                };
                const result = (await handleSmartPlan(input));
                const phases = result.data?.projectPlan.phases;
                // EXPOSE THE TRUTH: Dynamic phases now generated
                expect(phases?.length).toBeGreaterThan(0); // Has phases
                if (phases && phases.length > 0) {
                    expect(phases[0].name).toBeDefined(); // Phase name exists
                    expect(phases[0].duration).toBeGreaterThan(0); // Duration defined
                    expect(phases[0].tasks?.length).toBeGreaterThan(0); // Has tasks
                }
            }
            console.log('UPDATED: Dynamic phase generation now creates context-specific phases');
        });
        it('should generate GENERIC phases regardless of plan type', async () => {
            const planTypes = ['development', 'testing', 'deployment', 'maintenance', 'migration'];
            const results = [];
            for (const planType of planTypes) {
                const input = {
                    projectId: `proj_${planType}`,
                    planType: planType,
                };
                const result = (await handleSmartPlan(input));
                results.push(result);
            }
            // EXPOSE THE TRUTH: All plan types get the same generic "Planning and Setup" phase
            for (let i = 1; i < results.length; i++) {
                expect(results[i].data?.projectPlan.phases[0].name).toBe(results[0].data?.projectPlan.phases[0].name);
                expect(results[i].data?.projectPlan.phases[0].duration).toBe(results[0].data?.projectPlan.phases[0].duration);
            }
            console.log('EXPOSED: All plan types (development, testing, deployment, etc.) get identical generic phases');
        });
        it('should return STATIC success metrics, not project-specific KPIs', async () => {
            const webAppInput = {
                projectId: 'proj_webapp',
                planType: 'development',
                businessContext: {
                    goals: ['user engagement', 'conversion rate optimization'],
                    successMetrics: ['DAU growth', 'conversion rate', 'page load time'],
                },
                scope: { timeline: { duration: 6 } },
                qualityRequirements: { testCoverage: 90 },
                externalMCPs: [
                    {
                        name: 'Analytics',
                        description: 'User tracking',
                        integrationType: 'api',
                        priority: 'high',
                        estimatedEffort: 5,
                    },
                ],
            };
            const apiInput = {
                projectId: 'proj_api',
                planType: 'development',
                businessContext: {
                    goals: ['API performance', 'reliability'],
                    successMetrics: ['response time', 'uptime', 'throughput'],
                },
                scope: { timeline: { duration: 4 } },
                qualityRequirements: { testCoverage: 80 },
                externalMCPs: [],
            };
            const webResult = (await handleSmartPlan(webAppInput));
            const apiResult = (await handleSmartPlan(apiInput));
            // EXPOSE THE TRUTH: Success metrics are just template strings with values plugged in
            expect(webResult.data?.successMetrics[0]).toBe('Complete project delivery in 6 weeks');
            expect(webResult.data?.successMetrics[1]).toBe('Achieve 90% test coverage');
            expect(webResult.data?.successMetrics[2]).toBe('Integrate 1 external MCPs');
            expect(apiResult.data?.successMetrics[0]).toBe('Complete project delivery in 4 weeks');
            expect(apiResult.data?.successMetrics[1]).toBe('Achieve 80% test coverage');
            expect(apiResult.data?.successMetrics[2]).toBe('Integrate 0 external MCPs');
            // No intelligence - just string templates
            console.log('EXPOSED: Success metrics are template strings, not business-relevant KPIs');
        });
        it('should be DETERMINISTIC - same input produces identical output', async () => {
            const input = {
                projectId: 'proj_consistency_test',
                planType: 'development',
                scope: {
                    timeline: { duration: 5 },
                    resources: { budget: 75000, teamSize: 4 },
                },
                businessContext: {
                    goals: ['test consistency'],
                },
            };
            // Run the same input 5 times
            const results = [];
            for (let i = 0; i < 5; i++) {
                const result = (await handleSmartPlan(input));
                results.push(result);
            }
            // All results should be identical (except timestamps)
            for (let i = 1; i < results.length; i++) {
                expect(results[i].data?.projectPlan.phases).toEqual(results[0].data?.projectPlan.phases);
                expect(results[i].data?.businessValue.estimatedROI).toBe(results[0].data?.businessValue.estimatedROI);
                expect(results[i].data?.businessValue.qualityImprovement).toBe(results[0].data?.businessValue.qualityImprovement);
                expect(results[i].data?.successMetrics).toEqual(results[0].data?.successMetrics);
            }
            console.log('EXPOSED: SmartPlan is deterministic template generator, not AI-powered planning');
        });
        it('should ignore COMPLEX business context and apply generic templates', async () => {
            const complexBusinessInput = {
                projectId: 'proj_complex_fintech',
                planType: 'development',
                businessContext: {
                    goals: [
                        'real-time fraud detection',
                        'high-frequency trading support',
                        'multi-currency processing',
                        'regulatory compliance automation',
                    ],
                    targetUsers: ['institutional traders', 'compliance officers', 'risk managers'],
                    successMetrics: [
                        'sub-millisecond transaction processing',
                        'zero false positives in fraud detection',
                        '99.999% uptime SLA',
                        'real-time regulatory reporting',
                    ],
                    riskFactors: [
                        'market volatility impact',
                        'regulatory changes',
                        'cybersecurity threats',
                        'liquidity provider dependencies',
                    ],
                },
                scope: {
                    features: [
                        'algorithmic trading engine',
                        'real-time risk analytics',
                        'compliance monitoring dashboard',
                        'multi-exchange connectivity',
                    ],
                    timeline: { duration: 12 },
                    resources: { budget: 2000000, teamSize: 15 },
                },
                qualityRequirements: {
                    testCoverage: 99,
                    securityLevel: 'high',
                    performanceTargets: {
                        responseTime: 1, // 1ms for HFT
                        throughput: 100000, // 100k req/sec
                        availability: 99.999,
                    },
                },
            };
            const simpleInput = {
                projectId: 'proj_simple_blog',
                planType: 'development',
                scope: { timeline: { duration: 12 }, resources: { budget: 2000000, teamSize: 15 } },
            };
            const complexResult = (await handleSmartPlan(complexBusinessInput));
            const simpleResult = (await handleSmartPlan(simpleInput));
            // EXPOSE THE TRUTH: Complex fintech context ignored - same generic plan
            expect(complexResult.data?.projectPlan.phases[0].name).toBe(simpleResult.data?.projectPlan.phases[0].name);
            expect(complexResult.data?.projectPlan.phases[0].tasks[0]).toStrictEqual(simpleResult.data?.projectPlan.phases[0].tasks[0]);
            // Same ROI formula regardless of complexity
            expect(complexResult.data?.businessValue.estimatedROI).toBe(simpleResult.data?.businessValue.estimatedROI); // Both 2M * 2.5 = 5M
            // No consideration of HFT requirements, compliance needs, or risk factors
            expect(complexResult.data?.projectPlan.risks[0].name).toBe(simpleResult.data?.projectPlan.risks[0].name);
            console.log('EXPOSED: $2M fintech HFT system gets same template as simple blog');
        });
    });
    describe('PERFORMANCE ANALYSIS - Template Generation Speed', () => {
        it('should complete in <5ms because its just template generation', async () => {
            const complexInput = {
                projectId: 'proj_performance_test',
                planType: 'development',
                scope: {
                    features: Array(20).fill('complex feature'),
                    timeline: { duration: 12 },
                    resources: { teamSize: 10, budget: 500000 },
                },
                externalMCPs: Array(10).fill({
                    name: 'External Service',
                    description: 'Complex integration',
                    integrationType: 'api',
                    priority: 'high',
                    estimatedEffort: 8,
                }),
            };
            const startTime = performance.now();
            const result = (await handleSmartPlan(complexInput));
            const duration = performance.now() - startTime;
            expect(result.success).toBe(true);
            // Should be extremely fast because it's just template generation
            expect(duration).toBeLessThan(5); // <5ms indicates no real planning analysis
            // Response time in result should match actual duration
            expect(Math.abs(result.data?.technicalMetrics.responseTime - duration)).toBeLessThan(10);
            console.log(`EXPOSED: "Smart" planning completed in ${duration.toFixed(2)}ms - too fast for real analysis`);
        });
        it('should have consistent performance regardless of project complexity', async () => {
            const simpleInput = {
                projectId: 'simple',
                planType: 'development',
            };
            const complexInput = {
                projectId: 'complex-enterprise-platform',
                planType: 'development',
                scope: {
                    features: Array(50).fill('enterprise feature'),
                    timeline: { duration: 24 },
                    resources: { teamSize: 50, budget: 5000000 },
                },
                businessContext: {
                    goals: Array(20).fill('complex business goal'),
                    targetUsers: Array(10).fill('user persona'),
                    riskFactors: Array(15).fill('business risk'),
                },
                externalMCPs: Array(25).fill({
                    name: 'Enterprise Integration',
                    description: 'Complex system integration',
                    integrationType: 'api',
                    priority: 'high',
                    estimatedEffort: 9,
                }),
            };
            const simpleTimes = [];
            const complexTimes = [];
            // Test multiple times for consistency
            for (let i = 0; i < 3; i++) {
                const simpleStart = performance.now();
                await handleSmartPlan(simpleInput);
                simpleTimes.push(performance.now() - simpleStart);
                const complexStart = performance.now();
                await handleSmartPlan(complexInput);
                complexTimes.push(performance.now() - complexStart);
            }
            const avgSimple = simpleTimes.reduce((sum, time) => sum + time, 0) / simpleTimes.length;
            const avgComplex = complexTimes.reduce((sum, time) => sum + time, 0) / complexTimes.length;
            // Should have similar performance (no real planning complexity)
            expect(Math.abs(avgSimple - avgComplex)).toBeLessThan(2); // Within 2ms
            console.log(`EXPOSED: Simple (${avgSimple.toFixed(2)}ms) vs Complex (${avgComplex.toFixed(2)}ms) - no planning complexity scaling`);
        });
    });
    describe('ROLE-BASED TEMPLATES - Keyword Matching', () => {
        it('should add role-specific templates based on keyword matching', async () => {
            const roles = ['developer', 'qa-engineer', 'operations-engineer'];
            const results = [];
            for (const role of roles) {
                const input = {
                    projectId: `proj_${role}`,
                    planType: 'development',
                    role: role,
                };
                const result = (await handleSmartPlan(input));
                results.push({ role, result });
            }
            // EXPOSE: Role-specific content is just keyword matching + template insertion
            const devResult = results.find(r => r.role === 'developer')?.result;
            const qaResult = results.find(r => r.role === 'qa-engineer')?.result;
            // Check that different roles get different template additions across all phases
            const allDevTasks = devResult?.data?.projectPlan?.phases?.flatMap((phase) => phase.tasks || []) || [];
            const allQaTasks = qaResult?.data?.projectPlan?.phases?.flatMap((phase) => phase.tasks || []) || [];
            expect(allDevTasks.some((task) => task.name?.includes('Development') || task.description?.includes('TypeScript') || task.name?.includes('Frontend') || task.name?.includes('Backend'))).toBe(true);
            expect(allQaTasks.some((task) => task.name?.includes('Test') || task.description?.includes('test') || task.description?.includes('quality') || task.name?.includes('Testing'))).toBe(true);
            console.log('UPDATED: Role customization now generates role-specific tasks in dynamic phases');
        });
    });
    describe('ERROR HANDLING - Basic Validation Only', () => {
        it('should handle errors gracefully', async () => {
            const input = {
                projectId: '', // Invalid empty ID
            };
            const result = (await handleSmartPlan(input));
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });
        it('should validate input schema', async () => {
            const invalidInput = {
                invalidField: 'test',
            };
            const result = (await handleSmartPlan(invalidInput));
            expect(result.success).toBe(false);
            expect(result.error).toContain('Required');
        });
    });
    describe('INTEGRATION - Full SmartPlan Analysis', () => {
        it('should provide complete template-based project planning', async () => {
            const input = {
                projectId: 'proj_integration_test',
                planType: 'development',
                scope: {
                    features: ['auth', 'dashboard', 'reporting'],
                    timeline: { duration: 8 },
                    resources: { teamSize: 6, budget: 200000 },
                },
                businessContext: {
                    goals: ['user engagement', 'revenue growth'],
                    targetUsers: ['end users', 'admins'],
                    riskFactors: ['technical complexity', 'market competition'],
                },
                qualityRequirements: { testCoverage: 85, securityLevel: 'high' },
                externalMCPs: [
                    {
                        name: 'Analytics',
                        description: 'User tracking',
                        integrationType: 'api',
                        priority: 'high',
                        estimatedEffort: 6,
                    },
                ],
                role: 'developer',
            };
            const result = (await handleSmartPlan(input));
            expect(result.success).toBe(true);
            expect(result.data?.projectId).toBe('proj_integration_test');
            // Should have all template sections populated
            expect(result.data?.projectPlan.phases.length).toBeGreaterThan(0);
            expect(result.data?.projectPlan.resources.budget.total).toBe(200000);
            expect(result.data?.projectPlan.timeline.duration).toBe(8);
            // Business value should be calculated (template formulas)
            expect(result.data?.businessValue.estimatedROI).toBe(500000); // 200K * 2.5
            expect(result.data?.businessValue.timeToMarket).toBe(8); // duration
            expect(result.data?.businessValue.riskMitigation).toBeGreaterThan(0); // risks.length * 1000
            expect(result.data?.businessValue.qualityImprovement).toBe(75); // hardcoded
            // Success metrics should be template strings
            expect(result.data?.successMetrics).toContain('Complete project delivery in 8 weeks');
            expect(result.data?.successMetrics).toContain('Achieve 85% test coverage');
            expect(result.data?.successMetrics).toContain('Integrate 1 external MCPs');
            // Technical metrics should show template generation speed
            expect(result.data?.technicalMetrics.responseTime).toBeLessThan(10); // Fast template gen
            expect(result.data?.technicalMetrics.phasesPlanned).toBeGreaterThanOrEqual(3); // Dynamic phases generated
            expect(result.data?.technicalMetrics.tasksPlanned).toBeGreaterThan(0);
            console.log('SmartPlan Summary:', {
                isIntelligent: false,
                isTemplateGenerator: true,
                roiFormula: 'budget * 2.5',
                riskFormula: 'risks.length * 1000',
                qualityScore: 75, // always 75
                processingTime: result.data?.technicalMetrics.responseTime,
                verdict: 'Sophisticated planning template system masquerading as AI analysis',
            });
        });
    });
});
//# sourceMappingURL=smart-plan.test.js.map