/**
 * NotificationManager - Handles notifications and alerts
 * Manages toast notifications, alerts, and user feedback
 */

export class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.setupContainer();
  }

  setupContainer() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(this.container);
  }

  showSuccess(title, message, duration = 5000) {
    this.showNotification('success', title, message, duration);
  }

  showError(title, message, duration = 7000) {
    this.showNotification('error', title, message, duration);
  }

  showWarning(title, message, duration = 6000) {
    this.showNotification('warning', title, message, duration);
  }

  showInfo(title, message, duration = 5000) {
    this.showNotification('info', title, message, duration);
  }

  showNotification(type, title, message, duration) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    this.notifications.push(notification);
    this.renderNotification(notification);
    this.updateNotificationCount();

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, duration);
  }

  renderNotification(notification) {
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification notification-${notification.type}`;
    notificationEl.style.cssText = `
      background: ${this.getBackgroundColor(notification.type)};
      border: 1px solid ${this.getBorderColor(notification.type)};
      border-radius: 8px;
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    notificationEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <h4 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600;">
          ${notification.title}
        </h4>
        <button onclick="this.closest('.notification').remove()" style="
          background: none;
          border: none;
          color: #b0b0b0;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        ">×</button>
      </div>
      <p style="margin: 0; color: #b0b0b0; font-size: 13px; line-height: 1.4;">
        ${notification.message}
      </p>
    `;

    this.container.appendChild(notificationEl);

    // Animate in
    setTimeout(() => {
      notificationEl.style.transform = 'translateX(0)';
    }, 10);
  }

  removeNotification(id) {
    const notificationEl = this.container.querySelector(`[data-id="${id}"]`);
    if (notificationEl) {
      notificationEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notificationEl.parentNode) {
          notificationEl.parentNode.removeChild(notificationEl);
        }
      }, 300);
    }

    this.notifications = this.notifications.filter(n => n.id !== id);
    this.updateNotificationCount();
  }

  updateNotificationCount() {
    const countEl = document.getElementById('notificationCount');
    if (countEl) {
      countEl.textContent = this.notifications.length;
    }
  }

  getBackgroundColor(type) {
    switch (type) {
      case 'success': return '#00ff8820';
      case 'error': return '#ff444420';
      case 'warning': return '#ffaa0020';
      case 'info': return '#4facfe20';
      default: return '#2a2a2a';
    }
  }

  getBorderColor(type) {
    switch (type) {
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'info': return '#4facfe';
      default: return '#2a2a2a';
    }
  }

  clearAll() {
    this.notifications = [];
    this.container.innerHTML = '';
    this.updateNotificationCount();
  }

  getNotifications() {
    return this.notifications;
  }
}
