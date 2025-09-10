#!/usr/bin/env node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartFinish } from './smart-finish.js';

// No mocking - tests will use real Context7 API calls

describe('Enhanced Smart Finish Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate code quality with Context7 enhancement', async () => {
    const input = {
      projectId: 'test-project-123',
      codeIds: ['code-1', 'code-2', 'code-3'],
      qualityGates: {
        testCoverage: 90,
        securityScore: 95,
        complexityScore: 80,
        maintainabilityScore: 85,
      },
      businessRequirements: {
        costPrevention: 15000,
        timeSaved: 4,
        userSatisfaction: 95,
      },
      productionReadiness: {
        securityScan: true,
        performanceTest: true,
        documentationComplete: true,
        deploymentReady: true,
      },
      role: 'developer',
      validationLevel: 'comprehensive',
      externalSources: {
        useContext7: true,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartFinish(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    if (result.data) {
      const data = result.data as any;
      expect(data.projectId).toBe('test-project-123');
      expect(data.codeIds).toEqual(['code-1', 'code-2', 'code-3']);
      expect(data.qualityScorecard).toBeDefined();
      expect(data.qualityScorecard.overall).toBeDefined();
      expect(data.comprehensiveValidation).toBeDefined();
      expect(data.processCompliance).toBeDefined();
      expect(data.learningIntegration).toBeDefined();

      // Check Context7 integration
      expect(data.externalIntegration.context7Status).toBe('active');
      expect(data.externalIntegration.context7Knowledge).toBe('integrated');
      expect(data.externalIntegration.context7Enhancement).toBeDefined();
      expect(data.externalIntegration.context7Enhancement.dataCount).toBeGreaterThanOrEqual(0);
      expect(data.externalIntegration.context7Enhancement.cacheHit).toBeDefined();
      expect(data.externalIntegration.cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
    }
  });

  it('should validate different validation levels', async () => {
    const validationLevels = ['basic', 'standard', 'comprehensive', 'enterprise'];

    for (const validationLevel of validationLevels) {
      const input = {
        projectId: `test-${validationLevel}`,
        codeIds: ['code-1', 'code-2'],
        validationLevel: validationLevel as any,
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartFinish(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.technicalMetrics.validationLevel).toBe(validationLevel);
        expect(data.comprehensiveValidation.validationLevel).toBe(validationLevel);
        expect(data.externalIntegration.context7Status).toBe('active');
      }
    }
  });

  it('should validate different roles', { timeout: 30000 }, async () => {
    const roles = [
      'developer',
      'product-strategist',
      'operations-engineer',
      'designer',
      'qa-engineer',
    ];

    for (const role of roles) {
      const input = {
        projectId: `test-${role}`,
        codeIds: ['code-1', 'code-2'],
        role: role as any,
        qualityGates: {
          testCoverage: 85,
          securityScore: 90,
          complexityScore: 70,
          maintainabilityScore: 75,
        },
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartFinish(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.comprehensiveValidation.roleSpecificValidation).toBe(true);
        expect(data.processCompliance.roleValidation).toBe(true);
        expect(data.learningIntegration.roleCompliance).toBeDefined();
        expect(data.recommendations).toBeDefined();
        expect(data.successMetrics).toBeDefined();
      }
    }
  });

  it('should validate quality gates', async () => {
    const input = {
      projectId: 'test-quality-gates',
      codeIds: ['code-1', 'code-2', 'code-3'],
      qualityGates: {
        testCoverage: 95,
        securityScore: 98,
        complexityScore: 85,
        maintainabilityScore: 90,
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.qualityScorecard).toBeDefined();
      expect(data.comprehensiveValidation.qualityGates).toBeDefined();
      expect(Array.isArray(data.comprehensiveValidation.qualityGates)).toBe(true);
      expect(data.comprehensiveValidation.qualityGates.length).toBeGreaterThan(0);
    }
  });

  it('should validate business requirements', async () => {
    const input = {
      projectId: 'test-business-requirements',
      codeIds: ['code-1', 'code-2'],
      businessRequirements: {
        costPrevention: 25000,
        timeSaved: 8,
        userSatisfaction: 98,
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.businessValue).toBeDefined();
      expect(data.businessValue.totalCostPrevention).toBe(25000);
      expect(data.businessValue.totalTimeSaved).toBe(8);
      expect(data.businessValue.userSatisfactionScore).toBe(98);
    }
  });

  it('should validate production readiness', async () => {
    const input = {
      projectId: 'test-production-readiness',
      codeIds: ['code-1', 'code-2', 'code-3'],
      productionReadiness: {
        securityScan: true,
        performanceTest: true,
        documentationComplete: true,
        deploymentReady: true,
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.qualityScorecard).toBeDefined();
      expect(data.technicalMetrics.productionChecksPerformed).toBe(4);
    }
  });

  it('should generate comprehensive validation', async () => {
    const input = {
      projectId: 'test-comprehensive-validation',
      codeIds: ['code-1', 'code-2', 'code-3', 'code-4'],
      validationLevel: 'comprehensive',
      role: 'qa-engineer',
      processCompliance: true,
      learningIntegration: true,
      archiveLessons: true,
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.comprehensiveValidation).toBeDefined();
      expect(data.comprehensiveValidation.validationLevel).toBe('comprehensive');
      expect(data.comprehensiveValidation.roleSpecificValidation).toBe(true);
      expect(data.comprehensiveValidation.qualityGates).toBeDefined();
      expect(data.comprehensiveValidation.processComplianceChecks).toBeDefined();
      expect(data.comprehensiveValidation.archiveLessonsApplied).toBeDefined();
      expect(data.comprehensiveValidation.recommendations).toBeDefined();
    }
  });

  it('should generate process compliance validation', async () => {
    const input = {
      projectId: 'test-process-compliance',
      codeIds: ['code-1', 'code-2'],
      role: 'developer',
      processCompliance: true,
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.processCompliance).toBeDefined();
      expect(data.processCompliance.roleValidation).toBe(true);
      expect(data.processCompliance.qualityGates).toBe(true);
      expect(data.processCompliance.documentation).toBe(true);
      expect(data.processCompliance.testing).toBeDefined();
      expect(data.processCompliance.processCompliance).toBe(true);
      expect(data.processCompliance.overallCompliance).toBeDefined();
    }
  });

  it('should generate learning integration', async () => {
    const input = {
      projectId: 'test-learning-integration',
      codeIds: ['code-1', 'code-2'],
      role: 'operations-engineer',
      learningIntegration: true,
      archiveLessons: true,
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.learningIntegration).toBeDefined();
      expect(data.learningIntegration.processLessons).toBeDefined();
      expect(Array.isArray(data.learningIntegration.processLessons)).toBe(true);
      expect(data.learningIntegration.qualityPatterns).toBeDefined();
      expect(Array.isArray(data.learningIntegration.qualityPatterns)).toBe(true);
      expect(data.learningIntegration.roleCompliance).toBeDefined();
      expect(Array.isArray(data.learningIntegration.roleCompliance)).toBe(true);
      expect(data.learningIntegration.archiveLessonsApplied).toBeDefined();
      expect(Array.isArray(data.learningIntegration.archiveLessonsApplied)).toBe(true);
      expect(data.learningIntegration.learningImpact).toBeDefined();
    }
  });

  it('should generate recommendations and next steps', async () => {
    const input = {
      projectId: 'test-recommendations',
      codeIds: ['code-1', 'code-2', 'code-3'],
      role: 'developer',
      qualityGates: {
        testCoverage: 70, // Below threshold
        securityScore: 85, // Below threshold
        complexityScore: 60, // Below threshold
        maintainabilityScore: 65, // Below threshold
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.recommendations).toBeDefined();
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(data.nextSteps).toBeDefined();
      expect(Array.isArray(data.nextSteps)).toBe(true);
      expect(data.nextSteps.length).toBeGreaterThan(0);
    }
  });

  it('should generate success metrics', async () => {
    const input = {
      projectId: 'test-success-metrics',
      codeIds: ['code-1', 'code-2', 'code-3', 'code-4'],
      role: 'qa-engineer',
      businessRequirements: {
        costPrevention: 20000,
        timeSaved: 6,
        userSatisfaction: 92,
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.successMetrics).toBeDefined();
      expect(Array.isArray(data.successMetrics)).toBe(true);
      expect(data.successMetrics.length).toBeGreaterThan(0);
    }
  });

  it('should provide technical metrics', async () => {
    const input = {
      projectId: 'test-technical-metrics',
      codeIds: ['code-1', 'code-2', 'code-3'],
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.technicalMetrics).toBeDefined();
      expect(data.technicalMetrics.responseTime).toBeDefined();
      expect(data.technicalMetrics.validationTime).toBeDefined();
      expect(data.technicalMetrics.codeUnitsValidated).toBe(3);
      expect(data.technicalMetrics.securityVulnerabilities).toBeDefined();
      expect(data.technicalMetrics.staticAnalysisIssues).toBeDefined();
      expect(data.technicalMetrics.qualityGatesChecked).toBe(4);
      expect(data.technicalMetrics.businessRequirementsChecked).toBe(3);
      expect(data.technicalMetrics.productionChecksPerformed).toBe(4);
      expect(data.technicalMetrics.validationLevel).toBeDefined();
      expect(data.technicalMetrics.roleSpecificValidation).toBeDefined();
    }
  });

  it('should handle Context7 disabled mode', async () => {
    const input = {
      projectId: 'test-no-context7',
      codeIds: ['code-1', 'code-2'],
      externalSources: {
        useContext7: false,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartFinish(input);
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
      codeIds: [], // Invalid empty code IDs
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Project ID is required');
  });

  it('should validate input schema', async () => {
    const input = {
      invalidField: 'test',
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Required');
  });

  it('should handle complex quality validation', async () => {
    const input = {
      projectId: 'test-complex-validation',
      codeIds: ['code-1', 'code-2', 'code-3', 'code-4', 'code-5'],
      qualityGates: {
        testCoverage: 95,
        securityScore: 98,
        complexityScore: 90,
        maintainabilityScore: 92,
      },
      businessRequirements: {
        costPrevention: 50000,
        timeSaved: 12,
        userSatisfaction: 98,
      },
      productionReadiness: {
        securityScan: true,
        performanceTest: true,
        documentationComplete: true,
        deploymentReady: true,
      },
      role: 'operations-engineer',
      validationLevel: 'enterprise',
      processCompliance: true,
      learningIntegration: true,
      archiveLessons: true,
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartFinish(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.qualityScorecard).toBeDefined();
      expect(data.comprehensiveValidation).toBeDefined();
      expect(data.processCompliance).toBeDefined();
      expect(data.learningIntegration).toBeDefined();
      expect(data.recommendations).toBeDefined();
      expect(data.successMetrics).toBeDefined();
      expect(data.nextSteps).toBeDefined();
      expect(data.businessValue).toBeDefined();
      expect(data.technicalMetrics).toBeDefined();
      expect(data.externalIntegration.context7Status).toBe('active');
    }
  });
});
