import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CertificateView from "../../../../../academy/certificate/[courseId]/CertificateView";
import { courseForId } from "../../../../../../lib/academy";
import { requireOwnerPage } from "../../../../../../lib/owner-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate Sample",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function OwnerCertificateReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  await requireOwnerPage(`/command-center/academy/${courseId}/certificate`);

  const course = courseForId(courseId);
  if (!course) notFound();

  return (
    <CertificateView
      learnerName="OWNER REVIEW SAMPLE"
      courseTitle={course.title}
      department={course.department}
      trainingHours={course.duration}
      completedAt={new Date().toISOString()}
      certificateId={`OWNER-REVIEW-${course.id.toUpperCase()}`}
      signatureAlgorithm="REVIEW SAMPLE — NOT ISSUED"
      publicKeyFingerprint="OWNER-COMMAND-CENTER-REVIEW-SAMPLE-NOT-A-VALID-CERTIFICATE"
    />
  );
}
