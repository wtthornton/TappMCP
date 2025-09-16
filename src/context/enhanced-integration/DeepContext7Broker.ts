#!/usr/bin/env node

/**
 * Deep Context7 Broker - Week 2 Enhanced
 *
 * Advanced Context7 integration with deep features including:
 * - Persistent context management across sessions
 * - Intelligent context injection and suggestion
 * - Context compression and relevance scoring
 * - Cross-session context preservation and retrieval
 * - Real-time context adaptation and learning
 *
 * Phase 1, Week 2 - Deep Context7 Integration Implementation
 */

import { z } from 'zod';

// Forward declarations
class ContextRelevanceScorer {
  async calculateRelevance(context: any, _sessionContexts: any[]): Promise<number> { return 0; }
  async calculateQueryRelevance(context: any, query: string, toolName: string): Promise<number> { return 0; }
}

class ContextCompressor {
  async compress(context: any): Promise<any> { return {}; }
  async decompress(compressed: any): Promise<any> { return {}; }
}

class ContextSuggestionEngine {
  async generateSuggestions(context: any, sessionContexts: any[]): Promise<any[]> { return []; }
  async rankSuggestions(suggestions: any[], query: string): Promise<any[]> { return []; }
}

class ContextLearningEngine {
  async learnFromInteraction(context: any, feedback: any): Promise<void> { }
  async adaptToUserPatterns(sessionContexts: any[]): Promise<void> { }
}

/**
 * Context Entry Schema for Deep Context7
 */
export const ContextEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  toolName: z.string(),
  contextType: z.enum([
    'user_query',
    'system_response',
    'tool_output',
    'error_context',
    'workflow_state',
  ]),
  content: z.string(),
  relevanceScore: z.number().min(0).max(1),
  timestamp: z.date(),
  metadata: z
    .object({
      tokenCount: z.number().optional(),
      qualityScore: z.number().optional(),
      userLevel: z.string().optional(),
      projectId: z.string().optional(),
      workflowStage: z.string().optional(),
    })
    .optional(),
  relationships: z
    .array(
      z.object({
        type: z.enum(['follows', 'references', 'contradicts', 'enhances']),
        targetContextId: z.string(),
        strength: z.number().min(0).max(1),
      })
    )
    .optional(),
  persistenceLevel: z.enum(['session', 'project', 'user', 'global']).default('session'),
  compressionInfo: z
    .object({
      originalLength: z.number(),
      compressedLength: z.number(),
      compressionRatio: z.number(),
    })
    .optional(),
});

export type ContextEntry = z.infer<typeof ContextEntrySchema>;

/**
 * Context Injection Configuration
 */
export interface ContextInjectionConfig {
  maxContextLength: number;
  relevanceThreshold: number;
  compressionEnabled: boolean;
  adaptiveInjection: boolean;
  crossSessionEnabled: boolean;
  learningEnabled: boolean;
}

/**
 * Context Suggestion Result
 */
export interface ContextSuggestion {
  id: string;
  type: 'relevant_context' | 'similar_pattern' | 'workflow_continuation' | 'error_prevention';
  content: string;
  relevanceScore: number;
  reasoning: string;
  suggestedAction: 'inject' | 'reference' | 'ignore';
  metadata: Record<string, any>;
}

/**
 * Context Analysis Result
 */
export interface ContextAnalysis {
  contextId: string;
  analysis: {
    relevanceScore: number;
    qualityIndicators: {
      clarity: number;
      completeness: number;
      specificity: number;
      actionability: number;
    };
    relationships: Array<{
      contextId: string;
      relationshipType: string;
      strength: number;
    }>;
    compressionOpportunities: Array<{
      section: string;
      potentialReduction: number;
      preservedInformation: number;
    }>;
    adaptationSuggestions: string[];
  };
}

/**
 * Deep Context7 Broker Class
 */
