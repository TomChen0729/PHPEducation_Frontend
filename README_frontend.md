# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 主要記錄目前前端架構、已完成功能、正式串接 API，以及仍在開發中的功能。

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

## 3. 開發環境與 API Base URL

Backend：

```text
http://127.0.0.1:8000
```

Frontend：

```text
http://localhost:9000
```

Frontend API Base URL：

```env
QCLI_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Axios Request Interceptor 會自動附加 Bearer Token。

目前不在 Axios 全域強制設定：

```text
Content-Type: application/json
```

讓一般 JSON Request 與教材 Excel `FormData` 上傳都能由 Axios / Browser 自動使用正確的 Content-Type。

---

## 4. 主要路由

```text
/                           → 導向登入頁
/login                      → 登入頁
/teacherApplication         → 教師帳號申請

/admin                      → 管理員首頁
/admin/userManagement       → 管理員－使用者管理

/teacher                    → 教師首頁
/teacher/courseManagement   → 教師－課程管理
/teacher/course/:courseId   → 教師－單一課程工作區

/student                    → 學生首頁
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

目前已建立角色共用 Navbar。

主要檔案：

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
- 點擊系統標題返回角色首頁
- Desktop Navigation
- Mobile Hamburger Menu
- RWD

---

## 8. 教師帳號申請

教師帳號申請頁目前已正式串接 Backend。

前端架構：

```text
teacherApplication.vue
        ↓
useTeacherApplication.ts
        ↓
teacher-application.api.ts
        ↓
Axios
        ↓
Backend
```

表單欄位：

- 姓名
- Email
- 申請原因（選填）

正式 API：

```text
POST /api/v1/teacher-applications
```

Request：

```text
name
email
reason
```

目前已處理：

- 申請成功提示
- Backend Validation Error
- Email 已存在
- 已有 Pending 申請
- 公開頁面，不需要登入

---

## 9. 管理員－使用者管理

路由：

```text
/admin/userManagement
```

目前此頁已移除原本的 Mock 資料，改為正式串接 Backend API。

主要功能：

```text
使用者管理
├─ 統計資訊
├─ 教師申請核准
└─ 學生帳號 / 課程開通
```

主要前端結構：

```text
pages/admin/userManagement.vue

components/admin/user-management/
├─ UserStatsCards.vue
├─ TeacherApprovalPanel.vue
└─ CourseActivationPanel.vue

composables/
└─ useUserManagement.ts

api/
└─ admin-user-management.api.ts
```

### 9.1 管理員統計

正式 API：

```text
GET /api/v1/stats
```

目前顯示：

- 教師總數
- 學生總數
- 課程總數
- 本學期課程數
- 目前學期

Backend 欄位：

```text
teacher_count
student_count
course_count
semester_course_count
semester
```

統計卡片已支援 Desktop / Tablet / Mobile RWD。

---

### 9.2 教師申請核准

正式 API：

```text
GET  /api/v1/teacher-applications?status=pending
POST /api/v1/teacher-applications/{id}/approve
```

目前功能：

- 顯示 Pending 教師申請
- 顯示姓名 / Email / 申請原因
- 核准前 ConfirmDialog
- 核准 Loading
- 核准成功後自動從 Pending 清單移除
- 核准成功後重新更新統計資料
- 前端不顯示新建立帳號 / 密碼結果，以成功提示為主

---

### 9.3 學生帳號與課程開通

目前已改為正式流程：

```text
取得課程
   ↓
管理員選擇課程
   ↓
取得該課程 Pending 學生
   ↓
搜尋學生
   ↓
單選 / 全選
   ↓
批次開通
```

正式 API：

```text
GET  /api/v1/courses

GET  /api/v1/student-applications
     ?course_id={courseId}
     &status=pending
     &q={keyword}

POST /api/v1/student-applications/approve
```

批次開通 Request：

```json
{
  "course_id": 5,
  "item_ids": [1, 2, 3]
}
```

Backend 會處理：

```text
學生已有帳號
→ 不重複建立帳號
→ 加入該課程

學生尚無帳號
→ 建立學生帳號
→ 加入該課程

最後
→ 對應 Application Item 改為 approved
```

前端目前顯示：

- 學號
- 姓名
- Email
- 班級
- 申請教師
- 已有帳號 / 需建立帳號
- 單選
- 全選
- 已選數量
- 搜尋
- 開通 Loading
- 成功後重新取得 Pending 清單
- 成功後重新取得統計資料

