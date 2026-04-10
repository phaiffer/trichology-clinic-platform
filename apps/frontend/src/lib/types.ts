export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  notes: string | null;
  consentAccepted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientListResponse = {
  content: Patient[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  search: string | null;
};

export type PatientInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  notes: string | null;
  consentAccepted: boolean;
  active: boolean;
};

export type PatientListQuery = {
  search?: string;
  page?: number;
  size?: number;
};

export type QuestionType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "BOOLEAN";

export type AnamnesisQuestion = {
  id: string;
  label: string;
  helperText: string | null;
  type: QuestionType;
  required: boolean;
  displayOrder: number;
  scoringWeight: number | null;
  options: string[];
  optionScores: Record<string, number>;
};

export type AnamnesisTemplate = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  questions: AnamnesisQuestion[];
};

export type AnamnesisQuestionInput = {
  id?: string;
  label: string;
  helperText: string | null;
  type: QuestionType;
  required: boolean;
  displayOrder: number;
  scoringWeight: number | null;
  options: string[];
  optionScores: Record<string, number>;
};

export type AnamnesisTemplateInput = {
  name: string;
  description: string | null;
  active: boolean;
  questions: AnamnesisQuestionInput[];
};

export type AnamnesisAnswerInput = {
  questionId: string;
  value: string | number | boolean | string[] | null;
};

export type PatientAnamnesisRecordInput = {
  templateId: string;
  answers: AnamnesisAnswerInput[];
};

export type PatientAnamnesisRecordListItem = {
  id: string;
  patientId: string;
  templateId: string;
  templateName: string;
  createdAt: string;
};

export type PatientAnamnesisAnswer = {
  id: string;
  questionId: string;
  questionLabel: string;
  questionType: QuestionType;
  value: string | number | boolean | string[] | null;
};

export type PatientAnamnesisRecord = {
  id: string;
  patientId: string;
  patientName: string;
  templateId: string;
  templateName: string;
  createdAt: string;
  answers: PatientAnamnesisAnswer[];
};

export type PhotoCategory = "BEFORE" | "AFTER" | "PROGRESS";

export type PatientPhoto = {
  id: string;
  patientId: string;
  anamnesisRecordId: string | null;
  anamnesisTemplateName: string | null;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  category: PhotoCategory;
  captureDate: string | null;
  notes: string | null;
  createdAt: string;
  fileUrl: string;
};

export type PatientPhotoUploadInput = {
  files: File[];
  category: PhotoCategory;
  captureDate: string | null;
  notes: string | null;
  anamnesisRecordId: string | null;
};

export type ScoreResultItem = {
  questionId: string;
  questionLabel: string;
  questionType: QuestionType;
  answerValue: string | null;
  contribution: number;
  ruleApplied: string;
};

export type ScoreResult = {
  id: string;
  patientId: string;
  patientName: string;
  anamnesisRecordId: string | null;
  anamnesisTemplateName: string | null;
  totalScore: number;
  classification: "LOW" | "MODERATE" | "HIGH" | null;
  summary: string | null;
  calculatedAt: string;
  items: ScoreResultItem[];
};

export type ReportType = "CLINICAL_EVALUATION";

export type PatientReportPhotoSelection = {
  id: string;
  originalFileName: string;
  category: PhotoCategory;
  captureDate: string | null;
  notes: string | null;
  fileUrl: string;
};

export type PatientReportListItem = {
  id: string;
  patientId: string;
  anamnesisRecordId: string | null;
  scoreResultId: string | null;
  title: string;
  summary: string | null;
  generatedAt: string;
  fileName: string;
  reportType: ReportType;
  createdAt: string;
  selectedPhotosCount: number;
  fileUrl: string;
};

export type PatientReport = {
  id: string;
  patientId: string;
  patientName: string;
  anamnesisRecordId: string | null;
  anamnesisTemplateName: string | null;
  scoreResultId: string | null;
  scoreType: string | null;
  scoreValue: number | null;
  scoreClassification: string | null;
  scoreInterpretation: string | null;
  title: string;
  summary: string | null;
  generatedAt: string;
  fileName: string;
  reportType: ReportType;
  createdAt: string;
  selectedPhotosCount: number;
  selectedPhotos: PatientReportPhotoSelection[];
  fileUrl: string;
};

export type PatientReportInput = {
  anamnesisRecordId: string | null;
  scoreResultId: string | null;
  selectedPhotoIds: string[];
  title: string;
  summary: string | null;
  reportType: ReportType;
};
