import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 子目录部署：资源使用相对路径，避免 /assets/... 解析到站点根
  base: './',
})
