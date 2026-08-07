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
  outcomes?: unknown;
  modules?: unknown;
  commerce?: {
    price?: number;
    currency?: string;
  };
  releaseStatus?: string;
};

type StudioCatalog = {
  schemaVersion?: string;
  courses?: unknown;
};

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

function toCourse(candidate: unknown): Course | null {
  const course = candidate as StudioCourse;
  const department = toDepartment(course.department);
  const level = toLevel(course.level);
  const modules = toModules(course.modules);
  const outcomes = toStringArray(course.outcomes);

  if (
    !isNonEmptyString(course.id) ||
    !isNonEmptyString(course.title) ||
    !department ||
    !level ||
    !isNonEmptyString(course.track) ||
    !isNonEmptyString(course.audience) ||
    !isNonEmptyString(course.description) ||
    !isNonEmptyString(course.duration) ||
    !Number.isFinite(course.commerce?.price) ||
    (course.commerce?.price ?? 0) <= 0 ||
    course.commerce?.currency !== "USD" ||
    !["approved", "published"].includes(course.releaseStatus ?? "") ||
    outcomes.length === 0 ||
    modules.length === 0
  ) {
    return null;
  }

  return {
    id: course.id.trim(),
    title: course.title.trim(),
    department,
    level,
    track: course.track.trim(),
    audience: course.audience.trim(),
    description: course.description.trim(),
    duration: course.duration.trim(),
    price: course.commerce!.price!,
    outcomes,
    modules,
  };
}

const catalog = studioCatalogJson as StudioCatalog;

export const studioCatalogStatus = {
  schemaVersion: catalog.schemaVersion ?? "unknown",
  sourceCourseCount: Array.isArray(catalog.courses) ? catalog.courses.length : 0,
  acceptedCourseCount: 0,
  rejectedCourseCount: 0,
} as { schemaVersion: string; sourceCourseCount: number; acceptedCourseCount: number; rejectedCourseCount: number };

export const studioCourses: Course[] = (() => {
  if (catalog.schemaVersion !== "1.2" || !Array.isArray(catalog.courses)) return [];

  const ids = new Set<string>();
  const accepted: Course[] = [];
  let rejected = 0;

  for (const candidate of catalog.courses) {
    const course = toCourse(candidate);
    if (!course || ids.has(course.id)) {
      rejected += 1;
      continue;
    }
    ids.add(course.id);
    accepted.push(course);
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
