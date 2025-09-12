/**
 * Database Data Integrity Analyzer
 *
 * Specialized analyzer for database data integrity, constraints,
 * relationships, and validation rules. Extracted from DatabaseIntelligenceEngine.
 */

// Database-specific analysis interface
export interface DataIntegrityAnalysis {
  score: number;
  constraints: string[];
  relationships: string[];
  validations: string[];
}

/**
 * Analyze and ensure database data integrity
 */
export class DataIntegrityAnalyzer {
  /**
   * Analyze data integrity constraints and relationships
   */
  async analyzeDataIntegrity(
    code: string,
    _technology: string,
    _insights: any
  ): Promise<DataIntegrityAnalysis> {
    const constraints: string[] = [];
    const relationships: string[] = [];
    const validations: string[] = [];
    let score = 80;

    // 1. Primary Key Constraints
    if (code.includes('PRIMARY KEY')) {
      constraints.push('Primary key constraint');
      score += 5;

      // Check for composite primary keys
      if (code.match(/PRIMARY KEY\s*\([^)]*,/)) {
        constraints.push('Composite primary key');
        score += 3;
      }
    } else if (code.includes('CREATE TABLE')) {
      validations.push('Missing primary key constraint');
      score -= 15;
    }

    // 2. Foreign Key Constraints
    if (code.includes('FOREIGN KEY')) {
      constraints.push('Foreign key constraint');
      relationships.push('Referential integrity enforced');
      score += 10;

      // Check for cascade options
      if (code.includes('ON DELETE CASCADE') || code.includes('ON UPDATE CASCADE')) {
        constraints.push('Cascade operations defined');
        score += 5;
      }

      if (code.includes('ON DELETE SET NULL') || code.includes('ON UPDATE SET NULL')) {
        constraints.push('SET NULL operations defined');
        score += 3;
      }
    }

    // 3. NOT NULL Constraints
    if (code.includes('NOT NULL')) {
      constraints.push('NOT NULL constraint');
      score += 3;

      // Count NOT NULL constraints
      const notNullCount = (code.match(/NOT NULL/g) || []).length;
      if (notNullCount > 3) {
        constraints.push(`Multiple NOT NULL constraints (${notNullCount})`);
        score += 2;
      }
    }

    // 4. UNIQUE Constraints
    if (code.includes('UNIQUE')) {
      constraints.push('UNIQUE constraint');
      score += 4;

      if (code.includes('CONSTRAINT') && code.includes('UNIQUE')) {
        constraints.push('Named UNIQUE constraint');
        score += 2;
      }
    }

    // 5. CHECK Constraints
    if (code.includes('CHECK')) {
      constraints.push('CHECK constraint');
      validations.push('Custom validation rules');
      score += 8;

      // Analyze CHECK constraint complexity
      if (code.includes('CHECK') && code.includes('IN (')) {
        validations.push('Enumeration validation');
        score += 3;
      }

      if (code.includes('CHECK') && code.includes('>')) {
        validations.push('Range validation');
        score += 3;
      }
    }

    // 6. Data Type Constraints
    if (code.includes('VARCHAR') && code.includes('(')) {
      const varcharMatches = code.match(/VARCHAR\s*\(\s*(\d+)\s*\)/gi) || [];
      if (
        varcharMatches.some(match => {
          const size = parseInt(match.match(/\d+/)?.[0] || '0');
          return size > 0 && size <= 255;
        })
      ) {
        constraints.push('Appropriate VARCHAR length constraints');
        score += 2;
      }
    }

    // 7. Index Constraints for Performance
    if (code.includes('CREATE UNIQUE INDEX')) {
      constraints.push('UNIQUE index constraint');
      score += 5;
    }

    // 8. Relationship Analysis
    if (code.includes('REFERENCES')) {
      relationships.push('Table relationships defined');
      score += 5;
    }

    // Check for many-to-many relationships (junction tables)
    if (this.detectJunctionTable(code)) {
      relationships.push('Many-to-many relationship detected');
      score += 8;
    }

    // 9. Validation Rules Analysis
    if (code.includes('TRIGGER')) {
      validations.push('Custom trigger validations');
      score += 10;

      if (code.includes('BEFORE INSERT') || code.includes('BEFORE UPDATE')) {
        validations.push('Pre-modification validation');
        score += 5;
      }
    }

    // 10. Data Integrity Anti-patterns
    if (code.includes('NULL') && !code.includes('NOT NULL') && code.includes('CREATE TABLE')) {
      validations.push('Potential null value issues - consider NOT NULL constraints');
      score -= 5;
    }

    if (code.includes('VARCHAR(MAX)') || (code.includes('TEXT') && code.includes('PRIMARY KEY'))) {
      validations.push('Large text fields as primary keys may impact performance');
      score -= 8;
    }

    // 11. Normalization Analysis
    const normalizationScore = this.analyzeNormalization(code);
    score += normalizationScore;
    if (normalizationScore > 0) {
      validations.push('Good database normalization detected');
    } else if (normalizationScore < 0) {
      validations.push('Potential normalization issues detected');
    }

    // 12. Transaction Integrity
    if (code.includes('BEGIN') && code.includes('COMMIT')) {
      constraints.push('Transaction boundaries defined');
      score += 8;
    }

    if (code.includes('ROLLBACK')) {
      constraints.push('Error handling with rollback');
      score += 5;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      constraints,
      relationships,
      validations,
    };
  }

  /**
   * Detect junction/bridge tables for many-to-many relationships
   */
  private detectJunctionTable(code: string): boolean {
    // Look for tables with multiple foreign keys and minimal additional columns
    const createTableMatches = code.match(/CREATE TABLE\s+\w+\s*\([^)]+\)/gi) || [];

