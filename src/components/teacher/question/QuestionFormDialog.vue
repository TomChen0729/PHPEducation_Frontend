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

              <!-- 填空題：題幹也使用 CodeMirror，保留程式碼格式與換行 -->
              <div v-if="form.type === 'fill'" class="question-form-dialog__full">
                <div class="text-subtitle2 q-mb-xs">填空題題目 *</div>

                <div class="text-caption text-grey-7 q-mb-sm">
                  請在要作答的位置使用（1）、（2）標示空格。
                </div>

                <CodeEditor
                  v-model="form.question_content"
                  theme="teacher"
                  :disabled="submitting"
                />
              </div>

              <!-- 除錯題：使用 CodeMirror 編輯完整錯誤程式碼 -->
              <div v-else-if="form.type === 'debug'" class="question-form-dialog__full">
                <div class="text-subtitle2 q-mb-xs">待除錯程式碼 *</div>

                <div class="text-caption text-grey-7 q-mb-sm">
                  行號會直接對應下方「錯誤行號」，請在設定答案後避免再插入或刪除前面的程式行。
                </div>

                <CodeEditor
                  v-model="form.question_content"
                  theme="teacher"
                  :disabled="submitting"
                />
              </div>

              <!-- 程式解讀題：提問文字 + CodeMirror 程式碼 -->
              <div
                v-else-if="form.type === 'interpret'"
                class="question-form-dialog__full question-form-dialog__interpret-editor"
              >
                <q-input
                  v-model="form.interpret_prompt"
                  outlined
                  type="textarea"
                  autogrow
                  label="提問方式 *"
                  hint="例如：請判斷並說明下列程式最後會輸出什麼結果。"
                  :disable="submitting"
                  :rules="[requiredTextRule]"
                  lazy-rules
                />

                <div>
                  <div class="text-subtitle2 q-mb-xs">待解讀程式碼 *</div>

                  <div class="text-caption text-grey-7 q-mb-sm">
                    學生作答時會以 CodeMirror 顯示這段程式碼。
                  </div>

                  <CodeEditor
                    v-model="form.interpret_code"
                    theme="teacher"
                    :disabled="submitting"
                  />
                </div>
              </div>

              <!-- 其他題型：維持一般文字輸入 -->
              <q-input
                v-else
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
               Fill
          ========================== -->
          <section v-if="form.type === 'fill'" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">標準答案</div>

                <div class="question-form-dialog__section-description">
                  依題幹中的（1）、（2）順序設定每一格標準答案。
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
                :key="index"
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
               Interpret
          ========================== -->
          <section v-if="form.type === 'interpret'" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">標準解讀答案</div>

                <div class="question-form-dialog__section-description">
                  程式解讀題固定只有一個答案，用來評估學生對程式執行結果的判斷、推演與解釋能力。
                </div>
              </div>
            </div>

            <div class="question-form-dialog__interpret-answer">
              <q-input
                v-model="form.interpret_answer"
                outlined
                type="textarea"
                autogrow
                label="標準答案 *"
                hint="填寫此程式執行後的結果，或完整的推演與解釋。"
                :disable="submitting"
                :rules="[requiredTextRule]"
                lazy-rules
              />

              <q-input
                v-model="form.interpret_answer_description"
                outlined
                type="textarea"
                autogrow
                label="答案說明（選填）"
                hint="作答完成後可提供給學生的解釋。"
                :disable="submitting"
              />
            </div>
          </section>

          <!-- =========================
     Debug
