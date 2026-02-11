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

        console.log('Toktok App initialized');
    }

    /**
     * Initialize Telegram WebApp SDK
     */
    initTelegram() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;

            // Version-dependent features
            const version = parseFloat(tg.version);
            console.log(`[Telegram] WebApp version: ${version}`);

            // Expand to full height
            tg.expand();

            // Enable closing confirmation (v6.2+)
            if (version >= 6.2) {
                tg.enableClosingConfirmation();
            }

            // Set header color (v6.2+)
            if (version >= 6.2) {
                tg.setHeaderColor('#0a0a0a');
            }

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
        console.log('[App] handleRoute called');
        // Get current hash
        const hash = window.location.hash.slice(1) || 'home';
        const [route, ...params] = hash.split('/');
        console.log('[App] Route:', route, 'Params:', params);

        // Find matching route handler
        const PageHandler = this.routes[route];
        console.log('[App] PageHandler found:', !!PageHandler);

        if (!PageHandler) {
            console.error('Route not found:', route);
            window.location.hash = '#home';
            return;
        }

        // Destroy previous page if it has cleanup
        if (this.currentPage?.destroy) {
            console.log('[App] Destroying previous page');
            this.currentPage.destroy();
        }

        // Initialize new page
        try {
            console.log('[App] Initializing page:', route);
            this.currentPage = PageHandler;

            if (params.length > 0) {
                // Route with parameters (e.g., detail/1, player/1-2)
                console.log('[App] Calling init with params:', params[0]);
                await PageHandler.init(params[0]);
            } else {
                // Route without parameters
                console.log('[App] Calling init without params');
                await PageHandler.init();
            }
            console.log('[App] Page initialized successfully');
        } catch (error) {
            console.error('[App] Error loading page:', error);
            alert('Failed to load page: ' + error.message);
        }
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
