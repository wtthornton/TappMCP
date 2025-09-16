#!/usr/bin/env node

/**
 * Context7 Query Optimizer
 *
 * Enhances query formulation and result processing for better Context7 API responses.
 * Provides intelligent query expansion, relevance scoring, and result filtering.
 */

export interface QueryOptimizationResult {
  originalQuery: string;
  optimizedQuery: string;
  queryType: 'documentation' | 'code_examples' | 'best_practices' | 'troubleshooting';
  confidence: number;
  suggestions: string[];
  filters: QueryFilters;
}

export interface QueryFilters {
  language?: string;
  framework?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  maxResults?: number;
}

export interface QueryExpansion {
  synonyms: string[];
  relatedTerms: string[];
  technicalTerms: string[];
  contextTerms: string[];
}

export class Context7QueryOptimizer {
  private queryPatterns: Map<string, string[]> = new Map();
  private technicalTerms: Map<string, string[]> = new Map();
  private contextMappings: Map<string, string[]> = new Map();

  constructor() {
    this.initializeQueryPatterns();
    this.initializeTechnicalTerms();
    this.initializeContextMappings();
  }

  /**
   * Optimize a query for better Context7 results
   */
  optimizeQuery(
    originalQuery: string,
    queryType: 'documentation' | 'code_examples' | 'best_practices' | 'troubleshooting',
    context?: {
      language?: string;
      framework?: string;
      domain?: string;
      difficulty?: string;
    }
  ): QueryOptimizationResult {
    const normalizedQuery = this.normalizeQuery(originalQuery);
    const expandedQuery = this.expandQuery(normalizedQuery, queryType, context);
    const optimizedQuery = this.applyQueryOptimizations(expandedQuery, queryType);
    const confidence = this.calculateConfidence(normalizedQuery, optimizedQuery);
    const suggestions = this.generateSuggestions(originalQuery, queryType);
    const filters = this.extractFilters(originalQuery, context);

    return {
      originalQuery,
      optimizedQuery,
      queryType,
      confidence,
      suggestions,
      filters
    };
  }

  /**
   * Normalize query for consistent processing
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(how to|how do i|how can i)\b/g, '') // Remove common question prefixes
      .replace(/\b(please|help|need)\b/g, '') // Remove polite words
      .trim();
  }

  /**
   * Expand query with synonyms and related terms
   */
  private expandQuery(
    query: string,
    queryType: string,
    context?: any
  ): string {
    const words = query.split(' ');
    const expandedWords = new Set(words);

    // Add synonyms and related terms
    for (const word of words) {
      const synonyms = this.getSynonyms(word, queryType);
      synonyms.forEach(syn => expandedWords.add(syn));

      const related = this.getRelatedTerms(word, queryType);
      related.forEach(rel => expandedWords.add(rel));
    }

    // Add context-specific terms
    if (context?.language) {
      expandedWords.add(context.language);
      const langTerms = this.getLanguageTerms(context.language);
      langTerms.forEach(term => expandedWords.add(term));
    }

    if (context?.framework) {
      expandedWords.add(context.framework);
      const frameworkTerms = this.getFrameworkTerms(context.framework);
      frameworkTerms.forEach(term => expandedWords.add(term));
    }

    // Add query type specific terms
    const typeTerms = this.getQueryTypeTerms(queryType);
    typeTerms.forEach(term => expandedWords.add(term));

    return Array.from(expandedWords).join(' ');
  }

  /**
   * Apply query-specific optimizations
   */
  private applyQueryOptimizations(query: string, queryType: string): string {
    let optimized = query;

    // Apply type-specific optimizations
    switch (queryType) {
      case 'documentation':
        optimized = this.optimizeForDocumentation(optimized);
        break;
      case 'code_examples':
        optimized = this.optimizeForCodeExamples(optimized);
        break;
      case 'best_practices':
        optimized = this.optimizeForBestPractices(optimized);
        break;
      case 'troubleshooting':
        optimized = this.optimizeForTroubleshooting(optimized);
        break;
    }

    // Remove duplicate words
    const words = optimized.split(' ');
    const uniqueWords = Array.from(new Set(words));

    return uniqueWords.join(' ');
  }

  /**
   * Optimize query for documentation searches
   */
  private optimizeForDocumentation(query: string): string {
    // Add documentation-specific terms
    const docTerms = ['documentation', 'guide', 'reference', 'api', 'docs'];
    const words = query.split(' ');

    // Only add if not already present
    docTerms.forEach(term => {
      if (!words.includes(term)) {
        words.push(term);
      }
    });

    return words.join(' ');
  }

