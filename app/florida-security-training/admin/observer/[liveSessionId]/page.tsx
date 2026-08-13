import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../../lib/florida-class-d-auth";
import ObserverGrantManager from "./ObserverGrantManager";
import "../../../live-classroom.css";
import "../../../observer/observer.css";

export default async function FloridaClassDObserverAdminPage({ params }: { params: Promise<{ liveSessionId: string }> }) {
  const { liveSessionId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/florida-security-training/admin/observer/${liveSessionId}`)}`);
  }
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) notFound();
    throw error;
  }
  return <ObserverGrantManager liveSessionId={liveSessionId} />;
}
