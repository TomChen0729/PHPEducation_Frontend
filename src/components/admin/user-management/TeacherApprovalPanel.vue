<template>
  <q-card flat bordered class="teacher-approval">
    <!-- Header -->
    <q-card-section class="teacher-approval__header">
      <div>
        <div class="text-h6">教師申請核准</div>

        <div class="text-caption text-grey-7">待處理的教師帳號申請</div>
      </div>

      <q-badge color="blue-7" :label="`${applications.length} 件`" />
    </q-card-section>

    <q-separator />

    <!-- Scroll -->
    <q-scroll-area class="teacher-approval__scroll">
      <q-list v-if="applications.length > 0" class="teacher-approval__list">
        <q-item v-for="teacher in applications" :key="teacher.id" class="teacher-approval__item">
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ teacher.name }}
            </q-item-label>

            <q-item-label caption>
              {{ teacher.email }}
            </q-item-label>

            <q-item-label caption class="teacher-approval__reason">
              申請原因：{{ teacher.reason }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="teacher-approval__actions">
              <q-btn label="核准" color="primary" unelevated @click="$emit('approve', teacher)" />

              <!-- <q-btn label="拒絕" color="negative" outline @click="$emit('reject', teacher)" /> -->
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="teacher-approval__empty">目前沒有待審核的教師申請</div>
    </q-scroll-area>
  </q-card>
</template>

<script setup lang="ts">
import type { TeacherApplication } from '../../../types/teacher-application';

defineProps<{
  applications: TeacherApplication[];
}>();

defineEmits<{
  approve: [teacher: TeacherApplication];
  reject: [teacher: TeacherApplication];
}>();
</script>
