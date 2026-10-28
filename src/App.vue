<!-- =============================================================================
  App.vue - Root application component
  Contains the navigation bar and router view
  ============================================================================= -->

<template>
  <div id="app">
    <!-- Navigation bar: shown on private pages when a token is present -->
    <nav class="navbar" v-if="isLoggedIn && !isPublicPage">
      <div class="navbar-brand">
        <router-link to="/dashboard">📝 Blog Manager</router-link>
      </div>
      <div class="navbar-menu">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/posts" class="nav-link">Posts</router-link>
        <router-link to="/" class="nav-link">View Blog</router-link>
        <span class="username">{{ username }}</span>
        <button @click="logout" class="btn btn-secondary">Log out</button>
      </div>
    </nav>

    <!-- Router view: render the component for the current route -->
    <main class="main-content" :class="{ 'public-page': isPublicPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * Root application component
 * Responsibilities:
 * 1. Display the main navigation bar
 * 2. Read the user's login state
 * 3. Provide a container for routed views
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

/**
 * Computed property: check whether the user is logged in
 * Check whether a token exists in local storage
 */
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

/**
 * Computed property: check whether the current page is public
 * Public pages include the homepage and post details
 */
const isPublicPage = computed(() => {
  return route.meta.isPublic === true
})

/**
 * Computed property: get the current username
 * Parse the user information stored in local storage
 */
const username = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.username
    } catch (e) {
      return 'User'
    }
  }
  return 'User'
})

/**
 * Logout handler
 * Clear stored authentication data and redirect to the login page
 */
function logout() {
  // Clear local storage
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Redirect to the login page
  router.push('/login')
}
</script>

<style scoped>
/* Navigation link styles */
.nav-link {
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: var(--bg-secondary);
}

.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}

/* Username display */
.username {
  padding: 8px 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Main content area */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Public pages: remove the content width restriction */
.main-content.public-page {
  max-width: none;
  padding: 0;
}
</style>
