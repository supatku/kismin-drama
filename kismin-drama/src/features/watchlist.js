/**
 * Watchlist Page
 * KISMIN Mode - Show favorited dramas from localStorage
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const WatchlistPage = {
    /**
     * Initialize watchlist page
     */
    async init() {
        const container = document.getElementById('app');

        // Render header
        container.innerHTML = `
      ${Components.Header('My Watchlist', false)}
      <div class="page">
        <div id="watchlist-content" class="drama-grid">
          ${Components.LoadingSkeleton('drama', 4)}
        </div>
      </div>
      ${Components.BottomNav('watchlist')}
    `;

        // Load favorites
        await this.loadWatchlist();

        // Attach listeners
        this.attachListeners();
    },

    /**
     * Load watchlist from localStorage
     */
    async loadWatchlist() {
        const content = document.getElementById('watchlist-content');
        const favoriteIds = Storage.getFavorites();

        if (favoriteIds.length === 0) {
            content.innerHTML = Components.EmptyState(
                'No dramas in your watchlist yet',
                '💔'
            );
            return;
        }

        try {
            // Fetch all trending dramas (since we're using mock data)
            const allDramas = await API.getTrending();

            // Filter to only favorites
            const favoriteDramas = allDramas.filter(drama =>
                favoriteIds.includes(drama.id)
            );

            if (favoriteDramas.length === 0) {
                content.innerHTML = Components.EmptyState(
                    'No dramas in your watchlist yet',
                    '💔'
                );
                return;
            }

            // Render favorite dramas
            content.innerHTML = favoriteDramas
                .map(drama => Components.DramaCard(drama))
                .join('');

        } catch (error) {
            console.error('Error loading watchlist:', error);
            content.innerHTML = Components.ErrorMessage('Failed to load watchlist');
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

        // Favorite button clicks - remove from watchlist
        container.addEventListener('click', async (e) => {
            const favoriteBtn = e.target.closest('.drama-card__favorite');
            if (favoriteBtn) {
                e.stopPropagation();
                const dramaId = parseInt(favoriteBtn.dataset.dramaId);
                const isFavorite = Storage.toggleFavorite(dramaId);

                // Show toast
                Utils.showToast(
                    isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
                    'success'
                );

                // Reload watchlist to remove card
                if (!isFavorite) {
                    await this.loadWatchlist();
                }
            }
        });
    }
};

export default WatchlistPage;
