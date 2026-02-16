/**
 * API Client
 * Real API integration with Rebahan API + Manual Content
 * Enhanced with intelligent caching for optimal performance
 */

import CONFIG from './config.js';
import ManualContentAPI from './manual_content.js';
import CacheManager from './cache_manager.js';

/**
 * Mapper functions to normalize API responses
 */
const FALLBACK_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' fill='none'%3E%3Crect width='300' height='450' fill='%231a1a1a'/%3E%3Cpath d='M130 180 L130 270 L190 225Z' fill='%23333'/%3E%3Ccircle cx='150' cy='225' r='50' stroke='%23333' stroke-width='3' fill='none'/%3E%3C/svg%3E";

/**
 * Notice: "cari film favorit kamu lewat pencarian ya dan jangan lupa bantu share ke teman ya 🤗"
 * For surgical injection without breaking existing components
 */
const SEARCH_NOTICE_HTML = `
<div class="search-notice-marquee" style="background: #1a1a1a; padding: 4px 0; border-bottom: 1px solid #333; overflow: hidden; white-space: nowrap;">
  <div style="display: inline-block; padding-left: 100%; animation: searchMarquee 15s linear infinite; color: #ff0000; font-weight: bold;">
    cari film favorit kamu lewat pencarian ya dan jangan lupa bantu share ke teman ya 🤗
  </div>
</div>
<style>
@keyframes searchMarquee {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-100%, 0); }
}
</style>
`;

function proxyImageUrl(url, w = 300, h = 450) {
    if (!url || url.includes('placeholder')) return CONFIG.PLACEHOLDER_IMAGE || FALLBACK_SVG;

    // Skip proxying for URLs that already work reliably
    const skipProxyPatterns = [
        'lh3.googleusercontent.com',  // Google Drive direct images
        'data:image/svg',              // Local SVG data URIs
        'wsrv.nl',                     // Already proxied
    ];

    if (skipProxyPatterns.some(pattern => url.includes(pattern))) {
        return url;
    }

    // Use wsrv.nl image proxy — free, fast, reliable
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&h=${h}&fit=cover&output=webp`;
}

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
     * Uses Promise.allSettled for PARALLEL fetching (manual + external)
     * @private
     */
    async _fetchByCategoryUncached(category, page = 1) {
        let manualItems = [];
        let externalItems = [];

        // Build fetch promises to run in PARALLEL
        const fetchPromises = [];

        // Promise 1: Manual content (only for trending and kdrama)
        const shouldFetchManual = page === 1 && (category === 'trending' || category === 'kdrama');
        if (shouldFetchManual) {
            fetchPromises.push(
                ManualContentAPI.fetchManualDramas()
                    .then(items => ({ source: 'manual', items }))
                    .catch(err => { console.error('[API] Manual content error:', err); return { source: 'manual', items: [] }; })
            );
        }

        // Promise 2: External API (always)
        const externalUrl = CONFIG.buildUrl(CONFIG.ENDPOINTS.CATEGORY, { category, page });
        fetchPromises.push(
            this._fetch(externalUrl)
                .then(data => {
                    if (data.success && Array.isArray(data.items || data.data)) {
                        return { source: 'external', items: (data.items || data.data).map(item => Mappers.mapItem(item)) };
                    }
                    return { source: 'external', items: [] };
                })
                .catch(err => { console.error('[API] External API error:', err); return { source: 'external', items: [] }; })
        );

        // Execute ALL fetches in parallel
        console.log(`[API] Fetching ${fetchPromises.length} source(s) in PARALLEL for: ${category} page ${page}`);
        const results = await Promise.allSettled(fetchPromises);

        // Collect results
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { source, items } = result.value;
                if (source === 'manual') manualItems = items;
                if (source === 'external') externalItems = items;
            }
        });

        console.log(`[API] Results — manual: ${manualItems.length}, external: ${externalItems.length}`);

        // Manual content first, then external
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
            () => this._getDetailUncached(detailPath),
            CONFIG.PERFORMANCE.CACHE_TTL_DETAIL // Longer TTL for detail pages
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
                thumbnail: CONFIG.PLACEHOLDER_IMAGE || FALLBACK_SVG,
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
                thumbnail: CONFIG.PLACEHOLDER_IMAGE || FALLBACK_SVG,
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
