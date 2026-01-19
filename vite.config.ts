import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'leaflet': ['leaflet']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
