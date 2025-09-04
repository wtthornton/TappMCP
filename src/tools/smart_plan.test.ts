import { describe, it, expect } from 'vitest';
import { handleSmartPlan, smartPlanTool } from './smart_plan';

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
    it('should successfully create project plan with minimal input', async () => {
      const input = {
        projectId: 'proj_123_test',
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.projectId).toBe('proj_123_test');
      expect(result.data.projectPlan).toBeDefined();
      expect(result.data.businessValue).toBeDefined();
      expect(result.data.successMetrics).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(result.data.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully create project plan with full input', async () => {
      const input = {
        projectId: 'proj_456_full',
        planType: 'development',
        scope: {
          features: ['user-auth', 'dashboard', 'api'],
          timeline: {
            duration: 8,
            startDate: '2024-01-01',
            endDate: '2024-02-28',
          },
          resources: {
            teamSize: 5,
            budget: 100000,
            externalTools: ['github', 'slack'],
          },
        },
        externalMCPs: [
          {
            name: 'Database MCP',
            description: 'Database integration service',
            integrationType: 'database',
            priority: 'high',
            estimatedEffort: 7,
          },
          {
            name: 'API MCP',
            description: 'External API integration',
            integrationType: 'api',
            priority: 'medium',
            estimatedEffort: 5,
          },
        ],
        qualityRequirements: {
          testCoverage: 90,
          securityLevel: 'high',
          performanceTargets: {
            responseTime: 50,
            throughput: 2000,
            availability: 99.9,
          },
        },
        businessContext: {
          goals: ['increase-revenue', 'improve-efficiency'],
          targetUsers: ['customers', 'admins'],
          successMetrics: ['user-satisfaction', 'performance'],
          riskFactors: ['technical-complexity', 'timeline-pressure'],
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('proj_456_full');
      expect(result.data.planType).toBe('development');
      expect(result.data.projectPlan.phases).toBeDefined();
      expect(result.data.projectPlan.resources).toBeDefined();
      expect(result.data.projectPlan.timeline).toBeDefined();
      expect(result.data.projectPlan.risks).toBeDefined();
    });

    it('should handle different plan types', async () => {
      const planTypes = ['development', 'testing', 'deployment', 'maintenance', 'migration'];
      
      for (const planType of planTypes) {
        const input = {
          projectId: 'proj_type_test',
          planType: planType,
        };

        const result = await handleSmartPlan(input);

        expect(result.success).toBe(true);
        expect(result.data.planType).toBe(planType);
      }
    });

    it('should generate appropriate project phases', async () => {
      const input = {
        projectId: 'proj_phases_test',
        scope: {
          timeline: {
            duration: 12,
          },
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.projectPlan.phases).toBeDefined();
      expect(Array.isArray(result.data.projectPlan.phases)).toBe(true);
      expect(result.data.projectPlan.phases.length).toBeGreaterThan(0);
    });

    it('should generate appropriate resources', async () => {
      const input = {
        projectId: 'proj_resources_test',
        scope: {
          resources: {
            teamSize: 8,
            budget: 200000,
            externalTools: ['tool1', 'tool2'],
          },
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.projectPlan.resources.team).toBeDefined();
      expect(result.data.projectPlan.resources.budget).toBeDefined();
      expect(result.data.projectPlan.resources.tools).toBeDefined();
      expect(result.data.projectPlan.resources.budget.total).toBe(200000);
    });

    it('should generate appropriate timeline', async () => {
      const input = {
        projectId: 'proj_timeline_test',
        scope: {
          timeline: {
            duration: 6,
          },
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.projectPlan.timeline).toBeDefined();
      expect(result.data.projectPlan.timeline.duration).toBe(6);
      expect(result.data.projectPlan.timeline.startDate).toBeDefined();
      expect(result.data.projectPlan.timeline.endDate).toBeDefined();
    });

    it('should generate appropriate risks', async () => {
      const input = {
        projectId: 'proj_risks_test',
        externalMCPs: [
          {
            name: 'Test MCP',
            description: 'Test integration',
            integrationType: 'api',
            priority: 'high',
          },
        ],
        businessContext: {
          riskFactors: ['custom-risk-1', 'custom-risk-2'],
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.projectPlan.risks).toBeDefined();
      expect(Array.isArray(result.data.projectPlan.risks)).toBe(true);
      expect(result.data.projectPlan.risks.length).toBeGreaterThan(0);
    });

    it('should calculate business value correctly', async () => {
      const input = {
        projectId: 'proj_business_test',
        scope: {
          resources: {
            budget: 50000,
          },
        },
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.data.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.data.businessValue.riskMitigation).toBeGreaterThan(0);
      expect(result.data.businessValue.qualityImprovement).toBeGreaterThan(0);
    });

    it('should generate success metrics', async () => {
      const input = {
        projectId: 'proj_metrics_test',
        qualityRequirements: {
          testCoverage: 95,
        },
        externalMCPs: [
          {
            name: 'Test MCP',
            description: 'Test integration',
            integrationType: 'api',
          },
        ],
      };

      const result = await handleSmartPlan(input);

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
      const result = await handleSmartPlan(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectId
        planType: 'development',
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should calculate technical metrics correctly', async () => {
      const input = {
        projectId: 'proj_tech_metrics_test',
      };

      const result = await handleSmartPlan(input);

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.planningTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.phasesPlanned).toBeGreaterThan(0);
      expect(result.data.technicalMetrics.tasksPlanned).toBeGreaterThan(0);
    });
  });
});
