export type JsonRecord = Record<string, unknown>;

export type LearnerArtifact = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  mimeType: string | null;
  downloadable: boolean;
  checksumSha256: string | null;
  metadata: JsonRecord;
  url: string | null;
};

export type LearnerAssessmentQuestion = {
  id: string;
  kind: string;
  question: string;
  options: string[];
};

export type LearnerLesson = {
  id: string;
  moduleId: string;
  position: number;
  title: string;
  duration: string;
  format: string;
  content: JsonRecord;
  knowledgeCheck: LearnerAssessmentQuestion | null;
  artifacts: LearnerArtifact[];
};

export type LearnerCourseRelease = {
  schemaVersion: "1.0";
  course: {
    id: string;
    title: string;
    description: string;
    department: string;
    level: string;
    track: string;
    duration: string;
    audience: string;
    outcomes: string[];
    version: string;
    passingScore: number;
  };
  release: {
    version: string;
    publishedAt: string;
    contentHash: string;
  };
  lessons: LearnerLesson[];
  courseMaterials: LearnerArtifact[];
  finalAssessment: LearnerAssessmentQuestion[];
  certificateTemplate: LearnerArtifact | null;
};

export type AcademyReleaseReadiness = {
  ready: boolean;
  courseId: string;
  version?: string;
  publishedAt?: string;
  reasons: string[];
  inventory?: {
    lessons: number;
    assessmentQuestions: number;
    videos: number;
    materials: number;
    certificateTemplate: boolean;
  };
};

export type AcademyKnowledgeCheckResult = {
  questionId: string;
  correct: boolean;
  explanation: string;
};

export type AcademyAssessmentGrade = {
  courseId: string;
  releaseVersion: string;
  score: number;
  passingScore: number;
  passed: boolean;
};

export function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function textValue(record: JsonRecord, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

export function stringList(record: JsonRecord, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function recordList(record: JsonRecord, key: string): JsonRecord[] {
  const value = record[key];
  if (!Array.isArray(value)) return [];
  return value.filter(isJsonRecord);
}
