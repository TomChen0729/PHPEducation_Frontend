<template>
  <section class="course-activation-panel">
    <!-- Header -->
    <div class="course-activation-panel__header">
      <div>
        <h5>學生帳號開通</h5>

        <p>依課程選擇並開通學生</p>
      </div>

      <q-badge color="teal" :label="`${students.length} 位待開通`" />
    </div>

    <!-- Course -->
    <q-select
      :model-value="selectedCourseId"
      outlined
      emit-value
      map-options
      behavior="menu"
      options-dense
      :options="courseOptions"
      label="選擇課程"
      :loading="coursesLoading"
      :disable="approvingStudents"
      popup-content-class="course-activation-panel__course-menu"
      class="course-activation-panel__course-select"
      @update:model-value="handleCourseChange"
    >
      <template #prepend>
        <q-icon name="menu_book" />
      </template>

      <template #no-option>
        <q-item>
          <q-item-section class="text-grey"> 目前沒有待開通學生的課程 </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Search -->
    <div class="course-activation-panel__search">
      <q-input
        v-model="searchKeyword"
        outlined
        dense
        clearable
        debounce="0"
        label="搜尋學號或姓名"
        :disable="selectedCourseId === null || approvingStudents"
        @keyup.enter="submitSearch"
        @clear="handleClearSearch"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-btn
        unelevated
        color="teal"
        icon="search"
        label="搜尋"
        :disable="selectedCourseId === null || approvingStudents"
        @click="submitSearch"
      />
    </div>

    <!-- Selected Course -->
    <!-- <div v-if="selectedCourse" class="course-activation-panel__course-info">
      <div>
        <strong>
          {{ selectedCourse.name }}
        </strong>

        <span>
          {{ formatSemester(selectedCourse.semester) }}
        </span>
      </div>
    </div> -->

    <!-- Toolbar -->
    <div v-if="selectedCourseId !== null" class="course-activation-panel__toolbar">
      <q-checkbox
        :model-value="allSelected"
        label="全選"
        color="teal"
        :disable="students.length === 0 || approvingStudents"
        @update:model-value="toggleAll"
      />

      <span>
        已選擇
        <strong>
          {{ selectedStudentIds.length }}
        </strong>
        位
      </span>
    </div>

    <!-- No Course -->
    <div v-if="selectedCourseId === null && !coursesLoading" class="course-activation-panel__empty">
      <q-icon name="menu_book" size="44px" color="grey-5" />

      <div>目前沒有待開通學生</div>
    </div>

    <!-- Loading -->
    <div v-else-if="studentsLoading" class="course-activation-panel__loading">
      <q-spinner color="teal" size="36px" />
    </div>

    <!-- Empty -->
    <div v-else-if="students.length === 0" class="course-activation-panel__empty">
      <div>目前沒有待開通學生</div>
    </div>

    <!-- Students -->
    <q-scroll-area v-else class="course-activation-panel__scroll">
      <div class="course-activation-panel__list">
        <div v-for="student in students" :key="student.id" class="course-activation-panel__item">
          <q-checkbox
            :model-value="selectedStudentIds.includes(student.id)"
            color="teal"
            :disable="approvingStudents"
            @update:model-value="(checked) => toggleStudent(student.id, Boolean(checked))"
          />

          <div class="course-activation-panel__student-info">
            <div class="course-activation-panel__student-top">
              <strong>
                {{ student.name }}
              </strong>

              <q-badge v-if="student.hasAccount" color="blue-grey" label="已有帳號" />

              <q-badge v-else color="orange" label="需建立帳號" />
            </div>

            <div class="course-activation-panel__student-meta">
              <span>
                學號：
                {{ student.studentNo }}
              </span>

              <span>
                {{ student.email }}
              </span>
            </div>

            <div class="course-activation-panel__student-extra">
              <span v-if="student.className">
                班級：
                {{ student.className }}
              </span>

              <span v-if="student.providerTeacherName">
                申請教師：
                {{ student.providerTeacherName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </q-scroll-area>

    <!-- Footer -->
    <div class="course-activation-panel__footer">
      <div class="course-activation-panel__selection-summary">
        已選擇
        {{ selectedStudentIds.length }}
        位學生
      </div>

      <q-btn
        unelevated
        color="teal"
        icon="how_to_reg"
        label="開通已選學生"
        :loading="approvingStudents"
        :disable="selectedCourseId === null || selectedStudentIds.length === 0"
        @click="$emit('request-approve')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { AdminCourse, PendingStudentItem } from '../../../types/user-management';

const props = defineProps<{
  courses: AdminCourse[];

  selectedCourseId: number | null;

  selectedCourse: AdminCourse | null;

  students: PendingStudentItem[];

  selectedStudentIds: number[];

  coursesLoading: boolean;

  studentsLoading: boolean;

  approvingStudents: boolean;

  searchKeyword: string;
}>();

const emit = defineEmits<{
  'select-course': [courseId: number];

  search: [keyword: string];

  'clear-search': [];

  'update:selected-student-ids': [ids: number[]];

  'request-approve': [];
}>();

const searchKeyword = ref(props.searchKeyword);

watch(
  () => props.searchKeyword,

  (value) => {
    searchKeyword.value = value;
  },
);

const courseOptions = computed(() => {
  return props.courses.map((course) => ({
    label: `${formatSemester(course.semester)}｜${course.name}｜${course.class_name}`,

    value: course.id,
  }));
});

const allSelected = computed(() => {
  if (props.students.length === 0) {
    return false;
  }

  return props.students.every((student) => props.selectedStudentIds.includes(student.id));
});

function handleCourseChange(value: number | null) {
  if (value === null) {
    return;
  }

  searchKeyword.value = '';

  emit('select-course', value);
}

function submitSearch() {
  emit('search', searchKeyword.value.trim());
}

function handleClearSearch() {
  searchKeyword.value = '';

  emit('clear-search');
}

function toggleAll(checked: boolean | null) {
  if (checked) {
    emit(
      'update:selected-student-ids',
      props.students.map((student) => student.id),
    );

    return;
  }

  emit('update:selected-student-ids', []);
}

function toggleStudent(studentId: number, checked: boolean) {
  if (checked) {
    emit('update:selected-student-ids', [...new Set([...props.selectedStudentIds, studentId])]);

    return;
  }

  emit(
    'update:selected-student-ids',
    props.selectedStudentIds.filter((id) => id !== studentId),
  );
}

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  if (term === '1') {
    return `${year}上`;
  }

  if (term === '2') {
    return `${year}下`;
  }

  return semester;
}
</script>
