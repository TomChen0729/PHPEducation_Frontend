<template>
  <section class="course-stats-panel">
    <div class="course-stats-panel__header">
      <div>
        <div class="course-stats-panel__eyebrow">LEARNING INSIGHTS</div>
        <h5 class="text-weight-bold">數據統計</h5>
        <p>從教材配置與學生正式作答，快速掌握課程的 Bloom 與 SOLO 分布。</p>
      </div>

      <q-btn
        outline
        color="teal"
        icon="refresh"
        label="重新整理"
        :loading="refreshing"
        @click="refreshCurrentView"
      />
    </div>

    <q-banner v-if="errorMessage" rounded class="bg-red-1 text-negative q-mt-md">
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ errorMessage }}
    </q-banner>

    <div class="course-stats-panel__main-tabs q-mt-lg">
      <button
        type="button"
        class="course-stats-panel__main-tab"
        :class="{ 'course-stats-panel__main-tab--active': mainTab === 'material' }"
        @click="mainTab = 'material'"
      >
        <q-icon name="menu_book" size="22px" />
        <span>
          <strong>根據教材統計</strong>
          <small>查看題目配置的 Bloom / SOLO</small>
        </span>
      </button>

      <button
        type="button"
        class="course-stats-panel__main-tab"
        :class="{ 'course-stats-panel__main-tab--active': mainTab === 'student' }"
        @click="mainTab = 'student'"
      >
        <q-icon name="groups" size="22px" />
        <span>
          <strong>根據學生作答統計</strong>
          <small>查看全班或單一學生的 SOLO</small>
        </span>
      </button>
    </div>

    <div v-if="mainTab === 'material'" class="course-stats-panel__section">
      <div class="course-stats-panel__toolbar">
        <div>
          <div class="text-subtitle1 text-weight-bold">教材認知層級分布</div>
          <div class="text-caption text-grey-7">
            統計題目掛載到各單元後的認知設計；跨單元題目會在相關單元各顯示一次。
          </div>
        </div>

        <q-btn-toggle
          v-model="materialMetric"
          unelevated
          no-caps
          color="grey-2"
          text-color="grey-8"
          toggle-color="teal"
          :options="[
            { label: 'Bloom 統計', value: 'bloom' },
            { label: 'SOLO 統計', value: 'solo' },
          ]"
        />
      </div>

      <div v-if="loadingMaterial" class="course-stats-panel__loading">
        <q-spinner-dots color="teal" size="42px" />
        <span>正在整理教材統計...</span>
      </div>

      <template v-else-if="materialTable">
        <div class="course-stats-panel__summary-grid">
          <article class="course-stats-panel__summary-card">
            <div class="course-stats-panel__summary-icon">
              <q-icon name="quiz" />
            </div>
            <div>
              <span>統計題數</span>
              <strong>{{ materialTable.totals.total }}</strong>
              <small>合計以每題計算一次</small>
            </div>
          </article>

          <article class="course-stats-panel__summary-card">
            <div class="course-stats-panel__summary-icon">
              <q-icon name="view_module" />
            </div>
            <div>
              <span>有題目的單元</span>
              <strong>{{ materialActiveUnitCount }} / {{ materialTable.rows.length }}</strong>
              <small>快速找出尚未配置題目的單元</small>
            </div>
          </article>

          <article class="course-stats-panel__summary-card">
            <div class="course-stats-panel__summary-icon">
              <q-icon name="insights" />
            </div>
            <div>
              <span>最高分布</span>
              <strong>{{ materialDominant.code }}</strong>
              <small
                >{{ materialDominant.count }} 題 ·
                {{ metricColumnLabel(materialDominant.code) }}</small
              >
            </div>
          </article>

          <article class="course-stats-panel__summary-card">
            <div class="course-stats-panel__summary-icon">
              <q-icon name="visibility" />
            </div>
            <div>
              <span>目前檢視</span>
              <strong>{{ materialMetric === 'bloom' ? 'Bloom' : 'SOLO' }}</strong>
              <small>{{
                materialMetric === 'bloom' ? '認知 × 知識類型' : '題目最高 SOLO 層級'
              }}</small>
            </div>
          </article>
        </div>

        <q-card flat bordered class="course-stats-panel__card">
          <q-card-section class="course-stats-panel__card-title">
            <div>
              <div class="text-subtitle1 text-weight-bold">整體分布</div>
              <div class="text-caption text-grey-7">先看全課，再往下定位到章節與單元。</div>
            </div>
          </q-card-section>

          <q-card-section class="course-stats-panel__distribution">
            <div
              v-for="item in materialDistribution"
              :key="item.code"
              class="course-stats-panel__distribution-item"
            >
              <div class="course-stats-panel__distribution-label">
                <span>
                  <strong>{{ item.code }}</strong>
                  <small>{{ metricColumnLabel(item.code) }}</small>
                </span>
                <b>{{ item.count }}</b>
              </div>

              <q-linear-progress
                rounded
                size="8px"
                color="teal"
                track-color="grey-3"
                :value="item.ratio"
              />
            </div>
          </q-card-section>
        </q-card>

        <StatsHeatmapTable
          :title="materialMetric === 'bloom' ? '各單元 Bloom 分布' : '各單元 SOLO 分布'"
          :description="
            materialMetric === 'bloom'
              ? '顏色越深代表該單元配置的題目越多。'
              : '每題取標註到的最高 SOLO 層級後統計。'
          "
          :table="materialTable"
          :column-label="metricColumnLabel"
        />
      </template>
    </div>

    <div v-else class="course-stats-panel__section">
      <div class="course-stats-panel__toolbar course-stats-panel__toolbar--student">
        <div>
          <div class="text-subtitle1 text-weight-bold">學生正式作答 SOLO</div>
          <div class="text-caption text-grey-7">
            小試身手與尚未批改的作答不列入，這裡只看正式題目練習。
          </div>
        </div>

        <div class="course-stats-panel__student-controls">
          <q-btn-toggle
            v-model="studentMode"
            unelevated
            no-caps
            color="grey-2"
            text-color="grey-8"
            toggle-color="teal"
            :options="[
              { label: '全班整體', value: 'class' },
              { label: '單一學生', value: 'individual' },
            ]"
          />

          <q-select
            v-if="studentMode === 'individual'"
            v-model="selectedStudentId"
            outlined
            dense
            emit-value
            map-options
            clearable
            class="course-stats-panel__student-select"
            label="選擇學生"
            :options="studentOptions"
            :disable="loadingStudent"
            @update:model-value="handleStudentChange"
          />
        </div>
      </div>

      <div v-if="loadingStudent" class="course-stats-panel__loading">
        <q-spinner-dots color="teal" size="42px" />
        <span>正在整理學生作答統計...</span>
      </div>

      <template v-else-if="studentSoloStats">
        <q-banner
          v-if="studentMode === 'individual' && selectedStudentId === null"
          rounded
          class="course-stats-panel__student-guide bg-teal-1 text-teal-9"
        >
          <template #avatar>
            <q-icon name="person_search" />
          </template>
          請先選擇一位學生，即可查看該生在各單元的 SOLO 分布。
        </q-banner>

        <template v-else>
          <div class="course-stats-panel__summary-grid">
            <article class="course-stats-panel__summary-card">
              <div class="course-stats-panel__summary-icon">
                <q-icon name="fact_check" />
              </div>
              <div>
                <span>納入統計作答</span>
                <strong>{{ studentSoloStats.totals.total }}</strong>
                <small>只計正式題目且已有 SOLO 的作答</small>
              </div>
            </article>

            <article class="course-stats-panel__summary-card">
              <div class="course-stats-panel__summary-icon">
                <q-icon name="layers" />
              </div>
              <div>
                <span>有作答紀錄的單元</span>
                <strong>{{ studentActiveUnitCount }} / {{ studentSoloStats.rows.length }}</strong>
                <small>可快速定位學生尚未練習的單元</small>
              </div>
            </article>

            <article class="course-stats-panel__summary-card">
              <div class="course-stats-panel__summary-icon">
                <q-icon name="psychology" />
              </div>
              <div>
                <span>主要 SOLO</span>
                <strong>{{ studentDominant.code }}</strong>
                <small>{{ studentDominant.count }} 次作答</small>
              </div>
            </article>

            <article class="course-stats-panel__summary-card">
              <div class="course-stats-panel__summary-icon">
                <q-icon :name="studentMode === 'class' ? 'groups' : 'person'" />
              </div>
              <div>
                <span>目前檢視</span>
                <strong>{{ studentViewTitle }}</strong>
                <small>{{ studentViewSubtitle }}</small>
              </div>
            </article>
          </div>

          <q-card flat bordered class="course-stats-panel__card">
            <q-card-section class="course-stats-panel__card-title">
              <div>
                <div class="text-subtitle1 text-weight-bold">SOLO 作答分布</div>
                <div class="text-caption text-grey-7">
                  {{
                    studentMode === 'class'
                      ? '全班正式作答的整體分布。'
                      : '目前學生正式作答的 SOLO 分布。'
                  }}
                </div>
              </div>
            </q-card-section>

            <q-card-section
              class="course-stats-panel__distribution course-stats-panel__distribution--solo"
            >
              <div
                v-for="item in studentDistribution"
                :key="item.code"
                class="course-stats-panel__distribution-item"
              >
                <div class="course-stats-panel__distribution-label">
                  <span>
                    <strong>{{ item.code }}</strong>
                    <small>{{ metricColumnLabel(item.code) }}</small>
                  </span>
                  <b>{{ item.count }}</b>
                </div>

                <q-linear-progress
                  rounded
                  size="8px"
                  color="teal"
                  track-color="grey-3"
                  :value="item.ratio"
                />
              </div>
            </q-card-section>
          </q-card>

          <StatsHeatmapTable
            :title="studentMode === 'class' ? '全班各單元 SOLO 分布' : '單一學生各單元 SOLO 分布'"
            description="顏色越深代表該 SOLO 層級在這個單元出現越多次。"
            :table="studentSoloStats"
            :column-label="metricColumnLabel"
          />
        </template>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import StatsHeatmapTable from '../stats/StatsHeatmapTable.vue';

