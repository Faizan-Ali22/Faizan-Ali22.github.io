# Unified Modal System - Architecture Modulaire

Ce dossier contient tous les types de modals unifiés séparés en fichiers individuels pour une meilleure organisation et maintenabilité.

## 🏗️ Structure

```
modals-unified/
├── README.md                                    # Ce fichier
├── demo-section-modals-unified-skill.html      # Modal compétences/technologies  
├── demo-section-modals-unified-person.html     # Modal profil/personne
├── demo-section-modals-unified-contact.html    # Modal contact/formulaire
├── demo-section-modals-unified-discord.html    # Modal Discord
└── demo-section-modals-unified-actions.html    # Modal actions projet
```

## 📋 Types de Modals

### 1. **Skill/Technology Modal** (`demo-section-modals-unified-skill.html`)
- **Usage** : Afficher les compétences techniques, technologies, langages
- **Features** : Système de tabs (Projets, Expériences, Formations)
- **Icône** : 🛠️
- **Remplace** : `skill-modal`

### 2. **Person/Profile Modal** (`demo-section-modals-unified-person.html`)
- **Usage** : Profils de personnes, collaborateurs, équipe
- **Features** : Avatar, boutons sociaux, tabs personnalisables
- **Icône** : 👤
- **Remplace** : `person-modal`

### 3. **Contact Modal** (`demo-section-modals-unified-contact.html`)
- **Usage** : Formulaires de contact, coordonnées
- **Features** : Layout 2 colonnes (coordonnées + formulaire)
- **Icône** : 📬
- **Remplace** : `contact-modal`

### 4. **Discord Modal** (`demo-section-modals-unified-discord.html`)
- **Usage** : Affichage ID Discord, liens directs
- **Features** : Copie automatique, ouverture app Discord
- **Icône** : 💬
- **Remplace** : `discord-modal`

### 5. **Project Actions Modal** (`demo-section-modals-unified-actions.html`)
- **Usage** : Actions rapides sur projets (télécharger, docs, etc.)
- **Features** : Liste d'actions configurables
- **Icône** : ⚡
- **Remplace** : `actions-popup`

## 🔧 Utilisation

### Dans Hugo Templates
```go
{{/* Inclure un modal spécifique */}}
{{ partial "demo/modals-unified/demo-section-modals-unified-skill.html" . }}

{{/* Inclure tous les modals */}}
{{ partial "demo/modals-unified/demo-section-modals-unified-skill.html" . }}
{{ partial "demo/modals-unified/demo-section-modals-unified-person.html" . }}
{{ partial "demo/modals-unified/demo-section-modals-unified-contact.html" . }}
{{ partial "demo/modals-unified/demo-section-modals-unified-discord.html" . }}
{{ partial "demo/modals-unified/demo-section-modals-unified-actions.html" . }}
```

### Avec JavaScript (API UnifiedModal)
```javascript
// Modal skill/technologie
UnifiedModal.create({
    type: 'skill',
    title: 'C#',
    icon: '/images/technologies/CSharp.svg',
    chips: [
        { text: 'Avancé', type: 'primary' },
        { text: '4 ans d\'expérience', type: 'secondary' }
    ],
    tabs: [
        { key: 'projects', icon: '💼', label: 'Projets', count: 12, active: true },
        { key: 'experiences', icon: '🏢', label: 'Expériences', count: 3 }
    ],
    content: {
        projects: '<div class="projects-grid">...</div>',
        experiences: '<div class="experiences-list">...</div>'
    }
});

// Modal contact
UnifiedModal.create({
    type: 'contact',
    title: 'Contactez-moi',
    icon: '📬',
    chips: [
        { text: 'Disponible pour projets', type: 'primary' }
    ]
});

// Modal Discord
UnifiedModal.create({
    type: 'discord',
    title: 'Mon Discord',
    icon: '/images/social/discord.svg',
    chips: [
        { text: 'Actif quotidiennement', type: 'accent' }
    ],
    content: {
        discordId: 'clixmods'
    }
});
```

## 🎨 Personnalisation

### Ajouter un nouveau type de modal

1. **Créer le fichier HTML** : `demo-section-modals-unified-[TYPE].html`
2. **Ajouter le template JavaScript** dans `unified-modal-system.js` :
```javascript
CONTENT_TEMPLATES[TYPE] = (config) => `
    <div class="unified-modal-simple-content">
        <!-- Votre contenu -->
    </div>
`;
```
3. **Ajouter les styles** dans `unified-modal.scss`
4. **Inclure dans le fichier principal** : `{{ partial "demo/modals-unified/demo-section-modals-unified-[TYPE].html" . }}`

### Modifier un modal existant

Éditez directement le fichier correspondant dans `/modals-unified/`. Les changements seront automatiquement reflétés.

## ⚡ Avantages de cette architecture

- **✅ Modularité** : Chaque modal dans son propre fichier
- **✅ Réutilisabilité** : Inclure seulement les modals nécessaires
- **✅ Maintenabilité** : Modifications isolées par type
- **✅ Performance** : Chargement conditionnel possible
- **✅ Clarté** : Code organisé et facile à comprendre
- **✅ Extensibilité** : Ajouter nouveaux types facilement

## 🔗 Fichiers liés

- **JavaScript** : `/themes/portfolio.theme/assets/js/unified-modal-system.js`
- **CSS** : `/themes/portfolio.theme/assets/scss/unified-modal.scss`
- **Fichier principal** : `/themes/portfolio.theme/layouts/_partials/demo/demo-section-modals-unified.html`

---

*Architecture créée le 21 septembre 2025 - Système modulaire pour Hugo*