/**
 * Database Performance Analyzer
 *
 * Specialized analyzer for database performance optimization, query performance,
 * connection pooling, and database-specific performance best practices.
 * Extracted from DatabaseIntelligenceEngine for better modularity.
 */

import { PerformanceAnalysis } from '../../CategoryIntelligenceEngine.js';

/**
 * Analyze database performance optimization opportunities
 */
export class DatabasePerformanceAnalyzer {
  /**
   * Analyze database code for performance bottlenecks and optimizations
   */
  async analyzePerformance(
    code: string,
    technology: string,
    _insights: any
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 80;

    // 1. Query Performance Analysis

    // SELECT * Performance Issues
    if (code.includes('SELECT *')) {
      bottlenecks.push('SELECT * retrieves unnecessary columns');
      optimizations.push('Specify only required columns in SELECT');
      score -= 15;
    }

    // Random Ordering Performance
    if (code.match(/ORDER\s+BY\s+RAND/gi) || code.match(/ORDER\s+BY\s+RANDOM/gi)) {
      bottlenecks.push('ORDER BY RAND/RANDOM is very slow on large datasets');
      optimizations.push('Use application-level randomization or sampling methods');
      score -= 20;
    }

    // Large Result Sets
    if (!code.includes('LIMIT') && code.includes('SELECT')) {
      optimizations.push('Add LIMIT clause to prevent large result sets');
      score -= 10;
    }

    // Missing Indexes
    if (code.includes('WHERE') && !code.includes('INDEX')) {
      bottlenecks.push('Queries without proper indexes');
      optimizations.push('Create indexes for frequently queried columns');
      score -= 15;
    }

    // 2. Join Performance Analysis
    if (code.includes('JOIN')) {
      const joinCount = (code.match(/JOIN/gi) || []).length;
      if (joinCount > 3) {
        bottlenecks.push(`Complex query with ${joinCount} joins may be slow`);
        optimizations.push('Consider denormalization or query optimization for complex joins');
        score -= 8;
      }

      // Check for proper join conditions
      if (code.includes('JOIN') && !code.includes('ON')) {
        bottlenecks.push('Joins without proper ON conditions (cartesian product)');
        optimizations.push('Always specify proper join conditions');
        score -= 25;
      }
    }

    // 3. Subquery Performance
    if (code.includes('IN (SELECT')) {
      bottlenecks.push('IN subqueries can be inefficient');
      optimizations.push('Consider using EXISTS or JOIN instead of IN subqueries');
      score -= 10;
    }

    if (code.includes('NOT IN (SELECT')) {
      bottlenecks.push('NOT IN subqueries can be very inefficient with NULL values');
      optimizations.push('Use NOT EXISTS or LEFT JOIN with NULL check');
      score -= 15;
    }

    // 4. Function Usage in WHERE Clauses
    if (code.match(/WHERE\s+\w+\(/gi)) {
      bottlenecks.push('Functions in WHERE clauses prevent index usage');
      optimizations.push('Avoid functions in WHERE clauses when possible');
      score -= 12;
    }

    // 5. LIKE Pattern Performance
    if (code.includes("LIKE '%") && code.includes("%'")) {
      bottlenecks.push('Leading wildcard LIKE patterns cannot use indexes');
      optimizations.push('Avoid leading wildcards or use full-text search');
      score -= 8;
    }

    // 6. Connection and Resource Management

    // Connection Pooling
    if (this.isConnectionCode(code) && !this.hasConnectionPooling(code)) {
      bottlenecks.push('No connection pooling detected');
      optimizations.push('Implement connection pooling for better resource management');
      score -= 12;
    }

    // Transaction Management
    if (code.includes('BEGIN') || code.includes('START TRANSACTION')) {
      if (!code.includes('COMMIT') && !code.includes('ROLLBACK')) {
        bottlenecks.push('Incomplete transaction management');
        optimizations.push('Ensure all transactions are properly committed or rolled back');
        score -= 10;
      }
    }

    // 7. Technology-specific Performance Optimizations
    score += this.analyzeTechnologySpecificPerformance(
      code,
      technology,
      bottlenecks,
      optimizations
    );

    // 8. Database Configuration and Best Practices
    this.analyzeConfigurationPerformance(code, bottlenecks, optimizations);

    // 9. Bulk Operations Performance
    if (code.includes('INSERT INTO') && code.includes('VALUES')) {
      const insertCount = (code.match(/INSERT INTO/gi) || []).length;
      if (insertCount > 5) {
        optimizations.push('Consider batch INSERT operations for better performance');
        score -= 5;
      }
    }

    // 10. Memory Usage Optimization
    if (code.includes('GROUP BY') && code.includes('ORDER BY')) {
      optimizations.push('GROUP BY and ORDER BY can be memory intensive - monitor usage');
      score -= 3;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      bottlenecks,
      optimizations,
    };
  }

  /**
   * Analyze technology-specific performance considerations
   */
  private analyzeTechnologySpecificPerformance(
    code: string,
    technology: string,
    bottlenecks: string[],
    optimizations: string[]
  ): number {
    let scoreAdjustment = 0;
    const tech = technology.toLowerCase();

    if (tech.includes('postgresql')) {
      // PostgreSQL-specific optimizations
      if (code.includes('VACUUM') || code.includes('ANALYZE')) {
        scoreAdjustment += 8;
      } else if (code.includes('CREATE TABLE')) {
        optimizations.push('Regular VACUUM and ANALYZE operations improve PostgreSQL performance');
      }

      if (code.includes('EXPLAIN (ANALYZE, BUFFERS)')) {
        scoreAdjustment += 5;
      }

      if (code.includes('WITH') && code.includes('AS')) {
        optimizations.push('Good use of CTEs for query optimization');
        scoreAdjustment += 3;
      }
    }

    if (tech.includes('mysql')) {
      // MySQL-specific optimizations
      if (code.includes('FORCE INDEX') || code.includes('USE INDEX')) {
        scoreAdjustment += 3;
      }

      if (code.includes('MyISAM')) {
        bottlenecks.push('MyISAM storage engine lacks transaction support and row-level locking');
        optimizations.push('Consider using InnoDB for better performance and ACID compliance');
        scoreAdjustment -= 10;
      }

      if (code.includes('EXPLAIN')) {
        scoreAdjustment += 5;
      }
    }

    if (tech.includes('mongodb')) {
      // MongoDB-specific optimizations
      if (code.includes('createIndex')) {
        scoreAdjustment += 8;
      }

      if (code.includes('$lookup') && !code.includes('createIndex')) {
        bottlenecks.push('$lookup operations without proper indexing can be slow');
        optimizations.push('Create indexes on lookup fields');
        scoreAdjustment -= 10;
      }

      if (code.includes('aggregate') && code.includes('$match')) {
        optimizations.push('Place $match stages early in aggregation pipeline');
        scoreAdjustment += 3;
      }
    }

    if (tech.includes('redis')) {
      // Redis-specific optimizations
      if (code.includes('PIPELINE') || code.includes('MULTI')) {
        scoreAdjustment += 8;
      }

      if (code.includes('EXPIRE') || code.includes('TTL')) {
        optimizations.push('Good use of expiration for memory management');
        scoreAdjustment += 5;
      }
    }

    return scoreAdjustment;
  }

  /**
   * Analyze database configuration performance aspects
   */
  private analyzeConfigurationPerformance(
    code: string,
    _bottlenecks: string[],
    optimizations: string[]
  ): void {
    // Check for performance-related configurations
    if (code.includes('max_connections') || code.includes('connection_pool')) {
      optimizations.push('Connection pool configuration detected');
    }

    if (code.includes('innodb_buffer_pool_size') || code.includes('shared_buffers')) {
      optimizations.push('Memory buffer configuration detected');
    }

    if (code.includes('slow_query_log') || code.includes('log_min_duration_statement')) {
      optimizations.push('Slow query logging enabled for performance monitoring');
    }

    // Check for backup and maintenance
    if (code.includes('backup') || code.includes('dump')) {
      optimizations.push('Database backup strategy in place');
    }
  }

  /**
   * Check if code contains connection management
   */
  private isConnectionCode(code: string): boolean {
    const connectionKeywords = [
      'connect',
      'connection',
      'pool',
      'driver',
      'datasource',
      'createConnection',
      'getConnection',
      'close()',
      'disconnect',
    ];

    return connectionKeywords.some(keyword => code.toLowerCase().includes(keyword.toLowerCase()));
  }

  /**
   * Check if connection pooling is implemented
   */
  private hasConnectionPooling(code: string): boolean {
    const poolingKeywords = [
      'pool',
      'connectionpool',
      'maxconnections',
      'minconnections',
      'poolsize',
      'connection_pool',
      'pool_size',
    ];

    return poolingKeywords.some(keyword => code.toLowerCase().includes(keyword.toLowerCase()));
  }

  /**
   * Generate performance optimization recommendations
   */
  getPerformanceRecommendations(technology: string): string[] {
    const baseRecommendations = [
      'Use specific column names instead of SELECT *',
      'Add appropriate indexes for WHERE, JOIN, and ORDER BY clauses',
      'Use LIMIT clauses to prevent large result sets',
      'Implement connection pooling for better resource management',
      'Use prepared statements for frequently executed queries',
      'Monitor query execution plans and slow queries',
      'Implement proper transaction management',
      'Use batch operations for bulk data modifications',
      'Regular database maintenance (VACUUM, ANALYZE, etc.)',
      'Monitor database performance metrics',
    ];

    const tech = technology.toLowerCase();

    if (tech.includes('postgresql')) {
      baseRecommendations.push(
        'Use EXPLAIN (ANALYZE, BUFFERS) for query analysis',
        'Implement regular VACUUM and ANALYZE operations',
        'Use partial indexes for selective queries',
        'Leverage PostgreSQL-specific features like CTEs and window functions',
        'Configure appropriate shared_buffers and work_mem settings'
      );
    }

    if (tech.includes('mysql')) {
      baseRecommendations.push(
        'Use EXPLAIN for query analysis',
        'Choose appropriate storage engine (InnoDB vs MyISAM)',
        'Configure InnoDB buffer pool size appropriately',
        'Use MySQL query cache when beneficial',
        'Monitor MySQL performance schema'
      );
    }

    if (tech.includes('mongodb')) {
      baseRecommendations.push(
        'Create compound indexes for multi-field queries',
        'Use projection to limit returned fields',
        'Optimize aggregation pipelines with early $match stages',
        'Use appropriate read and write concerns',
        'Monitor MongoDB profiler for slow operations'
      );
    }

    if (tech.includes('redis')) {
      baseRecommendations.push(
        'Use pipelining for multiple operations',
        'Implement proper key expiration strategies',
        'Choose appropriate data structures for use cases',
        'Monitor memory usage and implement eviction policies',
        'Use Redis clustering for scalability'
      );
    }

    return baseRecommendations;
  }

  /**
   * Analyze query execution plan performance
   */
  analyzeExecutionPlan(
    executionPlan: string,
    _technology: string
  ): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 80;

    const plan = executionPlan.toLowerCase();

    // Common execution plan issues
    if (plan.includes('seq scan') || plan.includes('table scan')) {
      issues.push('Full table scan detected');
      recommendations.push('Add appropriate indexes to avoid table scans');
      score -= 20;
    }

    if (plan.includes('nested loop') && plan.includes('large')) {
      issues.push('Nested loop join on large datasets');
      recommendations.push('Consider hash join or merge join for better performance');
      score -= 15;
    }

    if (plan.includes('sort') && plan.includes('disk')) {
      issues.push('Sort operation spilling to disk');
      recommendations.push('Increase work_mem or add index for sorting');
      score -= 10;
    }

    if (plan.includes('hash join') && plan.includes('memory')) {
      issues.push('Hash join using excessive memory');
      recommendations.push('Consider query optimization or increased hash_mem');
      score -= 8;
    }

    // Positive indicators
    if (plan.includes('index scan') || plan.includes('index seek')) {
      score += 10;
    }

    if (plan.includes('bitmap heap scan')) {
      score += 5;
    }

    return { score, issues, recommendations };
  }

