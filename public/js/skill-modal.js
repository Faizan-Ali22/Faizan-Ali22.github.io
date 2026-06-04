// Skill/technology modal management
let skillModalData = null;

// ================================
// LOCALIZATION SYSTEM
// ================================

/**
 * Detect current language from HTML lang attribute or URL
 */
function getSkillModalLang() {
    // Check URL for /en/ prefix first (most reliable)
    const pathname = window.location.pathname;
    if (pathname.startsWith('/en/') || pathname === '/en') return 'en';
    
    // Check HTML lang attribute
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) {
        if (htmlLang.startsWith('en')) return 'en';
        if (htmlLang.startsWith('fr')) return 'fr';
    }
    
    // Default to French
    return 'fr';    
}

/**
 * Translations for the skill modal
 */
const SKILL_MODAL_TRANSLATIONS = {
    fr: {
        // Loading states
        loading_projects: "Chargement des projets...",
        loading_experiences: "Chargement des expériences...",
        loading_educations: "Chargement des formations...",
        
        // Empty states
        no_projects: "Aucun projet trouvé pour cette technologie.",
        no_projects_sub: "De nouveaux projets arrivent bientôt !",
        no_experiences: "Aucune expérience professionnelle trouvée pour cette technologie.",
        no_experiences_sub: "Cette compétence a été développée dans un contexte personnel ou académique.",
        no_educations: "Aucune formation trouvée pour cette technologie.",
        no_educations_sub: "Cette compétence a été développée de manière autodidacte ou professionnelle.",
        
        // Error states
        error_loading_projects: "Erreur lors du chargement des projets.",
        error_loading_experiences: "Erreur lors du chargement des expériences.",
        error_loading_educations: "Erreur lors du chargement des formations.",
        please_refresh: "Veuillez rafraîchir la page.",
        
        // Experience info
        years_experience_singular: "an d'expérience",
        years_experience_plural: "ans d'expérience",
        position: "Poste",
        present: "Présent",
        education_label: "Formation",
        
        // Actions
        view_details: "Voir les détails",
        view_project: "Voir le projet",
        confidential: "Confidentiel",
        
        // Default descriptions
        default_project_description: "Découvrez ce projet innovant et ses fonctionnalités."
    },
    en: {
        // Loading states
        loading_projects: "Loading projects...",
        loading_experiences: "Loading experiences...",
        loading_educations: "Loading educations...",
        
        // Empty states
        no_projects: "No project found for this technology.",
        no_projects_sub: "New projects coming soon!",
        no_experiences: "No professional experience found for this technology.",
        no_experiences_sub: "This skill was developed in a personal or academic context.",
        no_educations: "No education found for this technology.",
        no_educations_sub: "This skill was developed through self-learning or professionally.",
        
        // Error states
        error_loading_projects: "Error loading projects.",
        error_loading_experiences: "Error loading experiences.",
        error_loading_educations: "Error loading educations.",
        please_refresh: "Please refresh the page.",
        
        // Experience info
        years_experience_singular: "year of experience",
        years_experience_plural: "years of experience",
        position: "Position",
        present: "Present",
        education_label: "Education",
        
        // Actions
        view_details: "View details",
        view_project: "View project",
        confidential: "Confidential",
        
        // Default descriptions
        default_project_description: "Discover this innovative project and its features."
    }
};

/**
 * Get a translated string for skill modal
 */
function ts(key) {
    const lang = getSkillModalLang();
    return SKILL_MODAL_TRANSLATIONS[lang]?.[key] || SKILL_MODAL_TRANSLATIONS['fr'][key] || key;
}

/**
 * Get locale string for date formatting
 */
function getDateLocale() {
    return getSkillModalLang() === 'en' ? 'en-US' : 'fr-FR';
}

// Utility: check if ANY overlay modal (unified / skill / person) remains open
function isAnyOverlayModalStillOpen(excludeId) {
    const ids = ['unifiedModal','skillModal','personModal'];
    return ids.some(id => {
        if (id === excludeId) return false; // ignore the one we are closing
        const el = document.getElementById(id);
        if (!el) return false;
        const display = (el.style && el.style.display) ? el.style.display : window.getComputedStyle(el).display;
        return display && display !== 'none';
    });
}

