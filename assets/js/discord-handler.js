/**
 * DEPRECATED: Legacy Discord modal implementation
 * This file is intentionally left blank and should not be referenced.
 * The unified modal system replaces this implementation (see unified-modal-system.js).
 */

(function(){
  if (typeof window !== 'undefined') {
    console.warn('[deprecated] discord-handler.js is deprecated. Use UnifiedModal.create({type:"discord", ...}) instead.');
  }
})();

/**
 * Discord Handler - Gestion du clic sur le bouton Discord
 * Affiche une modal avec l'ID Discord à copier ou copie directement dans le presse-papier
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // Configuration
  const DISCORD_ID = window.discordData ? window.discordData.id : "clixmods";
  const NOTIFICATION_DURATION = 3000; // 3 secondes

  /**
   * Crée une modal pour afficher l'ID Discord
   */
  function createDiscordModal() {
    // Vérifier si la modal existe déjà
    const existingModal = document.querySelector('#discord-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Créer la modal
    const modal = document.createElement('div');
    modal.id = 'discord-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content discord-modal">
        <div class="modal-header">
          <h3>Mon ID Discord</h3>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        <div class="modal-body">
          <p>Voici mon ID Discord :</p>
          <div class="discord-id-container">
            <code class="discord-id">${DISCORD_ID}</code>
            <button class="copy-btn" title="Copier l'ID">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
          <p class="discord-note">Tu peux m'ajouter sur Discord ou m'envoyer un message !</p>
        </div>
      </div>
    `;

    // Ajouter au DOM
    document.body.appendChild(modal);

    // Gestionnaires d'événements pour la modal
    const closeBtn = modal.querySelector('.modal-close');
    const copyBtn = modal.querySelector('.copy-btn');

    // Fermer la modal
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Copier l'ID
    copyBtn.addEventListener('click', function() {
      copyToClipboard(DISCORD_ID);
      closeModal();
    });

    // Fermer avec Échap
    document.addEventListener('keydown', handleEscapeKey);

    // Afficher la modal avec animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  /**
   * Ferme la modal Discord
   */
  function closeModal() {
    const modal = document.querySelector('#discord-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        document.removeEventListener('keydown', handleEscapeKey);
      }, 300);
    }
  }

  /**
   * Gère la touche Échap pour fermer la modal
   */
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  /**
   * Copie du texte dans le presse-papier
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // Méthode moderne
      navigator.clipboard.writeText(text).then(() => {
        showDiscordNotification('ID Discord copié dans le presse-papier !', 'success');
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      // Méthode de fallback
      fallbackCopyToClipboard(text);
    }
  }

  /**
   * Méthode de fallback pour copier dans le presse-papier
   */
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      showDiscordNotification('ID Discord copié dans le presse-papier !', 'success');
    } catch (err) {
      showDiscordNotification('Impossible de copier automatiquement. ID: ' + text, 'error');
    }

    document.body.removeChild(textArea);
  }

  /**
   * Affiche une notification en utilisant le système existant du site
   */
  function showDiscordNotification(message, type = 'success') {
    // Utiliser le système de notifications existant du site
    if (window.showNotification && typeof window.showNotification === 'function') {
      window.showNotification(message, type, { duration: 3000 });
    } else if (window.rightDockManager && window.rightDockManager.showNotification) {
      window.rightDockManager.showNotification(message, type);
    } else {
      // Fallback simple si les systèmes ne sont pas disponibles
      alert(message); // Fallback très simple
    }
  }

  /**
   * Gère le clic sur le bouton Discord
   */
  function handleDiscordClick(e) {
    e.preventDefault();
    
    // Option 1: Copier directement (pour test rapide)
    // copyToClipboard(DISCORD_ID);
    
    // Option 2: Ouvrir la modal (par défaut)
    createDiscordModal();
  }

  /**
   * Initialise le gestionnaire Discord
   */
  function initDiscordHandler() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupDiscordButton);
    } else {
      setupDiscordButton();
    }
  }

  /**
   * Configure le bouton Discord
   */
  function setupDiscordButton() {
    const discordButton = document.querySelector('a[data-social="discord"]');
    if (discordButton) {
      discordButton.addEventListener('click', handleDiscordClick);
    }
  }

  // Initialiser quand le script se charge
  initDiscordHandler();

})();
