"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_begin_1 = require("../tools/smart_begin");
const smart_write_1 = require("../tools/smart_write");
const smart_finish_1 = require("../tools/smart_finish");
(0, vitest_1.describe)('Three Tool Workflow Integration', () => {
    (0, vitest_1.it)('should complete full Phase 1A-1B-1C workflow', async () => {
        // Step 1: Initialize project with smart_begin
        const projectInput = {
            projectName: 'three-tool-test-project',
            projectType: 'web-app',
            businessContext: {
                industry: 'e-commerce',
                targetUsers: 'small businesses',
                keyFeatures: ['payment processing', 'inventory management', 'user dashboard'],
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
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        (0, vitest_1.expect)(projectResult.success).toBe(true);
        (0, vitest_1.expect)(projectResult.data?.projectId).toBeDefined();
        const { projectId } = projectResult.data;
        // Step 2: Generate multiple code modules with smart_write
        const codeResults = [];
        const codeIds = [];
        // Generate API code
        const apiCodeInput = {
            codeDescription: 'Create a REST API for payment processing',
            codeType: 'module',
            targetLanguage: 'typescript',
            framework: 'express',
            requirements: {
                security: 'high',
                performance: 'high',
                maintainability: 'high',
            },
            businessContext: {
                industry: 'e-commerce',
                userRole: 'vibe-coder',
                projectId,
            },
        };
        const apiCodeResult = (await (0, smart_write_1.handleSmartWrite)(apiCodeInput));
        (0, vitest_1.expect)(apiCodeResult.success).toBe(true);
        (0, vitest_1.expect)(apiCodeResult.data?.codeId).toBeDefined();
        codeResults.push(apiCodeResult);
        codeIds.push(apiCodeResult.data.codeId);
        // Generate component code
        const componentCodeInput = {
            codeDescription: 'Create a React component for user dashboard',
            codeType: 'component',
            targetLanguage: 'typescript',
            framework: 'react',
            requirements: {
                security: 'medium',
                performance: 'high',
                maintainability: 'high',
            },
            businessContext: {
                industry: 'e-commerce',
                userRole: 'vibe-coder',
                projectId,
            },
        };
        const componentCodeResult = (await (0, smart_write_1.handleSmartWrite)(componentCodeInput));
        (0, vitest_1.expect)(componentCodeResult.success).toBe(true);
        (0, vitest_1.expect)(componentCodeResult.data?.codeId).toBeDefined();
        codeResults.push(componentCodeResult);
        codeIds.push(componentCodeResult.data.codeId);
        // Generate test code
        const testCodeInput = {
            codeDescription: 'Create comprehensive unit tests for the payment API',
            codeType: 'module',
            targetLanguage: 'typescript',
            framework: 'jest',
            requirements: {
                security: 'high',
                performance: 'medium',
                maintainability: 'high',
            },
            businessContext: {
                industry: 'e-commerce',
                userRole: 'vibe-coder',
                projectId,
            },
        };
        const testCodeResult = (await (0, smart_write_1.handleSmartWrite)(testCodeInput));
        (0, vitest_1.expect)(testCodeResult.success).toBe(true);
        (0, vitest_1.expect)(testCodeResult.data?.codeId).toBeDefined();
        codeResults.push(testCodeResult);
        codeIds.push(testCodeResult.data.codeId);
        // Step 3: Validate project completion with smart_finish
        const validationInput = {
            codeIds,
            qualityGates: {
                testCoverage: 90,
                securityScore: 95,
                performanceScore: 85,
                maintainabilityScore: 88,
            },
            businessRequirements: {
                roiTarget: 300,
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
        const validationResult = (await (0, smart_finish_1.handleSmartFinish)(validationInput));
        (0, vitest_1.expect)(validationResult.success).toBe(true);
        (0, vitest_1.expect)(validationResult.data?.projectId).toBe(projectId);
        (0, vitest_1.expect)(validationResult.data?.codeIds).toEqual(codeIds);
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.recommendations).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.nextSteps).toBeDefined();
    });
    (0, vitest_1.it)('should maintain context across all three tools', async () => {
        // Initialize project
        const projectInput = {
            projectName: 'context-test-project',
            projectType: 'api',
            businessContext: {
                industry: 'fintech',
                targetUsers: 'enterprise',
            },
        };
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        const { projectId } = projectResult.data;
        // Generate code
        const codeInput = {
            codeDescription: 'Create a secure authentication service',
            codeType: 'service',
            businessContext: {
                industry: 'fintech',
                userRole: 'vibe-coder',
                projectId,
            },
        };
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate
        const validationInput = {
            codeIds: [codeId],
            businessRequirements: {
                roiTarget: 400,
                costPrevention: 30000,
                timeSaved: 12,
                userSatisfaction: 98,
            },
        };
        const validationResult = (await (0, smart_finish_1.handleSmartFinish)(validationInput));
        (0, vitest_1.expect)(validationResult.success).toBe(true);
        (0, vitest_1.expect)(validationResult.data?.businessValue.totalCostPrevention).toBeGreaterThan(0);
        (0, vitest_1.expect)(validationResult.data?.businessValue.totalTimeSaved).toBeGreaterThan(0);
        (0, vitest_1.expect)(validationResult.data?.businessValue.userSatisfactionScore).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should handle different user roles throughout the workflow', async () => {
        const roles = ['vibe-coder', 'strategy-person', 'non-technical-founder'];
        for (const role of roles) {
            // Initialize project
            const projectInput = {
                projectName: `role-test-${role}`,
                projectType: 'web-app',
                userRole: role,
            };
            const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
            const { projectId } = projectResult.data;
            // Generate code
            const codeInput = {
                codeDescription: 'Create a user management system',
                codeType: 'module',
                businessContext: {
                    userRole: role,
                    projectId,
                },
            };
            const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
            const { codeId } = codeResult.data;
            // Validate
            const validationInput = {
                codeIds: [codeId],
                businessRequirements: {
                    roiTarget: 300,
                    costPrevention: 25000,
                    timeSaved: 8,
                    userSatisfaction: 95,
                },
            };
            const validationResult = (await (0, smart_finish_1.handleSmartFinish)(validationInput));
            (0, vitest_1.expect)(validationResult.success).toBe(true);
            (0, vitest_1.expect)(validationResult.data?.qualityScorecard.overall).toBeDefined();
        }
    });
    (0, vitest_1.it)('should maintain quality standards throughout the workflow', async () => {
        // Initialize project with high quality standards
        const projectInput = {
            projectName: 'quality-test-project',
            projectType: 'web-app',
            qualityGates: {
                testCoverage: 95,
                securityScore: 98,
                performanceScore: 90,
            },
        };
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        const { projectId } = projectResult.data;
        // Generate high-quality code
        const codeInput = {
            codeDescription: 'Create a high-quality data validation module',
            codeType: 'module',
            requirements: {
                security: 'high',
                performance: 'high',
                maintainability: 'high',
            },
            qualityGates: {
                testCoverage: 95,
                complexity: 1,
            },
            businessContext: {
                projectId,
            },
        };
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate with high standards
        const validationInput = {
            codeIds: [codeId],
            qualityGates: {
                testCoverage: 95,
                securityScore: 98,
                performanceScore: 90,
                maintainabilityScore: 95,
            },
        };
        const validationResult = (await (0, smart_finish_1.handleSmartFinish)(validationInput));
        (0, vitest_1.expect)(validationResult.success).toBe(true);
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.overall.score).toBeGreaterThan(0);
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.overall.status).toMatch(/pass|fail/);
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.quality).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.business).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard.production).toBeDefined();
    });
    (0, vitest_1.it)('should provide comprehensive next steps for the complete workflow', async () => {
        // Initialize project
        const projectInput = {
            projectName: 'next-steps-test',
            projectType: 'web-app',
        };
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        const { projectId } = projectResult.data;
        // Generate code
        const codeInput = {
            codeDescription: 'Create a basic CRUD API',
            codeType: 'module',
            businessContext: {
                projectId,
            },
        };
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate
        const validationInput = {
            codeIds: [codeId],
        };
        const validationResult = (await (0, smart_finish_1.handleSmartFinish)(validationInput));
        (0, vitest_1.expect)(validationResult.success).toBe(true);
        (0, vitest_1.expect)(validationResult.data?.recommendations.length).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(validationResult.data?.nextSteps.length).toBeGreaterThan(0);
        // Verify that next steps are relevant to the complete workflow
        const allNextSteps = [
            ...(projectResult.data?.nextSteps ?? []),
            ...(codeResult.data?.nextSteps ?? []),
            ...(validationResult.data?.nextSteps ?? []),
        ];
        (0, vitest_1.expect)(allNextSteps.some(step => step.includes('development'))).toBe(true);
        (0, vitest_1.expect)(allNextSteps.some(step => step.includes('testing'))).toBe(true);
        (0, vitest_1.expect)(allNextSteps.some(step => step.includes('deployment'))).toBe(true);
    });
});
//# sourceMappingURL=three_tool_workflow.test.js.map