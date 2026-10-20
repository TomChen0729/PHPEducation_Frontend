<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleModelValueChange">
    <q-card class="knowledge-card-hint-dialog">
      <q-card-section class="knowledge-card-hint-dialog__header">
        <div class="knowledge-card-hint-dialog__header-main">
          <div class="knowledge-card-hint-dialog__icon-wrap">
            <q-icon name="lightbulb" size="28px" color="amber-8" />
          </div>

          <div>
            <div class="knowledge-card-hint-dialog__title">知識卡提示</div>
            <div class="knowledge-card-hint-dialog__subtitle">
              這裡會直接顯示此題關聯知識卡的完整教材內容；關閉後可繼續作答。
            </div>
          </div>
        </div>

        <q-btn flat round dense icon="close" color="grey-7" @click="closeDialog">
          <q-tooltip>關閉</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-separator />

      <template v-if="cards.length > 0">
        <q-tabs
          v-if="cards.length > 1"
          v-model="activeCardId"
          align="left"
          dense
          no-caps
          active-color="teal-8"
          indicator-color="teal"
          class="knowledge-card-hint-dialog__tabs"
        >
          <q-tab v-for="card in cards" :key="card.id" :name="card.id" :label="card.title" />
        </q-tabs>

        <q-separator v-if="cards.length > 1" />

        <q-card-section class="knowledge-card-hint-dialog__content">
          <template v-if="activeCard">
            <div class="knowledge-card-hint-dialog__card-heading">
              <div>
                <div class="knowledge-card-hint-dialog__card-kicker">知識卡</div>
                <div class="knowledge-card-hint-dialog__card-title">
                  {{ activeCard.title }}
                </div>
              </div>

              <q-badge
                outline
                color="teal-7"
                :label="
                  cards.length > 1 ? `${activeCardIndex + 1} / ${cards.length}` : '完整知識卡'
                "
              />
            </div>

            <div class="knowledge-card-hint-dialog__body">
              <RichContentViewer :content="activeCard.content ?? ''" />
            </div>

            <div v-if="activeCard.example" class="knowledge-card-hint-dialog__example">
              <div class="knowledge-card-hint-dialog__example-title">
                <q-icon name="code" />
                程式範例
              </div>
              <CodeExampleViewer :code="activeCard.example" theme="student" />
            </div>
          </template>
        </q-card-section>
      </template>

      <q-card-section v-else class="knowledge-card-hint-dialog__empty">
        <q-icon name="menu_book" size="42px" color="grey-4" />
        <div>這題目前沒有可顯示的知識卡。</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="knowledge-card-hint-dialog__actions">
        <q-btn flat color="grey-7" label="關閉" no-caps @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import CodeExampleViewer from '../../common/CodeExampleViewer.vue';
import RichContentViewer from '../../common/RichContentViewer.vue';
import type { StudentQuestionKnowledgeCard } from '../../../types/student-question.js';

const props = defineProps<{
  modelValue: boolean;
  cards: StudentQuestionKnowledgeCard[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const activeCardId = ref<number | null>(null);

const activeCard = computed(() => {
  if (props.cards.length === 0) {
    return null;
  }

  return props.cards.find((card) => card.id === activeCardId.value) ?? props.cards[0] ?? null;
});

const activeCardIndex = computed(() => {
  if (!activeCard.value) {
    return 0;
  }

  const index = props.cards.findIndex((card) => card.id === activeCard.value?.id);
  return index >= 0 ? index : 0;
});

watch(
  () => [props.modelValue, props.cards] as const,
  ([opened, cards]) => {
    if (!opened || cards.length === 0) {
      return;
    }

    if (!cards.some((card) => card.id === activeCardId.value)) {
      activeCardId.value = cards[0]?.id ?? null;
    }
  },
  { immediate: true, deep: true },
);

function handleModelValueChange(value: boolean) {
  emit('update:modelValue', value);
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>
