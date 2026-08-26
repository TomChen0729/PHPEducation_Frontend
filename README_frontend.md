# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 主要記錄截至 **2026-08-25** 的前端架構、已完成功能、正式 API 串接狀態，以及目前仍待確認或開發中的功能。

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
Component
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

SCSS 依功能與頁面分檔，目前不另外建立尚未需要的全域 mixin / variable 架構。

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

Axios Request Interceptor 會自動附加：

```text
Authorization: Bearer {token}
```

目前不在 Axios 全域強制設定：

```text
Content-Type: application/json
```

教材 Excel 使用 `FormData` 上傳時，交由 Axios / Browser 自動設定正確的 multipart boundary，避免上傳時發生 422。

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
- `admin` 只進入管理員頁面
- `/teacherApplication` 為公開頁面
- 登入後依角色導向對應首頁

---

## 7. 共用 Navbar

目前已建立角色共用 Navbar。

主要檔案：

```text
components/navigation/AppNavbar.vue
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

目前表單欄位：

- 姓名
- Eportal Email
- 自訂帳號
- 申請原因

四個欄位目前皆為必填。

正式 API：

```text
POST /api/v1/teacher-applications
```

Request：

```json
{
  "name": "陳老師",
  "email": "chen@example.com",
  "account": "teacher_chen",
  "reason": "申請教師帳號"
}
```

目前已處理：

- 前端欄位驗證
- Email 格式驗證
- 申請成功 Notify
- Backend Validation Error
- 帳號 / Email 重複錯誤
- 成功後清空表單
- 公開頁面，不需要登入

---

## 9. 管理員－使用者管理

路由：

```text
/admin/userManagement
```

主要前端結構：

```text
pages/admin/userManagement.vue

components/admin/user-management/
├─ UserStatsCards.vue
├─ TeacherApprovalPanel.vue
├─ CourseActivationPanel.vue
└─ CourseStudentListDialog.vue

composables/
└─ useUserManagement.ts

api/
└─ admin-user-management.api.ts
```

目前頁面分為：

```text
使用者管理
├─ 統計資訊
├─ 教師申請核准
└─ 學生帳號 / 課程開通
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

統計卡片支援 Desktop / Tablet / Mobile RWD。

### 9.2 教師申請核准

正式 API：

```text
GET  /api/v1/teacher-applications?status=pending
POST /api/v1/teacher-applications/{id}/approve
```

目前功能：

- 顯示 Pending 教師申請
- 顯示申請資料
- 核准前 ConfirmDialog
- 核准 Loading
- 核准成功後重新更新 Pending 清單
- 核准成功後重新更新統計資料
- Notify 顯示成功 / 失敗狀態

### 9.3 學生帳號與課程開通

目前前端已有一版正式 API 串接：

```text
GET  /api/v1/courses

GET  /api/v1/student-applications
     ?course_id={courseId}
     &status=pending
     &q={keyword}

POST /api/v1/student-applications/approve
```

目前 UI / 流程已做到：

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

批次 Request：

```json
{
  "course_id": 5,
  "item_ids": [1, 2, 3]
}
```

前端已具備：

- 課程選擇
- Pending 學生列表
- 學號 / 姓名 / Email / 班級 / 申請教師
- 已有帳號狀態
- 單選 / 全選
- 搜尋
- 已選數量
- ConfirmDialog
- 開通 Loading
- 成功後重新取得 Pending 清單
- 成功後重新取得統計資料

> **目前狀態：此區前端程式已完成一版，但學生帳號申請 / 開通的最終流程仍需與 Backend 再確認，因此暫不視為最終定案功能。**

---

## 10. 教師－課程管理

路由：

```text
/teacher/courseManagement
```

正式 API：

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

目前使用 Tab 整合：

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
- API 成功後自動關閉 Dialog
- Loading
- Notify

### 11.2 學生管理

教師端課程工作區的學生管理目前仍為 **Mock**。

目前用途：

- 測試課程工作區版面
- 測試學生列表
- 測試新增 / 移除互動

目前畫面明確標示：

```text
此區學生資料目前為 MOCK，
新增或刪除不會寫入資料庫。
```

此功能待學生帳號 / 課程加入流程與 Backend 確認後再正式串接。

---

## 12. 教師－教材管理

教材管理目前已正式串接多組 Backend API。

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

目前教材管理畫面將資料區分為：

```text
已發布主題
+
草稿主題
```

`archived` 不顯示在目前教材卡片區。

---

### 12.1 Excel 教材匯入

流程：

```text
新增教材
   ↓
輸入主題名稱
   ↓
下載 / 填寫 Excel 範本
   ↓
選擇 .xlsx
   ↓
FormData：
topic + file
   ↓
Backend Parser
   ↓
建立 Material Draft
   ↓
重新取得 Draft List
```

