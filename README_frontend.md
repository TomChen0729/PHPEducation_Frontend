# PHPEducation Frontend

PHPEducation 教學網站前端專案。

本專案使用 **Vue 3 + Quasar + TypeScript** 開發，採前後端分離架構。  
本 README 依 **2026-09-25 最新前端功能與目前已完成修改**整理，內容以目前已完成並實際存在於前端的功能為主。

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
│  │  ├─ AppNavbar.vue
│  │  └─ ChangePasswordDialog.vue
│  ├─ profile/
│  │  └─ UserProfilePage.vue
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
│     │  ├─ CourseStudentPanel.vue
│     │  └─ CourseQuestionRecordPanel.vue
│     └─ question/
│        ├─ QuestionFormDialog.vue
│        └─ QuestionRecordReviewDialog.vue
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
import.meta.env.QCLI_API_BASE_URL;
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

### 登入欄位去空白

登入送出前會對：

```text
account
password
```

執行 `.trim()`，移除前後多餘空白。

例如：

```text
"  1411131000  "
→
"1411131000"
```

如果欄位只包含空白，也會直接視為未輸入，不會把全空白內容送往 Backend。

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

## 7. 登入後變更密碼

登入中的使用者已完成變更密碼功能，串接：

```text
POST /auth/change-password
```

共用元件：

```text
src/components/navigation/ChangePasswordDialog.vue
```

送出資料：

```json
{
  "current_password": "目前密碼",
  "new_password": "新密碼",
  "new_password_confirmation": "再次輸入新密碼"
}
```

前端目前已完成：

```text
目前密碼驗證錯誤顯示
新密碼欄位錯誤顯示
兩次新密碼一致性檢查
密碼顯示 / 隱藏
on-demand validation
送出 Loading
成功 Notify
```

依目前 Backend 行為，修改密碼成功後會維持目前登入狀態，不會強制登出。

---

## 8. 教師 / 學生個人資料與帳號中心

教師與學生可由 Navbar 的「頭像 + 姓名」進入個人資料頁：

```text
Teacher → /teacher/profile
Student → /student/profile
```

頁面共用：

```text
src/components/profile/UserProfilePage.vue
```

目前可查看：

```text
姓名
角色
登入帳號
學生學號（Student）
學生班級（Student）
```

帳號安全區目前提供：

```text
修改密碼
登出
```

其中修改密碼直接共用 `ChangePasswordDialog.vue`；登出會顯示處理中的 Loading 狀態。

管理員 **沒有個人資料頁**。Admin 仍在 Navbar 上直接提供：

```text
修改密碼
登出
```

目前 Backend 尚未提供姓名 / Email 等個人資料修改 API，因此個人資料頁目前只負責「資料查看 + 帳號安全設定」，不提供假性的個人資料編輯功能。

---

## 9. 共用 Navbar 與 Router Guard

共用 Navbar：

```text
src/components/navigation/AppNavbar.vue
```

不同角色使用不同導覽項目與主題色。

教師 / 學生的頭像與姓名目前為個人資料入口：

```text
Teacher → /teacher/profile
Student → /student/profile
```

管理員沒有 Profile Route，維持 Navbar 直接操作修改密碼與登出。

Router Guard 會依：

```text
是否登入
使用者 role
目標 route
```

限制不同角色存取不屬於自己的頁面。

---

## 10. 教師帳號申請

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

## 11. 管理員－使用者管理

管理員首頁目前提供「資料總覽」，包含教師、學生、課程、本學期課程等統計資訊，並可直接前往使用者管理。

管理員使用者管理頁目前以「教師申請核准」與「待開通課程」為主要工作區。

目前已完成：

```text
教師申請列表
教師申請核准
待開通課程列表
課程 Checkbox 多選
課程全選 / 取消全選
每門課顯示待審核學生數
開通前確認 Dialog
批次開通完成 Notify
教師 / 學生 / 課程統計
```

主要相關元件：

```text
components/admin/user-management/
├─ TeacherApprovalPanel.vue
├─ CourseActivationPanel.vue
└─ UserStatsCards.vue
```

### 待開通課程清單

Frontend 會先取得：

