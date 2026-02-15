/**
 * Application Configuration
 * KISMIN Mode - Minimal setup
 */

export const CONFIG = {
  // App Info
  APP_NAME: 'Toktok',
  APP_VERSION: '1.0.0',

  // API Configuration
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://zeldvorik.ru/apiv3/api.php',
  API_TIMEOUT: 20000, // 20 seconds for Rebahan

  // Placeholder Image (Inline SVG data URI)
  PLACEHOLDER_IMAGE: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' fill='none'%3E%3Crect width='300' height='450' fill='%231a1a1a'/%3E%3Cpath d='M130 180 L130 270 L190 225Z' fill='%23333'/%3E%3Ccircle cx='150' cy='225' r='50' stroke='%23333' stroke-width='3' fill='none'/%3E%3C/svg%3E",

  // CORS Proxies for redundancy
  CORS_PROXIES: [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.codetabs.com/v1/proxy?quest='
  ],

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
      const value = params[key] !== undefined ? params[key] : '';
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    return url;
  },

  // Helper to wrap URL with a CORS proxy
  buildProxyUrl(url, proxyIndex = 0) {
    const proxy = this.CORS_PROXIES[proxyIndex % this.CORS_PROXIES.length];
    return proxy + encodeURIComponent(url);
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
    TRAKTEER: 'https://trakteer.id/oghiezr/tip',
    LYNKID: 'https://lynk.id/oghiezr/'
  },

  // Social Media Links
  SOCMED_LINKS: {
    TIKTOK: 'https://www.tiktok.com/@scenecrafter',
    YOUTUBE: 'https://www.youtube.com/@TangkoScene',
    FACEBOOK: 'https://www.facebook.com/profile.php?id=100062981843383',
    PLAY_STORE: 'https://play.google.com/store/apps/dev?id=6776713849029120132&hl=en'
  },

  // Supporter Features
  SUPPORTER_CODE: 'KISMIN2026', // Simple code for MVP

  // Video Player
  PLAYER: {
    AUTO_PLAY: false, // Telegram WebView requires tap-to-play
    CONTROLS: true,
    PRELOAD: 'metadata'
  },

  // Performance Configuration
  PERFORMANCE: {
    CACHE_TTL: 15 * 60 * 1000, // 15 minutes
    CACHE_TTL_DETAIL: 30 * 60 * 1000, // 30 minutes for detail pages
    CACHE_TTL_SEARCH: 5 * 60 * 1000, // 5 minutes for search
    ENABLE_LAZY_LOADING: true,
    ENABLE_SERVICE_WORKER: true,
    ENABLE_CACHE: true,
    IMAGE_QUALITY: 'auto',
    ENABLE_WEBP: true,
    INFINITE_SCROLL_THRESHOLD: 0.8,
    PRELOAD_NEXT_PAGE: true,
    PREFETCH_ON_HOVER: true,
    MAX_CACHE_SIZE: 50 // Maximum items in memory cache
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

export default CONFIG;
