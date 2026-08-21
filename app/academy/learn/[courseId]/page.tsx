import { notFound, redirect } from "next/navigation";
import CoursePlayer from "../CoursePlayer";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { finalAssessmentQuestions, lessonBrief } from "../../courseExperience";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    redirect("/academy?identity=configuration-required");
  }
  if (!identity.principalId || !identity.identity) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/academy/learn/${courseId}`)}`);
  }

  const state = await academyStateWithOwnerAccess(
    identity.principalId,
    courseId,
    identity.identity.roles,
  );
  if (!state.entitlements[courseId]) redirect(`/academy/${courseId}?required=paid-access`);

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  return (
    <CoursePlayer
      course={course}
      initialProgress={state.progress[courseId] ?? { completedLessons: [] }}
      lessons={lessons}
      assessment={finalAssessmentQuestions(course.id)}
      watermark="PAID OBSERRA ACADEMY ACCESS · OBSERRA ACADEMY PROPRIETARY"
    />
  );
}
