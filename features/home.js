/**
 * Home Page
 * KISMIN Mode - Display content with category support + Search + Infinite Scroll
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import { showToast } from '../shared/utils.js';
import CONFIG from '../core/config.js';
import ManualContentAPI from '../core/manual_content.js';
import Monetization from './monetization.js';

const HomePage = {
    currentCategory: 'trending',
    currentPage: 1,
    isFetching: false,
    hasMore: true,
    scrollObserver: null,
    searchQuery: '',
    searchDebounceTimer: null,
    isSearchMode: false,

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
        this.isSearchMode = false;

        // Mark performance
        window.PerformanceMonitor?.mark('home-init-start');

        // Render header, search bar, categories, and grid
        container.innerHTML = `
      ${Components.Header('Toktok', false)}
      <div class="page">
        ${Components.SearchBar()}
        <div id="category-section">
          <div class="category-tabs" id="category-tabs">
            ${CONFIG.CATEGORIES.map(cat => `
              <button class="category-tab ${this.currentCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
        </div>
        ${Components.AdBanner('home-affiliate-banner')}
        <div id="results-header"></div>
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

        // Initialize affiliate monetization
        this.initMonetization();

        console.log('[HomePage] Initialization complete!');
    },

    /**
     * Initialize monetization system for home page
     */
    initMonetization() {
        try {
            Monetization.init();
            Monetization.renderAffiliateBanner('home-affiliate-banner');
            Monetization.renderBottomBanner();
        } catch (error) {
            console.warn('[HomePage] Monetization error:', error);
        }
    },

    /**
     * Setup IntersectionObserver for infinite scroll
     */
    setupInfiniteScroll() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        const sentinel = document.getElementById('scroll-sentinel');
        if (!sentinel) return;

        this.scrollObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !this.isFetching && this.hasMore && !this.isSearchMode) {
                console.log('[HomePage] Sentinel visible, loading next page...');
                this.loadNextPage();
            }
        }, {
            root: null,
            rootMargin: '400px',
            threshold: 0
        });

        this.scrollObserver.observe(sentinel);
        console.log('[HomePage] Infinite scroll observer attached');
    },

    /**
     * Load the next page
     */
    async loadNextPage() {
        if (this.isFetching || !this.hasMore) return;

        const nextPage = this.currentPage + 1;
        console.log(`[HomePage] Loading next page: ${nextPage}`);

        const indicator = document.getElementById('load-more-indicator');
        if (indicator) indicator.style.display = 'block';

        await this.loadCategory(this.currentCategory, nextPage, false);

        if (indicator) indicator.style.display = 'none';
    },

    /**
     * Perform search with debounce
     */
    async performSearch(query) {
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }

        query = query.trim();

        if (!query) {
            this.exitSearchMode();
            return;
        }

        this.searchDebounceTimer = setTimeout(async () => {
            await this.executeSearch(query);
        }, 300);
    },

    /**
     * Execute actual search API call
     */
    async executeSearch(query) {
        if (this.isFetching) return;

        this.isFetching = true;
        this.isSearchMode = true;
        this.searchQuery = query;

        const listContainer = document.getElementById('drama-list');
        const resultsHeader = document.getElementById('results-header');
        const categorySection = document.getElementById('category-section');

        if (categorySection) categorySection.style.display = 'none';

        listContainer.innerHTML = `
            <div class="search-loading">
                <div class="search-loading__spinner">🔍</div>
                <p>Mencari "${query}"...</p>
            </div>
        `;

        try {
            const items = await API.search(query);

            if (resultsHeader) {
                resultsHeader.innerHTML = Components.SearchResultsHeader(query, items.length);
            }

            if (items.length === 0) {
                listContainer.innerHTML = Components.EmptyState(`Tidak ditemukan hasil untuk "${query}"`, '🔍');
            } else {
                listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                if (window.LazyLoader) {
                    setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                }
            }
        } catch (error) {
            console.error('[HomePage] Search error:', error);
            listContainer.innerHTML = Components.ErrorMessage('Gagal mencari. Coba lagi.');
        } finally {
            this.isFetching = false;
        }
    },

    /**
     * Exit search mode
     */
    exitSearchMode() {
        this.isSearchMode = false;
        this.searchQuery = '';

        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const resultsHeader = document.getElementById('results-header');
        const categorySection = document.getElementById('category-section');

        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.classList.add('hidden');
        if (resultsHeader) resultsHeader.innerHTML = '';
        if (categorySection) categorySection.style.display = 'block';

        this.hasMore = true;
        this.loadCategory(this.currentCategory, 1, true);
    },

    /**
     * Load items by category
     */
    async loadCategory(category, page = 1, reset = false) {
        console.log('[HomePage] loadCategory:', { category, page, reset });
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
            const items = await API.fetchByCategory(category, page);
            console.log(`[HomePage] Got ${items.length} items for page ${page}`);

            if (reset) {
                if (items.length === 0) {
                    listContainer.innerHTML = Components.EmptyState('Belum ada konten di kategori ini', '🎬');
                    this.hasMore = false;
                } else {
                    listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                    if (window.LazyLoader) {
                        setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                    }
                }
            } else {
                if (items.length === 0) {
                    this.hasMore = false;
                    console.log('[HomePage] No more items, stopping infinite scroll');
                } else {
                    const fragment = document.createDocumentFragment();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                    while (tempDiv.firstChild) {
                        fragment.appendChild(tempDiv.firstChild);
                    }
                    listContainer.appendChild(fragment);

                    if (window.LazyLoader) {
                        setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                    }
                }
            }

            this.currentCategory = category;
            this.currentPage = page;

        } catch (error) {
            console.error('[HomePage] Error loading category:', error);
            if (reset) {
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
                    listContainer.innerHTML = Components.ErrorMessage('Failed to load content');
                }
            }
        } finally {
            this.isFetching = false;
        }
    },

    /**
     * Attach all event listeners
     */
    attachListeners() {
        const container = document.getElementById('app');

        // Search input handler
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const clearBtn = document.getElementById('search-clear');
                if (clearBtn) {
                    clearBtn.classList.toggle('hidden', !query);
                }
                this.performSearch(query);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.searchDebounceTimer) {
                        clearTimeout(this.searchDebounceTimer);
                    }
                    const query = searchInput.value.trim();
                    if (query) {
                        this.executeSearch(query);
                    }
                }
            });
        }

        // Search clear/back buttons
        container.addEventListener('click', (e) => {
            if (e.target.closest('#search-clear') || e.target.closest('#search-back')) {
                this.exitSearchMode();
            }
        });

        // Category tab clicks
        const tabsContainer = document.getElementById('category-tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.category-tab');
                if (tab) {
                    const categoryId = tab.dataset.id;
                    if (categoryId === this.currentCategory) return;

                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

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
                favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
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
