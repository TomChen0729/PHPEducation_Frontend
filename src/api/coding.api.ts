import { api } from '../boot/axios';

import type { CodingExecuteResult, CodingRecordResponse } from '../types/coding';

export const codingApi = {
  /** 測試執行結果 */
  executeCode(data: { code: string; input?: string }) {
    return api.post<CodingExecuteResult>('/coding-execute', data);
  },

  /** 提交程式碼 */
  submitCode(data: { code: string; question_id: number }) {
    return api.post<{ message: string; record_id: string; status: string }>(
      '/coding-submissions',
      data,
    );
  },

  /** 獲取批改結果 */
  getRecord(recordId: number | string) {
    return api.get<CodingRecordResponse>(`/coding-records/${recordId}`);
  },
};
