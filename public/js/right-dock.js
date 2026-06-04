/**
 * Right Dock Navigation - Gestion des interactions
 * Version: 2.0.0
 * Now uses NotificationsManager for notification logic
 */

(function() {
  'use strict';
  
  // Protection contre les exécutions multiples
  if (window.rightDockInitialized) {
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
      trophy_unlocked: 'Trophée débloqué !'
    },
    en: {
      trophy_unlocked: 'Trophy Unlocked!'
    }
  };
  
  function getString(key) {
    const lang = detectLanguage();
    return STRINGS[lang][key] || STRINGS['fr'][key];
  }
  
  // Variables globales
  let isReducedMotion = false;
  let rightDock = null;
  let languageBtn = null;
  let languageDropdown = null;
  let themeToggle = null;
  let notificationsBtn = null;
  let notificationsDropdown = null;
  let trophiesBtn = null;
  let currentTheme = 'dark';
  
  /**
   * Performance optimization: Apply will-change only during animations
   * This prevents excessive GPU memory consumption (budget exceeded warning)
   */
  function optimizeWillChange(element, properties) {
    if (!element) return;
    
    // Apply will-change before animation
    element.style.willChange = properties;
    
    // Remove will-change after animation completes
    // Use a timeout matching the longest transition duration
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 300);
  }
  
  /**
   * Add will-change optimization to elements with hover/active states
   */
  function setupWillChangeOptimization() {
    // Dock buttons
    const dockButtons = document.querySelectorAll('.dock-button, .right-dock .dock-button');
    dockButtons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        optimizeWillChange(this, 'transform');
      });
      
      button.addEventListener('focus', function() {
        optimizeWillChange(this, 'transform');
      });
    });
    
    // Modal content
    const modalContents = document.querySelectorAll('.unified-modal-content');
    modalContents.forEach(content => {
      const modal = content.closest('.unified-modal');
      if (modal) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              if (modal.classList.contains('active')) {
                optimizeWillChange(content, 'transform, opacity');
              }
            }
          });
        });
        
        observer.observe(modal, { attributes: true });
      }
    });
    
    // Dropdown backdrops
    const backdrops = document.querySelectorAll('.skill-modal-backdrop, .person-modal-backdrop');
    backdrops.forEach(backdrop => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
            if (backdrop.style.display !== 'none') {
              optimizeWillChange(backdrop, 'opacity');
            }
          }
        });
      });
      
      observer.observe(backdrop, { attributes: true });
    });
  }
  
  /**
   * Détecte si l'utilisateur préfère les animations réduites
   */
  function detectReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = mediaQuery.matches;
    
    // Écoute les changements de préférence
    mediaQuery.addEventListener('change', function(e) {
      isReducedMotion = e.matches;
      updateAnimationDuration();
    });
  }
  
  /**
   * Met à jour la durée des animations selon les préférences
   */
  function updateAnimationDuration() {
    const duration = isReducedMotion ? '50ms' : '150ms';
    document.documentElement.style.setProperty('--right-dock-transition', `${duration} ease-out`);
  }
  
  /**
   * Gère l'ouverture/fermeture du dropdown de langue
   */
  function toggleLanguageDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!languageBtn || !languageDropdown) {
      console.error('❌ Missing elements for language dropdown');
      return;
    }
    
    const isActive = languageBtn.classList.contains('active');
    
    if (isActive) {
      closeLanguageDropdown();
    } else {
      openLanguageDropdown();
    }
  }
  
  /**
   * Ouvre le dropdown de langue
   */
  function openLanguageDropdown() {
    languageBtn.classList.add('active');
    languageDropdown.classList.add('active');
    
    // Ajouter l'event listener pour fermer en cliquant ailleurs
    setTimeout(() => {
      document.addEventListener('click', closeLanguageDropdownOutside);
    }, 0);
  }
  
  /**
   * Ferme le dropdown de langue
   */
  function closeLanguageDropdown() {
    languageBtn.classList.remove('active');
    languageDropdown.classList.remove('active');
    
    // Retirer l'event listener
    document.removeEventListener('click', closeLanguageDropdownOutside);
  }
  
  /**
   * Ferme le dropdown si on clique en dehors
   */
  function closeLanguageDropdownOutside(event) {
    if (!languageBtn.contains(event.target) && !languageDropdown.contains(event.target)) {
      closeLanguageDropdown();
    }
  }
  
  /**
   * Gère la sélection d'une langue
   */
  function handleLanguageSelection(event) {
    event.preventDefault();
    
    const selectedOption = event.target.closest('.language-option');
    if (!selectedOption) return;
    const selectedText = selectedOption.querySelector('span:last-child').textContent;
    const selectedFlag = selectedOption.querySelector('.flag').textContent;
    
    // Mise à jour du bouton
    updateLanguageButton(selectedText, selectedFlag);
    
    // Marquer l'option comme active
    const allOptions = languageDropdown.querySelectorAll('.language-option');
    allOptions.forEach(option => option.classList.remove('active'));
    selectedOption.classList.add('active');
    
    // Fermer le dropdown
    closeLanguageDropdown();
    
    // Redirection vers la page dans la nouvelle langue
    window.location.href = selectedOption.href;
  }
  
  /**
   * Met à jour le bouton de langue
   */
  function updateLanguageButton(text, flag) {
    const flagElement = languageBtn.querySelector('.language-flag');
    if (flagElement) {
      flagElement.textContent = flag;
    }
  }
  
  /**
   * Gère le toggle du thème
   */
  function handleThemeToggle(event) {
    event.preventDefault();
    
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Mise à jour de l'attribut data-theme sur le html (ou body)
    // Most places in the code check document.documentElement for data-theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    
    // Sauvegarde dans localStorage
    localStorage.setItem('theme', currentTheme);
    
    // Marquer que l'utilisateur a changé le thème manuellement (session uniquement)
    if (currentTheme === 'dark') {
      sessionStorage.setItem('themeChangedToDark', 'true');
    } else {
      sessionStorage.setItem('themeChangedToLight', 'true');
    }
    
    // Animation du bouton
    themeToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
      themeToggle.style.transform = '';
    }, 150);
    
    // Notification de changement via NotificationsManager
    const themeMessage = currentTheme === 'dark' ? '🌙 Mode sombre activé' : '☀️ Mode clair activé';
    if (window.NotificationsManager) {
      window.NotificationsManager.showNotification(themeMessage, 'success');
      window.NotificationsManager.addNotification('Thème changé', themeMessage, 'success');
    }
  }
  
  /**
   * Gère l'ouverture/fermeture du dropdown de notifications
   */
  function toggleNotificationsDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!notificationsBtn || !notificationsDropdown) {
      console.error('❌ Missing elements for notifications dropdown');
      return;
    }
    
    const isActive = notificationsBtn.classList.contains('active');
    
    if (isActive) {
      closeNotificationsDropdown();
    } else {
      openNotificationsDropdown();
    }
  }
  
  /**
   * Ouvre le dropdown de notifications
   */
  function openNotificationsDropdown() {
    notificationsBtn.classList.add('active');
    notificationsDropdown.classList.add('active');
    
    // Ajouter classe sur body pour masquer les toasts
    document.body.classList.add('notifications-menu-open');
    
    // Marquer les notifications comme lues
    markNotificationsAsRead();
    
    // Ajouter l'event listener pour fermer en cliquant ailleurs
    setTimeout(() => {
      document.addEventListener('click', closeNotificationsDropdownOutside);
    }, 0);
  }
  
  /**
   * Ferme le dropdown de notifications
   */
  function closeNotificationsDropdown() {
    notificationsBtn.classList.remove('active');
    notificationsDropdown.classList.remove('active');
    
    // Enlever classe sur body pour réafficher les toasts
    document.body.classList.remove('notifications-menu-open');
    
    // Retirer l'event listener
    document.removeEventListener('click', closeNotificationsDropdownOutside);
  }
  
  /**
   * Ferme le dropdown si on clique en dehors
   */
  function closeNotificationsDropdownOutside(event) {
    if (!notificationsBtn.contains(event.target) && !notificationsDropdown.contains(event.target)) {
      closeNotificationsDropdown();
    }
  }
  
  /**
   * Marque toutes les notifications comme lues
   * WRAPPER: Delegated to NotificationsManager
   */
  function markNotificationsAsRead() {
    if (window.NotificationsManager) {
      window.NotificationsManager.markNotificationsAsRead();
    }
  }
  
  /**
   * Met à jour le badge de notifications
   * WRAPPER: Delegated to NotificationsManager
   */
  function updateNotificationBadge() {
    if (window.NotificationsManager) {
      window.NotificationsManager.updateNotificationBadge();
    }
  }
  
  /**
   * Ajoute une nouvelle notification
   * WRAPPER: Delegated to NotificationsManager
   */
  function addNotification(title, message, type = 'info') {
    if (window.NotificationsManager) {
      return window.NotificationsManager.addNotification(title, message, type);
    }
  }
  
  /**
   * Met à jour la liste des notifications
   * WRAPPER: Delegated to NotificationsManager
   */
  function updateNotificationsList() {
    if (window.NotificationsManager) {
      window.NotificationsManager.updateNotificationsList();
    }
  }
  
  /**
   * Supprime une notification
   * WRAPPER: Delegated to NotificationsManager
   */
  function removeNotification(id) {
    if (window.NotificationsManager) {
      window.NotificationsManager.removeNotification(id);
    }
  }
  
  /**
   * Efface toutes les notifications
   * WRAPPER: Delegated to NotificationsManager
   */
  function clearAllNotifications() {
    if (window.NotificationsManager) {
      window.NotificationsManager.clearAllNotifications();
    }
    closeNotificationsDropdown();
  }
  
  /**
   * Affiche une notification toast
   * WRAPPER: Delegated to NotificationsManager
   */
  function showNotification(message, type = 'info', options = {}) {
    if (window.NotificationsManager) {
      window.NotificationsManager.showNotification(message, type, options);
    }
  }
  
  /**
   * Créer une notification de trophée
   * Système de notifications intégré au right-dock
   */
  function createTrophyNotificationCompat(trophy) {
    // Créer la notification dans le style du système de trophées
    const notification = document.createElement('div');
    notification.className = 'new-trophy-notification';
    notification.innerHTML = `
      <span class="trophy-emoji">${trophy.icon}</span>
      <div class="trophy-name">${getString('trophy_unlocked')}</div>
      <div class="trophy-desc">${trophy.name}</div>
    `;
    
    // Ajouter au right-dock
    const rightDockContainer = document.getElementById('right-dock');
    (rightDockContainer || document.body).appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  /**
   * Initialise le thème au chargement
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
  }
  
  /**
   * Initialise les éléments du DOM
   */
  function initElements() {
 
    
    rightDock = document.getElementById('right-dock');
    if (!rightDock) {
      console.error('❌ Right dock element not found (#right-dock)');
      return false;
    }

    
    // Éléments du right dock
    languageBtn = rightDock.querySelector('.language-btn');
    languageDropdown = document.getElementById('language-dropdown');
    themeToggle = rightDock.querySelector('.theme-toggle');
    notificationsBtn = rightDock.querySelector('.notifications-btn');
    notificationsDropdown = document.getElementById('notifications-dropdown');
    trophiesBtn = rightDock.querySelector('.trophies-btn');

    
    return true;
  }
  
  /**
   * Initialise les event listeners
   */
  function initEventListeners() {

    
    // Langue
    if (languageBtn && languageDropdown) {
   
      // Supprimer les anciens listeners au cas où
      languageBtn.removeEventListener('click', toggleLanguageDropdown);
      languageBtn.addEventListener('click', toggleLanguageDropdown);
      
      languageDropdown.removeEventListener('click', handleLanguageSelection);
      languageDropdown.addEventListener('click', handleLanguageSelection);
    } else {
      console.log('❌ Language elements missing - Button:', !!languageBtn, 'Dropdown:', !!languageDropdown);
    }
    
    // Thème
    if (themeToggle) {
  
      themeToggle.removeEventListener('click', handleThemeToggle);
      themeToggle.addEventListener('click', handleThemeToggle);
    } else {
      console.log('❌ Theme toggle not found');
    }
    
    // Notifications
    if (notificationsBtn && notificationsDropdown) {

      notificationsBtn.removeEventListener('click', toggleNotificationsDropdown);
      notificationsBtn.addEventListener('click', toggleNotificationsDropdown);
    } else {
      console.log('❌ Notifications elements missing - Button:', !!notificationsBtn, 'Dropdown:', !!notificationsDropdown);
    }
    
    // Clear all notifications
    const clearAllBtn = document.getElementById('clear-all-notifications');
    if (clearAllBtn) {
      clearAllBtn.removeEventListener('click', clearAllNotifications);
      clearAllBtn.addEventListener('click', clearAllNotifications);
    }
    
  

  }
  
  /**
   * Initialisation principale
   */
  function init() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    detectReducedMotion();
    initTheme();
    
    if (!initElements()) {
      console.warn('❌ Right dock initialization failed - elements not found');
      return;
    }
    
    initEventListeners();
    updateAnimationDuration();
    setupWillChangeOptimization();
    
    // Marquer comme initialisé
    window.rightDockInitialized = true;
    
    console.log('✅ Right Dock initialized');
  }
  
  // Exposer certaines fonctions globalement
  window.rightDockManager = {
    addNotification,
    removeNotification,
    clearAllNotifications,
    showNotification,
    createTrophyNotificationCompat
  };
  
  // Exposer les fonctions globalement pour le HTML et autres scripts
  window.removeNotification = removeNotification;
  window.addNotification = addNotification;
  window.showNotification = showNotification;
  window.clearAllNotifications = clearAllNotifications;
  
  // Démarrer l'initialisation
  init();
  
})();
