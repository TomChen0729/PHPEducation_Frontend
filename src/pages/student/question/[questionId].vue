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
            <!-- Fill / Debug：用與教材程式範例相同的 CodeMirror Viewer 顯示 -->
            <template v-if="selectedQuestion.type === 'fill' || selectedQuestion.type === 'debug'">
              <div class="student-question-answer-page__interpret-code">
                <CodeExampleViewer :code="selectedQuestion.question_content" theme="student" />
              </div>
            </template>

            <template v-else-if="selectedQuestion.type === 'interpret' && interpretQuestionCode">
              <div v-if="interpretQuestionPrompt">
                {{ interpretQuestionPrompt }}
              </div>

              <div class="student-question-answer-page__interpret-code">
                <div class="student-question-answer-page__interpret-code-label">
                  <q-icon name="code" />

                  程式碼
                </div>

                <CodeExampleViewer :code="interpretQuestionCode" theme="student" />
              </div>
            </template>

            <template v-else>
              {{ selectedQuestion.question_content }}
            </template>
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
          </div>

          <!-- ===============================================
               Knowledge Card Examples
          ================================================ -->
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

            <div v-if="subAnswerResult" class="student-question-answer-page__result-score">
              答對 {{ subAnswerResult.correct }} / {{ subAnswerResult.total }}
              {{ subAnswerResultUnit }}
            </div>

            <div v-if="submitExplanation" class="student-question-answer-page__result-description">
              {{ submitExplanation }}
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
          <FillAnswer
            v-else-if="selectedQuestion.type === 'fill'"
            :sub-ids="selectedQuestion.sub_ids ?? []"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitSubAnswers"
          />

          <!-- ===============================================
               Debug
          ================================================ -->
          <DebugAnswer
            v-else-if="selectedQuestion.type === 'debug'"
            :error-count="selectedQuestion.debug_error_count ?? 0"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitSubAnswers"
          />

          <!-- ===============================================
               Interpret
          ================================================ -->
          <InterpretAnswer
            v-else-if="selectedQuestion.type === 'interpret'"
            :sub-id="selectedQuestion.sub_ids?.[0] ?? 1"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitSubAnswers"
          />

          <!-- ===============================================
               Coding
          ================================================ -->
          <CodingAnswer
            v-else-if="selectedQuestion.type === 'coding'"
            :starter-code="selectedQuestion.starter_code ?? null"
            :loading="submitLoading"
            :disabled="Boolean(submitResult)"
            @submit="handleSubmitCoding"
          />

          <!-- ===============================================
               Post Submit Navigation
          ================================================ -->
          <div v-if="submitResult" class="student-question-answer-page__post-submit-actions">
            <q-btn
              outline
              color="grey-8"
              icon="list"
              label="返回題目列表"
              no-caps
              @click="goBack"
              class="student-question-answer-page__post-submit-actions-list-button"
            />

            <q-btn
              v-if="nextQuestion"
              unelevated
              color="teal"
              icon-right="arrow_forward"
              label="回答下一題"
              no-caps
              @click="goToNextQuestion"
              class="student-question-answer-page__post-submit-actions-list-button"
            />

            <q-btn
              v-else
              flat
              disable
              color="grey-6"
              icon="check_circle_outline"
              label="已是最後一題"
              no-caps
            />
          </div>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import ChoiceAnswer from '../../../components/student/question/ChoiceAnswer.vue';

import TrueFalseAnswer from '../../../components/student/question/TrueFalseAnswer.vue';

import FillAnswer from '../../../components/student/question/FillAnswer.vue';

import InterpretAnswer from '../../../components/student/question/InterpretAnswer.vue';

import DebugAnswer from '../../../components/student/question/DebugAnswer.vue';

import CodingAnswer from '../../../components/student/question/CodingAnswer.vue';

import CodeExampleViewer from '../../../components/common/CodeExampleViewer.vue';

import { computed, ref, watch } from 'vue';

import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';

import { useStudentQuestions } from '../../../composables/useStudentQuestions.js';

import type {
  StudentQuestionType,
  StudentSubAnswerResult,
} from '../../../types/student-question.js';

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
   * Question List
   *
   * 單題頁也載入同一門課題目列表，
   * 用來判斷「下一題」。
   */
  questions,

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
  loadQuestions,

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
 * Interpret Question Content
 * ============================================================
 *
 * Backend 的程式解讀題可使用：
 *
 * 題目文字
 * <!--code-stem-->
 * 程式碼
 *
 * Frontend 將兩段拆開顯示。
 * 如果舊題沒有 marker，則仍使用原本 question_content 顯示。
 */

