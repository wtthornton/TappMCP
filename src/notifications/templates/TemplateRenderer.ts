/**
 * Template Renderer
 *
 * Renders notification templates with variable substitution and formatting.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { NotificationTemplate, Notification } from '../types.js';

/**
 * Template Renderer
 *
 * Handles rendering of notification templates with variable substitution,
 * formatting, and validation.
 *
 * @example
 * ```typescript
 * const renderer = new TemplateRenderer();
 * const rendered = renderer.render(template, variables);
 * ```
 *
 * @since 2.0.0
 */
export class TemplateRenderer {
  private static readonly VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;
  private static readonly MAX_TITLE_LENGTH = 100;
  private static readonly MAX_MESSAGE_LENGTH = 1000;

  /**
   * Renders a notification template with variables
   *
   * @param template - Template to render
   * @param variables - Variables to substitute
   * @returns Rendered notification
   *
   * @example
   * ```typescript
   * const template = NotificationTemplates.getTemplate('workflow-completed');
   * const rendered = renderer.render(template, {
   *   workflowName: 'My Workflow',
   *   duration: '2m 30s'
   * });
   * ```
   */
  render(template: NotificationTemplate, variables: Record<string, any> = {}): Notification {
    try {
      // Validate template
      this.validateTemplate(template);

      // Validate variables
      this.validateVariables(template, variables);

      // Render title and message
      const title = this.renderText(template.name, variables);
      const message = this.renderText(template.template, variables);

      // Create notification
      const notification: Notification = {
        id: this.generateId(),
        title: this.truncateText(title, this.MAX_TITLE_LENGTH),
        message: this.truncateText(message, this.MAX_MESSAGE_LENGTH),
        type: template.type,
        category: template.category,
        priority: template.defaultPriority,
        channels: template.channels,
        metadata: {
          ...template.metadata,
          templateId: template.id,
          renderedAt: new Date().toISOString(),
          variables: this.sanitizeVariables(variables)
        },
        createdAt: new Date(),
        status: 'pending'
      };

      return notification;
    } catch (error) {
      throw new Error(`Failed to render template ${template.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Renders text with variable substitution
   *
   * @param text - Text to render
   * @param variables - Variables to substitute
   * @returns Rendered text
   *
   * @example
   * ```typescript
   * const rendered = renderer.renderText('Hello {{name}}!', { name: 'World' });
   * // Returns: 'Hello World!'
   * ```
   */
  renderText(text: string, variables: Record<string, any> = {}): string {
    return text.replace(TemplateRenderer.VARIABLE_PATTERN, (match, variableName) => {
      const value = variables[variableName];

      if (value === undefined || value === null) {
        throw new Error(`Variable '${variableName}' is required but not provided`);
      }

      return String(value);
    });
  }

  /**
   * Validates a template
   *
   * @param template - Template to validate
   * @throws Error if template is invalid
   *
   * @example
   * ```typescript
   * renderer.validateTemplate(template);
   * ```
   */
  private validateTemplate(template: NotificationTemplate): void {
    if (!template.id) {
      throw new Error('Template ID is required');
    }

    if (!template.name) {
      throw new Error('Template name is required');
    }

    if (!template.template) {
      throw new Error('Template content is required');
    }

    if (!template.type) {
      throw new Error('Template type is required');
    }

    if (!template.category) {
      throw new Error('Template category is required');
    }

    if (!template.defaultPriority) {
      throw new Error('Template default priority is required');
    }

    if (!template.channels || template.channels.length === 0) {
      throw new Error('Template channels are required');
    }
  }

  /**
   * Validates variables against template requirements
   *
   * @param template - Template to validate against
   * @param variables - Variables to validate
   * @throws Error if variables are invalid
   *
   * @example
   * ```typescript
   * renderer.validateVariables(template, variables);
   * ```
   */
  private validateVariables(template: NotificationTemplate, variables: Record<string, any>): void {
    const requiredVariables = template.variables || [];
    const missingVariables: string[] = [];

    for (const variable of requiredVariables) {
      if (!(variable in variables) || variables[variable] === undefined || variables[variable] === null) {
        missingVariables.push(variable);
      }
    }

    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }
  }

  /**
   * Truncates text to specified length
   *
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text
   *
   * @example
   * ```typescript
   * const truncated = renderer.truncateText('Very long text...', 10);
   * // Returns: 'Very long...'
   * ```
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Sanitizes variables for storage
   *
   * @param variables - Variables to sanitize
   * @returns Sanitized variables
   *
   * @example
   * ```typescript
   * const sanitized = renderer.sanitizeVariables(variables);
   * ```
   */
  private sanitizeVariables(variables: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(variables)) {
      // Only include primitive values and simple objects
      if (this.isSerializable(value)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }

  /**
   * Checks if a value is serializable
   *
   * @param value - Value to check
   * @returns True if serializable
   *
   * @example
   * ```typescript
   * const isSerializable = renderer.isSerializable(value);
   * ```
   */
  private isSerializable(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.every(item => this.isSerializable(item));
    }

    if (typeof value === 'object') {
      try {
        JSON.stringify(value);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Generates a unique ID for notifications
   *
   * @returns Unique ID
   *
   * @example
   * ```typescript
   * const id = renderer.generateId();
   * ```
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
