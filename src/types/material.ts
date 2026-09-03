/*
 * ============================================================
 * Material
 * ============================================================
 */

/*
 * ============================================================
 * Common
 * ============================================================
 */

export type MaterialTimestamp = string | null;

/*
 * ============================================================
 * Knowledge Card
 * ============================================================
 *
 * Backend：
 *
 * title        → 知識卡名稱
 * name         → title 的別名
 * type         → 類別，例如 keyword / function
 * content      → HTML
 * example      → 程式範例
 * code_example → example 的別名
 *
 * 同一張 Knowledge Card
 * 可能同時出現在多個 Unit 中。
 *
 * 如果 card.id 相同，
 * 代表是同一張知識卡，
 * 不是兩張不同的卡。
 */

export interface MaterialKnowledgeCardNode {
  id: number;

  title: string;

  /*
   * Backend 提供的 title alias。
   */
  name: string;

  /*
   * 知識卡類別。
   *
   * Backend 沒有限制固定 enum，
   * 所以前端不要寫死成
   * keyword | function。
   */
  type: string;

  /*
   * 可包含 HTML。
   */
  content: string;

  example: string | null;

  /*
   * Backend 提供的 example alias。
   */
  code_example: string | null;

  sort_order: number;

  created_at?: MaterialTimestamp;
  updated_at?: MaterialTimestamp;
}

/*
 * ============================================================
 * Unit Tree Node
 * ============================================================
 */

export interface MaterialUnitNode {
  id: number;

  name: string;

  /*
   * Tree API 為 vis-network
   * 另外提供的 alias。
   */
  title: string;

  sort_order: number;

  knowledge_cards: MaterialKnowledgeCardNode[];
}

/*
 * ============================================================
 * Chapter Tree Node
 * ============================================================
 */

export interface MaterialChapterNode {
  id: number;

  name: string;

  /*
   * Tree API alias。
   */
  title: string;

  sort_order: number;

  units: MaterialUnitNode[];
}

/*
 * ============================================================
 * Course Tree
 * ============================================================
 *
 * GET
 * /teacher/courses/{courseId}/tree
 */

export interface MaterialCourseTree {
  id: number;

  name: string;

  chapters: MaterialChapterNode[];
}

/*
 * ============================================================
 * Drill-down List Node
 * ============================================================
 */

export interface MaterialNamedNodeSummary {
  id: number;

  name: string;

  sort_order: number;

  item_count: number;

  created_at: MaterialTimestamp;

  updated_at: MaterialTimestamp;
}

export type MaterialChapterSummary = MaterialNamedNodeSummary;

export type MaterialUnitSummary = MaterialNamedNodeSummary;

/*
 * ============================================================
 * Name Payload
 * ============================================================
 */

export interface MaterialNamePayload {
  name: string;

  sort_order?: number | null;
}

/*
 * ============================================================
 * Knowledge Card Payload
 * ============================================================
 */

export interface KnowledgeCardPayload {
  title: string;

  /*
   * Backend 可不傳，
   * 不傳時預設 keyword。
   *
   * 新版前端編輯器會明確讓老師選擇。
   */
  type?: string | null;

  /*
   * HTML Content。
   */
  content: string;

  example?: string | null;

  sort_order?: number | null;
}

/*
 * ============================================================
 * Import
 * ============================================================
 */

export interface MaterialImportPayload {
  file: File;
  overwrite?: boolean;
}

/*
 * ============================================================
 * Tree Responses
 * ============================================================
 */

export interface MaterialCourseTreeResponse {
  course: MaterialCourseTree;
}

/*
 * ============================================================
 * Import Response
 * ============================================================
 */

export interface MaterialImportResponse {
  course: MaterialCourseTree;
}

/*
 * ============================================================
 * Chapter Responses
 * ============================================================
 */

export interface MaterialChapterListResponse {
  chapters: MaterialChapterSummary[];
}

export interface MaterialChapterResponse {
  chapter: MaterialChapterSummary;
}

/*
 * ============================================================
 * Unit Responses
 * ============================================================
 */

export interface MaterialUnitListResponse {
  units: MaterialUnitSummary[];
}

export interface MaterialUnitResponse {
  unit: MaterialUnitSummary;
}

/*
 * ============================================================
 * Knowledge Card Responses
 * ============================================================
 */

export interface MaterialKnowledgeCardListResponse {
  knowledge_cards: MaterialKnowledgeCardNode[];
}

export interface MaterialKnowledgeCardResponse {
  knowledge_card: MaterialKnowledgeCardNode;
}

/*
 * ============================================================
 * Delete Response
 * ============================================================
 */

export interface MaterialDeleteResponse {
  message: string;
}

/*
 * ============================================================
 * Editor Image Upload
 * ============================================================
 *
 * POST
 * /teacher/upload-image
 *
 * FormData：
 *
 * image
 *
 * Response：
 *
 * {
 *   url: "http://.../storage/editor_images/..."
 * }
 */

export interface MaterialEditorImageUploadResponse {
  url: string;
}
