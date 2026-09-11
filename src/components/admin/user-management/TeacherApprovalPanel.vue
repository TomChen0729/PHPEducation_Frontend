<template>
  <section class="teacher-approval-panel">
    <div class="teacher-approval-panel__header">
      <div>
        <h5>開通教師帳號</h5>

        <p>審核待申請的教師帳號</p>
      </div>

      <q-badge color="blue" :label="`${applications.length} 件`" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="teacher-approval-panel__loading">
      <q-spinner color="primary" size="36px" />
    </div>

    <!-- Empty -->
    <div v-else-if="applications.length === 0" class="teacher-approval-panel__empty">
      <div>目前沒有待審核的教師申請</div>
    </div>

    <!-- List -->
    <q-scroll-area v-else class="teacher-approval-panel__scroll">
      <div class="teacher-approval-panel__list">
        <div
          v-for="application in applications"
          :key="application.id"
          class="teacher-approval-panel__item"
        >
          <div class="teacher-approval-panel__info">
            <div class="teacher-approval-panel__name">
              {{ application.name }}
            </div>

            <div class="teacher-approval-panel__email">
              {{ application.email }}
            </div>

            <div v-if="application.reason" class="teacher-approval-panel__reason">
              {{ application.reason }}
            </div>
          </div>

          <q-btn
            unelevated
            color="primary"
            label="核准"
            :loading="approvingTeacherId === application.id"
            :disable="approvingTeacherId !== null && approvingTeacherId !== application.id"
            @click="$emit('approve', application)"
          />
        </div>
      </div>
    </q-scroll-area>
  </section>
</template>

<script setup lang="ts">
import type { TeacherApplication } from '../../../types/teacher-application';

defineProps<{
  applications: TeacherApplication[];

  loading: boolean;

  approvingTeacherId: number | null;
}>();

defineEmits<{
  approve: [application: TeacherApplication];
}>();
</script>
