/**
 * LocalStorage Manager
 * KISMIN Mode - Simple localStorage wrapper for favorites and supporter code
 */

import CONFIG from './config.js';

const Storage = {
    /**
     * Get all favorite drama IDs
     * @returns {Array<number>}
     */
    getFavorites() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading favorites:', error);
            return [];
        }
    },

    /**
     * Add drama to favorites
     * @param {number} dramaId
     */
    addFavorite(dramaId) {
        try {
            const favorites = this.getFavorites();
            if (!favorites.includes(dramaId)) {
                favorites.push(dramaId);
                localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    },

    /**
     * Remove drama from favorites
     * @param {number} dramaId
     */
    removeFavorite(dramaId) {
        try {
            const favorites = this.getFavorites();
            const filtered = favorites.filter(id => id !== dramaId);
            localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    },

    /**
     * Check if drama is favorited
     * @param {number} dramaId
     * @returns {boolean}
     */
    isFavorite(dramaId) {
        return this.getFavorites().includes(dramaId);
    },

    /**
     * Toggle favorite status
     * @param {number} dramaId
     * @returns {boolean} New favorite status
     */
    toggleFavorite(dramaId) {
        if (this.isFavorite(dramaId)) {
            this.removeFavorite(dramaId);
            return false;
        } else {
            this.addFavorite(dramaId);
            return true;
        }
    },

    /**
     * Set supporter code
     * @param {string} code
     * @returns {boolean} True if code is valid
     */
    setSupporterCode(code) {
        try {
            const isValid = code.trim().toUpperCase() === CONFIG.SUPPORTER_CODE;
            if (isValid) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.SUPPORTER_CODE, 'true');
            }
            return isValid;
        } catch (error) {
            console.error('Error setting supporter code:', error);
            return false;
        }
    },

    /**
     * Check if supporter features are unlocked
     * @returns {boolean}
     */
    isSupporterUnlocked() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.SUPPORTER_CODE) === 'true';
        } catch (error) {
            console.error('Error checking supporter status:', error);
            return false;
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        try {
            Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};

// Make Storage available globally
if (typeof window !== 'undefined') {
    window.Storage = Storage;
}

export default Storage;
