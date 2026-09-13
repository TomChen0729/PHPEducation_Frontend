<template>
  <section class="course-activation-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-activation-panel__header">
      <div>
        <h5>開通課程學生</h5>

        <p>直接勾選目前待開通的課程，可一次多選或全選開通。</p>
      </div>

      <q-badge color="teal" :label="`${courses.length} 門待開通`" />
    </div>

    <!-- =========================
         Content
    ========================== -->
    <div v-if="courses.length > 0 || loading" class="course-activation-panel__content">
      <!-- =========================
           Select All
      ========================== -->
      <div class="course-activation-panel__toolbar">
        <q-checkbox
          :model-value="selectAllState"
          :indeterminate-value="null"
          color="teal"
          label="全選"
          :disable="loading || approving"
          @update:model-value="handleSelectAllChange"
        />

        <div class="course-activation-panel__toolbar-summary">
          已選擇

          <strong>
            {{ selectedCourseIds.length }}
          </strong>

          / {{ courses.length }} 門
        </div>
      </div>

      <q-separator />

      <!-- =========================
           Loading
      ========================== -->
      <div v-if="loading" class="course-activation-panel__loading">
        <q-spinner color="teal" size="32px" />

        <span> 載入待開通課程... </span>
      </div>

      <!-- =========================
           Course List
      ========================== -->
      <div v-else class="course-activation-panel__course-list">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-activation-panel__course-row"
          :class="{
            'course-activation-panel__course-row--selected': selectedCourseIds.includes(course.id),
          }"
        >
          <!-- Checkbox -->
          <q-checkbox
            :model-value="selectedCourseIds.includes(course.id)"
            color="teal"
            :disable="approving"
            @update:model-value="(value) => handleCourseToggle(course.id, Boolean(value))"
          />

          <!-- Course Info -->
          <div class="course-activation-panel__course-info">
            <div class="course-activation-panel__course-title-row">
              <strong>
                {{ course.name }}
              </strong>

              <q-badge
                color="orange-2"
                text-color="orange-10"
                :label="`${pendingCount(course.id)} 位待審核`"
              />
            </div>

            <div class="course-activation-panel__course-meta">
              <!-- Semester -->
              <span>
                <q-icon name="event" />

                {{ formatSemester(course.semester) }}
              </span>

              <!-- Class -->
              <span>
                <q-icon name="groups" />

                {{ course.class_name || '未設定班級' }}
              </span>

              <!-- Teacher -->
              <span v-if="course.teacherName">
                <q-icon name="person" />

                {{ course.teacherName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- =========================
           Selected Summary
      ========================== -->
      <q-banner v-if="selectedCourseIds.length > 0" rounded class="course-activation-panel__notice">
        <template #avatar>
          <q-icon name="info" color="teal-8" />
        </template>

        將開通

        <strong>
          {{ selectedCourseIds.length }}
        </strong>

        門課程，共處理約

        <strong>
          {{ selectedStudentTotal }}
        </strong>

        筆待審核學生資料。 尚未有帳號者會建立學生帳號； 已有帳號者只會加入對應課程。
      </q-banner>
    </div>

    <!-- =========================
         Empty
    ========================== -->
    <div v-if="courses.length === 0 && !loading" class="course-activation-panel__empty">
      <q-icon name="task_alt" size="48px" color="teal-4" />

      <div>目前沒有待開通課程</div>
    </div>

    <!-- =========================
         Footer
    ========================== -->
    <div class="course-activation-panel__footer">
      <div class="course-activation-panel__selection-summary">
        已選擇

        <strong>
          {{ selectedCourseIds.length }}
        </strong>

        門課程
      </div>

      <q-btn
        unelevated
        color="teal"
        icon="how_to_reg"
        :label="approveButtonLabel"
        :loading="approving"
        :disable="selectedCourseIds.length === 0 || loading || approving"
        @click="emit('request-approve')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AdminCourse } from '../../../types/user-management';

/*
 * ============================================================
 * Props
 * ============================================================
 */
const props = defineProps<{
  /*
   * 只傳目前有 Pending Student 的課程。
   */
  courses: AdminCourse[];

  /*
   * Checkbox 已勾選的 Course ID。
   */
  selectedCourseIds: number[];

  /*
   * 每一門課有多少 Pending Student。
   *
   * Example：
   *
   * {
   *   1: 35,
   *   2: 28,
   * }
   */
  pendingStudentCountByCourse: Record<number, number>;

  /*
   * 所有已勾選課程的 Pending Student
   * 總筆數。
   */
  selectedStudentTotal: number;

  /*
   * 課程 / Pending Courses Loading。
   */
  loading: boolean;

  /*
   * 課程開通中。
   */
  approving: boolean;
}>();

/*
 * ============================================================
 * Emits
 * ============================================================
 */
const emit = defineEmits<{
  /*
   * Checkbox 更新。
   */
  'update:selected-course-ids': [ids: number[]];

  /*
   * Parent 開啟 ConfirmDialog。
   */
  'request-approve': [];
}>();

/*
 * ============================================================
 * Computed
 * ============================================================
 */

/*
 * 全選 Checkbox：
 *
 * false
 * → 完全沒有選
 *
 * true
 * → 全部選取
 *
 * null
 * → 部分選取
 */
const selectAllState = computed<boolean | null>(() => {
  if (props.courses.length === 0 || props.selectedCourseIds.length === 0) {
    return false;
  }

  /*
   * 不直接只比較 length，
   * 再確認每一門目前的 course
   * 都真的存在 selected 中。
   */
  const allSelected = props.courses.every((course) => {
    return props.selectedCourseIds.includes(course.id);
  });

  if (allSelected) {
    return true;
  }

  return null;
});

/*
 * 開通按鈕文字。
 */
const approveButtonLabel = computed(() => {
  if (props.selectedCourseIds.length === 0) {
    return '開通已選課程';
  }

  return `開通已選課程 (${props.selectedCourseIds.length})`;
});

/*
 * ============================================================
 * Select All
 * ============================================================
 */
function handleSelectAllChange(value: boolean | null) {
  /*
   * 如果目前不是全選，
   * 點一下 → 全選。
   */
  if (value === true) {
    emit(
      'update:selected-course-ids',

      props.courses.map((course) => {
        return course.id;
      }),
    );

    return;
  }

  /*
   * 取消全選。
   */
  emit('update:selected-course-ids', []);
}

/*
 * ============================================================
 * Single Course Checkbox
 * ============================================================
 */
function handleCourseToggle(courseId: number, selected: boolean) {
  const ids = new Set(props.selectedCourseIds);

  if (selected) {
    ids.add(courseId);
  } else {
    ids.delete(courseId);
  }

  emit('update:selected-course-ids', [...ids]);
}

/*
 * ============================================================
 * Pending Count
 * ============================================================
 */
function pendingCount(courseId: number): number {
  return props.pendingStudentCountByCourse[courseId] ?? 0;
}

/*
 * ============================================================
 * Semester
 * ============================================================
 */
function formatSemester(semester: string): string {
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
