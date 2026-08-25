<template>
  <section class="course-material-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-material-panel__header">
      <div>
        <h5 class="text-weight-bold">教材管理</h5>

        <p>查看、匯入、編輯與發布本課程教材</p>
      </div>

      <div class="course-material-panel__header-actions">
        <!-- <q-btn
          outline
          color="blue"
          icon="download"
          label="下載範本"
          :loading="downloadingTemplate"
          @click="$emit('download-template')"
        /> -->

        <q-btn unelevated color="blue" icon="add" label="新增教材" @click="openImportDialog" />
      </div>
    </div>

    <!-- =========================
         Loading
    ========================== -->
    <div v-if="loading" class="course-material-panel__loading">
      <q-spinner color="blue" size="40px" />
    </div>

    <!-- =========================
         Empty
    ========================== -->
    <div
      v-else-if="publishedTopics.length === 0 && editableDrafts.length === 0"
      class="course-material-panel__empty"
    >
      <q-icon name="menu_book" size="48px" color="grey-5" />

      <div>目前尚無教材</div>

      <div class="text-caption text-grey-6">可以下載 Excel 範本後匯入第一份教材</div>
    </div>

    <!-- =========================
         Draft List
    ========================== -->
    <div v-else class="course-material-panel__groups">
      <!-- =========================
       Published
       左邊
  ========================== -->
      <section class="course-material-panel__group course-material-panel__group--published">
        <div class="course-material-panel__group-header">
          <div class="course-material-panel__group-title">
            <q-icon name="check_circle" color="positive" />

            已發布
          </div>

          <q-badge
            color="positive"
            class="course-material-panel__group-count"
            :label="`${publishedTopics.length} 個主題`"
          />
        </div>

        <div v-if="publishedTopics.length === 0" class="course-material-panel__group-empty">
          <q-icon name="menu_book" size="36px" color="grey-5" />

          <div>目前沒有已發布教材</div>
        </div>

        <div v-else class="course-material-panel__group-list">
          <q-card
            v-for="topic in publishedTopics"
            :key="topic.id"
            flat
            bordered
            class="course-material-panel__card course-material-panel__card--published"
          >
            <q-card-section>
              <div class="course-material-panel__card-header">
                <div>
                  <!-- 主題名稱 -->
                  <div class="course-material-panel__card-title">
                    {{ topic.name }}
                  </div>

                  <!-- 這一個主題自己的章節數 -->
                  <div class="course-material-panel__card-meta">
                    <span>
                      {{ topic.item_count }}
                      個章節
                    </span>
                  </div>
                </div>

                <q-badge color="positive" label="已發布" />
              </div>

              <div class="course-material-panel__actions">
                <q-btn
                  flat
                  color="blue"
                  icon="visibility"
                  label="查看教材"
                  @click="emit('view-published', topic)"
                />

                <q-btn
                  flat
                  color="blue"
                  icon="edit"
                  label="加入草稿編輯"
                  @click="emit('edit-published', topic)"
                />

                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="刪除"
                  @click="emit('delete-published-topic', topic.id, topic.name)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>

      <!-- =========================
       Draft
       右邊
  ========================== -->
      <section class="course-material-panel__group course-material-panel__group--draft">
        <div class="course-material-panel__group-header">
          <div class="course-material-panel__group-title">
            <q-icon name="edit_note" color="orange" />

            草稿
          </div>

          <q-badge
            color="orange"
            class="course-material-panel__group-count"
            :label="`${editableTopics.length} 個主題`"
          />
        </div>

        <div v-if="editableDrafts.length === 0" class="course-material-panel__group-empty">
          <q-icon name="edit_note" size="36px" color="grey-5" />

          <div>目前沒有草稿</div>
        </div>

        <div v-else class="course-material-panel__group-list">
          <q-card
            v-for="item in editableTopics"
            :key="`${item.draft.id}-${item.topic.id}`"
            flat
            bordered
            class="course-material-panel__card course-material-panel__card--draft"
          >
            <q-card-section>
              <div class="course-material-panel__card-header">
                <div>
                  <div class="course-material-panel__card-title">
                    {{ item.topic.name }}
                  </div>

                  <div class="course-material-panel__card-meta">
                    <span>
                      {{ item.topic.chapters.length }}
                      個章節
                    </span>
                  </div>
                </div>

                <q-badge color="orange" label="草稿" />
              </div>

              <div class="course-material-panel__actions">
                <q-btn
                  flat
                  color="blue"
                  icon="visibility"
                  label="查看教材"
                  @click="emit('view', item.draft)"
                />

                <q-btn
                  flat
                  color="blue"
                  icon="edit"
                  label="編輯教材"
                  @click="emit('edit', item.draft)"
                />

                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="刪除"
                  @click="emit('delete-draft-topic', item.draft.id, item.topic.id, item.topic.name)"
                />

                <q-btn
                  unelevated
                  color="blue"
                  icon="publish"
                  label="發布"
                  :loading="publishingDraftId === item.draft.id"
                  @click="emit('publish', item.draft)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>
    </div>

    <!-- =========================
         Delete Topic Dialog
    ========================== -->
    <q-dialog v-model="deleteTopicDialog" persistent>
      <q-card class="course-material-panel__dialog">
        <q-card-section>
          <div class="text-h6">
            {{ deleteTopicMode === 'published' ? '刪除已發布主題' : '刪除草稿主題' }}
          </div>

          <div class="text-caption text-grey-7 q-mt-xs">請選擇要刪除的主題</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- Published Topic -->
          <q-list v-if="deleteTopicMode === 'published'" separator>
            <q-item v-for="topic in publishedTopics" :key="topic.id">
              <q-item-section>
                <q-item-label>
                  {{ topic.name }}
                </q-item-label>

                <q-item-label caption>
                  {{ topic.item_count }}
                  個章節
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="刪除"
                  @click="emit('delete-published-topic', topic.id, topic.name)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Draft Topic -->
          <q-list v-else-if="deleteTopicMode === 'draft' && deleteTopicDraft" separator>
            <q-item v-for="topic in deleteTopicDraft.topics" :key="topic.id">
              <q-item-section>
                <q-item-label>
                  {{ topic.name }}
                </q-item-label>

                <q-item-label caption>
                  {{ topic.chapters.length }}
                  個章節
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="刪除"
                  @click="emit('delete-draft-topic', deleteTopicDraft.id, topic.id, topic.name)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" @click="closeDeleteTopicDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================
         Import Dialog
    ========================== -->
    <q-dialog v-model="importDialog" persistent>
      <q-card class="course-material-panel__import-dialog">
        <!-- =====================
            Header
        ====================== -->
        <q-card-section>
          <div class="text-h6">匯入教材</div>

          <div class="text-caption text-grey-7 q-mt-xs">
            一次匯入一個主題，每份 Excel 的教材內容都會掛在此主題下
          </div>
        </q-card-section>

        <q-separator />

        <!-- =====================
            Content
        ====================== -->
        <q-card-section class="course-material-panel__import-content">
          <!-- =====================
              Step 1
              Topic
          ====================== -->
          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 1 </span>

              填寫主題名稱
            </div>

            <div class="course-material-panel__import-step-description">
              此次上傳的整份 Excel 都會放在這個主題底下。
            </div>

            <q-input
              v-model="topicName"
              outlined
              label="主題名稱 *"
              placeholder="例如：PHP 基礎"
              maxlength="100"
              :disable="props.importing"
              :rules="[(value) => !!value?.trim() || '請輸入主題名稱']"
            >
              <template #prepend>
                <q-icon name="topic" />
              </template>
            </q-input>
          </div>

          <q-separator />

          <!-- =====================
              Step 2
              Download
          ====================== -->
          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 2 </span>

              下載 Excel 範本
            </div>

            <div class="course-material-panel__import-step-description">
              範本只需要填寫章節、單元、知識卡與範例，不需要填寫主題。
            </div>

            <q-btn
              outline
              color="blue"
              icon="download"
              label="下載教材範本"
              :loading="props.downloadingTemplate"
              :disable="props.importing"
              @click="emit('download-template')"
            />
          </div>

          <q-separator />

          <!-- =====================
           Step 3
           Excel
      ====================== -->
          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 3 </span>

              填寫 Excel 教材內容
            </div>

            <div class="course-material-panel__import-hint">
              <div>Excel 中請填寫：</div>

              <div class="course-material-panel__import-fields">
                <q-chip dense color="blue-1" text-color="blue-9" label="章節" />

                <q-chip dense color="blue-1" text-color="blue-9" label="單元" />

                <q-chip dense color="blue-1" text-color="blue-9" label="知識卡" />

                <q-chip dense color="blue-1" text-color="blue-9" label="範例" />
              </div>
            </div>
          </div>

          <q-separator />

          <!-- =====================
           Step 4
           Upload
      ====================== -->
          <div class="course-material-panel__import-step">
            <div class="course-material-panel__import-step-title">
              <span class="course-material-panel__import-step-number"> 4 </span>

              上傳 Excel
            </div>

            <div class="course-material-panel__import-step-description">
              完成教材內容後，請選擇 .xlsx 檔案進行匯入。
            </div>

            <q-file
              v-model="selectedFile"
              outlined
              clearable
              label="選擇 Excel 教材檔案 *"
              accept=".xlsx"
              :disable="props.importing"
            >
              <template #prepend>
                <q-icon name="upload_file" />
              </template>
            </q-file>
          </div>

          <!-- =====================
           Summary
      ====================== -->
          <q-banner
            v-if="topicName.trim() && selectedFile"
            rounded
            class="course-material-panel__import-summary"
          >
            <template #avatar>
              <q-icon name="info" color="blue" />
            </template>

            <div>
              這份 Excel 將匯入至主題：
              <strong>
                {{ topicName.trim() }}
              </strong>
            </div>
          </q-banner>
        </q-card-section>

        <q-separator />

        <!-- =====================
         Actions
    ====================== -->
        <q-card-actions align="right" class="course-material-panel__import-actions">
          <q-btn flat label="取消" :disable="props.importing" @click="closeImportDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="upload"
            label="匯入教材"
            :loading="props.importing"
            :disable="!topicName.trim() || selectedFile === null"
            @click="submitImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { MaterialDraft, PublishedTopic } from '../../../types/material';

