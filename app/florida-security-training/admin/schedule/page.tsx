import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  FloridaClassDAuthorizationError,
  requireFloridaClassDStaff,
} from "../../../../lib/florida-class-d-auth";
import {
  floridaClassDOwnerUatProfileRequested,
  getFloridaClassDOwnerUatReport,
} from "../../../../lib/florida-class-d-owner-uat";
import ScheduleManager from "./ScheduleManager";
import "../../live-classroom.css";
import "./schedule.css";

export default async function FloridaClassDScheduleAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/admin/schedule")}`);
  try {
    await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  } catch (error) {
    if (error instanceof FloridaClassDAuthorizationError) notFound();
    throw error;
  }
  const ownerUatRequested = floridaClassDOwnerUatProfileRequested();
  const ownerUatAuthorized = ownerUatRequested && getFloridaClassDOwnerUatReport().authorized;
  return <ScheduleManager ownerUatRequested={ownerUatRequested} ownerUatAuthorized={ownerUatAuthorized} />;
}
