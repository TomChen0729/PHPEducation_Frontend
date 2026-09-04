# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 依 **2026-09-04 上傳的最新 `src` 程式碼**整理。

---

## 0. 目前版本重點

目前前端已從原本的「課程＋教材瀏覽」階段，進一步完成：

- 登入 / 登出 / Session Restore
- Role-based Router Guard
- 共用 Navbar
- 教師帳號申請
- 管理員教師申請核准
- 管理員學生帳號與課程開通
- 教師課程 CRUD
- 教師班級學生管理
- 教材 Excel 匯入與覆蓋
- 正式教材 Chapter / Unit / Knowledge Card CRUD
- Rich Text 教材內容編輯
- 教材圖片上傳
- Teacher / Student 共用教材 Tree Viewer
- Teacher / Student 共用 Knowledge Graph Viewer
- 圖譜搜尋、縮放、置中、重新排列
- 圖譜節點拖曳與畫布拖曳
- 圖譜右側詳細資訊面板可調整寬度
- 教師題庫 CRUD
- Bloom 分類與知識卡關聯
- 六種題型的教師出題 UI
- 學生題目列表與單題頁
- 學生選擇題 / 是非題正式作答

### 舊 README 中已不再適用的設計

目前教材已改為**直接操作正式教材**，不再使用以下舊流程：

```text
Topic
Draft
Published → Draft
Draft CRUD
Publish
material-drafts API
```

目前正式教材結構為：

```text
Course
└─ Chapter
   └─ Unit
      ↔ Knowledge Card
```

> 同一張 Knowledge Card 可以掛在多個 Unit。  
> 圖譜 Viewer 中的「主題」根節點代表目前課程，不代表另外存在 `topics` 資料表。

---

# 1. 前端技術

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

教材共用 Viewer 依角色切換 Theme：

```text
Teacher → blue
Student → teal
```

---

# 2. 前端架構

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

跨頁共用登入狀態使用 Pinia。

目前主要目錄：

```text
src/
├─ api/
│  ├─ admin-user-management.api.ts
│  ├─ auth.api.ts
│  ├─ dashboard.api.ts
│  ├─ student-account.api.ts
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
│  │  ├─ CodeExampleViewer.vue
│  │  ├─ ConfirmDialog.vue
│  │  ├─ RichContentViewer.vue
│  │  └─ RichTextEditor.vue
│  ├─ material/
│  │  ├─ MaterialGraphViewer.vue
│  │  └─ MaterialTreeViewer.vue
│  ├─ navigation/
│  │  └─ AppNavbar.vue
│  ├─ student/
│  │  └─ question/
│  │     ├─ ChoiceAnswer.vue
│  │     ├─ StudentQuestionList.vue
│  │     └─ TrueFalseAnswer.vue
│  └─ teacher/
│     ├─ course-workspace/
│     │  ├─ CourseInfoPanel.vue
│     │  ├─ CourseMaterialPanel.vue
│     │  ├─ CourseQuestionPanel.vue
│     │  ├─ CourseStudentPanel.vue
│     │  └─ MaterialEditor.vue
│     ├─ question/
│     │  └─ QuestionFormDialog.vue
│     └─ teacher-course/
│        ├─ CourseCard.vue
│        └─ CourseFormDialog.vue
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
│     ├─ admin/
│     ├─ common/
│     ├─ material/
│     ├─ student/
│     └─ teacher/
│
├─ pages/
│  ├─ admin/
│  │  └─ userManagement.vue
│  ├─ student/
│  │  ├─ courses.vue
│  │  ├─ course/[courseId]/index.vue
│  │  ├─ course/[courseId]/questions.vue
│  │  └─ question/[questionId].vue
│  ├─ teacher/
│  │  ├─ courseManagement.vue
│  │  └─ course/[courseId].vue
│  ├─ login.vue
│  ├─ teacherApplication.vue
│  └─ [...path].vue
│
├─ router/
│  └─ index.ts
│
├─ stores/
│  └─ auth.ts
│
├─ types/
│  ├─ auth.ts
│  ├─ course-student.ts
│  ├─ course.ts
│  ├─ dashboard.ts
│  ├─ material.ts
│  ├─ student-material.ts
│  ├─ student-question.ts
│  ├─ teacher-application.ts
│  ├─ teacher-question.ts
│  └─ user-management.ts
│
└─ utils/
   ├─ auth-route.ts
   └─ material-node-display.ts
```

