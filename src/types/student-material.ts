/*
 * =========================
 * Topic
 * =========================
 */
export interface StudentMaterialTopic {
  id: number;

  name: string;

  sort_order: number;

  /*
   * 章節數量
   */
  item_count: number;

  created_at?: string;

  updated_at?: string;
}

/*
 * =========================
 * Chapter
 * =========================
 */
export interface StudentMaterialChapter {
  id: number;

  name: string;

  sort_order: number;

  /*
   * Unit 數量
   */
  item_count: number;

  created_at?: string;

  updated_at?: string;
}

/*
 * =========================
 * Unit
 * =========================
 */
export interface StudentMaterialUnit {
  id: number;

  name: string;

  sort_order: number;

  /*
   * Knowledge Card 數量
   */
  item_count: number;

  created_at?: string;

  updated_at?: string;
}

/*
 * =========================
 * Knowledge Card
 * =========================
 */
export interface StudentMaterialKnowledgeCard {
  id: number;

  title: string;

  content: string;

  example: string | null;

  sort_order: number;

  created_at?: string;

  updated_at?: string;
}

/*
 * =========================
 * Responses
 * =========================
 */
export interface StudentTopicListResponse {
  topics: StudentMaterialTopic[];
}

export interface StudentChapterListResponse {
  chapters: StudentMaterialChapter[];
}

export interface StudentUnitListResponse {
  units: StudentMaterialUnit[];
}

export interface StudentKnowledgeCardListResponse {
  knowledge_cards: StudentMaterialKnowledgeCard[];
}
