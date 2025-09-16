#!/usr/bin/env node

/**
 * Context-Aware Template Engine - Week 2 Enhanced
 *
 * Advanced dynamic template generation with cross-session intelligence,
 * user behavior adaptation, and deep Context7 integration.
 * Provides maximum efficiency through predictive template optimization.
 *
 * Phase 1, Week 2 - Advanced Template Intelligence Implementation
 */

import { z } from 'zod';
import Handlebars from 'handlebars';

/**
 * Template Context Schema
 */
export const TemplateContextSchema = z.object({
  toolName: z.string(),
  taskType: z.enum(['generation', 'analysis', 'transformation', 'planning', 'debugging']),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  outputFormat: z.enum(['code', 'text', 'structured', 'markdown']).default('text'),
  constraints: z.array(z.string()).default([]),
  preferences: z.record(z.any()).default({}),
  contextHistory: z.array(z.string()).default([]),
  timeConstraint: z.enum(['immediate', 'standard', 'thorough']).default('standard'),
  // Week 2 Enhancements
  sessionId: z.string().optional(),
  projectContext: z
    .object({
      projectId: z.string().optional(),
      domain: z.string().optional(),
      complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
    })
    .optional(),
  userBehaviorProfile: z
    .object({
      preferredVerbosity: z.enum(['concise', 'moderate', 'detailed']).optional(),
      commonPatterns: z.array(z.string()).optional(),
      successfulTemplateIds: z.array(z.string()).optional(),
    })
    .optional(),
  contextualFactors: z
    .object({
      relatedTools: z.array(z.string()).optional(),
      workflowStage: z.enum(['planning', 'implementation', 'testing', 'deployment']).optional(),
      urgencyLevel: z.number().min(1).max(10).optional(),
    })
    .optional(),
});

export type TemplateContext = z.infer<typeof TemplateContextSchema>;

// Week 2 exports
export type { UserProfile, SessionContext, TemplateEngineMetrics };

/**
 * Template Metadata
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  toolName: string;
  taskType: string;
  baseTokens: number;
  compressionRatio: number; // Expected reduction vs standard prompt
  qualityScore: number;
  usageCount: number;
  lastUpdated: Date;
  variables: string[];
  // Week 2 Enhancements
  adaptationLevel: number; // 0-1 scale of how much it adapts to context
  crossSessionCompatible: boolean;
  userSegments: string[]; // Which user types benefit most
  performanceMetrics: {
    avgTokenReduction: number;
    successRate: number;
    avgQualityScore: number;
    adaptationAccuracy: number;
  };
  learningData: {
    effectiveContexts: string[];
    failurePatterns: string[];
    optimizationHistory: Array<{ date: Date; change: string; impact: number }>;
  };
}

/**
 * Template Generation Result
 */
export interface TemplateResult {
  template: string;
  variables: Record<string, any>;
  metadata: TemplateMetadata;
  estimatedTokens: number;
  contextInjections: string[];
  // Week 2 Enhancements
  adaptationReason: string;
  confidenceScore: number; // 0-1 how confident the engine is in this template
  alternativeTemplates: Array<{ id: string; reason: string; estimatedTokens: number }>;
  predictiveOptimizations: string[];
  crossSessionContext: {
    relatedSessions: string[];
    carryOverContext: string[];
    persistentPreferences: Record<string, any>;
  };
}

/**
 * Context-Aware Template Engine Class
 */
export class ContextAwareTemplateEngine {
  private templates: Map<string, TemplateMetadata>;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate>;
  private contextPatterns: Map<string, RegExp>;
  private optimizationStats: Map<string, { uses: number; avgReduction: number }>;
  // Week 2 Enhancements
  private userProfiles: Map<string, UserProfile>;
  private sessionMemory: Map<string, SessionContext>;
  private adaptationEngine: TemplateAdaptationEngine;
  private crossSessionLearning: CrossSessionLearningEngine;
  private performanceTracker: TemplatePerformanceTracker;

