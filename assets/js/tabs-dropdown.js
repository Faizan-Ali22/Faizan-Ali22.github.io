/**
 * Unified Tabs Dropdown System
 * Automatically converts tabs to dropdown on mobile when data-can-collapse="true"
 * Works with any .tabs container
 */

(function() {
    'use strict';
    
    /**
     * Initialize tabs dropdown system for a specific tabs container
     * @param {HTMLElement} tabsContainer - The .tabs element with data-can-collapse="true"
     */
    function initTabsDropdown(tabsContainer) {
        const collapseId = tabsContainer.getAttribute('data-collapse-id');
        if (!collapseId) {
            console.warn('Tabs with data-can-collapse must have data-collapse-id attribute');
            return;
        }
        
        // Find or create mobile dropdown container
        let mobileContainer = document.querySelector(`.tabs-mobile[data-collapse-id="${collapseId}"]`);
        
        if (!mobileContainer) {
            // Create mobile dropdown structure
            mobileContainer = createMobileDropdown(tabsContainer, collapseId);
            
            // If no visible tabs, skip initialization
            if (!mobileContainer) {
                console.warn(`No visible tabs for ${collapseId}, skipping dropdown creation`);
                return;
            }
            
            // Find the best insertion point
            // If tabs are in a modal header, insert after the header
            const modalHeader = tabsContainer.closest('.unified-modal-header, .skill-modal-header, .person-modal-header');
            if (modalHeader) {
                // Insert after the modal header to get full modal width
                modalHeader.parentNode.insertBefore(mobileContainer, modalHeader.nextSibling);
            } else {
                // Check if tabs are inside a filters bar (projects list page)
                const filtersBar = tabsContainer.closest('.projects-filters-bar');
                if (filtersBar) {
                    // Insert after the filters bar, not inside it
                    filtersBar.parentNode.insertBefore(mobileContainer, filtersBar.nextSibling);
                } else {
                    // Otherwise insert after tabs container
                    tabsContainer.parentNode.insertBefore(mobileContainer, tabsContainer.nextSibling);
                }
            }
        }
        
        // Setup event handlers only if container exists
        if (mobileContainer) {
            setupDropdownHandlers(tabsContainer, mobileContainer, collapseId);
        }
        
        // Watch for count changes in desktop tabs
        setupCountObserver(tabsContainer, collapseId);
    }
    
    /**
     * Setup observer to watch for count changes in tabs
     * @param {HTMLElement} tabsContainer - The tabs container
     * @param {string} collapseId - Unique ID
     */
    function setupCountObserver(tabsContainer, collapseId) {
        const countElements = tabsContainer.querySelectorAll('.count, .skill-modal-tab-count');
        
        countElements.forEach(countElement => {
            // Use MutationObserver to watch for text changes
            const observer = new MutationObserver(() => {
                updateDropdownCounts(collapseId);
            });
            
            observer.observe(countElement, {
                childList: true,
                characterData: true,
                subtree: true
            });
        });
        
        // Also update immediately in case counts are already set
        setTimeout(() => updateDropdownCounts(collapseId), 100);
    }
    
    /**
     * Create mobile dropdown HTML structure from tabs
     * @param {HTMLElement} tabsContainer - The source tabs container
     * @param {string} collapseId - Unique ID for this dropdown
     * @returns {HTMLElement} The created mobile container
     */
    function createMobileDropdown(tabsContainer, collapseId) {
        // Only get visible tabs (filter out hidden ones)
        const allTabs = Array.from(tabsContainer.querySelectorAll('.tab-btn'));
        const tabs = allTabs.filter(tab => {
            const style = window.getComputedStyle(tab);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });
        
        if (tabs.length === 0) {
            console.warn('No visible tabs found for dropdown');
            return null;
        }
        
        const activeTab = tabs.find(tab => tab.classList.contains('active')) || tabs[0];
        
        // Get active tab info - support multiple icon/label formats
        const activeIconElement = activeTab.querySelector('.icon, .tab-icon, .tab-emoji, .nav-tab-icon');
        const activeIcon = activeIconElement?.textContent?.trim() || '';
        
        // Try to get label from dedicated element first, fallback to textContent
        const activeLabelElement = activeTab.querySelector('.nav-tab-label, .tab-label');
        let activeText = activeLabelElement ? activeLabelElement.textContent.trim() : '';
        
        // If no label element, extract from textContent
        if (!activeText) {
            const activeCountElement = activeTab.querySelector('.count, .skill-modal-tab-count, .dropdown-count');
            const activeCount = activeCountElement?.textContent?.trim() || '';
            
            activeText = activeTab.textContent;
            if (activeIcon) activeText = activeText.replace(activeIcon, '');
            if (activeCount) activeText = activeText.replace(activeCount, '');
            activeText = activeText.trim();
        }
        
        const activeCountElement = activeTab.querySelector('.count, .skill-modal-tab-count, .dropdown-count');
        const activeCount = activeCountElement?.textContent?.trim() || '';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'tabs-mobile';
        container.setAttribute('data-collapse-id', collapseId);
        container.setAttribute('data-collapse-active', 'true');
        
        // Create dropdown structure
        const dropdown = document.createElement('div');
        dropdown.className = 'tabs-dropdown';
        
        // Create button
        const button = document.createElement('button');
        button.className = 'tabs-dropdown-btn';
        button.id = `${collapseId}TabsDropdownBtn`;
        button.setAttribute('aria-label', 'Sélectionner un onglet');
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = `
            <span class="dropdown-icon">${activeIcon}</span>
            <span class="dropdown-text">${activeText}</span>
            ${activeCount ? `<span class="dropdown-count">${activeCount}</span>` : ''}
            <span class="dropdown-arrow">▼</span>
        `;
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'tabs-dropdown-menu';
        menu.id = `${collapseId}TabsDropdownMenu`;
        menu.hidden = true;
        
        // Create menu items from tabs
        tabs.forEach(tab => {
            // Support multiple icon formats
            const iconElement = tab.querySelector('.icon, .tab-icon, .tab-emoji, .nav-tab-icon');
            const icon = iconElement?.textContent?.trim() || '';
            
            // Support multiple count formats
            const countElement = tab.querySelector('.count, .skill-modal-tab-count, .dropdown-count');
            const count = countElement?.textContent?.trim() || '';
            
            // Get label from dedicated element first, fallback to textContent
            const labelElement = tab.querySelector('.nav-tab-label, .tab-label');
            let text = labelElement ? labelElement.textContent.trim() : '';
            
            // If no label element, extract from textContent
            if (!text) {
                text = tab.textContent;
                if (icon) text = text.replace(icon, '');
                if (count) text = text.replace(count, '');
                text = text.trim();
            }
            
            const tabValue = tab.getAttribute('data-tab');
            const isActive = tab.classList.contains('active');
            
            const item = document.createElement('button');
            item.className = `tabs-dropdown-item ${isActive ? 'active' : ''}`;
            item.setAttribute('data-tab', tabValue);
            item.setAttribute('data-icon', icon);
            item.setAttribute('data-label', text);
            if (count) item.setAttribute('data-count', count);
            item.innerHTML = `
                <span class="dropdown-item-icon">${icon}</span>
                <span class="dropdown-item-text">${text}</span>
                ${count ? `<span class="dropdown-item-count">${count}</span>` : ''}
            `;
            
            menu.appendChild(item);
        });
        
        dropdown.appendChild(button);
        dropdown.appendChild(menu);
        container.appendChild(dropdown);
        
        return container;
    }
    
    /**
     * Setup event handlers for dropdown and tabs synchronization
     * @param {HTMLElement} tabsContainer - The tabs container
     * @param {HTMLElement} mobileContainer - The mobile dropdown container
     * @param {string} collapseId - Unique ID
     */
    function setupDropdownHandlers(tabsContainer, mobileContainer, collapseId) {
        const button = mobileContainer.querySelector('.tabs-dropdown-btn');
        const menu = mobileContainer.querySelector('.tabs-dropdown-menu');
        const items = mobileContainer.querySelectorAll('.tabs-dropdown-item');
        
        if (!button || !menu) return;
        
        // Toggle dropdown
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeDropdown(button, menu);
            } else {
                openDropdown(button, menu);
            }
        });
        
        // Close on click outside
        document.addEventListener('click', function(e) {
            if (!button.contains(e.target) && !menu.contains(e.target)) {
                closeDropdown(button, menu);
            }
        });
        
        // Handle item clicks
        items.forEach(item => {
            item.addEventListener('click', function() {
                const tabValue = this.getAttribute('data-tab');
                const icon = this.getAttribute('data-icon');
                const label = this.getAttribute('data-label');
                const count = this.getAttribute('data-count') || '';
                
                // Update dropdown button with count
                button.querySelector('.dropdown-icon').textContent = icon;
                button.querySelector('.dropdown-text').textContent = label;
                
                // Update or remove count badge
                let countBadge = button.querySelector('.dropdown-count');
                if (count) {
                    if (!countBadge) {
                        countBadge = document.createElement('span');
                        countBadge.className = 'dropdown-count';
                        button.insertBefore(countBadge, button.querySelector('.dropdown-arrow'));
                    }
                    countBadge.textContent = count;
                } else if (countBadge) {
                    countBadge.remove();
                }
                
                // Update active state in dropdown
                items.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Switch tab (trigger click on desktop tab)
                const desktopTab = tabsContainer.querySelector(`.tab-btn[data-tab="${tabValue}"]`);
                if (desktopTab) {
                    desktopTab.click();
                }
                
                closeDropdown(button, menu);
            });
        });
        
        // Sync desktop tabs with dropdown
        const desktopTabs = tabsContainer.querySelectorAll('.tab-btn');
        desktopTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabValue = this.getAttribute('data-tab');
                const matchingItem = mobileContainer.querySelector(`.tabs-dropdown-item[data-tab="${tabValue}"]`);
                
                if (matchingItem) {
                    const icon = matchingItem.getAttribute('data-icon');
                    const label = matchingItem.getAttribute('data-label');
                    const count = matchingItem.getAttribute('data-count') || '';
                    
                    button.querySelector('.dropdown-icon').textContent = icon;
                    button.querySelector('.dropdown-text').textContent = label;
                    
                    // Update count badge
                    let countBadge = button.querySelector('.dropdown-count');
                    if (count) {
                        if (!countBadge) {
                            countBadge = document.createElement('span');
                            countBadge.className = 'dropdown-count';
                            button.insertBefore(countBadge, button.querySelector('.dropdown-arrow'));
                        }
                        countBadge.textContent = count;
                    } else if (countBadge) {
                        countBadge.remove();
                    }
                    
                    items.forEach(i => i.classList.remove('active'));
                    matchingItem.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Open dropdown menu
     */
    function openDropdown(button, menu) {
        button.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
        
        // Use simple relative positioning - menu is already positioned relative to button
        // No need for complex calculations, CSS handles it
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.width = '';
    }
    
    /**
     * Close dropdown menu
     */
    function closeDropdown(button, menu) {
        button.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
    }
    
    /**
     * Update dropdown counts from desktop tabs
     * Call this after tabs counts are populated
     */
    function updateDropdownCounts(collapseId) {
        const tabsContainer = document.querySelector(`.tabs[data-collapse-id="${collapseId}"]`);
        const mobileContainer = document.querySelector(`.tabs-mobile[data-collapse-id="${collapseId}"]`);
        
        if (!tabsContainer || !mobileContainer) return;
        
        const button = mobileContainer.querySelector('.tabs-dropdown-btn');
        const items = mobileContainer.querySelectorAll('.tabs-dropdown-item');
        
        // Update each dropdown item with current count from desktop tab
        items.forEach(item => {
            const tabValue = item.getAttribute('data-tab');
            const desktopTab = tabsContainer.querySelector(`.tab-btn[data-tab="${tabValue}"]`);
            
            if (desktopTab) {
                const countElement = desktopTab.querySelector('.count, .skill-modal-tab-count');
                const count = countElement?.textContent?.trim() || '';
                
                if (count) {
                    item.setAttribute('data-count', count);
                    
                    // Update count display in dropdown item
                    let itemCountBadge = item.querySelector('.dropdown-item-count');
                    if (!itemCountBadge) {
                        itemCountBadge = document.createElement('span');
                        itemCountBadge.className = 'dropdown-item-count';
                        item.appendChild(itemCountBadge);
                    }
                    itemCountBadge.textContent = count;
                }
            }
        });
        
        // Update button with active tab count
        const activeItem = mobileContainer.querySelector('.tabs-dropdown-item.active');
        if (activeItem && button) {
            const count = activeItem.getAttribute('data-count') || '';
            let countBadge = button.querySelector('.dropdown-count');
            
            if (count) {
                if (!countBadge) {
                    countBadge = document.createElement('span');
                    countBadge.className = 'dropdown-count';
                    button.insertBefore(countBadge, button.querySelector('.dropdown-arrow'));
                }
                countBadge.textContent = count;
            }
        }
    }
    
    // Expose function globally for external updates
    window.updateTabsDropdownCounts = updateDropdownCounts;
    
    /**
     * Recreate dropdown for a specific collapse ID (removes old one first)
     */
    function recreateDropdown(collapseId) {
    
        
        // Remove existing dropdown
        const oldDropdown = document.querySelector(`.tabs-mobile[data-collapse-id="${collapseId}"]`);
        if (oldDropdown) {
        
            oldDropdown.remove();
        }
        
        // Reinitialize
        const tabsContainer = document.querySelector(`.tabs[data-collapse-id="${collapseId}"]`);
        if (tabsContainer) {
   
            initTabsDropdown(tabsContainer);
            
            // Update counts after a brief delay to ensure they're populated
            setTimeout(() => {
                updateDropdownCounts(collapseId);
            }, 200);
        } else {
            console.warn(`No tabs container found for ${collapseId}`);
        }
    }
    
    // Expose function globally for external updates
    window.recreateTabsDropdown = recreateDropdown;
    
    /**
     * Initialize all collapsible tabs on the page
     */
    function initAllCollapsibleTabs() {
        const collapsibleTabs = document.querySelectorAll('.tabs[data-can-collapse="true"]');

        
        collapsibleTabs.forEach(tabsContainer => {
            initTabsDropdown(tabsContainer);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllCollapsibleTabs);
    } else {
        initAllCollapsibleTabs();
    }
    
    // Re-initialize when modals are opened (for dynamically loaded content)
    document.addEventListener('modalOpened', initAllCollapsibleTabs);
    document.addEventListener('skillModalOpened', initAllCollapsibleTabs);
    
})();
