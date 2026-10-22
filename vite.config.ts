import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Solo el armazón: precachear las fotos bajaba ~17 MB a cada visitante al entrar
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        // La landing de Bartemon es un sitio aparte: ni se precachea ni la responde la app
        globIgnores: ['bartemon157/**'],
        // Las fotos se guardan a medida que se ven (y se refrescan en segundo plano)
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'casona-fotos', expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 } },
          },
        ],
        navigateFallback: '/index.html',
        // Solo las rutas de la app React; el resto (/bartemon157/, páginas *.html nuevas) va a la red
        navigateFallbackAllowlist: [/^\/(\?.*)?$/, /^\/mesa-central/, /^\/mesadecontrol/, /^\/mesacentral/, /^\/carta/, /^\/emulen-pilates/],
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'MesaControl — La Casona San Martín',
        short_name: 'MesaControl',
        description: 'Sistema POS para restaurante',
        theme_color: '#f59e0b',
        background_color: '#fafaf9',
        display: 'standalone',
        start_url: '/mesa-central/',
        icons: [
          { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
