#!/usr/bin/env node

/**
 * Metadata Validators for TappMCP Hybrid Architecture
 *
 * Validation utilities for artifact metadata, ensuring data integrity
 * and consistency across the hybrid SQLite + JSON system.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ArtifactValidationOptions {
  strictMode: boolean;
  allowEmptyTags: boolean;
  maxTitleLength: number;
  maxDescriptionLength: number;
  maxMetadataSize: number;
  requiredFields: string[];
}

export const DEFAULT_VALIDATION_OPTIONS: ArtifactValidationOptions = {
  strictMode: false,
  allowEmptyTags: true,
  maxTitleLength: 500,
  maxDescriptionLength: 2000,
  maxMetadataSize: 10000, // 10KB
  requiredFields: ['id', 'type', 'category', 'title']
};

/**
 * Validate artifact ID
 */
export function validateArtifactId(id: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!id || typeof id !== 'string') {
    errors.push('ID is required and must be a string');
    return { valid: false, errors, warnings };
  }

  if (id.length < 1) {
    errors.push('ID cannot be empty');
  }

  if (id.length > 255) {
    errors.push('ID cannot exceed 255 characters');
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    errors.push('ID can only contain alphanumeric characters, hyphens, and underscores');
  }

  // Check for reserved prefixes
  if (id.startsWith('_') || id.startsWith('system_')) {
    warnings.push('ID starts with reserved prefix');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact type
 */
export function validateArtifactType(type: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!type || typeof type !== 'string') {
    errors.push('Type is required and must be a string');
    return { valid: false, errors, warnings };
  }

  if (type.length < 1) {
    errors.push('Type cannot be empty');
  }

  if (type.length > 100) {
    errors.push('Type cannot exceed 100 characters');
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(type)) {
    errors.push('Type can only contain alphanumeric characters, hyphens, and underscores');
  }

  // Check for known types
  const knownTypes = ['context7', 'user_prefs', 'metrics', 'templates', 'cache', 'logs'];
  if (!knownTypes.includes(type)) {
    warnings.push(`Unknown type '${type}', consider using standard types: ${knownTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact category
 */
export function validateArtifactCategory(category: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!category || typeof category !== 'string') {
    errors.push('Category is required and must be a string');
    return { valid: false, errors, warnings };
  }

  if (category.length < 1) {
    errors.push('Category cannot be empty');
  }

  if (category.length > 100) {
    errors.push('Category cannot exceed 100 characters');
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(category)) {
    errors.push('Category can only contain alphanumeric characters, hyphens, and underscores');
  }

  // Check for known categories
  const knownCategories = ['knowledge', 'preferences', 'analytics', 'templates', 'cache', 'logs'];
  if (!knownCategories.includes(category)) {
    warnings.push(`Unknown category '${category}', consider using standard categories: ${knownCategories.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact title
 */
export function validateArtifactTitle(title: string, maxLength: number = 500): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!title || typeof title !== 'string') {
    errors.push('Title is required and must be a string');
    return { valid: false, errors, warnings };
  }

  if (title.length < 1) {
    errors.push('Title cannot be empty');
  }

  if (title.length > maxLength) {
    errors.push(`Title cannot exceed ${maxLength} characters`);
  }

  // Check for excessive whitespace
  if (title.trim() !== title) {
    warnings.push('Title has leading or trailing whitespace');
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(title)) {
    warnings.push('Title contains multiple consecutive spaces');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact description
 */
export function validateArtifactDescription(description: string | undefined, maxLength: number = 2000): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (description === undefined || description === null) {
    return { valid: true, errors, warnings };
  }

  if (typeof description !== 'string') {
    errors.push('Description must be a string');
    return { valid: false, errors, warnings };
  }

  if (description.length > maxLength) {
    errors.push(`Description cannot exceed ${maxLength} characters`);
  }

  // Check for excessive whitespace
  if (description.trim() !== description) {
    warnings.push('Description has leading or trailing whitespace');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact metadata
 */
export function validateArtifactMetadata(metadata: any, maxSize: number = 10000): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (metadata === undefined || metadata === null) {
    return { valid: true, errors, warnings };
  }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push('Metadata must be an object');
    return { valid: false, errors, warnings };
  }

  // Check metadata size
  const metadataSize = JSON.stringify(metadata).length;
  if (metadataSize > maxSize) {
    errors.push(`Metadata size (${metadataSize} bytes) exceeds limit (${maxSize} bytes)`);
  }

  // Check for circular references
  try {
    JSON.stringify(metadata);
  } catch (error) {
    errors.push('Metadata contains circular references');
  }

  // Check for reserved metadata keys
  const reservedKeys = ['_id', '_type', '_version', '_created', '_updated'];
  const metadataKeys = Object.keys(metadata);
  const conflictingKeys = metadataKeys.filter(key => reservedKeys.includes(key));

  if (conflictingKeys.length > 0) {
    warnings.push(`Metadata contains reserved keys: ${conflictingKeys.join(', ')}`);
  }

  // Check for deep nesting
  const maxDepth = 5;
  const depth = getObjectDepth(metadata);
  if (depth > maxDepth) {
    warnings.push(`Metadata nesting depth (${depth}) exceeds recommended limit (${maxDepth})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact tags
 */
export function validateArtifactTags(tags: string[], allowEmpty: boolean = true): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(tags)) {
    errors.push('Tags must be an array');
    return { valid: false, errors, warnings };
  }

  if (!allowEmpty && tags.length === 0) {
    errors.push('At least one tag is required');
  }

  if (tags.length > 50) {
    errors.push('Cannot have more than 50 tags');
  }

  const seenTags = new Set<string>();

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    if (typeof tag !== 'string') {
      errors.push(`Tag at index ${i} must be a string`);
      continue;
    }

    if (tag.length === 0) {
      errors.push(`Tag at index ${i} cannot be empty`);
      continue;
    }

    if (tag.length > 100) {
      errors.push(`Tag at index ${i} cannot exceed 100 characters`);
    }

    // Check for valid characters (alphanumeric, hyphens, underscores, spaces)
    if (!/^[a-zA-Z0-9_\s-]+$/.test(tag)) {
      errors.push(`Tag '${tag}' contains invalid characters`);
    }

    // Check for duplicate tags
    const normalizedTag = tag.toLowerCase().trim();
    if (seenTags.has(normalizedTag)) {
      warnings.push(`Duplicate tag: '${tag}'`);
    } else {
      seenTags.add(normalizedTag);
    }

    // Check for excessive whitespace
    if (tag.trim() !== tag) {
      warnings.push(`Tag '${tag}' has leading or trailing whitespace`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate artifact priority
 */
export function validateArtifactPriority(priority: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof priority !== 'number') {
    errors.push('Priority must be a number');
    return { valid: false, errors, warnings };
  }

  if (!Number.isInteger(priority)) {
    errors.push('Priority must be an integer');
  }

  if (priority < 0) {
    errors.push('Priority cannot be negative');
  }

  if (priority > 10) {
    errors.push('Priority cannot exceed 10');
  }

  // Provide guidance on priority levels
  if (priority > 0 && priority < 3) {
    warnings.push('Low priority (0-2): Consider if this artifact is needed');
  } else if (priority > 7) {
    warnings.push('High priority (8-10): Ensure this artifact is frequently accessed');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate complete artifact data
 */
export function validateArtifactData(
  artifactData: any,
  options: Partial<ArtifactValidationOptions> = {}
): ValidationResult {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if artifactData is an object
  if (!artifactData || typeof artifactData !== 'object') {
    errors.push('Artifact data must be an object');
    return { valid: false, errors, warnings };
  }

  // Validate required fields
  for (const field of opts.requiredFields) {
    if (!(field in artifactData)) {
      errors.push(`Required field '${field}' is missing`);
    }
  }

  // Validate individual fields
  const validations = [
    validateArtifactId(artifactData.id),
    validateArtifactType(artifactData.type),
    validateArtifactCategory(artifactData.category),
    validateArtifactTitle(artifactData.title, opts.maxTitleLength),
    validateArtifactDescription(artifactData.description, opts.maxDescriptionLength),
    validateArtifactMetadata(artifactData.metadata, opts.maxMetadataSize),
    validateArtifactTags(artifactData.tags || [], opts.allowEmptyTags),
    validateArtifactPriority(artifactData.priority || 0)
  ];

  // Collect all errors and warnings
  for (const validation of validations) {
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!query || typeof query !== 'object') {
    errors.push('Search query must be an object');
    return { valid: false, errors, warnings };
  }

  // Validate limit
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'number' || !Number.isInteger(query.limit) || query.limit < 1) {
      errors.push('Limit must be a positive integer');
    } else if (query.limit > 1000) {
      warnings.push('Large limit may impact performance');
    }
  }

  // Validate offset
  if (query.offset !== undefined) {
    if (typeof query.offset !== 'number' || !Number.isInteger(query.offset) || query.offset < 0) {
      errors.push('Offset must be a non-negative integer');
    }
  }

  // Validate orderBy
  if (query.orderBy !== undefined) {
    const validOrderBy = ['priority', 'last_accessed', 'created_at', 'access_count', 'title'];
    if (!validOrderBy.includes(query.orderBy)) {
      errors.push(`Invalid orderBy: ${query.orderBy}. Must be one of: ${validOrderBy.join(', ')}`);
    }
  }

  // Validate orderDirection
  if (query.orderDirection !== undefined) {
    if (!['ASC', 'DESC'].includes(query.orderDirection)) {
      errors.push('orderDirection must be either ASC or DESC');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get object nesting depth
 */
function getObjectDepth(obj: any, currentDepth: number = 0): number {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return currentDepth;
  }

  let maxDepth = currentDepth;
  for (const value of Object.values(obj)) {
    const depth = getObjectDepth(value, currentDepth + 1);
    maxDepth = Math.max(maxDepth, depth);
  }

  return maxDepth;
}

/**
 * Sanitize artifact data for storage
 */
export function sanitizeArtifactData(artifactData: any): any {
  const sanitized = { ...artifactData };

  // Sanitize title
  if (sanitized.title && typeof sanitized.title === 'string') {
    sanitized.title = sanitized.title.trim().replace(/\s+/g, ' ');
  }

  // Sanitize description
  if (sanitized.description && typeof sanitized.description === 'string') {
    sanitized.description = sanitized.description.trim();
  }

  // Sanitize tags
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .map((tag: any) => typeof tag === 'string' ? tag.trim() : tag)
      .filter((tag: any) => tag && typeof tag === 'string' && tag.length > 0);
  }

  // Ensure priority is within bounds
  if (typeof sanitized.priority === 'number') {
    sanitized.priority = Math.max(0, Math.min(10, Math.round(sanitized.priority)));
  }

  return sanitized;
}
