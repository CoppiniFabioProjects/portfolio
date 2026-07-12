import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site is served under /portfolio/
export default defineConfig({
  base: '/portfolio/',
  plugins: [react(), tailwindcss()],
})
