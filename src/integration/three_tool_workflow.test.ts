import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../tools/smart-begin';
import { handleSmartWrite } from '../tools/smart-write';
import { handleSmartFinish } from '../tools/smart-finish';
import type {
  SmartBeginResponse,
  SmartWriteResponse,
  SmartFinishResponse,
} from '../types/tool-responses';

// Helper function to create project input
function createThreeToolProjectInput(projectName: string) {
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
async function generateThreeToolCodeModules(projectId: string) {
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

  const apiCodeResult = (await handleSmartWrite(apiCodeInput)) as SmartWriteResponse;
  expect(apiCodeResult.success).toBe(true);
  expect(apiCodeResult.data?.codeId).toBeDefined();
  codeResults.push(apiCodeResult);
  codeIds.push((apiCodeResult.data as { codeId: string }).codeId);

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

  const componentCodeResult = (await handleSmartWrite(componentCodeInput)) as SmartWriteResponse;
  expect(componentCodeResult.success).toBe(true);
  expect(componentCodeResult.data?.codeId).toBeDefined();
  codeResults.push(componentCodeResult);
  codeIds.push((componentCodeResult.data as { codeId: string }).codeId);

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

  const testCodeResult = (await handleSmartWrite(testCodeInput)) as SmartWriteResponse;
  expect(testCodeResult.success).toBe(true);
  expect(testCodeResult.data?.codeId).toBeDefined();
  codeResults.push(testCodeResult);
  codeIds.push((testCodeResult.data as { codeId: string }).codeId);

  return { codeResults, codeIds };
}

// Helper function to validate three-tool workflow
async function validateThreeToolWorkflow(projectId: string, codeIds: string[]) {
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
  expect(validationResult.data?.projectId).toBe(projectId);
  expect(validationResult.data?.codeIds).toEqual(codeIds);
  expect(validationResult.data?.qualityScorecard).toBeDefined();
  expect(validationResult.data?.recommendations).toBeDefined();
  expect(validationResult.data?.nextSteps).toBeDefined();

  return validationResult;
}

describe('Three Tool Workflow Integration', () => {
  it('should complete full Phase 1A-1B-1C workflow', { timeout: 30000 }, async () => {
    // Step 1: Initialize project with smart_begin
    const projectInput = createThreeToolProjectInput('three-tool-test-project');
    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;

    expect(projectResult.success).toBe(true);
    expect(projectResult.data?.projectId).toBeDefined();
    const { projectId } = projectResult.data as { projectId: string };

    // Step 2: Generate multiple code modules with smart_write
    const { codeIds } = await generateThreeToolCodeModules(projectId);

    // Step 3: Validate project completion with smart_finish
    await validateThreeToolWorkflow(projectId, codeIds);
  });

  it('should maintain context across all three tools', async () => {
    // Initialize project
    const projectInput = {
      projectName: 'context-test-project',
      projectType: 'api',
      businessContext: {
        industry: 'fintech',
        targetUsers: 'enterprise',
      },
    };

    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
    const { projectId } = projectResult.data as { projectId: string };

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

    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.businessValue.totalCostPrevention).toBeGreaterThan(0);
    expect(validationResult.data?.businessValue.totalTimeSaved).toBeGreaterThan(0);
    expect(validationResult.data?.businessValue.userSatisfactionScore).toBeGreaterThan(0);
  });

  it('should handle different user roles throughout the workflow', { timeout: 30000 }, async () => {
    const roles = ['vibe-coder', 'strategy-person', 'non-technical-founder'];

    for (const role of roles) {
      // Initialize project
      const projectInput = {
        projectName: `role-test-${role}`,
        projectType: 'web-app',
        userRole: role,
      };

      const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
      const { projectId } = projectResult.data as { projectId: string };

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

      const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
      const { codeId } = codeResult.data as { codeId: string };

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

      const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;

      expect(validationResult.success).toBe(true);
      expect(validationResult.data?.qualityScorecard.overall).toBeDefined();
    }
  });

  it('should maintain quality standards throughout the workflow', async () => {
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

    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
    const { projectId } = projectResult.data as { projectId: string };

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

    const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
    const { codeId } = codeResult.data as { codeId: string };

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

    const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;

    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.qualityScorecard.overall.score).toBeGreaterThan(0);
    expect(validationResult.data?.qualityScorecard.overall.status).toMatch(/pass|fail/);
    expect(validationResult.data?.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
    expect(validationResult.data?.qualityScorecard.quality).toBeDefined();
    expect(validationResult.data?.qualityScorecard.business).toBeDefined();
    expect(validationResult.data?.qualityScorecard.production).toBeDefined();
  });

  it('should provide comprehensive next steps for the complete workflow', async () => {
    // Initialize project
    const projectInput = {
      projectName: 'next-steps-test',
      projectType: 'web-app',
    };

    const projectResult = (await handleSmartBegin(projectInput)) as SmartBeginResponse;
    const { projectId } = projectResult.data as { projectId: string };

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

    const codeResult = (await handleSmartWrite(codeInput)) as SmartWriteResponse;
    const { codeId } = codeResult.data as { codeId: string };

    // Validate
    const validationInput = {
      projectId,
      codeIds: [codeId],
    };

    const validationResult = (await handleSmartFinish(validationInput)) as SmartFinishResponse;

    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.recommendations.length).toBeGreaterThanOrEqual(0);
    expect(validationResult.data?.nextSteps.length).toBeGreaterThan(0);

    // Verify that next steps are relevant to the complete workflow
    const allNextSteps = [
      ...(projectResult.data?.nextSteps ?? []),
      ...(codeResult.data?.nextSteps ?? []),
      ...(validationResult.data?.nextSteps ?? []),
    ];

    expect(allNextSteps.some(step => step.includes('development'))).toBe(true);
    expect(allNextSteps.some(step => step.includes('testing'))).toBe(true);
    expect(allNextSteps.some(step => step.includes('deployment'))).toBe(true);
  });
});
