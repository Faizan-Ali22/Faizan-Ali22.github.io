/**
 * Utilitaires de formatage des nombres selon la locale
 * Supports les formats français (800 000) et anglais (800,000)
 */

class NumberFormatter {
    constructor() {
        // Détecter la langue du site
        this.locale = this.detectLocale();
    }

    /**
     * Détecte la locale actuelle depuis Hugo
     * @returns {string} Code de langue (fr, en, etc.)
     */
    detectLocale() {
        // Essayer plusieurs méthodes de détection
        if (typeof window !== 'undefined') {
            // 1. Depuis l'attribut HTML lang
            const htmlLang = document.documentElement.lang;
            if (htmlLang) return htmlLang;

            // 2. Depuis l'URL (/en/...)
            const pathLang = window.location.pathname.match(/^\/([a-z]{2})\//);
            if (pathLang) return pathLang[1];

            // 3. Depuis une variable Hugo injectée
            if (window.hugoSite && window.hugoSite.language) {
                return window.hugoSite.language;
            }
        }

        // Défaut : français
        return 'fr';
    }

    /**
     * Formate un nombre selon la locale
     * @param {number} number - Nombre à formater
     * @param {object} options - Options de formatage
     * @returns {string} Nombre formaté
     */
    format(number, options = {}) {
        // Conversion et validation robuste
        const numericValue = typeof number === 'string' ? parseFloat(number) : number;
        
        if (typeof numericValue !== 'number' || !isFinite(numericValue)) {
            console.warn('NumberFormatter.format: Invalid number:', number);
            return String(number);
        }

        const {
            minimumFractionDigits = 0,
            maximumFractionDigits = 0,
            useGrouping = true
        } = options;

        try {
            // Utiliser l'API Intl.NumberFormat si disponible
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                return new Intl.NumberFormat(this.locale, {
                    minimumFractionDigits,
                    maximumFractionDigits,
                    useGrouping
                }).format(numericValue);
            }

            // Fallback manuel
            return this.manualFormat(numericValue, options);
        } catch (error) {
            console.warn('NumberFormatter.format error:', error, 'for number:', number);
            return this.manualFormat(numericValue, options);
        }
    }

    /**
     * Formatage manuel en cas d'absence d'Intl.NumberFormat
     * @param {number} number - Nombre à formater
     * @param {object} options - Options de formatage
     * @returns {string} Nombre formaté
     */
    manualFormat(number, options = {}) {
        const { useGrouping = true } = options;
        
        // Validation supplémentaire
        if (typeof number !== 'number' || !isFinite(number)) {
            return String(number);
        }
        
        if (!useGrouping) {
            return String(Math.round(number));
        }

        const parts = String(Math.round(number)).split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];

        // Ajouter les séparateurs de milliers selon la locale
        const separator = this.locale === 'fr' ? ' ' : ',';
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

        return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    }

    /**
     * Formate un nombre avec suffixe (K, M, B)
     * @param {number} number - Nombre à formater
     * @param {object} options - Options de formatage
     * @returns {string} Nombre formaté avec suffixe
     */
    formatWithSuffix(number, options = {}) {
        const { precision = 1 } = options;

        if (number < 1000) {
            return this.format(number);
        }

        const suffixes = this.locale === 'fr' ? 
            ['', 'K', 'M', 'Md', 'B'] : 
            ['', 'K', 'M', 'B', 'T'];

        const magnitude = Math.floor(Math.log10(Math.abs(number)) / 3);
        const scaledNumber = number / Math.pow(1000, magnitude);

        const formattedNumber = this.format(scaledNumber, { 
            maximumFractionDigits: precision 
        });

        return `${formattedNumber}${suffixes[magnitude] || ''}`;
    }

    /**
     * Calcule automatiquement le pourcentage
     * @param {number} part - Partie
     * @param {number} total - Total
     * @param {number} precision - Précision décimale
     * @returns {number} Pourcentage
     */
    calculatePercentage(part, total, precision = 1) {
        if (!total || total === 0) return 0;
        const percentage = (part / total) * 100;
        return Math.round(percentage * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    /**
     * Formate un pourcentage
     * @param {number} percentage - Pourcentage à formater
     * @param {number} precision - Précision décimale
     * @returns {string} Pourcentage formaté
     */
    formatPercentage(percentage, precision = 1) {
        return this.format(percentage, { maximumFractionDigits: precision }) + '%';
    }
}

// Instance globale
window.NumberFormatter = window.NumberFormatter || new NumberFormatter();

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberFormatter;
}