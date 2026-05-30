// Person Modal Management
// This file provides utility functions to open person modals from anywhere in the site

/**
 * Opens a person modal with the given person ID
 * @param {string} personId - The ID of the person to display
 */
function openPersonModalGlobal(personId) {
    // Check if the modal exists and the function is available
    if (typeof window.openPersonModal === 'function') {
        window.openPersonModal(personId);
    } else {
        console.error('Person modal not available on this page');
    }
}

/**
 * Creates clickable person links that open the modal
 * Usage: Add data-person-id="person-id" to any element
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with data-person-id attribute
    const personLinks = document.querySelectorAll('[data-person-id]');
    
    personLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const personId = this.getAttribute('data-person-id');
            if (personId) {
                // Call the window function directly
                if (typeof window.openPersonModal === 'function') {
                    window.openPersonModal(personId);
                } else {
                    console.error('Person modal not available:', personId);
                }
            }
        });
    });
});

/**
 * Alternative function to create person badges with modal functionality
 * @param {string} personId - The person ID
 * @param {string} personName - The person name to display
 * @param {string} role - Optional role to display
 * @returns {HTMLElement} - A clickable person badge element
 */
function createPersonBadge(personId, personName, role = '') {
    const badge = document.createElement('span');
    badge.className = 'person-badge';
    badge.setAttribute('data-person-id', personId);
    badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(79, 209, 197, 0.1);
        border: 1px solid rgba(79, 209, 197, 0.3);
        border-radius: 20px;
        padding: 4px 12px;
        color: var(--accent-color);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
    `;
    
    badge.innerHTML = `
        <span class="person-icon">👤</span>
        <span class="person-name">${personName}</span>
        ${role ? `<span class="person-role">(${role})</span>` : ''}
    `;
    
    badge.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(79, 209, 197, 0.2)';
        this.style.transform = 'translateY(-1px)';
    });
    
    badge.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(79, 209, 197, 0.1)';
        this.style.transform = 'translateY(0)';
    });
    
    badge.addEventListener('click', function() {
        if (typeof window.openPersonModal === 'function') {
            window.openPersonModal(personId);
        }
    });
    
    return badge;
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openPersonModalGlobal,
        createPersonBadge
    };
}
