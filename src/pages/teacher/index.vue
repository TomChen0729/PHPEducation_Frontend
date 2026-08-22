<template>
  <q-page>
    <div v-if="loading">載入中...</div>

    <q-banner v-else-if="errorMessage" class="bg-red-1 text-negative">
      {{ errorMessage }}
    </q-banner>

    <template v-else-if="dashboard">
      <h4>{{ dashboard.user.name }}，您好</h4>

      <div v-for="course in dashboard.courses ?? []" :key="course.id">
        {{ course.name }}
        {{ course.semester }}
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useDashboard } from '../../composables/useDashboard';

const { dashboard, loading, errorMessage, fetchDashboard } = useDashboard();

onMounted(() => {
  void fetchDashboard();
});
</script>
