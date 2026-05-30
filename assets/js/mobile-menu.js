/**
 * Mobile Menu - Hamburger menu for top dock on mobile devices
 * Handles opening/closing of mobile navigation menu
 */

(function() {
  'use strict';
  
  // DOM elements
  let menuToggle = null;
  let menuDropdown = null;
  let menuOverlay = null;
  let isOpen = false;
  
  // View management
  let mainView = null;
  let notificationsView = null;
  let currentView = 'main';
  
  /**
   * Initialize mobile menu
   */
  function init() {
    menuToggle = document.getElementById('mobile-menu-toggle');
    menuDropdown = document.getElementById('mobile-menu-dropdown');
    menuOverlay = document.getElementById('mobile-menu-overlay');
    mainView = document.getElementById('mobile-menu-main-view');
    notificationsView = document.getElementById('mobile-menu-notifications-view');
    
    if (!menuToggle || !menuDropdown || !menuOverlay) {
      return; // Elements not found, exit silently
    }
    
    // Attach event listeners
    menuToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    // Close menu on escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    // Notifications view navigation
    const showNotificationsBtn = document.getElementById('mobile-show-notifications-btn');
    const notificationsBackBtn = document.getElementById('mobile-notifications-back-btn');
    const clearAllBtn = document.getElementById('mobile-clear-all-btn');
    
    if (showNotificationsBtn) {
      showNotificationsBtn.addEventListener('click', showNotificationsView);
    }
    
    if (notificationsBackBtn) {
      notificationsBackBtn.addEventListener('click', showMainView);
    }
    
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', clearAllMobileNotifications);
    }
    
    // Theme toggle
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle-btn');
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const desktopThemeToggle = document.querySelector('.right-dock .theme-toggle');
        if (desktopThemeToggle) {
          desktopThemeToggle.click();
        }
      });
    }
    
    // Close menu when clicking on a link (except for buttons that open modals)
    const menuLinks = menuDropdown.querySelectorAll('.mobile-menu-item[href]');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Small delay to allow navigation to start
        setTimeout(closeMenu, 100);
      });
    });
    
    // Handle window resize - close menu if switching to desktop
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth > 768 && isOpen) {
          closeMenu();
        }
      }, 100);
    });
    
    // Sync trophy count and notification badges
    syncBadges();
    
    // Listen for custom event from right-dock when notification badge is updated
    window.addEventListener('notificationBadgeUpdated', syncBadges);
    
    // Watch for changes in trophy count
    const trophyCountObserver = new MutationObserver(syncBadges);
    const trophyCountEl = document.getElementById('trophy-count');
    if (trophyCountEl) {
      trophyCountObserver.observe(trophyCountEl, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
    
    // Watch for changes in notification badge
    const notificationBadgeObserver = new MutationObserver(syncBadges);
    const notificationBadgeEl = document.getElementById('notification-badge');
    if (notificationBadgeEl) {
      notificationBadgeObserver.observe(notificationBadgeEl, {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }
  }
  
  /**
   * Sync trophy count and notification badges between desktop and mobile
   */
  function syncBadges() {
    // Sync trophy count
    const desktopTrophyCount = document.getElementById('trophy-count');
    const mobileTrophyCount = document.getElementById('mobile-trophy-count');
    if (desktopTrophyCount && mobileTrophyCount) {
      mobileTrophyCount.textContent = desktopTrophyCount.textContent;
    }
    
    // Sync notification badge - both in menu and on hamburger button
    const desktopNotificationBadge = document.getElementById('notification-badge');
    const mobileNotificationBadge = document.getElementById('mobile-notification-badge');
    const mobileMenuNotificationBadge = document.getElementById('mobile-menu-notification-badge');
    
    if (desktopNotificationBadge) {
      const isVisible = desktopNotificationBadge.style.display !== 'none';
      const badgeText = desktopNotificationBadge.textContent;
      
      // Sync the badge inside the menu
      if (mobileNotificationBadge) {
        mobileNotificationBadge.style.display = isVisible ? 'inline-block' : 'none';
        mobileNotificationBadge.textContent = badgeText;
      }
      
      // Sync the badge on the hamburger button
      if (mobileMenuNotificationBadge) {
        mobileMenuNotificationBadge.style.display = isVisible ? 'flex' : 'none';
        mobileMenuNotificationBadge.textContent = badgeText;
      }
    }
  }
  
  /**
   * Toggle menu open/closed
   */
  function toggleMenu(event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  /**
   * Open menu
   */
  function openMenu() {
    isOpen = true;
    menuToggle.classList.add('is-open');
    menuDropdown.classList.add('is-open');
    menuOverlay.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fermer le menu');
    
    // Hide notification badge when menu is open
    const mobileMenuNotificationBadge = document.getElementById('mobile-menu-notification-badge');
    if (mobileMenuNotificationBadge) {
      mobileMenuNotificationBadge.style.opacity = '0';
      mobileMenuNotificationBadge.style.pointerEvents = 'none';
    }
    
    // Prevent body scroll when menu is open
    document.body.classList.add('mobile-menu-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close menu
   */
  function closeMenu() {
    isOpen = false;
    menuToggle.classList.remove('is-open');
    menuDropdown.classList.remove('is-open');
    menuOverlay.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    
    // Show notification badge when menu is closed
    const mobileMenuNotificationBadge = document.getElementById('mobile-menu-notification-badge');
    const desktopNotificationBadge = document.getElementById('notification-badge');
    if (mobileMenuNotificationBadge && desktopNotificationBadge) {
      const shouldShow = desktopNotificationBadge.style.display !== 'none';
      if (shouldShow) {
        mobileMenuNotificationBadge.style.opacity = '1';
        mobileMenuNotificationBadge.style.pointerEvents = 'none';
      }
    }
    
    // Restore body scroll
    document.body.classList.remove('mobile-menu-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Reset to main view when closing
    setTimeout(() => {
      if (currentView !== 'main') {
        showMainView();
      }
    }, 300); // Wait for close animation
  }
  
  /**
   * Handle clicks outside menu to close it
   */
  function handleClickOutside(event) {
    if (!isOpen) return;
    
    // Check if click is outside both toggle button and dropdown
    if (!menuToggle.contains(event.target) && !menuDropdown.contains(event.target)) {
      closeMenu();
    }
  }
  
  /**
   * Handle escape key to close menu
   */
  function handleEscapeKey(event) {
    if (event.key === 'Escape' && isOpen) {
      if (currentView === 'notifications') {
        showMainView();
      } else {
        closeMenu();
        menuToggle.focus(); // Return focus to toggle button
      }
    }
  }
  
  /**
   * Show notifications view
   */
  function showNotificationsView() {
    if (!mainView || !notificationsView) return;
    
    currentView = 'notifications';
    mainView.style.display = 'none';
    notificationsView.style.display = 'block';
    
    // Load notifications content
    loadNotifications();
  }
  
  /**
   * Show main menu view
   */
  function showMainView() {
    if (!mainView || !notificationsView) return;
    
    currentView = 'main';
    notificationsView.style.display = 'none';
    mainView.style.display = 'block';
  }
  
  /**
   * Load notifications from desktop notification panel
   */
  function loadNotifications() {
    const desktopNotificationsList = document.getElementById('notifications-list');
    const mobileContent = document.getElementById('mobile-notifications-content');
    const clearAllBtn = document.getElementById('mobile-clear-all-btn');
    
    if (!mobileContent) return;
    
    if (!desktopNotificationsList) {
      // No notifications list found, show empty state
      mobileContent.innerHTML = `
        <div class="mobile-notifications-empty">
          <div class="empty-state-icon">🔔</div>
          <p class="empty-state-text">Aucune notification pour le moment</p>
        </div>
      `;
      if (clearAllBtn) clearAllBtn.style.display = 'none';
      return;
    }
    
    // Get notification items from desktop list
    const notificationItems = desktopNotificationsList.querySelectorAll('.notification-item');
    
    if (notificationItems.length === 0) {
      mobileContent.innerHTML = `
        <div class="mobile-notifications-empty">
          <div class="empty-state-icon">🔔</div>
          <p class="empty-state-text">Aucune notification pour le moment</p>
        </div>
      `;
      if (clearAllBtn) clearAllBtn.style.display = 'none';
    } else {
      let notificationsHtml = '<div class="mobile-notifications-list">';
      
      notificationItems.forEach(item => {
        const clone = item.cloneNode(true);
        notificationsHtml += clone.outerHTML;
      });
      
      notificationsHtml += '</div>';
      mobileContent.innerHTML = notificationsHtml;
      
      // Show clear all button when there are notifications
      if (clearAllBtn) clearAllBtn.style.display = 'flex';
      
      // Add event listeners to close buttons
      setupNotificationCloseButtons();
    }
  }
  
  /**
   * Setup event listeners for notification close buttons in mobile view
   */
  function setupNotificationCloseButtons() {
    const mobileContent = document.getElementById('mobile-notifications-content');
    if (!mobileContent) return;
    
    const closeButtons = mobileContent.querySelectorAll('.notification-close');
    closeButtons.forEach(button => {
      // Remove inline onclick to prevent conflicts
      button.removeAttribute('onclick');
      
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        const notificationItem = this.closest('.notification-item');
        const notificationId = notificationItem ? notificationItem.dataset.id : null;
        
        if (notificationId) {
          // Call the global removeNotification function if it exists
          if (typeof window.removeNotification === 'function') {
            window.removeNotification(parseInt(notificationId));
          }
          
          // Remove from mobile view immediately
          notificationItem.style.transform = 'translateX(100%)';
          notificationItem.style.opacity = '0';
          setTimeout(() => {
            notificationItem.remove();
            
            // Check if there are any notifications left
            const remainingNotifications = mobileContent.querySelectorAll('.notification-item');
            if (remainingNotifications.length === 0) {
              showEmptyState();
            }
          }, 300);
        }
      });
    });
  }
  
  /**
   * Clear all notifications from mobile view
   */
  function clearAllMobileNotifications() {
    const mobileContent = document.getElementById('mobile-notifications-content');
    if (!mobileContent) return;
    
    const notificationItems = mobileContent.querySelectorAll('.notification-item');
    
    // Call the global clearAllNotifications function to actually clear from storage
    if (typeof window.rightDockManager !== 'undefined' && typeof window.rightDockManager.clearAllNotifications === 'function') {
      window.rightDockManager.clearAllNotifications();
    } else if (typeof window.clearAllNotifications === 'function') {
      window.clearAllNotifications();
    }
    
    // Animate all notifications out
    notificationItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.transform = 'translateX(100%)';
        item.style.opacity = '0';
      }, index * 50); // Stagger the animation
    });
    
    // Show empty state after all animations complete
    setTimeout(() => {
      showEmptyState();
      // Sync badges after clearing
      syncBadges();
    }, notificationItems.length * 50 + 300);
  }
  
  /**
   * Show empty state in notifications view
   */
  function showEmptyState() {
    const mobileContent = document.getElementById('mobile-notifications-content');
    const clearAllBtn = document.getElementById('mobile-clear-all-btn');
    
    if (mobileContent) {
      mobileContent.innerHTML = `
        <div class="mobile-notifications-empty">
          <div class="empty-state-icon">🔔</div>
          <p class="empty-state-text">Aucune notification pour le moment</p>
        </div>
      `;
    }
    
    if (clearAllBtn) {
      clearAllBtn.style.display = 'none';
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
