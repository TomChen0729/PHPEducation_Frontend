import { api } from '../boot/axios';

import type {
  TeacherQuestionRecordListResponse,
  TeacherQuestionRecordResponse,
  TeacherQuestionRecordReviewRequest,
} from '../types/teacher-question-record';

export const teacherQuestionRecordApi = {
  /*
   * ==========================================================
   * List
   * ==========================================================
   */
  getRecords(courseId: number) {
    return api.get<TeacherQuestionRecordListResponse>(
      `/teacher/courses/${courseId}/question-records`,
    );
  },

  /*
   * ==========================================================
   * Review
   * ==========================================================
   */
  reviewRecord(
    recordId: number,

    data: TeacherQuestionRecordReviewRequest,
  ) {
    return api.put<TeacherQuestionRecordResponse>(
      `/teacher/question-records/${recordId}`,

      data,
    );
  },

  /*
   * ==========================================================
   * AI Grade (實作題專用)
   * ==========================================================
   */
  gradeRecord(recordId: number) {
    return api.post<TeacherQuestionRecordResponse>(
      `/teacher/question-records/${recordId}/grade`,
    );
  },
};
