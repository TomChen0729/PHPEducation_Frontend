<template>
  <UserProfilePage role="teacher" />
</template>

<script setup lang="ts">
import UserProfilePage from '../../components/profile/UserProfilePage.vue';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['teacher'],
  },
});
</script>
