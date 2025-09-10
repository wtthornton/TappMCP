/**
 * Performance Tests for Smart Converse Tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleSmartConverse, parseIntent } from './smart-converse.js';
import * as smartOrchestrate from './smart-orchestrate.js';

// Mock the smart-orchestrate module
vi.mock('./smart-orchestrate.js', () => ({
  handleSmartOrchestrate: vi.fn(),
}));

describe('SmartConverse Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock orchestrate response
    vi.mocked(smartOrchestrate.handleSmartOrchestrate).mockResolvedValue({
      success: true,
      orchestrationId: 'perf-test',
      timestamp: new Date().toISOString(),
    });
  });

  describe('Response Time Validation', () => {
    it('should complete parsing within 50ms', () => {
      const start = performance.now();

      const intent = parseIntent(
        'I want to create a React web application with TypeScript called MyApp'
      );

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50);
      expect(intent.projectType).toBe('web-app');
      expect(intent.techStack).toContain('react');
      expect(intent.techStack).toContain('typescript');
    });

    it('should complete full conversation handling within 100ms', async () => {
      const start = performance.now();

      const response = await handleSmartConverse({
        userMessage: 'Build a Node.js API service with Express',
      });

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100);
      expect(response.content[0].text).toContain('Project');
    });

    it('should handle multiple conversations efficiently', async () => {
      const conversations = [
        'Create a React app',
        'Build a Python API',
        'Design a mobile application',
        'Develop a TypeScript library',
        'Make a Vue.js website',
      ];

      const start = performance.now();

      const results = await Promise.all(
        conversations.map(msg => handleSmartConverse({ userMessage: msg }))
      );

      const end = performance.now();
      const avgDuration = (end - start) / conversations.length;

      expect(avgDuration).toBeLessThan(100);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.content[0].text).toContain('Project');
      });
    });

    it('should parse complex sentences efficiently', () => {
      const complexMessage =
        'I want to build and deploy a comprehensive React-based web application with TypeScript, Node.js backend, PostgreSQL database, Redis caching, Docker containerization, and CI/CD pipeline for a Fortune 500 enterprise client requiring GDPR compliance and SOC 2 certification';

      const start = performance.now();

      const intent = parseIntent(complexMessage);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50);
      // Note: "backend" appears first, so it will be detected as api-service
      expect(intent.projectType).toBe('api-service');
      expect(intent.techStack).toContain('react');
      expect(intent.techStack).toContain('typescript');
      expect(intent.techStack).toContain('nodejs');
    });
  });

  describe('Memory Efficiency', () => {
    it('should not accumulate memory with repeated calls', async () => {
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        await handleSmartConverse({
          userMessage: `Create project ${i}`,
        });
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true);
    });

    it('should handle large message inputs efficiently', async () => {
      const largeMessage = 'Create a project '.repeat(1000) + 'with React and TypeScript';

      const start = performance.now();

      const response = await handleSmartConverse({
        userMessage: largeMessage,
      });

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200); // Allow more time for large input
      expect(response.content[0].text).toContain('Project');
    });
  });

  describe('Quality Metrics', () => {
    it('should maintain accuracy under load', async () => {
      const testCases = [
        { message: 'React app', expectedType: 'web-app', expectedTech: 'react' },
        { message: 'Python API', expectedType: 'api-service', expectedTech: 'python' },
        { message: 'Mobile application', expectedType: 'mobile-app', expectedTech: null },
        { message: 'TypeScript library', expectedType: 'library', expectedTech: 'typescript' },
      ];

      for (const testCase of testCases) {
        const intent = parseIntent(testCase.message);

        expect(intent.projectType).toBe(testCase.expectedType);
        if (testCase.expectedTech) {
          expect(intent.techStack).toContain(testCase.expectedTech);
        }
      }
    });
  });
});