import { useTeacherStats } from '../../../composables/useTeacherStats.js';

import type {
  TeacherStatsTableResponse,
  TeacherStatsStudent,
} from '../../../types/teacher-stats.js';

const props = defineProps<{
  courseId: number;
}>();

type MainTab = 'material' | 'student';
type MaterialMetric = 'bloom' | 'solo';
type StudentMode = 'class' | 'individual';

const mainTab = ref<MainTab>('material');
const materialMetric = ref<MaterialMetric>('bloom');
const studentMode = ref<StudentMode>('class');
const selectedStudentId = ref<number | null>(null);

const {
  bloomStats,
  soloStats,
  studentSoloStats,
  students,
  loadingMaterial,
  loadingStudent,
  errorMessage,
  loadMaterialStats,
  loadStudentSolo,
  clearStats,
} = useTeacherStats();

const refreshing = computed(() => loadingMaterial.value || loadingStudent.value);

const materialTable = computed<TeacherStatsTableResponse | null>(() =>
  materialMetric.value === 'bloom' ? bloomStats.value : soloStats.value,
);

const materialActiveUnitCount = computed(
  () => materialTable.value?.rows.filter((row) => row.total > 0).length ?? 0,
);

const studentActiveUnitCount = computed(
  () => studentSoloStats.value?.rows.filter((row) => row.total > 0).length ?? 0,
);

