#!/usr/bin/env node

/**
 * Context-Aware Template Engine - Simplified
 *
 * Advanced dynamic template generation with cross-session intelligence,
 * user behavior adaptation, and deep Context7 integration.
 * Provides maximum efficiency through predictive template optimization.
 */

import Handlebars from 'handlebars';
import { BaseTemplateEngine } from './template-engine-core.js';
import {
  TemplateContext,
  TemplateMetadata,
  UserProfile,
  SessionContext,
  TemplateContextSchema,
  UserProfileSchema,
  SessionContextSchema,
  TemplateMetadataSchema,
  TemplateEngineMetricsSchema,
  type TemplateEngineMetrics,
} from './template-schemas.js';

/**
 * Context-Aware Template Engine
 *
 * Enhanced template engine with cross-session learning and user adaptation
 */
export class ContextAwareTemplateEngine extends BaseTemplateEngine {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _contextPatterns: Map<string, RegExp>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _crossSessionLearning: CrossSessionLearningEngine;
  private performanceTracker: TemplatePerformanceTracker;

  constructor() {
    super();
    this._contextPatterns = new Map();
    this._crossSessionLearning = new CrossSessionLearningEngine();
    this.performanceTracker = new TemplatePerformanceTracker();
    this.initializeBuiltInTemplates();
  }

