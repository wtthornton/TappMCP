import { describe, it, expect } from 'vitest';
import { handleSmartBegin } from '../tools/smart_begin';
import { handleSmartWrite } from '../tools/smart_write';

describe('Phase 1A-1B Integration: smart_begin + smart_write', () => {
  describe('seamless workflow integration', () => {
    it('should preserve context from smart_begin to smart_write', async () => {
      // Step 1: Initialize project with smart_begin
      const projectInput = {
        projectName: 'integration-test-project',
        description: 'Test project for integration validation',
        techStack: ['typescript', 'nodejs', 'react'],
        targetUsers: ['strategy-people', 'vibe-coders'],
        businessGoals: ['cost-reduction', 'time-savings'],
      };

      const projectResult = await handleSmartBegin(projectInput);
      expect(projectResult.success).toBe(true);
      expect(projectResult.data.projectId).toBeDefined();

      // Step 2: Use project context in smart_write
      const codeInput = {
        projectId: projectResult.data.projectId,
        featureDescription: 'user authentication system',
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
      };

      const codeResult = await handleSmartWrite(codeInput);
      expect(codeResult.success).toBe(true);
      expect(codeResult.data.codeId).toBeDefined();

      // Step 3: Validate context preservation
      expect(codeResult.data.generatedCode.files[0].content).toContain('user authentication system');
      expect(codeResult.data.generatedCode.files[0].content).toContain('developer');
      expect(codeResult.data.businessValue).toBeDefined();
      expect(codeResult.data.qualityMetrics).toBeDefined();
    });

    it('should maintain business context across tools', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'business-context-test',
        techStack: ['typescript'],
        targetUsers: ['strategy-people'],
        businessGoals: ['revenue-growth', 'customer-satisfaction'],
      });

      expect(projectResult.success).toBe(true);

      // Generate code with business context
      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'customer dashboard',
        targetRole: 'product-strategist',
        codeType: 'component',
        businessContext: {
          goals: ['revenue-growth', 'customer-satisfaction'],
          targetUsers: ['strategy-people'],
          priority: 'high',
        },
      });

      expect(codeResult.success).toBe(true);
      expect(codeResult.data.generatedCode.files[0].content).toContain('customer dashboard');
      expect(codeResult.data.generatedCode.files[0].content).toContain('product-strategist');
    });

    it('should maintain quality standards across tools', async () => {
      // Initialize project with quality requirements
      const projectResult = await handleSmartBegin({
        projectName: 'quality-test-project',
        techStack: ['typescript', 'react'],
        targetUsers: ['vibe-coders'],
      });

      expect(projectResult.success).toBe(true);
      expect(projectResult.data.qualityGates).toBeDefined();

      // Generate code with quality requirements
      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'data validation utility',
        targetRole: 'qa-engineer',
        codeType: 'function',
        qualityRequirements: {
          testCoverage: 95,
          complexity: 2,
          securityLevel: 'high',
        },
      });

      expect(codeResult.success).toBe(true);
      expect(codeResult.data.qualityMetrics.testCoverage).toBe(95);
      expect(codeResult.data.qualityMetrics.complexity).toBe(2);
      expect(codeResult.data.qualityMetrics.securityScore).toBe(95);
    });

    it('should meet performance requirements for integration', async () => {
      const startTime = Date.now();

      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'performance-test',
        techStack: ['typescript'],
      });

      expect(projectResult.success).toBe(true);

      // Generate code
      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'performance test feature',
        targetRole: 'developer',
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(codeResult.success).toBe(true);
      expect(totalTime).toBeLessThan(200); // <200ms for integration
      expect(codeResult.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms for tool
    });

    it('should handle different user personas seamlessly', async () => {
      const personas = [
        { role: 'developer', codeType: 'function', expectedFocus: 'technical' },
        { role: 'product-strategist', codeType: 'component', expectedFocus: 'business' },
        { role: 'designer', codeType: 'component', expectedFocus: 'design' },
        { role: 'qa-engineer', codeType: 'test', expectedFocus: 'quality' },
        { role: 'operations-engineer', codeType: 'config', expectedFocus: 'operations' },
      ];

      for (const persona of personas) {
        // Initialize project
        const projectResult = await handleSmartBegin({
          projectName: `persona-test-${persona.role}`,
          techStack: ['typescript'],
          targetUsers: [persona.role],
        });

        expect(projectResult.success).toBe(true);

        // Generate code for persona
        const codeResult = await handleSmartWrite({
          projectId: projectResult.data.projectId,
          featureDescription: `${persona.role} test feature`,
          targetRole: persona.role,
          codeType: persona.codeType,
        });

        expect(codeResult.success).toBe(true);
        expect(codeResult.data.generatedCode.files[0].content).toContain(persona.role);
      }
    });

    it('should provide unified progress and business value', async () => {
      // Initialize project
      const projectResult = await handleSmartBegin({
        projectName: 'unified-value-test',
        techStack: ['typescript', 'react'],
        targetUsers: ['strategy-people'],
        businessGoals: ['cost-reduction'],
      });

      expect(projectResult.success).toBe(true);
      expect(projectResult.data.businessValue).toBeDefined();

      // Generate code
      const codeResult = await handleSmartWrite({
        projectId: projectResult.data.projectId,
        featureDescription: 'unified value feature',
        targetRole: 'product-strategist',
        businessContext: {
          goals: ['cost-reduction'],
          targetUsers: ['strategy-people'],
        },
      });

      expect(codeResult.success).toBe(true);
      expect(codeResult.data.businessValue).toBeDefined();
      expect(codeResult.data.nextSteps).toBeDefined();
      expect(codeResult.data.nextSteps.length).toBeGreaterThan(0);
    });

    it('should handle integration errors gracefully', async () => {
      // Test with invalid project ID
      const codeResult = await handleSmartWrite({
        projectId: 'invalid-project-id',
        featureDescription: 'error test feature',
      });

      // Should still work but with basic context
      expect(codeResult.success).toBe(true);
      expect(codeResult.data.codeId).toBeDefined();
    });
  });
});
