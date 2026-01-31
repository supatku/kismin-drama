/**
 * Player Page
 * KISMIN Mode - HLS video player with tap-to-play
 */

import API from '../core/api_client.js';

const PlayerPage = {
    player: null,
    hls: null,

    /**
     * Initialize player page
     * @param {string} episodeId
     */
    async init(episodeId) {
        const container = document.getElementById('app');

        try {
            // Get stream URL
            const streamUrl = await API.getStreamUrl(episodeId);

            // Render player
            container.innerHTML = `
        <div class="player-container">
          <button class="player-close" id="close-player">✕</button>
          <video 
            id="video-player" 
            controls 
            playsinline
            preload="metadata"
            style="width: 100%; height: 100%;"
          ></video>
        </div>
      `;

            // Initialize HLS player
            await this.initPlayer(streamUrl);

            // Attach listeners
            this.attachListeners();

        } catch (error) {
            console.error('Error loading video:', error);
            alert('Failed to load video');
            window.history.back();
        }
    },

    /**
     * Initialize HLS.js player
     */
    async initPlayer(streamUrl) {
        const video = document.getElementById('video-player');
        this.player = video;

        // Check if HLS.js is supported
        if (!streamUrl.endsWith('.m3u8')) {
            // Direct video file
            video.src = streamUrl;
            return;
        }

        // Check if browser has native HLS support (Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        // Use HLS.js for other browsers
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            this.hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60
            });

            this.hls.loadSource(streamUrl);
            this.hls.attachMedia(video);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest loaded');
                // Auto-play is disabled for Telegram - user must tap to play
            });

            this.hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error, try to recover');
                            this.hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error, try to recover');
                            this.hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, cannot recover');
                            this.destroy();
                            alert('Video playback error');
                            window.history.back();
                            break;
                    }
                }
            });
        } else {
            // Fallback to direct source
            video.src = streamUrl;
        }
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        // Close button
        const closeBtn = document.getElementById('close-player');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.destroy();
                window.history.back();
            });
        }

        // Handle Telegram back button (if available)
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => {
                this.destroy();
                window.history.back();
            });
        }

        // Pause video when page is hidden (e.g., Telegram app minimized)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.player) {
                this.player.pause();
            }
        });
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

        // Hide Telegram back button
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }
};

export default PlayerPage;
