# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 僅記錄目前前端架構與已完成功能。

---

## 1. 前端技術

- Vue 3
- Quasar Framework
- TypeScript
- Vue Router
- File-based Routing
- Pinia
- Axios
- SCSS
- ESLint
- Prettier

---

## 2. 前端架構

目前依照職責進行拆分：

```text
Page
 ↓
Composable
 ↓
API
 ↓
Axios
 ↓
Backend
```

跨頁面共用狀態使用 Pinia Store 管理。

主要目錄：

```text
src/
├─ api/          # Backend API
├─ boot/         # Axios、App 初始化
├─ components/   # 共用 UI 元件
├─ composables/  # 功能與流程邏輯
├─ config/       # 導覽列等設定
├─ css/          # 各功能 / 頁面 SCSS
├─ pages/        # 頁面與 File-based Routing
├─ router/       # Router Guard
├─ stores/       # Pinia 全域狀態
├─ types/        # TypeScript 型別
├─ utils/        # 共用工具函式
└─ App.vue
```

CSS 採功能分離方式，例如：

```text
css/components/
├─ _login.scss
├─ _navbar.scss
└─ _teacherApplication.scss
```

各功能或頁面的樣式與 RWD 直接集中在對應 SCSS 檔案中。

---

## 3. 目前主要路由

```text
/                    → 導向登入頁
/login               → 登入頁
/teacherApplication  → 教師帳號申請
/admin                → 管理員頁面
/teacher              → 教師頁面
/student              → 學生頁面
```

`/login` 與 `/teacherApplication` 為公開頁面。

`/admin`、`/teacher`、`/student` 需通過 Router Guard 才可進入。

---

## 4. Authentication 架構

目前登入相關架構：

```text
login.vue
   ↓
useAuth.ts
   ↓
auth.api.ts
   ↓
Axios
```

並使用：

```text
stores/auth.ts
```

管理：

- 目前登入使用者
- 使用者角色
- 登入狀態
- Token

API Base URL：

```env
QCLI_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

---

## 5. Router Guard

目前已完成基本登入與角色權限限制。

### 未登入

不可直接進入：

```text
/admin
/teacher
/student
```

會自動導向：

```text
/login
```

### 角色限制

目前三個角色分開管理：

```text
admin
teacher
student
```

不同角色不可直接進入其他角色頁面。

---

## 6. 導覽列

目前已建立共用導覽列架構：

```text
AppNavbar.vue
```

導覽項目依照角色設定，並使用不同代表色：

```text
管理員 → 紫色
教師   → 藍色
學生   → 綠色
```

導覽列資料與畫面分離：

```text
AppNavbar.vue
→ 導覽列 UI 與互動

config/navigation.ts
→ 各角色導覽項目

css/components/_navbar.scss
→ 導覽列樣式與 RWD
```

---

## 7. 已完成功能

### 專案基礎

- Vue + Quasar 專案建立
- TypeScript
- SCSS
- Pinia
- Axios
- File-based Routing
- ESLint / Prettier
- 基礎目錄結構

### 登入頁面

- 帳號輸入
- 密碼輸入
- 密碼顯示 / 隱藏
- 必填驗證
- 登入按鈕
- 基礎 RWD
- 教師帳號申請入口

### Router

- `/` 導向 `/login`
- Router Guard
- 未登入頁面保護
- Admin / Teacher / Student 角色限制
- 公開頁面設定

### 導覽列

- 共用 Navbar Component
- 依角色顯示不同導覽項目
- 管理員紫色
- 教師藍色
- 學生綠色

### 教師帳號申請

已建立：

```text
teacherApplication.vue
```

目前表單欄位：

- 姓名
- Email
- 申請原因

前端結構：

```text
teacherApplication.vue
        ↓
useTeacherApplication.ts
        ↓
teacher-application.api.ts
        ↓
Axios
```

教師申請頁為公開頁面，不需要登入即可進入。

目前教師申請 API 路徑：

```text
POST /teacher-applications
```

完整 URL：

```text
http://127.0.0.1:8000/api/v1/teacher-applications
```

---

## 8. 前端開發原則

目前專案維持以下分工：

```text
pages
→ 完整頁面

components
→ 可重複使用 UI

composables
→ 功能流程與 Vue 邏輯

api
→ Backend API

stores
→ 跨頁面共享狀態

types
→ TypeScript 型別

css
→ 各功能 / 頁面的樣式與 RWD
```

以職責清楚、方便維護為原則，不過度拆分尚未需要的結構。
