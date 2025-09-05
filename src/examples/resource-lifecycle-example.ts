/**
 * Resource Lifecycle Management Example
 *
 * Demonstrates the ResourceLifecycleManager and EnhancedMCPResource functionality
 */

import { ResourceLifecycleManager } from '../framework/resource-lifecycle-manager.js';
import { EnhancedMCPResource } from '../framework/enhanced-mcp-resource.js';

// Example enhanced resource implementation
class ExampleEnhancedResource extends EnhancedMCPResource {
  protected async initializeInternal(): Promise<void> {
    console.log('Example resource initialized');
  }

  protected async createConnection(): Promise<any> {
    return { id: `conn_${Date.now()}` };
  }

  protected async closeConnection(connection: any): Promise<void> {
    console.log(`Connection ${connection.id} closed`);
  }

  protected getConnectionId(connection: any): string {
    return connection.id;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async cleanup(): Promise<void> {
    console.log('Example resource cleaned up');
  }
}

/**
 * Example usage of ResourceLifecycleManager
 */
async function demonstrateResourceLifecycle() {
  console.log('=== Resource Lifecycle Management Demo ===\n');

  // Create lifecycle manager
  const lifecycleManager = new ResourceLifecycleManager(
    {
      maxIdleTime: 5000, // 5 seconds
      maxMemoryUsage: 1024 * 1024, // 1MB
      cleanupInterval: 2000, // 2 seconds
      forceCleanupThreshold: 10000 // 10 seconds
    },
    {
      healthCheckInterval: 1000, // 1 second
      metricsCollectionInterval: 500, // 500ms
      alertThresholds: {
        memoryUsage: 80,
        errorRate: 10,
        responseTime: 1000
      }
    }
  );

  // Create example resources
  const resource1 = new ExampleEnhancedResource({
    name: 'example-resource-1',
    type: 'file',
    description: 'Example resource 1',
    version: '1.0.0',
    connectionConfig: {},
    lifecycleManagement: {
      enabled: true,
      maxIdleTime: 3000,
      maxMemoryUsage: 512 * 1024,
      healthCheckInterval: 500
    }
  });

  const resource2 = new ExampleEnhancedResource({
    name: 'example-resource-2',
    type: 'database',
    description: 'Example resource 2',
    version: '1.0.0',
    connectionConfig: {},
    lifecycleManagement: {
      enabled: true,
      maxIdleTime: 4000,
      maxMemoryUsage: 768 * 1024,
      healthCheckInterval: 750
    }
  });

  // Register resources with lifecycle manager
  lifecycleManager.registerResource(resource1);
  lifecycleManager.registerResource(resource2);

  // Start lifecycle management
  lifecycleManager.start();

  console.log('Resources registered and lifecycle management started\n');

  // Simulate some operations
  console.log('=== Simulating Operations ===');

  // Execute some operations on resource1
  for (let i = 0; i < 5; i++) {
    await resource1.execute(async (connection) => {
      console.log(`Resource1 operation ${i + 1} using connection ${connection.id}`);
      return `result-${i + 1}`;
    });
  }

  // Execute some operations on resource2
  for (let i = 0; i < 3; i++) {
    await resource2.execute(async (connection) => {
      console.log(`Resource2 operation ${i + 1} using connection ${connection.id}`);
      return `result-${i + 1}`;
    });
  }

  // Wait a bit to let the lifecycle manager work
  console.log('\n=== Waiting for Lifecycle Manager to Work ===');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get metrics
  console.log('\n=== Resource Metrics ===');
  const allMetrics = lifecycleManager.getAllMetrics();
  allMetrics.forEach(metrics => {
    console.log(`Resource: ${metrics.resourceName}`);
    console.log(`  Type: ${metrics.resourceType}`);
    console.log(`  Active Connections: ${metrics.activeConnections}`);
    console.log(`  Pool Size: ${metrics.poolSize}`);
    console.log(`  Memory Usage: ${metrics.memoryUsage} bytes`);
    console.log(`  Total Operations: ${metrics.totalOperations}`);
    console.log(`  Error Count: ${metrics.errorCount}`);
    console.log(`  Health Status: ${metrics.healthStatus}`);
    console.log('');
  });

  // Get health summary
  console.log('=== Health Summary ===');
  const healthSummary = lifecycleManager.getHealthSummary();
  console.log(`Total Resources: ${healthSummary.totalResources}`);
  console.log(`Healthy: ${healthSummary.healthy}`);
  console.log(`Degraded: ${healthSummary.degraded}`);
  console.log(`Unhealthy: ${healthSummary.unhealthy}`);
  console.log(`Total Memory Usage: ${healthSummary.totalMemoryUsage} bytes`);
  console.log(`Average Response Time: ${healthSummary.averageResponseTime.toFixed(2)}ms`);

  // Get resource statistics
  console.log('\n=== Resource Statistics ===');
  const stats1 = resource1.getStatistics();
  console.log(`Resource1 Statistics:`);
  console.log(`  Operations: ${stats1.operationCount}`);
  console.log(`  Errors: ${stats1.errorCount}`);
  console.log(`  Error Rate: ${stats1.errorRate.toFixed(2)}%`);
  console.log(`  Average Execution Time: ${stats1.averageExecutionTime.toFixed(2)}ms`);
  console.log(`  Memory Usage: ${stats1.memoryUsage} bytes`);

  const stats2 = resource2.getStatistics();
  console.log(`Resource2 Statistics:`);
  console.log(`  Operations: ${stats2.operationCount}`);
  console.log(`  Errors: ${stats2.errorCount}`);
  console.log(`  Error Rate: ${stats2.errorRate.toFixed(2)}%`);
  console.log(`  Average Execution Time: ${stats2.averageExecutionTime.toFixed(2)}ms`);
  console.log(`  Memory Usage: ${stats2.memoryUsage} bytes`);

  // Get health status
  console.log('\n=== Health Status ===');
  const health1 = resource1.getHealthStatus();
  console.log(`Resource1 Health: ${health1.status}`);
  if (health1.issues.length > 0) {
    console.log(`  Issues: ${health1.issues.join(', ')}`);
  }
  if (health1.recommendations.length > 0) {
    console.log(`  Recommendations: ${health1.recommendations.join(', ')}`);
  }

  const health2 = resource2.getHealthStatus();
  console.log(`Resource2 Health: ${health2.status}`);
  if (health2.issues.length > 0) {
    console.log(`  Issues: ${health2.issues.join(', ')}`);
  }
  if (health2.recommendations.length > 0) {
    console.log(`  Recommendations: ${health2.recommendations.join(', ')}`);
  }

  // Wait a bit more to see cleanup in action
  console.log('\n=== Waiting for Cleanup ===');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Stop lifecycle management
  console.log('\n=== Stopping Lifecycle Management ===');
  lifecycleManager.stop();

  // Cleanup resources
  console.log('\n=== Cleaning Up Resources ===');
  await resource1.destroy();
  await resource2.destroy();

  // Destroy lifecycle manager
  await lifecycleManager.destroy();

  console.log('\n=== Demo Complete ===');
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateResourceLifecycle().catch(console.error);
}

export { demonstrateResourceLifecycle };
