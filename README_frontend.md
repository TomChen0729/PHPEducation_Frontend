# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 依目前前端 `src` 程式碼整理，更新日期：**2026-08-30**。

目前已完成的主要功能包含：

- 登入 / 登出 / Session Restore
- Role-based Router Guard
- 共用 Navbar
- 教師帳號申請
- 管理員教師申請核准
- 管理員學生帳號與課程開通
- 教師課程 CRUD
- 課程班級 `class_name`
- 教師班級學生管理
- 教師教材匯入 / 草稿編輯 / 發布
- 教師正式教材瀏覽
- 學生我的課程
- 學生正式教材瀏覽
- Teacher / Student 共用教材 Viewer
- CodeMirror 唯讀程式碼範例顯示

---

## 1. 前端技術

目前使用：

```text
Vue 3
Quasar Framework
TypeScript
Vue Router
File-based Routing
Pinia
Axios
SCSS
CodeMirror
ESLint
Prettier
```

主要角色：

```text
Admin
Teacher
Student
```

角色代表色：

```text
Admin   → Purple
Teacher → Blue
Student → Teal
```

學生相關頁面主要使用 Quasar：

```text
teal-1 ～ teal-14
```

教材共用 Viewer 則依角色切換 Theme：

```text
Teacher → blue
Student → teal
```

---

## 2. 前端架構

目前主要資料流程：

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

跨頁面共用狀態使用 Pinia。

目前主要目錄：

```text
src/
├─ api/
│  ├─ admin-user-management.api.ts
│  ├─ auth.api.ts
│  ├─ dashboard.api.ts
│  ├─ student-account.api.ts
│  ├─ student-material.api.ts
│  ├─ teacher-application.api.ts
│  ├─ teacher-course-student.api.ts
│  ├─ teacher-course.api.ts
│  └─ teacher-material.api.ts
│
├─ boot/
│  ├─ auth.ts
│  └─ axios.ts
│
├─ components/
│  ├─ admin/
│  ├─ common/
│  ├─ material/
│  ├─ navigation/
│  └─ teacher/
│
├─ composables/
│  ├─ useAuth.ts
│  ├─ useDashboard.ts
│  ├─ useStudentMaterial.ts
│  ├─ useTeacherApplication.ts
│  ├─ useTeacherCourseStudents.ts
│  ├─ useTeacherCourseWorkspace.ts
│  ├─ useTeacherCourses.ts
│  ├─ useTeacherMaterialManagement.ts
│  └─ useUserManagement.ts
│
├─ config/
│  └─ navigation.ts
│
├─ css/
│  ├─ app.scss
│  ├─ quasar.variables.scss
│  └─ components/
│     ├─ admin/
│     ├─ material/
│     ├─ student/
│     └─ teacher/
│
├─ pages/
│  ├─ admin/
│  ├─ student/
│  ├─ teacher/
│  ├─ login.vue
│  └─ teacherApplication.vue
│
├─ router/
│  └─ index.ts
│
├─ stores/
│  └─ auth.ts
│
├─ types/
│
└─ utils/
   └─ auth-route.ts
```

目前原則：

```text
Page
→ 頁面組合與頁面層事件

Component
→ UI 顯示與 emit

Composable
→ 資料、Loading、Error、API 流程

API
→ Axios Request

Store
→ 跨頁面共用狀態

Types
→ TypeScript 資料結構

SCSS
→ UI 樣式與 RWD
```

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

Frontend `.env`：

