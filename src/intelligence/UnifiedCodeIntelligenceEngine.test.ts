/**
 * Comprehensive Test Suite for UnifiedCodeIntelligenceEngine
 *
 * Tests the core orchestration engine with all category engines,
 * performance caching, error handling, and Context7 integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  UnifiedCodeIntelligenceEngine,
  CodeGenerationRequest,
} from './UnifiedCodeIntelligenceEngine.js';
import { Context7Data } from './CategoryIntelligenceEngine.js';
import { globalErrorHandler } from './ErrorHandling.js';

// Mock the performance cache and error handler
vi.mock('./PerformanceCache.js', () => ({
  globalPerformanceCache: {
    cacheCodeGeneration: vi.fn().mockImplementation((request, fn) => fn()),
    cacheTechnologyInsights: vi.fn().mockImplementation((key, data, fn) => fn()),
    cacheCodeAnalysis: vi.fn().mockImplementation((code, tech, fn) => fn()),
  },
}));

vi.mock('./AdvancedContext7Cache.js', () => ({
  globalAdvancedContext7Cache: {
    cacheCodeGeneration: vi
      .fn()
      .mockImplementation(
        async (request, generator, codeType = 'generic', technology = 'unknown') => {
          const result = await generator();
          return result;
        }
      ),
    cacheTechnologyInsights: vi.fn().mockImplementation(async (key, context, generator) => {
      const result = await generator();
      return result;
    }),
    cacheCodeAnalysis: vi.fn().mockImplementation(async (code, tech, generator) => {
      const result = await generator();
      return result;
    }),
    getStats: vi.fn().mockReturnValue({
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
    }),
  },
}));

vi.mock('./ErrorHandling.js', () => ({
  globalErrorHandler: {
    executeContext7Operation: vi.fn().mockImplementation((fn, fallback) => fn()),
    executeAnalysisOperation: vi.fn().mockImplementation((type, fn, fallback) => fn()),
    executeGenerationOperation: vi.fn().mockImplementation((fn, fallback) => fn()),
    getErrorStats: vi.fn().mockReturnValue({
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByComponent: {},
      circuitBreakerStates: {},
      recentErrors: [],
    }),
  },
}));

// Mock Context7ProjectAnalyzer
vi.mock('../core/context7-project-analyzer.js', () => ({
  Context7ProjectAnalyzer: vi.fn().mockImplementation(() => ({
    getProjectAwareContext: vi.fn().mockResolvedValue({
      topics: ['test'],
      data: [],
      insights: {
        patterns: ['modern development'],
        bestPractices: ['use TypeScript'],
        recommendations: ['implement testing'],
        warnings: [],
        techStackSpecific: {},
        qualityMetrics: { overall: 85 },
      },
      metadata: { totalResults: 1, fetchTime: 100, cacheHits: 0 },
    }),
  })),
}));

// Mock TechnologyDiscoveryEngine
vi.mock('./TechnologyDiscoveryEngine.js', () => ({
  TechnologyDiscoveryEngine: vi.fn().mockImplementation(() => ({
    discoverAvailableTechnologies: vi.fn().mockResolvedValue({
      frontend: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'],
      backend: ['Node.js', 'Python', 'Java'],
      database: ['PostgreSQL', 'MySQL', 'MongoDB'],
      devops: ['Docker', 'Kubernetes'],
      mobile: ['React Native', 'Flutter'],
      datascience: ['Python'],
      generic: ['TypeScript'],
    }),
  })),
}));

// Mock QualityAssuranceEngine
vi.mock('./QualityAssuranceEngine.js', () => ({
  QualityAssuranceEngine: vi.fn().mockImplementation(() => ({
    analyze: vi.fn().mockResolvedValue({
      overall: 88,
      message: 'Good quality code',
      breakdown: {
        maintainability: { score: 85, complexity: 5, readability: 9 },
        performance: { score: 90, bottlenecks: [] },
        security: { score: 85, vulnerabilities: [] },
      },
      timestamp: new Date().toISOString(),
    }),
  })),
}));

// Mock CodeOptimizationEngine
vi.mock('./CodeOptimizationEngine.js', () => ({
  CodeOptimizationEngine: vi.fn().mockImplementation(() => ({
    optimize: vi.fn().mockImplementation(code => Promise.resolve(code + '\n// Optimized')),
  })),
}));

describe('UnifiedCodeIntelligenceEngine', () => {
  let engine: UnifiedCodeIntelligenceEngine;

  beforeEach(() => {
    engine = new UnifiedCodeIntelligenceEngine();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Keep mocks active - only clear call history
  });

  describe('Initialization', () => {
    it('should initialize with all category engines', () => {
      expect(engine).toBeDefined();
      // Verify that the engine has access to category engines through its methods
      expect(typeof engine.generateCode).toBe('function');
    });

    it('should have all required category engines registered', async () => {
      // Test that each category can be detected and routed correctly
      const frontendRequest: CodeGenerationRequest = {
        featureDescription: 'Create a React component',
        techStack: ['React'],
      };

      const result = await engine.generateCode(frontendRequest);
      expect(result).toBeDefined();
      expect(result.category).toBe('frontend');
    });
  });

  describe('Technology Detection', () => {
    it('should detect frontend technology correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a React component with hooks',
        techStack: ['React', 'TypeScript'],
      };

      const result = await engine.generateCode(request);
      expect(result.technology).toBe('React');
      expect(result.category).toBe('frontend');
    });

    it('should detect backend technology correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a REST API endpoint',
        techStack: ['Node.js', 'Express'],
      };

      const result = await engine.generateCode(request);
      expect(result.technology).toBe('Node.js');
      expect(result.category).toBe('backend');
    });

    it('should detect database technology correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a database migration',
        techStack: ['PostgreSQL'],
      };

      const result = await engine.generateCode(request);
      expect(result.technology).toBe('PostgreSQL');
      expect(result.category).toBe('database');
    });

    it('should detect devops technology correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a Dockerfile for the application',
        techStack: ['Docker'],
      };

      const result = await engine.generateCode(request);
      expect(result.technology).toBe('Docker');
      expect(result.category).toBe('devops');
    });

    it('should detect mobile technology correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a mobile app screen',
        techStack: ['React Native'],
      };

      const result = await engine.generateCode(request);
      expect(result.technology).toBe('React Native');
      expect(result.category).toBe('mobile');
    });

    it('should fallback to generic for unknown technologies', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create some code',
        techStack: ['UnknownTech'],
      };

      const result = await engine.generateCode(request);
      expect(result.category).toBe('generic');
    });

    it('should detect technology from description when techStack is empty', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a React component with useState hook',
      };

      const result = await engine.generateCode(request);
      expect(result.category).toBe('frontend');
    });
  });

  describe('Code Generation', () => {
    it('should generate frontend code with quality metrics', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a login form component',
        techStack: ['React', 'TypeScript'],
        role: 'developer',
        quality: 'production',
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.code.length).toBeGreaterThan(0);
      expect(result.technology).toBe('React');
      expect(result.category).toBe('frontend');
      expect(result.qualityScore.overall).toBeGreaterThan(0);
      expect(result.metadata.engineUsed).toBe('frontend');
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should generate backend code with Context7 insights', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a user authentication API',
        techStack: ['Node.js', 'Express'],
        projectAnalysis: {
          projectPath: '/test/project',
          project: { name: 'test-api' },
        },
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.technology).toBe('Node.js');
      expect(result.category).toBe('backend');
      expect(result.insights).toBeDefined();
      expect(result.metadata.context7Insights).toBeGreaterThan(0);
    });

    it('should handle role-based code generation', async () => {
      const developerRequest: CodeGenerationRequest = {
        featureDescription: 'Create a database model',
        techStack: ['PostgreSQL'],
        role: 'developer',
      };

      const qaRequest: CodeGenerationRequest = {
        featureDescription: 'Create a database model',
        techStack: ['PostgreSQL'],
        role: 'qa',
      };

      const devResult = await engine.generateCode(developerRequest);
      const qaResult = await engine.generateCode(qaRequest);

      expect(devResult.code).toBeDefined();
      expect(qaResult.code).toBeDefined();
      // Code might differ based on role, but both should be valid
      expect(devResult.category).toBe('database');
      expect(qaResult.category).toBe('database');
    });

    it('should apply quality levels correctly', async () => {
      const productionRequest: CodeGenerationRequest = {
        featureDescription: 'Create a mobile component',
        techStack: ['React Native'],
        quality: 'production',
      };

      const prototypeRequest: CodeGenerationRequest = {
        featureDescription: 'Create a mobile component',
        techStack: ['React Native'],
        quality: 'prototype',
      };

      const prodResult = await engine.generateCode(productionRequest);
      const protoResult = await engine.generateCode(prototypeRequest);

      expect(prodResult.code).toBeDefined();
      expect(protoResult.code).toBeDefined();
      expect(prodResult.category).toBe('mobile');
      expect(protoResult.category).toBe('mobile');
    });
  });

  describe('Performance and Caching', () => {
    it('should use caching for repeated requests', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a cached component',
        techStack: ['React'],
      };

      // First request
      const result1 = await engine.generateCode(request);
      // Second identical request
      const result2 = await engine.generateCode(request);

      expect(result1.code).toBeDefined();
      expect(result2.code).toBeDefined();
      expect(result1.category).toBe(result2.category);
      expect(result1.technology).toBe(result2.technology);
    });

    it('should have reasonable performance for code generation', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a performance test component',
        techStack: ['React', 'TypeScript'],
      };

      const startTime = Date.now();
      const result = await engine.generateCode(request);
      const endTime = Date.now();

      expect(result.code).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle Context7 failures gracefully', async () => {
      // Mock Context7 failure at the errorHandler level
      vi.mocked(globalErrorHandler.executeContext7Operation).mockImplementationOnce(
        (operation, fallback) =>
          fallback ? fallback() : Promise.reject(new Error('Context7 unavailable'))
      );

      const request: CodeGenerationRequest = {
        featureDescription: 'Create component with Context7 failure',
        techStack: ['React'],
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.category).toBe('frontend');
      // Should still work with fallback
    });

    it('should handle invalid input gracefully', async () => {
      const invalidRequest = {
        featureDescription: '', // Empty description
        techStack: [],
      } as CodeGenerationRequest;

      const result = await engine.generateCode(invalidRequest);

      expect(result.code).toBeDefined();
      expect(result.category).toBe('generic'); // Should fallback to generic
    });

    it('should validate input schema', async () => {
      const invalidRequest = {
        // Missing featureDescription
        techStack: ['React'],
      } as any;

      await expect(engine.generateCode(invalidRequest)).rejects.toThrow();
    });
  });

  describe('Quality Assurance Integration', () => {
    it('should provide quality metrics for generated code', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a well-structured component',
        techStack: ['React', 'TypeScript'],
      };

      const result = await engine.generateCode(request);

      expect(result.qualityScore).toBeDefined();
      expect(result.qualityScore.overall).toBeGreaterThan(0);
      expect(result.qualityScore.overall).toBeLessThanOrEqual(100);
      expect(result.qualityScore.breakdown).toBeDefined();
    });

    it('should apply code optimization', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create an optimizable component',
        techStack: ['React'],
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.code).toContain('// Optimized'); // Mock optimization adds this comment
    });
  });

  describe('Category Engine Integration', () => {
    it('should route DevOps requests correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a Kubernetes deployment manifest',
        techStack: ['Kubernetes'],
      };

      const result = await engine.generateCode(request);

      expect(result.category).toBe('devops');
      expect(result.technology).toBe('Kubernetes');
      expect(result.code).toBeDefined();
    });

    it('should route Mobile requests correctly', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a Flutter widget',
        techStack: ['Flutter'],
      };

      const result = await engine.generateCode(request);

      expect(result.category).toBe('mobile');
      expect(result.technology).toBe('Flutter');
      expect(result.code).toBeDefined();
    });

    it('should handle multiple technology stacks', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a full-stack application',
        techStack: ['React', 'Node.js', 'PostgreSQL'],
      };

      const result = await engine.generateCode(request);

      // Should pick the first technology in the stack
      expect(result.technology).toBe('React');
      expect(result.category).toBe('frontend');
      expect(result.code).toBeDefined();
    });
  });

  describe('Context7 Integration', () => {
    it('should utilize Context7 insights in code generation', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a component with project context',
        techStack: ['React'],
        projectAnalysis: {
          projectPath: '/test/project',
          project: {
            name: 'test-project',
            detectedTechStack: ['React', 'TypeScript'],
          },
        },
      };

      const result = await engine.generateCode(request);

      expect(result.insights).toBeDefined();
      expect(result.insights.patterns).toContain('modern development');
      expect(result.insights.bestPractices).toContain('use TypeScript');
      expect(result.metadata.context7Insights).toBeGreaterThan(0);
    });

    it('should work without project analysis', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a standalone component',
        techStack: ['React'],
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.category).toBe('frontend');
      // Should still work without project analysis
    });
  });

  describe('Metadata and Debugging', () => {
    it('should provide comprehensive metadata', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a well-documented component',
        techStack: ['React', 'TypeScript'],
      };

      const result = await engine.generateCode(request);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.engineUsed).toBe('frontend');
      expect(typeof result.metadata.context7Insights).toBe('number');
    });

    it('should handle concurrent requests', async () => {
      const requests: CodeGenerationRequest[] = [
        {
          featureDescription: 'Create component 1',
          techStack: ['React'],
        },
        {
          featureDescription: 'Create API endpoint',
          techStack: ['Node.js'],
        },
        {
          featureDescription: 'Create database table',
          techStack: ['PostgreSQL'],
        },
      ];

      const results = await Promise.all(requests.map(request => engine.generateCode(request)));

      expect(results).toHaveLength(3);
      expect(results[0].category).toBe('frontend');
      expect(results[1].category).toBe('backend');
      expect(results[2].category).toBe('database');

      // All should have valid code
      results.forEach(result => {
        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very long feature descriptions', async () => {
      const longDescription = 'Create a component that does '.repeat(100) + 'something amazing';

      const request: CodeGenerationRequest = {
        featureDescription: longDescription,
        techStack: ['React'],
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      expect(result.category).toBe('frontend');
    });

    it('should handle empty technology stack gracefully', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create something with React components',
        techStack: [],
      };

      const result = await engine.generateCode(request);

      expect(result.code).toBeDefined();
      // Should detect technology from description or use generic
      expect(['frontend', 'generic']).toContain(result.category);
    });

    it('should handle technology stack with duplicates', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a React component',
        techStack: ['React', 'React', 'TypeScript', 'React'],
      };

      const result = await engine.generateCode(request);

      expect(result.technology).toBe('React');
      expect(result.category).toBe('frontend');
      expect(result.code).toBeDefined();
    });

    it('should handle case-insensitive technology detection', async () => {
      const request: CodeGenerationRequest = {
        featureDescription: 'Create a component using REACT and typescript',
        techStack: ['react', 'TYPESCRIPT'],
      };

      const result = await engine.generateCode(request);

      expect(result.technology).toBe('react');
      expect(result.category).toBe('frontend');
      expect(result.code).toBeDefined();
    });
  });
});