// Function to open modal with skill details
// skillKey is the data key (e.g., 'lang_csharp') used for filtering - optional for backward compatibility
function openSkillModal(name, icon, level, experience, iconType, skillKey) {
    const modal = document.getElementById('skillModal');
    const modalName = document.getElementById('modalSkillName');
    const modalIcon = document.getElementById('modalSkillIcon');
    const modalLevel = document.getElementById('modalSkillLevel');
    const modalExperience = document.getElementById('modalSkillExperience');
    
    // Store the skill key for filtering (use name as fallback for backward compatibility)
    const searchKey = skillKey || name;
    
    // Track skill modal opened for trophy system
    localStorage.setItem('skillModalOpened', 'true');
    
    // Check trophies after a short delay
    if (window.trophySystem) {
        setTimeout(() => window.trophySystem.checkTrophies(), 500);
    }
    
    // Fill basic information
    modalName.textContent = name;
    // Level chip: hide if unspecified ('Non spécifié') or empty
    try {
        if (modalLevel) {
            let hideLevel = false;
            let levelText = '';
            if (level === null || level === undefined) {
                hideLevel = true;
            } else {
                const rawLevel = String(level).trim();
                if (!rawLevel) {
                    hideLevel = true;
                } else {
                    const normalized = rawLevel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    if (normalized === 'non specifie') {
                        hideLevel = true;
                    } else {
                        levelText = rawLevel;
                    }
                }
            }
            if (hideLevel) {
                modalLevel.textContent = '';
                modalLevel.style.display = 'none';
                modalLevel.hidden = true;
            } else {
                modalLevel.textContent = levelText;
                modalLevel.style.display = '';
                modalLevel.hidden = false;
            }
        }
    } catch (e) { /* no-op */ }
    // Experience chip: hide if unspecified or 0, otherwise format as "X an(s) d'expérience"
    try {
        if (modalExperience) {
            let shouldHide = false;
            let years = 0;

            if (experience === null || experience === undefined) {
                shouldHide = true;
            } else if (typeof experience === 'number') {
                years = experience;
                shouldHide = !(years > 0);
            } else {
                const raw = String(experience).trim();
                if (!raw) {
                    shouldHide = true;
                } else {
                    const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    if (normalized === 'non specifie') {
                        shouldHide = true;
                    } else {
                        const parsed = parseFloat(raw.replace(/[^0-9.,-]/g, '').replace(',', '.'));
                        if (!isNaN(parsed)) {
                            years = parsed;
                        }
                        shouldHide = !(years > 0);
                    }
                }
            }

            if (shouldHide) {
                modalExperience.textContent = '';
                modalExperience.style.display = 'none';
                modalExperience.hidden = true;
            } else {
                const isOne = Math.abs(years - 1) < 1e-9;
                const yearsStr = Number.isInteger(years) ? years.toString() : years.toLocaleString(getDateLocale(), { maximumFractionDigits: 1 });
                const lang = getSkillModalLang();
                const singularText = ts('years_experience_singular');
                const pluralText = ts('years_experience_plural');
                console.log('🔍 Skill Modal Debug:', { lang, years, isOne, singularText, pluralText });
                modalExperience.textContent = `${yearsStr} ${isOne ? singularText : pluralText}`;
                modalExperience.style.display = '';
                modalExperience.hidden = false;
            }
        }
    } catch (e) {
        // No-op: in case of DOM issues, fail silently as per French-first UX
    }
    
    // Handle icon
    if (iconType === 'svg') {
        modalIcon.innerHTML = `<img src="${icon}" alt="${name}" class="skill-modal-tech-icon-svg" width="48" height="48">`;
    } else {
        modalIcon.innerHTML = `<span class="skill-modal-tech-icon-emoji">${icon}</span>`;
    }
    
    // Load associated projects (use searchKey for filtering)
    loadProjectsForSkill(searchKey);
    
    // Load associated professional experiences (use searchKey for filtering)
    loadExperiencesForSkill(searchKey);
    
    // Load associated educations (use searchKey for filtering)
    loadEducationsForSkill(searchKey);
    
    // Pause all testimonials before showing modal
    if (typeof window.pauseAllTestimonials === 'function') {
        window.pauseAllTestimonials();
    }
    
    // If a unified modal is currently open, mark this as nested and reduce parent backdrop intensity
    try {
        const unified = document.getElementById('unifiedModal');
        if (unified && unified.style.display !== 'none') {
            modal.classList.add('skill-modal--nested');
            unified.classList.add('unified-modal--nested-parent');
            // Lower parent z-index slightly so nested sits above (CSS override ensures ordering)
            unified.style.zIndex = '10000';
        }
    } catch(e) { /* no-op */ }

    // Show modal with unified-like animation
    modal.classList.remove('fade-exit', 'fade-exit-active');
    modal.style.display = 'block';
    // Force reflow
    modal.offsetHeight;
    modal.classList.add('fade-enter');
    requestAnimationFrame(() => {
        modal.classList.add('fade-enter-active');
    });
    document.body.style.overflow = 'hidden'; // Prevent page scrolling
    
    // Recreate dropdown immediately after modal is displayed
    if (typeof window.recreateTabsDropdown === 'function') {
        window.recreateTabsDropdown('skillModal');
    }
}

