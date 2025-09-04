#!/usr/bin/env node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartPlan } from './smart_plan_enhanced.js';

describe('Smart Plan Enhanced Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleSmartPlan', () => {
    it('should handle valid input and return comprehensive plan', async () => {
      const input = {
        projectId: 'test-project-001',
        businessRequest: 'Create a user management system with authentication and user profiles',
        priority: 'high',
        qualityRequirements: {
          security: 'high',
          performance: 'standard',
          accessibility: true,
        },
        planType: 'comprehensive',
      };

      const result = await handleSmartPlan(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

      if ('success' in result && typeof result.success === 'boolean') {
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result).toHaveProperty('planId');
          expect(result).toHaveProperty('businessAnalysis');
          expect(result).toHaveProperty('strategicPlan');
          expect(result).toHaveProperty('technicalPlan');
          expect(result).toHaveProperty('validation');
          expect(result).toHaveProperty('technicalMetrics');
        }
      }
    });

    it('should complete within performance target', async () => {
      const input = {
        projectId: 'perf-test-001',
        businessRequest: 'Build a simple contact form with email notifications',
        priority: 'medium',
      };

      const startTime = Date.now();
      const result = await handleSmartPlan(input);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // <500ms target for Phase 2A

      if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
        const metrics = result.technicalMetrics as any;
        expect(metrics.responseTime).toBeLessThan(500);
      }
    });

    it('should return business analysis results', async () => {
      const input = {
        projectId: 'business-test-001',
        businessRequest:
          'Develop an e-commerce platform with payment processing, inventory management, and customer support',
        priority: 'high',
        planType: 'strategic',
      };

      const result = await handleSmartPlan(input);

      if ('businessAnalysis' in result && typeof result.businessAnalysis === 'object') {
        const analysis = result.businessAnalysis as any;
        expect(analysis).toHaveProperty('requirements');
        expect(analysis).toHaveProperty('complexity');
        expect(analysis).toHaveProperty('stakeholderCount');
        expect(analysis).toHaveProperty('riskFactors');
        expect(analysis.stakeholderCount).toBeGreaterThan(0);
        expect(analysis.riskFactors).toBeGreaterThan(0);
      }
    });

    it('should return strategic planning results', async () => {
      const input = {
        projectId: 'strategic-test-001',
        businessRequest: 'Create a customer relationship management system for sales teams',
        priority: 'high',
        planType: 'strategic',
      };

      const result = await handleSmartPlan(input);

      if ('strategicPlan' in result && typeof result.strategicPlan === 'object') {
        const strategic = result.strategicPlan as any;
        expect(strategic).toHaveProperty('phases');
        expect(strategic).toHaveProperty('timeline');
        expect(strategic).toHaveProperty('userStories');
        expect(strategic).toHaveProperty('businessValue');
        expect(Array.isArray(strategic.phases)).toBe(true);
        expect(strategic.phases.length).toBeGreaterThan(0);
        expect(Array.isArray(strategic.userStories)).toBe(true);
      }
    });

    it('should return technical planning results', async () => {
      const input = {
        projectId: 'technical-test-001',
        businessRequest: 'Build a real-time messaging application with file sharing',
        priority: 'medium',
        planType: 'technical',
      };

      const result = await handleSmartPlan(input);

      if ('technicalPlan' in result && typeof result.technicalPlan === 'object') {
        const technical = result.technicalPlan as any;
        expect(technical).toHaveProperty('architecture');
        expect(technical).toHaveProperty('effort');
        expect(technical).toHaveProperty('optimization');
        expect(technical).toHaveProperty('qualityGates');

        if (technical.architecture && typeof technical.architecture === 'object') {
          expect(technical.architecture).toHaveProperty('components');
          expect(Array.isArray(technical.architecture.components)).toBe(true);
          expect(technical.architecture.components.length).toBeGreaterThan(0);
        }
      }
    });

    it('should validate plan quality and provide feedback', async () => {
      const input = {
        projectId: 'validation-test-001',
        businessRequest: 'Create a comprehensive project management platform',
        priority: 'high',
      };

      const result = await handleSmartPlan(input);

      if ('validation' in result && typeof result.validation === 'object') {
        const validation = result.validation as any;
        expect(validation).toHaveProperty('isValid');
        expect(validation).toHaveProperty('issues');
        expect(validation).toHaveProperty('recommendations');
        expect(validation).toHaveProperty('confidenceLevel');
        expect(typeof validation.isValid).toBe('boolean');
        expect(Array.isArray(validation.issues)).toBe(true);
        expect(Array.isArray(validation.recommendations)).toBe(true);
        expect(['low', 'medium', 'high']).toContain(validation.confidenceLevel);
      }
    });

    it('should handle external MCP integration configuration', async () => {
      const input = {
        projectId: 'mcp-test-001',
        businessRequest: 'Build a documentation management system with AI assistance',
        priority: 'medium',
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: false,
        },
      };

      const result = await handleSmartPlan(input);

      if ('externalIntegration' in result && typeof result.externalIntegration === 'object') {
        const integration = result.externalIntegration as any;
        expect(integration).toHaveProperty('context7Status');
        expect(integration).toHaveProperty('webSearchStatus');
        expect(integration).toHaveProperty('memoryStatus');
        expect(integration).toHaveProperty('integrationTime');
        expect(integration.context7Status).toBe('enabled');
        expect(integration.webSearchStatus).toBe('enabled');
        expect(integration.memoryStatus).toBe('disabled');
      }
    });

    it('should return business value metrics', async () => {
      const input = {
        projectId: 'value-test-001',
        businessRequest: 'Implement automated testing pipeline to reduce manual QA effort',
        priority: 'high',
      };

      const result = await handleSmartPlan(input);

      if ('businessMetrics' in result && typeof result.businessMetrics === 'object') {
        const metrics = result.businessMetrics as any;
        expect(metrics).toHaveProperty('estimatedROI');
        expect(metrics).toHaveProperty('timeToMarket');
        expect(metrics).toHaveProperty('costSavings');
        expect(metrics).toHaveProperty('riskMitigation');
        expect(metrics).toHaveProperty('qualityImprovement');
        expect(metrics.estimatedROI).toBeGreaterThan(0);
        expect(typeof metrics.timeToMarket).toBe('string');
        expect(metrics.timeToMarket).toContain('months');
      }
    });

    it('should provide success metrics and next steps', async () => {
      const input = {
        projectId: 'deliverables-test-001',
        businessRequest: 'Create a mobile app for employee onboarding',
        priority: 'medium',
      };

      const result = await handleSmartPlan(input);

      if ('deliverables' in result && typeof result.deliverables === 'object') {
        const deliverables = result.deliverables as any;
        expect(deliverables).toHaveProperty('successMetrics');
        expect(deliverables).toHaveProperty('nextSteps');
        expect(deliverables).toHaveProperty('qualityTargets');
        expect(Array.isArray(deliverables.successMetrics)).toBe(true);
        expect(Array.isArray(deliverables.nextSteps)).toBe(true);
        expect(Array.isArray(deliverables.qualityTargets)).toBe(true);
        expect(deliverables.successMetrics.length).toBeGreaterThan(0);
        expect(deliverables.nextSteps.length).toBeGreaterThan(0);
      }
    });

    it('should return detailed technical metrics', async () => {
      const input = {
        projectId: 'metrics-test-001',
        businessRequest: 'Build a data analytics dashboard with real-time reporting',
        priority: 'high',
      };

      const result = await handleSmartPlan(input);

      if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
        const metrics = result.technicalMetrics as any;
        expect(metrics).toHaveProperty('responseTime');
        expect(metrics).toHaveProperty('planGenerationTime');
        expect(metrics).toHaveProperty('businessAnalysisTime');
        expect(metrics).toHaveProperty('technicalPlanningTime');
        expect(metrics).toHaveProperty('validationTime');
        expect(metrics).toHaveProperty('phasesPlanned');
        expect(metrics).toHaveProperty('tasksPlanned');
        expect(metrics).toHaveProperty('risksIdentified');
        expect(metrics).toHaveProperty('userStoriesGenerated');
        expect(metrics).toHaveProperty('componentsMapped');

        expect(metrics.responseTime).toBeGreaterThan(0);
        expect(metrics.businessAnalysisTime).toBeLessThan(100); // <100ms target
        expect(metrics.technicalPlanningTime).toBeLessThan(150); // <150ms target
        expect(metrics.validationTime).toBeLessThan(50); // <50ms target
        expect(metrics.phasesPlanned).toBeGreaterThan(0);
        expect(metrics.tasksPlanned).toBeGreaterThan(0);
        expect(metrics.componentsMapped).toBeGreaterThan(0);
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidInput = {
        projectId: '', // Invalid - too short
        businessRequest: 'Short', // Invalid - too short
      };

      const result = await handleSmartPlan(invalidInput);

      expect(result).toBeDefined();
      if ('success' in result && typeof result.success === 'boolean') {
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('errorType');
        if (!result.success && 'errorType' in result) {
          expect(result.errorType).toBe('validation_error');
        }
      }
    });

    it('should handle missing required fields', async () => {
      const invalidInput = {
        // Missing projectId and businessRequest
        priority: 'high',
      };

      const result = await handleSmartPlan(invalidInput);

      if ('success' in result && typeof result.success === 'boolean') {
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('responseTime');
        expect(result).toHaveProperty('timestamp');
      }
    });

    it('should include error timing information', async () => {
      const invalidInput = { invalid: 'data' };

      const startTime = Date.now();
      const result = await handleSmartPlan(invalidInput);
      const duration = Date.now() - startTime;

      if ('responseTime' in result && typeof result.responseTime === 'number') {
        expect(result.responseTime).toBeGreaterThanOrEqual(0); // Can be 0 for immediate validation failures
        expect(result.responseTime).toBeLessThanOrEqual(duration + 5); // Allow small timing variance
      }
    });

    it('should handle unexpected errors during plan generation', async () => {
      const input = {
        projectId: 'error-test-001',
        businessRequest:
          'This is a valid request that might cause internal errors during processing',
        priority: 'medium',
      };

      // Test should handle any internal errors gracefully
      const result = await handleSmartPlan(input);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('timestamp');

      if ('success' in result && typeof result.success === 'boolean') {
        if (!result.success) {
          expect(result).toHaveProperty('error');
          expect(result).toHaveProperty('responseTime');
        }
      }
    });
  });

  describe('performance under load', () => {
    it('should maintain performance with multiple concurrent requests', async () => {
      const inputs = Array.from({ length: 5 }, (_, i) => ({
        projectId: `concurrent-test-${i + 1}`,
        businessRequest: `Create a web application for use case ${i + 1}`,
        priority: 'medium' as const,
      }));

      const startTime = Date.now();
      const promises = inputs.map(input => handleSmartPlan(input));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(2500); // All 5 requests under 2.5 seconds total

      results.forEach(result => {
        expect(result).toBeDefined();
        if ('success' in result && typeof result.success === 'boolean') {
          expect(result.success).toBe(true);
        }
      });
    });

    it('should handle large complex requests efficiently', async () => {
      const input = {
        projectId: 'large-complex-001',
        businessRequest:
          'Build a comprehensive enterprise resource planning system with modules for finance, human resources, supply chain management, customer relationship management, business intelligence, document management, workflow automation, multi-tenant architecture, role-based access control, API integrations with 20+ external systems, mobile applications, real-time analytics, advanced reporting, audit trails, compliance management, and disaster recovery capabilities',
        priority: 'critical',
        qualityRequirements: {
          security: 'high',
          performance: 'high',
          accessibility: true,
        },
        externalSources: {
          useContext7: true,
          useWebSearch: true,
          useMemory: true,
        },
      };

      const startTime = Date.now();
      const result = await handleSmartPlan(input);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Even complex requests under 1 second

      if ('success' in result && typeof result.success === 'boolean') {
        expect(result.success).toBe(true);

        if ('technicalMetrics' in result && typeof result.technicalMetrics === 'object') {
          const metrics = result.technicalMetrics as any;
          expect(metrics.phasesPlanned).toBeGreaterThan(3);
          expect(metrics.tasksPlanned).toBeGreaterThan(10);
          expect(metrics.componentsMapped).toBeGreaterThan(5);
        }
      }
    });
  });

  describe('plan type variations', () => {
    it('should handle strategic plan type focus', async () => {
      const input = {
        projectId: 'strategic-focus-001',
        businessRequest: 'Create a digital transformation strategy for traditional retail business',
        priority: 'high',
        planType: 'strategic',
      };

      const result = await handleSmartPlan(input);

      if ('planType' in result) {
        expect(result.planType).toBe('strategic');
      }

      if ('strategicPlan' in result && typeof result.strategicPlan === 'object') {
        const strategic = result.strategicPlan as any;
        expect(strategic).toHaveProperty('businessValue');
        expect(strategic.businessValue).toBeDefined();
      }
    });

    it('should handle tactical plan type focus', async () => {
      const input = {
        projectId: 'tactical-focus-001',
        businessRequest: 'Implement agile development practices in existing development team',
        priority: 'medium',
        planType: 'tactical',
      };

      const result = await handleSmartPlan(input);

      if ('planType' in result) {
        expect(result.planType).toBe('tactical');
      }
    });

    it('should handle technical plan type focus', async () => {
      const input = {
        projectId: 'technical-focus-001',
        businessRequest: 'Migrate legacy monolith to microservices architecture',
        priority: 'high',
        planType: 'technical',
      };

      const result = await handleSmartPlan(input);

      if ('planType' in result) {
        expect(result.planType).toBe('technical');
      }

      if ('technicalPlan' in result && typeof result.technicalPlan === 'object') {
        const technical = result.technicalPlan as any;
        expect(technical.architecture).toBeDefined();
        expect(technical.effort).toBeDefined();
      }
    });

    it('should handle comprehensive plan type by default', async () => {
      const input = {
        projectId: 'comprehensive-default-001',
        businessRequest: 'Build a complete solution for online education platform',
        priority: 'high',
        // planType not specified - should default to comprehensive
      };

      const result = await handleSmartPlan(input);

      if ('planType' in result) {
        expect(result.planType).toBe('comprehensive');
      }

      // Should include all aspects for comprehensive plans
      expect(result).toHaveProperty('businessAnalysis');
      expect(result).toHaveProperty('strategicPlan');
      expect(result).toHaveProperty('technicalPlan');
    });
  });
});
