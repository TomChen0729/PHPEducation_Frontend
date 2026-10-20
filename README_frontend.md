# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
本 README 依 **2026-10-20 最新前端程式與目前 Backend API** 整理，內容以目前實際存在於前端、且 Backend 已支援的功能為準。

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

| 技術         | 用途                         |
| ------------ | ---------------------------- |
| Vue 3        | 頁面與元件開發               |
| Quasar       | UI 元件、Dialog、Notify、RWD |
| TypeScript   | API / Component 型別管理     |
| Pinia        | 登入狀態管理                 |
| Axios        | REST API 串接                |
| TipTap       | 教材 HTML 富文字編輯         |
| vis-network  | 教材知識圖譜                 |
| CodeMirror 6 | 程式碼顯示與編輯             |
| SCSS         | 元件樣式與 RWD               |

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
│  ├─ teacher-question-record.api.ts
│  ├─ teacher-stats.api.ts
│  ├─ student-material.api.ts
│  ├─ student-learning.api.ts
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
│  ├─ profile/
│  ├─ student/question/
│  │  ├─ ChoiceAnswer.vue
│  │  ├─ TrueFalseAnswer.vue
│  │  ├─ FillAnswer.vue
│  │  ├─ DebugAnswer.vue
│  │  ├─ InterpretAnswer.vue
│  │  ├─ CodingAnswer.vue
│  │  ├─ StudentQuestionList.vue
│  │  └─ KnowledgeCardHintDialog.vue
│  └─ teacher/
│     ├─ course-workspace/
│     │  ├─ CourseInfoPanel.vue
│     │  ├─ CourseStudentPanel.vue
│     │  ├─ CourseMaterialPanel.vue
│     │  ├─ CourseQuestionPanel.vue
│     │  ├─ CourseQuestionRecordPanel.vue
│     │  └─ CourseStatsPanel.vue
│     ├─ question/
│     │  ├─ QuestionFormDialog.vue
│     │  └─ QuestionRecordReviewDialog.vue
│     └─ stats/
│        └─ StatsHeatmapTable.vue
│
├─ composables/
│  ├─ useStudentKnowledgeCardQuiz.ts
│  ├─ useStudentLearningProgress.ts
│  ├─ useStudentMaterial.ts
│  ├─ useStudentQuestions.ts
│  ├─ useTeacherMaterialManagement.ts
│  ├─ useTeacherQuestions.ts
│  ├─ useTeacherQuestionRecords.ts
│  └─ useTeacherStats.ts
│
├─ css/
├─ pages/
├─ router/
├─ stores/
├─ types/
└─ utils/
```

資料流基本分工：

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

Axios instance：

```text
src/boot/axios.ts
```

Base URL 由：

```ts
import.meta.env.QCLI_API_BASE_URL;
```

取得。

開發環境通常為：

```text
http://127.0.0.1:8000/api/v1
```

受保護 API 會自動加入：

```http
Authorization: Bearer {token}
```

FormData Request 不手動設定 `Content-Type`，交由瀏覽器產生 multipart boundary。

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
401 Token 失效全域處理
```

角色：

```text
admin
teacher
student
```

登入送出前會對：

```text
account
password
```

執行 `.trim()`。

學生可直接以學號或綁定信箱登入。

---

## 5. 忘記密碼與重設密碼連結

登入頁支援學生與教師忘記密碼。

目前流程不是「寄新密碼」，而是：

```text
忘記密碼
↓
輸入學生學號 / 信箱，或教師帳號
↓
Backend 寄送重設密碼連結
↓
前端提醒連結 15 分鐘內有效、只能使用一次
↓
使用者點信件連結進入 /reset-password
↓
設定新密碼
↓
回登入頁重新登入
```

相關 API：

```text
POST /auth/student/forgot-password
POST /auth/teacher/forgot-password
POST /auth/reset-password
```

重設網址格式：

```text
/reset-password?type=student&token=...
/reset-password?type=teacher&token=...
```

`reset-password.vue` 已處理：

```text
連結參數缺失
15 分鐘有效提醒
只能使用一次提醒
新密碼至少 6 碼
兩次密碼一致
Backend 欄位錯誤
重設成功頁面
回登入頁
```

---

## 6. 個人資料與帳號安全

