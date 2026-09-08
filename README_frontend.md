# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
本 README 依 **2026-09-09 最新前端 `src` 程式碼與本次已完成修改**整理，內容以目前已完成並實際存在於前端的功能為主。

---

## 1. 前端技術

目前主要使用：

```text
Vue 3
Quasar Framework
TypeScript
Vue Router / File-based Routing
Pinia
Axios
TipTap
vis-network
CodeMirror 6
SCSS
```

各套件主要用途：

| 技術 | 用途 |
|---|---|
| Vue 3 | 頁面與元件開發 |
| Quasar | UI 元件、Dialog、Notify、RWD |
| TypeScript | API / Component 型別管理 |
| Pinia | 登入狀態管理 |
| Axios | REST API 串接 |
| TipTap | 教材 HTML 富文字編輯 |
| vis-network | 教材知識圖譜 |
| CodeMirror 6 | 程式碼顯示與編輯 |
| SCSS | 元件樣式與 RWD |

---

## 2. 前端架構

主要目錄：

```text
src/
├─ api/
│  ├─ auth.api.ts
│  ├─ dashboard.api.ts
│  ├─ admin-user-management.api.ts
│  ├─ teacher-application.api.ts
│  ├─ teacher-course.api.ts
│  ├─ teacher-course-student.api.ts
│  ├─ teacher-material.api.ts
│  ├─ teacher-question.api.ts
│  ├─ student-material.api.ts
│  └─ student-question.api.ts
│
├─ boot/
│  ├─ auth.ts
│  └─ axios.ts
│
├─ components/
│  ├─ admin/
│  ├─ common/
│  │  ├─ CodeEditor.vue
│  │  ├─ CodeExampleViewer.vue
│  │  ├─ ConfirmDialog.vue
│  │  ├─ RichContentViewer.vue
│  │  └─ RichTextEditor.vue
│  ├─ material/
│  │  ├─ MaterialGraphViewer.vue
│  │  └─ MaterialTreeViewer.vue
│  ├─ navigation/
│  │  └─ AppNavbar.vue
│  ├─ student/question/
│  │  ├─ ChoiceAnswer.vue
│  │  ├─ TrueFalseAnswer.vue
│  │  ├─ FillAnswer.vue
│  │  ├─ DebugAnswer.vue
│  │  ├─ InterpretAnswer.vue
│  │  ├─ CodingAnswer.vue
│  │  └─ StudentQuestionList.vue
│  └─ teacher/
│     ├─ course-workspace/
│     └─ question/
│        └─ QuestionFormDialog.vue
│
├─ composables/
├─ config/
├─ css/
├─ pages/
├─ router/
├─ stores/
├─ types/
└─ utils/
```

前端基本分工：

```text
Page
  ↓
Component
  ↓
Composable
  ↓
API
  ↓
Laravel Backend
```

---

## 3. API Base URL

Axios instance 位於：

```text
src/boot/axios.ts
```

Base URL 由環境變數取得：

```ts
import.meta.env.QCLI_API_BASE_URL
```

開發環境 Backend 通常為：

```text
http://127.0.0.1:8000/api/v1
```

Request Interceptor 會自動從 `sessionStorage` 取得：

```text
auth_token
```

並加入：

```http
Authorization: Bearer {token}
```

FormData Request 不會手動指定 `Content-Type`，交由瀏覽器自動產生 multipart boundary。

---

## 4. Authentication

目前已完成：

```text
登入
登出
Session Restore
/auth/me
Role-based Router Guard
登入後依角色導向
```

角色：

```text
admin
teacher
student
```

學生登入時前端可直接輸入學號，不需自行加 `s` 或組完整校園信箱。

---

## 5. Token 失效全域處理

`src/boot/axios.ts` 已完成 Axios Response Interceptor。

當已登入使用者呼叫受保護 API 並收到 `401`：

```text
API 回 401
↓
確認不是 /auth/login 本身的帳密錯誤
↓
確認原本存在 auth token
↓
clearAuth()
↓
清除 sessionStorage auth_token
↓
導回 /login
↓
顯示「登入已逾期，請重新登入」
```

跳轉時會保留原本路徑：

```text
/login?redirect=/原本頁面
```

並透過鎖定旗標避免多支 API 同時 401 時重複 Notify / 重複導頁。

---

## 6. 忘記密碼

登入頁已完成學生與教師忘記密碼功能。

入口：

```text
/login
└─ 忘記密碼？
```

支援角色：

```text
學生
教師
```

學生送：

```json
{
  "student_no": "1411131000"
}
```

