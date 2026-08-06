import catalog from "./generated/studio-catalog.json";

export type Department = "Cyber" | "Protection" | "Intelligence" | "Technologies";
export type CourseLevel = "Foundation" | "Professional" | "Advanced" | "Executive Intensive" | "CISO Masterclass";

export type Course = {
  id: string;
  department: Department;
  level: CourseLevel;
  track: string;
  title: string;
  duration: string;
  price: number;
  audience: string;
  description: string;
  outcomes: string[];
  modules: { title: string; duration: string; format: string; description: string }[];
};

type StudioRecord = {
  id: string;
  department: string;
  level: string;
  track: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  outcomes: string[];
  modules: { id: string; sequence: number; title: string; duration: string; format: string; description: string }[];
  commerce: { price: number; currency: string };
  releaseStatus: string;
};

type StudioCatalog = {
  schemaVersion: string;
  courses: StudioRecord[];
};

const departments = new Set<Department>(["Cyber", "Protection", "Intelligence", "Technologies"]);
const levels = new Set<CourseLevel>(["Foundation", "Professional", "Advanced", "Executive Intensive", "CISO Masterclass"]);
const approvedStatuses = new Set(["approved", "published"]);
const studioCatalog = catalog as StudioCatalog;

function isDepartment(value: string): value is Department {
  return departments.has(value as Department);
}

function isLevel(value: string): value is CourseLevel {
  return levels.has(value as CourseLevel);
}

function mapCourse(record: StudioRecord): Course {
  if (!isDepartment(record.department)) throw new Error(`Unsupported Academy department for ${record.id}: ${record.department}`);
  if (!isLevel(record.level)) throw new Error(`Unsupported Academy level for ${record.id}: ${record.level}`);
  if (!approvedStatuses.has(record.releaseStatus)) throw new Error(`Academy course ${record.id} is not approved for publication`);
  if (record.commerce.currency !== "USD" || !(record.commerce.price > 0)) throw new Error(`Academy course ${record.id} has invalid commerce metadata`);
  if (!Array.isArray(record.modules) || record.modules.length === 0) throw new Error(`Academy course ${record.id} has no approved lessons`);

  return {
    id: record.id,
    department: record.department,
    level: record.level,
    track: record.track,
    title: record.title,
    duration: record.duration,
    price: record.commerce.price,
    audience: record.audience,
    description: record.description,
    outcomes: [...record.outcomes],
    modules: [...record.modules]
      .sort((a, b) => a.sequence - b.sequence)
      .map((module) => ({
        title: module.title,
        duration: module.duration,
        format: module.format,
        description: module.description,
      })),
  };
}

if (studioCatalog.schemaVersion !== "1.2") throw new Error("Academy Studio catalog schemaVersion must equal 1.2");

export const courses: Course[] = studioCatalog.courses
  .filter((record) => approvedStatuses.has(record.releaseStatus))
  .map(mapCourse);
