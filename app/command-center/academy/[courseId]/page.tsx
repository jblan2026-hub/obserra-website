import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { finalAssessmentQuestions, lessonBrief } from "../../../academy/courseExperience";
import { courseForId } from "../../../../lib/academy";
import { requireOwnerPage } from "../../../../lib/owner-auth";
import OwnerCourseReviewClient from "./OwnerCourseReviewClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course Content Review",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function OwnerCourseReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  await requireOwnerPage(`/command-center/academy/${courseId}`);

  const course = courseForId(courseId);
  if (!course) notFound();

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  if (lessons.length !== course.modules.length) notFound();

  return (
    <OwnerCourseReviewClient
      course={course}
      lessons={lessons}
      assessment={finalAssessmentQuestions(course.id)}
    />
  );
}
