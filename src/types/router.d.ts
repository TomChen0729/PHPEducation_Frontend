import 'vue-router'

import type { UserRole } from './auth'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}
