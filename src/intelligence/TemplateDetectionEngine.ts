/**
 * Template Detection Engine
 * Detects template responses vs. real intelligence in AI assistant interactions
 */

export interface TemplateDetectionResult {
  isTemplate: boolean;
  confidence: number; // 0-1
  templateType?: 'generic' | 'boilerplate' | 'copy-paste' | 'placeholder';
  contextualRelevance: number; // 0-1
  improvementSuggestions: string[];
  detectedPatterns: string[];
  qualityScore: number; // 0-100
}

export interface IntelligenceScore {
  overallScore: number; // 0-100
  contextualRelevance: number; // 0-1
  domainExpertise: number; // 0-1
  originality: number; // 0-1
  specificity: number; // 0-1
  confidence: number; // 0-1
  sourceQuality: number; // 0-1
}

export interface AIResponse {
  content: string;
  timestamp: number;
  context: string;
  domain?: string;
  userId?: string;
  sessionId?: string;
  source: IntelligenceSource;
}

export interface IntelligenceSource {
  type: 'context7' | 'local' | 'external' | 'generated' | 'template';
  sourceId: string;
  timestamp: number;
  credibility: number; // 0-1
  metadata: Record<string, any>;
}

export class TemplateDetectionEngine {
  private templatePatterns: Map<string, RegExp> = new Map();
  private boilerplatePhrases: string[] = [];
  private contextualKeywords: string[] = [];
  private domainSpecificTerms: Map<string, string[]> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeBoilerplatePhrases();
    this.initializeContextualKeywords();
    this.initializeDomainTerms();
  }

  /**
   * Main detection method - analyzes if a response is template vs. real intelligence
   */
  detectTemplate(response: AIResponse): TemplateDetectionResult {
    const content = response.content.toLowerCase();
    const context = response.context.toLowerCase();

    // Initialize result
    const result: TemplateDetectionResult = {
      isTemplate: false,
      confidence: 0,
      contextualRelevance: 0,
      improvementSuggestions: [],
      detectedPatterns: [],
      qualityScore: 0,
    };

    // 1. Check for template patterns
    const templateMatches = this.checkTemplatePatterns(content);
    if (templateMatches.length > 0) {
      result.isTemplate = true;
      result.confidence += 0.4;
      result.templateType = 'generic';
      result.detectedPatterns.push(...templateMatches);
    }

    // 2. Check for boilerplate phrases
    const boilerplateMatches = this.checkBoilerplatePhrases(content);
    if (boilerplateMatches.length > 0) {
      result.isTemplate = true;
      result.confidence += 0.3;
      result.templateType = result.templateType || 'boilerplate';
      result.detectedPatterns.push(...boilerplateMatches);
    }

    // 3. Check contextual relevance
    result.contextualRelevance = this.calculateContextualRelevance(content, context);
    if (result.contextualRelevance < 0.3) {
      result.isTemplate = true;
      result.confidence += 0.3;
    }

    // 4. Check for placeholder text
    const placeholderMatches = this.checkPlaceholderText(content);
    if (placeholderMatches.length > 0) {
      result.isTemplate = true;
      result.confidence += 0.2;
      result.templateType = 'placeholder';
      result.detectedPatterns.push(...placeholderMatches);
    }

    // 5. Calculate quality score
    result.qualityScore = this.calculateQualityScore(response, result);

    // 6. Generate improvement suggestions
    result.improvementSuggestions = this.generateImprovementSuggestions(result, response);

    return result;
  }

  /**
   * Score the intelligence quality of a response
   */
  scoreIntelligence(response: AIResponse): IntelligenceScore {
    const templateResult = this.detectTemplate(response);

    return {
      overallScore: this.calculateOverallScore(response, templateResult),
      contextualRelevance: templateResult.contextualRelevance,
      domainExpertise: this.evaluateDomainKnowledge(response),
      originality: this.measureOriginality(response),
      specificity: this.assessSpecificity(response),
      confidence: 1 - templateResult.confidence,
      sourceQuality: this.evaluateSourceQuality(response.source),
    };
  }

  /**
   * Check for common template patterns
   */
  private checkTemplatePatterns(content: string): string[] {
    const matches: string[] = [];

    for (const [patternName, pattern] of this.templatePatterns) {
      if (pattern.test(content)) {
        matches.push(patternName);
      }
    }

    return matches;
  }

  /**
   * Check for boilerplate phrases
   */
  private checkBoilerplatePhrases(content: string): string[] {
    const matches: string[] = [];

    for (const phrase of this.boilerplatePhrases) {
      if (content.includes(phrase.toLowerCase())) {
        matches.push(phrase);
      }
    }

    return matches;
  }

  /**
   * Calculate contextual relevance between response and context
   */
  private calculateContextualRelevance(content: string, context: string): number {
    const contentWords = this.extractKeywords(content);
    const contextWords = this.extractKeywords(context);
    const contextualWords = this.contextualKeywords;

    let relevanceScore = 0;
    let totalChecks = 0;

    // Check for contextual keyword matches
    for (const keyword of contextualWords) {
      totalChecks++;
      if (content.includes(keyword) && context.includes(keyword)) {
        relevanceScore += 1;
      }
    }

    // Check for domain-specific term matches
    for (const [domain, terms] of this.domainSpecificTerms) {
      for (const term of terms) {
        totalChecks++;
        if (content.includes(term) && context.includes(term)) {
          relevanceScore += 1;
        }
      }
    }

    // Check for shared words between content and context
    const sharedWords = contentWords.filter(word => contextWords.includes(word));
    const wordRelevance = sharedWords.length / Math.max(contentWords.length, contextWords.length);

    return Math.min(1, relevanceScore / Math.max(totalChecks, 1) + wordRelevance * 0.5);
  }

  /**
   * Check for placeholder text patterns
   */
  private checkPlaceholderText(content: string): string[] {
    const placeholderPatterns = [
      /\[.*?\]/g, // [placeholder]
      /\{.*?\}/g, // {placeholder}
      /\$\{.*?\}/g, // ${placeholder}
      /\{\{.*?\}\}/g, // {{placeholder}}
      /<.*?>/g, // <placeholder>
      /TODO|FIXME|HACK|NOTE:/gi,
      /your_.*?here/gi,
      /replace_with_.*/gi,
    ];

    const matches: string[] = [];

    for (const pattern of placeholderPatterns) {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    }

    return matches;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(
    response: AIResponse,
    templateResult: TemplateDetectionResult
  ): number {
    let score = 100;

    // Penalize template detection
    score -= templateResult.confidence * 60;

    // Penalize low contextual relevance
    score -= (1 - templateResult.contextualRelevance) * 30;

    // Penalize detected patterns
    score -= templateResult.detectedPatterns.length * 10;

    // Bonus for domain-specific content
    if (response.domain) {
      const domainTerms = this.domainSpecificTerms.get(response.domain) || [];
      const hasDomainTerms = domainTerms.some(term =>
        response.content.toLowerCase().includes(term.toLowerCase())
      );
      if (hasDomainTerms) {
        score += 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall intelligence score
   */
  private calculateOverallScore(
    response: AIResponse,
    templateResult: TemplateDetectionResult
  ): number {
    const contextualScore = templateResult.contextualRelevance * 25;
    const domainScore = this.evaluateDomainKnowledge(response) * 25;
    const originalityScore = this.measureOriginality(response) * 25;
    const specificityScore = this.assessSpecificity(response) * 25;

    return contextualScore + domainScore + originalityScore + specificityScore;
  }

  /**
   * Evaluate domain knowledge in response
   */
  private evaluateDomainKnowledge(response: AIResponse): number {
    if (!response.domain) {return 0.5;}

    const domainTerms = this.domainSpecificTerms.get(response.domain) || [];
    const content = response.content.toLowerCase();

    const matchingTerms = domainTerms.filter(term => content.includes(term.toLowerCase()));

    return Math.min(1, matchingTerms.length / Math.max(domainTerms.length, 1));
  }

  /**
   * Measure response originality
   */
  private measureOriginality(response: AIResponse): number {
    const content = response.content;

    // Check for repetitive patterns
    const words = content.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const uniquenessRatio = uniqueWords.size / words.length;

    // Check for generic sentence structures
    const genericStructures = [
      /^here is (a|an|the)/i,
      /^let me help you/i,
      /^i can assist you/i,
      /^to answer your question/i,
      /^based on your request/i,
    ];

    const genericMatches = genericStructures.filter(pattern => pattern.test(content)).length;

    const structureScore = Math.max(0, 1 - genericMatches / genericStructures.length);

    return (uniquenessRatio + structureScore) / 2;
  }

  /**
   * Assess response specificity
   */
  private assessSpecificity(response: AIResponse): number {
    const content = response.content;

    // Count specific details (numbers, dates, names, etc.)
    const specificPatterns = [
      /\d+/g, // Numbers
      /\b\d{4}\b/g, // Years
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Proper names
      /\bhttps?:\/\/\S+/g, // URLs
      /\b\w+\.\w+/g, // File extensions, domains
      /\b[A-Z]{2,}\b/g, // Acronyms
    ];

    let specificityCount = 0;
    for (const pattern of specificPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        specificityCount += matches.length;
      }
    }

    // Normalize by content length
    const wordCount = content.split(/\s+/).length;
    const specificityRatio = specificityCount / Math.max(wordCount, 1);

    return Math.min(1, specificityRatio * 10); // Scale to 0-1
  }

  /**
   * Evaluate source quality
   */
  private evaluateSourceQuality(source: IntelligenceSource): number {
    const baseScore = source.credibility;

    // Bonus for Context7 sources
    if (source.type === 'context7') {
      return Math.min(1, baseScore + 0.2);
    }

    // Penalty for template sources
    if (source.type === 'template') {
      return Math.max(0, baseScore - 0.5);
    }

    return baseScore;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovementSuggestions(
    result: TemplateDetectionResult,
    response: AIResponse
  ): string[] {
    const suggestions: string[] = [];

    if (result.isTemplate) {
      suggestions.push(
        'Response appears to be template-based. Consider adding specific contextual details.'
      );
    }

    if (result.contextualRelevance < 0.5) {
      suggestions.push(
        'Response lacks contextual relevance. Include more context-specific information.'
      );
    }

    if (result.detectedPatterns.length > 0) {
      suggestions.push(
        `Detected template patterns: ${result.detectedPatterns.join(', ')}. Replace with specific content.`
      );
    }

    if (result.qualityScore < 50) {
      suggestions.push(
        'Overall quality is low. Consider rewriting with more specific and relevant information.'
      );
    }

    if (response.domain && this.evaluateDomainKnowledge(response) < 0.3) {
      suggestions.push(`Add more domain-specific knowledge for ${response.domain}.`);
    }

    return suggestions;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'can',
      'this',
      'that',
      'these',
      'those',
    ]);
    return stopWords.has(word);
  }

  /**
   * Initialize template patterns
   */
  private initializePatterns(): void {
    this.templatePatterns = new Map([
      ['generic_greeting', /^(hi|hello|hey).*how can i help/i],
      ['thank_you_response', /^(thanks?|thank you).*you're welcome/i],
      ['generic_assistance', /^(i can help|let me help|i'll help)/i],
      ['placeholder_response', /^(here's|here is) (a|an|the) (example|sample|template)/i],
      ['generic_explanation', /^(to answer your question|based on your request)/i],
      ['copy_paste_pattern', /^(simply|just|all you need to do is)/i],
      ['template_structure', /^(step 1|step 2|first|second|third)/i],
    ]);
  }

  /**
   * Initialize boilerplate phrases
   */
  private initializeBoilerplatePhrases(): void {
    this.boilerplatePhrases = [
      'hope this helps',
      'let me know if you need',
      'feel free to ask',
      'happy to help',
      'glad to assist',
      'hope that answers',
      'if you have any questions',
      'please let me know',
      'i hope this is helpful',
      'is there anything else',
      'do you need anything else',
      'let me know if you need more help',
      "i'm here to help",
      'happy to answer any questions',
      'hope this clarifies things',
    ];
  }

  /**
   * Initialize contextual keywords
   */
  private initializeContextualKeywords(): void {
    this.contextualKeywords = [
      'specific',
      'particular',
      'exact',
      'precise',
      'detailed',
      'comprehensive',
      'based on',
      'according to',
      'in your case',
      'for your situation',
      'considering',
      'given that',
      'taking into account',
      'with regards to',
    ];
  }

  /**
   * Initialize domain-specific terms
   */
  private initializeDomainTerms(): void {
    this.domainSpecificTerms = new Map([
      [
        'frontend',
        [
          'react',
          'vue',
          'angular',
          'javascript',
          'typescript',
          'css',
          'html',
          'dom',
          'component',
          'props',
          'state',
          'hook',
        ],
      ],
      [
        'backend',
        [
          'api',
          'database',
          'server',
          'endpoint',
          'middleware',
          'authentication',
          'authorization',
          'controller',
          'model',
          'service',
        ],
      ],
      [
        'database',
        [
          'sql',
          'nosql',
          'mongodb',
          'postgresql',
          'mysql',
          'index',
          'query',
          'schema',
          'table',
          'relationship',
          'migration',
        ],
      ],
      [
        'devops',
        [
          'docker',
          'kubernetes',
          'ci/cd',
          'pipeline',
          'deployment',
          'infrastructure',
          'monitoring',
          'logging',
          'scaling',
          'security',
        ],
      ],
      [
        'mobile',
        [
          'ios',
          'android',
          'react native',
          'flutter',
          'swift',
          'kotlin',
          'app store',
          'play store',
          'native',
          'hybrid',
        ],
      ],
      [
        'ai',
        [
          'machine learning',
          'neural network',
          'algorithm',
          'model',
          'training',
          'prediction',
          'classification',
          'nlp',
          'computer vision',
        ],
      ],
    ]);
  }

  /**
   * Get detection statistics
   */
  getDetectionStats(): { totalDetections: number; templateCount: number; qualityAverage: number } {
    // This would track statistics in a real implementation
    return {
      totalDetections: 0,
      templateCount: 0,
      qualityAverage: 0,
    };
  }

  /**
   * Update patterns based on new data
   */
  updatePatterns(newPatterns: Map<string, RegExp>): void {
    this.templatePatterns = new Map([...this.templatePatterns, ...newPatterns]);
  }

  /**
   * Add new boilerplate phrases
   */
  addBoilerplatePhrases(phrases: string[]): void {
    this.boilerplatePhrases.push(...phrases);
  }

  /**
   * Add domain-specific terms
   */
  addDomainTerms(domain: string, terms: string[]): void {
    const existingTerms = this.domainSpecificTerms.get(domain) || [];
    this.domainSpecificTerms.set(domain, [...existingTerms, ...terms]);
  }
}

export default TemplateDetectionEngine;
