// vite.config.js (en la raíz de tu repositorio)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // Asegúrate de que esta línea esté presente

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    // Le dice a Vite dónde está la raíz de tu código fuente de la aplicación (src/front)
    root: 'src/front', 

    // Le dice a Vite dónde encontrar tus archivos estáticos (como index.html)
    // Es relativo a donde se ejecuta el comando (la raíz del repo)
    publicDir: '../public', // <--- ¡Asegúrate de que esta línea esté así!

    build: {
        outDir: 'dist', // Esto construirá en la carpeta 'dist' en la raíz del repo
        rollupOptions: {
            // Le dice a Rollup/Vite dónde está el punto de entrada HTML
            input: path.resolve(__dirname, 'public/index.html') // <--- ¡Y esta línea también!
        }
    }
});