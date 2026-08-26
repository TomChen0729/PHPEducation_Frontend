<template>
  <q-card flat bordered class="course-card">
    <q-card-section>
      <div class="course-card__header">
        <div>
          <div class="text-h6">
            {{ course.name }}
          </div>

          <div class="course-card__meta">
            <div>
              <q-icon name="groups" size="16px" />

              課程班級：
              {{ course.class_name }}
            </div>

            <div>
              <q-icon name="calendar_month" size="16px" />

              開課學期：
              {{ formatSemester(course.semester) }}
            </div>
          </div>
        </div>

        <q-icon name="school" size="32px" color="light-blue-7" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="course-card__description">
      <dev class="course-card__description-value">
        {{ course.description || '目前尚未填寫課程說明' }}
      </dev>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="編輯" icon="edit" flat color="light-blue-7" @click="$emit('edit', course)" />

      <q-btn label="刪除" icon="delete" flat color="red-8" @click="$emit('delete', course)" />

      <q-btn
        label="進入課程"
        icon-right="arrow_forward"
        color="blue"
        unelevated
        :to="`/teacher/course/${course.id}`"
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

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
