/**
 * CV Version Choice Modal
 * Allows users to choose between color or print-friendly version
 */

class CVChoiceModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    // Create modal HTML structure
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    // Create modal if it doesn't already exist
    if (!document.querySelector('.cv-choice-modal')) {
      const modalHTML = `
        <div class="cv-choice-modal-overlay"></div>
        <div class="cv-choice-modal">
          <div class="cv-choice-modal-content">
            <h2>📄 Download my Resume</h2>
            <p>Choose the version to download:</p>
            
           <div class="cv-choice-options">
  <div class="cv-choice-option" data-version="color">
    <div class="cv-choice-title">Color version</div>
    <div class="cv-choice-desc">PDF with full design and colors</div>
    <span class="cv-choice-recommended">📱 Recommended for screen</span>
  </div>
  
  <div class="cv-choice-option" data-version="print">
    <div class="cv-choice-title">Printable version</div>
    <div class="cv-choice-desc">Black and white PDF, optimized for printing</div>
    <span class="cv-choice-recommended">💰 Saves ink</span>
  </div>
</div>
            
            <div class="cv-choice-actions">
              <button class="cv-choice-cancel">Cancel</button>
            </div>
          </div>
        </div>
      `;
      
      // Inject into DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.modal = document.querySelector('.cv-choice-modal');
    }
  }

  bindEvents() {
    // Event handlers for CV links - uses capture to intercept before other handlers
    document.addEventListener('click', (e) => {
      // Check if it's a CV link or element with cv-choice-trigger
      const cvLink = e.target.closest('a[href^="/cv"]') || e.target.closest('.cv-choice-trigger');
      
      if (cvLink) {
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
        return false;
      }

      // Choice options
      const option = e.target.closest('.cv-choice-option');
      if (option) {
        const version = option.dataset.version;
        this.selectVersion(version);
        return;
      }

      // Cancel button
      if (e.target.matches('.cv-choice-cancel')) {
        this.closeModal();
        return;
      }

      // Overlay click
      if (e.target.matches('.cv-choice-modal-overlay')) {
        this.closeModal();
        return;
      }
    }, true); // Use capture to intercept before other handlers

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal() {
    if (this.modal) {
      // Pause other modals if necessary
      if (typeof window.pauseAllTestimonials === 'function') {
        window.pauseAllTestimonials();
      }
      
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus on first option
      setTimeout(() => {
        const firstOption = this.modal.querySelector('.cv-choice-option');
        if (firstOption) {
          firstOption.focus();
        }
      }, 100);
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Resume testimonials if necessary
      if (typeof window.resumeAllTestimonials === 'function') {
        window.resumeAllTestimonials();
      }
    }
  }

  selectVersion(version) {
    let pdfUrl;
    let fileName;
    
    switch (version) {
      case 'color':
        pdfUrl = '/cv/CV.pdf';
        fileName = 'CV.pdf';
        break;
      case 'print':
        pdfUrl = '/cv/CV - Copy.pdf';
        fileName = 'CV - Copy.pdf';
        break;
      default:
        console.warn('Unknown version:', version);
        return;
    }
    
    // Close modal
    this.closeModal();
    
    // Always download PDFs (both local and production)
    this.downloadPDF(pdfUrl, fileName);
  }

  downloadPDF(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    
    // Direct click without fetch respects the user context better
    link.click(); 
    document.body.removeChild(link);
  }
}

// Initialize modal on page load
document.addEventListener('DOMContentLoaded', () => {
  new CVChoiceModal();
});

// Export for global use
window.CVChoiceModal = CVChoiceModal;