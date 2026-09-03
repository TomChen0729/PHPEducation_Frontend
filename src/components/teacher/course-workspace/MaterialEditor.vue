<template>
  <div class="material-editor">
    <!-- 教材大綱 -->
    <aside class="material-editor__outline">
      <div class="material-editor__outline-header">
        <div>
          <div class="material-editor__outline-title">教材大綱</div>

          <div class="material-editor__outline-caption">
            {{ courseTree?.name ?? '正式教材' }}
          </div>
        </div>

        <q-btn
          round
          unelevated
          color="blue"
          icon="add"
          size="sm"
          :disable="editing || !courseTree"
          @click="openAddChapter"
        >
          <q-tooltip> 新增章節 </q-tooltip>
        </q-btn>
      </div>

      <q-separator />

      <div class="material-editor__outline-body">
        <!-- Empty -->
        <div
          v-if="!courseTree || sortedChapters.length === 0"
          class="material-editor__outline-empty"
        >
          <q-icon name="menu_book" size="38px" color="grey-4" />

          <span> 目前沒有章節 </span>

          <q-btn
            v-if="courseTree"
            flat
            color="blue"
            icon="add"
            label="新增章節"
            :disable="editing"
            @click="openAddChapter"
          />
        </div>

        <!-- Chapter -->
        <q-expansion-item
          v-for="(chapter, chapterIndex) in sortedChapters"
          v-else
          :key="chapter.id"
          default-opened
          expand-separator
          class="material-editor__chapter"
        >
          <template #header>
            <q-item-section>
              <q-item-label class="material-editor__chapter-title">
                {{ chapterNumber(chapter.sort_order, chapterIndex) }}

                {{ chapter.name }}
              </q-item-label>

              <q-item-label caption> {{ chapter.units.length }} 個單元 </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="material-editor__node-actions">
                <q-btn
                  flat
                  dense
                  round
                  icon="add"
                  color="blue"
                  :disable="editing"
                  @click.stop="openAddUnit(chapter)"
                >
                  <q-tooltip> 新增單元 </q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="blue-grey-7"
                  :disable="editing"
                  @click.stop="openEditChapter(chapter)"
                >
                  <q-tooltip> 修改章節 </q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  :disable="editing"
                  @click.stop="requestDeleteChapter(chapter)"
                >
                  <q-tooltip> 刪除章節 </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </template>

          <div class="material-editor__units">
            <!-- Unit -->
            <q-expansion-item
              v-for="(unit, unitIndex) in sortedUnits(chapter)"
              :key="unit.id"
              default-opened
              class="material-editor__unit"
            >
              <template #header>
                <q-item-section>
                  <q-item-label class="material-editor__unit-title">
                    {{ unitNumber(chapter.sort_order, chapterIndex, unit.sort_order, unitIndex) }}

                    {{ unit.name }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ unit.knowledge_cards.length }}
                    張知識卡
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="material-editor__node-actions">
                    <q-btn
                      flat
                      dense
                      round
                      icon="add"
                      color="blue"
                      :disable="editing"
                      @click.stop="openAddCard(chapter, unit)"
                    >
                      <q-tooltip> 新增知識卡 </q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="blue-grey-7"
                      :disable="editing"
                      @click.stop="openEditUnit(unit)"
                    >
                      <q-tooltip> 修改單元 </q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      :disable="editing"
                      @click.stop="requestDeleteUnit(unit)"
                    >
                      <q-tooltip> 刪除單元 </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </template>

              <div class="material-editor__cards">
                <!-- Knowledge Card -->
                <q-item
                  v-for="(card, cardIndex) in sortedCards(unit)"
                  :key="`${unit.id}-${card.id}`"
                  clickable
                  class="material-editor__card"
                  :active="isSelectedCard(card.id, unit.id)"
                  active-class="material-editor__card--active"
                  @click="selectCard(chapter, unit, card)"
                >
                  <q-item-section>
                    <q-item-label class="material-editor__card-title">
                      {{
                        cardNumber(
                          chapter.sort_order,
                          chapterIndex,
                          unit.sort_order,
                          unitIndex,
                          card.sort_order,
                          cardIndex,
                        )
                      }}

                      {{ card.title }}
                    </q-item-label>

                    <q-item-label caption>
                      <q-badge outline color="blue-grey-7" :label="card.type || 'keyword'" />
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      :disable="editing"
                      @click.stop="requestDeleteCard(card)"
                    >
                      <q-tooltip> 刪除知識卡 </q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>

                <q-btn
                  flat
                  no-caps
                  color="blue"
                  icon="add"
                  label="新增知識卡"
                  class="material-editor__add-card"
                  :disable="editing"
                  @click="openAddCard(chapter, unit)"
                />
              </div>
            </q-expansion-item>

            <div v-if="chapter.units.length === 0" class="material-editor__level-empty">
              此章節目前沒有單元
            </div>
          </div>
        </q-expansion-item>
      </div>
    </aside>

    <!-- 編輯區 -->
    <section class="material-editor__workspace">
      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative material-editor__error">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>

        {{ errorMessage }}
      </q-banner>

      <!-- 未選擇 -->
      <div v-if="cardMode === 'idle'" class="material-editor__workspace-empty">
        <q-icon name="edit_note" size="58px" color="grey-4" />

        <div class="text-subtitle1 text-weight-medium">選擇一張知識卡開始編輯</div>

        <div class="text-caption text-grey-6">也可以從左側新增章節、單元或知識卡</div>
      </div>

      <!-- Knowledge Card Form -->
      <div v-else class="material-editor__form">
        <div class="material-editor__form-header">
          <div>
            <div class="material-editor__breadcrumb">
              {{ currentPath }}
            </div>

            <div class="material-editor__form-title">
              {{ cardMode === 'create' ? '新增知識卡' : cardForm.title || '知識卡' }}
            </div>
          </div>

          <q-badge
            :color="cardMode === 'create' ? 'blue' : 'positive'"
            :label="cardMode === 'create' ? '新增' : '正式教材'"
          />
        </div>

        <q-banner dense rounded class="material-editor__live-note">
          <template #avatar>
            <q-icon name="info" color="blue" />
          </template>

          儲存後學生將立即看到最新內容。
        </q-banner>

        <q-input v-model="cardForm.title" outlined label="知識卡名稱 *" :disable="editing" />

        <div class="material-editor__form-grid">
          <!-- 類別 -->
          <q-select
            v-model="cardForm.type"
            outlined
            use-input
            fill-input
            hide-selected
            new-value-mode="add-unique"
            input-debounce="0"
            label="類別 *"
            :options="filteredCardTypeOptions"
            :disable="editing"
            @filter="filterCardTypes"
            @new-value="createCardType"
          >
            <template #prepend>
              <q-icon name="category" />
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey"> 輸入類別名稱後按 Enter 建立 </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- 排序 -->
          <q-input
            v-model.number="cardForm.sort_order"
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

        <!-- Word 編輯器 -->
        <div class="material-editor__field">
          <div class="material-editor__field-header">
            <div>
              <div class="material-editor__field-label">教材內容 *</div>

              <div class="material-editor__field-caption">
                可使用文字格式、表格、連結與圖片編輯教材
              </div>
            </div>
          </div>

          <RichTextEditor
            v-model="cardForm.content"
            :disabled="editing"
            :upload-image="uploadImage"
          />
        </div>

        <!-- 程式範例 -->
        <div class="material-editor__field">
          <div class="material-editor__field-label">程式範例</div>

          <q-input
            v-model="cardForm.example"
            outlined
            type="textarea"
            autogrow
            label="程式範例（選填）"
            hint="可輸入程式碼或操作範例"
            :disable="editing"
            class="material-editor__example-input"
          >
            <template #prepend>
              <q-icon name="code" />
            </template>
          </q-input>
        </div>

        <div class="material-editor__form-actions">
          <q-btn flat label="取消" :disable="editing" @click="cancelCardEdit" />

          <q-btn
            unelevated
            color="blue"
            icon="save"
            :label="cardMode === 'create' ? '新增知識卡' : '儲存修改'"
            :loading="editing"
            :disable="!cardFormValid"
            @click="submitCard"
          />
        </div>
      </div>
    </section>

    <!-- 章節 / 單元 -->
    <q-dialog v-model="nameDialog.open" persistent>
      <q-card class="material-editor__name-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ nameDialog.title }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="material-editor__name-form">
          <q-input v-model="nameDialog.name" outlined autofocus label="名稱 *" :disable="editing" />

          <q-input
            v-model.number="nameDialog.sortOrder"
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

          <q-banner dense rounded class="bg-blue-1 text-blue-9">
            系統會依照排序自動產生教材階層編號。
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="editing" @click="nameDialog.open = false" />

          <q-btn
            unelevated
            color="blue"
            label="儲存"
            :loading="editing"
            :disable="!nameDialogValid"
            @click="submitNameDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Dialog } from 'quasar';

