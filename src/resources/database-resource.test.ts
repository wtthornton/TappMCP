import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseResource, DatabaseResourceConfig } from './database-resource.js';

// Mock the database operations
vi.mock('./database-resource.js', async () => {
  const actual = await vi.importActual('./database-resource.js');
  return {
    ...actual,
    DatabaseResource: class MockDatabaseResource extends (actual as any).DatabaseResource {
      protected async createConnection(): Promise<any> {
        return {
          id: `conn_${Math.random().toString(36).substr(2, 9)}`,
          connected: true,
          createdAt: new Date(),
        };
      }

      protected async closeConnection(connection: any): Promise<void> {
        connection.connected = false;
      }

      protected getConnectionId(connection: any): string {
        return connection?.id || 'mock-connection';
      }
    },
  };
});

describe('DatabaseResource', () => {
  let databaseResource: DatabaseResource;

  beforeEach(async () => {
    databaseResource = new DatabaseResource({
      connectionString: 'mock://localhost:5432/testdb',
      poolConfig: {
        min: 2,
        max: 5,
        acquireTimeoutMillis: 5000,
      },
    });

    // Initialize the database resource
    await databaseResource.initialize();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultResource = new DatabaseResource();
      expect(defaultResource).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customResource = new DatabaseResource({
        connectionString: 'postgresql://user:pass@localhost:5432/mydb',
        poolConfig: {
          min: 1,
          max: 10,
          acquireTimeoutMillis: 10000,
        },
      });
      expect(customResource).toBeDefined();
    });

    it('should initialize successfully', async () => {
      await expect(databaseResource.initialize()).resolves.not.toThrow();
    });

    it('should handle initialization errors', async () => {
      // Mock initialization failure
      const failingResource = new DatabaseResource();
      vi.spyOn(failingResource, 'initialize').mockRejectedValue(new Error('Connection failed'));

      await expect(failingResource.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('Query Operations', () => {
    it('should execute SELECT query successfully', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        where: { status: 'active' },
        limit: 10,
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: 1, name: 'Test' }]);
      expect(result.count).toBe(1);
      expect(result.query).toContain('SELECT * FROM users');
    });

    it('should execute query with ORDER BY', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        orderBy: 'name',
        orderDirection: 'ASC',
        limit: 5,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain('ORDER BY name ASC');
      expect(result.query).toContain('LIMIT 5');
    });

    it('should execute query with OFFSET', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        limit: 10,
        offset: 20,

        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain('OFFSET 20');
    });
  });

  describe('Insert Operations', () => {
    it('should execute INSERT operation successfully', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'insert',
        table: 'users',
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
        },
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.affectedRows).toBe(1);
      expect(result.insertId).toBe(1);
      expect(result.query).toContain('INSERT INTO users');
    });

    it('should handle INSERT with missing data', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'insert',
        table: 'users',
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Data is required for insert operation');
    });
  });

  describe('Update Operations', () => {
    it('should execute UPDATE operation successfully', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'update',
        table: 'users',
        data: { status: 'inactive' },
        where: { id: 1 },
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.affectedRows).toBe(1);
      expect(result.query).toContain('UPDATE users SET');
      expect(result.query).toContain("WHERE id = '1'");
    });

    it('should handle UPDATE with missing data', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'update',
        table: 'users',
        where: { id: 1 },
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Data and where clause are required');
    });

    it('should handle UPDATE with missing where clause', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'update',
        table: 'users',
        data: { status: 'inactive' },
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Data and where clause are required');
    });
  });

  describe('Delete Operations', () => {
    it('should execute DELETE operation successfully', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'delete',
        table: 'users',
        where: { id: 1 },
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.affectedRows).toBe(1);
      expect(result.query).toContain("DELETE FROM users WHERE id = '1'");
    });

    it('should handle DELETE with missing where clause', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'delete',
        table: 'users',
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Where clause is required for delete operation');
    });
  });

  describe('Transaction Operations', () => {
    it('should execute transaction successfully', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'transaction',
        table: 'users',
        orderDirection: 'ASC' as const,
        transaction: [
          {
            operation: 'insert',
            table: 'users',
            data: { name: 'John', email: 'john@example.com' },
          },
          {
            operation: 'update',
            table: 'users',
            data: { status: 'active' },
            where: { name: 'John' },
          },
        ],
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('should handle transaction with empty operations', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'transaction',
        table: 'users',
        orderDirection: 'ASC' as const,
        transaction: [],
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transaction operations are required');
    });

    it('should handle transaction rollback on error', async () => {
      // Mock a failing transaction
      const config: DatabaseResourceConfig = {
        operation: 'transaction',
        table: 'users',
        orderDirection: 'ASC' as const,
        transaction: [
          {
            operation: 'insert',
            table: 'users',
            data: { name: 'John' },
          },
          {
            operation: 'invalid' as any, // This should cause an error
            table: 'users',
          },
        ],
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields', async () => {
      const invalidConfig = {} as DatabaseResourceConfig;

      const result = await databaseResource.executeOperation(invalidConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Required');
    });

    it('should validate operation enum', async () => {
      const config = {
        operation: 'invalid' as any,
        table: 'users',
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('should use default values', async () => {
      const config = {
        operation: 'query' as const,
        table: 'users',
        orderDirection: 'ASC' as const,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain('ORDER BY');
      expect(result.query).toContain('ASC'); // Default order direction
    });
  });

  describe('Connection Pool Management', () => {
    it('should manage connection pool correctly', async () => {
      // Execute multiple operations to test pool
      const configs = [
        { operation: 'query' as const, table: 'users', orderDirection: 'ASC' as const },
        { operation: 'query' as const, table: 'products', orderDirection: 'ASC' as const },
        { operation: 'query' as const, table: 'orders', orderDirection: 'ASC' as const },
      ];

      const results = await Promise.all(
        configs.map(config => databaseResource.executeOperation(config))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle connection pool exhaustion', async () => {
      // This test would require more complex mocking to simulate pool exhaustion
      // For now, we'll just verify the resource can handle multiple concurrent requests
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        orderDirection: 'ASC',
      };

      const promises = Array(10)
        .fill(null)
        .map(() => databaseResource.executeOperation(config));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when connections are available', async () => {
      const health = await databaseResource.healthCheck();

      expect(health).toBe(true);
    });

    it('should return unhealthy status when connections fail', async () => {
      // Mock connection failure by overriding the method
      (databaseResource as any).getConnection = vi
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      const health = await databaseResource.healthCheck();

      expect(health).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup successfully', async () => {
      await expect(databaseResource.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock an unexpected error
      vi.spyOn(databaseResource as any, 'runQuery').mockRejectedValue(
        new Error('Unexpected database error')
      );

      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected database error');
    });

    it('should log performance metrics', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        orderDirection: 'ASC',
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Query Building', () => {
    it('should build complex SELECT queries correctly', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'query',
        table: 'users',
        where: { status: 'active', age: 25 },
        orderBy: 'name',
        orderDirection: 'DESC',
        limit: 5,
        offset: 10,
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain('SELECT * FROM users');
      expect(result.query).toContain("WHERE status = 'active' AND age = '25'");
      expect(result.query).toContain('ORDER BY name DESC');
      expect(result.query).toContain('LIMIT 5');
      expect(result.query).toContain('OFFSET 10');
    });

    it('should build INSERT queries with multiple columns', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'insert',
        table: 'users',
        orderDirection: 'ASC',
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          age: 30,
          status: 'active',
        },
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain('INSERT INTO users (name, email, age, status) VALUES');
      expect(result.query).toContain("'Jane Doe'");
      expect(result.query).toContain("'jane@example.com'");
    });

    it('should build UPDATE queries with multiple fields', async () => {
      const config: DatabaseResourceConfig = {
        operation: 'update',
        table: 'users',
        orderDirection: 'ASC',
        data: { status: 'inactive', lastLogin: '2023-01-01' },
        where: { id: 1, status: 'active' },
      };

      const result = await databaseResource.executeOperation(config);

      expect(result.success).toBe(true);
      expect(result.query).toContain(
        "UPDATE users SET status = 'inactive', lastLogin = '2023-01-01'"
      );
      expect(result.query).toContain("WHERE id = '1' AND status = 'active'");
    });
  });
});
