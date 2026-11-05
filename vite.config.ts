import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: { chunkSizeWarningLimit: 1200 }, // three.js lazy chunk is inherently ~1.1MB
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Atlas Anatómico 3D',
        short_name: 'Anatomía3D',
        description: 'Atlas anatómico 3D interactivo, detallado y realista',
        theme_color: '#0b1026',
        background_color: '#0b1026',
        display: 'standalone'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,webp,glb,gltf,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [{ urlPattern: /\.glb$/, handler: 'CacheFirst', options: { cacheName: 'models', expiration: { maxEntries: 8 }, cacheableResponse: { statuses: [0, 200] } } }]
      }
    })
  ],
})
