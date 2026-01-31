/**
 * API Client
 * Real API integration with Rebahan API
 */

import CONFIG from './config.js';

/**
 * Mapper functions to normalize API responses
 */
const Mappers = {
    /**
     * Map item data from API to normalized format
     * @param {Object} dto - Item data transfer object from API
     * @returns {Object} Normalized item object
     */
    mapItem(dto) {
        return {
            id: dto.detailPath || dto.id,
            title: dto.title || 'Unknown Title',
            thumbnail: dto.poster || 'https://via.placeholder.com/300x450?text=No+Image',
            rating: dto.rating || '0',
            year: dto.year || '',
            genre: dto.genre || '',
            detailPath: dto.detailPath
        };
    },

    /**
     * Map detail data from API to normalized format
     * @param {Object} dto - Detail data object from API
     * @returns {Object} Normalized detail object
     */
    mapDetail(dto) {
        return {
            title: dto.title || 'Unknown Title',
            synopsis: dto.description || '',
            thumbnail: dto.poster || '',
            rating: dto.rating || '0',
            year: dto.year || '',
            genre: dto.genre || '',
            playerUrl: dto.playerUrl || '',
            // Handle seasons/episodes if present (for TV series)
            seasons: dto.seasons || [],
            totalEpisodes: dto.totalEpisodes || 0
        };
    }
};

const API = {
    /**
     * Fetch items by category
     * @param {string} category
     * @param {number} page
     * @returns {Promise<Array>}
     */
    async fetchByCategory(category, page = 1) {
        try {
            const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.CATEGORY, { category, page });
            const data = await this._fetch(url);

            if (data.success && Array.isArray(data.items || data.data)) {
                const items = data.items || data.data;
                return items.map(item => Mappers.mapItem(item));
            }
            return [];
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    },

    /**
     * Get detail by detailPath (used as ID)
     * @param {string} detailPath
     * @returns {Promise<Object>}
     */
    async getDetail(detailPath) {
        try {
            console.log(`[API] Getting detail for: ${detailPath}`);
            const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.DETAIL, { id: detailPath });
            const data = await this._fetch(url);

            console.log(`[API] Detail response:`, data);

            if (data.success && (data.item || data.data)) {
                const itemData = data.item || data.data;
                return Mappers.mapDetail(itemData);
            }
            
            // Fallback: return mock data if API fails
            console.warn(`[API] No data found, using fallback for: ${detailPath}`);
            return {
                title: 'Content Not Available',
                synopsis: 'This content is currently unavailable. Please try again later or check other content.',
                thumbnail: 'https://via.placeholder.com/800x450?text=Content+Not+Available',
                rating: '0',
                year: '2024',
                genre: 'General',
                playerUrl: '',
                seasons: [],
                totalEpisodes: 0
            };
        } catch (error) {
            console.error('Error fetching detail:', error);
            // Return fallback instead of throwing
            return {
                title: 'Error Loading Content',
                synopsis: `Unable to load content: ${error.message}`,
                thumbnail: 'https://via.placeholder.com/800x450?text=Error+Loading',
                rating: '0',
                year: '2024',
                genre: 'Error',
                playerUrl: '',
                seasons: [],
                totalEpisodes: 0
            };
        }
    },

    /**
     * Search content
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async search(query) {
        try {
            if (!query || query.trim().length === 0) return [];

            const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.SEARCH, { query });
            const data = await this._fetch(url);

            if (data.success && Array.isArray(data.items || data.data)) {
                const items = data.items || data.data;
                return items.map(item => Mappers.mapItem(item));
            }
            return [];
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    },

    /**
     * Internal fetch wrapper
     * @private
     */
    async _fetch(url) {
        console.log(`[API] Fetching: ${url}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`[API] Fetch Error for ${url}:`, error);
            throw error;
        }
    }
};

// Make API available globally
if (typeof window !== 'undefined') {
    window.API = API;
}

export default API;
