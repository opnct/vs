import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure the client bundle correctly picks up VITE_ prefixed variables
  envPrefix: 'VITE_',
  server: {
    host: true,
    strictPort: true,
    // Enable CORS to ensure cross-origin authentication headers are not stripped by proxies
    cors: true,
    // Allow dynamic hostnames from cloud environments (Codespaces, etc.)
    allowedHosts: true,
    hmr: {
      clientPort: 443
    },
    // Proxy API requests to the Python backend
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});