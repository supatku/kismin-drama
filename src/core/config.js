/**
 * Application Configuration
 * KISMIN Mode - Minimal setup
 */

export const CONFIG = {
  // App Info
  APP_NAME: 'KISMIN Drama',
  APP_VERSION: '1.0.0',

  // API Configuration
  // Note: Using mock data for MVP
  // When ready to use real API, just change USE_MOCK_DATA to false
  // and update API_BASE_URL
  USE_MOCK_DATA: true,
  API_BASE_URL: 'https://api.sekaidrama.example.com', // Placeholder
  API_TIMEOUT: 10000, // 10 seconds

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
