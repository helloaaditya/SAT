import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // Handle proxy errors silently
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Proxy request handling
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Proxy response handling
          });
        },
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://sattawala.onrender.com' 
        : 'http://localhost:5000'
    )
  }
})