教師送：

```json
{
  "teacher_account": "teacher_account"
}
```

表單使用：

```vue
lazy-rules="ondemand"
```

因此只有按下「寄送新密碼」時才開始驗證。

切換學生 / 教師角色時會：

```text
清空帳號欄位
清除 API 錯誤
resetValidation()
```

避免前一角色的紅框與錯誤訊息殘留。

---

## 7. 共用 Navbar 與 Router Guard

共用 Navbar：

```text
src/components/navigation/AppNavbar.vue
```

不同角色使用不同導覽項目與主題色。

Router Guard 會依：

```text
是否登入
使用者 role
目標 route
```

限制不同角色存取不屬於自己的頁面。

---

## 8. 教師帳號申請

公開頁面：

```text
/teacherApplication
```

目前可填：

```text
姓名
Eportal 信箱
自訂帳號
申請理由
```

送出後建立待審核教師申請。

### Email 提醒

教師申請表已加入 Email 提示：

```text
審核通過後，系統會將帳號開通通知寄到此信箱。
若收件匣中沒有看到，請一併檢查垃圾郵件或促銷內容。
```

---

## 9. 管理員－使用者管理

管理員使用者管理頁已完成：

```text
教師申請列表
教師申請核准
學生帳號申請列表
課程篩選
學生搜尋
學生批次勾選開通
教師 / 學生 / 課程統計
```

相關元件：

```text
components/admin/user-management/
├─ TeacherApprovalPanel.vue
├─ CourseActivationPanel.vue
├─ CourseStudentListDialog.vue
└─ UserStatsCards.vue
```

---

## 10. 教師－課程管理

教師可管理自己的課程：

```text
查看課程列表
建立課程
修改課程
刪除課程
```

課程資料包含：

```text
name
description
semester
class_name
```

課程管理頁：

```text
src/pages/teacher/courseManagement.vue
```

單一課程工作區：

```text
src/pages/teacher/course/[courseId].vue
```

---

## 11. 教師－班級學生管理

單一課程內已完成學生名冊管理：

```text
查看課程學生
下載 Excel 名冊範本
Excel 批次上傳
手動新增一位或多位學生
顯示待開通 / 已開通狀態
移除課程學生
```

### Email 提醒

老師送出學生帳號申請時，目前在：

```text
學生名冊頁
Excel 匯入 Dialog
手動新增 Dialog
```

都會提醒：

```text
管理員開通後，若本次有新建立的學生帳號，
系統會將學生帳號名單寄到教師信箱；
若未收到，請檢查垃圾郵件。
```

---

## 12. 教師－教材管理

教材資料層級：

```text
Course
└─ Chapter
   └─ Unit
      └─ Knowledge Card
```

目前已完成：

```text
教材 Excel 範本下載
Excel 教材匯入
已有教材時覆蓋確認
整棵教材 Tree 讀取
Chapter CRUD
Unit CRUD
Knowledge Card CRUD
圖片上傳
正式教材立即更新
```

---

## 13. 教材 Excel 匯入

教師可下載公版 Excel 範本，再匯入指定課程。

Frontend 不自行解析 Excel，而是將檔案送給 Backend：

```text
POST /teacher/courses/{courseId}/materials/import
```

如果課程已有教材，前端會顯示覆蓋確認流程，再以：

```text
overwrite=true
```

重新送出。

教材匯入 Dialog 已使用獨立寬度，並覆寫 Quasar minimized dialog 預設的 `max-width` 限制。

---

## 14. MaterialEditor

共用教材編輯器：

```text
src/components/teacher/course-workspace/MaterialEditor.vue
```

依編輯類型使用不同 Dialog 尺寸：

```text
Chapter       → 小型表單
Unit          → 小型表單
KnowledgeCard → 大型編輯器
```

Knowledge Card 可編輯：

```text
名稱
類型
HTML 內容
程式範例
排序
```

---

## 15. RichTextEditor / RichContentViewer

教材內容編輯使用 TipTap。

支援：

```text
標題 / 段落
粗體 / 斜體
清單
文字對齊
表格
圖片
```

圖片透過 Backend 上傳後，以 URL 寫入教材 HTML。

學生與教師瀏覽教材時使用：

```text
RichContentViewer.vue
```

顯示正式 HTML 內容。

---

## 16. MaterialTreeViewer

教師與學生共用：

```text
src/components/material/MaterialTreeViewer.vue
```

目前階層：

```text
Chapter
→ Unit
→ Knowledge Card
```

### 預設收合

