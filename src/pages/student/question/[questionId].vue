<template>
  <div class="student-question-answer-page">
    <!-- =====================================================
         Header
    ====================================================== -->
    <header class="student-question-answer-page__header">
      <div class="student-question-answer-page__header-main">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="goBack">
          <q-tooltip> 返回題目列表 </q-tooltip>
        </q-btn>

        <div>
          <div class="student-question-answer-page__page-title">題目作答</div>

          <div class="student-question-answer-page__page-subtitle">閱讀題目後完成作答</div>
        </div>
      </div>
    </header>

    <!-- =====================================================
         Invalid Question ID
    ====================================================== -->
    <q-banner
      v-if="!validQuestionId"
      rounded
      class="bg-red-1 text-negative student-question-answer-page__error"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>

      題目編號錯誤，無法取得題目。
    </q-banner>

    <!-- =====================================================
         Loading
    ====================================================== -->
    <div v-else-if="questionLoading" class="student-question-answer-page__state">
      <q-spinner color="teal" size="46px" />

      <div>題目載入中...</div>
    </div>

    <!-- =====================================================
         Error
    ====================================================== -->
    <q-banner
      v-else-if="errorMessage"
      rounded
      class="bg-red-1 text-negative student-question-answer-page__error"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>

      {{ errorMessage }}

      <template #action>
        <q-btn flat color="negative" label="重新載入" @click="reloadQuestion" />
      </template>
    </q-banner>

    <!-- =====================================================
         No Question
    ====================================================== -->
    <div v-else-if="!selectedQuestion" class="student-question-answer-page__state">
      <q-icon name="quiz" size="56px" color="grey-4" />

      <div class="student-question-answer-page__state-title">找不到題目</div>
    </div>

    <!-- =====================================================
         Question
    ====================================================== -->
    <template v-else>
      <!-- ===================================================
           Question Card
      ==================================================== -->
      <q-card flat bordered class="student-question-answer-page__question-card">
        <q-card-section>
          <!-- ===============================================
               Metadata
          ================================================ -->
          <div class="student-question-answer-page__badges">
            <q-badge
              :color="getQuestionTypeColor(selectedQuestion.type)"
              :label="getQuestionTypeLabel(selectedQuestion.type)"
            />

            <q-badge
              v-if="selectedQuestion.bloom_id"
              outline
              color="teal-7"
              :label="selectedQuestion.bloom_id"
            />
          </div>

          <!-- ===============================================
               Title
          ================================================ -->
          <h1 class="student-question-answer-page__question-title">
            {{ selectedQuestion.title }}
          </h1>

          <!-- ===============================================
               Content
          ================================================ -->
          <div class="student-question-answer-page__question-content">
            {{ selectedQuestion.question_content }}
          </div>

          <!-- ===============================================
               Description
          ================================================ -->
          <div
            v-if="selectedQuestion.description"
            class="student-question-answer-page__description"
          >
            <div class="student-question-answer-page__description-label">
              <q-icon name="info_outline" />

              題目說明
            </div>

            <div>
              {{ selectedQuestion.description }}
            </div>

            <!-- ===============================================
     Knowledge Card Examples
