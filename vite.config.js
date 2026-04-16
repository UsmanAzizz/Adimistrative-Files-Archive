import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file berdasarkan mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // PENTING: Tambahkan base path agar aset (js/css) diarahkan ke /dafa/
    base: mode === 'production' ? '/dafa/' : '/',
    
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})