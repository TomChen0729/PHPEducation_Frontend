<template>
  <div class="student-question-answer-page">
    <header class="student-question-answer-page__header">
      <div class="student-question-answer-page__header-main">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="goBack">
          <q-tooltip>返回題目列表</q-tooltip>
        </q-btn>

        <div>
          <div class="student-question-answer-page__page-title">題目作答</div>
          <div class="student-question-answer-page__page-subtitle">
            正式題目每題只能回答一次，送出前請確認答案。
          </div>
        </div>
      </div>
    </header>

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

    <div v-else-if="questionLoading" class="student-question-answer-page__state">
      <q-spinner color="teal" size="46px" />
      <div>題目載入中...</div>
    </div>

    <q-banner
      v-else-if="errorMessage && !selectedQuestion"
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

    <div v-else-if="!selectedQuestion" class="student-question-answer-page__state">
      <q-icon name="quiz" size="56px" color="grey-4" />
      <div class="student-question-answer-page__state-title">找不到題目</div>
    </div>

    <template v-else>
      <q-banner
        v-if="selectedQuestion.locked && !isAnswered"
        rounded
        class="bg-orange-1 text-orange-10 student-question-answer-page__locked-banner"
      >
        <template #avatar>
          <q-icon name="lock" />
        </template>

        <div class="text-weight-bold">這題目前尚未解鎖</div>
        <div class="text-caption q-mt-xs">請先完成知識卡：{{ lockedCardNames }}</div>

        <template #action>
          <q-btn flat color="orange-10" label="回教材完成學習" @click="goToCourseMaterial" />
        </template>
      </q-banner>

      <q-banner
        v-if="errorMessage && selectedQuestion"
        rounded
        class="bg-red-1 text-negative student-question-answer-page__error q-mb-md"
      >
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ errorMessage }}
      </q-banner>

      <q-card flat bordered class="student-question-answer-page__question-card">
        <q-card-section>
          <div class="student-question-answer-page__question-topbar">
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

              <q-badge v-if="isAnswered" color="blue-grey-7" label="已作答・不可重答" />
            </div>

            <q-btn
              v-if="hasKnowledgeCards"
              round
              unelevated
              icon="lightbulb"
              color="amber-2"
              text-color="amber-10"
              class="student-question-answer-page__knowledge-hint-button"
              aria-label="查看相關知識卡"
              @click="knowledgeCardDialogOpen = true"
            >
              <q-badge
                v-if="(selectedQuestion.knowledge_cards?.length ?? 0) > 1"
                floating
                rounded
                color="teal-7"
                :label="selectedQuestion.knowledge_cards?.length ?? 0"
              />
            </q-btn>
          </div>

          <h1 class="student-question-answer-page__question-title">
            {{ selectedQuestion.title }}
          </h1>

          <div class="student-question-answer-page__question-content">
            <template v-if="selectedQuestion.type === 'fill' || selectedQuestion.type === 'debug'">
              <div class="student-question-answer-page__interpret-code">
                <CodeExampleViewer
                  :code="selectedQuestion.question_content ?? ''"
                  theme="student"
                />
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
              {{ selectedQuestion.question_content ?? '' }}
            </template>
          </div>

          <div
            v-if="selectedQuestion.description"
            class="student-question-answer-page__description"
          >
            <div class="student-question-answer-page__description-label">
              <q-icon name="info_outline" />
              題目說明
            </div>
            <div>{{ selectedQuestion.description }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="student-question-answer-page__answer-card">
        <q-card-section>
          <div class="student-question-answer-page__answer-header">
            <div>
              <div class="student-question-answer-page__answer-title">我的答案</div>
              <div class="student-question-answer-page__answer-caption">
                {{
                  isAnswered
                    ? '此題已完成作答，正式題目不能再次提交。'
                    : getAnswerInstruction(selectedQuestion.type)
                }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <q-banner
            v-if="isAnswered"
            rounded
            class="student-question-answer-page__result"
            :class="{
              'student-question-answer-page__result--correct': displayStatus === 'correct',
              'student-question-answer-page__result--wrong': displayStatus === 'wrong',
              'student-question-answer-page__result--pending': displayStatus === 'pending',
            }"
          >
            <template #avatar>
              <q-icon
                :name="
                  displayStatus === 'correct'
                    ? 'check_circle'
                    : displayStatus === 'wrong'
                      ? 'cancel'
                      : 'schedule'
                "
                size="28px"
              />
            </template>

            <div class="student-question-answer-page__result-main">
              <div>
                <div class="student-question-answer-page__result-title">
                  {{ resultTitle }}
                </div>

                <div v-if="subAnswerResult" class="student-question-answer-page__result-score">
                  答對 {{ subAnswerResult.correct }} / {{ subAnswerResult.total }}
                  {{ subAnswerResultUnit }}
                </div>
              </div>

              <q-badge
                v-if="displaySolo !== null"
                color="teal-7"
                class="student-question-answer-page__solo-badge"
                :label="`SOLO S${displaySolo}`"
              />
            </div>

            <div class="student-question-answer-page__result-actions">
              <q-btn
                v-if="displayReview"
                outline
                color="teal-8"
                icon="fact_check"
                label="正確答案"
                no-caps
                @click="reviewDialogOpen = true"
              />
            </div>
          </q-banner>

          <template v-if="!isAnswered && !selectedQuestion.locked">
            <ChoiceAnswer
              v-if="selectedQuestion.type === 'choice'"
              :options="selectedQuestion.options ?? []"
              :loading="submitLoading"
              @submit="handleSubmitOption"
            />

            <TrueFalseAnswer
              v-else-if="selectedQuestion.type === 'true_false'"
              :options="selectedQuestion.options ?? []"
              :loading="submitLoading"
              @submit="handleSubmitOption"
            />

            <FillAnswer
              v-else-if="selectedQuestion.type === 'fill'"
              :sub-ids="selectedQuestion.sub_ids ?? []"
              :loading="submitLoading"
              @submit="handleSubmitSubAnswers"
            />

            <DebugAnswer
              v-else-if="selectedQuestion.type === 'debug'"
              :error-count="selectedQuestion.debug_error_count ?? 0"
              :loading="submitLoading"
              @submit="handleSubmitSubAnswers"
            />

            <InterpretAnswer
              v-else-if="selectedQuestion.type === 'interpret'"
              :sub-id="selectedQuestion.sub_ids?.[0] ?? 1"
              :loading="submitLoading"
              @submit="handleSubmitSubAnswers"
            />

            <CodingAnswer
              v-else-if="selectedQuestion.type === 'coding'"
              :question-id="selectedQuestion.id"
              :starter-code="selectedQuestion.starter_code ?? null"
              :loading="submitLoading"
              @submit="handleSubmitCoding"
            />
          </template>

          <div v-if="isAnswered" class="student-question-answer-page__post-submit-actions">
            <q-btn
              outline
              color="grey-8"
              icon="list"
              label="返回題目列表"
              no-caps
              class="student-question-answer-page__post-submit-actions-list-button"
              @click="goBack"
            />

            <q-btn
              v-if="nextQuestion"
              unelevated
              color="teal"
              icon-right="arrow_forward"
              :label="nextQuestion.practice ? '查看下一題結果' : '下一題'"
              no-caps
              class="student-question-answer-page__post-submit-actions-list-button"
              @click="goToNextQuestion"
            />
          </div>
        </q-card-section>
      </q-card>
    </template>

    <KnowledgeCardHintDialog
      v-model="knowledgeCardDialogOpen"
      :cards="selectedQuestion?.knowledge_cards ?? []"
    />

    <q-dialog v-model="reviewDialogOpen">
      <q-card class="student-question-answer-page__review-dialog">
        <q-card-section class="student-question-answer-page__review-dialog-header">
          <div>
            <div class="text-h6 text-weight-bold">正確答案與說明</div>
            <div class="text-caption text-grey-7">檢視本次正式作答的答案內容</div>
          </div>
          <q-btn flat round dense icon="close" @click="reviewDialogOpen = false" />
        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="displayReview"
          class="student-question-answer-page__review-dialog-content"
        >
          <template v-if="displayReview.subs.length > 0">
            <div
              v-for="item in displayReview.subs"
              :key="item.sub_id"
              class="student-question-answer-page__review-item"
            >
              <div class="student-question-answer-page__review-item-title">
                第 {{ item.sub_id }} 題
                <q-badge
                  :color="item.is_right ? 'positive' : 'negative'"
                  :label="item.is_right ? '正確' : '錯誤'"
                />
              </div>
              <div><strong>我的答案：</strong>{{ item.my_answer || '（未作答）' }}</div>
              <div><strong>正確答案：</strong>{{ item.correct_answer || '—' }}</div>
              <div v-if="item.description"><strong>說明：</strong>{{ item.description }}</div>
            </div>
          </template>

          <template v-else>
            <div class="student-question-answer-page__review-item">
              <div><strong>我的答案：</strong></div>
              <pre class="student-question-answer-page__review-code">{{
                displayReview.my_answer || '—'
              }}</pre>
            </div>

            <div class="student-question-answer-page__review-item">
              <div><strong>正確答案：</strong></div>
              <pre
                v-if="displayReview.correct_answer"
                class="student-question-answer-page__review-code"
                >{{ displayReview.correct_answer }}</pre>
              <div v-else class="text-orange-9">
                {{
                  selectedQuestion?.type === 'coding'
                    ? '實作題需等老師批改完成後才會提供參考答案。'
                    : '目前沒有標準答案資料。'
                }}
              </div>
            </div>

            <div v-if="displayReview.explanation" class="student-question-answer-page__review-item">
              <strong>答案說明：</strong>{{ displayReview.explanation }}
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';

import ChoiceAnswer from '../../../components/student/question/ChoiceAnswer.vue';
import TrueFalseAnswer from '../../../components/student/question/TrueFalseAnswer.vue';
import FillAnswer from '../../../components/student/question/FillAnswer.vue';
import InterpretAnswer from '../../../components/student/question/InterpretAnswer.vue';
import DebugAnswer from '../../../components/student/question/DebugAnswer.vue';
import CodingAnswer from '../../../components/student/question/CodingAnswer.vue';
import KnowledgeCardHintDialog from '../../../components/student/question/KnowledgeCardHintDialog.vue';
import CodeExampleViewer from '../../../components/common/CodeExampleViewer.vue';
import { useStudentQuestions } from '../../../composables/useStudentQuestions.js';
import type {
  QuestionSystemStatus,
  StudentQuestionReview,
  StudentQuestionType,
  StudentSubAnswerResult,
} from '../../../types/student-question.js';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
});

