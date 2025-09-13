/**
 * Email Notification Channel
 *
 * Handles notification delivery via email with HTML templates,
 * attachments, and delivery tracking.
 *
 * @since 2.0.0
 * @author TappMCP Team
 */

import { EventEmitter } from 'events';
import { NotificationMessage, NotificationDelivery, NotificationChannel, Notification } from '../types.js';

/**
 * Email Notification Channel
 *
 * @example
 * ```typescript
 * const channel = new EmailChannel();
 * await channel.send(notification, delivery);
 * ```
 *
 * @since 2.0.0
 */
export class EmailChannel extends EventEmitter {
  private isConfigured = false;
  private smtpConfig: any = null;

  constructor() {
    super();
  }

  /**
   * Configures the email channel
   *
   * @param config - SMTP configuration
   *
   * @example
   * ```typescript
   * channel.configure({
   *   host: 'smtp.gmail.com',
   *   port: 587,
   *   secure: false,
   *   auth: { user: 'user@example.com', pass: 'password' }
   * });
   * ```
   */
  configure(config: any): void {
    this.smtpConfig = config;
    this.isConfigured = true;
    this.emit('channel:configured');
  }

  /**
   * Sends a notification via email
   *
   * @param notification - Notification to send
   * @param delivery - Delivery configuration (optional)
   * @returns Promise resolving when sent
   *
   * @example
   * ```typescript
   * await channel.send(notification, delivery);
   * ```
   */
  async send(notification: NotificationMessage | Notification, delivery?: NotificationDelivery): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Email channel not configured');
    }

    try {
      // Get user email from delivery metadata
      const userEmail = delivery.metadata?.email || notification.data?.email;
      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Prepare email content
      const emailContent = this.prepareEmailContent(notification);

      // Send email (in a real implementation, this would use nodemailer)
      await this.sendEmail({
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        attachments: emailContent.attachments
      });

      // Update delivery status
      delivery.status = 'delivered';
      delivery.deliveredAt = Date.now();

      this.emit('notification:sent', { notification, delivery });
    } catch (error) {
      delivery.status = 'failed';
      delivery.error = error instanceof Error ? error.message : 'Unknown error';
      delivery.attempts++;

      this.emit('notification:failed', { notification, delivery, error });
      throw error;
    }
  }

  /**
   * Gets the channel type
   *
   * @returns Channel type
   */
  getChannelType(): NotificationChannel {
    return 'email';
  }

  /**
   * Checks if the channel is available
   *
   * @returns True if available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Gets channel statistics
   *
   * @returns Channel statistics
   */
  getStats(): {
    isConfigured: boolean;
    lastSent?: number;
    totalSent: number;
  } {
    return {
      isConfigured: this.isConfigured,
      totalSent: 0 // This would be tracked in a real implementation
    };
  }

  /**
   * Stops the email channel
   *
   * @returns Promise resolving when stopped
   */
  async stop(): Promise<void> {
    this.isConfigured = false;
    this.smtpConfig = null;
    this.emit('channel:stopped');
  }

  private prepareEmailContent(notification: NotificationMessage): {
    subject: string;
    html: string;
    text: string;
    attachments?: any[];
  } {
    const priorityEmoji = this.getPriorityEmoji(notification.priority);
    const categoryEmoji = this.getCategoryEmoji(notification.category);

    const subject = `${priorityEmoji} ${notification.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .priority-critical { background: #dc3545; color: white; }
            .priority-high { background: #fd7e14; color: white; }
            .priority-medium { background: #ffc107; color: #212529; }
            .priority-low { background: #6c757d; color: white; }
            .message { margin: 20px 0; line-height: 1.6; color: #333; }
            .actions { margin: 20px 0; }
            .action-button { display: inline-block; padding: 10px 20px; margin: 5px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
            .metadata { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${categoryEmoji} TappMCP Notification</h1>
              <span class="priority priority-${notification.priority}">${notification.priority}</span>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <div class="message">${this.formatMessage(notification.message)}</div>
              ${notification.actions ? this.renderActions(notification.actions) : ''}
              <div class="metadata">
                <p>Notification ID: ${notification.id}</p>
                <p>Category: ${notification.category}</p>
                <p>Source: ${notification.source}</p>
                <p>Time: ${new Date(notification.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div class="footer">
              <p>This notification was sent by TappMCP</p>
              <p>If you no longer wish to receive these notifications, please update your preferences.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
TappMCP Notification
===================

${notification.title}

${notification.message}

Priority: ${notification.priority}
Category: ${notification.category}
Source: ${notification.source}
Time: ${new Date(notification.timestamp).toLocaleString()}

Notification ID: ${notification.id}

---
This notification was sent by TappMCP
    `;

    return { subject, html, text };
  }

  private getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': 'ℹ️',
      'low': '📢'
    };
    return emojis[priority] || '📢';
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      'workflow': '🔄',
      'system': '⚙️',
      'performance': '📊',
      'security': '🔒',
      'user': '👤',
      'business': '💼'
    };
    return emojis[category] || '📢';
  }

  private formatMessage(message: string): string {
    return message
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  private renderActions(actions: any[]): string {
    if (!actions || actions.length === 0) return '';

    const actionButtons = actions.map(action =>
      `<a href="#" class="action-button" data-action="${action.action}">${action.label}</a>`
    ).join('');

    return `<div class="actions">${actionButtons}</div>`;
  }

  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments?: any[];
  }): Promise<void> {
    // In a real implementation, this would use nodemailer
    console.log('Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      textLength: emailData.text.length
    });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
