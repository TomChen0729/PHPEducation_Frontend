export type MaterialNodeCategory = 'topic' | 'chapter' | 'unit' | 'knowledge_card';

export interface MaterialNodeDisplayMeta {
  category: MaterialNodeCategory;

  categoryLabel: string;

  hierarchyNo: string;

  icon: string;
}

/*
 * ============================================================
 * Category
 * ============================================================
 */

export function getMaterialCategoryLabel(category: MaterialNodeCategory): string {
  switch (category) {
    case 'topic':
      return '主題';

    case 'chapter':
      return '章節';

    case 'unit':
      return '單元';

    case 'knowledge_card':
      return '知識卡';
  }
}

/*
 * ============================================================
 * Icon
 * ============================================================
 */

export function getMaterialCategoryIcon(category: MaterialNodeCategory): string {
  switch (category) {
    case 'topic':
      return 'library_books';

    case 'chapter':
      return 'menu_book';

    case 'unit':
      return 'view_list';

    case 'knowledge_card':
      return 'description';
  }
}

/*
 * ============================================================
 * Hierarchy Number
 * ============================================================
 *
 * Frontend 暫時依 Tree Index 自動計算。
 *
 * Backend 之後有 hierarchy_no 後，
 * 再優先使用 Backend 欄位。
 */

export function createHierarchyNo(indexes: number[]): string {
  return indexes.map((index) => index + 1).join('.');
}

/*
 * ============================================================
 * Resolve
 * ============================================================
 */

export function createMaterialNodeMeta(
  category: MaterialNodeCategory,

  indexes: number[],

  backendHierarchyNo?: string | null,
): MaterialNodeDisplayMeta {
  return {
    category,

    categoryLabel: getMaterialCategoryLabel(category),

    hierarchyNo: backendHierarchyNo?.trim() || createHierarchyNo(indexes),

    icon: getMaterialCategoryIcon(category),
  };
}
