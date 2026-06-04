/**
 * CarouselController - Reusable class for managing carousels/sliders
 * 
 * Features:
 * - Manual navigation (buttons, indicators, swipe)
 * - Autoplay with progress bar
 * - Pause/resume on hover
 * - Integration with global pause system
 * - Mobile support (swipe gestures)
 * 
 * Usage:
 * const carousel = new CarouselController('.my-slider', {
 *   autoplayDuration: 5000,
 *   enableSwipe: true,
 *   pauseOnHover: true
 * });
 */

class CarouselController {
    constructor(selector, options = {}) {
        // Default configuration
        this.config = {
            autoplayDuration: 5000,
            progressUpdateFrequency: 50,
            enableSwipe: true,
            pauseOnHover: true,
            loop: true,
            enableKeyboard: false,
            ...options
        };

        // DOM elements
        this.slider = document.querySelector(selector);
        if (!this.slider) {
            console.warn(`CarouselController: Slider "${selector}" not found`);
            return;
        }

        this.track = this.slider.querySelector('.testimonials-track, .testimonials-education-track, .gallery-track');
        this.cards = this.slider.querySelectorAll('.testimonial-card, .testimonial-education-card, .gallery-item');
        this.prevBtn = this.slider.querySelector('.slider-btn.prev');
        this.nextBtn = this.slider.querySelector('.slider-btn.next');
        this.indicators = this.slider.querySelectorAll('.indicator');
        this.progressContainer = this.slider.querySelector('.autoplay-progress-container');
        this.progressBar = this.slider.querySelector('.autoplay-progress-bar');

        // Carousel state
        this.currentIndex = 0;
        this.totalCards = this.cards.length;
        this.autoplayInterval = null;
        this.isPaused = false;
        this.pausedProgress = 0;
        this.isDestroyed = false;

        // Variables for swipe gestures
        this.startX = null;
        this.startY = null;

        // Check required elements
        if (this.totalCards === 0) {
            console.warn('CarouselController: No cards found');
            return;
        }

        // Initialize carousel
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSlider();
        
        if (this.config.autoplayDuration > 0) {
            this.startAutoplay();
        }

        // Register with global control system
        this.registerGlobalControl();
    }

    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previous());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause on hover if enabled
        if (this.config.pauseOnHover) {
            this.cards.forEach(card => {
                card.addEventListener('mouseenter', () => this.pause());
                card.addEventListener('mouseleave', () => this.resume());
            });
        }

        // Swipe support if enabled
        if (this.config.enableSwipe) {
            this.setupSwipeListeners();
        }

        // Keyboard support if enabled
        if (this.config.enableKeyboard) {
            this.setupKeyboardListeners();
        }
    }

    setupSwipeListeners() {
        this.slider.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        });

        this.slider.addEventListener('touchmove', (e) => {
            if (!this.startX || !this.startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = this.startX - currentX;
            const diffY = this.startY - currentY;
            
            // Prevent vertical scroll if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }
        });

        this.slider.addEventListener('touchend', (e) => {
            if (!this.startX || !this.startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = this.startX - endX;
            
            // Minimum distance to trigger swipe
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.next(); // Swipe left - next slide
                } else {
                    this.previous(); // Swipe right - previous slide
                }
            }
            
            this.startX = null;
            this.startY = null;
        });
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isDestroyed) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previous();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.isPaused ? this.resume() : this.pause();
                    break;
            }
        });
    }

    updateSlider() {
        if (this.isDestroyed) return;

        // Update track position
        if (this.track) {
            // Apply will-change before animation for performance
            this.track.style.willChange = 'transform';
            
            const translateX = -this.currentIndex * 100;
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Remove will-change after animation completes (600ms transition duration)
            setTimeout(() => {
                if (this.track) {
                    this.track.style.willChange = 'auto';
                }
            }, 600);
        }
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update button states
        if (this.prevBtn) {
            this.prevBtn.disabled = !this.config.loop && this.currentIndex === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = !this.config.loop && this.currentIndex === this.totalCards - 1;
        }
    }

    startAutoplay() {
        if (this.isDestroyed || this.config.autoplayDuration <= 0) return;

        // Clear existing intervals
        this.clearAutoplay();
        
        // Reset progress bar if not resuming from pause
        if (!this.isPaused && this.progressBar) {
            this.progressBar.style.width = '0%';
            this.pausedProgress = 0;
        }
        
        // Unified timer for progress and slide change
        let progress = this.isPaused ? this.pausedProgress : 0;
        const increment = (100 / this.config.autoplayDuration) * this.config.progressUpdateFrequency;
        
        this.autoplayInterval = setInterval(() => {
            // Update only if not paused (local or global)
            if (!this.isPaused && !window.testimonialsGlobalPause) {
                progress += increment;
                
                // Update progress bar
                if (this.progressBar) {
                    this.progressBar.style.width = `${Math.min(progress, 100)}%`;
                }
                
                // Store progress for potential pause
                this.pausedProgress = progress;
                
                // When reaching 100%, change slide
                if (progress >= 100) {
                    this.clearAutoplay();
                    
                    // Change slide
                    this.nextSlide();
                    
                    // Reset progress
                    progress = 0;
                    this.pausedProgress = 0;
                    if (this.progressBar) {
                        this.progressBar.style.width = '0%';
                    }
                    
                    // Restart cycle after small delay
                    setTimeout(() => {
                        if (!this.isPaused && !this.isDestroyed) {
                            this.startAutoplay();
                        }
                    }, 100);
                    
                    return;
                }
            }
        }, this.config.progressUpdateFrequency);
    }

    clearAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    nextSlide() {
        if (this.config.loop) {
            this.currentIndex = (this.currentIndex + 1) % this.totalCards;
        } else if (this.currentIndex < this.totalCards - 1) {
            this.currentIndex++;
        }
        this.updateSlider();
    }

    previousSlide() {
        if (this.config.loop) {
            this.currentIndex = this.currentIndex === 0 ? this.totalCards - 1 : this.currentIndex - 1;
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        this.updateSlider();
    }

    // API publique
    next() {
        this.nextSlide();
        this.resetAutoplay();
    }

    previous() {
        this.previousSlide();
        this.resetAutoplay();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalCards) {
            this.currentIndex = index;
            this.updateSlider();
            this.resetAutoplay();
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    resetAutoplay() {
        this.clearAutoplay();
        this.isPaused = false;
        this.pausedProgress = 0;
        
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
        
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.startAutoplay();
            }
        }, 50);
    }

    stop() {
        this.clearAutoplay();
        this.isPaused = false;
        this.pausedProgress = 0;
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
    }

    start() {
        this.startAutoplay();
    }

    destroy() {
        this.isDestroyed = true;
        this.clearAutoplay();
        
        // Remove from global registry
        if (window.testimonialsControllers) {
            const index = window.testimonialsControllers.findIndex(c => c.instance === this);
            if (index > -1) {
                window.testimonialsControllers.splice(index, 1);
            }
        }
    }

    registerGlobalControl() {
        // Register with global testimonials control system
        if (!window.testimonialsControllers) {
            window.testimonialsControllers = [];
        }

        const controller = {
            pauseRotation: () => this.pause(),
            resumeRotation: () => this.resume(),
            stopRotation: () => this.stop(),
            startRotation: () => this.start(),
            container: this.slider,
            instance: this
        };

        window.testimonialsControllers.push(controller);
    }
}

// Export class for global use
window.CarouselController = CarouselController;
