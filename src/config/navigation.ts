import type { UserRole } from '../types/auth';

export interface NavigationItem {
  label: string;
  icon: string;
  to: string;
}

export const navigationByRole: Record<UserRole, NavigationItem[]> = {
  // 管理者頁面
  admin: [
    {
      label: '首頁',
      icon: 'home',
      to: '/admin',
    },
    {
      label: '使用者管理',
      icon: 'manage_accounts',
      to: '/admin/userManagement',
    },
    {
      label: '課程管理',
      icon: 'school',
      to: '/admin/courses',
    },
    {
      label: '知識圖譜',
      icon: 'hub',
      to: '/admin/knowledge-graph',
    },
  ],

  // 教師頁面
  teacher: [
    {
      label: '首頁',
      icon: 'home',
      to: '/teacher',
    },
    {
      label: '課程管理',
      icon: 'school',
      to: '/teacher/courses',
    },
    {
      label: '教材管理',
      icon: 'menu_book',
      to: '/teacher/materials',
    },
    {
      label: '題庫管理',
      icon: 'quiz',
      to: '/teacher/questions',
    },
    {
      label: '知識圖譜',
      icon: 'hub',
      to: '/teacher/knowledge-graph',
    },
    {
      label: '學習分析',
      icon: 'analytics',
      to: '/teacher/analytics',
    },
  ],

  // 學生頁面
  student: [
    {
      label: '首頁',
      icon: 'home',
      to: '/student',
    },
    {
      label: '我的課程',
      icon: 'school',
      to: '/student/courses',
    },
    {
      label: '學習進度',
      icon: 'trending_up',
      to: '/student/progress',
    },
    {
      label: '學習歷程',
      icon: 'history',
      to: '/student/history',
    },
  ],
};
