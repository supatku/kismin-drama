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
            // World-class implementation: Fetch from 'trending' as a base pool 
            // since we don't have a single "getByIds" API yet.
            const allDramas = await API.fetchByCategory('trending');

            // Filter to only favorites using high-performance string comparison
            const favoriteDramas = allDramas.filter(drama =>
                favoriteIds.some(favId => String(favId) === String(drama.id))
            );

            if (favoriteDramas.length === 0) {
                // If not found in trending, try to fetch specific details for each ID
                // This adds robustness for manual content or deep links
                const detailedDramas = await Promise.all(
                    favoriteIds.map(id => API.getDetail(id).catch(() => null))
                );

                const validDramas = detailedDramas.filter(d => d && d.title !== 'Content Not Available');

                if (validDramas.length === 0) {
                    content.innerHTML = Components.EmptyState(
                        'Belum ada drama di watchlist kamu',
                        '🎬'
                    );
                    return;
                }

                content.innerHTML = validDramas
                    .map(drama => Components.DramaCard({ ...drama, id: drama.id || favoriteIds[detailedDramas.indexOf(drama)] }))
                    .join('');
            } else {
                // Render filtered dramas
                content.innerHTML = favoriteDramas
                    .map(drama => Components.DramaCard(drama))
                    .join('');
            }

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
                const dramaId = favoriteBtn.dataset.dramaId; // IDs are strings in Toktok
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
