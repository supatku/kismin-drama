/**
 * Main Application Entry Point
 * KISMIN Mode - Simple SPA router
 */

import HomePage from './features/home.js';
import DetailPage from './features/detail.js';
import PlayerPage from './features/player.js';
import WatchlistPage from './features/watchlist.js';
import SupportPage from './features/support.js';

class App {
    constructor() {
        this.currentPage = null;
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        // Initialize Telegram WebApp if available
        this.initTelegram();

        // Setup router
        this.setupRouter();

        // Handle initial route
        this.handleRoute();

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        console.log('KISMIN Drama App initialized');
    }

    /**
     * Initialize Telegram WebApp SDK
     */
    initTelegram() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;

            // Expand to full height
            tg.expand();

            // Enable closing confirmation
            tg.enableClosingConfirmation();

            // Set header color to match dark theme
            tg.setHeaderColor('#0a0a0a');

            // Ready signal
            tg.ready();

            console.log('Telegram WebApp initialized');
        }
    }

    /**
     * Setup router
     */
    setupRouter() {
        this.routes = {
            '': HomePage,
            'home': HomePage,
            'detail': DetailPage,
            'player': PlayerPage,
            'watchlist': WatchlistPage,
            'support': SupportPage
        };
    }

    /**
     * Handle route changes
     */
    async handleRoute() {
        // Get current hash
        const hash = window.location.hash.slice(1) || 'home';
        const [route, ...params] = hash.split('/');

        // Find matching route handler
        const PageHandler = this.routes[route];

        if (!PageHandler) {
            console.error('Route not found:', route);
            window.location.hash = '#home';
            return;
        }

        // Destroy previous page if it has cleanup
        if (this.currentPage?.destroy) {
            this.currentPage.destroy();
        }

        // Initialize new page
        try {
            this.currentPage = PageHandler;

            if (params.length > 0) {
                // Route with parameters (e.g., detail/1, player/1-2)
                await PageHandler.init(params[0]);
            } else {
                // Route without parameters
                await PageHandler.init();
            }
        } catch (error) {
            console.error('Error loading page:', error);
            alert('Failed to load page');
        }
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
