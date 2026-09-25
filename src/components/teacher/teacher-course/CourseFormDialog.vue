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
            :disable="loading"
            :rules="[(value) => !!value?.trim() || '請輸入課程名稱']"
          />

          <!-- 課程班級 -->
          <q-input
            v-model="form.className"
            label="課程班級 *"
            outlined
            maxlength="255"
            hint="例如：資管二乙"
            :disable="loading"
            :rules="[(value) => !!value?.trim() || '請輸入課程班級']"
          />

          <!-- 開課學期 -->
          <div class="course-form-dialog__semester">
            <q-select
              v-model="form.schoolYear"
              :options="schoolYearOptions"
              label="學年度 *"
              outlined
              emit-value
              map-options
              :disable="loading"
              :rules="[(value) => value !== null || '請選擇學年度']"
            />

            <q-select
              v-model="form.term"
              :options="termOptions"
              label="學期 *"
              outlined
              emit-value
              map-options
              :disable="loading"
              :rules="[(value) => value !== null || '請選擇學期']"
            />
          </div>

          <!-- 課程說明 -->
          <q-input
            v-model="form.description"
            outlined
            type="textarea"
            label="課程說明 *"
            maxlength="2000"
            counter
            :disable="loading"
            class="course-form-dialog__description"
            :rules="[(value) => !!value?.trim() || '請輸入課程說明']"
          />

          <!-- 建立方式：只有新增課程顯示 -->
          <template v-if="mode === 'create'">
            <q-separator class="q-my-xs" />

            <div class="course-form-dialog__section-title">建立方式</div>

            <div class="course-form-dialog__build-mode">
              <q-radio
                v-model="form.buildMode"
                val="blank"
                label="建立空白課程"
                color="light-blue-7"
                :disable="loading"
                @update:model-value="handleBuildModeChange"
              />

              <q-radio
                v-model="form.buildMode"
                val="copy"
                label="從既有課程帶入"
                color="light-blue-7"
                :disable="loading || courses.length === 0"
                @update:model-value="handleBuildModeChange"
              />
            </div>

            <div
              v-if="form.buildMode === 'copy'"
              class="course-form-dialog__copy-panel"
            >
              <q-select
                v-model="form.sourceCourseId"
                outlined
                emit-value
                map-options
                label="來源課程 *"
                :options="sourceCourseOptions"
                :disable="loading"
                :rules="[(value) => value !== null || '請選擇來源課程']"
              />

              <div class="course-form-dialog__copy-title">帶入內容</div>

              <div class="course-form-dialog__copy-options">
                <q-checkbox
                  :model-value="form.copyMaterials"
                  color="light-blue-7"
                  label="教材（章節／單元／知識卡）"
                  :disable="loading"
                  @update:model-value="setCopyMaterials"
                />

                <q-checkbox
                  :model-value="form.copyQuestions"
                  color="light-blue-7"
                  label="題目（含選項／答案）"
                  :disable="loading"
                  @update:model-value="setCopyQuestions"
                />
              </div>

              <div class="course-form-dialog__copy-help">
                <div>未勾選時不會帶入教材與題目，可之後再匯入或手動建立。</div>
                <div>不會帶入學生名冊、作答紀錄、審核資料；這些仍留在來源課程。</div>
                <div>帶入的教材與題目會建立獨立副本，之後修改新課程不會影響來源課程。</div>
              </div>

              <q-banner
                v-if="form.copyQuestions"
                rounded
                dense
                class="course-form-dialog__copy-warning"
              >
                題目會連同教材與知識卡關聯一起複製，因此已自動勾選教材。
              </q-banner>

              <div
                v-if="!copySelectionValid"
                class="course-form-dialog__copy-error"
              >
                請至少勾選「教材」或「題目」。
              </div>
            </div>

            <q-banner
              v-else-if="courses.length === 0"
              rounded
              dense
              class="bg-grey-2 text-grey-7"
            >
              目前沒有可帶入的既有課程，請先建立空白課程。
            </q-banner>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="取消" flat :disable="loading" @click="closeDialog" />

          <q-btn
            :label="mode === 'create' ? '新增課程' : '儲存修改'"
            type="submit"
            color="light-blue-7"
            unelevated
            :loading="loading"
            :disable="!canSubmit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import type { Course, CourseRequest } from '../../../types/course';

