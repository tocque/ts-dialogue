import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  server: {
    proxy: {
      '/fs': {
        target: 'http://localhost:8217/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/fs/, '')
      }
    }
  },
  resolve: {
    alias: {
        "@": path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.json', '.ts', '.tsx']
  }
})