教師與學生可由 Navbar 的頭像 / 姓名進入：

```text
Teacher → /teacher/profile
Student → /student/profile
```

目前可查看：

```text
姓名
角色
登入帳號
學生學號
學生班級
```

帳號安全功能：

```text
修改密碼
登出
```

管理員沒有獨立 Profile Page，仍由 Navbar 操作修改密碼與登出。

---

## 7. 首頁與導覽

登入後：

```text
Admin   → 資料總覽
Teacher → 課程管理
Student → 我的課程
```

舊的中繼首頁已減少，避免重複導航。

---

## 8. 管理員－教師申請與課程開通

管理員目前可：

```text
查看教師申請
核准教師
查看待開通課程
多選 / 全選課程
確認後循序開通
查看教師 / 學生 / 課程統計
```

待開通課程以前端依 `course_id` 將待審核學生明細分組。

多門課程開通採循序 Request，避免同一學生同時被多個來源課程建立帳號時產生競態。

---

## 9. 教師－課程管理

教師可：

```text
查看課程
建立課程
修改課程
刪除課程
進入單一課程工作區
```

建立課程支援：

```text
建立空白課程
從既有課程帶入
```

從既有課程帶入可選：

```text
教材
題目
```

題目複製需要同時複製教材，避免知識卡關聯失效。

單一課程工作區：

```text
src/pages/teacher/course/[courseId].vue
```

工作區目前包含：

```text
課程資訊
班級學生
教材管理
題庫管理
作答紀錄
數據統計
```

---

## 10. 教師－班級學生管理

課程內可：

```text
查看名冊
搜尋學號 / 姓名 / Email
下載 Excel 範本
Excel 批次上傳
手動新增學生
查詢既有學生帳號
修改學生資料
移除學生
切換待審核 / 已開通
```

### 目前開通規則

老師加入學生後，前端以 Backend 回傳的 `pending / approved` 為準。

目前 Backend 流程為：

```text
老師新增學生
↓
進入待開通
↓
管理員開通
↓
建立 / 沿用學生帳號
↓
建立 enrollment
↓
approved
```

已有帳號只代表 `has_account = true`，不等於已加入該課程。

> 若前端某些舊提示文字仍寫成「帳密名單寄給老師」，應再同步更新 UI 文案；目前 Backend 新流程為直接寄送通知給學生。

---

## 11. 教師－教材管理

教材階層：

```text
Course
└─ Chapter
   └─ Unit
      └─ Knowledge Card
```

目前已完成：

```text
Chapter CRUD
Unit CRUD
Knowledge Card CRUD
Unit draft / published
教師檢視 / 學生檢視預覽
教材 Tree
教材 Graph
圖片上傳
Excel 教材匯入
```

Unit 是目前教材草稿的最小單位：

```text
draft     → 僅教師可見
published → 學生可見
```

---

## 12. 教材 Excel 匯入

目前匯入流程已改為「先 Preview，再正式 Import」。

支援三種模式：

```text
append    附加匯入
replace   替換指定章節
overwrite 覆蓋整門課教材
```

流程：

```text
選模式
↓
選 Excel
↓
前端第一層欄位驗證
↓
POST /teacher/courses/{courseId}/materials/import/preview
↓
顯示預覽、異動統計、刪除影響、受影響題目
↓
使用同一份檔案 + fingerprint 正式匯入
```

相關 API：

```text
GET  /teacher/materials/template
POST /teacher/courses/{courseId}/materials/import/preview
POST /teacher/courses/{courseId}/materials/import
```

`replace` 時必須選章節；`overwrite` 會顯示較明顯警告。

---

## 13. RichTextEditor / RichContentViewer

教材內容使用 TipTap 編輯，可處理：

```text
標題
段落
粗體 / 斜體
清單
文字對齊
表格
圖片
```

學生與教師顯示教材 HTML 使用：

```text
RichContentViewer.vue
```

### 教材圖片固定顯示區域

為避免原圖過大或過小影響教材版面，教材圖片統一放入最大約：

```text
640 × 360 px
```

使用：

```css
object-fit: contain;
```

因此會保留原比例、不裁切、不強制拉伸變形；手機畫面會配合容器縮小。

---

## 14. MaterialTreeViewer

教師與學生共用：

```text
src/components/material/MaterialTreeViewer.vue
```

