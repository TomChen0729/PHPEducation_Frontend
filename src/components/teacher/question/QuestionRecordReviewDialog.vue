<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="handleDialogModelUpdate">
    <q-card class="question-record-review-dialog">
      <!-- =========================
           Header
      ========================== -->
      <q-card-section class="question-record-review-dialog__header">
        <div>
          <div class="question-record-review-dialog__title">作答詳情與教師覆核</div>

          <div v-if="record" class="question-record-review-dialog__subtitle">
            {{ record.student_name || '未命名學生' }}
            <span v-if="record.student_no">・{{ record.student_no }}</span>
            ・{{ record.question_title || `題目 #${record.question_id}` }}
          </div>
        </div>

        <q-btn flat round dense icon="close" :disable="reviewing" @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <!-- =========================
           Content
      ========================== -->
      <q-card-section class="question-record-review-dialog__content">
        <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mb-md">
          {{ errorMessage }}
        </q-banner>

        <div v-if="questionLoading" class="question-record-review-dialog__loading">
          <q-spinner color="blue" size="36px" />

          <span>載入題目內容...</span>
        </div>

        <template v-else-if="record && question">
          <!-- =========================
               Summary
          ========================== -->
          <section class="question-record-review-dialog__section">
            <div class="question-record-review-dialog__section-title">作答資訊</div>

            <div class="question-record-review-dialog__summary-grid">
              <div class="question-record-review-dialog__summary-item">
                <span>題型</span>

                <strong>{{ questionTypeLabel(record.question_type) }}</strong>
              </div>

              <div class="question-record-review-dialog__summary-item">
                <span>題目 Bloom</span>

                <strong>{{ record.question_bloom_id || '—' }}</strong>
              </div>

              <div class="question-record-review-dialog__summary-item">
                <span>系統結果</span>

                <q-badge
                  :color="statusColor(record.system_status)"
                  :label="systemStatusLabel(record.system_status)"
                />
              </div>

              <div class="question-record-review-dialog__summary-item">
                <span>教師覆核</span>

                <q-badge
                  :color="statusColor(record.teacher_status)"
                  :label="teacherStatusLabel(record)"
                />
              </div>

              <div class="question-record-review-dialog__summary-item">
                <span>目前 SOLO</span>

                <strong>{{ record.solo ?? '—' }}</strong>
              </div>

              <div class="question-record-review-dialog__summary-item">
                <span>作答時間</span>

                <strong>{{ formatDateTime(record.created_at) }}</strong>
              </div>
            </div>
          </section>

          <!-- =========================
               Question
          ========================== -->
          <section class="question-record-review-dialog__section">
            <div class="question-record-review-dialog__section-title">題目內容</div>

            <!-- Interpret -->
            <template v-if="record.question_type === 'interpret'">
              <div v-if="interpretPrompt" class="question-record-review-dialog__question-text">
                {{ interpretPrompt }}
              </div>

              <CodeExampleViewer v-if="interpretCode" :code="interpretCode" theme="teacher" />
            </template>

            <!-- Fill / Debug -->
            <CodeExampleViewer
              v-else-if="record.question_type === 'fill' || record.question_type === 'debug'"
              :code="question.question_content"
              theme="teacher"
            />

            <!-- Other -->
            <div v-else class="question-record-review-dialog__question-text">
              {{ question.question_content }}
            </div>

            <div v-if="question.description" class="question-record-review-dialog__description">
              {{ question.description }}
            </div>
          </section>

          <!-- =========================
               Choice / True False
          ========================== -->
          <section
            v-if="record.question_type === 'choice' || record.question_type === 'true_false'"
            class="question-record-review-dialog__section"
          >
            <div class="question-record-review-dialog__section-title">學生作答</div>

            <div class="question-record-review-dialog__option-list">
              <div
                v-for="option in question.options"
                :key="option.id"
                class="question-record-review-dialog__option"
                :class="{
                  'question-record-review-dialog__option--student': option.id === selectedOptionId,
                  'question-record-review-dialog__option--answer': option.is_answer,
                }"
              >
                <div class="question-record-review-dialog__option-content">
                  {{ option.title }}
                </div>

                <div class="question-record-review-dialog__option-badges">
                  <q-badge v-if="option.id === selectedOptionId" color="blue" label="學生答案" />

                  <q-badge v-if="option.is_answer" color="positive" label="標準答案" />
                </div>
              </div>
            </div>
          </section>

          <!-- =========================
               Fill / Debug / Interpret
          ========================== -->
          <section v-if="usesSubAnswers" class="question-record-review-dialog__section">
            <div class="question-record-review-dialog__section-title">學生作答</div>

            <div class="question-record-review-dialog__sub-list">
              <div
                v-for="answer in orderedStandardAnswers"
                :key="answer.id"
                class="question-record-review-dialog__sub-item"
              >
                <div class="question-record-review-dialog__sub-header">
                  <strong>{{ subAnswerLabel(answer.sub_id) }}</strong>

                  <q-badge
                    :color="studentSub(answer.sub_id)?.is_right ? 'positive' : 'negative'"
                    :label="studentSub(answer.sub_id)?.is_right ? '系統判定正確' : '系統判定錯誤'"
                  />
                </div>

                <div class="question-record-review-dialog__answer-grid">
                  <div>
                    <span>學生答案</span>

                    <pre>{{ studentSub(answer.sub_id)?.answer || '—' }}</pre>
                  </div>

                  <div>
                    <span>標準答案</span>

                    <pre>{{ answer.answer }}</pre>
                  </div>
                </div>

                <div
                  v-if="answer.description"
                  class="question-record-review-dialog__answer-description"
                >
                  {{ answer.description }}
                </div>
              </div>
            </div>
          </section>

          <!-- =========================
               Coding
          ========================== -->
          <template v-if="record.question_type === 'coding'">
            <section class="question-record-review-dialog__section">
              <div class="question-record-review-dialog__section-title">學生程式碼</div>

              <CodeExampleViewer :code="codingResult" theme="teacher" />
            </section>

            <section v-if="record.starter_code" class="question-record-review-dialog__section">
              <div class="question-record-review-dialog__section-title">初始程式碼</div>

              <CodeExampleViewer :code="record.starter_code" theme="teacher" />
            </section>

            <section class="question-record-review-dialog__coding-reference-grid">
              <div class="question-record-review-dialog__section">
                <div class="question-record-review-dialog__section-title">期望輸出</div>

                <CodeExampleViewer :code="record.expected_output || '—'" theme="teacher" />
              </div>

              <div class="question-record-review-dialog__section">
                <div class="question-record-review-dialog__section-title">參考答案</div>

                <CodeExampleViewer :code="record.reference_answer || '—'" theme="teacher" />
              </div>
            </section>

            <!-- =========================
                 AI 智慧批改輔助區塊 (僅 Coding 題可見)
            ========================== -->
            <section class="question-record-review-dialog__section">
              <div class="flex items-center justify-between q-mb-sm">
                <div class="question-record-review-dialog__section-title q-mb-none flex items-center q-gutter-x-xs">
                  <q-icon name="auto_awesome" color="deep-purple-7" size="18px" />
                  <span>AI 智慧診斷與評估</span>
                </div>

                <!-- AI 批改按鈕 -->
                <q-btn
                  unelevated
                  dense
                  color="deep-purple-7"
                  icon="auto_awesome"
                  :label="record.ai_feedback ? '重新 AI 批改' : '執行 AI 批改'"
                  :loading="aiGrading"
                  :disable="reviewing"
                  class="q-px-sm"
                  @click="$emit('aiGrade', record.id)"
                />
              </div>

              <!-- AI 回饋內容 -->
              <div v-if="parsedAiFeedback" class="bg-deep-purple-1 text-deep-purple-10 q-pa-md rounded-borders">
                <div class="flex items-center q-gutter-x-sm q-mb-xs">
                  <q-badge color="deep-purple-8" class="text-weight-bold">
                    {{ parsedAiFeedback.solo ? `SOLO: ${parsedAiFeedback.solo}` : 'SOLO 評估' }}
                  </q-badge>
                  <span class="text-caption text-grey-8">由 AI 模型進行程式語意與邏輯診斷</span>
                </div>
                <div class="text-body2" style="white-space: pre-wrap; line-height: 1.6;">
                  {{ parsedAiFeedback.feedback }}
                </div>
              </div>

              <!-- 尚未批改提示 -->
              <div v-else class="text-grey-6 text-caption bg-grey-2 q-pa-sm rounded-borders">
                尚未執行 AI 批改。點擊右上角「執行 AI 批改」可由 AI 分析學生解題等級與診斷評語。
              </div>
            </section>

          </template>

          <!-- =========================
               Review
          ========================== -->
          <section
            class="question-record-review-dialog__section question-record-review-dialog__review"
          >
            <div class="question-record-review-dialog__section-title">教師覆核</div>

            <!-- Coding Review -->
            <template v-if="record.question_type === 'coding'">
              <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
                實作題請選擇學生實際達到的 Bloom 編碼。Backend 會比較此 Bloom 與題目要求的 Bloom
                層級並更新判定。
              </q-banner>

              <div class="question-record-review-dialog__review-grid">
                <div class="question-record-review-dialog__required-bloom">
                  <span>題目要求 Bloom</span>

                  <strong>{{ record.question_bloom_id || '—' }}</strong>
                </div>

                <q-select
                  v-model="reviewBloomId"
                  outlined
                  emit-value
                  map-options
                  behavior="menu"
                  label="教師判定 Bloom *"
                  :options="bloomOptions"
                  :disable="reviewing"
                />
              </div>
            </template>

            <!-- General Review -->
            <template v-else>
              <q-banner rounded class="bg-orange-1 text-orange-10 q-mb-md">
                目前 Backend 的非實作題覆核是針對「整筆作答紀錄」，不是逐格修改 Fill / Debug /
                Interpret 的每一個子答案。
              </q-banner>

              <q-select v-model.number="reviewSolo" outlined emit-value map-options label="教師修正 SOLO 層級 *" :options="reviewSoloOptions" :disable="reviewing" />
            </template>
          </section>
        </template>
      </q-card-section>

      <q-separator />

      <!-- =========================
           Footer
      ========================== -->
      <q-card-actions class="question-record-review-dialog__actions">
        <q-btn flat label="關閉" :disable="reviewing" @click="closeDialog" />

        <q-btn
          unelevated
          color="blue"
          icon="save"
          label="儲存覆核"
          :loading="reviewing"
          :disable="!canSubmitReview || questionLoading"
          @click="submitReview"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import CodeExampleViewer from '../../common/CodeExampleViewer.vue';

