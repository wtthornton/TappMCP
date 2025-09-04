import { describe, it, expect } from 'vitest';
import { handleSmartWrite, smartWriteTool } from './smart_write';
import type { SmartWriteResponse } from '../types/tool-responses';

describe('smart_write tool', () => {
  describe('tool definition', () => {
    it('should have correct name and description', () => {
      expect(smartWriteTool.name).toBe('smart_write');
      expect(smartWriteTool.description).toContain('AI-assisted code generation');
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
        codeDescription: 'Create a simple payment processing function',
        codeType: 'function',
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.codeId).toBeDefined();
      expect(result.data?.generatedCode).toBeDefined();
      expect(result.data?.qualityMetrics).toBeDefined();
      expect(result.data?.businessValue).toBeDefined();
      expect(result.data?.nextSteps).toBeDefined();
      expect(result.data?.technicalMetrics).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should successfully generate code with full input', async () => {
      const input = {
        codeDescription: 'Create a comprehensive payment processing system with validation and error handling',
        codeType: 'module',
        targetLanguage: 'typescript',
        framework: 'express',
        requirements: {
          security: 'high',
          performance: 'medium',
          maintainability: 'high',
        },
        qualityGates: {
          testCoverage: 90,
          complexity: 2,
        },
        businessContext: {
          industry: 'e-commerce',
          userRole: 'vibe-coder',
        },
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.codeId).toContain('payment_processing');
      expect(result.data?.generatedCode.files).toHaveLength(1);
      expect(result.data?.generatedCode.files[0].path).toContain('payment-processing');
      expect(result.data?.qualityMetrics.testCoverage).toBe(90);
      expect(result.data?.qualityMetrics.securityScore).toBe(95);
    });

    it('should generate different code types', async () => {
      const codeTypes = ['function', 'class', 'module', 'component', 'service'];

      for (const codeType of codeTypes) {
        const input = {
          codeDescription: `Create a ${codeType} for user authentication`,
          codeType,
        };

        const result = await handleSmartWrite(input) as SmartWriteResponse;

        expect(result.success).toBe(true);
        expect(result.data?.generatedCode.files[0].type).toBe(codeType);
      }
    });

    it('should generate role-specific code', async () => {
      const roles = ['vibe-coder', 'strategy-person', 'non-technical-founder'];

      for (const role of roles) {
        const input = {
          codeDescription: 'Create a user management system',
          codeType: 'module',
          businessContext: {
            userRole: role,
          },
        };

        const result = await handleSmartWrite(input) as SmartWriteResponse;

        expect(result.success).toBe(true);
        expect(result.data?.generatedCode.files[0].content).toContain(role);
      }
    });

    it('should generate different code types based on requirements', async () => {
      const codeTypes = ['function', 'class', 'module'];

      for (const codeType of codeTypes) {
        const input = {
          codeDescription: 'Create a data validation system',
          codeType,
        };

        const result = await handleSmartWrite(input) as SmartWriteResponse;

        expect(result.success).toBe(true);
        expect(result.data?.generatedCode.files[0].type).toBe(codeType);
      }
    });

    it('should calculate technical metrics', async () => {
      const input = {
        codeDescription: 'Create a complex data processing pipeline',
        codeType: 'module',
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data?.technicalMetrics.responseTime).toBeLessThan(100); // <100ms requirement
      expect(result.data?.technicalMetrics.generationTime).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.linesGenerated).toBeGreaterThan(0);
      expect(result.data?.technicalMetrics.filesCreated).toBeGreaterThan(0);
    });

    it('should calculate business value', async () => {
      const input = {
        codeDescription: 'Create an automated testing framework',
        codeType: 'module',
        businessContext: {
          industry: 'fintech',
        },
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
      expect(result.data?.businessValue.qualityImprovement).toBeGreaterThan(0);
      expect(result.data?.businessValue.costPrevention).toBeGreaterThan(0);
    });

    it('should generate quality metrics', async () => {
      const input = {
        codeDescription: 'Create a secure authentication service',
        codeType: 'service',
        requirements: {
          security: 'high',
        },
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(true);
      expect(result.data?.qualityMetrics.testCoverage).toBe(95);
      expect(result.data?.qualityMetrics.complexity).toBe(2);
      expect(result.data?.qualityMetrics.securityScore).toBe(95);
      expect(result.data?.qualityMetrics.maintainability).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const input = {
        codeDescription: '', // Invalid empty description
      };

      const result = await handleSmartWrite(input) as SmartWriteResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should validate input schema', async () => {
      const invalidInput = {
        invalidField: 'test',
      };

      const result = await handleSmartWrite(invalidInput) as SmartWriteResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid arguments');
    });
  });
});