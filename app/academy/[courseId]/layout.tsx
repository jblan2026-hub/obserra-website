import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { courseForId } from "../../../lib/academy";
import { publicAcademyCourse } from "../../../lib/academy-control";

export const revalidate = 10;

export default async function PublicAcademyCourseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const sourceCourse = courseForId(courseId);
  if (!sourceCourse) notFound();

  const runtime = await publicAcademyCourse(sourceCourse);
  if (runtime.controlPlane !== "operational" || !runtime.course || !runtime.control.publicVisible) {
    notFound();
  }

  return children;
}
