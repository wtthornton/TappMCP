#!/usr/bin/env node

/**
 * File Manager for TappMCP Hybrid Architecture
 *
 * Manages JSON file operations with pointer tracking,
 * file integrity validation, and cleanup utilities.
 */

import { readFile, writeFile, access, mkdir, stat, unlink, readdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { createHash } from 'crypto';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export interface FilePointer {
  filePath: string;
  offset?: number;
  size: number;
  checksum: string;
  compressed: boolean;
  createdAt: Date;
  lastAccessed?: Date;
}

export interface FileManagerConfig {
  basePath: string;
  enableCompression: boolean;
  compressionThreshold: number; // bytes
  enableChecksums: boolean;
  maxFileSize: number; // bytes
  cleanupInterval: number; // milliseconds
}

export interface FileOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  fileSize?: number;
  compressed?: boolean;
  checksum?: string;
}

export class FileManager {
  private config: FileManagerConfig;
  private fileCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(config: Partial<FileManagerConfig> = {}) {
    this.config = {
      basePath: config.basePath || './data/json',
      enableCompression: config.enableCompression ?? true,
      compressionThreshold: config.compressionThreshold ?? 1024, // 1KB
      enableChecksums: config.enableChecksums ?? true,
      maxFileSize: config.maxFileSize ?? 100 * 1024 * 1024, // 100MB
      cleanupInterval: config.cleanupInterval ?? 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };

    this.ensureBaseDirectory();
  }

  /**
   * Ensure base directory exists
   */
  private async ensureBaseDirectory(): Promise<void> {
    try {
      await access(this.config.basePath);
    } catch {
      await mkdir(this.config.basePath, { recursive: true });
      console.log(`✅ Created base directory: ${this.config.basePath}`);
    }
  }

