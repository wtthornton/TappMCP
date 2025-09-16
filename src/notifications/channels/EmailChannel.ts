/**
 * Email Notification Channel
 *
 * Handles sending notifications via email using SMTP
 */

import nodemailer from 'nodemailer';
import { NotificationMessage, NotificationChannel } from '../types.js';

export interface EmailConfig {
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  templates: {
    [key: string]: string;
  };
}

export class EmailChannel {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;
  private isConfigured = false;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.config.enabled) {
      console.log('📧 Email notifications disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.auth,
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('📧 Email configuration error:', error.message);
          this.isConfigured = false;
        } else {
          console.log('📧 Email notifications configured successfully');
          this.isConfigured = true;
        }
      });
    } catch (error) {
      console.error('📧 Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async send(notification: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('📧 Email channel not configured, skipping notification');
      return false;
    }

    try {
      const template = this.getTemplate(notification.type);
      const htmlContent = this.renderTemplate(template, notification);

      const mailOptions = {
        from: this.config.from,
        to: notification.userId || 'admin@tappmcp.local',
        subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
        html: htmlContent,
        text: notification.message,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('📧 Failed to send email:', error);
      return false;
    }
  }

  private getTemplate(type: string): string {
    return (
      this.config.templates[type] || this.config.templates.default || this.getDefaultTemplate()
    );
  }

  private renderTemplate(template: string, notification: NotificationMessage): string {
    return template
      .replace(/\{\{title\}\}/g, notification.title)
      .replace(/\{\{message\}\}/g, notification.message)
      .replace(/\{\{priority\}\}/g, notification.priority)
      .replace(/\{\{type\}\}/g, notification.type)
      .replace(/\{\{timestamp\}\}/g, new Date(notification.createdAt).toLocaleString())
      .replace(/\{\{channel\}\}/g, notification.channel);
  }

  private getDefaultTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{title}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .priority.critical { background: #ffebee; color: #c62828; }
          .priority.high { background: #fff3e0; color: #ef6c00; }
          .priority.medium { background: #e3f2fd; color: #1976d2; }
          .priority.low { background: #f3e5f5; color: #7b1fa2; }
          .content { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>{{title}}</h2>
            <span class="priority {{priority}}">{{priority.toUpperCase()}}</span>
          </div>
          <div class="content">
            <p>{{message}}</p>
            <p><strong>Type:</strong> {{type}}<br>
            <strong>Channel:</strong> {{channel}}<br>
            <strong>Time:</strong> {{timestamp}}</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from TappMCP System.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  getChannelName(): string {
    return 'email';
  }
}
