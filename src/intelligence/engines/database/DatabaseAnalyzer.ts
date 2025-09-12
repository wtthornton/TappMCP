/**
 * Database Analyzer - Core Module
 *
 * Refactored core database analysis engine that coordinates specialized analyzers.
 * This replaces the monolithic DatabaseIntelligenceEngine with a modular approach.
 */

import {
  BaseCategoryIntelligenceEngine,
  CodeAnalysis,
  Context7Data,
  ValidationResult,
  QualityAnalysis,
  MaintainabilityAnalysis,
  SecurityAnalysis,
} from '../../CategoryIntelligenceEngine.js';
import { CodeGenerationRequest } from '../../UnifiedCodeIntelligenceEngine.js';
import { QueryOptimizer, QueryOptimizationAnalysis } from './QueryOptimizer.js';
import { DataIntegrityAnalyzer, DataIntegrityAnalysis } from './DataIntegrityAnalyzer.js';
import { DatabasePerformanceAnalyzer } from './DatabasePerformanceAnalyzer.js';

/**
 * Extended CodeAnalysis interface for database-specific analysis
 */
interface DatabaseCodeAnalysis extends CodeAnalysis {
  queryOptimization?: QueryOptimizationAnalysis;
  dataIntegrity?: DataIntegrityAnalysis;
}

/**
 * Refactored Database Intelligence Engine with modular architecture
 */
