<template>
  <q-card flat bordered class="student-activation bg-teal-1">
    <q-card-section class="student-activation__header">
      <div>
        <div class="text-h6">學生帳號開通</div>

        <div class="text-caption text-grey-7">選擇需要開通的學生</div>
      </div>

      <q-badge color="teal-7" :label="`${students.length} 位`" />
    </q-card-section>

    <!-- <q-card-section class="student-activation__toolbar"> -->
    <div class="student-activation__toolbar">
      <q-checkbox
        :model-value="allSelected"
        :indeterminate="someSelected"
        label="全選"
        @update:model-value="toggleAll"
      />

      <q-space />

      <span> 已選 {{ selectedModel.length }} 位 </span>

      <q-btn
        label="開通已選帳號"
        color="teal-7"
        unelevated
        :disable="selectedModel.length === 0"
        @click="$emit('activate')"
      />
      <!-- </q-card-section> -->
    </div>

    <q-separator />

    <q-scroll-area class="student-activation__scroll">
      <q-list v-if="students.length">
        <q-item
          v-for="student in students"
          :key="student.id"
          class="student-activation__item"
          :class="{
            'student-activation__item--selected': selectedModel.includes(student.id),
          }"
          clickable
          @click="toggleStudent(student.id)"
        >
          <q-item-section avatar>
            <q-checkbox v-model="selectedModel" :val="student.id" @click.stop />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ student.studentNo }}
              {{ student.name }}
            </q-item-label>

            <q-item-label caption> 由 {{ student.providerTeacherName }} 提供 </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="student-activation__empty">目前沒有待開通學生</div>
    </q-scroll-area>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { PendingStudentItem } from '../../../types/user-management';

const props = defineProps<{
  students: PendingStudentItem[];
  selectedIds: number[];
}>();

const emit = defineEmits<{
  'update:selectedIds': [value: number[]];
  activate: [];
}>();

const selectedModel = computed({
  get: () => props.selectedIds,

  set: (value: number[]) => {
    emit('update:selectedIds', value);
  },
});

const allSelected = computed(() => {
  return props.students.length > 0 && selectedModel.value.length === props.students.length;
});

const someSelected = computed(() => {
  return selectedModel.value.length > 0 && !allSelected.value;
});

function toggleAll(checked: boolean) {
  selectedModel.value = checked ? props.students.map((student) => student.id) : [];
}

function toggleStudent(id: number) {
  if (selectedModel.value.includes(id)) {
    selectedModel.value = selectedModel.value.filter((selectedId) => selectedId !== id);

    return;
  }

  selectedModel.value = [...selectedModel.value, id];
}
</script>
