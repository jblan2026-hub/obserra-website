import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CertificateView from "./CertificateView";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, parseAcademyAccess } from "../../../../lib/academyAccess";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const state = parseAcademyAccess((await cookies()).get(academyAccessCookieName)?.value);
  if (!state?.courses[courseId]) redirect(`/academy/${courseId}?required=paid-access`);
  const progress = state.progress[courseId];
  if (!progress?.certificateId || !progress.completedAt) redirect(`/academy/learn/${courseId}`);

  const name = state.learnerName || "Obserra Academy Learner";
  const trainingHours = course.duration;

  return <CertificateView learnerName={name} courseTitle={course.title} department={course.department} trainingHours={trainingHours} completedAt={progress.completedAt} certificateId={progress.certificateId} />;
}
