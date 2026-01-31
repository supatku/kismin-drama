/**
 * API Client
 * KISMIN Mode - Mock data for MVP, easy to swap to real API later
 */

import CONFIG from './config.js';

// Mock Data for MVP
const MOCK_DRAMAS = [
    {
        id: 1,
        title: 'Love in the Moonlight',
        synopsis: 'A romantic drama set in historical Korea about a crown prince and a woman disguised as a eunuch.',
        thumbnail: 'https://picsum.photos/seed/drama1/300/400',
        rating: 8.5,
        year: 2016,
        episodes: 18,
        genre: ['Romance', 'Historical', 'Comedy']
    },
    {
        id: 2,
        title: 'The Glory',
        synopsis: 'A woman seeks revenge on her childhood bullies after years of suffering.',
        thumbnail: 'https://picsum.photos/seed/drama2/300/400',
        rating: 9.0,
        year: 2022,
        episodes: 16,
        genre: ['Thriller', 'Drama', 'Revenge']
    },
    {
        id: 3,
        title: 'Weightlifting Fairy',
        synopsis: 'A coming-of-age story about a weightlifter and a swimmer pursuing their dreams.',
        thumbnail: 'https://picsum.photos/seed/drama3/300/400',
        rating: 8.7,
        year: 2016,
        episodes: 16,
        genre: ['Romance', 'Sports', 'Youth']
    },
    {
        id: 4,
        title: 'Crash Landing on You',
        synopsis: 'An heiress accidentally paraglides into North Korea and falls in love with an army officer.',
        thumbnail: 'https://picsum.photos/seed/drama4/300/400',
        rating: 9.2,
        year: 2019,
        episodes: 16,
        genre: ['Romance', 'Drama', 'Comedy']
    },
    {
        id: 5,
        title: 'Goblin',
        synopsis: 'An immortal goblin seeks his human bride to end his cursed existence.',
        thumbnail: 'https://picsum.photos/seed/drama5/300/400',
        rating: 8.9,
        year: 2016,
        episodes: 16,
        genre: ['Fantasy', 'Romance', 'Drama']
    },
    {
        id: 6,
        title: 'My Mister',
        synopsis: 'A heartwarming story about healing and finding hope in difficult times.',
        thumbnail: 'https://picsum.photos/seed/drama6/300/400',
        rating: 9.1,
        year: 2018,
        episodes: 16,
        genre: ['Drama', 'Slice of Life']
    }
];

const API = {
    /**
     * Get trending dramas
     * @returns {Promise<Array>}
     */
    async getTrending() {
        if (CONFIG.USE_MOCK_DATA) {
            // Simulate network delay
            await this._delay(500);
            return MOCK_DRAMAS;
        }

        // Real API implementation (when ready)
        return this._fetch('/trending');
    },

    /**
     * Get drama detail by ID
     * @param {number} dramaId
     * @returns {Promise<Object>}
     */
    async getDetail(dramaId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this._delay(300);
            const drama = MOCK_DRAMAS.find(d => d.id === parseInt(dramaId));
            if (!drama) throw new Error('Drama not found');
            return drama;
        }

        return this._fetch(`/drama/${dramaId}`);
    },

    /**
     * Get episodes for a drama
     * @param {number} dramaId
     * @returns {Promise<Array>}
     */
    async getEpisodes(dramaId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this._delay(300);
            const drama = MOCK_DRAMAS.find(d => d.id === parseInt(dramaId));
            if (!drama) throw new Error('Drama not found');

            // Generate mock episodes
            const episodes = [];
            for (let i = 1; i <= drama.episodes; i++) {
                episodes.push({
                    id: `${dramaId}-${i}`,
                    dramaId: dramaId,
                    number: i,
                    title: `Episode ${i}`,
                    thumbnail: `https://picsum.photos/seed/ep${dramaId}${i}/400/225`,
                    duration: 3600, // 60 minutes in seconds
                    // Using Big Buck Bunny as demo video (HLS stream)
                    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                });
            }
            return episodes;
        }

        return this._fetch(`/drama/${dramaId}/episodes`);
    },

    /**
     * Get stream URL for an episode
     * @param {string} episodeId
     * @returns {Promise<string>}
     */
    async getStreamUrl(episodeId) {
        if (CONFIG.USE_MOCK_DATA) {
            await this._delay(200);
            // Return demo HLS stream
            return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        }

        const response = await this._fetch(`/episode/${episodeId}/stream`);
        return response.streamUrl;
    },

    /**
     * Internal fetch wrapper
     * @private
     */
    async _fetch(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: CONFIG.API_TIMEOUT
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            throw error;
        }
    },

    /**
     * Simulate network delay
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Make API available globally
if (typeof window !== 'undefined') {
    window.API = API;
}

export default API;