Chapter 與 Unit 的 `q-expansion-item` 目前預設都是關閉狀態。

進入教材頁時先看到：

```text
▶ 第一章
▶ 第二章
▶ 第三章
```

由使用者自行展開章節，再展開單元查看知識卡。

教師模式另外提供：

```text
新增
編輯
刪除
```

學生模式則為純瀏覽。

---

## 17. MaterialGraphViewer

教材可切換成知識圖譜顯示，使用：

```text
vis-network
```

目前已完成：

```text
課程 / 章節 / 單元 / 知識卡節點
搜尋
Zoom
Fit
重新排列
拖曳節點
拖曳視圖
節點詳細資料
知識卡內容顯示
```

知識卡「所屬位置」過長時：

```text
顯示省略號
Hover Tooltip 顯示完整路徑
```

右側詳細資料區可以拖曳中間分隔線調整寬度，也可以雙擊恢復預設寬度。

---

## 18. CodeMirror 共用元件

目前有兩個 CodeMirror 共用元件：

```text
CodeExampleViewer.vue
→ 唯讀程式碼

CodeEditor.vue
→ 可編輯程式碼
```

兩者都使用 CodeMirror 6，並載入 PHP Syntax Highlight。

### 自動高度

CodeMirror 已改成依內容自然調整高度：

```text
1 行程式碼 → 約 1 行高度
5 行程式碼 → 自然增加到 5 行
10 行程式碼 → 自然增加到 10 行
```

不再使用固定 `height` / 大型 `min-height` 留下多餘空白。

目前 CodeMirror 用於：

```text
教材程式範例
填空題題目
除錯題程式碼
程式解讀題程式碼
學生程式實作答案
```

並分為 Teacher / Student Theme。

---

## 19. 教師－題庫管理

教師可以在自己的課程內：

```text
查看題目
搜尋題目
依題型篩選
依 Bloom 篩選
新增題目
修改題目
刪除題目
關聯知識卡
控制是否顯示知識卡範例
```

支援 6 種題型：

```text
choice       選擇題
true_false   是非題
fill         填空題
debug        除錯題
interpret    程式解讀題
coding       程式實作題
```

---

## 20. 教師出題－選擇題 / 是非題

選擇題可建立多個選項，並指定正確答案。

是非題固定使用兩個選項，且只能有一個正解。

前端不需要自行計算 SOLO，交由 Backend 處理。

---

## 21. 教師出題－填空題

填空題題幹目前使用 **CodeMirror** 編輯。

老師可以在要作答的位置使用：

```text
（1）
（2）
（3）
```

例如：

```text
123（1）
5（2）7
```

並依順序設定每格標準答案。

`sub_id` 依答案順序對應：

```text
（1）→ sub_id = 1
（2）→ sub_id = 2
```

---

## 22. 教師出題－除錯題

除錯題的完整待除錯程式使用可編輯 **CodeMirror**。

老師另外設定：

```text
錯誤行號
修正後程式碼
錯誤原因
```

其中：

```text
sub_id = 真實程式行號
```

不是第幾筆答案。

前端會檢查：

```text
行號必須是正整數
行號不可重複
行號不可超過程式總行數
```

刪除其中一筆錯誤答案時，不會重新改寫其他錯誤的真實行號。

Debug 題目的程式內容儲存時會保留原始行數，避免 `.trim()` 導致 CodeMirror 行號與 Backend `sub_id` 錯位。

---

## 23. 教師出題－程式解讀題

程式解讀題用來：

```text
判斷或解釋程式碼執行結果
評估學生解讀與推演程式的能力
```

教師端分成：

```text
提問方式
待解讀程式碼（CodeMirror）
單一標準答案
答案說明
```

程式解讀題固定只有 **1 個答案**，不提供新增多個答案。

Frontend 會在送出前將：

```text
提問方式
+
<!--code-stem-->
+
程式碼
```

組回 Backend 原本使用的 `question_content` 格式。

---

## 24. 教師出題－程式實作題

Coding 題已支援 Backend 的：

```text
starter_code
expected_output
reference_answer
```

用途：

| 欄位 | 說明 |
|---|---|
| `starter_code` | 學生可看到的初始程式 / 已知條件 |
| `expected_output` | 教師端期望輸出 |
| `reference_answer` | 教師端參考程式 |

新增與編輯題目時都會正確載入與送出這三個欄位。

---

## 25. 學生－我的課程與教材

學生登入後可查看自己已選修的課程。

進入單一課程後可查看：

```text
教材階層
教材圖譜
題目練習
```

教材顯示與教師端共用：

