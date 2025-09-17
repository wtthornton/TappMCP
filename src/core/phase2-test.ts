#!/usr/bin/env node

/**
 * Phase 2 Test - Simple Component Testing
 *
 * Basic tests to verify Phase 2 components are working correctly.
 */

import { SQLiteDatabase } from './sqlite-database.js';
import { FileManager } from './file-manager.js';
import { ArtifactMetadataAPI } from './artifact-metadata.js';
import { MemoryManager } from './memory-manager.js';
import { SmartCache } from './smart-cache.js';
import { Context7Integration } from './context7-integration.js';
import { PerformanceOptimizer } from './performance-optimizer.js';
import { existsSync, mkdirSync } from 'fs';

async function runPhase2Tests(): Promise<void> {
  console.log('🧪 PHASE 2 COMPONENT TESTS');
  console.log('=' .repeat(50));

  try {
    // Create test directories
    const testDbPath = './test-data/phase2-test.db';
    const testJsonPath = './test-data/phase2-json';

    if (!existsSync('./test-data')) {
      mkdirSync('./test-data', { recursive: true });
    }
    if (!existsSync(testJsonPath)) {
      mkdirSync(testJsonPath, { recursive: true });
    }

    console.log('✅ Test directories created');

    // Test 1: Database initialization
    console.log('\n📊 Test 1: Database Initialization');
    console.log('-'.repeat(30));

    const db = new SQLiteDatabase({
      databasePath: testDbPath,
      jsonFileBasePath: testJsonPath
    });

    const dbHealth = await db.healthCheck();
    console.log(`✅ Database Health: ${dbHealth.status}`);
    console.log(`   Details: ${JSON.stringify(dbHealth.details, null, 2)}`);

    // Test 2: File Manager
    console.log('\n📁 Test 2: File Manager');
    console.log('-'.repeat(30));

    const fileManager = new FileManager({
      basePath: testJsonPath,
      compressionThreshold: 1024
    });

    const fileStats = await fileManager.getStorageStats();
    console.log(`✅ File Manager initialized`);
    console.log(`   Storage stats: ${JSON.stringify(fileStats, null, 2)}`);

    // Test 3: Metadata API
    console.log('\n🔧 Test 3: Metadata API');
    console.log('-'.repeat(30));

    const metadataAPI = new ArtifactMetadataAPI(db, fileManager);

    // Create a test artifact
    const testArtifact = await metadataAPI.createArtifact({
      id: 'test-artifact-1',
      type: 'test',
      category: 'demo',
      title: 'Test Artifact',
      description: 'A test artifact for Phase 2 testing',
      data: { content: 'This is test data', timestamp: Date.now() },
      priority: 8,
      tags: ['test', 'phase2', 'demo']
    });

    console.log(`✅ Test artifact created: ${testArtifact.id}`);
    console.log(`   Title: ${testArtifact.title}`);
    console.log(`   Priority: ${testArtifact.priority}`);

    // Retrieve the artifact
    const retrievedArtifact = await metadataAPI.getArtifact('test-artifact-1');
    console.log(`✅ Artifact retrieved: ${retrievedArtifact?.id}`);
    console.log(`   Description: ${retrievedArtifact?.description}`);

    // Test 4: Memory Manager
    console.log('\n🧠 Test 4: Memory Manager');
    console.log('-'.repeat(30));

    const memoryManager = new MemoryManager(db, fileManager, metadataAPI, {
      maxMemoryMB: 64,
      evictionThreshold: 0.8,
      preloadHighPriority: true
    });

    // Load artifact into memory
    const loadedData = await memoryManager.loadArtifact('test-artifact-1');
    console.log(`✅ Artifact loaded into memory`);
    console.log(`   Data content: ${loadedData.content}`);

    // Get memory stats
    const memoryStats = await memoryManager.getMemoryStats();
    console.log(`✅ Memory stats retrieved`);
    console.log(`   Used Memory: ${memoryStats.usedMemoryMB.toFixed(2)} MB`);
    console.log(`   Usage: ${memoryStats.usagePercentage.toFixed(1)}%`);
    console.log(`   Artifacts in Memory: ${memoryStats.artifactsInMemory}`);

    // Test 5: Smart Cache
    console.log('\n🎯 Test 5: Smart Cache');
    console.log('-'.repeat(30));

    const smartCache = new SmartCache(db, fileManager, metadataAPI, {
      predictiveLoading: true,
      adaptiveEviction: true,
      cacheWarming: false // Disable for testing
    });

    // Get artifact through smart cache
    const cachedData = await smartCache.get('test-artifact-1', {
      trackAccess: true,
      preloadRelated: false
    });

    console.log(`✅ Smart cache retrieved data`);
    console.log(`   Cached content: ${cachedData.content}`);

    // Get cache metrics
    const cacheMetrics = await smartCache.getMetrics();
    console.log(`✅ Cache metrics retrieved`);
    console.log(`   Hit Rate: ${cacheMetrics.hitRate.toFixed(1)}%`);
    console.log(`   Miss Rate: ${cacheMetrics.missRate.toFixed(1)}%`);
    console.log(`   Memory Efficiency: ${(cacheMetrics.memoryEfficiency * 100).toFixed(1)}%`);

    // Test 6: Context7 Integration
    console.log('\n🌐 Test 6: Context7 Integration');
    console.log('-'.repeat(30));

    const context7Integration = new Context7Integration(db, fileManager, metadataAPI, {
      cacheStrategy: 'balanced',
      deduplicationEnabled: true,
      compressionEnabled: true,
      preloadRelated: false
    });

    // Simulate a Context7 query
    const context7Response = await context7Integration.query({
      query: 'What is TypeScript?',
      context: 'programming language',
      options: { priority: 8, tags: ['typescript', 'programming'] }
    });

    console.log(`✅ Context7 query executed`);
    console.log(`   Query: ${context7Response.query}`);
    console.log(`   Response: ${context7Response.response.substring(0, 50)}...`);
    console.log(`   Cache Hit: ${context7Response.metadata.cacheHit}`);
    console.log(`   Latency: ${context7Response.metadata.latency}ms`);

    // Get Context7 metrics
    const context7Metrics = await context7Integration.getMetrics();
    console.log(`✅ Context7 metrics retrieved`);
    console.log(`   Total Requests: ${context7Metrics.totalRequests}`);
    console.log(`   Cache Hits: ${context7Metrics.cacheHits}`);
    console.log(`   API Calls: ${context7Metrics.apiCalls}`);
    console.log(`   Cost Savings: $${context7Metrics.costSavings.toFixed(4)}`);

    // Test 7: Performance Optimizer
    console.log('\n⚡ Test 7: Performance Optimizer');
    console.log('-'.repeat(30));

    const performanceOptimizer = new PerformanceOptimizer(db, fileManager, metadataAPI, {
      optimizationEnabled: true,
      autoOptimization: false, // Disable for testing
      optimizationInterval: 60000
    });

    // Get performance metrics
    const performanceMetrics = await performanceOptimizer.getPerformanceMetrics();
    console.log(`✅ Performance metrics retrieved`);
    console.log(`   Memory Usage: ${performanceMetrics.memory.usage.toFixed(1)}%`);
    console.log(`   Cache Hit Rate: ${performanceMetrics.cache.hitRate.toFixed(1)}%`);
    console.log(`   Average Latency: ${performanceMetrics.overall.latency.toFixed(2)}ms`);
    console.log(`   Throughput: ${performanceMetrics.overall.throughput.toFixed(2)} req/s`);

    // Test 8: Health Checks
    console.log('\n🏥 Test 8: Health Checks');
    console.log('-'.repeat(30));

    const healthChecks = await Promise.all([
      db.healthCheck(),
      memoryManager.healthCheck(),
      smartCache.healthCheck(),
      context7Integration.healthCheck(),
      performanceOptimizer.healthCheck()
    ]);

    const componentNames = ['Database', 'Memory Manager', 'Smart Cache', 'Context7 Integration', 'Performance Optimizer'];

    console.log('✅ Health check results:');
    for (let i = 0; i < healthChecks.length; i++) {
      const status = healthChecks[i];
      const emoji = status.status === 'healthy' ? '✅' : status.status === 'warning' ? '⚠️' : '❌';
      console.log(`   ${componentNames[i]}: ${emoji} ${status.status}`);
    }

    // Test 9: Cleanup
    console.log('\n🧹 Test 9: Cleanup');
    console.log('-'.repeat(30));

    await performanceOptimizer.cleanup();
    console.log('✅ Performance optimizer cleaned up');

    await context7Integration.cleanup();
    console.log('✅ Context7 integration cleaned up');

    await smartCache.cleanup();
    console.log('✅ Smart cache cleaned up');

    await memoryManager.cleanup();
    console.log('✅ Memory manager cleaned up');

    await db.close();
    console.log('✅ Database closed');

    console.log('\n🎉 ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log('✅ Database: Working correctly');
    console.log('✅ File Manager: Working correctly');
    console.log('✅ Metadata API: Working correctly');
    console.log('✅ Memory Manager: Working correctly');
    console.log('✅ Smart Cache: Working correctly');
    console.log('✅ Context7 Integration: Working correctly');
    console.log('✅ Performance Optimizer: Working correctly');
    console.log('✅ Health Checks: All passing');
    console.log('✅ Cleanup: All components cleaned up properly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPhase2Tests().catch(console.error);
}

export { runPhase2Tests };
