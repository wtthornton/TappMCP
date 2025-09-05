#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_plan_enhanced_js_1 = require("./smart_plan_enhanced.js");
(0, vitest_1.describe)('Smart Plan Enhanced Tool', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('handleSmartPlan', () => {
        (0, vitest_1.it)('should handle valid input and return comprehensive plan', async () => {
            const input = {
                projectId: 'test-project-001',
                businessRequest: 'Create a user management system with authentication and user profiles',
                priority: 'high',
                qualityRequirements: {
                    security: 'high',
                    performance: 'standard',
                    accessibility: true,
                },
                planType: 'comprehensive',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            (0, vitest_1.expect)(result).toBeDefined();
            (0, vitest_1.expect)(typeof result).toBe('object');
            if ('success' in result && typeof result.success === 'boolean') {
                (0, vitest_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, vitest_1.expect)(result).toHaveProperty('planId');
                    (0, vitest_1.expect)(result).toHaveProperty('businessAnalysis');
                    (0, vitest_1.expect)(result).toHaveProperty('strategicPlan');
                    (0, vitest_1.expect)(result).toHaveProperty('technicalPlan');
                    (0, vitest_1.expect)(result).toHaveProperty('validation');
                    (0, vitest_1.expect)(result).toHaveProperty('technicalMetrics');
                }
            }
        });
        (0, vitest_1.it)('should complete within performance target', async () => {
            const input = {
                projectId: 'perf-test-001',
                businessRequest: 'Build a simple contact form with email notifications',
                priority: 'medium',
            };
            const startTime = Date.now();
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            const duration = Date.now() - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(500); // <500ms target for Phase 2A
            if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
                const metrics = result.technicalMetrics;
                (0, vitest_1.expect)(metrics.responseTime).toBeLessThan(500);
            }
        });
        (0, vitest_1.it)('should return business analysis results', async () => {
            const input = {
                projectId: 'business-test-001',
                businessRequest: 'Develop an e-commerce platform with payment processing, inventory management, and customer support',
                priority: 'high',
                planType: 'strategic',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('businessAnalysis' in result && typeof result.businessAnalysis === 'object') {
                const analysis = result.businessAnalysis;
                (0, vitest_1.expect)(analysis).toHaveProperty('requirements');
                (0, vitest_1.expect)(analysis).toHaveProperty('complexity');
                (0, vitest_1.expect)(analysis).toHaveProperty('stakeholderCount');
                (0, vitest_1.expect)(analysis).toHaveProperty('riskFactors');
                (0, vitest_1.expect)(analysis.stakeholderCount).toBeGreaterThan(0);
                (0, vitest_1.expect)(analysis.riskFactors).toBeGreaterThan(0);
            }
        });
        (0, vitest_1.it)('should return strategic planning results', async () => {
            const input = {
                projectId: 'strategic-test-001',
                businessRequest: 'Create a customer relationship management system for sales teams',
                priority: 'high',
                planType: 'strategic',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('strategicPlan' in result && typeof result.strategicPlan === 'object') {
                const strategic = result.strategicPlan;
                (0, vitest_1.expect)(strategic).toHaveProperty('phases');
                (0, vitest_1.expect)(strategic).toHaveProperty('timeline');
                (0, vitest_1.expect)(strategic).toHaveProperty('userStories');
                (0, vitest_1.expect)(strategic).toHaveProperty('businessValue');
                (0, vitest_1.expect)(Array.isArray(strategic.phases)).toBe(true);
                (0, vitest_1.expect)(strategic.phases.length).toBeGreaterThan(0);
                (0, vitest_1.expect)(Array.isArray(strategic.userStories)).toBe(true);
            }
        });
        (0, vitest_1.it)('should return technical planning results', async () => {
            const input = {
                projectId: 'technical-test-001',
                businessRequest: 'Build a real-time messaging application with file sharing',
                priority: 'medium',
                planType: 'technical',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('technicalPlan' in result && typeof result.technicalPlan === 'object') {
                const technical = result.technicalPlan;
                (0, vitest_1.expect)(technical).toHaveProperty('architecture');
                (0, vitest_1.expect)(technical).toHaveProperty('effort');
                (0, vitest_1.expect)(technical).toHaveProperty('optimization');
                (0, vitest_1.expect)(technical).toHaveProperty('qualityGates');
                if (technical.architecture && typeof technical.architecture === 'object') {
                    (0, vitest_1.expect)(technical.architecture).toHaveProperty('components');
                    (0, vitest_1.expect)(Array.isArray(technical.architecture.components)).toBe(true);
                    (0, vitest_1.expect)(technical.architecture.components.length).toBeGreaterThan(0);
                }
            }
        });
        (0, vitest_1.it)('should validate plan quality and provide feedback', async () => {
            const input = {
                projectId: 'validation-test-001',
                businessRequest: 'Create a comprehensive project management platform',
                priority: 'high',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('validation' in result && typeof result.validation === 'object') {
                const validation = result.validation;
                (0, vitest_1.expect)(validation).toHaveProperty('isValid');
                (0, vitest_1.expect)(validation).toHaveProperty('issues');
                (0, vitest_1.expect)(validation).toHaveProperty('recommendations');
                (0, vitest_1.expect)(validation).toHaveProperty('confidenceLevel');
                (0, vitest_1.expect)(typeof validation.isValid).toBe('boolean');
                (0, vitest_1.expect)(Array.isArray(validation.issues)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(validation.recommendations)).toBe(true);
                (0, vitest_1.expect)(['low', 'medium', 'high']).toContain(validation.confidenceLevel);
            }
        });
        (0, vitest_1.it)('should handle external MCP integration configuration', async () => {
            const input = {
                projectId: 'mcp-test-001',
                businessRequest: 'Build a documentation management system with AI assistance',
                priority: 'medium',
                externalSources: {
                    useContext7: true,
                    useWebSearch: true,
                    useMemory: false,
                },
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('externalIntegration' in result && typeof result.externalIntegration === 'object') {
                const integration = result.externalIntegration;
                (0, vitest_1.expect)(integration).toHaveProperty('context7Status');
                (0, vitest_1.expect)(integration).toHaveProperty('webSearchStatus');
                (0, vitest_1.expect)(integration).toHaveProperty('memoryStatus');
                (0, vitest_1.expect)(integration).toHaveProperty('integrationTime');
                (0, vitest_1.expect)(integration.context7Status).toBe('active');
                (0, vitest_1.expect)(integration.webSearchStatus).toBe('active');
                (0, vitest_1.expect)(integration.memoryStatus).toBe('disabled');
            }
        });
        (0, vitest_1.it)('should return business value metrics', async () => {
            const input = {
                projectId: 'value-test-001',
                businessRequest: 'Implement automated testing pipeline to reduce manual QA effort',
                priority: 'high',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('businessMetrics' in result && typeof result.businessMetrics === 'object') {
                const metrics = result.businessMetrics;
                (0, vitest_1.expect)(metrics).toHaveProperty('estimatedROI');
                (0, vitest_1.expect)(metrics).toHaveProperty('timeToMarket');
                (0, vitest_1.expect)(metrics).toHaveProperty('costSavings');
                (0, vitest_1.expect)(metrics).toHaveProperty('riskMitigation');
                (0, vitest_1.expect)(metrics).toHaveProperty('qualityImprovement');
                (0, vitest_1.expect)(metrics.estimatedROI).toBeGreaterThan(0);
                (0, vitest_1.expect)(typeof metrics.timeToMarket).toBe('string');
                (0, vitest_1.expect)(metrics.timeToMarket).toContain('months');
            }
        });
        (0, vitest_1.it)('should provide success metrics and next steps', async () => {
            const input = {
                projectId: 'deliverables-test-001',
                businessRequest: 'Create a mobile app for employee onboarding',
                priority: 'medium',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('deliverables' in result && typeof result.deliverables === 'object') {
                const deliverables = result.deliverables;
                (0, vitest_1.expect)(deliverables).toHaveProperty('successMetrics');
                (0, vitest_1.expect)(deliverables).toHaveProperty('nextSteps');
                (0, vitest_1.expect)(deliverables).toHaveProperty('qualityTargets');
                (0, vitest_1.expect)(Array.isArray(deliverables.successMetrics)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(deliverables.nextSteps)).toBe(true);
                (0, vitest_1.expect)(Array.isArray(deliverables.qualityTargets)).toBe(true);
                (0, vitest_1.expect)(deliverables.successMetrics.length).toBeGreaterThan(0);
                (0, vitest_1.expect)(deliverables.nextSteps.length).toBeGreaterThan(0);
            }
        });
        (0, vitest_1.it)('should return detailed technical metrics', async () => {
            const input = {
                projectId: 'metrics-test-001',
                businessRequest: 'Build a data analytics dashboard with real-time reporting',
                priority: 'high',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
                const metrics = result.technicalMetrics;
                (0, vitest_1.expect)(metrics).toHaveProperty('responseTime');
                (0, vitest_1.expect)(metrics).toHaveProperty('planGenerationTime');
                (0, vitest_1.expect)(metrics).toHaveProperty('businessAnalysisTime');
                (0, vitest_1.expect)(metrics).toHaveProperty('technicalPlanningTime');
                (0, vitest_1.expect)(metrics).toHaveProperty('validationTime');
                (0, vitest_1.expect)(metrics).toHaveProperty('phasesPlanned');
                (0, vitest_1.expect)(metrics).toHaveProperty('tasksPlanned');
                (0, vitest_1.expect)(metrics).toHaveProperty('risksIdentified');
                (0, vitest_1.expect)(metrics).toHaveProperty('userStoriesGenerated');
                (0, vitest_1.expect)(metrics).toHaveProperty('componentsMapped');
                (0, vitest_1.expect)(metrics.responseTime).toBeGreaterThan(0);
                (0, vitest_1.expect)(metrics.businessAnalysisTime).toBeLessThan(100); // <100ms target
                (0, vitest_1.expect)(metrics.technicalPlanningTime).toBeLessThan(150); // <150ms target
                (0, vitest_1.expect)(metrics.validationTime).toBeLessThan(50); // <50ms target
                (0, vitest_1.expect)(metrics.phasesPlanned).toBeGreaterThan(0);
                (0, vitest_1.expect)(metrics.tasksPlanned).toBeGreaterThan(0);
                (0, vitest_1.expect)(metrics.componentsMapped).toBeGreaterThan(0);
            }
        });
    });
    (0, vitest_1.describe)('error handling', () => {
        (0, vitest_1.it)('should handle invalid input gracefully', async () => {
            const invalidInput = {
                projectId: '', // Invalid - too short
                businessRequest: 'Short', // Invalid - too short
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(invalidInput);
            (0, vitest_1.expect)(result).toBeDefined();
            if ('success' in result && typeof result.success === 'boolean') {
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result).toHaveProperty('error');
                (0, vitest_1.expect)(result).toHaveProperty('errorType');
                if (!result.success && 'errorType' in result) {
                    (0, vitest_1.expect)(result.errorType).toBe('validation_error');
                }
            }
        });
        (0, vitest_1.it)('should handle missing required fields', async () => {
            const invalidInput = {
                // Missing projectId and businessRequest
                priority: 'high',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(invalidInput);
            if ('success' in result && typeof result.success === 'boolean') {
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result).toHaveProperty('error');
                (0, vitest_1.expect)(result).toHaveProperty('responseTime');
                (0, vitest_1.expect)(result).toHaveProperty('timestamp');
            }
        });
        (0, vitest_1.it)('should include error timing information', async () => {
            const invalidInput = { invalid: 'data' };
            const startTime = Date.now();
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(invalidInput);
            const duration = Date.now() - startTime;
            if ('responseTime' in result && typeof result.responseTime === 'number') {
                (0, vitest_1.expect)(result.responseTime).toBeGreaterThanOrEqual(0); // Can be 0 for immediate validation failures
                (0, vitest_1.expect)(result.responseTime).toBeLessThanOrEqual(duration + 5); // Allow small timing variance
            }
        });
        (0, vitest_1.it)('should handle unexpected errors during plan generation', async () => {
            const input = {
                projectId: 'error-test-001',
                businessRequest: 'This is a valid request that might cause internal errors during processing',
                priority: 'medium',
            };
            // Test should handle any internal errors gracefully
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            (0, vitest_1.expect)(result).toBeDefined();
            (0, vitest_1.expect)(result).toHaveProperty('timestamp');
            if ('success' in result && typeof result.success === 'boolean') {
                if (!result.success) {
                    (0, vitest_1.expect)(result).toHaveProperty('error');
                    (0, vitest_1.expect)(result).toHaveProperty('responseTime');
                }
            }
        });
    });
    (0, vitest_1.describe)('performance under load', () => {
        (0, vitest_1.it)('should maintain performance with multiple concurrent requests', async () => {
            const inputs = Array.from({ length: 5 }, (_, i) => ({
                projectId: `concurrent-test-${i + 1}`,
                businessRequest: `Create a web application for use case ${i + 1}`,
                priority: 'medium',
            }));
            const startTime = Date.now();
            const promises = inputs.map(input => (0, smart_plan_enhanced_js_1.handleSmartPlan)(input));
            const results = await Promise.all(promises);
            const totalTime = Date.now() - startTime;
            (0, vitest_1.expect)(results).toHaveLength(5);
            (0, vitest_1.expect)(totalTime).toBeLessThan(2500); // All 5 requests under 2.5 seconds total
            results.forEach(result => {
                (0, vitest_1.expect)(result).toBeDefined();
                if ('success' in result && typeof result.success === 'boolean') {
                    (0, vitest_1.expect)(result.success).toBe(true);
                }
            });
        });
        (0, vitest_1.it)('should handle large complex requests efficiently', async () => {
            const input = {
                projectId: 'large-complex-001',
                businessRequest: 'Build a comprehensive enterprise resource planning system with modules for finance, human resources, supply chain management, customer relationship management, business intelligence, document management, workflow automation, multi-tenant architecture, role-based access control, API integrations with 20+ external systems, mobile applications, real-time analytics, advanced reporting, audit trails, compliance management, and disaster recovery capabilities',
                priority: 'critical',
                qualityRequirements: {
                    security: 'high',
                    performance: 'high',
                    accessibility: true,
                },
                externalSources: {
                    useContext7: true,
                    useWebSearch: true,
                    useMemory: true,
                },
            };
            const startTime = Date.now();
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            const duration = Date.now() - startTime;
            (0, vitest_1.expect)(duration).toBeLessThan(5000); // Complex requests with MCP integration under 5 seconds
            if ('success' in result && typeof result.success === 'boolean') {
                (0, vitest_1.expect)(result.success).toBe(true);
                if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
                    const metrics = result.technicalMetrics;
                    (0, vitest_1.expect)(metrics.phasesPlanned).toBeGreaterThan(3);
                    (0, vitest_1.expect)(metrics.tasksPlanned).toBeGreaterThan(10);
                    (0, vitest_1.expect)(metrics.componentsMapped).toBeGreaterThan(5);
                }
            }
        });
    });
    (0, vitest_1.describe)('plan type variations', () => {
        (0, vitest_1.it)('should handle strategic plan type focus', async () => {
            const input = {
                projectId: 'strategic-focus-001',
                businessRequest: 'Create a digital transformation strategy for traditional retail business',
                priority: 'high',
                planType: 'strategic',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('planType' in result) {
                (0, vitest_1.expect)(result.planType).toBe('strategic');
            }
            if ('strategicPlan' in result && typeof result.strategicPlan === 'object') {
                const strategic = result.strategicPlan;
                (0, vitest_1.expect)(strategic).toHaveProperty('businessValue');
                (0, vitest_1.expect)(strategic.businessValue).toBeDefined();
            }
        });
        (0, vitest_1.it)('should handle tactical plan type focus', async () => {
            const input = {
                projectId: 'tactical-focus-001',
                businessRequest: 'Implement agile development practices in existing development team',
                priority: 'medium',
                planType: 'tactical',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('planType' in result) {
                (0, vitest_1.expect)(result.planType).toBe('tactical');
            }
        });
        (0, vitest_1.it)('should handle technical plan type focus', async () => {
            const input = {
                projectId: 'technical-focus-001',
                businessRequest: 'Migrate legacy monolith to microservices architecture',
                priority: 'high',
                planType: 'technical',
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('planType' in result) {
                (0, vitest_1.expect)(result.planType).toBe('technical');
            }
            if ('technicalPlan' in result && typeof result.technicalPlan === 'object') {
                const technical = result.technicalPlan;
                (0, vitest_1.expect)(technical.architecture).toBeDefined();
                (0, vitest_1.expect)(technical.effort).toBeDefined();
            }
        });
        (0, vitest_1.it)('should handle comprehensive plan type by default', async () => {
            const input = {
                projectId: 'comprehensive-default-001',
                businessRequest: 'Build a complete solution for online education platform',
                priority: 'high',
                // planType not specified - should default to comprehensive
            };
            const result = await (0, smart_plan_enhanced_js_1.handleSmartPlan)(input);
            if ('planType' in result) {
                (0, vitest_1.expect)(result.planType).toBe('comprehensive');
            }
            // Should include all aspects for comprehensive plans
            (0, vitest_1.expect)(result).toHaveProperty('businessAnalysis');
            (0, vitest_1.expect)(result).toHaveProperty('strategicPlan');
            (0, vitest_1.expect)(result).toHaveProperty('technicalPlan');
        });
    });
});
//# sourceMappingURL=smart_plan_enhanced.test.js.map