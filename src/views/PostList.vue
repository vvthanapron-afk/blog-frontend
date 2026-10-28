<!-- =============================================================================
  PostList.vue - Post list page
  Display posts with status filtering, editing, and deletion
  ============================================================================= -->

<template>
  <div class="post-list-page">
    <div class="page-header">
      <h1 class="page-title">Posts</h1>
      <router-link to="/posts/new" class="btn btn-primary">
        ✏️ New Post
      </router-link>
    </div>

    <!-- Status filter -->
    <div class="filter-bar">
      <select v-model="statusFilter" @change="loadPosts" class="form-input filter-select">
        <option value="">All Posts</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Post list -->
    <div v-else-if="posts.length > 0" class="posts-grid">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-card-header">
          <span class="tag tag-status" :class="post.status === 'published' ? 'tag-published' : 'tag-draft'">
            {{ post.status === 'published' ? 'Published' : 'Draft' }}
          </span>
          <span class="post-views">👁️ {{ post.view_count }}</span>
        </div>

        <h2 class="post-card-title">{{ post.title }}</h2>

        <p class="post-card-summary">{{ post.summary || 'No summary available' }}</p>

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

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p>📭 No posts yet</p>
      <router-link to="/posts/new" class="btn btn-primary">
        Write Your First Post
      </router-link>
    </div>

    <!-- Pagination -->
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

    <!-- Delete confirmation dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
          <button @click="deletePost" class="btn btn-danger">Confirm Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Post list component
 * Features:
 * 1. Display the post list
 * 2. Filter posts by status
 * 3. Support pagination
 * 4. Edit and delete posts
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, deletePost as deletePostApi } from '../api'

const router = useRouter()

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

/** Post list */
const posts = ref([])

/** Loading state */
const loading = ref(false)

/** Status filter */
const statusFilter = ref('')

/** Pagination data */
const pagination = ref({
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0
})

/** Whether the delete confirmation dialog is visible */
const showDeleteDialog = ref(false)

/** ID of the post selected for deletion */
const postToDelete = ref(null)

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------

onMounted(() => {
  loadPosts()
})

// ---------------------------------------------------------------------------
// Data loading functions
// ---------------------------------------------------------------------------

/**
 * Load the post list
 * Fetch posts using the current filter and pagination settings
 */
async function loadPosts() {
  loading.value = true

  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    // Add the status filter to the query parameters when selected
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
// Action handlers
// ---------------------------------------------------------------------------

/**
 * Edit a post
 * Navigate to the post editor
 */
function editPost(postId) {
  router.push(`/posts/edit/${postId}`)
}

/**
 * Ask for confirmation before deleting a post
 * Show the delete confirmation dialog
 */
function confirmDelete(postId) {
  postToDelete.value = postId
  showDeleteDialog.value = true
}

/**
 * Cancel deletion
 */
function cancelDelete() {
  showDeleteDialog.value = false
  postToDelete.value = null
}

/**
 * Delete the selected post
 * Call the delete API and refresh the list
 */
async function deletePost() {
  if (!postToDelete.value) return

  try {
    const response = await deletePostApi(postToDelete.value)

    if (response.success) {
      alert('Post deleted successfully')
      // Reload the post list
      await loadPosts()
    } else {
      alert(response.message || 'Failed to delete the post')
    }
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('Failed to delete the post. Please try again later.')
  } finally {
    cancelDelete()
  }
}

/**
 * Change the current page
 */
function changePage(page) {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadPosts()
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Format a date
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
/* Page header */
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

/* Status filter */
.filter-bar {
  margin-bottom: 24px;
}

.filter-select {
  max-width: 200px;
}

/* Post grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* Post card */
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

/* Empty state */
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

/* Pagination */
.page-info {
  padding: 8px 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Modal dialog */
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
