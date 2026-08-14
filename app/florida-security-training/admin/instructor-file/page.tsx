import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../lib/florida-class-d-auth";
import InstructorFileProvisioning from "./InstructorFileProvisioning";
import "../../live-classroom.css";
import "./instructor-file.css";

export const dynamic = "force-dynamic";

export default async function FloridaClassDInstructorFilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/admin/instructor-file")}`);
  }
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) notFound();
    throw error;
  }
  return <InstructorFileProvisioning />;
}
