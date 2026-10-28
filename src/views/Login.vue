<!-- =============================================================================
  Login.vue - Login page
  Administrator login form; navigate to the dashboard after successful authentication
  ============================================================================= -->

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">📝 My Blog</h1>
      <p class="login-subtitle">Writer Login</p>

      <!-- Error message -->
      <div v-if="errorMessage" class="message message-error">
        {{ errorMessage }}
      </div>

      <!-- Login form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username input -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
            autocomplete="username"
          />
        </div>

        <!-- Password input -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Login button -->
        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="!loading">Log in</span>
          <span v-else>Logging in...</span>
        </button>
      </form>

      
      
    </div>
  </div>
</template>

<script setup>
/**
 * Login page component
 * Features:
 * 1. Display the login form
 * 2. Validate user input
 * 3. Call the login API
 * 4. Store authentication data in local storage
 * 5. Navigate to the destination page
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../api'

const router = useRouter()
const route = useRoute()

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

/** Form data */
const form = reactive({
  username: '',
  password: ''
})

/** Loading state */
const loading = ref(false)

/** Error message */
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Login handler
// ---------------------------------------------------------------------------

/**
 * Handle login form submission
 * 1. Validate the input
 * 2. Call the login API
 * 3. Store the token and user information
 * 4. Navigate to the destination page
 */
async function handleLogin() {
  // Clear the previous error message
  errorMessage.value = ''

  // Frontend validation: check for empty input
  if (!form.username || !form.password) {
    errorMessage.value = 'Username and password are required'
    return
  }

  // Set the loading state
  loading.value = true

  try {
    // Call the login API
    const response = await login(form.username, form.password)

    if (response.success) {
      // After a successful login, store the token and user information
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Clear any previous error message
      errorMessage.value = ''

      // Navigate to the requested destination or the dashboard
      const redirectPath = route.query.redirect || '/dashboard'
      router.push(redirectPath)
    } else {
      // Display an error message if login fails
      errorMessage.value = response.message || 'Login failed'
    }
  } catch (error) {
    // Catch request errors and display a message
    errorMessage.value = error.response?.data?.message || 'Login failed. Please try again later.'
  } finally {
    // Reset the loading state after the request completes
    loading.value = false
  }
}
</script>

<style scoped>
/* Center the login page content */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #d0c4dc 100%);
  padding: 20px;
}

/* Login box styles */
.login-box {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

/* Login title */
.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* Login subtitle */
.login-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
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

/* Full-width button */
.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 8px;
}

/* Legacy login notice styles */
.default-account {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.default-account p {
  margin: 4px 0;
}

.default-account code {
  background-color: white;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--primary-dark);
  font-family: 'Courier New', monospace;
}
</style>