職責原則：

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

# 3. 開發環境與 API Base URL

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

目前 Request 會自動處理：

```text
Authorization: Bearer {token}
Accept: application/json
```

Token：

```text
sessionStorage
└─ auth_token
```

## 3.1 FormData

目前不在 Axios 全域固定：

```text
Content-Type: application/json
```

如果 Request 為 `FormData`，會讓 Browser 自動產生：

```text
multipart/form-data; boundary=...
```

目前使用 FormData 的主要功能：

```text
學生 Excel 名冊上傳
教材 Excel 上傳
RichTextEditor 圖片上傳
```

---

# 4. Authentication

主要檔案：

```text
api/auth.api.ts
composables/useAuth.ts
stores/auth.ts
boot/auth.ts
```

目前前端正式串接：

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

### 尚未完成

Backend 已有 Forgot Password 規格，但目前 `auth.api.ts` 尚未串接：

```text
POST /auth/student/forgot-password
POST /auth/teacher/forgot-password
```

前端也尚無 Forgot Password UI。

---

# 5. Router Guard

Router：

```text
src/router/index.ts
```

使用 File-based Routing / typed routes。

頁面可使用：

```ts
definePage({
  meta: {
    requiresAuth: true,
    roles: ['teacher'],
  },
});
```

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

角色不符時：

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

# 6. Navbar

共用元件：

```text
components/navigation/AppNavbar.vue
config/navigation.ts
```

目前設定：

## Admin

```text
首頁
使用者管理
課程管理
知識圖譜
```

## Teacher

```text
首頁
課程管理
教材管理
題庫管理
知識圖譜
學習分析
```

## Student

```text
首頁
我的課程
學習進度
學習歷程
```

> 注意：Navbar 中仍有部分「預留路由」尚未建立正式 Page，詳見後方「目前待開發功能」。

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

API：

```text
POST /api/v1/teacher-applications
```

目前欄位：

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

目前包含：

```text
使用者管理
├─ 系統統計
├─ 教師申請核准
└─ 學生帳號 / 課程開通
```

## 8.1 系統統計

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

## 8.2 教師申請核准

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

## 8.3 學生帳號 / 課程開通

API：

```text
GET /api/v1/courses

GET /api/v1/student-applications
    ?course_id={courseId}
    &status=pending
    &q={keyword}

POST /api/v1/student-applications/approve
```

支援：

- 只顯示有 Pending Student 的課程
- 課程下拉
- 搜尋學生
- 單選 / 全選
- 批次開通
- 開通後重新整理學生 / 課程 / Stats

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

# 10. 教師－單一課程工作區

路由：

```text
/teacher/course/:courseId
```

目前 Tab：

```text
課程工作區
├─ 課程資訊
├─ 班級學生
├─ 教材管理
└─ 題庫管理
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

# 11. 教師－班級學生

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

## 11.1 名單 API

```text
GET /api/v1/teacher/courses/{courseId}/student-applications?status=approved
GET /api/v1/teacher/courses/{courseId}/student-applications?status=pending
```

支援：

- 已開通 / 待審核切換
- 學號 / 姓名 / Email 搜尋
- 學生人數
- Loading
- Empty State
- Error
- RWD

## 11.2 手動新增學生

```text
POST /api/v1/teacher/courses/{courseId}/student-applications
```

可一次送多筆：

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
- 必填檢查
- 同批重複學號檢查
- 不需輸入 `s`
- 成功後切換待審核名單
- API 失敗時 Dialog 保持開啟

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

## 11.4 移除學生

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

# 12. 教師－教材管理

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

同一張知識卡可能同時出現在多個 Unit，因此統計 Knowledge Card 數量時，前端使用 `card.id` 去重。

---

# 13. 教材 Excel 匯入

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

overwrite=1  // 課程已有教材且確認覆蓋時
```

目前 UI：

```text
1. 下載 Excel 範本
2. 依欄位填寫教材
3. 上傳 .xlsx
4. 若已有教材，顯示覆蓋警告
5. 確認後重新匯入
```

Excel 欄位在 UI 顯示為：

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

重要：

```text
前端不解析 Excel
↓
直接把檔案送 Backend
↓
Backend 寫入正式教材
```