import RichTextEditor from '../../common/RichTextEditor.vue';

import type {
  KnowledgeCardPayload,
  MaterialChapterNode,
  MaterialKnowledgeCardNode,
  MaterialNamePayload,
  MaterialCourseTree,
  MaterialUnitNode,
} from '../../../types/material';

type CardMode = 'idle' | 'create' | 'edit';

type NameMode = 'create' | 'edit';

type NameType = 'chapter' | 'unit';

interface NameDialogState {
  open: boolean;
  mode: NameMode;
  type: NameType;
  title: string;
  nodeId: number | null;
  parentId: number | null;
  name: string;
  sortOrder: number;
}

interface SelectionContext {
  chapterId: number;
  unitId: number;
  cardId: number | null;
}

const props = withDefaults(
  defineProps<{
    courseTree: MaterialCourseTree | null;

    editing: boolean;

    errorMessage?: string;

    uploadImage: (file: File) => Promise<string | null>;
  }>(),
  {
    errorMessage: '',
  },
);

const emit = defineEmits<{
  'create-chapter': [courseId: number, data: MaterialNamePayload];

  'update-chapter': [chapterId: number, data: MaterialNamePayload];

  'delete-chapter': [chapterId: number];

  'create-unit': [chapterId: number, data: MaterialNamePayload];

  'update-unit': [unitId: number, data: MaterialNamePayload];

  'delete-unit': [unitId: number];

  'create-card': [unitId: number, data: KnowledgeCardPayload];

  'update-card': [cardId: number, data: KnowledgeCardPayload];

  'delete-card': [cardId: number];
}>();

