import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    strictPort:true,
    allowedHosts: [
      'unmorphological-anh-interrogatingly.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok-free.dev'
    ],
    hmr: {
        clientPort: 443, // Forces HMR to use SSL port through ngrok
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
