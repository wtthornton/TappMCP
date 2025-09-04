"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const smart_begin_1 = require("../tools/smart_begin");
const smart_plan_1 = require("../tools/smart_plan");
const smart_write_1 = require("../tools/smart_write");
const smart_finish_1 = require("../tools/smart_finish");
const smart_orchestrate_1 = require("../tools/smart_orchestrate");
(0, vitest_1.describe)('Complete 5-Tool Workflow Integration', () => {
    (0, vitest_1.it)('should complete full end-to-end workflow', async () => {
        // Step 1: Initialize project with smart_begin
        const projectInput = {
            projectName: 'complete-workflow-test',
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
        // Step 2: Create project plan with smart_plan
        const planInput = {
            projectId,
            planType: 'development',
            projectScope: {
                phases: ['planning', 'development', 'testing', 'deployment'],
                duration: 6,
                complexity: 'high',
            },
            resources: {
                team: [
                    { role: 'developer', count: 3, skills: ['typescript', 'react'] },
                    { role: 'designer', count: 1, skills: ['ui/ux', 'figma'] },
                ],
                budget: 200000,
                tools: ['vscode', 'git', 'docker'],
            },
            qualityGates: {
                testCoverage: 90,
                securityScore: 95,
                performanceScore: 85,
            },
            businessRequirements: {
                roiTarget: 300,
                timeToMarket: 6,
                riskTolerance: 'medium',
            },
        };
        const planResult = (await (0, smart_plan_1.handleSmartPlan)(planInput));
        (0, vitest_1.expect)(planResult.success).toBe(true);
        (0, vitest_1.expect)(planResult.data?.projectPlan).toBeDefined();
        // Step 3: Generate multiple code modules with smart_write
        const codeResults = [];
        const codeIds = [];
        // Generate authentication code
        const authCodeInput = {
            projectId,
            featureDescription: 'Create a secure authentication system with JWT tokens',
            codeType: 'api',
            targetRole: 'developer',
            techStack: ['typescript', 'express'],
            businessContext: {
                goals: ['authentication', 'security'],
                targetUsers: ['customers', 'merchants'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 95,
                complexity: 3,
                securityLevel: 'high',
            },
        };
        const authCodeResult = (await (0, smart_write_1.handleSmartWrite)(authCodeInput));
        (0, vitest_1.expect)(authCodeResult.success).toBe(true);
        (0, vitest_1.expect)(authCodeResult.data?.codeId).toBeDefined();
        codeResults.push(authCodeResult);
        codeIds.push(authCodeResult.data.codeId);
        // Generate dashboard code
        const dashboardCodeInput = {
            projectId,
            featureDescription: 'Create a React dashboard component for inventory management',
            codeType: 'component',
            targetRole: 'developer',
            techStack: ['typescript', 'react'],
            businessContext: {
                goals: ['inventory management', 'dashboard'],
                targetUsers: ['merchants', 'admins'],
                priority: 'high',
            },
            qualityRequirements: {
                testCoverage: 85,
                complexity: 2,
                securityLevel: 'medium',
            },
        };
        const dashboardCodeResult = (await (0, smart_write_1.handleSmartWrite)(dashboardCodeInput));
        (0, vitest_1.expect)(dashboardCodeResult.success).toBe(true);
        (0, vitest_1.expect)(dashboardCodeResult.data?.codeId).toBeDefined();
        codeResults.push(dashboardCodeResult);
        codeIds.push(dashboardCodeResult.data.codeId);
        // Generate test code
        const testCodeInput = {
            projectId,
            featureDescription: 'Create comprehensive unit tests for the authentication system',
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
        // Step 4: Validate project completion with smart_finish
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
        (0, vitest_1.expect)(validationResult.data?.qualityScorecard).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.recommendations).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.nextSteps).toBeDefined();
        // Step 5: Orchestrate complete workflow with smart_orchestrate
        const orchestrationInput = {
            projectId,
            workflowType: 'full-development',
            orchestrationScope: {
                includePlanning: true,
                includeDevelopment: true,
                includeTesting: true,
                includeDeployment: true,
                includeMonitoring: true,
            },
            externalIntegrations: [
                { name: 'GitHub', type: 'version-control', priority: 1 },
                { name: 'Docker', type: 'containerization', priority: 2 },
                { name: 'AWS', type: 'cloud', priority: 3 },
            ],
            qualityGates: {
                testCoverage: 90,
                securityScore: 95,
                performanceScore: 85,
            },
            businessRequirements: {
                roiTarget: 300,
                costPrevention: 25000,
                timeSaved: 8,
                userSatisfaction: 95,
            },
        };
        const orchestrationResult = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(orchestrationInput));
        (0, vitest_1.expect)(orchestrationResult.success).toBe(true);
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration).toBeDefined();
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.workflow).toBeDefined();
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.automation).toBeDefined();
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.businessValue).toBeDefined();
        // Verify data consistency across all tools
        (0, vitest_1.expect)(projectResult.data?.projectId).toBe(projectId);
        (0, vitest_1.expect)(planResult.data?.projectId).toBe(projectId);
        (0, vitest_1.expect)(authCodeResult.data?.generatedCode).toBeDefined();
        (0, vitest_1.expect)(dashboardCodeResult.data?.generatedCode).toBeDefined();
        (0, vitest_1.expect)(testCodeResult.data?.generatedCode).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.projectId).toBe(projectId);
        (0, vitest_1.expect)(validationResult.data?.codeIds).toEqual(codeIds);
        (0, vitest_1.expect)(orchestrationResult.data?.projectId).toBe(projectId);
    });
    (0, vitest_1.it)('should maintain context and data flow across all tools', async () => {
        // Initialize project
        const projectInput = {
            projectName: 'context-flow-test',
            projectType: 'api',
            businessContext: {
                industry: 'fintech',
                targetUsers: 'enterprise',
            },
        };
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        const { projectId } = projectResult.data;
        // Create plan
        const planInput = {
            projectId,
            planType: 'development',
        };
        const planResult = (await (0, smart_plan_1.handleSmartPlan)(planInput));
        // Generate code
        const codeInput = {
            projectId,
            featureDescription: 'Create a secure payment processing API',
            codeType: 'api',
            targetRole: 'developer',
            businessContext: {
                goals: ['payment processing', 'security'],
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
        // Orchestrate
        const orchestrationInput = {
            projectId,
            workflowType: 'development',
            orchestrationScope: {
                includePlanning: true,
                includeDevelopment: true,
                includeTesting: true,
            },
        };
        const orchestrationResult = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(orchestrationInput));
        // Verify business value consistency
        (0, vitest_1.expect)(projectResult.data?.businessValue).toBeDefined();
        (0, vitest_1.expect)(planResult.data?.businessValue).toBeDefined();
        (0, vitest_1.expect)(codeResult.data?.businessValue).toBeDefined();
        (0, vitest_1.expect)(validationResult.data?.businessValue).toBeDefined();
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.businessValue).toBeDefined();
    });
    (0, vitest_1.it)('should handle different workflow types', async () => {
        const workflowTypes = ['development', 'deployment', 'maintenance', 'optimization'];
        for (const workflowType of workflowTypes) {
            // Initialize project
            const projectInput = {
                projectName: `workflow-${workflowType}`,
                projectType: 'web-app',
            };
            const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
            const { projectId } = projectResult.data;
            // Create plan
            const planInput = {
                projectId,
                planType: workflowType,
            };
            await (0, smart_plan_1.handleSmartPlan)(planInput);
            // Generate code
            const codeInput = {
                projectId,
                featureDescription: `Create ${workflowType} related functionality`,
                codeType: 'api',
                targetRole: 'developer',
                businessContext: {
                    goals: [`${workflowType} functionality`],
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
            };
            await (0, smart_finish_1.handleSmartFinish)(validationInput);
            // Orchestrate
            const orchestrationInput = {
                projectId,
                workflowType,
                orchestrationScope: {
                    includePlanning: true,
                    includeDevelopment: true,
                },
            };
            const orchestrationResult = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(orchestrationInput));
            (0, vitest_1.expect)(orchestrationResult.data?.workflowType).toBe(workflowType);
        }
    });
    (0, vitest_1.it)('should provide comprehensive quality validation', async () => {
        // Initialize project
        const projectInput = {
            projectName: 'quality-validation-test',
            projectType: 'web-app',
        };
        const projectResult = (await (0, smart_begin_1.handleSmartBegin)(projectInput));
        const { projectId } = projectResult.data;
        // Generate multiple code modules
        const codeResults = [];
        const codeIds = [];
        for (let i = 0; i < 3; i++) {
            const codeInput = {
                projectId,
                featureDescription: `Create module ${i + 1} for the application`,
                codeType: 'api',
                targetRole: 'developer',
                businessContext: {
                    goals: [`module ${i + 1} functionality`],
                    targetUsers: ['end users'],
                    priority: 'medium',
                },
            };
            const codeResult = (await (0, smart_write_1.handleSmartWrite)(codeInput));
            codeResults.push(codeResult);
            codeIds.push(codeResult.data.codeId);
        }
        // Validate with comprehensive quality gates
        const validationInput = {
            projectId,
            codeIds,
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
        // Orchestrate with quality focus
        const orchestrationInput = {
            projectId,
            workflowType: 'development',
            orchestrationScope: {
                includePlanning: true,
                includeDevelopment: true,
                includeTesting: true,
                includeDeployment: true,
            },
        };
        const orchestrationResult = (await (0, smart_orchestrate_1.handleSmartOrchestrate)(orchestrationInput));
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.workflow.phases.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.workflow.integrations.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.automation).toBeDefined();
        (0, vitest_1.expect)(orchestrationResult.data?.orchestration.businessValue).toBeDefined();
    });
});
//# sourceMappingURL=complete_workflow.test.js.map
