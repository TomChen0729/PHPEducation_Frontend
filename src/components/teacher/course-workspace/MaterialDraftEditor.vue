<template>
  <div class="material-draft-editor">
    <!-- Error -->
    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <!-- Toolbar -->
    <div class="material-draft-editor__toolbar">
      <div>
        <div class="text-h6">
          {{ draft.name }}
        </div>

        <div class="text-caption text-grey-7">教材草稿編輯</div>
      </div>

      <q-btn color="blue" icon="add" label="新增主題" unelevated @click="openAddTopic" />
    </div>

    <!-- Topic -->
    <div v-if="draft.topics.length === 0" class="material-draft-editor__empty">
      目前沒有主題，請先新增主題
    </div>

    <div v-else class="material-draft-editor__topics">
      <q-expansion-item
        v-for="topic in draft.topics"
        :key="topic.id"
        default-opened
        icon="topic"
        :label="topic.name"
        header-class="material-draft-editor__topic-header"
        class="material-draft-editor__topic"
      >
        <template #header>
          <q-item-section avatar>
            <q-icon name="topic" color="blue" />
          </q-item-section>

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
            <div class="row q-gutter-xs">
              <q-btn
                flat
                dense
                round
                icon="add"
                color="blue"
                @click.stop="openAddChapter(topic.id)"
              >
                <q-tooltip> 新增章節 </q-tooltip>
              </q-btn>

              <q-btn flat dense round icon="edit" color="blue" @click.stop="openEditTopic(topic)" />

              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click.stop="requestDelete('topic', topic.id, topic.name)"
              />
            </div>
          </q-item-section>
        </template>

        <!-- Chapter -->
        <div class="material-draft-editor__chapters">
          <q-expansion-item
            v-for="chapter in topic.chapters"
            :key="chapter.id"
            icon="menu_book"
            :label="chapter.name"
            class="material-draft-editor__chapter"
            header-class="material-draft-editor__chapter-header"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="menu_book" color="blue-grey-7" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ chapter.name }}
                </q-item-label>

                <q-item-label caption>
                  {{ chapter.units.length }}
                  個單元
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    color="blue"
                    @click.stop="openAddUnit(chapter.id)"
                  />

                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    color="blue"
                    @click.stop="openEditChapter(chapter)"
                  />

                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click.stop="requestDelete('chapter', chapter.id, chapter.name)"
                  />
                </div>
              </q-item-section>
            </template>

            <!-- Unit -->
            <div class="material-draft-editor__units">
              <q-expansion-item
                v-for="unit in chapter.units"
                :key="unit.id"
                icon="view_list"
                :label="unit.name"
                class="material-draft-editor__unit"
                header-class="material-draft-editor__unit-header"
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon name="view_list" color="grey-7" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>
                      {{ unit.name }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ unit.knowledge_cards.length }}
                      張知識卡
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="add"
                        color="blue"
                        @click.stop="openAddCard(unit.id)"
                      />

                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        color="blue"
                        @click.stop="openEditUnit(unit)"
                      />

                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        @click.stop="requestDelete('unit', unit.id, unit.name)"
                      />
                    </div>
                  </q-item-section>
                </template>

                <!-- Knowledge Card -->
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
                        <strong>
                          {{ card.title }}
                        </strong>

                        <div>
                          <q-btn
                            flat
                            dense
                            round
                            icon="edit"
                            color="blue"
                            @click="openEditCard(card)"
                          />

                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            color="negative"
                            @click="requestDelete('card', card.id, card.title)"
                          />
                        </div>
                      </div>

                      <div class="material-draft-editor__card-content">
                        {{ card.content }}
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

          <div v-if="topic.chapters.length === 0" class="material-draft-editor__level-empty">
            此主題尚無章節
          </div>
        </div>
      </q-expansion-item>
    </div>

    <!-- =========================
         Topic / Chapter / Unit Dialog
    ========================== -->
    <q-dialog v-model="nameDialog.open" persistent>
      <q-card class="material-draft-editor__dialog">
        <q-card-section>
          <div class="text-h6">
            {{ nameDialog.title }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="nameDialog.name"
            outlined
            autofocus
            label="名稱"
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
            @click="submitNameDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =========================
         Knowledge Card Dialog
    ========================== -->
    <q-dialog v-model="cardDialog.open" persistent>
      <q-card class="material-draft-editor__card-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ cardDialog.title }}
          </div>
        </q-card-section>

        <q-card-section class="material-draft-editor__card-form">
          <q-input v-model="cardDialog.cardTitle" outlined label="知識卡標題" />

          <q-input v-model="cardDialog.content" outlined type="textarea" label="知識卡內容" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="editing" @click="cardDialog.open = false" />

          <q-btn
            unelevated
            color="blue"
            label="儲存"
            :loading="editing"
            @click="submitCardDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { Dialog } from 'quasar';

import type {
  MaterialChapterNode,
  MaterialDraft,
  MaterialKnowledgeCardNode,
  MaterialTopicNode,
  MaterialUnitNode,
} from '../../../types/material';

type NameNodeType = 'topic' | 'chapter' | 'unit';

type DeleteNodeType = NameNodeType | 'card';

const props = defineProps<{
  draft: MaterialDraft;

  editing: boolean;

  errorMessage: string;
}>();

const emit = defineEmits<{
  'add-topic': [name: string];

  'update-topic': [nodeId: string, name: string];

  'delete-topic': [nodeId: string];

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
    },
  ];

  'update-card': [
    nodeId: string,
    data: {
      title: string;
      content: string;
    },
  ];

  'delete-card': [nodeId: string];
}>();

