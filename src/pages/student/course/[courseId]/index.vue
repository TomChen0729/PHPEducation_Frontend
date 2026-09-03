<template>
  <q-page class="student-material-page">
    <!-- Header -->
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

    <!-- Material -->
    <q-card flat bordered class="student-material-page__material">
      <q-card-section class="student-material-page__material-header">
        <div>
          <div class="student-material-page__material-title">
            <q-icon name="auto_stories" color="teal-8" />

            教材
          </div>

          <div class="student-material-page__material-caption">
            {{ course?.name ?? '課程教材' }}
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
            {
              label: '階層檢視',
              value: 'tree',
              icon: 'account_tree',
            },
            {
              label: '知識圖譜',
              value: 'graph',
              icon: 'hub',
            },
          ]"
        />
      </q-card-section>

      <q-separator />

      <!-- Loading -->
      <div v-if="loading" class="student-material-page__loading">
        <q-spinner color="teal" size="42px" />

        <div>教材載入中...</div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!courseTree || courseTree.chapters.length === 0"
        class="student-material-page__empty"
      >
        <q-icon name="auto_stories" size="52px" color="grey-4" />

        <div>此課程目前沒有教材</div>
      </div>

      <!-- Tree -->
      <q-card-section v-else-if="viewMode === 'tree'" class="student-material-page__viewer">
        <MaterialTreeViewer :tree="courseTree" theme="student" />
      </q-card-section>

      <!-- Graph -->
      <q-card-section v-else class="student-material-page__graph">
        <MaterialGraphViewer :tree="courseTree" theme="student" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useRoute } from 'vue-router';

import MaterialTreeViewer from '../../../../components/material/MaterialTreeViewer.vue';

import MaterialGraphViewer from '../../../../components/material/MaterialGraphViewer.vue';

import { useDashboard } from '../../../../composables/useDashboard';

import { useStudentMaterial } from '../../../../composables/useStudentMaterial';

type MaterialViewMode = 'tree' | 'graph';

const route = useRoute();

const viewMode = ref<MaterialViewMode>('tree');

const courseId = computed<number | null>(() => {
  const raw = (
    route.params as {
      courseId?: string | string[];
    }
  ).courseId;

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

const course = computed(() => {
  if (courseId.value === null) {
    return undefined;
  }

  return dashboard.value?.courses?.find((item) => item.id === courseId.value);
});

const pageErrorMessage = computed(() => {
  return materialErrorMessage.value || dashboardErrorMessage.value;
});

watch(
  courseId,

  async (id) => {
    clearMaterial();

    viewMode.value = 'tree';

    if (id === null) {
      return;
    }

    await Promise.all([fetchDashboard(), fetchMaterial(id)]);
  },

  {
    immediate: true,
  },
);

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