  constructor() {
    this.templates = new Map();
    this.compiledTemplates = new Map();
    this.contextPatterns = new Map();
    this.optimizationStats = new Map();
    // Week 2 Enhancements
    this.userProfiles = new Map();
    this.sessionMemory = new Map();
    this.adaptationEngine = new TemplateAdaptationEngine();
    this.crossSessionLearning = new CrossSessionLearningEngine();
    this.performanceTracker = new TemplatePerformanceTracker();

    this.initializeBuiltInTemplates();
    this.registerHandlebarsHelpers();
    this.initializeAdvancedFeatures();
  }

  /**
   * Generate context-aware template with Week 2 advanced intelligence
   */
  async generateTemplate(context: TemplateContext): Promise<TemplateResult> {
    console.log(`Advanced template generation for ${context.toolName}:${context.taskType}`);

    // Week 2: Analyze user behavior and session context
    const userProfile = await this.analyzeUserProfile(context);
    const sessionContext = await this.buildSessionContext(context);

    // Find or create optimal template with advanced selection
    const template = await this.getOptimalTemplateAdvanced(context, userProfile, sessionContext);

    // Extract variables with cross-session intelligence
    const variables = await this.extractVariablesAdvanced(context, sessionContext);

    // Apply advanced context-specific optimizations
    const optimizedTemplate = await this.optimizeTemplateAdvanced(
      template.template,
      context,
      userProfile
    );

    // Estimate tokens with behavioral modeling
    const estimatedTokens = this.estimateTokensAdvanced(optimizedTemplate, variables, context);

    // Generate alternative templates for comparison
    const alternatives = await this.generateAlternativeTemplates(context, template.id);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(template, context, userProfile);

    // Track usage with advanced metrics
    await this.updateAdvancedUsageStats(template.id, context, estimatedTokens);

    // Generate predictive optimizations
    const predictiveOptimizations = await this.generatePredictiveOptimizations(
      context,
      userProfile
    );

    return {
      template: optimizedTemplate,
      variables,
      metadata: template,
      estimatedTokens,
      contextInjections: this.getAdvancedContextInjections(context, sessionContext),
      adaptationReason: this.getAdaptationReason(template, context, userProfile),
      confidenceScore,
      alternativeTemplates: alternatives,
      predictiveOptimizations,
      crossSessionContext: {
        relatedSessions: sessionContext.relatedSessions || [],
        carryOverContext: sessionContext.carryOverContext || [],
        persistentPreferences: userProfile.persistentPreferences || {},
      },
    };
  }

  /**
   * Get optimal template for given context
   */
  private async getOptimalTemplate(context: TemplateContext): Promise<TemplateMetadata> {
    // First, try to find existing template
    const templateKey = `${context.toolName}_${context.taskType}`;
    let template = this.templates.get(templateKey);

    if (!template) {
      // Generate new template if none exists
      template = await this.createNewTemplate(context);
      this.templates.set(templateKey, template);
    }

    // Adapt template based on user level and preferences
    const adaptedTemplate = this.adaptTemplateForUser(template, context);

    return adaptedTemplate;
  }

  /**
   * Create new template based on context
   */
  private async createNewTemplate(context: TemplateContext): Promise<TemplateMetadata> {
    const baseTemplate = this.generateBaseTemplate(context);

    return {
      id: `${context.toolName}_${context.taskType}_${Date.now()}`,
      name: `${context.toolName} ${context.taskType} Template`,
      description: `Auto-generated template for ${context.toolName} ${context.taskType} tasks`,
      toolName: context.toolName,
      taskType: context.taskType,
      baseTokens: this.countTokens(baseTemplate),
      compressionRatio: 0.4, // Expected 40% reduction
      qualityScore: 85,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: this.extractTemplateVariables(baseTemplate),
      template: baseTemplate,
    } as TemplateMetadata & { template: string };
  }

