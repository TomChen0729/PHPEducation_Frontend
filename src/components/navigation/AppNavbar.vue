<template>
  <q-header :class="navbarClass" elevated>
    <q-toolbar class="app-navbar">
      <!-- 系統名稱 -->
      <q-toolbar-title class="app-navbar__title" @click="goHome">
        PHPEducation
      </q-toolbar-title>

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
        <!-- Teacher / Student：點頭像或姓名進入個人資料 -->
        <button
          v-if="profilePath"
          type="button"
          class="app-navbar__profile-trigger"
          aria-label="前往個人資料"
          @click="goProfile"
        >
          <q-icon name="account_circle" size="28px" />

          <span>
            {{ authStore.user?.name }}
          </span>
        </button>

        <!-- Admin：沒有個人資料頁 -->
        <div v-else class="app-navbar__admin-user">
          <q-icon name="account_circle" size="28px" />

          <span>
            {{ authStore.user?.name }}
          </span>
        </div>

        <!-- Admin 維持直接變更密碼 / 登出 -->
        <template v-if="authStore.role === 'admin'">
          <q-btn icon="password" flat round @click="changePasswordDialog = true">
            <q-tooltip>變更密碼</q-tooltip>
          </q-btn>

          <q-btn icon="logout" flat round @click="handleLogout">
            <q-tooltip>登出</q-tooltip>
          </q-btn>
        </template>
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

            <!-- Teacher / Student：個人資料入口 -->
            <q-item
              v-if="profilePath"
              :to="profilePath"
              clickable
              v-close-popup
            >
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ authStore.user?.name }}</q-item-label>
                <q-item-label caption>個人資料與帳號設定</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <!-- Admin：只有帳號顯示，不進個人資料頁 -->
            <q-item v-else>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>

              <q-item-section>
                {{ authStore.user?.name }}
              </q-item-section>
            </q-item>

            <!-- Admin 仍維持原本功能 -->
            <template v-if="authStore.role === 'admin'">
              <q-item clickable v-close-popup @click="changePasswordDialog = true">
                <q-item-section avatar>
                  <q-icon name="password" />
                </q-item-section>

                <q-item-section>變更密碼</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>

                <q-item-section>登出</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>

  <!-- Admin 沒有個人資料頁，因此保留 Navbar 直接開啟修改密碼 -->
  <ChangePasswordDialog
    v-if="authStore.role === 'admin'"
    v-model="changePasswordDialog"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { navigationByRole } from '../../config/navigation';
import { useAuthStore } from '../../stores/auth';
import { getHomePathByRole } from '../../utils/auth-route';
import { useAuth } from '../../composables/useAuth';
import ChangePasswordDialog from './ChangePasswordDialog.vue';

const router = useRouter();
const authStore = useAuthStore();

const changePasswordDialog = ref(false);

const { logout } = useAuth();

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

const profilePath = computed<string | null>(() => {
  if (authStore.role === 'teacher') {
    return '/teacher/profile';
  }

  if (authStore.role === 'student') {
    return '/student/profile';
  }

  return null;
});

function goHome() {
  if (!authStore.role) {
    return;
  }

  void router.push(getHomePathByRole(authStore.role));
}

function goProfile() {
  if (!profilePath.value) {
    return;
  }

  void router.push(profilePath.value);
}

async function handleLogout() {
  await logout();
}
</script>