目前沒有 Draft / Publish 步驟。

---

# 14. 正式教材 CRUD

## Chapter

```text
GET    /api/v1/teacher/courses/{courseId}/chapters
POST   /api/v1/teacher/courses/{courseId}/chapters
PUT    /api/v1/teacher/chapters/{chapterId}
DELETE /api/v1/teacher/chapters/{chapterId}
```

## Unit

```text
GET    /api/v1/teacher/chapters/{chapterId}/units
POST   /api/v1/teacher/chapters/{chapterId}/units
PUT    /api/v1/teacher/units/{unitId}
DELETE /api/v1/teacher/units/{unitId}
```

## Knowledge Card

```text
GET    /api/v1/teacher/units/{unitId}/knowledge-cards
POST   /api/v1/teacher/units/{unitId}/knowledge-cards
PUT    /api/v1/teacher/knowledge-cards/{cardId}
DELETE /api/v1/teacher/knowledge-cards/{cardId}
```

修改成功後會重新取得課程 Tree，確保 Tree / Graph 使用同一份最新資料。

---

# 15. MaterialEditor

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

## 15.1 Dynamic Dialog Size

不同資料量使用不同 Dialog 尺寸：

```text
Chapter / Unit
→ compact
→ 小型 Dialog
→ 自動高度

Knowledge Card
→ large/card
→ 大型 Dialog
→ 可容納 Rich Text Editor
```

避免只有「名稱＋排序」時仍出現大量空白。

## 15.2 Knowledge Card Editor

Knowledge Card 可編輯：

```text
名稱
type
排序
教材內容 HTML
程式範例
```

`type` 目前有預設：

```text
keyword
function
```

並允許新增其他字串類型，前端沒有寫死 enum。

---

# 16. RichTextEditor / RichContentViewer

編輯器：

```text
components/common/RichTextEditor.vue
```

顯示器：

```text
components/common/RichContentViewer.vue
```

RichTextEditor 使用 TipTap，目前包含：

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

Backend 回傳 URL 後插入 Rich Text HTML。

---

# 17. MaterialTreeViewer

共用元件：

```text
components/material/MaterialTreeViewer.vue
```

使用方式：

```vue
<MaterialTreeViewer
  :tree="courseTree"
  theme="teacher"
  editable
/>
```

或：

```vue
<MaterialTreeViewer
  :tree="courseTree"
  theme="student"
/>
```

目前功能：

- Chapter / Unit 展開收合
- 階層排序
- 顯示 Knowledge Card type
- RichContentViewer 顯示教材 HTML
- CodeExampleViewer 顯示程式範例
- Teacher 模式可新增 / 編輯 / 刪除
- Student 模式唯讀
- Teacher / Student 共用相同 Layout
- Theme 依角色切換 Blue / Teal

---

# 18. MaterialGraphViewer

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
- Knowledge Card type 使用不同顏色
- 搜尋節點
- 搜尋結果列表
- 聚焦搜尋結果
- Zoom In / Zoom Out
- Fit / 置中
- 重新排列
- Node Drag
- View Drag
- 點擊節點顯示右側 Detail Panel
- Teacher 可從 Detail Panel 直接進入編輯
- Knowledge Card 顯示所屬位置
- 長路徑使用 `text-overflow: ellipsis`
- Hover Tooltip 顯示完整路徑
- Detail Panel 可左右拖曳調整寬度
- 雙擊 Resize Handle 恢復預設寬度

Teacher 與 Student 共用相同 Graph Viewer，只切換 Theme 與是否可編輯。

---

# 19. CodeExampleViewer

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
- 元件卸載時 destroy EditorView

---

# 20. 教師－題庫管理

題庫已加入單一課程工作區：

```text
/teacher/course/:courseId
└─ 題庫管理 Tab
```

主要檔案：

```text
components/teacher/course-workspace/CourseQuestionPanel.vue
components/teacher/question/QuestionFormDialog.vue
composables/useTeacherQuestions.ts
api/teacher-question.api.ts
types/teacher-question.ts
```

正式 API：

```text
GET /api/v1/teacher/blooms
GET /api/v1/teacher/courses/{courseId}/knowledge-cards

GET    /api/v1/teacher/courses/{courseId}/questions
POST   /api/v1/teacher/courses/{courseId}/questions
GET    /api/v1/teacher/questions/{questionId}
PUT    /api/v1/teacher/questions/{questionId}
DELETE /api/v1/teacher/questions/{questionId}
```

