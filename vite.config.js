// vite.config.js (en la raíz de tu repositorio)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist' // Esto ya está bien, construirá en [repo_root]/dist
    },
    root: 'src/front' // <--- ¡Añade o modifica esta línea!
                      // Le dice a Vite que el código fuente de tu app está aquí
})