#!/usr/bin/env node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartPlan } from './smart-plan.js';

// No mocking - tests will use real Context7 API calls

describe('Enhanced Smart Plan Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create project plan with Context7 enhancement', async () => {
    const input = {
      projectId: 'test-project-123',
      planType: 'development',
      scope: {
        features: ['user authentication', 'data management', 'API endpoints'],
        timeline: { duration: 8 },
        resources: { teamSize: 4, budget: 75000 },
      },
      businessContext: {
        goals: ['improve efficiency', 'reduce costs', 'enhance user experience'],
        targetUsers: ['end users', 'administrators'],
        successMetrics: ['user satisfaction', 'performance improvement'],
        riskFactors: ['technical complexity', 'timeline constraints'],
      },
      qualityRequirements: {
        testCoverage: 90,
        securityLevel: 'high',
        performanceTargets: {
          responseTime: 50,
          throughput: 2000,
          availability: 99.9,
        },
      },
      role: 'developer',
      roadmapType: 'detailed',
      externalSources: {
        useContext7: true,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartPlan(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    if (result.data) {
      const data = result.data as any;
      expect(data.projectId).toBe('test-project-123');
      expect(data.planType).toBe('development');
      expect(data.projectPlan).toBeDefined();
      expect(data.projectPlan.phases).toBeDefined();
      expect(Array.isArray(data.projectPlan.phases)).toBe(true);
      expect(data.projectPlan.phases.length).toBeGreaterThan(0);

      // Check Context7 integration
      expect(data.externalIntegration.context7Status).toBe('active');
      expect(data.externalIntegration.context7Knowledge).toBe('integrated');
      expect(data.externalIntegration.context7Enhancement).toBeDefined();
      expect(data.externalIntegration.context7Enhancement.dataCount).toBeGreaterThanOrEqual(0);
      expect(data.externalIntegration.context7Enhancement.cacheHit).toBeDefined();
      expect(data.externalIntegration.cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
    }
  });

  it('should generate different plans for different plan types', { timeout: 30000 }, async () => {
    const planTypes = ['development', 'testing', 'deployment', 'maintenance', 'migration'];

    for (const planType of planTypes) {
      const input = {
        projectId: `test-${planType}`,
        planType: planType as any,
        scope: {
          features: ['feature1', 'feature2'],
          timeline: { duration: 4 },
          resources: { teamSize: 3, budget: 50000 },
        },
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartPlan(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.planType).toBe(planType);
        expect(data.projectPlan.phases.length).toBeGreaterThan(0);
        expect(data.externalIntegration.context7Status).toBe('active');
      }
    }
  });

  it('should generate role-specific plans', { timeout: 30000 }, async () => {
    const roles = ['developer', 'product-strategist', 'operations-engineer', 'designer', 'qa-engineer'];

    for (const role of roles) {
      const input = {
        projectId: `test-${role}`,
        planType: 'development',
        role: role as any,
        scope: {
          features: ['core functionality'],
          timeline: { duration: 6 },
          resources: { teamSize: 2, budget: 40000 },
        },
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartPlan(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.projectPlan.phases).toBeDefined();
        expect(data.detailedRoadmap).toBeDefined();
        expect(data.processCompliance).toBeDefined();
        expect(data.learningIntegration).toBeDefined();
      }
    }
  });

  it('should generate different roadmap types', async () => {
    const roadmapTypes = ['detailed', 'high-level', 'milestone', 'sprint', 'phase'];

    for (const roadmapType of roadmapTypes) {
      const input = {
        projectId: `test-${roadmapType}`,
        planType: 'development',
        roadmapType: roadmapType as any,
        scope: {
          features: ['feature1'],
          timeline: { duration: 4 },
          resources: { teamSize: 3, budget: 30000 },
        },
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartPlan(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.detailedRoadmap.type).toBe(roadmapType);
        expect(data.technicalMetrics.roadmapDetailLevel).toBe(roadmapType);
      }
    }
  });

  it('should include business value and success metrics', async () => {
    const input = {
      projectId: 'test-business-value',
      planType: 'development',
      businessContext: {
        goals: ['increase revenue', 'improve efficiency'],
        targetUsers: ['customers', 'partners'],
        successMetrics: ['ROI', 'user adoption'],
        riskFactors: ['market competition', 'technical risks'],
      },
      scope: {
        features: ['payment processing', 'analytics'],
        timeline: { duration: 12 },
        resources: { teamSize: 6, budget: 120000 },
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.businessValue).toBeDefined();
      expect(data.businessValue.estimatedROI).toBeDefined();
      expect(data.businessValue.timeToMarket).toBeDefined();
      expect(data.businessValue.riskMitigation).toBeDefined();
      expect(data.businessValue.qualityImprovement).toBeDefined();

      expect(data.successMetrics).toBeDefined();
      expect(Array.isArray(data.successMetrics)).toBe(true);
      expect(data.successMetrics.length).toBeGreaterThan(0);
    }
  });

  it('should include quality requirements and performance targets', async () => {
    const input = {
      projectId: 'test-quality',
      planType: 'development',
      qualityRequirements: {
        testCoverage: 95,
        securityLevel: 'high',
        performanceTargets: {
          responseTime: 25,
          throughput: 5000,
          availability: 99.99,
        },
      },
      scope: {
        features: ['high-performance feature'],
        timeline: { duration: 8 },
        resources: { teamSize: 5, budget: 100000 },
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.projectPlan).toBeDefined();
      expect(data.detailedRoadmap.qualityGates).toBeDefined();
      expect(Array.isArray(data.detailedRoadmap.qualityGates)).toBe(true);
    }
  });

  it('should include external MCP integrations', async () => {
    const input = {
      projectId: 'test-mcps',
      planType: 'development',
      externalMCPs: [
        {
          name: 'Payment Gateway MCP',
          description: 'Integration with payment processing service',
          integrationType: 'api',
          priority: 'high',
          estimatedEffort: 8,
        },
        {
          name: 'Database MCP',
          description: 'Database connection and management',
          integrationType: 'database',
          priority: 'medium',
          estimatedEffort: 5,
        },
      ],
      scope: {
        features: ['payment processing', 'data storage'],
        timeline: { duration: 6 },
        resources: { teamSize: 4, budget: 80000 },
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.projectPlan).toBeDefined();
      expect(data.successMetrics).toBeDefined();
      expect(data.successMetrics.some((metric: string) => metric.includes('MCPs'))).toBe(true);
    }
  });

  it('should provide next steps and technical metrics', async () => {
    const input = {
      projectId: 'test-metrics',
      planType: 'development',
      scope: {
        features: ['feature1', 'feature2'],
        timeline: { duration: 4 },
        resources: { teamSize: 3, budget: 50000 },
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.nextSteps).toBeDefined();
      expect(Array.isArray(data.nextSteps)).toBe(true);
      expect(data.nextSteps.length).toBeGreaterThan(0);

      expect(data.technicalMetrics).toBeDefined();
      expect(data.technicalMetrics.responseTime).toBeDefined();
      expect(data.technicalMetrics.planningTime).toBeDefined();
      expect(data.technicalMetrics.phasesPlanned).toBeDefined();
      expect(data.technicalMetrics.tasksPlanned).toBeDefined();
      expect(data.technicalMetrics.roadmapDetailLevel).toBeDefined();
    }
  });

  it('should handle Context7 disabled mode', async () => {
    const input = {
      projectId: 'test-no-context7',
      planType: 'development',
      scope: {
        features: ['basic feature'],
        timeline: { duration: 2 },
        resources: { teamSize: 2, budget: 20000 },
      },
      externalSources: {
        useContext7: false,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.externalIntegration.context7Status).toBe('disabled');
      expect(data.externalIntegration.context7Knowledge).toBe('not available');
      expect(data.externalIntegration.context7Enhancement).toBeNull();
    }
  });

  it('should handle errors gracefully', async () => {
    const input = {
      projectId: '', // Invalid empty project ID
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Project ID is required');
  });

  it('should validate input schema', async () => {
    const input = {
      invalidField: 'test',
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Required');
  });

  it('should generate consistent output for same input', async () => {
    const input = {
      projectId: 'test-consistency',
      planType: 'development',
      scope: {
        features: ['consistent feature'],
        timeline: { duration: 4 },
        resources: { teamSize: 3, budget: 40000 },
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result1 = await handleSmartPlan(input);
    const result2 = await handleSmartPlan(input);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    if (result1.data && result2.data) {
      const data1 = result1.data as any;
      const data2 = result2.data as any;

      // Should have same structure and business value
      expect(data1.businessValue).toEqual(data2.businessValue);
      expect(data1.projectPlan.phases.length).toBe(data2.projectPlan.phases.length);
      expect(data1.technicalMetrics.phasesPlanned).toBe(data2.technicalMetrics.phasesPlanned);
    }
  });

  it('should handle complex project requirements', async () => {
    const input = {
      projectId: 'test-complex',
      planType: 'development',
      scope: {
        features: [
          'user authentication',
          'payment processing',
          'real-time notifications',
          'data analytics',
          'admin dashboard',
          'mobile app',
        ],
        timeline: { duration: 16 },
        resources: { teamSize: 8, budget: 250000 },
      },
      businessContext: {
        goals: [
          'increase revenue by 50%',
          'improve user engagement',
          'reduce operational costs',
          'expand market reach',
        ],
        targetUsers: ['end users', 'business users', 'administrators', 'partners'],
        successMetrics: [
          'monthly active users',
          'revenue growth',
          'customer satisfaction',
          'system performance',
        ],
        riskFactors: [
          'technical complexity',
          'scalability challenges',
          'security vulnerabilities',
          'timeline pressure',
        ],
      },
      qualityRequirements: {
        testCoverage: 95,
        securityLevel: 'high',
        performanceTargets: {
          responseTime: 50,
          throughput: 10000,
          availability: 99.9,
        },
      },
      externalMCPs: [
        {
          name: 'Payment Gateway',
          description: 'Stripe integration',
          integrationType: 'api',
          priority: 'high',
          estimatedEffort: 8,
        },
        {
          name: 'Notification Service',
          description: 'Push notification service',
          integrationType: 'service',
          priority: 'high',
          estimatedEffort: 6,
        },
        {
          name: 'Analytics Database',
          description: 'Data warehouse integration',
          integrationType: 'database',
          priority: 'medium',
          estimatedEffort: 7,
        },
      ],
      role: 'product-strategist',
      roadmapType: 'detailed',
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartPlan(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.projectPlan.phases.length).toBeGreaterThanOrEqual(3);
      expect(data.detailedRoadmap.phases.length).toBeGreaterThanOrEqual(3);
      expect(data.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(data.successMetrics.length).toBeGreaterThan(0);
      expect(data.externalIntegration.context7Status).toBe('active');
    }
  });
});
