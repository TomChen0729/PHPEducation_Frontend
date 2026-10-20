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
          ]"
        />
      </q-card-section>

      <div v-if="loading" class="student-material-page__loading">
        <q-spinner color="teal" size="42px" />
        <div>教材載入中...</div>
      </div>

      <div
        v-else-if="!displayTree || displayTree.chapters.length === 0"
        class="student-material-page__empty"
      >
        <q-icon name="auto_stories" size="52px" color="grey-4" />
        <div>此課程目前沒有教材</div>
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

import type {
  MaterialChapterNode,
  MaterialCourseTree,
  MaterialEditorContext,
  MaterialKnowledgeCardNode,
  MaterialUnitNode,
} from '../../../../types/material.js';

type MaterialViewMode = 'tree' | 'graph';

const route = useRoute();
const router = useRouter();

const viewMode = ref<MaterialViewMode>('tree');
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

const displayTree = computed<MaterialCourseTree | null>(() => {
  const tree = courseTree.value;

  if (!tree) {
    return null;
  }

  return {
    ...tree,
    chapters: tree.chapters.map((chapter) => ({
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
    viewMode.value = 'tree';

    if (id === null) {
      return;
    }

    await Promise.all([fetchDashboard(), fetchMaterial(id), fetchProgress(id)]);
  },
  { immediate: true },
);

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
