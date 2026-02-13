export enum Role {
  LanguageTeacher = "Sprachlehrer/in",
  NonLanguageTeacher = "Fachlehrer/in (andere Fächer)",
  Student = "Schüler/in",
  Other = "Andere"
}

export interface SurveyResponse {
  timestamp: string;
  name: string;
  role: string;
  otherDetail: string;
  score: number;
  percentage: number;
  rawAnswers: string;
}

export interface Question {
  id: number;
  text: string;
}

export interface DashboardData {
  participants: number;
  averageScore: number;
  roleDistribution: { name: string; value: number }[];
  roleScores: { name: string; score: number }[];
  recentEntries: SurveyResponse[];
}
