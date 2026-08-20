<template>
  <q-card flat bordered class="student-activation bg-teal-1">
    <!-- Header -->
    <q-card-section class="student-activation__header">
      <div>
        <div class="text-h6">學生帳號開通</div>

        <div class="text-caption text-grey-7">依照課程篩選並開通學生帳號</div>
      </div>

      <q-badge color="teal-7" :label="`${students.length} 位`" />
    </q-card-section>

    <q-separator />

    <!-- Filter -->
    <q-card-section class="student-activation__filter">
      <!-- Course -->
      <q-select
        :model-value="selectedCourseId"
        :options="courseOptions"
        label="選擇課程"
        class="student-activation__search"
        outlined
        emit-value
        map-options
        clearable
        @update:model-value="$emit('update:selectedCourseId', $event)"
      >
        <template #prepend>
          <q-icon name="school" />
        </template>
      </q-select>

      <!-- Search -->
      <q-input
        :model-value="searchKeyword"
        label="搜尋學號或姓名"
        class="student-activation__search"
        outlined
        clearable
        :disable="selectedCourseId === null"
        @update:model-value="$emit('update:searchKeyword', String($event ?? ''))"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-card-section>

    <q-separator />

    <!-- 尚未選課程 -->
    <q-card-section v-if="selectedCourseId === null" class="student-activation__empty">
      <q-icon name="school" size="48px" color="grey-5" />

      <div>請先選擇要開通學生帳號的課程</div>
    </q-card-section>

    <template v-else>
      <!-- Select All -->
      <q-card-section class="student-activation__selection-header">
        <q-checkbox
          :model-value="allFilteredStudentsSelected"
          label="全選"
          :disable="students.length === 0"
          @update:model-value="$emit('toggle-select-all')"
        />

        <span class="text-caption text-grey-7"> 共 {{ students.length }} 位學生 </span>
      </q-card-section>

      <!-- Student List -->
      <q-scroll-area class="student-activation__scroll">
        <q-list separator>
          <q-item
            v-for="student in students"
            :key="student.id"
            clickable
            class="student-activation__student"
            :class="{
              'student-activation__student--selected': selectedStudentIds.includes(student.id),
            }"
            @click="$emit('toggle-student', student.id)"
          >
            <q-item-section avatar>
              <q-checkbox
                :model-value="selectedStudentIds.includes(student.id)"
                @click.stop
                @update:model-value="$emit('toggle-student', student.id)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                {{ student.name }}
              </q-item-label>

              <q-item-label caption>
                學號：
                {{ student.studentNo }}
              </q-item-label>

              <q-item-label caption>
                申請教師：
                {{ student.providerTeacherName }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- No Result -->
          <q-item v-if="students.length === 0">
            <q-item-section class="student-activation__empty">
              <q-icon name="person_search" size="42px" color="grey-5" />

              <div>沒有符合條件的學生</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator />

      <!-- Footer -->
      <q-card-section class="student-activation__footer">
        <div>
          已選擇
          <strong>
            {{ selectedStudentCount }}
          </strong>
          位學生
        </div>

        <q-btn
          label="開通學生帳號"
          icon="how_to_reg"
          color="teal"
          unelevated
          :disable="selectedStudentCount === 0"
          :loading="loading"
          @click="$emit('request-activate')"
        />
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import type { CourseFilterOption, PendingStudentItem } from '../../../types/user-management';

defineProps<{
  courseOptions: CourseFilterOption[];

  selectedCourseId: number | null;

  searchKeyword: string;

  students: PendingStudentItem[];

  selectedStudentIds: number[];

  selectedStudentCount: number;

  allFilteredStudentsSelected: boolean;

  loading?: boolean;
}>();

defineEmits<{
  'update:selectedCourseId': [value: number | null];

  'update:searchKeyword': [value: string];

  'toggle-student': [studentId: number];

  'toggle-select-all': [];

  'request-activate': [];
}>();
</script>
