/**
 * Dynamic Import Manager for Code Splitting
 *
 * This module provides dynamic import capabilities for large modules
 * to improve initial load time and enable code splitting.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import {
  type CodeGenerationRequest,
  type CodeGenerationResult,
} from '../intelligence/UnifiedCodeIntelligenceEngine.js';

/**
 * Lazy-loaded intelligence engines with caching
 */
class DynamicImportManager {
  private static instance: DynamicImportManager;
  private engineCache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  private constructor() {}

  static getInstance(): DynamicImportManager {
    if (!DynamicImportManager.instance) {
      DynamicImportManager.instance = new DynamicImportManager();
    }
    return DynamicImportManager.instance;
  }

  /**
   * Dynamically imports the UnifiedCodeIntelligenceEngine
   *
   * @returns Promise resolving to the engine class
   */
  async getUnifiedCodeIntelligenceEngine() {
    const cacheKey = 'UnifiedCodeIntelligenceEngine';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../intelligence/UnifiedCodeIntelligenceEngine.js').then(
      module => {
        const Engine = module.UnifiedCodeIntelligenceEngine;
        this.engineCache.set(cacheKey, Engine);
        return Engine;
      }
    );

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Dynamically imports the QualityAssuranceEngine
   *
   * @returns Promise resolving to the engine class
   */
  async getQualityAssuranceEngine() {
    const cacheKey = 'QualityAssuranceEngine';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../intelligence/QualityAssuranceEngine.js').then(module => {
      const Engine = module.QualityAssuranceEngine;
      this.engineCache.set(cacheKey, Engine);
      return Engine;
    });

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Dynamically imports the BackendIntelligenceEngine
   *
   * @returns Promise resolving to the engine class
   */
  async getBackendIntelligenceEngine() {
    const cacheKey = 'BackendIntelligenceEngine';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../intelligence/engines/backend/index.js').then(module => {
      const Engine = module.BackendIntelligenceEngine;
      this.engineCache.set(cacheKey, Engine);
      return Engine;
    });

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Dynamically imports the MobileIntelligenceEngine
   *
   * @returns Promise resolving to the engine class
   */
  async getMobileIntelligenceEngine() {
    const cacheKey = 'MobileIntelligenceEngine';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../intelligence/engines/MobileIntelligenceEngine.js').then(
      module => {
        const Engine = module.MobileIntelligenceEngine;
        this.engineCache.set(cacheKey, Engine);
        return Engine;
      }
    );

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Dynamically imports the DevOpsIntelligenceEngine
   *
   * @returns Promise resolving to the engine class
   */
  async getDevOpsIntelligenceEngine() {
    const cacheKey = 'DevOpsIntelligenceEngine';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../intelligence/engines/DevOpsIntelligenceEngine.js').then(
      module => {
        const Engine = module.DevOpsIntelligenceEngine;
        this.engineCache.set(cacheKey, Engine);
        return Engine;
      }
    );

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Dynamically imports the BusinessAnalyzer
   *
   * @returns Promise resolving to the analyzer class
   */
  async getBusinessAnalyzer() {
    const cacheKey = 'BusinessAnalyzer';

    if (this.engineCache.has(cacheKey)) {
      return this.engineCache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadingPromise = import('../core/business-analyzer.js').then(module => {
      const Analyzer = module.BusinessAnalyzer;
      this.engineCache.set(cacheKey, Analyzer);
      return Analyzer;
    });

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Preloads all intelligence engines for better performance
   *
   * @returns Promise resolving when all engines are loaded
   */
  async preloadEngines(): Promise<void> {
    const loadPromises = [
      this.getUnifiedCodeIntelligenceEngine(),
      this.getQualityAssuranceEngine(),
      this.getBackendIntelligenceEngine(),
      this.getMobileIntelligenceEngine(),
      this.getDevOpsIntelligenceEngine(),
      this.getBusinessAnalyzer(),
    ];

    await Promise.all(loadPromises);
  }

  /**
   * Clears the engine cache to free memory
   */
  clearCache(): void {
    this.engineCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Gets cache statistics
   *
   * @returns Object with cache statistics
   */
  getCacheStats() {
    return {
      cachedEngines: this.engineCache.size,
      loadingPromises: this.loadingPromises.size,
      totalMemoryUsage: this.engineCache.size + this.loadingPromises.size,
    };
  }
}

export const dynamicImportManager = DynamicImportManager.getInstance();

/**
 * Convenience function to get the UnifiedCodeIntelligenceEngine
 *
 * @returns Promise resolving to the engine class
 */
export async function getUnifiedCodeIntelligenceEngine() {
  return dynamicImportManager.getUnifiedCodeIntelligenceEngine();
}

/**
 * Convenience function to get the QualityAssuranceEngine
 *
 * @returns Promise resolving to the engine class
 */
export async function getQualityAssuranceEngine() {
  return dynamicImportManager.getQualityAssuranceEngine();
}

/**
 * Convenience function to preload all engines
 *
 * @returns Promise resolving when all engines are loaded
 */
export async function preloadAllEngines() {
  return dynamicImportManager.preloadEngines();
}
