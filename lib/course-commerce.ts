import courseCommerceCatalog from "../app/academy/course-commerce-catalog.json";

export type CourseAccessPolicy = "until-completion";

export type CourseCommerceRecord = {
  courseId: string;
  title: string;
  version: string;
  priceUsd: number;
  paymentLink: string | null;
  stripePriceId: string | null;
  accessPolicy: CourseAccessPolicy;
  completionThreshold: number;
  certificateEnabled: boolean;
  publishedAt: string;
};

type CourseCommerceCatalog = {
  schemaVersion: string;
  generatedAt: string | null;
  courses: CourseCommerceRecord[];
};

const catalog = courseCommerceCatalog as CourseCommerceCatalog;

export function courseCommerceForId(courseId: string) {
  return catalog.courses.find((course) => course.courseId === courseId);
}

export function allCourseCommerceRecords() {
  return catalog.courses;
}
