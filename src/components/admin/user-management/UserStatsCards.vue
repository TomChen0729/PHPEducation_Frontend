<template>
  <section class="user-stats">
    <!-- 教師 -->
    <q-card flat class="user-stats__card bg-blue-1">
      <q-card-section>
        <div class="user-stats__label">教師總數</div>

        <div class="user-stats__value">
          {{ stats.teacherCount }}
        </div>
      </q-card-section>
    </q-card>

    <!-- 學生 -->
    <q-card flat class="user-stats__card bg-teal-1">
      <q-card-section>
        <div class="user-stats__label">課程總數</div>

        <div class="user-stats__value">
          {{ stats.studentCount }}
        </div>
      </q-card-section>
    </q-card>

    <!-- 課程 -->
    <q-card flat class="user-stats__card bg-blue-grey-1">
      <q-card-section>
        <div class="user-stats__label">本學期課程</div>

        <div class="user-stats__value">
          {{ stats.currentSemesterCourseCount }}
        </div>
      </q-card-section>
    </q-card>
  </section>
</template>

<script setup lang="ts">
import type { UserStats } from '../../../types/user-management';

defineProps<{
  stats: UserStats;
}>();
</script>
