import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Performance: Enable chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gsap': ['gsap'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
    // Performance: Inline small assets
    assetsInlineLimit: 4096,
    // Performance: Enable CSS code splitting
    cssCodeSplit: true,
    // Performance: Minification settings
    minify: 'esbuild',
    target: 'esnext',
  },
  // Performance: Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'gsap', 'lucide-react'],
  },
})

