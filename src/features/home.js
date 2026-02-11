/**
 * Home Page
 * KISMIN Mode - Display content with category support
 * Implements infinite scroll for full content loading
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import { showToast } from '../shared/utils.js';
import CONFIG from '../core/config.js';
import ManualContentAPI from '../core/manual_content.js';

const HomePage = {
    currentCategory: 'trending',
    currentPage: 1,
    isFetching: false,
    hasMore: true,
    scrollObserver: null,

    /**
     * Initialize home page
     */
    async init() {
        console.log('[HomePage] Starting initialization...');
        const container = document.getElementById('app');

        // Reset pagination state
        this.currentPage = 1;
        this.hasMore = true;
        this.isFetching = false;

        // Mark performance
        window.PerformanceMonitor?.mark('home-init-start');

        // Render header, categories, and grid
        container.innerHTML = `
      ${Components.Header('Toktok', false)}
      <div class="page">
        <div class="category-tabs" id="category-tabs">
          ${CONFIG.CATEGORIES.map(cat => `
            <button class="category-tab ${this.currentCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>
        ${Components.AdBanner()}
        <div id="drama-list" class="drama-grid">
          ${Components.LoadingSkeleton('drama', 6)}
        </div>
        <div id="scroll-sentinel" style="height:1px;"></div>
        <div id="load-more-indicator" style="display:none; text-align:center; padding:24px 0;">
          <div class="spinner" style="width:32px; height:32px; border:3px solid rgba(255,255,255,0.2); border-top:3px solid #ff6b6b; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 8px;"></div>
          <span style="color:rgba(255,255,255,0.5); font-size:13px;">Loading more...</span>
        </div>
      </div>
      ${Components.BottomNav('home')}
    `;

        // Load first page
        await this.loadCategory(this.currentCategory, 1, true);

        // Setup infinite scroll
        this.setupInfiniteScroll();

        // Attach event listeners
        this.attachListeners();

        // Mark performance
        window.PerformanceMonitor?.mark('home-init-end');
        window.PerformanceMonitor?.measure('home-init', 'home-init-start', 'home-init-end');

        console.log('[HomePage] Initialization complete!');
    },

    /**
     * Setup IntersectionObserver for infinite scroll
     */
    setupInfiniteScroll() {
        // Disconnect previous observer if any
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        const sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) return;

        this.scrollObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !this.isFetching && this.hasMore) {
                console.log('[HomePage] Sentinel visible, loading next page...');
                this.loadNextPage();
            }
        }, {
            root: null,
            rootMargin: '400px', // Start loading 400px before user reaches the bottom
            threshold: 0
        });

        this.scrollObserver.observe(sentinel);
        console.log('[HomePage] Infinite scroll observer attached');
    },

    /**
     * Load the next page of current category
     */
    async loadNextPage() {
        if (this.isFetching || !this.hasMore) return;

        const nextPage = this.currentPage + 1;
        console.log(`[HomePage] Loading next page: ${nextPage}`);

        // Show loading indicator
        const indicator = document.getElementById('load-more-indicator');
        if (indicator) indicator.style.display = 'block';

        await this.loadCategory(this.currentCategory, nextPage, false);

        if (indicator) indicator.style.display = 'none';
    },

    /**
     * Load items by category
     */
    async loadCategory(category, page = 1, reset = false) {
        console.log('[HomePage] loadCategory called:', { category, page, reset, isFetching: this.isFetching });
        if (this.isFetching) return;
        this.isFetching = true;

        const listContainer = document.getElementById('drama-list');
        if (!listContainer) {
            this.isFetching = false;
            return;
        }

        if (reset) {
            listContainer.innerHTML = Components.LoadingSkeleton('drama', 6);
            this.currentPage = 1;
            this.hasMore = true;
        }

        try {
            console.log('[HomePage] Calling API.fetchByCategory...');
            const items = await API.fetchByCategory(category, page);
            console.log(`[HomePage] API response: ${items.length} items for page ${page}`);

            if (reset) {
                if (items.length === 0) {
                    listContainer.innerHTML = Components.EmptyState('No items found', '🎬');
                    this.hasMore = false;
                } else {
                    listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');

                    // Re-observe lazy images after rendering
                    if (window.LazyLoader) {
                        setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                    }
                }
            } else {
                if (items.length === 0) {
                    // No more items to load
                    this.hasMore = false;
                    console.log('[HomePage] No more items, stopping infinite scroll');
                } else {
                    // Append new items
                    const fragment = document.createDocumentFragment();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                    while (tempDiv.firstChild) {
                        fragment.appendChild(tempDiv.firstChild);
                    }
                    listContainer.appendChild(fragment);

                    // Re-observe lazy images for appended items
                    if (window.LazyLoader) {
                        setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                    }
                }
            }

            this.currentCategory = category;
            this.currentPage = page;
            console.log(`[HomePage] Category loaded: page=${page}, hasMore=${this.hasMore}`);

        } catch (error) {
            console.error('[HomePage] Error loading category:', error);
            if (reset) {
                // Show manual content even if external API fails
                try {
                    const manualItems = await ManualContentAPI.fetchManualDramas();
                    if (manualItems.length > 0) {
                        listContainer.innerHTML = manualItems.map(item => Components.DramaCard(item)).join('');
                        if (window.LazyLoader) {
                            setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                        }
                    } else {
                        listContainer.innerHTML = Components.ErrorMessage('Failed to load content');
                    }
                } catch (manualError) {
                    console.error('[HomePage] Manual content also failed:', manualError);
                    listContainer.innerHTML = Components.ErrorMessage('Failed to load content');
                }
            }
            // On append failure, don't set hasMore to false — allow retry
        } finally {
            this.isFetching = false;
        }
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        const container = document.getElementById('app');

        // Category tab clicks
        const tabsContainer = document.getElementById('category-tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.category-tab');
                if (tab) {
                    const categoryId = tab.dataset.id;
                    if (categoryId === this.currentCategory) return;

                    // Update UI
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Reset and load new category
                    this.hasMore = true;
                    this.loadCategory(categoryId, 1, true);
                }
            });
        }

        // Card clicks - navigate to detail
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.drama-card');
            if (card && !e.target.closest('.drama-card__favorite')) {
                const dramaId = card.dataset.id;
                window.location.hash = `#detail/${encodeURIComponent(dramaId)}`;
            }
        });

        // Favorite button clicks
        container.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.drama-card__favorite');
            if (favoriteBtn) {
                e.stopPropagation();
                const dramaId = favoriteBtn.dataset.dramaId;
                const isFavorite = Storage.toggleFavorite(dramaId);

                // Update button
                favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';

                // Show toast
                showToast(
                    isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
                    'success'
                );
            }
        });
    },

    /**
     * Cleanup when leaving page
     */
    destroy() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
    }
};

export default HomePage;
