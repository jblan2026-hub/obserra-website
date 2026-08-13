import "server-only";

import { FloridaClassDMakeupError } from "./florida-class-d-makeup";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_EXAM_POLICY = {
  totalQuestions: 170,
  passingScore: 128,
  minimumDurationSeconds: 7200,
  randomizedQuestionsRequired: true,
  divisionApprovedBankRequired: true,
  trueFalseMaximumPerSubjectFraction: 0.5,
  answerKeyBrowserExposureAllowed: false,
  publicLaunchEnabledInThisGate: false,
} as const;

type EnrollmentRow = { id: string; clerk_user_id: string; status: string };
type AttemptRow = {
  id: string;
  enrollment_id: string;
  bank_id: string;
  clerk_user_id: string;
  status: string;
  started_at: string;
  earliest_submit_at: string;
  submitted_at?: string | null;
  score?: number | null;
  passed?: boolean | null;
  randomized_question_ids: string[];
  current_question_index: number;
};
type QuestionRow = {
  id: string;
  subject_code: string;
  question_type: "multiple_choice" | "true_false";
  prompt: string;
  choices: Record<string, string>;
};
type ResponseRow = { question_id: string; selected_choice_key?: string | null };

export class FloridaClassDExamError extends FloridaClassDMakeupError {}

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDExamEnabled() {
  return (
    enabled(process.env.OBSERRA_FDACS_CLASS_D_EXAM_ENABLED) &&
    process.env.OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active" &&
    Boolean(process.env.OBSERRA_FDACS_DI_LICENSE_NUMBER?.trim()) &&
    Boolean(process.env.OBSERRA_FDACS_DS_LICENSE_NUMBER?.trim())
  );
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) throw new FloridaClassDExamError("Final examination service is not configured.", 503, "FDACS_EXAM_NOT_CONFIGURED");
  return { key, url };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(typeof record?.message === "string" ? record.message : "Final examination request failed.", response.status >= 500 ? 502 : response.status, typeof record?.code === "string" ? record.code : "FDACS_EXAM_REQUEST_FAILED");
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_EXAM_INVALID_IDENTIFIER");
}

async function enrollmentForUser(userId: string) {
  const rows = await request<EnrollmentRow[]>(`fdacs_class_d_enrollments?${new URLSearchParams({ select: "id,clerk_user_id,status", clerk_user_id: `eq.${userId}`, course_id: "eq.florida-class-d-40-hour", order: "enrolled_at.desc", limit: "10" })}`);
  const enrollment = rows.find((row) => !["withdrawn", "rejected"].includes(row.status)) ?? rows[0];
  if (!enrollment) throw new FloridaClassDExamError("No regulated Class D enrollment was found.", 404, "FDACS_EXAM_ENROLLMENT_NOT_FOUND");
  return enrollment;
}

function studentSafeQuestion(question: QuestionRow, number: number, selectedChoiceKey?: string | null) {
  return {
    id: question.id,
    number,
    subjectCode: question.subject_code,
    questionType: question.question_type,
    prompt: question.prompt,
    choices: question.choices,
    selectedChoiceKey: selectedChoiceKey ?? null,
  };
}

export async function getFloridaClassDExamState(userId: string) {
  const enrollment = await enrollmentForUser(userId);
  const attempts = await request<AttemptRow[]>(`fdacs_class_d_exam_attempts?${new URLSearchParams({ select: "id,enrollment_id,bank_id,clerk_user_id,status,started_at,earliest_submit_at,submitted_at,score,passed,randomized_question_ids,current_question_index", enrollment_id: `eq.${enrollment.id}`, order: "started_at.desc", limit: "5" })}`);
  const attempt = attempts[0] ?? null;
  if (!attempt) return { enrollment: { id: enrollment.id, status: enrollment.status }, attempt: null, question: null, policy: FLORIDA_CLASS_D_EXAM_POLICY };
  if (attempt.status !== "in_progress") return { enrollment: { id: enrollment.id, status: enrollment.status }, attempt: { id: attempt.id, status: attempt.status, startedAt: attempt.started_at, earliestSubmitAt: attempt.earliest_submit_at, submittedAt: attempt.submitted_at ?? null, score: attempt.score ?? null, passed: attempt.passed ?? null }, question: null, policy: FLORIDA_CLASS_D_EXAM_POLICY };

  const index = Math.min(Math.max(0, attempt.current_question_index), attempt.randomized_question_ids.length - 1);
  const questionId = attempt.randomized_question_ids[index];
  requireUuid(questionId, "question id");
  const [questions, responses] = await Promise.all([
    request<QuestionRow[]>(`fdacs_class_d_exam_questions?${new URLSearchParams({ select: "id,subject_code,question_type,prompt,choices", id: `eq.${questionId}`, bank_id: `eq.${attempt.bank_id}`, active: "eq.true", limit: "1" })}`),
    request<ResponseRow[]>(`fdacs_class_d_exam_responses?${new URLSearchParams({ select: "question_id,selected_choice_key", attempt_id: `eq.${attempt.id}`, question_id: `eq.${questionId}`, limit: "1" })}`),
  ]);
  if (!questions[0]) throw new FloridaClassDExamError("Examination question is unavailable.", 502, "FDACS_EXAM_QUESTION_UNAVAILABLE");
  return {
    enrollment: { id: enrollment.id, status: enrollment.status },
    attempt: { id: attempt.id, status: attempt.status, startedAt: attempt.started_at, earliestSubmitAt: attempt.earliest_submit_at, questionNumber: index + 1, totalQuestions: 170 },
    question: studentSafeQuestion(questions[0], index + 1, responses[0]?.selected_choice_key),
    policy: FLORIDA_CLASS_D_EXAM_POLICY,
  };
}

