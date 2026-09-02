import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The Python-error translator (pythonErrorMessages.mjs) is shared verbatim
      // with the server. It is authored as ESM, so the client imports it natively
      // here while the CommonJS server loads the very same file through Node's
      // require(ESM). One file, one set of rules, so the Thai message a learner
      // sees in the browser is identical to the one the server grader produces -
      // the whole reason there is a single translator at all.
      '@shared': fileURLToPath(new URL('../server', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    // Cross-origin isolation. This is what turns on SharedArrayBuffer, which the
    // Python worker needs to (a) interrupt an infinite loop and (b) make input()
    // block. COEP is `credentialless` rather than `require-corp` on purpose: the
    // app still pulls a few cross-origin subresources (Google Fonts) that do not
    // send CORP headers, and credentialless lets those load (without credentials,
    // which is fine for public assets) while still enabling isolation. Pyodide is
    // self-hosted, so the heavy same-origin assets are unaffected either way.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    // The shared module above lives in ../server, outside this Vite root, so the
    // dev server has to be allowed to read one level up to serve it.
    fs: { allow: ['..'] },
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