```text
MaterialTreeViewer
MaterialGraphViewer
RichContentViewer
CodeExampleViewer
```

---

## 26. 學生－題目列表

題目練習列表目前改為 **條列式 / List** 顯示。

Desktop / Tablet 欄位：

```text
題號
題目
題型
Bloom
作答次數
操作
```

不同題型使用不同 Badge 顏色。

Mobile 會縮成較適合小螢幕的資訊排列。

### 作答次數欄位

Frontend 已預留「作答次數」欄位與型別位置；目前 Backend 尚未提供 `attempt_count`，因此目前不顯示實際次數資料。

---

## 27. 學生－選擇題 / 是非題作答

學生可直接點選選項並送出：

```json
{
  "option_id": 1
}
```

作答完成後會顯示 Backend 回傳的：

```text
correct
wrong
```

以及答案說明。

---

## 28. 學生－填空題作答

填空題題目會以 **CodeMirror 唯讀模式**顯示，保留老師輸入的程式格式與換行。

前端依 Backend 的：

```text
sub_ids
```

建立答案欄位。

送出格式：

```json
{
  "answers": {
    "1": "答案一",
    "2": "答案二"
  }
}
```

輸入欄使用 on-demand validation，只有送出時才顯示必填錯誤。

---

## 29. 學生－除錯題作答

除錯題的待除錯程式以 **CodeMirror 唯讀模式**顯示，因此學生可以直接對照行號。

Backend 只提供：

```text
debug_error_count
```

前端依錯誤數量產生對應的作答區：

```text
錯誤行號
修正後程式碼
```

前端會檢查：

```text
行號必填
行號為正整數
錯誤行號不可重複
修正內容必填
```

最後組成：

```json
{
  "answers": {
    "2": "$name = \"Tom\";",
    "5": "echo $name;"
  }
}
```

---

## 30. 學生－程式解讀題作答

學生會看到：

```text
提問文字
CodeMirror 唯讀程式碼
單一答案輸入欄
```

Interpret 固定只有一個答案，不產生多組答案欄位。

送出仍使用 Sub Answer 格式：

```json
{
  "answers": {
    "1": "15"
  }
}
```

---

## 31. 學生－程式實作題作答

Coding 題目前已完成可編輯 CodeMirror 作答介面。

如果老師有提供：

```text
starter_code
```

會自動載入學生的 CodeMirror，學生可直接在原程式上繼續完成。

送出格式：

```json
{
  "code": "$a = 10;\n$b = 20;\necho $a + $b;"
}
```

Coding 題送出後依 Backend 設計顯示 `pending` 狀態，等待後續教師覆核。

---

## 32. 學生－作答結果

單題頁目前可處理：

```text
correct
wrong
pending
```

Fill / Debug / Interpret 額外顯示：

```text
答對 X / Y 格
答對 X / Y 處
答對 X / Y 題
```

Frontend 同時相容 Backend Submit Response 的：

```text
explanation
description
```

因此不同題型目前都能顯示答案說明。

---

## 33. 作答完成後導覽

學生成功送出答案後，頁面會顯示：

```text
返回題目列表
回答下一題
```

「回答下一題」不是直接使用 `questionId + 1`，而是依目前課程題目列表的實際順序尋找下一題。

例如題目 ID 為：

```text
2 → 5 → 8
```

目前在 2 時會前往 5。

若目前已是最後一題，顯示：

```text
已是最後一題
```

---

## 34. 已串接的主要 API

### Authentication

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/student/forgot-password
POST /auth/teacher/forgot-password
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

### Teacher Student Roster

```text
GET    /teacher/student-applications/template
POST   /teacher/student-applications
GET    /teacher/courses/{courseId}/student-applications
POST   /teacher/courses/{courseId}/student-applications
DELETE /teacher/courses/{courseId}/student-applications/{itemId}
```

### Teacher Material

```text
GET    /teacher/materials/template
POST   /teacher/courses/{courseId}/materials/import
GET    /teacher/courses/{courseId}/tree
POST   /teacher/upload-image

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
```

### Teacher Question

```text
GET    /teacher/blooms
GET    /teacher/courses/{courseId}/knowledge-cards
GET    /teacher/courses/{courseId}/questions
POST   /teacher/courses/{courseId}/questions
GET    /teacher/questions/{questionId}
PUT    /teacher/questions/{questionId}
DELETE /teacher/questions/{questionId}
```

### Student Material

```text
GET /student/courses/{courseId}/graph
GET /student/courses/{courseId}/chapters
GET /student/chapters/{chapterId}/units
GET /student/units/{unitId}/knowledge-cards
```

