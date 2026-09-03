<template>
  <div class="student-true-false-answer">
    <!-- =============================================
         No Options
    ============================================== -->
    <div v-if="options.length === 0" class="student-true-false-answer__empty">
      <q-icon name="error_outline" size="32px" color="grey-5" />

      <div>此題目前沒有可作答的選項</div>
    </div>

    <!-- =============================================
         Options
    ============================================== -->
    <div v-else class="student-true-false-answer__options">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="student-true-false-answer__option"
        :class="{
          'student-true-false-answer__option--selected': selectedOptionId === option.id,

          'student-true-false-answer__option--disabled': disabled,
        }"
        :disabled="disabled"
        @click="selectOption(option.id)"
      >
        <q-icon
          :name="getOptionIcon(option.title)"
          size="34px"
          :color="selectedOptionId === option.id ? 'teal' : 'grey-5'"
        />

        <div class="student-true-false-answer__option-title">
          {{ option.title }}
        </div>

        <q-icon
          :name="selectedOptionId === option.id ? 'radio_button_checked' : 'radio_button_unchecked'"
          :color="selectedOptionId === option.id ? 'teal' : 'grey-5'"
          size="23px"
        />
      </button>
    </div>

    <!-- =============================================
         Actions
    ============================================== -->
    <div class="student-true-false-answer__actions">
      <q-btn
        unelevated
        color="teal"
        icon="send"
        label="送出答案"
        no-caps
        :loading="loading"
        :disable="disabled || selectedOptionId === null"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type { StudentQuestionOption } from '../../../types/student-question';

/*
 * ============================================================
 * Props
 * ============================================================
 */

const props = withDefaults(
  defineProps<{
    options: StudentQuestionOption[];

    loading?: boolean;

    disabled?: boolean;
  }>(),
  {
    loading: false,

    disabled: false,
  },
);

/*
 * ============================================================
 * Emits
 * ============================================================
 */

const emit = defineEmits<{
  submit: [optionId: number];
}>();

/*
 * ============================================================
 * Selected Option
 * ============================================================
 */

const selectedOptionId = ref<number | null>(null);

/*
 * ============================================================
 * Select
 * ============================================================
 */

function selectOption(optionId: number) {
  if (props.disabled) {
    return;
  }

  selectedOptionId.value = optionId;
}

/*
 * ============================================================
 * Submit
 * ============================================================
 */

function submit() {
  if (selectedOptionId.value === null) {
    return;
  }

  emit('submit', selectedOptionId.value);
}

/*
 * ============================================================
 * Icon
 * ============================================================
 */

function getOptionIcon(title: string): string {
  const normalized = title.trim().toLowerCase();

  if (normalized === '正確' || normalized === 'true' || normalized === '對') {
    return 'check_circle_outline';
  }

  if (normalized === '錯誤' || normalized === 'false' || normalized === '錯') {
    return 'cancel';
  }

  return 'help_outline';
}

/*
 * ============================================================
 * Reset
 * ============================================================
 */

watch(
  () => props.options,

  () => {
    selectedOptionId.value = null;
  },
);
</script>
