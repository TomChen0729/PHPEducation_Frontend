<template>
  <q-page class="student-material-page">
    <div class="student-material-page__header">
      <q-btn
        flat
        dense
        color="teal-8"
        icon="arrow_back"
        label="返回我的課程"
        to="/student/courses"
        class="student-material-page__back"
      />

      <div v-if="course" class="student-material-page__course-header">
        <h5 class="student-material-page__course-title">
          {{ course.name }}
        </h5>

        <div class="student-material-page__course-subtitle">
          <div class="student-material-page__course-meta">
            <span>
              <q-icon name="groups" color="teal-7" />
              {{ course.class_name }}
            </span>

            <span>
              <q-icon name="calendar_month" color="teal-7" />
              {{ formatSemester(course.semester) }}
            </span>
          </div>

          <q-btn
            unelevated
            color="teal"
            icon="quiz"
            label="題目練習"
            no-caps
            :to="`/student/course/${courseId}/questions`"
          />
        </div>
      </div>
    </div>

    <q-banner v-if="pageErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ pageErrorMessage }}
    </q-banner>

    <q-card
      v-if="progressLoading && !learningProgress"
      flat
      bordered
      class="student-material-page__learning-overview student-material-page__learning-overview--loading"
    >
      <q-card-section>
        <q-skeleton type="text" width="180px" />
        <q-skeleton type="text" width="100%" class="q-mt-sm" />
      </q-card-section>
    </q-card>

    <q-card
      v-else-if="learningProgress"
      flat
      bordered
      class="student-material-page__learning-overview"
    >
      <q-card-section>
        <div class="student-material-page__learning-overview-head">
          <div>
            <div class="student-material-page__learning-title">
              <q-icon name="school" color="teal-7" />
              我的學習進度
            </div>

            <div class="student-material-page__learning-caption">
              已完成 {{ learningProgress.completed }} / {{ learningProgress.total }} 張知識卡
            </div>
          </div>

          <div class="student-material-page__learning-percent">
            {{ progressPercent }}%
          </div>
        </div>

        <q-linear-progress
          rounded
          size="10px"
          color="teal"
          track-color="teal-1"
          :value="progressPercent / 100"
          class="student-material-page__learning-bar"
        />

        <div class="student-material-page__learning-statuses">
          <div class="student-material-page__learning-status student-material-page__learning-status--completed">
            <q-icon name="check_circle" />
            <div>
              <strong>{{ learningProgress.summary.completed }}</strong>
              <span>已完成</span>
            </div>
          </div>

          <div class="student-material-page__learning-status student-material-page__learning-status--progress">
            <q-icon name="pending" />
            <div>
              <strong>{{ learningProgress.summary.in_progress }}</strong>
              <span>學習中</span>
            </div>
          </div>

          <div class="student-material-page__learning-status student-material-page__learning-status--retry">
            <q-icon name="refresh" />
            <div>
              <strong>{{ learningProgress.summary.retry }}</strong>
              <span>需再練習</span>
            </div>
          </div>

          <div class="student-material-page__learning-status student-material-page__learning-status--not-started">
            <q-icon name="radio_button_unchecked" />
            <div>
              <strong>{{ learningProgress.summary.not_started }}</strong>
              <span>未開始</span>
            </div>
          </div>
        </div>

        <div
          v-if="learningProgress.last_activity?.knowledge_card"
          class="student-material-page__last-activity"
        >
          <div class="student-material-page__last-activity-copy">
            <q-icon name="history" color="teal-7" />
            <div>
              <div class="student-material-page__last-activity-label">上次學習</div>
              <div class="student-material-page__last-activity-title">
                {{ learningProgress.last_activity.knowledge_card.title }}
              </div>
            </div>
          </div>

          <q-btn
            flat
            no-caps
            color="teal-8"
            icon-right="arrow_forward"
            label="繼續學習"
            @click="continueLastActivity"
          />
        </div>

        <div class="student-material-page__progress-details q-mt-md">
          <div class="text-subtitle2 q-mb-sm">各章節學習明細</div>

          <q-card
            v-for="chapter in learningProgress.chapters"
            :key="chapter.id"
            flat
            bordered
            class="q-mb-sm"
          >
            <q-expansion-item expand-separator default-opened>
              <template #header>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ chapter.name }}</q-item-label>
                  <q-item-label caption>
                    已完成 {{ chapter.completed }} / {{ chapter.total }} 張知識卡
                  </q-item-label>
                </q-item-section>
              </template>

              <q-card-section
                v-for="unit in chapter.units"
                :key="unit.id"
                class="q-pt-none q-pb-sm"
              >
                <div class="text-body2 text-weight-medium q-mb-xs">{{ unit.name }}</div>
                <q-list bordered separator class="rounded-borders">
                  <q-item
                    v-for="card in unit.knowledge_cards"
                    :key="card.id"
                    class="q-py-sm"
                  >
                    <q-item-section avatar>
                      <q-icon
                        :name="progressStatusIcon(card.status)"
                        :color="progressStatusColor(card.status)"
                        size="sm"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ card.title }}</q-item-label>
                      <q-item-label caption>
                        {{ progressStatusLabel(card.status) }}
                        <template v-if="card.has_quiz">
                          ・已作答 {{ card.answered_count }} / {{ card.question_total }} 題
                        </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        v-if="card.has_quiz"
                        flat
                        dense
                        no-caps
                        color="teal-8"
                        icon="quiz"
                        label="前往測驗"
                        :to="`/student/course/${courseId}/knowledge-card/${card.id}/quiz`"
                      />
                      <q-badge
                        v-else
                        :color="card.status === 'completed' ? 'positive' : 'grey-6'"
                        :label="card.status === 'completed' ? '閱讀完成' : '無測驗題目'"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="student-material-page__material">
      <q-card-section class="student-material-page__material-header">
        <div>
          <div class="student-material-page__material-title">課程內容</div>
          <div class="student-material-page__material-caption">
            知識卡會顯示你的學習狀態與小試身手進度
          </div>
        </div>

        <q-btn-toggle
          v-model="viewMode"
          unelevated
          no-caps
          color="grey-2"
          text-color="blue-grey-8"
          toggle-color="teal"
          toggle-text-color="white"
          :options="[
            { label: '階層檢視', value: 'tree', icon: 'account_tree' },
            { label: '知識圖譜', value: 'graph', icon: 'hub' },
            { label: '單一單元', value: 'unit', icon: 'schema' },
          ]"
        />
      </q-card-section>

      <q-card-section v-if="viewMode === 'unit'" class="row q-col-gutter-md q-pt-none">
        <q-select
          v-model="selectedChapterId"
          class="col-12 col-sm-6"
          outlined
          dense
          label="選擇章節"
          :options="unitChapterOptions"
          emit-value
          map-options
        />
        <q-select
          v-model="selectedUnitId"
          class="col-12 col-sm-6"
          outlined
          dense
          label="選擇單元"
          :options="unitSelectOptions"
          emit-value
          map-options
          :disable="selectedChapterId === null || unitSelectOptions.length === 0"
        />
      </q-card-section>

      <div v-if="viewMode === 'unit' && unitGraphLoading" class="student-material-page__loading">
        <q-spinner color="teal" size="42px" />
        <div>單元教材載入中...</div>
      </div>

      <q-banner v-else-if="viewMode === 'unit' && unitGraphError" class="q-mx-md q-mb-md bg-red-1 text-negative" rounded>
        {{ unitGraphError }}
      </q-banner>

      <div v-if="loading" class="student-material-page__loading">
        <q-spinner color="teal" size="42px" />
        <div>教材載入中...</div>
      </div>

      <div
        v-else-if="
          !unitGraphLoading &&
          !unitGraphError &&
          (!displayTree || displayTree.chapters.length === 0)
        "
        class="student-material-page__empty"
      >
        <q-icon name="auto_stories" size="52px" color="grey-4" />
        <div>{{ viewMode === 'unit' ? '請先選擇章節與單元' : '此課程目前沒有教材' }}</div>
      </div>

      <q-card-section v-else-if="viewMode === 'tree'" class="student-material-page__viewer">
        <MaterialTreeViewer
          :tree="displayTree"
          theme="student"
          :actions-disabled="readingCardId !== null"
          @quiz-card="handleQuizCard"
          @read-card="handleReadCard"
        />
      </q-card-section>

      <q-card-section v-else class="student-material-page__graph">
        <MaterialGraphViewer
          :tree="displayTree"
          theme="student"
          @view-card="handleViewCard"
          @quiz-card="handleQuizCard"
          @read-card="handleReadCard"
        />
      </q-card-section>
    </q-card>

    <q-dialog v-model="cardDialogOpen" @hide="clearCardDialog">
      <q-card class="student-material-page__card-dialog">
        <q-card-section class="student-material-page__card-dialog-header">
          <div>
            <div class="text-h6">知識卡完整檢視</div>
            <div class="text-caption text-grey-7">
              {{ course?.name ?? displayTree?.name ?? '課程教材' }}
            </div>
          </div>

          <q-btn flat round dense icon="close" @click="closeCardDialog" />
        </q-card-section>

        <q-separator />

        <q-card-section class="student-material-page__card-dialog-content">
          <MaterialEditor
            :context="cardDialogContext"
            :course-name="course?.name ?? displayTree?.name ?? ''"
            :editing="false"
            readonly
            @cancel="closeCardDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Dialog, Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import MaterialTreeViewer from '../../../../components/material/MaterialTreeViewer.vue';