const props = defineProps<{
  drafts: MaterialDraft[];

  publishedTopics: PublishedTopic[];

  loading: boolean;

  importing: boolean;

  downloadingTemplate: boolean;

  creatingDraft: boolean;

  publishingDraftId: number | null;
}>();

/*
 * =========================
 * Draft
 * =========================
 */
const editableDrafts = computed(() => {
  return props.drafts.filter((draft) => draft.status === 'draft');
});

const emit = defineEmits<{
  'download-template': [];

  import: [topic: string, file: File];

  view: [draft: MaterialDraft];

  edit: [draft: MaterialDraft];

  publish: [draft: MaterialDraft];

  'delete-draft-topic': [draftId: number, nodeId: string, topicName: string];

  'delete-published-topic': [topicId: number, topicName: string];

  'view-published': [topic: PublishedTopic];

  'edit-published': [topic: PublishedTopic];

  'create-draft': [];
}>();

const importDialog = ref(false);

const topicName = ref('');

const selectedFile = ref<File | null>(null);

/*
 * =========================
 * Delete Topic Dialog
 * =========================
 */
const deleteTopicDialog = ref(false);

const deleteTopicMode = ref<'published' | 'draft' | null>(null);

const deleteTopicDraft = ref<MaterialDraft | null>(null);

