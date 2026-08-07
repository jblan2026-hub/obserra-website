import "server-only";

import type {
  AcademyAssessmentGrade,
  AcademyKnowledgeCheckResult,
  AcademyReleaseReadiness,
  LearnerCourseRelease,
} from "./academy-delivery-contract";

export class AcademyDeliveryError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 503, code = "ACADEMY_DELIVERY_UNAVAILABLE") {
    super(message);
    this.name = "AcademyDeliveryError";
    this.status = status;
    this.code = code;
  }
}

function validCourseId(courseId: string): string {
  const normalized = courseId.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new AcademyDeliveryError("Invalid course identifier", 400, "INVALID_COURSE_ID");
  }
  return normalized;
}

function deliveryConfiguration(): { baseUrl: string; token: string } {
  const baseUrl = process.env.ACADEMY_DELIVERY_BASE_URL?.trim().replace(/\/+$/, "");
  const token = process.env.ACADEMY_DELIVERY_TOKEN?.trim();
  if (!baseUrl || !token || token.length < 32) {
    throw new AcademyDeliveryError(
      "Academy learner delivery is not configured",
      503,
      "ACADEMY_DELIVERY_NOT_CONFIGURED",
    );
  }
  return { baseUrl, token };
}

function deliveryHeaders(
  token: string,
  purpose: "readiness" | "learner-content" | "knowledge-check" | "assessment-grade",
  learnerId?: string,
): HeadersInit {
  return {
    accept: "application/json",
    "content-type": "application/json",
    "x-academy-delivery-token": token,
    "x-academy-delivery-purpose": purpose,
    "x-academy-actor-id": "obserra-website",
    ...(learnerId ? { "x-academy-learner-id": learnerId } : {}),
  };
}

async function responsePayload(response: Response): Promise<Record<string, unknown>> {
  try {
    const value = await response.json() as unknown;
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function serviceError(response: Response, payload: Record<string, unknown>): AcademyDeliveryError {
  const message = typeof payload.error === "string"
    ? payload.error
    : "Academy learner delivery is temporarily unavailable";
  return new AcademyDeliveryError(message, response.status || 503);
}

export async function academyReleaseReadiness(courseId: string): Promise<AcademyReleaseReadiness> {
  const normalized = validCourseId(courseId);
  let configuration: { baseUrl: string; token: string };
  try {
    configuration = deliveryConfiguration();
  } catch (error) {
    return {
      ready: false,
      courseId: normalized,
      reasons: [error instanceof AcademyDeliveryError ? error.code : "ACADEMY_DELIVERY_NOT_CONFIGURED"],
    };
  }

  try {
    const response = await fetch(
      `${configuration.baseUrl}/api/delivery/courses/${encodeURIComponent(normalized)}/readiness`,
      {
        method: "GET",
        headers: deliveryHeaders(configuration.token, "readiness"),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    const payload = await responsePayload(response);
    if (!response.ok) {
      const reasons = Array.isArray(payload.reasons)
        ? payload.reasons.filter((item): item is string => typeof item === "string")
        : [`delivery-readiness-${response.status}`];
      return { ready: false, courseId: normalized, reasons };
    }
    return payload as AcademyReleaseReadiness;
  } catch {
    return { ready: false, courseId: normalized, reasons: ["readiness-service-unavailable"] };
  }
}

export async function academyLearnerRelease(
  courseId: string,
  learnerId: string,
): Promise<LearnerCourseRelease> {
  const normalized = validCourseId(courseId);
  const { baseUrl, token } = deliveryConfiguration();
  const response = await fetch(`${baseUrl}/api/delivery/courses/${encodeURIComponent(normalized)}`, {
    method: "GET",
    headers: deliveryHeaders(token, "learner-content", learnerId),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await responsePayload(response);
  if (!response.ok) throw serviceError(response, payload);
  return payload as LearnerCourseRelease;
}

export async function gradeAcademyKnowledgeCheck(input: {
  courseId: string;
  learnerId: string;
  lessonPosition: number;
  questionId: string;
  answerIndex: number;
}): Promise<AcademyKnowledgeCheckResult> {
  const normalized = validCourseId(input.courseId);
  const { baseUrl, token } = deliveryConfiguration();
  const response = await fetch(
    `${baseUrl}/api/delivery/courses/${encodeURIComponent(normalized)}/check`,
    {
      method: "POST",
      headers: deliveryHeaders(token, "knowledge-check", input.learnerId),
      body: JSON.stringify({
        lessonPosition: input.lessonPosition,
        questionId: input.questionId,
        answerIndex: input.answerIndex,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  const payload = await responsePayload(response);
  if (!response.ok) throw serviceError(response, payload);
  return payload as AcademyKnowledgeCheckResult;
}

export async function gradeAcademyFinalAssessment(input: {
  courseId: string;
  learnerId: string;
  answers: Array<{ questionId: string; answerIndex: number }>;
}): Promise<AcademyAssessmentGrade> {
  const normalized = validCourseId(input.courseId);
  const { baseUrl, token } = deliveryConfiguration();
  const response = await fetch(
    `${baseUrl}/api/delivery/courses/${encodeURIComponent(normalized)}/grade`,
    {
      method: "POST",
      headers: deliveryHeaders(token, "assessment-grade", input.learnerId),
      body: JSON.stringify({ answers: input.answers }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  const payload = await responsePayload(response);
  if (!response.ok) throw serviceError(response, payload);
  return payload as AcademyAssessmentGrade;
}