```env
QCLI_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Axios：

```text
src/boot/axios.ts
```

目前會自動：

```text
Authorization: Bearer {token}
Accept: application/json
```

Token 來源：

```text
sessionStorage
└─ auth_token
```

### FormData

目前不在 Axios 全域固定：

```text
Content-Type: application/json
```

如果 Request 是：

```ts
FormData
```

Interceptor 會移除手動設定的 `Content-Type`，讓 Browser 自動產生：

```text
multipart/form-data;
boundary=...
```

目前學生名冊與教材 Excel 都使用此方式上傳。

---

## 4. Authentication

主要檔案：

```text
api/auth.api.ts
composables/useAuth.ts
stores/auth.ts
boot/auth.ts
```

正式 API：

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

登入成功後儲存：

```text
token
user
role
```

Store：

```text
stores/auth.ts
```

主要狀態：

```ts
user
token
role
isLoggedIn
```

Session Restore：

```text
Browser Refresh
      ↓
sessionStorage auth_token
      ↓
GET /auth/me
      ↓
有效
→ setUser()

無效
→ clearAuth()
```

---

## 5. Router Guard

Router：

```text
src/router/index.ts
```

使用：

```text
vue-router/auto-routes
```

頁面透過：

```ts
definePage({
  meta: {
    requiresAuth: true,
    roles: ['teacher'],
  },
});
```

限制角色。

目前角色 Layout：

```text
/admin
→ admin only

/teacher
→ teacher only

/student
→ student only
```

未登入：

```text
受保護頁面
↓
/login?redirect=...
```

角色不符：

```text
Admin   → /admin
Teacher → /teacher
Student → /student
```

公開頁：

```text
/login
/teacherApplication
```

---

## 6. Navbar

共用元件：

```text
components/navigation/AppNavbar.vue
config/navigation.ts
```

依登入角色切換：

```text
Admin
Teacher
Student
```

目前 Navigation 設定：

### Admin

```text
首頁
使用者管理
課程管理
知識圖譜
```

### Teacher

```text
首頁
課程管理
教材管理
題庫管理
知識圖譜
學習分析
```

### Student

```text
首頁
我的課程
學習進度
學習歷程
```

> 注意：Navigation 中部分路由目前仍只有選單設定，尚未建立正式頁面，詳見「目前待開發功能」。

---

# 7. 教師帳號申請

頁面：

```text
/teacherApplication
```

架構：

```text
teacherApplication.vue
        ↓
useTeacherApplication.ts
        ↓
teacher-application.api.ts
```

正式 API：

```text
POST /api/v1/teacher-applications
```

目前欄位：

```text
姓名
Eportal 信箱
帳號名稱
申請原因
```

目前功能：

- 必填驗證
- Email 格式驗證
- Backend Validation Error
- 成功 Notify
- 失敗 Notify
- 成功後清空表單
- Reset Validation
- 不需登入即可使用

---

# 8. 管理員－使用者管理

路由：

```text
/admin/userManagement
```

主要結構：

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

頁面目前包含：

```text
使用者管理
├─ 系統統計
├─ 教師申請核准
└─ 學生帳號 / 課程開通
```

---

## 8.1 系統統計

API：

```text
GET /api/v1/stats
```

前端目前顯示：

```text
教師總數
學生總數
課程總數
本學期課程數
目前學期
```

Backend 欄位：

```text
teacher_count
student_count
course_count
semester_course_count
semester
```

---

## 8.2 教師申請核准

API：

```text
GET  /api/v1/teacher-applications?status=pending
POST /api/v1/teacher-applications/{id}/approve
```

目前流程：

```text
Pending 教師
      ↓
管理員按核准
      ↓
ConfirmDialog
      ↓
POST Approve
      ↓
移出 Pending List
      ↓
重新取得 Stats
      ↓
Notify
```

---

## 8.3 學生帳號與課程開通

API：

```text
GET /api/v1/courses

GET /api/v1/student-applications
    ?course_id={courseId}
    &status=pending
    &q={keyword}

POST /api/v1/student-applications/approve
```

目前流程：

```text
取得全部課程
+
取得全站 Pending Students
        ↓
找出有 Pending Student 的 Course ID
        ↓
課程下拉只顯示有待開通學生的課程
        ↓
選擇課程
        ↓
取得該課程 Pending Students
        ↓
搜尋
        ↓
單選 / 全選
        ↓
