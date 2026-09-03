<template>
  <div class="material-tree-viewer" :class="themeClass">
    <!-- =====================================================
         Empty Topic
    ====================================================== -->
    <div v-if="!currentTopic" class="material-tree-viewer__empty">
      <q-icon name="menu_book" size="44px" class="material-tree-viewer__empty-icon" />

      <div>目前沒有教材內容</div>
    </div>

    <!-- =====================================================
         Topic
    ====================================================== -->
    <template v-else>
      <!-- No Chapter -->
      <div v-if="currentTopic.chapters.length === 0" class="material-tree-viewer__empty">
        <q-icon name="menu_book" size="44px" class="material-tree-viewer__empty-icon" />

        <div>此教材目前沒有章節</div>
      </div>

      <!-- ===================================================
           Chapters
      ==================================================== -->
      <div v-else class="material-tree-viewer__chapters">
        <q-expansion-item
          v-for="chapter in currentTopic.chapters"
          :key="chapter.id"
          default-opened
          expand-separator
          class="material-tree-viewer__chapter"
          header-class="material-tree-viewer__chapter-header"
        >
          <!-- Chapter Header -->
          <template #header>
            <q-item-section avatar>
              <q-icon name="menu_book" class="material-tree-viewer__chapter-icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="material-tree-viewer__chapter-title">
                {{ chapter.name }}
              </q-item-label>

              <q-item-label caption>
                {{ chapter.units.length }}
                個單元
              </q-item-label>
            </q-item-section>
          </template>

          <!-- ===============================================
               Units
          ================================================ -->
          <div class="material-tree-viewer__units">
            <q-expansion-item
              v-for="unit in chapter.units"
              :key="unit.id"
              default-opened
              expand-separator
              class="material-tree-viewer__unit"
              header-class="material-tree-viewer__unit-header"
            >
              <!-- Unit Header -->
              <template #header>
                <q-item-section avatar>
                  <q-icon name="view_list" class="material-tree-viewer__unit-icon" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="material-tree-viewer__unit-title">
                    {{ unit.name }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ unit.knowledge_cards.length }}
                    張知識卡
                  </q-item-label>
                </q-item-section>
              </template>

              <!-- ===========================================
                   Knowledge Cards
              ============================================ -->
              <div class="material-tree-viewer__cards">
                <q-card
                  v-for="card in unit.knowledge_cards"
                  :key="card.id"
                  flat
                  bordered
                  class="material-tree-viewer__card"
                >
                  <q-card-section>
                    <!-- =====================================
                         Card Title
                    ====================================== -->
                    <div class="material-tree-viewer__card-title">
                      <q-icon name="description" class="material-tree-viewer__card-icon" />

                      <span>
                        {{ card.title }}
                      </span>
                    </div>

                    <!-- =====================================
                         Tiptap / Rich Content
                    ====================================== -->
                    <div class="material-tree-viewer__card-block">
                      <div class="material-tree-viewer__card-label">內容</div>

                      <div class="material-tree-viewer__card-content">
                        <RichContentViewer :content="card.content" />
                      </div>
                    </div>

                    <!-- =====================================
                         Code Example
                    ====================================== -->
                    <div v-if="card.example" class="material-tree-viewer__card-example">
                      <div class="material-tree-viewer__card-label">範例</div>

                      <CodeExampleViewer :code="card.example" :theme="theme" />
                    </div>
                  </q-card-section>
                </q-card>

                <!-- No Card -->
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

import type { MaterialTopicNode } from '../../types/material';

import CodeExampleViewer from '../common/CodeExampleViewer.vue';

import RichContentViewer from '../common/RichContentViewer.vue';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    topic: MaterialTopicNode | null;

    theme?: 'teacher' | 'student';
  }>(),
  {
    theme: 'teacher',
  },
);

/*
 * ============================================================
 * Topic
 * ============================================================
 */

const currentTopic = computed(() => props.topic);

/*
 * ============================================================
 * Theme
 * ============================================================
 */

const themeClass = computed(() =>
  props.theme === 'student' ? 'material-tree-viewer--student' : 'material-tree-viewer--teacher',
);

/*
 * CodeExampleViewer 也直接使用：
 *
 * teacher
 * student
 *
 * 所以不需要另外做轉換。
 */

const theme = computed(() => props.theme);
</script>