階層：

```text
Chapter
→ Unit
→ Knowledge Card
```

Chapter、Unit、Knowledge Card 皆採收合式檢視，避免一次展開大量教材。

學生模式會額外顯示：

```text
知識卡學習狀態
小試身手進度
小試身手按鈕
我已讀完（沒有小試身手題目的卡）
```

---

## 15. MaterialGraphViewer

教材 Graph 使用 `vis-network`。

目前圖譜改為「依階層逐步深入」，避免整門課所有節點一次出現。

概念：

```text
Level 1
Course → Chapters

Level 2
Course → Selected Chapter → Units

Level 3
Course → Chapter → Selected Unit → Knowledge Cards
```

支援：

```text
階層瀏覽
上一層
回最上層
搜尋整門課節點
Focus 搜尋結果
Zoom / Fit
拖曳
Knowledge Card 詳細內容
學生小試身手入口
```

---

## 16. 教師－題庫管理

教師可在課程內：

```text
查看題目
搜尋題目
依題型篩選
依 Bloom 篩選
新增題目
修改題目
刪除題目
關聯知識卡
設定答案與 SOLO
```

支援題型：

```text
choice       選擇題
true_false   是非題
fill         填空題
debug        除錯題
interpret    程式解讀題
coding       程式實作題
```

表單主要排列：

```text
題目名稱
題型
題目內容
題型答案 / 設定
解題說明
Bloom 認知分類
關聯知識卡
```

---

## 17. B11 與小試身手出題規則

目前 Frontend 在教師出題表單中加入 B11 單一知識卡限制。

只要選擇：

```text
Bloom = B11
```

則：

```text
關聯知識卡最多只能選 1 張
```

若原本選了多張卡，再切換成 B11，前端只保留第一張並提示老師。

Frontend 也會顯示小試身手規則提示：

```text
B11
+
choice / true_false
+
只關聯 1 張知識卡
↓
符合該知識卡「小試身手」候選題條件
```

注意：`B11 + fill/debug/interpret/coding` 仍不是小試身手題，雖然前端仍限制 B11 只關聯一張知識卡。

---

## 18. 教師－作答紀錄與覆核

教師課程工作區已提供「作答紀錄」。

主要資料：

```text
學生姓名 / 學號
題目名稱
題型
Bloom
系統判定
教師覆核狀態
作答時間
```

教師作答紀錄只顯示正式題目練習，不含小試身手。

Coding 題由教師選擇學生實際達到的 Bloom 完成批改；其他題型可依目前 Backend 規則覆核 SOLO。

---

## 19. 學生－我的課程與教材

學生登入後首頁直接顯示「我的課程」。

進入單一課程後可：

```text
查看教材階層
查看知識圖譜
查看學習進度
進入小試身手
進入正式題目練習
```

---

## 20. 學生－學習進度

學生課程頁已串接：

```text
GET /student/courses/{courseId}/learning-progress
```

畫面會顯示：

```text
知識卡總完成度
已完成張數
學習中張數
需再練習張數
未開始張數
上次學習位置
章節完成度
單元完成度
每張卡已作答 / 總題數
```

目前狀態沿用 Backend：

```text
completed
retry
in_progress
not_started
```

---

## 21. 學生－小試身手

頁面：

```text
/student/course/{courseId}/knowledge-card/{cardId}/quiz
```

Backend 規則：

```text
只掛該知識卡
+
Bloom = B11
+
choice / true_false
```

每位學生固定抽最多 5 題；不足 5 題就全部出。

目前前端頁面：

```text
顯示題號進度
一次顯示一題
上一題 / 下一題
題號可直接切換
顯示已作答 / 已答對狀態
答錯仍可重新練習
```

### 知識卡完成條件

```text
抽到的題目全部至少作答過一次
↓
完成知識卡
```

不要求全部答對。

### 正確答案規則

目前 **不在小試身手直接顯示正確答案**。

原因是目前 Backend Quiz Submit 不回 `review`，且原始流程允許答錯後重答。

> 本 README 刻意保留目前 Backend 行為，沒有納入未實作的「每題只能答一次 + 立即顯示正確答案」。

---

## 22. 小試身手－知識卡提示 Dialog

小試身手題目右上角有燈泡按鈕：

```text
💡
```