批次開通
```

課程下拉目前使用：

```vue
behavior="menu"
```

因此直接從欄位下方展開，不使用 Dialog 模式。

課程選項顯示：

```text
學期｜課程名稱｜班級
```

例如：

```text
115上｜程式設計｜資應二甲
```

學生列表目前可顯示：

```text
學號
姓名
Email
班級
申請教師
是否已有帳號
```

批次開通：

```json
{
  "course_id": 5,
  "item_ids": [1, 2, 3]
}
```

成功後：

```text
重新整理 Pending Students
重新整理 Pending Courses
重新整理 Stats
```

---

# 9. 教師－課程管理

路由：

```text
/teacher/courseManagement
```

架構：

```text
courseManagement.vue
        ↓
useTeacherCourses.ts
        ↓
teacher-course.api.ts
```

正式 API：

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

目前支援：

- 顯示教師自己的課程
- 新增課程
- 編輯課程
- 刪除課程
- Loading
- Error
- ConfirmDialog
- Notify
- Empty State
- RWD
- 進入單一課程工作區

課程資料：

```text
name
description
semester
class_name
teacher_id
```

---

## 9.1 課程班級

目前課程正式加入：

```text
class_name
```

已使用於：

```text
課程新增
課程編輯
課程資料
教師班級學生
管理員學生開通課程下拉
學生我的課程
學生教材頁
```

---

## 9.2 學期格式

Frontend UI：

```text
學年度
+
上學期 / 下學期
```

送 Backend：

```text
115-1
115-2
```

UI 顯示：

```text
115 學年度・上學期
115 學年度・下學期
```

---

# 10. 教師－單一課程工作區

路由：

```text
/teacher/course/:courseId
```

目前使用 Tab：

```text
課程工作區
├─ 課程資訊
├─ 班級學生
└─ 教材管理
```

主要元件：

```text
components/teacher/course-workspace/
├─ CourseInfoPanel.vue
├─ CourseStudentPanel.vue
├─ CourseMaterialPanel.vue
└─ MaterialDraftEditor.vue
```

共用教材 Viewer：

```text
components/material/MaterialTreeViewer.vue
```

---

## 10.1 課程資訊

正式 API：

```text
GET /api/v1/teacher/courses/{courseId}
PUT /api/v1/teacher/courses/{courseId}
```

目前支援：

```text
課程名稱
課程介紹
學期
班級名稱
```

課程說明顯示保留換行。

---

# 11. 教師－班級學生

教師端學生管理目前已不再使用 Mock，已正式串接 Backend。

元件：

```text
components/teacher/course-workspace/CourseStudentPanel.vue
```

資料層：

```text
types/course-student.ts
api/teacher-course-student.api.ts
composables/useTeacherCourseStudents.ts
```

目前分為：

```text
已開通
待審核
```

預設：

```text
approved
```

---

## 11.1 學生名單

API：

```text
GET /api/v1/teacher/courses/{courseId}/student-applications
    ?status=approved

GET /api/v1/teacher/courses/{courseId}/student-applications
    ?status=pending
