#!/usr/bin/env node

/**
 * File Pointer Utilities for TappMCP Hybrid Architecture
 *
 * Utility functions for managing file pointers,
 * calculating checksums, and handling file operations.
 */

import { createHash } from 'crypto';
import { FilePointer } from './file-manager.js';

export interface PointerValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PointerComparisonResult {
  identical: boolean;
  differences: Array<{
    field: string;
    expected: any;
    actual: any;
  }>;
}

/**
 * Calculate checksum for data
 */
export function calculateChecksum(data: Buffer | string): string {
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate file pointer structure
 */
export function validatePointer(pointer: any): PointerValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!pointer.filePath || typeof pointer.filePath !== 'string') {
    errors.push('filePath is required and must be a string');
  }

  if (typeof pointer.size !== 'number' || pointer.size < 0) {
    errors.push('size is required and must be a non-negative number');
  }

  if (typeof pointer.compressed !== 'boolean') {
    errors.push('compressed is required and must be a boolean');
  }

  // Optional fields validation
  if (pointer.offset !== undefined && (typeof pointer.offset !== 'number' || pointer.offset < 0)) {
    errors.push('offset must be a non-negative number if provided');
  }

  if (pointer.checksum && typeof pointer.checksum !== 'string') {
    errors.push('checksum must be a string if provided');
  }

  if (pointer.createdAt && !(pointer.createdAt instanceof Date) && !isValidDate(pointer.createdAt)) {
    errors.push('createdAt must be a valid Date if provided');
  }

  if (pointer.lastAccessed && !(pointer.lastAccessed instanceof Date) && !isValidDate(pointer.lastAccessed)) {
    errors.push('lastAccessed must be a valid Date if provided');
  }

  // Warnings
  if (pointer.size > 100 * 1024 * 1024) { // 100MB
    warnings.push('File size exceeds 100MB, consider compression');
  }

  if (pointer.offset && pointer.offset + pointer.size > 1024 * 1024 * 1024) { // 1GB
    warnings.push('File offset + size exceeds 1GB');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if a value is a valid date
 */
function isValidDate(value: any): boolean {
  if (value instanceof Date) return true;
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Compare two file pointers
 */
export function comparePointers(pointer1: FilePointer, pointer2: FilePointer): PointerComparisonResult {
  const differences: Array<{ field: string; expected: any; actual: any }> = [];

  const fields: (keyof FilePointer)[] = [
    'filePath', 'offset', 'size', 'checksum', 'compressed'
  ];

  for (const field of fields) {
    if (pointer1[field] !== pointer2[field]) {
      differences.push({
        field,
        expected: pointer1[field],
        actual: pointer2[field]
      });
    }
  }

  return {
    identical: differences.length === 0,
    differences
  };
}

/**
 * Create a file pointer from file path and options
 */
export function createPointer(
  filePath: string,
  options: {
    size: number;
    offset?: number;
    checksum?: string;
    compressed?: boolean;
  }
): FilePointer {
  return {
    filePath,
    offset: options.offset,
    size: options.size,
    checksum: options.checksum || '',
    compressed: options.compressed || false,
    createdAt: new Date(),
    lastAccessed: new Date()
  };
}

/**
 * Update pointer access time
 */
export function updatePointerAccess(pointer: FilePointer): FilePointer {
  return {
    ...pointer,
    lastAccessed: new Date()
  };
}

/**
 * Calculate pointer memory usage estimate
 */
export function calculatePointerMemoryUsage(pointer: FilePointer): number {
  let size = 0;

  // Base object overhead
  size += 100; // Rough estimate for object overhead

  // String fields
  size += (pointer.filePath?.length || 0) * 2; // UTF-16
  size += (pointer.checksum?.length || 0) * 2;

  // Numbers
  size += 8 * 4; // offset, size, compressed (as number), priority

  // Dates
  size += 8 * 2; // createdAt, lastAccessed

  return size;
}

/**
 * Serialize pointer to JSON with metadata
 */
export function serializePointer(pointer: FilePointer): string {
  const serialized = {
    ...pointer,
    createdAt: pointer.createdAt.toISOString(),
    lastAccessed: pointer.lastAccessed?.toISOString(),
    metadata: {
      serializedAt: new Date().toISOString(),
      version: '1.0.0',
      memoryUsage: calculatePointerMemoryUsage(pointer)
    }
  };

  return JSON.stringify(serialized, null, 2);
}

/**
 * Deserialize pointer from JSON
 */
export function deserializePointer(json: string): FilePointer {
  const parsed = JSON.parse(json);

  return {
    filePath: parsed.filePath,
    offset: parsed.offset,
    size: parsed.size,
    checksum: parsed.checksum,
    compressed: parsed.compressed,
    createdAt: new Date(parsed.createdAt),
    lastAccessed: parsed.lastAccessed ? new Date(parsed.lastAccessed) : undefined
  };
}

/**
 * Generate pointer ID from file path
 */
export function generatePointerId(filePath: string): string {
  const hash = createHash('md5').update(filePath).digest('hex');
  return `ptr_${hash}`;
}

/**
 * Check if pointer is expired (based on last access)
 */
export function isPointerExpired(pointer: FilePointer, maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  if (!pointer.lastAccessed) return false;

  const now = new Date();
  const age = now.getTime() - pointer.lastAccessed.getTime();

  return age > maxAgeMs;
}

/**
 * Get pointer age in milliseconds
 */
export function getPointerAge(pointer: FilePointer): number {
  const now = new Date();
  return now.getTime() - pointer.createdAt.getTime();
}

/**
 * Get pointer access age in milliseconds
 */
export function getPointerAccessAge(pointer: FilePointer): number {
  if (!pointer.lastAccessed) return 0;

  const now = new Date();
  return now.getTime() - pointer.lastAccessed.getTime();
}

/**
 * Calculate pointer priority based on access patterns
 */
export function calculatePointerPriority(pointer: FilePointer): number {
  let priority = 0;

  // Base priority from creation time (newer = higher)
  const age = getPointerAge(pointer);
  priority += Math.max(0, 100 - (age / (24 * 60 * 60 * 1000))); // Decay over days

  // Boost for recent access
  const accessAge = getPointerAccessAge(pointer);
  if (accessAge < 60 * 60 * 1000) { // Accessed within last hour
    priority += 50;
  } else if (accessAge < 24 * 60 * 60 * 1000) { // Accessed within last day
    priority += 25;
  }

  // Boost for compressed files (they're more valuable)
  if (pointer.compressed) {
    priority += 10;
  }

  return Math.round(priority);
}

/**
 * Sort pointers by priority
 */
export function sortPointersByPriority(pointers: FilePointer[], ascending: boolean = false): FilePointer[] {
  return pointers.sort((a, b) => {
    const priorityA = calculatePointerPriority(a);
    const priorityB = calculatePointerPriority(b);

    return ascending ? priorityA - priorityB : priorityB - priorityA;
  });
}

/**
 * Filter pointers by criteria
 */
export function filterPointers(
  pointers: FilePointer[],
  criteria: {
    minSize?: number;
    maxSize?: number;
    compressed?: boolean;
    maxAge?: number;
    maxAccessAge?: number;
  }
): FilePointer[] {
  return pointers.filter(pointer => {
    if (criteria.minSize && pointer.size < criteria.minSize) return false;
    if (criteria.maxSize && pointer.size > criteria.maxSize) return false;
    if (criteria.compressed !== undefined && pointer.compressed !== criteria.compressed) return false;
    if (criteria.maxAge && getPointerAge(pointer) > criteria.maxAge) return false;
    if (criteria.maxAccessAge && getPointerAccessAge(pointer) > criteria.maxAccessAge) return false;

    return true;
  });
}

/**
 * Get pointer statistics
 */
export function getPointerStats(pointers: FilePointer[]): {
  total: number;
  totalSize: number;
  averageSize: number;
  compressedCount: number;
  oldestAge: number;
  newestAge: number;
  averagePriority: number;
} {
  if (pointers.length === 0) {
    return {
      total: 0,
      totalSize: 0,
      averageSize: 0,
      compressedCount: 0,
      oldestAge: 0,
      newestAge: 0,
      averagePriority: 0
    };
  }

  const totalSize = pointers.reduce((sum, p) => sum + p.size, 0);
  const compressedCount = pointers.filter(p => p.compressed).length;
  const ages = pointers.map(p => getPointerAge(p));
  const priorities = pointers.map(p => calculatePointerPriority(p));

  return {
    total: pointers.length,
    totalSize,
    averageSize: totalSize / pointers.length,
    compressedCount,
    oldestAge: Math.max(...ages),
    newestAge: Math.min(...ages),
    averagePriority: priorities.reduce((sum, p) => sum + p, 0) / priorities.length
  };
}
