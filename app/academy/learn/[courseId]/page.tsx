import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CoursePlayer from "../CoursePlayer";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { finalAssessmentQuestions, lessonBrief } from "../../courseExperience";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const reviewMode = process.env.VERCEL_ENV === "preview";
  let initialProgress = { completedLessons: [] as number[] };

  if (!reviewMode) {
    const { userId } = await auth();
    if (!userId) {
      redirect(`/sign-in?redirect_url=${encodeURIComponent(`/academy/learn/${courseId}`)}`);
    }

    const state = await academyStateWithOwnerAccess(userId, courseId);
    if (!state.entitlements[courseId]) redirect(`/academy/${courseId}?required=paid-access`);
    initialProgress = state.progress[courseId] ?? { completedLessons: [] };
  }

  const lessons = course.modules
    .map((_, index) => lessonBrief(course.id, index))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const watermark = reviewMode
    ? "OWNER REVIEW · NOT A CUSTOMER RECORD · OBSERRA PROPRIETARY"
    : "PAID OBSERRA ACADEMY ACCESS · OBSERRA PROPRIETARY";

  return (
    <CoursePlayer
      course={course}
      initialProgress={initialProgress}
      lessons={lessons}
      assessment={finalAssessmentQuestions(course.id)}
      watermark={watermark}
      reviewMode={reviewMode}
    />
  );
}
