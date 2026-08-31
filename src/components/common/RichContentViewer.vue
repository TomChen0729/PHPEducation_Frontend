<template>
  <div class="rich-content-viewer" v-html="safeContent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import DOMPurify from 'dompurify';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = defineProps<{
  content: string;
}>();

/*
 * ============================================================
 * Safe Content
 * ============================================================
 */

const safeContent = computed(() => {
  const normalized = normalizeContent(props.content);

  return DOMPurify.sanitize(normalized, {
    /*
     * 教材目前允許使用的 HTML。
     *
     * 後續如果 Tiptap 新增圖片，
     * 再加入 img。
     */
    ALLOWED_TAGS: [
      'p',

      'h1',
      'h2',
      'h3',

      'strong',
      'b',

      'em',
      'i',

      'u',

      's',

      'ul',
      'ol',
      'li',

      'blockquote',

      'pre',
      'code',

      'a',

      'hr',

      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',

      'br',
    ],

    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'colspan', 'rowspan'],
  });
});

/*
 * ============================================================
 * Normalize
 * ============================================================
 *
 * 舊教材：
 * content = 純文字
 *
 * 新教材：
 * content = Tiptap HTML
 *
 * 暫時同時相容兩種資料。
 */

function normalizeContent(value: string): string {
  const content = value?.trim() ?? '';

  if (!content) {
    return '';
  }

  /*
   * 已經是 HTML。
   */
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  /*
   * 舊版純文字教材。
   */
  return `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
}

/*
 * ============================================================
 * Escape Old Plain Text
 * ============================================================
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
</script>