## 20.1 題庫列表

支援：

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

## 20.2 教師出題 UI

Frontend 已提供六種題型：

```text
choice
true_false
fill
debug
interpret
coding
```

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

### Choice

- 至少 2 個選項
- 可新增選項
- 每個選項可填說明
- 剛好 1 個正確答案

### True / False

- 固定兩個選項
- 選擇其中一個正確答案

### Fill / Debug / Interpret

目前共用 `sub_answers` 表單：

```text
answer
description
sub_id
```

可新增多個標準答案。

### Coding

目前 UI 只有題目基本資料，尚未加入：

```text
starter_code
expected_output
reference_answer
```

因此 Coding 出題仍屬**未完整串接**。

---

# 21. 學生－我的課程

路由：

```text
/student/courses
```

課程資料：

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

# 22. 學生－正式教材

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

目前頁面主要直接使用 Graph API 取得整棵教材：

```text
GET /api/v1/student/courses/{courseId}/graph
```

Composable：

```text
fetchMaterial(courseId)
↓
response.data.graph
↓
MaterialCourseTree
```

頁面支援：

```text
階層檢視
知識圖譜
題目練習
```

Viewer：

```text
Tree  → MaterialTreeViewer theme="student"
Graph → MaterialGraphViewer theme="student"
```

`student-material.api.ts` 另保留 Drill-down API：

```text
GET /api/v1/student/courses/{courseId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

目前學生教材主頁主要使用 `/graph` 一次取得完整結構。

---

# 23. 學生－題目列表

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

可選 Filter：

```text
?knowledge_card_id={knowledgeCardId}
```

目前列表可顯示六種題型：

```text
選擇題
是非題
填空題
除錯題
程式解讀
程式實作
```

點擊：

```text
開始作答
↓
/student/question/{questionId}?courseId={courseId}
```

---

# 24. 學生－單題作答

路由：

```text
/student/question/:questionId
```

API：

```text
GET  /api/v1/student/questions/{questionId}
POST /api/v1/student/questions/{questionId}/submit
```

目前正式完成：

### Choice

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

```text
TrueFalseAnswer.vue
```

Request 同樣：

```json
{
  "option_id": 1
}
```

### Submit Result

前端顯示：

```text
correct
wrong
pending
```

若 Backend 回：

```text
explanation
```

則顯示解釋。

### Knowledge Card Example

如果單題 API 回傳：

```text
examples
```

學生可以展開 / 收起知識卡範例。

---

# 25. 學生尚未完成的題型

雖然 `student-question.api.ts` 與 Type 已先定義六種題型，但目前作答頁只有 Choice / True False 正式 UI。

以下仍是 Placeholder：

```text
fill
→ 填空題作答區尚未實作

debug
→ 除錯輸入介面尚未實作

interpret
→ 程式解讀答案欄位尚未實作

coding
→ 可編輯 CodeMirror 尚未實作
```

Type / API 已預留：

### Fill / Debug / Interpret

```json
{
  "answers": {
    "1": "...",
    "2": "..."
  }
}
```

### Coding

```json
{
  "code": "<?php ... ?>"
}
```

---

# 26. Dashboard

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

Student `/student/courses` 已使用 `dashboard.courses`。

Teacher / Admin / Student 首頁仍可繼續擴充 Dashboard 資訊與統計。

---

# 27. 目前前端正式串接 API

以下 API Path 皆以：

```text
/api/v1
```

為 Base Prefix。

## Authentication

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
```

## Dashboard

```text
GET /dashboard
```

## Teacher Application

```text
POST /teacher-applications
GET  /teacher-applications
POST /teacher-applications/{id}/approve
```

## Admin

```text
GET  /stats
GET  /courses
GET  /student-applications
POST /student-applications/approve
```

## Teacher Course

```text
GET    /teacher/courses
POST   /teacher/courses
GET    /teacher/courses/{courseId}
PUT    /teacher/courses/{courseId}
DELETE /teacher/courses/{courseId}
```

## Teacher Course Students

