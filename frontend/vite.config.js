import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento o Vite repassa ao back Flask:
//  - /api/...    as rotas do sistema em modo JSON (backend/app/api.py)
//  - /static/... CSS, imagens e arquivos que os templates já usavam
const BACKEND = process.env.BACKEND_URL || 'http://localhost:8001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: false },
      '/static': { target: BACKEND, changeOrigin: false },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
