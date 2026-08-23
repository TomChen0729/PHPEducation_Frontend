<template>
  <section class="user-stats-cards">
    <!-- Teacher -->
    <q-card flat bordered class="user-stats-cards__card">
      <q-card-section>
        <div class="user-stats-cards__icon user-stats-cards__icon--teacher">
          <q-icon name="school" size="26px" />
        </div>

        <div>
          <div class="user-stats-cards__label">教師總數</div>

          <q-skeleton v-if="loading" type="text" width="55px" />

          <div v-else class="user-stats-cards__value">
            {{ stats.teacherCount }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Student -->
    <q-card flat bordered class="user-stats-cards__card">
      <q-card-section>
        <div class="user-stats-cards__icon user-stats-cards__icon--student">
          <q-icon name="groups" size="26px" />
        </div>

        <div>
          <div class="user-stats-cards__label">學生總數</div>

          <q-skeleton v-if="loading" type="text" width="55px" />

          <div v-else class="user-stats-cards__value">
            {{ stats.studentCount }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Course -->
    <q-card flat bordered class="user-stats-cards__card">
      <q-card-section>
        <div class="user-stats-cards__icon user-stats-cards__icon--course">
          <q-icon name="menu_book" size="26px" />
        </div>

        <div>
          <div class="user-stats-cards__label">課程總數</div>

          <q-skeleton v-if="loading" type="text" width="55px" />

          <div v-else class="user-stats-cards__value">
            {{ stats.courseCount }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Semester -->
    <q-card flat bordered class="user-stats-cards__card">
      <q-card-section>
        <div class="user-stats-cards__icon user-stats-cards__icon--semester">
          <q-icon name="calendar_month" size="26px" />
        </div>

        <div>
          <div class="user-stats-cards__label">
            {{ stats.semester ? `${formatSemester(stats.semester)}課程` : '本學期課程' }}
          </div>

          <q-skeleton v-if="loading" type="text" width="55px" />

          <div v-else class="user-stats-cards__value">
            {{ stats.semesterCourseCount }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </section>
</template>

<script setup lang="ts">
import type { UserStats } from '../../../types/user-management';

defineProps<{
  stats: UserStats;

  loading: boolean;
}>();

function formatSemester(semester: string) {
  const [year, term] = semester.split('-');

  if (term === '1') {
    return `${year}學年度上學期`;
  }

  if (term === '2') {
    return `${year}學年度下學期`;
  }

  return semester;
}
</script>