import MaterialGraphViewer from '../../../../components/material/MaterialGraphViewer.vue';
import MaterialEditor from '../../../../components/teacher/course-workspace/MaterialEditor.vue';

import { useDashboard } from '../../../../composables/useDashboard.js';
import { useStudentLearningProgress } from '../../../../composables/useStudentLearningProgress.js';
import { useStudentMaterial } from '../../../../composables/useStudentMaterial.js';
import { studentMaterialApi } from '../../../../api/student-material.api';

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialEditorContext,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../../../types/material.js';
import type { StudentLearningCardStatus } from '../../../../types/student-learning.js';

type MaterialViewMode = 'tree' | 'graph' | 'unit';

const route = useRoute();
const router = useRouter();

const viewMode = ref<MaterialViewMode>('tree');
const selectedChapterId = ref<number | null>(null);
const selectedUnitId = ref<number | null>(null);
const singleUnitGraph = ref<MaterialUnitNode | null>(null);
const unitGraphLoading = ref(false);
const unitGraphError = ref('');
const cardDialogOpen = ref(false);
const cardDialogContext = ref<MaterialEditorContext | null>(null);

const courseId = computed<number | null>(() => {
  const raw = (route.params as { courseId?: string | string[] }).courseId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);

  return Number.isNaN(id) ? null : id;
});

