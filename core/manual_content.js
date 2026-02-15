/**
 * Manual Content Service
 * Integrates Google Sheets data with existing API
 * Protected: Only works from allowed domains
 */

const ManualContentAPI = {
  // Google Apps Script Web App URL (with monetization)
  SHEETS_API_URL: 'https://script.google.com/macros/s/AKfycbwi6CE_2aVZR8BTF6ojzQ14XL4ek-rqF1-lK1FkBHa2FcrJVnc1PHX37IvrGM6mbWqd/exec',

  /**
   * Get origin parameter for domain protection
   */
  getOriginParam() {
    return `&origin=${encodeURIComponent(window.location.origin)}&referer=${encodeURIComponent(window.location.href)}`;
  },

  /**
   * Convert Google Drive URL to direct image/thumbnail format
   * @param {string} url - Google Drive URL
   * @returns {string} - Direct accessible URL
   */
  convertDriveImageUrl(url) {
    if (!url || url.includes('placeholder')) return typeof CONFIG !== 'undefined' ? CONFIG.PLACEHOLDER_IMAGE : '';

    // Extract file ID from various Google Drive URL formats
    let fileId = null;

    // Format: https://drive.google.com/uc?id=FILE_ID
    if (url.includes('drive.google.com/uc?id=')) {
      const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
    }
    // Format: https://drive.google.com/file/d/FILE_ID/view
    else if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
    }

    if (fileId) {
      // Use lh3.googleusercontent.com for direct image access (more reliable)
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Return original URL if not a Google Drive URL
    return url;
  },

  /**
   * Fetch manual dramas from Google Sheets
   */
  async fetchManualDramas() {
    try {
      console.log('[ManualContent] Fetching dramas from:', this.SHEETS_API_URL);
      const response = await fetch(`${this.SHEETS_API_URL}?action=dramas${this.getOriginParam()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ManualContent] Raw drama data:', data);

      if (!Array.isArray(data)) {
        console.error('[ManualContent] Expected array, got:', typeof data);
        return [];
      }

      const mappedData = data.map(drama => ({
        id: `manual_${drama.drama_id}`,
        title: drama.title,
        thumbnail: this.convertDriveImageUrl(drama.thumbnail_url),
        rating: drama.rating,
        year: drama.year,
        genre: drama.genre,
        synopsis: drama.description,
        totalEpisodes: drama.total_episodes,
        isManual: true
      }));

      console.log('[ManualContent] Mapped dramas:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('[ManualContent] Error fetching manual dramas:', error);
      return [];
    }
  },

  /**
   * Fetch episodes for manual drama
   */
  async fetchManualEpisodes(dramaId) {
    try {
      // Remove 'manual_' prefix
      const cleanId = dramaId.replace('manual_', '');
      const response = await fetch(`${this.SHEETS_API_URL}?action=episodes&drama_id=${cleanId}${this.getOriginParam()}`);
      const data = await response.json();

      return data.map(episode => ({
        id: episode.episode_id,
        episode: episode.episode_num,
        title: episode.title,
        description: episode.description,
        duration: episode.duration,
        playerUrl: episode.preview_url || episode.embed_url || episode.video_url,
        downloadUrl: episode.video_url,
        embedUrl: episode.embed_url,
        thumbnail: this.convertDriveImageUrl(episode.thumbnail_url)
      }));
    } catch (error) {
      console.error('Error fetching manual episodes:', error);
      return [];
    }
  },

  /**
   * Check if drama is manual content
   */
  isManualContent(dramaId) {
    return dramaId.startsWith('manual_');
  }
};

export default ManualContentAPI;