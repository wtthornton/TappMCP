import { describe, it, expect } from 'vitest';
import { handleSmartOrchestrate, smartOrchestrateTool } from './smart_orchestrate';
import type { SmartOrchestrateResponse } from '../types/tool-responses';

describe('smart_orchestrate tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartOrchestrateTool.name).toBe('smart_orchestrate');
      expect(smartOrchestrateTool.description).toContain('Orchestrate complete development workflow');
    });

    it('should have proper input schema', () => {
      expect(smartOrchestrateTool.inputSchema).toBeDefined();
      expect(smartOrchestrateTool.inputSchema.type).toBe('object');
      expect(smartOrchestrateTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('handleSmartOrchestrate', () => {
    it('should successfully orchestrate workflow with minimal input', async () => {
      const input = {
        projectId: 'proj_123_test',
        workflowType: 'full-development',
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBe('proj_123_test');
      expect(result.data?.orchestration).toBeDefined();
      expect(result.data?.successMetrics).toBeDefined();
      expect(result.data?.nextSteps).toBeDefined();
      expect(result.data?.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully orchestrate comprehensive workflow', async () => {
      const input = {
        projectId: 'proj_456_full',
        workflowType: 'full-development',
        orchestrationScope: {
          includePlanning: true,
          includeDevelopment: true,
          includeTesting: true,
          includeDeployment: true,
          includeMonitoring: true,
        },
        externalIntegrations: [
          { name: 'GitHub', type: 'api', priority: 'high' },
          { name: 'Docker', type: 'tool', priority: 'medium' },
          { name: 'AWS', type: 'service', priority: 'low' },
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

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBe('proj_456_full');
      expect(result.data?.workflowType).toBe('full-development');
      expect(result.data?.orchestration.workflow).toBeDefined();
      expect(result.data?.orchestration.automation).toBeDefined();
      expect(result.data?.orchestration.businessValue).toBeDefined();
    });

    it('should generate different workflow types', async () => {
      const workflowTypes = ['full-development', 'feature-development', 'maintenance', 'migration'];

      for (const workflowType of workflowTypes) {
        const input = {
          projectId: `proj_${workflowType}`,
          workflowType,
        };

        const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

        expect(result.success).toBe(true);
        expect(result.data?.workflowType).toBe(workflowType);
      }
    });

    it('should generate workflow phases', async () => {
      const input = {
        projectId: 'proj_phases',
        workflowType: 'full-development',
        orchestrationScope: {
          includePlanning: true,
          includeDevelopment: true,
          includeTesting: true,
        },
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.phases).toBeDefined();
      expect(Array.isArray(result.data?.orchestration.workflow.phases)).toBe(true);
      expect(result.data?.orchestration.workflow.phases.length).toBeGreaterThan(0);
    });

    it('should configure external integrations', async () => {
      const input = {
        projectId: 'proj_integrations',
        workflowType: 'full-development',
        externalIntegrations: [
          { name: 'GitHub', type: 'api', priority: 'high' },
          { name: 'Docker', type: 'tool', priority: 'medium' },
          { name: 'AWS', type: 'service', priority: 'low' },
        ],
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.integrations).toBeDefined();
      expect(result.data?.orchestration.workflow.integrations.length).toBe(3);
    });

    it('should configure quality gates', async () => {
      const input = {
        projectId: 'proj_gates',
        workflowType: 'full-development',
        qualityGates: {
          testCoverage: 95,
          securityScore: 98,
          performanceScore: 90,
        },
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.qualityGates).toBeDefined();
      expect(Array.isArray(result.data?.orchestration.workflow.qualityGates)).toBe(true);
      expect(result.data?.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
    });

    it('should generate automation configuration', async () => {
      const input = {
        projectId: 'proj_automation',
        workflowType: 'full-development',
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.automation).toBeDefined();
      expect(result.data?.orchestration.automation.triggers).toBeDefined();
      expect(result.data?.orchestration.automation.workflows).toBeDefined();
      expect(result.data?.orchestration.automation.monitoring).toBeDefined();
    });

    it('should calculate business value', async () => {
      const input = {
        projectId: 'proj_business',
        workflowType: 'full-development',
        businessRequirements: {
          roiTarget: 400,
          costPrevention: 30000,
          timeSaved: 12,
          userSatisfaction: 98,
        },
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.businessValue).toBeDefined();
      expect(result.data?.orchestration.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data?.orchestration.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.data?.orchestration.businessValue.costPrevention).toBeGreaterThan(0);
      expect(result.data?.orchestration.businessValue.qualityImprovement).toBeGreaterThan(0);
      expect(result.data?.orchestration.businessValue.userSatisfaction).toBeGreaterThan(0);
    });

    it('should generate success metrics', async () => {
      const input = {
        projectId: 'proj_metrics',
        workflowType: 'full-development',
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.successMetrics).toBeDefined();
      expect(Array.isArray(result.data?.successMetrics)).toBe(true);
      expect(result.data?.successMetrics.length).toBeGreaterThan(0);
    });

    it('should calculate technical metrics', async () => {
      const input = {
        projectId: 'proj_tech',
        workflowType: 'full-development',
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(result.data?.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.data?.technicalMetrics.orchestrationTime).toBeGreaterThanOrEqual(0);
      expect(result.data?.technicalMetrics.phasesOrchestrated).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.integrationsConfigured).toBeGreaterThanOrEqual(0);
      expect(result.data?.technicalMetrics.qualityGatesConfigured).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const input = {
        projectId: '', // Invalid empty ID
      };

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should validate input schema', async () => {
      const invalidInput = {
        invalidField: 'test',
      };

      const result = (await handleSmartOrchestrate(invalidInput)) as SmartOrchestrateResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });
});
