<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="handleDialogUpdate">
    <q-card class="question-form-dialog">
      <!-- =====================================================
           Header
      ====================================================== -->
      <q-card-section class="question-form-dialog__header">
        <div>
          <div class="text-h6">
            {{ mode === 'create' ? '新增題目' : '編輯題目' }}
          </div>

          <div class="text-caption text-grey-7">設定題目內容、Bloom 層級與關聯知識點</div>
        </div>

        <q-btn flat round dense icon="close" :disable="saving" @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <!-- =====================================================
           Form
      ====================================================== -->
      <q-form ref="formRef" class="question-form-dialog__form" @submit.prevent="submitForm">
        <!--
          真正可以上下捲動的區域。

          不再使用 q-card-section 當 Scroll Container，
          直接使用原生 div + contentRef，
          讓程式可以精準控制 scrollTop。
        -->
        <div ref="contentRef" class="question-form-dialog__content">
          <!-- =================================================
               Basic
          ================================================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-title">基本資料</div>

            <!-- Title -->
            <div ref="titleFieldRef">
              <q-input
                v-model="form.title"
                outlined
                label="題目名稱 *"
                maxlength="255"
                :disable="saving"
                :rules="[(value) => Boolean(value?.trim()) || '請輸入題目名稱']"
              />
            </div>

            <!-- Type -->
            <div ref="typeFieldRef">
              <q-select
                :model-value="form.type"
                :options="questionTypeOptions"
                outlined
                emit-value
                map-options
                behavior="menu"
                label="題型 *"
                :disable="saving"
                :rules="[(value) => Boolean(value) || '請選擇題型']"
                @update:model-value="handleTypeChange"
              />
            </div>

            <!-- Question Content -->
            <div ref="questionContentFieldRef">
              <q-input
                v-model="form.questionContent"
                outlined
                type="textarea"
                autogrow
                label="題目內容 *"
                :disable="saving"
                :rules="[(value) => Boolean(value?.trim()) || '請輸入題目內容']"
              />
            </div>

            <!-- Fill Hint -->
            <q-banner v-if="form.type === 'fill'" rounded class="bg-blue-1 text-blue-9">
              填空題請在題目中使用
              <strong> （1）、（2）、（3） </strong>
              標示填空位置。

              <div class="q-mt-xs">例如：PHP 使用（1）函式定義常數，第一個參數為（2）。</div>
            </q-banner>

            <!-- Description -->
            <q-input
              v-model="form.description"
              outlined
              type="textarea"
              autogrow
              label="評量說明（選填）"
              hint="說明這一題主要要評量學生什麼能力"
              :disable="saving"
            />
          </section>

          <q-separator />

          <!-- =================================================
               Bloom
          ================================================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-title">Bloom 層級</div>

            <div ref="bloomFieldRef">
              <q-select
                v-model="form.bloomId"
                :options="bloomOptions"
                outlined
                emit-value
                map-options
                behavior="menu"
                label="Bloom 編碼 *"
                :disable="saving"
                :rules="[(value) => Boolean(value) || '請選擇 Bloom 編碼']"
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
            </div>
          </section>

          <q-separator />

          <!-- =================================================
               Knowledge Cards
          ================================================== -->
          <section class="question-form-dialog__section">
            <div class="question-form-dialog__section-title">關聯知識點</div>

            <div class="question-form-dialog__section-description">
              一題可以同時評量多個知識點。
            </div>

            <div ref="knowledgeCardFieldRef">
              <q-select
                v-model="form.knowledgeCardIds"
                :options="knowledgeCardOptions"
                outlined
                multiple
                use-chips
                emit-value
                map-options
                behavior="menu"
                label="知識點 *"
                :disable="saving"
                :rules="[
                  (value) => (Array.isArray(value) && value.length > 0) || '請至少選擇一個知識點',
                ]"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.label }}
                      </q-item-label>

                      <q-item-label caption>
                        {{ scope.opt.path }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      此課程目前沒有可使用的知識點
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </section>

          <!-- =================================================
               Choice / True False
          ================================================== -->
          <template v-if="isOptionType">
            <q-separator />

            <section ref="optionSectionRef" class="question-form-dialog__section">
              <div class="question-form-dialog__section-header">
                <div>
                  <div
                    class="question-form-dialog__section-title question-form-dialog__section-title2"
                  >
                    {{ form.type === 'true_false' ? '是非選項' : '選擇題選項' }}
                  </div>

                  <div class="question-form-dialog__section-description">請設定一個正確答案。</div>
                </div>

                <q-btn
                  v-if="form.type === 'choice'"
                  flat
                  color="blue"
                  icon="add"
                  label="新增選項"
                  :disable="saving"
                  @click="addOptionRow"
                />
              </div>

              <div class="question-form-dialog__option-list">
                <div
                  v-for="(option, index) in optionRows"
                  :key="option.key"
                  class="question-form-dialog__option-row"
                >
                  <!-- Correct -->
                  <div class="question-form-dialog__correct-radio">
                    <q-radio
                      :model-value="correctOptionKey"
                      :val="option.key"
                      color="blue"
                      :disable="saving"
                      @update:model-value="handleCorrectOptionChange"
                    />

                    <span> 正解 </span>
                  </div>

                  <!-- Option -->
                  <q-input
                    v-model="option.title"
                    outlined
                    dense
                    :label="`選項 ${index + 1} *`"
                    :disable="saving"
                    :rules="[(value) => Boolean(value?.trim()) || '請輸入選項內容']"
                  />

                  <!-- Description -->
                  <q-input
                    v-model="option.description"
                    outlined
                    dense
                    label="選項說明（選填）"
                    :disable="saving"
                  />

                  <!-- Delete -->
                  <q-btn
                    v-if="form.type === 'choice'"
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    :disable="saving || optionRows.length <= 2"
                    @click="removeOptionRow(option.key)"
                  >
                    <q-tooltip> 刪除選項 </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div v-if="optionErrorMessage" class="question-form-dialog__form-error">
                {{ optionErrorMessage }}
              </div>
            </section>
          </template>

          <!-- =================================================
               Fill / Debug / Interpret
          ================================================== -->
          <template v-if="isSubAnswerType">
            <q-separator />

            <section ref="subAnswerSectionRef" class="question-form-dialog__section">
              <div class="question-form-dialog__section-header">
                <div>
                  <div
                    class="question-form-dialog__section-title question-form-dialog__section-title2"
                  >
                    {{ subAnswerSectionTitle }}
                  </div>

                  <div class="question-form-dialog__section-description">
                    {{ subAnswerSectionDescription }}
                  </div>
                </div>

                <q-btn
                  flat
                  color="blue"
                  icon="add"
                  label="新增答案"
                  :disable="saving"
                  @click="addSubAnswerRow"
                />
              </div>

              <div class="question-form-dialog__sub-list">
                <div
                  v-for="sub in subAnswerRows"
                  :key="sub.key"
                  class="question-form-dialog__sub-row"
                >
                  <!-- Sub ID -->
                  <q-input
                    v-model.number="sub.subId"
                    outlined
                    dense
                    type="number"
                    min="1"
                    :label="subIdLabel"
                    :disable="saving"
                    class="question-form-dialog__sub-id"
                    :rules="[
                      (value) =>
                        (Number.isInteger(Number(value)) && Number(value) > 0) ||
                        '請輸入大於 0 的整數',
                    ]"
                  />

                  <!-- Answer -->
                  <q-input
                    v-model="sub.answer"
                    outlined
                    dense
                    label="標準答案 *"
                    :disable="saving"
                    class="question-form-dialog__sub-answer"
                    :rules="[(value) => Boolean(value?.trim()) || '請輸入標準答案']"
                  />

                  <!-- Description -->
                  <q-input
                    v-model="sub.description"
                    outlined
                    dense
                    label="答案說明（選填）"
                    :disable="saving"
                    class="question-form-dialog__sub-description"
                  />

                  <!-- Delete -->
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    :disable="saving || subAnswerRows.length <= 1"
                    @click="removeSubAnswerRow(sub.key)"
                  >
                    <q-tooltip> 刪除答案 </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div v-if="subAnswerErrorMessage" class="question-form-dialog__form-error">
                {{ subAnswerErrorMessage }}
              </div>
            </section>
          </template>

          <!-- =================================================
               Coding
          ================================================== -->
          <template v-if="form.type === 'coding'">
            <q-separator />

            <section class="question-form-dialog__section">
              <q-banner rounded class="bg-blue-1 text-blue-9">
                實作題不需要設定標準答案。

                <div class="q-mt-xs">學生提交程式碼後，會等待教師進行 Bloom 覆核。</div>
              </q-banner>
            </section>
          </template>

          <!-- =================================================
               Backend Error
          ================================================== -->
          <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative">
            {{ errorMessage }}
          </q-banner>
        </div>

        <q-separator />

        <!-- ===================================================
             Actions
        ==================================================== -->
        <q-card-actions align="right" class="question-form-dialog__actions">
          <q-btn flat label="取消" :disable="saving" @click="closeDialog" />

          <q-btn
            unelevated
            color="blue"
            icon="save"
            :label="mode === 'create' ? '新增題目' : '儲存修改'"
            type="submit"
            :loading="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';