點擊後開啟 `KnowledgeCardHintDialog`，直接顯示該知識卡完整內容：

```text
知識卡名稱
教材 HTML 內容
圖片
程式範例（有資料時）
```

原本頁面最下方的「複習這張知識卡」展開區已改成燈泡 Dialog 操作。

---

## 23. 學生－正式題目練習範圍

正式題目練習分成：

```text
知識卡練習  card
單元練習    unit
章節練習    chapter
綜合練習    course
```

畫面第一階段以四張 Scope Card 顯示各範圍：

```text
名稱
說明
已作答 / 總題數
```

並保留「查看全部正式題目」。

---

## 24. 學生－題目練習篩選

正式題目列表篩選可使用：

```text
練習範圍 scope
章節
單元
知識卡
題型
作答狀態
題目名稱 keyword
```

作答狀態：

```text
全部
未作答
已作答
```

### 階層式篩選行為

在知識卡練習時：

```text
章節     一開始可選
單元     一開始顯示，但未選章節前 disabled
知識卡   一開始顯示，但未選單元前 disabled
```

流程：

```text
選章節
↓
單元解鎖
↓
選單元
↓
知識卡解鎖
```

單元練習：

```text
章節 → 單元
```

章節練習：

```text
章節
```

綜合練習不顯示教材階層篩選。

---

## 25. 學生－正式題目鎖定

若正式題目關聯的知識卡尚未全部完成：

```text
locked = true
```

Frontend 會：

```text
顯示鎖頭
顯示尚未完成的知識卡
停用開始作答
```

學生必須先完成關聯知識卡學習。

---

## 26. 學生－正式題目每題只能回答一次

正式題目練習依目前 Backend 規則：

```text
每題只能回答一次
```

Frontend 不只依「本次 submit state」鎖定，也會讀單題 / 列表回傳的 `practice`，因此重新整理或重新進頁仍維持已作答狀態。

列表按鈕依狀態顯示：

```text
開始作答
查看結果
尚未解鎖
```

---

## 27. 正式題目－完整知識卡提示 Dialog

正式題目不再把整張知識卡直接攤在作答頁。

題目右上角提供燈泡：

```text
💡
```

點擊後才開啟 `KnowledgeCardHintDialog`。

Dialog 顯示：

```text
知識卡名稱
完整 content
圖片 / HTML
程式範例（Backend 有回傳時）
```

如果題目關聯多張知識卡，Dialog 以分頁 / Tab 切換，不一次把所有卡垂直堆疊。

---

## 28. 正式題目作答結果與 Review

正式題目送出後，Frontend 可依 Backend 回傳顯示：

```text
我的答案
正確答案
答案說明
SOLO / 系統判定資訊
```

Coding 題在教師尚未批改前不顯示參考答案；批改完成後才依 Backend 回傳顯示。

正式題目與小試身手是不同流程：

```text
practice → 正式題目，只能答一次，可有 review
quiz     → 小試身手，目前可重答，不直接回 review
```

---

## 29. 教師－數據統計

單一課程工作區已加入：

```text
數據統計
```

相關 API：

```text
GET /teacher/courses/{courseId}/stats/bloom
GET /teacher/courses/{courseId}/stats/solo
GET /teacher/courses/{courseId}/stats/student-solo
```

統計頁主要分成兩類：

```text
根據教材統計
根據學生作答統計
```

---

## 30. 教師－教材 Bloom 統計

教材統計可切換：

```text
Bloom 統計
SOLO 統計
```

Bloom 顯示 B11–B43 各層級的題數。

畫面包含：

```text
統計題數
有題目的單元數
最高分布 Bloom
整體分布 Progress Bar
各章節 / 單元 Heatmap
Draft / Published 狀態
```

---

## 31. 教師－教材 SOLO 統計

SOLO 統計欄位：

```text
S1
S2
S3
S4
S5
```

同樣提供：

```text
摘要卡
整體分布
單元 Heatmap
單元合計
```

---

## 32. 教師－學生作答 SOLO 統計

學生作答統計提供：

```text
全班整體
單一學生
```

全班模式直接統計整班正式題目作答。

單一學生模式：

```text
選擇學生
↓
GET /teacher/courses/{courseId}/stats/student-solo?student_id={id}
↓
顯示該生各單元 S1–S5 分布
```

