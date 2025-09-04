import { describe, it, expect } from 'vitest';
import { handleSmartFinish, smartFinishTool } from './smart_finish';

describe('smart_finish tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartFinishTool.name).toBe('smart_finish');
      expect(smartFinishTool.description).toContain('Check quality and validate production readiness');
    });

    it('should have proper input schema', () => {
      expect(smartFinishTool.inputSchema).toBeDefined();
      expect(smartFinishTool.inputSchema.type).toBe('object');
      expect(smartFinishTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('handleSmartFinish', () => {
    it('should successfully validate project with minimal input', async () => {
      const input = {
        projectId: 'proj_123_test',
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.projectId).toBe('proj_123_test');
      expect(result.data.qualityScorecard).toBeDefined();
      expect(result.data.recommendations).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(result.data.technicalMetrics).toBeDefined();
      expect(result.data.businessValue).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully validate project with full input', async () => {
      const input = {
        projectId: 'proj_456_full',
        codeIds: ['code_1', 'code_2', 'code_3'],
        qualityGates: {
          testCoverage: 90,
          securityScore: 95,
          complexityScore: 80,
          maintainabilityScore: 85,
        },
        businessRequirements: {
          costPrevention: 15000,
          timeSaved: 3,
          userSatisfaction: 95,
        },
        productionReadiness: {
          securityScan: true,
          performanceTest: true,
          documentationComplete: true,
          deploymentReady: true,
        },
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.projectId).toBe('proj_456_full');
      expect(result.data.codeIds).toEqual(['code_1', 'code_2', 'code_3']);
      expect(result.data.qualityScorecard.overall).toBeDefined();
      expect(result.data.qualityScorecard.quality).toBeDefined();
      expect(result.data.qualityScorecard.business).toBeDefined();
      expect(result.data.qualityScorecard.production).toBeDefined();
    });

    it('should generate quality scorecard with all metrics', async () => {
      const input = {
        projectId: 'proj_scorecard_test',
        codeIds: ['code_1', 'code_2'],
        qualityGates: {
          testCoverage: 85,
          securityScore: 90,
          complexityScore: 70,
          maintainabilityScore: 70,
        },
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.qualityScorecard.overall.score).toBeGreaterThan(0);
      expect(result.data.qualityScorecard.overall.status).toMatch(/pass|fail/);
      expect(result.data.qualityScorecard.overall.grade).toMatch(/A|B|C|D|F/);
      expect(result.data.qualityScorecard.quality.testCoverage).toBeDefined();
      expect(result.data.qualityScorecard.quality.securityScore).toBeDefined();
      expect(result.data.qualityScorecard.quality.complexityScore).toBeDefined();
      expect(result.data.qualityScorecard.quality.maintainabilityScore).toBeDefined();
    });

    it('should validate business requirements', async () => {
      const input = {
        projectId: 'proj_business_test',
        codeIds: ['code_1', 'code_2', 'code_3'],
        businessRequirements: {
          costPrevention: 10000,
          timeSaved: 2,
          userSatisfaction: 90,
        },
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.qualityScorecard.business.costPrevention).toBeDefined();
      expect(result.data.qualityScorecard.business.timeSaved).toBeDefined();
      expect(result.data.qualityScorecard.business.userSatisfaction).toBeDefined();
      expect(result.data.businessValue.totalCostPrevention).toBeGreaterThan(0);
      expect(result.data.businessValue.totalTimeSaved).toBeGreaterThan(0);
      expect(result.data.businessValue.userSatisfactionScore).toBeGreaterThan(0);
    });

    it('should validate production readiness', async () => {
      const input = {
        projectId: 'proj_production_test',
        codeIds: ['code_1'],
        productionReadiness: {
          securityScan: true,
          performanceTest: true,
          documentationComplete: true,
          deploymentReady: true,
        },
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.qualityScorecard.production.securityScan).toBeDefined();
      expect(result.data.qualityScorecard.production.performanceTest).toBeDefined();
      expect(result.data.qualityScorecard.production.documentationComplete).toBeDefined();
      expect(result.data.qualityScorecard.production.deploymentReady).toBeDefined();
    });

    it('should generate appropriate recommendations', async () => {
      const input = {
        projectId: 'proj_recommendations_test',
        codeIds: [],
        qualityGates: {
          testCoverage: 95,
          securityScore: 95,
          complexityScore: 95,
          maintainabilityScore: 95,
        },
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toBeDefined();
      expect(Array.isArray(result.data.recommendations)).toBe(true);
    });

    it('should generate appropriate next steps', async () => {
      const input = {
        projectId: 'proj_nextsteps_test',
        codeIds: ['code_1', 'code_2'],
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.nextSteps).toBeDefined();
      expect(Array.isArray(result.data.nextSteps)).toBe(true);
      expect(result.data.nextSteps.length).toBeGreaterThan(0);
    });

    it('should meet performance requirements', async () => {
      const input = {
        projectId: 'proj_performance_test',
        codeIds: ['code_1', 'code_2', 'code_3'],
      };

      const startTime = Date.now();
      const result = await handleSmartFinish(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectId
        codeIds: ['code_1'],
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should calculate technical metrics correctly', async () => {
      const input = {
        projectId: 'proj_metrics_test',
        codeIds: ['code_1', 'code_2'],
      };

      const result = await handleSmartFinish(input);

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.validationTime).toBeGreaterThanOrEqual(0);
      expect(result.data.technicalMetrics.codeUnitsValidated).toBe(2);
    });
  });
});
