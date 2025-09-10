#!/usr/bin/env node

/**
 * Enhanced Smart Begin Tool Tests with Context7 Cache Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartBegin } from './smart-begin.js';

// No mocking - tests will use real Context7 API calls

describe('Enhanced Smart Begin Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize project with Context7 enhancement', async () => {
      const input = {
        projectName: 'Test Project',
        techStack: ['typescript', 'nodejs'],
        projectTemplate: 'mcp-server',
        role: 'developer',
        externalSources: {
          useContext7: true,
          useWebSearch: false,
          useMemory: false,
        },
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        const data = result.data as any;
        expect(data.projectId).toContain('proj_');
        expect(data.projectStructure).toBeDefined();
        expect(data.qualityGates).toBeDefined();
        expect(data.externalIntegration.context7Status).toBe('active');
        expect(data.externalIntegration.context7Enhancement).toBeDefined();
        expect(data.externalIntegration.cacheStats).toBeDefined();
      }
    });

    it('should work without Context7 enhancement', async () => {
      const input = {
        projectName: 'Simple Project',
        techStack: ['javascript'],
        externalSources: {
          useContext7: false,
          useWebSearch: false,
          useMemory: false,
        },
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        const data = result.data as any;
        expect(data.externalIntegration.context7Status).toBe('disabled');
        expect(data.externalIntegration.context7Enhancement).toBeNull();
      }
    });
  });

  describe('Context7 Integration', () => {
    it('should enhance project data with Context7 knowledge', async () => {
      const input = {
        projectName: 'Enhanced Project',
        techStack: ['react', 'typescript'],
        projectTemplate: 'web-app',
        role: 'developer',
        externalSources: {
          useContext7: true,
        },
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.externalIntegration.context7Enhancement).toBeDefined();
        expect(data.externalIntegration.context7Enhancement.dataCount).toBeGreaterThanOrEqual(0);
        expect(data.externalIntegration.context7Enhancement.cacheHit).toBeDefined();
        expect(data.externalIntegration.cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle Context7 errors gracefully', async () => {
      // This test will use real Context7 calls and should handle any errors gracefully
      const input = {
        projectName: 'Error Test Project',
        externalSources: {
          useContext7: true,
        },
      };

      const result = await handleSmartBegin(input);

      // Should still succeed even if Context7 has issues
      expect(result.success).toBe(true);
    });
  });

  describe('Project Structure Generation', () => {
    it('should generate appropriate structure for MCP server', async () => {
      const input = {
        projectName: 'MCP Server Project',
        techStack: ['typescript', 'nodejs'],
        projectTemplate: 'mcp-server',
        role: 'developer',
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.projectStructure.folders).toContain('src');
        expect(data.projectStructure.files).toContain('package.json');
        expect(data.projectStructure.templates.length).toBeGreaterThanOrEqual(1);
        expect(data.projectStructure.templates[0].name).toBe('MCP Server Template');
      }
    });

    it('should generate role-specific templates', async () => {
      const input = {
        projectName: 'QA Project',
        techStack: ['typescript'],
        role: 'qa-engineer',
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        const qaTemplate = data.projectStructure.templates.find(
          (t: any) => t.name === 'QA Test Template'
        );
        expect(qaTemplate).toBeDefined();
        expect(qaTemplate.path).toBe('tests/quality-validation.test.ts');
      }
    });
  });

  describe('Quality Gates and Compliance', () => {
    it('should generate appropriate quality gates', async () => {
      const input = {
        projectName: 'Quality Project',
        techStack: ['typescript', 'react'],
        qualityLevel: 'enterprise',
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.qualityGates).toHaveLength(6); // 5 base + 1 React-specific
        expect(data.qualityGates[0].name).toBe('TypeScript Strict Mode');
        expect(data.qualityGates[0].status).toBe('enabled');

        const reactGate = data.qualityGates.find((g: any) => g.name === 'React Best Practices');
        expect(reactGate).toBeDefined();
      }
    });

    it('should validate process compliance', async () => {
      const input = {
        projectName: 'Compliance Project',
        role: 'developer',
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.processCompliance.roleValidation).toBe(true);
        expect(data.processCompliance.qualityGates).toBe(true);
        expect(data.processCompliance.documentation).toBe(true);
        expect(data.processCompliance.testing).toBe(true);
      }
    });
  });

  describe('Business Value Calculation', () => {
    it('should calculate appropriate business value', async () => {
      const input = {
        projectName: 'Business Project',
        techStack: ['typescript', 'react'],
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(true);

      if (result.data) {
        const data = result.data as any;
        expect(data.businessValue.costPrevention).toBeGreaterThan(10000);
        expect(data.businessValue.timeSaved).toBe(2.5);
        expect(data.businessValue.qualityImprovements).toContain('Production-ready project structure');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const input = {
        // Missing required projectName
        techStack: ['typescript'],
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });

    it('should handle malformed input', async () => {
      const input = {
        projectName: 123, // Wrong type
      };

      const result = await handleSmartBegin(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
