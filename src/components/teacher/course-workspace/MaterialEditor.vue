<template>
  <div
    class="material-editor"
    :class="{
      'material-editor--compact': context?.kind === 'chapter' || context?.kind === 'unit',
      'material-editor--card': context?.kind === 'card',
    }"
  >
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative material-editor__error">
      {{ errorMessage }}
    </q-banner>

    <template v-if="context">
      <div class="material-editor__header">
        <div>
          <div class="material-editor__breadcrumb">
            {{ breadcrumb }}
          </div>

          <div class="material-editor__title">
            {{ editorTitle }}
          </div>
        </div>

        <q-badge
          :color="context.mode === 'create' ? 'blue' : 'positive'"
          :label="context.mode === 'create' ? '新增' : '正式教材'"
        />
      </div>

      <!-- Chapter -->
      <div v-if="context.kind === 'chapter'" class="material-editor__form">
        <q-input v-model="nameForm.name" outlined label="章節名稱 *" :disable="editing" />

        <q-input
          v-model.number="nameForm.sortOrder"
          outlined
          type="number"
          min="1"
          label="排序 *"
          :disable="editing"
        >
          <template #prepend>
            <q-icon name="format_list_numbered" />
          </template>
        </q-input>
      </div>

      <!-- Unit -->
      <div v-else-if="context.kind === 'unit'" class="material-editor__form">
        <q-input v-model="nameForm.name" outlined label="單元名稱 *" :disable="editing" />

        <q-input
          v-model.number="nameForm.sortOrder"
          outlined
          type="number"
          min="1"
          label="排序 *"
          :disable="editing"
        >
          <template #prepend>
            <q-icon name="format_list_numbered" />
          </template>
        </q-input>
      </div>

      <!-- Knowledge Card -->
      <div v-else class="material-editor__card-form">
        <q-input v-model="cardForm.title" outlined label="知識卡名稱 *" :disable="editing" />

        <div class="material-editor__form-grid">
          <q-select
            v-model="cardForm.type"
            outlined
            use-input
            fill-input
            hide-selected
            new-value-mode="add-unique"
            input-debounce="0"
            label="類別 *"
            :options="filteredTypeOptions"
            :disable="editing"
            @filter="filterTypes"
            @new-value="createType"
          >
            <template #prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <q-input
            v-model.number="cardForm.sortOrder"
            outlined
            type="number"
            min="1"
            label="排序 *"
            :disable="editing"
          >
            <template #prepend>
              <q-icon name="format_list_numbered" />
            </template>
          </q-input>
        </div>

        <div class="material-editor__field">
          <div class="material-editor__field-label">教材內容 *</div>

          <div class="material-editor__field-caption">可使用文字格式、表格、連結與圖片</div>

          <RichTextEditor
            v-model="cardForm.content"
            :disabled="editing"
            :upload-image="uploadImage"
          />
        </div>

        <div class="material-editor__field">
          <div class="material-editor__field-label">程式範例</div>

          <q-input
            v-model="cardForm.example"
            outlined
            type="textarea"
            autogrow
            label="程式範例（選填）"
            :disable="editing"
            class="material-editor__example"
          >
            <template #prepend>
              <q-icon name="code" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="material-editor__actions">
        <q-btn flat label="取消" :disable="editing" @click="emit('cancel')" />

        <q-btn
          unelevated
          color="blue"
          icon="save"
          :label="submitLabel"
          :loading="editing"
          :disable="!formValid"
          @click="submit"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import RichTextEditor from '../../common/RichTextEditor.vue';

import type { MaterialEditorContext, MaterialEditorSubmitPayload } from '../../../types/material';

const props = withDefaults(
  defineProps<{
    context: MaterialEditorContext | null;

    courseName: string;

    editing: boolean;

    errorMessage?: string;

    uploadImage: (file: File) => Promise<string | null>;
  }>(),
  {
    errorMessage: '',
  },
);

const emit = defineEmits<{
  submit: [payload: MaterialEditorSubmitPayload];

  cancel: [];
}>();

const nameForm = reactive({
  name: '',
  sortOrder: 1,
});

const cardForm = reactive({
  title: '',
  type: 'keyword',
  content: '',
  example: '',
  sortOrder: 1,
});

const typeOptions = ref(['keyword', 'function']);

const filteredTypeOptions = ref([...typeOptions.value]);

const originalState = ref('');

const editorTitle = computed(() => {
  const context = props.context;

  if (!context) {
    return '';
  }

  const action = context.mode === 'create' ? '新增' : '編輯';

  switch (context.kind) {
    case 'chapter':
      return `${action}章節`;

    case 'unit':
      return `${action}單元`;

    case 'card':
      return `${action}知識卡`;
  }
});

const breadcrumb = computed(() => {
  const context = props.context;

  if (!context) {
    return '';
  }

  if (context.kind === 'chapter') {
    return props.courseName;
  }

  if (context.kind === 'unit') {
    return [props.courseName, context.chapter.name].join(' / ');
  }

  return [props.courseName, context.chapter.name, context.unit.name].join(' / ');
});

