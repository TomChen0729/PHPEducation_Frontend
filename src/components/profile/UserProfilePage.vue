<template>
  <q-page :class="['user-profile-page', `user-profile-page--${role}`]">
    <div class="user-profile-page__container">
      <div>
        <q-btn flat :color="themeColor" icon="arrow_back" label="返回首頁" @click="goHome" />
        <div class="user-profile-page__header">
          <div class="user-profile-page__eyebrow">帳號設定</div>
          <h4 class="user-profile-page__title">個人資料</h4>
          <p class="user-profile-page__subtitle">查看目前登入帳號資訊，並管理密碼與登入狀態。</p>
        </div>
      </div>

      <div class="user-profile-page__grid">
        <q-card flat bordered class="user-profile-page__card">
          <q-card-section class="user-profile-page__identity">
            <q-avatar :color="avatarColor" text-color="white" size="72px">
              <q-icon name="account_circle" size="52px" />
            </q-avatar>

            <div class="user-profile-page__identity-text">
              <div class="user-profile-page__name">
                {{ authStore.user?.name || '使用者' }}
              </div>

              <q-badge
                outline
                :color="themeColor"
                :label="roleLabel"
                class="user-profile-page__role-badge"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="user-profile-page__details">
            <div class="user-profile-page__detail-row">
              <div class="user-profile-page__detail-label">
                <q-icon name="badge" />
                帳號
              </div>

              <div class="user-profile-page__detail-value">
                {{ authStore.user?.account || '—' }}
              </div>
            </div>

            <div
              v-if="role === 'student' && authStore.user?.student_no"
              class="user-profile-page__detail-row"
            >
              <div class="user-profile-page__detail-label">
                <q-icon name="school" />
                學號
              </div>

              <div class="user-profile-page__detail-value">
                {{ authStore.user.student_no }}
              </div>
            </div>

            <div
              v-if="role === 'student' && authStore.user?.class_name"
              class="user-profile-page__detail-row"
            >
              <div class="user-profile-page__detail-label">
                <q-icon name="groups" />
                班級
              </div>

              <div class="user-profile-page__detail-value">
                {{ authStore.user.class_name }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="user-profile-page__card">
          <q-card-section>
            <div class="user-profile-page__section-title">帳號安全</div>
            <div class="user-profile-page__section-description">
              變更登入密碼，或結束目前登入狀態。
            </div>
          </q-card-section>

          <q-separator />

          <q-list class="user-profile-page__action-list">
            <q-item clickable @click="changePasswordDialog = true">
              <q-item-section avatar>
                <q-avatar :color="actionAvatarColor" :text-color="themeColor">
                  <q-icon name="password" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="user-profile-page__action-title"> 修改密碼 </q-item-label>
                <q-item-label caption> 驗證目前密碼後，設定新的登入密碼。 </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>

            <q-separator inset="item" />

            <q-item clickable :disable="loggingOut" @click="handleLogout">
              <q-item-section avatar>
                <q-avatar color="red-1" text-color="negative">
                  <q-spinner v-if="loggingOut" size="22px" color="negative" />
                  <q-icon v-else name="logout" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="user-profile-page__action-title text-negative">
                  登出
                </q-item-label>
                <q-item-label caption> 結束目前登入狀態並返回登入頁面。 </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>

  <ChangePasswordDialog v-model="changePasswordDialog" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import ChangePasswordDialog from '../navigation/ChangePasswordDialog.vue';
import { useAuth } from '../../composables/useAuth';
import { useAuthStore } from '../../stores/auth';
import { getHomePathByRole } from '../../utils/auth-route';

type ProfileRole = 'teacher' | 'student';

const props = defineProps<{
  role: ProfileRole;
}>();

const router = useRouter();
const authStore = useAuthStore();
const { logout } = useAuth();

const changePasswordDialog = ref(false);
const loggingOut = ref(false);

const roleLabel = computed(() => {
  return props.role === 'teacher' ? '教師' : '學生';
});

const themeColor = computed(() => {
  return props.role === 'teacher' ? 'light-blue-8' : 'teal-8';
});

const avatarColor = computed(() => {
  return props.role === 'teacher' ? 'light-blue-5' : 'teal-5';
});

const actionAvatarColor = computed(() => {
  return props.role === 'teacher' ? 'light-blue-1' : 'teal-1';
});

function goHome() {
  void router.push(getHomePathByRole(props.role));
}

async function handleLogout() {
  if (loggingOut.value) {
    return;
  }

  loggingOut.value = true;

  try {
    await logout();
  } finally {
    loggingOut.value = false;
  }
}
</script>