const cardMode = ref<CardMode>('idle');

const selection = ref<SelectionContext | null>(null);

const originalCardState = ref('');

const defaultCardTypeOptions = ['keyword', 'function'];

const cardTypeOptions = ref<string[]>([...defaultCardTypeOptions]);

const filteredCardTypeOptions = ref<string[]>([...defaultCardTypeOptions]);

const cardForm = reactive({
  title: '',
  type: 'keyword',
  content: '',
  example: '',
  sort_order: 1,
});

const nameDialog = reactive<NameDialogState>({
  open: false,
  mode: 'create',
  type: 'chapter',
  title: '',
  nodeId: null,
  parentId: null,
  name: '',
  sortOrder: 1,
});

const sortedChapters = computed(() => {
  return [...(props.courseTree?.chapters ?? [])].sort((a, b) => a.sort_order - b.sort_order);
});

const cardFormValid = computed(() => {
  return Boolean(
    cardForm.title.trim() &&
    cardForm.type.trim() &&
    cardForm.content.trim() &&
    cardForm.sort_order > 0,
  );
});

const nameDialogValid = computed(() => {
  return Boolean(nameDialog.name.trim() && nameDialog.sortOrder > 0);
});

const currentPath = computed(() => {
  const context = selection.value;

  if (!context || !props.courseTree) {
    return '';
  }

  const chapter = props.courseTree.chapters.find((item) => item.id === context.chapterId);

  const unit = chapter?.units.find((item) => item.id === context.unitId);

  if (!chapter || !unit) {
    return '';
  }

  return [chapter.name, unit.name].join(' / ');
});

function sortedUnits(chapter: MaterialChapterNode) {
  return [...chapter.units].sort((a, b) => a.sort_order - b.sort_order);
}

function sortedCards(unit: MaterialUnitNode) {
  return [...unit.knowledge_cards].sort((a, b) => a.sort_order - b.sort_order);
}

function displayOrder(
  order: number,

  index: number,
) {
  return order > 0 ? order : index + 1;
}

function chapterNumber(
  order: number,

  index: number,
) {
  return displayOrder(order, index);
}

function unitNumber(
  chapterOrder: number,

  chapterIndex: number,

  unitOrder: number,

  unitIndex: number,
) {
  return [displayOrder(chapterOrder, chapterIndex), displayOrder(unitOrder, unitIndex)].join('.');
}

function cardNumber(
  chapterOrder: number,

  chapterIndex: number,

  unitOrder: number,

  unitIndex: number,

  cardOrder: number,

  cardIndex: number,
) {
  return [
    displayOrder(chapterOrder, chapterIndex),

    displayOrder(unitOrder, unitIndex),

    displayOrder(cardOrder, cardIndex),
  ].join('.');
}

function nextOrder(values: { sort_order: number }[]) {
  if (values.length === 0) {
    return 1;
  }

  return Math.max(...values.map((item) => item.sort_order)) + 1;
}

/* Chapter */

function openAddChapter() {
  if (!props.courseTree) {
    return;
  }

  nameDialog.open = true;

  nameDialog.mode = 'create';

  nameDialog.type = 'chapter';

  nameDialog.title = '新增章節';

  nameDialog.nodeId = null;

  nameDialog.parentId = props.courseTree.id;

  nameDialog.name = '';

  nameDialog.sortOrder = nextOrder(props.courseTree.chapters);
}

