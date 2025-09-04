import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../tools/smart_begin';
import { handleSmartWrite } from '../tools/smart_write';
import { handleSmartFinish } from '../tools/smart_finish';

describe('Phase 1C Integration: Complete 3-Tool Workflow', () => {
  describe('end-to-end workflow integration', () => {
    it('should complete full workflow from project initialization to quality validation', async () => {
      // Step 1: Initialize project with smart_begin
      const projectInput = {
        projectName: 'complete-workflow-test',
        description: 'Test project for complete 3-tool workflow validation',
        techStack: ['typescript', 'nodejs', 'react'],
        targetUsers: ['strategy-people', 'vibe-coders', 'non-technical-founders'],
        businessGoals: ['cost-reduction', 'time-savings', 'quality-improvement'],
      };

      const projectResult = await handleSmartBegin(projectInput);
      expect(projectResult.success).toBe(true);
      expect(projectResult.data.projectId).toBeDefined();
      const projectId = projectResult.data.projectId;

      // Step 2: Generate multiple code units with smart_write
      const codeResults = [];
      const codeIds = [];

      // Generate API code
      const apiCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'user authentication API',
        targetRole: 'developer',
        codeType: 'api',
        techStack: projectInput.techStack,
        businessContext: {
          goals: projectInput.businessGoals,
          targetUsers: projectInput.targetUsers,
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 90,
          complexity: 3,
          securityLevel: 'high',
        },
      });

      expect(apiCodeResult.success).toBe(true);
      expect(apiCodeResult.data.codeId).toBeDefined();
      codeResults.push(apiCodeResult);
      codeIds.push(apiCodeResult.data.codeId);

      // Generate component code
      const componentCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'user dashboard component',
        targetRole: 'designer',
        codeType: 'component',
        techStack: projectInput.techStack,
        businessContext: {
          goals: projectInput.businessGoals,
          targetUsers: projectInput.targetUsers,
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 85,
          complexity: 4,
          securityLevel: 'medium',
        },
      });

      expect(componentCodeResult.success).toBe(true);
      expect(componentCodeResult.data.codeId).toBeDefined();
      codeResults.push(componentCodeResult);
      codeIds.push(componentCodeResult.data.codeId);

      // Generate test code
      const testCodeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'integration tests',
        targetRole: 'qa-engineer',
        codeType: 'test',
        techStack: projectInput.techStack,
        businessContext: {
          goals: projectInput.businessGoals,
          targetUsers: projectInput.targetUsers,
          priority: 'medium',
        },
        qualityRequirements: {
          testCoverage: 95,
          complexity: 2,
          securityLevel: 'high',
        },
      });

      expect(testCodeResult.success).toBe(true);
      expect(testCodeResult.data.codeId).toBeDefined();
      codeResults.push(testCodeResult);
      codeIds.push(testCodeResult.data.codeId);

      // Step 3: Validate complete project with smart_finish
      const validationResult = await handleSmartFinish({
        projectId,
        codeIds,
        qualityGates: {
          testCoverage: 85,
          securityScore: 90,
          complexityScore: 70,
          maintainabilityScore: 70,
        },
        businessRequirements: {
          costPrevention: 15000,
          timeSaved: 4,
          userSatisfaction: 90,
        },
        productionReadiness: {
          securityScan: true,
          performanceTest: true,
          documentationComplete: true,
          deploymentReady: true,
        },
      });

      expect(validationResult.success).toBe(true);
      expect(validationResult.data.projectId).toBe(projectId);
      expect(validationResult.data.codeIds).toEqual(codeIds);
      expect(validationResult.data.qualityScorecard).toBeDefined();
      expect(validationResult.data.recommendations).toBeDefined();
      expect(validationResult.data.nextSteps).toBeDefined();
    });

    it('should maintain context and business value across all three tools', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'context-preservation-test',
        techStack: ['typescript', 'react'],
        targetUsers: ['strategy-people'],
        businessGoals: ['revenue-growth'],
      });

      expect(projectResult.success).toBe(true);
      const projectId = projectResult.data.projectId;

      // Generate code
      const codeResult = await handleSmartWrite({
        projectId,
        featureDescription: 'revenue tracking feature',
        targetRole: 'product-strategist',
        codeType: 'function',
        businessContext: {
          goals: ['revenue-growth'],
          targetUsers: ['strategy-people'],
          priority: 'high',
        },
      });

      expect(codeResult.success).toBe(true);
      const codeId = codeResult.data.codeId;

      // Validate project
      const validationResult = await handleSmartFinish({
        projectId,
        codeIds: [codeId],
        businessRequirements: {
          costPrevention: 10000,
          timeSaved: 2,
          userSatisfaction: 90,
        },
      });

      expect(validationResult.success).toBe(true);
      expect(validationResult.data.businessValue.totalCostPrevention).toBeGreaterThan(0);
      expect(validationResult.data.businessValue.totalTimeSaved).toBeGreaterThan(0);
      expect(validationResult.data.businessValue.userSatisfactionScore).toBeGreaterThan(0);
    });

    it('should meet performance requirements for complete workflow', async () => {
      const startTime = Date.now();

      // Complete workflow
      const projectResult = await handleSmartBegin({
        projectName: 'performance-workflow-test',
        techStack: ['typescript'],
      });

      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'performance test feature',
        targetRole: 'developer',
      });

      const validationResult = await handleSmartFinish({
        projectId: projectResult.data.projectId,
        codeIds: [codeResult.data.codeId],
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(projectResult.success).toBe(true);
      expect(codeResult.success).toBe(true);
      expect(validationResult.success).toBe(true);
      expect(totalTime).toBeLessThan(300); // <300ms for complete workflow
    });

    it('should handle different user personas across all tools', async () => {
      const personas = [
        { role: 'developer', codeType: 'function' },
        { role: 'product-strategist', codeType: 'component' },
        { role: 'designer', codeType: 'component' },
        { role: 'qa-engineer', codeType: 'test' },
        { role: 'operations-engineer', codeType: 'config' },
      ];

      for (const persona of personas) {
        // Initialize project
        const projectResult = await handleSmartBegin({
          projectName: `persona-workflow-${persona.role}`,
          techStack: ['typescript'],
          targetUsers: [persona.role],
        });

        expect(projectResult.success).toBe(true);

        // Generate code
        const codeResult = await handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: `${persona.role} workflow feature`,
          targetRole: persona.role,
          codeType: persona.codeType,
        });

        expect(codeResult.success).toBe(true);

        // Validate project
        const validationResult = await handleSmartFinish({
          projectId: projectResult.data.projectId,
          codeIds: [codeResult.data.codeId],
        });

        expect(validationResult.success).toBe(true);
        expect(validationResult.data.qualityScorecard.overall).toBeDefined();
      }
    });

    it('should provide comprehensive quality scorecard for complete project', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'scorecard-test',
        techStack: ['typescript', 'react', 'nodejs'],
        targetUsers: ['strategy-people', 'vibe-coders'],
        businessGoals: ['cost-reduction', 'time-savings', 'quality-improvement'],
      });

      // Generate multiple code units
      const codeResults = await Promise.all([
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'authentication system',
          targetRole: 'developer',
          codeType: 'api',
        }),
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'user interface',
          targetRole: 'designer',
          codeType: 'component',
        }),
        handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: 'test suite',
          targetRole: 'qa-engineer',
          codeType: 'test',
        }),
      ]);

      const codeIds = codeResults.map(result => result.data.codeId);

      // Validate complete project
      const validationResult = await handleSmartFinish({
        projectId: projectResult.data.projectId,
        codeIds,
        qualityGates: {
          testCoverage: 90,
          securityScore: 95,
          complexityScore: 80,
          maintainabilityScore: 85,
        },
        businessRequirements: {
          costPrevention: 20000,
          timeSaved: 6,
          userSatisfaction: 95,
        },
      });

      expect(validationResult.success).toBe(true);
      expect(validationResult.data.qualityScorecard.overall.score).toBeGreaterThan(0);
      expect(validationResult.data.qualityScorecard.overall.status).toMatch(/pass|fail/);
      expect(validationResult.data.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
      expect(validationResult.data.qualityScorecard.quality).toBeDefined();
      expect(validationResult.data.qualityScorecard.business).toBeDefined();
      expect(validationResult.data.qualityScorecard.production).toBeDefined();
      expect(validationResult.data.recommendations.length).toBeGreaterThanOrEqual(0);
      expect(validationResult.data.nextSteps.length).toBeGreaterThan(0);
    });

    it('should handle workflow errors gracefully', async () => {
      // Test with invalid project ID in smart_write
      const codeResult = await handleSmartWrite({
        projectId: 'invalid-project-id',
        featureDescription: 'error test feature',
      });

      // Should still work but with basic context
      expect(codeResult.success).toBe(true);

      // Test with invalid project ID in smart_finish
      const validationResult = await handleSmartFinish({
        projectId: 'invalid-project-id',
        codeIds: ['invalid-code-id'],
      });

      // Should still work but with basic validation
      expect(validationResult.success).toBe(true);
    });
  });
});