const route = useRoute();
const router = useRouter();
const reviewDialogOpen = ref(false);
const knowledgeCardDialogOpen = ref(false);

const questionId = computed(() => {
  const raw = (route.params as { questionId?: string | string[] }).questionId;
  return Number(Array.isArray(raw) ? raw[0] : raw);
});

const courseId = computed(() => {
  const raw = route.query.courseId;
  return Number(Array.isArray(raw) ? raw[0] : raw);
});

const validQuestionId = computed(() => Number.isInteger(questionId.value) && questionId.value > 0);
const validCourseId = computed(() => Number.isInteger(courseId.value) && courseId.value > 0);

const {
  questions,
  selectedQuestion,
  selectedRecord,
  submitResult,
  questionLoading,
  submitLoading,
  errorMessage,
  loadQuestions,
  loadQuestion,
  submitAnswer,
} = useStudentQuestions();

const hasKnowledgeCards = computed(() => Boolean(selectedQuestion.value?.knowledge_cards?.length));

const isAnswered = computed(() => Boolean(submitResult.value || selectedQuestion.value?.practice));

const displayStatus = computed<QuestionSystemStatus | null>(() => {
  return submitResult.value?.system_status ?? selectedQuestion.value?.practice?.status ?? null;
});

const displaySolo = computed<number | null>(() => {
  return submitResult.value?.record.solo ?? selectedRecord.value?.solo ?? null;
});

