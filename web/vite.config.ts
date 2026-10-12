import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the backend so the browser sees one origin (no CORS needed in dev).
    proxy: {
      '/api': 'http://localhost:3000',
      '/r': 'http://localhost:3000',
    },
  },
})
