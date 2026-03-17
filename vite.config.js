import { defineConfig } from 'vite'

export default defineConfig({
  base: "/video-depth-visualizer/",
  root: './src',
  publicDir: '../public',
  server: {
    open: true,
  },
  build: {
    outDir: '../dist',
  },
})