=============================================== -->
            <div v-if="hasExamples" class="student-question-answer-page__examples">
              <!-- Header -->
              <div class="student-question-answer-page__examples-header">
                <div>
                  <div class="student-question-answer-page__examples-title">
                    <q-icon name="lightbulb" color="amber-8" size="20px" />

                    知識卡範例
                  </div>

                  <div class="student-question-answer-page__examples-caption">
                    老師已允許你在作答時查看相關知識卡範例
                  </div>
                </div>

                <q-btn
                  flat
                  color="teal"
                  :icon="showExamples ? 'visibility_off' : 'visibility'"
                  :label="showExamples ? '收起範例' : '查看範例'"
                  @click="showExamples = !showExamples"
                />
              </div>

              <!-- Examples -->
              <q-slide-transition>
                <div v-if="showExamples" class="student-question-answer-page__examples-content">
                  <div
                    v-for="(example, index) in selectedQuestion.examples"
                    :key="index"
                    class="student-question-answer-page__example"
                  >
                    <div
                      v-if="(selectedQuestion.examples?.length ?? 0) > 1"
                      class="student-question-answer-page__example-label"
                    >
                      範例 {{ index + 1 }}
                    </div>

                    <CodeExampleViewer :code="example" theme="student" />
                  </div>
                </div>
              </q-slide-transition>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ===================================================
           Answer Card
      ==================================================== -->
      <q-card flat bordered class="student-question-answer-page__answer-card">
        <q-card-section>
          <div class="student-question-answer-page__answer-header">
            <div>
              <div class="student-question-answer-page__answer-title">我的答案</div>

              <div class="student-question-answer-page__answer-caption">
                {{ getAnswerInstruction(selectedQuestion.type) }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- ===============================================
     Submit Result
=============================================== -->
          <q-banner
            v-if="submitResult"
            rounded
            class="student-question-answer-page__result"
            :class="{
              'student-question-answer-page__result--correct':
                submitResult.system_status === 'correct',

              'student-question-answer-page__result--wrong': submitResult.system_status === 'wrong',

              'student-question-answer-page__result--pending':
                submitResult.system_status === 'pending',
            }"
          >
            <template #avatar>
              <q-icon
                :name="
                  submitResult.system_status === 'correct'
                    ? 'check_circle'
                    : submitResult.system_status === 'wrong'
                      ? 'cancel'
                      : 'schedule'
                "
                size="28px"
              />
            </template>

            <div class="student-question-answer-page__result-title">
              {{
                submitResult.system_status === 'correct'
                  ? '回答正確！'
                  : submitResult.system_status === 'wrong'
                    ? '回答錯誤'
                    : '答案已送出'
              }}
            </div>

            <div
              v-if="submitResult.explanation"
              class="student-question-answer-page__result-description"
            >
              {{ submitResult.explanation }}
            </div>
          </q-banner>

          <!-- ===============================================
               Choice Placeholder
          ================================================ -->
          <ChoiceAnswer
            v-if="selectedQuestion.type === 'choice'"
            :options="selectedQuestion.options ?? []"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitOption"
          />

          <!-- ===============================================
               True / False Placeholder
          ================================================ -->
          <TrueFalseAnswer
            v-else-if="selectedQuestion.type === 'true_false'"
            :options="selectedQuestion.options ?? []"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitOption"
          />

          <!-- ===============================================
               Fill
          ================================================ -->
          <div
            v-else-if="selectedQuestion.type === 'fill'"
            class="student-question-answer-page__answer-placeholder"
          >
            <q-icon name="edit" size="32px" color="orange-6" />

            <div>填空題作答區</div>

            <small> 後續會依 sub_answers 產生多個答案欄位。 </small>
          </div>

          <!-- ===============================================
               Debug
          ================================================ -->
          <div
            v-else-if="selectedQuestion.type === 'debug'"
            class="student-question-answer-page__answer-placeholder"
          >
            <q-icon name="bug_report" size="32px" color="deep-orange-6" />

            <div>除錯題作答區</div>

            <small> 後續會建立除錯答案輸入介面。 </small>
          </div>

          <!-- ===============================================
               Interpret
          ================================================ -->
          <div
            v-else-if="selectedQuestion.type === 'interpret'"
            class="student-question-answer-page__answer-placeholder"
          >
            <q-icon name="psychology" size="32px" color="purple-6" />

            <div>程式解讀題作答區</div>

            <small> 後續會依題目需求產生答案欄位。 </small>
          </div>

          <!-- ===============================================
               Coding
          ================================================ -->
          <div
            v-else-if="selectedQuestion.type === 'coding'"
            class="student-question-answer-page__answer-placeholder"
          >
            <q-icon name="code" size="32px" color="indigo-6" />

            <div>程式實作題作答區</div>

            <small> 後續會在這裡放入可編輯的 CodeMirror。 </small>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import ChoiceAnswer from '../../../components/student/question/ChoiceAnswer.vue';

import TrueFalseAnswer from '../../../components/student/question/TrueFalseAnswer.vue';

import CodeExampleViewer from '../../../components/common/CodeExampleViewer.vue';

import { computed, ref, watch } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import { useStudentQuestions } from '../../../composables/useStudentQuestions';

