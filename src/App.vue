<!-- =============================================================================
  App.vue - 应用根组件
  包含导航栏和路由视图
  ============================================================================= -->

<template>
  <div id="app">
    <!-- 导航栏：仅在登录状态且非公开页面时显示 -->
    <nav class="navbar" v-if="isLoggedIn && !isPublicPage">
      <div class="navbar-brand">
        <router-link to="/dashboard">📝 Blog Manager</router-link>
      </div>
      <div class="navbar-menu">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/posts" class="nav-link">Posts</router-link>
        <router-link to="/" class="nav-link">View Blog</router-link>
        <span class="username">{{ username }}</span>
        <button @click="logout" class="btn btn-secondary">Log <output></output></button>
      </div>
    </nav>

    <!-- 路由视图：显示当前路由对应的组件 -->
    <main class="main-content" :class="{ 'public-page': isPublicPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * 应用根组件
 * 负责：
 * 1. 显示全局导航栏
 * 2. 管理用户登录状态
 * 3. 提供路由视图容器
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

/**
 * 计算属性：检查用户是否已登录
 * 通过检查本地存储中是否存在 token 来判断
 */
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

/**
 * 计算属性：检查当前是否为公开页面
 * 公开页面包括：首页、文章详情页
 */
const isPublicPage = computed(() => {
  return route.meta.isPublic === true
})

/**
 * 计算属性：获取当前登录用户名
 * 从本地存储中解析用户信息
 */
const username = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.username
    } catch (e) {
      return 'User'
    }
  }
  return 'User'
})

/**
 * 退出登录函数
 * 清除本地存储的认证信息，跳转到登录页
 */
function logout() {
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // 跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
/* 导航链接样式 */
.nav-link {
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: var(--bg-secondary);
}

.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}

/* 用户名显示 */
.username {
  padding: 8px 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 公开页面：移除容器限制 */
.main-content.public-page {
  max-width: none;
  padding: 0;
}
</style>
