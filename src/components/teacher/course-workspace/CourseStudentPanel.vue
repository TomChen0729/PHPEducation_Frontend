<template>
  <section class="course-student-panel">
    <!-- 明確 MOCK 標示 -->
    <q-banner rounded class="bg-orange-1 text-orange-10 q-mb-lg">
      <template #avatar>
        <q-icon name="warning" color="orange" />
      </template>

      此區學生資料目前為
      <strong>假資料 MOCK</strong>， 新增或刪除不會寫入資料庫。
    </q-banner>

    <!-- Header -->
    <div class="course-student-panel__header">
      <div>
        <h5>學生管理</h5>

        <p>
          共
          {{ students.length }}
          位學生
        </p>
      </div>

      <q-btn color="blue" icon="person_add" label="新增學生" unelevated @click="addDialog = true" />
    </div>

    <!-- Table -->
    <q-table
      flat
      bordered
      row-key="id"
      :rows="students"
      :columns="columns"
      :pagination="{
        rowsPerPage: 10,
      }"
    >
      <!-- Status -->
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'active' ? 'positive' : 'orange'"
            :label="props.row.status === 'active' ? '已開通' : '待開通'"
          />
        </q-td>
      </template>

      <!-- Action -->
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete"
            @click="$emit('remove', props.row.id)"
          >
            <q-tooltip> 刪除假資料 </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Add Dialog -->
    <q-dialog v-model="addDialog">
      <q-card class="course-student-panel__dialog">
        <q-card-section>
          <div class="text-h6">新增學生</div>

          <div class="text-caption text-orange-9">MOCK：目前不會寫入資料庫</div>
        </q-card-section>

        <q-card-section class="course-student-panel__form">
          <q-input v-model="form.studentNo" outlined label="學號" />

          <q-input v-model="form.name" outlined label="姓名" />

          <q-input v-model="form.email" outlined label="Email" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />

          <q-btn color="blue" label="新增" unelevated @click="submitStudent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

import type { QTableColumn } from 'quasar';

import type { CourseStudentMock } from '../../../types/teacher-course-workspace';

defineProps<{
  students: CourseStudentMock[];
}>();

const emit = defineEmits<{
  add: [
    student: {
      studentNo: string;

      name: string;

      email: string;
    },
  ];

  remove: [studentId: number];
}>();

const addDialog = ref(false);

const form = reactive({
  studentNo: '',

  name: '',

  email: '',
});

const columns: QTableColumn[] = [
  {
    name: 'studentNo',

    label: '學號',

    field: 'studentNo',

    align: 'left',
  },
  {
    name: 'name',

    label: '姓名',

    field: 'name',

    align: 'left',
  },
  {
    name: 'email',

    label: 'Email',

    field: 'email',

    align: 'left',
  },
  {
    name: 'status',

    label: '狀態',

    field: 'status',

    align: 'center',
  },
  {
    name: 'actions',

    label: '操作',

    field: 'actions',

    align: 'center',
  },
];

function submitStudent() {
  if (!form.studentNo || !form.name || !form.email) {
    return;
  }

  emit('add', {
    studentNo: form.studentNo,

    name: form.name,

    email: form.email,
  });

  form.studentNo = '';
  form.name = '';
  form.email = '';

  addDialog.value = false;
}
</script>
