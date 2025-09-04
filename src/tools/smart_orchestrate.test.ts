import { describe, it, expect } from 'vitest';
import { handleSmartOrchestrate, smartOrchestrateTool } from './smart_orchestrate';

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
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.projectId).toBe('proj_123_test');
      expect(result.data.orchestration).toBeDefined();
      expect(result.data.successMetrics).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(result.data.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully orchestrate workflow with full input', async () => {
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
          {
            name: 'Database MCP',
            type: 'mcp',
            priority: 'high',
            configuration: { host: 'localhost', port: 5432 },
          },
          {
            name: 'API Service',
            type: 'api',
            priority: 'medium',
            configuration: { baseUrl: 'https://api.example.com' },
          },
        ],
        qualityGates: {
          testCoverage: 90,
          securityScore: 95,
          performanceScore: 90,
          maintainabilityScore: 85,
        },
        businessRequirements: {
          costPrevention: 50000,
          timeSaved: 12,
          userSatisfaction: 98,
          roiTarget: 400,
        },
        monitoringConfig: {
          enableMetrics: true,
          enableAlerts: true,
          enableLogging: true,
          enableTracing: true,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('proj_456_full');
      expect(result.data.workflowType).toBe('full-development');
      expect(result.data.orchestration.workflow).toBeDefined();
      expect(result.data.orchestration.automation).toBeDefined();
      expect(result.data.orchestration.businessValue).toBeDefined();
    });

    it('should handle different workflow types', async () => {
      const workflowTypes = ['full-development', 'feature-development', 'bug-fix', 'maintenance', 'migration'];
      
      for (const workflowType of workflowTypes) {
        const input = {
          projectId: 'proj_type_test',
          workflowType: workflowType,
        };

        const result = await handleSmartOrchestrate(input);

        expect(result.success).toBe(true);
        expect(result.data.workflowType).toBe(workflowType);
      }
    });

    it('should generate appropriate workflow phases', async () => {
      const input = {
        projectId: 'proj_phases_test',
        orchestrationScope: {
          includePlanning: true,
          includeDevelopment: true,
          includeTesting: true,
          includeDeployment: false,
          includeMonitoring: false,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.orchestration.workflow.phases).toBeDefined();
      expect(Array.isArray(result.data.orchestration.workflow.phases)).toBe(true);
      expect(result.data.orchestration.workflow.phases.length).toBeGreaterThan(0);
    });

    it('should generate appropriate integrations', async () => {
      const input = {
        projectId: 'proj_integrations_test',
        externalIntegrations: [
          {
            name: 'Test MCP 1',
            type: 'mcp',
            priority: 'high',
          },
          {
            name: 'Test API 1',
            type: 'api',
            priority: 'medium',
          },
          {
            name: 'Test Database 1',
            type: 'database',
            priority: 'low',
          },
        ],
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.orchestration.workflow.integrations).toBeDefined();
      expect(result.data.orchestration.workflow.integrations.length).toBe(3);
    });

    it('should generate appropriate quality gates', async () => {
      const input = {
        projectId: 'proj_quality_test',
        qualityGates: {
          testCoverage: 95,
          securityScore: 98,
          performanceScore: 92,
          maintainabilityScore: 88,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.orchestration.workflow.qualityGates).toBeDefined();
      expect(Array.isArray(result.data.orchestration.workflow.qualityGates)).toBe(true);
      expect(result.data.orchestration.workflow.qualityGates.length).toBeGreaterThan(0);
    });

    it('should generate appropriate automation', async () => {
      const input = {
        projectId: 'proj_automation_test',
        monitoringConfig: {
          enableMetrics: true,
          enableAlerts: true,
          enableLogging: true,
          enableTracing: true,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.orchestration.automation).toBeDefined();
      expect(result.data.orchestration.automation.triggers).toBeDefined();
      expect(result.data.orchestration.automation.workflows).toBeDefined();
      expect(result.data.orchestration.automation.monitoring).toBeDefined();
    });

    it('should calculate business value correctly', async () => {
      const input = {
        projectId: 'proj_business_test',
        businessRequirements: {
          costPrevention: 75000,
          timeSaved: 16,
          userSatisfaction: 99,
          roiTarget: 500,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.orchestration.businessValue).toBeDefined();
      expect(result.data.orchestration.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data.orchestration.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.data.orchestration.businessValue.costPrevention).toBeGreaterThan(0);
      expect(result.data.orchestration.businessValue.qualityImprovement).toBeGreaterThan(0);
      expect(result.data.orchestration.businessValue.userSatisfaction).toBeGreaterThan(0);
    });

    it('should generate success metrics', async () => {
      const input = {
        projectId: 'proj_metrics_test',
        externalIntegrations: [
          { name: 'Test MCP', type: 'mcp' },
          { name: 'Test API', type: 'api' },
        ],
        qualityGates: {
          testCoverage: 95,
        },
        businessRequirements: {
          roiTarget: 400,
          userSatisfaction: 98,
        },
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.successMetrics).toBeDefined();
      expect(Array.isArray(result.data.successMetrics)).toBe(true);
      expect(result.data.successMetrics.length).toBeGreaterThan(0);
    });

    it('should meet performance requirements', async () => {
      const input = {
        projectId: 'proj_performance_test',
      };

      const startTime = Date.now();
      const result = await handleSmartOrchestrate(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectId
        workflowType: 'full-development',
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should calculate technical metrics correctly', async () => {
      const input = {
        projectId: 'proj_tech_metrics_test',
        externalIntegrations: [
          { name: 'Test MCP', type: 'mcp' },
        ],
      };

      const result = await handleSmartOrchestrate(input);

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.orchestrationTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.phasesOrchestrated).toBeGreaterThan(0);
      expect(result.data.technicalMetrics.integrationsConfigured).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.qualityGatesConfigured).toBeGreaterThan(0);
    });
  });
});