========================== -->
          <section v-if="form.type === 'debug'" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">錯誤行與標準修正</div>

                <div class="question-form-dialog__section-description">
                  題目內容請放完整的錯誤程式碼； 這裡只填「錯誤行號、修正後程式碼、錯誤原因」。
                </div>
              </div>

              <q-btn
                flat
                color="blue"
                icon="add"
                label="新增錯誤行"
                :disable="submitting"
                @click="addSubAnswer"
              />
            </div>

            <div class="question-form-dialog__sub-answer-list">
              <div
                v-for="(item, index) in form.sub_answers"
                :key="index"
                class="question-form-dialog__sub-answer question-form-dialog__sub-answer--debug"
              >
                <div class="question-form-dialog__sub-answer-number">
                  {{ index + 1 }}
                </div>

                <div class="question-form-dialog__debug-fields">
                  <q-input
                    v-model.number="item.sub_id"
                    outlined
                    type="number"
                    min="1"
                    label="錯誤行號 *"
                    hint="例如：第 4 行有錯就輸入 4"
                    :disable="submitting"
                    :rules="[positiveIntegerRule]"
                    lazy-rules
                  />

                  <q-input
                    v-model="item.answer"
                    outlined
                    label="修正後程式碼 *"
                    :disable="submitting"
                    :rules="[requiredTextRule]"
                    lazy-rules
                  />

                  <q-input
                    v-model="item.description"
                    outlined
                    type="textarea"
                    label="錯誤原因（選填）"
                    class="question-form-dialog__full"
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
                  <q-tooltip> 刪除錯誤行 </q-tooltip>
                </q-btn>
              </div>
            </div>
          </section>

          <!-- =========================
               Coding
          ========================== -->
          <section v-if="form.type === 'coding'" class="question-form-dialog__section">
            <div class="question-form-dialog__section-header">
              <div>
                <div class="question-form-dialog__section-title">程式實作設定</div>

                <div class="question-form-dialog__section-description">
                  設定學生可看到的初始程式碼，以及只提供教師查看的希望的答案與參考答案。
                </div>
              </div>
            </div>

            <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
              <template #avatar>
                <q-icon name="code" color="blue" />
              </template>

              初始程式碼會提供給學生；希望的答案與參考答案只供教師覆核使用。
            </q-banner>

            <div class="question-form-dialog__coding-fields">
              <div class="question-form-dialog__coding-editor">
                <div class="text-subtitle2 q-mb-xs">初始程式碼 / 已知條件（選填）</div>

                <div class="text-caption text-grey-7 q-mb-sm">
                  學生作答時會看到這段內容，並可直接在此基礎上繼續完成程式。
                </div>

                <CodeEditor v-model="form.starter_code" theme="teacher" :disabled="submitting" />
              </div>

              <div class="question-form-dialog__coding-editor">
                <div class="text-subtitle2 q-mb-xs">希望的答案（選填）</div>

                <div class="text-caption text-grey-7 q-mb-sm">
                  只供教師覆核使用，不會回傳給學生。
                </div>

                <CodeEditor v-model="form.expected_output" theme="teacher" :disabled="submitting" />
              </div>

              <div class="question-form-dialog__coding-editor">
                <div class="text-subtitle2 q-mb-xs">參考答案（選填）</div>

                <div class="text-caption text-grey-7 q-mb-sm">
                  只供教師覆核使用，不會回傳給學生。
                </div>

                <CodeEditor
                  v-model="form.reference_answer"
                  theme="teacher"
                  :disabled="submitting"
                />
              </div>
            </div>
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

import CodeEditor from '../../common/CodeEditor.vue';