  /**
   * Optimize query for code examples
   */
  private optimizeForCodeExamples(query: string): string {
    // Add code-specific terms
    const codeTerms = ['example', 'sample', 'code', 'implementation', 'tutorial'];
    const words = query.split(' ');

    codeTerms.forEach(term => {
      if (!words.includes(term)) {
        words.push(term);
      }
    });

    return words.join(' ');
  }

  /**
   * Optimize query for best practices
   */
  private optimizeForBestPractices(query: string): string {
    // Add best practices terms
    const bpTerms = ['best practices', 'guidelines', 'patterns', 'recommendations', 'standards'];
    const words = query.split(' ');

    bpTerms.forEach(term => {
      if (!words.includes(term)) {
        words.push(term);
      }
    });

    return words.join(' ');
  }

  /**
   * Optimize query for troubleshooting
   */
  private optimizeForTroubleshooting(query: string): string {
    // Add troubleshooting terms
    const tsTerms = ['error', 'issue', 'problem', 'fix', 'solution', 'debug', 'troubleshoot'];
    const words = query.split(' ');

    tsTerms.forEach(term => {
      if (!words.includes(term)) {
        words.push(term);
      }
    });

    return words.join(' ');
  }

  /**
   * Calculate confidence score for the optimization
   */
  private calculateConfidence(originalQuery: string, optimizedQuery: string): number {
    const originalWords = originalQuery.split(' ').length;
    const optimizedWords = optimizedQuery.split(' ').length;

    // Base confidence on query expansion ratio
    const expansionRatio = optimizedWords / originalWords;

    // Higher confidence for moderate expansion (1.5-3x)
    if (expansionRatio >= 1.5 && expansionRatio <= 3.0) {
      return 0.9;
    } else if (expansionRatio >= 1.2 && expansionRatio <= 4.0) {
      return 0.7;
    } else {
      return 0.5;
    }
  }

  /**
   * Generate suggestions for better queries
   */
  private generateSuggestions(originalQuery: string, queryType: string): string[] {
    const suggestions: string[] = [];
    const words = originalQuery.split(' ');

    // Suggest more specific terms
    if (words.length < 3) {
      suggestions.push('Try adding more specific terms to your query');
    }

    // Suggest query type specific improvements
    switch (queryType) {
      case 'code_examples':
        if (!words.some(w => ['example', 'sample', 'code'].includes(w))) {
          suggestions.push('Add "example" or "sample" for better code results');
        }
        break;
      case 'troubleshooting':
        if (!words.some(w => ['error', 'issue', 'problem'].includes(w))) {
          suggestions.push('Include specific error messages or problem descriptions');
        }
        break;
      case 'documentation':
        if (!words.some(w => ['docs', 'guide', 'reference'].includes(w))) {
          suggestions.push('Add "docs" or "guide" for better documentation results');
        }
        break;
      case 'best_practices':
        if (!words.some(w => ['pattern', 'guideline', 'standard'].includes(w))) {
          suggestions.push('Add "pattern" or "guideline" for better best practices results');
        }
        break;
    }

    return suggestions;
  }

  /**
   * Extract filters from query and context
   */
  private extractFilters(query: string, context?: any): QueryFilters {
    const filters: QueryFilters = {};

    // Extract language from query or context
    const language = this.extractLanguage(query) || context?.language;
    if (language) {
      filters.language = language;
    }

    // Extract framework from query or context
    const framework = this.extractFramework(query) || context?.framework;
    if (framework) {
      filters.framework = framework;
    }

    // Extract difficulty level
    const difficulty = this.extractDifficulty(query);
    if (difficulty) {
      filters.difficulty = difficulty;
    }

    // Set default max results
    filters.maxResults = 5;

    return filters;
  }

  /**
   * Extract programming language from query
   */
  private extractLanguage(query: string): string | null {
    const languages = ['javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'];
    const words = query.toLowerCase().split(' ');

    for (const word of words) {
      if (languages.includes(word)) {
        return word;
      }
    }

    return null;
  }

  /**
   * Extract framework from query
   */
  private extractFramework(query: string): string | null {
    const frameworks = ['react', 'vue', 'angular', 'express', 'django', 'spring', 'laravel', 'rails', 'next', 'nuxt', 'svelte'];
    const words = query.toLowerCase().split(' ');

    for (const word of words) {
      if (frameworks.includes(word)) {
        return word;
      }
    }

    return null;
  }