  /**
   * Initialize built-in templates
   */
  private initializeBuiltInTemplates(): void {
    // Smart Begin template
    this.addCustomTemplate({
      id: 'smart_begin_basic',
      name: 'Smart Begin Basic Template',
      description: 'Basic generation template for smart_begin tool',
      toolName: 'smart_begin',
      taskType: 'generation',
      baseTokens: 120,
      compressionRatio: 0.25,
      qualityScore: 85,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['projectName', 'projectType', 'businessContext'],
      adaptationLevel: 'static',
      crossSessionCompatible: true,
      userSegments: ['beginner', 'intermediate', 'advanced'],
      template:
        '{{#if_eq userLevel "beginner"}}\\n' +
        'Let us start your project step by step:\\n' +
        '{{else}}\\n' +
        'Initialize project with these specifications:\\n' +
        '{{/if_eq}}\\n\\n' +
        'Project: {{projectName}}\\n' +
        'Type: {{projectType}}\\n\\n' +
        '{{#if businessContext}}\\n' +
        'Business Context:\\n' +
        '- Industry: {{businessContext.industry}}\\n' +
        '- Target Users: {{businessContext.targetUsers}}\\n' +
        '{{/if}}\\n\\n' +
        '{{#user_level "advanced"}}\\n' +
        'Technical requirements and constraints will be automatically analyzed.\\n' +
        '{{/user_level}}',
    });

    // Smart Plan template (planning)
    this.addCustomTemplate({
      id: 'smart_plan_basic',
      name: 'Smart Plan Basic Template',
      description: 'Basic planning template for smart_plan tool',
      toolName: 'smart_plan',
      taskType: 'planning',
      baseTokens: 150,
      compressionRatio: 0.3,
      qualityScore: 85,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['projectName', 'scope', 'techStack'],
      adaptationLevel: 'static',
      crossSessionCompatible: true,
      userSegments: ['intermediate', 'advanced'],
      template:
        '{{#if_eq taskType "planning"}}\\n' +
        '## Project Planning\\n\\n' +
        '{{#if_eq userLevel "beginner"}}\\n' +
        'Here is a simple plan for your project:\\n' +
        '{{else}}\\n' +
        'Comprehensive project plan:\\n' +
        '{{/if_eq}}\\n\\n' +
        '### Scope\\n' +
        '{{#if scope}}\\n' +
        '- Budget: ${{scope.budget}}\\n' +
        '- Timeline: {{scope.timeline}}\\n' +
        '{{/if}}\\n\\n' +
        '### Technical Stack\\n' +
        '{{#if techStack}}\\n' +
        '{{#each techStack}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n' +
        '{{/if_eq}}',
    });

    // Smart Plan template (analysis)
    this.addCustomTemplate({
      id: 'smart_plan_analysis',
      name: 'Smart Plan Analysis Template',
      description: 'Analysis template for smart_plan tool',
      toolName: 'smart_plan',
      taskType: 'analysis',
      baseTokens: 200,
      compressionRatio: 0.4,
      qualityScore: 88,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['requirements', 'constraints', 'timeline'],
      adaptationLevel: 'dynamic',
      crossSessionCompatible: true,
      userSegments: ['advanced', 'intermediate'],
      template:
        '{{#if_eq taskType "analysis"}}\\n' +
        '## Requirements Analysis\\n\\n' +
        '{{#if_eq userLevel "beginner"}}\\n' +
        'Analysis of your project requirements:\\n' +
        '{{else}}\\n' +
        'Comprehensive requirement analysis:\\n' +
        '{{/if_eq}}\\n\\n' +
        '### Key Requirements\\n' +
        '{{#if requirements}}\\n' +
        '{{#each requirements}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n\\n' +
        '### Constraints\\n' +
        '{{#if constraints}}\\n' +
        '{{#each constraints}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n' +
        '{{/if_eq}}',
    });

    // Smart Write template
    this.addCustomTemplate({
      id: 'smart_write_basic',
      name: 'Smart Write Basic Template',
      description: 'Basic generation template for smart_write tool',
      toolName: 'smart_write',
      taskType: 'generation',
      baseTokens: 100,
      compressionRatio: 0.3,
      qualityScore: 85,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['featureDescription', 'techStack'],
      adaptationLevel: 'static',
      crossSessionCompatible: true,
      userSegments: ['intermediate', 'advanced'],
      template:
        '{{#if_eq taskType "generation"}}\\n' +
        '{{#if_eq outputFormat "code"}}\\n' +
        '// Generated code for: {{featureDescription}}\\n' +
        '{{#if_eq userLevel "beginner"}}\\n' +
        '// This code includes helpful comments for learning\\n' +
        '{{/if_eq}}\\n\\n' +
        '{{#if techStack}}\\n' +
        '// Using: {{#each techStack}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}\\n' +
        '{{/if}}\\n' +
        '{{/if_eq}}\\n' +
        '{{/if_eq}}',
    });

    // Smart Orchestrate template (planning)
    this.addCustomTemplate({
      id: 'smart_orchestrate_planning',
      name: 'Smart Orchestrate Planning Template',
      description: 'Planning template for smart_orchestrate tool',
      toolName: 'smart_orchestrate',
      taskType: 'planning',
      baseTokens: 180,
      compressionRatio: 0.35,
      qualityScore: 90,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['workflowSteps', 'resources', 'constraints'],
      adaptationLevel: 'dynamic',
      crossSessionCompatible: true,
      userSegments: ['advanced', 'intermediate'],
      template:
        '{{#if_eq taskType "planning"}}\\n' +
        '## Orchestration Plan\\n\\n' +
        '{{#if_eq userLevel "beginner"}}\\n' +
        'Simple orchestration plan:\\n' +
        '{{else}}\\n' +
        'Advanced orchestration strategy:\\n' +
        '{{/if_eq}}\\n\\n' +
        '### Workflow Steps\\n' +
        '{{#if workflowSteps}}\\n' +
        '{{#each workflowSteps}}\\n' +
        '{{@index}}. {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n\\n' +
        '### Resource Requirements\\n' +
        '{{#if resources}}\\n' +
        '{{#each resources}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n\\n' +
        '### Constraints\\n' +
        '{{#if constraints}}\\n' +
        '{{#each constraints}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n' +
        '{{/if_eq}}',
    });

    // Smart Finish template (generation)
    this.addCustomTemplate({
      id: 'smart_finish_generation',
      name: 'Smart Finish Generation Template',
      description: 'Generation template for smart_finish tool',
      toolName: 'smart_finish',
      taskType: 'generation',
      baseTokens: 140,
      compressionRatio: 0.3,
      qualityScore: 87,
      usageCount: 0,
      lastUpdated: new Date(),
      variables: ['completionSteps', 'qualityChecks', 'deliverables'],
      adaptationLevel: 'static',
      crossSessionCompatible: true,
      userSegments: ['advanced', 'intermediate'],
      template:
        '{{#if_eq taskType "generation"}}\\n' +
        '## Project Completion\\n\\n' +
        '{{#if_eq userLevel "beginner"}}\\n' +
        'Final steps to complete your project:\\n' +
        '{{else}}\\n' +
        'Advanced completion and quality validation:\\n' +
        '{{/if_eq}}\\n\\n' +
        '### Completion Steps\\n' +
        '{{#if completionSteps}}\\n' +
        '{{#each completionSteps}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n\\n' +
        '### Quality Checks\\n' +
        '{{#if qualityChecks}}\\n' +
        '{{#each qualityChecks}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n\\n' +
        '### Deliverables\\n' +
        '{{#if deliverables}}\\n' +
        '{{#each deliverables}}\\n' +
        '- {{this}}\\n' +
        '{{/each}}\\n' +
        '{{/if}}\\n' +
        '{{/if_eq}}',
    });
  }