---

## 10. 教師－課程管理

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
- 進入單一課程工作區

### 開課學期

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

### Course Card

`CourseCard.vue` 顯示：

- 課程名稱
- 學年度 / 學期
- 課程說明
- 編輯
- 刪除
- 進入課程

課程說明區塊固定高度，內容過長使用多行省略，避免不同課程說明長度造成卡片高度不一致。

---

## 11. 教師－單一課程工作區

路由：

```text
/teacher/course/:courseId
```

目前使用 Tab 整合單一課程相關功能：

```text
課程工作區
├─ 課程資訊
├─ 學生管理
└─ 教材管理
```

主要元件：

```text
components/teacher/course-workspace/
├─ CourseInfoPanel.vue
├─ CourseStudentPanel.vue
├─ CourseMaterialPanel.vue
├─ MaterialTreeViewer.vue
└─ MaterialDraftEditor.vue
```

### 11.1 課程資訊

已正式串接：

```text
GET /api/v1/teacher/courses/{courseId}
PUT /api/v1/teacher/courses/{courseId}
```

支援：

- 顯示課程名稱
- 顯示課程說明
- 顯示學期
- 修改課程
- Loading
- Notify

### 11.2 學生管理

目前教師端課程工作區的學生管理 UI 仍為 Mock。

目前用途：

- 測試課程工作區版面
- 測試學生列表
- 測試新增 / 移除互動

畫面上需明確標示：

```text
此區學生資料目前為 MOCK，
新增或刪除不會寫入資料庫。
```

後續再正式串接教師端學生申請 / 課程學生管理 API。

---

## 12. 教材管理

教材管理目前已進入正式實作與 API 串接階段，不再是「尚未開始」。

Backend 教材階層：

```text
Course
└─ Topic
   └─ Chapter
      └─ Unit
         └─ Knowledge Card
            ├─ title
            ├─ content
            └─ example
```

目前新增 `example` 欄位，用於知識卡的程式碼、操作或內容範例。

---

### 12.1 Excel 教材匯入

流程：

```text
下載 Excel 範本
        ↓
教師填寫教材
        ↓
上傳 .xlsx
        ↓
Backend Parser
        ↓
建立 Material Draft
        ↓
Frontend 顯示 Draft
```

正式 API：

```text
GET  /api/v1/teacher/materials/template

POST /api/v1/teacher/courses/{courseId}/materials/import
```

Excel 上傳使用：

```text
multipart/form-data
```

欄位：

```text
file
```

目前 Frontend 已完成：

- Excel 範本下載
- QFile 選擇 `.xlsx`
- FormData 上傳
- Import Loading
- 匯入成功後 Dialog 自動關閉
- 匯入成功後重新取得 Draft List
- 匯入錯誤顯示在 Import Dialog 內
- 教材名稱重複時 Dialog 保持開啟
- 重新選檔時清除舊錯誤

---

### 12.2 Material Draft

正式 API：

```text
GET  /api/v1/teacher/courses/{courseId}/material-drafts
POST /api/v1/teacher/courses/{courseId}/material-drafts
```

一門課程可以有多份 Material Draft。

Draft 狀態：

```text
draft
published
archived
```

目前前端教材卡片可顯示：

- 教材名稱
- Draft 狀態
- 查看教材
- 編輯教材
- 發布
- Published 建立新的編輯 Draft

---

### 12.3 查看教材

目前已建立：

```text
MaterialTreeViewer.vue
```

查看 Dialog：

- 固定寬度 / 高度
- 內容超出時在 Dialog 內 Scroll
- Topic / Chapter / Unit / Knowledge Card 階層視覺區分
- 顯示 Knowledge Card title
- 顯示 content
- 顯示 example

階層：

```text
Topic
→ Chapter
   → Unit
      → Knowledge Card
```

---

### 12.4 編輯教材

目前已建立：

```text
MaterialDraftEditor.vue
```

位置：

```text
src/components/teacher/course-workspace/MaterialDraftEditor.vue
```

目前前端已建立 Draft Editor 第一版，支援：

```text
Topic
├─ 新增
├─ 修改
└─ 刪除

Chapter
├─ 新增
├─ 修改
└─ 刪除

Unit
├─ 新增
├─ 修改
└─ 刪除

Knowledge Card
├─ 新增
├─ 修改
├─ 刪除
├─ title
├─ content
└─ example
```