const {
  dashboard,
  errorMessage: dashboardErrorMessage,
  fetchDashboard,
} = useDashboard();

const {
  courseTree,
  loading,
  errorMessage: materialErrorMessage,
  fetchMaterial,
  clearMaterial,
} = useStudentMaterial();

const {
  progress: learningProgress,
  loading: progressLoading,
  readingCardId,
  errorMessage: progressErrorMessage,
  progressPercent,
  cardProgressMap,
  fetchProgress,
  markCardRead,
  clearProgress,
} = useStudentLearningProgress();

const course = computed(() => {
  if (courseId.value === null) {
    return undefined;
  }

  return dashboard.value?.courses?.find((item) => item.id === courseId.value);
});

const unitChapterOptions = computed(() => (courseTree.value?.chapters ?? []).map((chapter) => ({
  label: chapter.name,
  value: chapter.id,
})));

const unitSelectOptions = computed(() => {
  const chapter = courseTree.value?.chapters.find((item) => item.id === selectedChapterId.value);

  return (chapter?.units ?? [])
    .filter((unit) => unit.status !== 'draft')
    .map((unit) => ({ label: unit.name, value: unit.id }));
});

const displayTree = computed<MaterialCourseTree | null>(() => {
  const tree = courseTree.value;

  if (!tree) {
    return null;
  }

  const chapters = viewMode.value === 'unit'
    ? (() => {
        if (!singleUnitGraph.value) return [];
        const sourceChapter = tree.chapters.find((chapter) => chapter.id === selectedChapterId.value);
        return [{
          id: sourceChapter?.id ?? 0,
          name: sourceChapter?.name ?? '',
          title: sourceChapter?.title ?? '',
          sort_order: sourceChapter?.sort_order ?? 0,
          units: [singleUnitGraph.value],
        }];
      })()
    : tree.chapters;

  return {
    ...tree,
    chapters: chapters.map((chapter) => ({
      ...chapter,
      units: chapter.units.map((unit) => ({
        ...unit,
        knowledge_cards: unit.knowledge_cards.map((card) => {
          const progress = cardProgressMap.value.get(card.id);

          if (!progress) {
            return card;
          }

          return {
            ...card,
            completed: progress.status === 'completed',
            has_quiz: progress.has_quiz,
            learning_status: progress.status,
            question_total: progress.question_total,
            answered_count: progress.answered_count,
            correct_count: progress.correct_count,
            last_answered_at: progress.last_answered_at,
          };
        }),
      })),
    })),
  };
});

