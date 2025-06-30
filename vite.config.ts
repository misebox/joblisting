import { defineConfig } from 'vite';
import honox from 'honox/vite';

export default defineConfig({
  plugins: [honox({ appDirectory: './src/web' })],
  server: {
    port: 8787,
    host: '0.0.0.0',
  },
});