// Function to close modal
function closeSkillModal() {
    const modal = document.getElementById('skillModal');
    
    // Resume all testimonials when closing modal
    if (typeof window.resumeAllTestimonials === 'function') {
        window.resumeAllTestimonials();
    }
    
    // Animate close like unified modal
    modal.classList.remove('fade-enter', 'fade-enter-active');
    modal.classList.add('fade-exit');
    modal.offsetHeight; // reflow
    modal.classList.add('fade-exit-active');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('fade-exit', 'fade-exit-active', 'skill-modal--nested');
        // Restore parent state(s)
        try {
            const unified = document.getElementById('unifiedModal');
            if (unified && unified.classList.contains('unified-modal--nested-parent')) {
                // Only remove nested state if no other child modal still open
                unified.classList.remove('unified-modal--nested-parent');
                unified.style.zIndex = '10000';
            }
        } catch(e) { /* no-op */ }
        // Body scroll: only restore if NOTHING else is open
        if (isAnyOverlayModalStillOpen()) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, 300);
}

// Function to load projects associated with a skill/technology
function loadProjectsForSkill(skillName) {
    const projectsList = document.getElementById('modalProjectsList');
    projectsList.innerHTML = `<div class="loading">${ts('loading_projects')}</div>`;
    
    try {
        // Use data embedded in page instead of making API request
        const projects = window.portfolioProjects || [];

        displayProjects(projects, skillName, projectsList);
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = `<div class="no-projects">❌ ${ts('error_loading_projects')}<br/>${ts('please_refresh')}</div>`;
    }
}

// Function to load professional experiences associated with a skill/technology
function loadExperiencesForSkill(skillName) {
    const experiencesList = document.getElementById('modalExperiencesList');
    experiencesList.innerHTML = `<div class="loading">${ts('loading_experiences')}</div>`;
    
    try {
        // Use data embedded in page instead of making API request
        const experiences = window.portfolioExperiences || [];

        displayExperiences(experiences, skillName, experiencesList);
    } catch (error) {
        console.error('Error loading experiences:', error);
        experiencesList.innerHTML = `<div class="skill-modal-no-experiences">❌ ${ts('error_loading_experiences')}<br/>${ts('please_refresh')}</div>`;
    }
}

// Function to load educations associated with a skill/technology
function loadEducationsForSkill(skillName) {
    const educationsList = document.getElementById('modalEducationsList');
    educationsList.innerHTML = `<div class="loading">${ts('loading_educations')}</div>`;
    
    try {
        // Use data embedded in page instead of making API request
        const educations = window.portfolioEducations || [];

        displayEducations(educations, skillName, educationsList);
    } catch (error) {
        console.error('Error loading educations:', error);
        educationsList.innerHTML = `<div class="skill-modal-no-educations">❌ ${ts('error_loading_educations')}<br/>${ts('please_refresh')}</div>`;
    }
}

