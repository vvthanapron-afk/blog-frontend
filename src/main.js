// =============================================================================
// Main entry point for the Vue application 
// Create and mount the Vue application
// =============================================================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import global styles
import './assets/style.css'

// Create the Vue application
const app = createApp(App)

// Create the Pinia instance
const pinia = createPinia()

// Register plugins
app.use(pinia)      // Use Pinia for state management
app.use(router)     // Use Vue Router for navigation

// Mount the application to the DOM
app.mount('#app')
