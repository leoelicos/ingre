import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/graphql': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'build',
    target: 'es2022'
  }
})