// Function to display filtered projects with new PS5 design
function displayProjects(projects, skillName, projectsList) {
    
    const relatedProjects = projects.filter(project => {

    
        let technologies = project.technologies;
        
        // If it's a string, try to parse it as JSON
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
    
            } catch (e) {
                console.log(`❌ JSON parsing error for "${project.title}":`, e.message);
                return false;
            }
        }
        
        if (!technologies || !Array.isArray(technologies)) {
            console.log(`❌ Project "${project.title}" rejected: invalid or missing technologies`);
            return false;
        }
        
        // Exact search and also case-insensitive search
        const hasSkill = technologies.some(tech => {
            const exactMatch = tech === skillName;
            const caseInsensitiveMatch = tech.toLowerCase() === skillName.toLowerCase();
    
            return exactMatch || caseInsensitiveMatch;
        });
        
        if (hasSkill) {
        
        } else {
            console.log(`❌ Project "${project.title}" rejected: no matching technology`);
        }
        return hasSkill;
    });
    
    relatedProjects.forEach(p => console.log(`- ${p.title}`));
    
    if (relatedProjects.length === 0) {
        projectsList.classList.add('empty-state');
        projectsList.innerHTML = `<div class="skill-modal-no-projects">🚀 ${ts('no_projects')}<br/>${ts('no_projects_sub')}</div>`;
        return;
    }
    
    // Clear list and create DOM elements properly
    projectsList.classList.remove('empty-state');
    projectsList.innerHTML = '';
    
    relatedProjects.forEach(project => {
        // Ensure technologies are an array for display
        let technologies = project.technologies;
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
            } catch (e) {
                technologies = [];
            }
        }
        
        // Clean project before using it
        const cleanedProject = cleanProject(project);
        

        
        // Create main project tile element
        const projectTile = createProjectTile(cleanedProject, technologies);
        projectsList.appendChild(projectTile);
    });
}

// Fonction pour afficher les expériences professionnelles filtrées
function displayExperiences(experiences, skillName, experiencesList) {
    
    const relatedExperiences = experiences.filter(experience => {
     
        
        let technologies = experience.technologies;
        
        // Si c'est une string, essayer de la parser en JSON
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
               
            } catch (e) {
                console.log(`❌ Erreur de parsing JSON pour "${experience.title}":`, e.message);
                return false;
            }
        }
        
        if (!technologies || !Array.isArray(technologies)) {
            console.log(`❌ Expérience "${experience.title}" rejetée: technologies invalides ou manquantes`);
            return false;
        }
        
        // Recherche exacte et aussi recherche insensible à la casse
        const hasSkill = technologies.some(tech => {
            const exactMatch = tech === skillName;
            const caseInsensitiveMatch = tech.toLowerCase() === skillName.toLowerCase();
         
            return exactMatch || caseInsensitiveMatch;
        });
        
        if (hasSkill) {
            
        } else {
            console.log(`❌ Expérience "${experience.title}" rejetée: aucune technologie correspondante`);
        }
        return hasSkill;
    });

    
    if (relatedExperiences.length === 0) {
        experiencesList.classList.add('empty-state');
        experiencesList.innerHTML = `<div class="skill-modal-no-experiences">💼 ${ts('no_experiences')}<br/>${ts('no_experiences_sub')}</div>`;
        return;
    }
    
    // Vider la liste et créer les éléments DOM proprement
    experiencesList.classList.remove('empty-state');
    experiencesList.innerHTML = '';
    
    relatedExperiences.forEach(experience => {
        // S'assurer que les technologies sont un tableau pour l'affichage
        let technologies = experience.technologies;
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
            } catch (e) {
                technologies = [];
            }
        }
        
        // Nettoyer l'expérience avant de l'utiliser
        const cleanedExperience = cleanExperience(experience);
        
  
        
        // Créer l'élément principal de l'expérience
        const experienceItem = createExperienceItem(cleanedExperience, technologies);
        experiencesList.appendChild(experienceItem);
    });
}

// Fonction pour nettoyer un objet expérience de tous ses guillemets superflus
function cleanExperience(experience) {
    const cleaned = {};
    for (const [key, value] of Object.entries(experience)) {
        cleaned[key] = cleanJsonValue(value);
    }
    return cleaned;
}