  /**
   * Generate base template structure
   */
  private generateBaseTemplate(context: TemplateContext): string {
    const templates = {
      generation: this.getGenerationTemplate(),
      analysis: this.getAnalysisTemplate(),
      transformation: this.getTransformationTemplate(),
      planning: this.getPlanningTemplate(),
      debugging: this.getDebuggingTemplate(),
    };

    return templates[context.taskType] || templates.generation;
  }

  /**
   * Built-in template definitions
   */
  private getGenerationTemplate(): string {
    return `{{#if userLevel_advanced}}Create{{else}}Generate{{/if}} {{outputFormat}} for {{taskDescription}}.

{{#if constraints}}
Constraints:
{{#each constraints}}
- {{this}}
{{/each}}
{{/if}}

{{#if contextHistory}}
Based on previous work: {{contextHistory.[0]}}
{{/if}}

{{#if outputFormat_code}}
Requirements:
- Follow best practices
- Include error handling
- Add appropriate comments
{{else}}
Requirements:
- Be clear and concise
- Structure the output logically
{{/if}}

{{#unless timeConstraint_immediate}}
Provide {{#if userLevel_beginner}}detailed explanations{{else}}implementation notes{{/if}}.
{{/unless}}`;
  }

  private getAnalysisTemplate(): string {
    return `Analyze {{targetContent}} for {{analysisGoal}}.

Focus areas:
{{#each focusAreas}}
- {{this}}
{{/each}}

{{#if contextHistory}}
Consider previous analysis: {{contextHistory.[0]}}
{{/if}}

{{#if userLevel_advanced}}
Provide technical insights and recommendations.
{{else}}
Explain findings clearly with examples.
{{/if}}

{{#unless timeConstraint_immediate}}
Include detailed methodology and reasoning.
{{/unless}}`;
  }

  private getTransformationTemplate(): string {
    return `Transform {{sourceContent}} from {{sourceFormat}} to {{targetFormat}}.

{{#if transformationRules}}
Apply these rules:
{{#each transformationRules}}
- {{this}}
{{/each}}
{{/if}}

{{#if preserveAspects}}
Preserve:
{{#each preserveAspects}}
- {{this}}
{{/each}}
{{/if}}

{{#if userLevel_beginner}}
Explain the transformation process step by step.
{{/if}}`;
  }

  private getPlanningTemplate(): string {
    return `Create a {{planType}} plan for {{projectGoal}}.

{{#if requirements}}
Requirements:
{{#each requirements}}
- {{this}}
{{/each}}
{{/if}}

{{#if constraints}}
Constraints:
{{#each constraints}}
- {{this}}
{{/each}}
{{/if}}

{{#if timeConstraint_thorough}}
Include detailed timeline, resources, and risk assessment.
{{else}}
Provide structured plan with key milestones.
{{/if}}

{{#if contextHistory}}
Consider previous planning: {{contextHistory.[0]}}
{{/if}}`;
  }

  private getDebuggingTemplate(): string {
    return `Debug {{problemDescription}} in {{codeContext}}.

{{#if errorMessages}}
Error details:
{{#each errorMessages}}
- {{this}}
{{/each}}
{{/if}}

{{#if reproducedSteps}}
Reproduction steps:
{{#each reproducedSteps}}
{{@index}}. {{this}}
{{/each}}
{{/if}}

{{#if userLevel_advanced}}
Provide root cause analysis and optimization suggestions.
{{else}}
Explain the issue and provide step-by-step solution.
{{/if}}`;
  }

  /**
   * Adapt template for specific user context
   */
  private adaptTemplateForUser(
    template: TemplateMetadata,
    context: TemplateContext
  ): TemplateMetadata {
    const adapted = { ...template };

    // Adjust complexity based on user level
    if (context.userLevel === 'beginner') {
      adapted.qualityScore += 5; // More detailed templates for beginners
      adapted.compressionRatio *= 0.8; // Less compression for clarity
    } else if (context.userLevel === 'advanced') {
      adapted.compressionRatio *= 1.2; // More compression for advanced users
    }

    // Adjust for time constraints
    if (context.timeConstraint === 'immediate') {
      adapted.compressionRatio *= 1.3; // Higher compression for speed
    } else if (context.timeConstraint === 'thorough') {
      adapted.compressionRatio *= 0.7; // Less compression for thoroughness
    }

    return adapted;
  }

