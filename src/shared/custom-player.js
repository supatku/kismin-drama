/**
 * Custom Video Player
 * Clean, minimal player for Google Drive videos
 */

class CustomVideoPlayer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoplay: false,
      controls: true,
      muted: false,
      ...options
    };
    this.video = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    
    this.init();
  }

  init() {
    this.createPlayer();
    this.attachEvents();
  }

  createPlayer() {
    this.container.innerHTML = `
      <div class="custom-video-player">
        <video class="video-element" preload="metadata" playsinline>
          <source src="" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        <div class="video-overlay" id="video-overlay">
          <button class="play-button" id="play-button">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.7)"/>
              <polygon points="22,15 22,45 45,30" fill="white"/>
            </svg>
          </button>
        </div>

        <div class="video-controls" id="video-controls">
          <div class="progress-container">
            <div class="progress-bar" id="progress-bar">
              <div class="progress-filled" id="progress-filled"></div>
              <div class="progress-handle" id="progress-handle"></div>
            </div>
          </div>
          
          <div class="controls-row">
            <button class="control-btn play-pause" id="play-pause">
              <svg class="play-icon" width="20" height="20" viewBox="0 0 20 20">
                <polygon points="3,2 3,18 17,10" fill="currentColor"/>
              </svg>
              <svg class="pause-icon hidden" width="20" height="20" viewBox="0 0 20 20">
                <rect x="3" y="2" width="4" height="16" fill="currentColor"/>
                <rect x="13" y="2" width="4" height="16" fill="currentColor"/>
              </svg>
            </button>
            
            <span class="time-display" id="time-display">0:00 / 0:00</span>
            
            <div class="volume-container">
              <button class="control-btn volume-btn" id="volume-btn">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M9 2L5 6H1v8h4l4 4V2z" fill="currentColor"/>
                  <path d="M15 6s2 1 2 4-2 4-2 4" stroke="currentColor" fill="none"/>
                </svg>
              </button>
              <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.1" value="1">
            </div>
            
            <button class="control-btn fullscreen-btn" id="fullscreen-btn">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M2 2h6v2H4v4H2V2zm12 0h4v6h-2V4h-4V2zM4 14v-4H2v6h6v-2H4zm12 0h-4v2h6v-6h-2v4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="loading-spinner hidden" id="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    this.video = this.container.querySelector('.video-element');
    this.setupElements();
  }

  setupElements() {
    this.playButton = this.container.querySelector('#play-button');
    this.overlay = this.container.querySelector('#video-overlay');
    this.controls = this.container.querySelector('#video-controls');
    this.playPause = this.container.querySelector('#play-pause');
    this.progressBar = this.container.querySelector('#progress-bar');
    this.progressFilled = this.container.querySelector('#progress-filled');
    this.progressHandle = this.container.querySelector('#progress-handle');
    this.timeDisplay = this.container.querySelector('#time-display');
    this.volumeBtn = this.container.querySelector('#volume-btn');
    this.volumeSlider = this.container.querySelector('#volume-slider');
    this.fullscreenBtn = this.container.querySelector('#fullscreen-btn');
    this.loadingSpinner = this.container.querySelector('#loading-spinner');
  }

  attachEvents() {
    // Video events
    this.video.addEventListener('loadstart', () => this.showLoading());
    this.video.addEventListener('canplay', () => this.hideLoading());
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('ended', () => this.onEnded());

    // Control events
    this.playButton.addEventListener('click', () => this.togglePlay());
    this.playPause.addEventListener('click', () => this.togglePlay());
    this.progressBar.addEventListener('click', (e) => this.seek(e));
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    // Hide controls on mouse leave
    let controlsTimeout;
    this.container.addEventListener('mousemove', () => {
      this.showControls();
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => this.hideControls(), 3000);
    });

    this.container.addEventListener('mouseleave', () => {
      clearTimeout(controlsTimeout);
      this.hideControls();
    });
  }

  loadVideo(url) {
    this.showLoading();
    
    // Convert Google Drive URL to direct stream URL
    const streamUrl = this.convertGoogleDriveUrl(url);
    
    this.video.src = streamUrl;
    this.video.load();
  }

  convertGoogleDriveUrl(url) {
    // Extract file ID from Google Drive URL
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      // Use direct download URL for better streaming
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.overlay.classList.add('hidden');
    this.container.querySelector('.play-icon').classList.add('hidden');
    this.container.querySelector('.pause-icon').classList.remove('hidden');
  }

  onPause() {
    this.isPlaying = false;
    this.overlay.classList.remove('hidden');
    this.container.querySelector('.play-icon').classList.remove('hidden');
    this.container.querySelector('.pause-icon').classList.add('hidden');
  }

  onEnded() {
    this.isPlaying = false;
    this.overlay.classList.remove('hidden');
    this.container.querySelector('.play-icon').classList.remove('hidden');
    this.container.querySelector('.pause-icon').classList.add('hidden');
  }

  updateProgress() {
    if (this.video.duration) {
      const progress = (this.video.currentTime / this.video.duration) * 100;
      this.progressFilled.style.width = `${progress}%`;
      this.progressHandle.style.left = `${progress}%`;
      this.updateTimeDisplay();
    }
  }

  updateDuration() {
    this.duration = this.video.duration;
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const current = this.formatTime(this.video.currentTime);
    const total = this.formatTime(this.duration);
    this.timeDisplay.textContent = `${current} / ${total}`;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  seek(e) {
    const rect = this.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.video.currentTime = pos * this.video.duration;
  }

  setVolume(value) {
    this.video.volume = value;
    this.volume = value;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  showControls() {
    this.controls.classList.remove('hidden');
  }

  hideControls() {
    if (this.isPlaying) {
      this.controls.classList.add('hidden');
    }
  }

  showLoading() {
    this.loadingSpinner.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingSpinner.classList.add('hidden');
  }

  destroy() {
    this.video.pause();
    this.video.src = '';
    this.container.innerHTML = '';
  }
}

export default CustomVideoPlayer;