const materialDistribution = computed(() => distributionFor(materialTable.value));
const studentDistribution = computed(() => distributionFor(studentSoloStats.value));

const materialDominant = computed(() => dominantFor(materialTable.value));
const studentDominant = computed(() => dominantFor(studentSoloStats.value));

const studentOptions = computed(() =>
  students.value.map((student) => ({
    label: studentOptionLabel(student),
    value: student.id,
  })),
);

const selectedStudent = computed(() => {
  if (selectedStudentId.value === null) {
    return null;
  }

  return students.value.find((student) => student.id === selectedStudentId.value) ?? null;
});

const studentViewTitle = computed(() => {
  if (studentMode.value === 'class') {
    return '全班';
  }

  return selectedStudent.value?.name || selectedStudent.value?.student_no || '單一學生';
});

const studentViewSubtitle = computed(() => {
  if (studentMode.value === 'class') {
    return `${students.value.length} 位修課學生`;
  }

  return selectedStudent.value?.student_no ?? '學生個別統計';
});

watch(
  () => props.courseId,
  async (courseId) => {
    selectedStudentId.value = null;
    studentMode.value = 'class';

    await Promise.all([loadMaterialStats(courseId), loadStudentSolo(courseId)]);
  },
  { immediate: true },
);

watch(studentMode, async (mode) => {
  if (mode !== 'class') {
    return;
  }

  selectedStudentId.value = null;
  await loadStudentSolo(props.courseId);
});

