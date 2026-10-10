export interface CodingExecuteResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number | null;
  timeout?: boolean;
  duration?: number;
}

export type SoloLevel = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface AiFeedbackContent {
  solo?: SoloLevel;
  feedback?: string;
}

export interface CodingRecordResponse {
  record_id: number;
  completed: boolean;
  status: 'processing' | 'completed' | 'failed';
  solo?: SoloLevel;
  feedback?: AiFeedbackContent | null;
}
