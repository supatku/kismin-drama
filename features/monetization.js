/**
 * Monetization Module for Toktok Drama
 * Affiliate-First Monetization: Shopee Affiliate + VIP + Smart Banners
 * 
 * Features:
 * 1. Randomized Shopee affiliate product banners (auto-rotate)
 * 2. Timed popup banner with featured product
 * 3. Fixed bottom affiliate banner
 * 4. Inline affiliate product grid in detail pages
 * 5. VIP No-Ads system with code validation
 * 6. Genre-aware product recommendations
 * 7. GA4 click & impression tracking
 */

import AffiliateProducts from './affiliate_products.js';

const Monetization = {
  // Google Apps Script Backend URL (for VIP validation)
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwi6CE_2aVZR8BTF6ojzQ14XL4ek-rqF1-lK1FkBHa2FcrJVnc1PHX37IvrGM6mbWqd/exec',

  // Timers
  _bannerRotationTimer: null,
  _popupTimer: null,
  _popupShown: false,
  _stylesInjected: false,

  // ══════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════

  init() {
    console.log('[Monetization] Initializing affiliate system...');
    this.checkVipStatus();
    this.injectStyles();

    // Schedule popup for non-VIP users
    if (!this.isVipActive()) {
      this.schedulePopup();
    }

    console.log('[Monetization] Ready ✓');
  },

  // ══════════════════════════════════════════════
  // AFFILIATE BANNER (Inline — replaces Adstera banner)
  // ══════════════════════════════════════════════

  /**
   * Render a rotating affiliate product banner in a container
   * @param {string} containerId - Target container element ID
   * @param {string} genre - Drama genre for smart recommendations
   */
  renderAffiliateBanner(containerId, genre = 'default') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (this.isVipActive()) {
      container.style.display = 'none';
      return;
    }

    // Get initial product
    const product = genre !== 'default'
      ? (AffiliateProducts.getProductsByGenre(genre, 1)[0] || AffiliateProducts.getRandomProducts(1)[0])
      : AffiliateProducts.getRandomProducts(1)[0];

    this._renderBannerCard(container, product, 'inline');

    // Auto-rotate every 12 seconds
    if (this._bannerRotationTimer) clearInterval(this._bannerRotationTimer);
    this._bannerRotationTimer = setInterval(() => {
      if (!document.getElementById(containerId)) {
        clearInterval(this._bannerRotationTimer);
        return;
      }
      const nextProduct = AffiliateProducts.getNextBannerProduct();
      this._renderBannerCard(container, nextProduct, 'inline');
    }, 12000);
  },

  /**
   * Render a single product card into a container
   */
  _renderBannerCard(container, product, placement) {
    if (!product) return;

    container.innerHTML = `
      <a href="#" class="aff-banner-card" onclick="Monetization.goAffiliate('${product.id}', '${placement}'); return false;" data-product-id="${product.id}">
        <div class="aff-banner-card__img-wrap">
          <img src="${product.thumbnail}" alt="${product.name}" loading="lazy" class="aff-banner-card__img">
          <span class="aff-banner-card__badge">${product.badge || '🔥 Promo'}</span>
        </div>
        <div class="aff-banner-card__info">
          <div class="aff-banner-card__name">${product.name}</div>
          <div class="aff-banner-card__desc">${product.description}</div>
          <div class="aff-banner-card__price-row">
            <span class="aff-banner-card__price">${AffiliateProducts.formatPrice(product.price)}</span>
            <span class="aff-banner-card__original-price">${AffiliateProducts.formatPrice(product.original_price)}</span>
            <span class="aff-banner-card__discount">-${product.discount}%</span>
          </div>
          <div class="aff-banner-card__cta">${product.cta}</div>
        </div>
      </a>
    `;

    // Track impression
    AffiliateProducts.trackImpression(product.id, placement);
  },

  // ══════════════════════════════════════════════
  // AFFILIATE PRODUCT GRID (Detail page — replaces old affiliate offers)
  // ══════════════════════════════════════════════

  /**
   * Render affiliate product grid with genre-matching
   * @param {string} containerId
   * @param {string} genre
   */
  renderAffiliateOffers(containerId, genre = 'default') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (this.isVipActive()) {
      container.style.display = 'none';
      return;
    }

    const products = genre !== 'default'
      ? AffiliateProducts.getProductsByGenre(genre, 4)
      : AffiliateProducts.getRandomProducts(4);

    if (products.length === 0) return;

    container.innerHTML = `
      <div class="aff-offers">
        <div class="aff-offers__header">
          <span class="aff-offers__title">🛒 Promo Spesial Buatmu</span>
          <span class="aff-offers__subtitle">Klik & checkout di Shopee</span>
        </div>
        <div class="aff-offers__grid">
          ${products.map(p => `
            <a href="#" class="aff-product-card" onclick="Monetization.goAffiliate('${p.id}', 'grid'); return false;">
              <div class="aff-product-card__img-wrap">
                <img src="${p.thumbnail}" alt="${p.name}" loading="lazy" class="aff-product-card__img">
                <span class="aff-product-card__discount-badge">-${p.discount}%</span>
              </div>
              <div class="aff-product-card__body">
                <div class="aff-product-card__name">${p.name}</div>
                <div class="aff-product-card__price">${AffiliateProducts.formatPrice(p.price)}</div>
                <div class="aff-product-card__original">${AffiliateProducts.formatPrice(p.original_price)}</div>
                <button class="aff-product-card__btn">${p.cta}</button>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    // Track impressions
    products.forEach(p => AffiliateProducts.trackImpression(p.id, 'grid'));
  },

  // ══════════════════════════════════════════════
  // FIXED BOTTOM BANNER (replaces Adstera 320x50)
  // ══════════════════════════════════════════════

  /**
   * Render fixed bottom affiliate banner
   */
  renderBottomBanner() {
    if (this.isVipActive()) return;

    // Remove old one if exists
    const existing = document.getElementById('aff-bottom-banner');
    if (existing) existing.remove();

    const product = AffiliateProducts.getRandomProducts(1)[0];
    if (!product) return;

    const banner = document.createElement('div');
    banner.id = 'aff-bottom-banner';
    banner.className = 'aff-bottom-banner';
    banner.innerHTML = `
      <button class="aff-bottom-banner__close" onclick="Monetization.closeBottomBanner()" aria-label="Close">✕</button>
      <a href="#" class="aff-bottom-banner__link" onclick="Monetization.goAffiliate('${product.id}', 'bottom'); return false;">
        <img src="${product.thumbnail}" alt="${product.name}" class="aff-bottom-banner__img" loading="lazy">
        <div class="aff-bottom-banner__info">
          <div class="aff-bottom-banner__name">${product.name}</div>
          <div class="aff-bottom-banner__price-row">
            <span class="aff-bottom-banner__price">${AffiliateProducts.formatPrice(product.price)}</span>
            <span class="aff-bottom-banner__discount">-${product.discount}%</span>
          </div>
        </div>
        <div class="aff-bottom-banner__cta-btn">${product.cta.split(' ').slice(0, 2).join(' ')}</div>
      </a>
    `;
    document.body.appendChild(banner);

    // Auto-rotate bottom banner every 15s
    setInterval(() => {
      const el = document.getElementById('aff-bottom-banner');
      if (!el) return;
      const nextP = AffiliateProducts.getNextBannerProduct();
      const link = el.querySelector('.aff-bottom-banner__link');
      if (link && nextP) {
        link.setAttribute('onclick', `Monetization.goAffiliate('${nextP.id}', 'bottom'); return false;`);
        el.querySelector('.aff-bottom-banner__img').src = nextP.thumbnail;
        el.querySelector('.aff-bottom-banner__img').alt = nextP.name;
        el.querySelector('.aff-bottom-banner__name').textContent = nextP.name;
        el.querySelector('.aff-bottom-banner__price').textContent = AffiliateProducts.formatPrice(nextP.price);
        el.querySelector('.aff-bottom-banner__discount').textContent = `-${nextP.discount}%`;
        el.querySelector('.aff-bottom-banner__cta-btn').textContent = nextP.cta.split(' ').slice(0, 2).join(' ');
      }
    }, 15000);

    AffiliateProducts.trackImpression(product.id, 'bottom');
  },

  closeBottomBanner() {
    const banner = document.getElementById('aff-bottom-banner');
    if (banner) {
      banner.classList.add('aff-bottom-banner--hidden');
      setTimeout(() => banner.remove(), 400);
    }
  },

  // ══════════════════════════════════════════════
  // POPUP BANNER (replaces Adstera popunder)
  // ══════════════════════════════════════════════

  /**
   * Schedule popup to appear after delay
   */
  schedulePopup() {
    if (this._popupShown) return;

    // Show popup after 25 seconds OR on 3rd scroll event
    this._popupTimer = setTimeout(() => {
      this.showPopup();
    }, 25000);

    // Also trigger on significant scroll
    let scrollCount = 0;
    const scrollHandler = () => {
      scrollCount++;
      if (scrollCount >= 3 && !this._popupShown) {
        this.showPopup();
        window.removeEventListener('scroll', scrollHandler);
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
  },

  /**
   * Show the affiliate popup
   */
  showPopup() {
    if (this._popupShown || this.isVipActive()) return;
    this._popupShown = true;

    if (this._popupTimer) {
      clearTimeout(this._popupTimer);
    }

    const product = AffiliateProducts.getPopupProduct();
    if (!product) return;

    // Remove existing popup
    const existing = document.getElementById('aff-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aff-popup-overlay';
    overlay.className = 'aff-popup-overlay';
    overlay.innerHTML = `
      <div class="aff-popup" onclick="event.stopPropagation()">
        <button class="aff-popup__close" onclick="Monetization.closePopup()" aria-label="Close">✕</button>
        <div class="aff-popup__badge-top">🔥 FLASH SALE — Khusus Hari Ini!</div>
        <div class="aff-popup__product">
          <div class="aff-popup__img-wrap">
            <img src="${product.thumbnail}" alt="${product.name}" class="aff-popup__img" loading="lazy">
            <div class="aff-popup__discount-circle">
              <span class="aff-popup__discount-text">-${product.discount}%</span>
            </div>
          </div>
          <div class="aff-popup__details">
            <h3 class="aff-popup__name">${product.name}</h3>
            <p class="aff-popup__desc">${product.description}</p>
            <div class="aff-popup__price-section">
              <span class="aff-popup__price">${AffiliateProducts.formatPrice(product.price)}</span>
              <span class="aff-popup__original-price">${AffiliateProducts.formatPrice(product.original_price)}</span>
            </div>
            <a href="#" class="aff-popup__cta-btn" onclick="Monetization.goAffiliate('${product.id}', 'popup'); return false;">
              ${product.cta}
            </a>
            <div class="aff-popup__urgency">
              <span class="aff-popup__urgency-dot"></span>
              <span>${Math.floor(Math.random() * 50 + 20)} orang sedang lihat produk ini</span>
            </div>
          </div>
        </div>
        <div class="aff-popup__footer">
          <span class="aff-popup__shopee-badge">🛒 Belanja di Shopee — Gratis Ongkir</span>
        </div>
      </div>
    `;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closePopup();
    });

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('aff-popup-overlay--visible');
    });

    AffiliateProducts.trackImpression(product.id, 'popup');

    // Auto-dismiss after 30 seconds if not interacted
    setTimeout(() => {
      if (document.getElementById('aff-popup-overlay')) {
        this.closePopup();
      }
    }, 30000);
  },

  closePopup() {
    const overlay = document.getElementById('aff-popup-overlay');
    if (overlay) {
      overlay.classList.remove('aff-popup-overlay--visible');
      setTimeout(() => overlay.remove(), 350);
    }
  },

  // ══════════════════════════════════════════════
  // AFFILIATE CLICK HANDLER
  // ══════════════════════════════════════════════

  /**
   * Open Shopee affiliate link in new tab + track
   * @param {string} productId
   * @param {string} placement
   */
  goAffiliate(productId, placement = 'banner') {
    const product = AffiliateProducts.products.find(p => p.id === productId);
    if (!product) {
      console.error('[Affiliate] Product not found:', productId);
      return;
    }

    // Track click
    AffiliateProducts.trackClick(productId, placement);

    // Open in new tab
    console.log(`[Affiliate] Opening: ${product.name} → ${product.affiliate_url}`);
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  },

  // ══════════════════════════════════════════════
  // VIP SYSTEM (unchanged logic, updated hide targets)
  // ══════════════════════════════════════════════

  renderVipButton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isVip = this.isVipActive();
    const expiryDate = localStorage.getItem('vip_expiry');

    let buttonHtml;
    if (isVip) {
      const expiry = new Date(expiryDate).toLocaleDateString('id-ID');
      buttonHtml = `
        <button class="vip-button vip-button--active">
          ✅ VIP Aktif (s/d ${expiry})
        </button>
        <p class="vip-button__benefit">✨ Auto-next episode + Bebas iklan</p>
      `;
    } else {
      buttonHtml = `
        <button class="vip-button" onclick="Monetization.openVipPopup()">
          ⭐ VIP Bebas Iklan
        </button>
        <p class="vip-button__pricing">Mulai dari Rp3.000 (3 hari / 7 hari / 30 hari)</p>
      `;
    }

    container.insertAdjacentHTML('beforeend', buttonHtml);
  },

  renderVipPopup() {
    if (document.getElementById('vip-popup-overlay')) return;

    const html = `
      <div class="vip-popup-overlay" id="vip-popup-overlay" onclick="Monetization.closeVipPopup(event)">
        <div class="vip-popup" onclick="event.stopPropagation()">
          <div class="vip-popup__title">⭐ Aktivasi VIP</div>
          <div class="vip-popup__subtitle">Masukkan kode VIP untuk nikmati Toktok tanpa iklan + auto-next episode</div>

          <div class="vip-popup__plans">
            <div class="vip-popup__plan">
              <strong>3 Hari</strong>
              Rp 5.000
            </div>
            <div class="vip-popup__plan">
              <strong>7 Hari</strong>
              Rp 10.000
            </div>
            <div class="vip-popup__plan">
              <strong>30 Hari</strong>
              Rp 25.000
            </div>
          </div>

          <div style="margin-top: 20px;">
            <p style="color: #888; font-size: 0.85rem; margin-bottom: 12px; text-align: center;">Sudah punya kode? Masukkan di bawah:</p>
            <input 
              type="text" 
              class="vip-popup__input" 
              id="vip-code-input" 
              placeholder="VIP-7D-XXXXXX"
              autocomplete="off"
            />
            
            <button class="vip-popup__submit" id="vip-submit-btn" onclick="Monetization.redeemVip()">
              Aktifkan VIP
            </button>
          </div>

          <div class="vip-popup__cta" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 12px; text-align: center;">
              Belum punya kode VIP?
            </p>
            <a href="https://wa.me/6285189536359?text=Hi%20kak,%20saya%20mau%20beli%20VIP%20Toktok" target="_blank" class="vip-popup__whatsapp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Beli VIP via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  },

  openVipPopup() {
    this.renderVipPopup();
    const overlay = document.getElementById('vip-popup-overlay');
    if (overlay) {
      overlay.classList.add('visible');
      document.getElementById('vip-code-input')?.focus();
    }
  },

  closeVipPopup(event) {
    if (event && event.target.id !== 'vip-popup-overlay') return;
    const overlay = document.getElementById('vip-popup-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
    }
  },

  async redeemVip() {
    const input = document.getElementById('vip-code-input');
    const submitBtn = document.getElementById('vip-submit-btn');
    const code = input?.value.trim();

    if (!code) {
      alert('Masukkan kode VIP');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memvalidasi...';
    }

    try {
      const response = await fetch(`${this.GAS_URL}?vip=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.ok) {
        localStorage.setItem('vip_code', code);
        localStorage.setItem('vip_expiry', data.expires_at);

        alert('🎉 VIP Aktif! Semua iklan dimatikan.');
        this.hideAllAds();
        this.closeVipPopup({ target: { id: 'vip-popup-overlay' } });
        location.reload();
      } else {
        alert('❌ Kode VIP salah atau sudah expired.');
      }
    } catch (error) {
      console.error('[Monetization] VIP validation error:', error);
      alert('Gagal memvalidasi kode. Coba lagi.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Aktifkan VIP';
      }
    }
  },

  isVipActive() {
    const expiry = localStorage.getItem('vip_expiry');
    if (!expiry) return false;

    const expiryDate = new Date(expiry);
    const now = new Date();

    if (expiryDate > now) {
      return true;
    } else {
      localStorage.removeItem('vip_code');
      localStorage.removeItem('vip_expiry');
      return false;
    }
  },

  checkVipStatus() {
    if (this.isVipActive()) {
      console.log('[Monetization] VIP is active, hiding ads');
      this.hideAllAds();
    }
  },

  hideAllAds() {
    // Hide affiliate banners
    document.querySelectorAll('.aff-banner-card, .aff-offers, .aff-bottom-banner').forEach(el => {
      el.style.display = 'none';
    });

    // Remove popup
    const popup = document.getElementById('aff-popup-overlay');
    if (popup) popup.remove();

    // Remove bottom banner
    const bottom = document.getElementById('aff-bottom-banner');
    if (bottom) bottom.remove();

    // Clear timers
    if (this._bannerRotationTimer) clearInterval(this._bannerRotationTimer);
    if (this._popupTimer) clearTimeout(this._popupTimer);

    console.log('[Monetization] All affiliate ads hidden (VIP)');
  },

  showAllAds() {
    document.querySelectorAll('.aff-banner-card, .aff-offers').forEach(el => {
      el.style.display = '';
    });
    this.renderBottomBanner();
  },

  // ══════════════════════════════════════════════
  // STYLES INJECTION
  // ══════════════════════════════════════════════

  injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const styles = document.createElement('style');
    styles.id = 'monetization-styles';
    styles.textContent = `
      /* ═══════════════════════════════════════
         INLINE AFFILIATE BANNER CARD
         ═══════════════════════════════════════ */
      .aff-banner-card {
        display: flex;
        gap: 12px;
        background: linear-gradient(135deg, rgba(255,87,51,0.08), rgba(255,152,0,0.08));
        border: 1px solid rgba(255,87,51,0.2);
        border-radius: 16px;
        padding: 12px;
        margin: 16px 0;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        animation: affFadeIn 0.4s ease;
      }
      .aff-banner-card::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        animation: affShimmer 3s infinite;
      }
      .aff-banner-card:hover {
        border-color: rgba(255,87,51,0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255,87,51,0.15);
      }
      .aff-banner-card__img-wrap {
        position: relative;
        flex-shrink: 0;
        width: 90px;
        height: 90px;
        border-radius: 12px;
        overflow: hidden;
      }
      .aff-banner-card__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .aff-banner-card__badge {
        position: absolute;
        top: 4px; left: 4px;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        color: #fff;
        font-size: 0.6rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
      }
      .aff-banner-card__info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-width: 0;
      }
      .aff-banner-card__name {
        font-size: 0.85rem;
        font-weight: 600;
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.3;
      }
      .aff-banner-card__desc {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .aff-banner-card__price-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .aff-banner-card__price {
        font-size: 0.95rem;
        font-weight: 700;
        color: #ff6b35;
      }
      .aff-banner-card__original-price {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.35);
        text-decoration: line-through;
      }
      .aff-banner-card__discount {
        background: #ff3d00;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
      }
      .aff-banner-card__cta {
        font-size: 0.75rem;
        font-weight: 600;
        color: #ff9800;
        margin-top: 2px;
      }

      /* ═══════════════════════════════════════
         AFFILIATE PRODUCT GRID (Detail Page)
         ═══════════════════════════════════════ */
      .aff-offers {
        background: linear-gradient(135deg, rgba(255,87,51,0.06), rgba(255,152,0,0.06));
        border: 1px solid rgba(255,87,51,0.15);
        border-radius: 20px;
        padding: 20px;
        margin: 20px 0;
      }
      .aff-offers__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .aff-offers__title {
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
      }
      .aff-offers__subtitle {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.4);
      }
      .aff-offers__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .aff-product-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      .aff-product-card:hover {
        border-color: rgba(255,87,51,0.4);
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      }
      .aff-product-card__img-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 1/1;
        overflow: hidden;
        background: #111;
      }
      .aff-product-card__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .aff-product-card:hover .aff-product-card__img {
        transform: scale(1.05);
      }
      .aff-product-card__discount-badge {
        position: absolute;
        top: 6px; right: 6px;
        background: #ff3d00;
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 6px;
      }
      .aff-product-card__body {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .aff-product-card__name {
        font-size: 0.75rem;
        font-weight: 600;
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.3;
      }
      .aff-product-card__price {
        font-size: 0.85rem;
        font-weight: 700;
        color: #ff6b35;
      }
      .aff-product-card__original {
        font-size: 0.65rem;
        color: rgba(255,255,255,0.3);
        text-decoration: line-through;
      }
      .aff-product-card__btn {
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        margin-top: auto;
        transition: all 0.2s ease;
        text-align: center;
      }
      .aff-product-card__btn:hover {
        filter: brightness(1.15);
        transform: scale(1.02);
      }

      /* ═══════════════════════════════════════
         FIXED BOTTOM BANNER
         ═══════════════════════════════════════ */
      .aff-bottom-banner {
        position: fixed;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        width: calc(100% - 16px);
        max-width: 420px;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid rgba(255,87,51,0.25);
        border-radius: 14px;
        padding: 8px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        animation: affSlideUp 0.4s ease;
        transition: all 0.4s ease;
      }
      .aff-bottom-banner--hidden {
        transform: translateX(-50%) translateY(120%);
        opacity: 0;
      }
      .aff-bottom-banner__close {
        position: absolute;
        top: -8px; right: -4px;
        width: 22px; height: 22px;
        background: rgba(255,255,255,0.15);
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 0.7rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        transition: background 0.2s;
      }
      .aff-bottom-banner__close:hover {
        background: rgba(255,87,51,0.5);
      }
      .aff-bottom-banner__link {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
      }
      .aff-bottom-banner__img {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .aff-bottom-banner__info {
        flex: 1;
        min-width: 0;
      }
      .aff-bottom-banner__name {
        font-size: 0.72rem;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .aff-bottom-banner__price-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 2px;
      }
      .aff-bottom-banner__price {
        font-size: 0.8rem;
        font-weight: 700;
        color: #ff6b35;
      }
      .aff-bottom-banner__discount {
        font-size: 0.6rem;
        font-weight: 700;
        background: #ff3d00;
        color: #fff;
        padding: 1px 4px;
        border-radius: 4px;
      }
      .aff-bottom-banner__cta-btn {
        flex-shrink: 0;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 8px 12px;
        border-radius: 10px;
        white-space: nowrap;
      }

      /* ═══════════════════════════════════════
         POPUP OVERLAY
         ═══════════════════════════════════════ */
      .aff-popup-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.35s ease;
      }
      .aff-popup-overlay--visible {
        opacity: 1;
        visibility: visible;
      }
      .aff-popup {
        background: linear-gradient(145deg, #1a1a2e, #0f0f23);
        border: 1px solid rgba(255,87,51,0.3);
        border-radius: 24px;
        max-width: 380px;
        width: 100%;
        overflow: hidden;
        transform: scale(0.85) translateY(30px);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,87,51,0.1);
      }
      .aff-popup-overlay--visible .aff-popup {
        transform: scale(1) translateY(0);
      }
      .aff-popup__close {
        position: absolute;
        top: 12px; right: 12px;
        width: 32px; height: 32px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .aff-popup__close:hover {
        background: rgba(255,87,51,0.4);
        transform: rotate(90deg);
      }
      .aff-popup__badge-top {
        background: linear-gradient(90deg, #ff3d00, #ff6b35, #f7931e);
        color: #fff;
        text-align: center;
        padding: 10px 16px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        animation: affPulse 2s infinite;
      }
      .aff-popup__product {
        padding: 20px;
      }
      .aff-popup__img-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 4/3;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 16px;
        background: #111;
      }
      .aff-popup__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .aff-popup__discount-circle {
        position: absolute;
        bottom: 10px; right: 10px;
        width: 56px; height: 56px;
        background: linear-gradient(135deg, #ff3d00, #ff6b35);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(255,61,0,0.5);
        animation: affBounce 2s infinite;
      }
      .aff-popup__discount-text {
        color: #fff;
        font-size: 0.85rem;
        font-weight: 800;
      }
      .aff-popup__details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .aff-popup__name {
        font-size: 1.05rem;
        font-weight: 700;
        color: #fff;
        line-height: 1.3;
        margin: 0;
      }
      .aff-popup__desc {
        font-size: 0.8rem;
        color: rgba(255,255,255,0.5);
        margin: 0;
      }
      .aff-popup__price-section {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      .aff-popup__price {
        font-size: 1.3rem;
        font-weight: 800;
        color: #ff6b35;
      }
      .aff-popup__original-price {
        font-size: 0.85rem;
        color: rgba(255,255,255,0.3);
        text-decoration: line-through;
      }
      .aff-popup__cta-btn {
        display: block;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        color: #fff;
        text-align: center;
        padding: 14px 24px;
        border-radius: 14px;
        font-size: 1rem;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255,107,53,0.3);
      }
      .aff-popup__cta-btn:hover {
        transform: scale(1.03);
        box-shadow: 0 6px 25px rgba(255,107,53,0.5);
      }
      .aff-popup__urgency {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        color: rgba(255,255,255,0.5);
      }
      .aff-popup__urgency-dot {
        width: 6px; height: 6px;
        background: #4caf50;
        border-radius: 50%;
        animation: affBlink 1.5s infinite;
      }
      .aff-popup__footer {
        background: rgba(255,87,51,0.06);
        padding: 12px 20px;
        text-align: center;
        border-top: 1px solid rgba(255,87,51,0.1);
      }
      .aff-popup__shopee-badge {
        font-size: 0.75rem;
        color: rgba(255,255,255,0.4);
        font-weight: 500;
      }

      /* ═══════════════════════════════════════
         VIP STYLES
         ═══════════════════════════════════════ */
      .vip-button {
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #000;
        border: none;
        border-radius: 25px;
        padding: 12px 24px;
        font-weight: bold;
        font-size: 0.95rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px auto;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      }
      .vip-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
      }
      .vip-button--active {
        background: linear-gradient(135deg, #00c853, #00e676);
      }
      .vip-button__pricing,
      .vip-button__benefit {
        text-align: center;
        color: #aaa;
        font-size: 0.8rem;
        margin-top: 8px;
        font-style: italic;
      }
      .vip-button__benefit {
        color: #00c853;
        font-weight: 500;
      }
      .vip-popup-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      .vip-popup-overlay.visible {
        opacity: 1;
        visibility: visible;
      }
      .vip-popup {
        background: #1a1a1a;
        border-radius: 20px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      .vip-popup-overlay.visible .vip-popup {
        transform: scale(1);
      }
      .vip-popup__title {
        font-size: 1.5rem;
        margin-bottom: 8px;
        color: #ffd700;
      }
      .vip-popup__subtitle {
        color: #aaa;
        margin-bottom: 24px;
        font-size: 0.9rem;
      }
      .vip-popup__input {
        width: 100%;
        padding: 16px;
        border: 2px solid rgba(255, 215, 0, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-size: 1.1rem;
        text-align: center;
        letter-spacing: 2px;
        margin-bottom: 16px;
        outline: none;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
      }
      .vip-popup__input:focus {
        border-color: #ffd700;
      }
      .vip-popup__input::placeholder {
        color: #666;
        letter-spacing: 1px;
      }
      .vip-popup__submit {
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #000;
        border: none;
        border-radius: 12px;
        padding: 14px 32px;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s ease;
      }
      .vip-popup__submit:hover {
        transform: scale(1.02);
      }
      .vip-popup__submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .vip-popup__plans {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 20px;
      }
      .vip-popup__plan {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px 8px;
        font-size: 0.8rem;
        color: #aaa;
      }
      .vip-popup__plan strong {
        display: block;
        color: #ffd700;
        font-size: 1rem;
      }
      .vip-popup__whatsapp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: linear-gradient(135deg, #25D366, #128C7E);
        color: #fff;
        text-decoration: none;
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
      }
      .vip-popup__whatsapp:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
      }

      /* ═══════════════════════════════════════
         ANIMATIONS
         ═══════════════════════════════════════ */
      @keyframes affFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes affShimmer {
        0% { left: -100%; }
        100% { left: 200%; }
      }
      @keyframes affSlideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes affPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.85; }
      }
      @keyframes affBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      @keyframes affBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* ═══════════════════════════════════════
         RESPONSIVE
         ═══════════════════════════════════════ */
      @media (max-width: 380px) {
        .aff-banner-card__img-wrap {
          width: 72px; height: 72px;
        }
        .aff-banner-card__name { font-size: 0.78rem; }
        .aff-banner-card__price { font-size: 0.85rem; }
        .aff-offers__grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .aff-product-card__body { padding: 8px; }
        .aff-popup__product { padding: 14px; }
        .aff-popup__name { font-size: 0.95rem; }
        .aff-popup__price { font-size: 1.1rem; }
      }
    `;
    document.head.appendChild(styles);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Monetization = Monetization;
}

export default Monetization;