此統計不包含：

```text
小試身手
尚未完成批改的作答
```

---

## 33. CodeMirror 共用元件

目前兩個共用元件：

```text
CodeExampleViewer.vue → 唯讀
CodeEditor.vue        → 可編輯
```

使用於：

```text
教材程式範例
填空題
除錯題
程式解讀題
Coding 題 starter_code
Coding 題 expected_output
Coding 題 reference_answer
學生 Coding 作答
```

依內容自然調整高度，避免單行程式碼留下大型空白區。

---

## 34. 已串接主要 API

### Authentication

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/change-password
POST /auth/student/forgot-password
POST /auth/teacher/forgot-password
POST /auth/reset-password
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
GET    /teacher/students/lookup
GET    /teacher/courses/{courseId}/student-applications
POST   /teacher/courses/{courseId}/student-applications
PUT    /teacher/courses/{courseId}/student-applications/{itemId}
DELETE /teacher/courses/{courseId}/student-applications/{itemId}
```

### Teacher Material

```text
GET  /teacher/materials/template
POST /teacher/courses/{courseId}/materials/import/preview
POST /teacher/courses/{courseId}/materials/import
GET  /teacher/courses/{courseId}/tree
POST /teacher/upload-image

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

### Teacher Question Record

```text
GET  /teacher/courses/{courseId}/question-records
PUT  /teacher/question-records/{recordId}
POST /teacher/question-records/{recordId}/grade
```

### Teacher Stats

```text
GET /teacher/courses/{courseId}/stats/bloom
GET /teacher/courses/{courseId}/stats/solo
GET /teacher/courses/{courseId}/stats/student-solo
```

### Student Material / Learning

```text
GET  /student/courses/{courseId}/graph
GET  /student/courses/{courseId}/chapters
GET  /student/chapters/{chapterId}/units
GET  /student/units/{unitId}/knowledge-cards
GET  /student/courses/{courseId}/learning-progress
GET  /student/courses/{courseId}/learning-analytics
GET  /student/courses/{courseId}/knowledge-cards/{cardId}/quiz
POST /student/courses/{courseId}/knowledge-cards/{cardId}/quiz/questions/{questionId}
POST /student/courses/{courseId}/knowledge-cards/{cardId}/read
```

### Student Question

```text
GET  /student/courses/{courseId}/questions
GET  /student/questions/{questionId}
POST /student/questions/{questionId}/submit
GET  /student/courses/{courseId}/question-records
GET  /student/question-records/{recordId}
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
Teacher → Blue / Teal
Student → Teal / Green
```

---

## 36. RWD

