/**
 * Detail Page
 * KISMIN Mode - Show item info and direct play button for Rebahan API
 */

import API from '../core/api_client.js';
import Storage from '../core/storage.js';
import Components from '../shared/components.js';
import Utils from '../shared/utils.js';

const DetailPage = {
  currentItem: null,

  /**
   * Initialize detail page
   * @param {string} detailPath
   */
  async init(detailPath) {
    const container = document.getElementById('app');

    // Validate detailPath
    if (!detailPath || detailPath.trim() === '') {
      console.error('[DetailPage] Invalid detailPath:', detailPath);
      container.innerHTML = `
        ${Components.Header('Error', true)}
        <div class="page">
          ${Components.ErrorMessage('Invalid content ID. Please go back and try again.')}
        </div>
      `;
      return;
    }

    const decodedPath = decodeURIComponent(detailPath);
    console.log(`[DetailPage] Loading detail for: ${decodedPath}`);

    // Show loading state
    container.innerHTML = `
      ${Components.Header('Loading...', true)}
      <div class="page">
        <div class="text-center mt-lg">
          <div class="skeleton-line" style="height: 300px; border-radius: var(--radius-lg);"></div>
          <div class="skeleton-line mt-md"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      </div>
      ${Components.BottomNav('')}
    `;

    try {
      const item = await API.getDetail(decodedPath);
      this.currentItem = { ...item, id: decodedPath };

      // Render detail page
      this.render(this.currentItem);

      // Attach listeners
      this.attachListeners();

    } catch (error) {
      console.error('[DetailPage] Error loading detail:', error);
      // Show user-friendly error instead of crashing
      this.currentItem = {
        title: 'Content Unavailable',
        synopsis: 'This content is currently not available. Please try browsing other content.',
        thumbnail: 'https://via.placeholder.com/800x450?text=Content+Not+Available',
        rating: '0',
        year: '2024',
        genre: 'General',
        playerUrl: '',
        seasons: [],
        totalEpisodes: 0,
        id: decodedPath
      };

      this.render(this.currentItem);
      this.attachListeners();
    }
  },

  /**
   * Render detail page
   */
  render(item) {
    const isFavorite = Storage.isFavorite(item.id);
    const container = document.getElementById('app');

    // Check for seasons/episodes (TV series)
    const hasEpisodes = item.seasons && item.seasons.length > 0;

    container.innerHTML = `
      ${Components.Header(item.title, true)}
      <div class="page">
        <!-- Item Header -->
        <div style="margin-bottom: var(--spacing-xl);">
          <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--spacing-lg);">
            <img src="${item.thumbnail}" alt="${Utils.escapeHtml(item.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
            <button class="drama-card__favorite" id="detail-favorite" style="top: var(--spacing-md); left: var(--spacing-md); background: rgba(0,0,0,0.6);">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          
          <h2 style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-sm); line-height: 1.2;">
            ${Utils.escapeHtml(item.title)}
          </h2>
          
          <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md); color: var(--color-text-secondary);">
            <span>⭐ ${item.rating}</span>
            <span>📅 ${item.year}</span>
          </div>
          
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap; margin-bottom: var(--spacing-lg);">
            ${item.genre ? item.genre.split(',').map(g => `<span class="genre-tag">${g.trim()}</span>`).join('') : '<span class="genre-tag">General</span>'}
          </div>

          ${!hasEpisodes ? `
            <div style="margin-bottom: var(--spacing-xl);">
              <button class="btn btn--primary btn--full" id="play-button">
                <span style="font-size: 1.2rem;">▶</span> Play Now
              </button>
            </div>
          ` : ''}
          
          <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm);">Synopsis</h3>
          <p style="color: var(--color-text-secondary); line-height: 1.6; font-size: var(--font-size-sm); margin-bottom: var(--spacing-xl);">
            ${Utils.escapeHtml(item.synopsis)}
          </p>

          ${Components.AdBanner()}

          ${hasEpisodes ? `
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">Episodes</h3>
            <div class="episode-list">
              ${item.seasons.map(season => {
      // Flatten all episodes with index for navigation
      return `
                <div class="season-group">
                  <h4 style="margin: var(--spacing-md) 0; color: var(--color-primary);">Season ${season.season}</h4>
                  <div style="display: grid; gap: var(--spacing-sm);">
                    ${season.episodes.map((ep, idx) => `
                      <div class="episode-card" data-url="${btoa(ep.playerUrl)}" data-episode-index="${idx}" data-season="${season.season}">
                        <div class="episode-card__content">
                          <span style="margin-right: var(--spacing-sm);">Episode ${ep.episode}</span>
                          <span style="flex: 1; color: var(--color-text-secondary);">${ep.title}</span>
                          <span>▶</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
    }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
      ${Components.BottomNav('')}
    `;
  },

  /**
   * Attach event listeners
   */
  attachListeners() {
    // Favorite button
    const favoriteBtn = document.getElementById('detail-favorite');
    if (favoriteBtn && this.currentItem) {
      favoriteBtn.addEventListener('click', () => {
        const isFavorite = Storage.toggleFavorite(this.currentItem.id);
        favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
        Utils.showToast(
          isFavorite ? 'Added to watchlist' : 'Removed from watchlist',
          'success'
        );
      });
    }

    // Play button (for single items)
    const playBtn = document.getElementById('play-button');
    if (playBtn && this.currentItem && this.currentItem.playerUrl) {
      playBtn.addEventListener('click', () => {
        this.playVideoInline(this.currentItem.playerUrl);
      });
    }

    // Episode card clicks - INLINE FULLSCREEN PLAYER
    const episodeList = document.querySelector('.episode-list');
    if (episodeList) {
      episodeList.addEventListener('click', (e) => {
        const epCard = e.target.closest('.episode-card');
        if (epCard) {
          const encodedUrl = epCard.dataset.url;
          const episodeIndex = parseInt(epCard.dataset.episodeIndex, 10);
          const seasonNum = parseInt(epCard.dataset.season, 10);
          try {
            const videoUrl = atob(encodedUrl);
            this.playVideoInline(videoUrl, seasonNum, episodeIndex);
          } catch (err) {
            console.error('[DetailPage] Invalid video URL:', err);
            Utils.showToast('Invalid video URL', 'error');
          }
        }
      });
    }
  },

  /**
   * Play video inline with instant fullscreen
   * IMPORTANT: Fullscreen is requested FIRST (while in click context)
   * then video loads async after we're already fullscreen
   * @param {string} videoUrl - Google Drive video URL
   * @param {number} seasonNum - Current season number (optional)
   * @param {number} episodeIndex - Current episode index in the season (optional)
   */
  playVideoInline(videoUrl, seasonNum = 1, episodeIndex = 0) {
    console.log('[DetailPage] Playing video inline:', videoUrl, 'S' + seasonNum + 'E' + (episodeIndex + 1));

    // Store current episode info for next episode navigation
    this.currentSeasonNum = seasonNum;
    this.currentEpisodeIndex = episodeIndex;

    // Extract file ID from Google Drive URL
    const fileId = this.extractGoogleDriveFileId(videoUrl);
    if (!fileId) {
      Utils.showToast('Invalid Google Drive URL', 'error');
      return;
    }

    // Check if there's a next episode
    const hasNextEpisode = this.hasNextEpisode(seasonNum, episodeIndex);

    // Remove existing overlay if any
    const existingOverlay = document.getElementById('inline-player-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // 1. CREATE PLAYER OVERLAY (must exist before fullscreen)
    const overlay = document.createElement('div');
    overlay.id = 'inline-player-overlay';
    overlay.innerHTML = `
      <style>
        .next-episode-btn {
          position: absolute;
          bottom: 80px;
          right: 20px;
          padding: 12px 24px;
          background: rgba(255, 107, 107, 0.9);
          border: none;
          border-radius: 25px;
          color: white;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.3s ease, transform 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .next-episode-btn:hover {
          background: rgba(255, 107, 107, 1);
          transform: scale(1.05);
        }
        .next-episode-btn.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.9);
        }
      </style>
      <div class="inline-player-container" id="inline-player-container">
        <div id="inline-loading" style="display:flex; justify-content:center; align-items:center; width:100%; height:100%; background:#000; color:#fff;">
          <div style="text-align:center;">
            <div style="width:40px; height:40px; border:3px solid rgba(255,255,255,0.3); border-top:3px solid #ff6b6b; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 16px;"></div>
            <span>Loading video...</span>
          </div>
        </div>
        <!-- Video iframe at full size -->
        <div id="iframe-wrapper" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0;">
          <iframe id="inline-video-iframe" style="width:100%; height:100%; border:none;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
          <!-- Small overlay to cover Google Drive's top-right icon -->
          <div style="position:absolute; top:0; right:0; width:50px; height:50px; background:#000; z-index:1;"></div>
          ${hasNextEpisode ? `
            <button class="next-episode-btn" id="next-episode-btn">
              Next Episode ▶
            </button>
          ` : ''}
        </div>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 9999;
    `;
    document.body.appendChild(overlay);

    const container = document.getElementById('inline-player-container');
    container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    `;

    // 2. REQUEST FULLSCREEN IMMEDIATELY (still in click context!)
    try {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      console.log('[DetailPage] Fullscreen requested immediately');
    } catch (err) {
      console.warn('[DetailPage] Fullscreen failed:', err);
    }

    // 3. SETUP FULLSCREEN EXIT HANDLER (ESC key will exit fullscreen automatically)
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);

    // 4. LOAD VIDEO ASYNC (already in fullscreen now)
    const iframe = document.getElementById('inline-video-iframe');
    const iframeWrapper = document.getElementById('iframe-wrapper');
    const loading = document.getElementById('inline-loading');
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    console.log('[DetailPage] Loading iframe:', embedUrl);
    iframe.src = embedUrl;

    iframe.onload = () => {
      console.log('[DetailPage] Video loaded');
      loading.style.display = 'none';
      iframeWrapper.style.display = 'block';

      // Setup Next Episode button if exists
      const nextBtn = document.getElementById('next-episode-btn');
      if (nextBtn) {
        let hideTimeout;
        const hideBtn = () => nextBtn.classList.add('hidden');
        const showBtn = () => {
          nextBtn.classList.remove('hidden');
          clearTimeout(hideTimeout);
          hideTimeout = setTimeout(hideBtn, 5000);
        };

        // Show initially, then auto-hide after 5 seconds
        showBtn();

        // Click to play next episode
        nextBtn.addEventListener('click', () => {
          this.playNextEpisode();
        });

        // Show on container tap
        container.addEventListener('click', (e) => {
          if (e.target.tagName !== 'IFRAME') {
            showBtn();
          }
        });
      }
    };

    // Fallback: show iframe after 3 seconds anyway
    setTimeout(() => {
      if (loading.style.display !== 'none') {
        loading.style.display = 'none';
        iframeWrapper.style.display = 'block';
      }
    }, 3000);
  },

  handleFullscreenChange() {
    // If exited fullscreen, close the player
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const overlay = document.getElementById('inline-player-overlay');
      if (overlay) {
        overlay.remove();
      }
      document.removeEventListener('fullscreenchange', DetailPage.handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', DetailPage.handleFullscreenChange);
    }
  },

  extractGoogleDriveFileId(url) {
    if (!url) return null;

    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{20,})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  },

  /**
   * Check if there's a next episode available
   */
  hasNextEpisode(seasonNum, episodeIndex) {
    if (!this.currentItem || !this.currentItem.seasons) return false;

    const season = this.currentItem.seasons.find(s => s.season === seasonNum);
    if (!season) return false;

    // Check if next episode exists in current season
    if (episodeIndex + 1 < season.episodes.length) {
      return true;
    }

    // Check if there's a next season with episodes
    const nextSeason = this.currentItem.seasons.find(s => s.season === seasonNum + 1);
    if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
      return true;
    }

    return false;
  },

  /**
   * Play the next episode
   */
  playNextEpisode() {
    if (!this.currentItem || !this.currentItem.seasons) {
      console.error('[DetailPage] No current item or seasons');
      return;
    }

    const seasonNum = this.currentSeasonNum;
    const episodeIndex = this.currentEpisodeIndex;

    const season = this.currentItem.seasons.find(s => s.season === seasonNum);
    if (!season) {
      console.error('[DetailPage] Season not found:', seasonNum);
      return;
    }

    let nextVideoUrl = null;
    let nextSeasonNum = seasonNum;
    let nextEpisodeIndex = episodeIndex + 1;

    // Check if next episode exists in current season
    if (nextEpisodeIndex < season.episodes.length) {
      nextVideoUrl = season.episodes[nextEpisodeIndex].playerUrl;
    } else {
      // Try next season
      const nextSeason = this.currentItem.seasons.find(s => s.season === seasonNum + 1);
      if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
        nextSeasonNum = seasonNum + 1;
        nextEpisodeIndex = 0;
        nextVideoUrl = nextSeason.episodes[0].playerUrl;
      }
    }

    if (nextVideoUrl) {
      console.log('[DetailPage] Playing next episode:', 'S' + nextSeasonNum + 'E' + (nextEpisodeIndex + 1));
      Utils.showToast(`Playing Episode ${nextEpisodeIndex + 1}`, 'info');
      this.playVideoInline(nextVideoUrl, nextSeasonNum, nextEpisodeIndex);
    } else {
      Utils.showToast('No more episodes', 'info');
    }
  }
};

export default DetailPage;
