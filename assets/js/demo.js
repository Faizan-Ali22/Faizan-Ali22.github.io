// ============================================================================
// DEMO PAGE JAVASCRIPT
// ============================================================================
// Scripts spécifiques à la page demo.html pour les interactions et fonctionnalités

/**
 * Initialisation de la page demo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Demo Page - Initialisation des fonctionnalités...');
    
    // Initialisation des différents systèmes
    initDemoTabs();
    initExperienceTabs();
    initEducationTabs();
    initBlogTabs();
    initUnifiedModalTabs();
    initDemoActionButtons();
    initModalCloseButtons();
    initDiscordCopyFeature();
    
    console.log('✅ Demo Page - Toutes les fonctionnalités initialisées');
});

// ============================================================================
// SYSTÈME D'ONGLETS PRINCIPAL (PROJETS)
// ============================================================================

/**
 * Initialise le système d'onglets principal avec sous-onglets
 */
function initDemoTabs() {
    const demoTabs = document.querySelectorAll('.demo-tabs .tab-btn');
    const demoGamesSubtabs = document.getElementById('demo-games-subtabs');
    const demoAppswebSubtabs = document.getElementById('demo-appsweb-subtabs');
    const demoSubtabBtns = document.querySelectorAll('.sub-tabs .sub-tab-btn');
    const projectsDemoText = document.getElementById('projects-demo-text');
    
    // Gestionnaire des onglets principaux
    demoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.demoCategory;
            
            // Mise à jour des boutons
            demoTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            // Gestion des sous-onglets
            showDemoSubtabs(category);
            
            // Mise à jour du texte de démonstration
            updateDemoText(category);
        });
    });
    
    // Gestionnaire des sous-onglets
    demoSubtabBtns.forEach(subtab => {
        subtab.addEventListener('click', () => {
            const subcategory = subtab.dataset.demoSubcategory;
            
            // Détermination de la catégorie parent
            let parentCategory = 'all';
            if (subcategory.startsWith('games-')) {
                parentCategory = 'games';
            } else if (subcategory.startsWith('appsweb-')) {
                parentCategory = 'appsweb';
            }
            
            // Mise à jour des sous-onglets de la même catégorie
            const parentContainer = subtab.closest('.sub-tabs');
            const siblings = parentContainer.querySelectorAll('.sub-tab-btn');
            siblings.forEach(s => s.classList.remove('active'));
            subtab.classList.add('active');
            
            // Mise à jour du texte
            updateDemoText(parentCategory, subcategory);
        });
    });
    
    /**
     * Affiche les sous-onglets appropriés selon la catégorie
     */
    function showDemoSubtabs(category) {
        const demoTabsContainer = document.querySelector('.demo-tabs');
        
        // Masquer tous les sous-onglets
        [demoGamesSubtabs, demoAppswebSubtabs].forEach(container => {
            if (container) container.style.display = 'none';
        });
        
        // Supprimer la classe d'intégration
        if (demoTabsContainer) {
            demoTabsContainer.classList.remove('has-subtabs');
        }
        
        // Afficher les sous-onglets appropriés
        if (category === 'games' && demoGamesSubtabs) {
            demoGamesSubtabs.style.display = 'flex';
            if (demoTabsContainer) demoTabsContainer.classList.add('has-subtabs');
            
            // Réinitialiser à "Tous"
            const allBtn = demoGamesSubtabs.querySelector('[data-demo-subcategory="games-all"]');
            demoGamesSubtabs.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            if (allBtn) allBtn.classList.add('active');
            
        } else if (category === 'appsweb' && demoAppswebSubtabs) {
            demoAppswebSubtabs.style.display = 'flex';
            if (demoTabsContainer) demoTabsContainer.classList.add('has-subtabs');
            
            // Réinitialiser à "Tous"
            const allBtn = demoAppswebSubtabs.querySelector('[data-demo-subcategory="appsweb-all"]');
            demoAppswebSubtabs.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            if (allBtn) allBtn.classList.add('active');
        }
    }
    
    /**
     * Met à jour le texte de démonstration selon la sélection
     */
    function updateDemoText(category, subcategory = null) {
        const icons = {
            'all': '📦', 
            'games': '🎮', 
            'appsweb': '🌐', 
            'mods': '🧩', 
            'tools': '🛠️'
        };
        
        const subIcons = {
            'games-all': '📦', 
            'games-professionnel': '💼', 
            'games-personnel': '🎯', 
            'games-gamejams': '⚡',
            'appsweb-all': '📦', 
            'appsweb-professionnel': '🏢', 
            'appsweb-etude': '🎓'
        };
        
        let text = '';
        if (subcategory && subcategory !== category + '-all') {
            const subName = subcategory.replace('games-', '').replace('appsweb-', '');
            text = `${subIcons[subcategory]} Filtrage par ${subName} dans ${category}`;
        } else {
            text = `${icons[category]} Affichage de ${category === 'all' ? 'tous les projets' : category}`;
        }
        
        if (projectsDemoText) projectsDemoText.textContent = text;
    }

    // Initialisation
    updateDemoText('all');
}