// Fonction pour afficher les formations filtrées
function displayEducations(educations, skillName, educationsList) {
  
    
    const relatedEducations = educations.filter(education => {
   
        let technologies = education.technologies;
        let tools = education.tools;
        
        // Si c'est une string, essayer de la parser en JSON
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
        
            } catch (e) {
                console.log(`❌ Erreur de parsing JSON pour "${education.title}":`, e.message);
                technologies = [];
            }
        }
        
        // Parser les outils si c'est une string
        if (typeof tools === 'string') {
            try {
                tools = JSON.parse(tools);
            } catch (e) {
                console.log(`❌ Erreur de parsing JSON des outils pour "${education.title}":`, e.message);
                tools = [];
            }
        }
        
        // Assurer que technologies et tools sont des tableaux
        if (!technologies || !Array.isArray(technologies)) {
            technologies = [];
        }
        
        if (!tools || !Array.isArray(tools)) {
            tools = [];
        }
        
        // Recherche dans les technologies
        const hasSkillInTechnologies = technologies.some(tech => {
            const exactMatch = tech === skillName;
            const caseInsensitiveMatch = tech.toLowerCase() === skillName.toLowerCase();
            console.log(`  Comparaison technologies: "${tech}" vs "${skillName}" -> exact: ${exactMatch}, insensible: ${caseInsensitiveMatch}`);
            return exactMatch || caseInsensitiveMatch;
        });
        
        // Recherche dans les outils (tools)
        const hasSkillInTools = tools.some(toolItem => {
            // Les outils peuvent être des objets {tool: "nom", ...} ou des strings
            const toolName = typeof toolItem === 'object' && toolItem !== null ? toolItem.tool : toolItem;
            if (!toolName) return false;
            
            const exactMatch = toolName === skillName;
            const caseInsensitiveMatch = toolName.toLowerCase() === skillName.toLowerCase();
            console.log(`  Comparaison outils: "${toolName}" vs "${skillName}" -> exact: ${exactMatch}, insensible: ${caseInsensitiveMatch}`);
            return exactMatch || caseInsensitiveMatch;
        });
        
        const hasSkill = hasSkillInTechnologies || hasSkillInTools;
        
        if (hasSkill) {
            console.log(`✅ Formation "${education.title}" trouvée avec ${hasSkillInTechnologies ? 'technologies' : 'outils'}`);
        } else {
            console.log(`❌ Formation "${education.title}" rejetée: aucune technologie/outil correspondant`);
        }
        return hasSkill;
    });
    
    relatedEducations.forEach(e => console.log(`- ${e.title} à ${e.institution}`));
    
    if (relatedEducations.length === 0) {
        educationsList.classList.add('empty-state');
        educationsList.innerHTML = `<div class="skill-modal-no-educations">🎓 ${ts('no_educations')}<br/>${ts('no_educations_sub')}</div>`;
        return;
    }
    
    // Vider la liste et créer les éléments DOM proprement
    educationsList.classList.remove('empty-state');
    educationsList.innerHTML = '';
    
    relatedEducations.forEach(education => {
        // S'assurer que les technologies sont un tableau pour l'affichage
        let technologies = education.technologies;
        if (typeof technologies === 'string') {
            try {
                technologies = JSON.parse(technologies);
            } catch (e) {
                technologies = [];
            }
        }
        
        // Nettoyer la formation avant de l'utiliser
        const cleanedEducation = cleanEducation(education);
        
        // Créer l'élément principal de la formation
        const educationItem = createEducationItem(cleanedEducation, technologies);
        educationsList.appendChild(educationItem);
    });
}

// Fonction pour nettoyer un objet formation de tous ses guillemets superflus
function cleanEducation(education) {
    const cleaned = {};
    for (const [key, value] of Object.entries(education)) {
        cleaned[key] = cleanJsonValue(value);
    }
    return cleaned;
}

