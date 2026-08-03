import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CoursePlayer from "../CoursePlayer";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { finalAssessmentQuestions, lessonBrief } from "../../courseExperience";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/academy/learn/${courseId}`);
  const user = await currentUser();
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) redirect(`/academy?required=${courseId}`);
  const lessons = course.modules.map((_, index) => lessonBrief(course.id, index)).filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const watermark = `AUTHORIZED LEARNER ${user?.id.slice(-8).toUpperCase() ?? "SESSION"} · OBSERRA PROPRIETARY`;
  return <CoursePlayer course={course} initialProgress={state.progress[courseId] ?? { completedLessons: [] }} lessons={lessons} assessment={finalAssessmentQuestions(course.id)} watermark={watermark} />;
}
