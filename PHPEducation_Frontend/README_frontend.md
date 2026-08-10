# PHPEducation Frontend

PHPEducation 教學網站的前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 僅記錄前端目前的架構與已完成功能，方便後續開發與維護。

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

目前前端依照不同職責進行拆分：

```text
Page
 │
 ├─ Component
 │
 └─ Composable
       │
       ▼
      API
       │
       ▼
     Axios
```

另外，跨頁面共用的狀態使用 Pinia Store 管理。

---

## 3. 目錄架構

```text
src/
│
├─ api/
│  └─ 放置後端 API 呼叫
│
├─ assets/
│  └─ 圖片、圖示等靜態資源
│
├─ boot/
│  └─ App 啟動時需要初始化的功能
│
├─ components/
│  └─ 可重複使用的 UI 元件
│
├─ composables/
│  └─ 可抽離或重複使用的 Vue 邏輯
│
├─ css/
│  └─ 全域樣式與 Quasar 樣式變數
│
├─ pages/
│  └─ 頁面與 File-based Routing
│
├─ router/
│  └─ Vue Router 相關設定
│
├─ stores/
│  └─ Pinia 全域狀態
│
├─ types/
│  └─ TypeScript 共用型別
│
├─ utils/
│  └─ 共用工具函式
│
└─ App.vue
```

---

## 4. 各層職責

### `pages/`

負責完整頁面與頁面層級流程。

目前主要頁面：

```text
pages/
├─ index.vue
├─ login.vue
├─ [...path].vue
│
├─ admin/
│  └─ index.vue
│
├─ teacher/
│  └─ index.vue
│
└─ student/
   └─ index.vue
```

目前路由用途：

```text
/          → 系統入口
/login     → 登入頁
/admin     → 管理員頁面
/teacher   → 教師頁面
/student   → 學生頁面
```

---

### `components/`

負責可重複使用，或適合從 Page 拆出的 UI 區塊。

例如後續頁面中的：

```text
Header
Sidebar
CourseCard
KnowledgeCard
QuestionCard
Dialog
```

Component 主要處理：

- UI 呈現
- Props
- Emits
- 使用者操作

原則上不直接處理 API Request。

---

### `composables/`

負責從 Page 抽離的功能邏輯。

例如 Authentication 使用：

```text
useAuth.ts
```

Composable 適合處理：

- Reactive State
- Loading
- Error
- API 操作流程
- 可重複使用的功能邏輯

---

### `api/`

負責集中管理 API Request。

例如：

```text
auth.api.ts
```

Page 或 Component 原則上不直接撰寫 Axios Request，而是透過 API Layer 呼叫。

---

### `stores/`

使用 Pinia 管理跨頁面共享的狀態。

Authentication Store 主要用於保存：

- 目前登入使用者
- 使用者角色
- 登入狀態

不在 Store 中保存使用者密碼。

---

### `types/`

集中管理 TypeScript 型別。

例如 Authentication 相關：

```text
User
UserRole
LoginRequest
LoginResponse
```

用來統一前端資料格式並降低欄位使用錯誤。

---

### `boot/`

放置 App 啟動時需要初始化的功能。

例如 Axios 的共用設定可以集中在：

```text
boot/axios.ts
```

避免 API URL 或共用 Headers 分散在不同頁面。

---

## 5. 目前已完成功能

### 5.1 前端專案基礎建置

已完成：

- 建立 Vue 3 + Quasar 專案
- 啟用 TypeScript
- 啟用 SCSS
- 啟用 Pinia
- 啟用 Vue Router File-based Routing
- 設定 ESLint
- 設定 Prettier
- 整理專案目錄結構
- 移除不需要的 Quasar 範例內容

---

### 5.2 基礎路由

已完成系統入口路由設定：

```text
/
↓
/login
```

使用者進入網站根目錄時，會導向登入頁。

目前亦已建立管理員、教師、學生的基礎頁面：

```text
/admin
/teacher
/student
```

---

### 5.3 登入頁面 UI

目前已完成登入頁面基礎介面。

包含：

- 帳號輸入欄位
- 密碼輸入欄位
- 密碼顯示 / 隱藏
- 帳號必填驗證
- 密碼必填驗證
- 登入按鈕
- Quasar Card 登入版面
- 基礎 RWD 寬度設定
- 表單欄位與登入按鈕對齊

登入欄位目前統一使用：

```text
帳號
密碼
```

以支援不同角色可能使用不同形式的登入帳號。

---

### 5.4 Authentication 前端結構

目前已將 Authentication 功能依照職責進行拆分：

```text
login.vue
   ↓
useAuth.ts
   ↓
auth.api.ts
   ↓
Axios
```

並搭配：

```text
auth Store
```

管理登入使用者與角色狀態。

此結構的目的，是避免登入頁面同時負責 UI、API、狀態與導頁邏輯，使後續維護較容易。

---

## 6. 前端開發原則

目前專案統一依照以下原則維護：

```text
完整頁面
→ pages

可重複使用 UI
→ components

可抽離 / 重複使用的 Vue 邏輯
→ composables

Backend API
→ api

跨頁面共享狀態
→ stores

TypeScript 資料型別
→ types

共用工具函式
→ utils
```

不為拆分而拆分。

只有當 UI、邏輯或狀態具有獨立職責或重複使用需求時，再建立 Component、Composable 或 Store。

---

## 7. 命名方式

### Vue Component

使用 PascalCase：

```text
CourseCard.vue
KnowledgeCard.vue
QuestionCard.vue
```

### Composable

使用 `use` 開頭：

```text
useAuth.ts
useCourses.ts
useQuiz.ts
```

### API

```text
auth.api.ts
course.api.ts
question.api.ts
```

### Type

```text
auth.ts
course.ts
question.ts
```

---

## 8. 維護原則

當以下前端內容發生變更時，需同步更新本 README：

- 前端目錄架構
- Pages / Components / Composables 分工
- 主要路由
- Authentication 前端架構
- 已完成的主要功能
- 重要前端套件或技術調整

本 README 僅記錄前端目前實際架構與已完成功能，未完成的功能不列入完成項目。