```text
GET /courses
GET /student-applications?status=pending
```

`/student-applications` 回傳的是待審核學生明細，因此前端會依：

```text
course_id
```

進行分組與統計，只列出目前真的有 Pending Student 的課程。

每門待開通課程顯示：

```text
課程名稱
學期
班級
申請教師
待審核學生數
```

例如：

```text
☐ PHP 程式設計
   115上｜資應二甲｜王老師
   35 位待審核

☐ 資料庫系統
   115上｜資應二甲｜王老師
   28 位待審核
```

### Checkbox 多選 / 全選

管理員不再逐一搜尋或勾選學生。

目前操作流程：

```text
直接看到所有待開通課程
↓
Checkbox 勾選一門或多門課程
↓
也可以使用「全選」
↓
顯示已選課程數與待審核學生資料總筆數
↓
點擊「開通已選課程」
↓
ConfirmDialog 再次確認
```

如果只選部分課程，全選 Checkbox 會呈現部分選取狀態。

### 課程開通

目前 Backend 一次以一個 `source_course_id` 處理來源課程，因此前端對管理員勾選的多門課程採 **循序送出**，不使用 `Promise.all`。

單門課程 Request：

```json
{
  "source_course_id": 1,
  "course_ids": [1]
}
```

如果管理員一次選三門課程：

```text
PHP
Database
Web
```

Frontend 會依序送出三次開通 Request。

這樣可以降低同一位學生同時出現在多個來源課程時，同時建立帳號造成競態的風險。

開通完成後會重新取得：

```text
Pending Courses
Stats
```

已沒有 Pending Student 的課程會自動從待開通清單消失。

成功通知會統計：

```text
完成課程數
處理學生資料筆數
新建立學生帳號數
新增選課筆數
```

管理員頁「待處理 N 件」目前計算方式為：

```text
待審核教師申請數
+
待開通課程數
```

## 12. 教師－課程管理

教師首頁目前直接顯示「課程管理」，不需要再進入獨立的課程管理首頁。

目前可：

```text
查看課程列表
建立課程
修改課程
刪除課程
進入單一課程工作區
```

課程資料包含：

```text
name
description
semester
class_name
```

單一課程工作區：

```text
src/pages/teacher/course/[courseId].vue
```

### 建立空白課程 / 從既有課程帶入

新增課程目前支援兩種建立方式：

```text
建立空白課程
從既有課程帶入
```

選擇「從既有課程帶入」時，可選擇自己既有的一門課程作為來源，並勾選：

```text
教材（章節／單元／知識卡）
題目（含選項／答案）
```

送出時可帶：

```json
{
  "source_course_id": 12,
  "copy_materials": true,
  "copy_questions": true
}
```

如果勾選「題目」，Frontend 會同步要求帶入教材，避免送出不符合 Backend 規則的組合。

帶入內容會建立獨立副本，不共用原課程 ID，也不帶入：

```text
學生名冊
學生作答紀錄
審核資料
```

---

## 13. 教師－班級學生管理

單一課程內已完成學生名冊管理：

```text
查看課程學生
搜尋學號 / 姓名 / Email
下載 Excel 名冊範本
Excel 批次上傳
手動新增一位或多位學生
顯示待審核 / 已開通狀態
修改學生資料
移除課程學生
```

### 手動新增學生

老師手動新增學生時，每一筆可輸入：

```text
學號      必填
姓名      尚未有帳號時需填
信箱      選填
```

Frontend Request：

```json
{
  "students": [
    {
      "student_no": "1411131001",
      "name": "陳小華",
      "email": "chen@example.com"
    }
  ]
}
```

若尚未開通的學生沒有填信箱，系統會使用：

```text
s{學號}@nutc.edu.tw
```

例如：

```text
1411131001
→
s1411131001@nutc.edu.tw
```

### 已有帳號學生自動帶入

新增學生 Dialog 已串接：

```text
GET /teacher/students/lookup
```

可使用學號或姓名查詢既有學生帳號。

流程：

```text
輸入學號
↓
查詢 Backend
↓
已有帳號
↓
自動帶入姓名
↓
Backend lookup 若回傳 email，也會自動帶入既有信箱
```

