/**
 * GallerySlideshow - Reusable class for managing gallery slideshows with opacity transitions
 * 
 * Features:
 * - Smart image preloading
 * - Smooth opacity transitions
 * - Auto-pause when gallery is expanded
 * - Flexible interval configuration
 * 
 * Usage:
 * const slideshow = new GallerySlideshow('.gallery-box', {
 *   interval: 4000,
 *   transitionDuration: 1000
 * });
 */

class GallerySlideshow {
    constructor(selector, options = {}) {
        // Default configuration
        this.config = {
            interval: 4000,           // Interval between images (ms)
            transitionDuration: 1000, // Transition duration (ms)
            preloadAll: true,         // Preload all images
            pauseWhenExpanded: true,  // Pause when gallery is opened
            ...options
        };

        // Main DOM element
        this.galleryBox = document.querySelector(selector);
        if (!this.galleryBox) {
            console.warn(`GallerySlideshow: Gallery "${selector}" not found`);
            return;
        }

        // DOM elements
        this.galleryImages = this.galleryBox.querySelectorAll('.gallery-background .gallery-mini-item img');
        this.imageUrls = Array.from(this.galleryImages).map(img => img.src);

        // Slideshow state
        this.currentIndex = 0;
        this.totalImages = this.imageUrls.length;
        this.preloadedImages = [];
        this.isPreloaded = false;
        this.slideshowInterval = null;
        this.isRunning = false;

        // Initialize slideshow
        this.init();
    }

    /**
     * Initialize the slideshow
     */
    init() {
        if (this.totalImages <= 1) {
            return;
        }

        if (this.config.preloadAll) {
            this.preloadImages();
        } else {
            this.start();
        }
    }

    /**
     * Preload all images before starting the slideshow
     */
    preloadImages() {
        let loadedCount = 0;

        this.imageUrls.forEach((url, index) => {
            const img = new Image();
            img.onload = () => {
                this.preloadedImages[index] = true;
                loadedCount++;

                // All images are loaded
                if (loadedCount === this.totalImages) {
                    this.isPreloaded = true;
                    this.start();
                }
            };
            img.onerror = () => {
                console.warn(`GallerySlideshow: Failed to preload image ${url}`);
                loadedCount++;
                if (loadedCount === this.totalImages) {
                    this.isPreloaded = true;
                    this.start();
                }
            };
            img.src = url;
        });
    }

    /**
     * Start the slideshow
     */
    start() {
        if (this.isRunning) return;

        // Hide all images except the first one
        this.galleryImages.forEach((img, index) => {
            img.parentElement.style.opacity = index === 0 ? '1' : '0';
        });

        this.isRunning = true;
        this.scheduleNextSlide();
    }

    /**
     * Schedule the next transition
     */
    scheduleNextSlide() {
        if (!this.isRunning) return;

        this.slideshowInterval = setTimeout(() => {
            this.nextSlide();
        }, this.config.interval);
    }

    /**
     * Move to the next image
     */
    nextSlide() {
        if (!this.isRunning) return;

        // Check if gallery is expanded
        if (this.config.pauseWhenExpanded && this.galleryBox.classList.contains('expanded')) {
            this.scheduleNextSlide(); // Reschedule for later
            return;
        }

        const currentImg = this.galleryImages[this.currentIndex];
        const nextIndex = (this.currentIndex + 1) % this.totalImages;
        const nextImg = this.galleryImages[nextIndex];

        // If preloading, check that next image is ready
        if (this.config.preloadAll && !this.preloadedImages[nextIndex]) {
            this.scheduleNextSlide(); // Reschedule if not ready
            return;
        }

        this.transitionToImage(currentImg, nextImg, () => {
            this.currentIndex = nextIndex;
            this.scheduleNextSlide();
        });
    }

    /**
     * Perform transition between two images
     */
    transitionToImage(currentImg, nextImg, callback) {
        // Preload next image if necessary
        if (!this.config.preloadAll) {
            const preloadImg = new Image();
            preloadImg.onload = () => {
                this.performTransition(currentImg, nextImg, callback);
            };
            preloadImg.src = nextImg.src;
        } else {
            this.performTransition(currentImg, nextImg, callback);
        }
    }

    /**
     * Perform opacity transition
     */
    performTransition(currentImg, nextImg, callback) {
        const transitionDuration = `${this.config.transitionDuration}ms`;
        
        // Configure transitions
        currentImg.parentElement.style.transition = `opacity ${transitionDuration} ease-in-out`;
        nextImg.parentElement.style.transition = `opacity ${transitionDuration} ease-in-out`;

        // Perform transition
        currentImg.parentElement.style.opacity = '0';
        nextImg.parentElement.style.opacity = '1';

        // Callback after transition
        if (callback) {
            setTimeout(callback, this.config.transitionDuration);
        }
    }

    /**
     * Pause the slideshow
     */
    pause() {
        this.isRunning = false;
        if (this.slideshowInterval) {
            clearTimeout(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }

    /**
     * Resume the slideshow
     */
    resume() {
        if (!this.isRunning && this.totalImages > 1) {
            this.isRunning = true;
            this.scheduleNextSlide();
        }
    }

    /**
     * Stop the slideshow completely
     */
    stop() {
        this.pause();
        // Reset to first image
        this.galleryImages.forEach((img, index) => {
            img.parentElement.style.opacity = index === 0 ? '1' : '0';
        });
        this.currentIndex = 0;
    }

    /**
     * Go to a specific image
     */
    goToSlide(index) {
        if (index < 0 || index >= this.totalImages) return;

        const currentImg = this.galleryImages[this.currentIndex];
        const targetImg = this.galleryImages[index];

        this.transitionToImage(currentImg, targetImg, () => {
            this.currentIndex = index;
            if (this.isRunning) {
                this.scheduleNextSlide();
            }
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();
        // Reset styles
        this.galleryImages.forEach(img => {
            img.parentElement.style.transition = '';
            img.parentElement.style.opacity = '';
        });
    }
}

// Export for global use
window.GallerySlideshow = GallerySlideshow;
