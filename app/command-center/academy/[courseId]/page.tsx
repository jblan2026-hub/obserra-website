import { notFound } from "next/navigation";
import { courseForId } from "../../../../lib/academy";
import { requireOwnerAccess } from "../../../../lib/owner-access";
import { finalAssessment, lessonBrief } from "../../../academy/courseExperience";
import OwnerCourseReview from "./OwnerCourseReview";

export const dynamic = "force-dynamic";

export default async function OwnerCourseReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  await requireOwnerAccess(`/command-center/academy/${courseId}`);

  const course = courseForId(courseId);
  if (!course) notFound();

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const assessment = finalAssessment(course.id);

  return <OwnerCourseReview course={course} lessons={lessons} assessment={assessment} />;
}
