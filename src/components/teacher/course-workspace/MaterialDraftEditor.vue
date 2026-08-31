<template>
  <div class="material-draft-editor">
    <!-- =====================================================
         Error
    ====================================================== -->
    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-red-1 text-negative material-draft-editor__error"
    >
      {{ errorMessage }}
    </q-banner>

    <!-- =====================================================
         Workspace
    ====================================================== -->
    <div class="material-draft-editor__workspace">
      <!-- ===================================================
           Left：教材大綱
      ==================================================== -->
      <aside class="material-draft-editor__outline">
        <!-- Header -->
        <div class="material-draft-editor__outline-header">
          <div>
            <div class="material-draft-editor__outline-title">教材大綱</div>

            <div class="material-draft-editor__outline-caption">點擊階層可展開、收合或編輯內容</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="add"
            color="blue"
            :disable="editing || !currentTopic"
            @click="openAddChapterForCurrentTopic"
          >
            <q-tooltip> 新增章節 </q-tooltip>
          </q-btn>
        </div>

        <q-separator />

        <!-- =================================================
             No Topic
        ================================================== -->
        <div v-if="!currentTopic" class="material-draft-editor__outline-empty">
          <q-icon name="menu_book" size="38px" color="grey-5" />

          <span> 找不到教材內容 </span>
        </div>

        <!-- =================================================
             Tree
             UI 不顯示 Topic，直接從 Chapter 開始
        ================================================== -->
        <div v-else class="material-draft-editor__tree">
          <div class="material-draft-editor__tree-level">
            <!-- =============================================
                 Chapters
            ============================================== -->
            <div
              v-for="(chapter, chapterIndex) in currentTopic.chapters"
              :key="chapter.id"
              class="material-draft-editor__tree-branch"
            >
              <!-- Chapter -->
              <div
                class="material-draft-editor__tree-item material-draft-editor__tree-item--chapter material-draft-editor__tree-item--collapsible"
                :class="{
                  'material-draft-editor__tree-item--active': isSelected('chapter', chapter.id),
                }"
                @click="handleChapterClick(chapter.id)"
              >
                <!-- Expand / Collapse -->
                <q-icon
                  :name="
                    isChapterCollapsed(chapter.id) ? 'keyboard_arrow_right' : 'keyboard_arrow_down'
                  "
                  class="material-draft-editor__tree-expand-icon"
                />

                <!-- Chapter Icon -->
                <q-icon name="menu_book" class="material-draft-editor__tree-icon" />

                <!-- Chapter Content -->
                <div class="material-draft-editor__tree-main">
                  <div class="material-draft-editor__tree-meta">
                    <q-badge outline color="blue-8" label="章節" />

                    <span class="material-draft-editor__tree-number">
                      {{ getChapterHierarchyNo(chapterIndex) }}
                    </span>
                  </div>

                  <div class="material-draft-editor__tree-name">
                    {{ chapter.name }}
                  </div>
                </div>

                <!-- Chapter Actions -->
                <div class="material-draft-editor__tree-actions">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="add"
                    color="blue"
                    :disable="editing"
                    @click.stop="openAddUnit(chapter.id)"
                  >
                    <q-tooltip> 新增單元 </q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="delete_outline"
                    color="negative"
                    :disable="editing"
                    @click.stop="requestDelete('chapter', chapter.id, chapter.name)"
                  >
                    <q-tooltip> 刪除章節 </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- ===========================================
                   Chapter Children
              ============================================ -->
              <q-slide-transition>
                <div
                  v-show="!isChapterCollapsed(chapter.id)"
                  class="material-draft-editor__tree-children"
                >
                  <!-- =======================================
                       Units
                  ======================================== -->
                  <div
                    v-for="(unit, unitIndex) in chapter.units"
                    :key="unit.id"
                    class="material-draft-editor__tree-branch"
                  >
                    <!-- Unit -->
                    <div
                      class="material-draft-editor__tree-item material-draft-editor__tree-item--unit material-draft-editor__tree-item--collapsible"
                      :class="{
                        'material-draft-editor__tree-item--active': isSelected('unit', unit.id),
                      }"
                      @click="handleUnitClick(unit.id)"
                    >
                      <!-- Expand / Collapse -->
                      <q-icon
                        :name="
                          isUnitCollapsed(unit.id) ? 'keyboard_arrow_right' : 'keyboard_arrow_down'
                        "
                        class="material-draft-editor__tree-expand-icon"
                      />

                      <!-- Unit Icon -->
                      <q-icon name="view_list" class="material-draft-editor__tree-icon" />

                      <!-- Unit Content -->
                      <div class="material-draft-editor__tree-main">
                        <div class="material-draft-editor__tree-meta">
                          <q-badge outline color="blue-6" label="單元" />

                          <span class="material-draft-editor__tree-number">
                            {{ getUnitHierarchyNo(chapterIndex, unitIndex) }}
                          </span>
                        </div>

                        <div class="material-draft-editor__tree-name">
                          {{ unit.name }}
                        </div>
                      </div>

                      <!-- Unit Actions -->
                      <div class="material-draft-editor__tree-actions">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="add"
                          color="blue"
                          :disable="editing"
                          @click.stop="startCreateCard(unit.id)"
                        >
                          <q-tooltip> 新增知識卡 </q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete_outline"
                          color="negative"
                          :disable="editing"
                          @click.stop="requestDelete('unit', unit.id, unit.name)"
                        >
                          <q-tooltip> 刪除單元 </q-tooltip>
                        </q-btn>
                      </div>
                    </div>

                    <!-- =====================================
                         Unit Children
                    ====================================== -->
                    <q-slide-transition>
                      <div
                        v-show="!isUnitCollapsed(unit.id)"
                        class="material-draft-editor__tree-children"
                      >
                        <!-- =================================
                             Knowledge Cards
                        ================================== -->
                        <div
                          v-for="(card, cardIndex) in unit.knowledge_cards"
                          :key="card.id"
                          class="material-draft-editor__tree-item material-draft-editor__tree-item--card"
                          :class="{
                            'material-draft-editor__tree-item--active': isSelected('card', card.id),
                          }"
                          @click="selectCard(card.id)"
                        >
                          <!--
                            Knowledge Card 沒有下一層，
                            保留與箭頭相同寬度讓階層對齊。
                          -->
                          <span class="material-draft-editor__tree-expand-placeholder" />

                          <!-- Card Icon -->
                          <q-icon name="description" class="material-draft-editor__tree-icon" />

                          <!-- Card Content -->
                          <div class="material-draft-editor__tree-main">
                            <div class="material-draft-editor__tree-meta">
                              <q-badge outline color="blue-grey-6" label="知識卡" />

                              <span class="material-draft-editor__tree-number">
                                {{ getCardHierarchyNo(chapterIndex, unitIndex, cardIndex) }}
                              </span>
                            </div>

                            <div class="material-draft-editor__tree-name">
                              {{ card.title }}
                            </div>
                          </div>

                          <!-- Delete Card -->
                          <q-btn
                            flat
                            round
                            dense
                            size="sm"
                            icon="delete_outline"
                            color="negative"
                            :disable="editing"
                            class="material-draft-editor__tree-delete"
                            @click.stop="requestDelete('card', card.id, card.title)"
                          >
                            <q-tooltip> 刪除知識卡 </q-tooltip>
                          </q-btn>
                        </div>

                        <!-- Add Card -->
                        <button
                          class="material-draft-editor__tree-add-card"
                          type="button"
                          :disabled="editing"
                          @click="startCreateCard(unit.id)"
                        >
                          <q-icon name="add" />

                          新增知識卡
                        </button>
                      </div>
                    </q-slide-transition>
                  </div>

                  <!-- No Unit -->
                  <button
                    v-if="chapter.units.length === 0"
                    class="material-draft-editor__tree-empty-action"
                    type="button"
                    :disabled="editing"
                    @click="openAddUnit(chapter.id)"
                  >
                    <q-icon name="add" />

                    此章節尚無單元，點此新增
                  </button>
                </div>
              </q-slide-transition>
            </div>

            <!-- No Chapter -->
            <button
              v-if="currentTopic.chapters.length === 0"
              class="material-draft-editor__tree-empty-action"
              type="button"
              :disabled="editing"
              @click="openAddChapterForCurrentTopic"
            >
              <q-icon name="add" />

              尚無章節，點此新增
            </button>
          </div>
        </div>

        <!-- =================================================
             Bottom Add Chapter
        ================================================== -->
        <div v-if="currentTopic" class="material-draft-editor__outline-footer">
          <q-btn
            outline
            color="blue"
            icon="add"
            label="新增章節"
            no-caps
            class="full-width"
            :disable="editing"
            @click="openAddChapterForCurrentTopic"
          />
        </div>
      </aside>

      <!-- ===================================================
           Right：Editor
      ==================================================== -->
      <main class="material-draft-editor__editor">
        <!-- No Topic -->
        <div v-if="!currentTopic" class="material-draft-editor__editor-empty">
          <q-icon name="menu_book" size="60px" color="grey-4" />

          <div class="text-h6">找不到教材內容</div>
        </div>

        <!-- No Selection -->
        <div v-else-if="!selectedKind" class="material-draft-editor__editor-empty">
          <q-icon name="edit_note" size="64px" color="blue-3" />

          <div class="text-h6">選擇要編輯的教材內容</div>

          <div class="text-grey-7">請從左側教材大綱選擇章節、單元或知識卡</div>
        </div>

        <template v-else>
          <!-- ===============================================
               Editor Header
          ================================================ -->
          <header class="material-draft-editor__editor-header">
            <div class="material-draft-editor__editor-heading">
              <div class="material-draft-editor__editor-meta">
                <q-badge :color="selectedCategoryColor" :label="selectedCategoryLabel" />

                <span class="material-draft-editor__editor-number">
                  {{ selectedHierarchyNo }}
                </span>

                <q-badge v-if="isDirty" color="orange" text-color="white" label="未儲存" />
              </div>

              <div class="material-draft-editor__editor-title">
                {{ selectedEditorTitle }}
              </div>

              <!--
                左側不顯示 Topic，
                但 Breadcrumb 保留 Topic 名稱，
                方便老師知道目前編輯哪一份教材。
              -->
              <div class="material-draft-editor__breadcrumb">
                {{ selectedBreadcrumb }}
              </div>
            </div>
          </header>

          <q-separator />

          <!-- ===============================================
               Editor Body
          ================================================ -->
          <div class="material-draft-editor__editor-body">
            <!-- =============================================
                 Chapter Editor
            ============================================== -->
            <section v-if="selectedKind === 'chapter'" class="material-draft-editor__simple-editor">
              <div class="material-draft-editor__section-title">章節設定</div>

              <div class="material-draft-editor__section-description">
                編輯章節名稱，或在此章節底下新增單元。
              </div>

              <q-input v-model="nameEditor" outlined label="章節名稱" :disable="editing" />

              <div class="material-draft-editor__node-summary">
                <q-icon name="view_list" />

                此章節共有

                <strong>
                  {{ selectedChapter?.units.length ?? 0 }}
                </strong>

                個單元
              </div>

              <div class="material-draft-editor__editor-actions">
                <q-btn
                  outline
                  color="blue"
                  icon="add"
                  label="新增單元"
                  :disable="editing || !selectedChapter"
                  @click="selectedChapter && openAddUnit(selectedChapter.id)"
                />

                <q-space />

                <q-btn
                  flat
                  color="negative"
                  icon="delete_outline"
                  label="刪除章節"
                  :disable="editing || !selectedChapter"
                  @click="
                    selectedChapter &&
                    requestDelete('chapter', selectedChapter.id, selectedChapter.name)
                  "
                />

                <q-btn
                  unelevated
                  color="blue"
                  icon="save"
                  label="儲存修改"
                  :loading="editing"
                  :disable="editing || !nameEditor.trim() || !isDirty"
                  @click="saveSelectedName"
                />
              </div>
            </section>

            <!-- =============================================
                 Unit Editor
            ============================================== -->
            <section v-if="selectedKind === 'unit'" class="material-draft-editor__simple-editor">
              <div class="material-draft-editor__section-title">單元設定</div>

              <div class="material-draft-editor__section-description">
                編輯單元名稱，或在此單元底下新增知識卡。
              </div>

              <q-input v-model="nameEditor" outlined label="單元名稱" :disable="editing" />

              <div class="material-draft-editor__node-summary">
                <q-icon name="description" />

                此單元共有

                <strong>
                  {{ selectedUnit?.knowledge_cards.length ?? 0 }}
                </strong>

                張知識卡
              </div>

              <div class="material-draft-editor__editor-actions">
                <q-btn
                  outline
                  color="blue"
                  icon="add"
                  label="新增知識卡"
                  :disable="editing || !selectedUnit"
                  @click="selectedUnit && startCreateCard(selectedUnit.id)"
                />

                <q-space />

                <q-btn
                  flat
                  color="negative"
                  icon="delete_outline"
                  label="刪除單元"
                  :disable="editing || !selectedUnit"
                  @click="selectedUnit && requestDelete('unit', selectedUnit.id, selectedUnit.name)"
                />

                <q-btn
                  unelevated
                  color="blue"
                  icon="save"
                  label="儲存修改"
                  :loading="editing"
                  :disable="editing || !nameEditor.trim() || !isDirty"
                  @click="saveSelectedName"
                />
              </div>
            </section>

            <!-- =============================================
                 Knowledge Card Editor
            ============================================== -->
            <section
              v-if="selectedKind === 'card' || selectedKind === 'card-create'"
              class="material-draft-editor__card-editor"
            >
              <!-- Knowledge Card Title -->
              <div class="material-draft-editor__field">
                <div class="material-draft-editor__field-label">
                  知識卡名稱

                  <span> * </span>
                </div>

                <q-input
                  v-model="cardForm.title"
                  outlined
                  placeholder="例如：變數命名規則"
                  :disable="editing"
                />
              </div>

              <!-- ===========================================
                   Word / Tiptap
              ============================================ -->
              <div class="material-draft-editor__field">
                <div class="material-draft-editor__field-heading">
                  <div>
                    <div class="material-draft-editor__field-label">
                      教材內容

                      <span> * </span>
                    </div>

                    <div class="material-draft-editor__field-hint">
                      可像 Word 一樣設定標題、粗體、清單、對齊、表格與程式碼區塊
                    </div>
                  </div>

                  <q-badge outline color="blue" label="Tiptap" />
                </div>

                <RichTextEditor v-model="cardForm.content" :disabled="editing" />
              </div>

              <!-- ===========================================
                   Example
              ============================================ -->
              <div class="material-draft-editor__field">
                <div class="material-draft-editor__field-label">程式碼／範例</div>

                <div class="material-draft-editor__field-hint">
                  此欄位暫時維持原本 Backend 的 example 欄位
                </div>

                <q-input
                  v-model="cardForm.example"
                  outlined
                  type="textarea"
                  autogrow
                  placeholder="例如：$name = 'Amy';"
                  :disable="editing"
                  class="material-draft-editor__example-input"
                />
              </div>

              <!-- ===========================================
                   Knowledge Card Actions
              ============================================ -->
              <div class="material-draft-editor__editor-actions">
                <!--
                  將下面所有操作按鈕推到右側
                -->
                <q-space />

                <!-- Create Mode -->
                <q-btn
                  v-if="selectedKind === 'card-create'"
                  flat
                  color="grey-7"
                  label="取消新增"
                  :disable="editing"
                  @click="cancelCreateCard"
                />

                <!-- Edit Mode -->
                <q-btn
                  v-else
                  flat
                  color="negative"
                  icon="delete_outline"
                  label="刪除知識卡"
                  :disable="editing || !selectedCard"
                  @click="
                    selectedCard && requestDelete('card', selectedCard.id, selectedCard.title)
                  "
                />

                <!-- Save -->
                <q-btn
                  unelevated
                  color="blue"
                  icon="save"
                  :label="selectedKind === 'card-create' ? '建立知識卡' : '儲存修改'"
                  :loading="editing"
                  :disable="!canSaveCard"
                  @click="saveCard"
                />
              </div>
            </section>
          </div>
        </template>
      </main>
    </div>

    <!-- =====================================================
         Add Chapter / Unit Dialog
    ====================================================== -->
    <q-dialog v-model="nameDialog.open" persistent>
      <q-card class="material-draft-editor__dialog">
        <q-card-section>
          <div class="text-h6">
            {{ nameDialog.title }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nameDialog.name"
            outlined
            autofocus
            :label="nameDialog.type === 'chapter' ? '章節名稱' : '單元名稱'"
            :disable="editing"
            @keyup.enter="submitNameDialog"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="editing" @click="nameDialog.open = false" />

          <q-btn
            unelevated
            color="blue"
            label="新增"
            :loading="editing"
            :disable="!nameDialog.name.trim()"
            @click="submitNameDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';

import { Dialog } from 'quasar';

import RichTextEditor from '../../common/RichTextEditor.vue';

import type {
  MaterialChapterNode,
  MaterialDraft,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../../types/material';

/*
 * ============================================================
 * Types
 * ============================================================
 */

type SelectedNodeType = 'chapter' | 'unit' | 'card';

type SelectedKind = SelectedNodeType | 'card-create' | null;

type DeleteNodeType = 'chapter' | 'unit' | 'card';

type NameNodeType = 'chapter' | 'unit';

interface SelectedNode {
  type: SelectedNodeType;
  id: string;
}

interface NameDialogState {
  open: boolean;
  type: NameNodeType;
  title: string;
  parentId: string | null;
  name: string;
}

interface CardEditorState {
  title: string;
  content: string;
  example: string;
}

interface EditorSnapshot {
  name: string;
  title: string;
  content: string;
  example: string;
}

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    draft: MaterialDraft;

    editing: boolean;

    errorMessage: string;

    topicName?: string | null;
  }>(),
  {
    topicName: null,
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 *
 * 維持原本 Parent 的 Event API，
 * [courseId].vue 不需要跟著重寫。
 */

const emit = defineEmits<{
  'add-chapter': [topicId: string, name: string];

  'update-chapter': [nodeId: string, name: string];

  'delete-chapter': [nodeId: string];

  'add-unit': [chapterId: string, name: string];

  'update-unit': [nodeId: string, name: string];

  'delete-unit': [nodeId: string];

  'add-card': [
    unitId: string,

    data: {
      title: string;
      content: string;
      example: string | null;
    },
  ];

  'update-card': [
    nodeId: string,

    data: {
      title: string;
      content: string;
      example: string | null;
    },
  ];

  'delete-card': [nodeId: string];
}>();

/*
 * ============================================================
 * Topic
 * ============================================================
 *
 * Backend / Draft Tree 仍然保留 Topic。
 *
 * 只是新版 UI：
 * 不顯示 Topic Tree Node。
 */

const currentTopic = computed(() => props.draft.topics[0] ?? null);

/*
 * Topic 名稱仍然保留，
 * 用於右側 Breadcrumb。
 */
const displayTopicName = computed(
  () => props.topicName || currentTopic.value?.name || '未命名教材',
);

/*
 * ============================================================
 * Tree Collapse
 * ============================================================
 */

/*
 * 記錄目前收合的 Chapter。
 */
const collapsedChapterIds = reactive(new Set<string>());

/*
 * 記錄目前收合的 Unit。
 */
const collapsedUnitIds = reactive(new Set<string>());

function isChapterCollapsed(chapterId: string): boolean {
  return collapsedChapterIds.has(chapterId);
}

function isUnitCollapsed(unitId: string): boolean {
  return collapsedUnitIds.has(unitId);
}

/*
 * ============================================================
 * Toggle Chapter
 * ============================================================
 */

function toggleChapter(chapterId: string) {
  if (collapsedChapterIds.has(chapterId)) {
    collapsedChapterIds.delete(chapterId);

    return;
  }

  collapsedChapterIds.add(chapterId);
}

/*
 * ============================================================
 * Toggle Unit
 * ============================================================
 */

function toggleUnit(unitId: string) {
  if (collapsedUnitIds.has(unitId)) {
    collapsedUnitIds.delete(unitId);

    return;
  }

  collapsedUnitIds.add(unitId);
}

/*
 * ============================================================
 * Selection
 * ============================================================
 */

const selectedNode = ref<SelectedNode | null>(null);

/*
 * 新增 Knowledge Card 模式。
 */
const cardCreateMode = ref(false);

/*
 * 新 Knowledge Card 所屬 Unit。
 */
const createCardUnitId = ref<string | null>(null);

/*
 * 新增 Card 後，
 * 用來從 Backend 回傳的新 Draft
 * 找出剛建立的 Card。
 */
const pendingCreatedCard = ref<{
  unitId: string;
  title: string;
} | null>(null);

/*
 * ============================================================
 * Editor Form
 * ============================================================
 */

const nameEditor = ref('');

const cardForm = reactive<CardEditorState>({
  title: '',
  content: '',
  example: '',
});

/*
 * 用於判斷是否有未儲存修改。
 */
const snapshot = reactive<EditorSnapshot>({
  name: '',
  title: '',
  content: '',
  example: '',
});

/*
 * ============================================================
 * Add Chapter / Unit Dialog
 * ============================================================
 */

const nameDialog = reactive<NameDialogState>({
  open: false,
  type: 'chapter',
  title: '',
  parentId: null,
  name: '',
});

/*
 * ============================================================
 * Selected Chapter
 * ============================================================
 */

const selectedChapter = computed<MaterialChapterNode | null>(() => {
  if (selectedNode.value?.type !== 'chapter') {
    return null;
  }

  return findChapter(selectedNode.value.id);
});

/*
 * ============================================================
 * Selected Unit
 * ============================================================
 */

const selectedUnit = computed<MaterialUnitNode | null>(() => {
  if (selectedNode.value?.type !== 'unit') {
    return null;
  }

  return findUnitContext(selectedNode.value.id)?.unit ?? null;
});

/*
 * ============================================================
 * Selected Knowledge Card
 * ============================================================
 */

const selectedCard = computed<MaterialKnowledgeCardNode | null>(() => {
  if (selectedNode.value?.type !== 'card') {
    return null;
  }

  return findCardContext(selectedNode.value.id)?.card ?? null;
});

/*
 * ============================================================
 * Selected Kind
 * ============================================================
 */

const selectedKind = computed<SelectedKind>(() => {
  if (cardCreateMode.value) {
    return 'card-create';
  }

  return selectedNode.value?.type ?? null;
});

/*
 * ============================================================
 * Hierarchy Number
 * ============================================================
 *
 * UI 不把 Topic 算進編號。
 *
 * Chapter
 * → 1
 *
 * Unit
 * → 1.1
 *
 * Knowledge Card
 * → 1.1.1
 *
 * 目前由 Frontend 計算。
 * 等 Backend 有正式 hierarchy_no 後再替換。
 */

/*
 * Chapter
 */
function getChapterHierarchyNo(chapterIndex: number): string {
  return String(chapterIndex + 1);
}

/*
 * Unit
 */
function getUnitHierarchyNo(chapterIndex: number, unitIndex: number): string {
  return [chapterIndex + 1, unitIndex + 1].join('.');
}

/*
 * Knowledge Card
 */
function getCardHierarchyNo(chapterIndex: number, unitIndex: number, cardIndex: number): string {
  return [chapterIndex + 1, unitIndex + 1, cardIndex + 1].join('.');
}

/*
 * ============================================================
 * Selected Category Label
 * ============================================================
 */

const selectedCategoryLabel = computed(() => {
  switch (selectedKind.value) {
    case 'chapter':
      return '章節';

    case 'unit':
      return '單元';

    case 'card':
    case 'card-create':
      return '知識卡';

    default:
      return '';
  }
});

/*
 * ============================================================
 * Selected Category Color
 * ============================================================
 */

const selectedCategoryColor = computed(() => {
  switch (selectedKind.value) {
    case 'chapter':
      return 'blue-8';

    case 'unit':
      return 'blue-6';

    case 'card':
    case 'card-create':
      return 'blue-grey-7';

    default:
      return 'grey';
  }
});

/*
 * ============================================================
 * Selected Hierarchy Number
 * ============================================================
 */

const selectedHierarchyNo = computed(() => {
  /*
   * =========================================
   * New Knowledge Card
   * =========================================
   */
  if (selectedKind.value === 'card-create' && createCardUnitId.value) {
    const context = findUnitContext(createCardUnitId.value);

    if (!context) {
      return '新增';
    }

    return `${getUnitHierarchyNo(context.chapterIndex, context.unitIndex)}.新增`;
  }

  /*
   * =========================================
   * Chapter
   * =========================================
   */
  if (selectedNode.value?.type === 'chapter') {
    const context = findChapterContext(selectedNode.value.id);

    return context ? getChapterHierarchyNo(context.chapterIndex) : '';
  }

  /*
   * =========================================
   * Unit
   * =========================================
   */
  if (selectedNode.value?.type === 'unit') {
    const context = findUnitContext(selectedNode.value.id);

    return context ? getUnitHierarchyNo(context.chapterIndex, context.unitIndex) : '';
  }

  /*
   * =========================================
   * Knowledge Card
   * =========================================
   */
  if (selectedNode.value?.type === 'card') {
    const context = findCardContext(selectedNode.value.id);

    return context
      ? getCardHierarchyNo(context.chapterIndex, context.unitIndex, context.cardIndex)
      : '';
  }

  return '';
});

/*
 * ============================================================
 * Editor Title
 * ============================================================
 */

const selectedEditorTitle = computed(() => {
  if (selectedKind.value === 'card-create') {
    return '新增知識卡';
  }

  if (selectedChapter.value) {
    return selectedChapter.value.name;
  }

  if (selectedUnit.value) {
    return selectedUnit.value.name;
  }

  if (selectedCard.value) {
    return selectedCard.value.title;
  }

  return '';
});

/*
 * ============================================================
 * Breadcrumb
 * ============================================================
 *
 * 左側不顯示 Topic，
 * 但右側 Breadcrumb 仍然保留 Topic 名稱。
 */

const selectedBreadcrumb = computed(() => {
  const topic = displayTopicName.value;

  /*
   * =========================================
   * Chapter
   * =========================================
   */
  if (selectedNode.value?.type === 'chapter') {
    return topic;
  }

  /*
   * =========================================
   * Unit
   * =========================================
   */
  if (selectedNode.value?.type === 'unit') {
    const context = findUnitContext(selectedNode.value.id);

    if (!context) {
      return topic;
    }

    return [topic, `${getChapterHierarchyNo(context.chapterIndex)} ${context.chapter.name}`].join(
      ' / ',
    );
  }

  /*
   * =========================================
   * Card / Create Card
   * =========================================
   */
  const unitId = cardCreateMode.value
    ? createCardUnitId.value
    : selectedNode.value?.type === 'card'
      ? (findCardContext(selectedNode.value.id)?.unit.id ?? null)
      : null;

  if (unitId) {
    const context = findUnitContext(unitId);

    if (context) {
      return [
        topic,

        `${getChapterHierarchyNo(context.chapterIndex)} ${context.chapter.name}`,

        `${getUnitHierarchyNo(context.chapterIndex, context.unitIndex)} ${context.unit.name}`,
      ].join(' / ');
    }
  }

  return topic;
});

/*
 * ============================================================
 * Dirty
 * ============================================================
 */

const isDirty = computed(() => {
  /*
   * Chapter / Unit
   */
  if (selectedKind.value === 'chapter' || selectedKind.value === 'unit') {
    return nameEditor.value !== snapshot.name;
  }

  /*
   * New Knowledge Card
   */
  if (selectedKind.value === 'card-create') {
    return Boolean(cardForm.title.trim() || cardForm.content.trim() || cardForm.example.trim());
  }

  /*
   * Existing Knowledge Card
   */
  if (selectedKind.value === 'card') {
    return (
      cardForm.title !== snapshot.title ||
      cardForm.content !== snapshot.content ||
      cardForm.example !== snapshot.example
    );
  }

  return false;
});

/*
 * ============================================================
 * Can Save Card
 * ============================================================
 */

const canSaveCard = computed(() => {
  return (
    !props.editing &&
    Boolean(cardForm.title.trim()) &&
    Boolean(cardForm.content.trim()) &&
    (selectedKind.value === 'card-create' || isDirty.value)
  );
});

/*
 * ============================================================
 * Is Selected
 * ============================================================
 */

function isSelected(type: SelectedNodeType, id: string): boolean {
  /*
   * 新增 Knowledge Card 時，
   * Highlight 所屬 Unit。
   */
  if (cardCreateMode.value) {
    return type === 'unit' && id === createCardUnitId.value;
  }

  return selectedNode.value?.type === type && selectedNode.value.id === id;
}

/*
 * ============================================================
 * Chapter Click
 * ============================================================
 */

function handleChapterClick(chapterId: string) {
  /*
   * 目前已經選中這個 Chapter：
   * 第二次點擊只控制展開 / 收合。
   */
  if (
    selectedNode.value?.type === 'chapter' &&
    selectedNode.value.id === chapterId &&
    !cardCreateMode.value
  ) {
    toggleChapter(chapterId);

    return;
  }

  /*
   * 第一次點擊：
   * 選擇 Chapter 並切換展開狀態。
   */
  selectChapter(chapterId, true);
}

/*
 * ============================================================
 * Unit Click
 * ============================================================
 */

function handleUnitClick(unitId: string) {
  /*
   * 已經選中：
   * 只控制展開 / 收合。
   */
  if (
    selectedNode.value?.type === 'unit' &&
    selectedNode.value.id === unitId &&
    !cardCreateMode.value
  ) {
    toggleUnit(unitId);

    return;
  }

  selectUnit(unitId, true);
}

/*
 * ============================================================
 * Select Chapter
 * ============================================================
 */

function selectChapter(
  id: string,

  toggleAfterSelect = false,
) {
  switchSelection(() => {
    cardCreateMode.value = false;

    createCardUnitId.value = null;

    selectedNode.value = {
      type: 'chapter',
      id,
    };

    syncEditorFromSelection();

    if (toggleAfterSelect) {
      toggleChapter(id);
    }
  });
}

/*
 * ============================================================
 * Select Unit
 * ============================================================
 */

function selectUnit(
  id: string,

  toggleAfterSelect = false,
) {
  switchSelection(() => {
    cardCreateMode.value = false;

    createCardUnitId.value = null;

    selectedNode.value = {
      type: 'unit',
      id,
    };

    syncEditorFromSelection();

    if (toggleAfterSelect) {
      toggleUnit(id);
    }
  });
}

/*
 * ============================================================
 * Select Knowledge Card
 * ============================================================
 */

function selectCard(id: string) {
  /*
   * 已經選中同一張 Card。
   */
  if (
    selectedNode.value?.type === 'card' &&
    selectedNode.value.id === id &&
    !cardCreateMode.value
  ) {
    return;
  }

  switchSelection(() => {
    cardCreateMode.value = false;

    createCardUnitId.value = null;

    selectedNode.value = {
      type: 'card',
      id,
    };

    syncEditorFromSelection();
  });
}

/*
 * ============================================================
 * Switch Selection
 * ============================================================
 *
 * 如果老師已經修改內容但還沒 Save，
 * 不直接切換，以免遺失資料。
 */

function switchSelection(action: () => void) {
  if (!isDirty.value) {
    action();

    return;
  }

  Dialog.create({
    title: '尚未儲存',

    message: '目前內容還有未儲存的修改。切換教材項目後，這些修改會被放棄。',

    cancel: {
      label: '繼續編輯',

      flat: true,
    },

    ok: {
      label: '放棄修改並切換',

      color: 'orange',
    },

    persistent: true,
  }).onOk(() => {
    action();
  });
}

/*
 * ============================================================
 * Initial Selection
 * ============================================================
 */

function selectFirstAvailableNode() {
  const topic = currentTopic.value;

  if (!topic) {
    selectedNode.value = null;

    return;
  }

  /*
   * ==========================================================
   * 第一優先：
   * 第一張 Knowledge Card
   * ==========================================================
   */

  for (const chapter of topic.chapters) {
    for (const unit of chapter.units) {
      const card = unit.knowledge_cards[0];

      if (card) {
        selectedNode.value = {
          type: 'card',
          id: card.id,
        };

        cardCreateMode.value = false;

        /*
         * 確保父層是展開的。
         */
        collapsedChapterIds.delete(chapter.id);

        collapsedUnitIds.delete(unit.id);

        syncEditorFromSelection();

        return;
      }
    }
  }

  /*
   * ==========================================================
   * 第二優先：
   * 第一個 Unit
   * ==========================================================
   */

  for (const chapter of topic.chapters) {
    const unit = chapter.units[0];

    if (unit) {
      selectedNode.value = {
        type: 'unit',
        id: unit.id,
      };

      collapsedChapterIds.delete(chapter.id);

      syncEditorFromSelection();

      return;
    }
  }

  /*
   * ==========================================================
   * 第三優先：
   * 第一個 Chapter
   * ==========================================================
   */

  const chapter = topic.chapters[0];

  if (chapter) {
    selectedNode.value = {
      type: 'chapter',
      id: chapter.id,
    };

    syncEditorFromSelection();

    return;
  }

  selectedNode.value = null;
}

/*
 * ============================================================
 * Sync Editor From Selection
 * ============================================================
 */

function syncEditorFromSelection() {
  /*
   * Create Card 模式不覆蓋表單。
   */
  if (cardCreateMode.value) {
    return;
  }

  /*
   * ==========================================================
   * Chapter
   * ==========================================================
   */

  if (selectedChapter.value) {
    const name = selectedChapter.value.name;

    nameEditor.value = name;

    snapshot.name = name;

    return;
  }

  /*
   * ==========================================================
   * Unit
   * ==========================================================
   */

  if (selectedUnit.value) {
    const name = selectedUnit.value.name;

    nameEditor.value = name;

    snapshot.name = name;

    return;
  }

  /*
   * ==========================================================
   * Knowledge Card
   * ==========================================================
   */

  if (selectedCard.value) {
    const card = selectedCard.value;

    cardForm.title = card.title;

    cardForm.content = card.content;

    cardForm.example = card.example ?? '';

    snapshot.title = card.title;

    snapshot.content = card.content;

    snapshot.example = card.example ?? '';
  }
}

/*
 * ============================================================
 * Watch Draft
 * ============================================================
 */

watch(
  () => props.draft,

  () => {
    /*
     * 新增 Knowledge Card 過程中，
     * closeEditDialogs()
     * 會負責選取剛建立的 Card。
     */
    if (cardCreateMode.value) {
      return;
    }

    /*
     * 還沒有 Selection。
     */
    if (!selectedNode.value) {
      selectFirstAvailableNode();

      return;
    }

    /*
     * 原本選的 Node 被刪掉。
     */
    if (!selectedNodeExists()) {
      selectFirstAvailableNode();

      return;
    }

    /*
     * Update 成功後同步 Backend 最新資料。
     */
    syncEditorFromSelection();
  },
);

/*
 * 初始選取。
 */
selectFirstAvailableNode();

/*
 * ============================================================
 * Selected Node Exists
 * ============================================================
 */

function selectedNodeExists(): boolean {
  if (!selectedNode.value) {
    return false;
  }

  switch (selectedNode.value.type) {
    case 'chapter':
      return Boolean(findChapter(selectedNode.value.id));

    case 'unit':
      return Boolean(findUnitContext(selectedNode.value.id));

    case 'card':
      return Boolean(findCardContext(selectedNode.value.id));
  }
}

/*
 * ============================================================
 * Open Add Chapter
 * ============================================================
 */

function openAddChapterForCurrentTopic() {
  if (!currentTopic.value) {
    return;
  }

  openNameDialog(
    'chapter',

    '新增章節',

    currentTopic.value.id,
  );
}

/*
 * ============================================================
 * Open Add Unit
 * ============================================================
 */

function openAddUnit(chapterId: string) {
  /*
   * 新增 Unit 前自動展開 Chapter。
   */
  collapsedChapterIds.delete(chapterId);

  openNameDialog(
    'unit',

    '新增單元',

    chapterId,
  );
}

/*
 * ============================================================
 * Open Name Dialog
 * ============================================================
 */

function openNameDialog(
  type: NameNodeType,

  title: string,

  parentId: string,
) {
  nameDialog.type = type;

  nameDialog.title = title;

  nameDialog.parentId = parentId;

  nameDialog.name = '';

  nameDialog.open = true;
}

/*
 * ============================================================
 * Submit Add Chapter / Unit
 * ============================================================
 */

function submitNameDialog() {
  const name = nameDialog.name.trim();

  if (!name || !nameDialog.parentId) {
    return;
  }

  /*
   * Chapter
   */
  if (nameDialog.type === 'chapter') {
    emit(
      'add-chapter',

      nameDialog.parentId,

      name,
    );

    return;
  }

  /*
   * Unit
   */
  emit(
    'add-unit',

    nameDialog.parentId,

    name,
  );
}

/*
 * ============================================================
 * Save Chapter / Unit
 * ============================================================
 */

function saveSelectedName() {
  const name = nameEditor.value.trim();

  if (!name) {
    return;
  }

  /*
   * Chapter
   */
  if (selectedChapter.value) {
    emit(
      'update-chapter',

      selectedChapter.value.id,

      name,
    );

    return;
  }

  /*
   * Unit
   */
  if (selectedUnit.value) {
    emit(
      'update-unit',

      selectedUnit.value.id,

      name,
    );
  }
}

/*
 * ============================================================
 * Start Create Knowledge Card
 * ============================================================
 */

function startCreateCard(unitId: string) {
  /*
   * 找到 Unit 的父層。
   */
  const context = findUnitContext(unitId);

  if (context) {
    /*
     * 確保 Chapter / Unit 都展開。
     */
    collapsedChapterIds.delete(context.chapter.id);

    collapsedUnitIds.delete(unitId);
  }

  switchSelection(() => {
    /*
     * Highlight Unit。
     */
    selectedNode.value = {
      type: 'unit',
      id: unitId,
    };

    cardCreateMode.value = true;

    createCardUnitId.value = unitId;

    /*
     * 清空 Editor。
     */
    cardForm.title = '';

    cardForm.content = '';

    cardForm.example = '';

    snapshot.title = '';

    snapshot.content = '';

    snapshot.example = '';
  });
}

/*
 * ============================================================
 * Cancel Create Knowledge Card
 * ============================================================
 */

function cancelCreateCard() {
  cardCreateMode.value = false;

  createCardUnitId.value = null;

  cardForm.title = '';

  cardForm.content = '';

  cardForm.example = '';

  /*
   * 回到原本選取 Unit。
   */
  syncEditorFromSelection();
}

/*
 * ============================================================
 * Save Knowledge Card
 * ============================================================
 */

function saveCard() {
  const title = cardForm.title.trim();

  const content = cardForm.content.trim();

  const example = cardForm.example.trim();

  if (!title || !content) {
    return;
  }

  const data = {
    title,

    content,

    example: example || null,
  };

  /*
   * ==========================================================
   * Create
   * ==========================================================
   */
  if (cardCreateMode.value && createCardUnitId.value) {
    pendingCreatedCard.value = {
      unitId: createCardUnitId.value,

      title,
    };

    emit(
      'add-card',

      createCardUnitId.value,

      data,
    );

    return;
  }

  /*
   * ==========================================================
   * Update
   * ==========================================================
   */
  if (selectedCard.value) {
    emit(
      'update-card',

      selectedCard.value.id,

      data,
    );
  }
}

/*
 * ============================================================
 * Delete
 * ============================================================
 */

function requestDelete(
  type: DeleteNodeType,

  nodeId: string,

  name: string,
) {
  const label = type === 'chapter' ? '章節' : type === 'unit' ? '單元' : '知識卡';

  Dialog.create({
    title: `刪除${label}`,

    message: `確定要刪除「${name}」嗎？此操作無法復原。`,

    cancel: {
      label: '取消',

      flat: true,
    },

    ok: {
      label: '確認刪除',

      color: 'negative',
    },

    persistent: true,
  }).onOk(() => {
    switch (type) {
      case 'chapter':
        emit('delete-chapter', nodeId);

        break;

      case 'unit':
        emit('delete-unit', nodeId);

        break;

      case 'card':
        emit('delete-card', nodeId);

        break;
    }
  });
}

/*
 * ============================================================
 * Find Chapter
 * ============================================================
 */

function findChapter(chapterId: string): MaterialChapterNode | null {
  return currentTopic.value?.chapters.find((chapter) => chapter.id === chapterId) ?? null;
}

/*
 * ============================================================
 * Find Chapter Context
 * ============================================================
 */

function findChapterContext(chapterId: string) {
  const topic = currentTopic.value;

  if (!topic) {
    return null;
  }

  const chapterIndex = topic.chapters.findIndex((chapter) => chapter.id === chapterId);

  if (chapterIndex < 0) {
    return null;
  }

  return {
    chapter: topic.chapters[chapterIndex]!,

    chapterIndex,
  };
}

/*
 * ============================================================
 * Find Unit Context
 * ============================================================
 */

function findUnitContext(unitId: string) {
  const topic = currentTopic.value;

  if (!topic) {
    return null;
  }

  for (let chapterIndex = 0; chapterIndex < topic.chapters.length; chapterIndex++) {
    const chapter = topic.chapters[chapterIndex]!;

    const unitIndex = chapter.units.findIndex((unit) => unit.id === unitId);

    if (unitIndex >= 0) {
      return {
        chapter,

        chapterIndex,

        unit: chapter.units[unitIndex]!,

        unitIndex,
      };
    }
  }

  return null;
}

/*
 * ============================================================
 * Find Knowledge Card Context
 * ============================================================
 */

function findCardContext(cardId: string) {
  const topic = currentTopic.value;

  if (!topic) {
    return null;
  }

  for (let chapterIndex = 0; chapterIndex < topic.chapters.length; chapterIndex++) {
    const chapter = topic.chapters[chapterIndex]!;

    for (let unitIndex = 0; unitIndex < chapter.units.length; unitIndex++) {
      const unit = chapter.units[unitIndex]!;

      const cardIndex = unit.knowledge_cards.findIndex((card) => card.id === cardId);

      if (cardIndex >= 0) {
        return {
          chapter,

          chapterIndex,

          unit,

          unitIndex,

          card: unit.knowledge_cards[cardIndex]!,

          cardIndex,
        };
      }
    }
  }

  return null;
}

/*
 * ============================================================
 * Parent Compatibility
 * ============================================================
 *
 * Parent API 成功後目前會呼叫：
 *
 * materialEditorRef.value?.closeEditDialogs()
 *
 * 所以保留此方法。
 */

function closeEditDialogs() {
  /*
   * 關閉新增 Chapter / Unit Dialog。
   */
  nameDialog.open = false;

  /*
   * ==========================================================
   * 新增 Knowledge Card 成功
   * ==========================================================
   */
  if (pendingCreatedCard.value) {
    const pending = pendingCreatedCard.value;

    void nextTick(() => {
      const context = findUnitContext(pending.unitId);

      /*
       * 從最後面開始找，
       * 優先找到剛新增的同名 Knowledge Card。
       */
      const card =
        context?.unit.knowledge_cards
          .slice()
          .reverse()
          .find((item) => item.title === pending.title) ?? null;

      pendingCreatedCard.value = null;

      cardCreateMode.value = false;

      createCardUnitId.value = null;

      if (card) {
        selectedNode.value = {
          type: 'card',
          id: card.id,
        };

        /*
         * 新 Card 的父層保持展開。
         */
        if (context) {
          collapsedChapterIds.delete(context.chapter.id);

          collapsedUnitIds.delete(context.unit.id);
        }

        syncEditorFromSelection();

        return;
      }

      syncEditorFromSelection();
    });

    return;
  }

  /*
   * ==========================================================
   * 一般 Update / Add Chapter / Add Unit
   * ==========================================================
   */
  void nextTick(() => {
    syncEditorFromSelection();
  });
}

/*
 * ============================================================
 * Expose
 * ============================================================
 */

defineExpose({
  closeEditDialogs,
});
</script>