import type { StudentQuestionType } from '../../../types/student-question';

/*
 * ============================================================
 * Page Guard
 * ============================================================
 */

definePage({
  meta: {
    requiresAuth: true,

    roles: ['student'],
  },
});

/*
 * ============================================================
 * Router
 * ============================================================
 */

const route = useRoute();

const router = useRouter();

/*
 * ============================================================
 * Knowledge Card Examples
 * ============================================================
 */

/*
 * 是否展開知識卡範例。
 */
const showExamples = ref(false);

/*
 * ============================================================
 * Question ID
 * ============================================================
 *
 * 因為目前專案使用 typed file-based router，
 * 不直接寫 route.params.questionId，
 * 避免 TypeScript union route params error。
 */

const questionId = computed(() => {
  const params = route.params as {
    questionId?: string | string[];
  };

  const rawQuestionId = params.questionId;

  const value = Array.isArray(rawQuestionId) ? rawQuestionId[0] : rawQuestionId;

  return Number(value);
});

/*
 * ============================================================
 * Course ID
 * ============================================================
 *
 * 題目列表進來時我們有帶：
 *
 * ?courseId=1
 *
 * 主要用在「返回題目列表」。
 */

const courseId = computed(() => {
  const rawCourseId = route.query.courseId;

  const value = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;

  return Number(value);
});

/*
 * ============================================================
 * Validation
 * ============================================================
 */

const validQuestionId = computed(() => {
  return Number.isInteger(questionId.value) && questionId.value > 0;
});

const validCourseId = computed(() => {
  return Number.isInteger(courseId.value) && courseId.value > 0;
});

/*
 * ============================================================
 * Student Question
 * ============================================================
 */

const {
  /*
   * Question
   */
  selectedQuestion,

  /*
   * Submit
   */
  submitResult,

  /*
   * Loading
   */
  questionLoading,

  submitLoading,

  /*
   * Error
   */
  errorMessage,

  /*
   * Methods
   */
  loadQuestion,

  submitAnswer,
} = useStudentQuestions();

/*
 * Backend 已經判斷 show_example。
 *
 * 因此 Frontend 不需要再拿 show_example，
 * 只需要檢查 examples 是否有內容。
 */
const hasExamples = computed(() => {
  return Boolean(selectedQuestion.value?.examples?.length);
});

/*
 * ============================================================
 * Load Question
 * ============================================================
 */

watch(
  questionId,

  async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    /*
     * 換題時先收起上一題的範例。
     */
    showExamples.value = false;

    await loadQuestion(id);
  },

  {
    immediate: true,
  },
);

/*
 * ============================================================
 * Reload
 * ============================================================
 */

async function reloadQuestion() {
  if (!validQuestionId.value) {
    return;
  }

  await loadQuestion(questionId.value);
}

/*
 * ============================================================
 * Submit Option Answer
 * ============================================================
 *
 * choice / true_false
 * 都使用：
 *
 * {
 *   option_id: number
 * }
 */

async function handleSubmitOption(optionId: number) {
  if (!selectedQuestion.value) {
    return;
  }

  await submitAnswer(selectedQuestion.value.id, {
    option_id: optionId,
  });
}

/*
 * ============================================================
 * Back
 * ============================================================
 */

function goBack() {
  /*
   * 從課程題目列表進來，
   * 就回同一門課的 Question List。
   */
  if (validCourseId.value) {
    void router.push(`/student/course/${courseId.value}/questions`);

    return;
  }

  /*
   * 若 URL 沒有 courseId，
   * 就使用瀏覽器上一頁。
   */
  router.back();
}

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
 * Answer Instruction
 * ============================================================
 */

function getAnswerInstruction(type: StudentQuestionType): string {
  switch (type) {
    case 'choice':
      return '請選擇一個最適合的答案';

    case 'true_false':
      return '請判斷題目敘述是否正確';

    case 'fill':
      return '請依題目內容完成各個填空';

    case 'debug':
      return '請找出程式中的問題並完成作答';

    case 'interpret':
      return '請依程式內容完成解讀';

    case 'coding':
      return '請依題目要求撰寫程式碼';

    default:
      return '';
  }
}
</script>
