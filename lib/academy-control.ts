import "server-only";

import { cache } from "react";
import type { Course } from "../app/academy/courseData";
import type { KnowledgeCheck, LessonBrief } from "../app/academy/courseExperience";
import {
  ACADEMY_OWNER_CONTROL_URL,
  ACADEMY_PRIVATE_CATALOG_URL,
  defaultAcademyCourseControl,
  type AcademyCourseControl,
  type AcademyCourseDocument,
  type AcademyOwnerCatalogResponse,
  type AcademyOwnerCourseResponse,
  type AcademyPublicCatalogResponse,
  type AcademyPublicCourseResponse,
} from "./academy-control-contracts";

const COURSE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEPARTMENTS = new Set(["Cyber", "Protection", "Intelligence", "Technologies"]);
const LEVELS = new Set([
  "Foundation",
  "Professional",
  "Advanced",
  "Executive Intensive",
  "CISO Masterclass",
]);
const MAX_OWNER_TOKEN_CHARS = 16_000;
const MAX_SERVICE_ROLE_KEY_CHARS = 4_096;
const PRIVATE_CATALOG_HOST = "nwxnyqlyzyufgoadtqxs.supabase.co";
const PRIVATE_CATALOG_PATH = "/functions/v1/academy-public-catalog";

export class AcademyControlError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "AcademyControlError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value: unknown, maximum: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum
    ? value.trim()
    : null;
}

function normalizeCourse(value: unknown, fallback: Course): Course {
  if (!isRecord(value) || value.id !== fallback.id) return fallback;

  const title = boundedText(value.title, 220);
  const department = typeof value.department === "string" && DEPARTMENTS.has(value.department)
    ? value.department as Course["department"]
    : null;
  const level = typeof value.level === "string" && LEVELS.has(value.level)
    ? value.level as Course["level"]
    : null;
  const track = boundedText(value.track, 220);
  const audience = boundedText(value.audience, 1_000);
  const description = boundedText(value.description, 8_000);
  const duration = boundedText(value.duration, 120);
  const price = Number(value.price);
  const outcomes = Array.isArray(value.outcomes)
    ? value.outcomes
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 30)
    : [];
  const modules = Array.isArray(value.modules)
    ? value.modules.flatMap((candidate) => {
      if (!isRecord(candidate)) return [];
      const moduleTitle = boundedText(candidate.title, 500);
      const moduleDuration = boundedText(candidate.duration, 120);
      const format = boundedText(candidate.format, 160);
      const moduleDescription = boundedText(candidate.description, 8_000);
      return moduleTitle && moduleDuration && format && moduleDescription
        ? [{
          title: moduleTitle,
          duration: moduleDuration,
          format,
          description: moduleDescription,
        }]
        : [];
    }).slice(0, 100)
    : [];

  if (
    !title ||
    !department ||
    !level ||
    !track ||
    !audience ||
    !description ||
    !duration ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 100_000 ||
    outcomes.length < 1 ||
    modules.length < 1
  ) {
    return fallback;
  }

  return {
    id: fallback.id,
    title,
    department,
    level,
    track,
    audience,
    description,
    duration,
    price,
    outcomes,
    modules,
  };
}

function normalizeControl(value: unknown, courseId: string): AcademyCourseControl {
  if (!isRecord(value) || value.courseId !== courseId) {
    return defaultAcademyCourseControl(courseId);
  }

  const lifecycle = value.lifecycle;
  if (!["published", "sales_paused", "unpublished", "cancelled"].includes(String(lifecycle))) {
    return defaultAcademyCourseControl(courseId);
  }

  return {
    courseId,
    lifecycle: lifecycle as AcademyCourseControl["lifecycle"],
    publicVisible: value.publicVisible === true,
    purchaseEnabled: value.purchaseEnabled === true,
    preserveExistingEntitlements: true,
    revision: Number.isSafeInteger(value.revision) && Number(value.revision) >= 0
      ? Number(value.revision)
      : 0,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
    reason: typeof value.reason === "string" ? value.reason : null,
  };
}

function isStringArray(value: unknown, maximumItems = 1_000) {
  return Array.isArray(value)
    && value.length <= maximumItems
    && value.every((item) => typeof item === "string" && item.length <= 120_000);
}

function isObjectArray(value: unknown, maximumItems = 1_000) {
  return Array.isArray(value)
    && value.length <= maximumItems
    && value.every(isRecord);
}

function isKnowledgeCheck(value: unknown): value is KnowledgeCheck {
  if (!isRecord(value)) return false;
  const answer = Number(value.answer);
  return Boolean(
    boundedText(value.question, 20_000)
    && Array.isArray(value.options)
    && value.options.length >= 2
    && value.options.length <= 12
    && value.options.every((option) => Boolean(boundedText(option, 20_000)))
    && Number.isInteger(answer)
    && answer >= 0
    && answer < value.options.length
    && boundedText(value.explanation, 40_000),
  );
}

