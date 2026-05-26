import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ["**/node_modules/**", "**/.git/**"],
    },

    hmr: {
      overlay: true,
      clientPort: 5173,
    },

    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/api/apiClient.ts",
        "./src/store/useAuthStore.ts",
      ],
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "zustand",
      "react-toastify",
      "lucide-react",
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});