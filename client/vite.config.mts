import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Exposes Vite's mode as a typed compile-time constant (see src/appMode.ts).
  define: {
    __APP_MODE__: JSON.stringify(mode),
    // optional API URL override, e.g. the e2e server (see automation/)
    __GRAPHQL_URL__: JSON.stringify(process.env['VITE_GRAPHQL_URL'] ?? '')
  },
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
}))