function isLessonBrief(value: unknown): value is LessonBrief {
  if (!isRecord(value)) return false;
  const check = value.check;
  return Boolean(
    boundedText(value.title, 500)
    && boundedText(value.format, 200)
    && boundedText(value.focus, 20_000)
    && boundedText(value.whyItMatters, 40_000)
    && isStringArray(value.objectives, 100)
    && boundedText(value.observe, 40_000)
    && boundedText(value.decide, 40_000)
    && boundedText(value.act, 40_000)
    && isObjectArray(value.instruction, 100)
    && isObjectArray(value.guidedPractice, 100)
    && isObjectArray(value.decisionRubric, 100)
    && isObjectArray(value.failureModes, 100)
    && isStringArray(value.masteryCriteria, 100)
    && isStringArray(value.reflectionPrompts, 100)
    && isObjectArray(value.authorities, 100)
    && isRecord(value.practiceExample)
    && isStringArray(value.businessApplication, 100)
    && boundedText(value.scenario, 80_000)
    && boundedText(value.videoTitle, 500)
    && boundedText(value.videoDuration, 120)
    && isObjectArray(value.videoChapters, 500)
    && isStringArray(value.transcript, 2_000)
    && isObjectArray(value.materials, 500)
    && isKnowledgeCheck(check),
  );
}

function academyServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (
    !value ||
    value.length > MAX_SERVICE_ROLE_KEY_CHARS ||
    /\s/.test(value) ||
    value.split(".").length !== 3
  ) {
    throw new AcademyControlError(
      "Academy private control credentials are unavailable.",
      503,
      "ACADEMY_CONTROL_CREDENTIALS_UNAVAILABLE",
    );
  }
  return value;
}

function privateCatalogUrl(courseId?: string) {
  const url = new URL(ACADEMY_PRIVATE_CATALOG_URL);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.hostname !== PRIVATE_CATALOG_HOST ||
    url.pathname !== PRIVATE_CATALOG_PATH ||
    url.search ||
    url.hash
  ) {
    throw new AcademyControlError(
      "Academy private control endpoint is invalid.",
      500,
      "ACADEMY_CONTROL_ENDPOINT_INVALID",
    );
  }
  if (courseId) url.searchParams.set("courseId", courseId);
  return url;
}

async function privateCatalogRequest<ResponseBody>(url: URL): Promise<ResponseBody> {
  const serviceRoleKey = academyServiceRoleKey();
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "x-obserra-request-id": crypto.randomUUID(),
    },
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json().catch(() => null) as (ResponseBody & {
    error?: string;
    code?: string;
  }) | null;

  if (!response.ok || !payload) {
    throw new AcademyControlError(
      "Academy private control state is unavailable.",
      response.status || 503,
      payload?.code ?? "ACADEMY_CONTROL_UNAVAILABLE",
    );
  }
  return payload;
}

function reportControlFailure(context: string, error: unknown) {
  const code = error instanceof AcademyControlError
    ? error.code
    : "UNEXPECTED_ACADEMY_CONTROL_FAILURE";
  console.error(context, { code });
}

const loadPublicCatalog = cache(async (): Promise<AcademyPublicCatalogResponse> => {
  const payload = await privateCatalogRequest<AcademyPublicCatalogResponse>(privateCatalogUrl());
  if (payload.schemaVersion !== "1.0") {
    throw new AcademyControlError(
      "Academy private catalog response is invalid.",
      502,
      "INVALID_ACADEMY_CONTROL_RESPONSE",
    );
  }
  return payload;
});

const loadPublicCourse = cache(async (courseId: string): Promise<AcademyPublicCourseResponse> => {
  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new AcademyControlError("Invalid course identifier.", 400, "INVALID_COURSE_ID");
  }

  const payload = await privateCatalogRequest<AcademyPublicCourseResponse>(privateCatalogUrl(courseId));
  if (payload.schemaVersion !== "1.0") {
    throw new AcademyControlError(
      "Academy private course control response is invalid.",
      502,
      "INVALID_ACADEMY_CONTROL_RESPONSE",
    );
  }
  return payload;
});

