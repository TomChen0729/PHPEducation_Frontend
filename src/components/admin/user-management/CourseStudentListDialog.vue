<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="course-student-list-dialog">
      <!-- Header -->
      <q-card-section class="course-student-list-dialog__header">
        <div>
          <div class="text-h6">
            {{ courseName }}
          </div>

          <div class="text-caption text-grey-7">學生名單</div>
        </div>

        <q-btn flat round dense icon="close" @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-separator />

      <!-- 學生數 -->
      <q-card-section class="course-student-list-dialog__summary">
        共 {{ students.length }} 位學生
      </q-card-section>

      <q-separator />

      <!-- 學生名單 -->
      <q-scroll-area class="course-student-list-dialog__scroll">
        <q-list separator>
          <q-item v-for="student in students" :key="student.id">
            <q-item-section>
              <q-item-label>
                {{ student.name }}
              </q-item-label>

              <q-item-label caption>
                {{ student.studentNo }}
              </q-item-label>

              <q-item-label caption>
                {{ student.email }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="關閉" color="grey-8" @click="$emit('update:modelValue', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { CourseActivationStudent } from '../../../types/user-management';

defineProps<{
  modelValue: boolean;

  courseName: string;

  students: CourseActivationStudent[];
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
