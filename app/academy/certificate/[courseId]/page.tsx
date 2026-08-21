import { notFound, redirect } from "next/navigation";
import CertificateView from "./CertificateView";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import {
  academyLearnerDisplayName,
  safeAcademyIdentity,
} from "../../../../lib/academy-identity";
import { verifyCertificateClaim } from "../../../../lib/certificate-signing";
import { BASELINE_COURSE_VERSION, publicationForCourse } from "../../coursePublication";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = courseForId(courseId);
  if (!course) notFound();

  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    redirect("/academy?identity=configuration-required");
  }
  if (!identity.principalId || !identity.identity) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/academy/certificate/${courseId}`)}`);
  }

  const state = await academyStateWithOwnerAccess(
    identity.principalId,
    courseId,
    identity.identity.roles,
  );
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

  const signed = progress.signedCertificate;
  const publication = publicationForCourse(courseId);
  const courseTitle = signed.schemaVersion === "1.0" ? course.title : signed.courseTitle;
  const courseVersion = signed.schemaVersion === "1.0"
    ? (publication.version || BASELINE_COURSE_VERSION)
    : signed.courseVersion;
  const learnerName = signed.schemaVersion === "1.2"
    ? signed.learnerName
    : academyLearnerDisplayName(identity.identity);

  return (
    <CertificateView
      learnerName={learnerName}
      courseTitle={courseTitle}
      courseVersion={courseVersion}
      department={course.department}
      trainingHours={course.duration}
      completedAt={progress.completedAt}
      certificateId={progress.certificateId}
      signatureAlgorithm={signed.signatureAlgorithm}
      publicKeyFingerprint={signed.publicKeyFingerprint}
    />
  );
}
