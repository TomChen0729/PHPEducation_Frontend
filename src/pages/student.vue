<template>
  <q-layout view="hHh lpR fFf">
    <AppNavbar />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import AppNavbar from '../components/navigation/AppNavbar.vue';

definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
});
</script>
