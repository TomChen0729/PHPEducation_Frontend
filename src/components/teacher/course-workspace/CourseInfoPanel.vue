<template>
  <section class="course-info-panel">
    <!-- =========================
         Header
    ========================== -->
    <div class="course-info-panel__header">
      <div>
        <h5>課程資訊</h5>

        <p>查看與修改課程基本資料</p>
      </div>

      <q-btn
        color="blue"
        icon="edit"
        label="編輯課程"
        unelevated
        :disable="!course"
        @click="openEditDialog"
      />
    </div>

    <!-- =========================
         Loading
    ========================== -->
    <div v-if="loading" class="course-info-panel__loading">
      <q-spinner color="blue" size="40px" />
    </div>

    <!-- =========================
         Course Info
    ========================== -->
    <q-card v-else-if="course" flat bordered class="course-info-panel__card">
      <q-card-section class="course-info-panel__grid">
        <!-- Name -->
        <div class="course-info-panel__field">
          <span> 課程名稱 </span>

          <strong>
            {{ course.name }}
          </strong>
        </div>

        <!-- Semester -->
        <div class="course-info-panel__field">
          <span> 開課學期 </span>

          <strong>
            {{ formatSemester(course.semester) }}
          </strong>
        </div>

        <!-- Description -->
        <div class="course-info-panel__field course-info-panel__field--full">
          <span> 課程介紹 </span>

          <strong>
            {{ course.description || '尚未填寫課程介紹' }}
          </strong>
        </div>
      </q-card-section>
    </q-card>

    <!-- =========================
         Edit Dialog
    ========================== -->
    <q-dialog v-model="editDialog" persistent>
      <q-card class="course-info-panel__dialog">
        <q-card-section>
          <div class="text-h6">編輯課程</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="course-info-panel__form">
          <!-- Name -->
          <q-input
            v-model="form.name"
            outlined
            label="課程名稱"
            lazy-rules="ondemand"
            :rules="[(value) => !!value || '請輸入課程名稱']"
          />

          <!-- Semester -->
          <div class="course-info-panel__semester-form">
            <q-select
              v-model="form.schoolYear"
              :options="schoolYearOptions"
              outlined
              label="學年度"
              emit-value
              map-options
            />

            <q-select
              v-model="form.term"
              :options="termOptions"
              outlined
              label="學期"
              emit-value
              map-options
            />
          </div>

          <!-- Description -->
          <q-input
            v-model="form.description"
            outlined
            type="textarea"
            label="課程介紹"
            class="course-info-panel__description-input"
            lazy-rules="ondemand"
            :rules="[(value) => !!value || '請輸入課程介紹']"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="取消" :disable="saving" @click="editDialog = false" />

          <q-btn unelevated color="blue" label="儲存" :loading="saving" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import type { Course, CourseRequest } from '../../../types/course';

const props = defineProps<{
  course: Course | null;

  loading: boolean;

  saving: boolean;
}>();

const emit = defineEmits<{
  save: [data: CourseRequest];
}>();

const editDialog = ref(false);

const form = reactive({
  name: '',

  description: '',

  schoolYear: null as number | null,

  term: null as number | null,
});

/*
 * =========================
 * 學年度
 * =========================
 */
const currentRocYear = new Date().getFullYear() - 1911;

const schoolYearOptions = computed(() => {
  const options = [];

  for (let year = currentRocYear; year >= 47; year--) {
    options.push({
      label: `${year} 學年度`,

      value: year,
    });
  }

  return options;
});

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
 * =========================
 * Open
 * =========================
 */
function openEditDialog() {
  if (!props.course) {
    return;
  }

  const [year, term] = props.course.semester.split('-');

  form.name = props.course.name;

  form.description = props.course.description;

  form.schoolYear = Number(year);

  form.term = Number(term);

  editDialog.value = true;
}

/*
 * =========================
 * Submit
 * =========================
 */
function submit() {
  if (
    !form.name.trim() ||
    !form.description.trim() ||
    form.schoolYear === null ||
    form.term === null
  ) {
    return;
  }

  emit('save', {
    name: form.name.trim(),

    description: form.description.trim(),

    semester: `${form.schoolYear}-${form.term}`,
  });
}

/*
 * Parent API 完成後關閉。
 */
defineExpose({
  closeEditDialog() {
    editDialog.value = false;
  },
});

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : '';

  return `${year} 學年度・${termText}`;
}
</script>
