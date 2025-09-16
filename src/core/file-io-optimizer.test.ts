/**
 * Tests for File I/O Performance Optimizer
 * Implements Task 2.4.2: Database optimization testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileIOOptimizer, createFileIOOptimizer } from './file-io-optimizer.js';
import { readFile, writeFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Mock fs operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  stat: vi.fn(),
  mkdir: vi.fn(),
  unlink: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

describe('FileIOOptimizer', () => {
  let optimizer: FileIOOptimizer;
  let testDir: string;

  beforeEach(() => {
    testDir = './test-temp';
    optimizer = new FileIOOptimizer({
      maxCacheSize: 10,
      ttl: 1000 // 1 second for testing
    });

    // Reset mocks
    vi.clearAllMocks();

    // Mock stat function to return proper file stats
    vi.mocked(stat).mockResolvedValue({
      mtime: new Date('2024-01-01T00:00:00.000Z')
    });
  });

  afterEach(async () => {
    // Cleanup test files
    if (existsSync(testDir)) {
      try {
        await unlink(join(testDir, 'test.json'));
        await unlink(join(testDir, 'test.txt'));
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('File Reading', () => {
    it('should read file and cache content', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      // Mock file operations
      vi.mocked(readFile).mockResolvedValue(content);
      vi.mocked(existsSync).mockReturnValue(true);

      const result = await optimizer.readFile(filePath);

      expect(result).toBe(content);
      expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
    });

    it('should return cached content on second read', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      // Mock file operations
      vi.mocked(readFile).mockResolvedValue(content);
      vi.mocked(existsSync).mockReturnValue(true);

      // First read
      const result1 = await optimizer.readFile(filePath);
      expect(result1).toBe(content);

      // Second read should use cache
      const result2 = await optimizer.readFile(filePath);
      expect(result2).toBe(content);

      // readFile should only be called once
      expect(readFile).toHaveBeenCalledTimes(1);
    });

    it('should read JSON files correctly', async () => {
      const filePath = join(testDir, 'test.json');
      const jsonData = { name: 'test', value: 123 };
      const jsonString = JSON.stringify(jsonData);

      vi.mocked(readFile).mockResolvedValue(jsonString);
      vi.mocked(existsSync).mockReturnValue(true);

      const result = await optimizer.readJSON(filePath);

      expect(result).toEqual(jsonData);
    });
  });

  describe('File Writing', () => {
    it('should write file and update cache', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      vi.mocked(writeFile).mockResolvedValue(undefined);
      vi.mocked(existsSync).mockReturnValue(false);

      await optimizer.writeFile(filePath, content);

      expect(writeFile).toHaveBeenCalledWith(filePath, content, 'utf8');
    });

    it('should write JSON files with formatting', async () => {
      const filePath = join(testDir, 'test.json');
      const jsonData = { name: 'test', value: 123 };

      vi.mocked(writeFile).mockResolvedValue(undefined);
      vi.mocked(existsSync).mockReturnValue(false);

      await optimizer.writeJSON(filePath, jsonData, true);

      const expectedContent = JSON.stringify(jsonData, null, 2);
      expect(writeFile).toHaveBeenCalledWith(filePath, expectedContent, 'utf8');
    });
  });

  describe('Batch Operations', () => {
    it('should read multiple files in parallel', async () => {
      const files = [
        join(testDir, 'file1.txt'),
        join(testDir, 'file2.txt'),
        join(testDir, 'file3.txt')
      ];

      vi.mocked(readFile)
        .mockResolvedValueOnce('content1')
        .mockResolvedValueOnce('content2')
        .mockResolvedValueOnce('content3');
      vi.mocked(existsSync).mockReturnValue(true);

      const results = await optimizer.batchRead(files);

      expect(results.size).toBe(3);
      expect(results.get(files[0])).toBe('content1');
      expect(results.get(files[1])).toBe('content2');
      expect(results.get(files[2])).toBe('content3');
    });

    it('should write multiple files in parallel', async () => {
      const operations = [
        { path: join(testDir, 'file1.txt'), content: 'content1' },
        { path: join(testDir, 'file2.txt'), content: 'content2' }
      ];

      vi.mocked(writeFile).mockResolvedValue(undefined);
      vi.mocked(existsSync).mockReturnValue(false);

      await optimizer.batchWrite(operations);

      expect(writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Metrics', () => {
    it('should track read/write metrics', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      vi.mocked(readFile).mockResolvedValue(content);
      vi.mocked(writeFile).mockResolvedValue(undefined);
      vi.mocked(existsSync).mockReturnValue(true);

      // Perform operations
      await optimizer.readFile(filePath);
      await optimizer.writeFile(filePath, content);

      const metrics = optimizer.getMetrics();

      expect(metrics.totalReads).toBe(1);
      expect(metrics.totalWrites).toBe(1);
      expect(metrics.averageReadTime).toBeGreaterThan(0);
      expect(metrics.averageWriteTime).toBeGreaterThan(0);
    });

    it('should calculate hit rate correctly', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      vi.mocked(readFile).mockResolvedValue(content);
      vi.mocked(existsSync).mockReturnValue(true);

      // First read (miss)
      await optimizer.readFile(filePath);

      // Second read (hit)
      await optimizer.readFile(filePath);

      const metrics = optimizer.getMetrics();

      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.hitRate).toBe(0.5);
    });

    it('should track cache statistics', async () => {
      const cacheStats = optimizer.getCacheStats();

      expect(cacheStats).toHaveProperty('size');
      expect(cacheStats).toHaveProperty('maxSize');
      expect(cacheStats).toHaveProperty('hitRate');
      expect(cacheStats).toHaveProperty('memoryUsage');
      expect(cacheStats.maxSize).toBe(10);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      optimizer.clearCache();

      const cacheStats = optimizer.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });

    it('should calculate time saved', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      vi.mocked(readFile).mockResolvedValue(content);
      vi.mocked(existsSync).mockReturnValue(true);

      // Read twice to get a cache hit
      await optimizer.readFile(filePath);
      await optimizer.readFile(filePath);

      const timeSaved = optimizer.calculateTimeSaved();

      expect(timeSaved).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle read errors gracefully', async () => {
      const filePath = join(testDir, 'nonexistent.txt');

      vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

      await expect(optimizer.readFile(filePath)).rejects.toThrow('File not found');
    });

    it('should handle write errors gracefully', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World!';

      vi.mocked(writeFile).mockRejectedValue(new Error('Permission denied'));
      vi.mocked(existsSync).mockReturnValue(false);

      await expect(optimizer.writeFile(filePath, content)).rejects.toThrow('Permission denied');
    });

    it('should handle JSON parse errors', async () => {
      const filePath = join(testDir, 'invalid.json');
      const invalidJson = '{ invalid json }';

      vi.mocked(readFile).mockResolvedValue(invalidJson);
      vi.mocked(existsSync).mockReturnValue(true);

      await expect(optimizer.readJSON(filePath)).rejects.toThrow('Invalid JSON in file');
    });
  });

  describe('Factory Function', () => {
    it('should create optimizer with default config', () => {
      const optimizer = createFileIOOptimizer();

      expect(optimizer).toBeInstanceOf(FileIOOptimizer);
    });

    it('should create optimizer with custom config', () => {
      const optimizer = createFileIOOptimizer({
        maxCacheSize: 500,
        ttl: 10000
      });

      expect(optimizer).toBeInstanceOf(FileIOOptimizer);
    });
  });
});
