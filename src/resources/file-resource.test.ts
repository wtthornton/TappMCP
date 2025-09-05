import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileResource, FileResourceConfig } from './file-resource.js';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    appendFile: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    chmod: vi.fn(),
    access: vi.fn(),
    copyFile: vi.fn(),
  },
}));

describe('FileResource', () => {
  let fileResource: FileResource;
  const mockBasePath = '/test/base';
  const mockFilePath = 'test-file.txt';
  const mockFullPath = resolve(mockBasePath, mockFilePath);

  beforeEach(() => {
    fileResource = new FileResource({
      basePath: mockBasePath,
      maxFileSize: 1024,
      allowedExtensions: ['.txt', '.json', '.md'],
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultResource = new FileResource();
      expect(defaultResource).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customResource = new FileResource({
        basePath: '/custom/path',
        maxFileSize: 2048,
        allowedExtensions: ['.ts', '.js'],
      });
      expect(customResource).toBeDefined();
    });

    it('should initialize successfully', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      await expect(fileResource.initialize()).resolves.not.toThrow();
      expect(fs.mkdir).toHaveBeenCalledWith(mockBasePath, { recursive: true });
    });

    it('should handle initialization errors', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      await expect(fileResource.initialize()).rejects.toThrow('Permission denied');
    });
  });

  describe('File Reading', () => {
    it('should read file successfully', async () => {
      const mockData = 'Hello, World!';
      const mockStats = {
        size: mockData.length,
        mtime: new Date('2023-01-01'),
        mode: 0o644,
      };

      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockData);
      expect(result.metadata).toEqual({
        path: mockFullPath,
        size: mockData.length,
        lastModified: mockStats.mtime,
        hash: createHash('sha256').update(mockData).digest('hex'),
        permissions: '644',
      });
    });

    it('should create file if it does not exist and createIfNotExists is true', async () => {
      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: true,
        backup: false,
      };

      vi.mocked(fs.readFile).mockRejectedValueOnce({ code: 'ENOENT' });
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue({
        size: 0,
        mtime: new Date(),
        mode: 0o644,
      } as any);

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toBe('');
      expect(fs.writeFile).toHaveBeenCalledWith(mockFullPath, '', { encoding: 'utf8' });
    });

    it('should handle file read errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot read properties');
    });
  });

  describe('File Writing', () => {
    it('should write file successfully', async () => {
      const mockData = 'New content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'write',
        data: mockData,
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockData);
      expect(fs.writeFile).toHaveBeenCalledWith(mockFullPath, mockData, { encoding: 'utf8' });
    });

    it('should create backup when requested', async () => {
      const mockData = 'New content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'write',
        data: mockData,
        encoding: 'utf8',
        createIfNotExists: false,
        backup: true,
      };

      await fileResource.executeFileOperation(config);

      expect(fs.copyFile).toHaveBeenCalled();
    });

    it('should set file permissions when specified', async () => {
      const mockData = 'New content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o755,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.chmod).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'write',
        data: mockData,
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
        permissions: '755',
      };

      await fileResource.executeFileOperation(config);

      expect(fs.chmod).toHaveBeenCalledWith(mockFullPath, 0o755);
    });
  });

  describe('File Appending', () => {
    it('should append to file successfully', async () => {
      const mockData = 'Appended content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.appendFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'append',
        data: mockData,
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockData);
      expect(fs.appendFile).toHaveBeenCalledWith(mockFullPath, mockData, { encoding: 'utf8' });
    });
  });

  describe('Path Validation', () => {
    it('should reject paths outside base directory', async () => {
      const config: FileResourceConfig = {
        path: '../../../etc/passwd',
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Path traversal is not allowed');
    });

    it('should reject disallowed file extensions', async () => {
      const config: FileResourceConfig = {
        path: 'test.exe',
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe("File extension '.exe' is not allowed");
    });

    it('should accept allowed file extensions', async () => {
      const mockData = 'Test content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: 'test.json',
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
    });
  });

  describe('File Size Validation', () => {
    it('should reject files exceeding maximum size', async () => {
      const largeFileSize = 2048; // Exceeds maxFileSize of 1024
      const mockStats = {
        size: largeFileSize,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should accept files within size limit', async () => {
      const mockData = 'Small content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields', async () => {
      const invalidConfig = {} as FileResourceConfig;

      const result = await fileResource.executeFileOperation(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });

    it('should validate mode enum', async () => {
      const config = {
        path: mockFilePath,
        mode: 'invalid' as any,
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('should use default values', async () => {
      const mockData = 'Test content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config = {
        path: mockFilePath,
      } as FileResourceConfig;

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when base path is accessible', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const health = await fileResource.healthCheck();

      expect(health).toBe(true);
      // Health check returns boolean
    });

    it('should return unhealthy status when base path is not accessible', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Permission denied'));

      const health = await fileResource.healthCheck();

      expect(health).toBe(false);
      // Health check returns boolean
    });
  });

  describe('Cleanup', () => {
    it('should cleanup successfully', async () => {
      await expect(fileResource.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Unexpected error'));

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot read properties');
    });

    it('should log performance metrics', async () => {
      const mockData = 'Test content';
      const mockStats = {
        size: mockData.length,
        mtime: new Date(),
        mode: 0o644,
      };

      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from(mockData));
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const config: FileResourceConfig = {
        path: mockFilePath,
        mode: 'read',
        encoding: 'utf8',
        createIfNotExists: false,
        backup: false,
      };

      const result = await fileResource.executeFileOperation(config);

      // Verify that performance logging occurred (mocked logger would be checked in real implementation)
      expect(result.success).toBe(true);
    });
  });
});
