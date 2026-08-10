import { defineRouter } from '#q-app'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import {
  routes,
  handleHotUpdate,
} from 'vue-router/auto-routes'

export default defineRouter(() => {
  const Router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL),
  })

  if (import.meta.hot) {
    handleHotUpdate(Router)
  }

  return Router
})
