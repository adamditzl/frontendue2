import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Backend-URL
        changeOrigin: true,
        secure: false, // Wenn das Backend kein HTTPS verwendet, setze dies auf false
        rewrite: (path) => path.replace(/^\/api/, '') // Optional: Entfernt /api aus der URL
      }
    }
  }
})
