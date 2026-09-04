# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
本 README 依 **2026-09-04 最新 `src` 程式碼**整理，內容只記錄目前已完成並實際存在於前端的功能。

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
TipTap
vis-network
vis-data
ESLint
Prettier
```

系統角色：

```text
Admin
Teacher
Student
```

角色主題色：

```text
Admin   → Purple
Teacher → Blue
Student → Teal
```

教材共用 Viewer 依角色切換 Theme：

```text
Teacher → Blue
Student → Teal
```

---

## 2. 前端架構

主要資料流程：

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

跨頁登入狀態使用 Pinia。

主要目錄：

```text
src/
├─ api/
│  ├─ admin-user-management.api.ts
│  ├─ auth.api.ts
│  ├─ dashboard.api.ts
│  ├─ student-material.api.ts
│  ├─ student-question.api.ts
│  ├─ teacher-application.api.ts
│  ├─ teacher-course-student.api.ts
│  ├─ teacher-course.api.ts
│  ├─ teacher-material.api.ts
│  └─ teacher-question.api.ts
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
│  ├─ student/
│  └─ teacher/
│
├─ composables/
│  ├─ useAuth.ts
│  ├─ useDashboard.ts
│  ├─ useStudentMaterial.ts
│  ├─ useStudentQuestions.ts
│  ├─ useTeacherApplication.ts
│  ├─ useTeacherCourses.ts
│  ├─ useTeacherCourseStudents.ts
│  ├─ useTeacherCourseWorkspace.ts
│  ├─ useTeacherMaterialManagement.ts
│  ├─ useTeacherQuestions.ts
│  └─ useUserManagement.ts
│
├─ config/
│  └─ navigation.ts
│
├─ css/
│  ├─ app.scss
│  ├─ quasar.variables.scss
│  └─ components/
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
└─ utils/
```

職責分工：

```text
Page
→ 頁面組合、Router、頁面層事件

Component
→ UI 顯示、表單、emit

Composable
→ State、Loading、Error、API 流程

API
→ Axios Request

Store
→ 跨頁共用狀態

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

已統一處理：

```text
Authorization: Bearer {token}
Accept: application/json
```

Token 儲存位置：

```text
sessionStorage
└─ auth_token
```

### FormData

檔案上傳不手動固定 multipart Boundary，由 Browser 自動產生：

```text
multipart/form-data; boundary=...
```

目前使用於：

```text
學生 Excel 名冊上傳
教材 Excel 上傳
Rich Text Editor 圖片上傳
```

---

## 4. Authentication

主要檔案：

```text
api/auth.api.ts
composables/useAuth.ts
stores/auth.ts
boot/auth.ts
pages/login.vue
```

目前已完成：

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

登入成功後保存：

```text
token
user
role
```

Session Restore：

```text
Browser Refresh
      ↓
sessionStorage auth_token
      ↓
GET /auth/me
      ↓
有效 → setUser()
無效 → clearAuth()
```

---

## 5. 忘記密碼

登入頁已完成教師與學生的忘記密碼功能。

入口：

```text
/login
└─ 忘記密碼？
```

API：

```text
POST /api/v1/auth/student/forgot-password
POST /api/v1/auth/teacher/forgot-password
```

學生 Request：

```json
{
  "student_no": "1411131000"
}
```

教師 Request：

```json
{
  "teacher_account": "teacher@school.edu.tw"
}
```

目前 UI 流程：

```text
點擊「忘記密碼？」
↓
開啟 Dialog
↓
選擇學生 / 教師
↓
輸入學號或教師帳號
↓
按「寄送新密碼」
↓
欄位驗證
↓
呼叫 Forgot Password API
↓
成功 Notify
↓
關閉 Dialog
```

目前行為：

- 學生 / 教師使用同一個 Dialog
- 學生輸入學號，不需加 `s`
- 教師輸入登入帳號
- 使用 `lazy-rules="ondemand"`，只有按下「寄送新密碼」後才進行欄位驗證
- 切換學生 / 教師時會清空輸入內容
- 切換身分時會清除 Backend Error
- 切換身分時會 `resetValidation()`，移除上一個身分留下的紅框與錯誤文字
- API 呼叫期間顯示 Loading，避免重複送出
- 成功後顯示 Backend 回傳訊息

後端流程為：

```text
收到 Forgot Password Request
↓
產生新的 12 碼密碼
↓
更新帳號密碼
↓
寄送至帳號綁定信箱
```

---

## 6. Router Guard

Router：

