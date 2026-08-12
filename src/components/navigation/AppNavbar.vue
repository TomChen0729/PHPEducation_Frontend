<template>
  <q-header :class="navbarClass" elevated>
    <q-toolbar class="app-navbar">
      <!-- 系統名稱 -->
      <q-toolbar-title class="app-navbar__title" @click="goHome"> PHPEducation </q-toolbar-title>

      <q-space />

      <!-- Desktop Navigation -->
      <nav class="app-navbar__navigation">
        <q-btn
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :label="item.label"
          class="app-navbar__button"
          flat
          no-caps
        />
      </nav>

      <q-space />

      <!-- Desktop User -->
      <div class="app-navbar__user">
        <q-icon name="account_circle" size="28px" />

        <span>
          {{ authStore.user?.name }}
        </span>

        <q-btn icon="logout" flat round @click="handleLogout">
          <q-tooltip> 登出 </q-tooltip>
        </q-btn>
      </div>

      <!-- Mobile Hamburger Menu -->
      <q-btn class="app-navbar__mobile-menu" icon="menu" flat round aria-label="開啟導覽選單">
        <q-menu>
          <q-list class="app-navbar__mobile-list">
            <!-- Navigation -->
            <q-item
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              clickable
              v-close-popup
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>

              <q-item-section>
                {{ item.label }}
              </q-item-section>
            </q-item>

            <q-separator />

            <!-- User -->
            <q-item>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>

              <q-item-section>
                {{ authStore.user?.name }}
              </q-item-section>
            </q-item>

            <!-- Logout -->
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section> 登出 </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { navigationByRole } from '../../config/navigation';
import { useAuthStore } from '../../stores/auth';
import { getHomePathByRole } from '../../utils/auth-route';

const router = useRouter();
const authStore = useAuthStore();

const navigationItems = computed(() => {
  if (!authStore.role) {
    return [];
  }

  return navigationByRole[authStore.role];
});

const navbarClass = computed(() => {
  if (!authStore.role) {
    return '';
  }

  return `app-navbar--${authStore.role}`;
});

function goHome() {
  if (!authStore.role) {
    return;
  }

  void router.push(getHomePathByRole(authStore.role));
}

function handleLogout() {
  // TODO: 等 Backend Logout API 完成後串接
  authStore.clearAuth();

  void router.replace('/login');
}
</script>
