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
/                     → 導向登入頁
/login                → 登入頁
/teacherApplication   → 教師帳號申請
/admin                 → 管理員頁面
/admin/userManagement → 管理員－使用者管理
/teacher               → 教師頁面
/student               → 學生頁面
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
   ↓
Backend
```

登入狀態由：

```text
stores/auth.ts
```

管理：

- 目前登入使用者
- 使用者角色
- 登入狀態
- Token

App 啟動時透過：

```text
boot/auth.ts
```

執行 Session Restore：

```text
sessionStorage Token
        ↓
GET /auth/me
        ↓
Token 有效 → 恢復 user / role
Token 無效 → clearAuth()
```

Axios 會自動附加：

```text
Authorization: Bearer {token}
```

目前 Authentication API：

```text
POST /auth/login   → 登入
POST /auth/logout  → 登出
GET  /auth/me      → 取得目前登入者
```

登出成功後使用 Quasar Notify 顯示短暫提示：

```text
登出成功
```

API Base URL：

```env
QCLI_API_BASE_URL=http://phpeducation-backend.test/api/v1
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
- 串接正式登入 API
- 登入成功後儲存 Token
- 依使用者角色導向對應首頁
- App 重新整理後透過 `/auth/me` 恢復登入狀態
- 登出時撤銷 Backend Token 並清除前端登入狀態
- 登出成功顯示短暫 Notify 提示

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

目前教師申請已建立正式 API 串接：

```text
POST /teacher-applications
```

完整 URL：

```text
http://127.0.0.1:8000/api/v1/teacher-applications
```

Request：

```text
name
email
reason（選填）
```

前端會處理：

- 申請成功訊息
- Email 已存在
- 已有待審核申請
- Request 驗證錯誤

### 管理員－使用者管理

已建立管理員使用者管理頁：

```text
/admin/userManagement
```

主要功能包含：

- 顯示教師總數
- 顯示學生總數
- 顯示目前學期課程數
- 教師帳號申請審核
- 學生帳號待開通清單
- 學生多選 / 全選
- 批次開通操作介面
- 操作前確認視窗
- 教師核准後顯示帳號與一次性密碼
- 桌面版雙欄配置
- 行動裝置改為上下排列
- 清單區域使用 Scroll Area

頁面主要結構：

```text
userManagement.vue
        ↓
useUserManagement.ts
        ↓
API / 狀態處理
```

相關元件：

```text
components/
├─ common/
│  └─ ConfirmDialog.vue
└─ user-management/
   ├─ UserStatsCards.vue
   ├─ TeacherApprovalPanel.vue
   ├─ StudentActivationPanel.vue
   └─ TeacherAccountResultDialog.vue
```

各元件職責：

```text
UserStatsCards.vue
→ 顯示教師、學生、目前學期課程統計

TeacherApprovalPanel.vue
→ 顯示待審核教師申請與核准操作

StudentActivationPanel.vue
→ 顯示待開通學生、單選、全選與批次操作介面

ConfirmDialog.vue
→ 共用操作確認視窗

TeacherAccountResultDialog.vue
→ 教師核准成功後顯示產生的帳號與一次性密碼
```

教師核准流程：

```text
使用者管理頁
   ↓
選擇教師申請
   ↓
ConfirmDialog
   ↓
approve API
   ↓
TeacherAccountResultDialog
```

教師核准已建立正式 API 串接：

```text
POST /teacher-applications/{id}/approve
```

完整 URL：

```text
http://127.0.0.1:8000/api/v1/teacher-applications/{id}/approve
```

核准流程：

```text
TeacherApprovalPanel
        ↓
ConfirmDialog
        ↓
POST /teacher-applications/{id}/approve
        ↓
TeacherAccountResultDialog
```

教師核准成功後，後端回傳：

```text
tid
account
password
status
```

其中明文密碼只在結果視窗中暫時顯示，不存入 Pinia、localStorage 或 sessionStorage。

學生帳號開通目前已完成前端選取、全選、批次操作與確認流程介面；實際開通 API 依後端正式接口再串接。

使用者管理相關樣式依元件與頁面分開：

```text
css/
├─ components/
│  ├─ _confirm-dialog.scss
│  ├─ _user-stats-cards.scss
│  ├─ _teacher-approval-panel.scss
│  ├─ _student-activation-panel.scss
│  └─ _teacher-account-result-dialog.scss
└─ pages/
   └─ _user-management.scss
```

RWD 規劃：

```text
桌面版
→ 統計卡片橫向排列
→ 教師審核 / 學生開通雙欄排列

窄螢幕
→ 統計卡片依寬度調整
→ 教師審核 / 學生開通改為上下排列
```

### Dashboard API

已建立 Dashboard API 串接層：

```text
dashboard.api.ts
        ↓
useDashboard.ts
        ↓
GET /dashboard
```

API：

```text
GET /dashboard
```

完整 URL：

```text
http://127.0.0.1:8000/api/v1/dashboard
```

Dashboard 需要登入 Token，Axios 會自動附加 Bearer Token。

後端依角色回傳不同資料：

```text
Admin
→ user + pending_count

Teacher
→ user + courses

Student
→ user + courses
```

目前前端已建立共用 Dashboard API / Composable 結構，後續由各角色首頁依需求呈現資料。

---

## 8. 目前 API 串接狀態

```text
Authentication
✅ POST /auth/login
✅ POST /auth/logout
✅ GET  /auth/me

教師帳號申請
✅ POST /teacher-applications

管理員教師核准
✅ POST /teacher-applications/{id}/approve

Dashboard
✅ GET /dashboard
```

目前仍待 Backend 提供或確認：

```text
GET  待審核教師申請清單
GET  待開通學生清單
POST 學生批次開通
GET  管理員使用者統計
```

學生帳號開通功能目前已完成前端操作介面，待 Backend API 完成後再進行正式串接。

---

## 9. 前端開發原則

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
