<template>
  <q-page class="admin-dashboard-page">
    <header class="admin-dashboard-page__header">
      <div>
        <h4 class="admin-dashboard-page__title">資料總覽</h4>

        <p class="admin-dashboard-page__description">
          查看目前教師、學生、課程與待處理資料。
        </p>
      </div>

      <q-badge
        v-if="pendingCount > 0"
        color="deep-purple"
        :label="`待處理 ${pendingCount} 件`"
        class="admin-dashboard-page__pending-badge"
      />
    </header>

    <UserStatsCards :stats="stats" :loading="statsLoading" />

    <q-banner
      v-if="errorMessage"
      rounded
      class="bg-red-1 text-negative admin-dashboard-page__error"
    >
      <template #avatar>
        <q-icon name="error_outline" color="negative" />
      </template>

      {{ errorMessage }}

      <template #action>
        <q-btn flat dense color="negative" icon="close" @click="clearErrorMessage" />
      </template>
    </q-banner>

    <section class="admin-dashboard-page__pending-grid">
      <q-card flat bordered class="admin-dashboard-page__pending-card">
        <q-card-section>
          <div class="admin-dashboard-page__pending-icon admin-dashboard-page__pending-icon--teacher">
            <q-icon name="person_add" size="28px" />
          </div>

          <div>
            <div class="admin-dashboard-page__pending-label">待審核教師申請</div>

            <div class="admin-dashboard-page__pending-value">
              {{ teacherApplications.length }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="admin-dashboard-page__pending-card">
        <q-card-section>
          <div class="admin-dashboard-page__pending-icon admin-dashboard-page__pending-icon--course">
            <q-icon name="how_to_reg" size="28px" />
          </div>

          <div>
            <div class="admin-dashboard-page__pending-label">待開通課程</div>

            <div class="admin-dashboard-page__pending-value">
              {{ pendingCourses.length }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <q-card flat bordered class="admin-dashboard-page__action-card">
      <q-card-section class="admin-dashboard-page__action-content">
        <div>
          <div class="admin-dashboard-page__action-title">使用者與課程審核</div>

          <div class="admin-dashboard-page__action-description">
            前往處理教師申請與待開通課程。
          </div>
        </div>

        <q-btn
          unelevated
          color="deep-purple"
          icon-right="arrow_forward"
          label="前往使用者管理"
          to="/admin/userManagement"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import UserStatsCards from '../../components/admin/user-management/UserStatsCards.vue';

import { useUserManagement } from '../../composables/useUserManagement';

const {
  stats,
  statsLoading,
  teacherApplications,
  pendingCourses,
  pendingCount,
  errorMessage,
  clearErrorMessage,
  initialize,
} = useUserManagement();

onMounted(() => {
  void initialize();
});
</script>
