<template>
  <router-view />
  <div>
    <adminNavbar />
  </div>
</template>

<script setup lang="ts">
import adminNavbar from '@/components/adminNavbar.vue'

definePage({
  meta: {
    requiresAuth: true,
    roles: ['admin'],
  },
})
</script>
