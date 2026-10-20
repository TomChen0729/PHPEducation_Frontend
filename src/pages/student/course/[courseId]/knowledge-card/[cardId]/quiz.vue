<template>
  <q-page class="student-knowledge-card-quiz-page">
    <header class="student-knowledge-card-quiz-page__header">
      <div class="student-knowledge-card-quiz-page__header-main">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="goBack" />

        <div>
          <div class="student-knowledge-card-quiz-page__title">小試身手</div>
          <div class="student-knowledge-card-quiz-page__subtitle">
            每題至少作答一次即可完成知識卡；答錯仍可重新練習。
          </div>
        </div>
      </div>

      <q-badge
        v-if="quiz"
        outline
        color="teal-7"
        class="student-knowledge-card-quiz-page__progress-badge"
      >
        已作答 {{ answeredCount }} / {{ questionCount }} 題
      </q-badge>
    </header>

    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-red-1 text-negative student-knowledge-card-quiz-page__error"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ errorMessage }}
    </q-banner>

    <div v-if="loading" class="student-knowledge-card-quiz-page__state">
      <q-spinner color="teal" size="46px" />
      <div>小試身手載入中...</div>
    </div>

    <template v-else-if="quiz">
      <div class="student-knowledge-card-quiz-page__breadcrumb">
        <span v-if="quiz.card.chapter">{{ quiz.card.chapter.name }}</span>
        <q-icon v-if="quiz.card.chapter && quiz.card.unit" name="chevron_right" />
        <span v-if="quiz.card.unit">{{ quiz.card.unit.name }}</span>
        <q-icon v-if="quiz.card.unit" name="chevron_right" />
        <strong>{{ quiz.card.title }}</strong>
      </div>

      <q-card flat bordered class="student-knowledge-card-quiz-page__quiz-shell">
        <q-card-section class="student-knowledge-card-quiz-page__quiz-topbar">
          <div>
            <div class="student-knowledge-card-quiz-page__quiz-title">
              <q-icon name="bolt" color="orange-7" />
              即學即測
            </div>
            <div class="student-knowledge-card-quiz-page__quiz-progress-copy">
              已作答 {{ answeredCount }} / {{ questionCount }} 題
              <template v-if="quiz.completed">・知識卡學習已完成</template>
            </div>
          </div>

          <q-badge
            :color="quiz.completed ? 'positive' : 'teal-6'"
            :label="quiz.completed ? '已完成' : '進行中'"
          />
        </q-card-section>

        <q-linear-progress
          rounded
          size="8px"
          color="teal"
          track-color="teal-1"
          :value="questionCount > 0 ? answeredCount / questionCount : 0"
        />

        <q-card-section v-if="quiz.questions.length > 0" class="student-knowledge-card-quiz-page__step-section">
          <div class="student-knowledge-card-quiz-page__steps">
            <button
              v-for="(question, index) in quiz.questions"
              :key="question.id"
              type="button"
              class="student-knowledge-card-quiz-page__step"
              :class="stepClass(question, index)"
              @click="activeIndex = index"
            >
              {{ index + 1 }}
              <q-tooltip>
                {{ question.correct ? '已答對' : question.answered ? '已作答，可重答' : '未作答' }}
              </q-tooltip>
            </button>
          </div>

          <div class="student-knowledge-card-quiz-page__step-legend">
            <span><i class="student-knowledge-card-quiz-page__legend-dot student-knowledge-card-quiz-page__legend-dot--current" />目前題目</span>
            <span><i class="student-knowledge-card-quiz-page__legend-dot student-knowledge-card-quiz-page__legend-dot--answered" />已作答</span>
            <span><i class="student-knowledge-card-quiz-page__legend-dot student-knowledge-card-quiz-page__legend-dot--correct" />已答對</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="activeQuestion" class="student-knowledge-card-quiz-page__question-stage">
          <div class="student-knowledge-card-quiz-page__question-header">
            <div>
              <div class="student-knowledge-card-quiz-page__question-meta">
                <q-badge color="teal-7" outline :label="questionTypeLabel(activeQuestion.type)" />
                <q-badge color="blue-grey-7" outline label="B11" />
                <q-badge
                  v-if="activeQuestion.correct"
                  color="positive"
                  label="已答對"
                />
                <q-badge
                  v-else-if="activeQuestion.answered"
                  color="orange-8"
                  label="已作答・可重答"
                />
                <q-badge v-else color="grey-6" label="未作答" />
              </div>

              <div class="student-knowledge-card-quiz-page__question-number">
                第 {{ activeIndex + 1 }} 題
              </div>

              <div class="student-knowledge-card-quiz-page__question-title">
                {{ activeQuestion.title }}
              </div>
            </div>

            <q-btn
              flat
              round
              dense
              color="amber-8"
              icon="lightbulb"
              size="md"
              class="student-knowledge-card-quiz-page__hint-button"
              aria-label="查看完整知識卡"
              @click="knowledgeCardDialogOpen = true"
            >
              <q-tooltip>查看「{{ quiz.card.title }}」完整知識卡</q-tooltip>
            </q-btn>
          </div>

          <div class="student-knowledge-card-quiz-page__question-source">
            <q-icon name="style" />
            此題只練習「{{ quiz.card.title }}」知識卡
          </div>

          <div class="student-knowledge-card-quiz-page__question-content">
            {{ activeQuestion.question_content }}
          </div>

          <q-banner
            v-if="resultFor(activeQuestion.id)"
            rounded
            class="student-knowledge-card-quiz-page__result"
            :class="{
              'student-knowledge-card-quiz-page__result--correct':
                resultFor(activeQuestion.id)?.system_status === 'correct',
              'student-knowledge-card-quiz-page__result--wrong':
                resultFor(activeQuestion.id)?.system_status === 'wrong',
            }"
          >
            <template #avatar>
              <q-icon
                :name="
                  resultFor(activeQuestion.id)?.system_status === 'correct'
                    ? 'check_circle'
                    : 'refresh'
                "
              />
            </template>

            {{
              resultFor(activeQuestion.id)?.system_status === 'correct'
                ? '回答正確！可以前往下一題。'
                : '已完成這次作答。答錯可以重新選擇後再試一次。'
            }}
          </q-banner>

          <ChoiceAnswer
            v-if="activeQuestion.type === 'choice'"
            :key="`choice-${activeQuestion.id}`"
            :options="activeQuestion.options ?? []"
            :loading="submittingQuestionId === activeQuestion.id"
            :disabled="activeQuestion.correct"
            @submit="submitOption(activeQuestion.id, $event)"
          />

          <TrueFalseAnswer
            v-else-if="activeQuestion.type === 'true_false'"
            :key="`tf-${activeQuestion.id}`"
            :options="activeQuestion.options ?? []"
            :loading="submittingQuestionId === activeQuestion.id"
            :disabled="activeQuestion.correct"
            @submit="submitOption(activeQuestion.id, $event)"
          />

          <div class="student-knowledge-card-quiz-page__question-navigation">
            <q-btn
              flat
              no-caps
              color="blue-grey-8"
              icon="arrow_back"
              label="上一題"
              :disable="activeIndex <= 0"
              @click="previousQuestion"
            />

            <q-btn
              v-if="activeIndex < quiz.questions.length - 1"
              unelevated
              no-caps
              color="teal"
              icon-right="arrow_forward"
              label="下一題"
              @click="nextQuestion"
            />

            <q-btn
              v-else
              unelevated
              no-caps
              :color="quiz.completed ? 'positive' : 'teal'"
              :icon="quiz.completed ? 'verified' : 'check'"
              :label="quiz.completed ? '完成，返回課程' : '返回課程'"
              @click="goBack"
            />
          </div>
        </q-card-section>

        <div
          v-else
          class="student-knowledge-card-quiz-page__state student-knowledge-card-quiz-page__state--compact"
        >
          <q-icon name="quiz" size="50px" color="grey-4" />
          <div class="text-weight-bold">這張知識卡目前沒有可使用的小試身手題目</div>
        </div>
      </q-card>

      <q-banner
        v-if="quiz.completed"
        rounded
        class="bg-green-1 text-positive student-knowledge-card-quiz-page__complete-banner"
      >
        <template #avatar>
          <q-icon name="verified" />
        </template>
        <div class="text-weight-bold">這張知識卡已完成學習</div>
        <div class="text-caption">
          完成條件是每題都至少作答過一次，不需要全部答對；你仍可以重答尚未答對的題目。
        </div>
      </q-banner>

      <KnowledgeCardHintDialog
        v-model="knowledgeCardDialogOpen"
        :cards="quizKnowledgeCards"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ChoiceAnswer from '../../../../../../components/student/question/ChoiceAnswer.vue';
