import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      // pythonErrorMessages.js stays CommonJS because the server requires it as
      // one. Dev (esbuild) reads its module.exports fine, but the production
      // build (Rollup) does not synthesize named exports from a CJS file unless
      // its commonjs transform runs on it - and by default that transform only
      // touches node_modules, not this one shared source file outside the root.
      include: [/node_modules/, /pythonErrorMessages\.js$/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      // The Python-error translator (pythonErrorMessages.js) is shared verbatim
      // with the server, which requires it as CommonJS. One file, one set of
      // rules, so the Thai message a learner sees in the browser is identical to
      // the one the server grader produces - the whole reason there is a single
      // translator at all. Vite/esbuild transforms its module.exports on import.
      '@shared': fileURLToPath(new URL('../server', import.meta.url)),
    },
  },
  server: {
    port: 5174,
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
