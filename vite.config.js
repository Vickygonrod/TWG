import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    root: './', 
    publicDir: 'public', 
    build: {
        outDir: 'dist',
    },
    css: {
        postcss: './postcss.config.js',
    }
});
