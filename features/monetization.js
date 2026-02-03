/**
 * Monetization Module for Toktok Drama
 * Non-aggressive monetization: Affiliate + VIP + Minimal Ads
 * 
 * Features:
 * 1. Affiliate Shopee links with click tracking
 * 2. VIP No-Ads system with code validation
 * 3. Auto-hide ads for VIP users
 */

const Monetization = {
  // Google Apps Script Backend URL
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzEyMGIeRXzvu5dpZeBvRRPjBzwdkFPnub9IMeL1dfaSgBqeShEoP2sPIuz7cknQcjz/exec',

  // Affiliate product catalog
  affiliateProducts: [
    { key: 'headset1', icon: '🎧', label: 'Biar Nonton gak ganggu orang rumah', pos: 'below_player' },
    { key: 'kuota1', icon: '📶', label: 'Paket Data Hemat Streaming', pos: 'below_player', bestPick: true },
    { key: 'powerbank1', icon: '🔋', label: 'Powerbank Maraton Drama', pos: 'below_player' },
    { key: 'snack1', icon: '🍿', label: 'Snack Nemenin Episode', pos: 'below_player' }
  ],

  /**
   * Get randomized affiliate products for display
   * @param {number} count - Number of products to show
   * @returns {Array}
   */
  getRandomAffiliates(count = 2) {
    const shuffled = [...this.affiliateProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /**
   * Initialize monetization module
   */
  init() {
    console.log('[Monetization] Initializing...');
    this.checkVipStatus();
    this.injectStyles();
    console.log('[Monetization] Ready');
  },

  /**
   * Inject monetization styles
   */
  injectStyles() {
    if (document.getElementById('monetization-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'monetization-styles';
    styles.textContent = `
      /* Affiliate Offers Section */
      .affiliate-offers {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 159, 67, 0.1));
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 16px;
        padding: 20px;
        margin: 24px 0;
      }

      .affiliate-offers__title {
        font-size: 1rem;
        color: var(--color-text-secondary, #aaa);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .affiliate-offers__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .affiliate-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
        position: relative;
      }

      .affiliate-card:hover {
        background: rgba(255, 107, 107, 0.15);
        border-color: rgba(255, 107, 107, 0.5);
        transform: translateY(-2px);
      }

      .affiliate-card__badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: #fff;
        font-size: 0.7rem;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(255, 107, 107, 0.4);
      }

      .affiliate-card__icon {
        font-size: 2rem;
      }

      .affiliate-card__label {
        font-size: 0.85rem;
        text-align: center;
        color: var(--color-text-primary, #fff);
      }

      /* VIP Button */
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

      /* VIP Popup */
      .vip-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
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
        color: var(--color-text-secondary, #aaa);
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

      .vip-popup__close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: #666;
        font-size: 1.5rem;
        cursor: pointer;
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
        color: var(--color-text-secondary, #aaa);
      }

      .vip-popup__plan strong {
        display: block;
        color: #ffd700;
        font-size: 1rem;
      }

      /* VIP Status Badge */
      .vip-badge {
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #000;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      /* VIP Popup Info Section */
      .vip-popup__info {
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;
      }

      .vip-popup__saweria-btn {
        display: block;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: #fff;
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: bold;
        font-size: 0.95rem;
        text-align: center;
        transition: all 0.3s ease;
      }

      .vip-popup__saweria-btn:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
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

      /* Ad Slot (for hiding) */
      .ad-slot {
        transition: opacity 0.3s ease;
      }

      .ad-slot.hidden {
        display: none !important;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .affiliate-offers__grid {
          grid-template-columns: 1fr 1fr;
        }

        .affiliate-card {
          padding: 12px;
        }

        .affiliate-card__icon {
          font-size: 1.5rem;
        }

        .affiliate-card__label {
          font-size: 0.75rem;
        }
      }
    `;
    document.head.appendChild(styles);
  },

  /**
   * Render affiliate offers section
   * @param {string} containerId - Target container ID
   * @param {string} movieId - Current movie/drama ID for tracking
   */
  renderAffiliateOffers(containerId, movieId = 'unknown') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('[Monetization] Container not found:', containerId);
      return;
    }

    // Store current movie ID for tracking
    window.currentMovieId = movieId;

    // Get randomized products (show 2 instead of all 4)
    const productsToShow = this.getRandomAffiliates(2);

    const html = `
      <div class="affiliate-offers" id="affiliate-section">
        <div class="affiliate-offers__title">
          ❤️ Support Toktok
        </div>
        <div class="affiliate-offers__grid">
          ${productsToShow.map(product => `
            <a href="#" class="affiliate-card" onclick="Monetization.goAffiliate('${product.key}'); return false;">
              ${product.bestPick ? '<span class="affiliate-card__badge">🔥 Best Pick</span>' : ''}
              <span class="affiliate-card__icon">${product.icon}</span>
              <span class="affiliate-card__label">${product.label}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  },

  /**
   * Render VIP button
   * @param {string} containerId - Target container ID
   */
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

  /**
   * Render VIP popup (hidden by default)
   */
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

  /**
   * Navigate to affiliate link with tracking
   * @param {string} key - Affiliate product key
   */
  goAffiliate(key) {
    const mid = window.currentMovieId || 'unknown';
    const product = this.affiliateProducts.find(p => p.key === key);
    const pos = product?.pos || 'unknown';

    console.log('[Monetization] Affiliate click:', key, mid, pos);

    // Redirect through GAS for tracking
    const redirectUrl = `${this.GAS_URL}?go=${key}&mid=${encodeURIComponent(mid)}&pos=${pos}&ua=${encodeURIComponent(navigator.userAgent)}`;
    window.open(redirectUrl, '_blank');
  },

  /**
   * Open VIP popup
   */
  openVipPopup() {
    this.renderVipPopup();
    const overlay = document.getElementById('vip-popup-overlay');
    if (overlay) {
      overlay.classList.add('visible');
      document.getElementById('vip-code-input')?.focus();
    }
  },

  /**
   * Close VIP popup
   * @param {Event} event 
   */
  closeVipPopup(event) {
    if (event && event.target.id !== 'vip-popup-overlay') return;
    const overlay = document.getElementById('vip-popup-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
    }
  },

  /**
   * Redeem VIP code
   */
  async redeemVip() {
    const input = document.getElementById('vip-code-input');
    const submitBtn = document.getElementById('vip-submit-btn');
    const code = input?.value.trim();

    if (!code) {
      alert('Masukkan kode VIP');
      return;
    }

    // Disable button during request
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memvalidasi...';
    }

    try {
      const response = await fetch(`${this.GAS_URL}?vip=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.ok) {
        // Store VIP status
        localStorage.setItem('vip_code', code);
        localStorage.setItem('vip_expiry', data.expires_at);

        alert('🎉 VIP Aktif! Semua iklan dimatikan.');
        this.hideAllAds();
        this.closeVipPopup({ target: { id: 'vip-popup-overlay' } });

        // Refresh page to update UI
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

  /**
   * Check if VIP is currently active
   * @returns {boolean}
   */
  isVipActive() {
    const expiry = localStorage.getItem('vip_expiry');
    if (!expiry) return false;

    const expiryDate = new Date(expiry);
    const now = new Date();

    if (expiryDate > now) {
      return true;
    } else {
      // Expired - clean up
      localStorage.removeItem('vip_code');
      localStorage.removeItem('vip_expiry');
      return false;
    }
  },

  /**
   * Check VIP status on page load
   */
  checkVipStatus() {
    if (this.isVipActive()) {
      console.log('[Monetization] VIP is active, hiding ads');
      this.hideAllAds();
    }
  },

  /**
   * Hide all ad slots
   */
  hideAllAds() {
    // Hide elements with class 'ad-slot'
    document.querySelectorAll('.ad-slot').forEach(el => {
      el.classList.add('hidden');
    });

    // Hide Adsterra banners
    document.querySelectorAll('.adsterra-banner').forEach(el => {
      el.style.display = 'none';
    });

    // Hide fixed ad banner
    const adBanner = document.getElementById('ad-banner');
    if (adBanner) {
      adBanner.style.display = 'none';
    }

    console.log('[Monetization] All ads hidden');
  },

  /**
   * Show all ad slots (for non-VIP users)
   */
  showAllAds() {
    document.querySelectorAll('.ad-slot').forEach(el => {
      el.classList.remove('hidden');
    });

    document.querySelectorAll('.adsterra-banner').forEach(el => {
      el.style.display = 'block';
    });

    const adBanner = document.getElementById('ad-banner');
    if (adBanner) {
      adBanner.style.display = 'flex';
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Monetization = Monetization;
}

export default Monetization;
