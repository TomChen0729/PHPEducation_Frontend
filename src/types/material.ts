export type MaterialDraftStatus = 'draft' | 'published' | 'archived';

/*
 * =========================
 * Knowledge Card
 * =========================
 */
export interface MaterialKnowledgeCardNode {
  id: string;

  title: string;

  content: string;

  /*
   * 知識卡範例
   *
   * Backend 新增欄位。
   * 沒有範例時允許 null。
   */
  example: string | null;

  sort_order: number;
}

/*
 * =========================
 * Unit
 * =========================
 */
export interface MaterialUnitNode {
  id: string;

  name: string;

  sort_order: number;

  knowledge_cards: MaterialKnowledgeCardNode[];
}

/*
 * =========================
 * Chapter
 * =========================
 */
export interface MaterialChapterNode {
  id: string;

  name: string;

  sort_order: number;

  units: MaterialUnitNode[];
}

/*
 * =========================
 * Topic
 * =========================
 */
export interface MaterialTopicNode {
  id: string;

  name: string;

  sort_order: number;

  chapters: MaterialChapterNode[];
}

/*
 * =========================
 * Material Draft
 * =========================
 */
export interface MaterialDraft {
  id: number;
  course_id: number;
  name: string;
  status: MaterialDraftStatus;
  topics: MaterialTopicNode[];

  created_at?: string;
  updated_at?: string;
}

/*
 * =========================
 * API Response
 * =========================
 */
export interface MaterialDraftResponse {
  draft: MaterialDraft;
}

export interface MaterialDraftListResponse {
  drafts: MaterialDraft[];
}

export interface MaterialPublishResponse {
  message: string;

  draft: MaterialDraft;
}

/*
 * =========================
 * Topic / Chapter / Unit
 * Request
 * =========================
 */
export interface MaterialNamePayload {
  name: string;

  sort_order?: number | null;
}

/*
 * =========================
 * Knowledge Card Request
 * =========================
 */
export interface KnowledgeCardPayload {
  title: string;

  content: string;

  /*
   * Backend 新增
   */
  example?: string | null;

  sort_order?: number | null;
}

export interface PublishedTopic {
  id: number;
  name: string;
  sort_order: number;
  item_count: number;

  created_at?: string;
  updated_at?: string;
}
