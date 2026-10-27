// =============================================================================
// API 请求封装模块
// 使用 axios 统一管理所有后端 API 请求
// =============================================================================

import axios from 'axios'

// ---------------------------------------------------------------------------
// 创建 axios 实例
// 配置基础 URL 和默认选项
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: '/api',                    // 所有请求的基础路径
  timeout: 10000,                     // 请求超时时间（10秒）
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------------------------------------------------------------------
// 请求拦截器
// 在每个请求发送前自动添加认证 token
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token')

    // 如果有 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // 请求错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// ---------------------------------------------------------------------------
// 响应拦截器
// 统一处理响应错误（如 token 过期）
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // 成功响应，直接返回数据
    return response.data
  },
  (error) => {
    // 响应错误处理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权：token 过期或无效
          console.error('认证失败，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          // 禁止访问
          console.error('没有权限访问')
          break
        case 404:
          // 资源不存在
          console.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          console.error('服务器错误')
          break
        default:
          console.error('请求失败:', data.message || '未知错误')
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

// =============================================================================
// 认证相关 API
// =============================================================================

/**
 * 管理员登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 登录响应
 */
export function login(username, password) {
  return api.post('/auth/login', { username, password })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 用户信息
 */
export function getCurrentUser() {
  return api.get('/auth/me')
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise} 修改结果
 */
export function changePassword(oldPassword, newPassword) {
  return api.post('/auth/change-password', { oldPassword, newPassword })
}

// =============================================================================
// 文章相关 API
// =============================================================================

/**
 * 获取文章列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.status - 状态筛选
 * @returns {Promise} 文章列表
 */
export function getPosts(params = {}) {
  return api.get('/posts', { params })
}

/**
 * 获取单篇文章详情
 * @param {number} id - 文章 ID
 * @returns {Promise} 文章详情
 */
export function getPost(id) {
  return api.get(`/posts/${id}`)
}

/**
 * 创建新文章
 * @param {object} data - 文章数据
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {string} data.summary - 摘要
 * @param {string} data.status - 状态
 * @param {Array} data.tags - 标签数组
 * @returns {Promise} 创建结果
 */
export function createPost(data) {
  return api.post('/posts', data)
}

/**
 * 更新文章
 * @param {number} id - 文章 ID
 * @param {object} data - 文章数据
 * @returns {Promise} 更新结果
 */
export function updatePost(id, data) {
  return api.put(`/posts/${id}`, data)
}

/**
 * 删除文章
 * @param {number} id - 文章 ID
 * @returns {Promise} 删除结果
 */
export function deletePost(id) {
  return api.delete(`/posts/${id}`)
}

/**
 * 获取所有标签
 * @returns {Promise} 标签列表
 */
export function getTags() {
  return api.get('/posts/tags/all')
}

// 导出 API 实例
export default api
