<template>
  <div class="material-draft-editor">
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <div class="material-draft-editor__toolbar">
      <q-btn
        color="blue"
        icon="add"
        label="新增章節"
        unelevated
        :disable="editing || !currentTopic"
        @click="openAddChapterForCurrentTopic"
      />
    </div>

    <div v-if="!currentTopic" class="material-draft-editor__empty">找不到主題資料</div>

    <div v-else-if="currentTopic.chapters.length === 0" class="material-draft-editor__empty">
      <q-icon name="menu_book" size="42px" color="grey-5" />
      <div>此主題目前沒有章節</div>
      <div class="text-caption text-grey-6">請點擊「新增章節」開始建立教材內容</div>
    </div>

    <div v-else class="material-draft-editor__chapters material-draft-editor__chapters--root">
      <q-expansion-item
        v-for="chapter in currentTopic.chapters"
        :key="chapter.id"
        default-opened
        class="material-draft-editor__chapter"
        header-class="material-draft-editor__chapter-header"
      >
        <template #header>
          <q-item-section avatar>
            <q-icon name="menu_book" color="blue-grey-7" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ chapter.name }}</q-item-label>
            <q-item-label caption> {{ chapter.units.length }} 個單元 </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="material-draft-editor__editBtn row q-gutter-xs">
              <q-btn
                flat
                dense
                round
                icon="add"
                color="blue"
                :disable="editing"
                @click.stop="openAddUnit(chapter.id)"
              >
                <q-tooltip>新增單元</q-tooltip>
              </q-btn>

              <q-btn
                flat
                dense
                round
                icon="edit"
                color="blue"
                :disable="editing"
                @click.stop="openEditChapter(chapter)"
              >
                <q-tooltip>修改章節</q-tooltip>
              </q-btn>

              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                :disable="editing"
                @click.stop="requestDelete('chapter', chapter.id, chapter.name)"
              >
                <q-tooltip>刪除章節</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </template>

        <div class="material-draft-editor__units">
          <q-expansion-item
            v-for="unit in chapter.units"
            :key="unit.id"
            default-opened
            class="material-draft-editor__unit"
            header-class="material-draft-editor__unit-header"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="view_list" color="grey-7" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ unit.name }}</q-item-label>
                <q-item-label caption> {{ unit.knowledge_cards.length }} 張知識卡 </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="material-draft-editor__editBtn row q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    color="blue"
                    :disable="editing"
                    @click.stop="openAddCard(unit.id)"
                  >
                    <q-tooltip>新增知識卡</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    color="blue"
                    :disable="editing"
                    @click.stop="openEditUnit(unit)"
                  >
                    <q-tooltip>修改單元</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    :disable="editing"
                    @click.stop="requestDelete('unit', unit.id, unit.name)"
                  >
                    <q-tooltip>刪除單元</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </template>

            <div class="material-draft-editor__cards">
              <q-card
                v-for="card in unit.knowledge_cards"
                :key="card.id"
                flat
                bordered
                class="material-draft-editor__card"
              >
                <q-card-section>
                  <div class="material-draft-editor__card-header">
                    <strong>{{ card.title }}</strong>

                    <div class="material-draft-editor__editBtn">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        color="blue"
                        :disable="editing"
                        @click="openEditCard(card)"
                      >
                        <q-tooltip>修改知識卡</q-tooltip>
                      </q-btn>

                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        :disable="editing"
                        @click="requestDelete('card', card.id, card.title)"
                      >
                        <q-tooltip>刪除知識卡</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <div class="material-draft-editor__card-section">
                    <div class="material-draft-editor__card-label">內容</div>
                    <div class="material-draft-editor__card-content">
                      {{ card.content }}
                    </div>
                  </div>

                  <div v-if="card.example" class="material-draft-editor__card-example">
                    <div class="material-draft-editor__card-label">範例</div>
                    <div>{{ card.example }}</div>
                  </div>
                </q-card-section>
              </q-card>

              <div
                v-if="unit.knowledge_cards.length === 0"
                class="material-draft-editor__level-empty"
              >
                此單元尚無知識卡
              </div>
            </div>
          </q-expansion-item>

          <div v-if="chapter.units.length === 0" class="material-draft-editor__level-empty">
            此章節尚無單元
          </div>
        </div>
      </q-expansion-item>
    </div>

    <q-dialog v-model="nameDialog.open" persistent>
      <q-card class="material-draft-editor__dialog">
        <q-card-section>
          <div class="text-h6">{{ nameDialog.title }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="nameDialog.name"
            outlined
            autofocus
            label="名稱"
            :disable="editing"
            @keyup.enter="submitNameDialog"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="editing" @click="nameDialog.open = false" />

          <q-btn
            unelevated
            color="blue"
            label="儲存"
            :loading="editing"
            :disable="!nameDialog.name.trim()"
            @click="submitNameDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cardDialog.open" persistent>
      <q-card class="material-draft-editor__card-dialog">
        <q-card-section>
          <div class="text-h6">{{ cardDialog.title }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="material-draft-editor__card-form">
          <q-input v-model="cardDialog.cardTitle" outlined label="知識卡標題" :disable="editing" />

          <q-input
            v-model="cardDialog.content"
            outlined
            type="textarea"
            label="知識卡內容"
            :disable="editing"
          />

          <q-input
            v-model="cardDialog.example"
            outlined
            type="textarea"
            label="範例（選填）"
            hint="可填入程式碼、操作範例或說明範例"
            :disable="editing"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="editing" @click="cardDialog.open = false" />

          <q-btn
            unelevated
            color="blue"
            label="儲存"
            :loading="editing"
            :disable="!cardDialog.cardTitle.trim() || !cardDialog.content.trim()"
            @click="submitCardDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { Dialog } from 'quasar';

import type {
  MaterialChapterNode,
  MaterialDraft,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../../types/material';

type NameNodeType = 'chapter' | 'unit';

type NameDialogMode = 'add' | 'edit';

type DeleteNodeType = 'chapter' | 'unit' | 'card';

interface NameDialogState {
  open: boolean;
  mode: NameDialogMode;
  type: NameNodeType;
  title: string;
  nodeId: string | null;
  parentId: string | null;
  name: string;
}

interface CardDialogState {
  open: boolean;
  mode: NameDialogMode;
  title: string;
  nodeId: string | null;
  unitId: string | null;
  cardTitle: string;
  content: string;
  example: string;
}

const props = defineProps<{
  draft: MaterialDraft;

  editing: boolean;

  errorMessage: string;

  topicName?: string | null;
}>();

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

const currentTopic = computed(() => {
  if (props.topicName) {
    return props.draft.topics.find((topic) => topic.name === props.topicName) ?? null;
  }

  return props.draft.topics[0] ?? null;
});

const nameDialog = reactive<NameDialogState>({
  open: false,
  mode: 'add',
  type: 'chapter',
  title: '',
  nodeId: null,
  parentId: null,
  name: '',
});

const cardDialog = reactive<CardDialogState>({
  open: false,
  mode: 'add',
  title: '',
  nodeId: null,
  unitId: null,
  cardTitle: '',
  content: '',
  example: '',
});

function openAddChapterForCurrentTopic() {
  if (!currentTopic.value) {
    return;
  }

  openAddChapter(currentTopic.value.id);
}

function openAddChapter(topicId: string) {
  openNameDialog('add', 'chapter', '新增章節', null, topicId);
}

function openEditChapter(chapter: MaterialChapterNode) {
  openNameDialog('edit', 'chapter', '修改章節', chapter.id, null, chapter.name);
}

function openAddUnit(chapterId: string) {
  openNameDialog('add', 'unit', '新增單元', null, chapterId);
}

function openEditUnit(unit: MaterialUnitNode) {
  openNameDialog('edit', 'unit', '修改單元', unit.id, null, unit.name);
}

function openNameDialog(
  mode: NameDialogMode,
  type: NameNodeType,
  title: string,
  nodeId: string | null = null,
  parentId: string | null = null,
  name = '',
) {
  nameDialog.mode = mode;
  nameDialog.type = type;
  nameDialog.title = title;
  nameDialog.nodeId = nodeId;
  nameDialog.parentId = parentId;
  nameDialog.name = name;
  nameDialog.open = true;
}

function submitNameDialog() {
  const name = nameDialog.name.trim();

  if (!name) {
    return;
  }

  if (nameDialog.type === 'chapter') {
    if (nameDialog.mode === 'add' && nameDialog.parentId) {
      emit('add-chapter', nameDialog.parentId, name);

      return;
    }

    if (nameDialog.mode === 'edit' && nameDialog.nodeId) {
      emit('update-chapter', nameDialog.nodeId, name);
    }

    return;
  }

  if (nameDialog.type === 'unit') {
    if (nameDialog.mode === 'add' && nameDialog.parentId) {
      emit('add-unit', nameDialog.parentId, name);

      return;
    }

    if (nameDialog.mode === 'edit' && nameDialog.nodeId) {
      emit('update-unit', nameDialog.nodeId, name);
    }
  }
}

function openAddCard(unitId: string) {
  cardDialog.mode = 'add';
  cardDialog.title = '新增知識卡';
  cardDialog.unitId = unitId;
  cardDialog.nodeId = null;
  cardDialog.cardTitle = '';
  cardDialog.content = '';
  cardDialog.example = '';
  cardDialog.open = true;
}

function openEditCard(card: MaterialKnowledgeCardNode) {
  cardDialog.mode = 'edit';
  cardDialog.title = '修改知識卡';
  cardDialog.nodeId = card.id;
  cardDialog.unitId = null;
  cardDialog.cardTitle = card.title;
  cardDialog.content = card.content;
  cardDialog.example = card.example ?? '';
  cardDialog.open = true;
}

function submitCardDialog() {
  const title = cardDialog.cardTitle.trim();
  const content = cardDialog.content.trim();
  const example = cardDialog.example.trim();

  if (!title || !content) {
    return;
  }

  const data = {
    title,
    content,
    example: example || null,
  };

  if (cardDialog.mode === 'add' && cardDialog.unitId) {
    emit('add-card', cardDialog.unitId, data);

    return;
  }

  if (cardDialog.mode === 'edit' && cardDialog.nodeId) {
    emit('update-card', cardDialog.nodeId, data);
  }
}

function requestDelete(type: DeleteNodeType, nodeId: string, name: string) {
  Dialog.create({
    title: '確認刪除',
    message: `確定要刪除「${name}」嗎？`,
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

function closeEditDialogs() {
  nameDialog.open = false;
  cardDialog.open = false;
}

defineExpose({
  closeEditDialogs,
});
</script>
