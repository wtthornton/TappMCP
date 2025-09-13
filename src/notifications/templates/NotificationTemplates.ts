/**
 * Notification Templates
 *
 * Predefined notification templates for common TappMCP scenarios
 * with variable substitution and formatting.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { NotificationTemplate, NotificationType, NotificationPriority, NotificationCategory } from '../types.js';

/**
 * Notification Templates Manager
 *
 * @example
 * ```typescript
 * const templates = NotificationTemplates.getTemplates();
 * const template = NotificationTemplates.getTemplate('workflow-completed');
 * ```
 *
 * @since 2.0.0
 */
export class NotificationTemplates {
  private static templates: Map<string, NotificationTemplate> = new Map();

  static {
    this.initializeTemplates();
  }

  /**
   * Gets all available templates
   *
   * @returns Array of all templates
   *
   * @example
   * ```typescript
   * const templates = NotificationTemplates.getTemplates();
   * ```
   */
  static getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Gets a specific template by ID
   *
   * @param id - Template ID
   * @returns Template or undefined if not found
   *
   * @example
   * ```typescript
   * const template = NotificationTemplates.getTemplate('workflow-completed');
   * ```
   */
  static getTemplate(id: string): NotificationTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Gets templates by category
   *
   * @param category - Category to filter by
   * @returns Array of templates in category
   *
   * @example
   * ```typescript
   * const workflowTemplates = NotificationTemplates.getTemplatesByCategory('workflow');
   * ```
   */
  static getTemplatesByCategory(category: NotificationCategory): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  /**
   * Gets templates by type
   *
   * @param type - Type to filter by
   * @returns Array of templates of type
   *
   * @example
   * ```typescript
   * const successTemplates = NotificationTemplates.getTemplatesByType('success');
   * ```
   */
  static getTemplatesByType(type: NotificationType): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }

  /**
   * Adds a custom template
   *
   * @param template - Template to add
   *
   * @example
   * ```typescript
   * NotificationTemplates.addTemplate(customTemplate);
   * ```
   */
  static addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Removes a template
   *
   * @param id - Template ID to remove
   *
   * @example
   * ```typescript
   * NotificationTemplates.removeTemplate('custom-template');
   * ```
   */
  static removeTemplate(id: string): void {
    this.templates.delete(id);
  }

  private static initializeTemplates(): void {
    // Workflow Templates
    this.addTemplate({
      id: 'workflow-started',
      name: 'Workflow Started',
      type: 'info',
      category: 'workflow',
      template: '🔄 Workflow Started\nWorkflow "{{workflowName}}" has been started and is now running.',
      variables: ['workflowName'],
      defaultPriority: 'medium',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '🔄', color: '#007bff' }
    });

    this.addTemplate({
      id: 'workflow-completed',
      name: 'Workflow Completed',
      type: 'success',
      category: 'workflow',
      template: '✅ Workflow Completed\nWorkflow "{{workflowName}}" has been completed successfully in {{duration}}.',
      variables: ['workflowName', 'duration'],
      defaultPriority: 'high',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '✅', color: '#28a745' }
    });

    this.addTemplate({
      id: 'workflow-failed',
      name: 'Workflow Failed',
      type: 'error',
      category: 'workflow',
      template: '❌ Workflow Failed\nWorkflow "{{workflowName}}" has failed with error: {{error}}',
      variables: ['workflowName', 'error'],
      defaultPriority: 'critical',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '❌', color: '#dc3545' }
    });

    this.addTemplate({
      id: 'workflow-paused',
      name: 'Workflow Paused',
      type: 'warning',
      category: 'workflow',
      template: '⏸️ Workflow Paused\nWorkflow "{{workflowName}}" has been paused. Reason: {{reason}}',
      variables: ['workflowName', 'reason'],
      defaultPriority: 'medium',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '⏸️', color: '#ffc107' }
    });

    // System Templates
    this.addTemplate({
      id: 'system-maintenance',
      name: 'System Maintenance',
      type: 'info',
      category: 'system',
      template: '🔧 System Maintenance\nScheduled maintenance will begin at {{startTime}} and is expected to last {{duration}}.',
      variables: ['startTime', 'duration'],
      defaultPriority: 'high',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '🔧', color: '#6c757d' }
    });

    this.addTemplate({
      id: 'system-error',
      name: 'System Error',
      type: 'error',
      category: 'system',
      template: '🚨 System Error\nA system error has occurred: {{error}}. Our team has been notified.',
      variables: ['error'],
      defaultPriority: 'critical',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '🚨', color: '#dc3545' }
    });

    this.addTemplate({
      id: 'system-recovery',
      name: 'System Recovery',
      type: 'success',
      category: 'system',
      template: '✅ System Recovery\nThe system has recovered from the previous error and is now operational.',
      variables: [],
      defaultPriority: 'high',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '✅', color: '#28a745' }
    });

    // Performance Templates
    this.addTemplate({
      id: 'performance-alert',
      name: 'Performance Alert',
      type: 'warning',
      category: 'performance',
      template: '⚠️ Performance Alert\n{{metric}} is {{value}} which exceeds the threshold of {{threshold}}.',
      variables: ['metric', 'value', 'threshold'],
      defaultPriority: 'medium',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '⚠️', color: '#ffc107' }
    });

    this.addTemplate({
      id: 'performance-critical',
      name: 'Performance Critical',
      type: 'error',
      category: 'performance',
      template: '🚨 Performance Critical\n{{metric}} is {{value}} which is critically high. Immediate attention required.',
      variables: ['metric', 'value'],
      defaultPriority: 'critical',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '🚨', color: '#dc3545' }
    });

    this.addTemplate({
      id: 'performance-recovered',
      name: 'Performance Recovered',
      type: 'success',
      category: 'performance',
      template: '✅ Performance Recovered\n{{metric}} has returned to normal levels.',
      variables: ['metric'],
      defaultPriority: 'low',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '✅', color: '#28a745' }
    });

    // Security Templates
    this.addTemplate({
      id: 'security-alert',
      name: 'Security Alert',
      type: 'error',
      category: 'security',
      template: '🔒 Security Alert\n{{alertType}} detected: {{description}}. Please review immediately.',
      variables: ['alertType', 'description'],
      defaultPriority: 'critical',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '🔒', color: '#dc3545' }
    });

    this.addTemplate({
      id: 'security-scan-completed',
      name: 'Security Scan Completed',
      type: 'info',
      category: 'security',
      template: '🔒 Security Scan Completed\nSecurity scan completed. {{vulnerabilities}} vulnerabilities found.',
      variables: ['vulnerabilities'],
      defaultPriority: 'medium',
      channels: ['websocket', 'email', 'in_app'],
      metadata: { icon: '🔒', color: '#17a2b8' }
    });

    // User Templates
    this.addTemplate({
      id: 'user-welcome',
      name: 'User Welcome',
      type: 'success',
      category: 'user',
      template: '👋 Welcome to TappMCP!\nWelcome {{userName}}! Your account has been set up successfully.',
      variables: ['userName'],
      defaultPriority: 'medium',
      channels: ['email', 'in_app'],
      metadata: { icon: '👋', color: '#28a745' }
    });

    this.addTemplate({
      id: 'user-preference-updated',
      name: 'User Preference Updated',
      type: 'info',
      category: 'user',
      template: '⚙️ Preferences Updated\nYour {{preferenceType}} preferences have been updated successfully.',
      variables: ['preferenceType'],
      defaultPriority: 'low',
      channels: ['in_app'],
      metadata: { icon: '⚙️', color: '#17a2b8' }
    });

    // Business Templates
    this.addTemplate({
      id: 'business-milestone',
      name: 'Business Milestone',
      type: 'success',
      category: 'business',
      template: '🎯 Milestone Achieved\n{{milestoneName}} has been achieved! {{description}}',
      variables: ['milestoneName', 'description'],
      defaultPriority: 'high',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '🎯', color: '#28a745' }
    });

    this.addTemplate({
      id: 'business-alert',
      name: 'Business Alert',
      type: 'warning',
      category: 'business',
      template: '📊 Business Alert\n{{alertType}}: {{message}}. Please review the business impact.',
      variables: ['alertType', 'message'],
      defaultPriority: 'high',
      channels: ['websocket', 'email', 'in_app'],
      metadata: { icon: '📊', color: '#ffc107' }
    });

    // Custom Templates
    this.addTemplate({
      id: 'custom-info',
      name: 'Custom Information',
      type: 'info',
      category: 'user',
      template: 'ℹ️ {{title}}\n{{message}}',
      variables: ['title', 'message'],
      defaultPriority: 'medium',
      channels: ['websocket', 'in_app'],
      metadata: { icon: 'ℹ️', color: '#17a2b8' }
    });

    this.addTemplate({
      id: 'custom-success',
      name: 'Custom Success',
      type: 'success',
      category: 'user',
      template: '✅ {{title}}\n{{message}}',
      variables: ['title', 'message'],
      defaultPriority: 'medium',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '✅', color: '#28a745' }
    });

    this.addTemplate({
      id: 'custom-warning',
      name: 'Custom Warning',
      type: 'warning',
      category: 'user',
      template: '⚠️ {{title}}\n{{message}}',
      variables: ['title', 'message'],
      defaultPriority: 'high',
      channels: ['websocket', 'in_app'],
      metadata: { icon: '⚠️', color: '#ffc107' }
    });

    this.addTemplate({
      id: 'custom-error',
      name: 'Custom Error',
      type: 'error',
      category: 'user',
      template: '❌ {{title}}\n{{message}}',
      variables: ['title', 'message'],
      defaultPriority: 'critical',
      channels: ['websocket', 'email', 'push', 'in_app'],
      metadata: { icon: '❌', color: '#dc3545' }
    });
  }
}
