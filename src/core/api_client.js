/**
 * API Client
 * Real API integration with Rebahan API + Manual Content
 * Enhanced with intelligent caching for optimal performance
 */

import CONFIG from './config.js';
import ManualContentAPI from './manual_content.js';
import CacheManager from './cache_manager.js';

/**
 * Proxy external image URLs through wsrv.nl to bypass hotlink protection & CORS.
 * Also optimizes images (resize + WebP conversion).
 * Skips URLs that are already reliable (Google Drive, placeholder, data URIs).
 * @param {string} url - Original image URL
 * @param {number} w - Target width
 * @param {number} h - Target height
 * @returns {string} Proxied or original URL
 */
function proxyImageUrl(url, w = 300, h = 450) {
    if (!url) return CONFIG.PLACEHOLDER_IMAGE;

    // Skip proxying for URLs that already work reliably
    const skipProxyPatterns = [
        'lh3.googleusercontent.com',  // Google Drive direct images
        CONFIG.PLACEHOLDER_IMAGE,      // Already using our placeholder
        'data:',                       // Data URIs
        'wsrv.nl',                     // Already proxied
        'blob:',                       // Blob URLs
    ];

    if (skipProxyPatterns.some(pattern => url.includes(pattern))) {
        return url;
    }

    // Use wsrv.nl image proxy — free, fast, reliable
    // Docs: https://wsrv.nl/docs/
    // Use a stable default (blank box) instead of an external placeholder service
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&h=${h}&fit=cover&output=webp`;
}

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
            thumbnail: proxyImageUrl(dto.poster),
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
            thumbnail: proxyImageUrl(dto.poster, 800, 450),
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
     * Fetch items by category (includes manual content)
     * Enhanced with caching for optimal performance
     * @param {string} category
     * @param {number} page
     * @returns {Promise<Array>}
     */
    async fetchByCategory(category, page = 1) {
        if (!CONFIG.PERFORMANCE.ENABLE_CACHE) {
            return this._fetchByCategoryUncached(category, page);
        }

        const cacheKey = `cache:category:${category}:${page}`;

        return CacheManager.fetchWithCache(
            cacheKey,
            () => this._fetchByCategoryUncached(category, page),
            CONFIG.PERFORMANCE.CACHE_TTL
        );
    },

    /**
     * Internal uncached fetch by category
     * @private
     */
    async _fetchByCategoryUncached(category, page = 1) {
        let manualItems = [];
        let externalItems = [];

        try {
            // Always try to fetch manual content first
            if (category === 'trending' || category === 'indonesian-drama' || category === 'kdrama') {
                console.log('[API] Fetching manual content for category:', category);
                manualItems = await ManualContentAPI.fetchManualDramas();
                console.log('[API] Manual items loaded:', manualItems.length);
            }
        } catch (error) {
            console.error('[API] Manual content error:', error);
        }

        try {
            // Try to fetch from external API
            console.log('[API] Fetching external content for category:', category);
            const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.CATEGORY, { category, page });
            const data = await this._fetch(url);

            if (data.success && Array.isArray(data.items || data.data)) {
                const items = data.items || data.data;
                externalItems = items.map(item => Mappers.mapItem(item));
                console.log('[API] External items loaded:', externalItems.length);
            }
        } catch (error) {
            console.error('[API] External API error:', error);
        }

        // Always return manual content even if external API fails
        const combinedItems = [...manualItems, ...externalItems];
        console.log('[API] Total items returned:', combinedItems.length);
        return combinedItems;
    },

    /**
     * Get detail by detailPath (handles both external and manual content)
     * Enhanced with caching for faster repeat visits
     * @param {string} detailPath
     * @returns {Promise<Object>}
     */
    async getDetail(detailPath) {
        if (!CONFIG.PERFORMANCE.ENABLE_CACHE) {
            return this._getDetailUncached(detailPath);
        }

        const cacheKey = `cache:detail:${detailPath}`;

        return CacheManager.fetchWithCache(
            cacheKey,
            async () => {
                const data = await this._getDetailUncached(detailPath);
                // Don't cache if it returned an error object
                if (data.title === 'Error Loading Content' || data.title === 'Content Not Available') {
                    throw new Error(`API returned error state for ${detailPath}`);
                }
                return data;
            },
            CONFIG.PERFORMANCE.CACHE_TTL_DETAIL
        );
    },

    /**
     * Internal uncached get detail
     * @private
     */
    async _getDetailUncached(detailPath) {
        try {
            console.log(`[API] Getting detail for: ${detailPath}`);

            // Check if it's manual content
            if (ManualContentAPI.isManualContent(detailPath)) {
                const episodes = await ManualContentAPI.fetchManualEpisodes(detailPath);
                const manualDramas = await ManualContentAPI.fetchManualDramas();
                const drama = manualDramas.find(d => d.id === detailPath);

                if (drama) {
                    return {
                        ...drama,
                        seasons: episodes.length > 0 ? [{
                            season: 1,
                            episodes: episodes
                        }] : []
                    };
                }
            }

            // Handle external API content
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
     * Enhanced with caching (shorter TTL for search)
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async search(query) {
        try {
            if (!query || query.trim().length === 0) return [];

            if (!CONFIG.PERFORMANCE.ENABLE_CACHE) {
                return this._searchUncached(query);
            }

            const cacheKey = `cache:search:${query.toLowerCase()}`;

            return CacheManager.fetchWithCache(
                cacheKey,
                () => this._searchUncached(query),
                CONFIG.PERFORMANCE.CACHE_TTL_SEARCH // Shorter TTL for search
            );
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
    },

    /**
     * Internal uncached search
     * @private
     */
    async _searchUncached(query) {
        const url = CONFIG.buildUrl(CONFIG.ENDPOINTS.SEARCH, { query });
        const data = await this._fetch(url);

        if (data.success && Array.isArray(data.items || data.data)) {
            const items = data.items || data.data;
            return items.map(item => Mappers.mapItem(item));
        }
        return [];
    },

    async _fetch(url) {
        let lastError = null;
        const maxRetries = CONFIG.CORS_PROXIES.length + 1; // Direct + all proxies

        for (let i = 0; i < maxRetries; i++) {
            const currentUrl = i === 0 ? url : CONFIG.buildProxyUrl(url, i - 1);
            const isProxy = i > 0;

            console.log(`[API] Attempt ${i + 1}: ${isProxy ? '(Proxy) ' : '(Direct) '}${currentUrl}`);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

                const response = await fetch(currentUrl, {
                    signal: controller.signal,
                    // No-cache to prevent hitting stale error states
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // If we succeeded via proxy, log it as a success
                if (isProxy) console.log(`[API] Success via proxy ${i}`);

                return data;
            } catch (error) {
                lastError = error;
                console.warn(`[API] Attempt ${i + 1} failed:`, error.message);

                // If it's an abort (timeout), we might want to try next proxy immediately
                // If it's a TypeError (Network Error/CORS), we definitely try next proxy
            }
        }

        console.error(`[API] All attempts failed for ${url}`);
        throw lastError;
    }
};

// Make API available globally
if (typeof window !== 'undefined') {
    window.API = API;
}

export default API;