### Student Question

```text
GET  /student/courses/{courseId}/questions
GET  /student/questions/{questionId}
POST /student/questions/{questionId}/submit
```

---

## 35. CSS / SCSS 架構

主要樣式：

```text
src/css/
├─ app.scss
├─ quasar.variables.scss
└─ components/
   ├─ admin/
   ├─ common/
   ├─ material/
   ├─ student/
   └─ teacher/
```

原則：

```text
Vue Component → 結構與互動
SCSS          → 畫面樣式
```

角色主題大致為：

```text
Admin   → Purple
Teacher → Blue
Student → Teal / Green
```

---

## 36. RWD

目前主要頁面與共用元件都有針對：

```text
Desktop
Tablet
Mobile
```

處理版面。

包含：

```text
Navbar
Dialog
課程卡片
教材 Tree
教材 Graph
題目列表
學生作答介面
CodeMirror
```

學生題目列表在 Desktop 使用多欄條列；Mobile 會縮成單題資訊區塊，避免橫向欄位過擠。

---

## 37. 已完成功能摘要

| 功能 | 狀態 |
|---|---:|
| Login / Logout | ✅ |
| Session Restore | ✅ |
| Role-based Router Guard | ✅ |
| Token 401 自動清除與回登入頁 | ✅ |
| Student Forgot Password | ✅ |
| Teacher Forgot Password | ✅ |
| Teacher Application | ✅ |
| Teacher Application Email 垃圾郵件提醒 | ✅ |
| Admin Teacher Approval | ✅ |
| Admin Student Activation | ✅ |
| Teacher Course CRUD | ✅ |
| Teacher Student Roster | ✅ |
| Student Roster Excel Upload | ✅ |
| Student Account Email 垃圾郵件提醒 | ✅ |
| Material Excel Import | ✅ |
| Chapter CRUD | ✅ |
| Unit CRUD | ✅ |
| Knowledge Card CRUD | ✅ |
| RichText Editor | ✅ |
| Editor Image Upload | ✅ |
| Material Tree Viewer | ✅ |
| Material Tree 預設收合 | ✅ |
| Material Graph Viewer | ✅ |
| Graph Search / Zoom / Fit / Drag | ✅ |
| Graph Path Ellipsis + Tooltip | ✅ |
| Graph Detail Panel Resize | ✅ |
| CodeMirror 唯讀 Viewer | ✅ |
| CodeMirror 可編輯 Editor | ✅ |
| CodeMirror 依內容自動高度 | ✅ |
| Teacher Question CRUD | ✅ |
| Teacher Choice 出題 | ✅ |
| Teacher True / False 出題 | ✅ |
| Teacher Fill 出題 | ✅ |
| Teacher Debug 出題 | ✅ |
| Teacher Interpret 出題 | ✅ |
| Teacher Coding 出題 | ✅ |
| Student Question List | ✅ |
| Student Question List 條列式顯示 | ✅ |
| Student Choice 作答 | ✅ |
| Student True / False 作答 | ✅ |
| Student Fill 作答 | ✅ |
| Student Debug 作答 | ✅ |
| Student Interpret 作答 | ✅ |
| Student Coding 作答 | ✅ |
| Student Submit Result | ✅ |
| 回答下一題 | ✅ |
| 返回題目列表 | ✅ |

---

## 38. 已完成核心流程

### 使用者流程

```text
教師申請帳號
↓
管理員核准
↓
教師登入
```

### 課程與學生

```text
教師建立課程
↓
教師匯入 / 新增學生名冊
↓
管理員開通學生
↓
學生登入並看到已選課程
```

### 教材

```text
教師下載教材 Excel 範本
↓
匯入正式教材
↓
Chapter / Unit / Knowledge Card 編輯
↓
學生立即瀏覽正式教材
↓
Tree / Graph 顯示
```

### 題目與學生作答

```text
教師建立題目
↓
關聯 Bloom + Knowledge Card
↓
學生進入題目練習列表
↓
Choice / True False / Fill / Debug / Interpret / Coding
↓
送出答案
↓
顯示作答結果或 pending
↓
返回題目列表 / 回答下一題
```

---

## 39. 開發原則

目前前端持續採用以下原則：

```text
API 集中於 src/api
型別集中於 src/types
頁面流程集中於 composables
UI 拆成可重用 components
共用題目 / 教材元件避免重複實作
角色權限以前端 Guard + Backend Middleware 雙重限制
實際判分與資料權限以 Backend 為準
```

