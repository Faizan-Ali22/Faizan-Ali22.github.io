/**
 * Development Time Modal Interactions
 * 
 * Handles specific interactions for development time project widgets
 * Separate from unified modal system to respect Single Responsibility Principle
 */

// Initialize development time modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Listen for modal opening events
    document.addEventListener('click', function(e) {
        // Check if a development time widget was clicked
        const widget = e.target.closest('.development-time-box .project-widget-header');
        if (widget) {
            // Wait for modal to open, then initialize
            setTimeout(() => {
                const modal = document.querySelector('.unified-modal');
                if (modal && modal.querySelector('.development-time-modal-enhanced')) {
                    initializeDevelopmentTimeInteractions(modal);
                }
            }, 100);
        }
    });
});

/**
 * Initialize development time specific interactions
 * @param {Element} modal - The modal element
 */
function initializeDevelopmentTimeInteractions(modal) {
    // Initialize progress bars with smooth animation
    initializeProgressBars(modal);
    
    // Add hover effects for timeline items
    initializeTimelineHovers(modal);
}

/**
 * Initialize progress bar animations
 * @param {Element} modal - The modal element
 */
function initializeProgressBars(modal) {
    const progressBars = modal.querySelectorAll('.devtime-phase-progress-bar[data-progress]');
    progressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        if (progress) {
            // Animate progress bar after a short delay
            setTimeout(() => {
                bar.style.width = `${progress}%`;
            }, 200);
        }
    });
}

/**
 * Initialize timeline hover effects
 * @param {Element} modal - The modal element
 */
function initializeTimelineHovers(modal) {
    const timelineItems = modal.querySelectorAll('.devtime-timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const bullet = this.querySelector('.devtime-timeline-bullet');
            if (bullet) {
                bullet.style.transform = 'scale(1.1)';
                bullet.style.transition = 'transform 0.2s ease';
            }
        });

        item.addEventListener('mouseleave', function() {
            const bullet = this.querySelector('.devtime-timeline-bullet');
            if (bullet) {
                bullet.style.transform = 'scale(1)';
            }
        });
    });
}