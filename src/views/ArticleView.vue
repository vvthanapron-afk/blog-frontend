<!-- =============================================================================
  ArticleView.vue - Post details page
  Display a complete post without requiring login
  ============================================================================= -->

<template>
  <div class="article-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Post not found -->
    <div v-else-if="!post" class="error-state">
      <h2>Post not found</h2>
      <p>This post may been deleted or may never have existed </p>
      <router-link to="/" class="btn btn-primary">Back to home </router-link>
    </div>

    <!-- Post content -->
    <div v-else class="article-container">
      <!-- Post header -->
      <header class="article-header">
        <div class="article-tags" v-if="post.tags && post.tags.length > 0">
          <span v-for="tag in post.tags" :key="tag.id" class="tag">
            {{ tag.name }}
          </span>
        </div>

        <h1 class="article-title">{{ post.title }}</h1>

        <div class="article-meta">
          <span class="meta-item">
            <span class="meta-icon">✍️</span>
            {{ post.author_name || 'Writer' }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            {{ formatDate(post.created_at) }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">👁️</span>
            {{ post.view_count }} views
          </span>
        </div>
      </header>

      <!-- Post summary -->
      <div v-if="post.summary" class="article-summary">
        <p>{{ post.summary }}</p>
      </div>

      <!-- Post content rendered from Markdown -->
      <article class="article-content markdown-body" v-html="renderedContent"></article>

      <!-- Post footer -->
      <footer class="article-footer">
        <div class="article-info">
          <p>Last updated on {{ formatDateTime(post.updated_at) }}</p>
        </div>

        <div class="article-actions">
          <router-link to="/" class="btn btn-secondary">
            ← Back to Home
          </router-link>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
/**
 * Post details component
 * Features:
 * 1. Display the complete content of one post
 * 2. Render Markdown content
 * 3. Allow access without logging in
 * 4. Increment the view count when the post is loaded
 */

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPost } from '../api'
import { marked } from 'marked'

const route = useRoute()

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

/** Poat data */
const post = ref(null)

/** Loading state */
const loading = ref(false)

// ---------------------------------------------------------------------------
// Computed properties
// ---------------------------------------------------------------------------

/**
 * Render Markdown content as HTML
 */
const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return ''
  return marked(post.value.content)
})

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------

onMounted(async () => {
  await loadArticle()
})

// ---------------------------------------------------------------------------
// Data loading functions
// ---------------------------------------------------------------------------

/**
 * Load post details
 */
async function loadArticle() {
  loading.value = true

  try {
    const articleId = route.params.id
    const response = await getPost(articleId)

    if (response.success) {
      post.value = response.data
    } else {
      post.value = null
    }
  } catch (error) {
    console.error('Failed to load post:', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Format a date without a time
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format a date and time
 */
function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Page container */
.article-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  padding: 40px 20px;
}

/* Post container */
.article-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 48px;
}

/* Post header */
.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-light);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  font-size: 16px;
}

/* Post summary */
.article-summary {
  background-color: var(--bg-secondary);
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 32px;
  border-left: 4px solid var(--primary-color);
}

.article-summary p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
}

/* Post content */
.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Markdown styles */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

.markdown-body :deep(h1) {
  font-size: 32px;
  border-bottom: 2px solid var(--border-light);
  padding-bottom: 12px;
}

.markdown-body :deep(h2) {
  font-size: 28px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 8px;
}

.markdown-body :deep(h3) {
  font-size: 24px;
}

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.markdown-body :deep(a:hover) {
  border-bottom-color: var(--primary-color);
}

.markdown-body :deep(code) {
  background-color: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.markdown-body :deep(pre) {
  background-color: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin-left: 24px;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 16px;
  margin: 20px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
}

/* Post footer */
.article-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 2px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-info {
  color: var(--text-secondary);
  font-size: 14px;
}

.article-actions {
  display: flex;
  gap: 12px;
}

/* Error state */
.error-state {
  max-width: 600px;
  margin: 80px auto;
  text-align: center;
  padding: 48px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.error-state h2 {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* Responsive layout */
@media (max-width: 768px) {
  .article-container {
    padding: 24px;
  }

  .article-title {
    font-size: 28px;
  }

  .article-meta {
    flex-direction: column;
    gap: 12px;
  }

  .article-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