  /**
   * Extract difficulty level from query
   */
  private extractDifficulty(query: string): 'beginner' | 'intermediate' | 'advanced' | null {
    const words = query.toLowerCase().split(' ');

    if (words.some(w => ['beginner', 'basic', 'simple', 'easy', 'intro'].includes(w))) {
      return 'beginner';
    }

    if (words.some(w => ['advanced', 'expert', 'complex', 'sophisticated'].includes(w))) {
      return 'advanced';
    }

    if (words.some(w => ['intermediate', 'medium', 'moderate'].includes(w))) {
      return 'intermediate';
    }

    return null;
  }

  /**
   * Get synonyms for a word
   */
  private getSynonyms(word: string, queryType: string): string[] {
    const synonyms = this.queryPatterns.get(word) || [];
    return synonyms.slice(0, 3); // Limit to 3 synonyms
  }

  /**
   * Get related terms for a word
   */
  private getRelatedTerms(word: string, queryType: string): string[] {
    const related = this.technicalTerms.get(word) || [];
    return related.slice(0, 2); // Limit to 2 related terms
  }

  /**
   * Get language-specific terms
   */
  private getLanguageTerms(language: string): string[] {
    const langTerms: Record<string, string[]> = {
      'javascript': ['js', 'ecmascript', 'node', 'browser'],
      'typescript': ['ts', 'typed', 'interface', 'generic'],
      'python': ['py', 'pandas', 'numpy', 'django', 'flask'],
      'java': ['jvm', 'spring', 'maven', 'gradle'],
      'csharp': ['c#', 'dotnet', 'net', 'aspnet'],
    };

    return langTerms[language.toLowerCase()] || [];
  }

  /**
   * Get framework-specific terms
   */
  private getFrameworkTerms(framework: string): string[] {
    const frameworkTerms: Record<string, string[]> = {
      'react': ['jsx', 'component', 'hook', 'redux', 'next'],
      'vue': ['vuejs', 'component', 'composable', 'nuxt'],
      'angular': ['ng', 'component', 'service', 'directive'],
      'express': ['node', 'middleware', 'route', 'api'],
    };

    return frameworkTerms[framework.toLowerCase()] || [];
  }

  /**
   * Get query type specific terms
   */
  private getQueryTypeTerms(queryType: string): string[] {
    const typeTerms: Record<string, string[]> = {
      'documentation': ['docs', 'reference', 'guide', 'manual'],
      'code_examples': ['example', 'sample', 'demo', 'tutorial'],
      'best_practices': ['pattern', 'guideline', 'standard', 'recommendation'],
      'troubleshooting': ['error', 'issue', 'problem', 'debug', 'fix'],
    };

    return typeTerms[queryType] || [];
  }

  /**
   * Initialize query patterns and synonyms
   */
  private initializeQueryPatterns(): void {
    this.queryPatterns = new Map([
      ['create', ['build', 'make', 'generate', 'develop']],
      ['show', ['display', 'render', 'present', 'demonstrate']],
      ['get', ['fetch', 'retrieve', 'obtain', 'acquire']],
      ['set', ['configure', 'setup', 'establish', 'define']],
      ['update', ['modify', 'change', 'edit', 'revise']],
      ['delete', ['remove', 'destroy', 'eliminate', 'clear']],
      ['find', ['search', 'locate', 'discover', 'detect']],
      ['use', ['utilize', 'employ', 'apply', 'implement']],
      ['help', ['assist', 'support', 'guide', 'aid']],
      ['error', ['issue', 'problem', 'bug', 'fault']],
    ]);
  }

  /**
   * Initialize technical terms and relationships
   */
  private initializeTechnicalTerms(): void {
    this.technicalTerms = new Map([
      ['api', ['endpoint', 'service', 'interface', 'rest']],
      ['database', ['db', 'storage', 'persistence', 'sql']],
      ['authentication', ['auth', 'login', 'security', 'token']],
      ['validation', ['verify', 'check', 'validate', 'sanitize']],
      ['performance', ['speed', 'optimization', 'efficiency', 'fast']],
      ['security', ['secure', 'protection', 'safety', 'vulnerability']],
      ['testing', ['test', 'spec', 'unit', 'integration']],
      ['deployment', ['deploy', 'release', 'production', 'hosting']],
    ]);
  }

  /**
   * Initialize context mappings
   */
  private initializeContextMappings(): void {
    this.contextMappings = new Map([
      ['web', ['frontend', 'backend', 'fullstack', 'spa']],
      ['mobile', ['ios', 'android', 'react-native', 'flutter']],
      ['data', ['analytics', 'ml', 'ai', 'statistics']],
      ['devops', ['ci', 'cd', 'docker', 'kubernetes']],
    ]);
  }
}

// Export factory function
export function createContext7QueryOptimizer(): Context7QueryOptimizer {
  return new Context7QueryOptimizer();
}