// Fonction pour créer un élément d'expérience professionnelle
function createExperienceItem(cleanedExperience, technologies) {
   
    
    // Conteneur principal
    const experienceItem = document.createElement('div');
    experienceItem.className = 'skill-modal-experience-item';
    
    // En-tête avec logo et informations principales
    const header = document.createElement('div');
    header.className = 'skill-modal-experience-header';
    
    // Logo de l'entreprise
    if (cleanedExperience.logo) {
        const logoContainer = document.createElement('div');
        logoContainer.className = 'skill-modal-experience-logo';
        
        const logo = document.createElement('img');
        logo.src = cleanedExperience.logo;
        logo.alt = cleanedExperience.company;
        logo.loading = 'lazy';
        logo.onerror = function() {
            this.style.display = 'none';
            logoContainer.innerHTML = '<div class="skill-modal-experience-logo-placeholder">🏢</div>';
        };
        
        logoContainer.appendChild(logo);
        header.appendChild(logoContainer);
    } else {
        const logoPlaceholder = document.createElement('div');
        logoPlaceholder.className = 'skill-modal-experience-logo';
        logoPlaceholder.innerHTML = '<div class="skill-modal-experience-logo-placeholder">🏢</div>';
        header.appendChild(logoPlaceholder);
    }
    
    // Informations principales
    const info = document.createElement('div');
    info.className = 'skill-modal-experience-info';
    
    const title = document.createElement('h4');
    title.className = 'skill-modal-experience-title';
    title.textContent = cleanedExperience.title;
    
    const company = document.createElement('p');
    company.className = 'skill-modal-experience-company';
    company.textContent = cleanedExperience.company;
    
    const type = document.createElement('span');
    type.className = 'skill-modal-experience-type';
    type.textContent = cleanedExperience.type || ts('position');
    
    const period = document.createElement('span');
    period.className = 'skill-modal-experience-period';
    
    // Formater les dates
    let periodText = '';
    if (cleanedExperience.start_date) {
        const startDate = new Date(cleanedExperience.start_date);
        periodText = startDate.toLocaleDateString(getDateLocale(), { year: 'numeric', month: 'long' });
        
        if (cleanedExperience.end_date) {
            const endDate = new Date(cleanedExperience.end_date);
            periodText += ' - ' + endDate.toLocaleDateString(getDateLocale(), { year: 'numeric', month: 'long' });
        } else {
            periodText += ` - ${ts('present')}`;
        }
    }
    period.textContent = periodText;
    
    info.appendChild(title);
    info.appendChild(company);
    info.appendChild(type);
    info.appendChild(period);
    
    header.appendChild(info);
    experienceItem.appendChild(header);
    
    // Description
    if (cleanedExperience.description) {
        const description = document.createElement('p');
        description.className = 'skill-modal-experience-description';
        description.textContent = cleanedExperience.description;
        experienceItem.appendChild(description);
    }
    
    // Technologies section removed - no longer displayed in skill modal
    
    // Lien vers l'expérience détaillée
    if (cleanedExperience.url) {
        const linkContainer = document.createElement('div');
        linkContainer.className = 'skill-modal-experience-actions';
        
        const experienceLink = document.createElement('a');
        experienceLink.href = cleanedExperience.url;
        experienceLink.className = 'skill-modal-experience-link btn-action';
        experienceLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> ${ts('view_details')}`;
        
        linkContainer.appendChild(experienceLink);
        experienceItem.appendChild(linkContainer);
    }
    
    return experienceItem;
}

// Fonction pour créer un élément de formation
function createEducationItem(cleanedEducation, technologies) {

    
    // Conteneur principal
    const educationItem = document.createElement('div');
    educationItem.className = 'skill-modal-education-item';
    
    // En-tête avec icône et informations principales
    const header = document.createElement('div');
    header.className = 'skill-modal-education-header';
    
    // Logo/Icône de la formation
    const iconContainer = document.createElement('div');
    iconContainer.className = 'skill-modal-education-icon';
    
    if (cleanedEducation.logo) {
        // Use logo if available (similar to experiences)
        const logoImg = document.createElement('img');
        logoImg.src = cleanedEducation.logo;
        logoImg.alt = cleanedEducation.institution || 'Logo';
        iconContainer.appendChild(logoImg);
    } else if (cleanedEducation.icon) {
        iconContainer.innerHTML = `<span class="skill-modal-education-icon-emoji">${cleanedEducation.icon}</span>`;
    } else {
        iconContainer.innerHTML = '<span class="skill-modal-education-icon-placeholder">🎓</span>';
    }
    
    // Si une couleur est définie, l'appliquer comme bordure
    if (cleanedEducation.color) {
        iconContainer.style.borderColor = cleanedEducation.color;
        iconContainer.style.boxShadow = `0 0 10px ${cleanedEducation.color}33`;
    }
    
    header.appendChild(iconContainer);
    
    // Informations principales
    const info = document.createElement('div');
    info.className = 'skill-modal-education-info';
    
    const title = document.createElement('h4');
    title.className = 'skill-modal-education-title';
    title.textContent = cleanedEducation.title;
    
    const institution = document.createElement('p');
    institution.className = 'skill-modal-education-institution';
    let institutionText = cleanedEducation.institution;
    if (cleanedEducation.city) {
        institutionText += ` - ${cleanedEducation.city}`;
    }
    institution.textContent = institutionText;
    
    const status = document.createElement('span');
    status.className = 'skill-modal-education-status';
    status.textContent = cleanedEducation.status || cleanedEducation.grade || ts('education_label');
    
    const period = document.createElement('span');
    period.className = 'skill-modal-education-period';
    
    // Formater les dates
    let periodText = '';
    if (cleanedEducation.start_date) {
        const startDate = new Date(cleanedEducation.start_date);
        periodText = startDate.toLocaleDateString(getDateLocale(), { year: 'numeric', month: 'long' });
        
        if (cleanedEducation.end_date) {
            const endDate = new Date(cleanedEducation.end_date);
            periodText += ' - ' + endDate.toLocaleDateString(getDateLocale(), { year: 'numeric', month: 'long' });
        }
    }
    period.textContent = periodText;
    
    info.appendChild(title);
    info.appendChild(institution);
    info.appendChild(status);
    info.appendChild(period);
    
    header.appendChild(info);
    educationItem.appendChild(header);
    
    // Description
    if (cleanedEducation.description) {
        const description = document.createElement('p');
        description.className = 'skill-modal-education-description';
        description.textContent = cleanedEducation.description;
        educationItem.appendChild(description);
    }
    
    // Technologies section removed - no longer displayed in skill modal
    
    // Lien vers la formation détaillée
    if (cleanedEducation.url) {
        const linkContainer = document.createElement('div');
        linkContainer.className = 'skill-modal-education-actions';
        
        const educationLink = document.createElement('a');
        educationLink.href = cleanedEducation.url;
        educationLink.className = 'skill-modal-education-link btn-action';
        educationLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> ${ts('view_details')}`;
        
        linkContainer.appendChild(educationLink);
        educationItem.appendChild(linkContainer);
    }
    
    return educationItem;
}

