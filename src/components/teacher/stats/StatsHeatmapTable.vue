<template>
  <q-card flat bordered class="course-stats-panel__card course-stats-panel__table-card">
    <q-card-section class="course-stats-panel__card-title">
      <div>
        <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
        <div class="text-caption text-grey-7">{{ description }}</div>
      </div>
    </q-card-section>

    <div class="course-stats-panel__table-scroll">
      <table class="course-stats-panel__heatmap">
        <thead>
          <tr>
            <th class="course-stats-panel__heatmap-unit">章節 / 單元</th>

            <th v-for="column in table.columns" :key="column" :title="columnLabel(column)">
              <strong>{{ column }}</strong>
              <small>{{ columnLabel(column) }}</small>
            </th>

            <th class="course-stats-panel__heatmap-total">合計</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in table.rows" :key="row.unit_id">
            <td class="course-stats-panel__heatmap-unit">
              <div class="course-stats-panel__unit-title">{{ row.unit_name }}</div>
              <div class="course-stats-panel__unit-meta">
                <span>{{ row.chapter_name }}</span>
                <q-badge
                  outline
                  :color="row.unit_status === 'published' ? 'primary' : 'grey-6'"
                  :label="row.unit_status === 'published' ? '開放中' : '草稿'"
                />
              </div>
            </td>

            <td
              v-for="column in table.columns"
              :key="`${row.unit_id}-${column}`"
              class="course-stats-panel__heat"
              :class="heatClass(row.counts[column] ?? 0)"
              :title="`${row.unit_name}｜${column}：${row.counts[column] ?? 0}`"
            >
              {{ row.counts[column] ?? 0 }}
            </td>

            <td class="course-stats-panel__heatmap-total">{{ row.total }}</td>
          </tr>

          <tr class="course-stats-panel__heatmap-summary">
            <td class="course-stats-panel__heatmap-unit">
              <q-icon name="functions" size="18px" />
              <strong>全課合計</strong>
            </td>

            <td v-for="column in table.columns" :key="`total-${column}`">
              {{ table.totals.counts[column] ?? 0 }}
            </td>

            <td class="course-stats-panel__heatmap-total">{{ table.totals.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TeacherStatsTableResponse } from '../../../types/teacher-stats';

const props = defineProps<{
  title: string;
  description: string;
  table: TeacherStatsTableResponse;
  columnLabel: (code: string) => string;
}>();

const maxCellValue = computed(() => {
  const values = props.table.rows.flatMap((row) =>
    props.table.columns.map((column) => row.counts[column] ?? 0),
  );

  return Math.max(0, ...values);
});

function heatClass(value: number): string {
  const max = maxCellValue.value;

  if (value <= 0 || max <= 0) {
    return 'course-stats-panel__heat--0';
  }

  const ratio = value / max;

  if (ratio <= 0.25) {
    return 'course-stats-panel__heat--1';
  }

  if (ratio <= 0.5) {
    return 'course-stats-panel__heat--2';
  }

  if (ratio <= 0.75) {
    return 'course-stats-panel__heat--3';
  }

  return 'course-stats-panel__heat--4';
}
</script>
