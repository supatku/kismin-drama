/**
 * Adsterra Banner Ad Component
 * 320x50 banner for drama.veoprompt.site
 */

const AdsterraBanner = {
    /**
     * Create banner ad HTML
     */
    createBanner() {
        return `
            <div class="adsterra-banner" style="text-align: center; margin: var(--spacing-md) 0; padding: var(--spacing-sm);">
                <script>
                    atOptions = {
                        'key' : '324b5e2dc7a78cb3fdff1672639aeb96',
                        'format' : 'iframe',
                        'height' : 50,
                        'width' : 320,
                        'params' : {}
                    };
                    document.write('<scr' + 'ipt type="text/javascript" src="https://pl28620764.effectivegatecpm.com/324b5e2dc7a78cb3fdff1672639aeb96/invoke.js"></scr' + 'ipt>');
                </script>
            </div>
        `;
    },

    /**
     * Insert banner into element
     */
    insertBanner(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = this.createBanner();
        }
    }
};

export default AdsterraBanner;