```text
src/router/index.ts
```

使用 File-based Routing / typed routes。

頁面可透過：

```ts
definePage({
  meta: {
    requiresAuth: true,
    roles: ['teacher'],
  },
});
```

限制登入與角色。

角色首頁：

```text
/admin
/teacher
/student
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

## 7. 共用 Navbar

主要檔案：

```text
components/navigation/AppNavbar.vue
config/navigation.ts
```

目前已完成：

- 依 Admin / Teacher / Student 顯示不同導航內容
- 角色主題色
- 目前登入者資訊
- 登出功能
- 配合 Router Guard 進行頁面導向

---

## 8. 教師帳號申請

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

API：

```text
POST /api/v1/teacher-applications
```

欄位：

```text
姓名
Email
帳號名稱
申請原因
```

目前支援：

- 必填驗證
- Email 格式驗證
- Backend Validation Error
- 成功 / 失敗 Notify
- 成功後清空表單
- Reset Validation
- 公開頁，不需登入

---

## 9. 管理員－使用者管理

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

composables/useUserManagement.ts
api/admin-user-management.api.ts
```

目前已完成：

```text
使用者管理
├─ 系統統計
├─ 教師申請核准
└─ 學生帳號 / 課程開通
```

### 9.1 系統統計

API：

```text
GET /api/v1/stats
```

顯示：

```text
教師總數
學生總數
課程總數
本學期課程數
目前學期
```

### 9.2 教師申請核准

API：

```text
GET  /api/v1/teacher-applications?status=pending
POST /api/v1/teacher-applications/{id}/approve
```

流程：

```text
Pending Teacher
↓
管理員確認核准
↓
POST Approve
↓
更新 Pending List
↓
更新 Stats
↓
Notify
```

### 9.3 學生帳號 / 課程開通

API：

```text
GET /api/v1/courses

GET /api/v1/student-applications
    ?course_id={courseId}
    &status=pending
    &q={keyword}

POST /api/v1/student-applications/approve
```

目前支援：

- 只顯示有 Pending Student 的課程
- 課程下拉選擇
- 搜尋學生
- 單選 / 全選
- 批次開通
- 開通後重新整理學生、課程與 Stats

---

## 10. 教師－課程管理

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

API：

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
- Loading / Error
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

學期 Backend 格式：

```text
115-1
115-2
```

Frontend 顯示：

```text
115 學年度・上學期
115 學年度・下學期
```

---

## 11. 教師－單一課程工作區

路由：

```text
/teacher/course/:courseId
```

目前工作區包含：

```text
課程資訊
班級學生
教材管理
題庫管理
```

主要元件：

```text
CourseInfoPanel.vue
CourseStudentPanel.vue
CourseMaterialPanel.vue
CourseQuestionPanel.vue
MaterialEditor.vue
```

---

## 12. 教師－班級學生

主要檔案：

```text
components/teacher/course-workspace/CourseStudentPanel.vue
composables/useTeacherCourseStudents.ts
api/teacher-course-student.api.ts
types/course-student.ts
```

名單分為：

```text
已開通 approved
待審核 pending
```

### 12.1 名單

API：

```text
GET /api/v1/teacher/courses/{courseId}/student-applications?status=approved
GET /api/v1/teacher/courses/{courseId}/student-applications?status=pending
```

目前支援：

- 已開通 / 待審核切換
- 學號 / 姓名 / Email 搜尋
- 學生人數
- Loading
- Empty State
- Error
- RWD

### 12.2 手動新增學生

API：

```text
POST /api/v1/teacher/courses/{courseId}/student-applications
```

可一次新增多位學生：

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

前端已完成：

- 一次最多 100 筆
- 必填檢查
- 同批重複學號檢查
- 學號不需輸入 `s`
- 成功後切換待審核名單
- API 失敗時 Dialog 保持開啟

### 12.3 Excel 匯入學生

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

### 12.4 移除學生

API：

```text
DELETE /api/v1/teacher/courses/{courseId}/student-applications/{itemId}
```

Pending：

```text
刪除待審核申請
```

Approved：

```text
取消此課程 Enrollment
學生帳號保留
其他課程不受影響
```

---

## 13. 教師－教材管理

資料層：

```text
api/teacher-material.api.ts
composables/useTeacherMaterialManagement.ts
types/material.ts
```

正式教材結構：

```text
Course
└─ Chapter
   └─ Unit
      ↔ Knowledge Card
```

Knowledge Card 主要欄位：

