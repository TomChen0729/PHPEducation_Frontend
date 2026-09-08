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
      <!-- Desktop / Tablet Header -->
      <div class="student-question-list__list-header">
        <div class="student-question-list__col-number">題號</div>
        <div class="student-question-list__col-main">題目</div>
        <div class="student-question-list__col-type">題型</div>
        <div class="student-question-list__col-bloom">Bloom</div>
        <div class="student-question-list__col-attempt">作答次數</div>
        <div class="student-question-list__col-action">操作</div>
      </div>

      <q-list bordered separator class="student-question-list__list">
        <q-item
          v-for="(question, index) in questions"
          :key="question.id"
          class="student-question-list__item"
        >
          <!-- Question Number -->
          <q-item-section class="student-question-list__col-number">
            <div class="student-question-list__number">
              {{ index + 1 }}
            </div>
          </q-item-section>

          <!-- Main -->
          <q-item-section class="student-question-list__col-main">
            <div class="student-question-list__question-title">
              {{ question.title }}
            </div>

            <!-- <div v-if="question.question_content" class="student-question-list__question-content">
              {{ getQuestionPreview(question.question_content) }}
            </div> -->

            <!-- Mobile metadata -->
            <div class="student-question-list__mobile-meta">
              <q-badge
                :color="getQuestionTypeColor(question.type)"
                :label="getQuestionTypeLabel(question.type)"
              />

              <q-badge v-if="question.bloom_id" outline color="teal-7" :label="question.bloom_id" />

              <span class="student-question-list__mobile-attempt">
                作答次數：
                <!-- {{ formatAttemptCount(question.attempt_count) }} -->
              </span>
            </div>
          </q-item-section>

          <!-- Type -->
          <q-item-section class="student-question-list__col-type">
            <q-badge
              :color="getQuestionTypeColor(question.type)"
              :label="getQuestionTypeLabel(question.type)"
            />
          </q-item-section>

          <!-- Bloom -->
          <q-item-section class="student-question-list__col-bloom">
            <q-badge v-if="question.bloom_id" outline color="teal-7" :label="question.bloom_id" />
            <span v-else class="student-question-list__muted">—</span>
          </q-item-section>

          <!-- Attempt Count: Backend 尚未提供，先預留欄位 -->
          <q-item-section class="student-question-list__col-attempt">
            <span class="student-question-list__attempt-value">
              <!-- {{ formatAttemptCount(question.attempt_count) }} -->
            </span>
          </q-item-section>

          <!-- Action -->
          <q-item-section side class="student-question-list__col-action">
            <q-btn
              unelevated
              color="teal"
              icon-right="arrow_forward"
              label="開始作答"
              no-caps
              @click="handleOpenQuestion(question.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentQuestion, StudentQuestionType } from '../../../types/student-question';

defineProps<{
  questions: StudentQuestion[];
  loading?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  'open-question': [questionId: number];
}>();

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

// function getQuestionPreview(content: string): string {
//   const normalized = content.replace('<!--code-stem-->', ' ').replace(/\s+/g, ' ').trim();

//   if (normalized.length <= 90) {
//     return normalized;
//   }

//   return `${normalized.slice(0, 90)}…`;
// }

/*
 * Backend 尚未提供 attempt_count，現在顯示「—」。
 * 等 Backend 加上後，這個欄位會自動顯示數字，不需要再改列表 UI。
 */
// function formatAttemptCount(value: number | undefined): string {
//   return typeof value === 'number' ? String(value) : '—';
// }

function handleOpenQuestion(questionId: number) {
  emit('open-question', questionId);
}
</script>
