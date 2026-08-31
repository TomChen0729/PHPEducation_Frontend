<template>
  <div
    class="rich-text-editor"
    :class="{
      'rich-text-editor--disabled': disabled,
    }"
  >
    <!-- =========================================
         Word Toolbar
    ========================================== -->
    <div v-if="editor" class="rich-text-editor__toolbar">
      <!-- Undo / Redo -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="undo"
          :disable="disabled || !editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        >
          <q-tooltip>復原</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="redo"
          :disable="disabled || !editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        >
          <q-tooltip>重做</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- Paragraph / Heading -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn-dropdown flat dense no-caps :disable="disabled" :label="currentBlockLabel">
          <q-list dense>
            <q-item clickable v-close-popup @click="setParagraph">
              <q-item-section> 一般文字 </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="setHeading(1)">
              <q-item-section> 標題 1 </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="setHeading(2)">
              <q-item-section> 標題 2 </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="setHeading(3)">
              <q-item-section> 標題 3 </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <q-separator vertical />

      <!-- Text Style -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="format_bold"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('bold'),
          }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <q-tooltip>粗體</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_italic"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('italic'),
          }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <q-tooltip>斜體</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_underlined"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('underline'),
          }"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <q-tooltip>底線</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="strikethrough_s"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('strike'),
          }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <q-tooltip>刪除線</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- Alignment -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="format_align_left"
          :disable="disabled"
          @click="setTextAlign('left')"
        >
          <q-tooltip>靠左</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_align_center"
          :disable="disabled"
          @click="setTextAlign('center')"
        >
          <q-tooltip>置中</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_align_right"
          :disable="disabled"
          @click="setTextAlign('right')"
        >
          <q-tooltip>靠右</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_align_justify"
          :disable="disabled"
          @click="setTextAlign('justify')"
        >
          <q-tooltip>左右對齊</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- List -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="format_list_bulleted"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('bulletList'),
          }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <q-tooltip>項目符號</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="format_list_numbered"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('orderedList'),
          }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <q-tooltip>編號清單</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- Block -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="format_quote"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('blockquote'),
          }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <q-tooltip>引用</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="code"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('codeBlock'),
          }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <q-tooltip>程式碼區塊</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="horizontal_rule"
          :disable="disabled"
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          <q-tooltip>分隔線</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- Link -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn
          flat
          round
          dense
          icon="link"
          :disable="disabled"
          :class="{
            'rich-text-editor__toolbar-button--active': editor.isActive('link'),
          }"
          @click="setLink"
        >
          <q-tooltip>加入連結</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="link_off"
          :disable="disabled || !editor.isActive('link')"
          @click="editor.chain().focus().unsetLink().run()"
        >
          <q-tooltip>移除連結</q-tooltip>
        </q-btn>
      </div>

      <q-separator vertical />

      <!-- Table -->
      <div class="rich-text-editor__toolbar-group">
        <q-btn-dropdown flat dense icon="table_chart" :disable="disabled">
          <q-list dense>
            <q-item clickable v-close-popup @click="insertTable">
              <q-item-section avatar>
                <q-icon name="add_box" />
              </q-item-section>

              <q-item-section> 插入 3 × 3 表格 </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              :disable="!editor.isActive('table')"
              @click="editor.chain().focus().addRowAfter().run()"
            >
              <q-item-section avatar>
                <q-icon name="add_row_below" />
              </q-item-section>

              <q-item-section> 新增列 </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              :disable="!editor.isActive('table')"
              @click="editor.chain().focus().addColumnAfter().run()"
            >
              <q-item-section avatar>
                <q-icon name="view_column" />
              </q-item-section>

              <q-item-section> 新增欄 </q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-popup
              :disable="!editor.isActive('table')"
              @click="editor.chain().focus().deleteTable().run()"
            >
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>

              <q-item-section class="text-negative"> 刪除表格 </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- =========================================
         Editor Paper
    ========================================== -->
    <div class="rich-text-editor__paper">
      <EditorContent v-if="editor" :editor="editor" class="rich-text-editor__content" />

      <div v-else class="rich-text-editor__loading">
        <q-spinner color="blue" size="28px" />

        <span> 編輯器載入中... </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import { EditorContent, useEditor } from '@tiptap/vue-3';

