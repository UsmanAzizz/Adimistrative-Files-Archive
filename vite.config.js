import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file berdasarkan mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // PENTING: Base path agar aset diarahkan ke subfolder /dafa/ saat produksi
    base: mode === 'production' ? '/dafa/' : '/',

    plugins: [
      react(),
      VitePWA({
        // Strategi registrasi: otomatis update service worker
        registerType: 'autoUpdate',
        
        // Aset yang akan dimasukkan ke cache offline
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        
        manifest: {
          name: 'DAFA - Digital Archive',
          short_name: 'DAFA',
          description: 'Sistem Arsip Digital SMK Diponegoro Cipari',
          theme_color: '#10b981', // Emerald 500 favorit Mas
          background_color: '#ffffff',
          display: 'standalone',
          scope: mode === 'production' ? '/dafa/' : '/',
          start_url: mode === 'production' ? '/dafa/' : '/',
          icons: [
            {
              src: 'pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg'
            },
            {
              src: 'pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg'
            },
            {
              src: 'pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // Cache semua aset statis
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Membersihkan cache lama agar tidak memenuhi storage
          cleanupOutdatedCaches: true,
          // Runtime caching untuk API jika diperlukan (optional)
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst', // Coba ambil dari jaringan dulu untuk data dinamis
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 // 1 Hari
                }
              }
            }
          ]
        },
        // Agar PWA bisa didebug di mode development
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],

    server: {
      proxy: {
        // Proxy untuk menghindari CORS saat development
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Optimasi build
    build: {
      chunkSizeWarningLimit: 1600,
      outDir: 'dist',
    }
  }
})