```text
title
name (alias)
type
content (HTML)
example
code_example (alias)
sort_order
```

同一張 Knowledge Card 可以掛在多個 Unit。

目前教材直接操作正式資料，不使用 Draft / Publish 流程。

---

## 14. 教材 Excel 匯入

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
file
overwrite=1
```

目前 UI 流程：

```text
1. 下載 Excel 範本
2. 依欄位填寫教材
3. 上傳 .xlsx
4. 若課程已有教材，顯示覆蓋提醒
5. 確認後重新匯入
```

Excel 欄位：

```text
章節名稱
章節順序
單元名稱
單元順序
知識卡名稱
類別
教材內容
程式範例
```

前端不解析 Excel，直接將檔案送至 Backend。

匯入 Dialog 已有獨立寬度設定，並覆蓋 Quasar 預設 Dialog `max-width` 限制。

---

## 15. 正式教材 CRUD

### Chapter

```text
GET    /api/v1/teacher/courses/{courseId}/chapters
POST   /api/v1/teacher/courses/{courseId}/chapters
PUT    /api/v1/teacher/chapters/{chapterId}
DELETE /api/v1/teacher/chapters/{chapterId}
```

### Unit

```text
GET    /api/v1/teacher/chapters/{chapterId}/units
POST   /api/v1/teacher/chapters/{chapterId}/units
PUT    /api/v1/teacher/units/{unitId}
DELETE /api/v1/teacher/units/{unitId}
```

### Knowledge Card

```text
GET    /api/v1/teacher/units/{unitId}/knowledge-cards
POST   /api/v1/teacher/units/{unitId}/knowledge-cards
PUT    /api/v1/teacher/knowledge-cards/{cardId}
DELETE /api/v1/teacher/knowledge-cards/{cardId}
```

修改成功後會重新取得 Course Tree，確保 Tree / Graph 使用最新資料。

---

## 16. MaterialEditor

元件：

```text
components/teacher/course-workspace/MaterialEditor.vue
```

用途：

```text
新增 / 編輯 Chapter
新增 / 編輯 Unit
新增 / 編輯 Knowledge Card
```

### Dynamic Dialog Size

依內容量使用不同 Dialog 尺寸：

```text
Chapter / Unit
→ Compact Dialog
→ 自動高度

Knowledge Card
→ Large Dialog
→ 提供 Rich Text Editor 足夠空間
```

### Knowledge Card Editor

可編輯：

```text
名稱
type
排序
教材內容 HTML
程式範例
```

`type` 目前提供常用值：

```text
keyword
function
```

並允許其他自訂字串類型。

---

## 17. RichTextEditor / RichContentViewer

編輯器：

```text
components/common/RichTextEditor.vue
```

顯示器：

```text
components/common/RichContentViewer.vue
```

RichTextEditor 使用 TipTap，目前支援：

- Undo / Redo
- 一般文字與 Heading
- Bold / Italic / Underline / Strike
- 左 / 中 / 右 / Justify
- Bullet List / Ordered List
- Blockquote
- Code Block
- Link / Unlink
- Image
- Table

圖片上傳：

```text
POST /api/v1/teacher/upload-image
```

FormData：

```text
image
```

Backend 回傳 URL 後插入教材 HTML。

---

## 18. MaterialTreeViewer

共用元件：

```text
components/material/MaterialTreeViewer.vue
```

目前功能：

- Chapter / Unit 展開收合
- 階層排序
- 顯示 Knowledge Card Type
- RichContentViewer 顯示教材 HTML
- CodeExampleViewer 顯示程式範例
- Teacher 模式可新增 / 編輯 / 刪除
- Student 模式唯讀
- Teacher / Student 共用相同 Layout
- Blue / Teal Theme 切換

---

## 19. MaterialGraphViewer

共用元件：

```text
components/material/MaterialGraphViewer.vue
```

使用：

```text
vis-network
vis-data
```

目前功能：

- Course Root / Chapter / Unit / Knowledge Card 圖譜
- Knowledge Card Type 顏色區分
- 搜尋節點
- 搜尋結果列表
- 聚焦搜尋結果
- Zoom In / Zoom Out
- Fit / 置中
- 重新排列
- Node Drag
- View Drag
- 點擊節點顯示 Detail Panel
- Teacher 可從 Detail Panel 進入教材編輯
- Knowledge Card 顯示所屬位置
- 長路徑使用 Ellipsis (`...`)
- Hover Tooltip 顯示完整路徑
- Detail Panel 可左右拖曳調整寬度
- 雙擊 Resize Handle 恢復預設寬度
- Teacher / Student 共用 Viewer 與角色 Theme

---

## 20. CodeExampleViewer

共用元件：

```text
components/common/CodeExampleViewer.vue
```

使用 CodeMirror。

目前設定：

- PHP Syntax Highlight
- Read Only
- `editable = false`
- Line Wrapping
- 行號
- 等寬字體
- Teacher / Student Theme
- 元件卸載時 Destroy EditorView

---

## 21. 教師－題庫管理

題庫位於：

```text
/teacher/course/:courseId
└─ 題庫管理
```

主要檔案：

```text
components/teacher/course-workspace/CourseQuestionPanel.vue
components/teacher/question/QuestionFormDialog.vue
composables/useTeacherQuestions.ts
api/teacher-question.api.ts
types/teacher-question.ts
```

API：

```text
GET /api/v1/teacher/blooms
GET /api/v1/teacher/courses/{courseId}/knowledge-cards

