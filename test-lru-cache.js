// Test LRU cache implementation
import { ResponseCacheLRU, createResponseCacheLRU, defaultCacheConfigLRU } from './dist/core/response-cache-lru.js';

async function testLRUCache() {
  console.log('🧪 Testing LRU Cache Implementation\n');

  // Create cache instance
  const cache = new ResponseCacheLRU({
    maxSize: 5,
    ttl: 5000, // 5 seconds
    updateAgeOnGet: true
  });

  console.log('1. Testing basic set/get operations...');

  // Test set/get
  await cache.set('key1', { data: 'test1', timestamp: Date.now() });
  const result1 = await cache.get('key1');
  console.log('✅ Set/Get test:', result1 ? 'PASS' : 'FAIL');
  console.log('   Result:', result1);

  console.log('\n2. Testing cache hit/miss metrics...');

  // Test cache miss
  const result2 = await cache.get('nonexistent');
  console.log('✅ Cache miss test:', result2 === null ? 'PASS' : 'FAIL');

  // Test cache hit
  const result3 = await cache.get('key1');
  console.log('✅ Cache hit test:', result3 ? 'PASS' : 'FAIL');

  console.log('\n3. Testing cache metrics...');
  const metrics = await cache.getMetrics();
  console.log('📊 Cache Metrics:');
  console.log('   Hits:', metrics.hits);
  console.log('   Misses:', metrics.misses);
  console.log('   Hit Rate:', (metrics.hitRate * 100).toFixed(1) + '%');
  console.log('   Cache Size:', metrics.cacheSize);
  console.log('   Total Requests:', metrics.totalRequests);

  console.log('\n4. Testing LRU eviction...');

  // Fill cache beyond max size
  for (let i = 1; i <= 7; i++) {
    await cache.set(`key${i}`, { data: `test${i}`, timestamp: Date.now() });
  }

  const metricsAfter = await cache.getMetrics();
  console.log('✅ LRU eviction test:', metricsAfter.cacheSize <= 5 ? 'PASS' : 'FAIL');
  console.log('   Cache size after overflow:', metricsAfter.cacheSize);

  console.log('\n5. Testing TTL expiration...');

  // Wait for TTL to expire
  console.log('   Waiting 6 seconds for TTL expiration...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  const expiredResult = await cache.get('key1');
  console.log('✅ TTL expiration test:', expiredResult === null ? 'PASS' : 'FAIL');

  console.log('\n6. Testing health check...');
  const health = await cache.healthCheck();
  console.log('✅ Health check test:', health.status === 'healthy' ? 'PASS' : 'FAIL');
  console.log('   Health details:', health.details);

  console.log('\n🏁 LRU Cache Test Complete!');
}

testLRUCache().catch(console.error);