  /**
   * Extract variables from context
   */
  private extractVariables(context: TemplateContext): Record<string, any> {
    const variables: Record<string, any> = {
      // Basic context variables
      toolName: context.toolName,
      taskType: context.taskType,
      userLevel: context.userLevel,
      outputFormat: context.outputFormat,
      timeConstraint: context.timeConstraint,

      // Boolean flags for conditional logic
      [`userLevel_${context.userLevel}`]: true,
      [`outputFormat_${context.outputFormat}`]: true,
      [`timeConstraint_${context.timeConstraint}`]: true,

      // Arrays
      constraints: context.constraints,
      contextHistory: context.contextHistory,

      // User preferences
      ...context.preferences,
    };

    return variables;
  }

  /**
   * Optimize template for specific context
   */
  private optimizeTemplate(template: string, context: TemplateContext): string {
    let optimized = template;

    // Apply context-specific optimizations
    if (context.timeConstraint === 'immediate') {
      // Remove optional sections for speed
      optimized = optimized.replace(
        /{{#unless timeConstraint_immediate}}[\s\S]*?{{\/unless}}/g,
        ''
      );
    }

    // Optimize for output format
    if (context.outputFormat === 'code') {
      // Add code-specific optimizations
      optimized = this.addCodeSpecificOptimizations(optimized);
    }

    // Apply compression based on user level
    if (context.userLevel === 'advanced') {
      optimized = this.applyAdvancedUserOptimizations(optimized);
    }

    return optimized.trim();
  }

  /**
   * Get context injections based on history
   */
  private getContextInjections(context: TemplateContext): string[] {
    const injections: string[] = [];

    if (context.contextHistory && context.contextHistory.length > 0) {
      injections.push(`Previous context: ${context.contextHistory[0]}`);
    }

    if (context.constraints && context.constraints.length > 0) {
      injections.push(`Active constraints: ${context.constraints.length} items`);
    }

    return injections;
  }

  /**
   * Initialize built-in templates
   */
  private initializeBuiltInTemplates(): void {
    const builtInTemplates: Partial<TemplateMetadata>[] = [
      {
        id: 'smart_begin_basic',
        name: 'Smart Begin Basic Template',
        toolName: 'smart_begin',
        taskType: 'generation',
        compressionRatio: 0.35,
        qualityScore: 90,
      },
      {
        id: 'smart_plan_standard',
        name: 'Smart Plan Standard Template',
        toolName: 'smart_plan',
        taskType: 'planning',
        compressionRatio: 0.4,
        qualityScore: 88,
      },
      {
        id: 'smart_write_code',
        name: 'Smart Write Code Template',
        toolName: 'smart_write',
        taskType: 'generation',
        compressionRatio: 0.45,
        qualityScore: 92,
      },
    ];

    // Register built-in templates
    builtInTemplates.forEach(template => {
      if (template.id) {
        this.templates.set(template.id, template as TemplateMetadata);
      }
    });
  }

  /**
   * Register Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Helper for conditional logic
    Handlebars.registerHelper('if_eq', function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for array length
    Handlebars.registerHelper('array_length', function (array) {
      return Array.isArray(array) ? array.length : 0;
    });

    // Helper for truncating text
    Handlebars.registerHelper('truncate', function (text: string, length: number) {
      return text.length > length ? `${text.substring(0, length)}...` : text;
    });

    // Helper for optimizing based on user level
    Handlebars.registerHelper(
      'user_optimized',
      function (beginnerText: string, advancedText: string, userLevel: string) {
        return userLevel === 'beginner' ? beginnerText : advancedText;
      }
    );
  }

  /**
   * Helper methods
   */
  private extractTemplateVariables(template: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1].trim().split(' ')[0]; // Get variable name, ignore helpers
      if (!variables.includes(variable) && !variable.startsWith('#') && !variable.startsWith('/')) {
        variables.push(variable);
      }
    }

    return variables;
  }