也可以：

```text
輸入姓名
↓
查詢 Backend
↓
只有一筆
→ 自動帶入學號 / 姓名 / email

同名多人
→ 顯示符合學生清單
→ 選擇正確學生
```

Frontend 已先支援 lookup response 的：

```text
email
```

欄位，因此 Backend 後續正式回傳 `email` 後可直接使用。

已有正式帳號的學生新增至課程時，Frontend 不會重新建立帳號；由 Backend 直接建立 enrollment 並沿用既有帳號資料。

### 修改學生資料

班級學生列表提供「修改」操作，串接：

```text
PUT /teacher/courses/{courseId}/student-applications/{itemId}
```

可修改：

```text
學號
姓名
信箱
```

Pending 學生可以修改申請資料。

已開通學生可修改學號 / 信箱；姓名以正式學生帳號資料為準。

如果原信箱就是預設格式：

```text
s{原學號}@nutc.edu.tw
```

老師修改學號時，Frontend 會同步更新成新的預設信箱。

例如：

```text
1411131001
s1411131001@nutc.edu.tw

↓ 修改學號

1411131099
s1411131099@nutc.edu.tw
```

如果原本使用自訂信箱，則不會因修改學號而自動改掉。

### Excel 匯入

Excel 匯入流程維持既有格式：

```text
學號
姓名
```

Frontend 不自行解析 Excel，而是以 `multipart/form-data` 上傳 Backend。

### 名單狀態

課程學生名單可切換：

```text
pending   → 待審核
approved  → 已開通
```

新版流程中：

```text
已有學生帳號
→ Backend 直接加入課程
→ approved

尚無學生帳號
→ pending
→ 等管理員開通
```

移除學生時：

```text
Pending Student
→ 移除申請名冊資料

Approved Student
→ 移除該門課 enrollment
→ 學生帳號本身保留
```

### Email 提醒

老師送出學生申請時會提醒：

```text
管理員開通課程後，若本次有新建立的學生帳號，
系統會將學生帳號名單寄到教師信箱；
若未收到，請檢查垃圾郵件。
```

## 14. 教師－教材管理

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
單元 Draft / Published 狀態
老師檢視 / 學生檢視（預覽）
Tree / Graph 切換
```

### 單元草稿 / 開放

教材草稿的最小單位目前是：

```text
Unit
```

Unit 狀態：

```text
draft
published
```

手動新增單元時預設為：

```text
draft
```

老師可以在教材階層中直接操作：

```text
開放給學生
設為草稿
```

切換狀態前會顯示確認 Dialog。

設為草稿後：

```text
教師端資料保留
學生端立即看不到該 Unit
該 Unit 底下的 Knowledge Cards 也不會出現在學生教材
```

重新開放後：

```text
學生端再次看到該 Unit 與底下教材
```

目前這不是「教材版本管理」：

```text
不會另外產生一份草稿檔案
不會同時保存 published 版本與 draft 版本
```

而是同一筆 Unit 切換 `status`。

### 老師檢視 / 學生檢視（預覽）

教材管理目前可以切換：

```text
老師檢視
學生檢視（預覽）
```

老師檢視：

```text
draft Unit      可見
published Unit  可見
可新增 / 修改 / 刪除 / 切換狀態
```

學生檢視（預覽）：

```text
只顯示 published Unit
draft Unit 不顯示
```

如果一個 Chapter 底下全部 Unit 都是草稿，學生預覽也不顯示該 Chapter。

---

## 15. 教材 Excel 匯入

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

## 16. MaterialEditor

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

## 17. RichTextEditor / RichContentViewer

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

## 18. MaterialTreeViewer

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

由使用者自行展開章節、單元，再展開個別 Knowledge Card 查看教材內容與程式範例。

教師模式另外提供：

```text
新增
編輯
刪除
```

學生模式則為純瀏覽。

---

## 19. MaterialGraphViewer

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

學生在圖譜點選 Knowledge Card 時，右側原有內容仍會照常顯示；右側另外提供「完整檢視」按鈕。

點擊「完整檢視」後會開啟大型 Dialog，並共用 `MaterialEditor.vue` 的 readonly 模式，只供學生查看，不提供編輯與儲存。

---

## 20. CodeMirror 共用元件

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
教師程式實作題 starter_code
教師程式實作題 expected_output
教師程式實作題 reference_answer
學生程式實作答案
```

