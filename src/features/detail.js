/**
 * Detail Page
 * KISMIN Mode - Show drama info and episode list
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const DetailPage = {
    currentDrama: null,

    /**
     * Initialize detail page
     * @param {number} dramaId
     */
    async init(dramaId) {
        const container = document.getElementById('app');

        // Show loading state
        container.innerHTML = `
      ${Components.Header('Loading...', true)}
      <div class="page">
        <div class="text-center mt-lg">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
      ${Components.BottomNav('')}
    `;

        try {
            // Load drama details
            const drama = await API.getDetail(dramaId);
            this.currentDrama = drama;

            // Load episodes
            const episodes = await API.getEpisodes(dramaId);

            // Render detail page
            this.render(drama, episodes);

            // Attach listeners
            this.attachListeners(episodes);

        } catch (error) {
            console.error('Error loading drama:', error);
            container.innerHTML = `
        ${Components.Header('Error', true)}
        <div class="page">
          ${Components.ErrorMessage('Drama not found')}
        </div>
      `;
        }
    },

    /**
     * Render detail page
     */
    render(drama, episodes) {
        const isFavorite = Storage.isFavorite(drama.id);
        const container = document.getElementById('app');

        container.innerHTML = `
      ${Components.Header(drama.title, true)}
      <div class="page">
        <!-- Drama Header -->
        <div style="margin-bottom: var(--spacing-xl);">
          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--spacing-lg);">
            <img src="${drama.thumbnail}" alt="${Utils.escapeHtml(drama.title)}" style="width: 100%; aspect-ratio: 3/4; object-fit: cover;">
            <button class="drama-card__favorite" id="detail-favorite" style="top: var(--spacing-md); left: var(--spacing-md);">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          
          <h2 style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-sm);">
            ${Utils.escapeHtml(drama.title)}
          </h2>
          
          <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md); color: var(--color-text-secondary);">
            <span>⭐ ${drama.rating}</span>
            <span>📅 ${drama.year}</span>
            <span>📺 ${drama.episodes} episodes</span>
          </div>
          
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap; margin-bottom: var(--spacing-lg);">
            ${drama.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
          
          <p style="color: var(--color-text-secondary); line-height: 1.6;">
            ${Utils.escapeHtml(drama.synopsis)}
          </p>
        </div>
        
        <!-- Episodes -->
        <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">Episodes</h3>
        <div id="episode-list" class="episode-list">
          ${episodes.map(ep => Components.EpisodeCard(ep)).join('')}
        </div>
      </div>
      ${Components.BottomNav('')}
    `;
    },

    /**
     * Attach event listeners
     */
    attachListeners(episodes) {
        // Favorite button
        const favoriteBtn = document.getElementById('detail-favorite');
        if (favoriteBtn && this.currentDrama) {
            favoriteBtn.addEventListener('click', () => {
                const isFavorite = Storage.toggleFavorite(this.currentDrama.id);
                favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
                Utils.showToast(
                    isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
                    'success'
                );
            });
        }

        // Episode clicks - navigate to player
        document.addEventListener('click', (e) => {
            const episodeCard = e.target.closest('.episode-card');
            if (episodeCard) {
                const episodeId = episodeCard.dataset.episodeId;
                const episode = episodes.find(ep => ep.id === episodeId);
                if (episode) {
                    window.location.hash = `#player/${episodeId}`;
                }
            }
        });
    }
};

export default DetailPage;
