import { describe, it, expect } from 'vitest';
import { handleSmartBegin, smartBeginTool } from './smart_begin';

describe('smart_begin tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartBeginTool.name).toBe('smart_begin');
      expect(smartBeginTool.description).toContain('Initialize a new project');
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

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.projectId).toBeDefined();
      expect(result.data.projectStructure).toBeDefined();
      expect(result.data.qualityGates).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(result.data.businessValue).toBeDefined();
      expect(result.data.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully initialize a project with full input', async () => {
      const input = {
        projectName: 'my-awesome-project',
        description: 'A test project for validation',
        techStack: ['typescript', 'nodejs', 'react'],
        targetUsers: ['strategy-people', 'vibe-coders'],
        businessGoals: ['cost-reduction', 'time-savings'],
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);
      expect(result.data.projectId).toContain('my-awesome-project');
      expect(result.data.projectStructure.folders).toContain('src/components');
      expect(result.data.qualityGates.length).toBeGreaterThan(0);
      expect(result.data.businessValue.costPrevention).toBeGreaterThan(10000);
    });

    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectName
        description: 'Invalid input test',
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should generate different project structures based on tech stack', async () => {
      const reactInput = {
        projectName: 'react-project',
        techStack: ['react', 'typescript'],
      };

      const nodeInput = {
        projectName: 'node-project',
        techStack: ['nodejs', 'express'],
      };

      const reactResult = await handleSmartBegin(reactInput);
      const nodeResult = await handleSmartBegin(nodeInput);

      expect(reactResult.success).toBe(true);
      expect(nodeResult.success).toBe(true);

      // React project should have React-specific folders
      expect(reactResult.data.projectStructure.folders).toContain('src/components');
      expect(reactResult.data.projectStructure.folders).toContain('public');

      // Node project should have Node-specific folders
      expect(nodeResult.data.projectStructure.folders).toContain('src/routes');
      expect(nodeResult.data.projectStructure.folders).toContain('src/controllers');
    });

    it('should calculate business value correctly', async () => {
      const input = {
        projectName: 'business-project',
        techStack: ['typescript', 'react'],
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);
      expect(result.data.businessValue.costPrevention).toBeGreaterThan(15000); // Base + TypeScript + React
      expect(result.data.businessValue.timeSaved).toBe(2.5);
      expect(result.data.businessValue.qualityImprovements.length).toBeGreaterThan(0);
    });

    it('should meet performance requirements', async () => {
      const input = {
        projectName: 'performance-test',
      };

      const startTime = Date.now();
      const result = await handleSmartBegin(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should generate appropriate next steps for different user types', async () => {
      const strategyInput = {
        projectName: 'strategy-project',
        targetUsers: ['strategy-people'],
      };

      const coderInput = {
        projectName: 'coder-project',
        targetUsers: ['vibe-coders'],
      };

      const founderInput = {
        projectName: 'founder-project',
        targetUsers: ['non-technical-founders'],
      };

      const strategyResult = await handleSmartBegin(strategyInput);
      const coderResult = await handleSmartBegin(coderInput);
      const founderResult = await handleSmartBegin(founderInput);

      expect(strategyResult.success).toBe(true);
      expect(coderResult.success).toBe(true);
      expect(founderResult.success).toBe(true);

      // Strategy people should get business-focused next steps
      expect(strategyResult.data.nextSteps.some(step => 
        step.includes('business value') || step.includes('stakeholders')
      )).toBe(true);

      // Vibe coders should get technical next steps
      expect(coderResult.data.nextSteps.some(step => 
        step.includes('development environment') || step.includes('code quality')
      )).toBe(true);

      // Non-technical founders should get business-focused next steps
      expect(founderResult.data.nextSteps.some(step => 
        step.includes('business-focused') || step.includes('technical foundation')
      )).toBe(true);
    });
  });
});
