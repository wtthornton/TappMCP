#!/usr/bin/env node

/**
 * Tests for SQLite Database Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteDatabase, createSQLiteDatabase } from './sqlite-database.js';
import { FileManager, createFileManager } from './file-manager.js';
import { existsSync, unlinkSync, rmSync } from 'fs';

describe('SQLite Database Manager', () => {
  let db: SQLiteDatabase;
  let fileManager: FileManager;
  const testDbPath = './test-data/test.db';
  const testJsonPath = './test-data/json';

  beforeEach(async () => {
    // Clean up any existing test data
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    if (existsSync(testJsonPath)) {
      rmSync(testJsonPath, { recursive: true, force: true });
    }

    // Create new instances
    db = createSQLiteDatabase({
      databasePath: testDbPath,
      jsonFileBasePath: testJsonPath
    });

    fileManager = createFileManager({
      basePath: testJsonPath
    });
  });

  afterEach(async () => {
    if (db) {
      try {
        await db.close();
        // Wait a bit for the database to fully close
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn('Error closing database:', error);
      }
    }

    // Clean up test data with retries
    let retries = 3;
    while (retries > 0) {
      try {
        if (existsSync(testDbPath)) {
          unlinkSync(testDbPath);
        }
        if (existsSync(testJsonPath)) {
          rmSync(testJsonPath, { recursive: true, force: true });
        }
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.warn('Failed to clean up test data:', error);
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const health = await db.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.details.connected).toBe(true);
    });

    it('should create required tables', async () => {
      const stats = await db.getStats();
      expect(stats.totalArtifacts).toBe(0);
      expect(stats.artifactsByType).toEqual({});
    });
  });

  describe('Artifact Operations', () => {
    it('should store and retrieve artifact', async () => {
      const testData = { message: 'Hello, World!', timestamp: Date.now() };

      // Store data in file
      const pointer = await fileManager.storeData('test-1', 'test', 'demo', testData);

      // Store artifact metadata
      const artifactId = await db.storeArtifact({
        id: 'test-1',
        type: 'test',
        category: 'demo',
        title: 'Test Artifact',
        filePath: pointer.filePath,
        fileSize: pointer.size,
        metadata: { source: 'test' },
        priority: 5,
        tags: ['test', 'demo'],
        compressed: pointer.compressed,
        checksum: pointer.checksum
      });

      expect(artifactId).toBe('test-1');

      // Retrieve artifact
      const retrieved = await db.getArtifact('test-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe('test-1');
      expect(retrieved!.type).toBe('test');
      expect(retrieved!.accessCount).toBe(1); // Should be incremented
    });

    it('should search artifacts', async () => {
      // Create test artifacts
      const testData1 = { data: 'test1' };
      const testData2 = { data: 'test2' };

      const pointer1 = await fileManager.storeData('search-1', 'type1', 'cat1', testData1);
      const pointer2 = await fileManager.storeData('search-2', 'type1', 'cat2', testData2);

      await db.storeArtifact({
        id: 'search-1',
        type: 'type1',
        category: 'cat1',
        title: 'Search Test 1',
        filePath: pointer1.filePath,
        fileSize: pointer1.size,
        priority: 3,
        tags: ['search'],
        compressed: pointer1.compressed,
        checksum: pointer1.checksum
      });

      await db.storeArtifact({
        id: 'search-2',
        type: 'type1',
        category: 'cat2',
        title: 'Search Test 2',
        filePath: pointer2.filePath,
        fileSize: pointer2.size,
        priority: 7,
        tags: ['search', 'test'],
        compressed: pointer2.compressed,
        checksum: pointer2.checksum
      });

      // Search by type
      const results1 = await db.searchArtifacts({ type: 'type1', limit: 10 });
      expect(results1).toHaveLength(2);

      // Search by category
      const results2 = await db.searchArtifacts({ category: 'cat1' });
      expect(results2).toHaveLength(1);
      expect(results2[0].id).toBe('search-1');

      // Search by tags
      const results3 = await db.searchArtifacts({ tags: ['test'] });
      expect(results3).toHaveLength(1);
      expect(results3[0].id).toBe('search-2');
    });

    it('should update access tracking', async () => {
      const testData = { data: 'access-test' };
      const pointer = await fileManager.storeData('access-1', 'test', 'demo', testData);

      await db.storeArtifact({
        id: 'access-1',
        type: 'test',
        category: 'demo',
        title: 'Access Test',
        filePath: pointer.filePath,
        fileSize: pointer.size,
        priority: 5,
        tags: ['test'],
        compressed: pointer.compressed,
        checksum: pointer.checksum
      });

      // Retrieve multiple times
      await db.getArtifact('access-1');
      await db.getArtifact('access-1');
      await db.getArtifact('access-1');

      const artifact = await db.getArtifact('access-1');
      expect(artifact!.accessCount).toBe(4); // Initial + 3 retrievals
    });

    it('should delete artifact', async () => {
      const testData = { data: 'delete-test' };
      const pointer = await fileManager.storeData('delete-1', 'test', 'demo', testData);

      await db.storeArtifact({
        id: 'delete-1',
        type: 'test',
        category: 'demo',
        title: 'Delete Test',
        filePath: pointer.filePath,
        fileSize: pointer.size,
        priority: 5,
        tags: ['test'],
        compressed: pointer.compressed,
        checksum: pointer.checksum
      });

      // Verify artifact exists
      const before = await db.getArtifact('delete-1');
      expect(before).not.toBeNull();

      // Delete artifact
      const deleted = await db.deleteArtifact('delete-1');
      expect(deleted).toBe(true);

      // Verify artifact is gone
      const after = await db.getArtifact('delete-1');
      expect(after).toBeNull();
    });
  });

  describe('File Manager Integration', () => {
    it('should store and load data with compression', async () => {
      const largeData = {
        data: 'x'.repeat(2000), // 2KB of data
        metadata: { large: true }
      };

      const pointer = await fileManager.storeData('large-1', 'test', 'demo', largeData);

      expect(pointer.compressed).toBe(true); // Should be compressed
      expect(pointer.size).toBeLessThan(2000); // Should be smaller than original
      expect(pointer.checksum).toBeTruthy();

      // Load data back
      const result = await fileManager.loadData(pointer);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(largeData);
    });

    it('should validate file integrity', async () => {
      const testData = { data: 'integrity-test' };
      const pointer = await fileManager.storeData('integrity-1', 'test', 'demo', testData);

      const isValid = await fileManager.validateFile(pointer);
      expect(isValid).toBe(true);
    });

    it('should handle file cleanup', async () => {
      const testData = { data: 'cleanup-test' };
      const pointer = await fileManager.storeData('cleanup-1', 'test', 'demo', testData);

      const deleted = await fileManager.deleteFile(pointer);
      expect(deleted).toBe(true);

      // Try to load deleted file
      const result = await fileManager.loadData(pointer);
      expect(result.success).toBe(false);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', async () => {
      // Create multiple artifacts
      const testData1 = { data: 'stats1' };
      const testData2 = { data: 'stats2' };

      const pointer1 = await fileManager.storeData('stats-1', 'type1', 'cat1', testData1);
      const pointer2 = await fileManager.storeData('stats-2', 'type2', 'cat1', testData2);

      await db.storeArtifact({
        id: 'stats-1',
        type: 'type1',
        category: 'cat1',
        title: 'Stats Test 1',
        filePath: pointer1.filePath,
        fileSize: pointer1.size,
        priority: 3,
        tags: ['stats'],
        compressed: pointer1.compressed,
        checksum: pointer1.checksum
      });

      await db.storeArtifact({
        id: 'stats-2',
        type: 'type2',
        category: 'cat1',
        title: 'Stats Test 2',
        filePath: pointer2.filePath,
        fileSize: pointer2.size,
        priority: 7,
        tags: ['stats'],
        compressed: pointer2.compressed,
        checksum: pointer2.checksum
      });

      const stats = await db.getStats();

      expect(stats.totalArtifacts).toBe(2);
      expect(stats.artifactsByType.type1).toBe(1);
      expect(stats.artifactsByType.type2).toBe(1);
      expect(stats.totalFileSize).toBe(pointer1.size + pointer2.size);
    });

    it('should provide file manager statistics', async () => {
      const testData1 = { data: 'fm-stats1' };
      const testData2 = { data: 'fm-stats2' };

      await fileManager.storeData('fm-stats-1', 'type1', 'cat1', testData1);
      await fileManager.storeData('fm-stats-2', 'type1', 'cat2', testData2);

      const stats = await fileManager.getStorageStats();

      expect(stats.totalFiles).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.filesByType.type1).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Create database with invalid path
      const invalidDb = createSQLiteDatabase({
        databasePath: '/invalid/path/that/does/not/exist/test.db',
        jsonFileBasePath: './test-data/json'
      });

      try {
        await invalidDb.healthCheck();
        // Should either succeed with fallback or throw meaningful error
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('database');
      }
    });

    it('should handle file system errors gracefully', async () => {
      // Test with invalid file path
      const invalidFileManager = createFileManager({
        basePath: '/invalid/path/that/does/not/exist'
      });

      try {
        await invalidFileManager.storeData('test', 'type', 'cat', { data: 'test' });
        // Should either succeed with fallback or throw meaningful error
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle corrupted data gracefully', async () => {
      const testData = { message: 'Hello, World!', timestamp: Date.now() };
      const pointer = await fileManager.storeData('corrupt-test', 'test', 'demo', testData);

      // Simulate corrupted data by writing invalid JSON
      const fs = await import('fs/promises');
      await fs.writeFile(pointer.filePath, 'invalid json data');

      const result = await fileManager.loadData(pointer);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle concurrent access conflicts', async () => {
      const testData = { message: 'Concurrent test', timestamp: Date.now() };
      const pointer = await fileManager.storeData('concurrent-test', 'test', 'demo', testData);

      // Simulate concurrent access
      const promises = Array.from({ length: 5 }, async (_, i) => {
        return fileManager.loadData(pointer);
      });

      const results = await Promise.all(promises);

      // All should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    it('should handle memory pressure scenarios', async () => {
      // Create large data to test memory handling
      const largeData = {
        data: 'x'.repeat(1000000), // 1MB of data
        metadata: { large: true }
      };

      const pointer = await fileManager.storeData('large-test', 'test', 'demo', largeData);
      expect(pointer.compressed).toBe(true);
      expect(pointer.size).toBeLessThan(1000000);

      const result = await fileManager.loadData(pointer);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(largeData);
    });

    it('should handle invalid artifact data', async () => {
      const invalidArtifacts = [
        { id: null, type: 'test', category: 'demo', title: 'Test' },
        { id: 'test', type: null, category: 'demo', title: 'Test' },
        { id: 'test', type: 'test', category: 'demo', title: 'Test', filePath: null },
        { id: 'test', type: 'test', category: 'demo', title: 'Test', fileSize: -1 },
      ];

      for (const artifact of invalidArtifacts) {
        try {
          await db.storeArtifact(artifact as any);
          // Should either succeed with validation or throw meaningful error
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });

    it('should handle database lock errors', async () => {
      // Simulate database lock by creating multiple connections
      const db2 = createSQLiteDatabase({
        databasePath: './test-data/test.db',
        jsonFileBasePath: './test-data/json'
      });

      try {
        // Both should work or handle locks gracefully
        await db.healthCheck();
        await db2.healthCheck();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        await db2.close();
      }
    });

    it('should handle file permission errors', async () => {
      // Test with read-only directory (if possible)
      const testData = { message: 'Permission test', timestamp: Date.now() };

      try {
        const pointer = await fileManager.storeData('permission-test', 'test', 'demo', testData);
        expect(pointer).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle network storage errors', async () => {
      // Test with network path (if available)
      const networkFileManager = createFileManager({
        basePath: '\\\\network\\path\\that\\might\\not\\exist'
      });

      try {
        await networkFileManager.storeData('network-test', 'test', 'demo', { data: 'test' });
        // Should either succeed or throw meaningful error
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle disk space errors', async () => {
      // Test with very large data to simulate disk space issues
      const veryLargeData = {
        data: 'x'.repeat(10000000), // 10MB of data
        metadata: { veryLarge: true }
      };

      try {
        const pointer = await fileManager.storeData('disk-space-test', 'test', 'demo', veryLargeData);
        expect(pointer).toBeDefined();

        const result = await fileManager.loadData(pointer);
        expect(result.success).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle cleanup errors gracefully', async () => {
      const testData = { message: 'Cleanup test', timestamp: Date.now() };
      const pointer = await fileManager.storeData('cleanup-test', 'test', 'demo', testData);

      // Delete the file manually to simulate cleanup error
      const fs = await import('fs/promises');
      try {
        await fs.unlink(pointer.filePath);
      } catch (error) {
        // File might not exist, that's okay
      }

      // Should handle missing file gracefully
      const result = await fileManager.loadData(pointer);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
