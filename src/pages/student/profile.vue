<template>
  <UserProfilePage role="student" />
</template>

<script setup lang="ts">
import UserProfilePage from '../../components/profile/UserProfilePage.vue';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
});
</script>
