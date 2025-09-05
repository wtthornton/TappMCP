import { describe, it, expect } from 'vitest';
import { handleSmartPlan, smartPlanTool } from './smart-plan';
import type { SmartPlanResponse } from '../types/tool-responses';

describe('smart_plan tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartPlanTool.name).toBe('smart_plan');
      expect(smartPlanTool.description).toContain('Create comprehensive project plans');
    });

    it('should have proper input schema', () => {
      expect(smartPlanTool.inputSchema).toBeDefined();
      expect(smartPlanTool.inputSchema.type).toBe('object');
      expect(smartPlanTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('handleSmartPlan', () => {
    it('should successfully create a project plan with minimal input', async () => {
      const input = {
        projectId: 'proj_123_test',
        planType: 'development',
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBe('proj_123_test');
      expect(result.data?.projectPlan).toBeDefined();
      expect(result.data?.businessValue).toBeDefined();
      expect(result.data?.successMetrics).toBeDefined();
      expect(result.data?.nextSteps).toBeDefined();
      expect(result.data?.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully create a comprehensive project plan', async () => {
      const input = {
        projectId: 'proj_456_full',
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

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBe('proj_456_full');
      expect(result.data?.planType).toBe('development');
      expect(result.data?.projectPlan.phases).toBeDefined();
      expect(result.data?.projectPlan.resources).toBeDefined();
      expect(result.data?.projectPlan.timeline).toBeDefined();
      expect(result.data?.projectPlan.risks).toBeDefined();
    });

    it('should generate different plan types', async () => {
      const planTypes = ['development', 'maintenance', 'migration', 'testing'];

      for (const planType of planTypes) {
        const input = {
          projectId: `proj_${planType}`,
          planType,
        };

        const result = (await handleSmartPlan(input)) as SmartPlanResponse;

        expect(result.success).toBe(true);
        expect(result.data?.planType).toBe(planType);
      }
    });

    it('should generate project phases', async () => {
      const input = {
        projectId: 'proj_phases',
        planType: 'development',
        projectScope: {
          phases: ['planning', 'development', 'testing', 'deployment'],
        },
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.phases).toBeDefined();
      expect(Array.isArray(result.data?.projectPlan.phases)).toBe(true);
      expect(result.data?.projectPlan.phases.length).toBeGreaterThan(0);
    });

    it('should generate resource planning', async () => {
      const input = {
        projectId: 'proj_resources',
        planType: 'development',
        resources: {
          team: [
            { role: 'developer', count: 2, skills: ['typescript'] },
            { role: 'tester', count: 1, skills: ['jest', 'cypress'] },
          ],
          budget: 100000,
          tools: ['vscode', 'git'],
        },
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.resources.team).toBeDefined();
      expect(result.data?.projectPlan.resources.budget).toBeDefined();
      expect(result.data?.projectPlan.resources.tools).toBeDefined();
      expect(result.data?.projectPlan.resources.budget.total).toBe(50000);
    });

    it('should generate timeline planning', async () => {
      const input = {
        projectId: 'proj_timeline',
        planType: 'development',
        projectScope: {
          duration: 4,
        },
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.timeline).toBeDefined();
      expect(result.data?.projectPlan.timeline.duration).toBe(4);
      expect(result.data?.projectPlan.timeline.startDate).toBeDefined();
      expect(result.data?.projectPlan.timeline.endDate).toBeDefined();
    });

    it('should generate risk assessment', async () => {
      const input = {
        projectId: 'proj_risks',
        planType: 'development',
        businessRequirements: {
          riskTolerance: 'high',
        },
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectPlan.risks).toBeDefined();
      expect(Array.isArray(result.data?.projectPlan.risks)).toBe(true);
      expect(result.data?.projectPlan.risks.length).toBeGreaterThan(0);
    });

    it('should calculate business value', async () => {
      const input = {
        projectId: 'proj_business',
        planType: 'development',
        businessRequirements: {
          roiTarget: 400,
          timeToMarket: 8,
        },
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data?.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.data?.businessValue.riskMitigation).toBeGreaterThan(0);
      expect(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
    });

    it('should generate success metrics', async () => {
      const input = {
        projectId: 'proj_metrics',
        planType: 'development',
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.successMetrics).toBeDefined();
      expect(Array.isArray(result.data?.successMetrics)).toBe(true);
      expect(result.data?.successMetrics.length).toBeGreaterThan(0);
    });

    it('should calculate technical metrics', async () => {
      const input = {
        projectId: 'proj_tech',
        planType: 'development',
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.data?.technicalMetrics.planningTime).toBeGreaterThanOrEqual(0);
      expect(result.data?.technicalMetrics.phasesPlanned).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.tasksPlanned).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const input = {
        projectId: '', // Invalid empty ID
      };

      const result = (await handleSmartPlan(input)) as SmartPlanResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should validate input schema', async () => {
      const invalidInput = {
        invalidField: 'test',
      };

      const result = (await handleSmartPlan(invalidInput)) as SmartPlanResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });
});