主要頁面與元件針對：

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
教材完整檢視 Dialog
學生學習進度
小試身手
題目練習篩選
題目列表
Knowledge Card Hint Dialog
教師作答紀錄
教師統計 Heatmap
CodeMirror
```

---

## 37. 已完成功能摘要

| 功能                                                          | 狀態 |
| ------------------------------------------------------------- | ---: |
| Login / Logout / Session Restore                              |   ✅ |
| Role-based Router Guard                                       |   ✅ |
| Token 401 自動清除與回登入頁                                  |   ✅ |
| Forgot Password Reset Link                                    |   ✅ |
| `/reset-password` 15 分鐘提示與重設頁                         |   ✅ |
| Teacher / Student Profile                                     |   ✅ |
| Admin Overview / Teacher Approval                             |   ✅ |
| Admin Pending Course Multi-select                             |   ✅ |
| Teacher Course CRUD                                           |   ✅ |
| Copy Existing Course Materials / Questions                    |   ✅ |
| Teacher Student Roster                                        |   ✅ |
| Material CRUD                                                 |   ✅ |
| Unit Draft / Published                                        |   ✅ |
| Material Import Preview                                       |   ✅ |
| Append / Replace / Overwrite Import                           |   ✅ |
| Material Image Fixed Display Area                             |   ✅ |
| Material Tree Collapsible Hierarchy                           |   ✅ |
| Hierarchical Partial Graph                                    |   ✅ |
| Student Learning Progress                                     |   ✅ |
| Knowledge Card 小試身手                                       |   ✅ |
| 小試身手答錯可重答                                            |   ✅ |
| 小試身手燈泡 Knowledge Card Dialog                            |   ✅ |
| Teacher Question CRUD                                         |   ✅ |
| B11 Frontend Single-card Restriction                          |   ✅ |
| Formal Practice Scope Cards                                   |   ✅ |
| Hierarchical Question Filters                                 |   ✅ |
| Unit / Card Filter Visible but Disabled Until Parent Selected |   ✅ |
| Formal Question One Attempt Only                              |   ✅ |
| Formal Question Locked by Knowledge Card Completion           |   ✅ |
| Formal Question Knowledge Card Lightbulb Dialog               |   ✅ |
| Formal Question Review / Correct Answer                       |   ✅ |
| Teacher Question Record / Review                              |   ✅ |
| Teacher Bloom Stats                                           |   ✅ |
| Teacher Material SOLO Stats                                   |   ✅ |
| Teacher Class SOLO Stats                                      |   ✅ |
| Teacher Individual Student SOLO Stats                         |   ✅ |

---

## 38. 核心流程

### 教材學習

```text
學生進入課程
↓
查看整體學習進度
↓
展開 Chapter / Unit / Knowledge Card
↓
有 B11 Quiz → 小試身手
沒有 Quiz → 我已讀完
↓
完成知識卡
↓
解鎖關聯正式題目
```

### 小試身手

```text
教師建立 B11 + Choice/TrueFalse + 單一 Knowledge Card 題目
↓
學生在 Knowledge Card 點「小試身手」
↓
Backend 固定抽最多 5 題
↓
學生逐題作答
↓
答錯可重新練習
↓
全部題目至少作答一次
↓
Knowledge Card Completed
```

### 正式題目

```text
學生選擇練習範圍
↓
依章節 / 單元 / 知識卡 / 題型 / 作答狀態篩選
↓
未完成相關知識卡 → 題目鎖定
↓
完成知識卡 → 開始作答
↓
正式題目只能回答一次
↓
顯示 Review / 正確答案 / 說明
↓
教師在作答紀錄覆核
```

### 教師統計

```text
教師進入課程
↓
數據統計
├─ 根據教材
│  ├─ Bloom
│  └─ SOLO
└─ 根據學生正式作答
   ├─ 全班 SOLO
   └─ 單一學生 SOLO
```

---

## 39. 開發原則

```text
API 集中於 src/api
型別集中於 src/types
頁面流程集中於 composables
UI 拆成可重用 components
Backend Response 與 View Model 分離
教材 / 題目共用顯示元件避免重複實作
角色權限以前端 Guard + Backend Middleware 雙重限制
實際判分、抽題、鎖定與資料權限以 Backend 為準
```

另外：

```text
不要在 Frontend 複製 Backend 的 Excel Parser
不要只靠 Frontend 限制「每題只能答一次」
不要自行推測正確答案
不要自行重算 Backend 已提供的 Bloom / SOLO 統計
```

---

## 40. 目前需注意事項

1. **小試身手仍依目前 Backend 行為**：答錯可重答，Quiz Submit 不直接提供正確答案 Review。
2. **正式題目與小試身手不可混用狀態邏輯**：`practice` 與 `quiz` 是不同流程。
3. **B11 單一知識卡目前是 Frontend 強制 UX 規則**，Backend 小試身手真正判定仍同時要求 Choice / True False。
4. **學生名冊部分舊 UI 文案可能仍有「帳密寄給老師」的歷史描述**，若 Backend 已改為直接通知學生，前端提示文字仍需同步清理。
5. 教師統計資料直接使用 Backend Stats API，不應由 Frontend 抓全部題目 / 作答後自行重算。

---

## 41. 目前版本重點

截至 2026-10-20，近期主要完成：

```text
忘記密碼改為 Email Reset Link + /reset-password
教材匯入三模式 + Preview
教材圖片固定顯示尺寸
Tree 知識卡收合
Graph 階層式局部顯示
學生學習進度
Knowledge Card 小試身手
小試身手燈泡完整 Knowledge Card Dialog
正式題目四種練習範圍
章節 / 單元 / 知識卡階層篩選
未選上層時下層 Select 顯示但 Disabled
正式題目右上角燈泡完整 Knowledge Card Dialog
B11 前端限定單一 Knowledge Card
教師 Bloom / SOLO / 學生 SOLO 數據統計
```
