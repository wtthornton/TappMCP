#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const plan_generator_js_1 = require("./plan-generator.js");
(0, vitest_1.describe)('PlanGenerator', () => {
    let planGenerator;
    const defaultQualityRequirements = {
        security: 'standard',
        performance: 'standard',
        accessibility: false,
    };
    (0, vitest_1.beforeEach)(() => {
        planGenerator = new plan_generator_js_1.PlanGenerator();
    });
    (0, vitest_1.describe)('generatePlan', () => {
        (0, vitest_1.it)('should generate comprehensive plan from business request', async () => {
            const input = {
                projectId: 'test-project-001',
                businessRequest: 'Create a user management system with authentication and user profiles',
                priority: 'high',
                qualityRequirements: {
                    security: 'high',
                    performance: 'standard',
                    accessibility: true,
                },
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.id).toBe('test-project-001');
            (0, vitest_1.expect)(result.businessRequirements).toBeDefined();
            (0, vitest_1.expect)(result.architecture).toBeDefined();
            (0, vitest_1.expect)(result.phases).toBeDefined();
            (0, vitest_1.expect)(result.phases.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.userStories).toBeDefined();
            (0, vitest_1.expect)(result.risks).toBeDefined();
            (0, vitest_1.expect)(result.timeline).toBeDefined();
            (0, vitest_1.expect)(result.effort).toBeDefined();
            (0, vitest_1.expect)(result.businessValue).toBeDefined();
            (0, vitest_1.expect)(result.qualityGates).toBeDefined();
        });
        (0, vitest_1.it)('should complete plan generation within performance target', async () => {
            const input = {
                projectId: 'perf-test-001',
                businessRequest: 'Build a reporting dashboard for business analytics',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const startTime = Date.now();
            await planGenerator.generatePlan(input);
            const duration = Date.now() - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(300); // <300ms target for plan generation
        });
        (0, vitest_1.it)('should include business analysis results', async () => {
            const input = {
                projectId: 'business-test-001',
                businessRequest: 'Develop an e-commerce platform with payment processing and inventory management',
                priority: 'high',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.businessRequirements.primaryGoals.length).toBeGreaterThan(1);
            (0, vitest_1.expect)(result.businessRequirements.targetUsers).toBeDefined();
            (0, vitest_1.expect)(result.businessRequirements.successCriteria).toBeDefined();
            (0, vitest_1.expect)(result.businessRequirements.constraints).toBeDefined();
            (0, vitest_1.expect)(result.businessRequirements.riskFactors).toBeDefined();
        });
        (0, vitest_1.it)('should include technical architecture', async () => {
            const input = {
                projectId: 'tech-test-001',
                businessRequest: 'Create a real-time API with database integration',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.architecture.components.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.architecture.patterns).toBeDefined();
            (0, vitest_1.expect)(result.architecture.technologies).toBeDefined();
            (0, vitest_1.expect)(result.architecture.constraints).toBeDefined();
            const hasApiComponent = result.architecture.components.some((c) => c.name.includes('API'));
            const hasDbComponent = result.architecture.components.some((c) => c.name.includes('Database'));
            (0, vitest_1.expect)(hasApiComponent).toBe(true);
            (0, vitest_1.expect)(hasDbComponent).toBe(true);
        });
        (0, vitest_1.it)('should generate user stories with proper structure', async () => {
            const input = {
                projectId: 'stories-test-001',
                businessRequest: 'Build a task management application for teams',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.userStories.length).toBeGreaterThan(0);
            result.userStories.forEach((story) => {
                (0, vitest_1.expect)(story.id).toBeDefined();
                (0, vitest_1.expect)(story.title).toBeDefined();
                (0, vitest_1.expect)(story.asA).toBeDefined();
                (0, vitest_1.expect)(story.iWant).toBeDefined();
                (0, vitest_1.expect)(story.soThat).toBeDefined();
                (0, vitest_1.expect)(Array.isArray(story.acceptanceCriteria)).toBe(true);
                (0, vitest_1.expect)(['low', 'medium', 'high', 'critical']).toContain(story.priority);
                (0, vitest_1.expect)(story.estimatedEffort).toBeGreaterThan(0);
            });
        });
        (0, vitest_1.it)('should create project timeline with phases', async () => {
            const input = {
                projectId: 'timeline-test-001',
                businessRequest: 'Develop a customer service portal with chat support',
                priority: 'high',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.timeline.phases.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.timeline.totalDuration).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.timeline.bufferTime).toBeGreaterThan(0);
            (0, vitest_1.expect)(Array.isArray(result.timeline.criticalPath)).toBe(true);
            result.timeline.phases.forEach((phase) => {
                (0, vitest_1.expect)(phase.name).toBeDefined();
                (0, vitest_1.expect)(phase.startDate).toBeDefined();
                (0, vitest_1.expect)(phase.endDate).toBeDefined();
                (0, vitest_1.expect)(phase.duration).toBeGreaterThan(0);
                (0, vitest_1.expect)(Array.isArray(phase.tasks)).toBe(true);
            });
        });
        (0, vitest_1.it)('should estimate effort with breakdown and confidence', async () => {
            const input = {
                projectId: 'effort-test-001',
                businessRequest: 'Create a content management system with user roles',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.effort.totalHours).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.effort.breakdown).toBeDefined();
            (0, vitest_1.expect)(result.effort.breakdown.development).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.effort.breakdown.testing).toBeGreaterThan(0);
            (0, vitest_1.expect)(['low', 'medium', 'high']).toContain(result.effort.confidence);
            (0, vitest_1.expect)(Array.isArray(result.effort.assumptions)).toBe(true);
        });
        (0, vitest_1.it)('should include business value metrics', async () => {
            const input = {
                projectId: 'value-test-001',
                businessRequest: 'Build an automated reporting system to reduce manual work',
                priority: 'high',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.businessValue.estimatedROI).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.businessValue.timeToMarket).toBeGreaterThan(0);
            (0, vitest_1.expect)(result.businessValue.costSavings).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.businessValue.riskMitigation).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.businessValue.qualityImprovement).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('should create quality gates for each phase', async () => {
            const input = {
                projectId: 'quality-test-001',
                businessRequest: 'Develop a financial application with high security requirements',
                priority: 'critical',
                qualityRequirements: {
                    security: 'high',
                    performance: 'high',
                    accessibility: true,
                },
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.qualityGates.length).toBeGreaterThan(0);
            result.qualityGates.forEach((gate) => {
                (0, vitest_1.expect)(gate.phase).toBeDefined();
                (0, vitest_1.expect)(gate.criteria).toBeDefined();
                (0, vitest_1.expect)(gate.threshold).toBeDefined();
                (0, vitest_1.expect)(Array.isArray(gate.criteria)).toBe(true);
            });
            // Should include security-specific quality gates for high security
            const hasSecurityGate = result.qualityGates.some((gate) =>
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            gate.phase.toLowerCase().includes('security') ||
                gate.criteria.some((criterion) => criterion.toLowerCase().includes('security')));
            (0, vitest_1.expect)(hasSecurityGate).toBe(true);
        });
        (0, vitest_1.it)('should handle time constraints appropriately', async () => {
            const input = {
                projectId: 'time-test-001',
                businessRequest: 'Create a marketing website with CMS integration',
                priority: 'high',
                qualityRequirements: defaultQualityRequirements,
                timeConstraint: 'Must deliver in 4 weeks',
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.timeline.totalDuration).toBeLessThanOrEqual(6); // Should account for tight timeline
            (0, vitest_1.expect)(result.effort.confidence).not.toBe('high'); // Should lower confidence for tight timelines
        });
        (0, vitest_1.it)('should generate success metrics and next steps', async () => {
            const input = {
                projectId: 'success-test-001',
                businessRequest: 'Build a mobile app for customer engagement',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(Array.isArray(result.successMetrics)).toBe(true);
            (0, vitest_1.expect)(result.successMetrics.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(Array.isArray(result.nextSteps)).toBe(true);
            (0, vitest_1.expect)(result.nextSteps.length).toBeGreaterThan(0);
            result.successMetrics.forEach((metric) => {
                (0, vitest_1.expect)(typeof metric).toBe('string');
                (0, vitest_1.expect)(metric.length).toBeGreaterThan(0);
            });
            result.nextSteps.forEach((step) => {
                (0, vitest_1.expect)(typeof step).toBe('string');
                (0, vitest_1.expect)(step.length).toBeGreaterThan(0);
            });
        });
    });
    (0, vitest_1.describe)('validatePlan', () => {
        (0, vitest_1.it)('should validate a complete plan successfully', async () => {
            const input = {
                projectId: 'validation-test-001',
                businessRequest: 'Create a comprehensive project management tool',
                priority: 'high',
                qualityRequirements: defaultQualityRequirements,
            };
            const plan = await planGenerator.generatePlan(input);
            const validation = planGenerator.validatePlan(plan);
            (0, vitest_1.expect)(validation.isValid).toBe(true);
            (0, vitest_1.expect)(Array.isArray(validation.issues)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(validation.recommendations)).toBe(true);
        });
        (0, vitest_1.it)('should identify missing components in incomplete plans', () => {
            const incompletePlan = {
                id: 'incomplete-001',
                name: 'Incomplete Test Plan',
                description: 'Test plan for validation',
                businessRequirements: {
                    primaryGoals: ['Test goal'],
                    targetUsers: ['User'],
                    successCriteria: ['Success'],
                    constraints: [],
                    riskFactors: [],
                },
                // Missing required components
                architecture: { components: [], patterns: [], technologies: [], constraints: [] },
                phases: [],
                userStories: [],
                risks: [],
                timeline: { phases: [], criticalPath: [], totalDuration: 0, bufferTime: 0 },
                effort: {
                    totalHours: 0,
                    breakdown: { development: 0, testing: 0, deployment: 0, documentation: 0, research: 0 },
                    confidence: 'low',
                    assumptions: [],
                },
                businessValue: {
                    estimatedROI: 0,
                    timeToMarket: 0,
                    costSavings: 0,
                    riskMitigation: 0,
                    qualityImprovement: 0,
                },
                qualityGates: [],
                successMetrics: [],
                nextSteps: [],
                optimization: {
                    originalEffort: 0,
                    optimizedEffort: 0,
                    savingsHours: 0,
                    optimizations: [],
                    riskAdjustments: [],
                },
                complexity: {
                    overall: 'low',
                    technical: 'low',
                    business: 'low',
                    integration: 'low',
                    factors: [],
                },
            };
            const validation = planGenerator.validatePlan(incompletePlan);
            (0, vitest_1.expect)(validation.isValid).toBe(false);
            (0, vitest_1.expect)(validation.issues.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should provide recommendations for plan improvement', async () => {
            const input = {
                projectId: 'recommend-test-001',
                businessRequest: 'Simple contact form creation',
                priority: 'low',
                qualityRequirements: defaultQualityRequirements,
            };
            const plan = await planGenerator.generatePlan(input);
            const validation = planGenerator.validatePlan(plan);
            (0, vitest_1.expect)(Array.isArray(validation.recommendations)).toBe(true);
            // Low complexity projects should still get improvement recommendations
            if (validation.recommendations.length === 0) {
                // This is acceptable for very simple projects
                (0, vitest_1.expect)(plan.complexity.overall).toBe('low');
            }
        });
    });
    (0, vitest_1.describe)('performance and integration', () => {
        (0, vitest_1.it)('should maintain performance across multiple plan generations', async () => {
            const requests = [
                'Build a social media platform',
                'Create an inventory management system',
                'Develop a learning management system',
            ];
            const startTime = Date.now();
            for (let i = 0; i < requests.length; i++) {
                const input = {
                    projectId: `perf-multi-${i + 1}`,
                    businessRequest: requests[i],
                    priority: 'medium',
                    qualityRequirements: defaultQualityRequirements,
                };
                await planGenerator.generatePlan(input);
            }
            const totalTime = Date.now() - startTime;
            const averageTime = totalTime / requests.length;
            (0, vitest_1.expect)(averageTime).toBeLessThan(300); // Average should still be under 300ms
        });
        (0, vitest_1.it)('should handle complex business requests with multiple integrations', async () => {
            const input = {
                projectId: 'complex-integration-001',
                businessRequest: 'Build a comprehensive enterprise solution with CRM, ERP, real-time analytics, multi-tenant architecture, API integrations, mobile support, and advanced security compliance',
                priority: 'critical',
                qualityRequirements: {
                    security: 'high',
                    performance: 'high',
                    accessibility: true,
                },
                timeConstraint: 'Deliver MVP in 12 weeks, full system in 6 months',
            };
            const result = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(result.complexity.overall).toMatch(/high|very-high/);
            (0, vitest_1.expect)(result.architecture.components.length).toBeGreaterThan(5);
            (0, vitest_1.expect)(result.phases.length).toBeGreaterThan(3);
            (0, vitest_1.expect)(result.risks.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(result.effort.totalHours).toBeGreaterThan(500);
            (0, vitest_1.expect)(result.timeline.totalDuration).toBeGreaterThanOrEqual(8);
        });
        (0, vitest_1.it)('should generate consistent results for identical inputs', async () => {
            const input = {
                projectId: 'consistency-test-001',
                businessRequest: 'Create a blog platform with user authentication',
                priority: 'medium',
                qualityRequirements: defaultQualityRequirements,
            };
            const plan1 = await planGenerator.generatePlan(input);
            const plan2 = await planGenerator.generatePlan(input);
            (0, vitest_1.expect)(plan1.businessRequirements.primaryGoals).toEqual(plan2.businessRequirements.primaryGoals);
            (0, vitest_1.expect)(plan1.architecture.components.length).toBe(plan2.architecture.components.length);
            (0, vitest_1.expect)(plan1.phases.length).toBe(plan2.phases.length);
            (0, vitest_1.expect)(plan1.effort.totalHours).toBe(plan2.effort.totalHours);
        });
    });
});
//# sourceMappingURL=plan-generator.test.js.map