import type {
  TeacherBloom,
  TeacherQuestion,
  TeacherQuestionKnowledgeCardOption,
  TeacherQuestionOptionInput,
  TeacherQuestionRequest,
  TeacherQuestionSubAnswerInput,
  TeacherQuestionType,
} from '../../../types/teacher-question.js';

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
type QuestionSubAnswerForm = Omit<TeacherQuestionSubAnswerInput, 'description' | 'sub_id'> & {
  sub_id: number | null;

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
  | 'bloom_id'
  | 'description'
  | 'options'
  | 'sub_answers'
  | 'starter_code'
  | 'expected_output'
  | 'reference_answer'
> & {
  bloom_id: string | null;

  description: string;

  options: QuestionOptionForm[];

  sub_answers: QuestionSubAnswerForm[];

  starter_code: string;

  expected_output: string;

  reference_answer: string;

  interpret_prompt: string;

  interpret_code: string;

  interpret_answer: string;

  interpret_answer_description: string;
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

function createSubAnswers(type: TeacherQuestionType): QuestionSubAnswerForm[] {
  return [
    {
      /*
       * Fill / Interpret：
       * sub_id 由答案順序決定。
       *
       * Debug：
       * sub_id 必須由老師輸入實際錯誤行號。
       */
      sub_id: type === 'debug' ? null : 1,

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

    starter_code: '',

    expected_output: '',

    reference_answer: '',

    interpret_prompt: '',

    interpret_code: '',

    interpret_answer: '',

    interpret_answer_description: '',
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

const INTERPRET_CODE_MARKER = '<!--code-stem-->';

function splitInterpretContent(content: string) {
  const markerIndex = content.indexOf(INTERPRET_CODE_MARKER);

  if (markerIndex < 0) {
    return {
      prompt: '',
      code: content,
    };
  }

  return {
    prompt: content.slice(0, markerIndex).trim(),
    code: content.slice(markerIndex + INTERPRET_CODE_MARKER.length).trim(),
  };
}

function buildInterpretContent() {
  return `${form.interpret_prompt.trim()}\n${INTERPRET_CODE_MARKER}\n${form.interpret_code}`;
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

  if (question.type === 'interpret') {
    const interpretContent = splitInterpretContent(question.question_content);

    form.interpret_prompt = interpretContent.prompt;

    form.interpret_code = interpretContent.code;
  } else {
    form.interpret_prompt = '';

    form.interpret_code = '';
  }

  form.bloom_id = question.bloom_id;

  form.description = question.description ?? '';

  form.starter_code = question.starter_code ?? '';

  form.expected_output = question.expected_output ?? '';

  form.reference_answer = question.reference_answer ?? '';

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

  if (form.type === 'interpret') {
    const firstAnswer = form.sub_answers[0];

    form.interpret_answer = firstAnswer?.answer ?? '';

    form.interpret_answer_description = firstAnswer?.description ?? '';

    form.sub_answers = createSubAnswers('interpret');
  } else {
    form.interpret_answer = '';

    form.interpret_answer_description = '';
  }

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
    form.sub_answers = createSubAnswers(form.type);
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
      form.options = [];

      form.sub_answers = createSubAnswers(type);

      break;

    case 'interpret':
      form.options = [];

      form.sub_answers = createSubAnswers('interpret');

      form.question_content = '';

      form.interpret_prompt = '';

      form.interpret_code = '';

      form.interpret_answer = '';

      form.interpret_answer_description = '';

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
    /*
     * Debug 必須讓老師自行指定錯誤行號。
     */
    sub_id: form.type === 'debug' ? null : form.sub_answers.length + 1,

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
   * Fill / Interpret：
   * sub_id 是答案順序，所以重新編號。
   *
   * Debug：
   * sub_id 是真實行號，不能重新編號。
   */
  if (form.type !== 'debug') {
    form.sub_answers.forEach((item, itemIndex) => {
      item.sub_id = itemIndex + 1;
    });
  }
}

/*
 * ============================================================
 * Type-specific Validation
 * ============================================================
 */

function validateTypeSpecific(): string | null {
  /*
   * Debug 的題目內容改用 CodeMirror，
   * 不會經過 q-input rules，因此在這裡補必填驗證。
   */
  if (form.type === 'debug' && !form.question_content.trim()) {
    return '請輸入待除錯程式碼';
  }

  if (form.type === 'interpret') {
    if (!form.interpret_prompt.trim()) {
      return '請輸入程式解讀題的提問方式';
    }

    if (!form.interpret_code.trim()) {
      return '請輸入待解讀程式碼';
    }
  }

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
   * Interpret 固定單一答案。
   */
  if (form.type === 'interpret' && !form.interpret_answer.trim()) {
    return '請填寫程式解讀題的標準答案';
  }

  /*
   * Fill / Debug
   */
  if (form.type === 'fill' || form.type === 'debug') {
    if (form.sub_answers.length === 0) {
      return '請至少設定一個標準答案';
    }

    const hasEmptyAnswer = form.sub_answers.some((item) => !item.answer.trim());

    if (hasEmptyAnswer) {
      return form.type === 'debug' ? '請填寫完整的修正後程式碼' : '請填寫完整的標準答案';
    }

    if (form.type === 'debug') {
      const lineNumbers = form.sub_answers.map((item) => item.sub_id);

      const hasInvalidLineNumber = lineNumbers.some(
        (lineNumber) => lineNumber === null || !Number.isInteger(lineNumber) || lineNumber <= 0,
      );

      if (hasInvalidLineNumber) {
        return '請填寫正確的錯誤行號';
      }

      const totalLines = form.question_content.split(/\r?\n/).length;

      const hasOutOfRangeLineNumber = lineNumbers.some(
        (lineNumber) => lineNumber !== null && lineNumber > totalLines,
      );

      if (hasOutOfRangeLineNumber) {
        return `錯誤行號不可超過程式碼總行數（${totalLines} 行）`;
      }

      const uniqueLineNumbers = new Set(lineNumbers);

      if (uniqueLineNumbers.size !== lineNumbers.length) {
        return '同一個錯誤行號不可重複設定';
      }
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

    /*
     * Debug 的 sub_id 是實際程式行號。
     * 不可 trim 掉前後空白行，否則儲存後行號可能位移。
     */
    question_content:
      form.type === 'debug' || form.type === 'fill'
        ? form.question_content
        : form.type === 'interpret'
          ? buildInterpretContent()
          : form.question_content.trim(),

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
   * Fill
   */
  if (form.type === 'fill') {
    payload.sub_answers = form.sub_answers.map((item, index) => ({
      sub_id: index + 1,

      answer: item.answer.trim(),

      description: item.description.trim() || null,
    }));
  }

  /*
   * Interpret
   *
   * 程式解讀題固定只有一個標準答案。
   */
  if (form.type === 'interpret') {
    payload.sub_answers = [
      {
        sub_id: 1,

        answer: form.interpret_answer.trim(),

        description: form.interpret_answer_description.trim() || null,
      },
    ];
  }

  /*
   * Debug
   */
  if (form.type === 'debug') {
    payload.sub_answers = form.sub_answers.map((item) => ({
      /*
       * 使用老師真正輸入的錯誤行號。
       */
      sub_id: item.sub_id as number,

      answer: item.answer.trim(),

      description: item.description.trim() || null,
    }));
  }

  if (form.type === 'coding') {
    payload.starter_code = nullableText(form.starter_code);

    payload.expected_output = nullableText(form.expected_output);

    payload.reference_answer = nullableText(form.reference_answer);
  }

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

function positiveIntegerRule(value: number | string | null | undefined) {
  const numberValue = Number(value);

  return (Number.isInteger(numberValue) && numberValue > 0) || '請輸入大於 0 的整數行號';
}

function nullableText(value: string): string | null {
  return value.trim() ? value : null;
}
</script>
