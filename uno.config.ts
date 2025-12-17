import {
    defineConfig,
    presetIcons,
    presetTypography,
    presetWebFonts,
} from 'unocss'
import { defaultConfig } from '@una-ui/nuxt/una.config'

export default defaultConfig({
    presets: [
        presetIcons({
            scale: 1.2,
            cdn: 'https://esm.sh/',
        }),
        presetTypography(),
        presetWebFonts({
            fonts: {
                sans: 'Inter',
                mono: 'DM Mono',
            },
        }),
    ],
    // Transformers are already included in defaultConfig
})
