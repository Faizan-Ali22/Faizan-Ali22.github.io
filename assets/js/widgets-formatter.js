/**
 * Initialisation des widgets avec formatage des nombres et calculs automatiques
 */

document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que NumberFormatter est disponible
    if (typeof window.NumberFormatter === 'undefined') {
        console.warn('NumberFormatter not available, skipping number formatting');
        return;
    }

    const formatter = window.NumberFormatter;

    /**
     * Formate les éléments restants avec data-count (si nécessaire en fallback)
     */
    function formatNumbers() {
        // Cette fonction est maintenant principalement un fallback
        // Le formatage principal est fait côté serveur Hugo
        const countElements = document.querySelectorAll('[data-count]:not([data-formatted="true"])');
        
        if (countElements.length === 0) return;
        
        console.log('Formatage JS en fallback pour', countElements.length, 'éléments');
        
        countElements.forEach(element => {
            const countString = element.dataset.count;
            const count = parseInt(countString, 10);
            
            if (isNaN(count) || !countString) return;

            try {
                const formattedNumber = formatter.format(count);
                const currentText = element.textContent || element.innerText || '';
                
                // Remplacer seulement si le nombre brut est encore présent
                if (currentText.includes(countString) && !currentText.includes(' ')) {
                    const updatedText = currentText.replace(countString, formattedNumber);
                    element.textContent = updatedText;
                }
                
                element.dataset.formatted = 'true';
                
            } catch (error) {
                console.error('Error formatting number:', error, element);
            }
        });
    }

    /**
     * Calcule et affiche les pourcentages automatiquement (fallback seulement)
     */
    function calculatePercentages() {
        // Cette fonction est maintenant principalement un fallback
        // Le calcul principal est fait côté serveur Hugo
        const percentageElements = document.querySelectorAll('[data-part][data-total]:empty');
        
        if (percentageElements.length === 0) return;
        
        console.log('Calcul JS en fallback pour', percentageElements.length, 'pourcentages');
        
        percentageElements.forEach(element => {
            const part = parseInt(element.dataset.part, 10);
            const total = parseInt(element.dataset.total, 10);
            
            if (isNaN(part) || isNaN(total) || total === 0) {
                element.style.display = 'none';
                return;
            }

            const percentage = formatter.calculatePercentage(part, total, 1);
            const formattedPercentage = formatter.formatPercentage(percentage, 1);
            
            element.textContent = `${formattedPercentage} du total`;
            element.style.display = 'block';
        });
    }

    /**
     * Ajoute des classes CSS selon la position dans le ranking
     */
    function enhanceRankingDisplay() {
        const positionElements = document.querySelectorAll('.position-number');
        
        positionElements.forEach(element => {
            const positionText = element.textContent || element.innerText;
            const position = parseInt(positionText, 10);
            
            if (isNaN(position)) return;

            // Ajouter des classes pour le styling spécial
            element.classList.remove('position-1', 'position-2', 'position-3', 'position-top10');
            
            if (position === 1) {
                element.classList.add('position-1');
            } else if (position === 2) {
                element.classList.add('position-2');
            } else if (position === 3) {
                element.classList.add('position-3');
            } else if (position <= 10) {
                element.classList.add('position-top10');
            }
        });
    }

    /**
     * Initialise tous les widgets
     */
    function initializeWidgets() {
        // Le formatage des nombres est maintenant fait côté serveur
        // Ces fonctions ne servent que de fallback
        formatNumbers();
        calculatePercentages();
        enhanceRankingDisplay();
    }

    // Initialisation au chargement
    initializeWidgets();

    // Réinitialiser quand les modals s'ouvrent (en cas de contenu dynamique)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.project-widget')) {
            // Délai pour permettre à l'animation d'ouverture de se terminer
            setTimeout(initializeWidgets, 100);
        }
    });

    // Observer les changements DOM pour le contenu dynamique
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    const hasRelevantNodes = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === Node.ELEMENT_NODE && (
                            node.querySelector && (
                                node.querySelector('[data-count]') ||
                                node.querySelector('[data-part]') ||
                                node.querySelector('.position-number')
                            )
                        )
                    );
                    
                    if (hasRelevantNodes) {
                        shouldUpdate = true;
                    }
                }
            });
            
            if (shouldUpdate) {
                initializeWidgets();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});