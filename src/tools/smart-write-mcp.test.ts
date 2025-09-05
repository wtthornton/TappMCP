import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SmartWriteMCPTool, type SmartWriteInput } from './smart-write-mcp.js';

describe('SmartWriteMCPTool', () => {
  let tool: SmartWriteMCPTool;

  beforeEach(() => {
    tool = new SmartWriteMCPTool();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(tool).toBeDefined();
      expect(tool).toBeInstanceOf(SmartWriteMCPTool);
    });
  });

  describe('Basic Code Generation', () => {
    it('should generate function code successfully', async () => {
      const input: SmartWriteInput = {
        projectId: 'test-project-123',
        featureDescription: 'Process user input',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        businessContext: {
          goals: ['improve efficiency'],
          targetUsers: ['developers'],
          priority: 'high'
        },
        qualityRequirements: {
          testCoverage: 90,
          complexity: 3,
          securityLevel: 'high'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.codeId).toContain('code_');
      expect(result.data?.codeId).toContain('process_user_input');
      expect(result.data?.generatedCode.content).toContain('export function processFeature');
      expect(result.data?.generatedCode.language).toBe('TypeScript');
      expect(result.data?.generatedCode.thoughtProcess).toHaveLength(5);
      expect(result.data?.generatedCode.testCases.length).toBeGreaterThanOrEqual(3);
      expect(result.data?.qualityMetrics.testCoverage).toBe(90);
      expect(result.data?.qualityMetrics.securityScore).toBe(90);
      expect(result.data?.businessValue.timeSaved).toBeGreaterThan(0);
      expect(result.data?.nextSteps).toHaveLength(4);
      expect(result.data?.roleSpecificInsights).toHaveLength(3);
    });

    it('should handle minimal input', async () => {
      const input: SmartWriteInput = {
        projectId: 'minimal-project',
        featureDescription: 'Simple feature',
        techStack: [],
        targetRole: 'developer',
        codeType: 'function'
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.codeId).toContain('simple_feature');
      expect(result.data?.generatedCode.language).toBe('TypeScript'); // Default
    });
  });

  describe('Code Type Variations', () => {
    it('should generate component code for React', async () => {
      const input: SmartWriteInput = {
        projectId: 'react-project',
        featureDescription: 'User input form',
        targetRole: 'designer',
        codeType: 'component',
        techStack: ['react', 'typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.content).toContain('React.FC');
      expect(result.data?.generatedCode.framework).toBe('React');
      expect(result.data?.generatedCode.content).toContain('interface');
    });

    it('should generate API code for Express', async () => {
      const input: SmartWriteInput = {
        projectId: 'api-project',
        featureDescription: 'User authentication endpoint',
        targetRole: 'operations-engineer',
        codeType: 'api',
        techStack: ['express', 'typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.content).toContain('express');
      expect(result.data?.generatedCode.framework).toBe('Express.js');
      expect(result.data?.generatedCode.content).toContain('router.post');
    });

    it('should generate test code', async () => {
      const input: SmartWriteInput = {
        projectId: 'test-project',
        featureDescription: 'Data validation tests',
        targetRole: 'qa-engineer',
        codeType: 'test',
        techStack: ['typescript', 'vitest']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.content).toContain('describe');
      expect(result.data?.generatedCode.content).toContain('expect');
      expect(result.data?.generatedCode.dependencies).toContain('vitest');
    });

    it('should generate config code', async () => {
      const input: SmartWriteInput = {
        projectId: 'config-project',
        featureDescription: 'Database configuration',
        targetRole: 'operations-engineer',
        codeType: 'config',
        techStack: ['typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.content).toContain('export const');
      expect(result.data?.generatedCode.content).toContain('Config');
    });

    it('should generate documentation code', async () => {
      const input: SmartWriteInput = {
        projectId: 'doc-project',
        featureDescription: 'API documentation',
        targetRole: 'developer',
        codeType: 'documentation',
        techStack: ['markdown']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.content).toContain('# API documentation');
      expect(result.data?.generatedCode.content).toContain('## Overview');
    });
  });

  describe('Language Support', () => {
    it('should generate Python code', async () => {
      const input: SmartWriteInput = {
        projectId: 'python-project',
        featureDescription: 'Data processing function',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['python']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.language).toBe('Python');
      expect(result.data?.generatedCode.content).toContain('def process_feature');
      expect(result.data?.generatedCode.content).toContain('from typing import');
    });

    it('should default to TypeScript for unknown tech stack', async () => {
      const input: SmartWriteInput = {
        projectId: 'unknown-project',
        featureDescription: 'Test feature',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['unknown']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.language).toBe('TypeScript');
    });
  });

  describe('Role-Specific Features', () => {
    it('should generate developer-specific insights', async () => {
      const input: SmartWriteInput = {
        projectId: 'dev-project',
        featureDescription: 'Complex algorithm',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.roleSpecificInsights).toContain('Code follows TypeScript best practices');
      expect(result.data?.roleSpecificInsights).toContain('Includes comprehensive error handling');
    });

    it('should generate product-strategist-specific insights', async () => {
      const input: SmartWriteInput = {
        projectId: 'product-project',
        featureDescription: 'User feature',
        targetRole: 'product-strategist',
        codeType: 'function',
        techStack: ['typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.roleSpecificInsights).toContain('Feature aligns with business requirements');
      expect(result.data?.roleSpecificInsights).toContain('Includes user-focused error messages');
    });

    it('should generate designer-specific insights', async () => {
      const input: SmartWriteInput = {
        projectId: 'design-project',
        featureDescription: 'UI component',
        targetRole: 'designer',
        codeType: 'component',
        techStack: ['react', 'typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.roleSpecificInsights).toContain('User-friendly interface considerations');
      expect(result.data?.roleSpecificInsights).toContain('Accessibility features included');
    });

    it('should generate qa-engineer-specific insights', async () => {
      const input: SmartWriteInput = {
        projectId: 'qa-project',
        featureDescription: 'Testable function',
        targetRole: 'qa-engineer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.roleSpecificInsights).toContain('Comprehensive test coverage provided');
      expect(result.data?.roleSpecificInsights).toContain('Edge cases and error scenarios covered');
    });

    it('should generate operations-engineer-specific insights', async () => {
      const input: SmartWriteInput = {
        projectId: 'ops-project',
        featureDescription: 'Production service',
        targetRole: 'operations-engineer',
        codeType: 'api',
        techStack: ['express', 'typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.roleSpecificInsights).toContain('Production-ready error handling');
      expect(result.data?.roleSpecificInsights).toContain('Monitoring and logging considerations');
    });
  });

  describe('Quality Requirements', () => {
    it('should apply high security requirements', async () => {
      const input: SmartWriteInput = {
        projectId: 'secure-project',
        featureDescription: 'Secure function',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        qualityRequirements: {
          testCoverage: 95,
          complexity: 2,
          securityLevel: 'high'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.qualityMetrics.securityScore).toBe(90);
      expect(result.data?.qualityMetrics.testCoverage).toBe(95);
      expect(result.data?.qualityMetrics.complexity).toBe(2);
    });

    it('should apply medium security requirements', async () => {
      const input: SmartWriteInput = {
        projectId: 'medium-project',
        featureDescription: 'Medium function',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        qualityRequirements: {
          testCoverage: 80,
          complexity: 5,
          securityLevel: 'medium'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.qualityMetrics.securityScore).toBe(75);
      expect(result.data?.qualityMetrics.testCoverage).toBe(80);
      expect(result.data?.qualityMetrics.complexity).toBe(5);
    });

    it('should apply low security requirements', async () => {
      const input: SmartWriteInput = {
        projectId: 'low-project',
        featureDescription: 'Low function',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        qualityRequirements: {
          testCoverage: 70,
          complexity: 8,
          securityLevel: 'low'
        }
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.qualityMetrics.securityScore).toBe(60);
      expect(result.data?.qualityMetrics.testCoverage).toBe(70);
      expect(result.data?.qualityMetrics.complexity).toBe(8);
    });
  });

  describe('Business Context', () => {
    it('should calculate business value based on priority', async () => {
      const highPriorityInput: SmartWriteInput = {
        projectId: 'high-priority',
        featureDescription: 'Critical feature',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        businessContext: {
          priority: 'high'
        }
      };

      const lowPriorityInput: SmartWriteInput = {
        projectId: 'low-priority',
        featureDescription: 'Nice to have feature',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        businessContext: {
          priority: 'low'
        }
      };

      const highResult = await tool.execute(highPriorityInput);
      const lowResult = await tool.execute(lowPriorityInput);

      expect(highResult.success).toBe(true);
      expect(lowResult.success).toBe(true);
      expect(highResult.data?.businessValue.timeSaved).toBeGreaterThan(
        lowResult.data?.businessValue.timeSaved || 0
      );
      expect(highResult.data?.businessValue.costPrevention).toBeGreaterThan(
        lowResult.data?.businessValue.costPrevention || 0
      );
    });

    it('should adjust business value based on code type', async () => {
      const apiInput: SmartWriteInput = {
        projectId: 'api-project',
        featureDescription: 'API endpoint',
        targetRole: 'developer',
        codeType: 'api',
        techStack: ['typescript']
      };

      const functionInput: SmartWriteInput = {
        projectId: 'function-project',
        featureDescription: 'Simple function',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const apiResult = await tool.execute(apiInput);
      const functionResult = await tool.execute(functionInput);

      expect(apiResult.success).toBe(true);
      expect(functionResult.success).toBe(true);
      expect(apiResult.data?.businessValue.timeSaved).toBeGreaterThan(
        functionResult.data?.businessValue.timeSaved || 0
      );
    });
  });

  describe('Code ID Generation', () => {
    it('should generate unique code IDs', async () => {
      const input1: SmartWriteInput = {
        projectId: 'test-project',
        featureDescription: 'Test feature 1',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const input2: SmartWriteInput = {
        projectId: 'test-project',
        featureDescription: 'Test feature 2',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const result1 = await tool.execute(input1);
      const result2 = await tool.execute(input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.codeId).not.toBe(result2.data?.codeId);
      expect(result1.data?.codeId).toContain('test_feature_1');
      expect(result2.data?.codeId).toContain('test_feature_2');
    });

    it('should clean feature descriptions in code IDs', async () => {
      const input: SmartWriteInput = {
        projectId: 'test-project',
        featureDescription: 'Complex Feature with Special Characters!',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.codeId).toContain('complex_feature_with_special_characters');
      expect(result.data?.codeId).not.toContain('!');
      expect(result.data?.codeId).not.toContain(' ');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidInput = {
        projectId: '', // Invalid: empty string
        featureDescription: '', // Invalid: empty string
        techStack: 'not-an-array' // Invalid: should be array
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project ID is required');
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing projectId and featureDescription
        techStack: ['typescript']
      } as any;

      const result = await tool.execute(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const input: SmartWriteInput = {
        projectId: 'perf-project',
        featureDescription: 'Performance test feature',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript', 'react', 'express'],
        businessContext: {
          goals: ['performance'],
          priority: 'high'
        },
        qualityRequirements: {
          testCoverage: 95,
          complexity: 2,
          securityLevel: 'high'
        }
      };

      const startTime = performance.now();
      const result = await tool.execute(input);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Dependencies Generation', () => {
    it('should generate appropriate dependencies for tech stack', async () => {
      const input: SmartWriteInput = {
        projectId: 'deps-project',
        featureDescription: 'Feature with dependencies',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript', 'react', 'express', 'zod', 'vitest']
      };

      const result = await tool.execute(input);

      expect(result.success).toBe(true);
      expect(result.data?.generatedCode.dependencies).toContain('typescript');
      expect(result.data?.generatedCode.dependencies).toContain('react');
      expect(result.data?.generatedCode.dependencies).toContain('express');
      expect(result.data?.generatedCode.dependencies).toContain('zod');
      expect(result.data?.generatedCode.dependencies).toContain('vitest');
    });
  });

  describe('Test Cases Generation', () => {
    it('should generate test cases based on coverage requirements', async () => {
      const highCoverageInput: SmartWriteInput = {
        projectId: 'high-coverage',
        featureDescription: 'High coverage feature',
        targetRole: 'qa-engineer',
        codeType: 'function',
        techStack: ['typescript'],
        qualityRequirements: {
          testCoverage: 95
        }
      };

      const lowCoverageInput: SmartWriteInput = {
        projectId: 'low-coverage',
        featureDescription: 'Low coverage feature',
        targetRole: 'developer',
        codeType: 'function',
        techStack: ['typescript'],
        qualityRequirements: {
          testCoverage: 70
        }
      };

      const highResult = await tool.execute(highCoverageInput);
      const lowResult = await tool.execute(lowCoverageInput);

      expect(highResult.success).toBe(true);
      expect(lowResult.success).toBe(true);
      expect(highResult.data?.generatedCode.testCases.length).toBeGreaterThan(
        lowResult.data?.generatedCode.testCases.length || 0
      );
    });
  });
});