// function openDraftDeleteDialog(draft: MaterialDraft) {
//   deleteTopicMode.value = 'draft';

//   deleteTopicDraft.value = draft;

//   deleteTopicDialog.value = true;
// }

function closeDeleteTopicDialog() {
  deleteTopicDialog.value = false;

  deleteTopicMode.value = null;

  deleteTopicDraft.value = null;
}

const editableTopics = computed(() => {
  return props.drafts
    .filter((draft) => draft.status === 'draft')
    .flatMap((draft) =>
      draft.topics.map((topic) => ({
        draft,
        topic,
      })),
    );
});

/*
 * =========================
 * Open Import
 * =========================
 */
function openImportDialog() {
  /*
   * 每次重新開啟
   * 都清除上一次輸入內容
   */
  topicName.value = '';

  selectedFile.value = null;

  importDialog.value = true;
}

/*
 * =========================
 * Submit
 * =========================
 */
function submitImport() {
  const topic = topicName.value.trim();

  /*
   * 沒填主題
   * 不允許匯入
   */
  if (!topic) {
    return;
  }

  /*
   * 沒有 Excel
   * 不允許匯入
   */
  if (selectedFile.value === null) {
    return;
  }

  emit('import', topic, selectedFile.value);
}

/*
 * =========================
 * Close
 * =========================
 */
function closeImportDialog() {
  topicName.value = '';

  selectedFile.value = null;

  importDialog.value = false;
}

// function getChapterCount(draft: MaterialDraft): number {
//   return draft.topics.reduce((total, topic) => {
//     return total + topic.chapters.length;
//   }, 0);
// }

defineExpose({
  closeImportDialog,

  closeDeleteTopicDialog,
});

/*
 * =========================
 * Status
 * =========================
 */
// function statusLabel(status: MaterialDraftStatus) {
//   switch (status) {
//     case 'draft':
//       return '草稿';

//     case 'published':
//       return '已發布';

//     case 'archived':
//       return '已封存';
//   }
// }

// function statusColor(status: MaterialDraftStatus) {
//   switch (status) {
//     case 'draft':
//       return 'orange';

//     case 'published':
//       return 'positive';

//     case 'archived':
//       return 'grey';
//   }
// }
</script>
