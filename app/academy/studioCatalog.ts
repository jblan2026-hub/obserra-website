import studioCatalogJson from "./generated/studio-catalog.json";
import type { Course, CourseLevel, Department } from "./courseData";

type StudioModule = {
  id?: string;
  sequence?: number;
  title?: string;
  duration?: string;
  format?: string;
  description?: string;
};

type StudioCourse = {
  id?: string;
  title?: string;
  department?: string;
  level?: string;
  track?: string;
  audience?: string;
  description?: string;
  duration?: string;
  prerequisites?: unknown;
  outcomes?: unknown;
  modules?: unknown;
  tags?: unknown;
  commerce?: {
    model?: string;
    price?: number;
    currency?: string;
    paymentLink?: string | null;
    stripePriceId?: string | null;
  };
  licensing?: unknown;
  completion?: unknown;
  certificate?: unknown;
  branding?: unknown;
  disclaimer?: unknown;
  acknowledgementRequired?: boolean;
  version?: string;
  releaseStatus?: string;
};

type StudioCatalog = {
  schemaVersion?: string;
  generatedAt?: string | null;
  publisher?: string;
  courses?: unknown;
};

export type StudioCoursePublicationMetadata = {
  prerequisites: string[];
  tags: unknown;
  commerce: StudioCourse["commerce"];
  licensing: unknown;
  completion: unknown;
  certificate: unknown;
  branding: unknown;
  disclaimer: unknown;
  acknowledgementRequired: boolean;
  version: string | null;
  releaseStatus: "approved" | "published";
};

const supportedSchemaVersions = new Set(["1.2", "1.3", "1.4"]);
const allowedDepartments = new Set<Department>(["Cyber", "Protection", "Intelligence", "Technologies"]);
const allowedLevels = new Set<CourseLevel>(["Foundation", "Professional", "Advanced", "Executive Intensive", "CISO Masterclass"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toDepartment(value: unknown): Department | null {
  return isNonEmptyString(value) && allowedDepartments.has(value as Department) ? (value as Department) : null;
}

function toLevel(value: unknown): CourseLevel | null {
  return isNonEmptyString(value) && allowedLevels.has(value as CourseLevel) ? (value as CourseLevel) : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isNonEmptyString).map((entry) => entry.trim()) : [];
}

function toModules(value: unknown): Course["modules"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    const module = candidate as StudioModule;
    if (!isNonEmptyString(module.title) || !isNonEmptyString(module.duration) || !isNonEmptyString(module.format) || !isNonEmptyString(module.description)) {
      return [];
    }
    return [{
      title: module.title.trim(),
      duration: module.duration.trim(),
      format: module.format.trim(),
      description: module.description.trim(),
    }];
  });
}

function releaseStatus(value: unknown): "approved" | "published" | null {
  return value === "approved" || value === "published" ? value : null;
}

function toCourse(candidate: unknown): { course: Course; publication: StudioCoursePublicationMetadata } | null {
  const source = candidate as StudioCourse;
  const department = toDepartment(source.department);
  const level = toLevel(source.level);
  const modules = toModules(source.modules);
  const outcomes = toStringArray(source.outcomes);
  const status = releaseStatus(source.releaseStatus);

  if (
    !isNonEmptyString(source.id) ||
    !isNonEmptyString(source.title) ||
    !department ||
    !level ||
    !isNonEmptyString(source.track) ||
    !isNonEmptyString(source.audience) ||
    !isNonEmptyString(source.description) ||
    !isNonEmptyString(source.duration) ||
    !Number.isFinite(source.commerce?.price) ||
    (source.commerce?.price ?? 0) <= 0 ||
    source.commerce?.currency !== "USD" ||
    !status ||
    outcomes.length === 0 ||
    modules.length === 0
  ) {
    return null;
  }

  const course: Course = {
    id: source.id.trim(),
    title: source.title.trim(),
    department,
    level,
    track: source.track.trim(),
    audience: source.audience.trim(),
    description: source.description.trim(),
    duration: source.duration.trim(),
    price: source.commerce!.price!,
    outcomes,
    modules,
  };

  return {
    course,
    publication: {
      prerequisites: toStringArray(source.prerequisites),
      tags: source.tags ?? null,
      commerce: source.commerce,
      licensing: source.licensing ?? null,
      completion: source.completion ?? null,
      certificate: source.certificate ?? null,
      branding: source.branding ?? null,
      disclaimer: source.disclaimer ?? null,
      acknowledgementRequired: source.acknowledgementRequired === true,
      version: isNonEmptyString(source.version) ? source.version.trim() : null,
      releaseStatus: status,
    },
  };
}

const catalog = studioCatalogJson as StudioCatalog;

export const studioCatalogStatus = {
  schemaVersion: catalog.schemaVersion ?? "unknown",
  generatedAt: catalog.generatedAt ?? null,
  publisher: catalog.publisher ?? null,
  supported: supportedSchemaVersions.has(catalog.schemaVersion ?? ""),
  sourceCourseCount: Array.isArray(catalog.courses) ? catalog.courses.length : 0,
  acceptedCourseCount: 0,
  rejectedCourseCount: 0,
} as {
  schemaVersion: string;
  generatedAt: string | null;
  publisher: string | null;
  supported: boolean;
  sourceCourseCount: number;
  acceptedCourseCount: number;
  rejectedCourseCount: number;
};

export const studioCoursePublicationMetadataById = new Map<string, StudioCoursePublicationMetadata>();

export const studioCourses: Course[] = (() => {
  if (!supportedSchemaVersions.has(catalog.schemaVersion ?? "") || !Array.isArray(catalog.courses)) return [];

  const ids = new Set<string>();
  const accepted: Course[] = [];
  let rejected = 0;

  for (const candidate of catalog.courses) {
    const parsed = toCourse(candidate);
    if (!parsed || ids.has(parsed.course.id)) {
      rejected += 1;
      continue;
    }
    ids.add(parsed.course.id);
    accepted.push(parsed.course);
    studioCoursePublicationMetadataById.set(parsed.course.id, parsed.publication);
  }

  studioCatalogStatus.acceptedCourseCount = accepted.length;
  studioCatalogStatus.rejectedCourseCount = rejected;
  return accepted;
})();

export function mergeStudioCourses(fallbackCourses: Course[]): Course[] {
  if (studioCourses.length === 0) return fallbackCourses;

  const merged = new Map(fallbackCourses.map((course) => [course.id, course]));
  for (const course of studioCourses) merged.set(course.id, course);
  return Array.from(merged.values());
}
