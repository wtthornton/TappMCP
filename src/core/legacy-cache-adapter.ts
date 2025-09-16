#!/usr/bin/env node

/**
 * Legacy Cache Adapter for TappMCP Hybrid Architecture
 *
 * Provides backward compatibility with existing JSON-based cache system
 * while gradually migrating to the new hybrid SQLite + JSON architecture.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';

export interface LegacyCacheConfig {
  legacyCachePath: string;
  migrationEnabled: boolean;
  fallbackEnabled: boolean;
  autoMigration: boolean;
  migrationBatchSize: number;
}

export interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

export interface LegacyCacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, any>;
}

export class LegacyCacheAdapter {
  private config: LegacyCacheConfig;
  private db: SQLiteDatabase;
  private fileManager: FileManager;
  private metadataAPI: ArtifactMetadataAPI;
  private migrationInProgress = false;

  constructor(
    database: SQLiteDatabase,
    fileManager: FileManager,
    metadataAPI: ArtifactMetadataAPI,
    config: Partial<LegacyCacheConfig> = {}
  ) {
    this.db = database;
    this.fileManager = fileManager;
    this.metadataAPI = metadataAPI;

    this.config = {
      legacyCachePath: config.legacyCachePath || './cache/context7-cache.json',
      migrationEnabled: config.migrationEnabled ?? true,
      fallbackEnabled: config.fallbackEnabled ?? true,
      autoMigration: config.autoMigration ?? false,
      migrationBatchSize: config.migrationBatchSize ?? 100,
      ...config
    };

    this.ensureLegacyCacheDirectory();
  }

  /**
   * Ensure legacy cache directory exists
   */
  private ensureLegacyCacheDirectory(): void {
    const cacheDir = dirname(this.config.legacyCachePath);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
      console.log(`✅ Created legacy cache directory: ${cacheDir}`);
    }
  }

  /**
   * Check if legacy cache file exists
   */
  private legacyCacheExists(): boolean {
    return existsSync(this.config.legacyCachePath);
  }

  /**
   * Load legacy cache data
   */
  private loadLegacyCache(): Record<string, any> {
    if (!this.legacyCacheExists()) {
      return {};
    }

    try {
      const data = readFileSync(this.config.legacyCachePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load legacy cache:', error);
      return {};
    }
  }

  /**
   * Save legacy cache data
   */
  private saveLegacyCache(data: Record<string, any>): void {
    try {
      writeFileSync(this.config.legacyCachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Failed to save legacy cache:', error);
    }
  }

  /**
   * Get data from legacy cache with fallback to new system
   */
  async get(key: string): Promise<any> {
    try {
      // First try the new hybrid system
      try {
        const artifact = await this.metadataAPI.getArtifact(key);
        if (artifact) {
          const data = await this.metadataAPI.getArtifactData(key);
          console.log(`✅ Retrieved from hybrid system: ${key}`);
          return data;
        }
      } catch (error) {
        console.warn(`⚠️ Hybrid system failed for ${key}:`, error);
      }

      // Fallback to legacy cache if enabled
      if (this.config.fallbackEnabled) {
        const legacyCache = this.loadLegacyCache();
        if (legacyCache[key]) {
          const entry = legacyCache[key] as LegacyCacheEntry;

          // Check if entry is expired
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            console.log(`⏰ Legacy cache entry expired: ${key}`);
            delete legacyCache[key];
            this.saveLegacyCache(legacyCache);
            return null;
          }

          console.log(`✅ Retrieved from legacy cache: ${key}`);

          // Auto-migrate if enabled
          if (this.config.autoMigration) {
            this.migrateEntry(key, entry).catch(error =>
              console.warn(`⚠️ Auto-migration failed for ${key}:`, error)
            );
          }

          return entry.data;
        }
      }

      console.log(`❌ Data not found: ${key}`);
      return null;

    } catch (error) {
      console.error(`❌ Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in both systems
   */
  async set(key: string, data: any, options: {
    ttl?: number;
    metadata?: Record<string, any>;
    type?: string;
    category?: string;
    tags?: string[];
  } = {}): Promise<void> {
    try {
      // Store in new hybrid system
      await this.metadataAPI.createArtifact({
        id: key,
        type: options.type || 'legacy-cache',
        category: options.category || 'cache',
        title: `Legacy Cache Entry: ${key}`,
        data,
        metadata: {
          ...options.metadata,
          legacy: true,
          originalTtl: options.ttl
        },
        tags: options.tags || ['legacy', 'cache'],
        compress: true
      });

      console.log(`✅ Stored in hybrid system: ${key}`);

      // Also store in legacy cache for backward compatibility
      const legacyCache = this.loadLegacyCache();
      legacyCache[key] = {
        key,
        data,
        timestamp: Date.now(),
        ttl: options.ttl,
        metadata: options.metadata
      };
      this.saveLegacyCache(legacyCache);

      console.log(`✅ Stored in legacy cache: ${key}`);

    } catch (error) {
      console.error(`❌ Failed to set ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete data from both systems
   */
  async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;

      // Delete from new hybrid system
      try {
        const success = await this.metadataAPI.deleteArtifact(key);
        if (success) {
          deleted = true;
          console.log(`✅ Deleted from hybrid system: ${key}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to delete from hybrid system ${key}:`, error);
      }

      // Delete from legacy cache
      const legacyCache = this.loadLegacyCache();
      if (legacyCache[key]) {
        delete legacyCache[key];
        this.saveLegacyCache(legacyCache);
        deleted = true;
        console.log(`✅ Deleted from legacy cache: ${key}`);
      }

      return deleted;

    } catch (error) {
      console.error(`❌ Failed to delete ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear both cache systems
   */
  async clear(): Promise<void> {
    try {
      // Clear legacy cache
      this.saveLegacyCache({});
      console.log('✅ Legacy cache cleared');

      // Clear hybrid system (this would need to be implemented in the API)
      console.log('⚠️ Hybrid system clear not implemented - would need to delete all artifacts');

    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
      throw error;
    }
  }

  /**
   * Migrate a single entry from legacy to hybrid system
   */
  private async migrateEntry(key: string, entry: LegacyCacheEntry): Promise<void> {
    try {
      // Determine type and category from key or metadata
      const type = this.determineType(key, entry);
      const category = this.determineCategory(key, entry);
      const tags = this.determineTags(key, entry);

      await this.metadataAPI.createArtifact({
        id: key,
        type,
        category,
        title: `Migrated: ${key}`,
        description: `Migrated from legacy cache at ${new Date(entry.timestamp).toISOString()}`,
        data: entry.data,
        metadata: {
          ...entry.metadata,
          migrated: true,
          originalTimestamp: entry.timestamp,
          originalTtl: entry.ttl
        },
        tags,
        compress: true
      });

      console.log(`✅ Migrated entry: ${key}`);

    } catch (error) {
      console.error(`❌ Failed to migrate entry ${key}:`, error);
      throw error;
    }
  }

  /**
   * Migrate all legacy cache entries to hybrid system
   */
  async migrateAll(): Promise<MigrationResult> {
    if (this.migrationInProgress) {
      throw new Error('Migration already in progress');
    }

    this.migrationInProgress = true;
    const result: MigrationResult = {
      success: false,
      migrated: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    try {
      console.log('🔄 Starting legacy cache migration...');

      const legacyCache = this.loadLegacyCache();
      const entries = Object.entries(legacyCache);

      if (entries.length === 0) {
        console.log('✅ No legacy cache entries to migrate');
        result.success = true;
        return result;
      }

      console.log(`📦 Found ${entries.length} legacy cache entries`);

      // Process in batches
      for (let i = 0; i < entries.length; i += this.config.migrationBatchSize) {
        const batch = entries.slice(i, i + this.config.migrationBatchSize);

        for (const [key, entry] of batch) {
          try {
            await this.migrateEntry(key, entry as LegacyCacheEntry);
            result.migrated++;

            // Remove from legacy cache after successful migration
            delete legacyCache[key];

          } catch (error) {
            result.failed++;
            result.errors.push(`${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Save updated legacy cache after each batch
        this.saveLegacyCache(legacyCache);

        console.log(`📦 Processed batch ${Math.floor(i / this.config.migrationBatchSize) + 1}: ${result.migrated} migrated, ${result.failed} failed`);
      }

      result.success = result.failed === 0;

      if (result.success) {
        console.log(`✅ Migration completed successfully: ${result.migrated} entries migrated`);
      } else {
        console.log(`⚠️ Migration completed with errors: ${result.migrated} migrated, ${result.failed} failed`);
      }

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Migration failed:', error);
    } finally {
      this.migrationInProgress = false;
    }

    return result;
  }

  /**
   * Detect migration status
   */
  async detectMigrationStatus(): Promise<{
    needsMigration: boolean;
    legacyEntries: number;
    hybridEntries: number;
    migrationProgress: number;
  }> {
    try {
      const legacyCache = this.loadLegacyCache();
      const legacyEntries = Object.keys(legacyCache).length;

      const hybridStats = await this.metadataAPI.getArtifactStats();
      const hybridEntries = hybridStats.totalArtifacts;

      const needsMigration = legacyEntries > 0;
      const migrationProgress = legacyEntries === 0 ? 100 :
        Math.round((hybridEntries / (legacyEntries + hybridEntries)) * 100);

      return {
        needsMigration,
        legacyEntries,
        hybridEntries,
        migrationProgress
      };

    } catch (error) {
      console.error('❌ Failed to detect migration status:', error);
      return {
        needsMigration: false,
        legacyEntries: 0,
        hybridEntries: 0,
        migrationProgress: 0
      };
    }
  }

  /**
   * Determine artifact type from key and entry
   */
  private determineType(key: string, entry: LegacyCacheEntry): string {
    // Check metadata first
    if (entry.metadata?.type) {
      return entry.metadata.type;
    }

    // Infer from key patterns
    if (key.includes('context7')) return 'context7';
    if (key.includes('user')) return 'user_prefs';
    if (key.includes('metrics')) return 'metrics';
    if (key.includes('template')) return 'templates';

    return 'legacy-cache';
  }

  /**
   * Determine artifact category from key and entry
   */
  private determineCategory(key: string, entry: LegacyCacheEntry): string {
    // Check metadata first
    if (entry.metadata?.category) {
      return entry.metadata.category;
    }

    // Infer from key patterns
    if (key.includes('knowledge')) return 'knowledge';
    if (key.includes('preferences')) return 'preferences';
    if (key.includes('analytics')) return 'analytics';

    return 'cache';
  }

  /**
   * Determine artifact tags from key and entry
   */
  private determineTags(key: string, entry: LegacyCacheEntry): string[] {
    const tags: string[] = ['legacy', 'migrated'];

    // Add tags from metadata
    if (entry.metadata?.tags && Array.isArray(entry.metadata.tags)) {
      tags.push(...entry.metadata.tags);
    }

    // Infer tags from key patterns
    if (key.includes('context7')) tags.push('context7');
    if (key.includes('user')) tags.push('user');
    if (key.includes('metrics')) tags.push('metrics');
    if (key.includes('template')) tags.push('template');

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Health check for both systems
   */
  async healthCheck(): Promise<{
    status: string;
    details: {
      hybrid: any;
      legacy: {
        exists: boolean;
        entries: number;
      };
      migration: {
        inProgress: boolean;
        needsMigration: boolean;
        progress: number;
      };
    };
  }> {
    try {
      const hybridHealth = await this.metadataAPI.healthCheck();
      const legacyExists = this.legacyCacheExists();
      const legacyEntries = legacyExists ? Object.keys(this.loadLegacyCache()).length : 0;
      const migrationStatus = await this.detectMigrationStatus();

      const status = hybridHealth.status === 'healthy' ? 'healthy' : 'degraded';

      return {
        status,
        details: {
          hybrid: hybridHealth.details,
          legacy: {
            exists: legacyExists,
            entries: legacyEntries
          },
          migration: {
            inProgress: this.migrationInProgress,
            needsMigration: migrationStatus.needsMigration,
            progress: migrationStatus.migrationProgress
          }
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          hybrid: { error: 'Failed to check hybrid system' },
          legacy: { exists: false, entries: 0 },
          migration: { inProgress: false, needsMigration: false, progress: 0 }
        }
      };
    }
  }
}

// Export factory function
export function createLegacyCacheAdapter(
  database: SQLiteDatabase,
  fileManager: FileManager,
  metadataAPI: ArtifactMetadataAPI,
  config?: Partial<LegacyCacheConfig>
): LegacyCacheAdapter {
  return new LegacyCacheAdapter(database, fileManager, metadataAPI, config);
}