// ============================================================================
// ONGLETS D'EXPÉRIENCE
// ============================================================================

/**
 * Initialise les onglets de la section expérience
 */
function initExperienceTabs() {
    const expTabs = document.querySelectorAll('.experience-tabs .tab-btn');
    const expPanels = document.querySelectorAll('[data-tab]');
    
    expTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Mise à jour des boutons
            expTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mise à jour des panneaux (seulement ceux dans la section expérience)
            const expSection = tab.closest('.demo-section');
            const panels = expSection.querySelectorAll('.demo-tab-panel[data-tab]');
            panels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.tab === tabName);
            });
        });
    });
}

// ============================================================================
// ONGLETS D'ÉDUCATION
// ============================================================================

/**
 * Initialise les onglets de la section éducation
 */
function initEducationTabs() {
    const eduTabs = document.querySelectorAll('.education-tabs .tab-btn');
    eduTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            eduTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ============================================================================
// ONGLETS DE BLOG
// ============================================================================

/**
 * Initialise les onglets de la section blog
 */
function initBlogTabs() {
    const blogTabs = document.querySelectorAll('.blog-tabs .tab-btn');
    blogTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            blogTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ============================================================================
// MODALS UNIFIÉS DEMO
// ============================================================================

/**
 * Initialise les onglets des modals unifiés
 */
function initUnifiedModalTabs() {
    const unifiedModalContainers = document.querySelectorAll('.unified-modal-demo');
    
    unifiedModalContainers.forEach(modalContainer => {
        const tabs = modalContainer.querySelectorAll('.unified-modal-tabs .tab-btn');
        
        // Seulement si ce modal a des onglets
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetTab = this.dataset.tab;
                    
                    // Désactiver tous les onglets de ce modal uniquement
                    tabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    
                    // Masquer tous les panneaux de ce modal
                    modalContainer.querySelectorAll('.unified-modal-panel').forEach(p => {
                        p.classList.remove('active');
                    });
                    
                    // Activer l'onglet cliqué
                    this.classList.add('active');
                    this.setAttribute('aria-selected', 'true');
                    
                    // Afficher le panneau correspondant
                    const targetPanel = modalContainer.querySelector(`[data-panel="${targetTab}"]`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                    }
                });
            });
        }
    });
}

// ============================================================================
// BOUTONS D'ACTION DEMO
// ============================================================================

/**
 * Initialise les gestionnaires des boutons d'action (évite les vraies actions)
 */
function initDemoActionButtons() {
    const demoActionButtons = document.querySelectorAll('.unified-modal-demo .btn-action');
    demoActionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent.trim();
            
            // Animation de retour visuel
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.transform = '';
                this.style.opacity = '';
            }, 150);
            
            // Log pour montrer l'action
            console.log(`Démo - Action: ${action}`);
            
            // Notification visuelle optionnelle
            showDemoNotification(`Action simulée: ${action}`);
        });
    });
}

// ============================================================================
// BOUTONS DE FERMETURE MODAL
// ============================================================================

/**
 * Initialise les gestionnaires des boutons de fermeture
 */
function initModalCloseButtons() {
    const closeButtons = document.querySelectorAll('.unified-modal-demo .unified-modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Démo - Modal fermé');
            
            // Animation de retour visuel
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            showDemoNotification('Modal fermé (démonstration)');
        });
    });
}

// ============================================================================
// FONCTIONNALITÉ COPIE DISCORD
// ============================================================================

/**
 * Initialise la fonctionnalité de copie de l'ID Discord
 */
function initDiscordCopyFeature() {
    const copyDiscordBtn = document.querySelector('.unified-modal-demo .discord-id-display .btn-action');
    if (copyDiscordBtn) {
        copyDiscordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const discordId = this.parentElement.querySelector('.discord-id').textContent;
            
            // Tentative de copie réelle
            if (navigator.clipboard) {
                navigator.clipboard.writeText(discordId).then(() => {
                    showCopySuccess(this);
                }).catch(() => {
                    showCopyFallback(this, discordId);
                });
            } else {
                showCopyFallback(this, discordId);
            }
        });
    }
}

