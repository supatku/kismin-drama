/**
 * Home Page
 * KISMIN Mode - Display trending dramas
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const HomePage = {
    /**
     * Initialize home page
     */
    async init() {
        const container = document.getElementById('app');

        // Render header and navigation
        container.innerHTML = `
      ${Components.Header('KISMIN Drama', false)}
      <div class="page">
        <div id="drama-list" class="drama-grid">
          ${Components.LoadingSkeleton('drama', 6)}
        </div>
      </div>
      ${Components.BottomNav('home')}
    `;

        // Load dramas
        await this.loadDramas();

        // Attach event listeners
        this.attachListeners();
    },

    /**
     * Load dramas from API
     */
    async loadDramas() {
        const listContainer = document.getElementById('drama-list');

        try {
            const dramas = await API.getTrending();

            if (dramas.length === 0) {
                listContainer.innerHTML = Components.EmptyState('No dramas available', '🎬');
                return;
            }

            // Render drama cards
            listContainer.innerHTML = dramas.map(drama => Components.DramaCard(drama)).join('');

        } catch (error) {
            console.error('Error loading dramas:', error);
            listContainer.innerHTML = Components.ErrorMessage('Failed to load dramas');
        }
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        const container = document.getElementById('app');

        // Drama card clicks - navigate to detail
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.drama-card');
            if (card && !e.target.closest('.drama-card__favorite')) {
                const dramaId = card.dataset.id;
                window.location.hash = `#detail/${dramaId}`;
            }
        });

        // Favorite button clicks
        container.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.drama-card__favorite');
            if (favoriteBtn) {
                e.stopPropagation();
                const dramaId = parseInt(favoriteBtn.dataset.dramaId);
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
