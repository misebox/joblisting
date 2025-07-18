import { defineConfig } from 'vite'
import honox from 'honox/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [honox({
    client: {
      input: ['./app/client.tsx']
    }
  })],
  resolve: {
    alias: {
      '@': resolve('./app'),
    },
  },
  server: {
    port: 8787,
    host: '0.0.0.0',
    hmr: {
      host: '0.0.0.0',
      port: 8788,
    }
  },
})
