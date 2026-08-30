<template>
  <q-page class="student-courses-page">
    <!-- =========================
         Header
    ========================== -->
    <div class="student-courses-page__header">
      <div>
        <h5 class="student-courses-page__title">我的課程</h5>
      </div>
    </div>

    <!-- =========================
         Loading
    ========================== -->
    <div v-if="loading" class="student-courses-page__loading">
      <q-spinner color="teal-8" size="42px" />

      <div>課程載入中...</div>
    </div>

    <!-- =========================
         Error
    ========================== -->
    <q-banner v-else-if="errorMessage" rounded class="bg-red-1 text-negative">
      {{ errorMessage }}
    </q-banner>

    <!-- =========================
         Empty
    ========================== -->
    <div v-else-if="courses.length === 0" class="student-courses-page__empty">
      <q-icon name="school" size="54px" color="teal-4" />
      &nbsp;
      <div>目前沒有已加入的課程</div>
    </div>

    <!-- =========================
         Courses
    ========================== -->
    <div v-else class="student-courses-page__grid">
      <q-card
        v-for="course in courses"
        :key="course.id"
        flat
        bordered
        class="student-courses-page__card"
      >
        <q-card-section class="student-courses-page__card-content">
          <!-- Course Name -->
          <div class="text-h6 student-courses-page__course-name">
            {{ course.name }}
          </div>

          <!-- Meta -->
          <div class="student-courses-page__meta">
            <div>
              <q-icon name="groups" color="teal-7" />
              &nbsp;
              <span>
                {{ course.class_name }}
              </span>
            </div>

            <div>
              <q-icon name="calendar_month" color="teal-7" />
              &nbsp;
              <span>
                {{ formatSemester(course.semester) }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="student-courses-page__description">
            {{ course.description }}
          </div>
        </q-card-section>

        <q-separator class="student-courses-page__separator" />

        <q-card-actions align="right">
          <q-btn
            flat
            color="teal-8"
            icon-right="arrow_forward"
            label="查看教材"
            @click="enterCourse(course.id)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useRouter } from 'vue-router';

import { useDashboard } from '../../composables/useDashboard';

const router = useRouter();

const {
  dashboard,

  loading,

  errorMessage,

  fetchDashboard,
} = useDashboard();

/*
 * =========================
 * Courses
 * =========================
 */
const courses = computed(() => {
  return dashboard.value?.courses ?? [];
});

/*
 * =========================
 * Init
 * =========================
 */
onMounted(() => {
  void fetchDashboard();
});

/*
 * =========================
 * Enter Course
 * =========================
 */
function enterCourse(courseId: number) {
  void router.push(`/student/course/${courseId}`);
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
</script>
