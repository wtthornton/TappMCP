/**
 * Performance Cache Tests
 *
 * Tests the LRU-based caching system for code generation,
 * technology insights, and analysis results.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceCache } from './PerformanceCache.js';

describe('PerformanceCache', () => {
  let cache: PerformanceCache;

  beforeEach(() => {
    cache = new PerformanceCache();
  });

  afterEach(() => {
    cache.clearCache();
  });

  describe('Code Generation Caching', () => {
    it('should cache code generation results', async () => {
      const request = {
        featureDescription: 'Create a test component',
        techStack: ['React'],
      };

      let callCount = 0;
      const generator = async () => {
        callCount++;
        return `Generated code ${ callCount}`;
      };

      // First call
      const result1 = await cache.cacheCodeGeneration(request, generator);
      expect(result1).toBe('Generated code 1');
      expect(callCount).toBe(1);

      // Second call with same request should use cache
      const result2 = await cache.cacheCodeGeneration(request, generator);
      expect(result2).toBe('Generated code 1');
      expect(callCount).toBe(1); // Should not increment
    });

    it('should generate different cache keys for different requests', async () => {
      const request1 = { featureDescription: 'Component A', techStack: ['React'] };
      const request2 = { featureDescription: 'Component B', techStack: ['React'] };

      let callCount = 0;
      const generator = async () => `Generated code ${++callCount}`;

      const result1 = await cache.cacheCodeGeneration(request1, generator);
      const result2 = await cache.cacheCodeGeneration(request2, generator);

      expect(result1).toBe('Generated code 1');
      expect(result2).toBe('Generated code 2');
      expect(callCount).toBe(2);
    });

    it('should respect cache size limits', async () => {
      const smallCache = new PerformanceCache({ maxCodeGenerations: 2 });

      const requests = [
        { featureDescription: 'Component 1', techStack: ['React'] },
        { featureDescription: 'Component 2', techStack: ['React'] },
        { featureDescription: 'Component 3', techStack: ['React'] },
      ];

      let callCount = 0;
      const generator = async () => `Generated code ${++callCount}`;

      // Fill cache
      await smallCache.cacheCodeGeneration(requests[0], generator);
      await smallCache.cacheCodeGeneration(requests[1], generator);
      expect(callCount).toBe(2);

      // This should evict the first entry
      await smallCache.cacheCodeGeneration(requests[2], generator);
      expect(callCount).toBe(3);

      // First request should now require regeneration
      await smallCache.cacheCodeGeneration(requests[0], generator);
      expect(callCount).toBe(4);

      smallCache.clearCache();
    });
  });

  describe('Technology Insights Caching', () => {
    it('should cache technology insights', async () => {
      const key = 'react-insights';
      const data = { patterns: ['hooks', 'components'] };

      let callCount = 0;
      const generator = async () => {
        callCount++;
        return { insights: `Insight ${callCount}`, bestPractices: [] };
      };

      // First call
      const result1 = await cache.cacheTechnologyInsights(key, data, generator);
      expect(result1.insights).toBe('Insight 1');
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await cache.cacheTechnologyInsights(key, data, generator);
      expect(result2.insights).toBe('Insight 1');
      expect(callCount).toBe(1);
    });

    it('should handle complex data structures in cache keys', async () => {
      const complexData = {
        patterns: ['A', 'B'],
        context: { nested: { deeply: 'value' } },
        arrays: [1, 2, 3],
      };

      let callCount = 0;
      const generator = async () => ({ result: ++callCount });

      const result1 = await cache.cacheTechnologyInsights('test', complexData, generator);
      const result2 = await cache.cacheTechnologyInsights('test', complexData, generator);

      expect(result1.result).toBe(1);
      expect(result2.result).toBe(1);
      expect(callCount).toBe(1);
    });
  });

  describe('Code Analysis Caching', () => {
    it('should cache code analysis results', async () => {
      const code = 'const x = 1;';
      const technology = 'JavaScript';

      let callCount = 0;
      const analyzer = async () => {
        callCount++;
        return `Analysis ${callCount}`;
      };

      const result1 = await cache.cacheCodeAnalysis(code, technology, analyzer);
      const result2 = await cache.cacheCodeAnalysis(code, technology, analyzer);

      expect(result1).toBe('Analysis 1');
      expect(result2).toBe('Analysis 1');
      expect(callCount).toBe(1);
    });

    it('should differentiate between different code/technology combinations', async () => {
      const code1 = 'const x = 1;';
      const code2 = 'const y = 2;';
      const tech = 'JavaScript';

      let callCount = 0;
      const analyzer = async () => `Analysis ${++callCount}`;

      const result1 = await cache.cacheCodeAnalysis(code1, tech, analyzer);
      const result2 = await cache.cacheCodeAnalysis(code2, tech, analyzer);
      const result3 = await cache.cacheCodeAnalysis(code1, 'TypeScript', analyzer);

      expect(result1).toBe('Analysis 1');
      expect(result2).toBe('Analysis 2');
      expect(result3).toBe('Analysis 3');
      expect(callCount).toBe(3);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache statistics', async () => {
      const request = { featureDescription: 'Test', techStack: ['React'] };
      const generator = async () => 'result';

      // Initial stats
      const initialStats = cache.getStats();
      expect(initialStats.hits).toBe(0);
      expect(initialStats.misses).toBe(0);

      // First call (miss)
      await cache.cacheCodeGeneration(request, generator);
      let stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);

      // Second call (hit)
      await cache.cacheCodeGeneration(request, generator);
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      // Calculate hit rate
      const hitRate = stats.hits / (stats.hits + stats.misses);
      expect(hitRate).toBe(0.5);
    });

    it('should track cache sizes', async () => {
      const stats = cache.getStats();
      expect(stats.codeGenerationCacheSize).toBe(0);
      expect(stats.technologyInsightsCacheSize).toBe(0);
      expect(stats.codeAnalysisCacheSize).toBe(0);

      // Add items to caches
      await cache.cacheCodeGeneration({ featureDescription: 'Test' }, async () => 'code');
      await cache.cacheTechnologyInsights('key', {}, async () => ({}));
      await cache.cacheCodeAnalysis('code', 'js', async () => 'analysis');

      const updatedStats = cache.getStats();
      expect(updatedStats.codeGenerationCacheSize).toBe(1);
      expect(updatedStats.technologyInsightsCacheSize).toBe(1);
      expect(updatedStats.codeAnalysisCacheSize).toBe(1);
    });

    it('should provide memory usage estimates', () => {
      const stats = cache.getStats();
      expect(typeof stats.estimatedMemoryUsage).toBe('number');
      expect(stats.estimatedMemoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', async () => {
      // Populate caches
      await cache.cacheCodeGeneration({ featureDescription: 'Test' }, async () => 'code');
      await cache.cacheTechnologyInsights('key', {}, async () => ({}));
      await cache.cacheCodeAnalysis('code', 'js', async () => 'analysis');

      let stats = cache.getStats();
      expect(stats.codeGenerationCacheSize).toBeGreaterThan(0);

      // Clear and verify
      cache.clearCache();
      stats = cache.getStats();
      expect(stats.codeGenerationCacheSize).toBe(0);
      expect(stats.technologyInsightsCacheSize).toBe(0);
      expect(stats.codeAnalysisCacheSize).toBe(0);
    });

    it('should handle cache warming', async () => {
      const commonRequests = [
        { featureDescription: 'React component', techStack: ['React'] },
        { featureDescription: 'API endpoint', techStack: ['Node.js'] },
        { featureDescription: 'Database query', techStack: ['PostgreSQL'] },
      ];

      let callCount = 0;
      const generator = async () => `Generated ${++callCount}`;

      // Warm cache
      await Promise.all(
        commonRequests.map(request => cache.cacheCodeGeneration(request, generator))
      );

      expect(callCount).toBe(3);

      // Subsequent calls should hit cache
      await Promise.all(
        commonRequests.map(request => cache.cacheCodeGeneration(request, generator))
      );

      expect(callCount).toBe(3); // Should not increase
    });
  });

  describe('Error Handling', () => {
    it('should handle generator function errors', async () => {
      const request = { featureDescription: 'Test' };
      const errorGenerator = async () => {
        throw new Error('Generation failed');
      };

      await expect(cache.cacheCodeGeneration(request, errorGenerator)).rejects.toThrow(
        'Generation failed'
      );

      // Error should not be cached
      let callCount = 0;
      const successGenerator = async () => `Success ${++callCount}`;

      const result = await cache.cacheCodeGeneration(request, successGenerator);
      expect(result).toBe('Success 1');
      expect(callCount).toBe(1);
    });

    it('should handle invalid cache keys gracefully', async () => {
      const invalidData = {
        circular: {} as any,
      };
      invalidData.circular.ref = invalidData.circular;

      const generator = async () => 'result';

      // Should not throw, might fall back to no caching
      await expect(cache.cacheTechnologyInsights('test', invalidData, generator)).resolves.toBe(
        'result'
      );
    });
  });

  describe('Performance Characteristics', () => {
    it('should have reasonable performance for cache operations', async () => {
      const requests = Array(100)
        .fill(null)
        .map((_, i) => ({
          featureDescription: `Component ${i}`,
          techStack: ['React'],
        }));

      const generator = async () => 'generated code';

      const startTime = Date.now();

      // First pass - cache misses
      await Promise.all(requests.map(request => cache.cacheCodeGeneration(request, generator)));

      // Second pass - cache hits
      await Promise.all(requests.map(request => cache.cacheCodeGeneration(request, generator)));

      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);

      const stats = cache.getStats();
      expect(stats.hits).toBe(100);
      expect(stats.misses).toBe(100);
    });

    it('should have efficient memory usage', async () => {
      const initialStats = cache.getStats();
      const initialMemory = initialStats.estimatedMemoryUsage;

      // Add many small items
      for (let i = 0; i < 50; i++) {
        await cache.cacheCodeGeneration(
          { featureDescription: `Component ${i}` },
          async () => `Code ${i}`
        );
      }

      const finalStats = cache.getStats();
      const finalMemory = finalStats.estimatedMemoryUsage;

      // Memory should increase but not excessively
      expect(finalMemory).toBeGreaterThan(initialMemory);
      expect(finalMemory).toBeLessThan(initialMemory + 1000000); // Less than 1MB for 50 small items
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent cache access safely', async () => {
      const request = { featureDescription: 'Concurrent test' };

      let callCount = 0;
      const generator = async () => {
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 10));
        return `Generated ${++callCount}`;
      };

      // Multiple concurrent requests for the same item
      const promises = Array(10)
        .fill(null)
        .map(() => cache.cacheCodeGeneration(request, generator));

      const results = await Promise.all(promises);

      // All should get the same result
      results.forEach(result => {
        expect(result).toBe('Generated 1');
      });

      // Generator should only be called once
      expect(callCount).toBe(1);
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [];

      // Mix of different cache operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          cache.cacheCodeGeneration(
            { featureDescription: `Component ${i % 3}` },
            async () => `Code ${i}`
          )
        );

        operations.push(
          cache.cacheTechnologyInsights(`key-${i % 3}`, { data: i }, async () => ({ insight: i }))
        );

        operations.push(
          cache.cacheCodeAnalysis(`code-${i % 3}`, 'JavaScript', async () => `Analysis ${i}`)
        );
      }

      const results = await Promise.all(operations);

      expect(results).toHaveLength(30);
      expect(results.every(result => result !== undefined)).toBe(true);
    });
  });
});
