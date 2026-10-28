<template>
  <div class="student-question-page">
    <header class="student-question-page__header">
      <div class="student-question-page__header-main">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="goBack">
          <q-tooltip>返回教材</q-tooltip>
        </q-btn>

        <div>
          <div class="student-question-page__title">題目練習</div>
        </div>
      </div>

      <div v-if="!loading && validCourseId" class="student-question-page__header-counts">
        <q-badge outline color="teal-7"> 顯示 {{ questionCount }} 題 </q-badge>
        <span v-if="overviewQuestions.length > 0" class="student-question-page__header-total">
          全部 {{ overviewQuestions.length }} 題
        </span>
      </div>
    </header>

    <q-banner
      v-if="!validCourseId"
      rounded
      class="bg-red-1 text-negative student-question-page__error"
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      課程編號錯誤，無法取得題目。
    </q-banner>

    <template v-else>
      <section class="student-question-page__scope-section">
        <div class="student-question-page__section-header">
          <div>
            <div class="student-question-page__section-title">選擇練習範圍</div>
          </div>

          <q-btn
            flat
            color="teal-8"
            icon="apps"
            label="查看全部正式題目"
            no-caps
            :class="{ 'student-question-page__all-scope--active': filters.scope === null }"
            @click="selectAllScopes"
          />
        </div>

        <div class="student-question-page__scope-grid">
          <button
            v-for="item in scopeCards"
            :key="item.value"
            type="button"
            class="student-question-page__scope-card"
            :class="{
              'student-question-page__scope-card--active': filters.scope === item.value,
            }"
            @click="selectScope(item.value)"
          >
            <div class="student-question-page__scope-card-icon">
              <q-icon :name="item.icon" size="24px" />
            </div>

            <div class="student-question-page__scope-card-main">
              <div class="student-question-page__scope-card-title">{{ item.label }}</div>
              <div class="student-question-page__scope-card-caption">{{ item.caption }}</div>
            </div>

            <div class="student-question-page__scope-card-stats">
              <template v-if="overviewLoading">
                <q-spinner size="18px" color="teal" />
              </template>
              <template v-else>
                <strong>{{ scopeStats(item.value).answered }}</strong>
                <span>/ {{ scopeStats(item.value).total }} 已作答</span>
              </template>
            </div>
          </button>
        </div>
      </section>

      <div
        class="student-question-page__section-header student-question-page__section-header--compact"
      >
        <div>
          <div class="student-question-page__section-title">作答情況</div>
        </div>

        <q-btn
          flat
          color="grey-7"
          icon="restart_alt"
          label="清除條件"
          no-caps
          :disable="loading"
          @click="resetFilters"
        />
      </div>

      <q-btn-toggle
        v-model="filters.status"
        no-caps
        unelevated
        spread
        toggle-color="teal"
        color="grey-2"
        text-color="grey-8"
        :options="statusOptions"
      />

      <q-expansion-item
        v-model="advancedSearchOpen"
        class="student-question-page__advanced-search"
        icon="tune"
        label="進階搜尋"
        caption="依章節、單元、知識卡、題型或關鍵字縮小範圍"
        header-class="student-question-page__advanced-search-header"
        expand-icon-class="text-teal-8"
      >
        <q-card-section class="student-question-page__advanced-search-body">
          <div class="student-question-page__filter-grid">
            <q-select
              v-model="filters.chapter_id"
              outlined
              dense
              clearable
              emit-value
              map-options
              label="章節"
              :options="chapterOptions"
              :disable="!hierarchyFilterEnabled"
              @update:model-value="handleChapterChange"
            >
              <template #prepend>
                <q-icon name="menu_book" size="19px" />
              </template>
            </q-select>

            <q-select
              v-if="showUnitFilter"
              v-model="filters.unit_id"
              outlined
              dense
              clearable
              emit-value
              map-options
              label="單元"
              :options="unitOptions"
              :disable="!unitFilterEnabled"
              @update:model-value="handleUnitChange"
            >
              <template #prepend>
                <q-icon name="view_list" size="19px" />
              </template>
            </q-select>

            <q-select
              v-if="showKnowledgeCardFilter"
              v-model="filters.knowledge_card_id"
              outlined
              dense
              clearable
              emit-value
              map-options
              label="知識卡"
              :options="knowledgeCardOptions"
              :disable="!knowledgeCardFilterEnabled"
            >
              <template #prepend>
                <q-icon name="description" size="19px" />
              </template>
            </q-select>

            <q-select
              v-model="filters.type"
              outlined
              dense
              clearable
              emit-value
              map-options
              label="題型"
              :options="questionTypeOptions"
            >
              <template #prepend>
                <q-icon name="quiz" size="19px" />
              </template>
            </q-select>

            <q-input
              v-model="filters.keyword"
              outlined
              dense
              clearable
              label="搜尋題目名稱"
              maxlength="100"
              @keyup.enter="applyFilters"
            >
              <template #prepend>
                <q-icon name="search" size="19px" />
              </template>
            </q-input>
          </div>

          <div
            v-if="hierarchyGuide"
            class="student-question-page__filter-guide text-caption text-grey-7"
          >
            <q-icon name="info_outline" size="17px" class="q-mr-xs" />
            {{ hierarchyGuide }}
          </div>

          <div class="student-question-page__filter-actions">
            <q-btn
              unelevated
              color="teal"
              icon="filter_alt"
              label="套用篩選"
              no-caps
              :loading="loading"
              @click="applyFilters"
            />
          </div>
        </q-card-section>
      </q-expansion-item>

      <div v-if="activeFilterLabels.length > 0" class="student-question-page__active-filters"></div>

      <q-card flat bordered class="student-question-page__content">
        <q-card-section class="student-question-page__result-header">
          <div>
            <div class="student-question-page__result-title">{{ selectedScopeLabel }}</div>
            <div class="student-question-page__result-caption">
              共找到 {{ questionCount }} 題；鎖定題目請先回教材完成相關知識卡。
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <StudentQuestionList
            :questions="questions"
            :loading="loading"
            :error-message="errorMessage"
            @open-question="handleOpenQuestion"
          />
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import StudentQuestionList from '../../../../components/student/question/StudentQuestionList.vue';
import { studentQuestionApi } from '../../../../api/student-question.api.js';
import { useStudentQuestions } from '../../../../composables/useStudentQuestions.js';
import type {
  StudentPracticeScope,
  StudentQuestion,
  StudentQuestionFilters,
  StudentQuestionStatusFilter,
  StudentQuestionType,
} from '../../../../types/student-question.js';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
});

