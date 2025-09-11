#!/usr/bin/env node

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SimpleSDLCWorkflow, WorkflowOptions } from './simple-sdlc-workflow.js';
import * as fs from 'fs/promises';

// Mock the core analyzers
vi.mock('../core/simple-analyzer.js');
vi.mock('../core/context7-project-analyzer.js');
vi.mock('../core/code-validator.js');
vi.mock('../core/security-scanner.js');
vi.mock('../core/static-analyzer.js');
vi.mock('../core/project-scanner.js');

describe('SimpleSDLCWorkflow', () => {
  let workflow: SimpleSDLCWorkflow;
  const testProjectPath = './test-project';

  beforeEach(async () => {
    // Set up mocks before creating workflow instance
    const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
    const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
    const { CodeValidator } = await import('../core/code-validator.js');

    // Mock SimpleAnalyzer
    vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
      projectPath: testProjectPath,
      summary: {
        overallScore: 85,
      },
      security: {
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        },
        vulnerabilities: [],
      },
      static: {
        metrics: {
          complexity: 80,
          maintainability: 80,
          testability: 80,
        },
        issues: [],
      },
      project: {
        detectedTechStack: ['typescript', 'node'],
        projectStructure: {
          files: ['src/index.ts', 'package.json'],
          directories: ['src'],
        },
      },
    });

    // Mock Context7ProjectAnalyzer
    vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
      .fn()
      .mockResolvedValue({
        topics: [],
        data: [],
      });

    // Mock CodeValidator
    vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
      isValid: true,
      validationTime: 100,
      overallScore: 95,
      security: {
        status: 'pass',
        score: 98,
        issues: [],
      },
      quality: {
        status: 'pass',
        score: 95,
        issues: [],
        metrics: {
          complexity: 8,
          maintainability: 85,
          testability: 75,
        },
      },
      recommendations: [],
    });

    workflow = new SimpleSDLCWorkflow(testProjectPath);
  });

  afterEach(async () => {
    // Cleanup any temp files
    try {
      await fs.rm('./temp-validation', { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('executeWorkflow', () => {
    it('should execute complete workflow successfully for developer role', async () => {
      // Create mocks before importing
      const mockRunBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        summary: {
          overallScore: 85,
        },
        security: {
          summary: {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
          },
          vulnerabilities: [],
        },
        static: {
          metrics: {
            complexity: 80,
            maintainability: 80,
            testability: 80,
          },
          issues: [],
        },
        project: {
          detectedTechStack: ['typescript', 'node'],
          projectStructure: {
            files: Array.from({ length: 150 }, (_, i) => `src/file${i}.ts`),
            directories: ['src', 'tests', 'docs'],
          },
        },
      });

      // Mock the modules
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = mockRunBasicAnalysis;

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [{ title: 'Best Practices', content: 'Use TypeScript for type safety' }],
          patterns: [{ type: 'best_practice', content: 'Follow clean code principles' }],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 88,
        security: {
          status: 'pass',
          score: 92,
          issues: [],
        },
        quality: {
          status: 'pass',
          score: 85,
          metrics: {
            complexity: 5,
            maintainability: 90,
            testability: 80,
          },
        },
        recommendations: [],
      });

      const request = {
        description: 'User Authentication Service',
        features: ['login', 'logout', 'registration'],
      };

      const options: Partial<WorkflowOptions> = {
        userRole: 'developer',
        qualityLevel: 'standard',
        enableContext7: true,
        enableValidation: true,
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.phases.analysis.success).toBe(true);
      expect(result.phases.context7.success).toBe(true);
      expect(result.phases.codeGeneration.success).toBe(true);
      expect(result.phases.validation.success).toBe(true);
      expect(result.generatedCode).toBeDefined();
      expect(result.generatedCode!.files).toHaveLength(1); // Developer gets main implementation
      expect(result.validation).toBeDefined();
      expect(result.businessValue.timeSaved).toBeGreaterThan(0);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should generate comprehensive tests for qa-engineer role', async () => {
      // Mock successful responses
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        overallScore: 90,
        security: { score: 95, issues: [] },
        quality: { score: 85, issues: [] },
        project: {
          technologies: ['typescript', 'vitest'],
          estimatedSize: 300000,
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [],
          data: [],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 90,
        security: { status: 'pass', score: 95, issues: [] },
        quality: {
          status: 'pass',
          score: 85,
          metrics: { complexity: 3, maintainability: 95, testability: 90 },
        },
        recommendations: [],
      });

      const request = {
        description: 'Payment Processing',
        features: ['credit-card', 'paypal', 'refunds'],
      };

      const options: Partial<WorkflowOptions> = {
        userRole: 'qa-engineer',
        qualityLevel: 'enterprise',
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.generatedCode!.files).toHaveLength(2); // Main implementation + comprehensive tests

      const testFile = result.generatedCode!.files.find(f => f.type === 'test');
      expect(testFile).toBeDefined();
      expect(testFile!.path).toContain('.test.ts');
      expect(testFile!.content).toContain('describe');
      expect(testFile!.content).toContain('beforeEach');
      expect(testFile!.content).toContain('afterEach');
    });

    it('should generate deployment config for operations-engineer role', async () => {
      // Mock successful responses
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        summary: {
          overallScore: 85,
        },
        security: {
          summary: {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
          },
          vulnerabilities: [],
        },
        static: {
          metrics: {
            complexity: 82,
            maintainability: 82,
            testability: 82,
          },
          issues: [],
        },
        project: {
          detectedTechStack: ['node', 'express', 'docker'],
          projectStructure: {
            files: Array.from({ length: 150 }, (_, i) => `src/file${i}.ts`),
            directories: ['src', 'tests', 'docs'],
          },
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [],
          data: [],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 85,
        security: { status: 'pass', score: 88, issues: [] },
        quality: {
          status: 'pass',
          score: 82,
          metrics: { complexity: 8, maintainability: 85, testability: 75 },
        },
        recommendations: [],
      });

      const request = {
        description: 'API Gateway',
        features: ['routing', 'rate-limiting', 'authentication'],
      };

      const options: Partial<WorkflowOptions> = {
        userRole: 'operations-engineer',
        qualityLevel: 'enterprise',
      };

      // Create a new workflow instance after setting up the mock
      const deploymentWorkflow = new SimpleSDLCWorkflow(testProjectPath);
      const result = await deploymentWorkflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.generatedCode!.files).toHaveLength(2); // Main implementation + deployment config

      const configFile = result.generatedCode!.files.find(f => f.type === 'config');
      expect(configFile).toBeDefined();
      expect(configFile!.path).toContain('deployment/config.yaml');
      expect(configFile!.content).toContain('apiVersion: apps/v1');
      expect(configFile!.content).toContain('kind: Deployment');
      expect(configFile!.content).toContain('replicas: 3'); // Enterprise should have 3 replicas
      expect(configFile!.content).toContain('512Mi'); // Large project should get more memory
    });

    it('should generate documentation for product-strategist role', async () => {
      // Mock successful responses
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        overallScore: 88,
        security: { score: 90, issues: [] },
        quality: { score: 86, issues: [] },
        project: {
          technologies: ['react', 'typescript'],
          estimatedSize: 800000,
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [
            { title: 'Business Logic', content: 'Focus on user experience and conversion rates' },
          ],
          patterns: [{ type: 'business_pattern', content: 'Implement analytics tracking' }],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 88,
        security: { status: 'pass', score: 90, issues: [] },
        quality: {
          status: 'pass',
          score: 86,
          metrics: { complexity: 6, maintainability: 88, testability: 82 },
        },
        recommendations: [],
      });

      const request = {
        description: 'Customer Dashboard',
        features: ['analytics', 'reporting', 'user-management'],
      };

      const options: Partial<WorkflowOptions> = {
        userRole: 'product-strategist',
        qualityLevel: 'standard',
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.generatedCode!.files).toHaveLength(2); // Main implementation + documentation

      const docFile = result.generatedCode!.files.find(f => f.type === 'documentation');
      expect(docFile).toBeDefined();
      expect(docFile!.path).toContain('docs/implementation-guide.md');
      expect(docFile!.content).toContain('# Customer Dashboard - Implementation Guide');
      expect(docFile!.content).toContain('## Features');
      expect(docFile!.content).toContain('analytics');
    });

    it('should handle analysis phase failure gracefully', async () => {
      // Mock analysis failure - override the beforeEach mock
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi
        .fn()
        .mockRejectedValue(new Error('Analysis scanner failed'));

      // Create a new workflow instance after setting up the failure mock
      const failureWorkflow = new SimpleSDLCWorkflow(testProjectPath);

      const request = {
        description: 'Test Service',
        features: ['basic-functionality'],
      };

      const result = await failureWorkflow.executeWorkflow(testProjectPath, request);

      expect(result.success).toBe(false);
      expect(result.phases.analysis.success).toBe(false);
      expect(result.phases.analysis.error).toContain('Analysis scanner failed');
      expect(result.recommendations).toContain('Manual review required due to workflow failure');
    });

    it('should work without Context7 when disabled', async () => {
      // Mock successful analysis but disable Context7
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        overallScore: 80,
        security: { score: 85, issues: [] },
        quality: { score: 75, issues: [] },
        project: {
          technologies: ['javascript'],
          estimatedSize: 200000,
        },
      });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 80,
        security: { status: 'pass', score: 85, issues: [] },
        quality: {
          status: 'pass',
          score: 75,
          metrics: { complexity: 4, maintainability: 80, testability: 70 },
        },
        recommendations: [],
      });

      const request = {
        description: 'Simple Service',
        features: ['basic'],
      };

      const options: Partial<WorkflowOptions> = {
        enableContext7: false,
        enableValidation: true,
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.phases.context7.success).toBe(true);
      expect(result.phases.context7.data).toBe(null);
      expect(result.phases.context7.duration).toBe(0);
    });

    it('should work without validation when disabled', async () => {
      // Mock successful analysis but disable validation
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        summary: {
          overallScore: 85,
        },
        security: {
          summary: {
            total: 0,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
          },
          vulnerabilities: [],
        },
        static: {
          metrics: {
            complexity: 82,
            maintainability: 82,
            testability: 82,
          },
          issues: [],
        },
        project: {
          detectedTechStack: ['typescript'],
          projectStructure: {
            files: ['src/index.ts', 'package.json'],
            directories: ['src'],
          },
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [],
          data: [],
        });

      const request = {
        description: 'Basic Service',
        features: ['core'],
      };

      const options: Partial<WorkflowOptions> = {
        enableContext7: true,
        enableValidation: false,
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.phases.validation.success).toBe(true);
      expect(result.phases.validation.data).toBe(null);
      expect(result.phases.validation.duration).toBe(0);
      expect(result.validation).toBeUndefined();
    });

    it('should generate additional files when options are enabled', async () => {
      // Mock successful responses
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        overallScore: 90,
        security: { score: 92, issues: [] },
        quality: { score: 88, issues: [] },
        project: {
          technologies: ['typescript'],
          estimatedSize: 600000,
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [],
          data: [],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 90,
        security: { status: 'pass', score: 92, issues: [] },
        quality: {
          status: 'pass',
          score: 88,
          metrics: { complexity: 3, maintainability: 92, testability: 85 },
        },
        recommendations: [],
      });

      const request = {
        description: 'Feature Service',
        features: ['feature1', 'feature2'],
      };

      const options: Partial<WorkflowOptions> = {
        userRole: 'developer',
        generateTests: true,
        generateDocumentation: true,
      };

      const result = await workflow.executeWorkflow(testProjectPath, request, options);

      expect(result.success).toBe(true);
      expect(result.generatedCode!.files).toHaveLength(3); // Main + basic test + README

      const basicTestFile = result.generatedCode!.files.find(f => f.path.includes('basic.test.ts'));
      expect(basicTestFile).toBeDefined();

      const readmeFile = result.generatedCode!.files.find(f => f.path.includes('README.md'));
      expect(readmeFile).toBeDefined();
    });

    it('should calculate business value correctly', async () => {
      // Mock successful responses with specific timing
      const { SimpleAnalyzer } = await import('../core/simple-analyzer.js');
      const { Context7ProjectAnalyzer } = await import('../core/context7-project-analyzer.js');
      const { CodeValidator } = await import('../core/code-validator.js');

      vi.mocked(SimpleAnalyzer).prototype.runBasicAnalysis = vi.fn().mockResolvedValue({
        projectPath: testProjectPath,
        overallScore: 95,
        security: { score: 98, issues: [] },
        quality: { score: 92, issues: [] },
        project: {
          technologies: ['typescript'],
          estimatedSize: 500000,
        },
      });

      vi.mocked(Context7ProjectAnalyzer).prototype.getProjectAwareContext = vi
        .fn()
        .mockResolvedValue({
          topics: [],
          data: [],
        });

      vi.mocked(CodeValidator).prototype.validateGeneratedCode = vi.fn().mockResolvedValue({
        isValid: true,
        overallScore: 95,
        security: { status: 'pass', score: 98, issues: [] },
        quality: {
          status: 'pass',
          score: 92,
          metrics: { complexity: 2, maintainability: 95, testability: 90 },
        },
        recommendations: [],
      });

      const request = {
        description: 'High Quality Service',
      };

      const result = await workflow.executeWorkflow(testProjectPath, request);

      expect(result.businessValue.timeSaved).toBeGreaterThan(0);
      expect(result.businessValue.qualityImprovement).toBe(95);
      expect(result.businessValue.riskReduction).toBe(98);
    });
  });
});
