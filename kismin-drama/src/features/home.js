/**
 * Home Page
 * KISMIN Mode - Display content with category support
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';
import CONFIG from '../core/config.js';

const HomePage = {
    currentCategory: 'trending',
    currentPage: 1,
    isFetching: false,

    /**
     * Initialize home page
     */
    async init() {
        const container = document.getElementById('app');

        // Render header, categories, and grid
        container.innerHTML = `
      ${Components.Header('KISMIN Drama', false)}
      <div class="page">
        <div class="category-tabs" id="category-tabs">
          ${CONFIG.CATEGORIES.map(cat => `
            <button class="category-tab ${this.currentCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>
        <div id="drama-list" class="drama-grid">
          ${Components.LoadingSkeleton('drama', 6)}
        </div>
      </div>
      ${Components.BottomNav('home')}
    `;

        // Load first category
        await this.loadCategory(this.currentCategory, 1, true);

        // Attach event listeners
        this.attachListeners();
    },

    /**
     * Load items by category
     */
    async loadCategory(category, page = 1, reset = false) {
        if (this.isFetching) return;
        this.isFetching = true;

        const listContainer = document.getElementById('drama-list');
        if (reset) {
            listContainer.innerHTML = Components.LoadingSkeleton('drama', 6);
        }

        try {
            const items = await API.fetchByCategory(category, page);

            if (reset) {
                if (items.length === 0) {
                    listContainer.innerHTML = Components.EmptyState('No items found', '🎬');
                } else {
                    listContainer.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                }
            } else {
                // Append items if we ever implement infinite scroll
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = items.map(item => Components.DramaCard(item)).join('');
                while (tempDiv.firstChild) {
                    listContainer.appendChild(tempDiv.firstChild);
                }
            }

            this.currentCategory = category;
            this.currentPage = page;

        } catch (error) {
            console.error('Error loading category:', error);
            if (reset) {
                listContainer.innerHTML = Components.ErrorMessage('Failed to load content');
            }
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
                Utils.showToast(
                    isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
                    'success'
                );
            }
        });
    }
};

export default HomePage;
