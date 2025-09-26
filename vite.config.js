import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Ya no necesitamos 'path'
// import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // <--- ¡IMPORTANTE! La raíz de Vite es la raíz del repositorio
  root: './',

  // <--- IMPORTANTE! publicDir es simplemente 'public' porque es relativo a la raíz
  publicDir: 'public',

  build: {
    outDir: 'dist', // Esto construirá en la carpeta 'dist' en la raíz del repo
    // <--- ¡IMPORTANTE! Eliminamos rollupOptions.input
    // Vite automáticamente encontrará 'public/index.html' debido a publicDir
    // y el script type="module" dentro de él.
  }
});