// =============================================================================
// Vue Router configuration
// Define page routes and navigation guards
// =============================================================================

import { createRouter, createWebHistory } from 'vue-router'

// Import page components
import Home from '../views/Home.vue'
import ArticleView from '../views/ArticleView.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import PostList from '../views/PostList.vue'
import PostEditor from '../views/PostEditor.vue'

// ---------------------------------------------------------------------------
// Route configuration
// Each route defines a path, component, and metadata such as authentication requirements
// ---------------------------------------------------------------------------
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, isPublic: true }  // Public homepage
  },
  {
    path: '/article/:id',
    name: 'ArticleView',
    component: ArticleView,
    meta: { requiresAuth: false, isPublic: true }  // Public post details
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts',
    name: 'PostList',
    component: PostList,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/new',
    name: 'PostNew',
    component: PostEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/edit/:id',
    name: 'PostEdit',
    component: PostEditor,
    meta: { requiresAuth: true }
  }
]

// ---------------------------------------------------------------------------
// Create the router instance
// ---------------------------------------------------------------------------
const router = createRouter({
  history: createWebHistory(),  // Use HTML5 history mode
  routes
})

// ---------------------------------------------------------------------------
// Global navigation guard
// Check authentication before each route change
// ---------------------------------------------------------------------------
router.beforeEach((to, from, next) => {
  // Read the token from local storage
  const token = localStorage.getItem('token')

  // Check whether the destination route requires authentication
  if (to.meta.requiresAuth) {
    // Redirect to login when authentication is required but no token is present
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }  // Keep the destination path so login can redirect back to it
      })
    } else {
      // Allow access when a token is present
      next()
    }
  } else {
    // Allow direct access when authentication is not required
    next()
  }
})

// Export the router
export default router
