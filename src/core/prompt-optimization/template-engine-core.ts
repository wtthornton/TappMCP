/**
 * Template Engine Core Functionality
 *
 * Contains the main template engine logic without the large ContextAwareTemplateEngine class
 */

import Handlebars from 'handlebars';
import { TemplateContext, TemplateMetadata, UserProfile, SessionContext } from './template-schemas.js';

/**
 * Base Template Engine
 */
export class BaseTemplateEngine {
  protected templates: Map<string, TemplateMetadata & { template: string }> = new Map();
  protected sessionMemory: Map<string, SessionContext> = new Map();
  protected userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.initializeHandlebarsHelpers();
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebarsHelpers(): void {
    // Equality helper
    Handlebars.registerHelper('if_eq', function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Conditional helper
    Handlebars.registerHelper('if_contains', function (array, value, options) {
      if (Array.isArray(array) && array.includes(value)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // User level helper
    Handlebars.registerHelper('user_level', function (level, options) {
      const context = options.data.root;
      if (context.userLevel === level) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Task type helper
    Handlebars.registerHelper('task_type', function (type, options) {
      const context = options.data.root;
      if (context.taskType === type) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  /**
   * Add a custom template
   */
  addCustomTemplate(templateData: TemplateMetadata & { template: string }): void {
    this.templates.set(templateData.id, templateData);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Array<TemplateMetadata & { template: string }> {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): (TemplateMetadata & { template: string }) | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Generate template with context
   */
  generateTemplate(templateId: string, context: TemplateContext): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const compiledTemplate = Handlebars.compile(template.template);
    return compiledTemplate(context);
  }

  /**
   * Get session context
   */
  getSessionContext(sessionId: string): SessionContext | null {
    return this.sessionMemory.get(sessionId) || null;
  }

  /**
   * Update session context
   */
  updateSessionContext(sessionId: string, updates: Partial<SessionContext>): void {
    const existing = this.getSessionContext(sessionId);
    if (existing) {
      this.sessionMemory.set(sessionId, { ...existing, ...updates });
    }
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const existing = this.getUserProfile(userId);
    if (existing) {
      this.userProfiles.set(userId, { ...existing, ...updates });
    }
  }
}