GET    /api/v1/teacher/courses/{courseId}/questions
POST   /api/v1/teacher/courses/{courseId}/questions
GET    /api/v1/teacher/questions/{questionId}
PUT    /api/v1/teacher/questions/{questionId}
DELETE /api/v1/teacher/questions/{questionId}
```

### 題庫列表

目前已完成：

- 題目列表
- 題目名稱
- 題型 Badge
- Bloom 編碼
- 關聯知識卡
- 最後更新時間
- 搜尋
- 題型 Filter
- Pagination
- 新增
- 編輯
- 刪除
- Confirm Delete
- Notify

搜尋內容包含：

```text
題目名稱
題目內容
Bloom
知識卡名稱
```

### 已完成出題介面

共通欄位：

```text
題目名稱
題型
題目內容
題目說明
Bloom 編碼
關聯知識卡
show_example
```

已完成並可使用的出題表單包含：

```text
Choice
True / False
Fill
Interpret
```

Choice：

- 至少 2 個選項
- 可新增 / 移除選項
- 選項說明
- 設定正確答案

True / False：

- 固定兩個選項
- 設定正確答案

Fill / Interpret：

- 使用 `sub_answers`
- 可新增多個答案
- 支援 `answer`
- 支援 `description`

---

## 22. 學生－我的課程

路由：

```text
/student/courses
```

資料：

```text
GET /api/v1/dashboard
```

目前顯示：

```text
課程名稱
班級
學期
課程說明
查看教材
```

進入：

```text
/student/course/{courseId}
```

---

## 23. 學生－正式教材

路由：

```text
/student/course/:courseId
```

主要資料層：

```text
api/student-material.api.ts
composables/useStudentMaterial.ts
types/student-material.ts
```

主要 API：

```text
GET /api/v1/student/courses/{courseId}/graph
```

頁面已完成：

```text
階層檢視
知識圖譜
題目練習入口
```

Viewer：

```text
Tree  → MaterialTreeViewer theme="student"
Graph → MaterialGraphViewer theme="student"
```

另已串接 Drill-down API：

```text
GET /api/v1/student/courses/{courseId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

---

## 24. 學生－題目列表

路由：

```text
/student/course/:courseId/questions
```

主要檔案：

```text
components/student/question/StudentQuestionList.vue
composables/useStudentQuestions.ts
api/student-question.api.ts
types/student-question.ts
```

API：

```text
GET /api/v1/student/courses/{courseId}/questions
```

可使用：

```text
?knowledge_card_id={knowledgeCardId}
```

目前題目列表可以：

- 取得課程題目
- 顯示題型
- 顯示題目資訊
- 依 Knowledge Card 篩選
- 進入單題作答頁

單題網址：

```text
/student/question/{questionId}?courseId={courseId}
```

---

## 25. 學生－選擇題 / 是非題作答

路由：

```text
/student/question/:questionId
```

API：

```text
GET  /api/v1/student/questions/{questionId}
POST /api/v1/student/questions/{questionId}/submit
```

### Choice

元件：

```text
ChoiceAnswer.vue
```

Request：

```json
{
  "option_id": 1
}
```

### True / False

元件：

```text
TrueFalseAnswer.vue
```

Request：

```json
{
  "option_id": 1
}
```

### 作答結果

目前可以顯示：

```text
correct
wrong
pending
```

如果 Backend 回傳：

```text
explanation
```

前端會顯示解釋內容。

若單題 API 回傳：

```text
examples
```

學生可以展開 / 收合知識卡範例。

---

## 26. Dashboard

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

目前已使用於：

```text
Teacher 首頁課程資料
Student 我的課程
角色基本資料
```

---

## 27. 已正式串接 API

以下 Path 皆以：

```text
/api/v1
```

為 Base Prefix。

### Authentication

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/student/forgot-password
POST /auth/teacher/forgot-password
```

### Dashboard

```text
GET /dashboard
```

### Teacher Application

```text
POST /teacher-applications
GET  /teacher-applications
POST /teacher-applications/{id}/approve
```

### Admin

```text
GET  /stats
GET  /courses
GET  /student-applications
POST /student-applications/approve
```

### Teacher Course

```text
GET    /teacher/courses
POST   /teacher/courses
GET    /teacher/courses/{courseId}
PUT    /teacher/courses/{courseId}
DELETE /teacher/courses/{courseId}
```

### Teacher Course Students

```text
GET    /teacher/courses/{courseId}/student-applications
POST   /teacher/courses/{courseId}/student-applications
DELETE /teacher/courses/{courseId}/student-applications/{itemId}

GET  /teacher/student-applications/template
POST /teacher/student-applications
```

### Teacher Materials

```text
GET  /teacher/materials/template
POST /teacher/courses/{courseId}/materials/import
GET  /teacher/courses/{courseId}/tree

GET    /teacher/courses/{courseId}/chapters
POST   /teacher/courses/{courseId}/chapters
PUT    /teacher/chapters/{chapterId}
DELETE /teacher/chapters/{chapterId}

GET    /teacher/chapters/{chapterId}/units
POST   /teacher/chapters/{chapterId}/units
PUT    /teacher/units/{unitId}
DELETE /teacher/units/{unitId}

GET    /teacher/units/{unitId}/knowledge-cards
POST   /teacher/units/{unitId}/knowledge-cards
PUT    /teacher/knowledge-cards/{cardId}
DELETE /teacher/knowledge-cards/{cardId}

POST /teacher/upload-image
```

### Teacher Questions

```text
GET /teacher/blooms
GET /teacher/courses/{courseId}/knowledge-cards

GET    /teacher/courses/{courseId}/questions
POST   /teacher/courses/{courseId}/questions
GET    /teacher/questions/{questionId}
PUT    /teacher/questions/{questionId}
DELETE /teacher/questions/{questionId}
```

### Student Materials

```text
GET /student/courses/{courseId}/graph
GET /student/courses/{courseId}/chapters
GET /student/chapters/{chapterId}/units
GET /student/units/{unitId}/knowledge-cards
```

### Student Questions

```text
GET  /student/courses/{courseId}/questions
GET  /student/questions/{questionId}
POST /student/questions/{questionId}/submit
```

---

## 28. 已完成功能摘要

| 功能 | 狀態 |
|---|---|
| Login | ✅ |
| Logout | ✅ |
| Restore Session | ✅ |
| Student / Teacher Forgot Password | ✅ |
| Forgot Password On-demand Validation | ✅ |
| Forgot Password Role Switch Error Reset | ✅ |
| Router Guard | ✅ |
| Role Guard | ✅ |
| 共用 Navbar | ✅ |
| 教師帳號申請 | ✅ |
| 管理員統計 | ✅ |
| 管理員教師核准 | ✅ |
| 管理員學生帳號開通 | ✅ |
| 教師課程 CRUD | ✅ |
| 課程 `class_name` | ✅ |
| 教師課程資訊 | ✅ |
| 教師班級學生－已開通 | ✅ |
| 教師班級學生－待審核 | ✅ |
| 教師手動新增多位學生 | ✅ |
| 教師 Excel 匯入學生 | ✅ |
| 教師移除學生 | ✅ |
| 教材 Excel 匯入 | ✅ |
| 教材覆蓋匯入 | ✅ |
| Chapter CRUD | ✅ |
| Unit CRUD | ✅ |
| Knowledge Card CRUD | ✅ |
| Dynamic Material Editor Dialog | ✅ |
| Rich Text 教材編輯 | ✅ |
| 教材圖片上傳 | ✅ |
| MaterialTreeViewer 共用化 | ✅ |
| MaterialGraphViewer 共用化 | ✅ |
| Graph 搜尋 / Zoom / Fit / Rearrange | ✅ |
| Graph Path Ellipsis / Tooltip | ✅ |
| Graph Detail Panel Resize | ✅ |
| Teacher / Student Material Theme | ✅ |
| CodeMirror Example Viewer | ✅ |
| 學生我的課程 | ✅ |
| 學生正式教材 Tree | ✅ |
| 學生正式教材 Graph | ✅ |
| Teacher 題庫列表 | ✅ |
| Teacher 題庫搜尋 / 題型 Filter | ✅ |
| Teacher Question CRUD | ✅ |
| Bloom / Knowledge Card 關聯 | ✅ |
| Choice 出題 | ✅ |
| True / False 出題 | ✅ |
| Fill 出題 | ✅ |
| Interpret 出題 | ✅ |
| Student 題目列表 | ✅ |
| Student 單題頁 | ✅ |
| Student Choice 作答 | ✅ |
| Student True / False 作答 | ✅ |

---

## 29. CSS / SCSS 架構

入口：

```text
src/css/app.scss
```

目前主要引入：

```scss
// common
@use './components/navbar';
@use './components/confirmDialog';
@use './components/common/rich-text-editor';
@use './components/common/rich-content-viewer';

// login / application
@use './components/login';
@use './components/teacherApplication';

// material
@use './components/material/material-tree-viewer';
@use './components/material/material-graph-viewer';

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
@use './components/teacher/course-question-panel';
@use './components/teacher/question-form-dialog';
@use './components/teacher/material-editor';

// student
@use './components/student/student-material';
@use './components/student/student-question-list';
@use './components/student/student-question-page';
@use './components/student/student-question-answer-page';
@use './components/student/student-question-answer';
```

原則：

```text
頁面 / 功能 SCSS 分檔
共用 Viewer 放 material/
Teacher / Student 透過 Theme 共用 Layout
RWD 與元件樣式放在對應功能 SCSS
```

---

## 30. Dialog / Notify 原則

目前主要操作流程：

```text
API 成功
↓
關閉 Dialog
↓
重新整理資料
↓
Notify Success
```

```text
API 失敗
↓
Dialog 保持開啟
↓
顯示 Error
↓
Notify Error
```

需要等待 API 的按鈕使用：

```text
loading
+ disable
```

重要操作使用 Confirm Dialog，例如：

```text
刪除
覆蓋教材
核准帳號
```

教材編輯 Dialog 已依資料量分為：

```text
Chapter / Unit → Compact
Knowledge Card → Large
```

---

## 31. RWD

目前主要功能皆逐步支援：

```text
Desktop
Tablet
Mobile
```

包含：

- Navbar
- Login / Forgot Password Dialog
- Course Card / Course Form
- User Management
- Course Workspace
- Student List
- Material Editor
- Material Tree
- Material Graph
- Student Course List
- Student Material
- Question List
- Student Choice / True-False Answer

Graph 在小螢幕下會調整 Detail Panel 與 Resize 行為，避免桌面操作直接套用到 Mobile。

---

## 32. 前端開發原則

目前專案使用以下原則：

- 前後端分離
- TypeScript 型別化
- Page / Component / Composable / API 職責分離
- API Loading 明確
- Error 明確
- Dialog 成功後才關閉
- FormData 不手動固定 multipart Boundary
- Router Role Guard
- SCSS 依功能分檔
- 共用元件避免角色綁死
- Teacher / Student 共用 Viewer 透過 Theme 切換
- 正式教材由 Backend 作為資料來源
- 前端不自行解析 Excel
- RWD
- 不過度抽象非必要功能

---

## 33. 目前已完成核心流程

### 教師帳號

```text
教師公開申請
↓
Admin 核准
↓
教師登入
```

### 忘記密碼

```text
Login
↓
Forgot Password
↓
學生 / 教師身分切換
↓
按下寄送後進行欄位驗證
↓
Backend 產生新密碼並寄信
```

### 課程

```text
教師建立課程
↓
設定學期
↓
設定 class_name
↓
進入 Course Workspace
```

### 學生加入課程

```text
教師手動新增學生
或
Excel 匯入名冊
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

### 教材

```text
Teacher
↓
下載 Excel 範本
↓
Excel 匯入正式教材
或
直接新增 / 修改 Chapter / Unit / Knowledge Card
↓
Course Tree
↓
├─ MaterialTreeViewer
└─ MaterialGraphViewer
      ↓
Student 修課後讀取正式教材
```

### 題庫與目前可作答題型

```text
Teacher Course Workspace
↓
建立題目
↓
設定 Bloom
↓
關聯 Knowledge Cards
↓
Student 題目列表
↓
Student 單題頁
↓
Choice / True-False 作答
↓
顯示作答結果
```
