<template>
  <div>
    <q-toolbar class="bg-secondary text-white shadow-2">
      <q-btn flat round dense icon="menu" class="q-mr-sm" />

      <q-space />

      <q-btn-toggle
        v-model="model"
        flat
        stretch
        toggle-color="yellow"
        :options="options"
      />
    </q-toolbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const model = ref('one')
const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three' }
]
</script>
