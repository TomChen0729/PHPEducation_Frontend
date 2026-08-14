import type { LoginRequest, LoginResponse, LogoutResponse, MeResponse, User } from '../types/auth';

// 測試密碼
const MOCK_PASSWORD = 'Password123!';

// 假使用者
const mockUsers: User[] = [
  {
    id: 1,
    account: 'admin@school.edu.tw',
    name: '系統管理員',
    role: 'admin',
  },
  {
    id: 1,
    account: 'teacher@school.edu.tw',
    name: '許老師',
    role: 'teacher',
  },
  {
    id: 2,
    account: 'teacher2@school.edu.tw',
    name: '陳老師',
    role: 'teacher',
  },
  {
    id: 1,
    account: '1411131000',
    name: '測試學生',
    role: 'student',
  },
];

// 模擬 API 延遲
function delay(ms = 300) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 產生假 Token
function createMockToken(user: User) {
  return `mock-${user.role}-${user.id}-token`;
}

export const authService = {
  // =========================
  // Login
  // =========================
  async login(data: LoginRequest): Promise<{ data: LoginResponse }> {
    await delay();

    const user = mockUsers.find((item) => item.account === data.account);

    if (!user || data.password !== MOCK_PASSWORD) {
      throw new Error('帳號或密碼錯誤');
    }

    return {
      data: {
        token: createMockToken(user),
        token_type: 'Bearer',
        user: {
          ...user,
        },
      },
    };
  },

  // =========================
  // GET /auth/me 模擬
  // =========================
  async me(): Promise<{
    data: MeResponse;
  }> {
    await delay(150);

    const token = sessionStorage.getItem('auth_token');

    if (!token) {
      throw new Error('尚未登入');
    }

    const user = mockUsers.find((item) => createMockToken(item) === token);

    if (!user) {
      throw new Error('登入狀態已失效');
    }

    return {
      data: {
        user: {
          ...user,
        },
      },
    };
  },

  // =========================
  // Logout
  // =========================
  async logout(): Promise<{
    data: LogoutResponse;
  }> {
    await delay(150);

    return {
      data: {
        message: '登出成功',
      },
    };
  },
};