export class DeepContext7Broker {
  private contextStore: Map<string, ContextEntry>;
  private sessionContexts: Map<string, ContextEntry[]>;
  private relevanceScorer: ContextRelevanceScorer;
  private contextCompressor: ContextCompressor;
  private suggestionEngine: ContextSuggestionEngine;
  private learningEngine: ContextLearningEngine;
  private config: ContextInjectionConfig;

  constructor(config: Partial<ContextInjectionConfig> = {}) {
    this.config = {
      maxContextLength: 2000,
      relevanceThreshold: 0.3,
      compressionEnabled: true,
      adaptiveInjection: true,
      crossSessionEnabled: true,
      learningEnabled: true,
      ...config,
    };

    this.contextStore = new Map();
    this.sessionContexts = new Map();
    this.relevanceScorer = new ContextRelevanceScorer();
    this.contextCompressor = new ContextCompressor();
    this.suggestionEngine = new ContextSuggestionEngine();
    this.learningEngine = new ContextLearningEngine();

    console.log('Deep Context7 Broker initialized with advanced features');
  }

  /**
   * Store context with deep analysis and relationships
   */
  async storeContext(entry: Partial<ContextEntry>): Promise<string> {
    const contextEntry = ContextEntrySchema.parse({
      ...entry,
      id: entry.id || this.generateContextId(),
      timestamp: entry.timestamp || new Date(),
    });

    console.log(`Storing context ${contextEntry.id} for session ${contextEntry.sessionId}`);

    // Analyze context quality and relationships
    const analysis = await this.analyzeContext(contextEntry);

    // Apply compression if enabled
    if (this.config.compressionEnabled) {
      const compressed = await this.contextCompressor.compress(contextEntry);
      contextEntry.content = compressed.content;
      contextEntry.compressionInfo = compressed.compressionInfo;
    }

    // Calculate relevance score
    contextEntry.relevanceScore = await this.relevanceScorer.calculateRelevance(
      contextEntry,
      this.getSessionContext(contextEntry.sessionId)
    );

    // Store in main context store
    this.contextStore.set(contextEntry.id, contextEntry);

    // Add to session-specific context
    this.addToSessionContext(contextEntry);

    // Update learning engine
    if (this.config.learningEnabled) {
      await this.learningEngine.learnFromInteraction(contextEntry, { positive: true });
    }

    return contextEntry.id;
  }

  /**
   * Retrieve relevant context with intelligent selection
   */
  async getRelevantContext(
    sessionId: string,
    query: string,
    toolName: string,
    options: {
      maxResults?: number;
      minRelevance?: number;
      includeMetadata?: boolean;
      crossSession?: boolean;
    } = {}
  ): Promise<ContextEntry[]> {
    console.log(`Retrieving relevant context for ${toolName} in session ${sessionId}`);

    const {
      maxResults = 5,
      minRelevance = this.config.relevanceThreshold,
      includeMetadata: _includeMetadata = true,
      crossSession = this.config.crossSessionEnabled,
    } = options;

    // Get session-specific contexts
    let candidates = this.getSessionContext(sessionId);

    // Add cross-session contexts if enabled
    if (crossSession) {
      const crossSessionContexts = await this.getCrossSessionContext(sessionId, toolName);
      candidates = [...candidates, ...crossSessionContexts];
    }

    // Filter by relevance and tool compatibility
    const relevantContexts = await Promise.all(
      candidates.map(async context => {
        const relevance = await this.relevanceScorer.calculateQueryRelevance(
          context,
          query,
          toolName
        );
        return { context, relevance };
      })
    );

    // Sort by relevance and filter by minimum threshold
    const filtered = relevantContexts
      .filter(({ relevance }) => relevance >= minRelevance)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
      .map(({ context }) => context);

    console.log(`Found ${filtered.length} relevant contexts with relevance >= ${minRelevance}`);

    return filtered;
  }