export async function startFloridaClassDExam(userId: string, clerkSessionId: string | null, input: { browserInstanceId: string; correlationId: string }) {
  requireUuid(input.correlationId, "correlation id");
  if (!clerkSessionId || clerkSessionId.length < 3) throw new FloridaClassDExamError("A valid authenticated session is required.", 401, "FDACS_EXAM_SESSION_REQUIRED");
  if (input.browserInstanceId.length < 12 || input.browserInstanceId.length > 180) throw new FloridaClassDExamError("Browser instance identifier is invalid.", 400, "FDACS_EXAM_DEVICE_INVALID");
  const enrollment = await enrollmentForUser(userId);
  const rows = await request<Array<{ fdacs_class_d_start_exam_attempt?: string }>>("rpc/fdacs_class_d_start_exam_attempt", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: enrollment.id,
      p_clerk_user_id: userId,
      p_clerk_session_id: clerkSessionId,
      p_browser_instance_id: input.browserInstanceId,
      p_correlation_id: input.correlationId,
    }),
  });
  const value = Array.isArray(rows) ? rows[0] : rows;
  const attemptId = typeof value === "string" ? value : (value && typeof value === "object" ? Object.values(value)[0] : null);
  if (typeof attemptId !== "string" || !UUID_PATTERN.test(attemptId)) throw new FloridaClassDExamError("Examination attempt was not created correctly.", 502, "FDACS_EXAM_ATTEMPT_INVALID");
  return getFloridaClassDExamState(userId);
}

export async function answerFloridaClassDExamQuestion(userId: string, input: { attemptId: string; questionId: string; selectedChoiceKey: string; direction: "next" | "previous" | "stay" }) {
  requireUuid(input.attemptId, "attempt id");
  requireUuid(input.questionId, "question id");
  const attempts = await request<AttemptRow[]>(`fdacs_class_d_exam_attempts?${new URLSearchParams({ select: "id,enrollment_id,bank_id,clerk_user_id,status,started_at,earliest_submit_at,randomized_question_ids,current_question_index", id: `eq.${input.attemptId}`, clerk_user_id: `eq.${userId}`, status: "eq.in_progress", limit: "1" })}`);
  const attempt = attempts[0];
  if (!attempt) throw new FloridaClassDExamError("Active examination attempt was not found.", 404, "FDACS_EXAM_ATTEMPT_NOT_FOUND");
  const expectedQuestionId = attempt.randomized_question_ids[attempt.current_question_index];
  if (expectedQuestionId !== input.questionId) throw new FloridaClassDExamError("Question sequence mismatch.", 409, "FDACS_EXAM_SEQUENCE_MISMATCH");
  const questions = await request<QuestionRow[]>(`fdacs_class_d_exam_questions?${new URLSearchParams({ select: "id,subject_code,question_type,prompt,choices", id: `eq.${input.questionId}`, bank_id: `eq.${attempt.bank_id}`, limit: "1" })}`);
  const question = questions[0];
  if (!question || !(input.selectedChoiceKey in question.choices)) throw new FloridaClassDExamError("Selected answer is invalid.", 400, "FDACS_EXAM_ANSWER_INVALID");

  await request(`fdacs_class_d_exam_responses?${new URLSearchParams({ attempt_id: `eq.${attempt.id}`, question_id: `eq.${input.questionId}` })}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ selected_choice_key: input.selectedChoiceKey, answered_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  const delta = input.direction === "next" ? 1 : input.direction === "previous" ? -1 : 0;
  const nextIndex = Math.max(0, Math.min(169, attempt.current_question_index + delta));
  if (nextIndex !== attempt.current_question_index) {
    await request(`fdacs_class_d_exam_attempts?${new URLSearchParams({ id: `eq.${attempt.id}`, clerk_user_id: `eq.${userId}`, status: "eq.in_progress" })}`, {
      method: "PATCH",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ current_question_index: nextIndex, updated_at: new Date().toISOString() }),
    });
  }
  return getFloridaClassDExamState(userId);
}

export async function submitFloridaClassDExam(userId: string, input: { attemptId: string; correlationId: string }) {
  requireUuid(input.attemptId, "attempt id");
  requireUuid(input.correlationId, "correlation id");
  const result = await request<Array<{ score: number; passed: boolean }>>("rpc/fdacs_class_d_submit_exam_attempt", {
    method: "POST",
    body: JSON.stringify({ p_attempt_id: input.attemptId, p_clerk_user_id: userId, p_correlation_id: input.correlationId }),
  });
  const outcome = result[0];
  if (!outcome) throw new FloridaClassDExamError("Examination result was not recorded.", 502, "FDACS_EXAM_RESULT_INVALID");
  return { score: outcome.score, passed: outcome.passed, passingScore: 128, totalQuestions: 170 };
}