正式 API：

```text
GET  /api/v1/teacher/materials/template
POST /api/v1/teacher/courses/{courseId}/materials/import
```

Multipart 欄位：

```text
topic
file
```

目前 Frontend 已完成：

- Import Dialog
- 主題名稱輸入
- Excel 範本下載
- QFile 選擇 `.xlsx`
- `FormData` 上傳
- Import Loading
- 匯入成功後 Dialog 自動關閉
- 匯入成功後重新取得 Draft
- 匯入失敗時 Dialog 保持開啟
- 錯誤改用短暫 Quasar Notify 顯示
- 成功後 Notify
- 不在 Axios 全域固定 `Content-Type`

---

### 12.2 草稿主題

草稿來源：

```text
GET /api/v1/teacher/courses/{courseId}/material-drafts
```

目前 `CourseMaterialPanel.vue` 會將 `status = draft` 的 Material Draft 展開成 Topic Card。

目前每張草稿 Topic Card 顯示：

- Topic 名稱
- 章節數量
- `草稿` Badge
- 查看教材
- 編輯教材
- 刪除 Topic
- 發布 Draft

草稿 Topic 刪除：

```text
DELETE /api/v1/teacher/material-drafts/{draftId}/topics/{nodeId}
```

目前刪除前會顯示 ConfirmDialog，成功後重新取得 Draft List。

---

### 12.3 已發布主題

已發布區目前不再以 `published MaterialDraft` 當作主要顯示資料，而是直接讀取正式教材 Topic：

```text
GET /api/v1/teacher/courses/{courseId}/topics
```

每一個正式 Topic 顯示成一張 Card。

目前顯示：

- Topic 名稱
- 章節數量（`item_count`）
- `已發布` Badge
- 查看教材
- 加入草稿編輯
- 刪除 Topic

已發布 Topic 刪除：

```text
DELETE /api/v1/teacher/topics/{topicId}
```

刪除成功後重新取得正式 Topic List。

---

### 12.4 查看已發布教材

已發布 Topic 不再直接使用舊 Published Draft tree 顯示。

目前前端會依序讀取正式教材：

```text
GET /api/v1/teacher/topics/{topicId}/chapters
        ↓
GET /api/v1/teacher/chapters/{chapterId}/units
        ↓
GET /api/v1/teacher/units/{unitId}/knowledge-cards
```

`useTeacherMaterialManagement.ts` 會把正式 Topic / Chapter / Unit / Knowledge Card 重新組成 Viewer 可以使用的 tree，再交給：

```text
MaterialTreeViewer.vue
```

顯示。

---

### 12.5 MaterialTreeViewer

目前已建立：

```text
MaterialTreeViewer.vue
```

支援顯示：

```text
Chapter
→ Unit
   → Knowledge Card
```

Knowledge Card 顯示：

- title
- content
- example

Viewer 可同時顯示 Draft 與由正式教材 API 組出的 Published Topic tree。

---

### 12.6 MaterialDraftEditor

目前已建立：

```text
MaterialDraftEditor.vue
```

目前 Topic 由外層選定，Editor 主要編輯該 Topic 底下內容。

目前 UI 支援：

```text
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
└─ 刪除
```

Knowledge Card 欄位：

```text
title
content
example
```

Draft CRUD API：

```text
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

目前 Topic 本身的建立主要由「新增教材 / Excel 匯入」處理，Topic 刪除則從教材 Card 操作。

---

### 12.7 已發布主題加入草稿編輯

目前已實作：

```text
已發布 Topic
   ↓
加入草稿編輯
   ↓
POST /api/v1/teacher/courses/{courseId}/material-drafts
   ↓
Backend 從目前正式教材建立 Draft
   ↓
Frontend 找到被選擇的 Topic
   ↓
開啟 MaterialDraftEditor
```

Editor 透過 `topicName` 指定目前要編輯的 Topic，避免一份 Draft 內有多個 Topic 時固定只編輯第一個 Topic。

---

### 12.8 發布教材

正式 API：

```text
POST /api/v1/teacher/material-drafts/{draftId}/publish
```

目前流程：

```text
Draft
↓
ConfirmDialog
↓
Publish
↓
重新取得 Draft List
+
重新取得 Published Topic List
↓
Notify
```

目前 Frontend 已將「草稿資料」與「正式 Topic 資料」分開取得。

---

### 12.9 教材管理目前仍待確認事項

目前仍需與 Backend 確認 / 調整的部分：

1. **新增教材同名判斷**
   - 已刪除的正式 Topic 再次使用相同名稱時，Backend 仍可能因舊 `material_drafts` / archived 歷史資料判定名稱已存在。
   - 此問題屬 Backend 匯入重複名稱規則，不是 Frontend 顯示問題。

2. **發布版本行為**
   - Backend 目前文件描述為以 Draft tree 整棵覆寫正式教材。
   - 需要持續確認多 Topic 發布時是否符合「保留既有正式 Topic」的需求。

3. **建立 / 更新時間**
   - Backend 資料表有 `created_at / updated_at`。
   - Frontend 目前 `MaterialDraft` / `PublishedTopic` Type 尚未正式加入時間欄位，Card 也尚未顯示最後更新時間。

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

另外管理員統計使用：

```text
GET /api/v1/stats
```

Dashboard 頁面仍可再依 Admin / Teacher / Student 角色持續擴充。

---

## 14. 目前正式 API 串接狀態

### Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Teacher Application

```text
POST /api/v1/teacher-applications
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

