<template>
  <div ref="editorElement" class="code-example-viewer" :class="themeClass" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { basicSetup } from 'codemirror';

import { EditorState } from '@codemirror/state';

import { EditorView } from '@codemirror/view';

import { php } from '@codemirror/lang-php';

/*
 * =========================
 * Props
 * =========================
 */
const props = withDefaults(
  defineProps<{
    code: string | null | undefined;

    theme?: 'teacher' | 'student';
  }>(),
  {
    code: '',

    theme: 'teacher',
  },
);

/*
 * =========================
 * Theme
 * =========================
 */
const themeClass = computed(() => {
  return props.theme === 'student'
    ? 'code-example-viewer--student'
    : 'code-example-viewer--teacher';
});

/*
 * =========================
 * Editor
 * =========================
 */
const editorElement = ref<HTMLElement | null>(null);

let editorView: EditorView | null = null;

/*
 * =========================
 * Create Editor
 * =========================
 */
function createEditor() {
  if (!editorElement.value) {
    return;
  }

  const state = EditorState.create({
    doc: props.code ?? '',

    extensions: [
      /*
       * CodeMirror 基本功能
       */
      basicSetup,

      /*
       * PHP Syntax Highlight
       */
      php(),

      /*
       * 唯讀
       */
      EditorState.readOnly.of(true),

      EditorView.editable.of(false),

      /*
       * 長程式碼自動換行
       */
      EditorView.lineWrapping,

      /*
       * CodeMirror 基本排版。
       *
       * 顏色不寫在 TypeScript，
       * 交由 SCSS 根據 Teacher / Student
       * theme 控制。
       */
      EditorView.theme({
        '&': {
          width: '100%',

          borderRadius: '8px',

          overflow: 'hidden',
        },

        '.cm-scroller': {
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',

          fontSize: '14px',

          lineHeight: '1.7',
        },

        '.cm-content': {
          padding: '12px 0',

          minHeight: '100px',
        },

        '.cm-lineNumbers .cm-gutterElement': {
          padding: '0 10px',
        },

        '.cm-activeLine': {
          backgroundColor: 'transparent',
        },

        '.cm-activeLineGutter': {
          backgroundColor: 'transparent',
        },

        '&.cm-focused': {
          outline: 'none',
        },
      }),
    ],
  });

  editorView = new EditorView({
    state,

    parent: editorElement.value,
  });
}

/*
 * =========================
 * Init
 * =========================
 */
onMounted(() => {
  createEditor();
});

/*
 * =========================
 * Update Code
 * =========================
 */
watch(
  () => props.code,

  (newCode) => {
    if (!editorView) {
      return;
    }

    const nextCode = newCode ?? '';

    const currentCode = editorView.state.doc.toString();

    if (currentCode === nextCode) {
      return;
    }

    editorView.dispatch({
      changes: {
        from: 0,

        to: editorView.state.doc.length,

        insert: nextCode,
      },
    });
  },
);

/*
 * =========================
 * Destroy
 * =========================
 */
onBeforeUnmount(() => {
  editorView?.destroy();

  editorView = null;
});
</script>

<style scoped lang="scss">
.code-example-viewer {
  width: 100%;

  /*
   * =========================
   * Base
   * =========================
   */
  :deep(.cm-editor) {
    width: 100%;

    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.cm-scroller) {
    overflow: auto;
  }

  /*
   * ==========================================================
   * Teacher Theme
   * ==========================================================
   */
  &--teacher {
    :deep(.cm-editor) {
      // background-color: $blue-1;

      border: 1px solid $blue-2;
    }

    :deep(.cm-gutters) {
      // background-color: $blue-1;

      border-right: 1px solid $blue-2;

      color: $blue-7;
    }
  }

  /*
   * ==========================================================
   * Student Theme
   * ==========================================================
   */
  &--student {
    :deep(.cm-editor) {
      // background-color: $teal-1;

      border: 1px solid $teal-3;
    }

    :deep(.cm-gutters) {
      // background-color: $teal-2;

      border-right: 1px solid $teal-3;

      color: $teal-8;
    }

    :deep(.cm-selectionBackground) {
      background-color: $teal-3 !important;
    }

    :deep(.cm-cursor) {
      border-left-color: $teal-10;
    }
  }
}
</style>
