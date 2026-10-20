<template>
  <div class="student-question-list">
    <div v-if="loading" class="student-question-list__state">
      <q-spinner color="teal" size="42px" />
      <div>題目載入中...</div>
    </div>

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

    <div v-else-if="questions.length === 0" class="student-question-list__state">
      <q-icon name="quiz" size="54px" color="grey-4" />
      <div class="student-question-list__state-title">目前沒有符合條件的題目</div>
      <div class="student-question-list__state-caption">可以調整上方篩選條件再試一次</div>
    </div>

    <div v-else class="student-question-list__content">
      <div class="student-question-list__list-header">
        <div class="student-question-list__col-number">題號</div>
        <div class="student-question-list__col-main">題目</div>
        <div class="student-question-list__col-type">題型</div>
        <div class="student-question-list__col-bloom">Bloom</div>
        <div class="student-question-list__col-attempt">作答狀態</div>
        <div class="student-question-list__col-action">操作</div>
      </div>

      <q-list bordered separator class="student-question-list__list">
        <q-item
          v-for="(question, index) in questions"
          :key="question.id"
          class="student-question-list__item"
        >
          <q-item-section class="student-question-list__col-number">
            <div class="student-question-list__number">
              {{ index + 1 }}
            </div>
          </q-item-section>

          <q-item-section class="student-question-list__col-main">
            <div class="student-question-list__question-title">
              {{ question.title }}
            </div>

            <div class="student-question-list__question-context">
              <span v-if="question.knowledge_cards?.length" class="student-question-list__knowledge-context">
                <q-icon name="menu_book" size="14px" />
                {{ knowledgeCardNames(question) }}
              </span>
              <q-badge
                v-if="question.scope"
                outline
                color="blue-grey-6"
                :label="getScopeLabel(question.scope)"
              />
            </div>

            <div v-if="question.locked" class="student-question-list__locked-caption">
              <q-icon name="lock" size="15px" />
              請先完成：{{ lockedCardNames(question) }}
            </div>

            <div class="student-question-list__mobile-meta">
              <q-badge
                :color="getQuestionTypeColor(question.type)"
                :label="getQuestionTypeLabel(question.type)"
              />

              <q-badge
                v-if="question.bloom_id"
                outline
                color="teal-7"
                :label="question.bloom_id"
              />

              <q-badge
                :color="getPracticeStatusColor(question)"
                :label="getPracticeStatusLabel(question)"
              />
            </div>
          </q-item-section>

          <q-item-section class="student-question-list__col-type">
            <q-badge
              :color="getQuestionTypeColor(question.type)"
              :label="getQuestionTypeLabel(question.type)"
            />
          </q-item-section>

          <q-item-section class="student-question-list__col-bloom">
            <q-badge v-if="question.bloom_id" outline color="teal-7" :label="question.bloom_id" />
            <span v-else class="student-question-list__muted">—</span>
          </q-item-section>

          <q-item-section class="student-question-list__col-attempt">
            <q-badge
              :color="getPracticeStatusColor(question)"
              :text-color="question.practice ? 'white' : 'grey-8'"
              :label="getPracticeStatusLabel(question)"
            />
          </q-item-section>

          <q-item-section side class="student-question-list__col-action">
            <q-btn
              v-if="question.locked && !question.practice"
              outline
              color="grey-6"
              icon="lock"
              label="尚未解鎖"
              no-caps
              disable
            />

            <q-btn
              v-else
              :outline="Boolean(question.practice)"
              :unelevated="!question.practice"
              color="teal"
              :icon="question.practice ? 'visibility' : 'play_arrow'"
              :label="question.practice ? '查看結果' : '開始作答'"
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
import type { StudentPracticeScope, StudentQuestion, StudentQuestionType } from '../../../types/student-question';

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

function lockedCardNames(question: StudentQuestion): string {
  const names = question.locked_cards?.map((card) => card.title) ?? [];
  return names.length > 0 ? names.join('、') : '相關知識卡';
}

function knowledgeCardNames(question: StudentQuestion): string {
  const names = question.knowledge_cards?.map((card) => card.title) ?? [];
  return names.length > 0 ? names.join('、') : '未指定知識卡';
}

function getScopeLabel(scope: StudentPracticeScope): string {
  switch (scope) {
    case 'card':
      return '知識卡練習';
    case 'unit':
      return '單元練習';
    case 'chapter':
      return '章節練習';
    case 'course':
      return '綜合練習';
    default:
      return '題目練習';
  }
}

function getPracticeStatusLabel(question: StudentQuestion): string {
  if (!question.practice) {
    return '未作答';
  }

  return question.practice.status === 'pending' ? '待批改' : '已作答';
}

function getPracticeStatusColor(question: StudentQuestion): string {
  if (!question.practice) {
    return 'grey-4';
  }

  return question.practice.status === 'pending' ? 'orange-7' : 'teal-7';
}

function handleOpenQuestion(questionId: number) {
  emit('open-question', questionId);
}
</script>
