#!/usr/bin/env node

/**
 * Simple Test - Basic Component Verification
 */

import { existsSync, mkdirSync } from 'fs';

async function runSimpleTest(): Promise<void> {
  console.log('🧪 SIMPLE COMPONENT TEST');
  console.log('=' .repeat(40));

  try {
    // Test 1: File system operations
    console.log('\n📁 Test 1: File System Operations');
    console.log('-'.repeat(30));

    const testDir = './test-data/simple-test';
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
      console.log('✅ Test directory created');
    } else {
      console.log('✅ Test directory already exists');
    }

    // Test 2: Basic imports
    console.log('\n📦 Test 2: Module Imports');
    console.log('-'.repeat(30));

    try {
      const { SQLiteDatabase } = await import('./sqlite-database.js');
      console.log('✅ SQLiteDatabase imported successfully');

      const { FileManager } = await import('./file-manager.js');
      console.log('✅ FileManager imported successfully');

      const { ArtifactMetadataAPI } = await import('./artifact-metadata.js');
      console.log('✅ ArtifactMetadataAPI imported successfully');

      const { MemoryManager } = await import('./memory-manager.js');
      console.log('✅ MemoryManager imported successfully');

      const { SmartCache } = await import('./smart-cache.js');
      console.log('✅ SmartCache imported successfully');

      const { Context7Integration } = await import('./context7-integration.js');
      console.log('✅ Context7Integration imported successfully');

      const { PerformanceOptimizer } = await import('./performance-optimizer.js');
      console.log('✅ PerformanceOptimizer imported successfully');

    } catch (importError) {
      console.error('❌ Import failed:', importError);
      throw importError;
    }

    // Test 3: Basic instantiation
    console.log('\n🔧 Test 3: Component Instantiation');
    console.log('-'.repeat(30));

    try {
      const { SQLiteDatabase } = await import('./sqlite-database.js');
      const { FileManager } = await import('./file-manager.js');
      const { ArtifactMetadataAPI } = await import('./artifact-metadata.js');

      const db = new SQLiteDatabase({
        databasePath: './test-data/simple-test/test.db',
        jsonFileBasePath: './test-data/simple-test/json'
      });
      console.log('✅ SQLiteDatabase instantiated');

      const fileManager = new FileManager({
        basePath: './test-data/simple-test/json'
      });
      console.log('✅ FileManager instantiated');

      const metadataAPI = new ArtifactMetadataAPI(db, fileManager);
      console.log('✅ ArtifactMetadataAPI instantiated');

    } catch (instantiationError) {
      console.error('❌ Instantiation failed:', instantiationError);
      throw instantiationError;
    }

    console.log('\n🎉 SIMPLE TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(40));
    console.log('✅ All modules imported correctly');
    console.log('✅ Basic components instantiated successfully');
    console.log('✅ Phase 2 architecture is ready for testing');

  } catch (error) {
    console.error('❌ Simple test failed:', error);
    throw error;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleTest().catch(console.error);
}

export { runSimpleTest };
