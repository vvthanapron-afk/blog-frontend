// =============================================================================
// Vite 配置文件
// 配置开发服务器和代理
// =============================================================================

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 使用 Vue 插件
  plugins: [vue()],

  // 开发服务器配置
  server: {
    port: 5173,           // 前端开发服务器端口
    open: true,           // 自动打开浏览器
    proxy: {
      // 配置后端 API 代理
      // 将 /api 开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:3000',  // 后端服务器地址
        changeOrigin: true,                // 修改请求头中的 origin
        secure: false                      // 不验证 SSL 证书
      }
    }
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': '/src'  // 设置 @ 指向 src 目录，方便导入
    }
  }
})