import StarterKit from '@tiptap/starter-kit';

import TextAlign from '@tiptap/extension-text-align';

import { TableKit } from '@tiptap/extension-table';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    modelValue: string;

    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  (
    event: 'update:modelValue',

    value: string,
  ): void;
}>();

/*
 * ============================================================
 * Editor
 * ============================================================
 */

const editor = useEditor({
  content: normalizeContent(props.modelValue),

  editable: !props.disabled,

  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
      },
    }),

    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),

    TableKit.configure({
      table: {
        resizable: true,
      },
    }),
  ],

  onUpdate({ editor }) {
    /*
     * 空 Editor 儲存為空字串，
     * 不存 <p></p>。
     */
    emit(
      'update:modelValue',

      editor.isEmpty ? '' : editor.getHTML(),
    );
  },
});

/*
 * ============================================================
 * Disabled
 * ============================================================
 */

watch(
  () => props.disabled,

  (disabled) => {
    editor.value?.setEditable(!disabled);
  },
);

/*
 * ============================================================
 * External v-model Update
 * ============================================================
 */

watch(
  () => props.modelValue,

  (value) => {
    const instance = editor.value;

    if (!instance) {
      return;
    }

    const normalized = normalizeContent(value);

    const current = instance.getHTML();

    /*
     * 避免 Editor 自己 emit 後
     * 又重新 setContent。
     */
    if (current === normalized) {
      return;
    }

    /*
     * Tiptap 3 的 setContent
     * 預設會 emit update，
     * 所以這裡明確關掉。
     */
    instance.commands.setContent(normalized, {
      emitUpdate: false,
    });
  },
);

/*
 * ============================================================
 * Current Block
 * ============================================================
 */

const currentBlockLabel = computed(() => {
  const instance = editor.value;

  if (!instance) {
    return '一般文字';
  }

  if (
    instance.isActive('heading', {
      level: 1,
    })
  ) {
    return '標題 1';
  }

  if (
    instance.isActive('heading', {
      level: 2,
    })
  ) {
    return '標題 2';
  }

  if (
    instance.isActive('heading', {
      level: 3,
    })
  ) {
    return '標題 3';
  }

  return '一般文字';
});

/*
 * ============================================================
 * Commands
 * ============================================================
 */

function setParagraph() {
  editor.value?.chain().focus().setParagraph().run();
}

function setHeading(level: 1 | 2 | 3) {
  editor.value
    ?.chain()
    .focus()
    .toggleHeading({
      level,
    })
    .run();
}

function setTextAlign(align: 'left' | 'center' | 'right' | 'justify') {
  editor.value?.chain().focus().setTextAlign(align).run();
}

function insertTable() {
  editor.value
    ?.chain()
    .focus()
    .insertTable({
      rows: 3,

      cols: 3,

      withHeaderRow: true,
    })
    .run();
}

function setLink() {
  const instance = editor.value;

  if (!instance) {
    return;
  }

  const previousUrl = instance.getAttributes('link').href as string | undefined;

  const url = window.prompt('請輸入連結網址', previousUrl ?? 'https://');

  /*
   * 使用者按取消。
   */
  if (url === null) {
    return;
  }

  /*
   * 清空 = 移除 Link。
   */
  if (url.trim() === '') {
    instance.chain().focus().extendMarkRange('link').unsetLink().run();

    return;
  }

  instance
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({
      href: url.trim(),
    })
    .run();
}

/*
 * ============================================================
 * Existing Plain Text → HTML
 * ============================================================
 *
 * 舊教材目前可能仍是純文字。
 * 新 Tiptap 則會存 HTML。
 *
 * 因此 Frontend 暫時相容兩種格式。
 */

function normalizeContent(value: string): string {
  const content = value?.trim() ?? '';

  if (!content) {
    return '<p></p>';
  }

  /*
   * 已經是 HTML。
   */
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  /*
   * 舊純文字教材。
   */
  const escaped = escapeHtml(content);

  return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
</script>