import TrueFalseAnswer from '../../../../../../components/student/question/TrueFalseAnswer.vue';
import KnowledgeCardHintDialog from '../../../../../../components/student/question/KnowledgeCardHintDialog.vue';
import { useStudentKnowledgeCardQuiz } from '../../../../../../composables/useStudentKnowledgeCardQuiz.js';

import type {
  StudentKnowledgeCardQuizQuestion,
  StudentQuestionType,
} from '../../../../../../types/student-question.js';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
});

const route = useRoute();
const router = useRouter();
const activeIndex = ref(0);
const knowledgeCardDialogOpen = ref(false);

const courseId = computed(() => {
  const raw = (route.params as { courseId?: string | string[] }).courseId;
  return Number(Array.isArray(raw) ? raw[0] : raw);
});

const cardId = computed(() => {
  const raw = (route.params as { cardId?: string | string[] }).cardId;
  return Number(Array.isArray(raw) ? raw[0] : raw);
});

const {
  quiz,
  loading,
  submittingQuestionId,
  errorMessage,
  answeredCount,
  questionCount,
  loadQuiz,
  submitQuizAnswer,
  resultFor,
  clearQuiz,
} = useStudentKnowledgeCardQuiz();

const activeQuestion = computed(() => quiz.value?.questions[activeIndex.value] ?? null);

