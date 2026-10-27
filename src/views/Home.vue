<!-- =============================================================================
  Home.vue - 公开首页
  展示所有已发布的文章列表（无需登录）
  ============================================================================= -->

<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">📝 My blog</h1>
        <p class="hero-subtitle">Sharing Life, Emotional and Screat story</p>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="posts.length > 0" class="articles-grid">
        <article v-for="post in posts" :key="post.id" class="article-card">
          <div class="article-header">
            <div class="article-tags" v-if="post.tags && post.tags.length > 0">
              <span v-for="tag in post.tags" :key="tag.id" class="tag">
                {{ tag.name }}
              </span>
            </div>
          </div>

          <h2 class="article-title">
            <router-link :to="`/article/${post.id}`">{{ post.title }}</router-link>
          </h2>

          <p class="article-summary">{{ post.summary || 'No summary available' }}</p>

          <div class="article-footer">
            <div class="article-meta">
              <span class="author">✍️ {{ post.author_name || 'writer' }}</span>
              <span class="date">📅 {{ formatDate(post.created_at) }}</span>
              <span class="views">👁️ {{ post.view_count }} views</span>
            </div>
            <router-link :to="`/article/${post.id}`" class="read-more">
              Read More →
            </router-link>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>📭 No posts yet</p>
        <p class="empty-hint">Writer can log in to publish post.</p>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} / {{ pagination.totalPages }} 
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2026 My Blog | Built with love by lover</p>
      <p>
        <router-link to="/login" class="admin-link">Writer login</router-link>
      </p>
    </footer>
  </div>
</template>

<script setup>
/**
 * 公开首页组件
 * 功能：
 * 1. 显示所有已发布的文章
 * 2. 无需登录即可访问
 * 3. 支持分页浏览
 */

import { ref, onMounted } from 'vue'
import { getPosts } from '../api'

// ---------------------------------------------------------------------------
// 响应式数据
// ---------------------------------------------------------------------------

/** 文章列表 */
const posts = ref([])

/** 加载状态 */
const loading = ref(false)

/** 分页信息 */
const pagination = ref({
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0
})

// ---------------------------------------------------------------------------
// 生命周期钩子
// ---------------------------------------------------------------------------

onMounted(async () => {
  await loadPosts()
})

// ---------------------------------------------------------------------------
// 数据加载函数
// ---------------------------------------------------------------------------

/**
 * 加载已发布的文章列表
 */
async function loadPosts() {
  loading.value = true

  try {
    const response = await getPosts({
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: 'published'  // 只获取已发布的文章
    })

    if (response.success) {
      posts.value = response.data.posts
      pagination.value = {
        ...pagination.value,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// 操作函数
// ---------------------------------------------------------------------------

/**
 * 切换页码
 */
function changePage(page) {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadPosts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 格式化日期
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* 页面头部英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.9;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 文章网格布局 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* 文章卡片 */
.article-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.article-header {
  margin-bottom: 16px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-title a {
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: var(--primary-color);
}

.article-summary {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 20px;
  flex: 1;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.read-more {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
  transition: color 0.3s ease;
}

.read-more:hover {
  color: var(--primary-dark);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background-color: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-light);
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 40px 20px;
  margin-top: 60px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
}

.admin-link {
  color: var(--primary-color);
  margin-top: 8px;
  display: inline-block;
}

.admin-link:hover {
  color: var(--primary-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