import type {
  TeacherBloom,
  TeacherQuestion,
  TeacherQuestionSubAnswer,
  TeacherQuestionType,
} from '../../../types/teacher-question';

import type {
  TeacherQuestionRecord,
  TeacherQuestionRecordReviewRequest,
  TeacherQuestionRecordStatus,
  TeacherQuestionRecordSub,
} from '../../../types/teacher-question-record';

const props = defineProps<{
  modelValue: boolean;

  record: TeacherQuestionRecord | null;

  question: TeacherQuestion | null;

  blooms: TeacherBloom[];

  questionLoading: boolean;

  reviewing: boolean;

  aiGrading?: boolean;

  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];

  submit: [data: TeacherQuestionRecordReviewRequest];

  aiGrade: [recordId: number];

  close: [];
}>();

const reviewSolo = ref<number | null>(null);
const reviewSoloOptions = [1, 2, 3, 4, 5].map((level) => ({ label: `S${level}`, value: level }));

const reviewBloomId = ref<string | null>(null);

const INTERPRET_CODE_MARKER = '<!--code-stem-->';

const usesSubAnswers = computed(() => {
  return (
    props.record?.question_type === 'fill' ||
    props.record?.question_type === 'debug' ||
    props.record?.question_type === 'interpret'
  );
});

