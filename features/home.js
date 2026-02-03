/**
 * Home Page
 * KISMIN Mode - Display content with category support + Search
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
    searchQuery: '',
    searchDebounceTimer: null,
    isSearchMode: false,

    /**
     * Initialize home page
     */
    async init() {
        console.log('[HomePage] Starting initialization...');
        const container = document.getElementById('app');
        console.log('[HomePage] Container found:', !!container);

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
        ${Components.AdBanner()}
        <div id="results-header"></div>
        <div id="drama-list" class="drama-grid">
          ${Components.LoadingSkeleton('drama', 6)}
        </div>
      </div>
      ${Components.BottomNav('home')}
    `;
        console.log('[HomePage] HTML rendered successfully');

        // Load first category
        console.log('[HomePage] Loading category:', this.currentCategory);
        await this.loadCategory(this.currentCategory, 1, true);

        // Test manual content
        console.log('[HomePage] Testing manual content...');
        this.testManualContent();

        // Attach event listeners
        console.log('[HomePage] Attaching listeners...');
        this.attachListeners();

        // Mark performance
        window.PerformanceMonitor?.mark('home-init-end');
        window.PerformanceMonitor?.measure('home-init', 'home-init-start', 'home-init-end');

        console.log('[HomePage] Initialization complete!');
    },

    /**
     * Perform search with debounce
     * @param {string} query - Search query
     */
    async performSearch(query) {
        console.log('[HomePage] performSearch called:', query);

        // Clear previous debounce timer
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }

        // Trim query
        query = query.trim();

        // If empty, exit search mode
        if (!query) {
            this.exitSearchMode();
            return;
        }

        // Debounce search (300ms delay)
        this.searchDebounceTimer = setTimeout(async () => {
            await this.executeSearch(query);
        }, 300);
    },

    /**
     * Execute actual search API call
     * @param {string} query - Search query
     */
    async executeSearch(query) {
        console.log('[HomePage] executeSearch:', query);
        if (this.isFetching) return;

        this.isFetching = true;
        this.isSearchMode = true;
        this.searchQuery = query;

        const listContainer = document.getElementById('drama-list');
        const resultsHeader = document.getElementById('results-header');
        const categorySection = document.getElementById('category-section');

        // Hide category tabs during search
        if (categorySection) {
            categorySection.style.display = 'none';
        }

        // Show loading
        listContainer.innerHTML = `
            <div class="search-loading">
                <div class="search-loading__spinner">🔍</div>
                <p>Mencari "${query}"...</p>
            </div>
        `;

        try {
            const items = await API.search(query);
            console.log('[HomePage] Search results:', items);

            // Show results header
            resultsHeader.innerHTML = Components.SearchResultsHeader(query, items.length);

            if (items.length === 0) {
                listContainer.innerHTML = Components.EmptyState(`Tidak ditemukan hasil untuk "${query}"`, '🔍');
            } else {
                listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');

                // Re-observe lazy images
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
     * Exit search mode and return to category view
     */
    exitSearchMode() {
        console.log('[HomePage] Exiting search mode');
        this.isSearchMode = false;
        this.searchQuery = '';

        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const resultsHeader = document.getElementById('results-header');
        const categorySection = document.getElementById('category-section');

        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }

        // Hide clear button
        if (searchClear) {
            searchClear.classList.add('hidden');
        }

        // Clear results header
        if (resultsHeader) {
            resultsHeader.innerHTML = '';
        }

        // Show category tabs
        if (categorySection) {
            categorySection.style.display = 'block';
        }

        // Reload current category
        this.loadCategory(this.currentCategory, 1, true);
    },

    /**
     * Load items by category
     */
    async loadCategory(category, page = 1, reset = false) {
        console.log('[HomePage] loadCategory called:', { category, page, reset, isFetching: this.isFetching });
        if (this.isFetching) return;
        this.isFetching = true;

        const listContainer = document.getElementById('drama-list');
        console.log('[HomePage] List container found:', !!listContainer);
        if (reset) {
            listContainer.innerHTML = Components.LoadingSkeleton('drama', 6);
        }

        try {
            console.log('[HomePage] Calling API.fetchByCategory...');
            const items = await API.fetchByCategory(category, page);
            console.log('[HomePage] API response:', items);

            if (reset) {
                if (items.length === 0) {
                    console.log('[HomePage] No items found, showing empty state');
                    listContainer.innerHTML = Components.EmptyState('No items found', '🎬');
                } else {
                    console.log('[HomePage] Rendering', items.length, 'items');
                    listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');

                    // Re-observe lazy images after rendering
                    if (window.LazyLoader) {
                        setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                    }
                }
            } else {
                // Append items if we ever implement infinite scroll
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                while (tempDiv.firstChild) {
                    listContainer.appendChild(tempDiv.firstChild);
                }

                // Re-observe lazy images for appended items
                if (window.LazyLoader) {
                    setTimeout(() => window.LazyLoader.observeAll(listContainer), 50);
                }
            }

            this.currentCategory = category;
            this.currentPage = page;
            console.log('[HomePage] Category loaded successfully');

        } catch (error) {
            console.error('[HomePage] Error loading category:', error);
            if (reset) {
                // Show manual content even if external API fails
                try {
                    console.log('[HomePage] Trying manual content fallback...');
                    const manualItems = await ManualContentAPI.fetchManualDramas();
                    console.log('[HomePage] Manual items:', manualItems);
                    if (manualItems.length > 0) {
                        listContainer.innerHTML = manualItems.map(item => Components.DramaCard(item)).join('');

                        // Re-observe lazy images for fallback content
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
        } finally {
            this.isFetching = false;
            console.log('[HomePage] loadCategory finished');
        }
    },

    /**
     * Test manual content API
     */
    async testManualContent() {
        try {
            console.log('[HomePage] Testing manual content API...');
            const manualDramas = await ManualContentAPI.fetchManualDramas();
            console.log('[HomePage] Manual dramas:', manualDramas);

            if (manualDramas.length > 0) {
                const episodes = await ManualContentAPI.fetchManualEpisodes(manualDramas[0].id);
                console.log('[HomePage] Episodes for first drama:', episodes);
            }
        } catch (error) {
            console.error('[HomePage] Manual content test failed:', error);
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

                // Show/hide clear button
                if (clearBtn) {
                    clearBtn.classList.toggle('hidden', !query);
                }

                // Perform search
                this.performSearch(query);
            });

            // Handle Enter key
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Clear debounce and search immediately
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

        // Search clear button
        container.addEventListener('click', (e) => {
            if (e.target.closest('#search-clear')) {
                this.exitSearchMode();
            }
        });

        // Search back button
        container.addEventListener('click', (e) => {
            if (e.target.closest('#search-back')) {
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

                    // Update UI
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Load data
                    this.loadCategory(categoryId, 1, true);
                }
            });
        }

        // Card clicks - navigate to detail
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.drama-card');
            if (card && !e.target.closest('.drama-card__favorite')) {
                const dramaId = card.dataset.id;
                // detailPath is used as ID, so it's already encoded or string
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
    }
};

export default HomePage;
