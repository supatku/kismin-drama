/**
 * Utility Functions
 * KISMIN Mode - Essential helpers only
 */

const Utils = {
    /**
     * Format duration from seconds to readable string
     * @param {number} seconds
     * @returns {string} e.g. "1h 30m" or "45m"
     */
    formatDuration(seconds) {
        if (!seconds) return '0m';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text
     * @param {number} maxLength
     * @returns {string}
     */
    truncate(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Simple debounce function
     * @param {Function} func
     * @param {number} delay
     * @returns {Function}
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Parse query string to object
     * @param {string} queryString
     * @returns {Object}
     */
    parseQuery(queryString = window.location.search) {
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Build query string from object
     * @param {Object} params
     * @returns {string}
     */
    buildQuery(params) {
        const query = new URLSearchParams(params);
        return query.toString();
    },

    /**
     * Show a simple toast notification
     * @param {string} message
     * @param {string} type - 'success', 'error', 'info'
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to body
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Format number with K/M suffix
     * @param {number} num
     * @returns {string}
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
};

// Make Utils available globally
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

export default Utils;
export const { showToast, formatDuration, truncate, escapeHtml, debounce, parseQuery, buildQuery, formatNumber } = Utils;
