/**
 * Database Query Optimizer
 *
 * Specialized analyzer for SQL query optimization, index strategies,
 * and query performance improvements. Extracted from DatabaseIntelligenceEngine.
 */

// Database-specific analysis interfaces
export interface QueryOptimizationAnalysis {
  score: number;
  indexUsage: string[];
  queryPatterns: string[];
  optimizations: string[];
}

/**
 * Analyze and optimize database queries for performance
 */
export class QueryOptimizer {
  /**
   * Analyze query optimization opportunities and index usage
   */
  async analyzeQueryOptimization(
    code: string,
    technology: string,
    _insights: any
  ): Promise<QueryOptimizationAnalysis> {
    const indexUsage: string[] = [];
    const queryPatterns: string[] = [];
    const optimizations: string[] = [];
    let score = 75;

    // Enhanced SQL Query Optimization Analysis

    // 1. Index Strategy Analysis
    if (code.includes('CREATE INDEX') || code.includes('CREATE UNIQUE INDEX')) {
      indexUsage.push('Explicit index creation found');
      score += 12;
    }

    if (code.includes('CREATE INDEX') && code.includes('CONCURRENTLY')) {
      indexUsage.push('Non-blocking index creation (PostgreSQL)');
      score += 8;
    }

    if (
      code.includes('PARTIAL INDEX') ||
      (code.includes('WHERE') && code.includes('CREATE INDEX'))
    ) {
      indexUsage.push('Partial index for selective data');
      score += 10;
    }

    if (
      code.includes('COMPOSITE INDEX') ||
      (code.includes('CREATE INDEX') && code.split('(')[1]?.includes(','))
    ) {
      indexUsage.push('Composite index for multi-column queries');
      score += 8;
    }

    // 2. Query Pattern Analysis
    if (code.includes('SELECT *')) {
      queryPatterns.push('SELECT * pattern detected');
      optimizations.push('Replace SELECT * with specific column names');
      score -= 12;
    }

    if (code.includes('LIMIT') && code.includes('ORDER BY')) {
      queryPatterns.push('Paginated query with sorting');
      score += 5;
    }

    if (code.includes('WHERE') && !code.includes('INDEX')) {
      queryPatterns.push('Filtering without explicit index');
      optimizations.push('Consider adding index for WHERE clause columns');
      score -= 8;
    }

    // 3. Join Optimization
    if (code.includes('LEFT JOIN') || code.includes('INNER JOIN')) {
      queryPatterns.push('Table joins detected');
      if (!code.includes('ON') || !code.includes('=')) {
        optimizations.push('Use indexed columns in JOIN conditions');
        score -= 10;
      } else {
        score += 5;
      }
    }

    if (code.includes('CROSS JOIN') && !code.includes('WHERE')) {
      queryPatterns.push('Cartesian product detected');
      optimizations.push('Add WHERE clause to CROSS JOIN to avoid cartesian product');
      score -= 20;
    }

    // 4. Aggregation Optimization
    if (code.includes('GROUP BY')) {
      queryPatterns.push('Aggregation query detected');
      if (code.includes('HAVING')) {
        optimizations.push('Use WHERE clause instead of HAVING when possible');
        score -= 3;
      }
      if (!code.includes('INDEX')) {
        optimizations.push('Consider index on GROUP BY columns');
        score -= 5;
      }
    }

    // 5. Subquery Optimization
    if (code.includes('IN (SELECT') || code.includes('EXISTS (SELECT')) {
      queryPatterns.push('Subquery pattern detected');
      if (code.includes('IN (SELECT')) {
        optimizations.push('Consider using EXISTS instead of IN with subquery');
        score -= 5;
      }
    }

    // 6. Technology-specific optimizations
    if (technology.toLowerCase().includes('postgresql')) {
      if (code.includes('EXPLAIN ANALYZE')) {
        queryPatterns.push('Query execution plan analysis');
        score += 8;
      }
      if (code.includes('VACUUM') || code.includes('ANALYZE')) {
        indexUsage.push('Database maintenance commands');
        score += 5;
      }
    }

    if (technology.toLowerCase().includes('mysql')) {
      if (code.includes('FORCE INDEX') || code.includes('USE INDEX')) {
        indexUsage.push('Index hints specified');
        score += 3;
      }
    }

    // 7. Performance Anti-patterns
    if (code.includes('ORDER BY RAND()') || code.includes('ORDER BY RANDOM()')) {
      queryPatterns.push('Random ordering detected');
      optimizations.push('Avoid ORDER BY RAND() for large datasets');
      score -= 15;
    }

    if (code.includes("LIKE '%") && code.includes("%'")) {
      queryPatterns.push('Leading wildcard LIKE pattern');
      optimizations.push('Avoid leading wildcards in LIKE patterns');
      score -= 8;
    }

    // 8. Bulk Operations
    if (code.includes('INSERT INTO') && code.includes('VALUES')) {
      if ((code.match(/VALUES/g) || []).length > 1) {
        queryPatterns.push('Batch INSERT operations');
        score += 5;
      }
    }

    if (code.includes('UPDATE') && !code.includes('WHERE')) {
      queryPatterns.push('Unfiltered UPDATE operation');
      optimizations.push('Add WHERE clause to UPDATE statements');
      score -= 20;
    }

    if (code.includes('DELETE') && !code.includes('WHERE')) {
      queryPatterns.push('Unfiltered DELETE operation');
      optimizations.push('Add WHERE clause to DELETE statements');
      score -= 25;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      indexUsage,
      queryPatterns,
      optimizations,
    };
  }

