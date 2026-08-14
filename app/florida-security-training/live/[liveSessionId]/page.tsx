import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LiveClassroom from "./LiveClassroom";
import "../../live-classroom.css";

export default async function FloridaClassDLivePage({ params }: { params: Promise<{ liveSessionId: string }> }) {
  const { liveSessionId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/florida-security-training/live/${liveSessionId}`)}`);
  }
  return <LiveClassroom liveSessionId={liveSessionId} />;
}
