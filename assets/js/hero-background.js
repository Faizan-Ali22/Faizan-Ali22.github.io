/**
 * Hero Background Particles System
 * Deep Space Aesthetic with Luminous Ribbon
 * Specifications: 250-350 particles, bokeh effects, distributed around ribbon
 */

class HeroBackgroundParticles {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    
    // Configuration selon les spécifications exactes
    this.config = {
      count: this.getParticleCount(),
      colors: ['#FFFFFF', '#B0D2FF', '#D8ECFF'], // Blanc à bleu clair
      sizes: [1, 1.5, 2, 2.5, 3], // Rayon 1-3px
      opacities: [0.4, 0.5, 0.6, 0.7, 0.8], // 40-80%
      bokehChance: 0.05, // < 5% des particules floutées
      ribbonDistribution: 0.6, // 60% près du ruban
      driftSpeed: 0.2,
      pulseSpeed: 0.02
    };
    
    this.ribbonPath = this.calculateRibbonPath();
    this.init();
  }
  
  getParticleCount() {
    // Adaptation du nombre de particules selon la taille d'écran
    const baseCount = 300;
    const screenRatio = (window.innerWidth * window.innerHeight) / (1920 * 1080);
    return Math.floor(baseCount * Math.min(screenRatio, 1.2));
  }
  
  calculateRibbonPath() {
    // Calcul du chemin Bézier du ruban selon les spécifications
    // P0: -10% / 55%, P1: 45% / 40%, P2: 110% / 30%
    return {
      p0: { x: -0.1, y: 0.55 },
      p1: { x: 0.45, y: 0.40 },
      p2: { x: 1.1, y: 0.30 }
    };
  }
  
  init() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) {
      console.warn('Particles canvas not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.setupEventListeners();
    this.resizeCanvas();
    this.createParticles();
    this.animate();
  }
  
  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
  
  handleResize() {
    this.resizeCanvas();
    this.config.count = this.getParticleCount();
    this.createParticles();
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  getPointOnRibbon(t) {
    // Calcul d'un point sur la courbe Bézier quadratique
    const { p0, p1, p2 } = this.ribbonPath;
    const invT = 1 - t;
    
    return {
      x: (invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x) * this.canvas.width,
      y: (invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y) * this.canvas.height
    };
  }
  
  createParticle() {
    const isNearRibbon = Math.random() < this.config.ribbonDistribution;
    let x, y;
    
    if (isNearRibbon) {
      // Distribution concentrée autour du ruban avec amplitude d'ondulation ±25px
      const t = Math.random();
      const ribbonPoint = this.getPointOnRibbon(t);
      
      x = ribbonPoint.x + (Math.random() - 0.5) * 200; // Distribution élargie
      y = ribbonPoint.y + (Math.random() - 0.5) * 150 + Math.sin(t * Math.PI * 4) * 25; // Ondulation
    } else {
      // Distribution dans le quadrant supérieur droit
      x = Math.random() * this.canvas.width;
      y = Math.random() * (this.canvas.height * 0.6);
      
      // Densité plus forte en haut à droite
      if (Math.random() < 0.7) {
        x = this.canvas.width * 0.3 + Math.random() * this.canvas.width * 0.7;
        y = Math.random() * this.canvas.height * 0.4;
      }
    }
    
    return {
      x: x,
      y: y,
      initialX: x,
      initialY: y,
      size: this.config.sizes[Math.floor(Math.random() * this.config.sizes.length)],
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
      baseOpacity: this.config.opacities[Math.floor(Math.random() * this.config.opacities.length)],
      opacity: 0,
      bokeh: Math.random() < this.config.bokehChance,
      drift: {
        x: (Math.random() - 0.5) * this.config.driftSpeed,
        y: (Math.random() - 0.5) * this.config.driftSpeed
      },
      pulse: Math.random() * Math.PI * 2,
      age: 0,
      maxAge: 1000 + Math.random() * 2000, // Durée de vie variable
      shape: Math.random() < 0.3 ? 'hexagon' : 'circle' // 30% hexagonales
    };
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  updateParticle(particle) {
    particle.age++;
    
    // Animation de dérive lente
    particle.x += particle.drift.x;
    particle.y += particle.drift.y;
    
    // Animation de pulsation
    particle.pulse += this.config.pulseSpeed;
    const pulseOffset = Math.sin(particle.pulse) * 0.1;
    particle.opacity = Math.max(0.1, Math.min(1, particle.baseOpacity + pulseOffset));
    
    // Effet de fade in/out selon l'âge
    const ageRatio = particle.age / particle.maxAge;
    if (ageRatio < 0.1) {
      particle.opacity *= ageRatio / 0.1; // Fade in
    } else if (ageRatio > 0.9) {
      particle.opacity *= (1 - ageRatio) / 0.1; // Fade out
    }
    
    // Recyclage des particules
    if (particle.age >= particle.maxAge || 
        particle.x < -50 || particle.x > this.canvas.width + 50 || 
        particle.y < -50 || particle.y > this.canvas.height + 50) {
      Object.assign(particle, this.createParticle());
    }
  }
  
  drawParticle(particle) {
    this.ctx.save();
    
    this.ctx.globalAlpha = particle.opacity;
    
    // Effet bokeh (flou gaussien sigma=2px)
    if (particle.bokeh) {
      this.ctx.filter = 'blur(2px)';
    }
    
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    
    if (particle.shape === 'hexagon') {
      // Forme hexagonale douce
      const sides = 6;
      const angle = Math.PI * 2 / sides;
      this.ctx.moveTo(
        particle.x + particle.size * Math.cos(0),
        particle.y + particle.size * Math.sin(0)
      );
      for (let i = 1; i <= sides; i++) {
        this.ctx.lineTo(
          particle.x + particle.size * Math.cos(i * angle),
          particle.y + particle.size * Math.sin(i * angle)
        );
      }
    } else {
      // Forme circulaire
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    }
    
    this.ctx.fill();
    this.ctx.restore();
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Mise à jour et rendu des particules
    this.particles.forEach(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
    });
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
  
  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  resume() {
    if (!this.animationId) {
      this.animate();
    }
  }
  
  destroy() {
    this.pause();
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
  // Vérification si les animations sont autorisées
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.heroParticles = new HeroBackgroundParticles();
  }
});

// Export pour utilisation en module si nécessaire
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroBackgroundParticles;
}