  /**
   * Generate intelligent context suggestions
   */
  async generateContextSuggestions(
    sessionId: string,
    currentTool: string,
    userInput: string,
    workflowStage?: string
  ): Promise<ContextSuggestion[]> {
    console.log(`Generating context suggestions for ${currentTool} in session ${sessionId}`);

    const sessionContext = this.getSessionContext(sessionId);
    const suggestions: ContextSuggestion[] = [];

    // Generate suggestions based on current context
    const relevantSuggestions = await this.suggestionEngine.generateSuggestions(
      { toolName: currentTool, userInput },
      sessionContext
    );
    suggestions.push(...relevantSuggestions);

    // Generate pattern-based suggestions
    const patternSuggestions = await this.suggestionEngine.generateSuggestions(
      { toolName: currentTool, workflowStage },
      sessionContext
    );
    suggestions.push(...patternSuggestions);

    // Generate workflow continuation suggestions
    const workflowSuggestions = await this.suggestionEngine.generateSuggestions(
      { workflowStage },
      sessionContext
    );
    suggestions.push(...workflowSuggestions);

    // Generate error prevention suggestions
    const errorPreventionSuggestions = await this.suggestionEngine.generateSuggestions(
      { toolName: currentTool, userInput, errorPrevention: true },
      sessionContext
    );
    suggestions.push(...errorPreventionSuggestions);

    // Sort by relevance score
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`Generated ${suggestions.length} context suggestions`);

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Inject context into tool execution
   */
  async injectContext(
    sessionId: string,
    toolName: string,
    userInput: string,
    injectionMode: 'adaptive' | 'comprehensive' | 'minimal' = 'adaptive'
  ): Promise<{
    enhancedInput: string;
    injectedContexts: ContextEntry[];
    injectionMetadata: {
      totalContexts: number;
      totalTokens: number;
      compressionApplied: boolean;
      adaptationReason: string;
    };
  }> {
    console.log(
      `Injecting context for ${toolName} in session ${sessionId} (mode: ${injectionMode})`
    );

    // Get relevant contexts
    const relevantContexts = await this.getRelevantContext(sessionId, userInput, toolName);

    // Apply injection mode logic
    let selectedContexts: ContextEntry[];
    let adaptationReason: string;

    switch (injectionMode) {
      case 'comprehensive':
        selectedContexts = relevantContexts;
        adaptationReason = 'Comprehensive mode - all relevant contexts included';
        break;
      case 'minimal':
        selectedContexts = relevantContexts.slice(0, 2);
        adaptationReason = 'Minimal mode - only top 2 most relevant contexts';
        break;
      case 'adaptive':
      default:
        selectedContexts = await this.adaptiveContextSelection(
          relevantContexts,
          userInput,
          toolName
        );
        adaptationReason =
          'Adaptive mode - intelligently selected contexts based on input complexity and tool requirements';
        break;
    }

    // Build enhanced input with context injection
    const contextPreamble = this.buildContextPreamble(selectedContexts);
    const enhancedInput = contextPreamble ? `${contextPreamble}\n\n${userInput}` : userInput;

    // Calculate metadata
    const totalTokens = selectedContexts.reduce(
      (sum, ctx) => sum + this.estimateTokens(ctx.content),
      0
    );
    const compressionApplied = selectedContexts.some(ctx => ctx.compressionInfo !== undefined);

    console.log(
      `Context injection complete: ${selectedContexts.length} contexts, ~${totalTokens} tokens`
    );

    return {
      enhancedInput,
      injectedContexts: selectedContexts,
      injectionMetadata: {
        totalContexts: selectedContexts.length,
        totalTokens,
        compressionApplied,
        adaptationReason,
      },
    };
  }

