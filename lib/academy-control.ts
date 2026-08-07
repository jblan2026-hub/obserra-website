import "server-only";

import { cache } from "react";
import type { Course } from "../app/academy/courseData";
import {
  ACADEMY_PUBLIC_CATALOG_URL,
  defaultAcademyCourseControl,
  type AcademyCourseControl,
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

const loadPublicCatalog = cache(async (): Promise<AcademyPublicCatalogResponse> => {
  const response = await fetch(ACADEMY_PUBLIC_CATALOG_URL, {
    headers: { accept: "application/json" },
    next: { revalidate: 10 },
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json().catch(() => null) as AcademyPublicCatalogResponse | null;
  if (!response.ok || !payload || payload.schemaVersion !== "1.0") {
    throw new AcademyControlError(
      "Academy public control state is unavailable.",
      response.status || 503,
      "ACADEMY_CONTROL_UNAVAILABLE",
    );
  }
  return payload;
});

const loadPublicCourse = cache(async (courseId: string): Promise<AcademyPublicCourseResponse> => {
  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new AcademyControlError("Invalid course identifier.", 400, "INVALID_COURSE_ID");
  }

  const response = await fetch(`${ACADEMY_PUBLIC_CATALOG_URL}?courseId=${encodeURIComponent(courseId)}`, {
    headers: { accept: "application/json" },
    next: { revalidate: 10 },
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json().catch(() => null) as AcademyPublicCourseResponse | null;
  if (!response.ok || !payload || payload.schemaVersion !== "1.0") {
    throw new AcademyControlError(
      "Academy course control state is unavailable.",
      response.status || 503,
      "ACADEMY_CONTROL_UNAVAILABLE",
    );
  }
  return payload;
});

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
    console.error("Academy public catalog control degraded", error);
    return {
      courses: [...baseCourses],
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
    console.error(`Academy control degraded for ${baseCourse.id}`, error);
    return {
      course: baseCourse,
      control: defaultAcademyCourseControl(baseCourse.id),
      controlPlane: "degraded" as const,
      requestId: null,
    };
  }
}
