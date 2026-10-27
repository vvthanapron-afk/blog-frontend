<!-- =============================================================================
  Login.vue - 登录页面
  管理员登录表单，验证成功后跳转到仪表盘
  ============================================================================= -->

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">📝 My Blog</h1>
      <p class="login-subtitle">Writer Login</p>

      <!-- 错误消息提示 -->
      <div v-if="errorMessage" class="message message-error">
        {{ errorMessage }}
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名输入框 -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
            autocomplete="username"
          />
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your Password"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="!loading">Log in</span>
          <span v-else>logging in...</span>
        </button>
      </form>

      
      
    </div>
  </div>
</template>

<script setup>
/**
 * 登录页面组件
 * 功能：
 * 1. 显示登录表单
 * 2. 验证用户输入
 * 3. 调用登录 API
 * 4. 保存认证信息到本地存储
 * 5. 跳转到目标页面
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../api'

const router = useRouter()
const route = useRoute()

// ---------------------------------------------------------------------------
// 响应式数据
// ---------------------------------------------------------------------------

/** 表单数据 */
const form = reactive({
  username: '',
  password: ''
})

/** 加载状态 */
const loading = ref(false)

/** 错误消息 */
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// 登录处理函数
// ---------------------------------------------------------------------------

/**
 * 处理登录表单提交
 * 1. 验证输入
 * 2. 调用登录 API
 * 3. 保存 token 和用户信息
 * 4. 跳转到目标页面
 */
async function handleLogin() {
  // 清除之前的错误消息
  errorMessage.value = ''

  // 前端验证：检查输入是否为空
  if (!form.username || !form.password) {
    errorMessage.value = 'Username & Password are required'
    return
  }

  // 设置加载状态
  loading.value = true

  try {
    // 调用登录 API
    const response = await login(form.username, form.password)

    if (response.success) {
      // 登录成功，保存 token 和用户信息到本地存储
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // 显示成功消息
      errorMessage.value = ''

      // 跳转到目标页面（如果有）或仪表盘
      const redirectPath = route.query.redirect || '/dashboard'
      router.push(redirectPath)
    } else {
      // 登录失败，显示错误消息
      errorMessage.value = response.message || 'Login failed'
    }
  } catch (error) {
    // 捕获异常，显示错误消息
    errorMessage.value = error.response?.data?.message || '登录失败，请稍后重试'
  } finally {
    // 无论成功或失败，都重置加载状态
    loading.value = false
  }
}
</script>

<style scoped>
/* 登录页面容器：全屏居中布局 */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #d0c4dc 100%);
  padding: 20px;
}

/* 登录框样式 */
.login-box {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

/* 登录标题 */
.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* 登录副标题 */
.login-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 全宽按钮 */
.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 8px;
}

/* 默认账号提示 */
.default-account {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.default-account p {
  margin: 4px 0;
}

.default-account code {
  background-color: white;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--primary-dark);
  font-family: 'Courier New', monospace;
}
</style>
