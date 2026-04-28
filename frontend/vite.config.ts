import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_PAGES === "true" ? "/Danpamonnaie/" : "/",
  build: {
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove all console.* in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-plotly": ["plotly.js", "react-plotly.js"],
          "vendor-ui": ["rsuite", "lucide-react"],
          "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/modifiers"],
          "vendor-misc": ["axios", "gsap", "zustand"],
        },
      },
    },
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  server: {
    port: 5173,
    strictPort: true, // Fails if port is already in use
    watch: {
      usePolling: true,
      interval: 100, // Optional: how often to poll (ms)
    },
    proxy: {
      "/dinoapi": "http://localhost:8002",
      "/dinoauth": "http://localhost:8002",
    },
  },
});
