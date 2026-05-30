/**
 * Notifications Manager
 * Centralized notification system for toast notifications and notification center
 * Version: 1.0.0
 */

(function() {
  'use strict';
  
  // Protection against multiple executions
  if (window.notificationsManagerInitialized) {
    return;
  }
  
  /**
   * Detects the current language from the URL
   */
  function detectLanguage() {
    const path = window.location.pathname;
    return path.startsWith('/en/') || path === '/en' ? 'en' : 'fr';
  }
  
  // Localized strings
  const STRINGS = {
    fr: {
      just_now: 'À l\'instant',
      minutes_ago: 'il y a {0}m',
      hours_ago: 'il y a {0}h'
    },
    en: {
      just_now: 'Just now',
      minutes_ago: '{0}m ago',
      hours_ago: '{0}h ago'
    }
  };
  
  // State
  let notifications = [];
  
  /**
   * Loads notifications from localStorage
   */
  function loadNotificationsFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings to Date objects
        notifications = parsed.map(notification => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
        
        // Clean up old notifications (older than 7 days)
        cleanupOldNotifications();
      }
    } catch (error) {
      console.warn('⚠️ Error loading notifications:', error);
      notifications = [];
    }
  }
  
  /**
   * Cleans up old notifications (older than 7 days)
   */
  function cleanupOldNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const originalLength = notifications.length;
    notifications = notifications.filter(notification => 
      new Date(notification.timestamp) > sevenDaysAgo
    );
    
    if (notifications.length !== originalLength) {
      saveNotificationsToStorage();
    }
  }
  
  /**
   * Saves notifications to localStorage
   */
  function saveNotificationsToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.warn('⚠️ Error saving notifications:', error);
    }
  }
  
  /**
   * Updates the notification badge
   */
  function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const mobileBadge = document.getElementById('mobile-notification-badge');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const updateBadge = (badgeElement) => {
      if (!badgeElement) return;
      
      if (unreadCount > 0) {
        badgeElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badgeElement.style.display = 'flex';
      } else {
        badgeElement.style.display = 'none';
      }
    };
    
    updateBadge(badge);
    updateBadge(mobileBadge);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('notificationBadgeUpdated', {
      detail: { unreadCount }
    }));
  }
  
  /**
   * Adds a new notification
   */
  function addNotification(title, message, type = 'info') {
    const notification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    notifications.unshift(notification);
    updateNotificationsList();
    updateNotificationBadge();
    
    // Limit stored notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }
    
    // Save to localStorage
    saveNotificationsToStorage();
    
    return notification;
  }
  
  /**
   * Updates the notifications list in the UI
   */
  function updateNotificationsList() {
    const notificationsList = document.getElementById('notifications-list');
    const mobileNotificationsList = document.getElementById('mobile-notifications-list');
    
    const htmlContent = notifications.length === 0
      ? '<div class="no-notifications">Aucune notification</div>'
      : notifications.map(notification => `
          <div class="notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon">${getNotificationTypeIcon(notification.type)}</div>
            <div class="notification-content">
              <div class="notification-title">${notification.title}</div>
              <div class="notification-message">${notification.message}</div>
              <div class="notification-time">${formatTime(notification.timestamp)}</div>
            </div>
            <button class="notification-close" onclick="event.stopPropagation(); window.NotificationsManager.removeNotification(${notification.id})">×</button>
          </div>
        `).join('');
    
    if (notificationsList) {
      notificationsList.innerHTML = htmlContent;
    }
    
    if (mobileNotificationsList) {
      mobileNotificationsList.innerHTML = htmlContent;
    }
  }
  
  /**
   * Returns the appropriate icon based on notification type
   */
  function getNotificationTypeIcon(type) {
    const icons = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'trophy': '🏆'
    };
    return icons[type] || icons['info'];
  }
  
  /**
   * Removes a notification
   */
  function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    updateNotificationsList();
    updateNotificationBadge();
    saveNotificationsToStorage();
  }
  
  /**
   * Clears all notifications
   */
  function clearAllNotifications() {
    notifications = [];
    updateNotificationsList();
    updateNotificationBadge();
    saveNotificationsToStorage();
  }
  
  /**
   * Marks all notifications as read
   */
  function markNotificationsAsRead() {
    notifications.forEach(notification => {
      notification.read = true;
    });
    updateNotificationBadge();
    saveNotificationsToStorage();
  }
  
  /**
   * Formats a timestamp
   */
  function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const lang = detectLanguage();
    const strings = STRINGS[lang];
    
    if (minutes < 1) return strings.just_now;
    if (minutes < 60) return strings.minutes_ago.replace('{0}', minutes);
    if (hours < 24) return strings.hours_ago.replace('{0}', hours);
    return date.toLocaleDateString();
  }
  
  /**
   * Shows a toast notification
   */
  function showNotification(message, type = 'info', options = {}) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      console.warn('⚠️ Toast container not found');
      return;
    }
    
    const toast = document.createElement('div');
    let toastClasses = `toast toast-${type}`;
    
    // Content structure based on avatar presence
    let toastContent;
    if (options.avatar) {
      toastClasses += ' personal with-shine';
      toastContent = `
        <div class="toast-avatar">
          <img src="${options.avatar}" alt="${options.avatarAlt || 'Avatar'}" />
        </div>
        <div class="toast-content">
          ${options.title ? `<div class="toast-title">${options.title}</div>` : ''}
          <div class="toast-text">${message}</div>
        </div>
      `;
    } else {
      toastContent = `<span class="toast-message">${message}</span>`;
    }
    
    toast.className = toastClasses;
    toast.innerHTML = `
      ${toastContent}
      <button class="toast-close" aria-label="Fermer">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Entry animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Auto-remove based on duration or default
    const duration = options.duration || 5000;
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
  
  /**
   * Removes a toast notification
   */
  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  /**
   * Gets all notifications
   */
  function getNotifications() {
    return [...notifications];
  }
  
  /**
   * Gets unread notification count
   */
  function getUnreadCount() {
    return notifications.filter(n => !n.read).length;
  }
  
  /**
   * Initializes the notification system
   */
  function init() {
    loadNotificationsFromStorage();
    updateNotificationsList();
    updateNotificationBadge();
    
    // Mark as initialized
    window.notificationsManagerInitialized = true;
    
    console.log('✅ Notifications Manager initialized');
  }
  
  // Public API
  const NotificationsManager = {
    addNotification,
    removeNotification,
    clearAllNotifications,
    showNotification,
    markNotificationsAsRead,
    updateNotificationsList,
    updateNotificationBadge,
    getNotifications,
    getUnreadCount
  };
  
  // Expose globally
  window.NotificationsManager = NotificationsManager;
  
  // Backward compatibility - expose individual functions
  window.addNotification = addNotification;
  window.removeNotification = removeNotification;
  window.showNotification = showNotification;
  window.clearAllNotifications = clearAllNotifications;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
