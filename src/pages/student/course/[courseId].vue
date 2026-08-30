<template>
  <q-page class="student-material-page">
    <!-- =========================
         Header
    ========================== -->
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

        <div class="student-material-page__course-meta">
          <span>
            <q-icon name="groups" color="teal-7" />
            &nbsp;
            {{ course.class_name }}
            &nbsp;
          </span>

          <span>
            <q-icon name="calendar_month" color="teal-7" />
            &nbsp;
            {{ formatSemester(course.semester) }}
          </span>
        </div>
      </div>
    </div>

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-if="pageErrorMessage" rounded class="bg-red-1 text-negative q-mb-md">
      {{ pageErrorMessage }}
    </q-banner>

    <!-- =========================
         Layout
    ========================== -->
    <div class="student-material-page__layout">
      <!-- ======================================================
           Topics
      ======================================================= -->
      <q-card flat bordered class="student-material-page__topics">
        <q-card-section class="student-material-page__topics-header">
          <div class="student-material-page__topics-title">
            <q-icon name="auto_stories" color="teal-8" />
            &nbsp;
            <span> 教材主題 </span>
          </div>
        </q-card-section>

        <q-separator class="student-material-page__separator" />

        <!-- Topic Loading -->
        <div v-if="topicsLoading" class="student-material-page__topic-loading">
          <q-spinner color="teal-8" size="32px" />

          <div>教材主題載入中...</div>
        </div>

        <!-- No Topic -->
        <div v-else-if="topics.length === 0" class="student-material-page__topic-empty">
          <div>此課程目前沒有已發布教材</div>
        </div>

        <!-- Topic List -->
        <q-list v-else separator>
          <q-item
            v-for="topic in topics"
            :key="topic.id"
            clickable
            :active="selectedTopic?.id === topic.id"
            active-class="student-material-page__topic--active"
            class="student-material-page__topic-item"
            @click="openTopic(topic)"
          >
            <q-item-section avatar>
              <q-icon name="menu_book" color="teal-8" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="student-material-page__topic-name">
                {{ topic.name }}
              </q-item-label>

              <q-item-label caption class="student-material-page__topic-caption">
                {{ topic.item_count }}
                個章節
              </q-item-label>

              <q-item-label
                v-if="topic.updated_at"
                caption
                class="student-material-page__topic-time"
              >
                最後更新：
                {{ formatDateTime(topic.updated_at) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_right" color="teal-7" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- ======================================================
           Material Content
      ======================================================= -->
      <q-card flat bordered class="student-material-page__content">
        <!-- Content Header -->
        <q-card-section v-if="selectedTopic" class="student-material-page__content-header">
          <div>
            <div class="student-material-page__content-title">
              <q-icon name="menu_book" color="teal-8" />
              &nbsp;
              <span>
                {{ selectedTopic.name }}
              </span>
            </div>

            <div class="student-material-page__content-subtitle">教材內容</div>
          </div>
        </q-card-section>

        <q-separator v-if="selectedTopic" class="student-material-page__separator" />

        <!-- Loading -->
        <div v-if="contentLoading" class="student-material-page__content-loading">
          <q-spinner color="teal-8" size="42px" />

          <div>教材載入中...</div>
        </div>

        <!-- Viewer -->
        <q-card-section v-else-if="topicTree" class="student-material-page__viewer">
          <MaterialTreeViewer :topic="topicTree" theme="student" />
        </q-card-section>

        <!-- No Selected -->
        <div v-else class="student-material-page__content-empty">
          <q-icon name="auto_stories" size="52px" color="teal-4" />

          <div>請選擇左側教材主題</div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import { useRoute } from 'vue-router';

import MaterialTreeViewer from '../../../components/material/MaterialTreeViewer.vue';

import { useDashboard } from '../../../composables/useDashboard';

import { useStudentMaterial } from '../../../composables/useStudentMaterial';

import type { StudentMaterialTopic } from '../../../types/student-material';

/*
 * =========================
 * Route
 * =========================
 */
const route = useRoute();

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

/*
 * =========================
 * Dashboard
 * =========================
 */
const {
  dashboard,

  errorMessage: dashboardErrorMessage,

  fetchDashboard,
} = useDashboard();

/*
 * =========================
 * Material
 * =========================
 */
const {
  topics,

  selectedTopic,

  topicTree,

  topicsLoading,

  contentLoading,

  errorMessage: materialErrorMessage,

  fetchTopics,

  fetchTopicTree,

  clearMaterial,
} = useStudentMaterial();

/*
 * =========================
 * Course
 * =========================
 */
const course = computed(() => {
  if (courseId.value === null) {
    return undefined;
  }

  return dashboard.value?.courses?.find((item) => item.id === courseId.value);
});

/*
 * =========================
 * Error
 * =========================
 */
const pageErrorMessage = computed(() => {
  return materialErrorMessage.value || dashboardErrorMessage.value;
});

/*
 * =========================
 * Init
 * =========================
 */
watch(
  courseId,

  async (id) => {
    clearMaterial();

    if (id === null) {
      return;
    }

    await Promise.all([fetchDashboard(), fetchTopics(id)]);

    /*
     * 自動開啟第一個 Topic。
     */
    const firstTopic = topics.value[0];

    if (firstTopic) {
      await fetchTopicTree(firstTopic);
    }
  },

  {
    immediate: true,
  },
);

/*
 * =========================
 * Topic
 * =========================
 */
async function openTopic(topic: StudentMaterialTopic) {
  await fetchTopicTree(topic);
}

/*
 * =========================
 * Semester
 * =========================
 */
function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}

/*
 * =========================
 * Date
 * =========================
 */
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
