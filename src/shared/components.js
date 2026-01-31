/**
 * Reusable UI Components
 * KISMIN Mode - Simple component generators
 */

import Storage from '../core/storage.js';
import Utils from './utils.js';

const Components = {
    /**
     * Create a drama card component
     * @param {Object} drama
     * @returns {string} HTML string
     */
    DramaCard(drama) {
        const isFavorite = Storage.isFavorite(drama.id);
        const heartIcon = isFavorite ? '❤️' : '🤍';

        return `
      <div class="drama-card" data-id="${drama.id}">
        <div class="drama-card__thumbnail">
          <img src="${drama.thumbnail}" alt="${Utils.escapeHtml(drama.title)}" loading="lazy">
          <div class="drama-card__rating">⭐ ${drama.rating}</div>
        </div>
        <div class="drama-card__content">
          <h3 class="drama-card__title">${Utils.escapeHtml(drama.title)}</h3>
          <p class="drama-card__meta">${drama.year} • ${drama.episodes} episodes</p>
          <div class="drama-card__genres">
            ${drama.genre.slice(0, 2).map(g => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
        </div>
        <button class="drama-card__favorite" data-drama-id="${drama.id}" aria-label="Toggle favorite">
          ${heartIcon}
        </button>
      </div>
    `;
    },

    /**
     * Create an episode card component
     * @param {Object} episode
     * @returns {string} HTML string
     */
    EpisodeCard(episode) {
        return `
      <div class="episode-card" data-episode-id="${episode.id}">
        <div class="episode-card__thumbnail">
          <img src="${episode.thumbnail}" alt="Episode ${episode.number}" loading="lazy">
          <div class="episode-card__duration">${Utils.formatDuration(episode.duration)}</div>
          <div class="episode-card__play">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.9)"/>
              <path d="M18 12L36 24L18 36V12Z" fill="#000"/>
            </svg>
          </div>
        </div>
        <div class="episode-card__content">
          <h4 class="episode-card__title">${Utils.escapeHtml(episode.title)}</h4>
        </div>
      </div>
    `;
    },

    /**
     * Create loading skeleton
     * @param {string} type - 'drama' or 'episode'
     * @param {number} count
     * @returns {string} HTML string
     */
    LoadingSkeleton(type = 'drama', count = 6) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            if (type === 'drama') {
                skeletons.push(`
          <div class="drama-card skeleton">
            <div class="drama-card__thumbnail skeleton-box"></div>
            <div class="drama-card__content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line skeleton-line--short"></div>
            </div>
          </div>
        `);
            } else {
                skeletons.push(`
          <div class="episode-card skeleton">
            <div class="episode-card__thumbnail skeleton-box"></div>
            <div class="episode-card__content">
              <div class="skeleton-line"></div>
            </div>
          </div>
        `);
            }
        }
        return skeletons.join('');
    },

    /**
     * Create error message component
     * @param {string} message
     * @returns {string} HTML string
     */
    ErrorMessage(message = 'Something went wrong') {
        return `
      <div class="error-card">
        <div class="error-card__icon">⚠️</div>
        <p class="error-card__message">${Utils.escapeHtml(message)}</p>
        <button class="btn btn--secondary" onclick="location.reload()">Retry</button>
      </div>
    `;
    },

    /**
     * Create empty state component
     * @param {string} message
     * @param {string} icon
     * @returns {string} HTML string
     */
    EmptyState(message = 'No items found', icon = '📭') {
        return `
      <div class="empty-state">
        <div class="empty-state__icon">${icon}</div>
        <p class="empty-state__message">${Utils.escapeHtml(message)}</p>
      </div>
    `;
    },

    /**
     * Create app header
     * @param {string} title
     * @param {boolean} showBack
     * @returns {string} HTML string
     */
    Header(title = 'KISMIN Drama', showBack = false) {
        return `
      <header class="app-header">
        ${showBack ? '<button class="btn-back" onclick="history.back()">←</button>' : ''}
        <h1 class="app-header__title">${Utils.escapeHtml(title)}</h1>
      </header>
    `;
    },

    /**
     * Create bottom navigation
     * @param {string} activePage
     * @returns {string} HTML string
     */
    BottomNav(activePage = 'home') {
        const pages = [
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'watchlist', icon: '❤️', label: 'Watchlist' },
            { id: 'support', icon: '💝', label: 'Support' }
        ];

        const navItems = pages.map(page => `
      <a href="#${page.id}" class="nav-item ${activePage === page.id ? 'nav-item--active' : ''}">
        <span class="nav-item__icon">${page.icon}</span>
        <span class="nav-item__label">${page.label}</span>
      </a>
    `).join('');

        return `
      <nav class="bottom-nav">
        ${navItems}
      </nav>
    `;
    }
};

// Make Components available globally
if (typeof window !== 'undefined') {
    window.Components = Components;
}

export default Components;
