// vite.config.js (en la raíz de tu repositorio)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // <--- Añade esta línea para importar el módulo 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    root: 'src/front', // ¡Esta línea es correcta y se mantiene!
    build: {
        outDir: 'dist', // Esto ya está bien
        rollupOptions: {
            // <--- Añade estas líneas
            input: path.resolve(__dirname, 'src/front/public/index.html')
        }
    }
})