async function ownerRequest<ResponseBody>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<ResponseBody> {
  if (!token || token.length > MAX_OWNER_TOKEN_CHARS || /\s/.test(token)) {
    throw new AcademyControlError(
      "The owner session could not be verified.",
      401,
      "OWNER_AUTHENTICATION_FAILED",
    );
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) {
    throw new AcademyControlError("Invalid owner control path.", 400, "INVALID_OWNER_PATH");
  }

  const response = await fetch(`${ACADEMY_OWNER_CONTROL_URL}${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(12_000),
  });
  const payload = await response.json().catch(() => null) as (ResponseBody & {
    error?: string;
    code?: string;
  }) | null;

  if (!response.ok || !payload) {
    throw new AcademyControlError(
      payload?.error ?? "The Academy owner control service is unavailable.",
      response.status || 503,
      payload?.code ?? "OWNER_CONTROL_UNAVAILABLE",
    );
  }
  return payload;
}

export async function publicAcademyCatalog(baseCourses: readonly Course[]) {
  try {
    const payload = await loadPublicCatalog();
    const controls = new Map(payload.controls.map((control) => [control.courseId, control]));
    const overrides = new Map(payload.courseOverrides.map((item) => [item.courseId, item.course]));
    const courses = baseCourses.flatMap((baseCourse) => {
      const control = normalizeControl(controls.get(baseCourse.id), baseCourse.id);
      if (!control.publicVisible) return [];
      return [normalizeCourse(overrides.get(baseCourse.id), baseCourse)];
    });

    return {
      courses,
      controls: Object.fromEntries(baseCourses.map((course) => [
        course.id,
        normalizeControl(controls.get(course.id), course.id),
      ])) as Record<string, AcademyCourseControl>,
      controlPlane: "operational" as const,
      requestId: payload.requestId,
    };
  } catch (error) {
    reportControlFailure("Academy private catalog control degraded", error);
    return {
      courses: [],
      controls: Object.fromEntries(baseCourses.map((course) => [
        course.id,
        defaultAcademyCourseControl(course.id),
      ])) as Record<string, AcademyCourseControl>,
      controlPlane: "degraded" as const,
      requestId: null,
    };
  }
}

export async function publicAcademyCourse(baseCourse: Course) {
  try {
    const payload = await loadPublicCourse(baseCourse.id);
    const control = normalizeControl(payload.control, baseCourse.id);
    return {
      course: control.publicVisible
        ? normalizeCourse(payload.courseOverride?.course, baseCourse)
        : null,
      control,
      controlPlane: "operational" as const,
      requestId: payload.requestId,
    };
  } catch (error) {
    reportControlFailure(`Academy private control degraded for ${baseCourse.id}`, error);
    return {
      course: null,
      control: defaultAcademyCourseControl(baseCourse.id),
      controlPlane: "degraded" as const,
      requestId: null,
    };
  }
}

export async function academyOwnerCatalog(token: string) {
  const payload = await ownerRequest<AcademyOwnerCatalogResponse>(token, "/catalog");
  if (!Array.isArray(payload.controls) || !Array.isArray(payload.contentOverrides)) {
    throw new AcademyControlError(
      "The Academy owner catalog response is invalid.",
      502,
      "INVALID_OWNER_CATALOG",
    );
  }
  return payload;
}

export async function academyOwnerCourse(token: string, courseId: string) {
  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new AcademyControlError("Invalid course identifier.", 400, "INVALID_COURSE_ID");
  }
  const payload = await ownerRequest<AcademyOwnerCourseResponse>(
    token,
    `/courses/${encodeURIComponent(courseId)}`,
  );
  if (!Array.isArray(payload.events)) {
    throw new AcademyControlError(
      "The Academy owner course response is invalid.",
      502,
      "INVALID_OWNER_COURSE",
    );
  }
  return payload;
}

export function createAcademyCourseDocument(
  course: Course,
  lessons: LessonBrief[],
  assessment: KnowledgeCheck[],
): AcademyCourseDocument {
  return JSON.parse(JSON.stringify({
    schemaVersion: "1.0",
    course,
    lessons,
    assessment,
  })) as AcademyCourseDocument;
}

export function normalizeAcademyCourseDocument(
  value: unknown,
  fallbackCourse: Course,
  fallbackLessons: LessonBrief[],
  fallbackAssessment: KnowledgeCheck[],
): AcademyCourseDocument | null {
  if (!isRecord(value) || value.schemaVersion !== "1.0") return null;
  if (!isRecord(value.course) || value.course.id !== fallbackCourse.id) return null;
  if (!Array.isArray(value.lessons) || value.lessons.length !== fallbackCourse.modules.length) return null;
  if (!value.lessons.every(isLessonBrief)) return null;
  if (!Array.isArray(value.assessment) || value.assessment.length < 1 || value.assessment.length > 500) return null;
  if (!value.assessment.every(isKnowledgeCheck)) return null;

  const course = normalizeCourse(value.course, fallbackCourse);
  if (course.id !== fallbackCourse.id || course.modules.length !== value.lessons.length) return null;

  try {
    const serialized = JSON.stringify({
      schemaVersion: "1.0",
      course,
      lessons: value.lessons,
      assessment: value.assessment,
    });
    if (Buffer.byteLength(serialized, "utf8") > 1_250_000) return null;
    return JSON.parse(serialized) as AcademyCourseDocument;
  } catch {
    return createAcademyCourseDocument(fallbackCourse, fallbackLessons, fallbackAssessment);
  }
}
