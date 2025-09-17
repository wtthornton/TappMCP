#!/usr/bin/env node

/**
 * SQLite Database Manager for TappMCP Hybrid Architecture
 *
 * Manages SQLite database operations for metadata storage
 * while keeping actual data in JSON files with pointers.
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ArtifactData {
  id: string;
  type: string;
  category: string;
  title: string;
  filePath: string;
  fileOffset?: number;
  fileSize: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed?: Date;
  priority: number;
  tags: string[];
  compressed: boolean;
  checksum?: string;
}

export interface SearchQuery {
  type?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'priority' | 'last_accessed' | 'created_at' | 'access_count';
  orderDirection?: 'ASC' | 'DESC';
}

export interface DatabaseConfig {
  databasePath: string;
  jsonFileBasePath: string;
  enableCompression: boolean;
  enableAnalytics: boolean;
  cacheSize: number;
}

export class SQLiteDatabase {
  private db!: Database.Database;
  private config: DatabaseConfig;
  private isConnected = false;

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      databasePath: config.databasePath || './data/sqlite/tappmcp.db',
      jsonFileBasePath: config.jsonFileBasePath || './data/json',
      enableCompression: config.enableCompression ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      cacheSize: config.cacheSize ?? 64000, // 64MB
      ...config
    };

    // Ensure directories exist
    this.ensureDirectories();

    // Initialize database connection
    this.initializeDatabase();
  }

  private ensureDirectories(): void {
    const dbDir = dirname(this.config.databasePath);
    const jsonDir = this.config.jsonFileBasePath;

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    if (!existsSync(jsonDir)) {
      mkdirSync(jsonDir, { recursive: true });
    }
  }

  private initializeDatabase(): void {
    try {
      // Create database connection
      this.db = new Database(this.config.databasePath);

      // Configure SQLite for optimal performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma(`cache_size = -${this.config.cacheSize}`);
      this.db.pragma('temp_store = MEMORY');
      this.db.pragma('mmap_size = 268435456'); // 256MB

      // Load and execute schema
      this.loadSchema();

      this.isConnected = true;
      console.log(`✅ SQLite database initialized: ${this.config.databasePath}`);

    } catch (error) {
      console.error('❌ Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private loadSchema(): void {
    try {
      const schemaPath = join(__dirname, 'database-schema.sql');
      if (existsSync(schemaPath)) {
        const schema = readFileSync(schemaPath, 'utf8');

        // Split schema into PRAGMA statements and other statements
        const statements = schema.split(';').filter(stmt => stmt.trim());
        const pragmaStatements: string[] = [];
        const otherStatements: string[] = [];

        for (const statement of statements) {
          const trimmed = statement.trim();
          if (trimmed.toUpperCase().startsWith('PRAGMA')) {
            pragmaStatements.push(trimmed);
          } else if (trimmed) {
            otherStatements.push(trimmed);
          }
        }

        // Execute PRAGMA statements first (outside transaction)
        for (const pragma of pragmaStatements) {
          this.db.exec(pragma);
        }

        // Execute other statements in transaction
        if (otherStatements.length > 0) {
          this.db.exec('BEGIN TRANSACTION;');
          for (const statement of otherStatements) {
            this.db.exec(statement);
          }
          this.db.exec('COMMIT;');
        }

        console.log('✅ Database schema loaded successfully');
      } else {
        console.warn('⚠️ Schema file not found, creating basic tables');
        this.createBasicTables();
      }
    } catch (error) {
      console.error('❌ Failed to load database schema:', error);
      try {
        this.db.exec('ROLLBACK;');
      } catch (rollbackError) {
        // Ignore rollback errors
      }
      throw error;
    }
  }

  private createBasicTables(): void {
    const basicSchema = `
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_offset INTEGER,
        file_size INTEGER,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME,
        priority INTEGER DEFAULT 0,
        tags TEXT,
        compressed BOOLEAN DEFAULT 0,
        checksum TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
      CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
      CREATE INDEX IF NOT EXISTS idx_artifacts_priority ON artifacts(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_artifacts_last_accessed ON artifacts(last_accessed DESC);
    `;

    this.db.exec(basicSchema);
  }

  /**
   * Store artifact metadata in database
   */
  async storeArtifact(artifact: Omit<ArtifactData, 'createdAt' | 'updatedAt' | 'accessCount'>): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const now = new Date();
      const artifactData: ArtifactData = {
        ...artifact,
        createdAt: now,
        updatedAt: now,
        accessCount: 0,
        lastAccessed: now
      };

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO artifacts (
          id, type, category, title, file_path, file_offset, file_size,
          metadata, created_at, updated_at, access_count, last_accessed,
          priority, tags, compressed, checksum
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        artifactData.id,
        artifactData.type,
        artifactData.category,
        artifactData.title,
        artifactData.filePath,
        artifactData.fileOffset || null,
        artifactData.fileSize,
        JSON.stringify(artifactData.metadata || {}),
        artifactData.createdAt.toISOString(),
        artifactData.updatedAt.toISOString(),
        artifactData.accessCount,
        artifactData.lastAccessed?.toISOString() || null,
        artifactData.priority,
        artifactData.tags.join(','),
        artifactData.compressed ? 1 : 0,
        artifactData.checksum || null
      );

      console.log(`✅ Artifact stored: ${artifactData.id}`);
      return artifactData.id;

    } catch (error) {
      console.error('❌ Failed to store artifact:', error);
      throw error;
    }
  }

  /**
   * Get artifact metadata from database
   */
  async getArtifact(id: string): Promise<ArtifactData | null> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM artifacts WHERE id = ?
      `);

      const row = stmt.get(id) as any;

      if (!row) {
        return null;
      }

      // Update access count and last accessed
      this.updateAccessTracking(id);

      return {
        id: row.id,
        type: row.type,
        category: row.category,
        title: row.title,
        filePath: row.file_path,
        fileOffset: row.file_offset,
        fileSize: row.file_size,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        accessCount: row.access_count,
        lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
        priority: row.priority,
        tags: row.tags ? row.tags.split(',') : [],
        compressed: Boolean(row.compressed),
        checksum: row.checksum
      };

    } catch (error) {
      console.error(`❌ Failed to get artifact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search artifacts with filters
   */
  async searchArtifacts(query: SearchQuery): Promise<ArtifactData[]> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      let sql = 'SELECT * FROM artifacts WHERE 1=1';
      const params: any[] = [];

      // Add filters
      if (query.type) {
        sql += ' AND type = ?';
        params.push(query.type);
      }

      if (query.category) {
        sql += ' AND category = ?';
        params.push(query.category);
      }

      if (query.tags && query.tags.length > 0) {
        const tagConditions = query.tags.map(() => 'tags LIKE ?').join(' OR ');
        sql += ` AND (${tagConditions})`;
        query.tags.forEach(tag => params.push(`%${tag}%`));
      }

      // Add ordering
      const orderBy = query.orderBy || 'priority';
      const orderDirection = query.orderDirection || 'DESC';
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;

      // Add pagination
      if (query.limit) {
        sql += ' LIMIT ?';
        params.push(query.limit);
      }

      if (query.offset) {
        sql += ' OFFSET ?';
        params.push(query.offset);
      }

      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        type: row.type,
        category: row.category,
        title: row.title,
        filePath: row.file_path,
        fileOffset: row.file_offset,
        fileSize: row.file_size,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        accessCount: row.access_count,
        lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
        priority: row.priority,
        tags: row.tags ? row.tags.split(',') : [],
        compressed: Boolean(row.compressed),
        checksum: row.checksum
      }));

    } catch (error) {
      console.error('❌ Failed to search artifacts:', error);
      throw error;
    }
  }

  /**
   * Update access tracking for an artifact
   */
  private updateAccessTracking(id: string): void {
    try {
      const stmt = this.db.prepare(`
        UPDATE artifacts
        SET access_count = access_count + 1,
            last_accessed = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(id);
    } catch (error) {
      console.warn('Failed to update access tracking:', error);
    }
  }

  /**
   * Delete artifact from database
   */
  async deleteArtifact(id: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const stmt = this.db.prepare('DELETE FROM artifacts WHERE id = ?');
      const result = stmt.run(id);

      console.log(`✅ Artifact deleted: ${id}`);
      return result.changes > 0;

    } catch (error) {
      console.error(`❌ Failed to delete artifact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalArtifacts: number;
    artifactsByType: Record<string, number>;
    totalFileSize: number;
    averageAccessCount: number;
  }> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM artifacts');
      const totalResult = totalStmt.get() as { count: number };

      const typeStmt = this.db.prepare('SELECT type, COUNT(*) as count FROM artifacts GROUP BY type');
      const typeResults = typeStmt.all() as { type: string; count: number }[];

      const sizeStmt = this.db.prepare('SELECT SUM(file_size) as total_size FROM artifacts');
      const sizeResult = sizeStmt.get() as { total_size: number };

      const accessStmt = this.db.prepare('SELECT AVG(access_count) as avg_access FROM artifacts');
      const accessResult = accessStmt.get() as { avg_access: number };

      const artifactsByType: Record<string, number> = {};
      typeResults.forEach(row => {
        artifactsByType[row.type] = row.count;
      });

      return {
        totalArtifacts: totalResult.count,
        artifactsByType,
        totalFileSize: sizeResult.total_size || 0,
        averageAccessCount: accessResult.avg_access || 0
      };

    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Increment access count for an artifact
   */
  async incrementAccessCount(artifactId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      this.db.prepare(`
        UPDATE artifacts
        SET access_count = access_count + 1,
            last_accessed = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(artifactId);
    } catch (error) {
      console.error(`❌ Failed to increment access count for ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected) {
        return { status: 'unhealthy', details: { error: 'Database not connected' } };
      }

      // Test basic query
      const testStmt = this.db.prepare('SELECT 1 as test');
      const result = testStmt.get();

      const stats = await this.getStats();

      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          databasePath: this.config.databasePath,
          ...stats
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.isConnected = false;
      console.log('✅ SQLite database connection closed');
    }
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase(): Database.Database {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return this.db;
  }
}

// Export factory function
export function createSQLiteDatabase(config?: Partial<DatabaseConfig>): SQLiteDatabase {
  return new SQLiteDatabase(config);
}
