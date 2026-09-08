<template>
  <div ref="editorElement" class="code-editor" :class="themeClass" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { basicSetup } from 'codemirror';

import { Compartment, EditorState } from '@codemirror/state';

import { EditorView } from '@codemirror/view';

import { php } from '@codemirror/lang-php';

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    theme?: 'teacher' | 'student';
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    theme: 'teacher',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const themeClass = computed(() => {
  return props.theme === 'student'
    ? 'code-editor--student'
    : 'code-editor--teacher';
});

const editorElement = ref<HTMLElement | null>(null);

let editorView: EditorView | null = null;
let syncingFromProps = false;

const editableCompartment = new Compartment();

function editableExtension() {
  return [
    EditorState.readOnly.of(props.disabled),
    EditorView.editable.of(!props.disabled),
  ];
}

function createEditor() {
  if (!editorElement.value) {
    return;
  }

  const state = EditorState.create({
    doc: props.modelValue ?? '',
    extensions: [
      basicSetup,
      php(),
      EditorView.lineWrapping,
      editableCompartment.of(editableExtension()),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || syncingFromProps) {
          return;
        }

        emit('update:modelValue', update.state.doc.toString());
      }),
      EditorView.theme({
        '&': {
          width: '100%',
          height: 'auto',
          minHeight: '0',
          borderRadius: '8px',
          overflow: 'hidden',
        },
        '.cm-scroller': {
          overflowX: 'auto',
          overflowY: 'hidden',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.7',
        },
        '.cm-content': {
          minHeight: '0',
          padding: '8px 0',
        },
        '.cm-gutters': {
          minHeight: '0',
        },
        '.cm-lineNumbers .cm-gutterElement': {
          padding: '0 10px',
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

onMounted(() => {
  createEditor();
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (!editorView) {
      return;
    }

    const nextValue = newValue ?? '';
    const currentValue = editorView.state.doc.toString();

    if (nextValue === currentValue) {
      return;
    }

    syncingFromProps = true;

    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: nextValue,
      },
    });

    syncingFromProps = false;
  },
);

watch(
  () => props.disabled,
  () => {
    if (!editorView) {
      return;
    }

    editorView.dispatch({
      effects: editableCompartment.reconfigure(editableExtension()),
    });
  },
);

onBeforeUnmount(() => {
  editorView?.destroy();
  editorView = null;
});
</script>

<style scoped lang="scss">
.code-editor {
  width: 100%;

  :deep(.cm-editor) {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.cm-scroller) {
    overflow-x: auto;
    overflow-y: hidden;
  }

  &--teacher {
    :deep(.cm-editor) {
      border: 1px solid $blue-2;
    }

    :deep(.cm-gutters) {
      border-right: 1px solid $blue-2;
      color: $blue-7;
    }

    :deep(.cm-focused) {
      border-color: $blue-5;
    }
  }

  &--student {
    :deep(.cm-editor) {
      border: 1px solid $teal-3;
    }

    :deep(.cm-gutters) {
      border-right: 1px solid $teal-3;
      color: $teal-8;
    }
  }
}
</style>
