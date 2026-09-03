<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="handleDialogModelUpdate">
    <q-card class="question-form-dialog">
      <!-- =========================
           Header
      ========================== -->
      <q-card-section class="question-form-dialog__header">
        <div>
          <div class="question-form-dialog__title">
            {{ dialogTitle }}
          </div>

          <div class="question-form-dialog__subtitle">
            設定題目內容、Bloom 分類、關聯知識卡與標準答案
          </div>
        </div>

        <q-btn flat round dense icon="close" :disable="submitting" @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <!-- =========================
           Content
      ========================== -->
      <q-card-section class="question-form-dialog__content">
        <q-banner v-if="displayError" rounded class="bg-red-1 text-negative q-mb-md">
          {{ displayError }}
        </q-banner>

        <q-form ref="formRef" class="question-form-dialog__form" @submit.prevent="submitForm">
          <!-- =========================
               基本資料
          ========================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">基本資料</div>

                <div class="question-form-dialog__section-description">
                  設定題目名稱、題型與實際題目內容。
                </div>
              </div>
            </div>

            <div class="question-form-dialog__grid">
              <!-- 題目名稱 -->
              <q-input
                v-model="form.title"
                outlined
                label="題目名稱 *"
                :disable="submitting"
                :rules="[requiredTextRule]"
                lazy-rules
              />

              <!-- 題型 -->
              <q-select
                v-model="form.type"
                outlined
                label="題型 *"
                :options="questionTypeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                behavior="menu"
                :disable="submitting"
                @update:model-value="handleTypeChange"
              />

              <!-- 題目內容 -->
              <q-input
                v-model="form.question_content"
                outlined
                type="textarea"
                label="題目內容 *"
                class="question-form-dialog__full"
                :disable="submitting"
                :rules="[requiredTextRule]"
                lazy-rules
              />

              <!-- 題目說明 -->
              <q-input
                v-model="form.description"
                outlined
                type="textarea"
                label="題目說明（選填）"
                hint="可填寫教師備註、解題方向或補充說明"
                class="question-form-dialog__full"
                :disable="submitting"
              />
            </div>
          </section>

          <!-- =========================
               Bloom
          ========================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">Bloom 認知分類</div>

                <div class="question-form-dialog__section-description">
                  指定此題希望評量的認知層級與知識向度。
                </div>
              </div>
            </div>

            <q-select
              v-model="form.bloom_id"
              outlined
              label="Bloom 編碼 *"
              :options="bloomSelectOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              behavior="menu"
              :loading="bloomsLoading"
              :disable="submitting"
              :rules="[requiredSelectRule]"
              lazy-rules
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      {{ scope.opt.label }}
                    </q-item-label>

                    <q-item-label v-if="scope.opt.caption" caption>
                      {{ scope.opt.caption }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </section>

          <!-- =========================
               Knowledge Cards
          ========================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">關聯知識卡</div>

                <div class="question-form-dialog__section-description">
                  一道題目可以關聯一張或多張知識卡。
                </div>
              </div>
            </div>

            <q-select
              v-model="form.knowledge_card_ids"
              outlined
              multiple
              use-chips
              emit-value
              map-options
              behavior="menu"
              label="關聯知識卡 *"
              :options="knowledgeCardSelectOptions"
              option-value="id"
              option-label="label"
              :loading="knowledgeCardsLoading"
              :disable="submitting"
              :rules="[requiredKnowledgeCardsRule]"
              lazy-rules
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      {{ scope.opt.title }}
                    </q-item-label>

                    <q-item-label v-if="scope.opt.path" caption>
                      {{ scope.opt.path }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge
                      v-if="scope.opt.example"
                      color="blue-1"
                      text-color="blue-8"
                      label="有範例"
                    />
                  </q-item-section>
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  color="blue-1"
                  text-color="blue-9"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  {{ scope.opt.title }}
                </q-chip>
              </template>
            </q-select>

            <!-- =========================
                 show_example
            ========================== -->
            <div class="question-form-dialog__example-setting">
              <div class="question-form-dialog__example-setting-content">
                <div class="question-form-dialog__example-setting-title">顯示知識卡範例</div>

                <div class="question-form-dialog__example-setting-description">
                  開啟後，學生作答此題時可以查看關聯知識卡的範例。
                </div>

                <div
                  v-if="form.knowledge_card_ids.length > 0"
                  class="question-form-dialog__example-setting-hint"
                >
                  目前選擇
                  {{ form.knowledge_card_ids.length }}
                  張知識卡，其中
                  {{ selectedExampleCount }}
                  張有範例。
                </div>
              </div>

              <q-toggle v-model="form.show_example" color="blue" keep-color :disable="submitting" />
            </div>
          </section>

          <!-- =========================
               Choice / True False
          ========================== -->
          <section v-if="isOptionType" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">
                  {{ optionSectionTitle }}
                </div>

                <div class="question-form-dialog__section-description">
                  選擇其中一個選項作為正確答案。
                </div>
              </div>

              <q-btn
                v-if="form.type === 'choice'"
                flat
                color="blue"
                icon="add"
                label="新增選項"
                :disable="submitting"
                @click="addOption"
              />
            </div>

            <div class="question-form-dialog__option-list">
              <div
                v-for="(option, index) in form.options"
                :key="index"
                class="question-form-dialog__option"
              >
                <div class="question-form-dialog__option-answer">
                  <q-radio
                    v-model="correctOptionIndex"
                    :val="index"
                    color="blue"
                    :disable="submitting"
                  />

                  <span>正確答案</span>
                </div>

                <div class="question-form-dialog__option-fields">
                  <q-input
                    v-model="option.title"
                    outlined
                    dense
                    :label="`選項 ${index + 1} *`"
                    :disable="submitting"
                    :rules="[requiredTextRule]"
                    lazy-rules
                  />

                  <q-input
                    v-model="option.description"
                    outlined
                    dense
                    label="選項說明（選填）"
                    :disable="submitting"
                  />
                </div>

                <q-btn
                  v-if="form.type === 'choice' && form.options.length > 2"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  :disable="submitting"
                  @click="removeOption(index)"
                >
                  <q-tooltip>刪除選項</q-tooltip>
                </q-btn>
              </div>
            </div>
          </section>

          <!-- =========================
               Fill / Debug / Interpret
          ========================== -->
          <section v-if="isSubAnswerType" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">標準答案</div>

                <div class="question-form-dialog__section-description">
                  可設定一個或多個答案項目，供系統進行後續判定。
                </div>
              </div>

              <q-btn
                flat
                color="blue"
                icon="add"
                label="新增答案"
                :disable="submitting"
                @click="addSubAnswer"
              />
            </div>

            <div class="question-form-dialog__sub-answer-list">
              <div
                v-for="(item, index) in form.sub_answers"
                :key="item.sub_id"
                class="question-form-dialog__sub-answer"
              >
                <div class="question-form-dialog__sub-answer-number">
                  {{ index + 1 }}
                </div>

                <div class="question-form-dialog__sub-answer-fields">
                  <q-input
                    v-model="item.answer"
                    outlined
                    :label="`標準答案 ${index + 1} *`"
                    :disable="submitting"
                    :rules="[requiredTextRule]"
                    lazy-rules
                  />

                  <q-input
                    v-model="item.description"
                    outlined
                    type="textarea"
                    label="答案說明（選填）"
                    :disable="submitting"
                  />
                </div>

                <q-btn
                  v-if="form.sub_answers.length > 1"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  :disable="submitting"
                  @click="removeSubAnswer(index)"
                >
                  <q-tooltip>刪除答案</q-tooltip>
                </q-btn>
              </div>
            </div>
          </section>

          <!-- =========================
               Coding
          ========================== -->
          <section v-if="form.type === 'coding'" class="question-form-dialog__section">
            <q-banner rounded class="bg-blue-1 text-blue-9">
              <template #avatar>
                <q-icon name="code" color="blue" />
              </template>

              程式實作題不需要設定選項或一般標準答案， 學生會在作答頁輸入程式碼。
            </q-banner>
          </section>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- =========================
           Footer
      ========================== -->
      <q-card-actions class="question-form-dialog__actions">
        <q-btn flat label="取消" :disable="submitting" @click="closeDialog" />

        <q-btn
          unelevated
          color="blue"
          icon="save"
          :label="submitButtonLabel"
          :loading="submitting"
          @click="submitForm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import type { QForm } from 'quasar';

import type {
  TeacherBloom,
  TeacherQuestion,
  TeacherQuestionKnowledgeCardOption,
  TeacherQuestionOptionInput,
  TeacherQuestionRequest,
  TeacherQuestionSubAnswerInput,
  TeacherQuestionType,
} from '../../../types/teacher-question';

/*
 * ============================================================
 * Component Types
 * ============================================================
 */

type QuestionFormMode = 'create' | 'edit';

/*
 * API：
 *
 * TeacherQuestionOptionInput.description
 * → string | null | undefined
 *
 * 但 q-input 的 Form State
 * 統一使用 string。
 */
type QuestionOptionForm = Omit<TeacherQuestionOptionInput, 'description'> & {
  description: string;
};

/*
 * 同樣把 description
 * 在表單內固定成 string。
 */
type QuestionSubAnswerForm = Omit<TeacherQuestionSubAnswerInput, 'description'> & {
  description: string;
};

/*
 * 大部分欄位直接沿用 TeacherQuestionRequest。
 *
 * 只有 UI Form 和 API Request
 * 型態不同的欄位才覆蓋。
 */
type QuestionFormState = Omit<
  TeacherQuestionRequest,
  'bloom_id' | 'description' | 'options' | 'sub_answers'
> & {
  bloom_id: string | null;

  description: string;

  options: QuestionOptionForm[];

  sub_answers: QuestionSubAnswerForm[];
};

/*
 * QSelect 顯示用。
 */
interface BloomSelectOption {
  value: string;

  label: string;

  caption: string | null;
}

type KnowledgeCardSelectOption = TeacherQuestionKnowledgeCardOption & {
  label: string;

  path: string;
};

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    modelValue: boolean;

    mode?: QuestionFormMode;

    question?: TeacherQuestion | null;

    blooms: TeacherBloom[];

    knowledgeCards: TeacherQuestionKnowledgeCardOption[];

    submitting?: boolean;

    bloomsLoading?: boolean;

    knowledgeCardsLoading?: boolean;

    errorMessage?: string;
  }>(),
  {
    mode: 'create',

    question: null,

    submitting: false,

    bloomsLoading: false,

    knowledgeCardsLoading: false,

    errorMessage: '',
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  'update:modelValue': [value: boolean];

  submit: [data: TeacherQuestionRequest];

  close: [];
}>();

/*
 * ============================================================
 * Ref
 * ============================================================
 */

const formRef = ref<QForm | null>(null);

const localError = ref('');

/*
 * ============================================================
 * Static Options
 * ============================================================
 */

const questionTypeOptions: {
  label: string;

  value: TeacherQuestionType;
}[] = [
  {
    label: '選擇題',
    value: 'choice',
  },
  {
    label: '是非題',
    value: 'true_false',
  },
  {
    label: '填空題',
    value: 'fill',
  },
  {
    label: '除錯題',
    value: 'debug',
  },
  {
    label: '程式解讀題',
    value: 'interpret',
  },
  {
    label: '程式實作題',
    value: 'coding',
  },
];

/*
 * ============================================================
 * Default Form
 * ============================================================
 */

function createChoiceOptions(): QuestionOptionForm[] {
  return [
    {
      title: '',
      description: '',
      is_answer: false,
    },
    {
      title: '',
      description: '',
      is_answer: false,
    },
    {
      title: '',
      description: '',
      is_answer: false,
    },
    {
      title: '',
      description: '',
      is_answer: false,
    },
  ];
}

function createTrueFalseOptions(): QuestionOptionForm[] {
  return [
    {
      title: '正確',
      description: '',
      is_answer: false,
    },
    {
      title: '錯誤',
      description: '',
      is_answer: false,
    },
  ];
}

function createSubAnswers(): QuestionSubAnswerForm[] {
  return [
    {
      sub_id: 1,
      answer: '',
      description: '',
    },
  ];
}

function createEmptyForm(): QuestionFormState {
  return {
    title: '',

    type: 'choice',

    question_content: '',

    bloom_id: null,

    description: '',

    /*
     * 新增題目預設：
     * 不允許學生查看知識卡 example。
     */
    show_example: false,

    knowledge_card_ids: [],

    options: createChoiceOptions(),

    sub_answers: [],
  };
}

const form = reactive<QuestionFormState>(createEmptyForm());

/*
 * ============================================================
 * Computed
 * ============================================================
 */

const dialogTitle = computed(() => {
  return props.mode === 'edit' ? '修改題目' : '新增題目';
});

const submitButtonLabel = computed(() => {
  return props.mode === 'edit' ? '儲存修改' : '建立題目';
});

const displayError = computed(() => {
  return props.errorMessage || localError.value;
});

const isOptionType = computed(() => {
  return form.type === 'choice' || form.type === 'true_false';
});

const isSubAnswerType = computed(() => {
  return ['fill', 'debug', 'interpret'].includes(form.type);
});

const optionSectionTitle = computed(() => {
  return form.type === 'true_false' ? '是非題答案' : '選擇題選項';
});

/*
 * Bloom QSelect
 */
const bloomSelectOptions = computed<BloomSelectOption[]>(() => {
  return props.blooms.map((bloom) => ({
    value: bloom.id,

    label: `${bloom.id}｜${bloom.title}`,

    caption: bloom.cognition_info,
  }));
});

/*
 * Knowledge Card QSelect
 */
const knowledgeCardSelectOptions = computed<KnowledgeCardSelectOption[]>(() => {
  return props.knowledgeCards.map((card) => {
    const path = [card.chapter_name, card.unit_name].filter(Boolean).join(' / ');

    return {
      ...card,

      label: card.title,

      path,
    };
  });
});

/*
 * 目前被選中的 Knowledge Cards。
 */
const selectedKnowledgeCards = computed(() => {
  const ids = new Set(form.knowledge_card_ids);

  return props.knowledgeCards.filter((card) => ids.has(card.id));
});

/*
 * 被選中的知識卡裡，
 * 有 example 的數量。
 */
const selectedExampleCount = computed(() => {
  return selectedKnowledgeCards.value.filter((card) => Boolean(card.example?.trim())).length;
});

/*
 * Choice / True False
 * 單選正確答案。
 */
const correctOptionIndex = computed<number | null>({
  get() {
    const index = form.options.findIndex((option) => option.is_answer);

    return index >= 0 ? index : null;
  },

  set(selectedIndex) {
    form.options.forEach((option, index) => {
      option.is_answer = index === selectedIndex;
    });
  },
});

/*
 * ============================================================
 * Validation Rules
 * ============================================================
 */

function requiredTextRule(value: string | null | undefined) {
  return Boolean(value?.trim()) || '此欄位為必填';
}

function requiredSelectRule(value: string | null) {
  return Boolean(value) || '請選擇 Bloom 編碼';
}

function requiredKnowledgeCardsRule(value: number[]) {
  return value.length > 0 || '請至少選擇一張知識卡';
}

/*
 * ============================================================
 * Form Initialize
 * ============================================================
 */

function resetForm() {
  Object.assign(form, createEmptyForm());

  localError.value = '';

  formRef.value?.resetValidation();
}

/*
 * Backend Question
 * ↓
 * Dialog Form
 */
function fillForm(question: TeacherQuestion) {
  form.title = question.title;

  form.type = question.type;

  form.question_content = question.question_content;

  form.bloom_id = question.bloom_id;

  form.description = question.description ?? '';

  /*
   * 新欄位：
   *
   * 舊資料若沒有值，
   * 一律視為 false。
   */
  form.show_example = question.show_example ?? false;

  /*
   * 優先使用 knowledge_card_ids。
   *
   * 若 Backend Response
   * 沒有帶 ids，
   * 則由 knowledge_cards 取得。
   */
  form.knowledge_card_ids = question.knowledge_card_ids?.length
    ? [...question.knowledge_card_ids]
    : question.knowledge_cards.map((card) => card.id);

  /*
   * Backend：
   *
   * TeacherQuestionOption
   *
   * ↓
   *
   * Form：
   *
   * QuestionOptionForm
   */
  form.options = question.options.map((option) => ({
    title: option.title,

    description: option.description ?? '',

    is_answer: option.is_answer,
  }));

  /*
   * Backend：
   *
   * TeacherQuestionSubAnswer
   *
   * ↓
   *
   * Form：
   *
   * QuestionSubAnswerForm
   */
  form.sub_answers = question.sub_answers.map((item) => ({
    sub_id: item.sub_id,

    answer: item.answer,

    description: item.description ?? '',
  }));

  /*
   * 相容舊題資料：
   * 如果該題型理論上需要選項，
   * 但 Backend 沒有回選項，
   * 就建立預設值。
   */
  if (form.type === 'choice' && form.options.length === 0) {
    form.options = createChoiceOptions();
  }

  if (form.type === 'true_false' && form.options.length === 0) {
    form.options = createTrueFalseOptions();
  }

  if (['fill', 'debug', 'interpret'].includes(form.type) && form.sub_answers.length === 0) {
    form.sub_answers = createSubAnswers();
  }

  localError.value = '';

  formRef.value?.resetValidation();
}

function initializeForm() {
  if (props.mode === 'edit' && props.question) {
    fillForm(props.question);

    return;
  }

  resetForm();
}

/*
 * ============================================================
 * Question Type
 * ============================================================
 */

function handleTypeChange(type: TeacherQuestionType) {
  localError.value = '';

  switch (type) {
    case 'choice':
      form.options = createChoiceOptions();

      form.sub_answers = [];

      break;

    case 'true_false':
      form.options = createTrueFalseOptions();

      form.sub_answers = [];

      break;

    case 'fill':
    case 'debug':
    case 'interpret':
      form.options = [];

      form.sub_answers = createSubAnswers();

      break;

    case 'coding':
      form.options = [];

      form.sub_answers = [];

      break;
  }
}

/*
 * ============================================================
 * Choice Options
 * ============================================================
 */

function addOption() {
  form.options.push({
    title: '',

    description: '',

    is_answer: false,
  });
}

function removeOption(index: number) {
  if (form.options.length <= 2) {
    return;
  }

  form.options.splice(index, 1);
}

/*
 * ============================================================
 * Sub Answers
 * ============================================================
 */

function addSubAnswer() {
  form.sub_answers.push({
    sub_id: form.sub_answers.length + 1,

    answer: '',

    description: '',
  });
}

function removeSubAnswer(index: number) {
  if (form.sub_answers.length <= 1) {
    return;
  }

  form.sub_answers.splice(index, 1);

  /*
   * 刪除後重新整理 sub_id：
   *
   * 1, 2, 3...
   */
  form.sub_answers.forEach((item, itemIndex) => {
    item.sub_id = itemIndex + 1;
  });
}

/*
 * ============================================================
 * Type-specific Validation
 * ============================================================
 */

function validateTypeSpecific(): string | null {
  /*
   * Choice / True False
   */
  if (isOptionType.value) {
    if (form.options.length < 2) {
      return '選擇題至少需要兩個選項';
    }

    const hasEmptyOption = form.options.some((option) => !option.title.trim());

    if (hasEmptyOption) {
      return '請填寫完整的選項內容';
    }

    const answerCount = form.options.filter((option) => option.is_answer).length;

    if (answerCount !== 1) {
      return '請選擇一個正確答案';
    }
  }

  /*
   * Fill / Debug / Interpret
   */
  if (isSubAnswerType.value) {
    if (form.sub_answers.length === 0) {
      return '請至少設定一個標準答案';
    }

    const hasEmptyAnswer = form.sub_answers.some((item) => !item.answer.trim());

    if (hasEmptyAnswer) {
      return '請填寫完整的標準答案';
    }
  }

  return null;
}

/*
 * ============================================================
 * Build API Request
 * ============================================================
 */

function buildRequest(): TeacherQuestionRequest {
  const payload: TeacherQuestionRequest = {
    title: form.title.trim(),

    type: form.type,

    question_content: form.question_content.trim(),

    bloom_id: form.bloom_id ?? '',

    description: form.description.trim() || null,

    /*
     * 新欄位：
     *
     * 明確送 true / false，
     * 不依賴 Backend Default。
     */
    show_example: form.show_example,

    knowledge_card_ids: [...form.knowledge_card_ids],
  };

  /*
   * Choice / True False
   */
  if (form.type === 'choice' || form.type === 'true_false') {
    payload.options = form.options.map((option) => ({
      title: option.title.trim(),

      description: option.description.trim() || null,

      is_answer: option.is_answer,
    }));
  }

  /*
   * Fill / Debug / Interpret
   */
  if (form.type === 'fill' || form.type === 'debug' || form.type === 'interpret') {
    payload.sub_answers = form.sub_answers.map((item, index) => ({
      sub_id: index + 1,

      answer: item.answer.trim(),

      description: item.description.trim() || null,
    }));
  }

  /*
   * Coding：
   *
   * 不送 options
   * 不送 sub_answers
   */

  return payload;
}

/*
 * ============================================================
 * Submit
 * ============================================================
 */

async function submitForm() {
  if (props.submitting) {
    return;
  }

  localError.value = '';

  const valid = await formRef.value?.validate();

  if (valid === false) {
    localError.value = '請先確認所有必填欄位';

    return;
  }

  const typeError = validateTypeSpecific();

  if (typeError) {
    localError.value = typeError;

    return;
  }

  const payload = buildRequest();

  emit('submit', payload);
}

/*
 * ============================================================
 * Dialog
 * ============================================================
 */

function closeDialog() {
  if (props.submitting) {
    return;
  }

  emit('update:modelValue', false);

  emit('close');
}

function handleDialogModelUpdate(value: boolean) {
  if (props.submitting && !value) {
    return;
  }

  emit('update:modelValue', value);

  if (!value) {
    emit('close');
  }
}

/*
 * ============================================================
 * Watch
 * ============================================================
 */

/*
 * Dialog 每次打開：
 *
 * Create → Reset
 * Edit   → 填入 question
 */
watch(
  () => props.modelValue,

  (open) => {
    if (open) {
      initializeForm();
    }
  },
);

/*
 * 編輯狀態下，
 * 如果 Parent 更新 question，
 * 同步重新填入。
 */
watch(
  () => props.question,

  (question) => {
    if (!props.modelValue || props.mode !== 'edit' || !question) {
      return;
    }

    fillForm(question);
  },
);
</script>
