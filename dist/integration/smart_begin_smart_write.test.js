"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_begin_1 = require("../tools/smart_begin");
const smart_write_1 = require("../tools/smart_write");
(0, vitest_1.describe)('Smart Begin + Smart Write Integration', () => {
    (0, vitest_1.it)('should complete full Phase 1A-1B workflow', async () => {
        // Step 1: Initialize project with smart_begin
        const beginInput = {
            projectName: 'integration-test-project',
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
        const beginResult = (await (0, smart_begin_1.handleSmartBegin)(beginInput));
        (0, vitest_1.expect)(beginResult.success).toBe(true);
        (0, vitest_1.expect)(beginResult.data).toBeDefined();
        (0, vitest_1.expect)(beginResult.data?.projectId).toBeDefined();
        (0, vitest_1.expect)(beginResult.data?.projectStructure).toBeDefined();
        (0, vitest_1.expect)(beginResult.data?.nextSteps).toBeDefined();
        // Step 2: Generate code with smart_write using project context
        const writeInput = {
            projectId: beginResult.data?.projectId || 'proj_test_123',
            featureDescription: 'Create a payment processing module for the e-commerce platform',
            codeType: 'api',
            targetRole: 'developer',
            techStack: ['typescript', 'express'],
            businessContext: {
                goals: ['secure payments', 'user experience'],
                targetUsers: ['customers', 'merchants'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 90,
                complexity: 2,
                securityLevel: 'high',
            },
        };
        const writeResult = (await (0, smart_write_1.handleSmartWrite)(writeInput));
        (0, vitest_1.expect)(writeResult.success).toBe(true);
        (0, vitest_1.expect)(writeResult.data).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.codeId).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.generatedCode).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.nextSteps).toBeDefined();
        // Step 3: Verify integration between tools
        (0, vitest_1.expect)(beginResult.data?.projectId).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.codeId).toContain('payment_processing');
        (0, vitest_1.expect)(writeResult.data?.generatedCode.files[0].path).toContain('payment-processing');
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.testCoverage).toBe(90);
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.securityScore).toBe(95);
    });
    (0, vitest_1.it)('should maintain context between smart_begin and smart_write', async () => {
        // Initialize project
        const beginInput = {
            projectName: 'context-test-project',
            projectType: 'api',
            businessContext: {
                industry: 'fintech',
                targetUsers: 'enterprise',
            },
            technicalRequirements: {
                backend: 'Node.js',
                database: 'MongoDB',
            },
        };
        const beginResult = (await (0, smart_begin_1.handleSmartBegin)(beginInput));
        (0, vitest_1.expect)(beginResult.success).toBe(true);
        (0, vitest_1.expect)(beginResult.data?.projectStructure).toBeDefined();
        // Generate code that should align with project context
        const writeInput = {
            projectId: beginResult.data?.projectId || 'proj_test_456',
            featureDescription: 'Create a secure authentication service for the fintech API',
            codeType: 'api',
            targetRole: 'developer',
            techStack: ['typescript', 'express'],
            businessContext: {
                goals: ['secure authentication', 'user management'],
                targetUsers: ['enterprise users'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 95,
                complexity: 3,
                securityLevel: 'high',
            },
        };
        const writeResult = (await (0, smart_write_1.handleSmartWrite)(writeInput));
        (0, vitest_1.expect)(writeResult.success).toBe(true);
        (0, vitest_1.expect)(writeResult.data?.generatedCode.files[0].content).toContain('fintech');
        (0, vitest_1.expect)(writeResult.data?.generatedCode.files[0].content).toContain('authentication');
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.securityScore).toBeGreaterThan(90);
    });
    (0, vitest_1.it)('should handle different user roles in the workflow', async () => {
        const roles = ['vibe-coder', 'strategy-person', 'non-technical-founder'];
        for (const role of roles) {
            // Initialize project
            const beginInput = {
                projectName: `role-test-${role}`,
                projectType: 'web-app',
                userRole: role,
            };
            const beginResult = (await (0, smart_begin_1.handleSmartBegin)(beginInput));
            (0, vitest_1.expect)(beginResult.success).toBe(true);
            (0, vitest_1.expect)(beginResult.data?.nextSteps).toBeDefined();
            // Generate code
            const writeInput = {
                projectId: beginResult.data?.projectId || `proj_test_${role}`,
                featureDescription: 'Create a user management system',
                codeType: 'api',
                targetRole: 'developer',
                businessContext: {
                    goals: ['user management', 'authentication'],
                    targetUsers: ['end users'],
                    priority: 'medium',
                },
            };
            const writeResult = (await (0, smart_write_1.handleSmartWrite)(writeInput));
            (0, vitest_1.expect)(writeResult.success).toBe(true);
            (0, vitest_1.expect)(writeResult.data?.generatedCode.files[0].content).toContain(role);
        }
    });
    (0, vitest_1.it)('should maintain quality standards throughout the workflow', async () => {
        // Initialize project with high quality standards
        const beginInput = {
            projectName: 'quality-test-project',
            projectType: 'web-app',
            qualityGates: {
                testCoverage: 95,
                securityScore: 98,
                performanceScore: 90,
            },
        };
        const beginResult = (await (0, smart_begin_1.handleSmartBegin)(beginInput));
        (0, vitest_1.expect)(beginResult.success).toBe(true);
        (0, vitest_1.expect)(beginResult.data?.qualityGates).toBeDefined();
        // Generate code that should meet the quality standards
        const writeInput = {
            projectId: beginResult.data?.projectId || 'proj_test_quality',
            featureDescription: 'Create a high-quality data validation module',
            codeType: 'api',
            targetRole: 'developer',
            techStack: ['typescript'],
            businessContext: {
                goals: ['data validation', 'quality assurance'],
                targetUsers: ['developers'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 95,
                complexity: 1,
                securityLevel: 'high',
            },
        };
        const writeResult = (await (0, smart_write_1.handleSmartWrite)(writeInput));
        (0, vitest_1.expect)(writeResult.success).toBe(true);
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.testCoverage).toBe(95);
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.complexity).toBe(1);
        (0, vitest_1.expect)(writeResult.data?.qualityMetrics.securityScore).toBeGreaterThan(90);
    });
    (0, vitest_1.it)('should provide appropriate next steps for the integrated workflow', async () => {
        // Initialize project
        const beginInput = {
            projectName: 'next-steps-test',
            projectType: 'web-app',
        };
        const beginResult = (await (0, smart_begin_1.handleSmartBegin)(beginInput));
        (0, vitest_1.expect)(beginResult.success).toBe(true);
        (0, vitest_1.expect)(beginResult.data?.nextSteps).toBeDefined();
        (0, vitest_1.expect)(beginResult.data?.nextSteps.length).toBeGreaterThan(0);
        // Generate code
        const writeInput = {
            projectId: beginResult.data?.projectId || 'proj_test_next_steps',
            featureDescription: 'Create a basic CRUD API',
            codeType: 'api',
            targetRole: 'developer',
            businessContext: {
                goals: ['CRUD operations', 'API development'],
                targetUsers: ['API consumers'],
                priority: 'medium',
            },
        };
        const writeResult = (await (0, smart_write_1.handleSmartWrite)(writeInput));
        (0, vitest_1.expect)(writeResult.success).toBe(true);
        (0, vitest_1.expect)(writeResult.data?.nextSteps).toBeDefined();
        (0, vitest_1.expect)(writeResult.data?.nextSteps.length).toBeGreaterThan(0);
        // Verify that next steps are relevant to the workflow
        const allNextSteps = [
            ...(beginResult.data?.nextSteps ?? []),
            ...(writeResult.data?.nextSteps ?? []),
        ];
        (0, vitest_1.expect)(allNextSteps.some(step => step.includes('development'))).toBe(true);
        (0, vitest_1.expect)(allNextSteps.some(step => step.includes('testing'))).toBe(true);
    });
});
//# sourceMappingURL=smart_begin_smart_write.test.js.map