```

目前功能：

- 已開通 / 待審核切換
- 搜尋學號
- 搜尋姓名
- 搜尋 Email
- 顯示學生人數
- Loading
- Empty State
- Error
- RWD

搜尋目前由 Frontend 對已取得資料進行 Filter。

---

## 11.2 手動新增學生

API：

```text
POST /api/v1/teacher/courses/{courseId}/student-applications
```

目前可一次輸入多位：

```json
{
  "students": [
    {
      "student_no": "1411131001",
      "name": "王小明"
    },
    {
      "student_no": "1411131002",
      "name": "陳小華"
    }
  ]
}
```

前端目前：

- 一次最多 100 筆
- 檢查必填
- 檢查同批重複學號
- 學號不需輸入 `s`
- 新增成功後自動切到待審核
- 成功 Notify
- 失敗 Dialog 保持開啟

---

## 11.3 Excel 匯入學生

下載範本：

```text
GET /api/v1/teacher/student-applications/template
```

上傳：

```text
POST /api/v1/teacher/student-applications
```

FormData：

```text
tid
course_id
file
```

成功後：

```text
加入 Pending
↓
切換到待審核名單
```

---

## 11.4 移除學生

API：

```text
DELETE
/api/v1/teacher/courses/{courseId}/student-applications/{itemId}
```

Pending：

```text
取消待審核申請
```

Approved：

```text
從此課程移除
```

前端確認訊息會明確提示：

```text
學生帳號保留
其他課程不受影響
```

目前沒有提供教師直接編輯學生資料的 UI。

---

# 12. 教師－教材管理

教材管理資料層：

```text
api/teacher-material.api.ts
composables/useTeacherMaterialManagement.ts
types/material.ts
```

教材階層：

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

目前 UI 分成：

```text
已發布
+
草稿
```

---

## 12.1 Excel 教材匯入

下載範本：

```text
GET /api/v1/teacher/materials/template
```

匯入：

```text
POST /api/v1/teacher/courses/{courseId}/materials/import
```

FormData：

```text
topic
file
```

目前功能：

- 輸入 Topic 名稱
- 下載 Excel 範本
- 選擇 `.xlsx`
- FormData
- Loading
- Validation Error
- 成功後關閉 Dialog
- 重新取得 Draft List
- Notify

---

## 12.2 Draft List

API：

```text
GET /api/v1/teacher/courses/{courseId}/material-drafts
```

目前只在草稿區顯示：

```text
status = draft
```

`archived` 不顯示。

---

## 12.3 Published → Draft

API：

```text
POST /api/v1/teacher/courses/{courseId}/material-drafts
```

Request：

```json
{
  "topic_id": 10
}
```

流程：

```text
已發布 Topic
↓
加入草稿編輯
↓
Backend 建立 Draft
↓
開啟 MaterialDraftEditor
```

---

## 12.4 Draft CRUD

Topic：

```text
POST   /teacher/material-drafts/{draftId}/topics
PUT    /teacher/material-drafts/{draftId}/topics/{nodeId}
DELETE /teacher/material-drafts/{draftId}/topics/{nodeId}
```

Chapter：

```text
POST   /teacher/material-drafts/{draftId}/topics/{topicId}/chapters
PUT    /teacher/material-drafts/{draftId}/chapters/{nodeId}
DELETE /teacher/material-drafts/{draftId}/chapters/{nodeId}
```

Unit：

```text
POST   /teacher/material-drafts/{draftId}/chapters/{chapterId}/units
PUT    /teacher/material-drafts/{draftId}/units/{nodeId}
DELETE /teacher/material-drafts/{draftId}/units/{nodeId}
```

Knowledge Card：

```text
POST   /teacher/material-drafts/{draftId}/units/{unitId}/knowledge-cards
PUT    /teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}
DELETE /teacher/material-drafts/{draftId}/knowledge-cards/{nodeId}
```

Knowledge Card：

```text
title
content
example
sort_order
```

---

## 12.5 發布教材

API：

```text
POST /api/v1/teacher/material-drafts/{draftId}/publish
```

流程：

```text
Draft
↓
ConfirmDialog
↓
Publish
↓
重新取得 Draft
+
重新取得 Published Topics
↓
Notify
```

---

## 12.6 正式教材 Topic

列表：

```text
GET /api/v1/teacher/courses/{courseId}/topics
```

刪除：

```text
DELETE /api/v1/teacher/topics/{topicId}
```

正式教材鑽取：

```text
GET /api/v1/teacher/topics/{topicId}/chapters
GET /api/v1/teacher/chapters/{chapterId}/units
GET /api/v1/teacher/units/{unitId}/knowledge-cards
```

Frontend 會重新組成：

```text
MaterialTopicNode
```

再交給：

```text
MaterialTreeViewer
```

顯示。

---

# 13. 共用 MaterialTreeViewer

目前已將：

```text
MaterialTreeViewer
```

抽離 Teacher Workspace，放在：

```text
src/components/material/MaterialTreeViewer.vue
```

樣式：

```text
src/css/components/material/_material-tree-viewer.scss
```

`MaterialTreeViewer.vue` 本身不放 CSS。

目前 Props：

```ts
topic: MaterialTopicNode | null