> 學生帳號開通相關 API 已接一版，但流程仍待與 Backend 確認。

### Teacher Course

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

### Teacher Material－Import / Draft

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

### Teacher Material－Published

```text
GET    /api/v1/teacher/courses/{courseId}/topics
DELETE /api/v1/teacher/topics/{topicId}

GET /api/v1/teacher/topics/{topicId}/chapters
GET /api/v1/teacher/chapters/{chapterId}/units
GET /api/v1/teacher/units/{unitId}/knowledge-cards
```

### Student Material

Backend 已提供：

```text
GET /api/v1/student/courses/{courseId}/topics
GET /api/v1/student/topics/{topicId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

學生端教材 UI 目前尚未正式完成。

---

## 15. 目前完成度摘要

| 功能 | 狀態 |
|------|------|
| Login / Logout / Restore Session | ✅ 已串接 |
| Router Guard / Role Guard | ✅ 已完成 |
| Role Navbar / RWD | ✅ 已完成 |
| 教師帳號申請 | ✅ 已串接 |
| 管理員統計 | ✅ 已串接 |
| 管理員教師核准 | ✅ 已串接 |
| 管理員學生帳號開通 | 🟡 已有前端一版，流程待 Backend 確認 |
| 教師課程 CRUD | ✅ 已串接 |
| 教師課程工作區－課程資訊 | ✅ 已串接 |
| 教師課程工作區－學生管理 | ⚪ MOCK |
| Excel 教材匯入 | ✅ 已串接 |
| Draft Topic Card | ✅ 已完成 |
| Published Topic Card | ✅ 已改用正式 Topic API |
| 查看 Draft 教材 | ✅ 已完成 |
| 查看 Published 教材 | ✅ 已串接正式鑽層 API |
| Published → Draft 編輯 | ✅ 已建立前端流程 |
| Chapter / Unit / Knowledge Card 編輯 | ✅ 已串接 |
| Draft Topic 刪除 | ✅ 已串接 |
| Published Topic 刪除 | ✅ 已串接 |
| 教材發布 | 🟡 已串接，版本行為持續測試 |
| 教材 Card 最後更新時間 | ⚪ 尚未完成 |
| Student 教材頁 | ⚪ 尚未完成 |
| Dashboard 完整角色內容 | 🟡 持續開發 |

---

## 16. 目前優先待辦

```text
1. 學生帳號流程
   → 與 Backend 確認最終申請 / 開通 / 課程加入方式
   → 確認後再完成 Admin 與 Teacher 學生管理

2. 教材管理
   → 確認多 Topic 發布行為
   → 確認已刪除 Topic 後同名教材可再次匯入
   → 完整測試 Published → Draft → Edit → Publish
   → 補上 created_at / updated_at 並顯示 Card 最後更新時間

3. Student 教材頁
   → 串接正式 Published 教材
   → 建立 Topic / Chapter / Unit / Knowledge Card 瀏覽介面

4. Dashboard
   → 依 Admin / Teacher / Student 角色完成內容
```

---

## 17. 資料庫同步注意事項

Backend 更新資料表結構後，本機資料庫也需要同步。

曾發生：

```text
Unknown column 'course_id' in 'where clause'
```

原因為 Backend 程式碼已更新，但本機 MySQL 仍是舊 Schema。

因此 Backend 若有資料庫 Schema 更新，需要同步：

```text
最新 Backend
+
最新 Migration / SQL Database
```

避免 Backend 程式碼與本機 MySQL 結構不同步。

---

## 18. 前端開發原則

```text
pages
→ 完整頁面 / 頁面層流程

components
→ UI 與事件 emit

composables
→ API 流程、Loading、Error、資料狀態

api
→ Backend API Request

stores
→ 跨頁面共享狀態

types
→ TypeScript 型別

css
→ 各功能 / 頁面的樣式與 RWD
```

目前開發原則：

- 職責清楚
- 前後端分離
- 功能模組化
- RWD
- API 狀態清楚
- Mock 與正式資料明確區分
- Dialog API 成功後才關閉
- API Error 以短暫 Notify 為主
- 不過度拆分尚未需要的共用架構