onBeforeUnmount(() => {
  clearStats();
});

async function handleStudentChange(value: number | null) {
  selectedStudentId.value = value;

  if (value === null) {
    return;
  }

  await loadStudentSolo(props.courseId, value);
}

async function refreshCurrentView() {
  if (mainTab.value === 'material') {
    await loadMaterialStats(props.courseId);
    return;
  }

  if (studentMode.value === 'individual' && selectedStudentId.value !== null) {
    await loadStudentSolo(props.courseId, selectedStudentId.value);
    return;
  }

  await loadStudentSolo(props.courseId);
}

function studentOptionLabel(student: TeacherStatsStudent): string {
  const name = student.name?.trim() || '未命名學生';
  const studentNo = student.student_no?.trim();

  return studentNo ? `${studentNo}｜${name}` : name;
}

function distributionFor(table: TeacherStatsTableResponse | null) {
  if (!table) {
    return [];
  }

  const max = Math.max(0, ...table.columns.map((column) => table.totals.counts[column] ?? 0));

  return table.columns.map((code) => {
    const count = table.totals.counts[code] ?? 0;

    return {
      code,
      count,
      ratio: max > 0 ? count / max : 0,
    };
  });
}

function dominantFor(table: TeacherStatsTableResponse | null) {
  if (!table || table.columns.length === 0) {
    return { code: '—', count: 0 };
  }

  const firstCode = table.columns[0] ?? '—';

  return table.columns.reduce(
    (best, code) => {
      const count = table.totals.counts[code] ?? 0;
      return count > best.count ? { code, count } : best;
    },
    { code: firstCode, count: table.totals.counts[firstCode] ?? 0 },
  );
}

function metricColumnLabel(code: string): string {
  const bloomLabels: Record<string, string> = {
    B11: '記憶瞭解 × 事實',
    B12: '記憶瞭解 × 概念',
    B13: '記憶瞭解 × 程序',
    B21: '應用 × 事實',
    B22: '應用 × 概念',
    B23: '應用 × 程序',
    B31: '分析 × 事實',
    B32: '分析 × 概念',
    B33: '分析 × 程序',
    B41: '評價 × 事實',
    B42: '評價 × 概念',
    B43: '評價 × 程序',
  };

  const soloLabels: Record<string, string> = {
    S1: 'SOLO 層級 1',
    S2: 'SOLO 層級 2',
    S3: 'SOLO 層級 3',
    S4: 'SOLO 層級 4',
    S5: 'SOLO 層級 5',
  };

  return bloomLabels[code] ?? soloLabels[code] ?? code;
}
</script>
