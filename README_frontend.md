# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
此 README 主要記錄截至 **2026-08-27** 的前端架構、已完成功能、正式 API 串接狀態，以及目前仍待確認或開發中的功能。

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
- CodeMirror 6（教材程式碼範例唯讀顯示）

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

教材 Excel 與學生名冊 Excel 使用 `FormData` 上傳時，交由 Axios / Browser 自動設定正確的 multipart boundary，避免上傳時發生 422。

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

目前已正式串接學生 Pending 名單與批次開通流程：

```text
GET  /api/v1/courses

GET  /api/v1/student-applications
     ?course_id={courseId}
     &status=pending
     &q={keyword}

POST /api/v1/student-applications/approve
```

目前流程：

```text
取得所有課程
+
取得全站 Pending Student
        ↓
只保留「有待開通學生」的課程
        ↓
管理員選擇課程
        ↓
取得該課 Pending 學生
        ↓
搜尋學號 / 姓名
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

目前 Frontend 已完成：

- 課程下拉只顯示有 Pending Student 的課程
- 課程選項顯示學期、課程名稱與 `class_name`
- `QSelect` 使用 `behavior="menu"`，選項直接於欄位下方展開
- Pending 學生列表
- 學號 / 姓名 / Email / 班級 / 申請教師
- 顯示「已有帳號 / 需建立帳號」
- 搜尋學號 / 姓名
- 單選 / 全選
- 已選數量
- ConfirmDialog
- 批次開通 Loading
- 開通成功後更新統計與 Pending 數量
- 若目前課程已無 Pending Student，自動從下拉移除並切換下一門待處理課程
- 若全站已無 Pending Student，顯示空狀態

目前管理員採「勾選指定學生後批次開通」流程。Backend 另有整張申請單一次核准 API，但目前 Frontend 未提供該按鈕。

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

目前功能：

- 顯示教師自己的課程
- 新增課程
- 修改課程
- 刪除課程
- 新增 / 修改課程班級 `class_name`
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

### 課程班級

新增與編輯課程時 `class_name` 為必填：

```json
{
  "name": "PHP 程式設計",
  "class_name": "資應二甲",
  "description": "從基礎語法到實作練習",
  "semester": "115-1"
}
```

### Course Card

`CourseCard.vue` 目前顯示：

- 課程名稱
- 課程班級
- 學年度 / 學期
- 課程說明
- 編輯
- 刪除
- 進入課程

課程說明保留使用者輸入的換行，並維持 Card 版面一致。

## 11. 教師－單一課程工作區

路由：

```text
/teacher/course/:courseId
```

目前使用 Tab 整合：

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
- 顯示課程班級
- 顯示課程說明
- 顯示學期
- 修改課程名稱
- 修改課程班級
- 修改學期
- 修改課程說明
- 課程說明保留換行
- API 成功後自動關閉 Dialog
- Loading
- Notify

### 11.2 班級學生

原本 Mock 的學生管理已移除，目前已正式串接 Backend。

前端架構：

```text
CourseStudentPanel.vue
        ↓
useTeacherCourseStudents.ts
        ↓
teacher-course-student.api.ts
        ↓
Backend
```

正式 API：

```text
GET    /api/v1/teacher/courses/{courseId}/student-applications?status=approved
GET    /api/v1/teacher/courses/{courseId}/student-applications?status=pending

POST   /api/v1/teacher/courses/{courseId}/student-applications
DELETE /api/v1/teacher/courses/{courseId}/student-applications/{itemId}

GET    /api/v1/teacher/student-applications/template
POST   /api/v1/teacher/student-applications
```

目前 UI：

```text
班級學生
├─ 已開通（預設）
│  ├─ 學號
│  ├─ 姓名
│  ├─ Email
│  ├─ 搜尋
│  └─ 從課程移除
│
└─ 待審核
   ├─ 學號
   ├─ 姓名
   ├─ Email
   ├─ 搜尋
   └─ 取消申請