const route = useRoute();
const router = useRouter();

const courseId = computed(() => {
  const rawCourseId = (route.params as { courseId?: string | string[] }).courseId;
  return Number(Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId);
});

const validCourseId = computed(() => Number.isInteger(courseId.value) && courseId.value > 0);

const { questions, questionStructure, loading, errorMessage, questionCount, loadQuestions } =
  useStudentQuestions();

const overviewQuestions = ref<StudentQuestion[]>([]);
const overviewLoading = ref(false);
const advancedSearchOpen = ref(false);

const filters = reactive<{
  scope: StudentPracticeScope | null;
  chapter_id: number | null;
  unit_id: number | null;
  knowledge_card_id: number | null;
  type: StudentQuestionType | null;
  status: StudentQuestionStatusFilter;
  keyword: string;
}>({
  scope: 'card',
  chapter_id: null,
  unit_id: null,
  knowledge_card_id: null,
  type: null,
  status: 'all',
  keyword: '',
});

const scopeCards: Array<{
  value: StudentPracticeScope;
  label: string;
  caption: string;
  icon: string;
}> = [
  {
    value: 'card',
    label: '知識卡練習',
    caption: '聚焦單一知識卡，確認基礎概念。',
    icon: 'description',
  },
  {
    value: 'unit',
    label: '單元練習',
    caption: '同單元跨知識卡，練習概念串聯。',
    icon: 'view_list',
  },
  {
    value: 'chapter',
    label: '章節練習',
    caption: '同章節跨單元，檢查章節整合能力。',
    icon: 'menu_book',
  },
  {
    value: 'course',
    label: '綜合練習',
    caption: '跨章節整合題，進行完整應用。',
    icon: 'hub',
  },
];

const statusOptions: Array<{ label: string; value: StudentQuestionStatusFilter }> = [
  { label: '全部', value: 'all' },
  { label: '未作答', value: 'unanswered' },
  { label: '已作答', value: 'answered' },
];

const questionTypeOptions: Array<{ label: string; value: StudentQuestionType }> = [
  { label: '選擇題', value: 'choice' },
  { label: '是非題', value: 'true_false' },
  { label: '填空題', value: 'fill' },
  { label: '除錯題', value: 'debug' },
  { label: '程式解讀', value: 'interpret' },
  { label: '程式實作', value: 'coding' },
];

const hierarchyFilterEnabled = computed(() =>
  ['card', 'unit', 'chapter'].includes(filters.scope ?? ''),
);

const unitFilterEnabled = computed(
  () => ['card', 'unit'].includes(filters.scope ?? '') && filters.chapter_id !== null,
);

const knowledgeCardFilterEnabled = computed(
  () => filters.scope === 'card' && filters.chapter_id !== null && filters.unit_id !== null,
);

const showUnitFilter = computed(() => ['card', 'unit'].includes(filters.scope ?? ''));

const showKnowledgeCardFilter = computed(() => filters.scope === 'card');

const hierarchyGuide = computed(() => {
  if (!['card', 'unit'].includes(filters.scope ?? '')) {
    return '';
  }

  if (filters.chapter_id === null) {
    return filters.scope === 'card'
      ? '請先選擇章節；選取章節後即可選擇單元，選取單元後即可選擇知識卡。'
      : '請先選擇章節；選取章節後即可選擇單元。';
  }

  if (filters.scope === 'card' && filters.unit_id === null) {
    return '請先選擇單元；選取後即可選擇知識卡。';
  }

  return '';
});

