import { defineConfig } from 'vite'
import honox from 'honox/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [honox({
    root: './src/app'
  })],
  resolve: {
    alias: {
      '@': resolve('./src'),
    },
  },
  server: {
    port: 8787,
    host: '0.0.0.0',
  },
})