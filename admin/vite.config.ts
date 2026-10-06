import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Si el puerto está ocupado, usa otro automáticamente
    host: true, // Permite acceso desde red local
    open: false, // No abre navegador automáticamente
    hmr: {
      overlay: true, // Muestra errores en pantalla
    },
    watch: {
      usePolling: false, // Usa sistema de archivos nativo (más rápido)
      interval: 100,
    },
  },
  // Optimizaciones
  build: {
    sourcemap: true, // Facilita debugging
  },
  // Cache optimizado
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
