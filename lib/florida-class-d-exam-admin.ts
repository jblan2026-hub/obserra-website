import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";
import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";

const COURSE_ID = "florida-class-d-40-hour";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUBJECT_CODES = new Set([
  "legal","role","conduct","communications","observation_reporting","access_control","patrols","safeguarding_information","physical_security","interviewing","emergency_preparedness","safety_awareness","medical_emergencies","terrorism","event_security","communications_systems","special_issues","introduction_weapons",
]);

export const FLORIDA_CLASS_D_EXAM_ADMIN_POLICY = {
  importFeatureFlag: "OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED",
  exactQuestionCount: 170,
  maximumTrueFalseFractionPerSubject: 0.5,
  answerKeysStoredOnlyInProtectedDatastore: true,
  publicRepositoryQuestionBankAllowed: false,
  divisionApprovalRequiredBeforeStudentUse: true,
} as const;

type ImportQuestion = {
  subjectCode: string;
  questionType: "multiple_choice" | "true_false";
  prompt: string;
  choices: Record<string, string>;
  correctChoiceKey: string;
  rationale?: string | null;
};

type ImportPayload = {
  version: string;
  sourceReference: string;
  questions: ImportQuestion[];
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDExamAdminEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!floridaClassDSupabaseServerConfigAuthorized(url, key)) throw new FloridaClassDExamError("Exam bank administration is not configured.", 503, "FDACS_EXAM_ADMIN_NOT_CONFIGURED");
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
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(typeof record?.message === "string" ? record.message : "Exam bank administration failed.", response.status >= 500 ? 502 : response.status, typeof record?.code === "string" ? record.code : "FDACS_EXAM_ADMIN_FAILED");
  }
  return payload as T;
}

function normalize(payload: ImportPayload) {
  const version = payload.version?.trim();
  const sourceReference = payload.sourceReference?.trim();
  if (!version || version.length > 80) throw new FloridaClassDExamError("Exam bank version is invalid.", 400, "FDACS_EXAM_BANK_VERSION_INVALID");
  if (!sourceReference || sourceReference.length > 500) throw new FloridaClassDExamError("Exam bank source reference is invalid.", 400, "FDACS_EXAM_BANK_SOURCE_INVALID");
  if (!Array.isArray(payload.questions) || payload.questions.length !== 170) throw new FloridaClassDExamError("Exam bank must contain exactly 170 questions.", 400, "FDACS_EXAM_BANK_QUESTION_COUNT_INVALID");

  const counts = new Map<string, { total: number; tf: number }>();
  const questions = payload.questions.map((question, index) => {
    const subjectCode = question.subjectCode?.trim();
    if (!SUBJECT_CODES.has(subjectCode)) throw new FloridaClassDExamError(`Question ${index + 1} has an invalid subject code.`, 400, "FDACS_EXAM_BANK_SUBJECT_INVALID");
    if (!["multiple_choice","true_false"].includes(question.questionType)) throw new FloridaClassDExamError(`Question ${index + 1} has an invalid type.`, 400, "FDACS_EXAM_BANK_TYPE_INVALID");
    const prompt = question.prompt?.trim();
    if (!prompt || prompt.length > 8000) throw new FloridaClassDExamError(`Question ${index + 1} has an invalid prompt.`, 400, "FDACS_EXAM_BANK_PROMPT_INVALID");
    if (!question.choices || typeof question.choices !== "object" || Array.isArray(question.choices)) throw new FloridaClassDExamError(`Question ${index + 1} choices are invalid.`, 400, "FDACS_EXAM_BANK_CHOICES_INVALID");
    const choiceEntries = Object.entries(question.choices).filter(([key, value]) => key.trim() && typeof value === "string" && value.trim());
    if (choiceEntries.length < 2 || choiceEntries.length > 8) throw new FloridaClassDExamError(`Question ${index + 1} must contain between 2 and 8 choices.`, 400, "FDACS_EXAM_BANK_CHOICES_INVALID");
    const choices = Object.fromEntries(choiceEntries.map(([key, value]) => [key.trim(), value.trim()]));
    const correctChoiceKey = question.correctChoiceKey?.trim();
    if (!correctChoiceKey || !(correctChoiceKey in choices)) throw new FloridaClassDExamError(`Question ${index + 1} has an invalid answer key.`, 400, "FDACS_EXAM_BANK_ANSWER_INVALID");
    if (question.questionType === "true_false" && choiceEntries.length !== 2) throw new FloridaClassDExamError(`True/false question ${index + 1} must contain exactly two choices.`, 400, "FDACS_EXAM_BANK_TRUE_FALSE_INVALID");

    const current = counts.get(subjectCode) ?? { total: 0, tf: 0 };
    current.total += 1;
    if (question.questionType === "true_false") current.tf += 1;
    counts.set(subjectCode, current);

    return {
      subject_code: subjectCode,
      question_type: question.questionType,
      prompt,
      choices,
      correct_choice_key: correctChoiceKey,
      rationale: question.rationale?.trim() || null,
      display_order: index + 1,
      active: true,
    };
  });

  for (const [subject, count] of counts) {
    if (count.tf * 2 > count.total) throw new FloridaClassDExamError(`True/false questions exceed 50 percent in subject area ${subject}.`, 400, "FDACS_EXAM_BANK_TRUE_FALSE_LIMIT");
  }
  if (counts.size !== 18) throw new FloridaClassDExamError("Exam bank must cover all 18 controlled subject areas.", 400, "FDACS_EXAM_BANK_SUBJECT_COVERAGE");
  return { version, sourceReference, questions };
}

