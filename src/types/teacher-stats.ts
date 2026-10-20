export type TeacherStatsUnitStatus = 'draft' | 'published';

export type TeacherStatsCounts = Record<string, number>;

export interface TeacherStatsRow {
  chapter_id: number;
  chapter_name: string;
  unit_id: number;
  unit_name: string;
  unit_status: TeacherStatsUnitStatus;
  counts: TeacherStatsCounts;
  total: number;
}

export interface TeacherStatsTotals {
  counts: TeacherStatsCounts;
  total: number;
}

export interface TeacherStatsTableResponse {
  columns: string[];
  rows: TeacherStatsRow[];
  totals: TeacherStatsTotals;
}

export interface TeacherStatsStudent {
  id: number;
  student_no: string | null;
  name: string | null;
}

export interface TeacherStudentSoloStatsResponse extends TeacherStatsTableResponse {
  student: TeacherStatsStudent | null;
  students: TeacherStatsStudent[];
}