教師與學生端共用相同的自動高度行為，避免單行程式碼仍留下大型空白編輯區。

並分為 Teacher / Student Theme。

---

## 21. 教師－題庫管理

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

所有題型的表單欄位目前統一排列為：

```text
題目名稱
題型
題目內容
該題型答案 / 設定
解題說明
Bloom 認知分類
關聯知識卡
```

原本的「題目說明」已改名為：

```text
解題說明
```

`Bloom 認知分類` 與 `關聯知識卡` 固定放在表單最下方。

建立 / 修改題目時，`QuestionFormDialog` 會接收 `submitting` 狀態：

```text
送出題目
↓
儲存按鈕顯示 Loading
↓
表單欄位暫時 Disable
↓
API 完成後恢復操作
```

---

## 22. 教師出題－選擇題 / 是非題

選擇題可建立多個選項，並指定正確答案。

是非題固定使用兩個選項，且只能有一個正解。

前端不需要自行計算 SOLO，交由 Backend 處理。

---

## 23. 教師出題－填空題

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

## 24. 教師出題－除錯題

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

## 25. 教師出題－程式解讀題

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

## 26. 教師出題－程式實作題

Coding 題已支援 Backend 的：

```text
starter_code
expected_output
reference_answer
```

用途：

| 欄位               | 說明                            |
| ------------------ | ------------------------------- |
| `starter_code`     | 學生可看到的初始程式 / 已知條件 |
| `expected_output`  | 教師端希望的答案                |
| `reference_answer` | 教師端參考程式                  |

新增與編輯題目時都會正確載入與送出這三個欄位。

三個欄位目前都使用可編輯 **CodeMirror**：

```text
starter_code     → CodeEditor
expected_output  → CodeEditor
reference_answer → CodeEditor
```

並共用依程式碼行數自然調整高度的行為。

---

## 27. 教師－作答紀錄與批改覆核

教師課程工作區已加入「作答紀錄」。

主要元件：

```text
CourseQuestionRecordPanel.vue
QuestionRecordReviewDialog.vue
```

主要資料流程：

```text
GET /teacher/courses/{courseId}/question-records
PUT /teacher/question-records/{recordId}
```

目前可查看：

```text
學生姓名 / 學號
題目名稱
題型
題目 Bloom
系統判定
教師覆核狀態
作答時間
歷次作答
```

列表支援：

```text
搜尋學生 / 學號 / 題目 / Bloom
依題型篩選
依教師覆核狀態篩選
查看單筆作答詳情
```

Choice / True False 會利用 Option ID 對回完整題目選項。

Fill / Debug / Interpret 可查看每個子答案與系統判定。

Coding 題可查看：

```text
學生程式碼
starter_code
expected_output
reference_answer
題目要求 Bloom
```

一般題型覆核送：

```json
{
  "solo": 2
}
```

Coding 題則由老師選擇學生實際達到的 Bloom：

```json
{
  "bloom_id": "B42"
}
```

目前一般題型仍是「整筆 QuestionRecord」覆核，不支援逐格修改 Fill / Debug / Interpret 的個別判定。

---

## 29. 學生－我的課程與教材

學生首頁目前直接顯示「我的課程」，登入後不需要再進入另一個課程列表頁。

學生可直接查看自己已選修的課程。

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

### 題目練習－知識卡範例

老師建立任何題型時，只要開啟「顯示知識卡範例」，且關聯的 Knowledge Card 有 `example`，學生單題頁就會顯示範例區。

適用全部 6 種題型：

```text
Choice
True / False
Fill
Debug
Interpret
Coding
```

Frontend 只依 Backend 回傳的：

```text
examples
```

判斷是否顯示，不再依賴題目是否有 `description`。

學生可自行展開 / 收起範例，程式碼使用 `CodeExampleViewer.vue` 唯讀顯示。