```

目前已完成：

- 預設顯示 `approved` 已開通學生
- `approved / pending` 名單篩選
- 學號 / 姓名 / Email 前端搜尋
- 手動一次新增多位學生（最多 100 位）
- 學號自動去除 `s` 前綴並限制數字
- 同批重複學號前端檢查
- 新增成功後自動切至待審核名單
- 學生名冊 Excel 範本下載
- Excel 批次匯入
- 匯入成功後自動切至待審核名單
- 待審核學生可取消申請
- 已開通學生可由教師直接移出課程
- 已開通學生移除時只取消該課 Enrollment，學生帳號保留
- 已開通學生不提供編輯功能
- ConfirmDialog / Loading / Notify / Error 狀態
- RWD

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
CodeExampleViewer.vue
```

支援顯示：

```text
Chapter
→ Unit
   → Knowledge Card
```

Knowledge Card 顯示：

- `title`
- `content`
- `example`

`example` 已改用 **CodeMirror 6** 唯讀模式內嵌顯示：

- 行號
- 等寬字體
- Syntax Highlight
- 可選取 / 複製
- 唯讀，不允許學生或 Viewer 直接修改

目前 `CodeExampleViewer.vue` 先以 PHP language extension 顯示；若未來教材要依 PHP / HTML / CSS / JavaScript 自動切換語法，仍需增加語言欄位或語言判斷。

Viewer 可同時顯示 Draft 與由正式教材 API 組出的 Published Topic tree。

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

目前已實作「單一 Published Topic → 單一 Draft」流程：

```text
已發布 Topic
   ↓
加入草稿編輯
   ↓
POST /api/v1/teacher/courses/{courseId}/material-drafts
Body: { topic_id: topicId }
   ↓
Backend 只複製被選取的 Topic
   ↓
Frontend 開啟 MaterialDraftEditor
```

目前 `createDraftFromPublished(courseId, topicId)` 已直接傳 `topic_id`，不再使用舊的「整份 Published 教材建立 Draft」按鈕流程。

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

Backend 目前已確認發布規則：

- 發布只同步目前這份 Draft 中的 Topic
- 同名或對應正式 Topic 會更新
- 新 Topic 會新增
- 其他已發布 Topic 保留，不會因發布單一 Topic 而被刪除
- 舊 `published` MaterialDraft 會轉為 `archived`
- 已被題目引用的 Knowledge Card 不會因上層教材更新而破壞題目關聯

因此先前「單一 Topic Draft 發布可能刪掉其他 Topic」的問題已由 Backend 修正。

### 12.9 教材管理目前狀態與待辦

先前與 Backend 對齊的兩個主要問題目前已確認：

1. **教材同名重用規則已調整**
   - 只與該課「未發布 Draft」重名時阻擋。
   - 已發布 / archived / 已刪空 Draft 的名稱可以再次使用。

2. **多 Topic 發布規則已調整**
   - 發布單一 Draft 不會清掉其他正式 Topic。

3. **建立 / 更新時間已完成**
   - `MaterialDraft` / `PublishedTopic` 已加入 `created_at / updated_at`。
   - Published / Draft Topic Card 已顯示「最後更新」。

目前教材端主要剩下：

- 完整回歸測試 Published → Draft → Edit → Publish
- CodeMirror 目前固定使用 PHP Syntax Highlight；多語言自動切換尚未做
- Backend 的正式 Topic / Chapter / Unit / Knowledge Card `POST / PUT` API 尚未直接做成 Frontend UI；目前設計刻意以 Draft 編輯流程為主

## 13. Dashboard

目前已建立共用資料層：

```text
dashboard.api.ts
        ↓
useDashboard.ts
        ↓
GET /api/v1/dashboard
```

目前教師首頁已有基礎版：

- 取得教師名稱
- 取得教師課程
- 顯示課程名稱與學期

但 Dashboard UI 尚未完整：

- Teacher Dashboard 仍為簡易文字列表
- Student Dashboard / 我的課程正式畫面尚未建立
- Backend 已回傳課程 `class_name`，但 `DashboardCourse` Type / UI 尚未完整使用
- Backend `/auth/me` 對 Student 會回 `student_no / class_name`，目前共用 `User` Type 尚未加入學生專屬欄位

管理員統計目前獨立使用：

```text
GET /api/v1/stats
```

## 14. 目前正式 API 串接狀態

