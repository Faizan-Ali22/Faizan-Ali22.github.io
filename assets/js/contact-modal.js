/**
 * DEPRECATED: Legacy contact modal script removed.
 * The unified modal system (unified-modal-system.js) replaces this file.
 * This file is intentionally a no-op to prevent accidental imports.
 */
(function(){
  if (typeof window !== 'undefined') {
    if (!window.contactModal) {
      window.contactModal = {
        open: function(){
          try { UnifiedModal.create({ type: 'contact', title: 'Contactez-moi', icon: '📬' }); }
          catch(e){ console.warn('[deprecated] contact-modal.js is removed. Use UnifiedModal.create({ type: "contact" })'); }
        },
        close: function(){ /* no-op */ }
      };
    }
  }
})();