const submitLabel = computed(() => {
  if (!props.context) {
    return '儲存';
  }

  return props.context.mode === 'create' ? '新增' : '儲存修改';
});

const formValid = computed(() => {
  const context = props.context;

  if (!context) {
    return false;
  }

  if (context.kind !== 'card') {
    return Boolean(nameForm.name.trim() && nameForm.sortOrder > 0);
  }

  return Boolean(
    cardForm.title.trim() &&
    cardForm.type.trim() &&
    cardForm.content.trim() &&
    cardForm.sortOrder > 0,
  );
});

watch(
  () => props.context,

  (context) => {
    resetForm();

    if (!context) {
      return;
    }

    if (context.kind === 'chapter') {
      if (context.mode === 'edit') {
        nameForm.name = context.chapter.name;

        nameForm.sortOrder = context.chapter.sort_order;
      } else {
        nameForm.sortOrder = context.nextOrder;
      }
    }

    if (context.kind === 'unit') {
      if (context.mode === 'edit') {
        nameForm.name = context.unit.name;

        nameForm.sortOrder = context.unit.sort_order;
      } else {
        nameForm.sortOrder = context.nextOrder;
      }
    }

    if (context.kind === 'card') {
      if (context.mode === 'edit') {
        cardForm.title = context.card.title;

        cardForm.type = context.card.type || 'keyword';

        cardForm.content = context.card.content;

        cardForm.example = context.card.example ?? '';

        cardForm.sortOrder = context.card.sort_order;

        addTypeOption(cardForm.type);
      } else {
        cardForm.sortOrder = context.nextOrder;
      }
    }

    originalState.value = serializeForm();
  },

  {
    immediate: true,
  },
);

function submit() {
  const context = props.context;

  if (!context || !formValid.value) {
    return;
  }

  if (context.kind === 'chapter') {
    const data = {
      name: nameForm.name.trim(),

      sort_order: nameForm.sortOrder,
    };

    if (context.mode === 'create') {
      emit('submit', {
        kind: 'chapter',
        mode: 'create',
        courseId: context.courseId,
        data,
      });

      return;
    }

    emit('submit', {
      kind: 'chapter',
      mode: 'edit',
      chapterId: context.chapter.id,
      data,
    });

    return;
  }

  if (context.kind === 'unit') {
    const data = {
      name: nameForm.name.trim(),

      sort_order: nameForm.sortOrder,
    };

    if (context.mode === 'create') {
      emit('submit', {
        kind: 'unit',
        mode: 'create',
        chapterId: context.chapter.id,
        data,
      });

      return;
    }

    emit('submit', {
      kind: 'unit',
      mode: 'edit',
      unitId: context.unit.id,
      data,
    });

    return;
  }

  const data = {
    title: cardForm.title.trim(),

    type: cardForm.type.trim(),

    content: cardForm.content,

    example: cardForm.example.trim() || null,

    sort_order: cardForm.sortOrder,
  };

  if (context.mode === 'create') {
    emit('submit', {
      kind: 'card',
      mode: 'create',
      unitId: context.unit.id,
      data,
    });

    return;
  }

  emit('submit', {
    kind: 'card',
    mode: 'edit',
    cardId: context.card.id,
    data,
  });
}

function resetForm() {
  nameForm.name = '';
  nameForm.sortOrder = 1;

  cardForm.title = '';
  cardForm.type = 'keyword';
  cardForm.content = '';
  cardForm.example = '';
  cardForm.sortOrder = 1;

  originalState.value = '';
}

function serializeForm() {
  const context = props.context;

  if (!context) {
    return '';
  }

  if (context.kind !== 'card') {
    return JSON.stringify({
      name: nameForm.name,

      sortOrder: nameForm.sortOrder,
    });
  }

  return JSON.stringify({
    title: cardForm.title,

    type: cardForm.type,

    content: cardForm.content,

    example: cardForm.example,

    sortOrder: cardForm.sortOrder,
  });
}

function hasUnsavedChanges() {
  if (!props.context) {
    return false;
  }

  return serializeForm() !== originalState.value;
}

function addTypeOption(value: string) {
  const type = value.trim();

  if (!type || typeOptions.value.includes(type)) {
    return;
  }

  typeOptions.value.push(type);

  filteredTypeOptions.value = [...typeOptions.value];
}

function filterTypes(
  value: string,

  update: (callback: () => void) => void,
) {
  update(() => {
    const search = value.trim().toLowerCase();

    if (!search) {
      filteredTypeOptions.value = [...typeOptions.value];

      return;
    }

    filteredTypeOptions.value = typeOptions.value.filter((option) =>
      option.toLowerCase().includes(search),
    );
  });
}

function createType(
  value: string,

  done: (item?: string, mode?: 'add' | 'add-unique' | 'toggle') => void,
) {
  const type = value.trim();

  if (!type) {
    done();

    return;
  }

  addTypeOption(type);

  done(type, 'add-unique');
}

defineExpose({
  hasUnsavedChanges,
});
</script>