theme?: 'teacher' | 'student'
```

使用：

```vue
<!-- Teacher -->
<MaterialTreeViewer
  :topic="topic"
  theme="teacher"
/>

<!-- Student -->
<MaterialTreeViewer
  :topic="topic"
  theme="student"
/>
```

---

## 13.1 Teacher Theme

Teacher 維持 Blue：

```text
blue-1
blue-2
blue-3
blue-4
blue-5
blue-7
blue-8
blue-10
...
```

主要用於：

```text
Chapter Border
Unit Background
Tree Line
Icon
Knowledge Card Border
Hover Border
```

教材正文維持黑色：

```scss
color: black;
```

---

## 13.2 Student Theme

Student 使用與 Teacher 完全相同版型。

只將：

```text
blue-*
```

替換為：

```text
teal-*
```

例如：

```text
Teacher              Student

blue-1       →       teal-1
blue-2       →       teal-2
blue-3       →       teal-3
blue-4       →       teal-4
blue-5       →       teal-5
blue-7       →       teal-7
blue-8       →       teal-8
blue-10      →       teal-10
```

教材正文同樣：

```scss
color: black;
```

因此 Teacher / Student：

```text
版型完全相同
只有角色主題色不同
```

---

# 14. CodeExampleViewer

共用元件：

```text
components/common/CodeExampleViewer.vue
```

使用：

```text
CodeMirror
```

目前設定：

- PHP Syntax Highlight
- Read Only
- `editable = false`
- Line Wrapping
- 行號
- 等寬字體
- Teacher / Student Theme
- 元件卸載時 destroy EditorView

使用：

```vue
<CodeExampleViewer
  :code="card.example"
  :theme="theme"
/>
```

Teacher：

```text
Blue Border
Blue Gutter
```

Student：

```text
Teal Border
Teal Gutter
```

---

# 15. Student－我的課程

正式頁面：

```text
/student/courses
```

檔案：

```text
pages/student/courses.vue
```

課程資料來自：

```text
GET /api/v1/dashboard
```

使用：

```text
dashboard.courses
```

目前顯示：

```text
課程名稱
班級
學期
課程說明
查看教材
```

功能：

```text
Loading
Error
Empty State
RWD
```

點擊：

```text
查看教材
```

進入：

```text
/student/course/{courseId}
```

學生介面主要使用：

```text
teal
```

作為角色識別色。

---

# 16. Student－正式教材瀏覽

正式頁面：

```text
/student/course/:courseId
```

資料層：

```text
types/student-material.ts
api/student-material.api.ts
composables/useStudentMaterial.ts
```

Backend API：

```text
GET /api/v1/student/courses/{courseId}/topics

GET /api/v1/student/topics/{topicId}/chapters

GET /api/v1/student/chapters/{chapterId}/units

GET /api/v1/student/units/{unitId}/knowledge-cards
```

Frontend 流程：

```text
學生進入課程
       ↓
GET Topics
       ↓
自動選擇第一個 Topic
       ↓
GET Chapters
       ↓
每個 Chapter GET Units
       ↓
每個 Unit GET Knowledge Cards
       ↓
組成 MaterialTopicNode
       ↓
