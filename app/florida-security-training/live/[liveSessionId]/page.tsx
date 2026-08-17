import { notFound } from "next/navigation";
import { requireFloridaClassDPageUser } from "../../../../lib/florida-class-d-page-auth";
import { evaluateFloridaClassDStudentAccess } from "../../../../lib/florida-class-d-student-access";
import LiveClassroom from "./LiveClassroom";
import "../../live-classroom.css";

export default async function FloridaClassDLivePage({ params }: { params: Promise<{ liveSessionId: string }> }) {
  const { liveSessionId } = await params;
  const { userId } = await requireFloridaClassDPageUser(`/florida-security-training/live/${liveSessionId}`);
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();
  return <LiveClassroom liveSessionId={liveSessionId} />;
}
