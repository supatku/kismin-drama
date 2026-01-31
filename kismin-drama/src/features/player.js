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
    setupPlayer(streamUrl) {
        const wrapper = document.getElementById('player-wrapper');

        // If it's an iframe (common for Rebahan/Zeldvorik)
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

        // If it's a direct URL that might need an iframe or a video tag
        if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
            wrapper.innerHTML = `
                <video 
                    id="video-player" 
                    controls 
                    playsinline
                    preload="metadata"
                    style="width: 100%; height: 100%;"
                ></video>
            `;
            this.initVideoTag(streamUrl);
        } else {
            // Probably an embed URL
            wrapper.innerHTML = `
                <iframe 
                    src="${streamUrl}" 
                    style="width: 100%; height: 100%; border: none;" 
                    allowfullscreen
                    allow="autoplay; encrypted-media"
                ></iframe>
            `;
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
