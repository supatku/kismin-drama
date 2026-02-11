/**
 * Affiliate Products Database & Smart Recommendation Engine
 * 
 * Features:
 * - 10+ Shopee affiliate products with full metadata
 * - Genre-aware product recommendations based on drama category
 * - Smart randomization with priority weighting
 * - Session-based rotation to avoid showing same product twice
 * - Click tracking via Google Analytics events
 */

const AffiliateProducts = {
    // ══════════════════════════════════════════════
    // PRODUCT CATALOG
    // ══════════════════════════════════════════════
    products: [
        {
            id: "SHP001",
            name: "Powerbank Mini 20000mAh Fast Charging",
            description: "Tahan Seharian Travel Gaming — 4 USB LED Display",
            affiliate_url: "https://s.shopee.co.id/3VeWHIWhks?share_channel_code=1",
            category: "electronics",
            placement_priority: "high",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7r98s-ltup92mhqh6t59@resize_w900_nl.webp",
            price: 53800,
            original_price: 153700,
            discount: 65,
            cta: "⚡ Beli Powerbank Sekarang",
            tags: ["drama", "music", "streaming"],
            badge: "🔥 Best Seller"
        },
        {
            id: "SHP002",
            name: "TWS Bluetooth Stereo Bass Mic Jernih",
            description: "Cocok Musik, Call, Gaming Low Delay",
            affiliate_url: "https://s.shopee.co.id/LhUVLEJ2u?share_channel_code=1",
            category: "electronics",
            placement_priority: "medium",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7r98v-lx0zari0y3x7b6.webp",
            price: 25800,
            original_price: 43000,
            discount: 40,
            cta: "🎧 Ambil Promo TWS",
            tags: ["electronic", "music"],
            badge: "🎵 Music Lover"
        },
        {
            id: "SHP003",
            name: "Kuota Telkomsel Besar 30 Hari",
            description: "Streaming, Gaming, TikTok Full Speed Stabil",
            affiliate_url: "https://s.shopee.co.id/gKKu36LqR?share_channel_code=1",
            category: "digital",
            placement_priority: "high",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-8224t-mj3mq9wzah3a8e.webp",
            price: 12000,
            original_price: 24000,
            discount: 50,
            cta: "📶 Isi Kuota Sekarang",
            tags: ["digital", "electronic", "kuota"],
            badge: "📶 Wajib Punya"
        },
        {
            id: "SHP004",
            name: "Popcorn Caramel Premium 1KG",
            description: "Snack Nonton Drakor, Film, Netflix Wajib Stok",
            affiliate_url: "https://s.shopee.co.id/1gCs5zhyrm?share_channel_code=1",
            category: "food",
            placement_priority: "medium",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7rasf-m4f7povu6em0f8.webp",
            price: 25000,
            original_price: 35700,
            discount: 30,
            cta: "🍿 Checkout Snack Nonton",
            tags: ["snack", "korea", "food"],
            badge: "🍿 Nonton Makin Asyik"
        },
        {
            id: "SHP005",
            name: "Kentang Mustofa Premium Gurih Renyah",
            description: "Lauk & Snack Favorit Keluarga",
            affiliate_url: "https://s.shopee.co.id/9fF9ces80L?share_channel_code=1",
            category: "food",
            placement_priority: "high",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7rbk4-m8smfl61vlni36.webp",
            price: 37000,
            original_price: 67300,
            discount: 45,
            cta: "🔥 Beli Snack Bestseller",
            tags: ["foods", "snack", "streaming"],
            badge: "⭐ Top Rated"
        },
        {
            id: "SHP006",
            name: "Sneakers Wanita Putih Trendy",
            description: "Beli 1 Gratis 1 Limited — Fashion Korea Style",
            affiliate_url: "https://s.shopee.co.id/7fUG3h0O6V?share_channel_code=1",
            category: "fashion",
            placement_priority: "medium",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7rasg-m3z97atufr7c9d.webp",
            price: 75000,
            original_price: 166700,
            discount: 55,
            cta: "👟 Ambil Promo Sneakers",
            tags: ["fashion", "korea", "style"],
            badge: "👟 Buy 1 Get 1"
        },
        {
            id: "SHP007",
            name: "Kursi Lipat Serbaguna Portable",
            description: "Outdoor, Camping, Nongkrong, Hemat Ruang",
            affiliate_url: "https://s.shopee.co.id/3fy7IQ3LvO",
            category: "home",
            placement_priority: "high",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7rbk7-mal1peafcr15e4.webp",
            price: 45000,
            original_price: 56300,
            discount: 20,
            cta: "🪑 Beli Kursi Portable",
            tags: ["outdoor", "portable", "camping"],
            badge: "🏕️ Portable"
        },
        {
            id: "SHP008",
            name: "Screen Magnifier HP 10 Inch HD",
            description: "Nonton Film, Drakor Jadi Layar Lebar Bioskop",
            affiliate_url: "https://s.shopee.co.id/6pv97tTJcQ",
            category: "electronics",
            placement_priority: "low",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-7rbk4-mamgbo4ii3a6da.webp",
            price: 59000,
            original_price: 90800,
            discount: 35,
            cta: "📱 Upgrade Nonton HP",
            tags: ["electronics", "streaming", "phone"],
            badge: "📺 Layar Lebar"
        },
        {
            id: "SHP009",
            name: "Holder HP Jepit 360° Anti Pegel",
            description: "Stand Streaming, TikTok, Rebahan Nyaman",
            affiliate_url: "https://s.shopee.co.id/1LaCZpC7pY",
            category: "electronics",
            placement_priority: "low",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-82251-mglorenecgeh31.webp",
            price: 89000,
            original_price: 222500,
            discount: 60,
            cta: "📲 Ambil Holder Viral",
            tags: ["electronics", "digital", "korea"],
            badge: "🔥 Diskon 60%"
        },
        {
            id: "SHP010",
            name: "Sunlight Sabun Cuci Piring 5L Hemat",
            description: "Stok Rumah Tangga Anti Boros",
            affiliate_url: "https://s.shopee.co.id/40arVWqbrE",
            category: "household",
            placement_priority: "low",
            thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-81ztq-mfmpvsyyd43za6@resize_w900_nl.webp",
            price: 31000,
            original_price: 41300,
            discount: 25,
            cta: "🧼 Beli Kebutuhan Rumah",
            tags: ["household", "cleaning"],
            badge: "🏠 Hemat"
        }
    ],

    // ══════════════════════════════════════════════
    // GENRE → PRODUCT CATEGORY MAPPING
    // ══════════════════════════════════════════════
    categoryMapping: {
        "Drama Korea": ["electronics", "fashion", "food"],
        "Romance": ["fashion", "food", "home"],
        "Action": ["electronics", "food", "digital"],
        "Comedy": ["food", "household", "home"],
        "Anime": ["electronics", "food", "digital"],
        "Film Indonesia": ["food", "digital", "household"],
        "Thriller": ["electronics", "food"],
        "Horror": ["food", "household"],
        "default": ["electronics", "food", "digital", "fashion"]
    },

    // Session tracking to avoid repetition
    _shownProductIds: new Set(),
    _rotationIndex: 0,

    // ══════════════════════════════════════════════
    // CORE METHODS
    // ══════════════════════════════════════════════

    /**
     * Get N random products, weighted by priority
     * High priority products are 3x more likely to appear
     * @param {number} count
     * @returns {Array}
     */
    getRandomProducts(count = 2) {
        // Build weighted pool: high=3x, medium=2x, low=1x
        const weightedPool = [];
        this.products.forEach(p => {
            const weight = p.placement_priority === 'high' ? 3
                : p.placement_priority === 'medium' ? 2 : 1;
            for (let i = 0; i < weight; i++) {
                weightedPool.push(p);
            }
        });

        // Shuffle the weighted pool
        const shuffled = weightedPool.sort(() => Math.random() - 0.5);

        // Pick unique products
        const selected = [];
        const usedIds = new Set();
        for (const product of shuffled) {
            if (usedIds.has(product.id)) continue;
            selected.push(product);
            usedIds.add(product.id);
            if (selected.length >= count) break;
        }

        return selected;
    },

    /**
     * Get products matching a drama genre/category
     * Falls back to default categories if genre not mapped
     * @param {string} genre 
     * @param {number} count
     * @returns {Array}
     */
    getProductsByGenre(genre = 'default', count = 3) {
        // Find matching categories for the genre
        let targetCategories = this.categoryMapping['default'];

        for (const [key, cats] of Object.entries(this.categoryMapping)) {
            if (genre.toLowerCase().includes(key.toLowerCase())) {
                targetCategories = cats;
                break;
            }
        }

        // Filter products by matching categories
        const matched = this.products.filter(p => targetCategories.includes(p.category));

        // Shuffle and limit
        const shuffled = [...matched].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    /**
     * Get a single product for popup display
     * Prefers high-priority products not yet shown in session
     * @returns {Object}
     */
    getPopupProduct() {
        // Try high priority first, then medium, then any
        const priorities = ['high', 'medium', 'low'];

        for (const priority of priorities) {
            const candidates = this.products.filter(
                p => p.placement_priority === priority && !this._shownProductIds.has(p.id)
            );
            if (candidates.length > 0) {
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                this._shownProductIds.add(pick.id);
                return pick;
            }
        }

        // All shown? Reset and pick random
        this._shownProductIds.clear();
        return this.products[Math.floor(Math.random() * this.products.length)];
    },

    /**
     * Get next product for banner rotation (cycles through all)
     * @returns {Object}
     */
    getNextBannerProduct() {
        const product = this.products[this._rotationIndex % this.products.length];
        this._rotationIndex++;
        return product;
    },

    /**
     * Format price as Indonesian Rupiah
     * @param {number} price
     * @returns {string}
     */
    formatPrice(price) {
        return 'Rp ' + price.toLocaleString('id-ID');
    },

    /**
     * Track affiliate click via Google Analytics
     * @param {string} productId
     * @param {string} placement - 'banner', 'popup', 'inline', 'bottom'
     */
    trackClick(productId, placement = 'banner') {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // GA4 event
        if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
                event_category: 'affiliate',
                event_label: product.name,
                product_id: productId,
                placement: placement,
                product_category: product.category,
                product_price: product.price
            });
        }

        console.log(`[Affiliate] Click tracked: ${productId} from ${placement}`);
    },

    /**
     * Track affiliate impression
     * @param {string} productId 
     * @param {string} placement
     */
    trackImpression(productId, placement = 'banner') {
        if (typeof gtag === 'function') {
            gtag('event', 'affiliate_impression', {
                event_category: 'affiliate',
                event_label: productId,
                placement: placement
            });
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.AffiliateProducts = AffiliateProducts;
}

export default AffiliateProducts;
