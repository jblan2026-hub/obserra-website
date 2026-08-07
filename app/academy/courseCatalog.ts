import studioCatalog from "./generated/studio-catalog.json";
import { courses as liveContractCourses } from "./courseData";
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
    course.commerce.currency?.toUpperCase() === "USD" &&
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

function normalizedCommercialContract(course: Course) {
  return {
    id: course.id,
    title: course.title,
    department: course.department,
    level: course.level,
    track: course.track,
    audience: course.audience,
    description: course.description,
    duration: course.duration,
    price: course.price,
    outcomes: course.outcomes,
    modules: course.modules,
  };
}

function studioHasLiveCatalogParity(studioCourses: readonly Course[], liveCourses: readonly Course[]) {
  if (studioCourses.length !== liveCourses.length || liveCourses.length !== 60) return false;

  const liveById = new Map(liveCourses.map((course) => [course.id, course]));
  for (const studioCourse of studioCourses) {
    const liveCourse = liveById.get(studioCourse.id);
    if (!liveCourse) return false;
    if (JSON.stringify(normalizedCommercialContract(studioCourse)) !== JSON.stringify(normalizedCommercialContract(liveCourse))) return false;
  }
  return true;
}

const studioCatalogHasLiveParity = studioHasLiveCatalogParity(synchronizedCourses, liveContractCourses);

/**
 * The live website catalog is the commercial release contract. A governed
 * Studio catalog can become the runtime source only after all 60 published
 * courses are present and every public commercial and curriculum field has
 * parity. Partial, stale, or divergent Studio content fails closed to the
 * reviewed live contract instead of silently changing paid course promises.
 */
export const courses: Course[] = studioCatalogHasLiveParity ? synchronizedCourses : liveContractCourses;
export const academyCatalogSource = studioCatalogHasLiveParity ? "academy-production-studio" : "live-production-contract";
export const academyCatalogGeneratedAt = studioCatalogHasLiveParity ? studioCatalog.generatedAt : null;
export const academyCatalogParity = {
  expectedCourses: liveContractCourses.length,
  synchronizedCourses: synchronizedCourses.length,
  matched: studioCatalogHasLiveParity,
} as const;

export type { Course, CourseLevel, Department } from "./courseData";
