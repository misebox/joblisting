import { defineConfig } from 'vite'
import honox from 'honox/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [honox()],
  resolve: {
    alias: {
      '@': resolve('./app'),
    },
  },
  server: {
    port: 8787,
    host: '0.0.0.0',
  },
})
