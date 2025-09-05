"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_begin_1 = require("../tools/smart_begin");
const smart_write_1 = require("../tools/smart_write");
const smart_finish_1 = require("../tools/smart_finish");
// Helper function to create project input
function createThreeToolProjectInput(projectName) {
    return {
        projectName,
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
}
// Helper function to generate code modules for three-tool workflow
async function generateThreeToolCodeModules(projectId) {
    const codeResults = [];
    const codeIds = [];
    // Generate API code
    const apiCodeInput = {
        projectId,
        featureDescription: 'Create a REST API for payment processing',
        codeType: 'api',
        targetRole: 'developer',
        techStack: ['typescript', 'express'],
        businessContext: {
            goals: ['payment processing', 'secure transactions'],
            targetUsers: ['customers', 'merchants'],
            priority: 'high',
        },
        qualityRequirements: {
            testCoverage: 90,
            complexity: 3,
            securityLevel: 'high',
        },
    };
    const apiCodeResult = (await (0, smart_write_1.handleSmartWrite)(apiCodeInput));
    (0, vitest_1.expect)(apiCodeResult.success).toBe(true);
    (0, vitest_1.expect)(apiCodeResult.data?.codeId).toBeDefined();
    codeResults.push(apiCodeResult);
    codeIds.push(apiCodeResult.data.codeId);
    // Generate component code
    const componentCodeInput = {
        projectId,
        featureDescription: 'Create a React component for user dashboard',
        codeType: 'component',
        targetRole: 'developer',
        techStack: ['typescript', 'react'],
        businessContext: {
            goals: ['user dashboard', 'data visualization'],
            targetUsers: ['end users'],
            priority: 'high',
        },
        qualityRequirements: {
            testCoverage: 85,
            complexity: 2,
            securityLevel: 'medium',
        },
    };
    const componentCodeResult = (await (0, smart_write_1.handleSmartWrite)(componentCodeInput));
    (0, vitest_1.expect)(componentCodeResult.success).toBe(true);
    (0, vitest_1.expect)(componentCodeResult.data?.codeId).toBeDefined();
    codeResults.push(componentCodeResult);
    codeIds.push(componentCodeResult.data.codeId);
    // Generate test code
    const testCodeInput = {
        projectId,
        featureDescription: 'Create comprehensive unit tests for the payment API',
        codeType: 'test',
        targetRole: 'developer',
        techStack: ['typescript', 'jest'],
        businessContext: {
            goals: ['test coverage', 'quality assurance'],
            targetUsers: ['developers'],
            priority: 'high',
        },
        qualityRequirements: {
            testCoverage: 95,
            complexity: 2,
            securityLevel: 'high',
        },
    };
    const testCodeResult = (await (0, smart_write_1.handleSmartWrite)(testCodeInput));
    (0, vitest_1.expect)(testCodeResult.success).toBe(true);
    (0, vitest_1.expect)(testCodeResult.data?.codeId).toBeDefined();
    codeResults.push(testCodeResult);
    codeIds.push(testCodeResult.data.codeId);
    return { codeResults, codeIds };
}
// Helper function to validate three-tool workflow
async function validateThreeToolWorkflow(projectId, codeIds) {
    const validationInput = {
        projectId,
        codeIds,
        qualityGates: {
            testCoverage: 90,
            securityScore: 95,
            complexityScore: 85,
            maintainabilityScore: 88,
        },
        businessRequirements: {
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
    return validationResult;
}
(0, vitest_1.describe)('Three Tool Workflow Integration', () => {
    (0, vitest_1.it)('should complete full Phase 1A-1B-1C workflow', async () => {
        // Step 1: Initialize project with smart_begin
        const projectInput = createThreeToolProjectInput('three-tool-test-project');
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        (0, vitest_1.expect)(projectResult.success).toBe(true);
        (0, vitest_1.expect)(projectResult.data?.projectId).toBeDefined();
        const { projectId } = projectResult.data;
        // Step 2: Generate multiple code modules with smart_write
        const { codeIds } = await generateThreeToolCodeModules(projectId);
        // Step 3: Validate project completion with smart_finish
        await validateThreeToolWorkflow(projectId, codeIds);
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
            projectId,
            featureDescription: 'Create a secure authentication service',
            codeType: 'api',
            targetRole: 'developer',
            businessContext: {
                goals: ['authentication', 'security'],
                targetUsers: ['enterprise users'],
                priority: 'high',
            },
        };
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate
        const validationInput = {
            projectId,
            codeIds: [codeId],
            businessRequirements: {
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
                projectId,
                featureDescription: 'Create a user management system',
                codeType: 'api',
                targetRole: 'developer',
                businessContext: {
                    goals: ['user management', 'authentication'],
                    targetUsers: ['end users'],
                    priority: 'medium',
                },
            };
            const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
            const { codeId } = codeResult.data;
            // Validate
            const validationInput = {
                projectId,
                codeIds: [codeId],
                businessRequirements: {
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
            projectId,
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
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate with high standards
        const validationInput = {
            projectId,
            codeIds: [codeId],
            qualityGates: {
                testCoverage: 95,
                securityScore: 98,
                complexityScore: 90,
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
            projectId,
            featureDescription: 'Create a basic CRUD API',
            codeType: 'api',
            targetRole: 'developer',
            businessContext: {
                goals: ['CRUD operations', 'API development'],
                targetUsers: ['API consumers'],
                priority: 'medium',
            },
        };
        const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
        const { codeId } = codeResult.data;
        // Validate
        const validationInput = {
            projectId,
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