  /**
   * Generate optimized query suggestions
   */
  generateOptimizedQuery(originalQuery: string, _technology: string): string {
    let optimizedQuery = originalQuery;

    // Replace SELECT * with specific columns (placeholder)
    if (optimizedQuery.includes('SELECT *')) {
      optimizedQuery = optimizedQuery.replace(
        'SELECT *',
        'SELECT id, name, created_at -- Specify actual columns needed'
      );
    }

    // Add LIMIT to large result sets
    if (!optimizedQuery.includes('LIMIT') && optimizedQuery.includes('SELECT')) {
      optimizedQuery += '\nLIMIT 1000; -- Add appropriate limit';
    }

    // Suggest index creation for WHERE clauses
    if (optimizedQuery.includes('WHERE') && !originalQuery.includes('CREATE INDEX')) {
      optimizedQuery +=
        '\n\n-- Suggested index:\n-- CREATE INDEX idx_column ON table_name (column_name);';
    }

    return optimizedQuery;
  }

  /**
   * Get query optimization recommendations based on technology
   */
  getOptimizationRecommendations(technology: string): string[] {
    const baseRecommendations = [
      'Use specific column names instead of SELECT *',
      'Add appropriate indexes for WHERE, JOIN, and ORDER BY clauses',
      'Use LIMIT for large result sets',
      'Avoid subqueries when possible, use JOINs instead',
      'Use prepared statements to prevent SQL injection',
      'Regularly update table statistics',
    ];

    if (technology.toLowerCase().includes('postgresql')) {
      baseRecommendations.push(
        'Use EXPLAIN ANALYZE to understand query execution plans',
        'Consider partial indexes for selective queries',
        'Use VACUUM and ANALYZE for maintenance',
        'Leverage PostgreSQL-specific features like CTEs and window functions'
      );
    }

    if (technology.toLowerCase().includes('mysql')) {
      baseRecommendations.push(
        'Use EXPLAIN to analyze query performance',
        'Consider covering indexes for read-heavy workloads',
        'Use appropriate storage engines (InnoDB vs MyISAM)',
        'Optimize MySQL configuration for your workload'
      );
    }

    if (technology.toLowerCase().includes('mongodb')) {
      baseRecommendations.push(
        'Use compound indexes for multi-field queries',
        'Leverage MongoDB aggregation pipeline',
        'Use appropriate read concerns and write concerns',
        'Consider sharding for large datasets'
      );
    }

    return baseRecommendations;
  }

  /**
   * Analyze index effectiveness and suggest improvements
   */
  analyzeIndexEffectiveness(code: string): {
    effectiveness: number;
    suggestions: string[];
  } {
    let effectiveness = 70;
    const suggestions: string[] = [];

    // Check for proper index usage patterns
    if (code.includes('CREATE INDEX') && code.includes('WHERE')) {
      const whereColumns = this.extractWhereColumns(code);
      const indexColumns = this.extractIndexColumns(code);

      const overlap = whereColumns.filter(col => indexColumns.includes(col));
      if (overlap.length > 0) {
        effectiveness += 20;
      } else {
        suggestions.push('Indexes should cover columns used in WHERE clauses');
        effectiveness -= 15;
      }
    }

    if (code.includes('ORDER BY') && !code.includes('INDEX')) {
      suggestions.push('Consider adding index for ORDER BY columns');
      effectiveness -= 10;
    }

    return { effectiveness, suggestions };
  }

  /**
   * Extract column names from WHERE clauses (simplified)
   */
  private extractWhereColumns(code: string): string[] {
    const whereMatches = code.match(/WHERE\s+(\w+)/gi) || [];
    return whereMatches.map(match => match.replace(/WHERE\s+/i, ''));
  }

  /**
   * Extract column names from INDEX definitions (simplified)
   */
  private extractIndexColumns(code: string): string[] {
    const indexMatches = code.match(/CREATE\s+INDEX\s+\w+\s+ON\s+\w+\s*\(([^)]+)\)/gi) || [];
    return indexMatches.flatMap(match => {
      const columns = match.match(/\(([^)]+)\)/);
      return columns ? columns[1].split(',').map(col => col.trim()) : [];
    });
  }
}