Draft CRUD API：

```text
POST   /api/v1/teacher/material-drafts/{draftId}/topics
PUT    /api/v1/teacher/material-drafts/{draftId}/topics/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/topics/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/topics/{topicId}/chapters
PUT    /api/v1/teacher/material-drafts/{draftId}/chapters/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/chapters/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/chapters/{chapterId}/units
PUT    /api/v1/teacher/material-drafts/{draftId}/units/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/units/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/units/{unitId}/knowledge-cards
PUT    /api/v1/teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}
```

目前編輯器架構已完成，仍需持續進行實際操作測試與錯誤處理確認。

---

### 12.5 發布教材

正式 API：

```text
POST /api/v1/teacher/material-drafts/{draftId}/publish
```

目前流程：

```text
Draft
↓
教師確認
↓
Publish
↓
正式教材
```

已發布教材若需要修改：

```text
Published
↓
建立新的 Draft
↓
編輯
↓
再次發布
```

舊 Published 版本由 Backend 管理為 Archived。

---

## 13. Dashboard

目前已建立：

```text
dashboard.api.ts
        ↓
useDashboard.ts
        ↓
GET /api/v1/dashboard
```

Backend 依角色回傳 Dashboard 資料。

另外管理員的總數統計已獨立使用：

```text
GET /api/v1/stats
```

Dashboard 頁面後續仍可再依角色需求持續擴充。

---

## 14. 目前正式 API 狀態

### Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Admin

```text
GET  /api/v1/stats
GET  /api/v1/courses

GET  /api/v1/teacher-applications
POST /api/v1/teacher-applications/{id}/approve

GET  /api/v1/student-applications
POST /api/v1/student-applications/approve
```

### Teacher Course

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

### Teacher Material

```text
GET  /api/v1/teacher/materials/template
POST /api/v1/teacher/courses/{courseId}/materials/import

GET  /api/v1/teacher/courses/{courseId}/material-drafts
POST /api/v1/teacher/courses/{courseId}/material-drafts

POST   /api/v1/teacher/material-drafts/{draftId}/topics
PUT    /api/v1/teacher/material-drafts/{draftId}/topics/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/topics/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/topics/{topicId}/chapters
PUT    /api/v1/teacher/material-drafts/{draftId}/chapters/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/chapters/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/chapters/{chapterId}/units
PUT    /api/v1/teacher/material-drafts/{draftId}/units/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/units/{nodeId}

POST   /api/v1/teacher/material-drafts/{draftId}/units/{unitId}/knowledge-cards
PUT    /api/v1/teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}
DELETE /api/v1/teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}

POST /api/v1/teacher/material-drafts/{draftId}/publish
```

### Student Material

Backend 已提供：

```text
GET /api/v1/student/courses/{courseId}/topics
GET /api/v1/student/topics/{topicId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

學生端教材畫面目前尚未正式完成。

---

## 15. 目前尚未完成 / 後續工作

目前主要待辦：

```text
1. 教師課程工作區－學生管理
   → 移除 Mock
   → 串接正式教師端學生申請 / 課程學生 API

2. MaterialDraftEditor
   → 完整實測 Topic / Chapter / Unit / Knowledge Card CRUD
   → 確認 example 欄位新增 / 修改 / 顯示
   → 完善 Validation / Error UI

3. 教材發布
   → 完整測試 Published / Archived / 新 Draft 流程

4. Student 教材頁
   → 顯示正式 Published 教材
   → 建立 Topic / Chapter / Unit / Knowledge Card 瀏覽介面

5. Dashboard
   → 依 Admin / Teacher / Student 角色進一步完成畫面
```

---

## 16. 資料庫同步注意事項

Backend 更新資料表結構後，本機資料庫也需要同步。

此次 `student_applications` / `student_application_items` 結構更新後，曾因本機使用舊資料庫而出現：

```text
Unknown column 'course_id' in 'where clause'
```

重新匯入最新資料庫後即可正常使用。

因此之後 Backend 若有資料庫 Schema 更新，需要同步：

```text
最新 Backend
+
最新 Migration / SQL Database
```

避免 Backend 程式碼與本機 MySQL 結構不同步。

---

## 17. 前端開發原則

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

目前以：

- 職責清楚
- 前後端分離
- 功能模組化
- RWD
- API 狀態清楚
- Mock 與正式資料明確區分

為主要開發原則，不過度拆分尚未需要的結構。
