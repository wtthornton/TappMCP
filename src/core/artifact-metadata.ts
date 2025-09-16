#!/usr/bin/env node

/**
 * Artifact Metadata API for TappMCP Hybrid Architecture
 *
 * Provides high-level CRUD operations for artifact metadata,
 * search capabilities, and access tracking.
 */

import { SQLiteDatabase, ArtifactData, SearchQuery } from './sqlite-database.js';
import { FileManager, FilePointer } from './file-manager.js';
import { validatePointer, calculatePointerPriority } from './file-pointer-utils.js';

export interface ArtifactMetadata {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed?: Date;
  fileSize: number;
  compressed: boolean;
}

export interface CreateArtifactRequest {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  data: any;
  metadata?: Record<string, any>;
  priority?: number;
  tags?: string[];
  compress?: boolean;
}

export interface UpdateArtifactRequest {
  id: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  priority?: number;
  tags?: string[];
  data?: any;
}

export interface SearchArtifactRequest {
  query?: string;
  type?: string;
  category?: string;
  tags?: string[];
  minPriority?: number;
  maxPriority?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'priority' | 'last_accessed' | 'created_at' | 'access_count' | 'title';
  orderDirection?: 'ASC' | 'DESC';
}

export interface ArtifactStats {
  totalArtifacts: number;
  artifactsByType: Record<string, number>;
  artifactsByCategory: Record<string, number>;
  totalFileSize: number;
  averageFileSize: number;
  averageAccessCount: number;
  topTags: Array<{ tag: string; count: number }>;
  recentArtifacts: ArtifactMetadata[];
  highPriorityArtifacts: ArtifactMetadata[];
}

export class ArtifactMetadataAPI {
  private db: SQLiteDatabase;
  private fileManager: FileManager;

  constructor(database: SQLiteDatabase, fileManager: FileManager) {
    this.db = database;
    this.fileManager = fileManager;
  }

  /**
   * Create a new artifact with metadata and data storage
   */
  async createArtifact(request: CreateArtifactRequest): Promise<ArtifactMetadata> {
    try {
      // Store data in file system
      const pointer = await this.fileManager.storeData(
        request.id,
        request.type,
        request.category,
        request.data,
        { compress: request.compress }
      );

      // Validate pointer
      const validation = validatePointer(pointer);
      if (!validation.valid) {
        throw new Error(`Invalid file pointer: ${validation.errors.join(', ')}`);
      }

      // Store metadata in database
      const artifactId = await this.db.storeArtifact({
        id: request.id,
        type: request.type,
        category: request.category,
        title: request.title,
        filePath: pointer.filePath,
        fileSize: pointer.size,
        metadata: {
          ...request.metadata,
          description: request.description,
          source: 'artifact-api'
        },
        priority: request.priority || calculatePointerPriority(pointer),
        tags: request.tags || [],
        compressed: pointer.compressed,
        checksum: pointer.checksum
      });

      // Retrieve and return the created artifact
      const artifact = await this.getArtifact(artifactId);
      if (!artifact) {
        throw new Error('Failed to retrieve created artifact');
      }

      console.log(`✅ Artifact created: ${artifactId}`);
      return artifact;

    } catch (error) {
      console.error(`❌ Failed to create artifact ${request.id}:`, error);
      throw error;
    }
  }