const displayReview = computed<StudentQuestionReview | null>(() => {
  return submitResult.value?.review ?? selectedQuestion.value?.practice?.review ?? null;
});

const lockedCardNames = computed(() => {
  const cards = selectedQuestion.value?.locked_cards ?? [];
  return cards.length > 0 ? cards.map((card) => card.title).join('、') : '相關知識卡';
});

const resultTitle = computed(() => {
  switch (displayStatus.value) {
    case 'correct':
      return '回答正確！';
    case 'wrong':
      return '回答錯誤';
    case 'pending':
      return '答案已送出，等待老師批改';
    default:
      return '已完成作答';
  }
});

const INTERPRET_CODE_MARKER = '<!--code-stem-->';

const interpretQuestionPrompt = computed(() => {
  if (selectedQuestion.value?.type !== 'interpret') {
    return '';
  }

  const content = selectedQuestion.value.question_content ?? '';
  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);
  return markerIndex < 0 ? '' : content.slice(0, markerIndex).trim();
});

const interpretQuestionCode = computed(() => {
  if (selectedQuestion.value?.type !== 'interpret') {
    return '';
  }

  const content = selectedQuestion.value.question_content ?? '';
  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);
  return markerIndex < 0 ? '' : content.slice(markerIndex + INTERPRET_CODE_MARKER.length).trim();
});