// Fonction pour nettoyer les guillemets superflus des valeurs JSON
function cleanJsonValue(value) {
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1); // Supprimer le premier et dernier caractère
    }
    return value;
}

// Fonction pour nettoyer un objet projet de tous ses guillemets superflus
function cleanProject(project) {
    const cleaned = {};
    for (const [key, value] of Object.entries(project)) {
        cleaned[key] = cleanJsonValue(value);
    }
    return cleaned;
}

// Fonction pour créer une tuile de projet avec des éléments DOM
function createProjectTile(cleanedProject, technologies) {
    
    // Conteneur principal
    const projectTile = document.createElement('div');
    projectTile.className = 'project-card-unified';
    
    // Conteneur de l'image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'project-card-unified-image';
    
    const image = document.createElement('img');
    image.src = cleanedProject.image || '/images/placeholder-project.jpg';
    image.alt = cleanedProject.title;
    image.loading = 'lazy';
    image.onerror = function() {
        this.src = '/images/placeholder-project.jpg';
    };
    
    imageContainer.appendChild(image);
    projectTile.appendChild(imageContainer);
    
    // Contenu par défaut (visible par défaut)
    const defaultContent = document.createElement('div');
    defaultContent.className = 'project-card-unified-content';
    
    const title = document.createElement('h6');
    title.className = 'project-card-unified-title';
    title.textContent = cleanedProject.title;
    
    const subtitle = document.createElement('p');
    subtitle.className = 'project-card-unified-subtitle';
    subtitle.textContent = cleanedProject.subtitle || cleanedProject.description || ts('default_project_description');
    
    defaultContent.appendChild(title);
    defaultContent.appendChild(subtitle);
    projectTile.appendChild(defaultContent);
    
    // Informations détaillées (affichées au hover)
    const detailedInfo = document.createElement('div');
    detailedInfo.className = 'project-card-unified-detailed-info';
    
    const detailTitle = document.createElement('h6');
    detailTitle.className = 'project-card-unified-title';
    detailTitle.textContent = cleanedProject.title;
    
    const detailDescription = document.createElement('p');
    detailDescription.className = 'project-card-unified-detailed-description';
    detailDescription.textContent = cleanedProject.description || cleanedProject.subtitle || ts('default_project_description');
    
    detailedInfo.appendChild(detailTitle);
    detailedInfo.appendChild(detailDescription);
    
    // Technologies section removed - not displayed in skill modal
    
    // Actions du projet
    if (cleanedProject.url) {
        const projectLink = document.createElement('a');
        projectLink.href = cleanedProject.url;
        projectLink.className = 'btn-action';
        projectLink.onclick = function(event) {
            event.stopPropagation();
        };
        
        // Créer le SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M7 17L17 7M17 7H7M17 7V17');
        
        svg.appendChild(path);
        projectLink.appendChild(document.createTextNode(`${ts('view_project')} `));
        projectLink.appendChild(svg);
        
        detailedInfo.appendChild(projectLink);
    } else {
        const confidentialSpan = document.createElement('span');
        confidentialSpan.className = 'btn-action primary';
        confidentialSpan.style.opacity = '0.6';
        confidentialSpan.style.cursor = 'default';
        
        // Créer le SVG pour confidentiel
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.1V11.1C14.8,11.6 14.4,12 13.9,12H10.1C9.6,12 9.2,11.6 9.2,11.1V10.1C9.2,8.6 10.6,7 12,7Z');
        
        svg.appendChild(path);
        confidentialSpan.appendChild(document.createTextNode(`${ts('confidential')} `));
        confidentialSpan.appendChild(svg);
        
        detailedInfo.appendChild(confidentialSpan);
    }
    
    projectTile.appendChild(detailedInfo);
    
    return projectTile;
}