  /**
   * Get artifact by ID with full metadata
   */
  async getArtifact(id: string): Promise<ArtifactMetadata | null> {
    try {
      const artifact = await this.db.getArtifact(id);
      if (!artifact) {
        return null;
      }

      return {
        id: artifact.id,
        type: artifact.type,
        category: artifact.category,
        title: artifact.title,
        description: artifact.metadata?.description,
        metadata: artifact.metadata || {},
        priority: artifact.priority,
        tags: artifact.tags,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
        accessCount: artifact.accessCount,
        lastAccessed: artifact.lastAccessed,
        fileSize: artifact.fileSize,
        compressed: artifact.compressed
      };

    } catch (error) {
      console.error(`❌ Failed to get artifact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get artifact data (the actual content)
   */
  async getArtifactData(id: string): Promise<any> {
    try {
      const artifact = await this.db.getArtifact(id);
      if (!artifact) {
        return null;
      }

      const fileResult = await this.fileManager.loadData({
        filePath: artifact.filePath,
        size: artifact.fileSize,
        checksum: artifact.checksum || '',
        compressed: artifact.compressed,
        createdAt: artifact.createdAt,
        lastAccessed: artifact.lastAccessed
      });

      if (!fileResult.success) {
        throw new Error(`Failed to load data: ${fileResult.error}`);
      }

      return fileResult.data;

    } catch (error) {
      console.error(`❌ Failed to get artifact data ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update artifact metadata and/or data
   */
  async updateArtifact(request: UpdateArtifactRequest): Promise<ArtifactMetadata> {
    try {
      const existingArtifact = await this.db.getArtifact(request.id);
      if (!existingArtifact) {
        throw new Error(`Artifact ${request.id} not found`);
      }

      let newPointer = {
        filePath: existingArtifact.filePath,
        size: existingArtifact.fileSize,
        checksum: existingArtifact.checksum || '',
        compressed: existingArtifact.compressed,
        createdAt: existingArtifact.createdAt,
        lastAccessed: existingArtifact.lastAccessed
      };

      // Update data if provided
      if (request.data !== undefined) {
        // Delete old file
        await this.fileManager.deleteFile(newPointer);

        // Store new data
        const pointer = await this.fileManager.storeData(
          request.id,
          existingArtifact.type,
          existingArtifact.category,
          request.data
        );

        newPointer = {
          filePath: pointer.filePath,
          size: pointer.size,
          checksum: pointer.checksum,
          compressed: pointer.compressed,
          createdAt: existingArtifact.createdAt,
          lastAccessed: existingArtifact.lastAccessed
        };
      }

      // Update metadata
      const updatedMetadata = {
        ...existingArtifact.metadata,
        ...request.metadata,
        description: request.description !== undefined ? request.description : existingArtifact.metadata?.description
      };

      // Store updated artifact
      await this.db.storeArtifact({
        id: request.id,
        type: existingArtifact.type,
        category: existingArtifact.category,
        title: request.title || existingArtifact.title,
        filePath: newPointer.filePath,
        fileSize: newPointer.size,
        metadata: updatedMetadata,
        priority: request.priority || existingArtifact.priority,
        tags: request.tags || existingArtifact.tags,
        compressed: newPointer.compressed,
        checksum: newPointer.checksum
      });

      // Return updated artifact
      const updatedArtifact = await this.getArtifact(request.id);
      if (!updatedArtifact) {
        throw new Error('Failed to retrieve updated artifact');
      }

      console.log(`✅ Artifact updated: ${request.id}`);
      return updatedArtifact;

    } catch (error) {
      console.error(`❌ Failed to update artifact ${request.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete artifact and its associated data
   */
  async deleteArtifact(id: string): Promise<boolean> {
    try {
      const artifact = await this.db.getArtifact(id);
      if (!artifact) {
        return false;
      }

      // Delete file
      const fileDeleted = await this.fileManager.deleteFile({
        filePath: artifact.filePath,
        size: artifact.fileSize,
        checksum: artifact.checksum || '',
        compressed: artifact.compressed,
        createdAt: artifact.createdAt,
        lastAccessed: artifact.lastAccessed
      });

      // Delete metadata
      const metadataDeleted = await this.db.deleteArtifact(id);

      const success = fileDeleted && metadataDeleted;
      if (success) {
        console.log(`✅ Artifact deleted: ${id}`);
      }

      return success;

    } catch (error) {
      console.error(`❌ Failed to delete artifact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search artifacts with advanced filtering
   */
  async searchArtifacts(request: SearchArtifactRequest): Promise<ArtifactMetadata[]> {
    try {
      // Build search query
      const searchQuery: SearchQuery = {
        type: request.type,
        category: request.category,
        tags: request.tags,
        limit: request.limit || 50,
        offset: request.offset || 0,
        orderBy: request.orderBy === 'title' ? 'priority' : request.orderBy || 'priority',
        orderDirection: request.orderDirection || 'DESC'
      };

      // Get artifacts from database
      const artifacts = await this.db.searchArtifacts(searchQuery);

      // Convert to metadata format
      const metadata: ArtifactMetadata[] = artifacts.map(artifact => ({
        id: artifact.id,
        type: artifact.type,
        category: artifact.category,
        title: artifact.title,
        description: artifact.metadata?.description,
        metadata: artifact.metadata || {},
        priority: artifact.priority,
        tags: artifact.tags,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
        accessCount: artifact.accessCount,
        lastAccessed: artifact.lastAccessed,
        fileSize: artifact.fileSize,
        compressed: artifact.compressed
      }));

      // Apply additional filters
      let filtered = metadata;

      if (request.query) {
        const query = request.query.toLowerCase();
        filtered = filtered.filter(artifact =>
          artifact.title.toLowerCase().includes(query) ||
          artifact.description?.toLowerCase().includes(query) ||
          artifact.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (request.minPriority !== undefined) {
        filtered = filtered.filter(artifact => artifact.priority >= request.minPriority!);
      }

      if (request.maxPriority !== undefined) {
        filtered = filtered.filter(artifact => artifact.priority <= request.maxPriority!);
      }

      if (request.dateFrom) {
        filtered = filtered.filter(artifact => artifact.createdAt >= request.dateFrom!);
      }

      if (request.dateTo) {
        filtered = filtered.filter(artifact => artifact.createdAt <= request.dateTo!);
      }

      return filtered;

    } catch (error) {
      console.error('❌ Failed to search artifacts:', error);
      throw error;
    }
  }

  /**
   * Get artifact statistics
   */
  async getArtifactStats(): Promise<ArtifactStats> {
    try {
      const dbStats = await this.db.getStats();

      // Get all artifacts for additional analysis
      const allArtifacts = await this.db.searchArtifacts({ limit: 1000 });

      // Calculate additional statistics
      const artifactsByCategory: Record<string, number> = {};
      const tagCounts: Record<string, number> = {};

      allArtifacts.forEach(artifact => {
        // Count by category
        artifactsByCategory[artifact.category] = (artifactsByCategory[artifact.category] || 0) + 1;

        // Count tags
        artifact.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // Get top tags
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get recent artifacts
      const recentArtifacts = allArtifacts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(artifact => ({
          id: artifact.id,
          type: artifact.type,
          category: artifact.category,
          title: artifact.title,
          description: artifact.metadata?.description,
          metadata: artifact.metadata || {},
          priority: artifact.priority,
          tags: artifact.tags,
          createdAt: artifact.createdAt,
          updatedAt: artifact.updatedAt,
          accessCount: artifact.accessCount,
          lastAccessed: artifact.lastAccessed,
          fileSize: artifact.fileSize,
          compressed: artifact.compressed
        }));

      // Get high priority artifacts
      const highPriorityArtifacts = allArtifacts
        .filter(artifact => artifact.priority > 7)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .map(artifact => ({
          id: artifact.id,
          type: artifact.type,
          category: artifact.category,
          title: artifact.title,
          description: artifact.metadata?.description,
          metadata: artifact.metadata || {},
          priority: artifact.priority,
          tags: artifact.tags,
          createdAt: artifact.createdAt,
          updatedAt: artifact.updatedAt,
          accessCount: artifact.accessCount,
          lastAccessed: artifact.lastAccessed,
          fileSize: artifact.fileSize,
          compressed: artifact.compressed
        }));

      return {
        totalArtifacts: dbStats.totalArtifacts,
        artifactsByType: dbStats.artifactsByType,
        artifactsByCategory,
        totalFileSize: dbStats.totalFileSize,
        averageFileSize: dbStats.totalFileSize / Math.max(dbStats.totalArtifacts, 1),
        averageAccessCount: dbStats.averageAccessCount,
        topTags,
        recentArtifacts,
        highPriorityArtifacts
      };

    } catch (error) {
      console.error('❌ Failed to get artifact stats:', error);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkCreateArtifacts(requests: CreateArtifactRequest[]): Promise<ArtifactMetadata[]> {
    const results: ArtifactMetadata[] = [];
    const errors: string[] = [];

    for (const request of requests) {
      try {
        const artifact = await this.createArtifact(request);
        results.push(artifact);
      } catch (error) {
        errors.push(`Failed to create ${request.id}: ${error}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️ Bulk create completed with ${errors.length} errors:`, errors);
    }

    return results;
  }

  async bulkDeleteArtifacts(ids: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const id of ids) {
      try {
        const success = await this.deleteArtifact(id);
        if (success) {
          deleted.push(id);
        } else {
          failed.push(id);
        }
      } catch (error) {
        failed.push(id);
      }
    }

    return { deleted, failed };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const dbHealth = await this.db.healthCheck();
      const fileStats = await this.fileManager.getStorageStats();

      return {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        details: {
          database: dbHealth.details,
          fileSystem: fileStats
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// Export factory function
export function createArtifactMetadataAPI(database: SQLiteDatabase, fileManager: FileManager): ArtifactMetadataAPI {
  return new ArtifactMetadataAPI(database, fileManager);
}
