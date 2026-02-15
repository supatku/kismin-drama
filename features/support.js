/**
 * Support Page
 * KISMIN Mode - Donation links and supporter code
 */

import CONFIG from '../core/config.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const SupportPage = {
  /**
   * Initialize support page
   */
  init() {
    const container = document.getElementById('app');
    const isSupporter = Storage.isSupporterUnlocked();

    container.innerHTML = `
      ${Components.Header('Support Dev', false)}
      <div class="page">
        <div style="max-width: 600px; margin: 0 auto;">
          
          <!-- Intro -->
          <div style="text-align: center; margin-bottom: var(--spacing-2xl);">
            <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">💝</div>
            <h2 style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-md);">
              Support This App
            </h2>
            <p style="color: var(--color-text-secondary); line-height: 1.6;">
              This app is built with ❤️ as an indie project. 
              If you enjoy using it, consider supporting the developer!
            </p>
          </div>
          
          <!-- Donation Links -->
          <div style="margin-bottom: var(--spacing-2xl);">
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
              ☕ Buy Me a Coffee
            </h3>
            
            <a href="${CONFIG.SUPPORT_LINKS.SAWERIA}" target="_blank" rel="noopener" class="btn btn--primary btn--full mb-md">
              ☕ Support via Saweria
            </a>
            
            <a href="${CONFIG.SUPPORT_LINKS.TRAKTEER}" target="_blank" rel="noopener" class="btn btn--primary btn--full mb-md">
              🎁 Support via Trakteer
            </a>

            <a href="${CONFIG.SUPPORT_LINKS.LYNKID}" target="_blank" rel="noopener" class="btn btn--secondary btn--full mb-md">
              🔗 Visit Lynk.id
            </a>

            <a href="${CONFIG.SUPPORT_LINKS.SELLAPP}" target="_blank" rel="noopener" class="btn btn--secondary btn--full">
              🛍️ Pesen App
            </a>
          </div>

          <!-- Social Media Links -->
          <div style="margin-bottom: var(--spacing-2xl);">
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
              📱 Follow Us
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
              <a href="${CONFIG.SOCMED_LINKS.TIKTOK}" target="_blank" rel="noopener" class="btn btn--secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>🎵</span> TikTok
              </a>
              <a href="${CONFIG.SOCMED_LINKS.YOUTUBE}" target="_blank" rel="noopener" class="btn btn--secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>📺</span> YouTube
              </a>
              <a href="${CONFIG.SOCMED_LINKS.FACEBOOK}" target="_blank" rel="noopener" class="btn btn--secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>👥</span> Facebook
              </a>
              <a href="${CONFIG.SOCMED_LINKS.PLAY_STORE}" target="_blank" rel="noopener" class="btn btn--secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>🎮</span> TangkoScene
              </a>
              <a href="${CONFIG.SOCMED_LINKS.PLAY_STORE_BIRA}" target="_blank" rel="noopener" class="btn btn--secondary" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>🎮</span> BiraaStudio
              </a>
            </div>
          </div>
          
          <!-- Supporter Code -->
          <div style="background-color: var(--color-bg-secondary); padding: var(--spacing-xl); border-radius: var(--radius-lg); margin-bottom: var(--spacing-xl);">
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
              🎁 Supporter Code
            </h3>
            
            ${isSupporter ? `
              <div style="text-align: center; padding: var(--spacing-xl); background-color: var(--color-bg-elevated); border-radius: var(--radius-md);">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">✨</div>
                <p style="color: var(--color-success); font-size: var(--font-size-lg); font-weight: 600;">
                  Supporter Unlocked!
                </p>
                <p style="color: var(--color-text-secondary); margin-top: var(--spacing-sm);">
                  Thank you for your support! 💖
                </p>
              </div>
            ` : `
              <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md); line-height: 1.6;">
                Have a supporter code? Enter it below to unlock special features!
              </p>
              
              <form id="supporter-form">
                <input 
                  type="text" 
                  id="supporter-code-input" 
                  placeholder="Enter supporter code" 
                  style="
                    width: 100%;
                    padding: var(--spacing-md);
                    background-color: var(--color-bg-elevated);
                    border: 2px solid var(--color-bg-elevated);
                    border-radius: var(--radius-md);
                    color: var(--color-text);
                    font-size: var(--font-size-base);
                    margin-bottom: var(--spacing-md);
                    outline: none;
                    transition: border-color var(--transition-fast);
                  "
                  required
                />
                <button type="submit" class="btn btn--secondary btn--full">
                  🔓 Unlock
                </button>
              </form>
            `}
          </div>
          
          <!-- Info -->
          <div style="text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm);">
            <p>Made with ❤️ by indie developer</p>
            <p style="margin-top: var(--spacing-xs);">
              v${CONFIG.APP_VERSION}
            </p>
          </div>
          
        </div>
      </div>
      ${Components.BottomNav('support')}
    `;

    // Attach listeners
    this.attachListeners();
  },

  /**
   * Attach event listeners
   */
  attachListeners() {
    const form = document.getElementById('supporter-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const input = document.getElementById('supporter-code-input');
        const code = input.value.trim();

        const isValid = Storage.setSupporterCode(code);

        if (isValid) {
          Utils.showToast('Supporter unlocked! Thank you! 💖', 'success');
          // Reload page to show unlocked state
          setTimeout(() => {
            this.init();
          }, 1000);
        } else {
          Utils.showToast('Invalid code. Please try again.', 'error');
          input.value = '';
          input.focus();
        }
      });
    }
  }
};

export default SupportPage;