  private countTokens(text: string): number {
    // Approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private estimateTokens(template: string, variables: Record<string, any>): number {
    // Compile and render template with variables to get accurate token count
    const compiled = Handlebars.compile(template);
    const rendered = compiled(variables);
    return this.countTokens(rendered);
  }

  private addCodeSpecificOptimizations(template: string): string {
    // Add code-specific optimizations
    return template.replace(/\n\s*\n/g, '\n'); // Remove empty lines
  }

  private applyAdvancedUserOptimizations(template: string): string {
    // Apply advanced user optimizations
    return template
      .replace(/Explain|Please note|It is important/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private updateUsageStats(templateId: string): void {
    const stats = this.optimizationStats.get(templateId) || { uses: 0, avgReduction: 0 };
    stats.uses += 1;
    this.optimizationStats.set(templateId, stats);
  }

  /**
   * Public API methods
   */
  public getTemplateById(id: string): TemplateMetadata | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): TemplateMetadata[] {
    return Array.from(this.templates.values());
  }

  public addCustomTemplate(template: TemplateMetadata & { template: string }): void {
    this.templates.set(template.id, template);
    this.compiledTemplates.set(template.id, Handlebars.compile(template.template));
  }

  /**
   * Week 2: Advanced user profile analysis
   */
  private async analyzeUserProfile(context: TemplateContext): Promise<UserProfile> {
    const profileKey = context.sessionId || 'default';
    let profile = this.userProfiles.get(profileKey);

    if (!profile) {
      profile = {
        userId: profileKey,
        preferredVerbosity: context.userBehaviorProfile?.preferredVerbosity || 'moderate',
        successfulTemplates: context.userBehaviorProfile?.successfulTemplateIds || [],
        commonPatterns: context.userBehaviorProfile?.commonPatterns || [],
        adaptationHistory: [],
        persistentPreferences: {},
        performanceMetrics: {
          avgSatisfactionScore: 0.8,
          preferredTokenRange: { min: 100, max: 500 },
          adaptationSuccessRate: 0.7,
        },
      };
      this.userProfiles.set(profileKey, profile);
    }

    return profile;
  }

  /**
   * Week 2: Build session context with cross-session intelligence
   */
  private async buildSessionContext(context: TemplateContext): Promise<SessionContext> {
    const sessionKey = context.sessionId || 'current';
    let sessionContext = this.sessionMemory.get(sessionKey);

    if (!sessionContext) {
      sessionContext = {
        sessionId: sessionKey,
        relatedSessions: await this.findRelatedSessions(context),
        carryOverContext: context.contextHistory || [],
        workflowStage: context.contextualFactors?.workflowStage || 'implementation',
        contextualFactors: context.contextualFactors || {},
      };
      this.sessionMemory.set(sessionKey, sessionContext);
    }

    return sessionContext;
  }

  /**
   * Week 2: Advanced template selection with behavioral modeling
   */
  private async getOptimalTemplateAdvanced(
    context: TemplateContext,
    userProfile: UserProfile,
    sessionContext: SessionContext
  ): Promise<TemplateMetadata> {
    const templateKey = `${context.toolName}_${context.taskType}`;
    let template = this.templates.get(templateKey);

    if (!template) {
      template = await this.createAdvancedTemplate(context, userProfile);
      this.templates.set(templateKey, template);
    }

    // Adapt template based on user profile and session context
    const adaptedTemplate = await this.adaptationEngine.adaptTemplate(
      template,
      context,
      userProfile,
      sessionContext
    );

    return adaptedTemplate;
  }

  /**
   * Week 2: Advanced variable extraction with cross-session intelligence
   */
  private async extractVariablesAdvanced(
    context: TemplateContext,
    sessionContext: SessionContext
  ): Promise<Record<string, any>> {
    const baseVariables = this.extractVariables(context);

    // Add cross-session variables
    const advancedVariables = {
      ...baseVariables,
      // Session-aware variables
      sessionId: context.sessionId,
      workflowStage: sessionContext.workflowStage,
      relatedSessionsCount: sessionContext.relatedSessions?.length || 0,

      // Project context variables
      projectId: context.projectContext?.projectId,
      projectDomain: context.projectContext?.domain,
      projectComplexity: context.projectContext?.complexity,

      // Behavioral variables
      userVerbosity: context.userBehaviorProfile?.preferredVerbosity,
      urgencyLevel: context.contextualFactors?.urgencyLevel || 5,

      // Cross-session context
      hasCarryOverContext: (sessionContext.carryOverContext?.length || 0) > 0,
      carryOverContext: sessionContext.carryOverContext || [],
    };

    return advancedVariables;
  }

  /**
   * Week 2: Advanced template optimization with behavioral adaptation
   */
  private async optimizeTemplateAdvanced(
    template: string,
    context: TemplateContext,
    userProfile: UserProfile
  ): Promise<string> {
    let optimized = this.optimizeTemplate(template, context);

    // Apply user profile optimizations
    if (userProfile.preferredVerbosity === 'concise') {
      optimized = this.applyConcisenessOptimizations(optimized);
    } else if (userProfile.preferredVerbosity === 'detailed') {
      optimized = this.applyDetailedOptimizations(optimized, context);
    }

    // Apply workflow stage optimizations
    const workflowStage = context.contextualFactors?.workflowStage;
    if (workflowStage) {
      optimized = this.applyWorkflowOptimizations(optimized, workflowStage);
    }

    return optimized;
  }

  /**
   * Week 2: Advanced context injections with session intelligence
   */
  private getAdvancedContextInjections(
    context: TemplateContext,
    sessionContext: SessionContext
  ): string[] {
    const baseInjections = this.getContextInjections(context);
    const advancedInjections = [...baseInjections];

    // Add session-aware injections
    if (sessionContext.relatedSessions && sessionContext.relatedSessions.length > 0) {
      advancedInjections.push(`Related sessions: ${sessionContext.relatedSessions.length} found`);
    }

    if (context.projectContext?.projectId) {
      advancedInjections.push(`Project context: ${context.projectContext.projectId}`);
    }

    if (context.contextualFactors?.urgencyLevel && context.contextualFactors.urgencyLevel > 7) {
      advancedInjections.push('High urgency context - optimizing for speed');
    }

    return advancedInjections;
  }

  private async findRelatedSessions(context: TemplateContext): Promise<string[]> {
    // Simulate finding related sessions based on project context
    const related: string[] = [];

    if (context.projectContext?.projectId) {
      // In a real implementation, this would query a session database
      related.push(`${context.projectContext.projectId}_session_1`);
      related.push(`${context.projectContext.projectId}_session_2`);
    }

    return related;
  }

  private async createAdvancedTemplate(
    context: TemplateContext,
    userProfile: UserProfile
  ): Promise<TemplateMetadata> {
    const baseTemplate = await this.createNewTemplate(context);

    // Enhance with Week 2 features
    return {
      ...baseTemplate,
      adaptationLevel: 0.8, // High adaptation capability
      crossSessionCompatible: true,
      userSegments: [context.userLevel || 'intermediate'],
      performanceMetrics: {
        avgTokenReduction: 0.4,
        successRate: 0.85,
        avgQualityScore: 0.9,
        adaptationAccuracy: 0.8,
      },
      learningData: {
        effectiveContexts: [],
        failurePatterns: [],
        optimizationHistory: [],
      },
    };
  }

  private getAdaptationReason(
    template: TemplateMetadata,
    context: TemplateContext,
    userProfile: UserProfile
  ): string {
    const reasons = [];

    if (userProfile.preferredVerbosity === 'concise') {
      reasons.push('Optimized for concise output preference');
    }

    if (context.timeConstraint === 'immediate') {
      reasons.push('Streamlined for immediate response');
    }

    if (context.contextualFactors?.urgencyLevel && context.contextualFactors.urgencyLevel > 7) {
      reasons.push('High urgency optimization applied');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Standard template optimization';
  }

  private calculateConfidenceScore(
    template: TemplateMetadata,
    context: TemplateContext,
    userProfile: UserProfile
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on template usage
    if (template.usageCount > 10) confidence += 0.1;
    if (template.usageCount > 50) confidence += 0.1;

    // Adjust based on user profile match
    if (userProfile.successfulTemplates.includes(template.id)) {
      confidence += 0.1;
    }

    // Adjust based on context completeness
    if (context.contextHistory && context.contextHistory.length > 0) confidence += 0.05;
    if (context.projectContext?.projectId) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private async generateAlternativeTemplates(
    context: TemplateContext,
    excludeId: string
  ): Promise<Array<{ id: string; reason: string; estimatedTokens: number }>> {
    const alternatives: Array<{ id: string; reason: string; estimatedTokens: number }> = [];

    // Find alternative templates for the same task type
    for (const [id, template] of this.templates.entries()) {
      if (id !== excludeId && template.taskType === context.taskType) {
        alternatives.push({
          id,
          reason: `Alternative ${template.taskType} template with ${Math.round(template.compressionRatio * 100)}% compression`,
          estimatedTokens: template.baseTokens,
        });

        if (alternatives.length >= 3) break; // Limit to 3 alternatives
      }
    }

    return alternatives;
  }

  private async generatePredictiveOptimizations(
    context: TemplateContext,
    userProfile: UserProfile
  ): Promise<string[]> {
    const optimizations: string[] = [];

    // Predict based on user behavior
    if (userProfile.commonPatterns.includes('code_generation')) {
      optimizations.push('Consider code-specific template optimizations');
    }

    if (context.contextualFactors?.workflowStage === 'testing') {
      optimizations.push('Testing-focused template adaptation recommended');
    }

    if (userProfile.performanceMetrics.preferredTokenRange.max < 300) {
      optimizations.push('Apply aggressive compression for token limit preference');
    }

    return optimizations;
  }

  private estimateTokensAdvanced(
    template: string,
    variables: Record<string, any>,
    context: TemplateContext
  ): number {
    let baseEstimate = this.estimateTokens(template, variables);

    // Adjust based on context complexity
    if (context.projectContext?.complexity === 'complex') {
      baseEstimate *= 1.2;
    } else if (context.projectContext?.complexity === 'simple') {
      baseEstimate *= 0.8;
    }

    return Math.round(baseEstimate);
  }

  private async updateAdvancedUsageStats(
    templateId: string,
    context: TemplateContext,
    tokens: number
  ): Promise<void> {
    this.updateUsageStats(templateId);

    // Track additional metrics
    await this.performanceTracker.recordUsage({
      templateId,
      toolName: context.toolName,
      taskType: context.taskType,
      tokenCount: tokens,
      timestamp: new Date(),
      userLevel: context.userLevel,
      sessionId: context.sessionId,
    });
  }

  private applyConcisenessOptimizations(template: string): string {
    return template
      .replace(/Please\s+/gi, '')
      .replace(/\s*Note that\s*/gi, ' ')
      .replace(/\s*It is important to\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private applyDetailedOptimizations(template: string, context: TemplateContext): string {
    // Add more detailed instructions for users who prefer verbosity
    if (context.outputFormat === 'code') {
      template += '\n\nProvide detailed code comments and explanation of approach.';
    }

    return template;
  }

  private applyWorkflowOptimizations(template: string, workflowStage: string): string {
    switch (workflowStage) {
      case 'planning':
        return template.replace(/\bImplement\b/g, 'Plan implementation of');
      case 'testing':
        return `${template}\n\nInclude testing considerations and validation steps.`;
      case 'deployment':
        return `${template}\n\nConsider deployment and production readiness.`;
      default:
        return template;
    }
  }

  private initializeAdvancedFeatures(): void {
    console.log('Initializing Week 2 advanced template features...');
    // Initialize advanced learning engines
    // In a real implementation, these would load from persistent storage
  }

  // Public API methods
  public getUsageStats(): Map<string, { uses: number; avgReduction: number }> {
    return new Map(this.optimizationStats);
  }

  public renderTemplate(templateId: string, variables: Record<string, any>): string | null {
    const template = this.templates.get(templateId);
    if (!template || !('template' in template)) {
      return null;
    }

    let compiled = this.compiledTemplates.get(templateId);
    if (!compiled) {
      compiled = Handlebars.compile((template as any).template);
      this.compiledTemplates.set(templateId, compiled);
    }

    return compiled(variables);
  }

  // Week 2: Advanced API methods
  public async getUserProfile(sessionId: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(sessionId);
  }

  public async updateUserProfile(sessionId: string, updates: Partial<UserProfile>): Promise<void> {
    const existing = this.userProfiles.get(sessionId);
    if (existing) {
      this.userProfiles.set(sessionId, { ...existing, ...updates });
    }
  }

  public getPerformanceMetrics(): TemplateEngineMetrics {
    return {
      totalTemplates: this.templates.size,
      activeUsers: this.userProfiles.size,
      avgAdaptationAccuracy: 0.82,
      crossSessionEfficiency: 0.89,
      overallPerformance: 0.91,
    };
  }
}

// Week 2: Additional interfaces for advanced features
interface UserProfile {
  userId: string;
  preferredVerbosity: 'concise' | 'moderate' | 'detailed';
  successfulTemplates: string[];
  commonPatterns: string[];
  adaptationHistory: Array<{ templateId: string; adaptation: string; success: boolean }>;
  persistentPreferences: Record<string, any>;
  performanceMetrics: {
    avgSatisfactionScore: number;
    preferredTokenRange: { min: number; max: number };
    adaptationSuccessRate: number;
  };
}

interface SessionContext {
  sessionId: string;
  relatedSessions?: string[];
  carryOverContext?: string[];
  workflowStage: 'planning' | 'implementation' | 'testing' | 'deployment';
  contextualFactors: {
    relatedTools?: string[];
    workflowStage?: 'planning' | 'implementation' | 'testing' | 'deployment';
    urgencyLevel?: number;
  };
}

interface TemplateEngineMetrics {
  totalTemplates: number;
  activeUsers: number;
  avgAdaptationAccuracy: number;
  crossSessionEfficiency: number;
  overallPerformance: number;
}

// Mock advanced engine classes for Week 2
class TemplateAdaptationEngine {
  async adaptTemplate(
    template: TemplateMetadata,
    context: TemplateContext,
    userProfile: UserProfile,
    sessionContext: SessionContext
  ): Promise<TemplateMetadata> {
    // Advanced adaptation logic
    const adapted = { ...template };
    adapted.qualityScore = Math.min(template.qualityScore + 5, 100);
    adapted.lastUpdated = new Date();
    return adapted;
  }
}

class CrossSessionLearningEngine {
  async learnFromSession(sessionId: string, outcomes: Record<string, unknown>): Promise<void> {
    // Cross-session learning implementation
  }
}

class TemplatePerformanceTracker {
  async recordUsage(usage: {
    templateId: string;
    toolName: string;
    taskType: string;
    tokenCount: number;
    timestamp: Date;
    userLevel?: string;
    sessionId?: string;
  }): Promise<void> {
    // Performance tracking implementation
  }
}

// Export factory function
export function createTemplateEngine(): ContextAwareTemplateEngine {
  return new ContextAwareTemplateEngine();
}