function openEditChapter(chapter: MaterialChapterNode) {
  nameDialog.open = true;

  nameDialog.mode = 'edit';

  nameDialog.type = 'chapter';

  nameDialog.title = '修改章節';

  nameDialog.nodeId = chapter.id;

  nameDialog.parentId = null;

  nameDialog.name = chapter.name;

  nameDialog.sortOrder = chapter.sort_order;
}

/* Unit */

function openAddUnit(chapter: MaterialChapterNode) {
  nameDialog.open = true;

  nameDialog.mode = 'create';

  nameDialog.type = 'unit';

  nameDialog.title = '新增單元';

  nameDialog.nodeId = null;

  nameDialog.parentId = chapter.id;

  nameDialog.name = '';

  nameDialog.sortOrder = nextOrder(chapter.units);
}

function openEditUnit(unit: MaterialUnitNode) {
  nameDialog.open = true;

  nameDialog.mode = 'edit';

  nameDialog.type = 'unit';

  nameDialog.title = '修改單元';

  nameDialog.nodeId = unit.id;

  nameDialog.parentId = null;

  nameDialog.name = unit.name;

  nameDialog.sortOrder = unit.sort_order;
}

function submitNameDialog() {
  const data: MaterialNamePayload = {
    name: nameDialog.name.trim(),

    sort_order: nameDialog.sortOrder,
  };

  if (nameDialog.type === 'chapter') {
    if (nameDialog.mode === 'create' && nameDialog.parentId !== null) {
      emit('create-chapter', nameDialog.parentId, data);

      return;
    }

    if (nameDialog.nodeId !== null) {
      emit('update-chapter', nameDialog.nodeId, data);
    }

    return;
  }

  if (nameDialog.mode === 'create' && nameDialog.parentId !== null) {
    emit('create-unit', nameDialog.parentId, data);

    return;
  }

  if (nameDialog.nodeId !== null) {
    emit('update-unit', nameDialog.nodeId, data);
  }
}

/* Knowledge Card */

function selectCard(
  chapter: MaterialChapterNode,

  unit: MaterialUnitNode,

  card: MaterialKnowledgeCardNode,
) {
  confirmDiscard(() => {
    selection.value = {
      chapterId: chapter.id,

      unitId: unit.id,

      cardId: card.id,
    };

    cardMode.value = 'edit';

    cardForm.title = card.title;

    cardForm.type = card.type || 'keyword';

    cardForm.content = card.content;

    cardForm.example = card.example ?? '';

    cardForm.sort_order = card.sort_order;

    addCardTypeOption(cardForm.type);

    originalCardState.value = serializeCardForm();
  });
}

function openAddCard(
  chapter: MaterialChapterNode,

  unit: MaterialUnitNode,
) {
  confirmDiscard(() => {
    selection.value = {
      chapterId: chapter.id,

      unitId: unit.id,

      cardId: null,
    };

    cardMode.value = 'create';

    cardForm.title = '';

    cardForm.type = 'keyword';

    cardForm.content = '';

    cardForm.example = '';

    cardForm.sort_order = nextOrder(unit.knowledge_cards);

    originalCardState.value = serializeCardForm();
  });
}

function submitCard() {
  const context = selection.value;

  if (!context || !cardFormValid.value) {
    return;
  }

  const data: KnowledgeCardPayload = {
    title: cardForm.title.trim(),

    type: cardForm.type.trim(),

    content: cardForm.content,

    example: cardForm.example.trim() || null,

    sort_order: cardForm.sort_order,
  };

  addCardTypeOption(data.type ?? '');

  if (cardMode.value === 'create') {
    emit('create-card', context.unitId, data);

    return;
  }

  if (context.cardId !== null) {
    emit('update-card', context.cardId, data);
  }
}

/* Card Type */

function addCardTypeOption(value: string) {
  const type = value.trim();

  if (!type || cardTypeOptions.value.includes(type)) {
    return;
  }

  cardTypeOptions.value.push(type);

  filteredCardTypeOptions.value = [...cardTypeOptions.value];
}

function filterCardTypes(
  value: string,

  update: (callback: () => void) => void,
) {
  update(() => {
    const search = value.trim().toLowerCase();

    if (!search) {
      filteredCardTypeOptions.value = [...cardTypeOptions.value];

      return;
    }

    filteredCardTypeOptions.value = cardTypeOptions.value.filter((option) =>
      option.toLowerCase().includes(search),
    );
  });
}