  /**
   * Generate database performance tuning configuration
   */
  generatePerformanceTuningConfig(
    technology: string,
    workloadType: 'read-heavy' | 'write-heavy' | 'mixed'
  ): string {
    const tech = technology.toLowerCase();

    if (tech.includes('postgresql')) {
      return this.generatePostgreSQLTuning(workloadType);
    }

    if (tech.includes('mysql')) {
      return this.generateMySQLTuning(workloadType);
    }

    return '-- Performance tuning configuration varies by database technology';
  }

  /**
   * Generate PostgreSQL performance tuning configuration
   */
  private generatePostgreSQLTuning(workloadType: 'read-heavy' | 'write-heavy' | 'mixed'): string {
    const baseConfig = `-- PostgreSQL Performance Tuning Configuration
-- Workload type: ${workloadType}

-- Memory Configuration
shared_buffers = 256MB                  -- 25% of available RAM
work_mem = 4MB                         -- Per operation memory
maintenance_work_mem = 64MB            -- Maintenance operations
effective_cache_size = 1GB             -- OS cache estimate`;

    if (workloadType === 'read-heavy') {
      return `${baseConfig}

-- Read-Heavy Optimizations
random_page_cost = 1.1                 -- SSD optimization
seq_page_cost = 1.0                    -- Sequential read cost
effective_io_concurrency = 200         -- Concurrent I/O operations
max_worker_processes = 8               -- Parallel query workers`;
    }

    if (workloadType === 'write-heavy') {
      return `${baseConfig}

-- Write-Heavy Optimizations
checkpoint_timeout = 15min             -- Checkpoint frequency
checkpoint_completion_target = 0.9     -- Checkpoint spread
wal_buffers = 16MB                     -- WAL buffer size
synchronous_commit = off               -- Async commit for performance`;
    }

    return `${baseConfig}

-- Mixed Workload Optimizations
checkpoint_timeout = 10min
checkpoint_completion_target = 0.8
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'`;
  }

