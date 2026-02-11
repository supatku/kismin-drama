/**
 * Application Configuration
 * KISMIN Mode - Minimal setup
 */

export const CONFIG = {
  // App Info
  APP_NAME: 'KISMIN Drama',
  APP_VERSION: '1.0.0',

  // API Configuration
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://zeldvorik.ru/apiv3/api.php',
  API_TIMEOUT: 20000, // 20 seconds for Rebahan

  // Rebahan Categories
  CATEGORIES: [
    { id: 'trending', label: 'Trending' },
    { id: 'indonesian-movies', label: 'Film Indo' },
    { id: 'indonesian-drama', label: 'Drama Indo' },
    { id: 'kdrama', label: 'K-Drama' },
    { id: 'short-tv', label: 'Short TV' },
    { id: 'anime', label: 'Anime' },
    { id: 'western-tv', label: 'Western TV' }
  ],

  // API Endpoints for Rebahan
  ENDPOINTS: {
    CATEGORY: '?action={category}&page={page}',
    SEARCH: '?action=search&q={query}',
    DETAIL: '?action=detail&detailPath={id}'
  },

  // Helper to build API URLs with parameters
  buildUrl(endpoint, params = {}) {
    let url = this.API_BASE_URL + endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`{${key}}`, encodeURIComponent(params[key]));
    });
    return url;
  },

  // Telegram WebApp
  TELEGRAM_ENABLED: typeof window !== 'undefined' && window.Telegram?.WebApp,

  // LocalStorage Keys
  STORAGE_KEYS: {
    FAVORITES: 'kismin_favorites',
    SUPPORTER_CODE: 'kismin_supporter',
    WATCH_PROGRESS: 'kismin_progress'
  },

  // Support Links
  SUPPORT_LINKS: {
    SAWERIA: 'https://saweria.co/ahmadsaoghi',
    TRAKTEER: 'https://trakteer.id/oghiezr/tip'
  },

  // Supporter Features
  SUPPORTER_CODE: 'KISMIN2026', // Simple code for MVP

  // Video Player
  PLAYER: {
    AUTO_PLAY: false, // Telegram WebView requires tap-to-play
    CONTROLS: true,
    PRELOAD: 'metadata'
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

export default CONFIG;
