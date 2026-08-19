<template>
  <q-dialog
    :model-value="modelValue"
    class="course-form-dialog__dialog"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="course-form-dialog">
      <q-card-section>
        <div class="text-h5 text-weight-bold text-center">
          {{ mode === 'create' ? '新增課程' : '編輯課程' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-form @submit="handleSubmit">
        <q-card-section class="course-form-dialog__form">
          <!-- 課程名稱 -->
          <q-input
            v-model="form.name"
            label="課程名稱 *"
            outlined
            maxlength="255"
            :rules="[(value) => !!value || '請輸入課程名稱']"
          />

          <!-- 開課學期 -->
          <div class="course-form-dialog__semester">
            <!-- 學年度 -->
            <q-select
              v-model="form.schoolYear"
              :options="schoolYearOptions"
              label="學年度 *"
              outlined
              emit-value
              map-options
              :rules="[(value) => value !== null || '請選擇學年度']"
            />

            <!-- 上下學期 -->
            <q-select
              v-model="form.term"
              :options="termOptions"
              label="學期 *"
              outlined
              emit-value
              map-options
              :rules="[(value) => value !== null || '請選擇學期']"
            />
          </div>

          <!-- 課程說明 -->
          <q-input
            v-model="form.description"
            label="課程說明"
            type="textarea"
            outlined
            maxlength="2000"
            class="course-form-dialog__description"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="取消" flat @click="closeDialog" />

          <q-btn
            :label="mode === 'create' ? '建立課程' : '儲存修改'"
            type="submit"
            color="light-blue-7"
            unelevated
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

import type { Course, CreateCourseRequest } from '../../../types/course';

type TermValue = 1 | 2;

interface CourseForm {
  name: string;
  schoolYear: number | null;
  term: TermValue | null;
  description: string;
}

const props = defineProps<{
  modelValue: boolean;
  mode: 'create' | 'edit';
  course?: Course | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [data: CreateCourseRequest];
}>();

const form = reactive<CourseForm>({
  name: '',
  schoolYear: null,
  term: null,
  description: '',
});

/*
 * 民國年：
 * 西元年 - 1911
 *
 * 例如：
 * 2026 - 1911 = 115
 */
const currentSchoolYear = new Date().getFullYear() - 1911;

/*
 * 學年度選項：
 * 從目前民國年一路到 47 年
 *
 * 例如目前為 115 年：
 * 115、114、113 ... 47
 */
const schoolYearOptions = Array.from(
  {
    length: currentSchoolYear - 47 + 1,
  },
  (_, index) => {
    const year = currentSchoolYear - index;

    return {
      label: `${year} 學年度`,
      value: year,
    };
  },
);

/*
 * 上、下學期
 *
 * Backend：
 * 上學期 → 1
 * 下學期 → 2
 */
const termOptions = [
  {
    label: '上學期',
    value: 1,
  },
  {
    label: '下學期',
    value: 2,
  },
];

/*
 * Dialog 開啟時：
 *
 * 新增模式 → 清空
 * 編輯模式 → 將 Backend 的 115-1
 *            拆成 115 + 1
 */
watch(
  () => [props.modelValue, props.course],
  () => {
    if (!props.modelValue) {
      return;
    }

    form.name = props.course?.name ?? '';

    form.description = props.course?.description ?? '';

    if (props.course?.semester) {
      const [schoolYear, term] = props.course.semester.split('-');

      form.schoolYear = Number(schoolYear);

      form.term = Number(term) as TermValue;
    } else {
      form.schoolYear = null;
      form.term = null;
    }
  },
  {
    immediate: true,
  },
);

function handleSubmit() {
  if (form.schoolYear === null || form.term === null) {
    return;
  }

  /*
   * 將兩個選擇框合併成 Backend 格式
   *
   * 115 + 上學期
   * ↓
   * 115-1
   */
  const semester = `${form.schoolYear}-${form.term}`;

  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || null,
    semester,
  });
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>