function createCardType(
  value: string,

  done: (item?: string, mode?: 'add' | 'add-unique' | 'toggle') => void,
) {
  const type = value.trim();

  if (!type) {
    done();

    return;
  }

  addCardTypeOption(type);

  done(type, 'add-unique');
}

/* Unsaved State */

function serializeCardForm() {
  return JSON.stringify({
    title: cardForm.title,

    type: cardForm.type,

    content: cardForm.content,

    example: cardForm.example,

    sort_order: cardForm.sort_order,
  });
}

function hasUnsavedChanges() {
  if (cardMode.value === 'idle') {
    return false;
  }

  return serializeCardForm() !== originalCardState.value;
}

function confirmDiscard(action: () => void) {
  if (!hasUnsavedChanges()) {
    action();

    return;
  }

  Dialog.create({
    title: '尚未儲存',

    message: '目前的教材內容尚未儲存，確定要放棄變更嗎？',

    cancel: {
      label: '繼續編輯',

      flat: true,
    },

    ok: {
      label: '放棄變更',

      color: 'negative',
    },

    persistent: true,
  }).onOk(action);
}

function cancelCardEdit() {
  confirmDiscard(clearCardSelection);
}

function clearCardSelection() {
  cardMode.value = 'idle';

  selection.value = null;

  cardForm.title = '';

  cardForm.type = 'keyword';

  cardForm.content = '';

  cardForm.example = '';

  cardForm.sort_order = 1;

  originalCardState.value = '';
}

/* Delete */

function requestDeleteChapter(chapter: MaterialChapterNode) {
  Dialog.create({
    title: '刪除章節',

    message: `確定要刪除「${chapter.name}」嗎？`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '刪除',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    emit('delete-chapter', chapter.id);
  });
}

function requestDeleteUnit(unit: MaterialUnitNode) {
  Dialog.create({
    title: '刪除單元',

    message: `確定要刪除「${unit.name}」嗎？`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '刪除',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    emit('delete-unit', unit.id);
  });
}

function requestDeleteCard(card: MaterialKnowledgeCardNode) {
  Dialog.create({
    title: '刪除知識卡',

    message: `確定要刪除「${card.title}」嗎？`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '刪除',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    emit('delete-card', card.id);
  });
}

/* Parent Callbacks */

function finishCardSave() {
  if (cardMode.value === 'create') {
    clearCardSelection();

    return;
  }

  originalCardState.value = serializeCardForm();
}

function closeNameDialog() {
  nameDialog.open = false;
}

function handleDeletedCard(cardId: number) {
  if (selection.value?.cardId === cardId) {
    clearCardSelection();
  }
}

function isSelectedCard(
  cardId: number,

  unitId: number,
) {
  return selection.value?.cardId === cardId && selection.value?.unitId === unitId;
}

/* 同步 Tree */

watch(
  () => props.courseTree,

  () => {
    collectCardTypes();

    const cardId = selection.value?.cardId;

    if (cardMode.value !== 'edit' || cardId === null || cardId === undefined) {
      return;
    }

    const currentCard = findSelectedCard();

    if (!currentCard) {
      clearCardSelection();

      return;
    }

    if (!hasUnsavedChanges()) {
      syncFormFromCard(currentCard);
    }
  },

  {
    deep: true,
    immediate: true,
  },
);

function collectCardTypes() {
  const types = new Set<string>(defaultCardTypeOptions);

  props.courseTree?.chapters.forEach((chapter) => {
    chapter.units.forEach((unit) => {
      unit.knowledge_cards.forEach((card) => {
        if (card.type?.trim()) {
          types.add(card.type.trim());
        }
      });
    });
  });

  cardTypeOptions.value = [...types];

  filteredCardTypeOptions.value = [...types];
}

function findSelectedCard(): MaterialKnowledgeCardNode | null {
  const context = selection.value;

  if (!context || context.cardId === null) {
    return null;
  }

  const chapter = props.courseTree?.chapters.find((item) => item.id === context.chapterId);

  const unit = chapter?.units.find((item) => item.id === context.unitId);

  return unit?.knowledge_cards.find((card) => card.id === context.cardId) ?? null;
}

function syncFormFromCard(card: MaterialKnowledgeCardNode) {
  cardForm.title = card.title;

  cardForm.type = card.type || 'keyword';

  cardForm.content = card.content;

  cardForm.example = card.example ?? '';

  cardForm.sort_order = card.sort_order;

  addCardTypeOption(cardForm.type);

  originalCardState.value = serializeCardForm();
}

defineExpose({
  closeNameDialog,
  finishCardSave,
  handleDeletedCard,
  hasUnsavedChanges,
});
</script>
