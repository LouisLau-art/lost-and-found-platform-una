// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable Nuxt 4 compatibility mode
  future: {
    compatibilityVersion: 4,
  },

  // Enable devtools
  devtools: { enabled: true },

  // Modules - @una-ui/nuxt includes UnoCSS and Color Mode
  modules: [
    '@una-ui/nuxt',
    'nuxt-auth-utils',
  ],

  // Una UI configuration
  una: {
    prefix: 'N', // All components will be prefixed with N, e.g. NButton
    themeable: true,
    global: true, // Register components globally
  },

  // Nitro configuration for server
  nitro: {
    experimental: {
      asyncContext: true,
    },
    // Serve uploads directory as static files
    publicAssets: [
      {
        dir: 'uploads',
        baseURL: '/uploads',
        maxAge: 60 * 60 * 24 * 7 // 7 days cache
      }
    ]
  },

  // Runtime config
  runtimeConfig: {
    // Database path
    dbPath: './lostandfound.db',
    // Auth secret (set via NUXT_SESSION_SECRET env var)
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  compatibilityDate: '2025-12-17',
})
