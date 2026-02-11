/**
 * Cache Manager
 * Intelligent caching layer with TTL and stale-while-revalidate pattern
 * Optimizes API performance and reduces network requests
 */

const CacheManager = {
    // Default TTL: 15 minutes
    DEFAULT_TTL: 15 * 60 * 1000,

    // In-memory cache as fallback
    memoryCache: new Map(),

    // Active requests to prevent duplicate calls
    pendingRequests: new Map(),

    /**
     * Generate cache key from URL and params
     * @private
     */
    _generateKey(url, params = {}) {
        const paramString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `cache:${url}${paramString ? '?' + paramString : ''}`;
    },

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null
     */
    get(key) {
        try {
            // Try localStorage first
            const cached = localStorage.getItem(key);
            if (cached) {
                const { data, timestamp, ttl } = JSON.parse(cached);
                const now = Date.now();

                // Check if cache is still valid
                if (now - timestamp < ttl) {
                    console.log(`[Cache] HIT: ${key}`);
                    return { data, isStale: false };
                }

                // Cache is expired but can serve stale data
                console.log(`[Cache] STALE: ${key}`);
                return { data, isStale: true };
            }
        } catch (error) {
            console.warn('[Cache] localStorage get error:', error);
        }

        // Fallback to memory cache
        if (this.memoryCache.has(key)) {
            const { data, timestamp, ttl } = this.memoryCache.get(key);
            const now = Date.now();

            if (now - timestamp < ttl) {
                console.log(`[Cache] MEMORY HIT: ${key}`);
                return { data, isStale: false };
            }

            console.log(`[Cache] MEMORY STALE: ${key}`);
            return { data, isStale: true };
        }

        console.log(`[Cache] MISS: ${key}`);
        return null;
    },

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, data, ttl = this.DEFAULT_TTL) {
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };

        try {
            // Try localStorage first
            localStorage.setItem(key, JSON.stringify(cacheEntry));
            console.log(`[Cache] SET: ${key} (TTL: ${ttl / 1000}s)`);
        } catch (error) {
            // localStorage full or unavailable, use memory cache
            console.warn('[Cache] localStorage full, using memory:', error);
            this.memoryCache.set(key, cacheEntry);

            // Limit memory cache size to 50 entries
            if (this.memoryCache.size > 50) {
                const firstKey = this.memoryCache.keys().next().value;
                this.memoryCache.delete(firstKey);
            }
        }
    },

    /**
     * Remove cached data
     * @param {string} key - Cache key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            this.memoryCache.delete(key);
            console.log(`[Cache] REMOVE: ${key}`);
        } catch (error) {
            console.warn('[Cache] Remove error:', error);
        }
    },

    /**
     * Clear all cached data
     */
    clear() {
        try {
            // Clear only cache entries (keep other localStorage data)
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache:')) {
                    localStorage.removeItem(key);
                }
            });
            this.memoryCache.clear();
            console.log('[Cache] CLEARED');
        } catch (error) {
            console.warn('[Cache] Clear error:', error);
        }
    },

    /**
     * Fetch with cache (stale-while-revalidate pattern)
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Function that fetches fresh data
     * @param {number} ttl - Time to live
     * @returns {Promise} Cached or fresh data
     */
    async fetchWithCache(key, fetchFn, ttl = this.DEFAULT_TTL) {
        // Check if request is already pending (prevent duplicate requests)
        if (this.pendingRequests.has(key)) {
            console.log(`[Cache] Waiting for pending request: ${key}`);
            return this.pendingRequests.get(key);
        }

        // Check cache
        const cached = this.get(key);

        if (cached && !cached.isStale) {
            // Fresh cache - return immediately
            return cached.data;
        }

        // If we have stale data, return it immediately and refresh in background
        if (cached && cached.isStale) {
            console.log(`[Cache] Serving stale data and refreshing: ${key}`);

            // Background refresh (don't await)
            this._backgroundRefresh(key, fetchFn, ttl).catch(err => {
                console.error('[Cache] Background refresh failed:', err);
            });

            return cached.data;
        }

        // No cache - fetch fresh data
        console.log(`[Cache] Fetching fresh data: ${key}`);
        const promise = this._fetchAndCache(key, fetchFn, ttl);
        this.pendingRequests.set(key, promise);

        try {
            const data = await promise;
            return data;
        } finally {
            this.pendingRequests.delete(key);
        }
    },

    /**
     * Fetch and cache data
     * @private
     */
    async _fetchAndCache(key, fetchFn, ttl) {
        try {
            const data = await fetchFn();
            this.set(key, data, ttl);
            return data;
        } catch (error) {
            console.error('[Cache] Fetch error:', error);
            throw error;
        }
    },

    /**
     * Background refresh (don't block on this)
     * @private
     */
    async _backgroundRefresh(key, fetchFn, ttl) {
        try {
            const data = await fetchFn();
            this.set(key, data, ttl);
            console.log(`[Cache] Background refresh complete: ${key}`);
        } catch (error) {
            console.error('[Cache] Background refresh failed:', error);
            // Don't throw - this is background operation
        }
    },

    /**
     * Prefetch data into cache
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Function that fetches data
     * @param {number} ttl - Time to live
     */
    async prefetch(key, fetchFn, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);
        if (cached && !cached.isStale) {
            // Already cached and fresh
            return;
        }

        console.log(`[Cache] Prefetching: ${key}`);
        await this._fetchAndCache(key, fetchFn, ttl).catch(err => {
            console.error('[Cache] Prefetch failed:', err);
        });
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
}

export default CacheManager;
