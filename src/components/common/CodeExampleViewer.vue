<template>
  <div ref="editorElement" class="code-example-viewer" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { basicSetup } from 'codemirror';

import { EditorState } from '@codemirror/state';

import { EditorView } from '@codemirror/view';

import { php } from '@codemirror/lang-php';

const props = withDefaults(
  defineProps<{
    code: string | null | undefined;
  }>(),
  {
    code: '',
  },
);

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
       *
       * - line numbers
       * - selection
       * - syntax support
       * - bracket matching
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
       * 外觀
       */
      EditorView.theme({
        '&': {
          width: '100%',

          border: '1px solid #dce3e8',

          borderRadius: '8px',

          overflow: 'hidden',

          backgroundColor: '#f8fafc',
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

        '.cm-gutters': {
          backgroundColor: '#f1f5f9',

          borderRight: '1px solid #e2e8f0',

          color: '#94a3b8',
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
 *
 * 如果 API 後來更新 card.example，
 * CodeMirror 內容也一起更新。
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

  :deep(.cm-editor) {
    width: 100%;
  }

  :deep(.cm-scroller) {
    overflow: auto;
  }
}
</style>