MaterialTreeViewer
theme="student"
```

目前頁面版型：

```text
┌───────────────┬─────────────────────────┐
│ 教材主題      │ 教材內容                │
│               │                         │
│ Topic A       │ Chapter                 │
│ Topic B       │ └ Unit                  │
│ Topic C       │    └ Knowledge Card     │
│               │       └ Code Example    │
└───────────────┴─────────────────────────┘
```

Desktop：

```text
左側 Topic
右側教材
```

Tablet / Mobile：

```text
上下排列
```

目前功能：

- 顯示課程名稱
- 顯示班級
- 顯示學期
- Topic List
- Chapter 數量
- 最後更新時間
- 自動開啟第一個 Topic
- Topic 切換
- Topic Loading
- Content Loading
- Empty State
- API Error
- 403 權限錯誤
- 404 未修課 / 找不到課程
- 共用 MaterialTreeViewer
- Student Teal Theme
- CodeMirror 範例

---

# 17. Dashboard

資料層：

```text
dashboard.api.ts
useDashboard.ts
types/dashboard.ts
```

API：

```text
GET /api/v1/dashboard
```

目前 Course Type：

```ts
interface DashboardCourse {
  id: number;
  name: string;
  description: string | null;
  semester: string;
  class_name: string;
  teacher_id: number;
}
```

Teacher 首頁目前已有基礎 Course List。

Student `/student/courses` 已正式使用 Dashboard Course 資料。

Admin / Student 首頁內容仍可繼續擴充。

---

# 18. 目前前端正式串接 API

## Authentication

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Dashboard

```text
GET /api/v1/dashboard
```

## Teacher Application

```text
POST /api/v1/teacher-applications

GET /api/v1/teacher-applications
POST /api/v1/teacher-applications/{id}/approve
```

## Admin

```text
GET /api/v1/stats
GET /api/v1/courses

GET /api/v1/student-applications
POST /api/v1/student-applications/approve
```

## Teacher Course

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

## Teacher Course Students

```text
GET /api/v1/teacher/courses/{courseId}/student-applications

POST /api/v1/teacher/courses/{courseId}/student-applications

DELETE
/api/v1/teacher/courses/{courseId}/student-applications/{itemId}

GET /api/v1/teacher/student-applications/template

POST /api/v1/teacher/student-applications
```

## Teacher Materials

```text
GET /api/v1/teacher/materials/template

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

GET    /api/v1/teacher/courses/{courseId}/topics
DELETE /api/v1/teacher/topics/{topicId}