  /**
   * Generate file path for an artifact
   */
  private generateFilePath(id: string, type: string, category: string): string {
    const sanitizedId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedType = type.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9-_]/g, '_');

    const directory = join(this.config.basePath, sanitizedType, sanitizedCategory);
    const filename = `${sanitizedId}.json`;

    return join(directory, filename);
  }

  /**
   * Store data in JSON file with pointer information
   */
  async storeData(
    id: string,
    type: string,
    category: string,
    data: any,
    options: { compress?: boolean; offset?: number } = {}
  ): Promise<FilePointer> {
    try {
      const filePath = this.generateFilePath(id, type, category);

      // Ensure directory exists
      await mkdir(dirname(filePath), { recursive: true });

      // Serialize data
      const serializedData = JSON.stringify(data, null, 2);
      const dataSize = Buffer.byteLength(serializedData, 'utf8');

      // Check file size limit
      if (dataSize > this.config.maxFileSize) {
        throw new Error(`File size ${dataSize} exceeds limit ${this.config.maxFileSize}`);
      }

      // Determine if compression is needed
      const shouldCompress = options.compress ??
        (this.config.enableCompression && dataSize > this.config.compressionThreshold);

      let finalData: Buffer;
      let finalSize: number;
      let compressed = false;

      if (shouldCompress) {
        try {
          const compressedData = await gzipAsync(serializedData);
          finalData = compressedData;
          finalSize = compressedData.length;
          compressed = true;
          console.log(`📦 Compressed data: ${dataSize} -> ${finalSize} bytes (${Math.round((1 - finalSize/dataSize) * 100)}% reduction)`);
        } catch (error) {
          console.warn('Compression failed, storing uncompressed:', error);
          finalData = Buffer.from(serializedData, 'utf8');
          finalSize = dataSize;
          compressed = false;
        }
      } else {
        finalData = Buffer.from(serializedData, 'utf8');
        finalSize = dataSize;
        compressed = false;
      }

      // Calculate checksum
      const checksum = this.config.enableChecksums ?
        createHash('sha256').update(finalData).digest('hex') : '';

      // Write file
      await writeFile(filePath, finalData);

      const pointer: FilePointer = {
        filePath,
        offset: options.offset,
        size: finalSize,
        checksum,
        compressed,
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      console.log(`✅ Data stored: ${id} -> ${filePath} (${finalSize} bytes)`);
      return pointer;

    } catch (error) {
      console.error(`❌ Failed to store data for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Load data from JSON file using pointer
   */
  async loadData(pointer: FilePointer): Promise<FileOperationResult> {
    try {
      // Check cache first
      const cacheKey = `${pointer.filePath}:${pointer.offset}:${pointer.size}`;
      const cached = this.fileCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log(`📋 Cache HIT: ${basename(pointer.filePath)}`);
        return {
          success: true,
          data: cached.data,
          fileSize: pointer.size,
          compressed: pointer.compressed,
          checksum: pointer.checksum
        };
      }

      // Read file
      const fileBuffer = await readFile(pointer.filePath);

      // Extract data based on offset and size
      let dataBuffer: Buffer;
      if (pointer.offset !== undefined) {
        dataBuffer = fileBuffer.subarray(pointer.offset, pointer.offset + pointer.size);
      } else {
        dataBuffer = fileBuffer;
      }

      // Verify checksum if enabled
      if (this.config.enableChecksums && pointer.checksum) {
        const calculatedChecksum = createHash('sha256').update(dataBuffer).digest('hex');
        if (calculatedChecksum !== pointer.checksum) {
          throw new Error(`Checksum mismatch for ${pointer.filePath}`);
        }
      }

      // Decompress if needed
      let jsonData: string;
      if (pointer.compressed) {
        try {
          const decompressed = await gunzipAsync(dataBuffer);
          jsonData = decompressed.toString('utf8');
        } catch (error) {
          throw new Error(`Failed to decompress data from ${pointer.filePath}: ${error}`);
        }
      } else {
        jsonData = dataBuffer.toString('utf8');
      }

      // Parse JSON
      const data = JSON.parse(jsonData);

      // Update cache
      this.fileCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutes
      });

      // Update access time
      pointer.lastAccessed = new Date();

      console.log(`📂 Data loaded: ${basename(pointer.filePath)} (${pointer.size} bytes)`);

      return {
        success: true,
        data,
        fileSize: pointer.size,
        compressed: pointer.compressed,
        checksum: pointer.checksum
      };

    } catch (error) {
      console.error(`❌ Failed to load data from ${pointer.filePath}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete file and return success status
   */
  async deleteFile(pointer: FilePointer): Promise<boolean> {
    try {
      await unlink(pointer.filePath);

      // Remove from cache
      const cacheKey = `${pointer.filePath}:${pointer.offset}:${pointer.size}`;
      this.fileCache.delete(cacheKey);

      console.log(`🗑️ File deleted: ${pointer.filePath}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to delete file ${pointer.filePath}:`, error);
      return false;
    }
  }

  /**
   * Validate file integrity
   */
  async validateFile(pointer: FilePointer): Promise<boolean> {
    try {
      const fileBuffer = await readFile(pointer.filePath);

      // Check file size
      if (fileBuffer.length !== pointer.size) {
        console.warn(`File size mismatch: expected ${pointer.size}, got ${fileBuffer.length}`);
        return false;
      }

      // Check checksum if enabled
      if (this.config.enableChecksums && pointer.checksum) {
        const calculatedChecksum = createHash('sha256').update(fileBuffer).digest('hex');
        if (calculatedChecksum !== pointer.checksum) {
          console.warn(`Checksum mismatch for ${pointer.filePath}`);
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error(`❌ Failed to validate file ${pointer.filePath}:`, error);
      return false;
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath: string): Promise<{
    exists: boolean;
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  } | null> {
    try {
      const stats = await stat(filePath);
      return {
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch {
      return null;
    }
  }

  /**
   * Clean up old files
   */
  async cleanup(olderThanDays: number = 30): Promise<{ deleted: number; errors: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let deleted = 0;
      let errors = 0;

      const processDirectory = async (dirPath: string): Promise<void> => {
        try {
          const entries = await readdir(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
              await processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
              const stats = await stat(fullPath);

              if (stats.mtime < cutoffDate) {
                try {
                  await unlink(fullPath);
                  deleted++;
                  console.log(`🧹 Cleaned up old file: ${fullPath}`);
                } catch (error) {
                  console.error(`❌ Failed to delete ${fullPath}:`, error);
                  errors++;
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Failed to process directory ${dirPath}:`, error);
          errors++;
        }
      };

      await processDirectory(this.config.basePath);

      console.log(`🧹 Cleanup completed: ${deleted} files deleted, ${errors} errors`);
      return { deleted, errors };

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    filesByType: Record<string, number>;
    oldestFile?: Date;
    newestFile?: Date;
  }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;
      const filesByType: Record<string, number> = {};
      let oldestFile: Date | undefined;
      let newestFile: Date | undefined;

      const processDirectory = async (dirPath: string): Promise<void> => {
        try {
          const entries = await readdir(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
              await processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
              const stats = await stat(fullPath);

              totalFiles++;
              totalSize += stats.size;

              // Track by directory (type)
              const type = basename(dirname(fullPath));
              filesByType[type] = (filesByType[type] || 0) + 1;

              // Track oldest and newest
              if (!oldestFile || stats.birthtime < oldestFile) {
                oldestFile = stats.birthtime;
              }
              if (!newestFile || stats.birthtime > newestFile) {
                newestFile = stats.birthtime;
              }
            }
          }
        } catch (error) {
          console.error(`❌ Failed to process directory ${dirPath}:`, error);
        }
      };

      await processDirectory(this.config.basePath);

      return {
        totalFiles,
        totalSize,
        averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
        filesByType,
        oldestFile,
        newestFile
      };

    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * Clear file cache
   */
  clearCache(): void {
    this.fileCache.clear();
    console.log('🧹 File cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.fileCache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp,
      ttl: value.ttl
    }));

    return {
      size: this.fileCache.size,
      entries
    };
  }
}

// Export factory function
export function createFileManager(config?: Partial<FileManagerConfig>): FileManager {
  return new FileManager(config);
}