---

## 29. 學生－題目列表

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

Frontend 題目列表已預留「作答次數」顯示欄位；目前 Backend 尚未提供 `attempt_count`，因此目前不綁定實際次數資料。等 Backend 正式提供欄位後再接上型別與資料顯示。

---

## 30. 學生－選擇題 / 是非題作答

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

## 31. 學生－填空題作答

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

## 32. 學生－除錯題作答

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

## 33. 學生－程式解讀題作答

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

## 34. 學生－程式實作題作答

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

## 35. 學生－作答結果

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

## 36. 作答完成後導覽

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

## 37. 已串接的主要 API

### Authentication

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/change-password
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

管理員課程開通使用：

```json
{
  "source_course_id": 1,
  "course_ids": [1]
}
```

Frontend 的多選 / 全選是以多門待開通來源課程為操作單位；實際送出時會逐門循序呼叫 `/student-applications/approve`。

### Teacher Course

```text
GET    /teacher/courses
POST   /teacher/courses
GET    /teacher/courses/{courseId}
PUT    /teacher/courses/{courseId}
DELETE /teacher/courses/{courseId}
```

建立課程時可額外送：

```text
source_course_id
copy_materials
copy_questions
```

### Teacher Student Roster

```text
GET    /teacher/student-applications/template
GET    /teacher/students/lookup
POST   /teacher/student-applications
GET    /teacher/courses/{courseId}/student-applications
POST   /teacher/courses/{courseId}/student-applications
PUT    /teacher/courses/{courseId}/student-applications/{itemId}
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

Unit Request 可包含：

```text
status = draft | published
```

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

### Teacher Question Record / Review

```text
GET /teacher/courses/{courseId}/question-records
PUT /teacher/question-records/{recordId}
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

## 38. CSS / SCSS 架構

主要樣式：

```text
src/css/
├─ app.scss
├─ quasar.variables.scss
└─ components/
   ├─ admin/
   ├─ common/
   │  ├─ _change-password-dialog.scss
   │  └─ _user-profile-page.scss
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

## 39. RWD

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
教材完整檢視 Dialog
題目列表
教師作答紀錄 / 批改 Dialog
學生作答介面
個人資料頁
變更密碼 Dialog
CodeMirror
```

學生題目列表在 Desktop 使用多欄條列；Mobile 會縮成單題資訊區塊，避免橫向欄位過擠。

---

## 40. 已完成功能摘要