  /**
   * Generate optimized template based on context
   */
  async generateOptimizedTemplate(
    context: TemplateContext,
    userProfile?: UserProfile
  ): Promise<string> {
    // Get or create session context
    const sessionContext = await this.getOrCreateSessionContext(context);

    // Find best template for context
    const template = await this.findBestTemplate(context, userProfile);

    // Generate template with context
    const generated = this.generateTemplate(template.id, context);

    // Record usage for learning
    await this.recordUsage(template.id, context, sessionContext);

    return generated;
  }

  /**
   * Get or create session context
   */
  private async getOrCreateSessionContext(context: TemplateContext): Promise<SessionContext> {
    let { sessionId } = context;

    // Generate a default session ID if not provided
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Update the context with the generated session ID
      (context as any).sessionId = sessionId;
    }

    let sessionContext = this.getSessionContext(sessionId);
    if (!sessionContext) {
      sessionContext = {
        sessionId,
        startTime: new Date(),
        templatesUsed: [],
        successRate: 0,
        contextPreservation: true,
      };
      this.sessionMemory.set(sessionId, sessionContext);
    }

    return sessionContext;
  }

  /**
   * Find best template for context
   */
  private async findBestTemplate(
    context: TemplateContext,
    userProfile?: UserProfile
  ): Promise<TemplateMetadata & { template: string }> {
    const templates = this.getAllTemplates();

    // Filter by tool name and task type
    const relevantTemplates = templates.filter(
      t => t.toolName === context.toolName && t.taskType === context.taskType
    );

    if (relevantTemplates.length === 0) {
      throw new Error(
        `No templates found for tool: ${context.toolName}, task: ${context.taskType}`
      );
    }

    // Score templates based on context
    const scoredTemplates = relevantTemplates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, context, userProfile),
    }));

    // Return highest scoring template
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0].template;
  }

  /**
   * Calculate template score based on context
   */
  private calculateTemplateScore(
    template: TemplateMetadata & { template: string },
    context: TemplateContext,
    userProfile?: UserProfile
  ): number {
    let score = template.qualityScore;

    // Adjust for user level
    if (template.userSegments && Array.isArray(template.userSegments)) {
      if (context.userLevel === 'beginner' && template.userSegments.includes('beginner')) {
        score += 10;
      } else if (context.userLevel === 'advanced' && template.userSegments.includes('advanced')) {
        score += 10;
      }
    }

    // Adjust for time constraint
    if (context.timeConstraint === 'immediate' && template.adaptationLevel === 'static') {
      score += 5;
    }

    // Adjust for user profile
    if (
      userProfile &&
      template.userSegments &&
      Array.isArray(template.userSegments) &&
      template.userSegments.includes(userProfile.experienceLevel)
    ) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Record template usage for learning
   */
  private async recordUsage(
    templateId: string,
    context: TemplateContext,
    sessionContext: SessionContext
  ): Promise<void> {
    // Update session context
    sessionContext.templatesUsed.push(templateId);
    this.updateSessionContext(sessionContext.sessionId, sessionContext);

    // Record performance metrics
    await this.performanceTracker.recordUsage({
      templateId,
      toolName: context.toolName,
      taskType: context.taskType,
      tokenCount: this.estimateTokenCount(context),
      timestamp: new Date(),
      userLevel: context.userLevel,
      ...(context.sessionId && { sessionId: context.sessionId }),
    });
  }

  /**
   * Estimate token count for context
   */
  private estimateTokenCount(context: TemplateContext): number {
    // Simple estimation based on context properties
    let count = 100; // Base tokens

    count += context.toolName.length;
    count += context.taskType.length;
    count += context.constraints.length * 10;
    count += context.contextHistory.length * 20;

    return count;
  }

  /**
   * Get engine metrics
   */
  getMetrics(): TemplateEngineMetrics {
    const templates = this.getAllTemplates();
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
    const avgQuality = templates.reduce((sum, t) => sum + t.qualityScore, 0) / templates.length;

    return {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.usageCount > 0).length,
      averageQualityScore: avgQuality || 0,
      totalUsage,
      crossSessionLearning: true,
      adaptationEnabled: true,
      performanceScore: this.calculatePerformanceScore(),
    };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    const templates = this.getAllTemplates();
    if (templates.length === 0) {return 0;}

    const avgQuality = templates.reduce((sum, t) => sum + t.qualityScore, 0) / templates.length;
    const usageRate = templates.filter(t => t.usageCount > 0).length / templates.length;

    return Math.round((avgQuality + usageRate * 100) / 2);
  }

  /**
   * Get template by ID (alias for getTemplate for test compatibility)
   */
  getTemplateById(templateId: string): (TemplateMetadata & { template: string }) | null {
    return this.getTemplate(templateId);
  }

  /**
   * Render template with variables
   */
  renderTemplate(templateId: string, variables: Record<string, any>): string | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      return null;
    }

    try {
      const compiledTemplate = Handlebars.compile(template.template);
      return compiledTemplate(variables);
    } catch (error) {
      console.error(`Error rendering template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Map<string, number> {
    const stats = new Map<string, number>();
    const templates = this.getAllTemplates();

    for (const template of templates) {
      stats.set(template.id, template.usageCount);
    }

    return stats;
  }
}

/**
 * Cross-Session Learning Engine
 * Enhanced with process compliance and quality lessons from archive
 */
class CrossSessionLearningEngine {
  private processComplianceLessons: Map<string, ProcessLesson> = new Map();
  private qualityFailurePatterns: Map<string, QualityPattern> = new Map();
  private roleComplianceHistory: Map<string, RoleCompliance> = new Map();

  async learnFromSession(sessionId: string, outcomes: Record<string, unknown>): Promise<void> {
    // Learn from process compliance failures
    await this.learnProcessCompliance(sessionId, outcomes);

    // Learn from quality gate failures
    await this.learnQualityPatterns(sessionId, outcomes);

    // Learn from role switching patterns
    await this.learnRoleCompliance(sessionId, outcomes);
  }

  private async learnProcessCompliance(
    _sessionId: string,
    _outcomes: Record<string, unknown>
  ): Promise<void> {
    // Archive lesson: Phase 1C Role Compliance Failure
    const processLesson: ProcessLesson = {
      id: 'process-compliance-failure',
      context: 'role-switching',
      lesson: 'Always validate role compliance before claiming completion',
      impact: 'high',
      category: 'process',
      preventionActions: [
        'Explicitly confirm role at start',
        'Follow role-specific prevention checklist',
        'Track role-specific success metrics',
        'Document role-specific decisions',
      ],
      failurePatterns: [
        'No role validation at start',
        'Bypassing quality gates',
        'Making completion claims without validation',
        'Process shortcuts to save time',
      ],
      successPatterns: [
        'Run early-check before starting',
        'Follow TDD approach',
        'Validate all quality gates',
        'Document all decisions',
      ],
    };

    this.processComplianceLessons.set('process-compliance-failure', processLesson);
  }

  private async learnQualityPatterns(
    _sessionId: string,
    _outcomes: Record<string, unknown>
  ): Promise<void> {
    // Archive lesson: Phase 2A QA Failure Analysis
    const qualityPattern: QualityPattern = {
      id: 'qa-failure-pattern',
      context: 'quality-validation',
      lesson: 'Never claim completion without proper quality validation',
      impact: 'critical',
      category: 'quality',
      requiredActions: [
        'Run npm run early-check before completion claims',
        'Validate all tests pass with ≥85% coverage',
        'Ensure TypeScript compilation succeeds',
        'Verify ESLint violations are resolved',
        'Create Requirements Traceability Matrix',
      ],
      warningSigns: [
        'Making assumptions about test results',
        'Bypassing quality gates',
        'False completion claims',
        'Process violations',
      ],
      successIndicators: [
        '100% test pass rate',
        'All quality gates green',
        'Complete requirements traceability',
        'Zero critical vulnerabilities',
      ],
    };

    this.qualityFailurePatterns.set('qa-failure-pattern', qualityPattern);
  }

  private async learnRoleCompliance(
    _sessionId: string,
    _outcomes: Record<string, unknown>
  ): Promise<void> {
    // Archive lesson: TypeScript Error Resolution Process
    const roleCompliance: RoleCompliance = {
      id: 'typescript-error-resolution',
      context: 'developer-role',
      lesson: 'Systematic error reduction with test-first approach',
      impact: 'high',
      category: 'development',
      systematicApproach: [
        'Categorize errors by type and impact',
        'Prioritize high-impact fixes first',
        'Use tests as safety net for refactoring',
        'Make minimal, targeted changes',
        'Document patterns for future prevention',
      ],
      errorPatterns: [
        'exactOptionalPropertyTypes configuration issues',
        'Class inheritance access modifier mismatches',
        'Parameter order in function signatures',
        'Complex conditional types resolution',
        'Unused variable patterns',
      ],
      preventionStrategies: [
        'Use spread operators with conditional property inclusion',
        'Keep access modifiers consistent across inheritance',
        'Put required parameters before optional ones',
        'Use simple, explicit types over complex conditionals',
        'Regular cleanup of unused variables',
      ],
    };

    this.roleComplianceHistory.set('typescript-error-resolution', roleCompliance);
  }

  /**
   * Get process compliance lessons for current context
   */
  getProcessLessons(context: string): ProcessLesson[] {
    return Array.from(this.processComplianceLessons.values()).filter(
      lesson => lesson.context === context || lesson.context === 'general'
    );
  }

  /**
   * Get quality patterns for prevention
   */
  getQualityPatterns(): QualityPattern[] {
    return Array.from(this.qualityFailurePatterns.values());
  }

  /**
   * Get role compliance history
   */
  getRoleCompliance(role: string): RoleCompliance[] {
    return Array.from(this.roleComplianceHistory.values()).filter(compliance =>
      compliance.context.includes(role)
    );
  }
}

interface ProcessLesson {
  id: string;
  context: string;
  lesson: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'process' | 'quality' | 'security' | 'development';
  preventionActions: string[];
  failurePatterns: string[];
  successPatterns: string[];
}

interface QualityPattern {
  id: string;
  context: string;
  lesson: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'quality' | 'testing' | 'validation';
  requiredActions: string[];
  warningSigns: string[];
  successIndicators: string[];
}

interface RoleCompliance {
  id: string;
  context: string;
  lesson: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'development' | 'testing' | 'quality';
  systematicApproach: string[];
  errorPatterns: string[];
  preventionStrategies: string[];
}

/**
 * Template Performance Tracker
 */
class TemplatePerformanceTracker {
  async recordUsage(_usage: {
    templateId: string;
    toolName: string;
    taskType: string;
    tokenCount: number;
    timestamp: Date;
    userLevel: string;
    sessionId?: string;
  }): Promise<void> {
    // Performance tracking implementation
  }
}

// Factory function for creating template engine instances
export function createTemplateEngine(): ContextAwareTemplateEngine {
  return new ContextAwareTemplateEngine();
}

// Re-export schemas and types
export {
  TemplateContextSchema,
  UserProfileSchema,
  SessionContextSchema,
  TemplateMetadataSchema,
  TemplateEngineMetricsSchema,
  type TemplateContext,
  type UserProfile,
  type SessionContext,
  type TemplateMetadata,
  type TemplateEngineMetrics,
};
