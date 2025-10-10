import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    global: "globalThis", // 👈 critical line
  },
  resolve: {
    alias: {
     "@/*": ["*"],
     '@starknet-io/starknet-types-08': path.resolve(__dirname, 'src/starknet-types-08.js'),
     buffer: "buffer",
     process: "process/browser",
    },
  },
  optimizeDeps: {
    exclude: ['@starknet-io/starknet-types-08'], // skip prebundling
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api-testnet4.secretkeylabs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
