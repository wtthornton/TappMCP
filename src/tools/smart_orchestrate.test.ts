import { describe, it, expect } from 'vitest';
import { handleSmartOrchestrate, smartOrchestrateTool } from './smart_orchestrate';
import type { SmartOrchestrateResponse } from '../types/tool-responses';

// Helper function to convert legacy test inputs to new format
function convertLegacyInput(legacyInput: any) {
  return {
    request: legacyInput.businessRequest ?? 'Complete software development task',
    options: {
      skipPhases: legacyInput.skipPhases ?? [],
      focusAreas: legacyInput.focusAreas ?? [],
      businessContext: {
        projectId: legacyInput.projectId,
        businessGoals: legacyInput.businessGoals ?? ['Complete project successfully'],
        requirements: legacyInput.requirements ?? ['Functional requirements'],
        stakeholders: legacyInput.stakeholders ?? ['development-team'],
        constraints: legacyInput.constraints ?? {},
        success: legacyInput.success ?? {
          metrics: ['project completion'],
          criteria: ['tests pass'],
        },
      },
    },
    workflow: legacyInput.workflowType === 'full-development' ? 'sdlc' : 'project',
    externalSources: {
      useContext7: false,
      useWebSearch: false,
      useMemory: false,
    },
  };
}

describe('smart_orchestrate tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartOrchestrateTool.name).toBe('smart_orchestrate');
      expect(smartOrchestrateTool.description).toContain(
        'Phase 2B: Orchestrate complete SDLC workflows'
      );
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
        request: 'Implement a simple web application with user authentication',
        options: {
          businessContext: {
            projectId: 'proj_123_test',
            businessGoals: ['Build secure authentication system'],
            requirements: ['User registration', 'Login/logout', 'Password reset'],
            stakeholders: ['development-team', 'users'],
            constraints: {},
            success: { metrics: ['user registration working'], criteria: ['tests pass'] },
          },
        },
        workflow: 'sdlc',
        externalSources: {
          useContext7: false,
          useWebSearch: false,
          useMemory: false,
        },
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
      const legacyInput = {
        projectId: 'proj_456_full',
        workflowType: 'full-development',
        businessRequest: 'Build comprehensive enterprise application with microservices',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.projectId).toBe('proj_456_full');
      expect(result.data?.workflowType).toBe('sdlc');
      expect(result.data?.orchestration.workflow).toBeDefined();
      expect(result.data?.orchestration.automation).toBeDefined();
      expect(result.data?.orchestration.businessValue).toBeDefined();
    });

    it('should generate different workflow types', async () => {
      const workflowTypes = ['sdlc', 'project', 'quality', 'custom'];

      for (const workflowType of workflowTypes) {
        const legacyInput = {
          projectId: `proj_${workflowType}`,
          workflowType,
          businessRequest: `Complete ${workflowType} workflow`,
        };
        const input = convertLegacyInput(legacyInput);
        input.workflow = workflowType as any; // Override the conversion

        const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

        expect(result.success).toBe(true);
        expect(result.data?.workflowType).toBe(workflowType);
      }
    });

    it('should generate workflow phases', async () => {
      const legacyInput = {
        projectId: 'proj_phases',
        workflowType: 'full-development',
        businessRequest: 'Generate comprehensive workflow phases',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.phases).toBeDefined();
      expect(Array.isArray(result.data?.orchestration.workflow.phases)).toBe(true);
      expect(result.data?.orchestration.workflow.phases.length).toBeGreaterThan(0);
    });

    it('should configure external integrations', async () => {
      const legacyInput = {
        projectId: 'proj_integrations',
        workflowType: 'full-development',
        businessRequest: 'Configure external integrations for development workflow',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.integrations).toBeDefined();
      expect(result.data?.orchestration.workflow.integrations.length).toBe(3);
    });

    it('should configure quality gates', async () => {
      const legacyInput = {
        projectId: 'proj_gates',
        workflowType: 'full-development',
        businessRequest: 'Configure comprehensive quality gates for project',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.workflow.qualityGates).toBeDefined();
      expect(Array.isArray(result.data?.orchestration.workflow.qualityGates)).toBe(true);
      expect(result.data?.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
    });

    it('should generate automation configuration', async () => {
      const legacyInput = {
        projectId: 'proj_automation',
        workflowType: 'full-development',
        businessRequest: 'Generate comprehensive automation configuration',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.orchestration.automation).toBeDefined();
      expect(result.data?.orchestration.automation.triggers).toBeDefined();
      expect(result.data?.orchestration.automation.workflows).toBeDefined();
      expect(result.data?.orchestration.automation.monitoring).toBeDefined();
    });

    it('should calculate business value', async () => {
      const legacyInput = {
        projectId: 'proj_business',
        workflowType: 'full-development',
        businessRequest: 'Calculate and optimize business value metrics',
      };
      const input = convertLegacyInput(legacyInput);

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
      const legacyInput = {
        projectId: 'proj_metrics',
        workflowType: 'full-development',
        businessRequest: 'Generate comprehensive success metrics and KPIs',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.successMetrics).toBeDefined();
      expect(Array.isArray(result.data?.successMetrics)).toBe(true);
      expect(result.data?.successMetrics.length).toBeGreaterThan(0);
    });

    it('should calculate technical metrics', async () => {
      const legacyInput = {
        projectId: 'proj_tech',
        workflowType: 'full-development',
        businessRequest: 'Calculate comprehensive technical performance metrics',
      };
      const input = convertLegacyInput(legacyInput);

      const result = (await handleSmartOrchestrate(input)) as SmartOrchestrateResponse;

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(2000); // <2s reasonable for integration test
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