const chapterOptions = computed(() =>
  questionStructure.value.map((chapter) => ({ label: chapter.name, value: chapter.id })),
);

const selectedChapter = computed(() =>
  questionStructure.value.find((chapter) => chapter.id === filters.chapter_id),
);

const unitOptions = computed(() =>
  (selectedChapter.value?.units ?? []).map((unit) => ({ label: unit.name, value: unit.id })),
);

const selectedUnit = computed(() =>
  selectedChapter.value?.units.find((unit) => unit.id === filters.unit_id),
);

const knowledgeCardOptions = computed(() =>
  (selectedUnit.value?.knowledge_cards ?? []).map((card) => ({
    label: card.completed ? `${card.title}（已完成）` : `${card.title}（尚未完成）`,
    value: card.id,
  })),
);

const selectedScopeLabel = computed(() => {
  if (filters.scope === null) {
    return '全部正式題目';
  }

  return scopeCards.find((item) => item.value === filters.scope)?.label ?? '題目練習';
});

// const selectedScopeDescription = computed(() => {
//   if (filters.scope === null) {
//     return '目前顯示所有正式題目；章節、單元與知識卡條件需先選擇一種練習範圍。';
//   }

//   return scopeCards.find((item) => item.value === filters.scope)?.caption ?? '';
// });

const activeFilterLabels = computed(() => {
  const labels: string[] = [];

  if (filters.scope !== null) {
    labels.push(selectedScopeLabel.value);
  }

  if (selectedChapter.value) {
    labels.push(selectedChapter.value.name);
  }

  if (selectedUnit.value) {
    labels.push(selectedUnit.value.name);
  }

  const selectedCard = selectedUnit.value?.knowledge_cards.find(
    (card) => card.id === filters.knowledge_card_id,
  );
  if (selectedCard) {
    labels.push(selectedCard.title);
  }

  const selectedType = questionTypeOptions.find((item) => item.value === filters.type);
  if (selectedType) {
    labels.push(selectedType.label);
  }

  if (filters.status === 'answered') {
    labels.push('已作答');
  } else if (filters.status === 'unanswered') {
    labels.push('未作答');
  }

  const keyword = filters.keyword.trim();
  if (keyword) {
    labels.push(`關鍵字：${keyword}`);
  }

  return labels;
});

watch(
  courseId,
  async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    resetFilterValues();
    await Promise.all([loadOverview(id), loadQuestions(id, buildFilters())]);
  },
  { immediate: true },
);

function buildFilters(): StudentQuestionFilters {
  return {
    scope: filters.scope,
    chapter_id: filters.chapter_id,
    unit_id: filters.unit_id,
    knowledge_card_id: filters.knowledge_card_id,
    type: filters.type,
    status: filters.status,
    keyword: filters.keyword.trim() || null,
  };
}

async function loadOverview(id: number) {
  overviewLoading.value = true;

  try {
    const response = await studentQuestionApi.getQuestions(id, { status: 'all' });
    overviewQuestions.value = response.data.questions ?? [];
  } catch {
    overviewQuestions.value = [];
  } finally {
    overviewLoading.value = false;
  }
}

function scopeStats(scope: StudentPracticeScope) {
  const scopedQuestions = overviewQuestions.value.filter((question) => question.scope === scope);

  return {
    total: scopedQuestions.length,
    answered: scopedQuestions.filter(
      (question) => question.practice !== null && question.practice !== undefined,
    ).length,
  };
}

async function applyFilters() {
  if (!validCourseId.value) {
    return;
  }

  await loadQuestions(courseId.value, buildFilters());
}

async function resetFilters() {
  resetFilterValues();
  await applyFilters();
}

function resetFilterValues() {
  filters.scope = 'card';
  filters.chapter_id = null;
  filters.unit_id = null;
  filters.knowledge_card_id = null;
  filters.type = null;
  filters.status = 'all';
  filters.keyword = '';
  advancedSearchOpen.value = false;
}

async function selectScope(scope: StudentPracticeScope) {
  if (filters.scope === scope) {
    return;
  }

  filters.scope = scope;
  filters.chapter_id = null;
  filters.unit_id = null;
  filters.knowledge_card_id = null;
  await applyFilters();
}

async function selectAllScopes() {
  filters.scope = null;
  filters.chapter_id = null;
  filters.unit_id = null;
  filters.knowledge_card_id = null;
  await applyFilters();
}

function handleChapterChange() {
  filters.unit_id = null;
  filters.knowledge_card_id = null;
}

function handleUnitChange() {
  filters.knowledge_card_id = null;
}

function goBack() {
  if (!validCourseId.value) {
    void router.push('/student/courses');
    return;
  }

  void router.push(`/student/course/${courseId.value}`);
}

function handleOpenQuestion(questionId: number) {
  void router.push({
    path: `/student/question/${questionId}`,
    query: {
      courseId: String(courseId.value),
    },
  });
}
</script>
