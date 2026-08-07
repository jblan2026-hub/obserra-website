import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CertificateView from "../../../../../academy/certificate/[courseId]/CertificateView";
import { courseForId } from "../../../../../../lib/academy";
import { academyOwnerCourse } from "../../../../../../lib/academy-control";
import { requireOwnerAccess } from "../../../../../../lib/owner-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate Sample | Owner Command Center",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function OwnerCertificateReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const access = await requireOwnerAccess(`/command-center/academy/${courseId}/certificate`);
  const sourceCourse = courseForId(courseId);
  if (!sourceCourse) notFound();
  const snapshot = await academyOwnerCourse(access.token, sourceCourse.id);
  const course = snapshot.contentOverride?.document?.course?.id === sourceCourse.id
    ? snapshot.contentOverride.document.course
    : sourceCourse;

  return (
    <CertificateView
      learnerName="OWNER REVIEW SAMPLE — NOT ISSUED"
      courseTitle={course.title}
      department={course.department}
      trainingHours={course.duration}
      completedAt={new Date().toISOString()}
      certificateId={`OWNER-REVIEW-${course.id.toUpperCase()}`}
      signatureAlgorithm="REVIEW SAMPLE"
      publicKeyFingerprint="OWNER-COMMAND-CENTER-REVIEW-SAMPLE-NOT-A-VALID-CERTIFICATE"
    />
  );
}
