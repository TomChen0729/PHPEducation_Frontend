<template>
  <q-card flat bordered class="course-activation-panel">
    <!-- 標題 -->
    <q-card-section class="course-activation-panel__header">
      <div>
        <div class="text-h6">課程開通</div>

        <div class="text-caption text-grey-7">審核教師提出的課程學生名單</div>
      </div>

      <q-badge color="teal" :label="`${applications.length} 筆`" />
    </q-card-section>

    <q-separator />

    <!-- 無待處理資料 -->
    <div v-if="applications.length === 0" class="course-activation-panel__empty">
      目前沒有待開通課程
    </div>

    <!-- 課程清單 -->
    <q-scroll-area v-else class="course-activation-panel__scroll">
      <div class="course-activation-panel__list">
        <div
          v-for="application in applications"
          :key="application.id"
          class="course-activation-panel__item"
        >
          <!-- 左側資訊 -->
          <div class="course-activation-panel__content">
            <div class="course-activation-panel__course-name">
              {{ application.courseName }}
            </div>

            <div class="course-activation-panel__detail">
              {{ formatSemester(application.semester) }}
            </div>

            <div class="course-activation-panel__detail">
              授課教師：
              {{ application.teacherName }}
            </div>

            <div class="course-activation-panel__detail">
              學生人數：
              {{ application.studentCount }}
              人
            </div>
          </div>

          <!-- 右側按鈕 -->
          <div class="course-activation-panel__actions">
            <q-btn
              outline
              color="teal"
              label="檢視名單"
              @click="$emit('view-students', application)"
            />

            <q-btn
              unelevated
              color="teal"
              label="開通"
              :loading="loadingApplicationId === application.id"
              :disable="loadingApplicationId !== null && loadingApplicationId !== application.id"
              @click="$emit('request-approve', application)"
            />
          </div>
        </div>
      </div>
    </q-scroll-area>
  </q-card>
</template>

<script setup lang="ts">
import type { CourseActivationApplication } from '../../../types/user-management';

defineProps<{
  applications: CourseActivationApplication[];

  loadingApplicationId?: number | null;
}>();

defineEmits<{
  'view-students': [application: CourseActivationApplication];

  'request-approve': [application: CourseActivationApplication];
}>();

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