export class DatabaseAnalyzer extends BaseCategoryIntelligenceEngine {
  category = 'database';
  technologies = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'SQLite'];

  // Specialized analyzers
  private queryOptimizer = new QueryOptimizer();
  private dataIntegrityAnalyzer = new DataIntegrityAnalyzer();
  private performanceAnalyzer = new DatabasePerformanceAnalyzer();

  /**
   * Analyze database code with query optimization and data integrity considerations
   */
  async analyzeCode(
    code: string,
    technology: string,
    context: Context7Data
  ): Promise<DatabaseCodeAnalysis> {
    const insights = await this.getTechnologyInsights(technology, context);

    // Use specialized analyzers
    const quality = await this.analyzeDatabaseQuality(code, technology, insights);
    const maintainability = await this.analyzeMaintainability(code, technology, insights);
    const performance = await this.performanceAnalyzer.analyzePerformance(
      code,
      technology,
      insights
    );
    const security = await this.analyzeSecurity(code, technology, insights);
    const queryOptimization = await this.queryOptimizer.analyzeQueryOptimization(
      code,
      technology,
      insights
    );
    const dataIntegrity = await this.dataIntegrityAnalyzer.analyzeDataIntegrity(
      code,
      technology,
      insights
    );

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

    // Add optimization features using specialized analyzers
    code = this.addOptimizationFeatures(code, technology);
    code = this.addIntegrityConstraints(code, technology);

    return code;
  }

  /**
   * Get database-specific best practices
   */
  async getBestPractices(technology: string, context: Context7Data): Promise<string[]> {
    const practices = [
      'Use appropriate data types for optimal storage',
      'Implement proper indexing strategy',
      'Use primary key constraints for unique identification',
      'Use foreign key constraints for referential integrity',
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
  async validateCode(code: string, technology: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // SQL injection checks
    if (code.match(/SELECT.*FROM.*WHERE.*\+/gi)) {
      errors.push('Potential SQL injection vulnerability detected');
    }

    // Missing primary keys
    if (code.includes('CREATE TABLE') && !code.includes('PRIMARY KEY')) {
      warnings.push('Table created without primary key');
    }

    // Analyze with specialized analyzers
    const analysis = await this.analyzeCode(code, technology, {
      insights: { patterns: [], recommendations: [], qualityMetrics: { overall: 0 } },
    });

    // Add analyzer-specific suggestions
    if (analysis.queryOptimization) {
      suggestions.push(...analysis.queryOptimization.optimizations);
    }

    if (analysis.dataIntegrity) {
      suggestions.push(...analysis.dataIntegrity.validations);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Optimize database code for performance and integrity
   */
  async optimizeCode(code: string, technology: string, context: Context7Data): Promise<string> {
    let optimizedCode = code;

    // Apply optimization features
    optimizedCode = this.addOptimizationFeatures(optimizedCode, technology);
    optimizedCode = this.addIntegrityConstraints(optimizedCode, technology);

    // Apply Context7 insights
    const insights = await this.getTechnologyInsights(technology, context);
    optimizedCode = await this.applyContext7Insights(optimizedCode, insights);

    return optimizedCode;
  }

  /**
   * Private helper methods (core functionality)
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

    if (code.includes('VARCHAR(255)') || code.includes('TEXT')) {
      if (!code.includes('NOT NULL')) {
        suggestions.push('Consider adding NOT NULL constraints for required fields');
        score -= 3;
      }
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
    let score = 85;
    const suggestions: string[] = [];

    // Check for proper naming conventions
    if (code.includes('CREATE TABLE') && code.match(/CREATE TABLE\s+[a-z]+\s/gi)) {
      score += 5; // Good lowercase table names
    }

    if (code.includes('CREATE TABLE') && code.match(/CREATE TABLE\s+\w+s\s/gi)) {
      score += 3; // Plural table names
    }

    // Check for comments
    const commentCount = (code.match(/--/g) || []).length + (code.match(/\/\*/g) || []).length;
    const codeLines = code.split('\n').filter(line => line.trim().length > 0).length;

    if (commentCount / codeLines < 0.1) {
      suggestions.push('Add more comments to explain complex queries');
      score -= 8;
    }

    // Check for code organization
    if (code.includes('CREATE') && code.includes('INSERT') && !code.includes('-- ')) {
      suggestions.push('Organize code with section comments');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      complexity: codeLines,
      readability: (commentCount / codeLines) * 100,
      testability: code.includes('ROLLBACK') ? 80 : 60, // Presence of rollback suggests testability
      suggestions,
    };
  }

  private async analyzeSecurity(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<SecurityAnalysis> {
    const vulnerabilities: string[] = [];
    let score = 85;

    // SQL injection checks
    if (code.includes("' + ") || code.includes('" + ')) {
      vulnerabilities.push('Potential SQL injection through string concatenation');
      score -= 25;
    }

    // Permission and access control
    if (code.includes('GRANT ALL') || code.includes('GRANT * ON *')) {
      vulnerabilities.push('Overly permissive database grants');
      score -= 15;
    }

    // Password and authentication
    if (code.includes('PASSWORD') && code.match(/PASSWORD\s*=\s*['"][^'"]{1,8}['"]/)) {
      vulnerabilities.push('Weak password detected (too short)');
      score -= 10;
    }

    // Backup and recovery
    if (!code.includes('BACKUP') && code.includes('CREATE DATABASE')) {
      vulnerabilities.push('No backup strategy mentioned');
      score -= 8;
    }

    return {
      score: Math.max(0, score),
      vulnerabilities,
      recommendations: [
        'Use parameterized queries to prevent SQL injection',
        'Implement principle of least privilege for database access',
        'Use strong passwords and proper authentication',
        'Encrypt sensitive data at rest and in transit',
        'Regular security audits and vulnerability assessments',
        'Implement proper backup and disaster recovery procedures',
      ],
    };
  }

  private generateDatabaseCode(description: string, technology: string, role?: string): string {
    const tech = technology.toLowerCase();

    if (tech.includes('postgresql')) {
      return this.generatePostgreSQLCode(description, role);
    } else if (tech.includes('mysql')) {
      return this.generateMySQLCode(description, role);
    } else if (tech.includes('mongodb')) {
      return this.generateMongoDBCode(description, role);
    }

    return this.generateGenericSQLCode(description, role);
  }

  private generatePostgreSQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseAnalyzer
-- Technology: PostgreSQL
-- Role: ${role || 'developer'}

-- Create database schema
CREATE SCHEMA IF NOT EXISTS app_schema;
SET search_path TO app_schema;

-- Main entity table
CREATE TABLE main_entity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_main_entity_name ON main_entity (name);
CREATE INDEX idx_main_entity_status ON main_entity (status);
CREATE INDEX idx_main_entity_created_at ON main_entity (created_at);

-- Add constraints for data integrity
ALTER TABLE main_entity ADD CONSTRAINT chk_status
    CHECK (status IN ('active', 'inactive', 'pending'));

-- Sample data insertion
INSERT INTO main_entity (name, description, created_by)
VALUES
    ('Sample Entity 1', 'Description for entity 1', 1),
    ('Sample Entity 2', 'Description for entity 2', 1);

-- Query example with optimization
SELECT id, name, status, created_at
FROM main_entity
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

COMMIT;`;
  }

  private generateMySQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseAnalyzer
-- Technology: MySQL
-- Role: ${role || 'developer'}

-- Create database
CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- Main entity table
CREATE TABLE main_entity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO main_entity (name, description, created_by) VALUES
    ('Sample Entity 1', 'Description for entity 1', 1),
    ('Sample Entity 2', 'Description for entity 2', 1);

-- Optimized query
SELECT id, name, status, created_at
FROM main_entity
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;`;
  }

  private generateMongoDBCode(description: string, role?: string): string {
    return `// ${description}
// Generated by DatabaseAnalyzer
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
                _id: { bsonType: 'objectId' },
                name: { bsonType: 'string', maxLength: 255 },
                description: { bsonType: 'string' },
                status: { enum: ['active', 'inactive', 'pending'] },
                created_by: { bsonType: 'int' },
                created_at: { bsonType: 'date' }
            }
        }
    }
});

// Create indexes for performance
db.main_entity.createIndex({ name: 1 });
db.main_entity.createIndex({ status: 1 });
db.main_entity.createIndex({ created_at: -1 });

// Sample data insertion
db.main_entity.insertMany([
    {
        name: 'Sample Entity 1',
        description: 'Description for entity 1',
        status: 'active',
        created_by: 1,
        created_at: new Date()
    },
    {
        name: 'Sample Entity 2',
        description: 'Description for entity 2',
        status: 'active',
        created_by: 1,
        created_at: new Date()
    }
]);

// Optimized query with projection
db.main_entity.find(
    { status: 'active' },
    { name: 1, status: 1, created_at: 1 }
).sort({ created_at: -1 }).limit(10);`;
  }

  private generateGenericSQLCode(description: string, role?: string): string {
    return `-- ${description}
-- Generated by DatabaseAnalyzer
-- Technology: Generic SQL
-- Role: ${role || 'developer'}

-- Main entity table
CREATE TABLE main_entity (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_main_entity_name ON main_entity (name);
CREATE INDEX idx_main_entity_status ON main_entity (status);

-- Sample query
SELECT id, name, status, created_at
FROM main_entity
WHERE status = 'active'
ORDER BY created_at DESC;`;
  }

  private async applyQualityStandards(code: string, quality: string): Promise<string> {
    // Apply quality-specific enhancements
    if (quality === 'enterprise' || quality === 'production') {
      // Add more comprehensive constraints and optimizations
      if (code.includes('CREATE TABLE') && !code.includes('CONSTRAINT')) {
        code = code.replace(
          /CREATE TABLE (\w+)/g,
          'CREATE TABLE $1 -- Enhanced with enterprise constraints'
        );
      }
    }
    return code;
  }

  private addOptimizationFeatures(code: string, technology: string): string {
    // Add database-specific optimizations
    if (technology.toLowerCase().includes('postgresql') && !code.includes('ANALYZE')) {
      code += '\n\n-- Performance optimization\nANALYZE main_entity;';
    }

    if (technology.toLowerCase().includes('mysql') && !code.includes('OPTIMIZE')) {
      code += '\n\n-- Performance optimization\n-- OPTIMIZE TABLE main_entity;';
    }

    return code;
  }

  private addIntegrityConstraints(code: string, _technology: string): string {
    // Add integrity constraints if missing
    if (code.includes('CREATE TABLE') && !code.includes('FOREIGN KEY')) {
      // This is a simplified example - would need more sophisticated logic
      code += '\n\n-- Add foreign key constraints as needed';
    }

    return code;
  }
}