const INTERPRET_CODE_MARKER = '<!--code-stem-->';

const interpretQuestionPrompt = computed(() => {
  if (selectedQuestion.value?.type !== 'interpret') {
    return '';
  }

  const content = selectedQuestion.value.question_content ?? '';

  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);

  if (markerIndex < 0) {
    return '';
  }

  return content.slice(0, markerIndex).trim();
});

const interpretQuestionCode = computed(() => {
  if (selectedQuestion.value?.type !== 'interpret') {
    return '';
  }

  const content = selectedQuestion.value.question_content ?? '';

  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);

  if (markerIndex < 0) {
    return '';
  }

  return content.slice(markerIndex + INTERPRET_CODE_MARKER.length).trim();
});

/*
 * Fill / Debug / Interpret 的 Backend result
 * 會包含 correct / total / answers。
 */
const subAnswerResult = computed<StudentSubAnswerResult | null>(() => {
  const result = submitResult.value?.record.result;

  if (!result || typeof result !== 'object') {
    return null;
  }

  return result;
});

/*
 * Backend 的舊版 Sub Answer Submit Response 使用 description，
 * Choice / True False 則使用 explanation。
 *
 * 這裡先相容兩者，避免 Fill / Debug / Interpret
 * 作答成功後看不到答案說明。
 */
const submitExplanation = computed(() => {
  return submitResult.value?.explanation ?? submitResult.value?.description ?? null;
});

const subAnswerResultUnit = computed(() => {
  switch (selectedQuestion.value?.type) {
    case 'interpret':
      return '題';

    case 'debug':
      return '處';

    default:
      return '格';
  }
});

/*
 * ============================================================
 * Question Navigation
 * ============================================================
 *
 * Backend 的課程題目列表目前依 question id 由小到大排序。
 * 這裡直接沿用列表順序判斷下一題，
 * 不使用 questionId + 1，避免題目刪除後 ID 不連續。
 */

const currentQuestionIndex = computed(() => {
  return questions.value.findIndex((question) => question.id === questionId.value);
});

const nextQuestion = computed(() => {
  const index = currentQuestionIndex.value;

  if (index < 0) {
    return null;
  }

  return questions.value[index + 1] ?? null;
});

/*
 * ============================================================
 * Load Question
 * ============================================================
 */

watch(
  [questionId, courseId],

  async ([id, currentCourseId]) => {
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    /*
     * 換題時先收起上一題的範例。
     */
    showExamples.value = false;

    /*
     * 有 courseId 時先取得課程題目順序，
     * 讓作答完成後可以前往下一題。
     *
     * 題目列表只需要在尚未載入時取得一次。
     */
    if (Number.isInteger(currentCourseId) && currentCourseId > 0 && questions.value.length === 0) {
      await loadQuestions(currentCourseId);
    }

    /*
     * 即使題目列表取得失敗，
     * 單題仍然繼續載入。
     * loadQuestion() 會重新整理單題自己的錯誤狀態。
     */
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
 * Submit Sub Answers
 * ============================================================
 *
 * fill / interpret / debug（多錯誤）
 * 共用 Backend 格式：
 *
 * {
 *   answers: {
 *     "1": "...",
 *     "2": "..."
 *   }
 * }
 *
 * 目前接 Fill / Interpret / Debug。
 */

async function handleSubmitSubAnswers(answers: Record<string, string>) {
  if (!selectedQuestion.value) {
    return;
  }

  await submitAnswer(selectedQuestion.value.id, {
    answers,
  });
}

/*
 * ============================================================
 * Submit Coding
 * ============================================================
 *
 * coding：
 *
 * {
 *   code: "..."
 * }
 */

async function handleSubmitCoding(code: string) {
  if (!selectedQuestion.value) {
    return;
  }

  await submitAnswer(selectedQuestion.value.id, {
    code,
  });
}

/*
 * ============================================================
 * Go To Next Question
 * ============================================================
 */

function goToNextQuestion() {
  const question = nextQuestion.value;

  if (!question) {
    return;
  }

  const route: RouteLocationRaw = {
    path: `/student/question/${question.id}`,
  };

  if (validCourseId.value) {
    route.query = {
      courseId: String(courseId.value),
    };
  }

  void router.push(route);
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
