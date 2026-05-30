/**
 * Skill Modal Tabs Handler
 * Manages tab switching for both desktop and mobile views
 */

function initSkillModalTabs() {
    const dropdownBtn = document.getElementById('skillModalTabsDropdownBtn');
    const dropdownMenu = document.getElementById('skillModalTabsDropdownMenu');
    const dropdownItems = document.querySelectorAll('.skill-modal-tabs-dropdown-item');
    
    console.log('Init tabs - Dropdown button:', dropdownBtn);
    console.log('Init tabs - Dropdown menu:', dropdownMenu);
    console.log('Init tabs - Items count:', dropdownItems.length);
    
    if (!dropdownBtn || !dropdownMenu) {
        console.log('Dropdown elements not found, skipping initialization');
        return;
    }
    
    // Toggle dropdown menu
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Handle dropdown item clicks
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                const icon = this.getAttribute('data-icon');
                const label = this.getAttribute('data-label');
                
                // Update dropdown button
                dropdownBtn.querySelector('.dropdown-icon').textContent = icon;
                dropdownBtn.querySelector('.dropdown-text').textContent = label;
                
                // Update active state in dropdown
                dropdownItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Switch tab
                switchToTab(tabName);
                
                // Close dropdown
                closeDropdown();
            });
        });
    }
    
    function openDropdown() {
        dropdownBtn.setAttribute('aria-expanded', 'true');
        dropdownMenu.hidden = false;
        
        // Position dropdown menu using fixed positioning
        const btnRect = dropdownBtn.getBoundingClientRect();
        dropdownMenu.style.top = `${btnRect.bottom + 4}px`;
        dropdownMenu.style.left = `${btnRect.left}px`;
        dropdownMenu.style.width = `${btnRect.width}px`;
    }
    
    function closeDropdown() {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.hidden = true;
    }
    
    // Desktop tabs handler (sync with mobile dropdown)
    document.querySelectorAll('.skill-modal-tab.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update mobile dropdown if exists
            const matchingItem = document.querySelector(`.skill-modal-tabs-dropdown-item[data-tab="${tabName}"]`);
            if (matchingItem && dropdownBtn) {
                const icon = matchingItem.getAttribute('data-icon');
                const label = matchingItem.getAttribute('data-label');
                
                dropdownBtn.querySelector('.dropdown-icon').textContent = icon;
                dropdownBtn.querySelector('.dropdown-text').textContent = label;
                
                dropdownItems.forEach(i => i.classList.remove('active'));
                matchingItem.classList.add('active');
            }
            
            switchToTab(tabName);
        });
    });
    
    /**
     * Switch to a specific tab (works for both desktop and mobile)
     * @param {string} tabName - The tab to switch to (projects, experiences, educations)
     */
    function switchToTab(tabName) {
        // Hide all panels
        document.querySelectorAll('.skill-modal-tab-panel').forEach(panel => {
            panel.hidden = true;
            panel.classList.remove('active');
        });
        
        // Show selected panel
        const panelId = `skillModalTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.hidden = false;
            targetPanel.classList.add('active');
        }
        
        // Update desktop tabs state
        document.querySelectorAll('.skill-modal-tab.tab-btn').forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            if (btnTab === tabName) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initSkillModalTabs);

// Re-initialize when modal is opened (in case it was loaded dynamically)
document.addEventListener('skillModalOpened', initSkillModalTabs);
