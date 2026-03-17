import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  publicDir: '../public',
  server: {
    open: true,
  },
  build: {
    outDir: '../dist',
  },
})
