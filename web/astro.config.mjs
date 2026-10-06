import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://cortiglow.com', // URL base del sitio para SEO
  integrations: [react(), tailwind()],
  output: 'static',
  prefetch: true,
  image: {
    domains: ['via.placeholder.com'],
  },
  // Optimizaciones de desarrollo - Hot Reload mejorado
  vite: {
    server: {
      watch: {
        usePolling: false, // Usa sistema de archivos nativo (más rápido)
        interval: 100,
      },
      hmr: {
        overlay: true, // Muestra errores en pantalla
      },
    },
    optimizeDeps: {
      exclude: ['@astrojs/react'], // Evita re-bundling innecesario
    },
  },
});