type TermValue = 1 | 2;
type BuildMode = 'blank' | 'copy';

interface CourseForm {
  name: string;
  className: string;
  schoolYear: number | null;
  term: TermValue | null;
  description: string;

  buildMode: BuildMode;
  sourceCourseId: number | null;
  copyMaterials: boolean;
  copyQuestions: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    course?: Course | null;
    courses?: Course[];
    loading?: boolean;
  }>(),
  {
    course: null,
    courses: () => [],
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [data: CourseRequest];
}>();

const form = reactive<CourseForm>({
  name: '',
  className: '',
  schoolYear: null,
  term: null,
  description: '',

  buildMode: 'blank',
  sourceCourseId: null,
  copyMaterials: false,
  copyQuestions: false,
});

const currentSchoolYear = new Date().getFullYear() - 1911;

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

const sourceCourseOptions = computed(() => {
  return props.courses.map((course) => ({
    label: `${course.name}｜${formatSemester(course.semester)}｜${course.class_name}`,
    value: course.id,
  }));
});

const copySelectionValid = computed(() => {
  if (props.mode !== 'create' || form.buildMode !== 'copy') {
    return true;
  }

  return form.copyMaterials || form.copyQuestions;
});

const canSubmit = computed(() => {
  if (props.loading) {
    return false;
  }

  if (props.mode !== 'create' || form.buildMode !== 'copy') {
    return true;
  }

  return form.sourceCourseId !== null && copySelectionValid.value;
});

watch(
  () => [props.modelValue, props.course],
  () => {
    if (!props.modelValue) {
      return;
    }

    form.name = props.course?.name ?? '';
    form.className = props.course?.class_name ?? '';
    form.description = props.course?.description ?? '';

    if (props.course?.semester) {
      const [schoolYear, term] = props.course.semester.split('-');

      form.schoolYear = Number(schoolYear);
      form.term = Number(term) as TermValue;
    } else {
      form.schoolYear = null;
      form.term = null;
    }

    resetCopySettings();
  },
  {
    immediate: true,
  },
);

function resetCopySettings() {
  form.buildMode = 'blank';
  form.sourceCourseId = null;
  form.copyMaterials = false;
  form.copyQuestions = false;
}

function handleBuildModeChange(value: string | number | null) {
  if (value !== 'copy') {
    form.sourceCourseId = null;
    form.copyMaterials = false;
    form.copyQuestions = false;
  }
}

function setCopyMaterials(value: boolean | null) {
  form.copyMaterials = Boolean(value);

  if (!form.copyMaterials) {
    form.copyQuestions = false;
  }
}

function setCopyQuestions(value: boolean | null) {
  form.copyQuestions = Boolean(value);

  if (form.copyQuestions) {
    form.copyMaterials = true;
  }
}

function handleSubmit() {
  if (form.schoolYear === null || form.term === null) {
    return;
  }

  const name = form.name.trim();
  const className = form.className.trim();
  const description = form.description.trim();

  if (!name || !className || !description) {
    return;
  }

  const data: CourseRequest = {
    name,
    class_name: className,
    description,
    semester: `${form.schoolYear}-${form.term}`,
  };

  if (props.mode === 'create' && form.buildMode === 'copy') {
    if (form.sourceCourseId === null || !copySelectionValid.value) {
      return;
    }

    data.source_course_id = form.sourceCourseId;
    data.copy_materials = form.copyMaterials;
    data.copy_questions = form.copyQuestions;
  }

  emit('submit', data);
}

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  const termText = term === '1' ? '上學期' : term === '2' ? '下學期' : semester;

  return `${year}-${term} ${termText}`;
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>
