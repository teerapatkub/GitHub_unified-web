import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // In production the API server also serves this bundle, so every request
    // the app makes is same-origin and relative. These proxies are what make
    // that same relative path work in development, where the two really are
    // separate processes - so the code has one shape, not two.
    //
    // /uploads matters as much as /api: profile pictures, lesson media and
    // cosmetic assets are served from there, and they stopped resolving the
    // moment their URLs became relative.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
