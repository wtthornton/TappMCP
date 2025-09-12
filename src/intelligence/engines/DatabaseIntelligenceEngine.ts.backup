/**
 * Database Intelligence Engine
 *
 * Placeholder implementation for Phase 1. Provides basic database-specific
 * code generation and analysis. Full implementation will be added in Phase 2.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  PerformanceAnalysis,
  SecurityAnalysis,
} from '../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../UnifiedCodeIntelligenceEngine.js';

// Database-specific analysis interfaces
export interface QueryOptimizationAnalysis {
  score: number;
  indexUsage: string[];
  queryPatterns: string[];
  optimizations: string[];
}

export interface DataIntegrityAnalysis {
  score: number;
  constraints: string[];
  relationships: string[];
  validations: string[];
}

/**
 * Database-specific intelligence engine (Phase 1 placeholder)
 */
export class DatabaseIntelligenceEngine extends BaseCategoryIntelligenceEngine {
  category = 'database';
  technologies = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'SQLite'];

  /**
   * Analyze database code with query optimization and data integrity considerations
   * Phase 2 Enhanced Implementation
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<
    CodeAnalysis & {
      queryOptimization?: QueryOptimizationAnalysis;
      dataIntegrity?: DataIntegrityAnalysis;
    }
  > {
    const insights = await this.getTechnologyInsights(technology, context);

    // Database-specific analysis (expanded in Phase 2)
    const quality = await this.analyzeDatabaseQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.analyzePerformance(code, technology, insights);
    const security = await this.analyzeSecurity(code, technology, insights);
    const queryOptimization = await this.analyzeQueryOptimization(code, technology, insights);
    const dataIntegrity = await this.analyzeDataIntegrity(code, technology, insights);

    return {
      quality,
      maintainability,
      performance,
      security,
      queryOptimization,
      dataIntegrity,
    };
  }

  /**
   * Generate database code with optimization and integrity best practices
   */
  async generateCode(request: CodeGenerationRequest, context: Context7Data): Promise<string> {
    const { featureDescription, techStack, role, quality } = request;

    // Determine the technology to use
    const technology = techStack?.[0] || 'PostgreSQL';

    // Get technology insights from Context7
    const insights = await this.getTechnologyInsights(technology, context);

    // Generate database-specific code
    let code = this.generateDatabaseCode(featureDescription, technology, role);

    // Apply quality standards
    code = await this.applyQualityStandards(code, quality || 'standard');

    // Apply Context7 insights
    code = await this.applyContext7Insights(code, insights);

    // Add optimization features
    code = this.addOptimizationFeatures(code, technology);

    // Add integrity constraints
    code = this.addIntegrityConstraints(code, technology);

    return code;
  }

  /**
   * Get database-specific best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Use primary keys for all tables',
      'Create indexes for frequently queried columns',
      'Use foreign key constraints to maintain referential integrity',
      'Normalize data to reduce redundancy',
      'Use transactions for data consistency',
      'Implement proper backup and recovery procedures',
      'Use parameterized queries to prevent SQL injection',
      'Monitor query performance regularly',
      'Implement proper access controls and permissions',
      'Use connection pooling for better performance',
    ];

    // Add technology-specific practices from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    practices.push(...insights.bestPractices);

    return practices;
  }

  /**
   * Get database-specific anti-patterns
   */
  async getAntiPatterns(technology: string, context: Context7Data): Promise<string[]> {
    const antiPatterns = [
      'Using SELECT * in production queries',
      'Missing indexes on frequently queried columns',
      'Not using foreign key constraints',
      'Storing large BLOBs in the database',
      'Using string concatenation for SQL queries',
      'Not backing up data regularly',
      'Using weak passwords for database users',
      'Granting excessive permissions to users',
      'Not monitoring database performance',
      'Using inefficient query patterns (N+1 queries)',
    ];

    // Add technology-specific anti-patterns from Context7
    const insights = await this.getTechnologyInsights(technology, context);
    antiPatterns.push(...insights.antiPatterns);

    return antiPatterns;
  }

  /**
   * Validate database code
   */
  async validateCode(code: string, _technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // SQL injection checks
    if (code.match(/SELECT.*FROM.*WHERE.*\+/gi)) {
      errors.push('Potential SQL injection vulnerability detected');
    }

    if (code.includes('${') && code.includes('SELECT')) {
      errors.push('String interpolation in SQL query detected - use parameterized queries');
    }

    // Performance checks
    if (code.match(/SELECT\s+\*/gi)) {
      warnings.push('SELECT * detected - specify columns explicitly');
    }

    if (code.match(/ORDER\s+BY\s+RAND/gi)) {
      warnings.push('ORDER BY RAND() is inefficient - consider alternatives');
    }

    if (code.match(/NOT\s+IN\s*\(/gi)) {
      warnings.push('NOT IN with subquery can be slow - consider NOT EXISTS');
    }

    // Index suggestions
    if (code.includes('WHERE') && !code.includes('INDEX')) {
      suggestions.push('Consider adding indexes for WHERE clause columns');
    }

    // Constraint checks
    if (code.includes('CREATE TABLE') && !code.includes('PRIMARY KEY')) {
      warnings.push('Table missing primary key');
    }

    if (code.includes('CREATE TABLE') && !code.includes('NOT NULL')) {
      suggestions.push('Consider adding NOT NULL constraints where appropriate');
    }

    // Transaction checks
    if (code.includes('INSERT') && code.includes('UPDATE') && !code.includes('TRANSACTION')) {
      suggestions.push('Consider using transactions for multiple operations');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize database code
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply general optimizations
    optimizedCode = this.optimizeQueries(optimizedCode, technology);
    optimizedCode = this.optimizeIndexes(optimizedCode, technology);
    optimizedCode = this.optimizeConstraints(optimizedCode, technology);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods
   */

  private async analyzeDatabaseQuality(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<QualityAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Database-specific quality checks
    if (code.includes('SELECT *')) {
      issues.push('Using SELECT * instead of specific columns');
      score -= 10;
    }

    if (!code.includes('PRIMARY KEY') && code.includes('CREATE TABLE')) {
      issues.push('Table missing primary key');
      score -= 15;
    }

    if (!code.includes('INDEX') && code.includes('WHERE')) {
      suggestions.push('Consider adding indexes for better query performance');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
    };
  }

  private async analyzeMaintainability(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<MaintainabilityAnalysis> {
    // Basic maintainability analysis (to be expanded in Phase 2)
    let score = 85;
    const suggestions: string[] = [];

    // Check for proper naming
    if (code.match(/table1|column1|field1/gi)) {
      suggestions.push('Use descriptive names for tables and columns');
      score -= 10;
    }

    // Check for documentation
    if (!code.includes('--') && !code.includes('/*')) {
      suggestions.push('Add comments to document database schema');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      complexity: 3, // Database queries are generally less complex
      readability: 80,
      testability: 75,
      suggestions,
    };
  }

  private async analyzePerformance(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<PerformanceAnalysis> {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];
    let score = 80;

    // Performance checks
    if (code.includes('SELECT *')) {
      bottlenecks.push('SELECT * retrieves unnecessary columns');
      optimizations.push('Specify only required columns in SELECT');
      score -= 15;
    }

    if (code.match(/ORDER\s+BY\s+RAND/gi)) {
      bottlenecks.push('ORDER BY RAND() is very slow');
      optimizations.push('Use application-level randomization or other methods');
      score -= 20;
    }

    if (!code.includes('LIMIT') && code.includes('SELECT')) {
      optimizations.push('Add LIMIT clause to prevent large result sets');
      score -= 10;
    }

    if (code.includes('WHERE') && !code.includes('INDEX')) {
      bottlenecks.push('Queries without proper indexes');
      optimizations.push('Create indexes for frequently queried columns');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      bottlenecks,
      optimizations,
    };
  }

  private async analyzeSecurity(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 90;

    // Security checks
    if (code.includes('${') || code.includes('%s')) {
      vulnerabilities.push('String interpolation in SQL queries');
      recommendations.push('Use parameterized queries');
      score -= 25;
    }

    if (code.match(/password.*=.*['"][^'"]+['"]/i)) {
      vulnerabilities.push('Hardcoded database credentials');
      recommendations.push('Use environment variables for credentials');
      score -= 30;
    }

    if (!code.includes('GRANT') && !code.includes('permissions')) {
      recommendations.push('Implement proper access controls');
      score -= 10;
    }

    if (code.includes('DROP') || code.includes('DELETE')) {
      recommendations.push('Use transactions for destructive operations');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations,
    };
  }

  private async analyzeQueryOptimization(
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
      indexUsage.push('Partial/filtered indexes');
      score += 10;
    }

    if (code.includes('COMPOSITE INDEX') || (code.includes('CREATE INDEX') && code.match(/,.*,/))) {
      indexUsage.push('Composite indexes');
      score += 8;
    }

    // 2. Query Analysis and Performance
    if (code.includes('EXPLAIN') || code.includes('EXPLAIN ANALYZE')) {
      queryPatterns.push('Query execution plan analysis');
      score += 8;
    }

    if (code.includes('EXPLAIN ANALYZE')) {
      queryPatterns.push('Runtime query analysis');
      score += 5; // Bonus for actual execution analysis
    }

    // 3. JOIN Optimization
    if (code.includes('JOIN')) {
      queryPatterns.push('JOIN operations detected');

      if (code.includes('INNER JOIN')) {
        queryPatterns.push('Inner joins (optimal)');
        score += 5;
      }

      if (code.includes('LEFT JOIN') || code.includes('RIGHT JOIN')) {
        queryPatterns.push('Outer joins detected');
        score += 3;
      }

      if (code.includes('CROSS JOIN')) {
        queryPatterns.push('Cross joins detected');
        optimizations.push('Review cross joins for performance impact');
        score -= 5;
      }

      // Check for proper join conditions
      if (code.includes('ON') && code.includes('=')) {
        queryPatterns.push('Proper join conditions');
        score += 3;
      }
    }

    // 4. SELECT Statement Optimization
    if (code.includes('SELECT *')) {
      queryPatterns.push('SELECT * detected');
      optimizations.push('Avoid SELECT *, specify needed columns');
      score -= 8;
    }

    if (code.includes('SELECT DISTINCT')) {
      queryPatterns.push('DISTINCT operations');
      optimizations.push('Consider GROUP BY instead of DISTINCT for better performance');
      score -= 3;
    }

    if (code.includes('SELECT COUNT(*)')) {
      queryPatterns.push('Count queries detected');
      optimizations.push('Consider using approximate counts for large tables');
      score -= 2;
    }

    if (code.includes('SELECT') && code.includes('LIMIT')) {
      queryPatterns.push('Result limiting with LIMIT');
      score += 5;
    }

    // 5. WHERE Clause Optimization
    if (code.includes('WHERE') && code.includes("LIKE '%")) {
      queryPatterns.push('Leading wildcard LIKE patterns');
      optimizations.push('Leading wildcards prevent index usage');
      score -= 10;
    }

    if ((code.includes('WHERE') && code.includes('!=')) || code.includes('<>')) {
      queryPatterns.push('Negative comparisons');
      optimizations.push('Negative comparisons may prevent index usage');
      score -= 3;
    }

    if (code.includes('WHERE') && code.includes('OR')) {
      queryPatterns.push('OR conditions');
      optimizations.push('Consider UNION for better index usage instead of OR');
      score -= 5;
    }

    // 6. Function Usage in WHERE Clauses
    if (code.includes('WHERE') && (code.includes('UPPER(') || code.includes('LOWER('))) {
      queryPatterns.push('Functions in WHERE clause');
      optimizations.push('Functions in WHERE prevent index usage - consider functional indexes');
      score -= 8;
    }

    // 7. Subquery Optimization
    if (code.includes('IN (SELECT')) {
      queryPatterns.push('IN subqueries');
      optimizations.push('Consider EXISTS instead of IN for better performance');
      score -= 5;
    }

    if (code.includes('EXISTS (')) {
      queryPatterns.push('EXISTS subqueries');
      score += 3; // Bonus for using EXISTS
    }

    // 8. Aggregate and GROUP BY Optimization
    if (code.includes('GROUP BY')) {
      queryPatterns.push('GROUP BY operations');

      if (code.includes('HAVING')) {
        queryPatterns.push('HAVING clauses');
        optimizations.push('Move conditions to WHERE when possible for better performance');
      }
    }

    // 9. Order and Sorting
    if (code.includes('ORDER BY')) {
      queryPatterns.push('Result ordering');

      if (code.includes('ORDER BY') && code.includes('LIMIT')) {
        score += 3; // Good pattern
      }
    }

    // 10. Technology-Specific Optimizations
    if (technology.toLowerCase().includes('postgresql')) {
      if (code.includes('VACUUM') || code.includes('ANALYZE')) {
        queryPatterns.push('PostgreSQL maintenance commands');
        score += 5;
      }

      if (code.includes('CLUSTER')) {
        queryPatterns.push('Table clustering');
        score += 8;
      }

      if (code.includes('JSONB')) {
        queryPatterns.push('JSONB usage');
        score += 5;
      }
    }

    if (technology.toLowerCase().includes('mysql')) {
      if (code.includes('USE INDEX') || code.includes('FORCE INDEX')) {
        indexUsage.push('Index hints (MySQL)');
        score += 5;
      }

      if (code.includes('OPTIMIZE TABLE')) {
        queryPatterns.push('Table optimization');
        score += 5;
      }
    }

    if (technology.toLowerCase().includes('mongodb')) {
      if (code.includes('createIndex') || code.includes('ensureIndex')) {
        indexUsage.push('MongoDB index creation');
        score += 8;
      }

      if (code.includes('aggregate')) {
        queryPatterns.push('Aggregation pipeline');
        score += 5;
      }

      if (code.includes('$lookup')) {
        queryPatterns.push('MongoDB joins ($lookup)');
        score += 3;
      }
    }

    // 11. Connection and Transaction Optimization
    if (code.includes('TRANSACTION') || code.includes('BEGIN')) {
      queryPatterns.push('Transaction usage');
      score += 3;
    }

    if (code.includes('PREPARED STATEMENT') || code.includes('PREPARE')) {
      queryPatterns.push('Prepared statements');
      score += 8;
    }

    // 12. Advanced Optimization Techniques
    if (code.includes('MATERIALIZED VIEW')) {
      queryPatterns.push('Materialized views');
      score += 10;
    }

    if (code.includes('PARTITION')) {
      queryPatterns.push('Table partitioning');
      score += 12;
    }

    if (code.includes('CTE') || code.includes('WITH')) {
      queryPatterns.push('Common Table Expressions');
      score += 5;
    }

    // Penalty for anti-patterns
    if (code.includes('UNION') && !code.includes('UNION ALL')) {
      optimizations.push('Use UNION ALL instead of UNION when duplicates are acceptable');
      score -= 3;
    }

    if (code.includes('OFFSET') && !code.includes('ORDER BY')) {
      optimizations.push('OFFSET without ORDER BY can produce inconsistent results');
      score -= 5;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      indexUsage,
      queryPatterns,
      optimizations,
    };
  }

  private async analyzeDataIntegrity(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<DataIntegrityAnalysis> {
    const constraints: string[] = [];
    const relationships: string[] = [];
    const validations: string[] = [];
    let score = 80;

    // Check for constraints
    if (code.includes('PRIMARY KEY')) {
      constraints.push('Primary key constraint');
      score += 5;
    }

    if (code.includes('FOREIGN KEY')) {
      constraints.push('Foreign key constraint');
      relationships.push('Referential integrity enforced');
      score += 10;
    }

    if (code.includes('NOT NULL')) {
      constraints.push('NOT NULL constraint');
      score += 3;
    }

    if (code.includes('UNIQUE')) {
      constraints.push('UNIQUE constraint');
      score += 5;
    }

    if (code.includes('CHECK')) {
      constraints.push('CHECK constraint');
      validations.push('Data validation at database level');
      score += 5;
    }

    // Check for transactions
    if (code.includes('TRANSACTION') || code.includes('BEGIN')) {
      validations.push('Transaction support for consistency');
      score += 5;
    }

    // Check for triggers
    if (code.includes('TRIGGER')) {
      validations.push('Database triggers for automatic validation');
      score += 3;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      constraints,
      relationships,
      validations,
    };
  }

  private generateDatabaseCode(description: string, technology: string, role?: string): string {
    const lowerTech = technology.toLowerCase();

    if (lowerTech.includes('postgresql') || lowerTech.includes('postgres')) {
      return this.generatePostgreSQLCode(description, role);
    } else if (lowerTech.includes('mysql')) {
      return this.generateMySQLCode(description, role);
    } else if (lowerTech.includes('mongodb')) {
      return this.generateMongoDBCode(description, role);
    } else if (lowerTech.includes('redis')) {
      return this.generateRedisCode(description, role);
    } else {
      return this.generateGenericSQLCode(description, role);
    }
  }

  private generatePostgreSQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseIntelligenceEngine
-- Technology: PostgreSQL
-- Role: ${role || 'developer'}

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for ${description}
CREATE SCHEMA IF NOT EXISTS app_schema;
SET search_path TO app_schema, public;

-- Main table for ${description}
CREATE TABLE IF NOT EXISTS main_entity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,

    -- Constraints
    CONSTRAINT main_entity_status_check CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
    CONSTRAINT main_entity_name_length CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 255)
);

-- Related table
CREATE TABLE IF NOT EXISTS entity_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    main_entity_id UUID NOT NULL,
    detail_type VARCHAR(100) NOT NULL,
    detail_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_entity_details_main_entity
        FOREIGN KEY (main_entity_id)
        REFERENCES main_entity(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Unique constraint
    CONSTRAINT uk_entity_details_type_value
        UNIQUE (main_entity_id, detail_type, detail_value)
);

-- Audit table for tracking changes
CREATE TABLE IF NOT EXISTS entity_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT entity_audit_action_check CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_main_entity_status
    ON main_entity(status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_main_entity_created_at
    ON main_entity(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_main_entity_name_trgm
    ON main_entity USING gin (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_details_main_entity
    ON entity_details(main_entity_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_details_type
    ON entity_details(detail_type) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entity_audit_entity_id
    ON entity_audit(entity_id, changed_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_main_entity_updated_at ON main_entity;
CREATE TRIGGER update_main_entity_updated_at
    BEFORE UPDATE ON main_entity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_entity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO entity_audit (entity_id, action, old_values, changed_by)
        VALUES (OLD.id, TG_OP, row_to_json(OLD), OLD.created_by);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO entity_audit (entity_id, action, old_values, new_values, changed_by)
        VALUES (NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO entity_audit (entity_id, action, new_values, changed_by)
        VALUES (NEW.id, TG_OP, row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Audit trigger
DROP TRIGGER IF EXISTS audit_main_entity_changes ON main_entity;
CREATE TRIGGER audit_main_entity_changes
    AFTER INSERT OR UPDATE OR DELETE ON main_entity
    FOR EACH ROW
    EXECUTE FUNCTION audit_entity_changes();

-- Views for common queries
CREATE OR REPLACE VIEW v_active_entities AS
SELECT
    me.id,
    me.name,
    me.description,
    me.status,
    me.created_at,
    me.updated_at,
    COUNT(ed.id) as detail_count
FROM main_entity me
LEFT JOIN entity_details ed ON me.id = ed.main_entity_id AND ed.is_active = true
WHERE me.status = 'active'
GROUP BY me.id, me.name, me.description, me.status, me.created_at, me.updated_at
ORDER BY me.created_at DESC;

-- Sample queries
-- Insert new entity
INSERT INTO main_entity (name, description, created_by)
VALUES ('Sample Entity', 'This is a sample entity for ${description}', uuid_generate_v4());

-- Query with optimization
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM v_active_entities
WHERE name ILIKE '%sample%'
LIMIT 10;

-- Complex query with joins
SELECT
    me.name,
    me.status,
    ed.detail_type,
    ed.detail_value,
    me.created_at
FROM main_entity me
INNER JOIN entity_details ed ON me.id = ed.main_entity_id
WHERE me.status = 'active'
    AND ed.is_active = true
    AND me.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY me.created_at DESC, ed.detail_type;

-- Performance analysis
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'app_schema'
    AND tablename IN ('main_entity', 'entity_details')
ORDER BY tablename, attname;

-- Grant permissions (example)
-- CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
-- GRANT USAGE ON SCHEMA app_schema TO app_user;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA app_schema TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA app_schema TO app_user;

COMMIT;`;
  }

  private generateMySQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseIntelligenceEngine
-- Technology: MySQL 8.0+
-- Role: ${role || 'developer'}

-- Create database
CREATE DATABASE IF NOT EXISTS app_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE app_db;

-- Main table for ${description}
CREATE TABLE IF NOT EXISTS main_entity (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive', 'pending', 'archived') NOT NULL DEFAULT 'active',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36) NOT NULL,

    -- Indexes
    INDEX idx_main_entity_status (status),
    INDEX idx_main_entity_created_at (created_at DESC),
    INDEX idx_main_entity_name (name),

    -- Full-text search
    FULLTEXT INDEX ft_main_entity_name_desc (name, description),

    -- Constraints
    CONSTRAINT chk_main_entity_name_length
        CHECK (CHAR_LENGTH(name) >= 1 AND CHAR_LENGTH(name) <= 255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Related table
CREATE TABLE IF NOT EXISTS entity_details (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    main_entity_id CHAR(36) NOT NULL,
    detail_type VARCHAR(100) NOT NULL,
    detail_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_entity_details_main_entity
        FOREIGN KEY (main_entity_id)
        REFERENCES main_entity(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Indexes
    INDEX idx_entity_details_main_entity (main_entity_id),
    INDEX idx_entity_details_type (detail_type),
    INDEX idx_entity_details_active (is_active),

    -- Unique constraint
    UNIQUE KEY uk_entity_details_type_value (main_entity_id, detail_type, detail_value(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit table
CREATE TABLE IF NOT EXISTS entity_audit (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_id CHAR(36) NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by CHAR(36) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_entity_audit_entity_id (entity_id),
    INDEX idx_entity_audit_changed_at (changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger for audit logging
DELIMITER //

CREATE TRIGGER tr_main_entity_audit_insert
    AFTER INSERT ON main_entity
    FOR EACH ROW
BEGIN
    INSERT INTO entity_audit (entity_id, action, new_values, changed_by)
    VALUES (
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'status', NEW.status,
            'metadata', NEW.metadata,
            'created_by', NEW.created_by
        ),
        NEW.created_by
    );
END//

CREATE TRIGGER tr_main_entity_audit_update
    AFTER UPDATE ON main_entity
    FOR EACH ROW
BEGIN
    INSERT INTO entity_audit (entity_id, action, old_values, new_values, changed_by)
    VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'status', OLD.status,
            'metadata', OLD.metadata
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'name', NEW.name,
            'description', NEW.description,
            'status', NEW.status,
            'metadata', NEW.metadata
        ),
        NEW.created_by
    );
END//

CREATE TRIGGER tr_main_entity_audit_delete
    AFTER DELETE ON main_entity
    FOR EACH ROW
BEGIN
    INSERT INTO entity_audit (entity_id, action, old_values, changed_by)
    VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'id', OLD.id,
            'name', OLD.name,
            'description', OLD.description,
            'status', OLD.status,
            'metadata', OLD.metadata
        ),
        OLD.created_by
    );
END//

DELIMITER ;

-- View for active entities
CREATE OR REPLACE VIEW v_active_entities AS
SELECT
    me.id,
    me.name,
    me.description,
    me.status,
    me.created_at,
    me.updated_at,
    COUNT(ed.id) as detail_count
FROM main_entity me
LEFT JOIN entity_details ed ON me.id = ed.main_entity_id AND ed.is_active = TRUE
WHERE me.status = 'active'
GROUP BY me.id, me.name, me.description, me.status, me.created_at, me.updated_at
ORDER BY me.created_at DESC;

-- Stored procedure for entity management
DELIMITER //

CREATE PROCEDURE sp_create_entity(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_created_by CHAR(36),
    OUT p_entity_id CHAR(36)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Validate input
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Entity name cannot be empty';
    END IF;

    -- Insert new entity
    SET p_entity_id = UUID();
    INSERT INTO main_entity (id, name, description, created_by)
    VALUES (p_entity_id, p_name, p_description, p_created_by);

    COMMIT;
END//

DELIMITER ;

-- Sample data
INSERT INTO main_entity (name, description, created_by)
VALUES
    ('Sample Entity 1', 'First sample entity for ${description}', UUID()),
    ('Sample Entity 2', 'Second sample entity for ${description}', UUID());

-- Performance queries
-- Query with optimization hints
SELECT /*+ USE_INDEX(me, idx_main_entity_status) */
    me.name,
    me.status,
    ed.detail_type,
    ed.detail_value
FROM main_entity me
INNER JOIN entity_details ed ON me.id = ed.main_entity_id
WHERE me.status = 'active'
    AND ed.is_active = TRUE
    AND me.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY me.created_at DESC
LIMIT 100;

-- Full-text search example
SELECT
    id,
    name,
    description,
    MATCH(name, description) AGAINST('sample' IN NATURAL LANGUAGE MODE) as relevance_score
FROM main_entity
WHERE MATCH(name, description) AGAINST('sample' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

-- Query performance analysis
EXPLAIN FORMAT=JSON
SELECT * FROM v_active_entities
WHERE name LIKE '%sample%'
LIMIT 10;

-- Show index usage
SHOW INDEX FROM main_entity;
SHOW INDEX FROM entity_details;

COMMIT;`;
  }

  private generateMongoDBCode(description: string, role?: string): string {
    return `// ${description}
// Generated by DatabaseIntelligenceEngine
// Technology: MongoDB
// Role: ${role || 'developer'}

// Switch to application database
use('app_db');

// Create collections with validation
db.createCollection('main_entity', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'status', 'created_by', 'created_at'],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    maxLength: 255,
                    description: 'Entity name - required and must be between 1-255 characters'
                },
                description: {
                    bsonType: 'string',
                    description: 'Entity description'
                },
                status: {
                    enum: ['active', 'inactive', 'pending', 'archived'],
                    description: 'Entity status - must be one of the allowed values'
                },
                metadata: {
                    bsonType: 'object',
                    description: 'Additional metadata for the entity'
                },
                created_at: {
                    bsonType: 'date',
                    description: 'Creation timestamp'
                },
                updated_at: {
                    bsonType: 'date',
                    description: 'Last update timestamp'
                },
                created_by: {
                    bsonType: 'objectId',
                    description: 'User who created the entity'
                }
            }
        }
    }
});

db.createCollection('entity_details', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['main_entity_id', 'detail_type', 'detail_value', 'created_at'],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                main_entity_id: {
                    bsonType: 'objectId',
                    description: 'Reference to main entity'
                },
                detail_type: {
                    bsonType: 'string',
                    maxLength: 100,
                    description: 'Type of detail'
                },
                detail_value: {
                    bsonType: 'string',
                    description: 'Detail value'
                },
                is_active: {
                    bsonType: 'bool',
                    description: 'Whether the detail is active'
                },
                created_at: {
                    bsonType: 'date',
                    description: 'Creation timestamp'
                }
            }
        }
    }
});

db.createCollection('entity_audit', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['entity_id', 'action', 'changed_by', 'changed_at'],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                entity_id: {
                    bsonType: 'objectId',
                    description: 'Reference to audited entity'
                },
                action: {
                    enum: ['INSERT', 'UPDATE', 'DELETE'],
                    description: 'Type of action performed'
                },
                old_values: {
                    bsonType: 'object',
                    description: 'Previous values before change'
                },
                new_values: {
                    bsonType: 'object',
                    description: 'New values after change'
                },
                changed_by: {
                    bsonType: 'objectId',
                    description: 'User who made the change'
                },
                changed_at: {
                    bsonType: 'date',
                    description: 'When the change occurred'
                }
            }
        }
    }
});

// Create indexes for performance
// Main entity indexes
db.main_entity.createIndex({ 'status': 1 });
db.main_entity.createIndex({ 'created_at': -1 });
db.main_entity.createIndex({ 'name': 'text', 'description': 'text' });
db.main_entity.createIndex({ 'status': 1, 'created_at': -1 });

// Entity details indexes
db.entity_details.createIndex({ 'main_entity_id': 1 });
db.entity_details.createIndex({ 'detail_type': 1, 'is_active': 1 });
db.entity_details.createIndex({ 'main_entity_id': 1, 'detail_type': 1, 'detail_value': 1 }, { unique: true });

// Audit indexes
db.entity_audit.createIndex({ 'entity_id': 1, 'changed_at': -1 });
db.entity_audit.createIndex({ 'changed_at': -1 });

// Sample data insertion
const sampleEntities = [
    {
        name: 'Sample Entity 1',
        description: 'First sample entity for ${description}',
        status: 'active',
        metadata: {
            category: 'sample',
            priority: 'high'
        },
        created_at: new Date(),
        updated_at: new Date(),
        created_by: new ObjectId()
    },
    {
        name: 'Sample Entity 2',
        description: 'Second sample entity for ${description}',
        status: 'active',
        metadata: {
            category: 'sample',
            priority: 'medium'
        },
        created_at: new Date(),
        updated_at: new Date(),
        created_by: new ObjectId()
    }
];

const insertResult = db.main_entity.insertMany(sampleEntities);
print('Inserted entities:', insertResult.insertedIds);

// Sample detail records
const entityIds = Object.values(insertResult.insertedIds);
const sampleDetails = [
    {
        main_entity_id: entityIds[0],
        detail_type: 'configuration',
        detail_value: 'enabled',
        is_active: true,
        created_at: new Date()
    },
    {
        main_entity_id: entityIds[0],
        detail_type: 'settings',
        detail_value: '{"theme": "dark", "language": "en"}',
        is_active: true,
        created_at: new Date()
    }
];

db.entity_details.insertMany(sampleDetails);

// Aggregation pipeline for active entities with details
const activeEntitiesWithDetails = db.main_entity.aggregate([
    {
        $match: { status: 'active' }
    },
    {
        $lookup: {
            from: 'entity_details',
            localField: '_id',
            foreignField: 'main_entity_id',
            as: 'details',
            pipeline: [
                { $match: { is_active: true } }
            ]
        }
    },
    {
        $addFields: {
            detail_count: { $size: '$details' }
        }
    },
    {
        $sort: { created_at: -1 }
    }
]);

print('Active entities with details:');
activeEntitiesWithDetails.forEach(printjson);

// Complex aggregation for analytics
const entityAnalytics = db.main_entity.aggregate([
    {
        $match: {
            created_at: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        }
    },
    {
        $lookup: {
            from: 'entity_details',
            localField: '_id',
            foreignField: 'main_entity_id',
            as: 'details'
        }
    },
    {
        $group: {
            _id: '$status',
            count: { $sum: 1 },
            avg_details: { $avg: { $size: '$details' } },
            latest_created: { $max: '$created_at' }
        }
    },
    {
        $sort: { count: -1 }
    }
]);

print('Entity analytics:');
entityAnalytics.forEach(printjson);

// Text search example
const searchResults = db.main_entity.find(
    { $text: { $search: 'sample' } },
    { score: { $meta: 'textScore' } }
).sort({ score: { $meta: 'textScore' } });

print('Search results:');
searchResults.forEach(printjson);

// Update with audit logging (using change streams would be better in production)
function updateEntityWithAudit(entityId, updates, userId) {
    const session = db.getMongo().startSession();

    try {
        session.startTransaction();

        // Get current document
        const oldDoc = db.main_entity.findOne({ _id: entityId });
        if (!oldDoc) {
            throw new Error('Entity not found');
        }

        // Update the document
        const updateResult = db.main_entity.updateOne(
            { _id: entityId },
            {
                $set: {
                    ...updates,
                    updated_at: new Date()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error('Update failed');
        }

        // Get updated document
        const newDoc = db.main_entity.findOne({ _id: entityId });

        // Log audit
        db.entity_audit.insertOne({
            entity_id: entityId,
            action: 'UPDATE',
            old_values: oldDoc,
            new_values: newDoc,
            changed_by: userId,
            changed_at: new Date()
        });

        session.commitTransaction();
        return newDoc;

    } catch (error) {
        session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

// Example usage of update function
// updateEntityWithAudit(entityIds[0], { status: 'inactive' }, new ObjectId());

// Performance analysis
print('Collection stats:');
printjson(db.main_entity.stats());

print('Index usage:');
printjson(db.main_entity.getIndexes());

// Query with explain plan
print('Query execution plan:');
printjson(
    db.main_entity.find({ status: 'active' })
        .sort({ created_at: -1 })
        .limit(10)
        .explain('executionStats')
);`;
  }

  private generateRedisCode(description: string, role?: string): string {
    return `// ${description}
// Generated by DatabaseIntelligenceEngine
// Technology: Redis
// Role: ${role || 'developer'}

// Redis commands and data structures for ${description}

// 1. Basic Key-Value Operations
// Store entity data as JSON
SET entity:1 '{"id": "1", "name": "Sample Entity", "status": "active", "created_at": "2024-01-01T00:00:00Z"}'
SET entity:2 '{"id": "2", "name": "Another Entity", "status": "inactive", "created_at": "2024-01-02T00:00:00Z"}'

// Set expiration (TTL) for cached data
SETEX entity:temp:1 3600 '{"id": "1", "temporary": true}'

// Get entity data
GET entity:1
GET entity:2

// 2. Hash Operations for Structured Data
// Store entity as hash for easier field updates
HSET entity:hash:1 id 1 name "Sample Entity" status active created_at "2024-01-01T00:00:00Z"
HSET entity:hash:2 id 2 name "Another Entity" status inactive created_at "2024-01-02T00:00:00Z"

// Get specific fields
HMGET entity:hash:1 name status
HGETALL entity:hash:1

// Update specific field
HSET entity:hash:1 status updated

// 3. Set Operations for Indexes and Categories
// Index entities by status
SADD index:status:active 1 3 5
SADD index:status:inactive 2 4
SADD index:status:pending 6 7

// Get all active entities
SMEMBERS index:status:active

// Check if entity is in a status
SISMEMBER index:status:active 1

// Move entity between status sets
SMOVE index:status:pending index:status:active 6

// 4. Sorted Sets for Rankings and Time-based Data
// Store entities by creation time (score = timestamp)
ZADD entities:by_created 1704067200 1 1704153600 2 1704240000 3

// Get entities created in last 30 days (assuming current time)
ZRANGEBYSCORE entities:by_created 1701475200 +inf

// Get latest 10 entities
ZREVRANGE entities:by_created 0 9 WITHSCORES

// Get entity rank by creation time
ZRANK entities:by_created 1

// 5. Lists for Activity Logs and Queues
// Activity log for entity changes
LPUSH activity:entity:1 "Status changed to active at 2024-01-01T10:00:00Z"
LPUSH activity:entity:1 "Created at 2024-01-01T00:00:00Z"

// Get recent activity (latest 5 entries)
LRANGE activity:entity:1 0 4

// Work queue for processing
LPUSH queue:process_entities '{"entity_id": 1, "action": "update"}'
LPUSH queue:process_entities '{"entity_id": 2, "action": "notify"}'

// Process queue item (blocking)
// BRPOP queue:process_entities 30

// 6. Pub/Sub for Real-time Updates
// Subscribe to entity updates (in separate client)
// SUBSCRIBE entity:updates

// Publish entity update
PUBLISH entity:updates '{"entity_id": 1, "action": "status_changed", "new_status": "active"}'

// 7. Streams for Event Sourcing
// Add events to stream
XADD entity:events * entity_id 1 action created name "Sample Entity" status active
XADD entity:events * entity_id 1 action status_changed old_status pending new_status active
XADD entity:events * entity_id 2 action created name "Another Entity" status inactive

// Read all events
XREAD STREAMS entity:events 0

// Read events in consumer group
XGROUP CREATE entity:events processors $ MKSTREAM
XREADGROUP GROUP processors consumer1 STREAMS entity:events >

// 8. HyperLogLog for Approximate Counting
// Count unique visitors/users
PFADD unique:visitors user1 user2 user3 user1
PFCOUNT unique:visitors

// 9. Geospatial Operations (if applicable)
// Store entity locations
GEOADD entities:locations -122.4194 37.7749 entity:1 -74.0059 40.7128 entity:2

// Find entities within radius
GEORADIUS entities:locations -122.4194 37.7749 100 mi WITHDIST

// 10. Lua Scripts for Atomic Operations
// Script to increment counter and log activity
local script = [[
    local entity_id = ARGV[1]
    local action = ARGV[2]
    local timestamp = ARGV[3]

    -- Increment counter
    local count = redis.call('INCR', 'counter:entity:' .. entity_id)

    -- Log activity
    redis.call('LPUSH', 'activity:entity:' .. entity_id, action .. ' at ' .. timestamp)

    -- Trim activity log to last 100 entries
    redis.call('LTRIM', 'activity:entity:' .. entity_id, 0, 99)

    return count
]]

// Execute script
EVAL script 0 1 "status_update" "2024-01-01T10:00:00Z"

// 11. Caching Patterns
// Cache frequently accessed data with TTL
SETEX cache:entity:1:details 3600 '{"details": "cached entity details"}'

// Cache-aside pattern check
local cached = redis.call('GET', 'cache:entity:1:details')
if cached then
    return cached
else
    -- Would fetch from database and cache here
    local data = '{"details": "fresh data from db"}'
    redis.call('SETEX', 'cache:entity:1:details', 3600, data)
    return data
end

// 12. Session Management
// Store user session
SETEX session:user123 1800 '{"user_id": 123, "permissions": ["read", "write"], "last_activity": "2024-01-01T10:00:00Z"}'

// Update session activity
local session_script = [[
    local session_key = KEYS[1]
    local ttl = ARGV[1]
    local activity = ARGV[2]

    if redis.call('EXISTS', session_key) == 1 then
        redis.call('HSET', session_key, 'last_activity', activity)
        redis.call('EXPIRE', session_key, ttl)
        return 1
    else
        return 0
    end
]]

EVAL session_script 1 session:user123 1800 "2024-01-01T11:00:00Z"

// 13. Rate Limiting
// Sliding window rate limiting
local rate_limit_script = [[
    local key = KEYS[1]
    local window = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local current_time = tonumber(ARGV[3])

    -- Remove old entries
    redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)

    -- Count current requests
    local current = redis.call('ZCARD', key)

    if current < limit then
        -- Add current request
        redis.call('ZADD', key, current_time, current_time)
        redis.call('EXPIRE', key, window)
        return {1, limit - current - 1}
    else
        return {0, 0}
    end
]]

// Check rate limit (10 requests per 60 seconds)
EVAL rate_limit_script 1 rate_limit:user123 60 10 1704067200

// 14. Data Consistency and Transactions
// Transaction example
MULTI
HSET entity:hash:1 status "processing"
SADD index:status:processing 1
SREM index:status:active 1
LPUSH activity:entity:1 "Status changed to processing"
EXEC

// 15. Monitoring and Statistics
// Set up counters for monitoring
INCR stats:entities:created:daily:2024-01-01
INCR stats:entities:updated:daily:2024-01-01
HINCRBY stats:entities:by_status active 1

// Get statistics
GET stats:entities:created:daily:2024-01-01
HGETALL stats:entities:by_status

// Memory usage analysis
MEMORY USAGE entity:1
INFO memory

// Key expiration monitoring
TTL entity:temp:1
PTTL session:user123

// 16. Backup and Persistence
// Save current state to disk
BGSAVE

// Get last save time
LASTSAVE

// Configuration for persistence
// CONFIG SET save "900 1 300 10 60 10000"`;
  }

  private generateGenericSQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseIntelligenceEngine
-- Technology: Generic SQL
-- Role: ${role || 'developer'}

-- Create main table
CREATE TABLE main_entity (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,

    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'pending', 'archived'))
);

-- Create related table
CREATE TABLE entity_details (
    id INTEGER PRIMARY KEY,
    main_entity_id INTEGER NOT NULL,
    detail_type VARCHAR(100) NOT NULL,
    detail_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_entity_details_main_entity
        FOREIGN KEY (main_entity_id) REFERENCES main_entity(id)
);

-- Create indexes
CREATE INDEX idx_main_entity_status ON main_entity(status);
CREATE INDEX idx_main_entity_created_at ON main_entity(created_at);
CREATE INDEX idx_entity_details_main_entity ON entity_details(main_entity_id);

-- Sample data
INSERT INTO main_entity (name, description, created_by)
VALUES
    ('Sample Entity', 'Sample entity for ${description}', 1),
    ('Another Entity', 'Another entity for ${description}', 1);

-- Sample queries
SELECT
    me.id,
    me.name,
    me.status,
    COUNT(ed.id) as detail_count
FROM main_entity me
LEFT JOIN entity_details ed ON me.id = ed.main_entity_id
WHERE me.status = 'active'
GROUP BY me.id, me.name, me.status
ORDER BY me.created_at DESC;

-- Performance query with LIMIT
SELECT * FROM main_entity
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

COMMIT;`;
  }

  private async applyQualityStandards(code: string, quality: string): Promise<string> {
    // Apply quality standards based on level
    switch (quality) {
      case 'enterprise':
        return this.addEnterpriseFeatures(code);
      case 'production':
        return this.addProductionFeatures(code);
      default:
        return code;
    }
  }

  private addOptimizationFeatures(code: string, _technology: string): string {
    // Add optimization features if not present
    if (!code.includes('INDEX') && code.includes('WHERE')) {
      // Indexes already included in templates
    }

    return code;
  }

  private addIntegrityConstraints(code: string, _technology: string): string {
    // Add integrity constraints if not present
    if (!code.includes('FOREIGN KEY') && code.includes('_id')) {
      // Foreign keys already included in templates
    }

    return code;
  }

  private optimizeQueries(code: string, _technology: string): string {
    // Query optimizations
    code = code.replace(/SELECT\s+\*/gi, 'SELECT /* specify columns */');
    return code;
  }

  private optimizeIndexes(code: string, _technology: string): string {
    // Index optimizations
    return code;
  }

  private optimizeConstraints(code: string, _technology: string): string {
    // Constraint optimizations
    return code;
  }

  private addEnterpriseFeatures(code: string): string {
    // Add enterprise-level features
    return code;
  }

  private addProductionFeatures(code: string): string {
    // Add production-ready features
    return code;
  }
}
