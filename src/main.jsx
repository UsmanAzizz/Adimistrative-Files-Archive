import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import fungsi registrasi PWA
import { registerSW } from 'virtual:pwa-register'

// Registrasi Service Worker untuk auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Aplikasi diperbarui. Muat ulang sekarang?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('DAFA siap digunakan secara offline!');
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)