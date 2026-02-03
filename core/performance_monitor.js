/**
 * Performance Monitor
 * Track Core Web Vitals and performance metrics
 */

const PerformanceMonitor = {
    metrics: {},

    /**
     * Initialize performance monitoring
     */
    init() {
        if (typeof window === 'undefined') return;

        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.observeTTI();
        this.trackNavigation();
        this.trackNetwork();

        console.log('[Performance] Monitoring initialized');
    },

    /**
     * Observe Largest Contentful Paint (LCP)
     */
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
                this.logMetric('LCP', this.metrics.lcp, 2500, 4000);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('[Performance] LCP observation not supported');
        }
    },

    /**
     * Observe First Input Delay (FID)
     */
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    this.logMetric('FID', this.metrics.fid, 100, 300);
                });
            });
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('[Performance] FID observation not supported');
        }
    },

    /**
     * Observe Cumulative Layout Shift (CLS)
     */
    observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.cls = clsValue;
                        this.logMetric('CLS', this.metrics.cls, 0.1, 0.25);
                    }
                });
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('[Performance] CLS observation not supported');
        }
    },

    /**
     * Estimate Time to Interactive (TTI)
     */
    observeTTI() {
        if (document.readyState === 'complete') {
            this.calculateTTI();
        } else {
            window.addEventListener('load', () => this.calculateTTI());
        }
    },

    calculateTTI() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            this.metrics.tti = navTiming.domInteractive;
            this.logMetric('TTI', this.metrics.tti, 3500, 5000);
        }
    },

    /**
     * Track navigation timing
     */
    trackNavigation() {
        window.addEventListener('load', () => {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                this.metrics.dns = navTiming.domainLookupEnd - navTiming.domainLookupStart;
                this.metrics.tcp = navTiming.connectEnd - navTiming.connectStart;
                this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
                this.metrics.download = navTiming.responseEnd - navTiming.responseStart;
                this.metrics.domLoad = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart;
                this.metrics.windowLoad = navTiming.loadEventEnd - navTiming.loadEventStart;

                console.log('[Performance] Navigation Timing:', {
                    'DNS Lookup': `${this.metrics.dns.toFixed(2)}ms`,
                    'TCP Connection': `${this.metrics.tcp.toFixed(2)}ms`,
                    'TTFB': `${this.metrics.ttfb.toFixed(2)}ms`,
                    'Download': `${this.metrics.download.toFixed(2)}ms`,
                    'DOM Load': `${this.metrics.domLoad.toFixed(2)}ms`,
                    'Window Load': `${this.metrics.windowLoad.toFixed(2)}ms`
                });
            }
        });
    },

    /**
     * Track network information
     */
    trackNetwork() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.network = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };

            console.log('[Performance] Network:', this.metrics.network);

            // Listen for network changes
            connection.addEventListener('change', () => {
                console.log('[Performance] Network changed:', {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt
                });
            });
        }
    },

    /**
     * Log metric with color coding
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @param {number} good - Good threshold
     * @param {number} poor - Poor threshold
     */
    logMetric(name, value, good, poor) {
        const color = value <= good ? '🟢' : value <= poor ? '🟡' : '🔴';
        const unit = name === 'CLS' ? '' : 'ms';
        console.log(`[Performance] ${color} ${name}: ${value.toFixed(2)}${unit}`);
    },

    /**
     * Get all metrics
     * @returns {Object} All tracked metrics
     */
    getMetrics() {
        return this.metrics;
    },

    /**
     * Mark custom timing
     * @param {string} name - Mark name
     */
    mark(name) {
        if (performance.mark) {
            performance.mark(name);
            console.log(`[Performance] Mark: ${name}`);
        }
    },

    /**
     * Measure between two marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     */
    measure(name, startMark, endMark) {
        if (performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
                return measure.duration;
            } catch (e) {
                console.warn(`[Performance] Cannot measure ${name}:`, e);
            }
        }
    }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
    } else {
        PerformanceMonitor.init();
    }
    window.PerformanceMonitor = PerformanceMonitor;
}

export default PerformanceMonitor;
