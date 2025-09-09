#!/usr/bin/env node

/**
 * Code Reuse Pattern Engine
 *
 * Detects, analyzes, and suggests reusable code patterns to reduce token usage
 * and improve code quality through pattern-based optimization.
 */

import { z } from 'zod';
import { createHash } from 'crypto';

// Configuration schema
const DetectionConfigSchema = z.object({
  minPatternSize: z.number().min(3).default(3),
  maxPatternSize: z.number().max(50).default(20),
  minOccurrences: z.number().min(2).default(2),
  minSimilarity: z.number().min(0.1).max(1.0).default(0.7),
  excludePatterns: z
    .array(z.string())
    .default([
      'import ',
      'export ',
      '//',
      '/*',
      '*/',
      'interface ',
      'type ',
      'enum ',
      'const ',
      'let ',
      'var ',
      'if (',
      'for (',
      'while (',
      'switch (',
      'try {',
      'catch (',
      'finally {',
      'return ',
      'throw ',
      'console.log',
      'console.error',
      'console.warn',
      'console.info',
      'debugger',
      'break',
      'continue',
    ]),
});

// Code pattern schema
const CodePatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    'function',
    'class',
    'type',
    'control-flow',
    'error-handling',
    'async',
    'testing',
    'module',
    'utility',
  ]),
  complexity: z.enum(['low', 'medium', 'high']),
  pattern: z.string(),
  abstractPattern: z.string(),
  variables: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      description: z.string().optional(),
    })
  ),
  dependencies: z.array(z.string()),
  examples: z.array(z.string()),
  metrics: z.object({
    tokensPerUse: z.number(),
    avgComplexity: z.number(),
    reuseOpportunities: z.number(),
    potentialSavings: z.number(),
  }),
});

// Pattern suggestion schema
const PatternSuggestionSchema = z.object({
  id: z.string(),
  patternId: z.string(),
  code: z.string(),
  similarity: z.number(),
  suggestedReplacement: z.string(),
  confidence: z.number(),
  rationale: z.string(),
  context: z.record(z.unknown()),
});

// Similarity result schema
const SimilarityResultSchema = z.object({
  similarity: z.number(),
  commonLines: z.number(),
  totalLines: z.number(),
});

export type DetectionConfig = z.infer<typeof DetectionConfigSchema>;
export type CodePattern = z.infer<typeof CodePatternSchema>;
export type PatternSuggestion = z.infer<typeof PatternSuggestionSchema>;
export type SimilarityResult = z.infer<typeof SimilarityResultSchema>;

