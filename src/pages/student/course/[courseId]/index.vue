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

          <div class="student-material-page__learning-percent">{{ progressPercent }}%</div>
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
          <div
            class="student-material-page__learning-status student-material-page__learning-status--completed"
          >
            <q-icon name="check_circle" />
            <div>
              <strong>{{ learningProgress.summary.completed }}</strong>
              <div class="student-material-page__learning-status-label">
                <span>已完成</span>
                <q-btn flat dense round size="xs" icon="help_outline" aria-label="已完成狀態說明">
                  <q-tooltip>已完成知識卡閱讀，或完成該卡所需的測驗。</q-tooltip>
                  <q-menu anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    <q-card class="student-material-page__status-help-popup">
                      <q-card-section>
                        已完成知識卡閱讀，或完成該卡所需的測驗。
                      </q-card-section>
                    </q-card>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <div
            class="student-material-page__learning-status student-material-page__learning-status--progress"
          >
            <q-icon name="pending" />
            <div>
              <strong>{{ learningProgress.summary.in_progress }}</strong>
              <div class="student-material-page__learning-status-label">
                <span>學習中</span>
                <q-btn flat dense round size="xs" icon="help_outline" aria-label="學習中狀態說明">
                  <q-tooltip>已開始作答，尚未完成的題目。</q-tooltip>
                  <q-menu anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    <q-card class="student-material-page__status-help-popup">
                      <q-card-section>已開始作答，尚未完成的題目。</q-card-section>
                    </q-card>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <div
            class="student-material-page__learning-status student-material-page__learning-status--retry"
          >
            <q-icon name="refresh" />
            <div>
              <strong>{{ learningProgress.summary.retry }}</strong>
              <div class="student-material-page__learning-status-label">
                <span>需再練習</span>
                <q-btn flat dense round size="xs" icon="help_outline" aria-label="需再練習狀態說明">
                  <q-tooltip>作答中有答錯的題目，建議重新練習。</q-tooltip>
                  <q-menu anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    <q-card class="student-material-page__status-help-popup">
                      <q-card-section>作答中有答錯的題目，建議重新練習。</q-card-section>
                    </q-card>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <div
            class="student-material-page__learning-status student-material-page__learning-status--not-started"
          >
            <q-icon name="radio_button_unchecked" />
            <div>
              <strong>{{ learningProgress.summary.not_started }}</strong>
              <div class="student-material-page__learning-status-label">
                <span>未開始</span>
                <q-btn flat dense round size="xs" icon="help_outline" aria-label="未開始狀態說明">
                  <q-tooltip>尚未完成閱讀，也尚未開始作答測驗。</q-tooltip>
                  <q-menu anchor="top middle" self="bottom middle" :offset="[0, 8]">
                    <q-card class="student-material-page__status-help-popup">
                      <q-card-section>尚未完成閱讀，也尚未開始作答測驗。</q-card-section>
                    </q-card>
                  </q-menu>
                </q-btn>
              </div>
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

      <q-banner
        v-else-if="viewMode === 'unit' && unitGraphError"
        class="q-mx-md q-mb-md bg-red-1 text-negative"
        rounded
      >
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
          show-chapter-graph-button
          show-unit-graph-button
          @quiz-card="handleQuizCard"
          @read-card="handleReadCard"
          @view-chapter-graph="handleViewChapterGraph"
          @view-unit-graph="handleViewUnitGraph"
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

type MaterialViewMode = 'tree' | 'graph' | 'unit';

const route = useRoute();
const router = useRouter();

const viewMode = ref<MaterialViewMode>('tree');
const selectedChapterId = ref<number | null>(null);
const selectedUnitId = ref<number | null>(null);
const graphChapterId = ref<number | null>(null);
const graphUnitId = ref<number | null>(null);
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

const { dashboard, errorMessage: dashboardErrorMessage, fetchDashboard } = useDashboard();

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

const unitChapterOptions = computed(() =>
  (courseTree.value?.chapters ?? []).map((chapter) => ({
    label: chapter.name,
    value: chapter.id,
  })),
);

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

  let chapters = tree.chapters;

  if (viewMode.value === 'graph') {
    const scopedChapters = chapters
      .filter((chapter) => graphChapterId.value === null || chapter.id === graphChapterId.value)
      .map((chapter) => ({
        ...chapter,
        units:
          graphUnitId.value === null
            ? chapter.units
            : chapter.units.filter((unit) => unit.id === graphUnitId.value),
      }));

    chapters =
      graphUnitId.value === null
        ? scopedChapters
        : scopedChapters.filter((chapter) => chapter.units.length > 0);
  } else if (viewMode.value === 'unit') {
    if (!singleUnitGraph.value) {
      chapters = [];
    } else {
      const sourceChapter = tree.chapters.find(
        (chapter) => chapter.id === selectedChapterId.value,
      );
      chapters = [
        {
          id: sourceChapter?.id ?? 0,
          name: sourceChapter?.name ?? '',
          title: sourceChapter?.title ?? '',
          sort_order: sourceChapter?.sort_order ?? 0,
          units: [singleUnitGraph.value],
        },
      ];
    }
  }

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
  return materialErrorMessage.value || dashboardErrorMessage.value || progressErrorMessage.value;
});

watch(
  courseId,
  async (id) => {
    clearMaterial();
    clearProgress();
    clearCardDialog();
    selectedChapterId.value = null;
    selectedUnitId.value = null;
    graphChapterId.value = null;
    graphUnitId.value = null;
    singleUnitGraph.value = null;
    viewMode.value = 'tree';

    if (id === null) {
      return;
    }

    await Promise.all([fetchDashboard(), fetchMaterial(id), fetchProgress(id)]);
  },
  { immediate: true },
);

watch(viewMode, (mode) => {
  if (mode !== 'graph') {
    graphChapterId.value = null;
    graphUnitId.value = null;
  }
});

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

function handleViewChapterGraph(chapter: MaterialChapterNode) {
  graphChapterId.value = chapter.id;
  graphUnitId.value = null;
  viewMode.value = 'graph';
}

function handleViewUnitGraph(unit: MaterialUnitNode) {
  graphChapterId.value = null;
  graphUnitId.value = unit.id;
  viewMode.value = 'graph';
}

function handleQuizCard(
  _chapter: MaterialChapterNode,
  _unit: MaterialUnitNode,
  card: MaterialKnowledgeCardNode,
) {
  if (courseId.value === null) {
    return;
  }

  void router.push(`/student/course/${courseId.value}/knowledge-card/${card.id}/quiz`);
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
    void router.push(`/student/course/${courseId.value}/knowledge-card/${card.id}/quiz`);
    return;
  }

  viewMode.value = 'tree';
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