// Fermer la modal en cliquant sur Échap
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSkillModal();
    }
});

// Empêcher la fermeture de la modal en cliquant à l'intérieur
document.addEventListener('DOMContentLoaded', function() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Normaliser les données des projets pour s'assurer que les technologies sont des tableaux
    if (window.portfolioProjects && Array.isArray(window.portfolioProjects)) {
        window.portfolioProjects = window.portfolioProjects.map(project => {
            if (project.technologies && typeof project.technologies === 'string') {
                try {
                    project.technologies = JSON.parse(project.technologies);
                } catch (e) {
                    console.error(`Erreur lors du parsing des technologies pour ${project.title}:`, e);
                    project.technologies = [];
                }
            }
            return project;
        });
       
    }
    
    // Normaliser les données des expériences pour s'assurer que les technologies sont des tableaux
    if (window.portfolioExperiences && Array.isArray(window.portfolioExperiences)) {
        window.portfolioExperiences = window.portfolioExperiences.map(experience => {
            if (experience.technologies && typeof experience.technologies === 'string') {
                try {
                    experience.technologies = JSON.parse(experience.technologies);
                } catch (e) {
                    console.error(`Erreur lors du parsing des technologies pour ${experience.title}:`, e);
                    experience.technologies = [];
                }
            }
            return experience;
        });
        
    }
    
    // Normaliser les données des formations pour s'assurer que les technologies sont des tableaux
    if (window.portfolioEducations && Array.isArray(window.portfolioEducations)) {
        window.portfolioEducations = window.portfolioEducations.map(education => {
            if (education.technologies && typeof education.technologies === 'string') {
                try {
                    education.technologies = JSON.parse(education.technologies);
                } catch (e) {
                    console.error(`Erreur lors du parsing des technologies pour ${education.title}:`, e);
                    education.technologies = [];
                }
            }
            return education;
        });
        
    }
    
  
    
  
    

});