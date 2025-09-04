import { describe, it, expect } from 'vitest';
import { handleSmartBegin, smartBeginTool } from './smart_begin';
import type { SmartBeginResponse } from '../types/tool-responses';

describe('smart_begin tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartBeginTool.name).toBe('smart_begin');
      expect(smartBeginTool.description).toContain('AI-assisted project initialization');
    });

    it('should have proper input schema', () => {
      expect(smartBeginTool.inputSchema).toBeDefined();
      expect(smartBeginTool.inputSchema.type).toBe('object');
      expect(smartBeginTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('handleSmartBegin', () => {
    it('should successfully initialize a project with minimal input', async () => {
      const input = {
        projectName: 'test-project',
      };

      const result = await handleSmartBegin(input) as SmartBeginResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBeDefined();
      expect(result.data?.projectStructure).toBeDefined();
      expect(result.data?.projectStructure.qualityGates).toBeDefined();
      expect(result.data?.nextSteps).toBeDefined();
      expect(result.data?.businessValue).toBeDefined();
      expect(result.data?.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully initialize a project with full input', async () => {
      const input = {
        projectName: 'my-awesome-project',
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

      const result = await handleSmartBegin(input) as SmartBeginResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toContain('my-awesome-project');
      expect(result.data?.projectStructure.directories).toContain('src');
      expect(result.data?.projectStructure.files).toContain('package.json');
      expect(result.data?.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data?.nextSteps.length).toBeGreaterThan(0);
    });

    it('should handle different project types', async () => {
      const projectTypes = ['web-app', 'api', 'mobile-app', 'desktop-app'];

      for (const projectType of projectTypes) {
        const input = {
          projectName: `test-${projectType}`,
          projectType,
        };

        const result = await handleSmartBegin(input) as SmartBeginResponse;

        expect(result.success).toBe(true);
        expect(result.data?.projectStructure).toBeDefined();
      }
    });

    it('should generate appropriate next steps based on user role', async () => {
      const strategyInput = {
        projectName: 'strategy-project',
        userRole: 'strategy-person',
      };

      const coderInput = {
        projectName: 'coder-project',
        userRole: 'vibe-coder',
      };

      const founderInput = {
        projectName: 'founder-project',
        userRole: 'non-technical-founder',
      };

      const strategyResult = await handleSmartBegin(strategyInput) as SmartBeginResponse;
      const coderResult = await handleSmartBegin(coderInput) as SmartBeginResponse;
      const founderResult = await handleSmartBegin(founderInput) as SmartBeginResponse;

      expect(strategyResult.success).toBe(true);
      expect(coderResult.success).toBe(true);
      expect(founderResult.success).toBe(true);

      // Strategy people should get business-focused next steps
      expect(
        strategyResult.data?.nextSteps.some(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          step => step.includes('business value') || step.includes('stakeholders')
        )
      ).toBe(true);

      // Vibe coders should get technical next steps
      expect(
        coderResult.data?.nextSteps.some(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          step => step.includes('development environment') || step.includes('code quality')
        )
      ).toBe(true);

      // Non-technical founders should get business-focused next steps
      expect(
        founderResult.data?.nextSteps.some(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          step => step.includes('business-focused') || step.includes('technical foundation')
        )
      ).toBe(true);
    });

    it('should calculate business value correctly', async () => {
      const input = {
        projectName: 'business-value-test',
        projectType: 'web-app',
        businessContext: {
          industry: 'fintech',
          targetUsers: 'enterprise',
        },
      };

      const result = await handleSmartBegin(input) as SmartBeginResponse;

      expect(result.success).toBe(true);
      expect(result.data?.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data?.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
      expect(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
    });

    it('should generate technical metrics', async () => {
      const input = {
        projectName: 'metrics-test',
        projectType: 'api',
      };

      const result = await handleSmartBegin(input) as SmartBeginResponse;

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(result.data?.technicalMetrics.setupTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.directoriesCreated).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.filesGenerated).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const input = {
        projectName: '', // Invalid empty name
      };

      const result = await handleSmartBegin(input) as SmartBeginResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should validate input schema', async () => {
      const invalidInput = {
        invalidField: 'test',
      };

      const result = await handleSmartBegin(invalidInput) as SmartBeginResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid arguments');
    });
  });
});