const selectedOptionId = computed<number | null>(() => {
  if (!props.record) {
    return null;
  }

  if (typeof props.record.result === 'number') {
    return props.record.result;
  }

  if (typeof props.record.result === 'string') {
    const value = Number(props.record.result);

    return Number.isFinite(value) ? value : null;
  }

  return null;
});

const orderedStandardAnswers = computed<TeacherQuestionSubAnswer[]>(() => {
  return [...(props.question?.sub_answers ?? [])].sort((a, b) => a.sub_id - b.sub_id);
});

const studentSubMap = computed<Map<number, TeacherQuestionRecordSub>>(() => {
  return new Map((props.record?.subs ?? []).map((sub) => [sub.sub_id, sub]));
});

const interpretParts = computed(() => {
  const content = props.question?.question_content ?? '';

  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);

  if (markerIndex < 0) {
    return {
      prompt: content,
      code: '',
    };
  }

  return {
    prompt: content.slice(0, markerIndex).trim(),
    code: content.slice(markerIndex + INTERPRET_CODE_MARKER.length).trim(),
  };
});

const interpretPrompt = computed(() => interpretParts.value.prompt);

const interpretCode = computed(() => interpretParts.value.code);

const codingResult = computed<string>(() => {
  const result = props.record?.result;

  /*
   * Coding 題正常情況下，
   * Backend 的 result 就是學生提交的程式碼字串。
   */
  if (typeof result === 'string') {
    return result;
  }

  /*
   * 沒有作答內容。
   */
  if (result === null || result === undefined) {
    return '';
  }

  /*
   * 如果意外收到 primitive，
   * 可以安全轉成字串。
   */
  if (typeof result === 'number' || typeof result === 'boolean') {
    return String(result);
  }

  /*
   * 如果 Backend 意外回傳 Object / Array，
   * 使用 JSON 顯示，而不是 String(object)。
   */
  try {
    const serialized = JSON.stringify(result, null, 2);

    return serialized ?? '';
  } catch {
    /*
     * 避免 Object 被轉成 [object Object]，
     * 同時符合 no-base-to-string。
     */
    return '無法顯示此作答內容';
  }
});

