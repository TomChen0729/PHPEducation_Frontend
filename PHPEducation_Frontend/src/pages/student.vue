<template>
  <router-view />
</template>

<script setup lang="ts">
definePage({
  meta: {
    requiresAuth: true,
    roles: ['student'],
  },
})
</script>
