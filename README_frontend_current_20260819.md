# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 主要記錄目前前端架構、已完成功能、已串接 API，以及目前待後端支援的功能。

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

目前依照職責拆分：

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
├─ boot/         # Axios、登入狀態初始化
├─ components/   # 共用 / 功能 UI 元件
├─ composables/  # 功能流程與 Vue 邏輯
├─ config/       # 導覽列等設定
├─ css/          # 各功能 / 頁面 SCSS
├─ pages/        # 頁面與 File-based Routing
├─ router/       # Router Guard
├─ stores/       # Pinia 全域狀態
├─ types/        # TypeScript 型別
├─ utils/        # 共用工具函式
└─ App.vue
```

SCSS 依功能與頁面分檔，不另外建立尚未需要的全域 mixin / variable 架構。

---

## 3. API Base URL

目前 Backend 使用：

```text
http://127.0.0.1:8000
```

Frontend API Base URL：

```env
QCLI_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Frontend 開發網址：

```text
http://localhost:9000
```

---

## 4. 主要路由

```text
/                         → 導向登入頁
/login                    → 登入頁
/teacherApplication       → 教師帳號申請
/admin                    → 管理員首頁
/admin/userManagement     → 管理員－使用者管理
/teacher                  → 教師首頁
/teacher/courseManagement → 教師－課程管理
/student                  → 學生首頁
```

公開頁面：

```text
/login
/teacherApplication
```

受 Router Guard 保護：

```text
/admin
/teacher
/student
```

並依 `admin / teacher / student` 角色限制可進入頁面。

---

## 5. Authentication

登入流程：

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

- Token
- 目前登入使用者
- 使用者角色
- 是否登入

Axios Request Interceptor 會自動附加：

```text
Authorization: Bearer {token}
```

App 啟動時透過：

```text
boot/auth.ts
```

恢復登入狀態：

```text
sessionStorage Token
        ↓
GET /auth/me
        ↓
有效 → 恢復 user / role
失效 → clearAuth()
```

目前正式使用：

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

登出流程：

```text
POST /auth/logout
        ↓
Backend 撤銷 Token
        ↓
clearAuth()
        ↓
導向 /login
        ↓
Quasar Notify
```

---

## 6. Router Guard

目前已完成：

- 未登入使用者不可進入受保護頁面
- 未登入時導向 `/login`
- `student` 不可進入教師 / 管理員頁
- `teacher` 不可進入管理員頁
- `admin` 依管理員權限進入管理頁
- `/teacherApplication` 為公開頁面

---

## 7. 共用 Navbar

目前已建立：

```text
components/.../AppNavbar.vue
config/navigation.ts
css/components/_navbar.scss
```

不同角色使用不同代表色：

```text
Admin   → 紫色
Teacher → 藍色
Student → 綠色
```

Navbar 支援：

- 依角色顯示不同 Navigation
- 顯示登入者名稱
- 正式 Logout API
- Desktop Navigation
- Mobile Hamburger Menu
- RWD

---

## 8. 教師帳號申請

目前前端已建立教師帳號申請頁與基本架構：

```text
teacherApplication.vue
        ↓
useTeacherApplication.ts
        ↓
teacher-application.api.ts
```

表單欄位：

- 姓名
- Email
- 申請原因（選填）

Backend 已提供：

```text
POST /api/v1/teacher-applications
```

Request：

```text
name
email
reason
```

目前下一步為正式完成 API 串接與錯誤訊息處理，包括：

- 申請成功
- Email 已經是教師帳號
- 已存在 Pending 申請
- 422 Validation Error

> 教師帳號申請頁不需要登入。

---

## 9. 管理員－使用者管理

目前已建立：

```text
/admin/userManagement
```

頁面已有：

- 教師申請區塊
- 學生帳號開通區塊
- 統計卡片
- Scroll Area
- ConfirmDialog
- Desktop 雙欄排列
- Mobile 上下排列
- RWD

主要元件：

