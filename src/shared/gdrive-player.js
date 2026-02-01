/**
 * Google Drive Video Player
 * Uses iframe with CSS overlay to hide Google Drive UI
 */

class GoogleDrivePlayer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoplay: false,
      ...options
    };
    this.iframe = null;
    this.isFullscreen = false;
    
    this.init();
  }

  init() {
    this.createPlayer();
    this.attachEvents();
  }

  createPlayer() {
    this.container.innerHTML = `
      <div class="gdrive-player">
        <div class="gdrive-iframe-container">
          <iframe 
            class="gdrive-iframe" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          ></iframe>
          
          <!-- Overlay to hide Google Drive UI elements -->
          <div class="gdrive-ui-overlay">
            <!-- Hide top-right icons -->
            <div class="overlay-top-right"></div>
            <!-- Hide bottom controls if needed -->
            <div class="overlay-bottom"></div>
          </div>
        </div>
        
        <!-- Custom loading indicator -->
        <div class="gdrive-loading" id="gdrive-loading">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p>Loading video...</p>
        </div>
        
        <!-- Custom fullscreen button -->
        <button class="gdrive-fullscreen-btn" id="fullscreen-btn" title="Fullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
      </div>
    `;

    this.iframe = this.container.querySelector('.gdrive-iframe');
    this.loading = this.container.querySelector('#gdrive-loading');
    this.fullscreenBtn = this.container.querySelector('#fullscreen-btn');
  }

  attachEvents() {
    // Fullscreen button
    this.fullscreenBtn.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Hide loading when iframe loads
    this.iframe.addEventListener('load', () => {
      setTimeout(() => {
        this.hideLoading();
      }, 1000);
    });

    // Fullscreen change events
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenButton();
      this.handleFullscreenChange();
    });
    
    document.addEventListener('webkitfullscreenchange', () => {
      this.isFullscreen = !!document.webkitFullscreenElement;
      this.updateFullscreenButton();
      this.handleFullscreenChange();
    });
    
    document.addEventListener('mozfullscreenchange', () => {
      this.isFullscreen = !!document.mozFullScreenElement;
      this.updateFullscreenButton();
      this.handleFullscreenChange();
    });
  }

  loadVideo(url, autoFullscreen = false) {
    this.showLoading();
    
    // Extract file ID and create preview URL with autoplay
    const fileId = this.extractGoogleDriveFileId(url);
    if (fileId) {
      // Add autoplay parameter to Google Drive preview URL
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`;
      console.log('[GoogleDrivePlayer] Loading:', previewUrl);
      this.iframe.src = previewUrl;
      
      // Auto fullscreen if requested (must be called from user gesture)
      if (autoFullscreen) {
        this.requestAutoFullscreen();
      }
    } else {
      console.error('[GoogleDrivePlayer] Could not extract file ID from:', url);
      this.showError('Invalid Google Drive URL');
    }
  }

  extractGoogleDriveFileId(url) {
    // Handle various Google Drive URL formats
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID/
      /[?&]id=([a-zA-Z0-9_-]+)/,        // ?id=FILE_ID or &id=FILE_ID
      /^([a-zA-Z0-9_-]+)$/              // Just the file ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  requestAutoFullscreen() {
    // Small delay to ensure iframe is ready
    setTimeout(() => {
      const playerElement = this.container.querySelector('.gdrive-player');
      
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen().catch(err => {
          console.log('[GoogleDrivePlayer] Fullscreen request failed:', err);
        });
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.mozRequestFullScreen) {
        playerElement.mozRequestFullScreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
    }, 500);
  },
    const playerElement = this.container.querySelector('.gdrive-player');
    
    if (!this.isFullscreen) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.mozRequestFullScreen) {
        playerElement.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  }

  handleFullscreenChange() {
    // Log fullscreen state changes
    console.log('[GoogleDrivePlayer] Fullscreen:', this.isFullscreen);
    
    // If user exits fullscreen, ensure video continues playing
    if (!this.isFullscreen) {
      // Optional: You can add logic here if needed when exiting fullscreen
      console.log('[GoogleDrivePlayer] Exited fullscreen');
    }
  },
    const icon = this.isFullscreen ? 
      `<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>` :
      `<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>`;
    
    this.fullscreenBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${icon}</svg>`;
  }

  showLoading() {
    this.loading.style.display = 'flex';
  }

  hideLoading() {
    this.loading.style.display = 'none';
  }

  showError(message) {
    this.loading.innerHTML = `
      <div class="error-message">
        <p>❌ ${message}</p>
        <small>Make sure the Google Drive file is shared as "Anyone with the link can view"</small>
      </div>
    `;
  }

  destroy() {
    if (this.iframe) {
      this.iframe.src = '';
    }
    this.container.innerHTML = '';
  }
}

export default GoogleDrivePlayer;