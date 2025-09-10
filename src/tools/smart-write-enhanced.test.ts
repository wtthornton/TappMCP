#!/usr/bin/env node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartWrite } from './smart-write.js';

// No mocking - tests will use real Context7 API calls

describe('Enhanced Smart Write Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate code with Context7 enhancement', async () => {
    const input = {
      projectId: 'test-project-123',
      featureDescription: 'create user authentication function',
      targetRole: 'developer',
      codeType: 'function',
      techStack: ['typescript', 'nodejs'],
      businessContext: {
        goals: ['security', 'user management'],
        priority: 'high',
      },
      qualityRequirements: {
        testCoverage: 90,
        complexity: 3,
        securityLevel: 'high',
      },
      externalSources: {
        useContext7: true,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartWrite(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    if (result.data) {
      const data = result.data as any;
      expect(data.projectId).toBe('test-project-123');
      expect(data.codeId).toContain('user_authentication_function');
      expect(data.generatedCode).toBeDefined();
      expect(data.generatedCode.files.length).toBeGreaterThanOrEqual(1);

      // Check Context7 integration
      expect(data.externalIntegration.context7Status).toBe('active');
      expect(data.externalIntegration.context7Knowledge).toBe('integrated');
      expect(data.externalIntegration.context7Enhancement).toBeDefined();
      expect(data.externalIntegration.context7Enhancement.dataCount).toBeGreaterThanOrEqual(0);
      expect(data.externalIntegration.context7Enhancement.cacheHit).toBeDefined();
      expect(data.externalIntegration.cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
    }
  });

  it('should generate role-specific code for different roles', { timeout: 30000 }, async () => {
    const roles = ['developer', 'product-strategist', 'designer', 'qa-engineer', 'operations-engineer'];

    for (const role of roles) {
      const input = {
        projectId: `test-${role}`,
        featureDescription: 'create data processing service',
        targetRole: role as any,
        codeType: 'function',
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartWrite(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        const expectedRoleName = role.split('-').map(word => {
          // Handle special cases like "qa" -> "QA"
          if (word.toLowerCase() === 'qa') return 'QA';
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        expect(data.generatedCode.files[0].content).toContain(`${expectedRoleName} Role Implementation`);
      }
    }
  });

  it('should handle different code types', async () => {
    const codeTypes = ['function', 'api', 'test', 'config', 'documentation'];

    for (const codeType of codeTypes) {
      const input = {
        projectId: `test-${codeType}`,
        featureDescription: `create ${codeType} for user management`,
        codeType: codeType as any,
        externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
      };

      const result = await handleSmartWrite(input);
      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.generatedCode.files.length).toBeGreaterThanOrEqual(1);
        expect(data.qualityMetrics).toBeDefined();
        expect(data.businessValue).toBeDefined();
      }
    }
  });

  it('should generate HTML content when requested', async () => {
    const input = {
      projectId: 'test-html',
      featureDescription: 'create user dashboard page',
      targetRole: 'designer',
      codeType: 'component',
      techStack: ['html', 'css'],
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.generatedCode.files[0].type).toBe('html');
      expect(data.generatedCode.files[0].content).toContain('<!DOCTYPE html>');
    }
  });

  it('should include quality metrics and business value', async () => {
    const input = {
      projectId: 'test-metrics',
      featureDescription: 'create payment processing API',
      targetRole: 'developer',
      codeType: 'api',
      qualityRequirements: {
        testCoverage: 95,
        complexity: 2,
        securityLevel: 'high',
      },
      businessContext: {
        goals: ['revenue', 'security'],
        priority: 'high',
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.qualityMetrics.testCoverage).toBeDefined();
      expect(data.qualityMetrics.complexity).toBeDefined();
      expect(data.qualityMetrics.securityScore).toBeDefined();
      expect(data.qualityMetrics.maintainability).toBeDefined();

      expect(data.businessValue.timeSaved).toBeDefined();
      expect(data.businessValue.qualityImprovement).toBeDefined();
      expect(data.businessValue.costPrevention).toBeDefined();
    }
  });

  it('should provide next steps and technical metrics', async () => {
    const input = {
      projectId: 'test-steps',
      featureDescription: 'create user registration system',
      targetRole: 'developer',
      codeType: 'api',
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.nextSteps).toBeDefined();
      expect(Array.isArray(data.nextSteps)).toBe(true);
      expect(data.nextSteps.length).toBeGreaterThan(0);

      expect(data.technicalMetrics.responseTime).toBeDefined();
      expect(data.technicalMetrics.generationTime).toBeDefined();
      expect(data.technicalMetrics.linesGenerated).toBeDefined();
      expect(data.technicalMetrics.filesCreated).toBeDefined();
    }
  });

  it('should handle Context7 disabled mode', async () => {
    const input = {
      projectId: 'test-no-context7',
      featureDescription: 'create simple utility function',
      targetRole: 'developer',
      codeType: 'function',
      externalSources: {
        useContext7: false,
        useWebSearch: false,
        useMemory: false,
      },
    };

    const result = await handleSmartWrite(input);
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
      projectId: 'test-error',
      featureDescription: '', // Invalid empty description
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Feature description is required');
  });

  it('should validate input schema', async () => {
    const input = {
      invalidField: 'test',
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Required');
  });

  it('should generate consistent output for same input', async () => {
    const input = {
      projectId: 'test-consistency',
      featureDescription: 'create data validation service',
      targetRole: 'developer',
      codeType: 'function',
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result1 = await handleSmartWrite(input);
    const result2 = await handleSmartWrite(input);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    if (result1.data && result2.data) {
      const data1 = result1.data as any;
      const data2 = result2.data as any;

      // Should have same structure and quality metrics
      expect(data1.qualityMetrics).toEqual(data2.qualityMetrics);
      expect(data1.businessValue).toEqual(data2.businessValue);
      expect(data1.generatedCode.files.length).toBe(data2.generatedCode.files.length);
    }
  });

  it('should handle complex tech stack', async () => {
    const input = {
      projectId: 'test-complex-tech',
      featureDescription: 'create microservices authentication system',
      targetRole: 'operations-engineer',
      codeType: 'api',
      techStack: ['typescript', 'nestjs', 'postgresql', 'redis', 'docker', 'kubernetes'],
      businessContext: {
        goals: ['scalability', 'security', 'monitoring'],
        priority: 'high',
      },
      qualityRequirements: {
        testCoverage: 98,
        complexity: 8,
        securityLevel: 'high',
      },
      externalSources: { useContext7: true, useWebSearch: false, useMemory: false },
    };

    const result = await handleSmartWrite(input);
    expect(result.success).toBe(true);

    if (result.data) {
      const data = result.data as any;
      expect(data.generatedCode.files[0].content).toContain('Operations Engineer Role Implementation');
      expect(data.externalIntegration.context7Status).toBe('active');
    }
  });
});
