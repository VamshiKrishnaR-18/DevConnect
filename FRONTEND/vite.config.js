import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // 1. Add this "test" object for Vitest
  test: {
    globals: true,           // Allows us to use describe, it, expect without importing
    environment: 'jsdom',    // Simulates a browser (window, document) in Node
    setupFiles: './src/setupTests.js', // Runs before each test file
    css: true,               // Processes CSS modules
  },
});