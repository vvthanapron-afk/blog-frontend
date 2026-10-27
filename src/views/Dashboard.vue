<!-- =============================================================================
  Dashboard.vue - 仪表盘页面
  显示系统概览信息和统计数据
  ============================================================================= -->

<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <!-- 文章总数卡片 -->
      <div class="stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPosts }}</div>
          <div class="stat-label">Total Post</div>
        </div>
      </div>

      <!-- 已发布文章卡片 -->
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.publishedPosts }}</div>
          <div class="stat-label">Published</div>
        </div>
      </div>

      <!-- 草稿文章卡片 -->
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.draftPosts }}</div>
          <div class="stat-label">Draft</div>
        </div>
      </div>

      <!-- 总浏览次数卡片 -->
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalViews }}</div>
          <div class="stat-label">Total views</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Recent Post</h2>
      </div>
      <div class="quick-actions">
        <router-link to="/posts/new" class="action-btn">
          <span class="action-icon">✏️</span>
          <span>Write your new posts!!</span>
        </router-link>
        <router-link to="/posts" class="action-btn">
          <span class="action-icon">📋</span>
          <span>Manage Post</span>
        </router-link>
      </div>
    </div>

    <!-- 最近文章区域 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Recent Post</h2>
        <router-link to="/posts" class="view-all">View all→</router-link>
      </div>
      <div v-if="recentPosts.length === 0" class="empty-state">
        <p>No post yet</p>
      </div>
      <div v-else class="recent-posts">
        <div v-for="post in recentPosts" :key="post.id" class="recent-post-item">
          <div class="post-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span class="tag tag-status" :class="post.status === 'published' ? 'tag-published' : 'tag-draft'">
                {{ post.status === 'published' ? 'Published' : 'Draft' }}
              </span>
              <span class="post-date">{{ formatDate(post.created_at) }}</span>
              <span class="post-views">👁️ {{ post.view_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 仪表盘页面组件
 * 功能：
 * 1. 显示文章统计数据
 * 2. 提供快捷操作入口
 * 3. 展示最近发布的文章
 */

import { ref, onMounted } from 'vue'
import { getPosts } from '../api'

// ---------------------------------------------------------------------------
// 响应式数据
// ---------------------------------------------------------------------------

/** 统计数据 */
const stats = ref({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalViews: 0
})

/** 最近文章列表 */
const recentPosts = ref([])

// ---------------------------------------------------------------------------
// 生命周期钩子
// ---------------------------------------------------------------------------

/**
 * 组件挂载后加载数据
 */
onMounted(async () => {
  await loadDashboardData()
})

// ---------------------------------------------------------------------------
// 数据加载函数
// ---------------------------------------------------------------------------

/**
 * 加载仪表盘数据
 * 获取所有文章并计算统计数据
 */
async function loadDashboardData() {
  try {
    // 获取所有文章（不限制数量）
    const response = await getPosts({ limit: 1000 })

    if (response.success) {
      const posts = response.data.posts

      // 计算统计数据
      stats.value = {
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + p.view_count, 0)
      }

      // 获取最近 5 篇文章
      recentPosts.value = posts.slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 格式化日期
 * @param {string} dateString - ISO 格式的日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* 页面标题 */
.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
}

/* 统计卡片网格布局 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* 统计卡片 */
.stat-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  font-size: 20px;
}

/* 查看全部链接 */
.view-all {
  font-size: 14px;
  color: var(--primary-color);
}

/* 最近文章列表 */
.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-post-item {
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.recent-post-item:hover {
  background-color: var(--border-light);
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.post-date,
.post-views {
  display: flex;
  align-items: center;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