  /**
   * Generate MySQL performance tuning configuration
   */
  private generateMySQLTuning(workloadType: 'read-heavy' | 'write-heavy' | 'mixed'): string {
    const baseConfig = `-- MySQL Performance Tuning Configuration
-- Workload type: ${workloadType}

-- InnoDB Configuration
innodb_buffer_pool_size = 256M         -- 70-80% of available RAM
innodb_log_file_size = 64M             -- Transaction log size
innodb_flush_log_at_trx_commit = 2     -- Log flushing strategy`;

    if (workloadType === 'read-heavy') {
      return `${baseConfig}

-- Read-Heavy Optimizations
query_cache_type = ON                  -- Enable query cache
query_cache_size = 64M                 -- Query cache size
read_buffer_size = 2M                  -- Sequential read buffer
join_buffer_size = 2M                  -- Join operations buffer`;
    }

    if (workloadType === 'write-heavy') {
      return `${baseConfig}

-- Write-Heavy Optimizations
innodb_flush_method = O_DIRECT         -- Direct I/O
innodb_doublewrite = 0                 -- Disable doublewrite for SSDs
bulk_insert_buffer_size = 64M          -- Bulk insert optimization`;
    }

    return `${baseConfig}

-- Mixed Workload Optimizations
max_connections = 200
thread_cache_size = 16
table_open_cache = 2000`;
  }
}