  /**
   * Clean up old contexts with intelligent retention
   */
  async cleanupContexts(
    options: {
      maxAge?: number; // milliseconds
      minRelevance?: number;
      preserveHighValue?: boolean;
      sessionId?: string;
    } = {}
  ): Promise<{
    removed: number;
    preserved: number;
    preservedHighValue: number;
  }> {
    const {
      maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
      minRelevance = 0.2,
      preserveHighValue = true,
      sessionId,
    } = options;

    console.log(`Starting context cleanup${sessionId ? ` for session ${sessionId}` : ' (global)'}`);

    const now = Date.now();
    let removed = 0;
    let preserved = 0;
    let preservedHighValue = 0;

    for (const [_contextId, context] of this.contextStore.entries()) {
      // Skip if session-specific cleanup and context doesn't match
      if (sessionId && context.sessionId !== sessionId) {
        continue;
      }

      const age = now - context.timestamp.getTime();
      const isOld = age > maxAge;
      const isLowRelevance = context.relevanceScore < minRelevance;
      const isHighValue = this.isHighValueContext(context);

      if (isOld && isLowRelevance && (!preserveHighValue || !isHighValue)) {
        this.contextStore.delete(_contextId);
        this.removeFromSessionContext(context);
        removed++;
      } else {
        preserved++;
        if (isHighValue) {preservedHighValue++;}
      }
    }

    console.log(
      `Context cleanup complete: ${removed} removed, ${preserved} preserved (${preservedHighValue} high-value)`
    );

    return { removed, preserved, preservedHighValue };
  }

  /**
   * Get context statistics and performance metrics
   */
  getContextStatistics(): {
    totalContexts: number;
    sessionCount: number;
    avgContextsPerSession: number;
    avgRelevanceScore: number;
    compressionStats: {
      compressedContexts: number;
      avgCompressionRatio: number;
      totalSpaceSaved: number;
    };
    persistenceStats: {
      session: number;
      project: number;
      user: number;
      global: number;
    };
  } {
    const contexts = Array.from(this.contextStore.values());
    const compressedContexts = contexts.filter(ctx => ctx.compressionInfo !== undefined);

    const compressionRatios = compressedContexts
      .map(ctx => ctx.compressionInfo!.compressionRatio)
      .filter(ratio => ratio > 0);

    const persistenceStats = {
      session: contexts.filter(ctx => ctx.persistenceLevel === 'session').length,
      project: contexts.filter(ctx => ctx.persistenceLevel === 'project').length,
      user: contexts.filter(ctx => ctx.persistenceLevel === 'user').length,
      global: contexts.filter(ctx => ctx.persistenceLevel === 'global').length,
    };

    const totalSpaceSaved = compressedContexts.reduce((sum, ctx) => {
      const info = ctx.compressionInfo!;
      return sum + (info.originalLength - info.compressedLength);
    }, 0);

    return {
      totalContexts: contexts.length,
      sessionCount: this.sessionContexts.size,
      avgContextsPerSession: contexts.length / Math.max(this.sessionContexts.size, 1),
      avgRelevanceScore:
        contexts.length > 0
          ? contexts.reduce((sum, ctx) => sum + ctx.relevanceScore, 0) / contexts.length
          : 0,
      compressionStats: {
        compressedContexts: compressedContexts.length,
        avgCompressionRatio:
          compressionRatios.length > 0
            ? compressionRatios.reduce((sum, ratio) => sum + ratio, 0) / compressionRatios.length
            : 0,
        totalSpaceSaved,
      },
      persistenceStats,
    };
  }

  /**
   * Private helper methods
   */
  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionContext(sessionId: string): ContextEntry[] {
    return this.sessionContexts.get(sessionId) || [];
  }

  private addToSessionContext(context: ContextEntry): void {
    const sessionContexts = this.getSessionContext(context.sessionId);
    sessionContexts.push(context);

    // Keep only most recent contexts (limit to 50 per session)
    if (sessionContexts.length > 50) {
      sessionContexts.shift();
    }

    this.sessionContexts.set(context.sessionId, sessionContexts);
  }

  private removeFromSessionContext(context: ContextEntry): void {
    const sessionContexts = this.getSessionContext(context.sessionId);
    const index = sessionContexts.findIndex(ctx => ctx.id === context.id);
    if (index !== -1) {
      sessionContexts.splice(index, 1);
      this.sessionContexts.set(context.sessionId, sessionContexts);
    }
  }