import type { QForm } from 'quasar';

import type {
  TeacherBloom,
  TeacherQuestion,
  TeacherQuestionKnowledgeCardOption,
  TeacherQuestionRequest,
  TeacherQuestionType,
} from '../../../types/teacher-question';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    modelValue: boolean;

    mode: 'create' | 'edit';

    question: TeacherQuestion | null;

    blooms: TeacherBloom[];

    knowledgeCards: TeacherQuestionKnowledgeCardOption[];

    saving: boolean;

    errorMessage?: string;
  }>(),
  {
    question: null,

    errorMessage: '',
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  (
    event: 'update:modelValue',

    value: boolean,
  ): void;

  (
    event: 'submit',

    value: TeacherQuestionRequest,
  ): void;

  (event: 'clear-error'): void;
}>();

/*
 * ============================================================
 * Internal Types
 * ============================================================
 */

interface QuestionFormState {
  title: string;

  type: TeacherQuestionType;

  questionContent: string;

  bloomId: string;

  description: string;

  knowledgeCardIds: number[];
}

interface QuestionOptionRow {
  key: number;

  title: string;

  description: string;
}

interface QuestionSubAnswerRow {
  key: number;

  subId: number;

  answer: string;

  description: string;
}

/*
 * ============================================================
 * Form
 * ============================================================
 */

