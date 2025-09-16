/**
 * Cache utility functions for TappMCP
 * Simple, focused utilities for cache key normalization
 */

/**
 * Normalizes cache keys to ensure consistency across all cache layers
 * Converts spaces to hyphens, removes special characters, and standardizes format
 *
 * @param prefix - Cache prefix (e.g., 'doc', 'examples', 'best-practices')
 * @param topic - Topic name (e.g., 'project planning', 'requirements analysis')
 * @param version - Optional version (e.g., 'latest', 'v1.0')
 * @param role - Optional role (e.g., 'implementation', 'design')
 * @returns Normalized cache key
 *
 * @example
 * normalizeCacheKey('doc', 'project planning', 'latest')
 * // Returns: 'doc:project-planning:latest'
 *
 * normalizeCacheKey('examples', 'requirements analysis', 'implementation')
 * // Returns: 'examples:requirements-analysis:implementation'
 */
export function normalizeCacheKey(
  prefix: string,
  topic: string,
  version?: string,
  role?: string
): string {
  // Normalize topic: convert spaces to hyphens, remove special chars
  const normalizedTopic = topic
    .toLowerCase()
    .replace(/\s+/g, '-')           // Convert spaces to hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special characters
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens

  // Build key parts
  const parts = [prefix, normalizedTopic];
  if (version) parts.push(version);
  if (role) parts.push(role);

  return parts.join(':');
}

/**
 * Creates a cache key for Context7 documentation
 */
export function createDocCacheKey(topic: string, version: string = 'latest'): string {
  return normalizeCacheKey('doc', topic, version);
}

/**
 * Creates a cache key for Context7 code examples
 */
export function createExamplesCacheKey(topic: string, role: string = 'implementation'): string {
  return normalizeCacheKey('examples', topic, undefined, role);
}

/**
 * Creates a cache key for Context7 best practices
 */
export function createBestPracticesCacheKey(topic: string, role: string = 'implementation'): string {
  return normalizeCacheKey('best-practices', topic, undefined, role);
}

/**
 * Creates a cache key for Context7 troubleshooting
 */
export function createTroubleshootingCacheKey(topic: string): string {
  return normalizeCacheKey('troubleshooting', topic);
}

/**
 * Creates a cache key for orchestration insights
 */
export function createInsightsCacheKey(phase: string, role: string, projectId: string): string {
  return normalizeCacheKey('insights', `${phase}:${role}:${projectId}`);
}

/**
 * Creates a cache key for topic lists
 */
export function createTopicsCacheKey(phase: string, role: string): string {
  return normalizeCacheKey('topics', `${phase}:${role}`);
}
