import studioCatalog from "./generated/studio-catalog.json";
import { courses as legacyCourses } from "./courseData";
import type { Course, CourseLevel, Department } from "./courseData";

type StudioCourse = {
  id: string;
  title: string;
  department: string;
  level: string;
  track: string;
  audience: string;
  description: string;
  duration: string;
  outcomes: string[];
  modules: Array<{
    title: string;
    duration: string;
    format: string;
    description: string;
  }>;
  commerce: {
    price: number;
    currency: string;
  };
  releaseStatus: string;
};

const validDepartments = new Set<Department>(["Cyber", "Protection", "Intelligence", "Technologies"]);
const validLevels = new Set<CourseLevel>(["Foundation", "Professional", "Advanced", "Executive Intensive", "CISO Masterclass"]);

function isStudioCourse(value: unknown): value is StudioCourse {
  if (!value || typeof value !== "object") return false;
  const course = value as Partial<StudioCourse>;
  return Boolean(
    course.id &&
    course.title &&
    course.department &&
    course.level &&
    course.track &&
    course.audience &&
    course.description &&
    course.duration &&
    Array.isArray(course.outcomes) &&
    Array.isArray(course.modules) &&
    course.modules.length > 0 &&
    course.commerce &&
    typeof course.commerce.price === "number" &&
    ["approved", "published"].includes(course.releaseStatus ?? ""),
  );
}

function toCourse(course: StudioCourse): Course | null {
  if (!validDepartments.has(course.department as Department)) return null;
  if (!validLevels.has(course.level as CourseLevel)) return null;
  return {
    id: course.id,
    title: course.title,
    department: course.department as Department,
    level: course.level as CourseLevel,
    track: course.track,
    audience: course.audience,
    description: course.description,
    duration: course.duration,
    price: course.commerce.price,
    outcomes: course.outcomes,
    modules: course.modules.map((module) => ({
      title: module.title,
      duration: module.duration,
      format: module.format,
      description: module.description,
    })),
  };
}

const synchronizedCourses = Array.isArray(studioCatalog.courses)
  ? studioCatalog.courses.filter(isStudioCourse).map(toCourse).filter((course): course is Course => Boolean(course))
  : [];

/**
 * Academy Production Studio is the authoritative catalog. The legacy catalog
 * remains as a compatibility fallback only until at least one approved Studio
 * course has been synchronized into the website repository.
 */
export const courses: Course[] = synchronizedCourses.length > 0 ? synchronizedCourses : legacyCourses;
export const academyCatalogSource = synchronizedCourses.length > 0 ? "academy-production-studio" : "legacy-compatibility-fallback";
export const academyCatalogGeneratedAt = synchronizedCourses.length > 0 ? studioCatalog.generatedAt : null;

export type { Course, CourseLevel, Department } from "./courseData";
