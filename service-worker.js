/**
 * Service Worker for Progressive Web App
 * Implements caching strategies for offline support
 */

const CACHE_NAME = 'toktok-v1';
const STATIC_CACHE = 'toktok-static-v1';
const DYNAMIC_CACHE = 'toktok-dynamic-v1';
const IMAGE_CACHE = 'toktok-images-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/index.html',
    '/styles.css',
    '/app.js',
    '/core/config.js',
    '/core/api_client.js',
    '/core/storage.js',
    '/core/cache_manager.js',
    '/core/performance_monitor.js',
    '/shared/components.js',
    '/shared/utils.js',
    '/shared/lazy_loader.js',
    '/features/home.js',
    '/features/detail.js',
    '/features/player.js',
    '/features/watchlist.js',
    '/features/support.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Failed to cache some static assets:', err);
                // Don't fail install if some assets fail
            });
        }).then(() => {
            console.log('[SW] Installation complete');
            return self.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== IMAGE_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activation complete');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Strategy 1: Cache-first for static assets
    if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Strategy 2: Stale-while-revalidate for images
    if (request.destination === 'image' ||
        url.hostname.includes('placeholder') ||
        url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // Strategy 3: Network-first for API calls (with offline fallback)
    if (url.hostname.includes('zeldvorik.ru') ||
        url.pathname.includes('/api')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Strategy 4: Cache-first for external CDN resources
    if (url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('telegram.org')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Default: Network-first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[SW] Cache hit:', request.url);
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        // Return offline page or placeholder if available
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Network-first strategy with race timeout
 * Try network first (max 5s), fall back to cache if slow/offline
 */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const NETWORK_TIMEOUT = 5000; // 5 seconds max before cache fallback

    try {
        // Race: network fetch vs timeout
        const response = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
            )
        ]);

        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Network slow/failed, trying cache:', request.url);
        const cached = await cache.match(request);

        if (cached) {
            // Serve cache immediately, but try to refresh in background
            fetch(request).then(response => {
                if (response && response.ok) {
                    cache.put(request, response.clone());
                    console.log('[SW] Background refresh done:', request.url);
                }
            }).catch(() => { });
            return cached;
        }

        // No cache available
        return new Response('Offline - No cached data available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Stale-while-revalidate strategy
 * Return cached response immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Fetch fresh version in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(err => {
        console.warn('[SW] Background fetch failed:', err);
        return null;
    });

    // Return cached version immediately if available
    if (cached) {
        console.log('[SW] Serving stale:', request.url);
        return cached;
    }

    // No cache, wait for network
    return fetchPromise || new Response('Failed to load', {
        status: 503
    });
}

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // Placeholder for syncing favorites when back online
    console.log('[SW] Syncing favorites...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Toktok';
    const options = {
        body: data.body || 'New content available!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});

console.log('[SW] Service worker script loaded');
