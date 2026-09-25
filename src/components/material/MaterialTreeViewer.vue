<template>
  <div class="material-tree-viewer" :class="themeClass">
    <div v-if="!tree" class="material-tree-viewer__empty">
      <q-icon name="menu_book" size="44px" />

      <div>目前沒有教材內容</div>
    </div>

    <template v-else>
      <div v-if="editable" class="material-tree-viewer__toolbar">
        <div class="text-weight-bold">教材階層</div>

        <q-btn
          unelevated
          color="blue"
          icon="add"
          label="新增章節"
          no-caps
          @click="emit('create-chapter')"
        />
      </div>

      <div v-if="sortedChapters.length === 0" class="material-tree-viewer__empty">
        <q-icon name="menu_book" size="44px" />

        <div>此課程目前沒有章節</div>
      </div>

      <div v-else class="material-tree-viewer__chapters">
        <q-expansion-item
          v-for="(chapter, chapterIndex) in sortedChapters"
          :key="chapter.id"
          expand-separator
          class="material-tree-viewer__chapter"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon name="menu_book" class="material-tree-viewer__chapter-icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="material-tree-viewer__chapter-title">
                {{ getChapterNumber(chapter.sort_order, chapterIndex) }}

                {{ chapter.name }}
              </q-item-label>

              <q-item-label caption>
                {{ chapter.units.length }}
                個單元
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="editable" side>
              <div class="material-tree-viewer__actions">
                <q-btn
                  flat
                  dense
                  round
                  icon="add"
                  color="blue"
                  @click.stop="emit('create-unit', chapter)"
                >
                  <q-tooltip> 新增單元 </q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  color="blue-grey-7"
                  @click.stop="emit('edit-chapter', chapter)"
                >
                  <q-tooltip> 編輯章節 </q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="emit('delete-chapter', chapter)"
                >
                  <q-tooltip> 刪除章節 </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </template>

          <div class="material-tree-viewer__units">
            <q-expansion-item
              v-for="(unit, unitIndex) in sortedUnits(chapter)"
              :key="unit.id"
              class="material-tree-viewer__unit"
            >
              <template #header>
                <q-item-section avatar>
                  <q-icon name="view_list" class="material-tree-viewer__unit-icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="material-tree-viewer__unit-title">
                    {{
                      getUnitNumber(chapter.sort_order, chapterIndex, unit.sort_order, unitIndex)
                    }}

                    {{ unit.name }}

                    <q-badge
                      v-if="editable"
                      :color="unitStatus(unit) === 'published' ? 'positive' : 'grey-5'"
                      :text-color="unitStatus(unit) === 'published' ? 'white' : 'grey-8'"
                      :label="unitStatus(unit) === 'published' ? '開放中' : '草稿'"
                      class="material-tree-viewer__unit-status"
                    />
                  </q-item-label>

                  <q-item-label caption>
                    {{ unit.knowledge_cards.length }}
                    張知識卡
                  </q-item-label>
                </q-item-section>

                <q-item-section v-if="editable" side>
                  <div class="material-tree-viewer__actions">
                    <q-btn
                      outline
                      dense
                      no-caps
                      :color="unitStatus(unit) === 'published' ? 'blue-grey-6' : 'blue'"
                      :label="unitStatus(unit) === 'published' ? '設為草稿' : '開放給學生'"
                      :disable="actionsDisabled"
                      @click.stop="
                        emit(
                          'update-unit-status',
                          unit,
                          unitStatus(unit) === 'published' ? 'draft' : 'published',
                        )
                      "
                    />

                    <q-btn
                      flat
                      dense
                      round
                      icon="add"
                      color="blue"
                      :disable="actionsDisabled"
                      @click.stop="emit('create-card', chapter, unit)"
                    >
                      <q-tooltip> 新增知識卡 </q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="blue-grey-7"
                      :disable="actionsDisabled"
                      @click.stop="emit('edit-unit', chapter, unit)"
                    >
                      <q-tooltip> 編輯單元 </q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      :disable="actionsDisabled"
                      @click.stop="emit('delete-unit', unit)"
                    >
                      <q-tooltip> 刪除單元 </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </template>

              <div class="material-tree-viewer__cards">
                <q-expansion-item
                  v-for="(card, cardIndex) in sortedCards(unit)"
                  :key="`${unit.id}-${card.id}`"
                  expand-separator
                  class="material-tree-viewer__card"
                >
                  <template #header>
                    <q-item-section avatar>
                      <q-icon name="description" class="material-tree-viewer__card-icon" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label
                        class="material-tree-viewer__card-title material-tree-viewer__card-title--header"
                      >
                        {{
                          getCardNumber(
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

                      <q-item-label v-if="card.type" caption>
                        {{ card.type }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section v-if="editable" side>
                      <div class="material-tree-viewer__actions">
                        <q-btn
                          flat
                          dense
                          round
                          icon="edit"
                          color="blue"
                          :disable="actionsDisabled"
                          @click.stop="emit('edit-card', chapter, unit, card)"
                        >
                          <q-tooltip> 編輯知識卡 </q-tooltip>
                        </q-btn>

                        <q-btn
                          flat
                          dense
                          round
                          icon="delete"
                          color="negative"
                          :disable="actionsDisabled"
                          @click.stop="emit('delete-card', card)"
                        >
                          <q-tooltip> 刪除知識卡 </q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </template>

                  <div class="material-tree-viewer__card-body">
                    <div class="material-tree-viewer__card-block">
                      <div class="material-tree-viewer__card-label">內容</div>

                      <div class="material-tree-viewer__card-content">
                        <RichContentViewer :content="card.content" />
                      </div>
                    </div>

                    <div v-if="card.example" class="material-tree-viewer__card-example">
                      <div class="material-tree-viewer__card-label">程式範例</div>

                      <CodeExampleViewer :code="card.example" :theme="theme" />
                    </div>
                  </div>
                </q-expansion-item>

                <div
                  v-if="unit.knowledge_cards.length === 0"
                  class="material-tree-viewer__level-empty"
                >
                  此單元尚無知識卡
                </div>
              </div>
            </q-expansion-item>

            <div v-if="chapter.units.length === 0" class="material-tree-viewer__level-empty">
              此章節尚無單元
            </div>
          </div>
        </q-expansion-item>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import CodeExampleViewer from '../common/CodeExampleViewer.vue';

import RichContentViewer from '../common/RichContentViewer.vue';

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
  MaterialUnitStatus,
} from '../../types/material.js';

const props = withDefaults(
  defineProps<{
    tree: MaterialCourseTree | null;

    theme?: 'teacher' | 'student';

    editable?: boolean;

    actionsDisabled?: boolean;
  }>(),
  {
    theme: 'teacher',

    editable: false,

    actionsDisabled: false,
  },
);

const emit = defineEmits<{
  'create-chapter': [];

  'edit-chapter': [chapter: MaterialChapterNode];

  'delete-chapter': [chapter: MaterialChapterNode];

  'create-unit': [chapter: MaterialChapterNode];

  'edit-unit': [chapter: MaterialChapterNode, unit: MaterialUnitNode];

  'delete-unit': [unit: MaterialUnitNode];

  'update-unit-status': [unit: MaterialUnitNode, status: MaterialUnitStatus];

  'create-card': [chapter: MaterialChapterNode, unit: MaterialUnitNode];

  'edit-card': [
    chapter: MaterialChapterNode,

    unit: MaterialUnitNode,

    card: MaterialKnowledgeCardNode,
  ];

  'delete-card': [card: MaterialKnowledgeCardNode];
}>();

const theme = computed(() => props.theme);

const themeClass = computed(() =>
  props.theme === 'student' ? 'material-tree-viewer--student' : 'material-tree-viewer--teacher',
);

const sortedChapters = computed(() => {
  return [...(props.tree?.chapters ?? [])].sort((a, b) => a.sort_order - b.sort_order);
});

function sortedUnits(chapter: MaterialChapterNode) {
  return [...chapter.units].sort((a, b) => a.sort_order - b.sort_order);
}

function unitStatus(unit: MaterialUnitNode): MaterialUnitStatus {
  return unit.status === 'draft' ? 'draft' : 'published';
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

function getChapterNumber(
  order: number,

  index: number,
) {
  return displayOrder(order, index);
}

function getUnitNumber(
  chapterOrder: number,

  chapterIndex: number,

  unitOrder: number,

  unitIndex: number,
) {
  return [displayOrder(chapterOrder, chapterIndex), displayOrder(unitOrder, unitIndex)].join('.');
}

function getCardNumber(
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
</script>
