import { notFound } from "next/navigation";
import CertificateView from "../../../../certificate/[courseId]/CertificateView";
import { courseForId } from "../../../../../../lib/academy";

export const dynamic = "force-dynamic";

export default async function OwnerCertificateReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  if (process.env.VERCEL_ENV !== "preview") notFound();

  const { courseId } = await params;
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
      signatureAlgorithm="REVIEW SAMPLE"
      publicKeyFingerprint="0000000000000000OWNERREVIEW0000000000000000SAMPLE"
    />
  );
}
