<template>
  <div class="material-tree-viewer">
    <!-- =========================
         No Topic
    ========================== -->
    <div v-if="!currentTopic" class="material-tree-viewer__empty">
      <q-icon name="menu_book" size="44px" color="grey-5" />

      <div>目前沒有教材內容</div>
    </div>

    <template v-else>
      <!-- =========================
           Topic Info
           只顯示名稱，不做下拉
      ========================== -->
      <!-- <div class="material-tree-viewer__topic-info">
        <div class="material-tree-viewer__topic-name">主題：{{ currentTopic.name }}</div>

        <div class="material-tree-viewer__topic-count">
          {{ currentTopic.chapters.length }} 個章節
        </div>
      </div> -->

      <!-- =========================
           No Chapter
      ========================== -->
      <div v-if="currentTopic.chapters.length === 0" class="material-tree-viewer__empty">
        <q-icon name="menu_book" size="44px" color="grey-5" />

        <div>此主題目前沒有章節</div>
      </div>

      <!-- =========================
           Chapters
      ========================== -->
      <div v-else class="material-tree-viewer__chapters material-tree-viewer__chapters--root">
        <q-expansion-item
          v-for="chapter in currentTopic.chapters"
          :key="chapter.id"
          default-opened
          expand-separator
          :label="chapter.name"
          :caption="`${chapter.units.length} 個單元`"
          icon="menu_book"
          class="material-tree-viewer__chapter"
          header-class="material-tree-viewer__chapter-header"
        >
          <!-- =========================
               Units
          ========================== -->
          <div class="material-tree-viewer__units">
            <q-expansion-item
              v-for="unit in chapter.units"
              :key="unit.id"
              default-opened
              expand-separator
              :label="unit.name"
              :caption="`${unit.knowledge_cards.length} 張知識卡`"
              icon="view_list"
              class="material-tree-viewer__unit"
              header-class="material-tree-viewer__unit-header"
            >
              <!-- =========================
                   Knowledge Cards
              ========================== -->
              <div class="material-tree-viewer__cards">
                <q-card
                  v-for="card in unit.knowledge_cards"
                  :key="card.id"
                  flat
                  bordered
                  class="material-tree-viewer__card"
                >
                  <q-card-section>
                    <!-- Card Title -->
                    <div class="material-tree-viewer__card-title">
                      <q-icon name="description" color="blue-grey-6" />

                      <span>
                        {{ card.title }}
                      </span>
                    </div>

                    <!-- Content -->
                    <div class="material-tree-viewer__card-block">
                      <div class="material-tree-viewer__card-label">內容</div>

                      <div class="material-tree-viewer__card-content">
                        {{ card.content }}
                      </div>
                    </div>

                    <!-- Example -->
                    <div v-if="card.example" class="material-tree-viewer__card-example">
                      <div class="material-tree-viewer__card-label">範例</div>

                      <CodeExampleViewer :code="card.example" />
                    </div>
                  </q-card-section>
                </q-card>

                <!-- No Knowledge Card -->
                <div
                  v-if="unit.knowledge_cards.length === 0"
                  class="material-tree-viewer__level-empty"
                >
                  此單元尚無知識卡
                </div>
              </div>
            </q-expansion-item>

            <!-- No Unit -->
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

import type { MaterialDraft } from '../../../types/material';
import CodeExampleViewer from '../../common/CodeExampleViewer.vue';

const props = defineProps<{
  draft: MaterialDraft;
}>();

/*
 * =========================
 * Current Topic
 * =========================
 *
 * 現在一份教材只對應一個 Topic。
 *
 * 查看教材時不再把 Topic
 * 當成 Expansion Item 顯示。
 */
const currentTopic = computed(() => {
  return props.draft.topics[0] ?? null;
});
</script>
