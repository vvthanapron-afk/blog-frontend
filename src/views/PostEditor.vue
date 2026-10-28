<!-- =============================================================================
  PostEditor.vue - Post editor page
  Create and edit posts with Markdown support
  ============================================================================= -->

<template>
  <div class="post-editor-page">
    <div class="page-header">
      <h1 class="page-title">{{ isEditing ? 'Edit Post' : 'New Post' }}</h1>
      <div class="header-actions">
        <button @click="saveAsDraft" class="btn btn-secondary" :disabled="saving">
          Save as Draft
        </button>
        <button @click="publish" class="btn btn-primary" :disabled="saving">
          Publish Post
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Editor form -->
    <div v-else class="editor-container">
      <!-- Basic post information -->
      <div class="card">
        <div class="form-group">
          <label for="title">Post title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Enter a post title"
            required
          />
        </div>

        <div class="form-group">
          <label for="summary">Post summary</label>
          <input
            id="summary"
            v-model="form.summary"
            type="text"
            class="form-input"
            placeholder="Enter a summary (optional, shown in post lists)"
          />
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <input
            id="tags"
            v-model="form.tagsInput"
            type="text"
            class="form-input"
            placeholder="Separate tags with commas (e.g. life, emotions, stories)"
          />
          <div class="tags-preview" v-if="tags.length > 0">
            <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Content editor -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Post content</h2>
          <div class="editor-tabs">
            <button
              @click="editorTab = 'edit'"
              :class="{ active: editorTab === 'edit' }"
              class="tab-btn"
            >
              Edit
            </button>
            <button
              @click="editorTab = 'preview'"
              :class="{ active: editorTab === 'preview' }"
              class="tab-btn"
            >
              Preview
            </button>
          </div>
        </div>

        <!-- Edit mode -->
        <div v-if="editorTab === 'edit'" class="form-group">
          <textarea
            v-model="form.content"
            class="form-input form-textarea"
            placeholder="Write your post in Markdown..."
            rows="20"
          ></textarea>
        </div>

        <!-- Preview mode -->
        <div v-else class="preview-content card">
          <div v-html="renderedContent" class="markdown-body"></div>
        </div>
      </div>
    </div>

    <!-- Status messages -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
/**
 * Post editor component
 * Features:
 * 1. Create a new post
 * 2. Edit an existing post
 * 3. Support Markdown content
 * 4. Preview Markdown content
 * 5. Save a draft or publish the post
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPost, createPost, updatePost } from '../api'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

/** Whether the editor is updating an existing post */
const isEditing = computed(() => !!route.params.id)

/** Loading state */
const loading = ref(false)

/** Saving state */
const saving = ref(false)

/** Editor tab: edit or preview */
const editorTab = ref('edit')

/** Status messages */
const message = ref('')
const messageType = ref('message-success')

/** Form data */
const form = ref({
  title: '',
  content: '',
  summary: '',
  tagsInput: ''
})

// ---------------------------------------------------------------------------
// Computed properties
// ---------------------------------------------------------------------------

/**
 * Convert the comma-separated tag input to an array
 */
const tags = computed(() => {
  if (!form.value.tagsInput) return []
  return form.value.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

/**
 * Render Markdown content as HTML
 */
const renderedContent = computed(() => {
  if (!form.value.content) return '<p>No content yet.</p>'
  return marked(form.value.content)
})

// ---------------------------------------------------------------------------
// Lifecycle hooks
// ---------------------------------------------------------------------------

onMounted(async () => {
  // Load the existing post when editing
  if (isEditing.value) {
    await loadPost()
  }
})

// ---------------------------------------------------------------------------
// Data loading functions
// ---------------------------------------------------------------------------

/**
 * Load post data for editing
 */
async function loadPost() {
  loading.value = true

  try {
    const response = await getPost(route.params.id)

    if (response.success) {
      const post = response.data
      form.value = {
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        tagsInput: post.tags ? post.tags.map(t => t.name).join(', ') : ''
      }
    } else {
      showMessage('Failed to load post', 'message-error')
    }
  } catch (error) {
    console.error('Failed to load post:', error)
    showMessage('Failed to load post', 'message-error')
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

/**
 * Save as a draft
 */
async function saveAsDraft() {
  await savePost('draft')
}

/**
 * Publish the post
 */
async function publish() {
  await savePost('published')
}

/**
 * Save the post
 * @param {string} status - Post status: draft or published
 */
async function savePost(status) {
  // Validate required fields
  if (!form.value.title || !form.value.content) {
    showMessage('Title and content are required', 'message-error')
    return
  }

  saving.value = true

  try {
    const postData = {
      title: form.value.title,
      content: form.value.content,
      summary: form.value.summary,
      status,
      tags: tags.value
    }

    let response
    if (isEditing.value) {
      // Update a post
      response = await updatePost(route.params.id, postData)
    } else {
      // Create a post
      response = await createPost(postData)
    }

    if (response.success) {
      showMessage(
        isEditing.value ? 'Post updated successfully' : 'Post created successfully',
        'message-success'
      )

      // Navigate to the post list after a short delay
      setTimeout(() => {
        router.push('/posts')
      }, 1000)
    } else {
      showMessage(response.message || 'Failed to save the post', 'message-error')
    }
  } catch (error) {
    console.error('Failed to save post:', error)
    showMessage('Failed to save the post. Please try again later.', 'message-error')
  } finally {
    saving.value = false
  }
}

/**
 * Display a status message
 * @param {string} msg - Message text
 * @param {string} type - Message CSS class
 */
function showMessage(msg, type = 'message-success') {
  message.value = msg
  messageType.value = type

  // Clear the message after three seconds
  setTimeout(() => {
    message.value = ''
  }, 3000)
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

.header-actions {
  display: flex;
  gap: 12px;
}

/* Editor container */
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form group */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

/* Tag preview */
.tags-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Editor tabs */
.editor-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: var(--bg-secondary);
}

.tab-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Text area */
.form-textarea {
  min-height: 400px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* Preview content */
.preview-content {
  min-height: 400px;
  background-color: var(--bg-secondary);
}

/* Markdown styles */
.markdown-body {
  line-height: 1.8;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body p {
  margin-bottom: 16px;
}

.markdown-body code {
  background-color: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.markdown-body pre {
  background-color: var(--bg-primary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-body ul,
.markdown-body ol {
  margin-left: 24px;
  margin-bottom: 16px;
}

/* Status messages */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 200px;
}
</style>