| 功能                                   | 狀態 |
| -------------------------------------- | ---: |
| Login / Logout                         |   ✅ |
| Session Restore                        |   ✅ |
| Role-based Router Guard                |   ✅ |
| Token 401 自動清除與回登入頁           |   ✅ |
| Student Forgot Password                |   ✅ |
| Teacher Forgot Password                |   ✅ |
| Change Password (Admin / Teacher / Student) |   ✅ |
| Teacher / Student Profile Page         |   ✅ |
| Navbar Profile Entry                   |   ✅ |
| Student Home = My Courses              |   ✅ |
| Teacher Home = Course Management       |   ✅ |
| Admin Home Data Overview               |   ✅ |
| Teacher Application                    |   ✅ |
| Teacher Application Email 垃圾郵件提醒 |   ✅ |
| Admin Teacher Approval                 |   ✅ |
| Admin Course Activation                |   ✅ |
| Admin Pending Course Checkbox Multi-select / Select All |   ✅ |
| Teacher Course CRUD                    |   ✅ |
| Teacher Create Course from Existing Course |   ✅ |
| Teacher Copy Materials / Questions     |   ✅ |
| Teacher Student Roster                 |   ✅ |
| Teacher Manual Add Student No / Name / Email |   ✅ |
| Teacher Student Auto Lookup by No / Name |   ✅ |
| Teacher Student Edit No / Name / Email |   ✅ |
| Student Roster Excel Upload            |   ✅ |
| Student Account Email 垃圾郵件提醒     |   ✅ |
| Material Excel Import                  |   ✅ |
| Chapter CRUD                           |   ✅ |
| Unit CRUD                              |   ✅ |
| Unit Draft / Published                 |   ✅ |
| Teacher / Student Material Preview     |   ✅ |
| Knowledge Card CRUD                    |   ✅ |
| RichText Editor                        |   ✅ |
| Editor Image Upload                    |   ✅ |
| Material Tree Viewer                   |   ✅ |
| Material Tree Chapter / Unit / Card 預設收合 |   ✅ |
| Material Graph Viewer                  |   ✅ |
| Graph Search / Zoom / Fit / Drag       |   ✅ |
| Graph Path Ellipsis + Tooltip          |   ✅ |
| Graph Detail Panel Resize              |   ✅ |
| Student Graph Knowledge Card Full View Dialog |   ✅ |
| CodeMirror 唯讀 Viewer                 |   ✅ |
| CodeMirror 可編輯 Editor               |   ✅ |
| CodeMirror 依內容自動高度              |   ✅ |
| Teacher Question CRUD                  |   ✅ |
| Teacher Choice 出題                    |   ✅ |
| Teacher True / False 出題              |   ✅ |
| Teacher Fill 出題                      |   ✅ |
| Teacher Debug 出題                     |   ✅ |
| Teacher Interpret 出題                 |   ✅ |
| Teacher Coding 出題                    |   ✅ |
| Teacher Question Submit Loading          |   ✅ |
| Teacher Coding CodeMirror                |   ✅ |
| Teacher Question Record List            |   ✅ |
| Teacher Answer Detail / Review Dialog   |   ✅ |
| Teacher Coding Bloom Review             |   ✅ |
| Student Knowledge Card Examples (All Types) |   ✅ |
| Student Question List                  |   ✅ |
| Student Question List 條列式顯示       |   ✅ |
| Student Choice 作答                    |   ✅ |
| Student True / False 作答              |   ✅ |
| Student Fill 作答                      |   ✅ |
| Student Debug 作答                     |   ✅ |
| Student Interpret 作答                 |   ✅ |
| Student Coding 作答                    |   ✅ |
| Student Submit Result                  |   ✅ |
| 回答下一題                             |   ✅ |
| 返回題目列表                           |   ✅ |

---

## 41. 已完成核心流程

### 使用者流程

```text
教師申請帳號
↓
管理員核准
↓
教師登入
```

### 帳號設定

```text
Teacher / Student 點擊 Navbar 頭像或姓名
↓
進入個人資料頁
↓
查看帳號資料
↓
修改密碼 / 登出
```

Admin 不使用個人資料頁，直接由 Navbar 修改密碼或登出。

### 課程與學生

```text
教師建立空白課程
或從既有課程深拷貝教材 / 題目
↓
教師 Excel 匯入學生名冊
或手動輸入學號 / 姓名 / 選填信箱
↓
已有帳號學生
→ 直接建立 enrollment
→ 已開通

尚無帳號學生
→ 進入 Pending
↓
管理員直接查看待開通課程
↓
Checkbox 多選 / 全選課程
↓
確認後循序開通所選課程
↓
建立學生帳號
+
建立 enrollments
↓
學生首頁看到已選課程
```

### 教材

```text
教師下載教材 Excel 範本
↓
匯入教材 / 手動建立教材
↓
Chapter / Unit / Knowledge Card 編輯
↓
Unit 預設可處於 draft
↓
老師檢視 / 學生檢視（預覽）
↓
確認後將 Unit 設為 published
↓
學生端只看到 published Unit
↓
Tree / Graph 顯示
```

### 題目、學生作答與教師覆核

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
Backend 建立 QuestionRecord
↓
學生顯示作答結果或 pending
↓
教師進入「作答紀錄」
↓
查看學生歷次作答
↓
一般題型：教師覆核正確 / 錯誤
Coding：教師選擇 Bloom 完成批改
```

---

## 42. 開發原則

目前前端持續採用以下原則：

```text
API 集中於 src/api
型別集中於 src/types
Backend Response 型別與 Frontend View Model 分開定義
頁面流程集中於 composables
UI 拆成可重用 components
共用題目 / 教材元件避免重複實作
角色權限以前端 Guard + Backend Middleware 雙重限制
實際判分與資料權限以 Backend 為準
```
