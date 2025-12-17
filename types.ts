
export enum Trend {
  IMPROVED = 'IMPROVED',
  WORSENED = 'WORSENED',
  STABLE = 'STABLE',
  UNKNOWN = 'UNKNOWN'
}

export enum Category {
  LIPID = 'Lipídios',
  LIVER = 'Fígado',
  METABOLIC = 'Metabolismo',
  MUSCLE = 'Músculos',
  INFLAMMATION = 'Inflamação',
  RENAL = 'Rins',
  ELECTROLYTES = 'Eletrólitos',
  HEMATOLOGY = 'Sangue/Ferro',
  URINE = 'Urina'
}

export interface ExamDataPoint {
  id: string;
  name: string;
  unit: string;
  reference: string;
  date1: string | null; // 17/09/2025
  value1: number | string | null;
  status1: string;
  date2: string | null; // 02/12/2025
  value2: number | string | null;
  status2: string;
  observation: string;
  category: Category;
  trend: Trend;
}

export interface AnalysisResult {
  goodNews: string[];
  attentionPoints: string[];
  examData: ExamDataPoint[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
