<template>
  <q-page class="teacher-home">
    <div class="teacher-home__header">
      <div>
        <div class="text-h5 text-weight-bold">課程管理</div>
      </div>

      <q-btn
        label="新增課程"
        icon="add"
        color="light-blue-7"
        unelevated
        @click="openCreateDialog"
      />
    </div>

    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mb-md" rounded>
      {{ errorMessage }}
    </q-banner>

    <div v-if="loading && courses.length === 0" class="teacher-home__loading">
      <q-spinner size="40px" color="light-blue-7" />
    </div>

    <div v-else-if="courses.length === 0" class="teacher-home__empty">
      <q-icon name="school" size="64px" color="grey-5" />

      <div class="text-h6">目前還沒有課程</div>

      <div class="text-grey-7">點擊「新增課程」建立第一門課程</div>
    </div>

    <div v-else class="teacher-home__courses">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        @edit="openEditDialog"
        @delete="requestDeleteCourse"
        @enter="enterCourse"
      />
    </div>

    <CourseFormDialog
      v-model="courseDialogOpen"
      :mode="courseDialogMode"
      :course="editingCourse"
      :loading="loading"
      @submit="handleCourseSubmit"
    />

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="刪除課程"
      :message="`確定要刪除「${deletingCourse?.name ?? ''}」嗎？`"
      confirm-label="確定刪除"
      confirm-color="negative"
      :loading="loading"
      @confirm="confirmDeleteCourse"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useRouter } from 'vue-router';

import { Notify } from 'quasar';

import CourseCard from '../../components/teacher/teacher-course/CourseCard.vue';
import CourseFormDialog from '../../components/teacher/teacher-course/CourseFormDialog.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';

import { useTeacherCourses } from '../../composables/useTeacherCourses.js';

import { useAuthStore } from '../../stores/auth.js';

import type { Course, CreateCourseRequest } from '../../types/course.js';

const router = useRouter();
const authStore = useAuthStore();

const { courses, loading, errorMessage, fetchCourses, createCourse, updateCourse, deleteCourse } =
  useTeacherCourses();

const courseDialogOpen = ref(false);

const courseDialogMode = ref<'create' | 'edit'>('create');

const editingCourse = ref<Course | null>(null);

const deleteDialogOpen = ref(false);

const deletingCourse = ref<Course | null>(null);

onMounted(() => {
  void fetchCourses();
});

function openCreateDialog() {
  editingCourse.value = null;
  courseDialogMode.value = 'create';
  courseDialogOpen.value = true;
}

function openEditDialog(course: Course) {
  editingCourse.value = course;
  courseDialogMode.value = 'edit';
  courseDialogOpen.value = true;
}

async function handleCourseSubmit(data: CreateCourseRequest) {
  let success = false;

  if (courseDialogMode.value === 'create') {
    success = await createCourse(data);
  } else if (editingCourse.value) {
    success = await updateCourse(editingCourse.value.id, data);
  }

  if (!success) {
    return;
  }

  courseDialogOpen.value = false;

  Notify.create({
    type: 'positive',
    message: courseDialogMode.value === 'create' ? '課程建立成功' : '課程修改成功',
    position: 'top',
    timeout: 1500,
  });
}

function requestDeleteCourse(course: Course) {
  deletingCourse.value = course;
  deleteDialogOpen.value = true;
}

async function confirmDeleteCourse() {
  if (!deletingCourse.value) {
    return;
  }

  const success = await deleteCourse(deletingCourse.value.id);

  if (!success) {
    return;
  }

  deleteDialogOpen.value = false;
  deletingCourse.value = null;

  Notify.create({
    type: 'positive',
    message: '課程已刪除',
    position: 'top',
    timeout: 1500,
  });
}

function enterCourse(course: Course) {
  void router.push(`/teacher/courses/${course.id}`);
}
</script>
