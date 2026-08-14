import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CourseOpeningGate from "../CourseOpeningGate";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { finalAssessmentQuestions, lessonBrief } from "../../courseExperience";
import { courseOpeningForCourse } from "../../courseOpening";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/academy/learn/${courseId}`)}`);
  }

  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) redirect(`/academy/${courseId}?required=paid-access`);

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  return (
    <CourseOpeningGate
      course={course}
      opening={courseOpeningForCourse(course)}
      initialProgress={state.progress[courseId] ?? { completedLessons: [] }}
      lessons={lessons}
      assessment={finalAssessmentQuestions(course.id)}
      watermark="PAID OBSERRA ACADEMY ACCESS · OBSERRA PROPRIETARY"
    />
  );
}