/**
 * Affiche le succès de la copie
 */
function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="icon">✅</span> Copié !';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

/**
 * Affiche la copie de repli (simulation)
 */
function showCopyFallback(button, discordId) {
    console.log(`Discord ID copié (simulation): ${discordId}`);
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="icon">✅</span> Copié !';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

// ============================================================================
// UTILITAIRES DE NOTIFICATION
// ============================================================================

/**
 * Affiche une notification temporaire pour les démonstrations
 */
function showDemoNotification(message, duration = 3000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'demo-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--demo-glass-bg, rgba(255, 255, 255, 0.1));
        color: var(--demo-text-primary, white);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--demo-glass-border, rgba(255, 255, 255, 0.2));
        backdrop-filter: blur(10px);
        z-index: 10000;
        font-size: 0.9rem;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animation de sortie et suppression
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ============================================================================
// UTILITAIRES DE DÉBOGAGE
// ============================================================================

/**
 * Fonction de débogage pour afficher les informations de la demo
 */
function debugDemo() {
    console.group('🎨 Demo Page - Informations de débogage');
    console.log('Onglets principaux:', document.querySelectorAll('.demo-tabs .tab-btn').length);
    console.log('Sous-onglets:', document.querySelectorAll('.sub-tabs .sub-tab-btn').length);
    console.log('Modals unifiés:', document.querySelectorAll('.unified-modal-demo').length);
    console.log('Boutons d\'action demo:', document.querySelectorAll('.unified-modal-demo .btn-action').length);
    console.groupEnd();
}

// Exposer la fonction de débogage globalement pour les développeurs
window.debugDemo = debugDemo;

// ============================================================================
// FONCTIONS DE TEST POUR LES MODALS
// ============================================================================

/**
 * Teste l'ouverture du modal de compétence
 */
function openTestSkillModal() {
    if (typeof openSkillModal === 'function') {
        openSkillModal('C#', '/images/technologies/CSharp.svg', '', '4', 'svg');
    } else {
        showDemoNotification('Skill Modal fonction non disponible. Allez sur la page d\'accueil et cliquez sur C# dans les compétences.');
    }
}

/**
 * Teste l'ouverture du modal de contact
 */
function openTestContactModal() {
    if (typeof window.UnifiedModal !== 'undefined') {
        window.UnifiedModal.create({
            type: 'contact',
            title: 'Contactez-moi',
            icon: '📬',
            content: {
                contacts: [
                    { icon: '📧', title: 'Email', value: 'clement.g.developer@gmail.com', link: 'mailto:clement.g.developer@gmail.com' },
                    { icon: '/images/social/linkedin.svg', title: 'LinkedIn', value: 'linkedin.com/in/clixmods', link: 'https://linkedin.com/in/clixmods', external: true },
                    { icon: '📍', title: 'Localisation', value: 'Montpellier' }
                ]
            }
        });
    } else {
        showDemoNotification('Unified Modal non disponible.');
    }
}

/**
 * Teste l'ouverture du modal de personne
 */
function openTestPersonModal() {
    if (typeof openPersonModal === 'function') {
        // Utiliser le profil principal
        openPersonModal('clement-garcia');
    } else {
        showDemoNotification('Person Modal fonction non disponible. Visitez la section testimonials pour voir les modals de personnes.');
    }
}

/**
 * Teste l'ouverture du modal Discord
 */
function openTestDiscordModal() {
    if (typeof window.UnifiedModal !== 'undefined') {
        window.UnifiedModal.create({
            type: 'discord',
            title: 'Mon Discord',
            icon: '/images/social/discord.svg',
            content: { discordId: 'clixmods' }
        });
    }
}

/**
 * Teste l'ouverture du popup d'actions
 */
function openTestActionsPopup() {
    // Chercher un bouton "..." dans la page ou créer un popup de test
    const moreButton = document.querySelector('.btn-more, .more-actions-btn');
    if (moreButton) {
        moreButton.click();
    } else {
        showDemoNotification('Actions Popup: Allez sur une page de projet et cliquez sur le bouton "..." pour voir le popup d\'actions.');
    }
}

// Exposer les fonctions de test globalement
window.openTestSkillModal = openTestSkillModal;
window.openTestContactModal = openTestContactModal;
window.openTestPersonModal = openTestPersonModal;
window.openTestDiscordModal = openTestDiscordModal;
window.openTestActionsPopup = openTestActionsPopup;