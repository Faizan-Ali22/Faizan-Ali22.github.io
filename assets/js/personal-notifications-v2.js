/**
 * Personal Notifications System V2
 * Automatically triggers personalized notifications when visiting project pages
 * Messages from Clément about each specific project
 * Supports FR and EN languages
 */

(function() {
  'use strict';
  
  // Protection against multiple executions
  if (window.personalNotificationsInitialized) {
    return;
  }
  
  // Storage key for tracking shown notifications
  const STORAGE_KEY = 'personalNotifications_shown';
  
  /**
   * Detects the current language from the URL
   */
  function detectLanguage() {
    const path = window.location.pathname;
    return path.startsWith('/en/') || path === '/en' ? 'en' : 'fr';
  }
  
  // Configuration for project notifications - French
  const PROJECT_NOTIFICATIONS_FR = {
    'stone-keepers': {
      title: 'Message de Clément',
      message: 'Stone Keeper est un projet qui me tient particulièrement à cœur. C\'est le premier jeu que j\'ai imaginé puis mené à terme. Développé en deux mois avec une équipe passionnée, il représente bien plus qu\'un simple projet étudiant.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'stone-keeper-2': {
      title: 'Message de Clément',
      message: 'Stone Keeper 2 a été un vrai challenge ! Réalisé à distance pendant mon alternance et mes cours à l\'IUT, il m\'a permis d\'aller plus loin dans les systèmes du premier jeu, d\'expérimenter de nouveaux outils et de peaufiner des mécaniques plus avancées, le tout dans des conditions beaucoup plus exigeantes.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'terra-memoria': {
      title: 'Message de Clément',
      message: 'Terra Memoria est mon premier projet professionnel chez La Moutarde, sur lequel j\'ai travaillé en alternance. Je suis arrivé en fin de production, ce qui m\'a demandé beaucoup d\'adaptabilité. J\'ai pu contribuer efficacement à la stabilisation du jeu, corriger des bugs critiques et améliorer l\'expérience utilisateur. Une aventure extrêmement riche aux côtés d\'une équipe talentueuse.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'stholen': {
      title: 'Message de Clément',
      message: 'Stholen est un projet un peu spécial. À l\'origine, nous étions partis sur un jeu VR basé sur la destruction d\'objets, mais la complexité technique nous a poussés à réorienter le concept. Stholen est devenu notre plan B… et pourtant, il a été très bien reçu. Je suis fier d\'avoir su rebondir et tirer le meilleur de ce changement de cap !',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'nuketown-zombies': {
      title: 'Message de Clément',
      message: 'Nuketown Zombies est le projet qui m\'a vraiment initié intensivement à la programmation. C\'est l\'un de mes travaux les plus aboutis dans le modding, autant sur le plan technique que sur la direction artistique. Une superbe expérience qui m\'a donné envie d\'aller toujours plus loin.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'zombies-experience': {
      title: 'Message de Clément',
      message: 'Zombies Experience est l\'un de mes plus gros mods sur Black Ops 3. J\'y ai repoussé les limites du moteur : jusqu\'à 8 joueurs sur toutes les cartes du jeu (officielles et communautaires), de nouvelles fonctionnalités complexes et une optimisation poussée. Certaines mécaniques ont même été reprises dans d\'autres mods, ce qui en a fait une petite référence dans la communauté. J\'en suis très fier.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'mori-rebirth': {
      title: 'Message de Clément',
      message: 'Mori Rebirth est un projet collaboratif avec Emox, où je me suis concentré sur l\'aide au design, à la programmation et à l\'intégration de ressources. Une expérience très enrichissante autour du partage de compétences, notamment lors de son apprentissage de la programmation.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'farm-remastered': {
      title: 'Message de Clément',
      message: 'FARM Remastered est l\'une de mes premières maps complètes. Je voulais apprendre à bien faire les choses, alors j\'ai choisi une référence solide à remanier. À l\'époque, je ne programmais pas encore : je me suis concentré sur la modélisation 3D, l\'éclairage et l\'ambiance. C\'est ce projet qui m\'a donné envie de pousser plus loin.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for project notifications - English
  const PROJECT_NOTIFICATIONS_EN = {
    'stone-keepers': {
      title: 'Message from Clément',
      message: 'Stone Keeper is a project very close to my heart. It\'s the first game I imagined and then completed. Developed in two months with a passionate team, it represents much more than just a student project.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'stone-keeper-2': {
      title: 'Message from Clément',
      message: 'Stone Keeper 2 was a real challenge! Made remotely during my work-study program and IUT courses, it allowed me to go further with the first game\'s systems, experiment with new tools and refine more advanced mechanics, all under much more demanding conditions.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'terra-memoria': {
      title: 'Message from Clément',
      message: 'Terra Memoria is my first professional project at La Moutarde, where I worked as a work-study student. I joined at the end of production, which required a lot of adaptability. I was able to effectively contribute to stabilizing the game, fix critical bugs and improve the user experience. An extremely rich adventure alongside a talented team.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'stholen': {
      title: 'Message from Clément',
      message: 'Stholen is a somewhat special project. Originally, we started with a VR game based on object destruction, but the technical complexity pushed us to redirect the concept. Stholen became our plan B... and yet, it was very well received. I\'m proud to have bounced back and made the best of this change of direction!',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'nuketown-zombies': {
      title: 'Message from Clément',
      message: 'Nuketown Zombies is the project that really got me intensively into programming. It\'s one of my most accomplished works in modding, both technically and artistically. A great experience that made me want to go even further.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'zombies-experience': {
      title: 'Message from Clément',
      message: 'Zombies Experience is one of my biggest mods on Black Ops 3. I pushed the engine\'s limits: up to 8 players on all game maps (official and community), new complex features and deep optimization. Some mechanics have even been reused in other mods, making it a small reference in the community. I\'m very proud of it.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'mori-rebirth': {
      title: 'Message from Clément',
      message: 'Mori Rebirth is a collaborative project with Emox, where I focused on helping with design, programming and resource integration. A very enriching experience around sharing skills, especially during his programming learning journey.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'farm-remastered': {
      title: 'Message from Clément',
      message: 'FARM Remastered is one of my first complete maps. I wanted to learn to do things right, so I chose a solid reference to rework. At the time, I wasn\'t programming yet: I focused on 3D modeling, lighting and atmosphere. This project is what made me want to push further.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for education page notifications - French
  const EDUCATION_NOTIFICATIONS_FR = {
    'bachelor-game-developer': {
      title: 'Message de Clément',
      message: 'Mon Bachelor à e-artsup a été une période intense : 13 projets de jeux vidéo réalisés en équipe. Même si tout n\'a pas été simple, c\'est là que j\'ai posé des bases solides en Unity et C#, et que j\'ai confirmé ma passion pour le développement de gameplay.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'but-integration-applications-management-si': {
      title: 'Message de Clément',
      message: 'Le BUT IAMSI à l\'IUT de Montpellier a été la formation qui m\'a réellement ouvert des portes. C\'est grâce à elle que j\'ai pu rejoindre La Moutarde en alternance, élargir mes compétences techniques et gagner en maturité professionnelle.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for education page notifications - English
  const EDUCATION_NOTIFICATIONS_EN = {
    'bachelor-game-developer': {
      title: 'Message from Clément',
      message: 'My Bachelor\'s at e-artsup was an intense period: 13 video game projects completed as a team. Even if everything wasn\'t simple, that\'s where I built solid foundations in Unity and C#, and confirmed my passion for gameplay development.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    },
    'but-integration-applications-management-si': {
      title: 'Message from Clément',
      message: 'The BUT IAMSI at IUT Montpellier was the program that really opened doors for me. Thanks to it, I was able to join La Moutarde as a work-study student, broaden my technical skills and gain professional maturity.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for experience page notifications - French
  const EXPERIENCE_NOTIFICATIONS_FR = {
    'studio-la-moutarde': {
      title: 'Message de Clément',
      message: 'Mon alternance chez La Moutarde est ma première expérience professionnelle ! J\'ai travaillé sur Terra Memoria lors de sa fin de production, j\'ai pu rencontrer une équipe passionnée et apprendre énormément sur le développement de jeux vidéo en studio.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for experience page notifications - English
  const EXPERIENCE_NOTIFICATIONS_EN = {
    'studio-la-moutarde': {
      title: 'Message from Clément',
      message: 'My work-study at La Moutarde is my first professional experience! I worked on Terra Memoria during its end of production, I got to meet a passionate team and learn a lot about video game development in a studio.',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 2000,
      duration: 10000
    }
  };
  
  // Configuration for people modal notifications - French
  const PEOPLE_NOTIFICATIONS_FR = {
    'theo-carouge': {
      title: 'Message de Clément',
      message: 'Théo est un excellent développeur avec qui j\'ai travaillé sur Stone Keeper. Son investissement et son sérieux ont été essentiels à la réussite du projet !',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 1500,
      duration: 8000
    }
  };
  
  // Configuration for people modal notifications - English
  const PEOPLE_NOTIFICATIONS_EN = {
    'theo-carouge': {
      title: 'Message from Clément',
      message: 'Théo is an excellent developer I worked with on Stone Keeper. His dedication and professionalism were essential to the project\'s success!',
      avatar: '/images/people/clement-garcia.jpg',
      delay: 1500,
      duration: 8000
    }
  };
  
  /**
   * Gets the appropriate notification config based on language
   */
  function getNotificationConfig(type, slug) {
    const lang = detectLanguage();
    
    switch (type) {
      case 'project':
        return lang === 'en' ? PROJECT_NOTIFICATIONS_EN[slug] : PROJECT_NOTIFICATIONS_FR[slug];
      case 'education':
        return lang === 'en' ? EDUCATION_NOTIFICATIONS_EN[slug] : EDUCATION_NOTIFICATIONS_FR[slug];
      case 'experience':
        return lang === 'en' ? EXPERIENCE_NOTIFICATIONS_EN[slug] : EXPERIENCE_NOTIFICATIONS_FR[slug];
      case 'person':
        return lang === 'en' ? PEOPLE_NOTIFICATIONS_EN[slug] : PEOPLE_NOTIFICATIONS_FR[slug];
      default:
        return null;
    }
  }
  
  /**
   * Gets the current page slug and type from URL
   * Returns { type: 'project'|'education'|'experience', slug: 'page-slug' }
   */
  function getCurrentPageInfo() {
    const path = window.location.pathname;
    
    // Check for projects
    const projectMatch = path.match(/\/projects\/([^\/]+)/);
    if (projectMatch) {
      return { type: 'project', slug: projectMatch[1] };
    }
    
    // Check for educations
    const educationMatch = path.match(/\/educations\/([^\/]+)/);
    if (educationMatch) {
      return { type: 'education', slug: educationMatch[1] };
    }
    
    // Check for experiences
    const experienceMatch = path.match(/\/experiences\/([^\/]+)/);
    if (experienceMatch) {
      return { type: 'experience', slug: experienceMatch[1] };
    }
    
    return null;
  }
  
  /**
   * Checks if notification was already shown for this page
   */
  function wasNotificationShown(pageType, pageSlug) {
    try {
      const shown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const key = `${pageType}-${pageSlug}`;
      return shown[key] === true;
    } catch (error) {
      console.warn('Error checking notification status:', error);
      return false;
    }
  }
  
  /**
   * Marks notification as shown for a page
   */
  function markNotificationAsShown(pageType, pageSlug) {
    try {
      const shown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const key = `${pageType}-${pageSlug}`;
      shown[key] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
    } catch (error) {
      console.warn('Error saving notification status:', error);
    }
  }
  
  /**
   * Shows a personalized toast notification
   */
  function showPersonalNotification(config) {
    console.log('🔔 showPersonalNotification called with config:', config);
    console.log('🔔 window.showNotification exists?', typeof window.showNotification);
    
    // Show toast notification
    if (typeof window.showNotification === 'function') {
      console.log('🔔 Calling window.showNotification...');
      window.showNotification(config.message, 'info', {
        avatar: config.avatar,
        title: config.title,
        duration: config.duration || 8000
      });
    } else {
      console.warn('⚠️ showNotification function not available');
    }
    
    // Add to persistent notifications list
    if (window.NotificationsManager && typeof window.NotificationsManager.addNotification === 'function') {
      console.log('🔔 Adding to persistent notifications...');
      window.NotificationsManager.addNotification(
        config.title || 'Message de Clément',
        config.message,
        'info'
      );
    } else {
      console.warn('⚠️ NotificationsManager not available');
    }
  }
  
  /**
   * Handles person modal notifications
   */
  function handlePersonModalNotification(personId) {
    console.log('🔔 Person modal opened:', personId);
    
    const notificationConfig = getNotificationConfig('person', personId);
    
    if (!notificationConfig) {
      console.log('🔔 No notification configured for this person');
      return;
    }
    
    // Check if already shown
    if (wasNotificationShown('person', personId)) {
      console.log('🔔 Notification already shown for this person');
      return;
    }
    
    console.log('🔔 Scheduling person notification');
    
    const delay = notificationConfig.delay || 1500;
    
    setTimeout(() => {
      console.log('🔔 Showing person notification');
      showPersonalNotification(notificationConfig);
      markNotificationAsShown('person', personId);
    }, delay);
  }
  
  /**
   * Initializes personal notifications for current page
   */
  function initPersonalNotifications() {
    console.log('🔔 Personal Notifications: Initializing...');
    const pageInfo = getCurrentPageInfo();
    console.log('🔔 Page info detected:', pageInfo);
    
    if (!pageInfo) {
      console.log('🔔 Not on a supported page type, skipping');
      return;
    }
    
    // Get the appropriate notification config based on page type and language
    const notificationConfig = getNotificationConfig(pageInfo.type, pageInfo.slug);
    
    console.log('🔔 Notification config found:', notificationConfig ? 'Yes' : 'No');
    
    if (!notificationConfig) {
      console.log('🔔 No notification configured for this page');
      return;
    }
    
    // Check if already shown
    if (wasNotificationShown(pageInfo.type, pageInfo.slug)) {
      console.log('🔔 Notification already shown for this page');
      return;
    }
    
    console.log('🔔 Scheduling notification to show in', notificationConfig.delay, 'ms');
    
    // Wait for page to be fully loaded and delay before showing
    const delay = notificationConfig.delay || 2000;
    
    setTimeout(() => {
      console.log('🔔 Showing notification now...');
      showPersonalNotification(notificationConfig);
      markNotificationAsShown(pageInfo.type, pageInfo.slug);
    }, delay);
  }
  
  /**
   * Expose function to reset notifications (for testing)
   */
  window.resetPersonalNotifications = function() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Personal notifications reset. Refresh the page to see them again.');
  };
  
  /**
   * Wraps the openPersonModal function to trigger notifications
   */
  function setupPersonModalListener() {
    // Protection against multiple wrapping
    if (window._personModalWrapped) {
      console.log('🔔 Person modal already wrapped, skipping');
      return;
    }
    
    // Wait for openPersonModal to be available
    const checkInterval = setInterval(() => {
      if (typeof window.openPersonModal === 'function' && !window._personModalWrapped) {
        clearInterval(checkInterval);
        
        // Mark as wrapped to prevent multiple wrappings
        window._personModalWrapped = true;
        
        // Store original function
        const originalOpenPersonModal = window.openPersonModal;
        
        // Wrap it with our notification trigger
        window.openPersonModal = function(personId) {
          console.log('🔔 Intercepted openPersonModal call for:', personId);
          
          // Trigger notification
          handlePersonModalNotification(personId);
          
          // Call original function
          return originalOpenPersonModal.apply(this, arguments);
        };
        
        console.log('✅ Person modal listener setup complete');
      }
    }, 100);
    
    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkInterval), 5000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPersonalNotifications();
      setupPersonModalListener();
    });
  } else {
    initPersonalNotifications();
    setupPersonModalListener();
  }
  
  // Mark as initialized
  window.personalNotificationsInitialized = true;
  
})();