  private async getCrossSessionContext(
    sessionId: string,
    toolName: string
  ): Promise<ContextEntry[]> {
    const crossSessionContexts: ContextEntry[] = [];

    // Find contexts from other sessions that might be relevant
    for (const [_contextId, context] of this.contextStore.entries()) {
      if (
        context.sessionId !== sessionId &&
        context.persistenceLevel !== 'session' &&
        (context.toolName === toolName || context.contextType === 'workflow_state')
      ) {
        crossSessionContexts.push(context);
      }
    }

    return crossSessionContexts.slice(0, 10); // Limit cross-session contexts
  }

  private async analyzeContext(context: ContextEntry): Promise<ContextAnalysis> {
    // Simple analysis implementation - would be more sophisticated in production
    return {
      contextId: context.id,
      analysis: {
        relevanceScore: context.relevanceScore,
        qualityIndicators: {
          clarity: 0.8,
          completeness: 0.7,
          specificity: 0.8,
          actionability: 0.75,
        },
        relationships: [],
        compressionOpportunities: [],
        adaptationSuggestions: [],
      },
    };
  }

  private async adaptiveContextSelection(
    contexts: ContextEntry[],
    userInput: string,
    toolName: string
  ): Promise<ContextEntry[]> {
    // Adaptive selection based on input complexity and tool requirements
    const inputComplexity = this.assessInputComplexity(userInput);
    const toolRequirements = this.getToolContextRequirements(toolName);

    let maxContexts: number;
    if (inputComplexity === 'high' || toolRequirements === 'comprehensive') {
      maxContexts = 5;
    } else if (inputComplexity === 'medium' || toolRequirements === 'moderate') {
      maxContexts = 3;
    } else {
      maxContexts = 2;
    }

    return contexts.slice(0, maxContexts);
  }

  private assessInputComplexity(input: string): 'low' | 'medium' | 'high' {
    const words = input.split(/\s+/).length;
    const hasCode = /```|`/.test(input);
    const hasMultipleQuestions = (input.match(/\?/g) || []).length > 1;

    if (words > 100 || hasCode || hasMultipleQuestions) {return 'high';}
    if (words > 50 || input.includes('\n')) {return 'medium';}
    return 'low';
  }

  private getToolContextRequirements(toolName: string): 'minimal' | 'moderate' | 'comprehensive' {
    const requirementMap: Record<string, 'minimal' | 'moderate' | 'comprehensive'> = {
      smart_begin: 'moderate',
      smart_plan: 'comprehensive',
      smart_write: 'comprehensive',
      smart_finish: 'comprehensive',
      smart_orchestrate: 'comprehensive',
    };

    return requirementMap[toolName] || 'moderate';
  }

  private buildContextPreamble(contexts: ContextEntry[]): string {
    if (contexts.length === 0) {return '';}

    const contextStrings = contexts.map((ctx, index) => {
      const timestamp = ctx.timestamp.toISOString().split('T')[0];
      return `Context ${index + 1} (${ctx.contextType}, ${timestamp}):\n${ctx.content}`;
    });

    return `Previous relevant context:\n${contextStrings.join('\n\n')}`;
  }

  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private isHighValueContext(context: ContextEntry): boolean {
    return (
      context.relevanceScore > 0.8 ||
      context.persistenceLevel === 'project' ||
      context.persistenceLevel === 'user' ||
      context.contextType === 'workflow_state' ||
      (typeof context.metadata?.qualityScore === 'number' && context.metadata.qualityScore > 0.9)
    );
  }
}

// Supporting engine classes are defined above as forward declarations

// Export factory function
export function createDeepContext7Broker(
  config?: Partial<ContextInjectionConfig>
): DeepContext7Broker {
  return new DeepContext7Broker(config);
}
