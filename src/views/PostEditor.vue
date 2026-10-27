<!-- =============================================================================
  PostEditor.vue - 文章编辑器页面
  用于创建和编辑文章，支持 Markdown 格式
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="editor-container">
      <!-- 基本信息区域 -->
      <div class="card">
        <div class="form-group">
          <label for="title">Post title </label>
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
            placeholder="Enter summary（Optional, shown in post lists）"
          />
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <input
            id="tags"
            v-model="form.tagsInput"
            type="text"
            class="form-input"
            placeholder="Separate tags with commas (e.g. life, emotional, Secret)"
          />
          <div class="tags-preview" v-if="tags.length > 0">
            <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 内容编辑区域 -->
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

        <!-- 编辑模式 -->
        <div v-if="editorTab === 'edit'" class="form-group">
          <textarea
            v-model="form.content"
            class="form-input form-textarea"
            placeholder="Markdown supported..."
            rows="20"
          ></textarea>
        </div>

        <!-- 预览模式 -->
        <div v-else class="preview-content card">
          <div v-html="renderedContent" class="markdown-body"></div>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
/**
 * 文章编辑器组件
 * 功能：
 * 1. 创建新文章
 * 2. 编辑现有文章
 * 3. 支持 Markdown 格式
 * 4. 实时预览
 * 5. 保存为草稿或直接发布
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPost, createPost, updatePost } from '../api'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

// ---------------------------------------------------------------------------
// 响应式数据
// ---------------------------------------------------------------------------

/** 是否为编辑模式 */
const isEditing = computed(() => !!route.params.id)

/** 加载状态 */
const loading = ref(false)

/** 保存状态 */
const saving = ref(false)

/** 编辑器标签页（编辑/预览） */
const editorTab = ref('edit')

/** 消息提示 */
const message = ref('')
const messageType = ref('message-success')

/** 表单数据 */
const form = ref({
  title: '',
  content: '',
  summary: '',
  tagsInput: ''
})

// ---------------------------------------------------------------------------
// 计算属性
// ---------------------------------------------------------------------------

/**
 * 解析标签输入字符串为数组
 */
const tags = computed(() => {
  if (!form.value.tagsInput) return []
  return form.value.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

/**
 * 渲染 Markdown 内容为 HTML
 */
const renderedContent = computed(() => {
  if (!form.value.content) return '<p>No content yet.</p>'
  return marked(form.value.content)
})

// ---------------------------------------------------------------------------
// 生命周期钩子
// ---------------------------------------------------------------------------

onMounted(async () => {
  // 如果是编辑模式，加载文章数据
  if (isEditing.value) {
    await loadPost()
  }
})

// ---------------------------------------------------------------------------
// 数据加载函数
// ---------------------------------------------------------------------------

/**
 * 加载文章数据（编辑模式）
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
// 操作函数
// ---------------------------------------------------------------------------

/**
 * 保存为草稿
 */
async function saveAsDraft() {
  await savePost('draft')
}

/**
 * 发布文章
 */
async function publish() {
  await savePost('published')
}

/**
 * 保存文章
 * @param {string} status - 文章状态（draft/published）
 */
async function savePost(status) {
  // 验证必填字段
  if (!form.value.title || !form.value.content) {
    showMessage('Tiltle and content are required', 'message-error')
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
      // 更新文章
      response = await updatePost(route.params.id, postData)
    } else {
      // 创建文章
      response = await createPost(postData)
    }

    if (response.success) {
      showMessage(
        isEditing.value ? 'Post update suceessfully' : 'Post created successfully',
        'message-success'
      )

      // 延迟跳转到文章列表
      setTimeout(() => {
        router.push('/posts')
      }, 1000)
    } else {
      showMessage(response.message || 'Failed to save the post', 'message-error')
    }
  } catch (error) {
    console.error('Failed to save post:', error)
    showMessage('Faile to save post. Please try again later', 'message-error')
  } finally {
    saving.value = false
  }
}

/**
 * 显示消息提示
 * @param {string} msg - 消息内容
 * @param {string} type - 消息类型
 */
function showMessage(msg, type = 'message-success') {
  message.value = msg
  messageType.value = type

  // 3秒后自动清除消息
  setTimeout(() => {
    message.value = ''
  }, 3000)
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

.header-actions {
  display: flex;
  gap: 12px;
}

/* 编辑器容器 */
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* 标签预览 */
.tags-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 编辑器标签页 */
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

/* 文本域 */
.form-textarea {
  min-height: 400px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 预览内容 */
.preview-content {
  min-height: 400px;
  background-color: var(--bg-secondary);
}

/* Markdown 渲染样式 */
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

/* 消息提示 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 200px;
}
</style>