const formRef = ref<QForm | null>(null);

/*
 * 真正的 Scroll Container。
 */
const contentRef = ref<HTMLElement | null>(null);

/*
 * ============================================================
 * Required Field Scroll Targets
 * ============================================================
 */

const titleFieldRef = ref<HTMLElement | null>(null);

const typeFieldRef = ref<HTMLElement | null>(null);

const questionContentFieldRef = ref<HTMLElement | null>(null);

const bloomFieldRef = ref<HTMLElement | null>(null);

const knowledgeCardFieldRef = ref<HTMLElement | null>(null);

/*
 * 自訂驗證使用的 Scroll Target。
 */
const optionSectionRef = ref<HTMLElement | null>(null);

const subAnswerSectionRef = ref<HTMLElement | null>(null);

const form = reactive<QuestionFormState>({
  title: '',

  type: 'choice',

  questionContent: '',

  bloomId: '',

  description: '',

  knowledgeCardIds: [],
});

/*
 * ============================================================
 * Dynamic Rows
 * ============================================================
 */

let nextRowKey = 1;

const optionRows = ref<QuestionOptionRow[]>([]);

const correctOptionKey = ref<number | null>(null);

const subAnswerRows = ref<QuestionSubAnswerRow[]>([]);

const optionErrorMessage = ref('');

const subAnswerErrorMessage = ref('');

/*
 * ============================================================
 * Question Type
 * ============================================================
 */

const questionTypeOptions = [
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
    label: '解讀題',

    value: 'interpret',
  },

  {
    label: '實作題',

    value: 'coding',
  },
];

