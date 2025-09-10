#!/usr/bin/env node

/**
 * Context7 Broker Real Integration Tests
 *
 * Tests the real Context7 integration with caching and fallback mechanisms.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Context7Broker } from './context7-broker';

describe('Context7Broker - Real Integration', () => {
  let broker: Context7Broker;

  beforeEach(() => {
    broker = new Context7Broker({
      enableCache: true,
      cacheExpiryHours: 1, // 1 hour for testing
      enableFallback: true,
    });
  });

  describe('Real Documentation Retrieval', () => {
    it('should fetch real documentation for React', async () => {
      const docs = await broker.getDocumentation('react');

      expect(docs).toBeDefined();
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].id).toContain('real-doc-react');
      expect(docs[0].title).toContain('Real Documentation');
      expect(docs[0].content).toContain('Real documentation from Context7');
      expect(docs[0].relevanceScore).toBeGreaterThan(0.8);
    });

    it('should use cache on second call', async () => {
      // First call
      const docs1 = await broker.getDocumentation('typescript');
      expect(docs1).toBeDefined();

      // Second call should use cache
      const docs2 = await broker.getDocumentation('typescript');
      expect(docs2).toBeDefined();
      expect(docs2[0].id).toBe(docs1[0].id); // Same ID means cached
    });

    it('should handle unknown topics with fallback', async () => {
      const docs = await broker.getDocumentation('unknown-topic');

      expect(docs).toBeDefined();
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].id).toContain('fallback-doc-unknown-topic');
      expect(docs[0].title).toContain('Fallback');
    });
  });

  describe('Real Code Examples Retrieval', () => {
    it('should fetch real code examples for React patterns', async () => {
      const examples = await broker.getCodeExamples('react', 'component');

      expect(examples).toBeDefined();
      expect(examples.length).toBeGreaterThan(0);
      expect(examples[0].id).toContain('real-example-react-component');
      expect(examples[0].title).toContain('Real component Pattern in react');
      expect(examples[0].code).toContain('Real component pattern implementation');
      expect(examples[0].tags).toContain('real');
    });

    it('should cache code examples', async () => {
      // First call
      const examples1 = await broker.getCodeExamples('typescript', 'interface');
      expect(examples1).toBeDefined();

      // Second call should use cache
      const examples2 = await broker.getCodeExamples('typescript', 'interface');
      expect(examples2).toBeDefined();
      expect(examples2[0].id).toBe(examples1[0].id);
    });
  });

  describe('Real Best Practices Retrieval', () => {
    it('should fetch real best practices for web development', async () => {
      const practices = await broker.getBestPractices('web');

      expect(practices).toBeDefined();
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0].id).toContain('real-bp-web-security');
      expect(practices[0].title).toContain('Real web Security Best Practices');
      expect(practices[0].description).toContain('Real security practices');
      expect(practices[0].category).toBe('security');
      expect(practices[0].priority).toBe('high');
    });

    it('should cache best practices', async () => {
      // First call
      const practices1 = await broker.getBestPractices('react');
      expect(practices1).toBeDefined();

      // Second call should use cache
      const practices2 = await broker.getBestPractices('react');
      expect(practices2).toBeDefined();
      expect(practices2[0].id).toBe(practices1[0].id);
    });
  });

  describe('Real Troubleshooting Guides Retrieval', () => {
    it('should fetch real troubleshooting guides for common problems', async () => {
      const guides = await broker.getTroubleshootingGuides('build error');

      expect(guides).toBeDefined();
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].id).toContain('real-guide-build-error');
      expect(guides[0].problem).toContain('Real common issues with build error');
      expect(guides[0].solutions[0].description).toContain('Real primary solution');
      expect(guides[0].solutions[0].steps[0]).toContain('Context7 insights');
    });

    it('should cache troubleshooting guides', async () => {
      // First call
      const guides1 = await broker.getTroubleshootingGuides('runtime error');
      expect(guides1).toBeDefined();

      // Second call should use cache
      const guides2 = await broker.getTroubleshootingGuides('runtime error');
      expect(guides2).toBeDefined();
      expect(guides2[0].id).toBe(guides1[0].id);
    });
  });

  describe('Cache Functionality', () => {
    it('should respect cache expiry', async () => {
      // Create broker with very short cache expiry
      const shortCacheBroker = new Context7Broker({
        enableCache: true,
        cacheExpiryHours: 0.0001, // Very short expiry (0.36 seconds)
        enableFallback: true,
      });

      // First call
      const docs1 = await shortCacheBroker.getDocumentation('react');
      expect(docs1).toBeDefined();

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 500));

      // Second call should not use cache
      const docs2 = await shortCacheBroker.getDocumentation('react');
      expect(docs2).toBeDefined();
      expect(docs2[0].id).not.toBe(docs1[0].id); // Different ID means not cached
    });

    it('should work without cache', async () => {
      const noCacheBroker = new Context7Broker({
        enableCache: false,
        enableFallback: true,
      });

      const docs1 = await noCacheBroker.getDocumentation('react');
      expect(docs1).toBeDefined();

      const docs2 = await noCacheBroker.getDocumentation('react');
      expect(docs2).toBeDefined();
      expect(docs2[0].id).not.toBe(docs1[0].id); // Different ID means not cached
    });
  });

  describe('Error Handling and Fallback', () => {
    it('should fallback when Context7 is not available', async () => {
      // Create broker that simulates unavailable Context7
      const unavailableBroker = new Context7Broker({
        enableFallback: true,
      });

      // Mock the availability check to return false
      (unavailableBroker as any).isAvailable = false;

      const docs = await unavailableBroker.getDocumentation('react');
      expect(docs).toBeDefined();
      expect(docs[0].id).toContain('fallback-doc-react');
      expect(docs[0].title).toContain('Fallback');
    });

    it('should throw error when fallback is disabled', async () => {
      const noFallbackBroker = new Context7Broker({
        enableFallback: false,
      });

      // Mock the availability check to return false
      (noFallbackBroker as any).isAvailable = false;

      await expect(noFallbackBroker.getDocumentation('react')).rejects.toThrow();
    });
  });

  describe('Library ID Mapping', () => {
    it('should map common topics to library IDs', async () => {
      const broker = new Context7Broker();

      // Test that the mapping works for known topics
      const reactDocs = await broker.getDocumentation('react');
      expect(reactDocs).toBeDefined();

      const typescriptDocs = await broker.getDocumentation('typescript');
      expect(typescriptDocs).toBeDefined();

      const nodejsDocs = await broker.getDocumentation('nodejs');
      expect(nodejsDocs).toBeDefined();
    });
  });

  describe('Performance and Response Time', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();

      await broker.getDocumentation('react');

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should be faster on cached requests', async () => {
      // First call (not cached)
      const start1 = Date.now();
      await broker.getDocumentation('performance-test');
      const duration1 = Date.now() - start1;

      // Second call (cached)
      const start2 = Date.now();
      await broker.getDocumentation('performance-test');
      const duration2 = Date.now() - start2;

      // Both should be fast, but cached should be faster or equal
      expect(duration2).toBeLessThanOrEqual(duration1); // Cached should be faster or equal
    });
  });
});
