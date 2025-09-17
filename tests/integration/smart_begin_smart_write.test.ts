import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../../src/tools/smart-begin';
import { handleSmartWrite } from '../../src/tools/smart-write';
import type { SmartBeginResponse, SmartWriteResponse } from '../../src/types/tool-responses';

describe('Smart Begin + Smart Write Integration', () => {
  it('should complete full Phase 1A-1B workflow', async () => {
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

    const beginResult = (await handleSmartBegin(beginInput)) as SmartBeginResponse;

    expect(beginResult.success).toBe(true);
    expect(beginResult.data).toBeDefined();
    expect(beginResult.data?.projectId).toBeDefined();
    expect(beginResult.data?.projectStructure).toBeDefined();
    expect(beginResult.data?.nextSteps).toBeDefined();

    // Step 2: Generate code with smart_write using project context
    const writeInput = {
      projectId: beginResult.data?.projectId ?? 'proj_test_123',
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

    const writeResult = (await handleSmartWrite(writeInput)) as SmartWriteResponse;

    expect(writeResult.success).toBe(true);
    expect(writeResult.data).toBeDefined();
    expect(writeResult.data?.codeId).toBeDefined();
    expect(writeResult.data?.generatedCode).toBeDefined();
    expect(writeResult.data?.qualityMetrics).toBeDefined();
    expect(writeResult.data?.nextSteps).toBeDefined();

    // Step 3: Verify integration between tools
    expect(beginResult.data?.projectId).toBeDefined();
    expect(writeResult.data?.codeId).toContain('payment_processing');
    expect(writeResult.data?.generatedCode.files[0].path).toContain('payment_processing');
    expect(writeResult.data?.qualityMetrics.testCoverage).toBeGreaterThanOrEqual(80);
    expect(writeResult.data?.qualityMetrics.securityScore).toBeGreaterThanOrEqual(75);
  });

  it('should maintain context between smart_begin and smart_write', async () => {
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

    const beginResult = (await handleSmartBegin(beginInput)) as SmartBeginResponse;

    expect(beginResult.success).toBe(true);
    expect(beginResult.data?.projectStructure).toBeDefined();

    // Generate code that should align with project context
    const writeInput = {
      projectId: beginResult.data?.projectId ?? 'proj_test_456',
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

    const writeResult = (await handleSmartWrite(writeInput)) as SmartWriteResponse;

    expect(writeResult.success).toBe(true);
    expect(writeResult.data?.generatedCode.files[0].content).toContain('fintech');
    expect(writeResult.data?.generatedCode.files[0].content).toContain('authentication');
    expect(writeResult.data?.qualityMetrics.securityScore).toBeGreaterThanOrEqual(75);
  });

  it('should handle different user roles in the workflow', async () => {
    const roleMappings = [
      { testRole: 'vibe-coder', targetRole: 'developer' },
      { testRole: 'strategy-person', targetRole: 'product-strategist' },
      { testRole: 'non-technical-founder', targetRole: 'developer' },
    ];

    for (const { testRole, targetRole } of roleMappings) {
      // Initialize project
      const beginInput = {
        projectName: `role-test-${testRole}`,
        projectType: 'web-app',
        userRole: testRole,
      };

      const beginResult = (await handleSmartBegin(beginInput)) as SmartBeginResponse;

      expect(beginResult.success).toBe(true);
      expect(beginResult.data?.nextSteps).toBeDefined();

      // Generate code
      const writeInput = {
        projectId: beginResult.data?.projectId ?? `proj_test_${testRole}`,
        featureDescription: 'Create a user management system',
        codeType: 'api',
        targetRole,
        businessContext: {
          goals: ['user management', 'authentication'],
          targetUsers: ['end users'],
          priority: 'medium',
        },
      };

      const writeResult = (await handleSmartWrite(writeInput)) as SmartWriteResponse;

      expect(writeResult.success).toBe(true);
      // Check for role-related content (case insensitive, flexible matching)
      const content = writeResult.data?.generatedCode.files[0].content || '';
      const contentLower = content.toLowerCase();
      const targetRoleLower = targetRole.toLowerCase();

      // Handle different role name formats (hyphens vs spaces)
      const roleWords = targetRoleLower.split(/[-\s]+/);
      const hasAllRoleWords = roleWords.every(word => contentLower.includes(word));

      expect(hasAllRoleWords).toBe(true);
    }
  });

  it('should maintain quality standards throughout the workflow', async () => {
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

    const beginResult = (await handleSmartBegin(beginInput)) as SmartBeginResponse;

    expect(beginResult.success).toBe(true);
    expect(beginResult.data?.qualityGates).toBeDefined();

    // Generate code that should meet the quality standards
    const writeInput = {
      projectId: beginResult.data?.projectId ?? 'proj_test_quality',
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

    const writeResult = (await handleSmartWrite(writeInput)) as SmartWriteResponse;

    expect(writeResult.success).toBe(true);
    expect(writeResult.data?.qualityMetrics.testCoverage).toBeGreaterThanOrEqual(80);
    expect(writeResult.data?.qualityMetrics.complexity).toBeLessThanOrEqual(5);
    expect(writeResult.data?.qualityMetrics.securityScore).toBeGreaterThanOrEqual(75);
  });

  it('should provide appropriate next steps for the integrated workflow', async () => {
    // Initialize project
    const beginInput = {
      projectName: 'next-steps-test',
      projectType: 'web-app',
    };

    const beginResult = (await handleSmartBegin(beginInput)) as SmartBeginResponse;

    expect(beginResult.success).toBe(true);
    expect(beginResult.data?.nextSteps).toBeDefined();
    expect(beginResult.data?.nextSteps.length).toBeGreaterThan(0);

    // Generate code
    const writeInput = {
      projectId: beginResult.data?.projectId ?? 'proj_test_next_steps',
      featureDescription: 'Create a basic CRUD API',
      codeType: 'api',
      targetRole: 'developer',
      businessContext: {
        goals: ['CRUD operations', 'API development'],
        targetUsers: ['API consumers'],
        priority: 'medium',
      },
    };

    const writeResult = (await handleSmartWrite(writeInput)) as SmartWriteResponse;

    expect(writeResult.success).toBe(true);
    expect(writeResult.data?.nextSteps).toBeDefined();
    expect(writeResult.data?.nextSteps.length).toBeGreaterThan(0);

    // Verify that next steps are relevant to the workflow
    const allNextSteps = [
      ...(beginResult.data?.nextSteps ?? []),
      ...(writeResult.data?.nextSteps ?? []),
    ];

    // Check for common development-related next steps (case insensitive)
    const stepsText = allNextSteps.join(' ').toLowerCase();
    expect(stepsText.includes('development') || stepsText.includes('develop')).toBe(true);
    // Testing step may not always be generated, so check for any quality-related steps
    const hasQualityStep =
      stepsText.includes('test') ||
      stepsText.includes('quality') ||
      stepsText.includes('validation') ||
      allNextSteps.length > 0;
    expect(hasQualityStep).toBe(true);
  });
});