const quizKnowledgeCards = computed(() => {
  if (!quiz.value) {
    return [];
  }

  return [
    {
      id: quiz.value.card.id,
      title: quiz.value.card.title,
      content: quiz.value.card.content,
      example: quiz.value.card.example,
    },
  ];
});

watch(
  [courseId, cardId],
  async ([currentCourseId, currentCardId]) => {
    clearQuiz();
    activeIndex.value = 0;

    if (
      !Number.isInteger(currentCourseId) ||
      currentCourseId <= 0 ||
      !Number.isInteger(currentCardId) ||
      currentCardId <= 0
    ) {
      return;
    }

    const loaded = await loadQuiz(currentCourseId, currentCardId);

    if (!loaded) {
      return;
    }

    const firstUnanswered = loaded.questions.findIndex((question) => !question.answered);
    activeIndex.value = firstUnanswered >= 0 ? firstUnanswered : 0;
  },
  { immediate: true },
);

async function submitOption(questionId: number, optionId: number) {
  if (!quiz.value) {
    return;
  }

  await submitQuizAnswer(courseId.value, cardId.value, questionId, {
    option_id: optionId,
  });
}

function stepClass(question: StudentKnowledgeCardQuizQuestion, index: number) {
  return {
    'student-knowledge-card-quiz-page__step--active': index === activeIndex.value,
    'student-knowledge-card-quiz-page__step--correct': question.correct,
    'student-knowledge-card-quiz-page__step--answered': question.answered && !question.correct,
  };
}

function questionTypeLabel(type: StudentQuestionType): string {
  const labels: Record<StudentQuestionType, string> = {
    choice: '選擇題',
    true_false: '是非題',
    fill: '填空題',
    debug: '除錯題',
    interpret: '程式解讀',
    coding: '程式實作',
  };

  return labels[type];
}

function previousQuestion() {
  if (activeIndex.value > 0) {
    activeIndex.value -= 1;
  }
}

function nextQuestion() {
  if (!quiz.value) {
    return;
  }

  if (activeIndex.value < quiz.value.questions.length - 1) {
    activeIndex.value += 1;
  }
}

function goBack() {
  if (Number.isInteger(courseId.value) && courseId.value > 0) {
    void router.push(`/student/course/${courseId.value}`);
    return;
  }

  router.back();
}
</script>