/*
 * ============================================================
 * Type Groups
 * ============================================================
 */

const isOptionType = computed(() => {
  return form.type === 'choice' || form.type === 'true_false';
});

const isSubAnswerType = computed(() => {
  return form.type === 'fill' || form.type === 'debug' || form.type === 'interpret';
});

/*
 * ============================================================
 * Sub Answer Labels
 * ============================================================
 */

const subAnswerSectionTitle = computed(() => {
  switch (form.type) {
    case 'fill':
      return '填空答案';

    case 'debug':
      return '除錯答案';

    case 'interpret':
      return '解讀答案';

    default:
      return '標準答案';
  }
});

const subAnswerSectionDescription = computed(() => {
  switch (form.type) {
    case 'fill':
      return 'sub_id 對應題目中的（1）、（2）、（3）填空位置。';

    case 'debug':
      return '設定需要學生找出或修正的錯誤位置與標準答案。';

    case 'interpret':
      return '設定學生需要回答的各個解讀項目與標準答案。';

    default:
      return '';
  }
});

const subIdLabel = computed(() => {
  switch (form.type) {
    case 'debug':
      return '行號 / 編號 *';

    default:
      return '答案編號 *';
  }
});

/*
 * ============================================================
 * Bloom Options
 * ============================================================
 */

const bloomOptions = computed(() => {
  return props.blooms.map((bloom) => ({
    label: `${bloom.id}｜${bloom.title}`,

    value: bloom.id,

    caption: bloom.cognition_info,
  }));
});

/*
 * ============================================================
 * Knowledge Card Options
 * ============================================================
 */

const knowledgeCardOptions = computed(() => {
  return props.knowledgeCards.map((card) => {
    const path = [card.topic_name, card.chapter_name, card.unit_name].filter(Boolean).join(' / ');

    return {
      label: card.title,

      value: card.id,

      path: path || '已脫離教材樹的知識點',
    };
  });
});

/*
 * ============================================================
 * Dialog Init
 * ============================================================
 */

watch(
  () => props.modelValue,

  (isOpen) => {
    if (!isOpen) {
      return;
    }

    initializeForm();
  },
);

/*
 * ============================================================
 * Initialize
 * ============================================================
 */

function initializeForm() {
  optionErrorMessage.value = '';

  subAnswerErrorMessage.value = '';

  emit('clear-error');

  /*
   * 每次開啟 Dialog，
   * 先清除舊的正解 key。
   *
   * 否則 Edit A → Edit B 時，
   * 如果 B 沒有正解資料，
   * 可能殘留 A 的 key。
   */
  correctOptionKey.value = null;

  /*
   * =========================
   * Edit
   * =========================
   */
  if (props.mode === 'edit' && props.question) {
    const question = props.question;

    form.title = question.title;

    form.type = question.type;

    form.questionContent = question.question_content;

    form.bloomId = question.bloom_id ?? '';

    form.description = question.description ?? '';

    form.knowledgeCardIds = [...question.knowledge_card_ids];

    /*
     * Options
     */
    optionRows.value = question.options.map((option) => {
      const key = nextRowKey++;

      if (option.is_answer) {
        correctOptionKey.value = key;
      }

      return {
        key,

        title: option.title,

        description: option.description ?? '',
      };
    });

    /*
     * Sub Answers
     */
    subAnswerRows.value = question.sub_answers.map((sub) => ({
      key: nextRowKey++,

      subId: sub.sub_id,

      answer: sub.answer,

      description: sub.description ?? '',
    }));

    /*
     * 防止舊資料沒有 rows。
     */
    ensureRowsForType();

    resetDialogState();

    return;
  }

  /*
   * =========================
   * Create
   * =========================
   */
  form.title = '';

  form.type = 'choice';

  form.questionContent = '';

  form.bloomId = '';

  form.description = '';

  form.knowledgeCardIds = [];

  optionRows.value = [];

  subAnswerRows.value = [];

  correctOptionKey.value = null;

  resetRowsForType('choice');

  resetDialogState();
}

/*
 * ============================================================
 * Reset Dialog State
 * ============================================================
 */