const subAnswerResult = computed<StudentSubAnswerResult | null>(() => {
  const result = submitResult.value?.record.result ?? selectedRecord.value?.result;

  if (!result || typeof result !== 'object') {
    return null;
  }

  return result;
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

const currentQuestionIndex = computed(() =>
  questions.value.findIndex((question) => question.id === questionId.value),
);

const nextQuestion = computed(() => {
  const index = currentQuestionIndex.value;
  return index < 0 ? null : (questions.value[index + 1] ?? null);
});

watch(
  [questionId, courseId],
  async ([id, currentCourseId]) => {
    reviewDialogOpen.value = false;
    knowledgeCardDialogOpen.value = false;

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    if (Number.isInteger(currentCourseId) && currentCourseId > 0 && questions.value.length === 0) {
      await loadQuestions(currentCourseId);
    }

    await loadQuestion(id);
  },
  { immediate: true },
);

async function reloadQuestion() {
  if (validQuestionId.value) {
    await loadQuestion(questionId.value);
  }
}

async function handleSubmitOption(optionId: number) {
  if (!selectedQuestion.value || isAnswered.value || selectedQuestion.value.locked) {
    return;
  }

  await submitAnswer(selectedQuestion.value.id, { option_id: optionId });
}

async function handleSubmitSubAnswers(answers: Record<string, string>) {
  if (!selectedQuestion.value || isAnswered.value || selectedQuestion.value.locked) {
    return;
  }

  await submitAnswer(selectedQuestion.value.id, { answers });
}

async function handleSubmitCoding(answer: string | File) {
  if (!selectedQuestion.value || isAnswered.value || selectedQuestion.value.locked) {
    return;
  }

  const code = typeof answer === 'string' ? answer : await answer.text();
  await submitAnswer(selectedQuestion.value.id, { code });
}

function goToNextQuestion() {
  const question = nextQuestion.value;
  if (!question) {
    return;
  }

  const target: RouteLocationRaw = {
    path: `/student/question/${question.id}`,
  };

  if (validCourseId.value) {
    target.query = { courseId: String(courseId.value) };
  }

  void router.push(target);
}

function goToCourseMaterial() {
  if (validCourseId.value) {
    void router.push(`/student/course/${courseId.value}`);
  }
}

function goBack() {
  if (validCourseId.value) {
    void router.push(`/student/course/${courseId.value}/questions`);
    return;
  }

  router.back();
}

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