```text
components/
├─ common/
│  └─ ConfirmDialog.vue
└─ user-management/
   ├─ UserStatsCards.vue
   ├─ TeacherApprovalPanel.vue
   └─ StudentActivationPanel.vue
```

### 教師申請審核

目前 Backend 已存在：

```text
POST /api/v1/teacher-applications/{id}/approve
```

但前端要完整正式化仍等待：

```text
GET 待審核教師申請清單
Admin 權限保護
```

目前教師核准後前端不顯示帳號 / 密碼結果視窗，以成功提示為主。

### 學生帳號開通

現有學生開通 UI 已完成第一版，但需求將重新調整為：

```text
依課程篩選
   ↓
選擇課程
   ↓
顯示該課程待開通學生
   ↓
單選 / 全選
   ↓
依課程批次開通學生帳號
```

因此原本單純的「學生待開通清單」將改為「依課程開通學生帳號」。

此功能目前等待 Backend 補齊「課程與學生申請 / 開通」的正式 API 與資料關聯後再進行正式串接。

---

## 10. 教師－課程管理

目前課程管理已完成第一版正式串接。

路由：

```text
/teacher/courseManagement
```

Backend API：

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

前端架構：

```text
courseManagement.vue
        ↓
useTeacherCourses.ts
        ↓
teacher-course.api.ts
        ↓
Axios
        ↓
Backend
```

主要功能：

- 顯示教師自己的課程
- 新增課程
- 修改課程
- 刪除課程
- ConfirmDialog
- Notify
- Loading / Error 狀態
- 空課程狀態
- RWD

### 開課學期

老師不需要直接輸入 `115-1`。

Frontend 使用兩個 Select：

```text
學年度
→ 民國 47 年 ～ 目前民國年

學期
→ 上學期
→ 下學期
```

送出前組合成 Backend 格式：

```text
115 學年度 + 上學期
→ 115-1

115 學年度 + 下學期
→ 115-2
```

### 課程排序

課程由 Backend 依學期由新到舊排序：

```text
115-2
115-1
114-2
114-1
...
```

Frontend 直接按照 API 回傳順序顯示。

### 課程 Dialog

新增 / 編輯共用 `CourseFormDialog.vue`。

- Dialog 固定高度
- 課程說明固定高度
- 說明文字超過範圍時在 textarea 內 Scroll
- 不讓文字內容持續撐高 Dialog

### Course Card

`CourseCard.vue` 顯示：

- 課程名稱
- 學年度 / 學期
- 課程說明
- 編輯
- 刪除
- 進入課程

課程說明區塊固定高度，內容過長使用多行省略：

```text
課程說明第一行
課程說明第二行
課程說明第三行...
```

避免不同課程說明長度造成卡片高度不一致。

---

## 11. Dashboard

目前已建立：

```text
dashboard.api.ts
        ↓
useDashboard.ts
        ↓
GET /api/v1/dashboard
```

Backend 依角色回傳：

```text
Admin
→ user + pending_count

Teacher
→ user + courses

Student
→ user + courses
```

目前 Dashboard API / Composable 架構已建立，各角色首頁畫面後續再依需求實作。

---

## 12. 教材管理

目前前端尚未開始正式實作教材管理。

Backend 現有資料結構：

```text
Course
└─ Topic
   └─ Chapter
      └─ Unit
         └─ Knowledge Card
```

目前 Backend 已存在 Topic / Chapter / Unit / Knowledge Card CRUD API。

但目前需求已增加：

```text
下載 Excel 範本
→ 教師填寫
→ Excel 匯入
→ 產生教材草稿
→ 網頁編輯草稿
→ 新增 / 修改 / 刪除教材內容
→ 教師確認
→ 發布
→ 學生才可查看
```

以及：

```text
一門課程可有多份完整教材
同一課程不可有同名教材
已發布教材後續可再建立新版草稿
```

上述 Excel / Draft / Publish / 教材版本功能目前尚未進入 Frontend 正式實作，等待 Backend 資料結構與 API 確認。

---

## 13. 前端開發原則

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

目前以職責清楚、方便維護為原則，不過度拆分尚未需要的結構。