function resetDialogState() {
  void nextTick(() => {
    /*
     * 清除 QForm Validation。
     */
    formRef.value?.resetValidation();

    /*
     * 每次開啟 Dialog
     * 都回到最上面。
     */
    contentRef.value?.scrollTo({
      top: 0,

      behavior: 'auto',
    });
  });
}

/*
 * ============================================================
 * Type Change
 * ============================================================
 */

function handleTypeChange(value: TeacherQuestionType | null) {
  if (!value) {
    return;
  }

  if (form.type === value) {
    return;
  }

  form.type = value;

  resetRowsForType(value);

  /*
   * 切換題型後清除舊驗證。
   */
  void nextTick(() => {
    formRef.value?.resetValidation();
  });
}

/*
 * ============================================================
 * Reset Rows By Type
 * ============================================================
 */

function resetRowsForType(type: TeacherQuestionType) {
  optionErrorMessage.value = '';

  subAnswerErrorMessage.value = '';

  optionRows.value = [];

  subAnswerRows.value = [];

  correctOptionKey.value = null;

  /*
   * Choice
   */
  if (type === 'choice') {
    optionRows.value = [createOptionRow(), createOptionRow(), createOptionRow(), createOptionRow()];

    return;
  }

  /*
   * True / False
   */
  if (type === 'true_false') {
    optionRows.value = [createOptionRow('是'), createOptionRow('否')];

    return;
  }

  /*
   * Sub Answer Types
   */
  if (type === 'fill' || type === 'debug' || type === 'interpret') {
    subAnswerRows.value = [createSubAnswerRow(1)];
  }
}

/*
 * ============================================================
 * Ensure Rows
 * ============================================================
 */

function ensureRowsForType() {
  if (isOptionType.value && optionRows.value.length === 0) {
    resetRowsForType(form.type);

    return;
  }

  if (isSubAnswerType.value && subAnswerRows.value.length === 0) {
    resetRowsForType(form.type);
  }
}

/*
 * ============================================================
 * Option Rows
 * ============================================================
 */

function createOptionRow(title = ''): QuestionOptionRow {
  return {
    key: nextRowKey++,

    title,

    description: '',
  };
}

function addOptionRow() {
  optionRows.value.push(createOptionRow());
}

function removeOptionRow(key: number) {
  if (optionRows.value.length <= 2) {
    return;
  }

  optionRows.value = optionRows.value.filter((option) => option.key !== key);

  if (correctOptionKey.value === key) {
    correctOptionKey.value = null;
  }
}

function handleCorrectOptionChange(value: number) {
  correctOptionKey.value = value;
}

/*
 * ============================================================
 * Sub Answer Rows
 * ============================================================
 */

function createSubAnswerRow(subId: number): QuestionSubAnswerRow {
  return {
    key: nextRowKey++,

    subId,

    answer: '',

    description: '',
  };
}

function addSubAnswerRow() {
  const maxSubId = subAnswerRows.value.reduce(
    (max, row) => Math.max(max, Number(row.subId) || 0),

    0,
  );

  subAnswerRows.value.push(createSubAnswerRow(maxSubId + 1));
}

function removeSubAnswerRow(key: number) {
  if (subAnswerRows.value.length <= 1) {
    return;
  }

  subAnswerRows.value = subAnswerRows.value.filter((row) => row.key !== key);
}

/*
 * ============================================================
 * Validate Options
 * ============================================================
 */

function validateOptions(): boolean {
  optionErrorMessage.value = '';

  if (!isOptionType.value) {
    return true;
  }

  if (optionRows.value.length < 2) {
    optionErrorMessage.value = '請至少建立兩個選項。';

    return false;
  }

  if (form.type === 'true_false' && optionRows.value.length !== 2) {
    optionErrorMessage.value = '是非題必須剛好有兩個選項。';

    return false;
  }

  /*
   * 空白內容本身已經由
   * QInput rules 處理。
   *
   * 這裡仍保留第二層保護。
   */
  const hasEmpty = optionRows.value.some((option) => !option.title.trim());

  if (hasEmpty) {
    optionErrorMessage.value = '請完整填寫所有選項內容。';

    return false;
  }

  /*
   * 重複選項。
   */
  const normalizedTitles = optionRows.value.map((option) => option.title.trim().toLowerCase());

  if (new Set(normalizedTitles).size !== normalizedTitles.length) {
    optionErrorMessage.value = '選項內容不可重複。';

    return false;
  }

  /*
   * 正確答案。
   */
  const hasCorrect = optionRows.value.some((option) => option.key === correctOptionKey.value);

  if (!hasCorrect) {
    optionErrorMessage.value = '請指定一個正確答案。';

    return false;
  }

  return true;
}

