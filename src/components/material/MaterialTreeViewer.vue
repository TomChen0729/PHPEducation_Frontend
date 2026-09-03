<template>
  <div class="material-tree-viewer" :class="themeClass">
    <div v-if="!tree" class="material-tree-viewer__empty">
      <q-icon name="menu_book" size="44px" class="material-tree-viewer__empty-icon" />

      <div>目前沒有教材內容</div>
    </div>

    <template v-else>
      <div v-if="sortedChapters.length === 0" class="material-tree-viewer__empty">
        <q-icon name="menu_book" size="44px" class="material-tree-viewer__empty-icon" />

        <div>此教材目前沒有章節</div>
      </div>

      <div v-else class="material-tree-viewer__chapters">
        <q-expansion-item
          v-for="(chapter, chapterIndex) in sortedChapters"
          :key="chapter.id"
          default-opened
          expand-separator
          class="material-tree-viewer__chapter"
          header-class="material-tree-viewer__chapter-header"
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
          </template>

          <div class="material-tree-viewer__units">
            <q-expansion-item
              v-for="(unit, unitIndex) in sortedUnits(chapter)"
              :key="unit.id"
              default-opened
              expand-separator
              class="material-tree-viewer__unit"
              header-class="material-tree-viewer__unit-header"
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
                  </q-item-label>

                  <q-item-label caption>
                    {{ unit.knowledge_cards.length }}
                    張知識卡
                  </q-item-label>
                </q-item-section>
              </template>

              <div class="material-tree-viewer__cards">
                <q-card
                  v-for="(card, cardIndex) in sortedCards(unit)"
                  :key="card.id"
                  flat
                  bordered
                  class="material-tree-viewer__card"
                >
                  <q-card-section>
                    <div class="material-tree-viewer__card-title">
                      <q-icon name="description" class="material-tree-viewer__card-icon" />

                      <span>
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
                      </span>

                      <q-badge v-if="card.type" outline color="blue-grey-7" :label="card.type" />
                    </div>

                    <div class="material-tree-viewer__card-block">
                      <div class="material-tree-viewer__card-label">內容</div>

                      <div class="material-tree-viewer__card-content">
                        <RichContentViewer :content="card.content" />
                      </div>
                    </div>

                    <div v-if="card.example" class="material-tree-viewer__card-example">
                      <div class="material-tree-viewer__card-label">範例</div>

                      <CodeExampleViewer :code="card.example" :theme="theme" />
                    </div>
                  </q-card-section>
                </q-card>

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

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialUnitNode,
} from '../../types/material';

import CodeExampleViewer from '../common/CodeExampleViewer.vue';

import RichContentViewer from '../common/RichContentViewer.vue';

const props = withDefaults(
  defineProps<{
    tree: MaterialCourseTree | null;

    theme?: 'teacher' | 'student';
  }>(),
  {
    theme: 'teacher',
  },
);

const sortedChapters = computed(() => {
  return [...(props.tree?.chapters ?? [])].sort((a, b) => a.sort_order - b.sort_order);
});

const themeClass = computed(() =>
  props.theme === 'student' ? 'material-tree-viewer--student' : 'material-tree-viewer--teacher',
);

const theme = computed(() => props.theme);

function sortedUnits(chapter: MaterialChapterNode) {
  return [...chapter.units].sort((a, b) => a.sort_order - b.sort_order);
}

function sortedCards(unit: MaterialUnitNode) {
  return [...unit.knowledge_cards].sort((a, b) => a.sort_order - b.sort_order);
}

function displayOrder(
  sortOrder: number,

  index: number,
) {
  return sortOrder > 0 ? sortOrder : index + 1;
}

function getChapterNumber(
  chapterOrder: number,

  chapterIndex: number,
) {
  return displayOrder(chapterOrder, chapterIndex);
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
