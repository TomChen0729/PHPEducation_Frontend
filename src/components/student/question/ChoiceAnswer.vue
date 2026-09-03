<template>
  <div class="student-option-answer">
    <!-- =============================================
         No Options
    ============================================== -->
    <div v-if="options.length === 0" class="student-option-answer__empty">
      <q-icon name="error_outline" size="32px" color="grey-5" />

      <div>此題目前沒有可作答的選項</div>
    </div>

    <!-- =============================================
         Options
    ============================================== -->
    <div v-else class="student-option-answer__options">
      <button
        v-for="(option, index) in options"
        :key="option.id"
        type="button"
        class="student-option-answer__option"
        :class="{
          'student-option-answer__option--selected': selectedOptionId === option.id,

          'student-option-answer__option--disabled': disabled,
        }"
        :disabled="disabled"
        @click="selectOption(option.id)"
      >
        <!-- Radio -->
        <q-icon
          :name="selectedOptionId === option.id ? 'radio_button_checked' : 'radio_button_unchecked'"
          :color="selectedOptionId === option.id ? 'teal' : 'grey-5'"
          size="24px"
        />

        <!-- Option Number -->
        <div class="student-option-answer__option-index">
          {{ getOptionLabel(index) }}
        </div>

        <!-- Option Content -->
        <div class="student-option-answer__option-content">
          <div class="student-option-answer__option-title">
            {{ option.title }}
          </div>
        </div>
      </button>
    </div>

    <!-- =============================================
         Actions
    ============================================== -->
    <div class="student-option-answer__actions">
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
 * Option Label
 * ============================================================
 */

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

/*
 * ============================================================
 * Reset
 * ============================================================
 *
 * 換到另一題時，
 * 清除上一題已選擇的選項。
 */

watch(
  () => props.options,

  () => {
    selectedOptionId.value = null;
  },
);
</script>