export class CodeReusePatternEngine {
  private config: DetectionConfig;
  private patterns: Map<string, CodePattern>;
  private patternIndex: Map<string, Set<string>>; // hash -> pattern IDs
  private codeCache: Map<string, string[]>; // file -> lines

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = DetectionConfigSchema.parse(config);
    this.patterns = new Map();
    this.patternIndex = new Map();
    this.codeCache = new Map();
  }

  /**
   * Analyze codebase and detect patterns
   */
  async analyzeCodebase(files: Array<{ path: string; content: string }>): Promise<CodePattern[]> {
    console.log(`Analyzing ${files.length} files for code patterns...`);

    // Clear previous analysis
    this.patterns.clear();
    this.patternIndex.clear();
    this.codeCache.clear();

    // Cache all file contents
    for (const file of files) {
      const lines = file.content.split('\n');
      this.codeCache.set(file.path, lines);
    }

    // Extract code segments and find patterns
    const codeSegments = this.extractCodeSegments(files);
    const detectedPatterns = this.findSimilarPatterns(codeSegments);

    // Analyze and rank patterns
    const analyzedPatterns = await this.analyzePatterns(detectedPatterns);

    // Store patterns
    for (const pattern of analyzedPatterns) {
      this.patterns.set(pattern.id, pattern);
      this.indexPattern(pattern);
    }

    console.log(`Detected ${analyzedPatterns.length} code patterns`);
    return analyzedPatterns;
  }

  /**
   * Suggest pattern applications for new code
   */
  async suggestPatterns(
    code: string,
    context: Record<string, unknown> = {}
  ): Promise<PatternSuggestion[]> {
    const suggestions: PatternSuggestion[] = [];
    const lines = code.split('\n');

    for (const [_patternId, pattern] of this.patterns) {
      const similarity = this.calculateSimilarity(lines, pattern.pattern.split('\n'));

      if (similarity.similarity >= this.config.minSimilarity) {
        const suggestion = await this.createPatternSuggestion(pattern, code, similarity, context);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get pattern statistics
   */
  getPatternStats(): {
    totalPatterns: number;
    patternsByCategory: Record<string, number>;
    totalPotentialSavings: number;
    processCompliancePatterns: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      pattern: string;
      abstractPattern: string;
      metrics: {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
      };
    }>;
    qualityFailurePatterns: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      pattern: string;
      abstractPattern: string;
      metrics: {
        tokensPerUse: number;
        avgComplexity: number;
        reuseOpportunities: number;
        potentialSavings: number;
      };
    }>;
  } {
    const patternsByCategory: Record<string, number> = {};
    let totalPotentialSavings = 0;

    for (const pattern of this.patterns.values()) {
      patternsByCategory[pattern.category] = (patternsByCategory[pattern.category] || 0) + 1;
      totalPotentialSavings += pattern.metrics.potentialSavings;
    }

    return {
      totalPatterns: this.patterns.size,
      patternsByCategory,
      totalPotentialSavings,
      processCompliancePatterns: this.getProcessCompliancePatterns(),
      qualityFailurePatterns: this.getQualityFailurePatterns(),
    };
  }

  /**
   * Get process compliance patterns from archive lessons
   */
  private getProcessCompliancePatterns(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    pattern: string;
    abstractPattern: string;
    metrics: {
      tokensPerUse: number;
      avgComplexity: number;
      reuseOpportunities: number;
      potentialSavings: number;
    };
  }> {
    return [
      {
        id: 'process_compliance_1',
        name: 'Role Compliance Validation',
        description: 'Pattern for validating role compliance before proceeding with operations',
        category: 'utility',
        pattern: `// Role compliance validation pattern
if (!this.validateRoleCompliance(role)) {
  throw new Error('Role compliance validation failed');
}

// Run early quality checks
const qualityResults = await this.runQualityGates();
if (!qualityResults.allPassed) {
  throw new Error(\`Quality gates failed: \${qualityResults.failures.join(', ')}\`);
}

// Validate test coverage
const coverage = await this.getTestCoverage();
if (coverage < 85) {
  throw new Error(\`Test coverage \${coverage}% below 85% threshold\`);
}

// Validate TypeScript compilation
const tsResults = await this.runTypeScriptCheck();
if (tsResults.errors.length > 0) {
  throw new Error(\`TypeScript errors: \${tsResults.errors.length}\`);
}`,
        abstractPattern: `// Role compliance validation pattern
if (!this.validateRoleCompliance({{ROLE}})) {
  throw new Error('Role compliance validation failed');
}

// Run early quality checks
const qualityResults = await this.runQualityGates();
if (!qualityResults.allPassed) {
  throw new Error(\`Quality gates failed: \${qualityResults.failures.join(', ')}\`);
}

// Validate test coverage
const coverage = await this.getTestCoverage();
if (coverage < {{MIN_COVERAGE}}) {
  throw new Error(\`Test coverage \${coverage}% below {{MIN_COVERAGE}}% threshold\`);
}

// Validate TypeScript compilation
const tsResults = await this.runTypeScriptCheck();
if (tsResults.errors.length > 0) {
  throw new Error(\`TypeScript errors: \${tsResults.errors.length}\`);
}`,
        metrics: {
          tokensPerUse: 120,
          avgComplexity: 4,
          reuseOpportunities: 15,
          potentialSavings: 1800,
        },
      },
    ];
  }

  /**
   * Get quality failure patterns from archive lessons
   */
  private getQualityFailurePatterns(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    pattern: string;
    abstractPattern: string;
    metrics: {
      tokensPerUse: number;
      avgComplexity: number;
      reuseOpportunities: number;
      potentialSavings: number;
    };
  }> {
    return [
      {
        id: 'quality_failure_1',
        name: 'TypeScript Error Resolution',
        description: 'Pattern for resolving TypeScript compilation errors systematically',
        category: 'utility',
        pattern: `// TypeScript error resolution pattern
async function resolve{{ERROR_TYPE}}Errors(): Promise<void> {
  // Phase 1: Identify error types
  const errors = await this.identifyTypeScriptErrors();

  // Phase 2: Categorize by severity
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');

  // Phase 3: Fix in order of priority
  for (const error of criticalErrors) {
    await this.fixTypeScriptError(error);
  }

  // Phase 4: Validate with tests
  await this.validateWithTests();
}`,
        abstractPattern: `// TypeScript error resolution pattern
async function resolve{{ERROR_TYPE}}Errors(): Promise<void> {
  // Phase 1: Identify error types
  const errors = await this.identifyTypeScriptErrors();

  // Phase 2: Categorize by severity
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');

  // Phase 3: Fix in order of priority
  for (const error of criticalErrors) {
    await this.fixTypeScriptError(error);
  }

  // Phase 4: Validate with tests
  await this.validateWithTests();
}`,
        metrics: {
          tokensPerUse: 80,
          avgComplexity: 6,
          reuseOpportunities: 8,
          potentialSavings: 960,
        },
      },
    ];
  }

  /**
   * Extract code segments from files
   */
  private extractCodeSegments(files: Array<{ path: string; content: string }>): Array<{
    code: string[];
    file: string;
    startLine: number;
    endLine: number;
    hash: string;
  }> {
    const segments: Array<any> = [];

    for (const file of files) {
      const lines = file.content.split('\n');

      // Extract segments of different sizes
      for (let size = this.config.minPatternSize; size <= this.config.maxPatternSize; size++) {
        for (let i = 0; i <= lines.length - size; i++) {
          const segment = lines.slice(i, i + size);

          // Filter out excluded patterns
          if (this.shouldExcludeSegment(segment)) {
            continue;
          }

          const hash = this.hashCodeSegment(segment);
          segments.push({
            code: segment,
            file: file.path,
            startLine: i + 1,
            endLine: i + size,
            hash,
          });
        }
      }
    }

    return segments;
  }

  private findSimilarPatterns(segments: Array<any>): Array<{
    segments: Array<any>;
    pattern: string;
    abstractPattern: string;
    confidence: number;
  }> {
    const patternGroups = new Map<string, Array<any>>();

    for (const segment of segments) {
      const { hash } = segment;
      if (!patternGroups.has(hash)) {
        patternGroups.set(hash, []);
      }
      patternGroups.get(hash)!.push(segment);
    }

    const patterns: Array<any> = [];

    for (const [_hash, group] of patternGroups) {
      if (group.length >= this.config.minOccurrences) {
        const pattern = group[0].code.join('\n');
        const abstractPattern = this.createAbstractPattern(group);
        const confidence = this.calculatePatternConfidence(group, pattern);

        patterns.push({
          segments: group,
          pattern,
          abstractPattern,
          confidence,
        });
      }
    }

    return patterns;
  }

  private async analyzePatterns(detectedPatterns: Array<any>): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];

    for (const detected of detectedPatterns) {
      const pattern: CodePattern = {
        id: this.generatePatternId(detected.pattern),
        name: this.generatePatternName(detected.pattern, this.categorizePattern(detected.pattern)),
        description: this.generatePatternDescription(
          detected.pattern,
          this.categorizePattern(detected.pattern)
        ),
        category: this.categorizePattern(detected.pattern),
        complexity: this.assessComplexity(detected.pattern),
        pattern: detected.pattern,
        abstractPattern: detected.abstractPattern,
        variables: this.extractVariables(detected.abstractPattern),
        dependencies: this.extractDependencies(detected.pattern),
        examples: this.generateExamples(detected.segments).map(ex => ex.code),
        metrics: {
          tokensPerUse: this.estimateTokenCount(detected.pattern),
          avgComplexity: this.calculateAverageComplexity(detected.segments),
          reuseOpportunities: detected.segments.length,
          potentialSavings: this.calculatePotentialSavings(
            detected.pattern,
            detected.segments.length
          ),
        },
      };

      patterns.push(pattern);
    }

    return patterns.sort((a, b) => b.metrics.potentialSavings - a.metrics.potentialSavings);
  }

  private shouldExcludeSegment(lines: string[]): boolean {
    const content = lines.join('\n').toLowerCase();

    // Exclude common patterns that aren't useful
    const excludePatterns = [
      'import ',
      'export ',
      '//',
      '/*',
      '*/',
      'interface ',
      'type ',
      'enum ',
      'const ',
      'let ',
      'var ',
      'if (',
      'for (',
      'while (',
      'switch (',
      'try {',
      'catch (',
      'finally {',
      'return ',
      'throw ',
      'console.log',
      'console.error',
      'console.warn',
      'console.info',
      'debugger',
      'break',
      'continue',
    ];

    return excludePatterns.some(pattern => content.includes(pattern));
  }

  private hashCodeSegment(lines: string[]): string {
    const content = lines.join('\n');
    return createHash('md5').update(content).digest('hex');
  }

  private createAbstractPattern(segments: Array<any>): string {
    if (segments.length === 0) return '';

    const firstSegment = segments[0].code;
    let abstractPattern = firstSegment.join('\n');

    // Replace variable names with placeholders
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i].code;
      const similarity = this.calculateSimilarity(firstSegment, segment);

      if (similarity.similarity > 0.8) {
        // Replace different parts with placeholders
        for (let j = 0; j < Math.min(firstSegment.length, segment.length); j++) {
          if (firstSegment[j] !== segment[j]) {
            // Replace with placeholder
            const placeholder = `{{VAR_${j}}}`;
            abstractPattern = abstractPattern.replace(firstSegment[j], placeholder);
          }
        }
      }
    }

    return abstractPattern;
  }

  private calculatePatternConfidence(segments: Array<any>, _pattern: string): number {
    if (segments.length < 2) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const similarity = this.calculateSimilarity(segments[i].code, segments[j].code);
        totalSimilarity += similarity.similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private categorizePattern(pattern: string): CodePattern['category'] {
    const content = pattern.toLowerCase();

    if (content.includes('function') || content.includes('=>')) {
      return 'function';
    } else if (content.includes('class') || content.includes('constructor')) {
      return 'class';
    } else if (content.includes('interface') || content.includes('type')) {
      return 'type';
    } else if (
      content.includes('if') ||
      content.includes('switch') ||
      content.includes('for') ||
      content.includes('while')
    ) {
      return 'control-flow';
    } else if (content.includes('try') || content.includes('catch') || content.includes('throw')) {
      return 'error-handling';
    } else if (
      content.includes('async') ||
      content.includes('await') ||
      content.includes('promise')
    ) {
      return 'async';
    } else if (
      content.includes('test') ||
      content.includes('describe') ||
      content.includes('it(')
    ) {
      return 'testing';
    } else if (
      content.includes('import') ||
      content.includes('export') ||
      content.includes('require')
    ) {
      return 'module';
    } else {
      return 'utility';
    }
  }

  private assessComplexity(pattern: string): CodePattern['complexity'] {
    const lines = pattern.split('\n').filter(line => line.trim().length > 0);
    const lineCount = lines.length;

    if (lineCount <= 3) return 'low';
    if (lineCount <= 10) return 'medium';
    return 'high';
  }

  private extractVariables(abstractPattern: string): Array<{ name: string; type: string }> {
    const variables: Array<{ name: string; type: string }> = [];
    const varRegex = /\{\{VAR_(\d+)\}\}/g;
    let match;

    while ((match = varRegex.exec(abstractPattern)) !== null) {
      const index = parseInt(match[1]);
      variables.push({
        name: `var${index}`,
        type: 'string', // Default type, could be enhanced
      });
    }

    return variables;
  }

  private extractDependencies(pattern: string): string[] {
    const dependencies: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

    let match;
    while ((match = importRegex.exec(pattern)) !== null) {
      dependencies.push(match[1]);
    }

    while ((match = requireRegex.exec(pattern)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  private generateExamples(
    segments: Array<{ code: string[]; file: string }>
  ): Array<{ code: string; description: string }> {
    return segments.map((segment: { code: string[]; file: string }, index: number) => ({
      code: segment.code.join('\n'),
      description: `Example ${index + 1} from ${segment.file}`,
    }));
  }

  private estimateTokenCount(pattern: string): number {
    // Rough estimation: 1 token per 4 characters
    return Math.ceil(pattern.length / 4);
  }

  private calculateAverageComplexity(segments: Array<any>): number {
    if (segments.length === 0) return 0;

    let totalComplexity = 0;
    for (const segment of segments) {
      totalComplexity += segment.code.length;
    }

    return totalComplexity / segments.length;
  }

  private calculatePotentialSavings(pattern: string, occurrences: number): number {
    const tokenCount = this.estimateTokenCount(pattern);
    const savingsPerUse = tokenCount * 0.3; // 30% savings per reuse
    return savingsPerUse * occurrences;
  }

  private generatePatternId(pattern: string): string {
    const hash = createHash('md5').update(pattern).digest('hex');
    return `pattern_${hash.substring(0, 8)}`;
  }

  private generatePatternName(pattern: string, category: string): string {
    const lines = pattern.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';

    if (firstLine.includes('function')) {
      const match = firstLine.match(/function\s+(\w+)/);
      return match ? match[1] : `${category}_pattern`;
    } else if (firstLine.includes('class')) {
      const match = firstLine.match(/class\s+(\w+)/);
      return match ? match[1] : `${category}_pattern`;
    } else {
      return `${category}_pattern_${Date.now()}`;
    }
  }

  private generatePatternDescription(pattern: string, category: string): string {
    const lines = pattern.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';

    return `A ${category} pattern: ${firstLine.substring(0, 100)}...`;
  }

  private calculateSimilarity(lines1: string[], lines2: string[]): SimilarityResult {
    // const _content1 = lines1.join('\n');
    // const _content2 = lines2.join('\n');

    // Simple similarity calculation based on common lines
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const similarity = union.size > 0 ? intersection.size / union.size : 0;

    return {
      similarity,
      commonLines: intersection.size,
      totalLines: union.size,
    };
  }

  private async createPatternSuggestion(
    pattern: CodePattern,
    code: string,
    similarity: SimilarityResult,
    context: Record<string, unknown>
  ): Promise<PatternSuggestion | null> {
    if (similarity.similarity < this.config.minSimilarity) {
      return null;
    }

    const suggestion: PatternSuggestion = {
      id: `suggestion_${Date.now()}`,
      patternId: pattern.id,
      code,
      similarity: similarity.similarity,
      suggestedReplacement: this.applyPatternToCode(pattern, code),
      confidence: similarity.similarity * pattern.metrics.potentialSavings,
      rationale: `This code is ${Math.round(similarity.similarity * 100)}% similar to the "${pattern.name}" pattern. Applying this pattern could save ${Math.round(pattern.metrics.potentialSavings)} tokens.`,
      context,
    };

    return suggestion;
  }

  private applyPatternToCode(pattern: CodePattern, _code: string): string {
    // Simple pattern application - replace with abstract pattern
    return pattern.abstractPattern;
  }

  // private _extractVariableValues(_code: string, _pattern: CodePattern): Record<string, string> {
  //   const values: Record<string, string> = {};

  //   // Extract values based on pattern variables
  //   for (const variable of _pattern.variables) {
  //     // This is a simplified extraction - in practice, you'd need more sophisticated parsing
  //     const regex = new RegExp(`\\b${variable.name}\\b`, 'g');
  //     const matches = _code.match(regex);
  //     if (matches) {
  //       values[variable.name] = matches[0];
  //     }
  //   }

  //   return values;
  // }

  // private _parameterizePattern(
  //   abstractPattern: string,
  //   variables: Array<{ name: string; type: string }>
  // ): string {
  //   let parameterized = abstractPattern;

  //   for (const variable of variables) {
  //     const placeholder = `{{VAR_${variable.name}}}`;
  //     const replacement = `\${${variable.name}}`;
  //     parameterized = parameterized.replace(new RegExp(placeholder, 'g'), replacement);
  //   }

  //   return parameterized;
  // }

  private indexPattern(pattern: CodePattern): void {
    const hash = createHash('md5').update(pattern.pattern).digest('hex');

    if (!this.patternIndex.has(hash)) {
      this.patternIndex.set(hash, new Set());
    }

    this.patternIndex.get(hash)!.add(pattern.id);
  }
}

// Export factory function
export function createCodeReusePatternEngine(
  config?: Partial<DetectionConfig>
): CodeReusePatternEngine {
  return new CodeReusePatternEngine(config);
}
