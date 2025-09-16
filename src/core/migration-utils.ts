#!/usr/bin/env node

/**
 * Migration Utilities for TappMCP Hybrid Architecture
 *
 * Utilities for migrating data from existing systems to the new
 * hybrid SQLite + JSON architecture.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';

export interface MigrationPlan {
  totalFiles: number;
  totalSize: number;
  estimatedTime: number; // milliseconds
  filesByType: Record<string, number>;
  recommendations: string[];
}

export interface MigrationProgress {
  processed: number;
  total: number;
  successful: number;
  failed: number;
  currentFile: string;
  startTime: number;
  estimatedCompletion: number;
}

export interface MigrationResult {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export class MigrationUtils {
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;

  constructor(database: SQLiteDatabase, fileManager: FileManager, metadataAPI: ArtifactMetadataAPI) {
    this.db = database;
    this.fileManager = fileManager;
    this.metadataAPI = metadataAPI;
  }

  /**
   * Analyze existing cache directory for migration planning
   */
  async analyzeCacheDirectory(cachePath: string): Promise<MigrationPlan> {
    const plan: MigrationPlan = {
      totalFiles: 0,
      totalSize: 0,
      estimatedTime: 0,
      filesByType: {},
      recommendations: []
    };

    try {
      if (!existsSync(cachePath)) {
        plan.recommendations.push(`Cache directory does not exist: ${cachePath}`);
        return plan;
      }

      const files = this.getAllFiles(cachePath);

      for (const filePath of files) {
        try {
          const stats = statSync(filePath);
          const fileType = this.determineFileType(filePath);

          plan.totalFiles++;
          plan.totalSize += stats.size;

          plan.filesByType[fileType] = (plan.filesByType[fileType] || 0) + 1;

        } catch (error) {
          console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
        }
      }

      // Estimate migration time (rough calculation)
      plan.estimatedTime = Math.max(plan.totalFiles * 100, 5000); // 100ms per file, minimum 5s

      // Generate recommendations
      if (plan.totalFiles > 1000) {
        plan.recommendations.push('Large number of files detected - consider batch migration');
      }

      if (plan.totalSize > 100 * 1024 * 1024) { // 100MB
        plan.recommendations.push('Large total size - ensure sufficient disk space');
      }

      const jsonFiles = plan.filesByType['json'] || 0;
      if (jsonFiles > 0) {
        plan.recommendations.push(`${jsonFiles} JSON files detected - will be migrated with metadata`);
      }

      console.log(`📊 Migration analysis complete: ${plan.totalFiles} files, ${this.formatBytes(plan.totalSize)}`);

    } catch (error) {
      console.error('❌ Failed to analyze cache directory:', error);
      plan.recommendations.push(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return plan;
  }

  /**
   * Migrate Context7 cache file to hybrid system
   */
  async migrateContext7Cache(cacheFilePath: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: [],
      duration: 0
    };

    const startTime = Date.now();

    try {
      console.log(`🔄 Starting Context7 cache migration: ${cacheFilePath}`);

      if (!existsSync(cacheFilePath)) {
        result.errors.push(`Cache file not found: ${cacheFilePath}`);
        return result;
      }

      const cacheData = JSON.parse(readFileSync(cacheFilePath, 'utf8'));

      if (typeof cacheData !== 'object' || cacheData === null) {
        result.errors.push('Invalid cache file format');
        return result;
      }

      const entries = Object.entries(cacheData);
      result.processed = entries.length;

      console.log(`📦 Found ${entries.length} cache entries to migrate`);

      for (const [key, value] of entries) {
        try {
          await this.migrateContext7Entry(key, value);
          result.successful++;

          if (result.successful % 100 === 0) {
            console.log(`📦 Migrated ${result.successful}/${result.processed} entries`);
          }

        } catch (error) {
          result.failed++;
          result.errors.push(`${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failed === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ Context7 migration completed: ${result.successful} successful, ${result.failed} failed`);

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.duration = Date.now() - startTime;
      console.error('❌ Context7 cache migration failed:', error);
    }

    return result;
  }

  /**
   * Migrate a single Context7 cache entry
   */
  private async migrateContext7Entry(key: string, entry: any): Promise<void> {
    try {
      // Extract data from Context7 cache entry
      const data = entry.data || entry;
      const metadata = {
        source: 'context7',
        migrated: true,
        originalKey: key,
        timestamp: entry.timestamp || Date.now(),
        ttl: entry.ttl,
        hitCount: entry.hitCount || 0
      };

      // Determine type and category
      const type = this.determineContext7Type(key, data);
      const category = this.determineContext7Category(key, data);
      const tags = this.determineContext7Tags(key, data);

      // Create artifact in hybrid system
      await this.metadataAPI.createArtifact({
        id: key,
        type,
        category,
        title: this.generateTitle(key, data),
        description: this.generateDescription(data),
        data,
        metadata,
        tags,
        compress: true
      });

    } catch (error) {
      console.error(`❌ Failed to migrate Context7 entry ${key}:`, error);
      throw error;
    }
  }

  /**
   * Migrate JSON files from directory
   */
  async migrateJsonFiles(directoryPath: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      warnings: [],
      duration: 0
    };

    const startTime = Date.now();

    try {
      console.log(`🔄 Starting JSON files migration: ${directoryPath}`);

      const jsonFiles = this.getJsonFiles(directoryPath);
      result.processed = jsonFiles.length;

      console.log(`📦 Found ${jsonFiles.length} JSON files to migrate`);

      for (const filePath of jsonFiles) {
        try {
          await this.migrateJsonFile(filePath);
          result.successful++;

          if (result.successful % 50 === 0) {
            console.log(`📦 Migrated ${result.successful}/${result.processed} files`);
          }

        } catch (error) {
          result.failed++;
          result.errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failed === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ JSON files migration completed: ${result.successful} successful, ${result.failed} failed`);

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.duration = Date.now() - startTime;
      console.error('❌ JSON files migration failed:', error);
    }

    return result;
  }

  /**
   * Migrate a single JSON file
   */
  private async migrateJsonFile(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      const fileName = basename(filePath, '.json');

      const metadata = {
        source: 'json-file',
        migrated: true,
        originalPath: filePath,
        fileSize: statSync(filePath).size
      };

      // Determine type and category from file path
      const type = this.determineTypeFromPath(filePath);
      const category = this.determineCategoryFromPath(filePath);
      const tags = this.determineTagsFromPath(filePath);

      // Create artifact in hybrid system
      await this.metadataAPI.createArtifact({
        id: fileName,
        type,
        category,
        title: this.generateTitleFromFileName(fileName),
        description: `Migrated from JSON file: ${filePath}`,
        data,
        metadata,
        tags,
        compress: true
      });

    } catch (error) {
      console.error(`❌ Failed to migrate JSON file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get all files in directory recursively
   */
  private getAllFiles(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to read directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * Get JSON files from directory
   */
  private getJsonFiles(dirPath: string): string[] {
    return this.getAllFiles(dirPath).filter(file => extname(file) === '.json');
  }

  /**
   * Determine file type from file path
   */
  private determineFileType(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    return ext.slice(1) || 'unknown';
  }

  /**
   * Determine Context7 type from key and data
   */
  private determineContext7Type(key: string, data: any): string {
    if (key.includes('knowledge')) return 'context7';
    if (key.includes('user')) return 'user_prefs';
    if (key.includes('metrics')) return 'metrics';

    if (data && typeof data === 'object') {
      if (data.source === 'context7') return 'context7';
      if (data.type) return data.type;
    }

    return 'context7';
  }

  /**
   * Determine Context7 category from key and data
   */
  private determineContext7Category(key: string, data: any): string {
    if (key.includes('knowledge')) return 'knowledge';
    if (key.includes('preferences')) return 'preferences';
    if (key.includes('analytics')) return 'analytics';

    if (data && typeof data === 'object') {
      if (data.category) return data.category;
      if (data.domain) return data.domain;
    }

    return 'knowledge';
  }

  /**
   * Determine Context7 tags from key and data
   */
  private determineContext7Tags(key: string, data: any): string[] {
    const tags: string[] = ['context7', 'migrated'];

    // Add tags from data
    if (data && typeof data === 'object') {
      if (data.tags && Array.isArray(data.tags)) {
        tags.push(...data.tags);
      }
      if (data.domain) tags.push(data.domain);
      if (data.type) tags.push(data.type);
    }

    // Add tags from key
    if (key.includes('typescript')) tags.push('typescript');
    if (key.includes('react')) tags.push('react');
    if (key.includes('node')) tags.push('node');
    if (key.includes('api')) tags.push('api');

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Determine type from file path
   */
  private determineTypeFromPath(filePath: string): string {
    if (filePath.includes('user')) return 'user_prefs';
    if (filePath.includes('metrics')) return 'metrics';
    if (filePath.includes('template')) return 'templates';
    if (filePath.includes('config')) return 'config';

    return 'migrated';
  }

  /**
   * Determine category from file path
   */
  private determineCategoryFromPath(filePath: string): string {
    if (filePath.includes('knowledge')) return 'knowledge';
    if (filePath.includes('preferences')) return 'preferences';
    if (filePath.includes('analytics')) return 'analytics';
    if (filePath.includes('config')) return 'config';

    return 'migrated';
  }

  /**
   * Determine tags from file path
   */
  private determineTagsFromPath(filePath: string): string[] {
    const tags: string[] = ['migrated', 'json-file'];

    if (filePath.includes('user')) tags.push('user');
    if (filePath.includes('metrics')) tags.push('metrics');
    if (filePath.includes('template')) tags.push('template');
    if (filePath.includes('config')) tags.push('config');

    return [...new Set(tags)];
  }

  /**
   * Generate title from key and data
   */
  private generateTitle(key: string, data: any): string {
    if (data && typeof data === 'object') {
      if (data.title) return data.title;
      if (data.name) return data.name;
    }

    return key.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate title from file name
   */
  private generateTitleFromFileName(fileName: string): string {
    return fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate description from data
   */
  private generateDescription(data: any): string {
    if (data && typeof data === 'object') {
      if (data.description) return data.description;
      if (data.content && typeof data.content === 'string') {
        return data.content.substring(0, 200) + (data.content.length > 200 ? '...' : '');
      }
    }

    return 'Migrated data';
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate migration results
   */
  async validateMigration(): Promise<{
    success: boolean;
    totalArtifacts: number;
    totalSize: number;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const stats = await this.metadataAPI.getArtifactStats();

      return {
        success: true,
        totalArtifacts: stats.totalArtifacts,
        totalSize: stats.totalFileSize,
        errors: [],
        warnings: stats.totalArtifacts === 0 ? ['No artifacts found after migration'] : []
      };

    } catch (error) {
      return {
        success: false,
        totalArtifacts: 0,
        totalSize: 0,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }
}

// Export factory function
export function createMigrationUtils(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI
): MigrationUtils {
  return new MigrationUtils(database, fileManager, metadataAPI);
}
