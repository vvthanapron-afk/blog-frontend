<!-- =============================================================================
  PostList.vue - 文章列表页面
  显示所有文章，支持搜索、筛选、删除操作
  ============================================================================= -->

<template>
  <div class="post-list-page">
    <div class="page-header">
      <h1 class="page-title">Posts</h1>
      <router-link to="/posts/new" class="btn btn-primary">
        ✏️ New Post
      </router-link>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <select v-model="statusFilter" @change="loadPosts" class="form-input filter-select">
        <option value="">All Posts</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="posts.length > 0" class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-card-header">
          <span class="tag tag-status" :class="post.status === 'published' ? 'tag-published' : 'tag-draft'">
            {{ post.status === 'published' ? 'Published' : 'Draft' }}
          </span>
          <span class="post-views">👁️ {{ post.view_count }}</span>
        </div>

        <h2 class="post-card-title">{{ post.title }}</h2>

        <p class="post-card-summary">{{ post.summary || 'No Summary available' }}</p>

        <div class="post-card-footer">
          <div class="post-meta">
            <span class="post-author">✍️ {{ post.author_name || 'Writer' }}</span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
          <div class="post-actions">
            <button @click="editPost(post.id)" class="btn btn-secondary btn-sm">
              Edit
            </button>
            <button @click="confirmDelete(post.id)" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>📭 No posts yet</p>
      <router-link to="/posts/new" class="btn btn-primary">
        Write Your First Post
      </router-link>
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
        Page {{ pagination.page }} of {{ pagination.totalPages }} · {{ pagination.total }} posts
      </span>
      <button
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
      >
        Next 
      </button>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone。</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Canel</button>
          <button @click="deletePost" class="btn btn-danger">Confirm Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 文章列表页面组件
 * 功能：
 * 1. 显示所有文章列表
 * 2. 按状态筛选文章
 * 3. 分页浏览
 * 4. 编辑和删除文章
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, deletePost as deletePostApi } from '../api'

const router = useRouter()

// ---------------------------------------------------------------------------
// 响应式数据
// ---------------------------------------------------------------------------

/** 文章列表 */
const posts = ref([])

/** 加载状态 */
const loading = ref(false)

/** 状态筛选 */
const statusFilter = ref('')

/** 分页信息 */
const pagination = ref({
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0
})

/** 删除确认对话框显示状态 */
const showDeleteDialog = ref(false)

/** 待删除的文章 ID */
const postToDelete = ref(null)

// ---------------------------------------------------------------------------
// 生命周期钩子
// ---------------------------------------------------------------------------

onMounted(() => {
  loadPosts()
})

// ---------------------------------------------------------------------------
// 数据加载函数
// ---------------------------------------------------------------------------

/**
 * 加载文章列表
 * 根据筛选条件和分页参数获取文章
 */
async function loadPosts() {
  loading.value = true

  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    // 如果有状态筛选，添加到参数中
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await getPosts(params)

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
    alert('Failed to load posts. Please try again later.')
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// 操作函数
// ---------------------------------------------------------------------------

/**
 * 编辑文章
 * 跳转到文章编辑页面
 */
function editPost(postId) {
  router.push(`/posts/edit/${postId}`)
}

/**
 * 确认删除文章
 * 显示删除确认对话框
 */
function confirmDelete(postId) {
  postToDelete.value = postId
  showDeleteDialog.value = true
}

/**
 * 取消删除
 */
function cancelDelete() {
  showDeleteDialog.value = false
  postToDelete.value = null
}

/**
 * 执行删除文章
 * 调用 API 删除文章并刷新列表
 */
async function deletePost() {
  if (!postToDelete.value) return

  try {
    const response = await deletePostApi(postToDelete.value)

    if (response.success) {
      alert('Post deleted sucessfully')
      // 重新加载文章列表
      await loadPosts()
    } else {
      alert(response.message || 'Failed to delete posts')
    }
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('Failed to delete the post. Please try again later.')
  } finally {
    cancelDelete()
  }
}

/**
 * 切换页码
 */
function changePage(page) {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadPosts()
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
/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 筛选栏 */
.filter-bar {
  margin-bottom: 24px;
}

.filter-select {
  max-width: 200px;
}

/* 文章网格布局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* 文章卡片 */
.post-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-views {
  font-size: 14px;
  color: var(--text-secondary);
}

.post-card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
  line-height: 1.4;
}

.post-card-summary {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.post-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* 分页 */
.page-info {
  padding: 8px 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 模态对话框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-bottom: 12px;
  color: var(--text-primary);
}

.modal-content p {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
