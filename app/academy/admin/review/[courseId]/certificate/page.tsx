import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyOwnerCertificateReviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(`/command-center/academy/${encodeURIComponent(courseId)}/certificate`);
}
