import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResourceLifecycleManager } from './resource-lifecycle-manager.js';
import { MCPResource } from './mcp-resource.js';
// Mock MCPResource for testing
class MockMCPResource extends MCPResource {
    async initializeInternal() {
        // Mock implementation
    }
    async createConnection() {
        return { id: `conn_${Date.now()}` };
    }
    async closeConnection(_connection) {
        // Mock implementation
    }
    getConnectionId(connection) {
        return connection.id;
    }
    async healthCheck() {
        return true;
    }
    async cleanup() {
        // Mock implementation
    }
}
describe('ResourceLifecycleManager', () => {
    let manager;
    let mockResource;
    let mockLogger;
    beforeEach(() => {
        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };
        manager = new ResourceLifecycleManager({
            maxIdleTime: 1000, // 1 second for testing
            maxMemoryUsage: 1024 * 1024, // 1MB for testing
            cleanupInterval: 500, // 500ms for testing
            forceCleanupThreshold: 2000, // 2 seconds for testing
        }, {
            healthCheckInterval: 100, // 100ms for testing
            metricsCollectionInterval: 50, // 50ms for testing
            alertThresholds: {
                memoryUsage: 80,
                errorRate: 10,
                responseTime: 1000,
            },
        }, mockLogger);
        mockResource = new MockMCPResource({
            name: 'test-resource',
            type: 'file',
            description: 'Test resource',
            version: '1.0.0',
            connectionConfig: {},
        });
    });
    afterEach(async () => {
        await manager.destroy();
        vi.clearAllMocks();
    });
    describe('Resource Registration', () => {
        it('should register a resource successfully', () => {
            manager.registerResource(mockResource);
            const metrics = manager.getResourceMetrics('test-resource');
            expect(metrics).toBeDefined();
            expect(metrics?.resourceName).toBe('test-resource');
            expect(metrics?.resourceType).toBe('file');
            expect(metrics?.healthStatus).toBe('healthy');
        });
        it('should log resource registration', () => {
            manager.registerResource(mockResource);
            expect(mockLogger.info).toHaveBeenCalledWith('Resource registered for lifecycle management', expect.objectContaining({
                resourceName: 'test-resource',
                resourceType: 'file',
            }));
        });
    });
    describe('Lifecycle Management', () => {
        beforeEach(() => {
            manager.registerResource(mockResource);
        });
        it('should start lifecycle management', () => {
            manager.start();
            expect(mockLogger.info).toHaveBeenCalledWith('Resource lifecycle management started', expect.objectContaining({
                cleanupInterval: 500,
                monitoringInterval: 50,
            }));
        });
        it('should stop lifecycle management', () => {
            manager.start();
            manager.stop();
            expect(mockLogger.info).toHaveBeenCalledWith('Resource lifecycle management stopped', expect.any(Object));
        });
        it('should not start if already running', () => {
            manager.start();
            const firstCallCount = mockLogger.info.mock.calls.length;
            manager.start(); // Second start should be ignored
            const secondCallCount = mockLogger.info.mock.calls.length;
            expect(secondCallCount).toBe(firstCallCount);
        });
    });
    describe('Metrics Collection', () => {
        beforeEach(() => {
            manager.registerResource(mockResource);
        });
        it('should collect metrics for all resources', () => {
            const metrics = manager.getAllMetrics();
            expect(metrics).toHaveLength(1);
            expect(metrics[0].resourceName).toBe('test-resource');
            expect(metrics[0].resourceType).toBe('file');
        });
        it('should get metrics for specific resource', () => {
            const metrics = manager.getResourceMetrics('test-resource');
            expect(metrics).toBeDefined();
            expect(metrics?.resourceName).toBe('test-resource');
        });
        it('should return undefined for non-existent resource', () => {
            const metrics = manager.getResourceMetrics('non-existent');
            expect(metrics).toBeUndefined();
        });
        it('should update operation metrics', () => {
            manager.updateOperationMetrics('test-resource', 100, true);
            const metrics = manager.getResourceMetrics('test-resource');
            expect(metrics?.totalOperations).toBe(1);
            expect(metrics?.errorCount).toBe(0);
            expect(metrics?.averageResponseTime).toBe(100);
        });
        it('should update error metrics', () => {
            manager.updateOperationMetrics('test-resource', 200, false);
            const metrics = manager.getResourceMetrics('test-resource');
            expect(metrics?.totalOperations).toBe(1);
            expect(metrics?.errorCount).toBe(1);
            expect(metrics?.averageResponseTime).toBe(200);
        });
    });
    describe('Health Summary', () => {
        beforeEach(() => {
            manager.registerResource(mockResource);
        });
        it('should provide health summary', () => {
            const summary = manager.getHealthSummary();
            expect(summary.totalResources).toBe(1);
            expect(summary.healthy).toBe(1);
            expect(summary.degraded).toBe(0);
            expect(summary.unhealthy).toBe(0);
            expect(summary.totalMemoryUsage).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Configuration Management', () => {
        it('should get cleanup configuration', () => {
            const config = manager.getCleanupConfig();
            expect(config.maxIdleTime).toBe(1000);
            expect(config.maxMemoryUsage).toBe(1024 * 1024);
            expect(config.cleanupInterval).toBe(500);
            expect(config.forceCleanupThreshold).toBe(2000);
        });
        it('should update cleanup configuration', () => {
            manager.updateCleanupConfig({ maxIdleTime: 2000 });
            const config = manager.getCleanupConfig();
            expect(config.maxIdleTime).toBe(2000);
        });
        it('should get monitoring configuration', () => {
            const config = manager.getMonitoringConfig();
            expect(config.healthCheckInterval).toBe(100);
            expect(config.metricsCollectionInterval).toBe(50);
            expect(config.alertThresholds.memoryUsage).toBe(80);
        });
        it('should update monitoring configuration', () => {
            manager.updateMonitoringConfig({ healthCheckInterval: 200 });
            const config = manager.getMonitoringConfig();
            expect(config.healthCheckInterval).toBe(200);
        });
    });
    describe('Force Cleanup', () => {
        beforeEach(() => {
            manager.registerResource(mockResource);
        });
        it('should perform force cleanup of all resources', async () => {
            await manager.forceCleanupAll();
            expect(mockLogger.info).toHaveBeenCalledWith('Force cleanup of all resources initiated', expect.any(Object));
            expect(mockLogger.info).toHaveBeenCalledWith('Force cleanup of all resources completed', expect.any(Object));
        });
    });
    describe('Destroy', () => {
        beforeEach(() => {
            manager.registerResource(mockResource);
        });
        it('should destroy manager and cleanup resources', async () => {
            manager.start();
            await manager.destroy();
            expect(mockLogger.info).toHaveBeenCalledWith('Resource lifecycle manager destroyed', expect.any(Object));
        });
    });
    describe('Error Handling', () => {
        it('should handle resource cleanup errors gracefully', async () => {
            const errorResource = new MockMCPResource({
                name: 'error-resource',
                type: 'file',
                description: 'Error resource',
                version: '1.0.0',
                connectionConfig: {},
            });
            // Mock cleanup to throw error
            vi.spyOn(errorResource, 'cleanup').mockRejectedValue(new Error('Cleanup failed'));
            manager.registerResource(errorResource);
            await manager.forceCleanupAll();
            expect(mockLogger.error).toHaveBeenCalledWith('Resource cleanup failed', expect.objectContaining({
                resourceName: 'error-resource',
                error: 'Cleanup failed',
            }));
        });
    });
});
//# sourceMappingURL=resource-lifecycle-manager.test.js.map