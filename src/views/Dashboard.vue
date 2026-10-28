<!-- =============================================================================
  Dashboard.vue - Dashboard page
  Display an overview of the system and post statistics
  ============================================================================= -->

<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <!-- Statistics cards section -->
    <div class="stats-grid">
      <!-- Total posts card -->
      <div class="stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalPosts }}</div>
          <div class="stat-label">Total Post</div>
        </div>
      </div>

      <!-- Published posts card -->
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.publishedPosts }}</div>
          <div class="stat-label">Published</div>
        </div>
      </div>

      <!-- Draft posts card -->
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.draftPosts }}</div>
          <div class="stat-label">Draft</div>
        </div>
      </div>

      <!-- Total views card -->
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalViews }}</div>
          <div class="stat-label">Total views</div>
        </div>
      </div>
    </div>

    <!-- Quick actions section -->
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

    <!-- Recent posts section -->
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
 * Dashboard component
 * Features:
 * 1. Display post statistics
 * 2. Provide quick actions
 * 3. Display recent posts
 */
  
import { ref, onMounted } from 'vue'
import { getPosts } from '../api'

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

/** Statistics */
const stats = ref({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalViews: 0
})

/** Recent posts */
const recentPosts = ref([])

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------

/**
 * Load data after the component is mounted
 */
onMounted(async () => {
  await loadDashboardData()
})

// ---------------------------------------------------------------------------
// Data loading functions
// ---------------------------------------------------------------------------

/**
 * Load dashboard data
 * Load posts and calculate dashboard statistics
 */
async function loadDashboardData() {
  try {
    // Fetch posts for the dashboard statistics
    const response = await getPosts({ limit: 1000 })

    if (response.success) {
      const posts = response.data.posts

      // Calculate statistics
      stats.value = {
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + p.view_count, 0)
      }

      // Get the 5 most recent posts
      recentPosts.value = posts.slice(0, 5)
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Format a date
 * @param {string} dateString - Date string in ISO format
 * @returns {string} Formatted date
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
/* Page title */
.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
}

/* Statistics card grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* Statistics card */
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

/* Quick actions */
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

/* View all link */
.view-all {
  font-size: 14px;
  color: var(--primary-color);
}

/* Recent posts */
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

/* Empty state */
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