```text
GET    /teacher/courses/{courseId}/student-applications
POST   /teacher/courses/{courseId}/student-applications
DELETE /teacher/courses/{courseId}/student-applications/{itemId}

GET  /teacher/student-applications/template
POST /teacher/student-applications
```

## Teacher Materials

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

## Teacher Questions

```text
GET /teacher/blooms
GET /teacher/courses/{courseId}/knowledge-cards

GET    /teacher/courses/{courseId}/questions
POST   /teacher/courses/{courseId}/questions
GET    /teacher/questions/{questionId}
PUT    /teacher/questions/{questionId}
DELETE /teacher/questions/{questionId}
```

## Student Materials

```text
GET /student/courses/{courseId}/graph
GET /student/courses/{courseId}/chapters
GET /student/chapters/{chapterId}/units
GET /student/units/{unitId}/knowledge-cards
```

## Student Questions

```text
GET  /student/courses/{courseId}/questions
GET  /student/questions/{questionId}
POST /student/questions/{questionId}/submit
```

---

# 28. 目前完成度

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
| Rich Text 教材編輯 | ✅ |
| 教材圖片上傳 | ✅ |
| MaterialTreeViewer 共用化 | ✅ |
| MaterialGraphViewer 共用化 | ✅ |
| Graph 搜尋 / Zoom / Fit / Rearrange | ✅ |
| Graph Detail Panel Resize | ✅ |
| Teacher / Student Theme | ✅ |
| CodeMirror Example Viewer | ✅ |
| 學生我的課程 | ✅ |
| 學生正式教材 Tree | ✅ |
| 學生正式教材 Graph | ✅ |
| Teacher 題庫列表 | ✅ |
| Teacher 題庫搜尋 / 題型 Filter | ✅ |
| Teacher Question CRUD | ✅ |
| Bloom / 知識卡關聯 | ✅ |
| Choice 出題 | ✅ |
| True / False 出題 | ✅ |
| Fill 出題基本 UI | ✅ |
| Debug 出題基本 UI | 🟡 |
| Interpret 出題基本 UI | ✅ |
| Coding 出題完整欄位 | ❌ |
| Student 題目列表 | ✅ |
| Student 單題頁 | ✅ |
| Student Choice 作答 | ✅ |
| Student True / False 作答 | ✅ |
| Student Fill 作答 | ❌ |
| Student Debug 作答 | ❌ |
| Student Interpret 作答 | ❌ |
| Student Coding 作答 | ❌ |
| Teacher 作答紀錄 / 覆核 | ❌ |
| Forgot Password UI | ❌ |
| Student 學習進度 | ❌ |
| Student 學習歷程 | ❌ |
| Teacher 學習分析 | ❌ |
| Admin 課程管理獨立頁 | ❌ |
| Admin 知識圖譜獨立頁 | ❌ |
| 完整角色 Dashboard | 🟡 |

---

# 29. 目前已知前後端落差 / 技術債

這些項目目前程式可以繼續使用，但下一階段應優先處理。

## 29.1 Debug 題 `sub_id`

目前 `QuestionFormDialog.vue` 對：

```text
fill
debug
interpret
```

都使用：

```ts
sub_id: index + 1
```

但 Backend Debug 規格中：

```text
sub_id = 錯誤程式碼行號
```

因此 Debug 題應改成讓老師明確輸入錯誤行號，而不是單純依答案順序產生 `1, 2, 3...`。

## 29.2 Coding 題缺少欄位

目前 `TeacherQuestionRequest` 尚未定義：

```text
starter_code
expected_output
reference_answer
```

`QuestionFormDialog` 也沒有輸入 UI。

所以 Coding 題目前只是「可選擇題型並儲存基本資料」，尚未完成 Backend 完整規格。

## 29.3 Student 四種題型仍是 Placeholder

目前作答頁尚未完成：

```text
fill
debug
interpret
coding
```

API / Type 已準備，但 UI 尚未完成。

## 29.4 Teacher 作答紀錄尚未串接

Frontend 尚無：

```text
GET /teacher/courses/{courseId}/question-records
PUT /teacher/question-records/{recordId}
```

相關 API / Composable / Page / Component。

## 29.5 Navbar 預留路由

目前 Navigation 已設定，但沒有正式頁面的路由包含：

```text
/admin/courses
/admin/knowledge-graph

/teacher/materials
/teacher/questions
/teacher/knowledge-graph
/teacher/analytics

/student/progress
/student/history
```

