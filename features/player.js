/**
 * Video Player Page
 * Handles video playback with Google Drive iframe embed (CORS-safe)
 */

import { showToast } from '../shared/utils.js';

const PlayerPage = {
  init(encodedUrlParam) {
    console.log('[PlayerPage] init() called with param:', encodedUrlParam);
    this.render();
    this.setupEventListeners();
    this.loadVideoFromUrl(encodedUrlParam);
  },

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="player-container">
        <button class="player-close" id="close-player">×</button>
        
        <div id="video-container" style="position:relative; width:100%; height:100%; background:#000;">
          <div id="loading-overlay" style="display:flex; justify-content:center; align-items:center; position:absolute; top:0; left:0; width:100%; height:100%; background:#000; color:#fff; z-index:10;">
            <div style="text-align:center;">
              <div class="spinner" style="width:40px; height:40px; border:3px solid rgba(255,255,255,0.3); border-top:3px solid #ff6b6b; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 16px;"></div>
              <span>Loading video...</span>
            </div>
          </div>
          <iframe id="video-iframe" style="display:none; width:100%; height:100%; border:none;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>
      </div>
    `;
  },

  setupEventListeners() {
    const closeBtn = document.getElementById('close-player');
    closeBtn.addEventListener('click', () => {
      this.cleanup();
      window.history.back();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  },

  loadVideoFromUrl(encodedUrlParam) {
    // Try to get encoded URL from parameter first (passed by app.js)
    // If not available, parse from hash (fallback)
    let encodedUrl = encodedUrlParam;

    if (!encodedUrl) {
      // Fallback: parse from URL hash - index 1, not 2!
      // Hash format: #player/aHR0cHM6...
      const hashParts = window.location.hash.split('/');
      encodedUrl = hashParts[1]; // [0] is "#player", [1] is the encoded URL
      console.log('[PlayerPage] Parsed encodedUrl from hash:', encodedUrl);
    }

    if (encodedUrl) {
      try {
        const decodedUrl = atob(encodedUrl);
        console.log('[PlayerPage] Decoded URL:', decodedUrl);

        const fileId = this.extractGoogleDriveFileId(decodedUrl);

        if (fileId) {
          console.log('[PlayerPage] Loading video with file ID:', fileId);
          this.playGoogleDriveVideo(fileId);
        } else {
          console.error('[PlayerPage] Could not extract file ID from URL:', decodedUrl);
          showToast('Invalid video URL', 'error');
          this.hideLoading();
        }
      } catch (error) {
        console.error('[PlayerPage] Error decoding URL:', error);
        showToast('Failed to load video', 'error');
        this.hideLoading();
      }
    } else {
      console.error('[PlayerPage] No encoded URL found');
      showToast('No video URL provided', 'error');
      this.hideLoading();
    }
  },

  extractGoogleDriveFileId(url) {
    console.log('[PlayerPage] Extracting file ID from:', url);

    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,        // /d/FILE_ID/
      /[?&]id=([a-zA-Z0-9_-]+)/,      // ?id=FILE_ID or &id=FILE_ID
      /^([a-zA-Z0-9_-]{20,})$/        // Raw file ID (at least 20 chars)
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        console.log('[PlayerPage] Found file ID:', match[1]);
        return match[1];
      }
    }

    return null;
  },

  playGoogleDriveVideo(fileId) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const iframe = document.getElementById('video-iframe');
    const videoContainer = document.getElementById('video-container');

    // Use Google Drive's preview embed URL (CORS-safe, uses Google's player)
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    console.log('[PlayerPage] Loading iframe with URL:', embedUrl);

    // Set iframe source
    iframe.src = embedUrl;

    // When iframe loads, hide the loading overlay and auto-fullscreen
    iframe.onload = () => {
      console.log('[PlayerPage] Iframe loaded successfully');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      iframe.style.display = 'block';

      // Auto-fullscreen immediately
      this.requestFullscreen(videoContainer);

      showToast('Tap video to play', 'success');
    };

    iframe.onerror = () => {
      console.error('[PlayerPage] Iframe failed to load');
      this.hideLoading();
      showToast('Failed to load video. Check if file is shared publicly.', 'error');
    };

    // Fallback: hide loading after 3 seconds if onload doesn't fire
    setTimeout(() => {
      if (loadingOverlay && loadingOverlay.style.display !== 'none') {
        console.log('[PlayerPage] Timeout: hiding loading overlay');
        loadingOverlay.style.display = 'none';
        iframe.style.display = 'block';

        // Also try fullscreen on timeout
        this.requestFullscreen(videoContainer);
      }
    }, 3000);
  },

  requestFullscreen(element) {
    try {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
      console.log('[PlayerPage] Fullscreen requested');
    } catch (error) {
      console.warn('[PlayerPage] Fullscreen failed (user gesture required):', error.message);
    }
  },

  hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  },

  cleanup() {
    // Clear iframe
    const iframe = document.getElementById('video-iframe');
    if (iframe) {
      iframe.src = '';
    }
  }
};

export default PlayerPage;