<template>
  <div class="student-question-list">
    <!-- =============================================
         Loading
    ============================================== -->
    <div v-if="loading" class="student-question-list__state">
      <q-spinner color="teal" size="42px" />

      <div>題目載入中...</div>
    </div>

    <!-- =============================================
         Error
    ============================================== -->
    <q-banner
      v-else-if="errorMessage"
      rounded
      class="bg-red-1 text-negative student-question-list__error"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>

      {{ errorMessage }}
    </q-banner>

    <!-- =============================================
         Empty
    ============================================== -->
    <div v-else-if="questions.length === 0" class="student-question-list__state">
      <q-icon name="quiz" size="54px" color="grey-4" />

      <div class="student-question-list__state-title">目前沒有題目</div>

      <div class="student-question-list__state-caption">老師尚未建立此課程的練習題目</div>
    </div>

    <!-- =============================================
         Question List
    ============================================== -->
    <div v-else class="student-question-list__content">
      <div class="student-question-list__cards">
        <q-card
          v-for="(question, index) in questions"
          :key="question.id"
          flat
          bordered
          class="student-question-list__card"
        >
          <q-card-section>
            <!-- =====================================
                 Top
            ====================================== -->
            <div class="student-question-list__card-top">
              <div class="student-question-list__badges">
                <!-- Question Number -->
                <q-badge color="grey-3" text-color="grey-9" :label="`第 ${index + 1} 題`" />

                <!-- Question Type -->
                <q-badge
                  :color="getQuestionTypeColor(question.type)"
                  :label="getQuestionTypeLabel(question.type)"
                />

                <!-- Bloom -->
                <q-badge
                  v-if="question.bloom_id"
                  outline
                  color="teal-7"
                  :label="question.bloom_id"
                />
              </div>
            </div>

            <!-- =====================================
                 Question Title
            ====================================== -->
            <div class="student-question-list__question-title">
              {{ question.title }}
            </div>

            <!-- =====================================
                 Question Content
            ====================================== -->
            <div v-if="question.question_content" class="student-question-list__question-content">
              {{ question.question_content }}
            </div>

            <!--
              學生題目列表不顯示 Knowledge Card。

              Backend 目前只回：
              knowledge_card_ids

              但 ID 對學生沒有顯示意義。

              如果老師允許看範例：
              show_example = true

              Backend 會在單題 API 透過：
              examples

              回傳範例，並在單題作答頁顯示。
            -->
          </q-card-section>

          <q-separator />

          <!-- =====================================
               Actions
          ====================================== -->
          <q-card-actions align="right" class="student-question-list__actions">
            <q-btn
              unelevated
              color="teal"
              icon-right="arrow_forward"
              label="開始作答"
              no-caps
              @click="handleOpenQuestion(question.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentQuestion, StudentQuestionType } from '../../../types/student-question';

/*
 * ============================================================
 * Props
 * ============================================================
 */

defineProps<{
  questions: StudentQuestion[];

  loading?: boolean;

  errorMessage?: string;
}>();

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  'open-question': [questionId: number];
}>();

/*
 * ============================================================
 * Question Type Label
 * ============================================================
 */

function getQuestionTypeLabel(type: StudentQuestionType): string {
  switch (type) {
    case 'choice':
      return '選擇題';

    case 'true_false':
      return '是非題';

    case 'fill':
      return '填空題';

    case 'debug':
      return '除錯題';

    case 'interpret':
      return '程式解讀';

    case 'coding':
      return '程式實作';

    default:
      return '題目';
  }
}

/*
 * ============================================================
 * Question Type Color
 * ============================================================
 */

function getQuestionTypeColor(type: StudentQuestionType): string {
  switch (type) {
    case 'choice':
      return 'blue-7';

    case 'true_false':
      return 'green-7';

    case 'fill':
      return 'orange-7';

    case 'debug':
      return 'deep-orange-7';

    case 'interpret':
      return 'purple-7';

    case 'coding':
      return 'indigo-7';

    default:
      return 'grey-7';
  }
}

/*
 * ============================================================
 * Open Question
 * ============================================================
 */

function handleOpenQuestion(questionId: number) {
  emit('open-question', questionId);
}
</script>
