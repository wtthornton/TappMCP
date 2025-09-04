import { describe, it, expect } from 'vitest';
import { handleSmartWrite, smartWriteTool } from './smart_write';

describe('smart_write tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartWriteTool.name).toBe('smart_write');
      expect(smartWriteTool.description).toContain('Generate code with role-based expertise');
    });

    it('should have proper input schema', () => {
      expect(smartWriteTool.inputSchema).toBeDefined();
      expect(smartWriteTool.inputSchema.type).toBe('object');
      expect(smartWriteTool.inputSchema.properties).toBeDefined();
    });
  });

  describe('handleSmartWrite', () => {
    it('should successfully generate code with minimal input', async () => {
      const input = {
        projectId: 'proj_123_test',
        featureDescription: 'user authentication',
      };

      const result = await handleSmartWrite(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.codeId).toBeDefined();
      expect(result.data.generatedCode).toBeDefined();
      expect(result.data.qualityMetrics).toBeDefined();
      expect(result.data.businessValue).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(result.data.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully generate code with full input', async () => {
      const input = {
        projectId: 'proj_456_full',
        featureDescription: 'payment processing',
        targetRole: 'developer',
        codeType: 'api',
        techStack: ['typescript', 'nodejs', 'express'],
        businessContext: {
          goals: ['increase-revenue', 'improve-security'],
          targetUsers: ['customers', 'merchants'],
          priority: 'high',
        },
        qualityRequirements: {
          testCoverage: 90,
          complexity: 3,
          securityLevel: 'high',
        },
      };

      const result = await handleSmartWrite(input);

      expect(result.success).toBe(true);
      expect(result.data.codeId).toContain('payment_processing');
      expect(result.data.generatedCode.files).toHaveLength(1);
      expect(result.data.generatedCode.files[0].path).toContain('payment-processing');
      expect(result.data.qualityMetrics.testCoverage).toBe(90);
      expect(result.data.qualityMetrics.securityScore).toBe(95);
    });

    it('should handle different target roles', async () => {
      const roles = ['developer', 'product-strategist', 'designer', 'qa-engineer', 'operations-engineer'];
      
      for (const role of roles) {
        const input = {
          projectId: 'proj_role_test',
          featureDescription: 'test feature',
          targetRole: role,
        };

        const result = await handleSmartWrite(input);

        expect(result.success).toBe(true);
        expect(result.data.generatedCode.files[0].content).toContain(role);
      }
    });

    it('should handle different code types', async () => {
      const codeTypes = ['component', 'function', 'api', 'test', 'config', 'documentation'];
      
      for (const codeType of codeTypes) {
        const input = {
          projectId: 'proj_type_test',
          featureDescription: 'test feature',
          codeType: codeType,
        };

        const result = await handleSmartWrite(input);

        expect(result.success).toBe(true);
        expect(result.data.generatedCode.files[0].type).toBe(codeType);
      }
    });

    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectId and featureDescription
        targetRole: 'developer',
      };

      const result = await handleSmartWrite(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should meet performance requirements', async () => {
      const input = {
        projectId: 'proj_perf_test',
        featureDescription: 'performance test feature',
      };

      const startTime = Date.now();
      const result = await handleSmartWrite(input);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should calculate business value correctly', async () => {
      const input = {
        projectId: 'proj_business_test',
        featureDescription: 'business value test',
        codeType: 'api',
        targetRole: 'developer',
      };

      const result = await handleSmartWrite(input);

      expect(result.success).toBe(true);
      expect(result.data.businessValue.timeSaved).toBeGreaterThan(0);
      expect(result.data.businessValue.qualityImprovement).toBeGreaterThan(0);
      expect(result.data.businessValue.costPrevention).toBeGreaterThan(0);
    });

    it('should generate appropriate quality metrics', async () => {
      const input = {
        projectId: 'proj_quality_test',
        featureDescription: 'quality test feature',
        qualityRequirements: {
          testCoverage: 95,
          complexity: 2,
          securityLevel: 'high',
        },
      };

      const result = await handleSmartWrite(input);

      expect(result.success).toBe(true);
      expect(result.data.qualityMetrics.testCoverage).toBe(95);
      expect(result.data.qualityMetrics.complexity).toBe(2);
      expect(result.data.qualityMetrics.securityScore).toBe(95);
      expect(result.data.qualityMetrics.maintainability).toBeGreaterThan(0);
    });
  });
});
