import type { UserRole } from '../types/auth'

export function getHomePathByRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'

    case 'teacher':
      return '/teacher'

    case 'student':
      return '/student'
  }
}
