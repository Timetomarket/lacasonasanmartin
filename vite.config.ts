import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,woff2}'],
        // La landing de Bartemon es un sitio aparte: ni se precachea ni la responde la app
        globIgnores: ['bartemon157/**'],
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