GET /api/v1/teacher/topics/{topicId}/chapters
GET /api/v1/teacher/chapters/{chapterId}/units
GET /api/v1/teacher/units/{unitId}/knowledge-cards
```

## Student Materials

```text
GET /api/v1/student/courses/{courseId}/topics
GET /api/v1/student/topics/{topicId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

---

# 19. 目前完成度

| 功能 | 狀態 |
|---|---|
| Login | ✅ |
| Logout | ✅ |
| Restore Session | ✅ |
| Router Guard | ✅ |
| Role Guard | ✅ |
| 共用 Navbar | ✅ |
| 教師帳號申請 | ✅ |
| 管理員統計 | ✅ |
| 管理員教師核准 | ✅ |
| 管理員學生帳號開通 | ✅ |
| Pending Course Filter | ✅ |
| 管理員課程下拉 Menu | ✅ |
| 課程 `class_name` | ✅ |
| 教師課程 CRUD | ✅ |
| 教師課程資訊 | ✅ |
| 教師班級學生－已開通 | ✅ |
| 教師班級學生－待審核 | ✅ |
| 教師手動新增多位學生 | ✅ |
| 教師 Excel 匯入學生 | ✅ |
| 教師移除學生 | ✅ |
| 教材 Excel 匯入 | ✅ |
| Draft CRUD | ✅ |
| Published → Draft | ✅ |
| 教材發布 | ✅ |
| Published Topic List | ✅ |
| Published 教材 Tree | ✅ |
| MaterialTreeViewer 共用化 | ✅ |
| Teacher Blue Theme | ✅ |
| Student Teal Theme | ✅ |
| CodeMirror Example Viewer | ✅ |
| 學生我的課程 | ✅ |
| 學生正式教材瀏覽 | ✅ |
| Student 題目 / 作答 | ❌ |
| Teacher 作答紀錄 / 覆核 | ❌ |
| Student 學習進度 | ❌ |
| Student 學習歷程 | ❌ |
| Teacher 題庫管理 UI | ❌ |
| Teacher 知識圖譜 UI | ❌ |
| Teacher 學習分析 UI | ❌ |
| Admin 課程管理 UI | ❌ |
| Admin 知識圖譜 UI | ❌ |
| 完整角色 Dashboard | 🟡 |

---

# 20. Backend 已有規劃 / 能力，但 Frontend 尚未完成

依目前專案後端規格，下一階段主要缺口是題目與學習紀錄相關介面。

## 20.1 Student 題目與作答

Frontend 目前沒有：

```text
student-question.api.ts
useStudentQuestions.ts
Student Question Page
Answer UI
```

後續預計需要串接：

```text
GET  /student/courses/{courseId}/questions
GET  /student/questions/{questionId}
POST /student/questions/{questionId}/submit
```

題型規劃包含：

```text
choice
debug
coding
```

---

## 20.2 Teacher 學生作答紀錄

Frontend 目前沒有教師作答紀錄 / 覆核 UI。

後續預計：

```text
GET /teacher/courses/{courseId}/question-records
PUT /teacher/question-records/{recordId}
```

主要用途：

```text
查看學生作答
查看判定結果
correct / wrong 覆核
```

---

## 20.3 Student 學習進度

Navbar 已有：

```text
/student/progress
```

但目前沒有正式頁面。

---

## 20.4 Student 學習歷程

Navbar 已有：

```text
/student/history
```

但目前沒有正式頁面。

---

## 20.5 Teacher 獨立功能頁

Navbar 已有：

```text
/teacher/materials
/teacher/questions
/teacher/knowledge-graph
/teacher/analytics
```

但目前沒有對應 Page。

教材管理目前主要位於：

```text
/teacher/course/:courseId
└─ 教材管理 Tab
```

---

## 20.6 Admin 獨立功能頁

Navbar 已有：

```text
/admin/courses
/admin/knowledge-graph
```

目前尚未建立正式頁面。

---

# 21. 目前已知程式整理事項

以下不一定影響功能，但後續可整理。

## 21.1 `student-account.api.ts`

目前：

```text
src/api/student-account.api.ts
```

檔案尚未實作內容。

如果未來不需要獨立 Student Account API，可以刪除；若要做學生帳號設定，再於此擴充。

---

## 21.2 Admin Course Naming

目前 `AdminCourse` 同時存在：

```text
class_name
teacherId
```

snake_case / camelCase 混用。

後續建議統一為其中一種，例如 Frontend：

```text
className
teacherId
```

Backend Response：

```text
class_name
teacher_id
```

並在 Composable 做 mapping。

---

## 21.3 MaterialTreeViewer SCSS

目前：

```text
_material-tree-viewer.scss
```

應保持：

```text
1 個 Teacher Theme
+
1 個 Student Theme
```

避免同一個：

```scss
&--student
```

重複宣告。

Teacher / Student 應維持：

```text
相同 Layout
不同 Role Color
```

---

## 21.4 Auth User Type

目前：

```ts
interface User {
  id: number;
  account: string;
  name: string;
  role: UserRole;
}
```

如果後續 Student 首頁需要：

```text
student_no
class_name
```

可再依 Backend `/auth/me` 實際 Response 擴充。

---

# 22. CSS 架構

目前：

```text
src/css/app.scss
```

統一引入：

```text
Common
Admin
Teacher
Student
Shared Material
```

目前主要：

```scss
// common
@use './components/navbar';
@use './components/confirmDialog';

@use './components/login';
@use './components/teacherApplication';

// shared material
@use './components/material/material-tree-viewer';

// admin
@use './components/admin/course-activation-panel';
@use './components/admin/teacher-approval-panel';
@use './components/admin/user-management';
@use './components/admin/user-stats-cards';

// teacher
@use './components/teacher/course-management';
@use './components/teacher/course-card';
@use './components/teacher/course-form-dialog';
@use './components/teacher/course-workspace';
@use './components/teacher/course-student-panel';

// student
@use './components/student/student-material';
```

樣式分工：

```text
_course-workspace.scss
→ Teacher Course Workspace

_course-student-panel.scss
→ Teacher 班級學生

_material-tree-viewer.scss
→ Teacher / Student 共用教材 Tree

_student-material.scss
→ Student 我的課程與正式教材頁
```

---

# 23. Dialog / Notify 原則

目前 API Dialog 原則：

```text
API 成功
↓
關閉 Dialog
↓
Notify 成功

API 失敗
↓
Dialog 保持開啟
↓
Notify Error
```

需要等待 API 的按鈕：

```text
使用 loading
禁止重複送出
```

刪除 / 核准等重要操作：

```text
ConfirmDialog
```

---

# 24. RWD

目前主要功能皆逐步支援：

```text
Desktop
Tablet
Mobile
```

教材瀏覽：

```text
Desktop
→ Topic 左側
→ Content 右側

Tablet / Mobile
→ 上下排列
```

教師教材 Tree：

```text
Desktop
→ Chapter / Unit / Card 階層縮排

Mobile
→ 減少左右 Padding
```

學生我的課程：

```text
CSS Grid
→ auto-fill
→ minmax
```

---

# 25. 下一階段建議

目前學生正式教材已完成，因此下一階段建議順序：

```text
1. Student 題目列表
   ↓
2. Student 單題頁
   ↓
3. choice / debug / coding 作答
   ↓
4. Student 作答結果
   ↓
5. Teacher 作答紀錄
   ↓
6. Teacher correct / wrong 覆核
   ↓
7. Student 學習進度
   ↓
8. Student 學習歷程
   ↓
9. Dashboard 完整化
   ↓
10. Knowledge Graph / Analytics
```

---

# 26. 目前專案核心流程

## 教師帳號

```text
教師申請
↓
Admin 核准
↓
教師登入
```

## 課程

```text
教師建立課程
↓
設定學期
↓
設定 class_name
↓
課程工作區
```

## 學生加入課程

```text
教師新增學生
或
Excel 匯入
↓
Pending
↓
Admin 開通
↓
建立 / 使用 Student Account
↓
建立 Enrollment
↓
Teacher 已開通名單
↓
Student 我的課程
```

## 教材

```text
Teacher
↓
Excel 匯入 / Published → Draft
↓
Draft Editor
↓
Chapter / Unit / Knowledge Card
↓
Publish
↓
Published Topic
        ↓
        ├─ Teacher MaterialTreeViewer
        │  theme="teacher"
        │
        └─ Student MaterialTreeViewer
           theme="student"
```

---

# 27. 前端開發原則

目前專案持續遵守：

- 前後端分離
- TypeScript 型別化
- Page / Component / Composable / API 職責分離
- API Loading 明確
- Error 明確
- Dialog 成功後才關閉
- FormData 不自行固定 multipart Header
- 使用 Router Role Guard
- Mock 與正式 API 明確分離
- SCSS 依功能分檔
- 共用元件避免角色綁死
- Teacher / Student 共用 Viewer 透過 Theme 切換
- RWD
- 不過度抽象尚未需要的功能

---

# 28. 目前狀態摘要

目前 PHPEducation Frontend 已從：

```text
登入
+
管理者使用者管理
+
教師課程管理
```

擴充到：

```text
完整課程班級
+
教師班級學生
+
學生開通
+
教師教材管理
+
正式教材發布
+
學生正式教材閱讀
```

目前下一個主要開發階段為：

```text
題庫
+
學生作答
+
教師覆核
+
學習進度 / 學習歷程
```
