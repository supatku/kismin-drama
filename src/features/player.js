/**
 * Player Page
 * KISMIN Mode - Improved player for Rebahan API (direct URLs)
 */

const PlayerPage = {
    player: null,
    hls: null,

    /**
     * Initialize player page
     * @param {string} encodedUrl - Base64 encoded stream/player URL
     */
    async init(encodedUrl) {
        const container = document.getElementById('app');

        try {
            // Decode the URL
            const streamUrl = atob(encodedUrl);

            if (!streamUrl) {
                throw new Error('Video URL missing');
            }

            // Render player structure
            container.innerHTML = `
        <div class="player-container">
          <button class="player-close" id="close-player">✕</button>
          <div id="player-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <p id="player-status">Loading video...</p>
          </div>
        </div>
      `;

            // Handle different types of player URLs
            this.setupPlayer(streamUrl);

            // Attach listeners
            this.attachListeners();

        } catch (error) {
            console.error('Error loading video:', error);
            alert('Failed to load video URL');
            window.history.back();
        }
    },

    /**
     * Setup the player based on URL type
     */
    async setupPlayer(streamUrl) {
        const wrapper = document.getElementById('player-wrapper');
        const status = document.getElementById('player-status');

        try {
            // If it's a Rebahan/Zeldvorik player URL, fetch the actual stream
            if (streamUrl.includes('zeldvorik.ru') || streamUrl.includes('player.php')) {
                status.textContent = 'Getting stream URL...';
                
                // Try to get the actual video URL
                const actualUrl = await this.resolvePlayerUrl(streamUrl);
                if (actualUrl) {
                    this.createVideoPlayer(wrapper, actualUrl);
                    return;
                }
            }

            // If it's an iframe embed
            if (streamUrl.includes('<iframe')) {
                wrapper.innerHTML = streamUrl;
                const iframe = wrapper.querySelector('iframe');
                if (iframe) {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                }
                return;
            }

            // If it's a direct video URL
            if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                this.createVideoPlayer(wrapper, streamUrl);
                return;
            }

            // Fallback: show message to open in browser
            wrapper.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🎬</div>
                    <p style="margin-bottom: var(--spacing-lg);">Video needs to be opened in browser</p>
                    <button class="btn btn--primary" onclick="window.open('${streamUrl}', '_blank')">
                        Open in Browser
                    </button>
                </div>
            `;

        } catch (error) {
            console.error('Player setup error:', error);
            wrapper.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-error);">
                    <p>Failed to load video</p>
                    <button class="btn btn--secondary" onclick="window.history.back()">
                        Go Back
                    </button>
                </div>
            `;
        }
    },

    /**
     * Create video player element
     */
    createVideoPlayer(wrapper, streamUrl) {
        wrapper.innerHTML = `
            <video 
                id="video-player" 
                controls 
                playsinline
                preload="metadata"
                style="width: 100%; height: 100%;"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23fff' font-size='40'%3E▶%3C/text%3E%3C/svg%3E"
            ></video>
        `;
        this.initVideoTag(streamUrl);
    },

    /**
     * Try to resolve player URL to actual stream
     */
    async resolvePlayerUrl(playerUrl) {
        try {
            // For now, return null to fallback to "Open in Browser"
            // This can be enhanced later with proper stream extraction
            return null;
        } catch (error) {
            console.error('Failed to resolve player URL:', error);
            return null;
        }
    },
    /**
     * Initialize HLS.js for video tag
     */
    async initVideoTag(streamUrl) {
        const video = document.getElementById('video-player');
        this.player = video;

        // Check for HLS
        if (streamUrl.includes('.m3u8')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                this.hls = new Hls();
                this.hls.loadSource(streamUrl);
                this.hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        } else {
            video.src = streamUrl;
        }
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        const closeBtn = document.getElementById('close-player');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.destroy();
                window.history.back();
            });
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => {
                this.destroy();
                window.history.back();
            });
        }
    },

    /**
     * Clean up resources
     */
    destroy() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        if (this.player) {
            this.player.pause();
            this.player.src = '';
            this.player = null;
        }

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }
};

export default PlayerPage;