/*
 * ============================================================
 * Validate Sub Answers
 * ============================================================
 */

function validateSubAnswers(): boolean {
  subAnswerErrorMessage.value = '';

  if (!isSubAnswerType.value) {
    return true;
  }

  if (subAnswerRows.value.length === 0) {
    subAnswerErrorMessage.value = '請至少設定一個標準答案。';

    return false;
  }

  /*
   * ID 合法性。
   *
   * QInput rules 已處理，
   * 這裡仍保留第二層保護。
   */
  const invalidSubId = subAnswerRows.value.some((row) => {
    const id = Number(row.subId);

    return !Number.isInteger(id) || id <= 0;
  });

  if (invalidSubId) {
    subAnswerErrorMessage.value = '答案編號必須是大於 0 的整數。';

    return false;
  }

  /*
   * 標準答案必填。
   */
  const emptyAnswer = subAnswerRows.value.some((row) => !row.answer.trim());

  if (emptyAnswer) {
    subAnswerErrorMessage.value = '請完整填寫所有標準答案。';

    return false;
  }

  /*
   * sub_id 不可重複。
   */
  const ids = subAnswerRows.value.map((row) => Number(row.subId));

  if (new Set(ids).size !== ids.length) {
    subAnswerErrorMessage.value = '答案編號不可重複。';

    return false;
  }

  return true;
}

/*
 * ============================================================
 * Scroll Helpers
 * ============================================================
 */

/*
 * 判斷某個 Element 是否真的可以垂直捲動。
 */
function isVerticalScrollable(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);

  const overflowY = style.overflowY;

  const canScroll = overflowY === 'auto' || overflowY === 'scroll';

  return canScroll && element.scrollHeight > element.clientHeight;
}

/*
 * 從 Target 一路往父層找，
 * 找出現在真正負責 Scroll 的 Element。
 *
 * 不再假設一定是 contentRef。
 */
