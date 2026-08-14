import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../lib/florida-class-d-auth";
import EnrollmentActivationConsole from "./EnrollmentActivationConsole";
import "../../live-classroom.css";

export const dynamic = "force-dynamic";

export default async function FloridaClassDEnrollmentActivationPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/admin/enrollments")}`);
  }
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) notFound();
    throw error;
  }
  return <EnrollmentActivationConsole />;
}
