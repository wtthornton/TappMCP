import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../tools/smart_begin';
import { handleSmartPlan } from '../tools/smart_plan';
import { handleSmartWrite } from '../tools/smart_write';
import { handleSmartFinish } from '../tools/smart_finish';
import { handleSmartOrchestrate } from '../tools/smart_orchestrate';
import type {
  SmartBeginResponse,
  SmartPlanResponse,
  SmartWriteResponse,
  SmartFinishResponse,
  SmartOrchestrateResponse,
} from '../types/tool-responses';

// Helper function to create project input
function createProjectInput(projectName: string) {
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

// Helper function to create plan input
function createPlanInput(projectId: string) {
  return {
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
}

// Helper function to generate code modules
async function generateCodeModules(projectId: string) {
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

  const authCodeResult = (await handleSmartWrite(authCodeInput)) as SmartWriteResponse;
  expect(authCodeResult.success).toBe(true);
  expect(authCodeResult.data?.codeId).toBeDefined();
  codeResults.push(authCodeResult);
  codeIds.push((authCodeResult.data as { codeId: string }).codeId);

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

  const dashboardCodeResult = (await handleSmartWrite(dashboardCodeInput)) as SmartWriteResponse;
  expect(dashboardCodeResult.success).toBe(true);
  expect(dashboardCodeResult.data?.codeId).toBeDefined();
  codeResults.push(dashboardCodeResult);
  codeIds.push((dashboardCodeResult.data as { codeId: string }).codeId);

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

  const testCodeResult = (await handleSmartWrite(testCodeInput)) as SmartWriteResponse;
  expect(testCodeResult.success).toBe(true);
  expect(testCodeResult.data?.codeId).toBeDefined();
  codeResults.push(testCodeResult);
  codeIds.push((testCodeResult.data as { codeId: string }).codeId);

  return { codeResults, codeIds };
}

// Helper function to validate project completion
async function validateProject(projectId: string, codeIds: string[]) {
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

  const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;
  expect(validationResult.success).toBe(true);
  expect(validationResult.data?.qualityScorecard).toBeDefined();
  expect(validationResult.data?.recommendations).toBeDefined();
  expect(validationResult.data?.nextSteps).toBeDefined();

  return validationResult;
}

// Helper function to orchestrate workflow
async function orchestrateWorkflow(projectId: string) {
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
      { name: 'GitHub', type: 'tool', priority: 'high' },
      { name: 'Docker', type: 'tool', priority: 'medium' },
      { name: 'Docker', type: 'service', priority: 'high' },
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

  const orchestrationResult = (await handleSmartOrchestrate(
    orchestrationInput
  )) as SmartOrchestrateResponse;

  if (!orchestrationResult.success) {
    console.log('Orchestration error:', orchestrationResult.error);
  }
  expect(orchestrationResult.success).toBe(true);
  expect(orchestrationResult.data?.orchestration).toBeDefined();
  expect(orchestrationResult.data?.orchestration.workflow).toBeDefined();
  expect(orchestrationResult.data?.orchestration.automation).toBeDefined();
  expect(orchestrationResult.data?.orchestration.businessValue).toBeDefined();

  return orchestrationResult;
}

describe('Complete 5-Tool Workflow Integration', () => {
  it('should complete full end-to-end workflow', async () => {
    // Step 1: Initialize project with smart_begin
    const projectInput = createProjectInput('complete-workflow-test');
    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;

    expect(projectResult.success).toBe(true);
    expect(projectResult.data?.projectId).toBeDefined();
    const { projectId } = projectResult.data as { projectId: string };

    // Step 2: Create project plan with smart_plan
    const planInput = createPlanInput(projectId);
    const planResult = (await handleSmartPlan(planInput)) as SmartPlanResponse;

    expect(planResult.success).toBe(true);
    expect(planResult.data?.projectPlan).toBeDefined();

    // Step 3: Generate multiple code modules with smart_write
    const { codeResults, codeIds } = await generateCodeModules(projectId);

    // Step 4: Validate project completion with smart_finish
    const validationResult = await validateProject(projectId, codeIds);

    // Step 5: Orchestrate complete workflow with smart_orchestrate
    const orchestrationResult = await orchestrateWorkflow(projectId);

    // Verify data consistency across all tools
    expect(projectResult.data?.projectId).toBe(projectId);
    expect(planResult.data?.projectId).toBe(projectId);
    expect(codeResults[0].data?.generatedCode).toBeDefined();
    expect(codeResults[1].data?.generatedCode).toBeDefined();
    expect(codeResults[2].data?.generatedCode).toBeDefined();
    expect(validationResult.data?.projectId).toBe(projectId);
    expect(validationResult.data?.codeIds).toEqual(codeIds);
    expect(orchestrationResult.data?.projectId).toBe(projectId);
  });

  it('should maintain context and data flow across all tools', async () => {
    // Initialize project
    const projectInput = {
      projectName: 'context-flow-test',
      projectType: 'api',
      businessContext: {
        industry: 'fintech',
        targetUsers: 'enterprise',
      },
    };

    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
    const { projectId } = projectResult.data as { projectId: string };

    // Create plan
    const planInput = {
      projectId,
      planType: 'development',
    };

    const planResult = (await handleSmartPlan(planInput)) as SmartPlanResponse;

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

    const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
    const { codeId } = codeResult.data as { codeId: string };

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

    const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;

    // Orchestrate
    const orchestrationInput = {
      projectId,
      workflowType: 'full-development',
      orchestrationScope: {
        includePlanning: true,
        includeDevelopment: true,
        includeTesting: true,
      },
      businessRequirements: {
        roiTarget: 300,
        costPrevention: 30000,
        timeSaved: 12,
        userSatisfaction: 98,
      },
    };

    const orchestrationResult = (await handleSmartOrchestrate(
      orchestrationInput
    )) as SmartOrchestrateResponse;

    // Verify business value consistency
    expect(projectResult.data?.businessValue).toBeDefined();
    expect(planResult.data?.businessValue).toBeDefined();
    expect(codeResult.data?.businessValue).toBeDefined();
    expect(validationResult.data?.businessValue).toBeDefined();
    expect(orchestrationResult.data?.orchestration.businessValue).toBeDefined();
  });

  it('should handle different workflow types', async () => {
    const workflowTypeMappings = [
      { testType: 'development', validType: 'full-development' },
      { testType: 'deployment', validType: 'migration' },
      { testType: 'maintenance', validType: 'maintenance' },
      { testType: 'optimization', validType: 'feature-development' },
    ];

    for (const { validType } of workflowTypeMappings) {
      const workflowType = validType;
      // Initialize project
      const projectInput = {
        projectName: `workflow-${workflowType}`,
        projectType: 'web-app',
      };

      const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
      const { projectId } = projectResult.data as { projectId: string };

      // Create plan
      const planInput = {
        projectId,
        planType: workflowType,
      };

      await handleSmartPlan(planInput);

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

      const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
      const { codeId } = codeResult.data as { codeId: string };

      // Validate
      const validationInput = {
        projectId,
        codeIds: [codeId],
      };

      await handleSmartFinish(validationInput);

      // Orchestrate
      const orchestrationInput = {
        projectId,
        workflowType,
        orchestrationScope: {
          includePlanning: true,
          includeDevelopment: true,
        },
      };

      const orchestrationResult = (await handleSmartOrchestrate(
        orchestrationInput
      )) as SmartOrchestrateResponse;

      expect(orchestrationResult.data?.workflowType).toBe(validType);
    }
  });

  it('should provide comprehensive quality validation', async () => {
    // Initialize project
    const projectInput = {
      projectName: 'quality-validation-test',
      projectType: 'web-app',
    };

    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
    const { projectId } = projectResult.data as { projectId: string };

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

      const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
      codeResults.push(codeResult);
      codeIds.push((codeResult.data as { codeId: string }).codeId);
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

    const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;

    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.qualityScorecard.overall.score).toBeGreaterThan(0);
    expect(validationResult.data?.qualityScorecard.overall.status).toMatch(/pass|fail/);
    expect(validationResult.data?.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
    expect(validationResult.data?.qualityScorecard.quality).toBeDefined();
    expect(validationResult.data?.qualityScorecard.business).toBeDefined();
    expect(validationResult.data?.qualityScorecard.production).toBeDefined();

    // Orchestrate with quality focus
    const orchestrationInput = {
      projectId,
      workflowType: 'full-development',
      orchestrationScope: {
        includePlanning: true,
        includeDevelopment: true,
        includeTesting: true,
        includeDeployment: true,
      },
      externalIntegrations: [
        { name: 'GitHub', type: 'tool', priority: 'high' },
        { name: 'Docker', type: 'tool', priority: 'medium' },
      ],
      businessRequirements: {
        roiTarget: 300,
        costPrevention: 25000,
        timeSaved: 8,
        userSatisfaction: 95,
      },
    };

    const orchestrationResult = (await handleSmartOrchestrate(
      orchestrationInput
    )) as SmartOrchestrateResponse;

    expect(orchestrationResult.data?.orchestration.workflow.phases.length).toBeGreaterThan(0);
    expect(orchestrationResult.data?.orchestration.workflow.integrations.length).toBeGreaterThan(0);
    expect(orchestrationResult.data?.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
    expect(orchestrationResult.data?.orchestration.automation).toBeDefined();
    expect(orchestrationResult.data?.orchestration.businessValue).toBeDefined();
  });
});