    return createTableMatches.some(tableCode => {
      const foreignKeyCount = (tableCode.match(/FOREIGN KEY/gi) || []).length;
      const primaryKeyCount = (tableCode.match(/PRIMARY KEY/gi) || []).length;

      // Junction table typically has 2+ foreign keys and composite primary key
      return foreignKeyCount >= 2 && primaryKeyCount <= 1;
    });
  }

  /**
   * Analyze database normalization (simplified heuristics)
   */
  private analyzeNormalization(code: string): number {
    let score = 0;

    // 1NF: Atomic values (check for comma-separated values in single column)
    if (code.includes('VARCHAR') && !code.includes(',')) {
      score += 2; // Basic assumption of atomic values
    }

    // 2NF: Full functional dependency (check for composite keys)
    if (code.match(/PRIMARY KEY\s*\([^)]*,/)) {
      score += 3; // Composite primary keys suggest 2NF consideration
    }

    // 3NF: No transitive dependencies (check for separate lookup tables)
    const tableCount = (code.match(/CREATE TABLE/gi) || []).length;
    if (tableCount > 2) {
      score += 5; // Multiple tables suggest normalization
    }

    // Anti-patterns that suggest denormalization issues
    if (code.includes('_name') && code.includes('_id') && code.includes('JOIN')) {
      score -= 3; // Might indicate redundant data
    }

    return score;
  }

  /**
   * Generate data integrity recommendations
   */
  getIntegrityRecommendations(code: string, technology: string): string[] {
    const recommendations: string[] = [];

    // Basic constraint recommendations
    if (!code.includes('PRIMARY KEY')) {
      recommendations.push('Add primary key constraints to all tables');
    }

    if (!code.includes('FOREIGN KEY') && code.includes('_id')) {
      recommendations.push('Add foreign key constraints for referential integrity');
    }

    if (!code.includes('NOT NULL')) {
      recommendations.push('Add NOT NULL constraints for required fields');
    }

    if (!code.includes('CHECK')) {
      recommendations.push('Consider CHECK constraints for data validation');
    }

    // Technology-specific recommendations
    if (technology.toLowerCase().includes('postgresql')) {
      recommendations.push('Use PostgreSQL domains for custom data types');
      recommendations.push('Consider exclusion constraints for complex validation');
      recommendations.push('Use deferrable constraints for complex transactions');
    }

    if (technology.toLowerCase().includes('mysql')) {
      recommendations.push('Use appropriate storage engines (InnoDB for transactions)');
      recommendations.push('Consider using ENUM types for limited value sets');
    }

    // General best practices
    recommendations.push('Normalize data to reduce redundancy');
    recommendations.push('Use appropriate data types for storage efficiency');
    recommendations.push('Implement proper backup and recovery strategies');
    recommendations.push('Use transactions for data consistency');

    return recommendations;
  }

  /**
   * Validate constraint syntax and suggest improvements
   */
  validateConstraints(code: string): {
    valid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let valid = true;

    // Check for common constraint errors
    if (code.includes('FOREIGN KEY') && !code.includes('REFERENCES')) {
      errors.push('FOREIGN KEY without REFERENCES clause');
      valid = false;
    }

    if (code.includes('PRIMARY KEY') && code.includes('NULL')) {
      errors.push('PRIMARY KEY columns cannot be NULL');
      valid = false;
    }

    // Check for missing constraint names
    if (code.includes('FOREIGN KEY') && !code.includes('CONSTRAINT')) {
      suggestions.push('Name your constraints for better maintenance');
    }

    // Check for cascade behavior
    if (
      code.includes('FOREIGN KEY') &&
      !code.includes('ON DELETE') &&
      !code.includes('ON UPDATE')
    ) {
      suggestions.push('Specify cascade behavior for foreign keys');
    }

    return { valid, errors, suggestions };
  }

  /**
   * Generate SQL for adding missing constraints
   */
  generateConstraintSQL(
    tableName: string,
    constraints: {
      primaryKey?: string[];
      foreignKeys?: Array<{ column: string; references: string; onDelete?: string }>;
      notNull?: string[];
      unique?: string[];
      check?: Array<{ column: string; condition: string }>;
    }
  ): string {
    const sql: string[] = [];

    // Primary key
    if (constraints.primaryKey && constraints.primaryKey.length > 0) {
      sql.push(`ALTER TABLE ${tableName} ADD PRIMARY KEY (${constraints.primaryKey.join(', ')});`);
    }

    // Foreign keys
    if (constraints.foreignKeys) {
      constraints.foreignKeys.forEach((fk, index) => {
        const onDelete = fk.onDelete ? ` ON DELETE ${fk.onDelete}` : '';
        sql.push(
          `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${index + 1} ` +
            `FOREIGN KEY (${fk.column}) REFERENCES ${fk.references}${onDelete};`
        );
      });
    }

    // NOT NULL constraints
    if (constraints.notNull) {
      constraints.notNull.forEach(column => {
        sql.push(`ALTER TABLE ${tableName} ALTER COLUMN ${column} SET NOT NULL;`);
      });
    }

    // UNIQUE constraints
    if (constraints.unique) {
      constraints.unique.forEach((column, index) => {
        sql.push(
          `ALTER TABLE ${tableName} ADD CONSTRAINT uk_${tableName}_${index + 1} UNIQUE (${column});`
        );
      });
    }

    // CHECK constraints
    if (constraints.check) {
      constraints.check.forEach((check, index) => {
        sql.push(
          `ALTER TABLE ${tableName} ADD CONSTRAINT ck_${tableName}_${index + 1} ` +
            `CHECK (${check.condition});`
        );
      });
    }

    return sql.join('\n');
  }
}
