/**
 * Player Page
 * KISMIN Mode - Improved player for Rebahan API (direct URLs)
 */

const PlayerPage = {
    player: null,
    hls: null,

    /**
     * Convert Google Drive URL to embed format for video playback
     * @param {string} url - Google Drive URL
     * @returns {string} - Embed URL for iframe
     */
    convertDriveToEmbed(url) {
        let fileId = null;

        // Extract file ID from various formats
        // Format: https://drive.google.com/uc?export=download&id=FILE_ID
        if (url.includes('uc?') && url.includes('id=')) {
            const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match) fileId = match[1];
        }
        // Format: https://drive.google.com/file/d/FILE_ID/view
        else if (url.includes('/file/d/')) {
            const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match) fileId = match[1];
        }
        // Format: https://drive.google.com/open?id=FILE_ID
        else if (url.includes('open?id=')) {
            const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match) fileId = match[1];
        }

        if (fileId) {
            // Use preview format for video embedding
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }

        return url;
    },

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
          <div class="player-ambient" aria-hidden="true"></div>
          <button class="player-close" id="close-player" aria-label="Close player">✕</button>
          <div class="player-wrapper" id="player-wrapper">
            ${this.getStatusMarkup('Loading video...')}
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
        const statusTitle = status?.querySelector('.player-status__title');

        console.log('[Player] Setting up player for:', streamUrl);

        try {
            // Handle Google Drive URLs - convert to embed format
            if (streamUrl.includes('drive.google.com')) {
                const embedUrl = this.convertDriveToEmbed(streamUrl);
                console.log('[Player] Google Drive URL detected, using embed:', embedUrl);

                wrapper.innerHTML = `
                    <div class="player-iframe-container">
                        <iframe 
                            src="${embedUrl}" 
                            style="width: 100%; height: 100%; border: none; background: #000;" 
                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                            id="video-iframe"
                        ></iframe>
                        <div class="player-external-link" style="position: absolute; bottom: 20px; right: 20px; z-index: 100;">
                            <button class="btn btn--secondary" onclick="window.open('${embedUrl}', '_blank')" style="opacity: 0.7; scale: 0.8;">
                                ↗️ External Player
                            </button>
                        </div>
                    </div>
                `;

                // Setup auto fullscreen for iframe
                const iframe = document.getElementById('video-iframe');
                this.setupIframeFullscreen(iframe);
                return;
            }

            // If it's a Rebahan/Zeldvorik player URL, fetch the actual stream
            if (streamUrl.includes('zeldvorik.ru') || streamUrl.includes('player.php')) {
                if (statusTitle) {
                    statusTitle.textContent = 'Getting stream URL...';
                }

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

            // For Google Drive URLs, use iframe embed
            if (streamUrl.includes('drive.google.com')) {
                const fileId = this.extractGoogleDriveFileId(streamUrl);
                if (fileId) {
                    wrapper.innerHTML = `
                        <iframe 
                            src="https://drive.google.com/file/d/${fileId}/preview" 
                            style="width: 100%; height: 100%; border: none;" 
                            allowfullscreen
                            allow="autoplay; encrypted-media; fullscreen"
                        ></iframe>
                    `;
                    return;
                }
            }

            // If it's a direct video URL
            if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                this.createVideoPlayer(wrapper, streamUrl);
                return;
            }

            // For web browser: Use iframe embed without "Open in Browser" button
            if (this.isWebBrowser()) {
                wrapper.innerHTML = `
                    <iframe 
                        src="${streamUrl}" 
                        style="width: 100%; height: 100%; border: none;" 
                        allowfullscreen
                        allow="autoplay; encrypted-media; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        id="video-iframe"
                    ></iframe>
                `;

                // Setup auto fullscreen for iframe
                const iframe = document.getElementById('video-iframe');
                this.setupIframeFullscreen(iframe);
                return;
            }

            // Fallback for mobile/Telegram: show external link
            const showOpenInBrowser = this.isTelegramWebApp();
            const openInBrowserMarkup = showOpenInBrowser
                ? `
                    <div style="margin-top: var(--spacing-md);">
                        <button class="btn btn--primary" onclick="window.open('${streamUrl}', '_blank')">
                            Open in Browser
                        </button>
                    </div>
                `
                : '';

            wrapper.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🎬</div>
                    <p style="margin-bottom: var(--spacing-lg);">Loading video player...</p>
                    <iframe 
                        src="${streamUrl}" 
                        style="width: 100%; height: 400px; border: none; border-radius: var(--radius-md);" 
                        allowfullscreen
                        allow="autoplay; encrypted-media; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                    ></iframe>
                    ${openInBrowserMarkup}
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
        wrapper.innerHTML = this.getStatusMarkup('Loading video...');
        const video = document.createElement('video');
        video.id = 'video-player';
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute(
            'poster',
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23000'/%3E%3Cpath d='M45 35 L85 60 L45 85 Z' fill='%23fff'/%3E%3C/svg%3E"
        );
        wrapper.prepend(video);
        this.initVideoTag(streamUrl);
    },

    getStatusMarkup(message) {
        return `
            <div class="player-status" id="player-status">
                <div class="player-status__icon">🎬</div>
                <p class="player-status__title">${message}</p>
                <p class="player-status__subtitle">Tap play to enter fullscreen</p>
            </div>
        `;
    },

    /**
     * Extract Google Drive file ID from various URL formats
     */
    extractGoogleDriveFileId(url) {
        // Format: https://drive.google.com/uc?export=download&id=FILE_ID
        if (url.includes('uc?export=download&id=')) {
            const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        }
        
        // Format: https://drive.google.com/file/d/FILE_ID/view
        if (url.includes('/file/d/')) {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        }
        
        return null;
    },
    isWebBrowser() {
        return !this.isTelegramWebApp() &&
            typeof window !== 'undefined' &&
            window.location.protocol.startsWith('http');
    },

    /**
     * Detect Telegram WebApp context (not just the script being present)
     */
    isTelegramWebApp() {
        const telegramApp = window.Telegram?.WebApp;
        if (!telegramApp) {
            return false;
        }
        const hasInitData = typeof telegramApp.initData === 'string' && telegramApp.initData.length > 0;
        const hasUser = Boolean(telegramApp.initDataUnsafe?.user);
        return hasInitData || hasUser;
    },

    /**
     * Setup auto fullscreen for iframe
     */
    setupIframeFullscreen(iframe) {
        if (!iframe) return;

        // Auto fullscreen on user interaction
        const triggerFullscreen = () => {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen().catch(() => { });
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            } else if (iframe.mozRequestFullScreen) {
                iframe.mozRequestFullScreen();
            }
        };

        // Trigger fullscreen on click
        iframe.addEventListener('click', triggerFullscreen);

        // Auto trigger after 2 seconds
        setTimeout(() => {
            triggerFullscreen();
        }, 2000);
    },
    async resolvePlayerUrl(playerUrl) {
        try {
            // Use CORS proxy for Telegram WebView
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(playerUrl)}`;

            const response = await fetch(proxyUrl);
            const html = await response.text();

            // Try to extract video URL from HTML
            const videoMatch = html.match(/src=["'](.*?\.m3u8.*?)["']/i) ||
                html.match(/src=["'](.*?\.mp4.*?)["']/i);

            if (videoMatch) {
                return videoMatch[1];
            }

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

        this.bindVideoEvents(video);
    },

    bindVideoEvents(video) {
        const status = document.getElementById('player-status');
        const showStatus = () => status?.classList.remove('is-hidden');
        const hideStatus = () => status?.classList.add('is-hidden');

        video.addEventListener('play', () => {
            this.requestFullscreen(video);
            hideStatus();
        });
        video.addEventListener('playing', hideStatus);
        video.addEventListener('canplay', hideStatus);
        video.addEventListener('waiting', showStatus);
        video.addEventListener('stalled', showStatus);

        // Auto fullscreen on first play for web browsers
        if (this.isWebBrowser()) {
            video.addEventListener('loadedmetadata', () => {
                setTimeout(() => {
                    this.requestFullscreen(video);
                }, 1000);
            });
        }
    },

    requestFullscreen(video) {
        const isFullscreen = document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;

        if (isFullscreen) {
            return;
        }

        const request =
            video.requestFullscreen ||
            video.webkitRequestFullscreen ||
            video.mozRequestFullScreen ||
            video.msRequestFullscreen;

        if (request) {
            const result = request.call(video);
            if (result?.catch) {
                result.catch(() => { });
            }
            return;
        }

        if (typeof video.webkitEnterFullscreen === 'function') {
            try {
                video.webkitEnterFullscreen();
            } catch (error) {
                console.warn('Fullscreen request failed:', error);
            }
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

        if (this.isTelegramWebApp()) {
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
