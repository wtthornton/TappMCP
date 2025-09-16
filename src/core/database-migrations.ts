#!/usr/bin/env node

/**
 * Database Migrations for TappMCP SQLite Database
 *
 * Handles database schema updates and data migrations
 * for the hybrid SQLite + JSON architecture.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SQLiteDatabase } from './sqlite-database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Migration {
  version: string;
  description: string;
  up: string;
  down?: string;
}

export class DatabaseMigrations {
  private db: SQLiteDatabase;
  private migrationsPath: string;

  constructor(database: SQLiteDatabase) {
    this.db = database;
    this.migrationsPath = join(__dirname, 'migrations');
  }

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const db = this.db.getDatabase();
      const stmt = db.prepare('SELECT version FROM db_version ORDER BY applied_at DESC LIMIT 1');
      const result = stmt.get() as { version: string } | undefined;
      return result?.version || '0.0.0';
    } catch (error) {
      console.warn('No version table found, assuming initial state');
      return '0.0.0';
    }
  }

  /**
   * Get all available migrations
   */
  getAvailableMigrations(): Migration[] {
    const migrations: Migration[] = [];

    // Define migrations inline for now
    // In a real implementation, these would be loaded from files

    migrations.push({
      version: '1.0.0',
      description: 'Initial hybrid SQLite + JSON architecture',
      up: `
        -- This is handled by the main schema file
        -- No additional migration needed for initial version
      `
    });

    migrations.push({
      version: '1.1.0',
      description: 'Add performance indexes and views',
      up: `
        -- Add performance indexes
        CREATE INDEX IF NOT EXISTS idx_artifacts_access_count ON artifacts(access_count DESC);
        CREATE INDEX IF NOT EXISTS idx_artifacts_file_size ON artifacts(file_size);

        -- Add performance view
        CREATE VIEW IF NOT EXISTS high_priority_artifacts AS
        SELECT * FROM artifacts
        WHERE priority > 5
        ORDER BY priority DESC, last_accessed DESC;
      `,
      down: `
        DROP VIEW IF EXISTS high_priority_artifacts;
        DROP INDEX IF EXISTS idx_artifacts_access_count;
        DROP INDEX IF EXISTS idx_artifacts_file_size;
      `
    });

    migrations.push({
      version: '1.2.0',
      description: 'Add cache statistics and analytics tables',
      up: `
        -- Add cache statistics table
        CREATE TABLE IF NOT EXISTS cache_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          hit_rate REAL,
          miss_rate REAL,
          total_requests INTEGER,
          memory_usage INTEGER,
          cache_size INTEGER,
          average_response_time REAL
        );

        CREATE INDEX IF NOT EXISTS idx_cache_stats_timestamp ON cache_stats(timestamp DESC);

        -- Add data collection table
        CREATE TABLE IF NOT EXISTS data_collection (
          id TEXT PRIMARY KEY,
          collection_type TEXT NOT NULL,
          data JSON NOT NULL,
          collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed BOOLEAN DEFAULT 0,
          insights JSON
        );

        CREATE INDEX IF NOT EXISTS idx_data_type ON data_collection(collection_type);
        CREATE INDEX IF NOT EXISTS idx_data_collected_at ON data_collection(collected_at DESC);
      `,
      down: `
        DROP TABLE IF EXISTS data_collection;
        DROP TABLE IF EXISTS cache_stats;
      `
    });

    return migrations;
  }

  /**
   * Run migrations up to target version
   */
  async migrate(targetVersion?: string): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const availableMigrations = this.getAvailableMigrations();

      console.log(`🔄 Current database version: ${currentVersion}`);

      // Filter migrations that need to be applied
      const migrationsToApply = availableMigrations.filter(migration => {
        if (targetVersion && migration.version > targetVersion) {
          return false;
        }
        return this.compareVersions(migration.version, currentVersion) > 0;
      });

      if (migrationsToApply.length === 0) {
        console.log('✅ Database is up to date');
        return;
      }

      console.log(`🔄 Applying ${migrationsToApply.length} migrations...`);

      const db = this.db.getDatabase();

      for (const migration of migrationsToApply) {
        console.log(`🔄 Applying migration ${migration.version}: ${migration.description}`);

        db.exec('BEGIN TRANSACTION;');

        try {
          // Execute migration
          if (migration.up.trim()) {
            const statements = migration.up.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
              if (statement.trim()) {
                db.exec(statement.trim());
              }
            }
          }

          // Record migration
          const stmt = db.prepare(`
            INSERT INTO db_version (version, description)
            VALUES (?, ?)
          `);
          stmt.run(migration.version, migration.description);

          db.exec('COMMIT;');
          console.log(`✅ Migration ${migration.version} applied successfully`);

        } catch (error) {
          db.exec('ROLLBACK;');
          console.error(`❌ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      const newVersion = await this.getCurrentVersion();
      console.log(`✅ Database migrated to version: ${newVersion}`);

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollback(targetVersion: string): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const availableMigrations = this.getAvailableMigrations();

      console.log(`🔄 Rolling back from ${currentVersion} to ${targetVersion}`);

      // Filter migrations that need to be rolled back
      const migrationsToRollback = availableMigrations
        .filter(migration =>
          this.compareVersions(migration.version, targetVersion) > 0 &&
          this.compareVersions(migration.version, currentVersion) <= 0
        )
        .reverse(); // Apply in reverse order

      if (migrationsToRollback.length === 0) {
        console.log('✅ No migrations to rollback');
        return;
      }

      console.log(`🔄 Rolling back ${migrationsToRollback.length} migrations...`);

      const db = this.db.getDatabase();

      for (const migration of migrationsToRollback) {
        console.log(`🔄 Rolling back migration ${migration.version}: ${migration.description}`);

        db.exec('BEGIN TRANSACTION;');

        try {
          // Execute rollback
          if (migration.down && migration.down.trim()) {
            const statements = migration.down.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
              if (statement.trim()) {
                db.exec(statement.trim());
              }
            }
          }

          // Remove migration record
          const stmt = db.prepare('DELETE FROM db_version WHERE version = ?');
          stmt.run(migration.version);

          db.exec('COMMIT;');
          console.log(`✅ Migration ${migration.version} rolled back successfully`);

        } catch (error) {
          db.exec('ROLLBACK;');
          console.error(`❌ Rollback of migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      const newVersion = await this.getCurrentVersion();
      console.log(`✅ Database rolled back to version: ${newVersion}`);

    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Compare version strings
   */
  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);

    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }

    return 0;
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<Array<{ version: string; description: string; applied_at: string }>> {
    try {
      const db = this.db.getDatabase();
      const stmt = db.prepare(`
        SELECT version, description, applied_at
        FROM db_version
        ORDER BY applied_at ASC
      `);
      const results = stmt.all() as Array<{ version: string; description: string; applied_at: string }>;

      return results;
    } catch (error) {
      console.error('❌ Failed to get migration history:', error);
      return [];
    }
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const availableMigrations = this.getAvailableMigrations();

      return availableMigrations.some(migration =>
        this.compareVersions(migration.version, currentVersion) > 0
      );
    } catch (error) {
      console.error('❌ Failed to check migration status:', error);
      return false;
    }
  }
}

// Export factory function
export function createDatabaseMigrations(database: SQLiteDatabase): DatabaseMigrations {
  return new DatabaseMigrations(database);
}