### Authentication－已串接

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Teacher Application－已串接

```text
POST /api/v1/teacher-applications
GET  /api/v1/teacher-applications?status=pending
POST /api/v1/teacher-applications/{id}/approve
```

### Admin－已串接

```text
GET  /api/v1/stats
GET  /api/v1/courses

GET  /api/v1/teacher-applications
POST /api/v1/teacher-applications/{id}/approve

GET  /api/v1/student-applications
POST /api/v1/student-applications/approve
```

### Teacher Course－已串接

```text
GET    /api/v1/teacher/courses
POST   /api/v1/teacher/courses
GET    /api/v1/teacher/courses/{courseId}
PUT    /api/v1/teacher/courses/{courseId}
DELETE /api/v1/teacher/courses/{courseId}
```

### Teacher Class Students－已串接

```text
GET    /api/v1/teacher/courses/{courseId}/student-applications
POST   /api/v1/teacher/courses/{courseId}/student-applications
DELETE /api/v1/teacher/courses/{courseId}/student-applications/{itemId}

GET    /api/v1/teacher/student-applications/template
POST   /api/v1/teacher/student-applications
```

### Teacher Material－Import / Draft－已串接

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

### Teacher Material－Published－部分串接

目前 Frontend 使用：

```text
GET    /api/v1/teacher/courses/{courseId}/topics
DELETE /api/v1/teacher/topics/{topicId}

GET /api/v1/teacher/topics/{topicId}/chapters
GET /api/v1/teacher/chapters/{chapterId}/units
GET /api/v1/teacher/units/{unitId}/knowledge-cards
```

Backend 另外提供正式教材 Topic / Chapter / Unit / Knowledge Card 的 `POST / PUT`，目前 Frontend 沒有直接使用，正式教材修改以 Draft 流程為主。

### Student Material－Backend 已有，Frontend 尚未串接

```text
GET /api/v1/student/courses/{courseId}/topics
GET /api/v1/student/topics/{topicId}/chapters
GET /api/v1/student/chapters/{chapterId}/units
GET /api/v1/student/units/{unitId}/knowledge-cards
```

### Student Questions－Backend 已有，Frontend 尚未串接

```text
GET  /api/v1/student/courses/{courseId}/questions
GET  /api/v1/student/questions/{questionId}
POST /api/v1/student/questions/{questionId}/submit
```

Backend 已支援 `choice / debug / coding` 三種題型的取得與提交流程。

### Teacher Question Records－Backend 已有，Frontend 尚未串接

```text
GET /api/v1/teacher/courses/{courseId}/question-records
PUT /api/v1/teacher/question-records/{recordId}
```

Backend 可讓教師查看自己課程的學生作答並覆核 `teacher_status`。

## 15. 目前完成度摘要

| 功能 | 狀態 |
|------|------|
| Login / Logout / Restore Session | ✅ 已串接 |
| Router Guard / Role Guard | ✅ 已完成 |
| Role Navbar / RWD | ✅ 已完成 |
| 教師帳號申請 | ✅ 已串接 |
| 管理員統計 | ✅ 已串接 |
| 管理員教師核准 | ✅ 已串接 |
| 管理員學生帳號開通 | ✅ 已串接主要流程 |
| 管理員只顯示有 Pending Student 的課程 | ✅ 已完成 |
| 教師課程 CRUD | ✅ 已串接 |
| 課程班級 `class_name` | ✅ 新增 / 編輯 / Card / 課程資訊已完成 |
| 教師課程工作區－課程資訊 | ✅ 已串接 |
| 教師課程工作區－班級學生 | ✅ 已移除 Mock、正式串接 |
| 班級學生 approved / pending 篩選 | ✅ 已完成 |
| 班級學生手動多筆新增 | ✅ 已串接 |
| 班級學生 Excel 匯入 | ✅ 已串接 |
| 教師直接移除課程學生 | ✅ 已串接 |
| Excel 教材匯入 | ✅ 已串接 |
| Draft Topic Card | ✅ 已完成 |
| Published Topic Card | ✅ 已改用正式 Topic API |
| 教材 Card 最後更新時間 | ✅ 已完成 |
| 查看 Draft 教材 | ✅ 已完成 |
| 查看 Published 教材 | ✅ 已串接正式鑽層 API |
| Knowledge Card example CodeMirror | ✅ 已完成唯讀版 |
| Published → 單 Topic Draft 編輯 | ✅ 已完成 |
| Chapter / Unit / Knowledge Card Draft 編輯 | ✅ 已串接 |
| Draft Topic 刪除 | ✅ 已串接 |
| Published Topic 刪除 | ✅ 已串接 |
| 教材發布 | ✅ Backend 規則已對齊、Frontend 已串接 |
| Student 教材頁 | ⚪ Backend 已有，Frontend 尚未完成 |
| Student 題目 / 作答 | ⚪ Backend 已有，Frontend 尚未完成 |
| Teacher 作答覆核 | ⚪ Backend 已有，Frontend 尚未完成 |
| Dashboard 完整角色內容 | 🟡 基礎資料層已完成，UI 持續開發 |

