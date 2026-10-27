// =============================================================================
// Vue Router 路由配置
// 定义应用的页面路由和导航守卫
// =============================================================================

import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import ArticleView from '../views/ArticleView.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import PostList from '../views/PostList.vue'
import PostEditor from '../views/PostEditor.vue'

// ---------------------------------------------------------------------------
// 路由配置数组
// 每个路由对象包含：路径、组件、元信息（是否需要认证等）
// ---------------------------------------------------------------------------
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, isPublic: true }  // 公开首页
  },
  {
    path: '/article/:id',
    name: 'ArticleView',
    component: ArticleView,
    meta: { requiresAuth: false, isPublic: true }  // 公开文章详情
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts',
    name: 'PostList',
    component: PostList,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/new',
    name: 'PostNew',
    component: PostEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/edit/:id',
    name: 'PostEdit',
    component: PostEditor,
    meta: { requiresAuth: true }
  }
]

// ---------------------------------------------------------------------------
// 创建路由实例
// ---------------------------------------------------------------------------
const router = createRouter({
  history: createWebHistory(),  // 使用 HTML5 History 模式
  routes
})

// ---------------------------------------------------------------------------
// 全局前置守卫
// 在每次路由切换前执行，用于检查认证状态
// ---------------------------------------------------------------------------
router.beforeEach((to, from, next) => {
  // 获取本地存储的 token
  const token = localStorage.getItem('token')

  // 检查目标路由是否需要认证
  if (to.meta.requiresAuth) {
    // 需要认证但没有 token，跳转到登录页
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }  // 保存目标路径，登录后跳转回去
      })
    } else {
      // 有 token，允许访问
      next()
    }
  } else {
    // 不需要认证，直接访问
    next()
  }
})

// 导出路由实例
export default router
