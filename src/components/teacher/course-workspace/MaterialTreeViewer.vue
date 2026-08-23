<template>
  <div class="material-tree-viewer">
    <!-- Empty -->
    <div v-if="draft.topics.length === 0" class="material-tree-viewer__empty">
      <q-icon name="menu_book" size="44px" color="grey-5" />

      <div>目前沒有教材內容</div>
    </div>

    <!-- Topics -->
    <div v-else class="material-tree-viewer__topics">
      <q-expansion-item
        v-for="topic in draft.topics"
        :key="topic.id"
        default-opened
        expand-separator
        :label="topic.name"
        :caption="`${topic.chapters.length} 個章節`"
        icon="topic"
        class="material-tree-viewer__topic"
        header-class="
          material-tree-viewer__topic-header
        "
      >
        <!-- Chapters -->
        <div class="material-tree-viewer__chapters">
          <q-expansion-item
            v-for="chapter in topic.chapters"
            :key="chapter.id"
            expand-separator
            :label="chapter.name"
            :caption="`${chapter.units.length} 個單元`"
            icon="menu_book"
            class="material-tree-viewer__chapter"
            header-class="
              material-tree-viewer__chapter-header
            "
          >
            <!-- Units -->
            <div class="material-tree-viewer__units">
              <q-expansion-item
                v-for="unit in chapter.units"
                :key="unit.id"
                expand-separator
                :label="unit.name"
                :caption="`${unit.knowledge_cards.length} 張知識卡`"
                icon="view_list"
                class="material-tree-viewer__unit"
                header-class="
                  material-tree-viewer__unit-header
                "
              >
                <!-- Cards -->
                <div class="material-tree-viewer__cards">
                  <q-card
                    v-for="card in unit.knowledge_cards"
                    :key="card.id"
                    flat
                    bordered
                    class="material-tree-viewer__card"
                  >
                    <q-card-section>
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

                        <div>
                          {{ card.example }}
                        </div>
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

          <div v-if="topic.chapters.length === 0" class="material-tree-viewer__level-empty">
            此主題尚無章節
          </div>
        </div>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaterialDraft } from '../../../types/material';

defineProps<{
  draft: MaterialDraft;
}>();
</script>
