<template>
  <div class="student-question-page">
    <!-- =====================================================
         Header
    ====================================================== -->
    <header class="student-question-page__header">
      <div class="student-question-page__header-main">
        <!-- Back -->
        <q-btn flat round icon="arrow_back" color="grey-8" @click="goBack">
          <q-tooltip> 返回教材 </q-tooltip>
        </q-btn>

        <!-- Title -->
        <div>
          <div class="student-question-page__title">題目練習</div>

          <div class="student-question-page__subtitle">選擇題目開始練習</div>
        </div>
      </div>

      <!-- Question Count -->
      <q-badge
        v-if="!loading && validCourseId"
        outline
        color="teal-7"
        class="student-question-page__count"
      >
        共 {{ questionCount }} 題
      </q-badge>
    </header>

    <!-- =====================================================
         Invalid Course
    ====================================================== -->
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

    <!-- =====================================================
         Question Content
    ====================================================== -->
    <q-card v-else flat bordered class="student-question-page__content">
      <q-card-section>
        <StudentQuestionList
          :questions="questions"
          :loading="loading"
          :error-message="errorMessage"
          @open-question="handleOpenQuestion"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import StudentQuestionList from '../../../../components/student/question/StudentQuestionList.vue';

import { useStudentQuestions } from '../../../../composables/useStudentQuestions';

/*
 * ============================================================
 * Page Guard
 * ============================================================
 */

definePage({
  meta: {
    requiresAuth: true,

    roles: ['student'],
  },
});

/*
 * ============================================================
 * Router
 * ============================================================
 */

const route = useRoute();

const router = useRouter();

/*
 * ============================================================
 * Course ID
 * ============================================================
 */

const courseId = computed(() => {
  const params = route.params as {
    courseId?: string | string[];
  };

  const rawCourseId = params.courseId;

  /*
   * 正常情況 courseId 是 string，
   * 這裡也相容 string[]。
   */
  const value = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;

  return Number(value);
});

/*
 * ============================================================
 * Valid Course ID
 * ============================================================
 */

const validCourseId = computed(() => {
  return Number.isInteger(courseId.value) && courseId.value > 0;
});

/*
 * ============================================================
 * Student Questions
 * ============================================================
 */

const {
  /*
   * Data
   */
  questions,

  /*
   * Loading
   */
  loading,

  /*
   * Error
   */
  errorMessage,

  /*
   * Computed
   */
  questionCount,

  /*
   * Methods
   */
  loadQuestions,
} = useStudentQuestions();

/*
 * ============================================================
 * Load Questions
 * ============================================================
 *
 * 進入：
 *
 * /student/course/1/questions
 *
 * 就會呼叫：
 *
 * GET
 * /student/courses/1/questions
 */

watch(
  courseId,

  async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    await loadQuestions(id);
  },

  {
    immediate: true,
  },
);

/*
 * ============================================================
 * Back To Course
 * ============================================================
 */

function goBack() {
  if (!validCourseId.value) {
    void router.push('/student/courses');

    return;
  }

  void router.push(`/student/course/${courseId.value}`);
}

/*
 * ============================================================
 * Open Question
 * ============================================================
 *
 * 下一步我們會建立：
 *
 * /student/question/:questionId
 *
 * 現在先把 Router 導向準備好。
 */

function handleOpenQuestion(questionId: number) {
  void router.push({
    path: `/student/question/${questionId}`,

    query: {
      courseId: String(courseId.value),
    },
  });
}
</script>
