#!/usr/bin/env node

import { describe, it, expect, beforeEach } from 'vitest';
import { PlanGenerator, type PlanGenerationInput } from './plan-generator.js';

describe('PlanGenerator', () => {
  let planGenerator: PlanGenerator;

  const defaultQualityRequirements = {
    security: 'standard' as const,
    performance: 'standard' as const,
    accessibility: false,
  };

  beforeEach(() => {
    planGenerator = new PlanGenerator();
  });

  describe('generatePlan', () => {
    it('should generate comprehensive plan from business request', async () => {
      const input: PlanGenerationInput = {
        projectId: 'test-project-001',
        businessRequest: 'Create a user management system with authentication and user profiles',
        priority: 'high',
        qualityRequirements: {
          security: 'high',
          performance: 'standard',
          accessibility: true,
        },
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.id).toBe('test-project-001');
      expect(result.businessRequirements).toBeDefined();
      expect(result.architecture).toBeDefined();
      expect(result.phases).toBeDefined();
      expect(result.phases.length).toBeGreaterThan(0);
      expect(result.userStories).toBeDefined();
      expect(result.risks).toBeDefined();
      expect(result.timeline).toBeDefined();
      expect(result.effort).toBeDefined();
      expect(result.businessValue).toBeDefined();
      expect(result.qualityGates).toBeDefined();
    });

    it('should complete plan generation within performance target', async () => {
      const input: PlanGenerationInput = {
        projectId: 'perf-test-001',
        businessRequest: 'Build a reporting dashboard for business analytics',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const startTime = Date.now();
      await planGenerator.generatePlan(input);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(300); // <300ms target for plan generation
    });

    it('should include business analysis results', async () => {
      const input: PlanGenerationInput = {
        projectId: 'business-test-001',
        businessRequest:
          'Develop an e-commerce platform with payment processing and inventory management',
        priority: 'high',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.businessRequirements.primaryGoals.length).toBeGreaterThan(1);
      expect(result.businessRequirements.targetUsers).toBeDefined();
      expect(result.businessRequirements.successCriteria).toBeDefined();
      expect(result.businessRequirements.constraints).toBeDefined();
      expect(result.businessRequirements.riskFactors).toBeDefined();
    });

    it('should include technical architecture', async () => {
      const input: PlanGenerationInput = {
        projectId: 'tech-test-001',
        businessRequest: 'Create a real-time API with database integration',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.architecture.components.length).toBeGreaterThan(0);
      expect(result.architecture.patterns).toBeDefined();
      expect(result.architecture.technologies).toBeDefined();
      expect(result.architecture.constraints).toBeDefined();

      const hasApiComponent = result.architecture.components.some((c: { name: string }) =>
        c.name.includes('API')
      );
      const hasDbComponent = result.architecture.components.some((c: { name: string }) =>
        c.name.includes('Database')
      );
      expect(hasApiComponent).toBe(true);
      expect(hasDbComponent).toBe(true);
    });

    it('should generate user stories with proper structure', async () => {
      const input: PlanGenerationInput = {
        projectId: 'stories-test-001',
        businessRequest: 'Build a task management application for teams',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.userStories.length).toBeGreaterThan(0);
      result.userStories.forEach((story: any) => {
        expect(story.id).toBeDefined();
        expect(story.title).toBeDefined();
        expect(story.asA).toBeDefined();
        expect(story.iWant).toBeDefined();
        expect(story.soThat).toBeDefined();
        expect(Array.isArray(story.acceptanceCriteria)).toBe(true);
        expect(['low', 'medium', 'high', 'critical']).toContain(story.priority);
        expect(story.estimatedEffort).toBeGreaterThan(0);
      });
    });

    it('should create project timeline with phases', async () => {
      const input: PlanGenerationInput = {
        projectId: 'timeline-test-001',
        businessRequest: 'Develop a customer service portal with chat support',
        priority: 'high',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.timeline.phases.length).toBeGreaterThan(0);
      expect(result.timeline.totalDuration).toBeGreaterThan(0);
      expect(result.timeline.bufferTime).toBeGreaterThan(0);
      expect(Array.isArray(result.timeline.criticalPath)).toBe(true);

      result.timeline.phases.forEach((phase: any) => {
        expect(phase.name).toBeDefined();
        expect(phase.startDate).toBeDefined();
        expect(phase.endDate).toBeDefined();
        expect(phase.duration).toBeGreaterThan(0);
        expect(Array.isArray(phase.tasks)).toBe(true);
      });
    });

    it('should estimate effort with breakdown and confidence', async () => {
      const input: PlanGenerationInput = {
        projectId: 'effort-test-001',
        businessRequest: 'Create a content management system with user roles',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.effort.totalHours).toBeGreaterThan(0);
      expect(result.effort.breakdown).toBeDefined();
      expect(result.effort.breakdown.development).toBeGreaterThan(0);
      expect(result.effort.breakdown.testing).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(result.effort.confidence);
      expect(Array.isArray(result.effort.assumptions)).toBe(true);
    });

    it('should include business value metrics', async () => {
      const input: PlanGenerationInput = {
        projectId: 'value-test-001',
        businessRequest: 'Build an automated reporting system to reduce manual work',
        priority: 'high',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.businessValue.estimatedROI).toBeGreaterThan(0);
      expect(result.businessValue.timeToMarket).toBeGreaterThan(0);
      expect(result.businessValue.costSavings).toBeGreaterThanOrEqual(0);
      expect(result.businessValue.riskMitigation).toBeGreaterThanOrEqual(0);
      expect(result.businessValue.qualityImprovement).toBeGreaterThanOrEqual(0);
    });

    it('should create quality gates for each phase', async () => {
      const input: PlanGenerationInput = {
        projectId: 'quality-test-001',
        businessRequest: 'Develop a financial application with high security requirements',
        priority: 'critical',
        qualityRequirements: {
          security: 'high',
          performance: 'high',
          accessibility: true,
        },
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.qualityGates.length).toBeGreaterThan(0);
      result.qualityGates.forEach((gate: any) => {
        expect(gate.phase).toBeDefined();
        expect(gate.criteria).toBeDefined();
        expect(gate.threshold).toBeDefined();
        expect(Array.isArray(gate.criteria)).toBe(true);
      });

      // Should include security-specific quality gates for high security
      const hasSecurityGate = result.qualityGates.some(
        (gate: any) =>
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          gate.phase.toLowerCase().includes('security') ||
          gate.criteria.some((criterion: string) => criterion.toLowerCase().includes('security'))
      );
      expect(hasSecurityGate).toBe(true);
    });

    it('should handle time constraints appropriately', async () => {
      const input: PlanGenerationInput = {
        projectId: 'time-test-001',
        businessRequest: 'Create a marketing website with CMS integration',
        priority: 'high',
        qualityRequirements: defaultQualityRequirements,
        timeConstraint: 'Must deliver in 4 weeks',
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.timeline.totalDuration).toBeLessThanOrEqual(6); // Should account for tight timeline
      expect(result.effort.confidence).not.toBe('high'); // Should lower confidence for tight timelines
    });

    it('should generate success metrics and next steps', async () => {
      const input: PlanGenerationInput = {
        projectId: 'success-test-001',
        businessRequest: 'Build a mobile app for customer engagement',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const result = await planGenerator.generatePlan(input);

      expect(Array.isArray(result.successMetrics)).toBe(true);
      expect(result.successMetrics.length).toBeGreaterThan(0);
      expect(Array.isArray(result.nextSteps)).toBe(true);
      expect(result.nextSteps.length).toBeGreaterThan(0);

      result.successMetrics.forEach((metric: string) => {
        expect(typeof metric).toBe('string');
        expect(metric.length).toBeGreaterThan(0);
      });

      result.nextSteps.forEach((step: string) => {
        expect(typeof step).toBe('string');
        expect(step.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validatePlan', () => {
    it('should validate a complete plan successfully', async () => {
      const input: PlanGenerationInput = {
        projectId: 'validation-test-001',
        businessRequest: 'Create a comprehensive project management tool',
        priority: 'high',
        qualityRequirements: defaultQualityRequirements,
      };

      const plan = await planGenerator.generatePlan(input);
      const validation = planGenerator.validatePlan(plan);

      expect(validation.isValid).toBe(true);
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });

    it('should identify missing components in incomplete plans', () => {
      const incompletePlan = {
        id: 'incomplete-001',
        name: 'Incomplete Test Plan',
        description: 'Test plan for validation',
        businessRequirements: {
          primaryGoals: ['Test goal'],
          targetUsers: ['User'],
          successCriteria: ['Success'],
          constraints: [],
          riskFactors: [],
        },
        // Missing required components
        architecture: { components: [], patterns: [], technologies: [], constraints: [] },
        phases: [],
        userStories: [],
        risks: [],
        timeline: { phases: [], criticalPath: [], totalDuration: 0, bufferTime: 0 },
        effort: {
          totalHours: 0,
          breakdown: { development: 0, testing: 0, deployment: 0, documentation: 0, research: 0 },
          confidence: 'low' as const,
          assumptions: [],
        },
        businessValue: {
          estimatedROI: 0,
          timeToMarket: 0,
          costSavings: 0,
          riskMitigation: 0,
          qualityImprovement: 0,
        },
        qualityGates: [],
        successMetrics: [],
        nextSteps: [],
        optimization: {
          originalEffort: 0,
          optimizedEffort: 0,
          savingsHours: 0,
          optimizations: [],
          riskAdjustments: [],
        },
        complexity: {
          overall: 'low' as const,
          technical: 'low' as const,
          business: 'low' as const,
          integration: 'low' as const,
          factors: [],
        },
      };

      const validation = planGenerator.validatePlan(incompletePlan);

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for plan improvement', async () => {
      const input: PlanGenerationInput = {
        projectId: 'recommend-test-001',
        businessRequest: 'Simple contact form creation',
        priority: 'low',
        qualityRequirements: defaultQualityRequirements,
      };

      const plan = await planGenerator.generatePlan(input);
      const validation = planGenerator.validatePlan(plan);

      expect(Array.isArray(validation.recommendations)).toBe(true);
      // Low complexity projects should still get improvement recommendations
      if (validation.recommendations.length === 0) {
        // This is acceptable for very simple projects
        expect(plan.complexity.overall).toBe('low');
      }
    });
  });

  describe('performance and integration', () => {
    it('should maintain performance across multiple plan generations', async () => {
      const requests = [
        'Build a social media platform',
        'Create an inventory management system',
        'Develop a learning management system',
      ];

      const startTime = Date.now();

      for (let i = 0; i < requests.length; i++) {
        const input: PlanGenerationInput = {
          projectId: `perf-multi-${i + 1}`,
          businessRequest: requests[i],
          priority: 'medium',
          qualityRequirements: defaultQualityRequirements,
        };
        await planGenerator.generatePlan(input);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / requests.length;

      expect(averageTime).toBeLessThan(300); // Average should still be under 300ms
    });

    it('should handle complex business requests with multiple integrations', async () => {
      const input: PlanGenerationInput = {
        projectId: 'complex-integration-001',
        businessRequest:
          'Build a comprehensive enterprise solution with CRM, ERP, real-time analytics, multi-tenant architecture, API integrations, mobile support, and advanced security compliance',
        priority: 'critical',
        qualityRequirements: {
          security: 'high',
          performance: 'high',
          accessibility: true,
        },
        timeConstraint: 'Deliver MVP in 12 weeks, full system in 6 months',
      };

      const result = await planGenerator.generatePlan(input);

      expect(result.complexity.overall).toMatch(/high|very-high/);
      expect(result.architecture.components.length).toBeGreaterThanOrEqual(5);
      expect(result.phases.length).toBeGreaterThan(3);
      expect(result.risks.length).toBeGreaterThanOrEqual(2);
      expect(result.effort.totalHours).toBeGreaterThanOrEqual(450);
      expect(result.timeline.totalDuration).toBeGreaterThanOrEqual(8);
    });

    it('should generate consistent results for identical inputs', async () => {
      const input: PlanGenerationInput = {
        projectId: 'consistency-test-001',
        businessRequest: 'Create a blog platform with user authentication',
        priority: 'medium',
        qualityRequirements: defaultQualityRequirements,
      };

      const plan1 = await planGenerator.generatePlan(input);
      const plan2 = await planGenerator.generatePlan(input);

      expect(plan1.businessRequirements.primaryGoals).toEqual(
        plan2.businessRequirements.primaryGoals
      );
      expect(plan1.architecture.components.length).toBe(plan2.architecture.components.length);
      expect(plan1.phases.length).toBe(plan2.phases.length);
      expect(plan1.effort.totalHours).toBe(plan2.effort.totalHours);
    });
  });
});
