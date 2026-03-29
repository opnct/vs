import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL FOR ELECTRON: Ensures all assets are loaded via relative file:// paths
  base: './',
  clearScreen: false,
  server: {
    port: 5173, // Aligned with package.json "wait-on tcp:5173" command
    strictPort: true,
    host: true, // Required for GitHub Codespaces
  },
  build: {
    // Defines where the static files will be exported for electron-builder to package
    outDir: 'dist',
    emptyOutDir: true,
  }
});