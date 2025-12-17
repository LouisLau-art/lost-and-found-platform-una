import { defaultConfig } from '@una-ui/nuxt/una.config'

export default defaultConfig({
    /**
     * UnoCSS Configuration Options
     * Extending the default Una UI configuration
     */

    // Include icon presets
    presets: [],

    shortcuts: [
        /**
         * Static Shortcuts for custom utilities
         */
        {
            // Keep font configurations
            'font-sans': 'font-[Inter]',
            'font-mono': 'font-[DM_Mono]',
        },
    ],
})
