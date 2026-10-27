// =============================================================================
// Vue 应用主入口文件 
// 创建并挂载 Vue 应用实例
// =============================================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/style.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 状态管理实例
const pinia = createPinia()

// 注册插件
app.use(pinia)      // 使用 Pinia 进行状态管理
app.use(router)     // 使用 Vue Router 进行路由管理

// 挂载应用到 DOM
app.mount('#app')