const bloomOptions = computed(() => {
  return props.blooms.map((bloom) => ({
    label: `${bloom.id}｜${bloom.title}`,
    value: bloom.id,
  }));
});

const canSubmitReview = computed(() => {
  if (!props.record) {
    return false;
  }

  if (props.record.question_type === 'coding') {
    return Boolean(reviewBloomId.value);
  }

  // 教師覆核選取的 SOLO 會直接寫回整題紀錄。
  return reviewSolo.value !== null && reviewSolo.value >= 1 && reviewSolo.value <= 5;
});

watch(
  () => [props.modelValue, props.record?.id] as const,
  ([open]) => {
    if (!open || !props.record) {
      return;
    }

    resetReviewState();
  },
  {
    immediate: true,
  },
);

// 解析 AI 回饋
const parsedAiFeedback = computed(() => {
  if (!props.record?.ai_feedback) return null;
  if (typeof props.record.ai_feedback === 'string') {
    try {
      return JSON.parse(props.record.ai_feedback);
    } catch {
      return { feedback: props.record.ai_feedback };
    }
  }
  return props.record.ai_feedback;
});

function resetReviewState() {
  if (!props.record) {
    reviewSolo.value = null;
    reviewBloomId.value = null;
    return;
  }

  reviewBloomId.value = props.record.bloom_id;

  reviewSolo.value = props.record.solo ?? null;
}

function studentSub(subId: number) {
  return studentSubMap.value.get(subId);
}

function subAnswerLabel(subId: number) {
  if (props.record?.question_type === 'debug') {
    return `錯誤行 ${subId}`;
  }

  if (props.record?.question_type === 'interpret') {
    return `答案 ${subId}`;
  }

  return `第 ${subId} 格`;
}

function submitReview() {
  if (!props.record || !canSubmitReview.value) {
    return;
  }

  if (props.record.question_type === 'coding') {
    if (!reviewBloomId.value) {
      return;
    }

    emit('submit', {
      bloom_id: reviewBloomId.value,
    });

    return;
  }

  if (reviewSolo.value === null || reviewSolo.value < 1 || reviewSolo.value > 5) {
    return;
  }

  emit('submit', {
    solo: reviewSolo.value as 1 | 2 | 3 | 4 | 5,
  });
}

function closeDialog() {
  if (props.reviewing) {
    return;
  }

  emit('update:modelValue', false);
  emit('close');
}

function handleDialogModelUpdate(value: boolean) {
  if (props.reviewing && !value) {
    return;
  }

  emit('update:modelValue', value);

  if (!value) {
    emit('close');
  }
}

function questionTypeLabel(type: TeacherQuestionType) {
  const labels: Record<TeacherQuestionType, string> = {
    choice: '選擇題',
    true_false: '是非題',
    fill: '填空題',
    debug: '除錯題',
    interpret: '解讀題',
    coding: '實作題',
  };

  return labels[type];
}

function systemStatusLabel(status: TeacherQuestionRecordStatus) {
  const labels: Record<TeacherQuestionRecordStatus, string> = {
    pending: '待系統判定',
    correct: '正確',
    wrong: '錯誤',
  };

  return labels[status];
}

function teacherStatusLabel(record: TeacherQuestionRecord) {
  if (record.teacher_status === 'pending') {
    return record.question_type === 'coding' ? '待批改' : '待覆核';
  }

  return record.teacher_status === 'correct' ? '教師判定正確' : '教師判定錯誤';
}

function statusColor(status: TeacherQuestionRecordStatus) {
  if (status === 'correct') {
    return 'positive';
  }

  if (status === 'wrong') {
    return 'negative';
  }

  return 'orange';
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
</script>