目前教材與題庫的主要入口實際位於：

```text
/teacher/course/:courseId
├─ 教材管理
└─ 題庫管理
```

## 29.6 `student-account.api.ts`

目前檔案仍為空檔案：

```text
src/api/student-account.api.ts
```

若近期沒有學生個人帳號設定功能，可以先保留或之後移除。

---

# 30. CSS / SCSS 架構

入口：

```text
src/css/app.scss
```

目前引入：

```scss
// common
@use './components/navbar';
@use './components/confirmDialog';
@use './components/common/rich-text-editor';
@use './components/common/rich-content-viewer';

// login / application
@use './components/login';
@use './components/teacherApplication';

// shared material
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
共用 Viewer 樣式放 material/
Teacher / Student 只切 Theme，不複製 Layout
RWD 與 Component 樣式放在同一功能 SCSS
```

---

# 31. Dialog / Notify 原則

目前主要操作原則：

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
顯示 Backend Error
↓
Notify Error
```

需要等待 API 的按鈕：

```text
loading
+ disable 防止重複送出
```

刪除 / 覆蓋 / 核准等重要操作：

```text
Confirm Dialog
```

教材編輯 Dialog 已依內容量區分：

```text
Chapter / Unit → compact
Knowledge Card → large
```

教材 Excel 匯入 Dialog 另有獨立尺寸設定，並針對 Quasar Dialog 預設 `max-width` 做 selector 覆蓋。

---

# 32. RWD

目前主要功能逐步支援：

```text
Desktop
Tablet
Mobile
```

包含：

- Navbar
- Course Card / Course Form
- User Management
- Course Workspace
- Student List
- Material Editor
- Material Tree
- Material Graph
- Student Course List
- Student Material
- Question List / Question Page

Graph 在小螢幕下會調整 Detail / Resize 行為，避免桌面版拖曳操作直接套用到 Mobile。

---

# 33. 下一階段建議

目前最需要補的不是再新增獨立大頁面，而是先把「題目 → 作答 → 覆核」整條流程完成。

建議順序：

```text
1. 修正 Debug 出題 sub_id / 行號
   ↓
2. 補 Coding 出題
   ├─ starter_code
   ├─ expected_output
   └─ reference_answer
   ↓
3. Student Fill 作答
   ↓
4. Student Debug 作答
   ↓
5. Student Interpret 作答
   ↓
6. Student Coding 作答 + Editable CodeMirror
   ↓
7. Teacher 作答紀錄
   ↓
8. Teacher Coding Bloom 覆核
   ↓
9. Forgot Password
   ↓
10. Student Progress / History
   ↓
11. Teacher Analytics
   ↓
12. Admin / Teacher 獨立功能頁整理
```

---

# 34. 目前專案核心流程

## 教師帳號

```text
教師公開申請
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
進入 Course Workspace
```

## 學生加入課程

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

## 教材

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
Student 修課後立即讀取正式教材
```

## 題庫

```text
Teacher Course Workspace
↓
建立題目
↓
設定 Bloom
↓
關聯 Knowledge Cards
↓
設定是否提供 Example
↓
Student 題目列表
↓
Student 單題作答
↓
目前 Choice / True False 已完成
↓
後續補 Fill / Debug / Interpret / Coding
↓
Teacher 作答紀錄 / 覆核
```

---

# 35. 前端開發原則

目前專案持續遵守：

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
- 正式教材由 Backend 作為唯一資料來源
- 前端不自行解析 Excel
- RWD
- 不過度抽象尚未需要的功能

---

# 36. 目前狀態摘要

目前 PHPEducation Frontend 已完成：

```text
帳號 / 權限基礎
+
管理員使用者開通
+
教師課程管理
+
教師班級學生管理
+
正式教材 Excel 匯入
+
正式教材 CRUD
+
Rich Text 教材編輯
+
教材 Tree / Knowledge Graph
+
學生教材瀏覽
+
教師題庫 CRUD
+
Bloom / Knowledge Card 關聯
+
學生題目列表
+
選擇題 / 是非題作答
```

目前下一個主要開發階段：

```text
補完整六種題型
+
教師作答紀錄 / 覆核
+
學習進度 / 學習歷程
+
學習分析
```
