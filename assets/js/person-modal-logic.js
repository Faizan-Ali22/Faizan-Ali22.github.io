// Person Modal Logic
// Complete person modal management

// Translations for person modal
const PERSON_MODAL_TRANSLATIONS = {
    fr: {
        no_projects_title: "Aucun projet trouvé",
        no_projects_text: "Cette personne n'a pas encore de projets référencés en tant que contributeur."
    },
    en: {
        no_projects_title: "No projects found",
        no_projects_text: "This person doesn't have any projects listed as a contributor yet."
    }
};

// Detect current language
function getPersonModalLang() {
    const path = window.location.pathname;
    return path.startsWith('/en/') || path.startsWith('/en') ? 'en' : 'fr';
}

// Get translation
function tPersonModal(key) {
    const lang = getPersonModalLang();
    return PERSON_MODAL_TRANSLATIONS[lang][key] || PERSON_MODAL_TRANSLATIONS.fr[key] || key;
}

// Tab management & person modal stats
document.addEventListener('DOMContentLoaded', function() {

    const modal = document.getElementById('personModal');
    if (!modal) {
        console.error('Person modal element not found!');
        return;
    }
    
    const tabButtons = modal.querySelectorAll('.nav-tab');
    const tabPanels = modal.querySelectorAll('.content-panel');

    // Function to check if biography content is meaningful
    function hasSignificantBiographyContent(content) {
        if (!content || content.trim() === '') {
            return false;
        }

        // Convert HTML to text for analysis
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Remove common generic patterns
        const cleanedContent = textContent
            .replace(/^#\s*\w+.*$/gm, '') // Remove headers like "# Name"
            .replace(/^Profil de \*\*.*\*\*\.?$/gm, '') // Remove "Profil de **Name**"
            .replace(/^## Informations$/gm, '') // Remove "## Informations" headers
            .replace(/^- \*\*ID\*\*: .*$/gm, '') // Remove ID lines
            .replace(/^- \*\*Nom complet\*\*: .*$/gm, '') // Remove full name lines
            .replace(/^## Position$/gm, '') // Remove Position headers
            .replace(/^## Entreprise$/gm, '') // Remove Company headers
            .replace(/^\s*$/gm, '') // Remove empty lines
            .trim();

        // Check if there's substantial content remaining
        const minContentLength = 50; // Minimum characters for meaningful content
        const hasSubstantialContent = cleanedContent.length > minContentLength;
        
        // Additional check: ensure it's not just generic info repetition
        const isNotJustGenericInfo = !cleanedContent.match(/^([\w\s]+)(\n\1)*$/);
        
        return hasSubstantialContent && isNotJustGenericInfo;
    }

    function activateTab(target) {
        // Check if bio tab should be hidden and redirect if necessary
        const bioTab = modal.querySelector('[data-tab="bio"]');
        if (target === 'bio' && bioTab && bioTab.style.display === 'none') {
            target = 'projects'; // Redirect to projects tab
        }

        tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === target;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        tabPanels.forEach(panel => {
            const shouldShow = panel.id === 'personModalTab' + target.charAt(0).toUpperCase() + target.slice(1);
            panel.classList.toggle('active', shouldShow);
            if (shouldShow) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden','hidden');
            }
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.dataset.tab));
        btn.addEventListener('keydown', e => {
            if (['ArrowRight','ArrowLeft'].includes(e.key)) {
                e.preventDefault();
                const visibleButtons = Array.from(tabButtons).filter(b => b.style.display !== 'none');
                const idx = visibleButtons.indexOf(btn);
                if (idx >= 0) {
                    const next = e.key === 'ArrowRight' ? (idx + 1) % visibleButtons.length : (idx - 1 + visibleButtons.length) % visibleButtons.length;
                    visibleButtons[next].focus();
                }
            }
        });
    });

    // Create openPersonModal function
    window.openPersonModal = function(personId) {
        // Handle nesting above existing unified or skill modals
        try {
            const personModal = document.getElementById('personModal');
            const unified = document.getElementById('unifiedModal');
            if (personModal && unified && unified.style.display !== 'none') {
                personModal.classList.add('person-modal--nested');
                unified.classList.add('unified-modal--nested-parent');
                unified.style.zIndex = '10000';
            }
            const skill = document.getElementById('skillModal');
            if (personModal && skill && skill.style.display !== 'none') {
                personModal.classList.add('person-modal--nested');
                skill.classList.add('skill-modal--nested-parent');
            }
        } catch(e) { /* no-op */ }

        
        const person = window.portfolioPeople.find(p => p.id === personId);
        if (!person) {
            console.error('Person not found:', personId);
            return;
        }

        // Add loading state
        modal.classList.add('loading');

        // Update modal content
        document.getElementById('modalPersonName').textContent = person.name || 'Nom non spécifié';
        
        // Update position chip - hide if empty or unspecified
        const positionChip = document.getElementById('modalPersonPosition');
        if (person.position && person.position.trim() !== '') {
            positionChip.textContent = person.position;
            positionChip.style.display = '';
        } else {
            positionChip.style.display = 'none';
        }
        
        // Update company chip - hide if empty or unspecified
        const companyChip = document.getElementById('modalPersonCompany');
        if (person.company && person.company.trim() !== '') {
            companyChip.textContent = person.company;
            companyChip.style.display = '';
        } else {
            companyChip.style.display = 'none';
        }
        
        const avatarImg = document.getElementById('modalPersonAvatar');
        const avatarContainer = document.getElementById('personAvatarLarge');
        
        if (person.avatar && person.avatar !== '') {
            avatarImg.src = person.avatar;
            avatarImg.style.display = 'block';
            avatarContainer.classList.remove('placeholder');
            avatarImg.onerror = function() {
                // If image fails to load, show initials instead
                this.style.display = 'none';
                avatarContainer.classList.add('placeholder');
                avatarContainer.innerHTML = `<span>${person.name.charAt(0).toUpperCase()}</span>`;
            };
        } else {
            // No avatar, show initials
            avatarImg.style.display = 'none';
            avatarContainer.classList.add('placeholder');
            avatarContainer.innerHTML = `<span>${person.name.charAt(0).toUpperCase()}</span>`;
        }

        // Update bio tab
        const bioContent = document.getElementById('modalPersonBio');
        const contentToShow = person.content || person.bio || 'Aucune biographie disponible.';
        bioContent.innerHTML = contentToShow;

        // Check if biography has significant content
        const bioTab = modal.querySelector('[data-tab="bio"]');
        const hasSignificantBio = hasSignificantBiographyContent(contentToShow);
        
        if (bioTab) {
            if (hasSignificantBio) {
                bioTab.style.display = 'flex'; // Show tab
                bioTab.style.pointerEvents = 'auto';
            } else {
                bioTab.style.display = 'none'; // Hide tab
                bioTab.style.pointerEvents = 'none';
            }
        }

        // Update projects tab
        updatePersonProjects(personId);

        // Update contact buttons
    const contactButtons = document.getElementById('personModalContactButtons');
        contactButtons.innerHTML = '';
        
        const contacts = [
            { 
                label: 'Email', 
                value: person.email, 
                type: 'email',
                svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="social-icon-svg">
                    <path d="M4 7L10.94 11.3C11.59 11.74 12.41 11.74 13.06 11.3L20 7M4 6H20C20.55 6 21 6.45 21 7V17C21 17.55 20.55 18 20 18H4C3.45 18 3 17.55 3 17V7C3 6.45 3.45 6 4 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
            },
            { 
                label: 'LinkedIn', 
                value: person.linkedin, 
                type: 'url',
                svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="social-icon-svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
            },
            { 
                label: 'GitHub', 
                value: person.github, 
                type: 'url',
                svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="social-icon-svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`
            },
            { 
                label: 'Discord', 
                value: person.discord, 
                type: 'url',
                svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="social-icon-svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/></svg>`
            },
            { 
                label: 'Site web', 
                value: person.website, 
                type: 'url',
                svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="social-icon-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="currentColor"/>
                </svg>`
            }
        ];

        contacts.forEach(contact => {
            if (contact.value && contact.value !== '' && contact.value !== '""') {
                const buttonEl = document.createElement('a');
                // Use unified icon action style while keeping legacy class for compatibility
                buttonEl.className = 'person-modal-contact-button btn-action-icon';
                buttonEl.title = `${contact.label}: ${contact.value}`;
                buttonEl.setAttribute('aria-label', contact.label);
                buttonEl.innerHTML = contact.svg;

                // Special handling for Discord: open unified modal with the demo design
                if (contact.label === 'Discord') {
                    buttonEl.href = '#';
                    buttonEl.onclick = function(e) {
                        e.preventDefault();
                        const discordId = String(contact.value || '').trim();
                        if (!discordId) return;
                        if (typeof window.UnifiedModal !== 'undefined') {
                            window.UnifiedModal.create({
                                type: 'discord',
                                title: 'Mon Discord',
                                icon: '/images/social/discord.svg',
                                content: { discordId }
                            });
                        }
                    };
                } else {
                    // Default link behavior for other contacts
                    const href = contact.type === 'email' ? `mailto:${contact.value}` : contact.value;
                    buttonEl.href = href;
                    buttonEl.target = contact.type === 'url' ? '_blank' : '_self';
                    if (buttonEl.target === '_blank') {
                        buttonEl.rel = 'noopener noreferrer';
                    }
                }

                contactButtons.appendChild(buttonEl);
            }
        });

        updateStats(personId);
        
        // Activate appropriate tab based on bio availability
        const defaultTab = hasSignificantBio ? 'bio' : 'projects';
        activateTab(defaultTab);
        
        // Remove loading state after content is loaded
        setTimeout(() => {
            modal.classList.remove('loading');
        }, 100);
        
        // Pause all testimonials before showing modal
        if (typeof window.pauseAllTestimonials === 'function') {
            window.pauseAllTestimonials();
        }
        
        // Align opening animation with unified modal (fade + content transform)
        modal.classList.remove('fade-exit', 'fade-exit-active');
        modal.style.display = 'flex';
        modal.offsetHeight; // force reflow
        modal.classList.add('fade-enter');
        requestAnimationFrame(() => {
            modal.classList.add('fade-enter-active');
        });
      
        document.body.style.overflow = 'hidden';
      
        
        // Recreate dropdown immediately after tabs visibility is updated
        if (typeof window.recreateTabsDropdown === 'function') {
            window.recreateTabsDropdown('personModal');
        }
    };

    // Create closePersonModal function
    window.closePersonModal = function() {
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
            modal.classList.remove('fade-exit', 'fade-exit-active');
            modal.classList.remove('person-modal--nested');
            try {
                const unified = document.getElementById('unifiedModal');
                if (unified && unified.classList.contains('unified-modal--nested-parent')) {
                    unified.classList.remove('unified-modal--nested-parent');
                    unified.style.zIndex = '10000';
                }
                const skill = document.getElementById('skillModal');
                if (skill && skill.classList.contains('skill-modal--nested-parent')) {
                    skill.classList.remove('skill-modal--nested-parent');
                }
            } catch(e) { /* no-op */ }
            // Body scroll control: only restore if no other modal still open
            try {
                const anyOpen = (function(){
                    const ids = ['unifiedModal','skillModal','personModal'];
                    return ids.some(id => {
                        const el = document.getElementById(id);
                        if (!el) return false;
                        const display = (el.style && el.style.display) ? el.style.display : window.getComputedStyle(el).display;
                        return display && display !== 'none';
                    });
                })();
                document.body.style.overflow = anyOpen ? 'hidden' : 'auto';
            } catch(e) { /* no-op */ }
        }, 300);
    };

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            window.closePersonModal();
        }
    });

    function updateStats(personId) {
        // Find testimonials for this person
        const testimonials = (window.portfolioTestimonials && Array.isArray(window.portfolioTestimonials)) 
            ? window.portfolioTestimonials.filter(t => t.personId === personId) 
            : [];

        // Update testimonials section in header
        const testimonialsSection = document.getElementById('modalPersonTestimonials');
        const toggleBtn = document.getElementById('testimonialsToggleBtn');
        testimonialsSection.innerHTML = '';

        if (testimonials.length > 0) {
            testimonials.forEach(testimonial => {
                const testimonialEl = document.createElement('div');
                testimonialEl.className = 'person-modal-testimonial';
                
                testimonialEl.innerHTML = `
                    <div class="modal-testimonial-content">
                        <blockquote class="modal-testimonial-text">❝ ${testimonial.text}</blockquote>
                    </div>
                `;
                testimonialsSection.appendChild(testimonialEl);
            });
            
            // Show toggle button and set up event listener
            if (toggleBtn) {
                // Add class to enable button display on mobile via CSS
                toggleBtn.classList.add('has-testimonials');
                
                // Check if mobile (window width < 768px)
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    // Start collapsed on mobile
                    testimonialsSection.classList.add('collapsed');
                    toggleBtn.classList.remove('expanded');
                    toggleBtn.querySelector('.toggle-text').textContent = 'Voir les témoignages';
                } else {
                    // Always expanded on desktop
                    testimonialsSection.classList.remove('collapsed');
                }
                
                // Remove old listeners and add new one
                const newToggleBtn = toggleBtn.cloneNode(true);
                toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
                
                newToggleBtn.addEventListener('click', function() {
                    const isCollapsed = testimonialsSection.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        testimonialsSection.classList.remove('collapsed');
                        newToggleBtn.classList.add('expanded');
                        newToggleBtn.querySelector('.toggle-text').textContent = 'Masquer les témoignages';
                    } else {
                        testimonialsSection.classList.add('collapsed');
                        newToggleBtn.classList.remove('expanded');
                        newToggleBtn.querySelector('.toggle-text').textContent = 'Voir les témoignages';
                    }
                });
            }
        } else {
            // Remove class to hide toggle button if no testimonials
            if (toggleBtn) {
                toggleBtn.classList.remove('has-testimonials');
            }
        }
    }

    function updatePersonProjects(personId) {
        
        if (!window.portfolioProjects || !Array.isArray(window.portfolioProjects)) {
            console.warn('No projects data or not an array');
            return [];
        }

    
        
        // Debug: afficher tous les projets et leurs contributeurs avec le style de skill-modal
        const personProjects = window.portfolioProjects.filter(project => {
            
            let contributors = project.contributors;
            
            // Handle case where contributors might be a string
            if (typeof contributors === 'string') {
                try {
                    contributors = JSON.parse(contributors);
                } catch (e) {
                    console.log(`❌ JSON parsing error for "${project.title}":`, e.message);
                    return false;
                }
            }
            
            if (!contributors || !Array.isArray(contributors)) {
                console.log(`❌ Project "${project.title}" rejected: invalid or missing contributors`);
                return false;
            }
            
            // Check if person is in contributors
            const hasPerson = contributors.some(contributor => {
                const exactMatch = contributor.person === personId;
                // Safe role display handling
                let roleDisplay = 'N/A';
                if (contributor.roles && Array.isArray(contributor.roles)) {
                    roleDisplay = contributor.roles.join(', ');
                } else if (contributor.role) {
                    roleDisplay = contributor.role;
                }
                return exactMatch;
            });
            
            if (hasPerson) {
            
            } else {
                console.log(`❌ Project "${project.title}" rejected: person not found in contributors`);
            }
            return hasPerson;
        });
        
        // Update projects section
        const projectsContent = document.getElementById('modalPersonProjects');
        projectsContent.innerHTML = '';

        if (personProjects.length > 0) {
            const projectsGrid = document.createElement('div');
            projectsGrid.className = 'person-modal-projects-grid';
            
            personProjects.forEach(project => {
                const projectEl = document.createElement('div');
                projectEl.className = 'project-card-unified';
                
                // Find this person's role in the project
                const contributor = project.contributors.find(c => c.person === personId);
                const role = contributor ? contributor.role : 'Contributeur';
                
                // Fonction pour nettoyer les valeurs avec guillemets en trop
                const clean = (value) => {
                    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
                        return value.slice(1, -1); // Enlève les guillemets du début et de la fin
                    }
                    return value || '';
                };

                const cleanTitle = clean(project.title);
                const cleanSubtitle = clean(project.subtitle);
                const cleanDescription = clean(project.description);
                const cleanUrl = clean(project.url);
                const cleanImage = clean(project.image);

                projectEl.innerHTML = `
                    <div class="project-card-unified-header">
                        ${cleanImage ? `
                            <div class="project-card-unified-image">
                                <img src="${cleanImage}" alt="${cleanTitle}" loading="lazy">
                            </div>
                        ` : ''}
                        
                        <!-- Default content (visible by default) -->
                        <div class="project-card-unified-content">
                            <h3 class="project-card-unified-title">${cleanTitle}</h3>
                            ${cleanSubtitle ? `<p class="project-card-unified-subtitle">${cleanSubtitle}</p>` : ''}
                            <div class="project-card-unified-meta">
                                <span class="project-card-unified-role">${role}</span>
                            </div>
                        </div>
                        
                        <!-- Detailed info (shown on hover) -->
                        <div class="project-card-unified-detailed-info">
                            <div>
                                <h3 class="project-card-unified-title">${cleanTitle}</h3>
                                ${cleanDescription ? `<p class="project-card-unified-detailed-description">${cleanDescription}</p>` : ''}
                            </div>
                            <a href="${cleanUrl}" class="btn-action">
                                Voir le projet
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                `;
                
                projectsGrid.appendChild(projectEl);
            });
            
            projectsContent.appendChild(projectsGrid);
        } else {
            projectsContent.innerHTML = `
                <div class="person-modal-no-projects">
                    <div class="no-projects-icon">🚀</div>
                    <h3>${tPersonModal('no_projects_title')}</h3>
                    <p>${tPersonModal('no_projects_text')}</p>
                </div>
            `;
        }
    }
});
