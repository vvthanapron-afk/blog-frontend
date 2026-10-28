// API client module
// Use Axios to manage requests to the backend API

import axios from 'axios'

// Create an Axios instance
// Configure the base URL and default options

const api = axios.create({
  baseURL: '/api',                  
  timeout: 10000,                    
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
// Add the authentication token before sending each request

api.interceptors.request.use(
  (config) => {
   
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
   
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
// Handle response errors, including expired tokens

api.interceptors.response.use(
  (response) => {
    
    return response.data
  },
  (error) => {
    
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          
          console.error('Authentication failed, Please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          // Forbidden
          console.error('You do not have permission to access this resource.')
          break
        case 404:
          // Resource not found
          console.error('The requested resource was not found.')
          break
        case 500:
          // Internal server error
          console.error('Internal server error')
          break
        default:
          console.error('Request failed:', data.message || 'Unknown error')
      }
    } else if (error.request) {
      // The request was sent, but no response was received
      console.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)


// Authentication API

/**
 * Administrator login
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Login response
 */
export function login(username, password) {
  return api.post('/auth/login', { username, password })
}

/**
 * Get the current user's information
 * @returns {Promise} User information
 */
export function getCurrentUser() {
  return api.get('/auth/me')
}

/**
 * Change password
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Password change result
 */
export function changePassword(oldPassword, newPassword) {
  return api.post('/auth/change-password', { oldPassword, newPassword })
}


// Posts API

/**
 * Get the post list
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of posts per page
 * @param {string} params.status - Status filter
 * @returns {Promise} Post list
 */
export function getPosts(params = {}) {
  return api.get('/posts', { params })
}

/**
 * Get the details of one post
 * @param {number} id - Post ID
 * @returns {Promise} Post details
 */
export function getPost(id) {
  return api.get(`/posts/${id}`)
}

/**
 * Create a new post
 * @param {object} data - Post data
 * @param {string} data.title - Post title
 * @param {string} data.content - Post content
 * @param {string} data.summary - Post summary
 * @param {string} data.status - Post status
 * @param {Array} data.tags - List of tag names
 * @returns {Promise} Creation result
 */
export function createPost(data) {
  return api.post('/posts', data)
}

/**
 * Update a post
 * @param {number} id - Post ID
 * @param {object} data - Post data
 * @returns {Promise} Update result
 */
export function updatePost(id, data) {
  return api.put(`/posts/${id}`, data)
}

/**
 * Delete a post
 * @param {number} id - Post ID
 * @returns {Promise} Deletion result
 */
export function deletePost(id) {
  return api.delete(`/posts/${id}`)
}

/**
 * Get all tags
 * @returns {Promise} Tag list
 */
export function getTags() {
  return api.get('/posts/tags/all')
}

// Export the API client
export default api