const nameDialog = reactive({
  open: false,

  mode: 'add' as 'add' | 'edit',

  type: 'topic' as NameNodeType,

  title: '',

  nodeId: null as string | null,

  parentId: null as string | null,

  name: '',
});

const cardDialog = reactive({
  open: false,

  mode: 'add' as 'add' | 'edit',

  title: '',

  nodeId: null as string | null,

  unitId: null as string | null,

  cardTitle: '',

  content: '',
});

/*
 * Topic
 */
function openAddTopic() {
  openNameDialog('add', 'topic', '新增主題');
}

function openEditTopic(topic: MaterialTopicNode) {
  openNameDialog('edit', 'topic', '修改主題', topic.id, null, topic.name);
}

/*
 * Chapter
 */
function openAddChapter(topicId: string) {
  openNameDialog('add', 'chapter', '新增章節', null, topicId);
}

function openEditChapter(chapter: MaterialChapterNode) {
  openNameDialog('edit', 'chapter', '修改章節', chapter.id, null, chapter.name);
}

/*
 * Unit
 */
function openAddUnit(chapterId: string) {
  openNameDialog('add', 'unit', '新增單元', null, chapterId);
}

function openEditUnit(unit: MaterialUnitNode) {
  openNameDialog('edit', 'unit', '修改單元', unit.id, null, unit.name);
}

function openNameDialog(
  mode: 'add' | 'edit',

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

  if (nameDialog.type === 'topic') {
    if (nameDialog.mode === 'add') {
      emit('add-topic', name);
    } else if (nameDialog.nodeId) {
      emit('update-topic', nameDialog.nodeId, name);
    }
  }

  if (nameDialog.type === 'chapter') {
    if (nameDialog.mode === 'add' && nameDialog.parentId) {
      emit('add-chapter', nameDialog.parentId, name);
    } else if (nameDialog.nodeId) {
      emit('update-chapter', nameDialog.nodeId, name);
    }
  }

  if (nameDialog.type === 'unit') {
    if (nameDialog.mode === 'add' && nameDialog.parentId) {
      emit('add-unit', nameDialog.parentId, name);
    } else if (nameDialog.nodeId) {
      emit('update-unit', nameDialog.nodeId, name);
    }
  }
}

/*
 * Knowledge Card
 */
function openAddCard(unitId: string) {
  cardDialog.mode = 'add';

  cardDialog.title = '新增知識卡';

  cardDialog.unitId = unitId;

  cardDialog.nodeId = null;

  cardDialog.cardTitle = '';

  cardDialog.content = '';

  cardDialog.open = true;
}

function openEditCard(card: MaterialKnowledgeCardNode) {
  cardDialog.mode = 'edit';

  cardDialog.title = '修改知識卡';

  cardDialog.nodeId = card.id;

  cardDialog.unitId = null;

  cardDialog.cardTitle = card.title;

  cardDialog.content = card.content;

  cardDialog.open = true;
}

function submitCardDialog() {
  const title = cardDialog.cardTitle.trim();

  const content = cardDialog.content.trim();

  if (!title || !content) {
    return;
  }

  if (cardDialog.mode === 'add' && cardDialog.unitId) {
    emit('add-card', cardDialog.unitId, {
      title,
      content,
    });

    return;
  }

  if (cardDialog.mode === 'edit' && cardDialog.nodeId) {
    emit('update-card', cardDialog.nodeId, {
      title,
      content,
    });
  }
}

/*
 * Delete
 */
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
  }).onOk(() => {
    switch (type) {
      case 'topic':
        emit('delete-topic', nodeId);

        break;

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
 * Parent 成功後關閉
 */
function closeEditDialogs() {
  nameDialog.open = false;

  cardDialog.open = false;
}

defineExpose({
  closeEditDialogs,
});
</script>
