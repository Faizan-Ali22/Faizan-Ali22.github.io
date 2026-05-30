/**
 * Dock de navigation - Gestion des interactions
 * Version: 1.0.0
 * Taille: < 1kB minifié
 */

(function() {
  'use strict';
  
  // Global variables
  let isReducedMotion = false;
  let dock = null;
  let dockButtons = [];
  
  /**
   * Detects if user prefers reduced animations
   */
  function detectReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = mediaQuery.matches;
    
    // Listen for preference changes
    mediaQuery.addEventListener('change', function(e) {
      isReducedMotion = e.matches;
      updateAnimationDuration();
    });
  }
  
  /**
   * Updates animation duration according to preferences
   */
  function updateAnimationDuration() {
    const duration = isReducedMotion ? '50ms' : '150ms';
    document.documentElement.style.setProperty('--dock-transition', `${duration} ease-out`);
  }
  
  /**
   * Adds hover class to a button
   */
  function addHoverState(button) {
    if (!button) return;
    button.classList.add('is-hovered');
  }
  
  /**
   * Retire la classe hover d'un bouton
   */
  function removeHoverState(button) {
    if (!button) return;
    button.classList.remove('is-hovered');
  }
  
  /**
   * Gère l'événement mouseenter sur un bouton
   */
  function handleMouseEnter(event) {
    const button = event.currentTarget;
    addHoverState(button);
    
    // Optional effect on adjacent buttons (scale 1.1)
    const siblings = getSiblingButtons(button);
    siblings.forEach(sibling => {
      sibling.style.transform = 'scale(1.05)';
    });
  }
  
  /**
   * Handles mouseleave event on a button
   */
  function handleMouseLeave(event) {
    const button = event.currentTarget;
    removeHoverState(button);
    
    // Reset adjacent buttons to normal state
    const siblings = getSiblingButtons(button);
    siblings.forEach(sibling => {
      sibling.style.transform = '';
    });
  }
  
  /**
   * Handles focus event on a button
   */
  function handleFocus(event) {
    const button = event.currentTarget;
    addHoverState(button);
  }
  
  /**
   * Handles blur event on a button
   */
  function handleBlur(event) {
    const button = event.currentTarget;
    removeHoverState(button);
  }
  
  /**
   * Handles keyboard events
   */
  function handleKeyDown(event) {
    const button = event.currentTarget;
    
    // Activation with Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      // Add visual feedback
      button.style.transform = 'scale(1.15)';
      
      // Trigger click after short animation
      setTimeout(() => {
        button.style.transform = '';
        if (button.href) {
          window.location.href = button.href;
        } else {
          button.click();
        }
      }, 100);
    }
    
    // Navigation with arrows
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigateWithArrows(button, event.key);
    }
  }
  
  /**
   * Navigation with keyboard arrows
   */
  function navigateWithArrows(currentButton, direction) {
    const currentIndex = dockButtons.indexOf(currentButton);
    let nextIndex;
    
    if (direction === 'ArrowLeft') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : dockButtons.length - 1;
    } else {
      nextIndex = currentIndex < dockButtons.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextButton = dockButtons[nextIndex];
    if (nextButton) {
      nextButton.focus();
    }
  }
  
  /**
   * Gets buttons adjacent to a given button
   */
  function getSiblingButtons(button) {
    const index = dockButtons.indexOf(button);
    const siblings = [];
    
    // Previous button
    if (index > 0) {
      siblings.push(dockButtons[index - 1]);
    }
    
    // Next button
    if (index < dockButtons.length - 1) {
      siblings.push(dockButtons[index + 1]);
    }
    
    return siblings;
  }
  
  /**
   * Handles horizontal scroll on mobile
   */
  function handleMobileScroll() {
    if (window.innerWidth > 767) return;
    
    const dockList = dock.querySelector('.dock-list');
    if (!dockList) return;
    
    // Smooth scroll to center on element focus
    dockButtons.forEach(button => {
      button.addEventListener('focus', function() {
        const buttonRect = button.getBoundingClientRect();
        const listRect = dockList.getBoundingClientRect();
        const scrollLeft = dockList.scrollLeft;
        
        const targetScroll = scrollLeft + buttonRect.left - listRect.left - (listRect.width / 2) + (buttonRect.width / 2);
        
        dockList.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }
  
  /**
   * Adds event listeners to all buttons
   */
  function attachEventListeners() {
    dockButtons.forEach(button => {
      // Mouse events
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      
      // Focus/blur events
      button.addEventListener('focus', handleFocus);
      button.addEventListener('blur', handleBlur);
      
      // Keyboard events
      button.addEventListener('keydown', handleKeyDown);
      
      // Enhancement for touch devices
      button.addEventListener('touchstart', function(e) {
        addHoverState(button);
      }, { passive: true });
      
      button.addEventListener('touchend', function(e) {
        setTimeout(() => removeHoverState(button), 150);
      }, { passive: true });
    });
  }
  
  /**
   * Initialise le dock
   */
  function initDock() {
    dock = document.getElementById('dock');
    if (!dock) {
      console.warn('Dock non trouvé dans le DOM');
      return;
    }
    
    // Get all dock buttons
    dockButtons = Array.from(dock.querySelectorAll('.dock-button'));
    
    if (dockButtons.length === 0) {
      console.warn('Aucun bouton trouvé dans le dock');
      return;
    }
    
    // Attach event listeners
    attachEventListeners();
    
    // Handle mobile scroll
    handleMobileScroll();
    
    // Detect animation preferences
    detectReducedMotion();
    updateAnimationDuration();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleMobileScroll, 100);
    });

  }
  
  /**
   * Main entry point
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDock);
    } else {
      initDock();
    }
  }
  
  // Start initialization
  init();
  
  // Export for tests or external usage (optional)
  window.DockNavigation = {
    addHoverState,
    removeHoverState,
    reinit: initDock
  };
  
})();
