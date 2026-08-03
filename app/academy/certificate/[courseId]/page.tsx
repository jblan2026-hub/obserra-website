import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CertificateView from "./CertificateView";
import { academyStateFromUser, courseForId } from "../../../../lib/academy";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/academy/certificate/${courseId}`);

  const user = await currentUser();
  const state = user ? academyStateFromUser(user) : { entitlements: {}, progress: {} };
  const progress = state.progress[courseId];
  if (!progress?.certificateId || !progress.completedAt) redirect(`/academy/learn/${courseId}`);

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.primaryEmailAddress?.emailAddress || "Obserra Academy Learner";
  const minutes = Number(course.duration.match(/\d+/)?.[0] ?? 0);
  const hourValue = Number((minutes / 60).toFixed(2));
  const trainingHours = `${hourValue} instructional hour${hourValue === 1 ? "" : "s"}`;

  return <CertificateView learnerName={name} courseTitle={course.title} department={course.department} trainingHours={trainingHours} completedAt={progress.completedAt} certificateId={progress.certificateId} />;
}
