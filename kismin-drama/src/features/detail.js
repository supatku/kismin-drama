/**
 * Detail Page
 * KISMIN Mode - Show item info and direct play button for Rebahan API
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const DetailPage = {
  currentItem: null,

  /**
   * Initialize detail page
   * @param {string} detailPath
   */
  async init(detailPath) {
    const container = document.getElementById('app');
    
    // Validate detailPath
    if (!detailPath || detailPath.trim() === '') {
      console.error('[DetailPage] Invalid detailPath:', detailPath);
      container.innerHTML = `
        ${Components.Header('Error', true)}
        <div class="page">
          ${Components.ErrorMessage('Invalid content ID. Please go back and try again.')}
        </div>
      `;
      return;
    }

    const decodedPath = decodeURIComponent(detailPath);
    console.log(`[DetailPage] Loading detail for: ${decodedPath}`);

    // Show loading state
    container.innerHTML = `
      ${Components.Header('Loading...', true)}
      <div class="page">
        <div class="text-center mt-lg">
          <div class="skeleton-line" style="height: 300px; border-radius: var(--radius-lg);"></div>
          <div class="skeleton-line mt-md"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      </div>
      ${Components.BottomNav('')}
    `;

    try {
      const item = await API.getDetail(decodedPath);
      this.currentItem = { ...item, id: decodedPath };

      // Render detail page
      this.render(this.currentItem);

      // Attach listeners
      this.attachListeners();

    } catch (error) {
      console.error('[DetailPage] Error loading detail:', error);
      // Show user-friendly error instead of crashing
      this.currentItem = {
        title: 'Content Unavailable',
        synopsis: 'This content is currently not available. Please try browsing other content.',
        thumbnail: 'https://via.placeholder.com/800x450?text=Content+Not+Available',
        rating: '0',
        year: '2024',
        genre: 'General',
        playerUrl: '',
        seasons: [],
        totalEpisodes: 0,
        id: decodedPath
      };
      
      this.render(this.currentItem);
      this.attachListeners();
    }
  },

  /**
   * Render detail page
   */
  render(item) {
    const isFavorite = Storage.isFavorite(item.id);
    const container = document.getElementById('app');

    // Check for seasons/episodes (TV series)
    const hasEpisodes = item.seasons && item.seasons.length > 0;

    container.innerHTML = `
      ${Components.Header(item.title, true)}
      <div class="page">
        <!-- Item Header -->
        <div style="margin-bottom: var(--spacing-xl);">
          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--spacing-lg);">
            <img src="${item.thumbnail}" alt="${Utils.escapeHtml(item.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
            <button class="drama-card__favorite" id="detail-favorite" style="top: var(--spacing-md); left: var(--spacing-md); background: rgba(0,0,0,0.6);">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          
          <h2 style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-sm); line-height: 1.2;">
            ${Utils.escapeHtml(item.title)}
          </h2>
          
          <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md); color: var(--color-text-secondary);">
            <span>⭐ ${item.rating}</span>
            <span>📅 ${item.year}</span>
          </div>
          
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap; margin-bottom: var(--spacing-lg);">
            ${item.genre ? item.genre.split(',').map(g => `<span class="genre-tag">${g.trim()}</span>`).join('') : '<span class="genre-tag">General</span>'}
          </div>

          ${!hasEpisodes ? `
            <div style="margin-bottom: var(--spacing-xl);">
              <button class="btn btn--primary btn--full" id="play-button">
                <span style="font-size: 1.2rem;">▶</span> Play Now
              </button>
            </div>
          ` : ''}
          
          <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm);">Synopsis</h3>
          <p style="color: var(--color-text-secondary); line-height: 1.6; font-size: var(--font-size-sm); margin-bottom: var(--spacing-xl);">
            ${Utils.escapeHtml(item.synopsis)}
          </p>

          ${hasEpisodes ? `
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">Episodes</h3>
            <div class="episode-list">
              ${item.seasons.map(season => `
                <div class="season-group">
                  <h4 style="margin: var(--spacing-md) 0; color: var(--color-primary);">Season ${season.season}</h4>
                  <div style="display: grid; gap: var(--spacing-sm);">
                    ${season.episodes.map(ep => `
                      <div class="episode-card" data-url="${btoa(ep.playerUrl)}">
                        <div class="episode-card__content">
                          <span style="margin-right: var(--spacing-sm);">Episode ${ep.episode}</span>
                          <span style="flex: 1; color: var(--color-text-secondary);">${ep.title}</span>
                          <span>▶</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      ${Components.BottomNav('')}
    `;
  },

  /**
   * Attach event listeners
   */
  attachListeners() {
    // Favorite button
    const favoriteBtn = document.getElementById('detail-favorite');
    if (favoriteBtn && this.currentItem) {
      favoriteBtn.addEventListener('click', () => {
        const isFavorite = Storage.toggleFavorite(this.currentItem.id);
        favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
        Utils.showToast(
          isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
          'success'
        );
      });
    }

    // Play button (for single items)
    const playBtn = document.getElementById('play-button');
    if (playBtn && this.currentItem && this.currentItem.playerUrl) {
      playBtn.addEventListener('click', () => {
        const encodedUrl = btoa(this.currentItem.playerUrl);
        window.location.hash = `#player/${encodedUrl}`;
      });
    }

    // Episode card clicks
    const episodeList = document.querySelector('.episode-list');
    if (episodeList) {
      episodeList.addEventListener('click', (e) => {
        const epCard = e.target.closest('.episode-card');
        if (epCard) {
          const encodedUrl = epCard.dataset.url;
          window.location.hash = `#player/${encodedUrl}`;
        }
      });
    }
  }
};

export default DetailPage;
