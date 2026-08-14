import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../lib/florida-class-d-auth";
import MakeupManager from "./MakeupManager";
import "../../live-classroom.css";
import "../../makeup/makeup.css";

export default async function FloridaClassDMakeupAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/admin/makeup")}`);
  try {
    await requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"]);
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) notFound();
    throw error;
  }
  return <MakeupManager />;
}
