import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CoursePlayer from "../CoursePlayer";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, parseAcademyAccess } from "../../../../lib/academyAccess";
import { finalAssessmentQuestions, lessonBrief } from "../../courseExperience";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();
  const state = parseAcademyAccess((await cookies()).get(academyAccessCookieName)?.value);
  if (!state?.courses[courseId]) redirect(`/academy/${courseId}?required=paid-access`);
  const lessons = course.modules.map((_, index) => lessonBrief(course.id, index)).filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const watermark = "PAID OBSERRA ACADEMY ACCESS · OBSERRA PROPRIETARY";
  return <CoursePlayer course={course} initialProgress={state.progress[courseId] ?? { completedLessons: [] }} lessons={lessons} assessment={finalAssessmentQuestions(course.id)} watermark={watermark} />;
}