function findScrollContainer(target: HTMLElement): HTMLElement | null {
  let current = target.parentElement;

  while (current) {
    if (isVerticalScrollable(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

/*
 * ============================================================
 * Scroll To Element
 * ============================================================
 */

async function scrollToElement(target: HTMLElement | null) {
  if (!target) {
    return;
  }

  /*
   * 等 Validation Error、
   * DOM 高度等全部更新。
   */
  await nextTick();

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });

  /*
   * 找真正會 Scroll 的父層。
   */
  const scrollContainer = findScrollContainer(target);

  /*
   * 找不到 Scroll Parent 時，
   * 最後保底使用 scrollIntoView。
   */
  if (!scrollContainer) {
    target.scrollIntoView({
      behavior: 'smooth',

      block: 'start',
    });

    return;
  }

  /*
   * Scroll Container
   * 目前的位置。
   */
  const containerRect = scrollContainer.getBoundingClientRect();

  /*
   * Error Field
   * 目前的位置。
   */
  const targetRect = target.getBoundingClientRect();

  /*
   * 算出 Target 在真正 Scroll Container
   * 中的位置。
   */
  const top = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 24;

  /*
   * 控制真正有 Scroll 的 Element。
   */
  scrollContainer.scrollTo({
    top: Math.max(0, top),

    behavior: 'smooth',
  });

  /*
   * Scroll 完後 Focus。
   */
  window.setTimeout(
    () => {
      const input = target.querySelector<HTMLElement>('input, textarea, [tabindex]');

      input?.focus({
        preventScroll: true,
      });
    },

    350,
  );
}

/*
 * ============================================================
 * Find First Invalid Required Field
 * ============================================================
 */

function getFirstInvalidRequiredField(): HTMLElement | null {
  /*
   * 1. 題目名稱
   */
  if (!form.title.trim()) {
    return titleFieldRef.value;
  }

  /*
   * 2. 題型
   */
  if (!form.type) {
    return typeFieldRef.value;
  }

  /*
   * 3. 題目內容
   */
  if (!form.questionContent.trim()) {
    return questionContentFieldRef.value;
  }

  /*
   * 4. Bloom
   */
  if (!form.bloomId) {
    return bloomFieldRef.value;
  }

  /*
   * 5. Knowledge Card
   */
  if (form.knowledgeCardIds.length === 0) {
    return knowledgeCardFieldRef.value;
  }

  return null;
}

/*
 * ============================================================
 * Submit
 * ============================================================
 */

async function submitForm() {
  emit('clear-error');

  optionErrorMessage.value = '';

  subAnswerErrorMessage.value = '';

  /*
   * ==========================================================
   * 1. 先讓 Quasar 顯示所有欄位錯誤
   * ==========================================================
   */
  const baseValid = await formRef.value?.validate();

  /*
   * ==========================================================
   * 2. 基本必填欄位
   * ==========================================================
   */
  if (!baseValid) {
    const firstInvalidField = getFirstInvalidRequiredField();

    /*
     * 我們自己控制 Scroll，
     * 不再依賴 Quasar Focus。
     */
    if (firstInvalidField) {
      await scrollToElement(firstInvalidField);

      return;
    }

    /*
     * 如果不是上面基本欄位，
     * 就可能是 Option / Sub Answer。
     */
    if (isOptionType.value) {
      const emptyOption = optionRows.value.some((option) => !option.title.trim());

      if (emptyOption) {
        await scrollToElement(optionSectionRef.value);

        return;
      }
    }

    if (isSubAnswerType.value) {
      const invalidSub = subAnswerRows.value.some((sub) => {
        const id = Number(sub.subId);

        return !Number.isInteger(id) || id <= 0 || !sub.answer.trim();
      });

      if (invalidSub) {
        await scrollToElement(subAnswerSectionRef.value);

        return;
      }
    }

    return;
  }

  /*
   * ==========================================================
   * 3. Choice / True False 自訂驗證
   * ==========================================================
   */
  const optionsValid = validateOptions();

  if (!optionsValid) {
    await scrollToElement(optionSectionRef.value);

    return;
  }

  /*
   * ==========================================================
   * 4. Fill / Debug / Interpret 自訂驗證
   * ==========================================================
   */
  const subAnswersValid = validateSubAnswers();

  if (!subAnswersValid) {
    await scrollToElement(subAnswerSectionRef.value);

    return;
  }

  /*
   * ==========================================================
   * 5. Build Payload
   * ==========================================================
   */

  const payload: TeacherQuestionRequest = {
    title: form.title.trim(),

    type: form.type,

    question_content: form.questionContent.trim(),

    bloom_id: form.bloomId,

    description: form.description.trim() || null,

    knowledge_card_ids: [...form.knowledgeCardIds],
  };

  if (isOptionType.value) {
    payload.options = optionRows.value.map((option) => ({
      title: option.title.trim(),

      description: option.description.trim() || null,

      is_answer: option.key === correctOptionKey.value,
    }));
  }

  if (isSubAnswerType.value) {
    payload.sub_answers = subAnswerRows.value
      .map((sub) => ({
        sub_id: Number(sub.subId),

        answer: sub.answer.trim(),

        description: sub.description.trim() || null,
      }))
      .sort((a, b) => a.sub_id - b.sub_id);
  }

  emit('submit', payload);
}

/*
 * ============================================================
 * Dialog
 * ============================================================
 */

function handleDialogUpdate(value: boolean) {
  if (props.saving) {
    return;
  }

  emit('update:modelValue', value);
}

function closeDialog() {
  if (props.saving) {
    return;
  }

  emit('update:modelValue', false);

  emit('clear-error');
}
</script>