const pageErrorMessage = computed(() => {
  return (
    materialErrorMessage.value ||
    dashboardErrorMessage.value ||
    progressErrorMessage.value
  );
});

watch(
  courseId,
  async (id) => {
    clearMaterial();
    clearProgress();
    clearCardDialog();
    selectedChapterId.value = null;
    selectedUnitId.value = null;
    singleUnitGraph.value = null;
    viewMode.value = 'tree';

    if (id === null) {
      return;
    }

    await Promise.all([fetchDashboard(), fetchMaterial(id), fetchProgress(id)]);
  },
  { immediate: true },
);

watch(selectedChapterId, () => {
  selectedUnitId.value = null;
  singleUnitGraph.value = null;
  unitGraphError.value = '';
});

watch(selectedUnitId, async (unitId) => {
  singleUnitGraph.value = null;
  unitGraphError.value = '';
  if (!unitId) return;

  unitGraphLoading.value = true;
  try {
    singleUnitGraph.value = (await studentMaterialApi.getUnitGraph(unitId)).data.unit;
  } catch {
    unitGraphError.value = '單元教材載入失敗，請重新選擇單元。';
  } finally {
    unitGraphLoading.value = false;
  }
});

function handleViewCard(
  chapter: MaterialChapterNode,
  unit: MaterialUnitNode,
  card: MaterialKnowledgeCardNode,
) {
  cardDialogContext.value = {
    kind: 'card',
    mode: 'edit',
    chapter,
    unit,
    card,
  };

  cardDialogOpen.value = true;
}

function handleQuizCard(
  _chapter: MaterialChapterNode,
  _unit: MaterialUnitNode,
  card: MaterialKnowledgeCardNode,
) {
  if (courseId.value === null) {
    return;
  }

  void router.push(
    `/student/course/${courseId.value}/knowledge-card/${card.id}/quiz`,
  );
}

function handleReadCard(
  _chapter: MaterialChapterNode,
  _unit: MaterialUnitNode,
  card: MaterialKnowledgeCardNode,
) {
  if (courseId.value === null || card.completed || card.has_quiz) {
    return;
  }

  Dialog.create({
    title: '完成知識卡',
    message: `確認已閱讀完成「${card.title}」嗎？`,
    ok: {
      label: '我已讀完',
      color: 'teal',
      unelevated: true,
    },
    cancel: {
      label: '取消',
      flat: true,
    },
    persistent: true,
  }).onOk(() => {
    void completeReadCard(card.id);
  });
}

async function completeReadCard(cardId: number) {
  if (courseId.value === null) {
    return;
  }

  const success = await markCardRead(courseId.value, cardId);

  if (!success) {
    Notify.create({
      type: 'negative',
      message: progressErrorMessage.value || '更新知識卡進度失敗',
    });
    return;
  }

  Notify.create({
    type: 'positive',
    message: '知識卡已完成',
  });
}

function continueLastActivity() {
  const card = learningProgress.value?.last_activity?.knowledge_card;

  if (!card || courseId.value === null) {
    return;
  }

  const cardProgress = cardProgressMap.value.get(card.id);

  if (cardProgress?.has_quiz) {
    void router.push(
      `/student/course/${courseId.value}/knowledge-card/${card.id}/quiz`,
    );
    return;
  }

  viewMode.value = 'tree';
}

function progressStatusLabel(status: StudentLearningCardStatus): string {
  return {
    completed: '已完成',
    retry: '需要複習',
    in_progress: '進行中',
    not_started: '尚未開始',
  }[status];
}

function progressStatusIcon(status: StudentLearningCardStatus): string {
  return {
    completed: 'check_circle',
    retry: 'refresh',
    in_progress: 'pending',
    not_started: 'radio_button_unchecked',
  }[status];
}

function progressStatusColor(status: StudentLearningCardStatus): string {
  return {
    completed: 'positive',
    retry: 'deep-orange',
    in_progress: 'primary',
    not_started: 'grey-6',
  }[status];
}

function closeCardDialog() {
  cardDialogOpen.value = false;
}

function clearCardDialog() {
  cardDialogContext.value = null;
}

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');
  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
