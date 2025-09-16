#!/usr/bin/env node

/**
 * Hybrid SQLite + JSON Architecture Demo
 *
 * Demonstrates the working implementation of the hybrid architecture
 * for TappMCP's Context7 cache system.
 */

import { createSQLiteDatabase } from './sqlite-database.js';
import { createFileManager } from './file-manager.js';
import { join } from 'path';

async function runDemo() {
  console.log('🚀 Starting Hybrid SQLite + JSON Architecture Demo\n');

  // Initialize components
  const db = createSQLiteDatabase({
    databasePath: './demo-data/tappmcp.db',
    jsonFileBasePath: './demo-data/json'
  });

  const fileManager = createFileManager({
    basePath: './demo-data/json'
  });

  try {
    // Test 1: Store Context7-like data
    console.log('📝 Test 1: Storing Context7 Knowledge Data');

    const context7Data = {
      id: 'ctx7-knowledge-1',
      source: 'context7',
      type: 'documentation',
      title: 'TypeScript Best Practices',
      content: `
        TypeScript Best Practices:
        1. Use strict mode
        2. Enable noImplicitAny
        3. Use interfaces for object shapes
        4. Prefer type over interface for unions
        5. Use readonly for immutable data
      `,
      relevanceScore: 0.95,
      retrievalTime: Date.now(),
      metadata: {
        domain: 'typescript',
        category: 'best-practices',
        tags: ['typescript', 'programming', 'best-practices']
      }
    };

    // Store in file system
    const pointer = await fileManager.storeData(
      'ctx7-knowledge-1',
      'context7',
      'knowledge',
      context7Data
    );

    console.log(`✅ Data stored in file: ${pointer.filePath}`);
    console.log(`   Size: ${pointer.size} bytes`);
    console.log(`   Compressed: ${pointer.compressed}`);
    console.log(`   Checksum: ${pointer.checksum.substring(0, 16)}...`);

    // Store metadata in database
    const artifactId = await db.storeArtifact({
      id: 'ctx7-knowledge-1',
      type: 'context7',
      category: 'knowledge',
      title: 'TypeScript Best Practices',
      filePath: pointer.filePath,
      fileSize: pointer.size,
      metadata: { source: 'context7', domain: 'typescript' },
      priority: 8,
      tags: ['typescript', 'programming', 'best-practices'],
      compressed: pointer.compressed,
      checksum: pointer.checksum
    });

    console.log(`✅ Metadata stored in database: ${artifactId}\n`);

    // Test 2: Retrieve data
    console.log('🔍 Test 2: Retrieving Data');

    const artifact = await db.getArtifact('ctx7-knowledge-1');
    if (artifact) {
      console.log(`✅ Artifact retrieved from database:`);
      console.log(`   ID: ${artifact.id}`);
      console.log(`   Type: ${artifact.type}`);
      console.log(`   Priority: ${artifact.priority}`);
      console.log(`   Access Count: ${artifact.accessCount}`);

      // Load actual data from file
      const fileResult = await fileManager.loadData({
        filePath: artifact.filePath,
        size: artifact.fileSize,
        checksum: artifact.checksum || '',
        compressed: artifact.compressed,
        createdAt: artifact.createdAt,
        lastAccessed: artifact.lastAccessed
      });

      if (fileResult.success) {
        console.log(`✅ Data loaded from file:`);
        console.log(`   Title: ${fileResult.data.title}`);
        console.log(`   Content Length: ${fileResult.data.content.length} chars`);
        console.log(`   Relevance Score: ${fileResult.data.relevanceScore}`);
      }
    }

    console.log('\n');

    // Test 3: Search functionality
    console.log('🔎 Test 3: Search Functionality');

    // Store more test data
    const testData2 = {
      id: 'ctx7-knowledge-2',
      title: 'React Performance Optimization',
      content: 'React performance tips...',
      metadata: { domain: 'react', category: 'performance' }
    };

    const pointer2 = await fileManager.storeData('ctx7-knowledge-2', 'context7', 'knowledge', testData2);
    await db.storeArtifact({
      id: 'ctx7-knowledge-2',
      type: 'context7',
      category: 'knowledge',
      title: 'React Performance Optimization',
      filePath: pointer2.filePath,
      fileSize: pointer2.size,
      metadata: { source: 'context7', domain: 'react' },
      priority: 7,
      tags: ['react', 'performance', 'optimization'],
      compressed: pointer2.compressed,
      checksum: pointer2.checksum
    });

    // Search by type
    const context7Results = await db.searchArtifacts({ type: 'context7' });
    console.log(`✅ Found ${context7Results.length} Context7 artifacts`);

    // Search by tags
    const typescriptResults = await db.searchArtifacts({ tags: ['typescript'] });
    console.log(`✅ Found ${typescriptResults.length} TypeScript-related artifacts`);

    console.log('\n');

    // Test 4: Statistics
    console.log('📊 Test 4: Statistics and Monitoring');

    const dbStats = await db.getStats();
    console.log(`✅ Database Statistics:`);
    console.log(`   Total Artifacts: ${dbStats.totalArtifacts}`);
    console.log(`   Total File Size: ${dbStats.totalFileSize} bytes`);
    console.log(`   Average Access Count: ${dbStats.averageAccessCount.toFixed(2)}`);
    console.log(`   By Type:`, dbStats.artifactsByType);

    const fileStats = await fileManager.getStorageStats();
    console.log(`✅ File System Statistics:`);
    console.log(`   Total Files: ${fileStats.totalFiles}`);
    console.log(`   Total Size: ${fileStats.totalSize} bytes`);
    console.log(`   Average File Size: ${fileStats.averageFileSize.toFixed(2)} bytes`);
    console.log(`   Files by Type:`, fileStats.filesByType);

    console.log('\n');

    // Test 5: Health Check
    console.log('🏥 Test 5: Health Check');

    const health = await db.healthCheck();
    console.log(`✅ Database Health: ${health.status}`);
    console.log(`   Details:`, health.details);

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ SQLite database with metadata storage');
    console.log('   ✅ JSON file storage with compression');
    console.log('   ✅ File pointer tracking and integrity checks');
    console.log('   ✅ Search and filtering capabilities');
    console.log('   ✅ Statistics and monitoring');
    console.log('   ✅ Health checks and error handling');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await db.close();
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };
