#!/usr/bin/env node

/**
 * Context7 Enhancer Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Context7Enhancer,
  createContext7Enhancer,
  enhanceWithContext7,
  enhanceText,
  enhanceObject,
  enhanceArray,
} from './context7-enhancer.js';

describe('Context7Enhancer', () => {
  let enhancer: Context7Enhancer;

  beforeEach(() => {
    vi.clearAllMocks();
    enhancer = new Context7Enhancer(undefined, {
      maxResults: 3,
      priority: 'high',
      domain: 'test',
      enableLogging: false,
    });
  });

  describe('Basic Functionality', () => {
    it('should initialize with default options', () => {
      const defaultEnhancer = new Context7Enhancer();
      const options = defaultEnhancer.getOptions();

      expect(options.maxResults).toBe(5);
      expect(options.priority).toBe('medium');
      expect(options.domain).toBe('general');
      expect(options.enableLogging).toBe(true);
    });

    it('should initialize with custom options', () => {
      const options = enhancer.getOptions();

      expect(options.maxResults).toBe(3);
      expect(options.priority).toBe('high');
      expect(options.domain).toBe('test');
      expect(options.enableLogging).toBe(false);
    });

    it('should create enhancer with factory function', () => {
      const factoryEnhancer = createContext7Enhancer();
      expect(factoryEnhancer).toBeInstanceOf(Context7Enhancer);
    });
  });

  describe('Enhancement Methods', () => {
    it('should enhance any data with Context7 knowledge', async () => {
      const testData = { message: 'Hello World' };
      const result = await enhancer.enhanceWithContext7(testData, 'test-topic');

      expect(result.originalData).toEqual(testData);
      expect(Array.isArray(result.context7Data)).toBe(true);
      expect(result.enhancementMetadata.dataCount).toBeGreaterThanOrEqual(0);
      expect(result.enhancementMetadata.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should enhance text content', async () => {
      const text = 'This is a test message';
      const result = await enhancer.enhanceText(text, 'text-topic');

      expect(result.originalData).toBe(text);
      expect(Array.isArray(result.context7Data)).toBe(true);
      expect(result.enhancementMetadata.dataCount).toBeGreaterThanOrEqual(0);
    });

    it('should enhance object data', async () => {
      const obj = { name: 'Test', value: 123 };
      const result = await enhancer.enhanceObject(obj, 'object-topic');

      expect(result.originalData).toEqual(obj);
      expect(Array.isArray(result.context7Data)).toBe(true);
      expect(result.enhancementMetadata.dataCount).toBeGreaterThanOrEqual(0);
    });

    it('should enhance array data', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result = await enhancer.enhanceArray(arr, 'array-topic');

      expect(result.originalData).toEqual(arr);
      expect(Array.isArray(result.context7Data)).toBe(true);
      expect(result.enhancementMetadata.dataCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      // This test will use real Context7 calls and should handle any errors gracefully
      const testData = { message: 'Hello World' };
      const result = await enhancer.enhanceWithContext7(testData, 'error-topic');

      expect(result.originalData).toEqual(testData);
      expect(Array.isArray(result.context7Data)).toBe(true);
      expect(result.enhancementMetadata.dataCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Options Management', () => {
    it('should update options', () => {
      enhancer.updateOptions({
        maxResults: 10,
        priority: 'low',
        domain: 'updated',
      });

      const options = enhancer.getOptions();
      expect(options.maxResults).toBe(10);
      expect(options.priority).toBe('low');
      expect(options.domain).toBe('updated');
    });

    it('should merge options with existing ones', () => {
      enhancer.updateOptions({ maxResults: 15 });

      const options = enhancer.getOptions();
      expect(options.maxResults).toBe(15);
      expect(options.priority).toBe('high'); // Should keep existing value
      expect(options.domain).toBe('test'); // Should keep existing value
    });
  });

  describe('Cache Management', () => {
    it('should get cache statistics', () => {
      const stats = enhancer.getCacheStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });

    it('should clear cache', () => {
      expect(() => enhancer.clearCache()).not.toThrow();
    });

    it('should check cache health', () => {
      const isHealthy = enhancer.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('Direct Context7 Data Access', () => {
    it('should get Context7 data without enhancing', async () => {
      const data = await enhancer.getContext7Data('direct-topic');

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('source');
        expect(data[0]).toHaveProperty('type');
      }
    });

    it('should pass options to getContext7Data', async () => {
      const result = await enhancer.getContext7Data('options-topic', {
        maxResults: 1,
        priority: 'low',
      });

      // Should return real Context7 data with the specified options
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('Simple Enhancement Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enhance data with simple function', async () => {
    const testData = { message: 'Simple test' };
    const result = await enhanceWithContext7(testData, 'simple-topic');

    expect(result.originalData).toEqual(testData);
    expect(result.context7Data).toBeDefined();
    expect(result.enhancementMetadata).toBeDefined();
  });

  it('should enhance text with simple function', async () => {
    const text = 'Simple text test';
    const result = await enhanceText(text, 'text-topic');

    expect(result.originalData).toBe(text);
    expect(result.context7Data).toBeDefined();
  });

  it('should enhance object with simple function', async () => {
    const obj = { key: 'value' };
    const result = await enhanceObject(obj, 'object-topic');

    expect(result.originalData).toEqual(obj);
    expect(result.context7Data).toBeDefined();
  });

  it('should enhance array with simple function', async () => {
    const arr = ['a', 'b', 'c'];
    const result = await enhanceArray(arr, 'array-topic');

    expect(result.originalData).toEqual(arr);
    expect(result.context7Data).toBeDefined();
  });
});