## 16. 目前優先待辦

```text
1. Student 教材頁
   → 串接正式 Published 教材
   → Course → Topic → Chapter → Unit → Knowledge Card
   → 共用 CodeExampleViewer 顯示範例程式碼

2. Student 題目 / 作答
   → 課程題目列表
   → 單題頁
   → choice / debug / coding 作答 UI
   → Submit API
   → 顯示系統批改結果 / pending 狀態

3. Teacher 作答覆核
   → 課程學生作答列表
   → 查看作答內容
   → correct / wrong 覆核

4. Dashboard
   → Teacher 首頁正式版
   → Student 首頁 / 我的課程
   → 補上 class_name、student_no 等角色資料

5. 教材管理回歸測試
   → Published → Draft → Edit → Publish
   → 同名教材重用
   → 多 Topic 保留
   → CodeMirror 未來多語言切換
```

## 17. Backend 已完成，但 Frontend 尚未做到的功能

以下是依目前 Backend README 與 Frontend `src` 對照後，Backend 已有 API / 資料，但 Frontend 尚未完整實作的部分。

| Backend 已完成 | Frontend 現況 | 優先度 |
|---|---|---|
| Student Published Material APIs | 尚無 Student 教材瀏覽頁與 API layer | 高 |
| Student Question List / Detail / Submit | 尚無題目列表、單題與作答 UI | 高 |
| Choice / Debug / Coding Submit 流程 | 尚未串接 | 高 |
| Teacher Question Records List / Review | 尚無教師作答覆核頁 | 高 |
| Student Dashboard 已修課程 | Student 首頁 / 我的課程 UI 尚未建立 | 高 |
| Dashboard 課程 `class_name` | `DashboardCourse` 尚未完整加入 / 顯示 | 中 |
| `/auth/me` Student `student_no / class_name` | 共用 `User` Type 尚未加入學生專屬欄位 | 中 |
| 整張 Student Application 一鍵 Approve | Admin 目前採勾選 item 批次開通，未提供整單按鈕 | 低 / 可選 |
| Teacher Application `status=approved` 查詢 | Admin UI 只顯示 Pending，尚無已核准歷史列表 | 低 / 可選 |
| 正式教材 Topic / Chapter / Unit / Card POST / PUT | Frontend 刻意走 Draft 編輯流程，沒有直接正式表編輯 UI | 低 / 目前不需要 |

### 最值得先做的三塊

```text
Student 教材
→ Student 題目 / 作答
→ Teacher 作答覆核
```

這三塊 Backend 都已有可用 API，而目前 Frontend 幾乎尚未開始，因此是目前最大的前後端完成度差距。

### 目前另外發現的前後端型別小問題

管理員課程 API 的 Backend 欄位為：

```text
teacher_id
class_name
```

目前 `user-management.ts / useUserManagement.ts` 已使用 `class_name`，但 `teacherId` 的 Backend mapping 仍應再確認是否要由 `teacher_id` 轉換。此欄位目前未影響課程下拉顯示，但建議之後統一 snake_case API response 與 camelCase Frontend model 的轉換方式。

## 18. 資料庫同步注意事項

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

## 19. 前端開發原則

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
