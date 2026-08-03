import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CoursePlayer from "../CoursePlayer";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/academy/learn/${courseId}`);
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) redirect(`/academy?required=${courseId}`);
  return <CoursePlayer course={course} initialProgress={state.progress[courseId] ?? { completedLessons: [] }} />;
}