function stableDigest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function importFloridaClassDExamBank(actorUserId: string, payload: ImportPayload, correlationId: string = randomUUID()) {
  if (!floridaClassDExamAdminEnabled()) throw new FloridaClassDExamError("Exam bank administration is disabled.", 503, "FDACS_EXAM_ADMIN_DISABLED");
  if (!UUID_PATTERN.test(correlationId)) throw new FloridaClassDExamError("Correlation identifier is invalid.", 400, "FDACS_EXAM_ADMIN_CORRELATION_INVALID");
  const normalized = normalize(payload);
  const sourceSha256 = stableDigest(normalized);

  const existingImports = await request<Array<{ id: string; bank_id?: string | null; validation_status: string }>>(`fdacs_class_d_exam_bank_imports?${new URLSearchParams({ select: "id,bank_id,validation_status", source_sha256: `eq.${sourceSha256}`, limit: "1" })}`);
  if (existingImports[0]) throw new FloridaClassDExamError("This exact examination bank source has already been imported.", 409, "FDACS_EXAM_BANK_DUPLICATE_IMPORT");

  const banks = await request<Array<{ id: string }>>("fdacs_class_d_exam_banks", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ course_id: COURSE_ID, version: normalized.version, status: "draft", question_count: 170 }),
  });
  const bankId = banks[0]?.id;
  if (!bankId || !UUID_PATTERN.test(bankId)) throw new FloridaClassDExamError("Exam bank record was not created.", 502, "FDACS_EXAM_BANK_CREATE_FAILED");

  try {
    await request("fdacs_class_d_exam_questions", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify(normalized.questions.map((question) => ({ ...question, bank_id: bankId }))),
    });
    await request("rpc/fdacs_class_d_validate_exam_bank", { method: "POST", body: JSON.stringify({ p_bank_id: bankId }) });
    const imports = await request<Array<{ id: string }>>("fdacs_class_d_exam_bank_imports", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        bank_id: bankId,
        version: normalized.version,
        source_reference: normalized.sourceReference,
        source_sha256: sourceSha256,
        imported_question_count: 170,
        validation_status: "validated",
        validation_summary: { exactQuestionCount: true, subjectAreasCovered: 18, trueFalseLimitSatisfied: true },
        imported_by_clerk_user_id: actorUserId,
        correlation_id: correlationId,
      }),
    });
    return { bankId, importId: imports[0]?.id ?? null, version: normalized.version, sourceSha256, status: "draft", validationStatus: "validated" };
  } catch (error) {
    await request(`fdacs_class_d_exam_banks?${new URLSearchParams({ id: `eq.${bankId}`, status: "eq.draft" })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "retired" }) }).catch(() => undefined);
    throw error;
  }
}

export async function listFloridaClassDExamBanks() {
  return request<Array<Record<string, unknown>>>(`fdacs_class_d_exam_banks?${new URLSearchParams({ select: "id,version,status,division_approval_reference,question_count,required_question_count,passing_score,minimum_exam_seconds,created_at,approved_at", course_id: `eq.${COURSE_ID}`, order: "created_at.desc", limit: "50" })}`);
}

export async function markFloridaClassDExamBankSubmitted(actorUserId: string, bankId: string, submissionReference: string, correlationId: string = randomUUID()) {
  if (!floridaClassDExamAdminEnabled()) throw new FloridaClassDExamError("Exam bank administration is disabled.", 503, "FDACS_EXAM_ADMIN_DISABLED");
  if (!UUID_PATTERN.test(bankId) || !UUID_PATTERN.test(correlationId)) throw new FloridaClassDExamError("Identifier is invalid.", 400, "FDACS_EXAM_ADMIN_IDENTIFIER_INVALID");
  if (!submissionReference.trim()) throw new FloridaClassDExamError("Submission reference is required.", 400, "FDACS_EXAM_SUBMISSION_REFERENCE_REQUIRED");
  await request("rpc/fdacs_class_d_mark_exam_bank_submitted", { method: "POST", body: JSON.stringify({ p_bank_id: bankId, p_actor_clerk_user_id: actorUserId, p_submission_reference: submissionReference.trim(), p_correlation_id: correlationId }) });
  return { bankId, status: "division_submitted" };
}

export async function markFloridaClassDExamBankApproved(actorUserId: string, bankId: string, approvalReference: string, correlationId: string = randomUUID()) {
  if (!floridaClassDExamAdminEnabled()) throw new FloridaClassDExamError("Exam bank administration is disabled.", 503, "FDACS_EXAM_ADMIN_DISABLED");
  if (!UUID_PATTERN.test(bankId) || !UUID_PATTERN.test(correlationId)) throw new FloridaClassDExamError("Identifier is invalid.", 400, "FDACS_EXAM_ADMIN_IDENTIFIER_INVALID");
  if (approvalReference.trim().length < 3) throw new FloridaClassDExamError("Division approval reference is required.", 400, "FDACS_EXAM_APPROVAL_REFERENCE_REQUIRED");
  await request("rpc/fdacs_class_d_mark_exam_bank_approved", { method: "POST", body: JSON.stringify({ p_bank_id: bankId, p_actor_clerk_user_id: actorUserId, p_approval_reference: approvalReference.trim(), p_correlation_id: correlationId }) });
  return { bankId, status: "division_approved" };
}
