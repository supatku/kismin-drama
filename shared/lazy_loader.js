/**
 * Lazy Loader
 * Progressive image loading with Intersection Observer
 * Supports blur-up placeholders and WebP format
 */

const LazyLoader = {
    observer: null,
    images: new Set(),

    /**
     * Initialize lazy loading
     */
    init() {
        if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
            console.warn('[LazyLoader] IntersectionObserver not supported');
            return;
        }

        // Create intersection observer
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px 0px', // Start loading 50px before entering viewport
                threshold: 0.01
            }
        );

        console.log('[LazyLoader] Initialized');
    },

    /**
     * Observe an image element
     * @param {HTMLElement} img - Image element
     */
    observe(img) {
        if (!this.observer || !img) return;

        // Add to tracking set
        this.images.add(img);

        // Start observing
        this.observer.observe(img);
    },

    /**
     * Observe all lazy images in container
     * @param {HTMLElement} container - Container element
     */
    observeAll(container = document) {
        const images = container.querySelectorAll('img[data-src], img[loading="lazy"]');
        images.forEach(img => this.observe(img));
        console.log(`[LazyLoader] Observing ${images.length} images`);
    },

    /**
     * Load an image
     * @param {HTMLElement} img - Image element
     */
    loadImage(img) {
        const src = img.dataset.src || img.src;
        const srcset = img.dataset.srcset;

        // Create a temporary image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            // Apply loaded image
            img.src = src;
            if (srcset) {
                img.srcset = srcset;
            }

            // Add loaded class for fade-in effect
            img.classList.add('lazy-loaded');

            // Remove blur placeholder
            img.style.filter = '';

            // Clean up
            this.images.delete(img);
            delete img.dataset.src;
            delete img.dataset.srcset;

            console.log(`[LazyLoader] Loaded: ${src.substring(0, 50)}...`);
        };

        tempImg.onerror = () => {
            console.error(`[LazyLoader] Failed to load: ${src}`);
            // Show error state
            img.classList.add('lazy-error');
            this.images.delete(img);
        };

        // Start loading
        tempImg.src = src;
        if (srcset) {
            tempImg.srcset = srcset;
        }
    },

    /**
     * Create blur-up placeholder
     * @param {string} src - Original image source
     * @returns {string} Data URL for placeholder
     */
    createPlaceholder(src, width = 20, height = 20) {
        // For production, you'd generate actual blur thumbnails
        // For now, return a simple SVG placeholder
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
      </svg>
    `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    },

    /**
     * Check if browser supports WebP
     * @returns {Promise<boolean>}
     */
    async supportsWebP() {
        if (this._webpSupport !== undefined) {
            return this._webpSupport;
        }

        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this._webpSupport = webP.height === 2;
                resolve(this._webpSupport);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    },

    /**
     * Get optimized image URL (with WebP support)
     * @param {string} url - Original image URL
     * @returns {string} Optimized image URL
     */
    async getOptimizedUrl(url) {
        const supportsWebP = await this.supportsWebP();

        // If WebP is supported and URL is from common CDN, append format parameter
        if (supportsWebP && (url.includes('cloudinary') || url.includes('imgix'))) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}format=webp`;
        }

        return url;
    },

    /**
     * Cleanup and stop observing
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.images.clear();
            console.log('[LazyLoader] Destroyed');
        }
    },

    /**
     * Manually load all remaining images
     */
    loadAll() {
        this.images.forEach(img => {
            this.loadImage(img);
            if (this.observer) {
                this.observer.unobserve(img);
            }
        });
        console.log('[LazyLoader] Force loaded all images');
    }
};

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LazyLoader.init();
            // Observe initial images after a short delay (allow DOM to settle)
            setTimeout(() => LazyLoader.observeAll(), 100);
        });
    } else {
        LazyLoader.init();
        setTimeout(() => LazyLoader.observeAll(), 100);
    }

    window.LazyLoader = LazyLoader;
}

export default LazyLoader;
