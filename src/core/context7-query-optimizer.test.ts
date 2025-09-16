#!/usr/bin/env node

/**
 * Context7 Query Optimizer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Context7QueryOptimizer, createContext7QueryOptimizer } from './context7-query-optimizer.js';

describe('Context7QueryOptimizer', () => {
  let optimizer: Context7QueryOptimizer;

  beforeEach(() => {
    optimizer = new Context7QueryOptimizer();
  });

  describe('Basic Functionality', () => {
    it('should create optimizer with factory function', () => {
      const factoryOptimizer = createContext7QueryOptimizer();
      expect(factoryOptimizer).toBeInstanceOf(Context7QueryOptimizer);
    });

    it('should normalize queries correctly', () => {
      const result = optimizer.optimizeQuery('How to create a React component?', 'code_examples');
      expect(result.originalQuery).toBe('How to create a React component?');
      expect(result.optimizedQuery).toContain('create');
      expect(result.optimizedQuery).toContain('react');
      expect(result.optimizedQuery).toContain('component');
    });
  });

  describe('Query Optimization', () => {
    it('should optimize documentation queries', () => {
      const result = optimizer.optimizeQuery('react hooks', 'documentation');

      expect(result.queryType).toBe('documentation');
      expect(result.optimizedQuery).toContain('documentation');
      expect(result.optimizedQuery).toContain('guide');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should optimize code example queries', () => {
      const result = optimizer.optimizeQuery('javascript fetch api', 'code_examples');

      expect(result.queryType).toBe('code_examples');
      expect(result.optimizedQuery).toContain('example');
      expect(result.optimizedQuery).toContain('sample');
      expect(result.optimizedQuery).toContain('javascript');
    });

    it('should optimize best practices queries', () => {
      const result = optimizer.optimizeQuery('nodejs security', 'best_practices');

      expect(result.queryType).toBe('best_practices');
      expect(result.optimizedQuery).toContain('best practices');
      expect(result.optimizedQuery).toContain('guidelines');
      expect(result.optimizedQuery).toContain('nodejs');
    });

    it('should optimize troubleshooting queries', () => {
      const result = optimizer.optimizeQuery('react error', 'troubleshooting');

      expect(result.queryType).toBe('troubleshooting');
      expect(result.optimizedQuery).toContain('error');
      expect(result.optimizedQuery).toContain('issue');
      expect(result.optimizedQuery).toContain('react');
    });
  });

  describe('Context Integration', () => {
    it('should use language context', () => {
      const result = optimizer.optimizeQuery('create component', 'code_examples', {
        language: 'typescript',
        framework: 'react'
      });

      expect(result.optimizedQuery).toContain('typescript');
      expect(result.optimizedQuery).toContain('react');
      expect(result.filters.language).toBe('typescript');
      expect(result.filters.framework).toBe('react');
    });

    it('should extract difficulty level', () => {
      const result = optimizer.optimizeQuery('beginner javascript tutorial', 'code_examples');

      expect(result.filters.difficulty).toBe('beginner');
    });

    it('should extract framework from query', () => {
      const result = optimizer.optimizeQuery('react hooks example', 'code_examples');

      expect(result.filters.framework).toBe('react');
    });
  });

  describe('Query Expansion', () => {
    it('should expand synonyms', () => {
      const result = optimizer.optimizeQuery('create', 'code_examples');

      expect(result.optimizedQuery).toContain('build');
      expect(result.optimizedQuery).toContain('make');
      expect(result.optimizedQuery).toContain('generate');
    });

    it('should add related technical terms', () => {
      const result = optimizer.optimizeQuery('api', 'documentation');

      expect(result.optimizedQuery).toContain('endpoint');
      expect(result.optimizedQuery).toContain('service');
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence scores', () => {
      const result = optimizer.optimizeQuery('react', 'code_examples');

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should have higher confidence for well-expanded queries', () => {
      const shortResult = optimizer.optimizeQuery('api', 'documentation');
      const longResult = optimizer.optimizeQuery('create react component with hooks', 'code_examples');

      expect(longResult.confidence).toBeGreaterThanOrEqual(shortResult.confidence);
    });
  });

  describe('Suggestions', () => {
    it('should generate suggestions for short queries', () => {
      const result = optimizer.optimizeQuery('api', 'code_examples');

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should suggest improvements for code examples', () => {
      const result = optimizer.optimizeQuery('javascript', 'code_examples');

      expect(result.suggestions.some(s => s.includes('example'))).toBe(true);
    });
  });

  describe('Filter Extraction', () => {
    it('should extract language filters', () => {
      const result = optimizer.optimizeQuery('python web scraping', 'code_examples');

      expect(result.filters.language).toBe('python');
    });

    it('should extract framework filters', () => {
      const result = optimizer.optimizeQuery('vue component', 'code_examples');

      expect(result.filters.framework).toBe('vue');
    });

    it('should set default max results', () => {
      const result = optimizer.optimizeQuery('test query', 'documentation');

      expect(result.filters.maxResults).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queries', () => {
      const result = optimizer.optimizeQuery('', 'documentation');

      expect(result.originalQuery).toBe('');
      expect(result.optimizedQuery).toBeDefined();
    });

    it('should handle queries with special characters', () => {
      const result = optimizer.optimizeQuery('How to create a React component?', 'code_examples');

      expect(result.optimizedQuery).not.toContain('?');
      expect(result.optimizedQuery).not.toContain('How to');
    });

    it('should handle very long queries', () => {
      const longQuery = 'how to create a react component with hooks and state management using typescript and best practices';
      const result = optimizer.optimizeQuery(longQuery, 'code_examples');

      expect(result.optimizedQuery).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});
