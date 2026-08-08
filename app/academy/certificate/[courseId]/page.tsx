import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import CertificateView from "./CertificateView";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { verifyCertificateClaim } from "../../../../lib/certificate-signing";
import { publicationForCourse } from "../../coursePublication";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const publication = publicationForCourse(courseId);
  const courseVersion = publication.version || "1.0.0";

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/academy/certificate/${courseId}`)}`);
  }

  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) redirect(`/academy/${courseId}?required=paid-access`);

  const progress = state.progress[courseId];
  if (
    !progress?.certificateId ||
    !progress.completedAt ||
    !progress.signedCertificate ||
    (progress.assessmentScore ?? 0) < 80 ||
    !verifyCertificateClaim(progress.signedCertificate) ||
    progress.signedCertificate.courseId !== courseId ||
    progress.signedCertificate.certificateId !== progress.certificateId
  ) {
    redirect(`/academy/learn/${courseId}?certificate=signature-required`);
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const learnerName = fullName || user.emailAddresses[0]?.emailAddress || "Obserra Academy Learner";

  return (
    <CertificateView
      learnerName={learnerName}
      courseTitle={course.title}
      courseVersion={courseVersion}
      department={course.department}
      trainingHours={course.duration}
      completedAt={progress.completedAt}
      certificateId={progress.certificateId}
      signatureAlgorithm={progress.signedCertificate.signatureAlgorithm}
      publicKeyFingerprint={progress.signedCertificate.publicKeyFingerprint}
    />
  );
}
