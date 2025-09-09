#!/usr/bin/env node
/**
 * Context Persistence Engine - Week 2 Enhanced
 *
 * Advanced persistent storage and retrieval for Context7 broker
 * with compression, versioning, intelligent archiving, cross-session
 * learning, and adaptive optimization capabilities.
 *
 * Phase 1, Week 2 - Enhanced Context Persistence Implementation
 * Features: Cross-session intelligence, adaptive compression, search optimization
 */
import { z } from 'zod';
/**
 * Context Storage Entry Schema
 */
export declare const ContextEntrySchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    toolName: z.ZodString;
    timestamp: z.ZodDate;
    contextType: z.ZodEnum<["input", "output", "intermediate", "metadata"]>;
    content: z.ZodString;
    tokens: z.ZodDefault<z.ZodNumber>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    compressed: z.ZodDefault<z.ZodBoolean>;
    version: z.ZodDefault<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    timestamp: Date;
    priority: "high" | "medium" | "low" | "critical";
    id: string;
    version: number;
    tags: string[];
    toolName: string;
    sessionId: string;
    contextType: "intermediate" | "metadata" | "input" | "output";
    metadata: Record<string, any>;
    tokens: number;
    compressed: boolean;
}, {
    content: string;
    timestamp: Date;
    id: string;
    toolName: string;
    sessionId: string;
    contextType: "intermediate" | "metadata" | "input" | "output";
    priority?: "high" | "medium" | "low" | "critical" | undefined;
    version?: number | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
    tokens?: number | undefined;
    compressed?: boolean | undefined;
}>;
export type ContextEntry = z.infer<typeof ContextEntrySchema>;
/**
 * Storage Configuration Schema
 */
export declare const StorageConfigSchema: z.ZodObject<{
    maxMemoryEntries: z.ZodDefault<z.ZodNumber>;
    maxDiskEntries: z.ZodDefault<z.ZodNumber>;
    compressionThreshold: z.ZodDefault<z.ZodNumber>;
    archiveAfterDays: z.ZodDefault<z.ZodNumber>;
    autoCleanupEnabled: z.ZodDefault<z.ZodBoolean>;
    storageDirectory: z.ZodDefault<z.ZodString>;
    compressionLevel: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxMemoryEntries: number;
    maxDiskEntries: number;
    compressionThreshold: number;
    archiveAfterDays: number;
    autoCleanupEnabled: boolean;
    storageDirectory: string;
    compressionLevel: number;
}, {
    maxMemoryEntries?: number | undefined;
    maxDiskEntries?: number | undefined;
    compressionThreshold?: number | undefined;
    archiveAfterDays?: number | undefined;
    autoCleanupEnabled?: boolean | undefined;
    storageDirectory?: string | undefined;
    compressionLevel?: number | undefined;
}>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
/**
 * Search Query Schema
 */
export declare const SearchQuerySchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    toolName: z.ZodOptional<z.ZodString>;
    contextType: z.ZodOptional<z.ZodEnum<["input", "output", "intermediate", "metadata"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    textSearch: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["timestamp", "priority", "tokens", "relevance"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "timestamp" | "priority" | "relevance" | "tokens";
    sortOrder: "asc" | "desc";
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    priority?: "high" | "medium" | "low" | "critical" | undefined;
    tags?: string[] | undefined;
    toolName?: string | undefined;
    sessionId?: string | undefined;
    contextType?: "intermediate" | "metadata" | "input" | "output" | undefined;
    textSearch?: string | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    priority?: "high" | "medium" | "low" | "critical" | undefined;
    tags?: string[] | undefined;
    toolName?: string | undefined;
    sessionId?: string | undefined;
    contextType?: "intermediate" | "metadata" | "input" | "output" | undefined;
    textSearch?: string | undefined;
    limit?: number | undefined;
    sortBy?: "timestamp" | "priority" | "relevance" | "tokens" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
/**
 * Context Statistics
 */
export interface ContextStats {
    totalEntries: number;
    memoryEntries: number;
    diskEntries: number;
    compressedEntries: number;
    totalTokens: number;
    averageTokensPerEntry: number;
    storageSize: {
        memory: number;
        disk: number;
        compressed: number;
    };
    sessionStats: Record<string, {
        entryCount: number;
        totalTokens: number;
        lastActivity: Date;
    }>;
    toolStats: Record<string, {
        entryCount: number;
        totalTokens: number;
        avgTokensPerEntry: number;
    }>;
}
/**
 * Context Persistence Engine Class
 */
export declare class ContextPersistenceEngine {
    private config;
    private memoryStorage;
    private memoryIndex;
    private compressionCache;
    constructor(config?: Partial<StorageConfig>);
    /**
     * Store a context entry
     */
    store(entry: Partial<ContextEntry>): Promise<string>;
    /**
     * Retrieve a context entry by ID
     */
    retrieve(id: string): Promise<ContextEntry | undefined>;
    /**
     * Search for context entries
     */
    search(query: Partial<SearchQuery>): Promise<ContextEntry[]>;
    /**
     * Get context for a specific session
     */
    getSessionContext(sessionId: string, limit?: number): Promise<ContextEntry[]>;
    /**
     * Get statistics
     */
    getStatistics(): Promise<ContextStats>;
    /**
     * Clean up old entries
     */
    cleanup(force?: boolean): Promise<{
        deleted: number;
        archived: number;
    }>;
    /**
     * Initialize storage system
     */
    private initializeStorage;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Update search index
     */
    private updateIndex;
    /**
     * Remove from search index
     */
    private removeFromIndex;
    /**
     * Get search candidates from index
     */
    private getSearchCandidates;
    /**
     * Check if entry matches query
     */
    private matchesQuery;
    /**
     * Sort search results
     */
    private sortResults;
    /**
     * Compression methods (simplified for demo)
     */
    private compressContent;
    private decompressContent;
    /**
     * Disk operations (simplified for demo)
     */
    private flushToDisk;
    private loadFromDisk;
    private getDiskEntryCount;
    private calculateDiskSize;
    private archiveToDisk;
    /**
     * Statistics calculations
     */
    private calculateMemorySize;
    private calculateCompressionSavings;
    private calculateSessionStats;
    private calculateToolStats;
}
export declare function createContextPersistenceEngine(config?: Partial<StorageConfig>): ContextPersistenceEngine;
//# sourceMappingURL=ContextPersistenceEngine.d.ts.map