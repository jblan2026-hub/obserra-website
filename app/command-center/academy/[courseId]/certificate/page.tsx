import { notFound } from "next/navigation";
import CertificateView from "../../../../academy/certificate/[courseId]/CertificateView";
import { courseForId } from "../../../../../../lib/academy";
import { requireOwnerAccess } from "../../../../../../lib/owner-access";

export const dynamic = "force-dynamic";

export default async function OwnerCertificateReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  await requireOwnerAccess(`/command-center/academy/${courseId}/certificate`);

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
      signatureAlgorithm="REVIEW SAMPLE · NOT ISSUED"
      publicKeyFingerprint="OWNER-REVIEW-SAMPLE-NOT-A-CRYPTOGRAPHIC-SIGNATURE"
    />
  );
}
