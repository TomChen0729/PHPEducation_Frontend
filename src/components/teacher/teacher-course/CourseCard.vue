<template>
  <q-card flat bordered class="course-card">
    <q-card-section>
      <div class="course-card__header">
        <div>
          <div class="text-h6">
            {{ course.name }}
          </div>

          <div class="text-caption text-grey-7">開課學期：{{ course.semester }}</div>
        </div>

        <q-icon name="school" size="32px" color="light-blue-7" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="course-card__description">
      {{ course.description || '目前尚未填寫課程說明' }}
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="編輯" icon="edit" flat color="light-blue-7" @click="$emit('edit', course)" />

      <q-btn label="刪除" icon="delete" flat color="red-8" @click="$emit('delete', course)" />

      <q-btn
        label="進入課程"
        icon-right="arrow_forward"
        unelevated
        color="light-blue-7"
        @click="$emit('enter', course)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Course } from '../../../types/course';

defineProps<{
  course: Course;
}>();

defineEmits<{
  edit: [course: Course];
  delete: [course: Course];
  enter: [course: Course];
}>();
</script>
